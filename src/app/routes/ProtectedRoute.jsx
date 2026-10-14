import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  useAuth,
} from "../../features/auth";

import {
  getUserRole,
  isAdvocateUser,
} from "../../utils/advocateProfile";

export default function ProtectedRoute({
  children,
  allowedRoles = null,
  fallbackPath = "/dashboard",
}) {
  const location =
    useLocation();

  const {
    user,
    isLoggedIn,
  } = useAuth();

  const {
    authLoading,
    authInitialized,
  } = useSelector(
    (state) => state.auth,
  );

  /* =========================================================
     AUTH RESTORE IN PROGRESS
  ========================================================= */

  const isRestoring =
    !authInitialized ||
    authLoading;

  /*
   * IMPORTANT:
   *
   * Agar Redux/local cached auth already user ko authenticated
   * bata raha hai, protected UI immediately render kar sakti hai.
   *
   * Server restore background me continue karega.
   */
  const hasUsableAuth =
    Boolean(
      user &&
      isLoggedIn,
    );

  /*
   * Auth genuinely unknown hai.
   *
   * Protected children render nahi kar sakte.
   * Redirect bhi nahi karenge jab tak restore complete na ho.
   */
  if (
    isRestoring &&
    !hasUsableAuth
  ) {
    return (
      <div
        className="min-h-[60vh]"
        aria-hidden="true"
      />
    );
  }

  /* =========================================================
     NOT AUTHENTICATED

     Restore complete hone ke baad hi login redirect.
  ========================================================= */

  if (
    !isRestoring &&
    (
      !isLoggedIn ||
      !user
    )
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  /* =========================================================
     ROLE CHECK
  ========================================================= */

  if (
    Array.isArray(
      allowedRoles,
    ) &&
    allowedRoles.length > 0
  ) {
    const role =
      getUserRole(
        user,
      );

    const normalizedAllowedRoles =
      allowedRoles.map(
        (entry) =>
          String(entry)
            .trim()
            .toLowerCase(),
      );

    if (
      !role ||
      !normalizedAllowedRoles.includes(
        role,
      )
    ) {
      if (
        isAdvocateUser(
          user,
        )
      ) {
        return (
          <Navigate
            to="/advocate/dashboard"
            replace
          />
        );
      }

      return (
        <Navigate
          to={fallbackPath}
          replace
        />
      );
    }
  }

  return children;
}