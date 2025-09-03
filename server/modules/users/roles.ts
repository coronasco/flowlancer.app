// Role-Based Access Control (RBAC) helpers

export type UserRole = "owner" | "admin" | "viewer" | "guest";

export type Permission = 
	| "projects:read" 
	| "projects:write" 
	| "projects:delete"
	| "tasks:read" 
	| "tasks:write" 
	| "tasks:delete"
	| "time:read" 
	| "time:write"
	| "invoices:read" 
	| "invoices:write" 
	| "invoices:delete"
	| "feed:read" 
	| "feed:write"
	| "profile:read" 
	| "profile:write";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	owner: [
		"projects:read", "projects:write", "projects:delete",
		"tasks:read", "tasks:write", "tasks:delete",
		"time:read", "time:write",
		"invoices:read", "invoices:write", "invoices:delete",
		"feed:read", "feed:write",
		"profile:read", "profile:write"
	],
	admin: [
		"projects:read", "projects:write",
		"tasks:read", "tasks:write",
		"time:read", "time:write",
		"invoices:read", "invoices:write",
		"feed:read", "feed:write",
		"profile:read", "profile:write"
	],
	viewer: [
		"projects:read",
		"tasks:read",
		"time:read",
		"invoices:read",
		"feed:read",
		"profile:read"
	],
	guest: [
		"projects:read",
		"profile:read"
	]
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
	return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role is allowed (has any of the required permissions)
 */
export function isRoleAllowed(role: UserRole, requiredPermissions: Permission[]): boolean {
	if (requiredPermissions.length === 0) return true;
	return requiredPermissions.some(permission => hasPermission(role, permission));
}

/**
 * Ensure user has required permissions, throw error if not
 */
export function ensurePermissions(userRole: UserRole, requiredPermissions: Permission[]): void {
	if (!isRoleAllowed(userRole, requiredPermissions)) {
		throw new Error(`FORBIDDEN: Required permissions: ${requiredPermissions.join(", ")}`);
	}
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
	return ROLE_PERMISSIONS[role] || [];
}