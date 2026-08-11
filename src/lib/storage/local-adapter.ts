import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { StorageAdapter } from "./types";

/**
 * Local filesystem storage adapter for development only.
 *
 * Files are stored OUTSIDE the Next.js `public/` directory so they are never
 * served statically or exposed to unauthenticated users. All access must go
 * through the authenticated `/api/documents/.../download` route, which
 * performs authorization before ever reading the file.
 *
 * In production, configure S3_* environment variables to use the
 * S3-compatible adapter instead (see s3-adapter.ts).
 */
const STORAGE_ROOT = path.join(process.cwd(), ".private-storage");

async function ensureRoot() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
}

function resolveSafePath(key: string): string {
  // Defense against path traversal: strip any path segments and re-join
  // under the storage root, rejecting any key that would escape it.
  const normalized = path.normalize(key).replace(/^([./\\]+)/, "");
  const resolved = path.resolve(STORAGE_ROOT, normalized);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error("Invalid storage key (path traversal attempt detected).");
  }
  return resolved;
}

export const localStorageAdapter: StorageAdapter = {
  async putObject({ key, body }) {
    await ensureRoot();
    const filePath = resolveSafePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);
  },

  async getObject(key) {
    const filePath = resolveSafePath(key);
    return fs.readFile(filePath);
  },

  async deleteObject(key) {
    const filePath = resolveSafePath(key);
    await fs.rm(filePath, { force: true });
  },

  async getSignedDownloadUrl() {
    // Local adapter has no pre-signing capability; callers stream via API.
    return null;
  },
};
