import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton, safe for Next.js dev hot-reload.
 * Never import this file into client components.
 */
declare global {
  // eslint-disable-next-line no-var
  var __shieldPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__shieldPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__shieldPrisma = prisma;
}

/**
 * Reports whether a database connection string has been configured.
 *
 * Prisma constructs its client lazily, so `new PrismaClient()` succeeds without
 * DATABASE_URL and only fails later with a PrismaClientInitializationError on
 * the first query. Read paths that can degrade gracefully should call this
 * first so they can serve a fallback instead of throwing during render.
 *
 * This reads `process.env` directly rather than going through `getEnv()` so it
 * stays usable regardless of how environment validation is configured.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return typeof url === "string" && url.trim().length > 0;
}
