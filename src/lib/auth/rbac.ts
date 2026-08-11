import type { RoleName } from "@prisma/client";

/**
 * Static role -> permission map mirroring CLAUDE.md section 17.
 * This is enforced entirely server-side. Frontend role checks are for
 * UX/display only and must never be relied on for security decisions.
 */
export type Permission =
  | "case.read"
  | "case.create"
  | "case.update"
  | "case.assign"
  | "case.close"
  | "document.read"
  | "document.upload"
  | "document.delete"
  | "evidence.read"
  | "evidence.create"
  | "evidence.transfer"
  | "report.publish"
  | "user.manage"
  | "audit.read"
  | "settings.manage"
  | "content.manage"
  | "chatbot.manage";

const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: [
    "case.read", "case.create", "case.update", "case.assign", "case.close",
    "document.read", "document.upload", "document.delete",
    "evidence.read", "evidence.create", "evidence.transfer",
    "report.publish", "user.manage", "audit.read", "settings.manage",
    "content.manage", "chatbot.manage",
  ],
  ADMIN: [
    "case.read", "case.create", "case.update", "case.assign", "case.close",
    "document.read", "document.upload", "document.delete",
    "evidence.read", "evidence.create", "evidence.transfer",
    "report.publish", "user.manage", "audit.read", "settings.manage",
    "content.manage", "chatbot.manage",
  ],
  INVESTIGATOR: [
    "case.read", "case.update",
    "document.read", "document.upload",
    "evidence.read", "evidence.create", "evidence.transfer",
    "report.publish",
  ],
  ANALYST: [
    "case.read",
    "document.read", "document.upload",
    "evidence.read",
  ],
  SUPPORT: ["case.read", "document.read"],
  CLIENT: ["case.read", "document.read"],
};

export function roleHasPermission(role: RoleName, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function rolesHavePermission(roles: RoleName[], permission: Permission): boolean {
  return roles.some((r) => roleHasPermission(r, permission));
}

export const STAFF_ROLES: RoleName[] = ["SUPER_ADMIN", "ADMIN", "INVESTIGATOR", "ANALYST", "SUPPORT"];
export const ADMIN_ROLES: RoleName[] = ["SUPER_ADMIN", "ADMIN"];
export const INVESTIGATIVE_ROLES: RoleName[] = ["SUPER_ADMIN", "ADMIN", "INVESTIGATOR", "ANALYST"];
