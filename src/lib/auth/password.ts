import argon2 from "argon2";

/**
 * Password hashing using Argon2id (OWASP-recommended parameters).
 */
const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

/**
 * Minimal password strength policy enforced server-side.
 * (Defense in depth — UI should also validate.)
 */
export function isPasswordStrongEnough(password: string): boolean {
  if (password.length < 10) return false;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const varietyScore = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  return varietyScore >= 3;
}
