import "server-only";
import { prisma } from "@/lib/db";

/**
 * Reads a single admin-managed content value by key, falling back to the
 * provided placeholder if not yet configured. Used for business info such
 * as phone/email/address that must never be hard-coded (CLAUDE.md §39).
 */
export async function getContentValue(key: string, fallback = ""): Promise<string> {
  const block = await prisma.contentBlock.findUnique({ where: { key } });
  return block?.value ?? fallback;
}

export async function getContentValues(keys: string[]): Promise<Record<string, string>> {
  const blocks = await prisma.contentBlock.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string> = {};
  for (const b of blocks) map[b.key] = b.value;
  return map;
}
