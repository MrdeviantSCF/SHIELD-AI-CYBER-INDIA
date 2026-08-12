import "server-only";

/**
 * Diagnostics for degraded (database-unavailable) mode.
 *
 * When DATABASE_URL is absent or the database is unreachable, public read paths
 * fall back to static content so the site still renders. That fallback must be
 * observable to operators, but a server-rendered page can call several data
 * helpers per request, so warnings are emitted once per subject per process
 * instead of on every call.
 *
 * SECURITY: only the subject and the error's message are logged. Connection
 * strings and credentials are never written to the log.
 */
const warnedSubjects = new Set<string>();

export function warnOnceAboutMissingDatabase(subject: string, err?: unknown): void {
  if (warnedSubjects.has(subject)) return;
  warnedSubjects.add(subject);

  // Prisma initialization errors begin with a blank line, so take the first
  // line that actually has content rather than blindly taking index 0.
  const reason = err instanceof Error
    ? err.message
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.length > 0) ?? err.name
    : "DATABASE_URL is not configured";

  console.warn(
    `[shield] Database unavailable — serving fallback ${subject}. ` +
      `Reason: ${reason}. ` +
      `Configure DATABASE_URL (see .env.example) and run "npm run db:migrate" + "npm run db:seed" for live data.`
  );
}

/** Test/diagnostic helper: allows the warning to be emitted again. */
export function resetDatabaseWarnings(): void {
  warnedSubjects.clear();
}
