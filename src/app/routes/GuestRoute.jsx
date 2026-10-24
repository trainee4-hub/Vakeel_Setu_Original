import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { isAdvocateUser } from "../../utils/advocateProfile";

/**
 * Accessible only to unauthenticated guests.
 * If already logged in:
 * - Advocates are redirected to /advocate/dashboard
 * - Normal users/clients are redirected to intended location or /dashboard
 */
export default function GuestRoute({ children }) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (isLoggedIn && user) {
    if (isAdvocateUser(user)) {
      return (
        <Navigate
          to="/advocate/dashboard"
          replace
        />
      );
    }

    const target = location.state?.from || "/dashboard";

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
