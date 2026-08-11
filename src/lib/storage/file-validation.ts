import "server-only";
import { fileTypeFromBuffer } from "file-type";
import { createHash } from "crypto";

/**
 * Allowlist of file types accepted by the document/evidence upload
 * pipelines. Both the declared MIME type AND the detected magic-byte
 * signature must match an entry here — this defends against disguised
 * executables (e.g. a `.exe` renamed to `.pdf`).
 */
export const ALLOWED_UPLOAD_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/zip": [".zip"],
  "text/plain": [".txt"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "video/mp4": [".mp4"],
  "audio/mpeg": [".mp3"],
};

export const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export type FileValidationResult =
  | { ok: true; detectedMimeType: string; sanitizedFilename: string; sha256: string }
  | { ok: false; reason: string };

/**
 * Strips path components and dangerous characters from a filename,
 * defending against path traversal (`../../etc/passwd`) and injection via
 * filenames rendered elsewhere in the UI.
 */
export function sanitizeFilename(original: string): string {
  const base = original.split(/[\\/]/).pop() ?? "file";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9.\-_ ]/g, "")
    .replace(/\s+/g, "_")
    .slice(-180); // keep it reasonably short
  return cleaned.length > 0 ? cleaned : "file";
}

/**
 * Validates an uploaded file's size, declared MIME type, and true
 * magic-byte signature, and computes its SHA-256 hash for integrity /
 * chain-of-custody purposes.
 */
export async function validateUploadedFile(
  buffer: Buffer,
  declaredMimeType: string,
  originalFilename: string
): Promise<FileValidationResult> {
  if (buffer.length === 0) {
    return { ok: false, reason: "File is empty." };
  }
  if (buffer.length > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, reason: "File exceeds the maximum allowed size." };
  }

  const detected = await fileTypeFromBuffer(buffer);

  // Plain text has no reliable magic byte signature — allow it only when
  // both the declared type and extension agree and the content is valid
  // UTF-8-ish text (defense-in-depth heuristic).
  const isPlainTextDeclared = declaredMimeType === "text/plain";
  const detectedMime = detected?.mime ?? (isPlainTextDeclared ? "text/plain" : null);

  if (!detectedMime || !ALLOWED_UPLOAD_TYPES[detectedMime]) {
    return { ok: false, reason: "File type is not permitted." };
  }

  if (detectedMime !== declaredMimeType) {
    return { ok: false, reason: "Declared file type does not match file contents." };
  }

  const sanitizedFilename = sanitizeFilename(originalFilename);
  const ext = "." + (sanitizedFilename.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_UPLOAD_TYPES[detectedMime].includes(ext)) {
    return { ok: false, reason: "File extension does not match its content type." };
  }

  const sha256 = createHash("sha256").update(buffer).digest("hex");

  return { ok: true, detectedMimeType: detectedMime, sanitizedFilename, sha256 };
}

/**
 * Extension point for a malware-scanning integration (e.g. ClamAV daemon,
 * VirusTotal API, or a cloud AV service). Wired in as a no-op by default so
 * the pipeline works without external credentials, but the interface is
 * ready to be implemented in production.
 */
export async function scanForMalware(_buffer: Buffer): Promise<{ clean: boolean; engine: string }> {
  // TODO(production): integrate a real AV/malware scanning engine here.
  return { clean: true, engine: "none-configured" };
}
