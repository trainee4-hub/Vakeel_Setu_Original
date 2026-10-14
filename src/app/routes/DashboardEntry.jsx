import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../features/auth";
import { isAdvocateUser } from "../../utils/advocateProfile";

import { UserDashboard } from "../../features/user";

export default function DashboardEntry() {
  const location = useLocation();

  const {
    user,
    isLoggedIn,
  } = useAuth();

  /* =========================================================
     ADVOCATE
  ========================================================= */

  if (
    user &&
    isAdvocateUser(user)
  ) {
    return (
      <Navigate
        to="/advocate/dashboard"
        replace
      />
    );
  }

  /* =========================================================
     LOGGED-IN NORMAL USER ON ROOT

     Google callback may return user to "/".
     Once auth state is available, redirect to canonical
     dashboard route.
  ========================================================= */

  if (
    location.pathname === "/" &&
    user &&
    isLoggedIn
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace 
        state={location.state}
      />
    );
  }

  /* =========================================================
     USER DASHBOARD / PUBLIC HOME

     IMPORTANT:
     Do not block this UI while auth is restoring.

     This means the page remains visible immediately on refresh.
     If restored auth later identifies an advocate or logged-in
     user, the checks above will react to the Redux update.
  ========================================================= */

  return <UserDashboard />;
}