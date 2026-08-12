import "server-only";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { warnOnceAboutMissingDatabase } from "@/lib/db-availability";

/**
 * Reads a single admin-managed content value by key, falling back to the
 * provided placeholder if not yet configured. Used for business info such
 * as phone/email/address that must never be hard-coded (CLAUDE.md §39).
 *
 * Content blocks are presentational, so an unreachable database degrades to the
 * caller's placeholder rather than failing the render. Admin-authored values
 * always win when the database is available.
 */
export async function getContentValue(key: string, fallback = ""): Promise<string> {
  if (!isDatabaseConfigured()) {
    warnOnceAboutMissingDatabase("content blocks");
    return fallback;
  }
  try {
    const block = await prisma.contentBlock.findUnique({ where: { key } });
    return block?.value ?? fallback;
  } catch (err) {
    warnOnceAboutMissingDatabase("content blocks", err);
    return fallback;
  }
}

export async function getContentValues(keys: string[]): Promise<Record<string, string>> {
  if (!isDatabaseConfigured()) {
    warnOnceAboutMissingDatabase("content blocks");
    return {};
  }
  try {
    const blocks = await prisma.contentBlock.findMany({ where: { key: { in: keys } } });
    const map: Record<string, string> = {};
    for (const b of blocks) map[b.key] = b.value;
    return map;
  } catch (err) {
    warnOnceAboutMissingDatabase("content blocks", err);
    // Callers supply their own `[PLACEHOLDER]` defaults for missing keys.
    return {};
  }
}
