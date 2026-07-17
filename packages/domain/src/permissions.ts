import type { AppRole } from "./constants";

export type Permission =
  | "content:read"
  | "content:write"
  | "content:publish"
  | "crm:read"
  | "crm:write"
  | "ai:use"
  | "users:manage"
  | "settings:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  owner: [
    "content:read",
    "content:write",
    "content:publish",
    "crm:read",
    "crm:write",
    "ai:use",
    "users:manage",
    "settings:manage",
    "audit:read",
  ],
  admin: [
    "content:read",
    "content:write",
    "content:publish",
    "crm:read",
    "crm:write",
    "ai:use",
    "users:manage",
    "settings:manage",
    "audit:read",
  ],
  editor: ["content:read", "content:write", "content:publish", "ai:use"],
  sales: ["content:read", "crm:read", "crm:write", "ai:use"],
  viewer: ["content:read"],
};

export function hasPermission(role: AppRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissions(role: AppRole) {
  return ROLE_PERMISSIONS[role];
}
