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
