import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { isAdvocateUser } from "../../utils/advocateProfile";

/**
 * Accessible only to unauthenticated guests.
 * If already logged in:
 * - Advocates are redirected to /advocate/dashboard
 * - Normal users/clients are redirected to /dashboard
 */
export default function GuestRoute({ children }) {
  const { user, isLoggedIn } = useAuth();

  if (isLoggedIn && user) {
    if (isAdvocateUser(user)) {
      return (
        <Navigate
          to="/advocate/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}
