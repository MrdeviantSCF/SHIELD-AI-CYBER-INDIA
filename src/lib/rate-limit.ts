/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: This implementation is per-process, which is sufficient for a
 * single-instance deployment or development. For horizontally-scaled
 * production deployments, replace the store below with a shared store
 * (e.g. Redis / Upstash) behind the same `consume()` interface — no
 * call-site changes required.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodic cleanup to avoid unbounded memory growth in long-running processes.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Common named limiters used across the app. */
export const RateLimits = {
  login: { limit: 8, windowMs: 15 * 60 * 1000 },
  caseVerification: { limit: 10, windowMs: 10 * 60 * 1000 },
  contactForm: { limit: 5, windowMs: 60 * 60 * 1000 },
  passwordReset: { limit: 5, windowMs: 60 * 60 * 1000 },
  chatbot: { limit: 30, windowMs: 5 * 60 * 1000 },
  documentDownload: { limit: 60, windowMs: 5 * 60 * 1000 },
  apiDefault: { limit: 120, windowMs: 60 * 1000 },
};
