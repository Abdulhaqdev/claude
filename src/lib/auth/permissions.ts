import { UserRole } from "@prisma/client";

export type Permission =
  | "products:read"
  | "products:write"
  | "products:delete"
  | "categories:read"
  | "categories:write"
  | "suppliers:read"
  | "suppliers:write"
  | "purchases:read"
  | "purchases:write"
  | "sales:read"
  | "sales:write"
  | "invoices:read"
  | "invoices:write"
  | "expenses:read"
  | "expenses:write"
  | "finance:read"
  | "reports:read"
  | "customers:read"
  | "customers:write"
  | "leads:read"
  | "leads:write"
  | "deals:read"
  | "deals:write"
  | "warehouses:read"
  | "warehouses:write"
  | "inventory:read"
  | "inventory:write"
  | "transfers:read"
  | "transfers:write"
  | "dispatch:read"
  | "dispatch:write"
  | "receiving:read"
  | "receiving:write"
  | "users:read"
  | "users:write"
  | "settings:read"
  | "settings:write"
  | "audit:read";

const ALL_PERMISSIONS: Permission[] = [
  "products:read",
  "products:write",
  "products:delete",
  "categories:read",
  "categories:write",
  "suppliers:read",
  "suppliers:write",
  "purchases:read",
  "purchases:write",
  "sales:read",
  "sales:write",
  "invoices:read",
  "invoices:write",
  "expenses:read",
  "expenses:write",
  "finance:read",
  "reports:read",
  "customers:read",
  "customers:write",
  "leads:read",
  "leads:write",
  "deals:read",
  "deals:write",
  "warehouses:read",
  "warehouses:write",
  "inventory:read",
  "inventory:write",
  "transfers:read",
  "transfers:write",
  "dispatch:read",
  "dispatch:write",
  "receiving:read",
  "receiving:write",
  "users:read",
  "users:write",
  "settings:read",
  "settings:write",
  "audit:read",
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter((p) => !p.startsWith("audit:")),
  MANAGER: [
    "products:read",
    "products:write",
    "categories:read",
    "categories:write",
    "suppliers:read",
    "suppliers:write",
    "purchases:read",
    "purchases:write",
    "sales:read",
    "sales:write",
    "invoices:read",
    "invoices:write",
    "expenses:read",
    "finance:read",
    "reports:read",
    "customers:read",
    "customers:write",
    "leads:read",
    "leads:write",
    "deals:read",
    "deals:write",
    "warehouses:read",
    "inventory:read",
    "inventory:write",
    "transfers:read",
    "transfers:write",
    "dispatch:read",
    "dispatch:write",
    "receiving:read",
    "receiving:write",
  ],
  SALES: [
    "products:read",
    "sales:read",
    "sales:write",
    "invoices:read",
    "invoices:write",
    "customers:read",
    "customers:write",
    "leads:read",
    "leads:write",
    "deals:read",
    "deals:write",
    "inventory:read",
  ],
  WAREHOUSE: [
    "products:read",
    "warehouses:read",
    "inventory:read",
    "inventory:write",
    "transfers:read",
    "transfers:write",
    "dispatch:read",
    "dispatch:write",
    "receiving:read",
    "receiving:write",
  ],
  ACCOUNTANT: [
    "products:read",
    "purchases:read",
    "sales:read",
    "invoices:read",
    "invoices:write",
    "expenses:read",
    "expenses:write",
    "finance:read",
    "reports:read",
    "customers:read",
  ],
  VIEWER: [
    "products:read",
    "categories:read",
    "suppliers:read",
    "purchases:read",
    "sales:read",
    "invoices:read",
    "customers:read",
    "leads:read",
    "deals:read",
    "warehouses:read",
    "inventory:read",
    "finance:read",
    "reports:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
