import { ROLE_PERMISSIONS, type Permission } from "./permissions"
import type { Role } from "./roles"

// 🔹 validar rol directo
export const hasRole = (
  role: Role | undefined,
  allowed: Role[]
): boolean => {
  if (!role) return false
  return allowed.includes(role)
}

// 
export const can = (
  role: Role | undefined,
  permission: Permission
): boolean => {
  if (!role) return false 

  const permissions = ROLE_PERMISSIONS[role]
  return permissions?.includes(permission) ?? false
}