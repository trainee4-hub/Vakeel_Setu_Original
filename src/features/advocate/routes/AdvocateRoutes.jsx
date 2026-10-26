import {
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "@app/routes/ProtectedRoute";
import AdvocateProfileGuard from "./AdvocateProfileGuard";
import AdvocateLayout from "../layouts/AdvocateLayout";

import {
  AdvocateDashboard,
  AdvocateCompleteProfile,
  AdvocatePricing,
  AdvocateBookings,
  AdvocateMessages,
  AdvocateTeam,
  AdvocateTeamMemberProfile,
  AdvocateMyProfile,
  AdvocateEditProfile,
  AdvocateAccountSettings,
} from "../index";

const ADVOCATE_ROLES = [
  "advocate",
  "lawyer",
];

/* =========================================================
   COMPLETE ADVOCATE GUARD
========================================================= */

const CompleteAdvocateRoute = () => {
  return (
    <AdvocateProfileGuard require="complete">
      <Outlet />
    </AdvocateProfileGuard>
  );
};

/* =========================================================
   ADVOCATE ROUTES
========================================================= */

export default function AdvocateRoutes() {
  return (
    <ProtectedRoute
      allowedRoles={ADVOCATE_ROLES}
      fallbackPath="/dashboard"
    >
      <Routes>
        {/* =================================================
            /advocate
        ================================================= */}

        <Route
          index
          element={
            <Navigate
              to="/advocate/dashboard"
              replace
            />
          }
        />

        {/* =================================================
            PROFILE COMPLETION
        ================================================= */}

        <Route
          path="complete-profile"
          element={
            <AdvocateProfileGuard require="incomplete">
              <AdvocateCompleteProfile />
            </AdvocateProfileGuard>
          }
        />

        {/* =================================================
            COMPLETE ADVOCATE WORKSPACE
        ================================================= */}

        <Route element={<CompleteAdvocateRoute />}>
          <Route element={<AdvocateLayout />}>
            {/* DASHBOARD */}

            <Route
              path="dashboard"
              element={<AdvocateDashboard />}
            />

            {/* BOOKINGS */}

            <Route
              path="bookings"
              element={<AdvocateBookings />}
            />

            {/* MESSAGES */}

            <Route
              path="messages"
              element={<AdvocateMessages />}
            />

            {/* TEAM */}

            <Route
              path="team"
              element={<AdvocateTeam />}
            />

            <Route
              path="team/:id"
              element={<AdvocateTeamMemberProfile />}
            />

            {/* PRICING */}

            <Route
              path="pricing"
              element={<AdvocatePricing />}
            />

            {/* MY PROFILE */}

            <Route
              path="profile"
              element={<AdvocateMyProfile />}
            />

            {/* EDIT PROFILE */}

            <Route
              path="profile/edit"
              element={<AdvocateEditProfile />}
            />

            {/* ACCOUNT SETTINGS */}

            <Route
              path="account-settings"
              element={<AdvocateAccountSettings />}
            />
          </Route>
        </Route>

        {/* =================================================
            UNKNOWN ADVOCATE ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/advocate/dashboard"
              replace
            />
          }
        />
      </Routes>
    </ProtectedRoute>
  );
}