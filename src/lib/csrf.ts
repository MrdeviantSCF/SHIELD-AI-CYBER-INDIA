import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/lib/env";

/**
 * Origin/Referer-based CSRF defense for state-changing API routes.
 *
 * Because sessions use SameSite=Lax cookies (not sent on cross-site POSTs
 * from third-party pages in modern browsers) this acts as defense-in-depth:
 * we additionally verify the request's Origin header matches our own
 * application origin before performing any mutation.
 */
export async function assertSameOrigin(): Promise<void> {
  const h = await headers();
  const origin = h.get("origin");
  const env = getEnv();

  // Same-origin requests from fetch() always include an Origin header for
  // cross-origin-capable methods; same-site browser navigations may omit it,
  // so we only enforce the check when Origin is present.
  if (origin) {
    const allowed = new URL(env.APP_BASE_URL).origin;
    if (origin !== allowed) {
      throw new CsrfError("Cross-site request blocked.");
    }
  }
}

export class CsrfError extends Error {}
