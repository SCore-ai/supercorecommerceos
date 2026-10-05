export type { CurrentUser, Session, AuthProvider, AuthRequest, IdentityContext, RoleName, PermissionName } from './types.js';
export { ROLE_NAMES, PERMISSION_NAMES, ROLE_PERMISSIONS, permissionsForRoles } from './types.js';
export {
  hasPermission,
  hasRole,
  isRoleName,
  requirePermission,
  requireUser,
  requireRole,
  requireSuperAdmin,
  assertAddressWrite,
  type AddressOwnerType,
} from './rbac.js';
export { UnauthenticatedAuthProvider, DevBypassAuthProvider, SessionAuthProvider, createAuthProvider } from './auth-provider.js';
export {
  signIn,
  changePassword,
  inviteUser,
  invitePlatformTenantAdmin,
  activateUser,
  updateUserStatus,
  assignRoles,
  listUsersRecord,
  loadSession,
  revokeAllSessions,
  bootstrapSuperAdmin,
  toCurrentUser,
} from './users.js';
export { hashPassword, verifyPassword, assertPasswordPolicy, createInvitationSecret } from './password.js';
