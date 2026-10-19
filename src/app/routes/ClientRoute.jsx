import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { isAdvocateUser } from "../../utils/advocateProfile";

/**
 * Accessible to guests and regular users.
 * If a logged-in Advocate attempts to visit, they are redirected
 * directly to their Advocate Dashboard.
 */
export default function ClientRoute({ children }) {
  const { user } = useAuth();

  if (user && isAdvocateUser(user)) {
    return (
      <Navigate
        to="/advocate/dashboard"
        replace
      />
    );
  }

  return children;
}
