import "server-only";
import { prisma } from "@/lib/db";
import type { AuditResult } from "@prisma/client";

export type AuditEntry = {
  actorId?: string | null;
  actorLabel?: string | null;
  action: string;
  target?: string | null;
  result: AuditResult;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Writes a structured, append-oriented audit log entry.
 *
 * SECURITY: Never pass passwords, tokens, API keys, private keys or raw
 * document contents into `metadata`. Callers are responsible for ensuring
 * only non-sensitive, already-redacted context is logged.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorLabel: entry.actorLabel ?? null,
        action: entry.action,
        target: entry.target ?? null,
        result: entry.result,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        requestId: entry.requestId ?? null,
        metadata: entry.metadata ?? undefined,
      },
    });
  } catch (err) {
    // Audit logging must never crash the primary request flow, but failures
    // should be visible in server logs.
    // eslint-disable-next-line no-console
    console.error("Failed to write audit log", err);
  }
}
