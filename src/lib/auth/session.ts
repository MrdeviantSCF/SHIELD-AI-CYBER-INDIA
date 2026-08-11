import "server-only";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { generateOpaqueToken, hashToken } from "@/lib/auth/tokens";
import type { RoleName } from "@prisma/client";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const SESSION_ROTATE_AFTER_MS = 1000 * 60 * 60; // rotate token hourly on activity

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: RoleName[];
  clientId: string | null;
  investigatorId: string | null;
};

/**
 * Creates a new server-side session for the given user and sets the
 * HttpOnly/Secure/SameSite cookie. Returns nothing sensitive to the caller.
 */
export async function createSession(userId: string, ip: string | null, userAgent: string | null) {
  const env = getEnv();
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { userId, tokenHash, ip: ip ?? undefined, userAgent: userAgent ?? undefined, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  cookieStore.delete(env.SESSION_COOKIE_NAME);
}

/**
 * Resolves the current authenticated user from the session cookie.
 * Performs sliding-expiration rotation and validates expiry/revocation
 * server-side on every call. Never trust any client-supplied role/claim.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const env = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
          client: true,
          investigator: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }
  if (session.user.status !== "ACTIVE" || session.user.deletedAt) {
    return null;
  }

  // Sliding expiration + rotation for defense against long-lived stolen tokens.
  const age = Date.now() - session.createdAt.getTime();
  if (age > SESSION_ROTATE_AFTER_MS) {
    const newToken = generateOpaqueToken();
    const newHash = hashToken(newToken);
    const newExpiry = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.update({
      where: { id: session.id },
      data: { tokenHash: newHash, expiresAt: newExpiry, createdAt: new Date() },
    });
    cookieStore.set(env.SESSION_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: newExpiry,
    });
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    status: session.user.status,
    roles: session.user.roles.map((r) => r.role.name),
    clientId: session.user.client?.id ?? null,
    investigatorId: session.user.investigator?.id ?? null,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Authentication required.");
  }
  return user;
}

export async function requireRole(...allowed: RoleName[]): Promise<SessionUser> {
  const user = await requireUser();
  const hasRole = user.roles.some((r) => allowed.includes(r));
  if (!hasRole) {
    throw new AuthError("You do not have permission to perform this action.", 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function getRequestMeta() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const userAgent = h.get("user-agent") ?? "unknown";
  return { ip, userAgent };
}
