import { useCallback, useMemo } from "react";
import { useAuth } from "../../auth";
import {
  ADMIN_ROLE,
  getAccountRole,
  hasPermission,
  isAdminPanelAccount,
  isFullAdmin,
} from "../utils/adminUtils";

/**
 * Back-office view over the existing Redux auth (useAuth / authSlice).
 * No separate auth store: login() persists the token (sessionStorage) and the
 * sanitised profile (localStorage) exactly like USER / ADVOCATE sessions.
 *
 * NOTE: Primary admin id is the literal string "admin", not a UUID.
 * Staff (CONTENT_CREATOR) id is a UUID.
 */
export default function useAdminAuth() {
  const { user, isLoggedIn, authLoading, authInitialized, login, logout } = useAuth();

  const ready = authInitialized && !authLoading;
  const isAuthenticated = Boolean(isLoggedIn && user);
  const role = getAccountRole(user);
  const isPanelAccount = isAuthenticated && isAdminPanelAccount(user);
  const isFullAdminUser = isAuthenticated && isFullAdmin(user);

  const permissions = useMemo(() => {
    if (Array.isArray(user?.permissions)) return user.permissions;
    if (isFullAdminUser) return ["*"];
    return [];
  }, [user?.permissions, isFullAdminUser]);

  const has = useCallback(
    (code) => hasPermission(permissions, code),
    [permissions],
  );

  const signIn = useCallback(
    (token, admin) => {
      const accountRole = getAccountRole(admin) || (admin?.role ?? ADMIN_ROLE);
      const accountType = admin?.accountType || accountRole;
      const roles = Array.isArray(admin?.roles) ? admin.roles : [accountRole];
      const perms = Array.isArray(admin?.permissions)
        ? admin.permissions
        : (accountRole === ADMIN_ROLE ? ["*"] : []);

      return login(
        {
          id: admin?.id ?? (accountRole === ADMIN_ROLE ? "admin" : ""),
          email: admin?.email ?? "",
          fullName: admin?.fullName ?? (accountRole === ADMIN_ROLE ? "Admin" : "Content Creator"),
          role: accountRole,
          accountType,
          roles,
          permissions: perms,
        },
        token,
      );
    },
    [login],
  );

  /* Existing logout thunk: POST /auth/logout (clears cookie) + clears storage. */
  const signOut = useCallback(() => logout(), [logout]);

  return {
    user,
    ready,
    isAuthenticated,
    isAdmin: isPanelAccount,
    isPanelAccount,
    isFullAdmin: isFullAdminUser,
    role,
    permissions,
    has,
    signIn,
    signOut,
  };
}
