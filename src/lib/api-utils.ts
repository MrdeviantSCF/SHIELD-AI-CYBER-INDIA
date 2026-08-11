import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/session";
import { CsrfError } from "@/lib/csrf";
import { ZodError } from "zod";

/**
 * Centralized error -> HTTP response mapping.
 *
 * SECURITY: Error messages returned to the client are intentionally generic
 * for anything that isn't a validation error, to avoid leaking internal
 * implementation details, stack traces, or database errors.
 */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof CsrfError) {
    return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request.", details: err.flatten().fieldErrors },
      { status: 400 }
    );
  }
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled API error:", err);
  return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function clientIpFromHeaders(h: Headers): string {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}
