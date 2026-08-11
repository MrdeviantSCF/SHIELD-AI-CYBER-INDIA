import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * Generates the next Case ID in a configurable, collision-free, and
 * concurrency-safe way.
 *
 * Format: {PREFIX}/{YEAR}/{CATEGORY_CODE}/{SEQ:padded}
 * Example: SCF/2026/CF/001
 *
 * Concurrency safety: the per (year, category) sequence counter is
 * incremented inside the same database transaction that creates the case,
 * using Postgres row locking (SELECT ... FOR UPDATE semantics achieved via
 * an atomic upsert + increment). No two concurrent transactions can be
 * assigned the same sequence number.
 */

const CASE_ID_PREFIX = process.env.CASE_ID_PREFIX?.trim() || "SCF";
const CASE_ID_PAD_LENGTH = Number(process.env.CASE_ID_PAD_LENGTH) || 3;

export async function generateCaseId(
  tx: Prisma.TransactionClient,
  categoryCode: string,
  year: number = new Date().getFullYear()
): Promise<string> {
  // Atomic upsert-and-increment guarantees uniqueness under concurrency:
  // Postgres serializes concurrent UPDATEs on the same unique row.
  const sequence = await tx.caseSequence.upsert({
    where: { year_category: { year, category: categoryCode } },
    update: { lastSeq: { increment: 1 } },
    create: { year, category: categoryCode, lastSeq: 1 },
  });

  const padded = String(sequence.lastSeq).padStart(CASE_ID_PAD_LENGTH, "0");
  return `${CASE_ID_PREFIX}/${year}/${categoryCode}/${padded}`;
}
