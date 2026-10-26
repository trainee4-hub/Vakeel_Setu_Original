import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { isAdvocateUser, resolveAdvocateRedirect } from "../../utils/advocateProfile";
import { isAdminPanelAccount } from "../../features/admin/utils/adminUtils";

const AUTH_GUEST_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/advocate-signup",
];

function isAuthOrGuestPath(path) {
  if (!path || typeof path !== "string") return false;
  return AUTH_GUEST_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Resolves the safe destination for an authenticated user accessing a guest-only route.
 * Handles:
 * 1. Plain user login -> /dashboard
 * 2. Bounced user login -> original from path
 * 3. Advocate login -> /advocate/dashboard (or resolveAdvocateRedirect)
 * 4. Admin login -> /admin/dashboard (or intended /admin/* path)
 * 5. Role-mismatched state.from -> role default dashboard
 * 6. Loop guard -> ignores auth/guest paths and redirects to role default dashboard
 */
function resolveGuestRedirect(user, fromPath) {
  const isAdvocate = isAdvocateUser(user);
  const isAdmin = isAdminPanelAccount(user);

  // Default dashboard per role
  const defaultDashboard = isAdmin
    ? "/admin/dashboard"
    : isAdvocate
    ? "/advocate/dashboard"
    : "/dashboard";

  // Loop guard: if from is missing, points to an auth/guest route, or invalid
  if (!fromPath || typeof fromPath !== "string" || isAuthOrGuestPath(fromPath)) {
    return isAdvocate ? resolveAdvocateRedirect(user, null) : defaultDashboard;
  }

  const trimmedFrom = fromPath.trim();

  // Role-mismatched guards
  if (isAdmin) {
    if (trimmedFrom.startsWith("/admin") && !trimmedFrom.startsWith("/admin/login")) {
      return trimmedFrom;
    }
    return "/admin/dashboard";
  }

  if (isAdvocate) {
    return resolveAdvocateRedirect(user, trimmedFrom);
  }

  // Citizen / Client: cannot access admin or advocate workspaces
  if (trimmedFrom.startsWith("/admin") || trimmedFrom.startsWith("/advocate")) {
    return "/dashboard";
  }

  return trimmedFrom;
}

/**
 * Accessible only to unauthenticated guests.
 * If already logged in:
 * - Redirects to appropriate dashboard or sanitized intended route.
 */
export default function GuestRoute({ children }) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoggedIn && user) {
    const rawFrom = location.state?.from;
    const target = resolveGuestRedirect(user, rawFrom);

    return (
      <Navigate
        to={target}
        replace
        state={location.state}
      />
    );
  }

  return children;
}

