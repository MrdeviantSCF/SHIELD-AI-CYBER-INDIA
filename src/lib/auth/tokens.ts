import { randomBytes, createHash } from "crypto";

/**
 * Generates a cryptographically secure, URL-safe opaque token.
 * Used for session tokens, password reset tokens, and case verification tokens.
 * Only the SHA-256 hash of the token is ever stored at rest — the raw token
 * is shown to the user/browser exactly once and cannot be recovered from the DB.
 */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
