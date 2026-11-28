import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  Login,
  Signup,
  AdvocateSignup,
  AdvocateExperience,
  ForgotPasswordPage,
} from "../../features/auth";
import {
  UserProfile,
  SavedLawyer,
  Bookings,
  MyPayments,
  MessageConsultations,
  ClientRoutes,
} from "../../features/client";

import { FindLawyerPage } from "../../features/findLawyer";
import { LegalAssistantPage } from "../../features/legalAssistant";

import {
  AdvocateProfilePage,
  AdvocatePricing,
  AdvocateRoutes,
} from "../../features/advocate";
import { Help, NotFoundPage, TermsPage, PrivacyPolicyPage } from "../../features/marketing";
import ErrorBoundary from "@shared/components/feedback/ErrorBoundary";

import ProtectedRoute from "./ProtectedRoute";
import DashboardEntry from "./DashboardEntry";
import ClientRoute from "./ClientRoute";
import GuestRoute from "./GuestRoute";

import { AdminRoutes } from "../../features/admin";

/* ================= LEGAL HUB & SERVICES ================= */
import { LegalHubRoutes } from "../../features/legalHub";
import { LegalServicesRoutes } from "../../features/legalServices";
import AdvocateTestPage from "../../features/advocateTest/pages/AdvocateTestPage";


const USER_ROLES = [
  "user",
  "client",
  "citizen",
];

const AppRoutes = () => {
  return (
    <ErrorBoundary fallbackUrl="/" fallbackLabel="Go to Homepage">
      <Routes>
      {/* ================= HOME ================= */}

      <Route
        path="/"
        element={<DashboardEntry />}
      />

      {/* ================= AUTH ================= */}

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />

      {/* =====================================================
          LEGACY ADVOCATE SIGNUP

          These are separate from the new Signup.jsx flow.
          Google registration does NOT redirect here.
      ====================================================== */}

      <Route
        path="/advocate-signup"
        element={
          <GuestRoute>
            <AdvocateSignup />
          </GuestRoute>
        }
      />

      <Route
        path="/advocate-signup/experience"
        element={
          <GuestRoute>
            <AdvocateExperience />
          </GuestRoute>
        }
      />

      <Route
        path="/advocate-signup/pricing"
        element={
          <GuestRoute>
            <AdvocatePricing />
          </GuestRoute>
        }
      />

      {/* ================= PUBLIC LAWYERS ================= */}

      <Route
        path="/find-lawyer"
        element={
          <ClientRoute>
            <FindLawyerPage />
          </ClientRoute>
        }
      />

      <Route
        path="/find-lawyer/:id"
        element={
          <ClientRoute>
            <AdvocateProfilePage />
          </ClientRoute>
        }
      />

      {/* ================= ROLE DASHBOARD ================= */}

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardEntry />
          </ProtectedRoute>
        }
      />

      {/* ================= CLIENT / USER PORTAL ================= */}

      <Route
        path="/client/*"
        element={<ClientRoutes />}
      />

      {/* Backward-compatible Canonical Client Routes */}
      <Route
        path="/user-profile"
        element={
          <ProtectedRoute
            allowedRoles={USER_ROLES}
            fallbackPath="/dashboard"
          >
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/saved-lawyers"
        element={
          <ProtectedRoute
            allowedRoles={USER_ROLES}
            fallbackPath="/dashboard"
          >
            <SavedLawyer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute
            fallbackPath="/dashboard"
          >
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute
            fallbackPath="/dashboard"
          >
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute
            allowedRoles={USER_ROLES}
            fallbackPath="/dashboard"
          >
            <MyPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute
            allowedRoles={USER_ROLES}
            fallbackPath="/dashboard"
          >
            <MessageConsultations />
          </ProtectedRoute>
        }
      />

      {/* ================= ADVOCATE ONLY ================= */}

      <Route
        path="/advocate/*"
        element={<AdvocateRoutes />}
      />

      {/* ================= ADMIN ONLY ================= */}
      <Route
        path="/admin/*"
        element={<AdminRoutes />}
      />

      {/* ================= COMMON PROTECTED ================= */}

      <Route
        path="/legal-assistant"
        element={
          <ProtectedRoute>
            <LegalAssistantPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/legal-assistants"
        element={<Navigate to="/legal-assistant" replace />}
      />

      <Route
        path="/ipc-wiki"
        element={<Navigate to="/legal-assistant" replace />}
      />

      {/* ================= LEGAL HUB ================= */}
      <Route
        path="/legal-hub/*"
        element={<LegalHubRoutes />}
      />

      {/* ================= LEGAL SERVICES ================= */}
      <Route
        path="/legal-services/*"
        element={<LegalServicesRoutes />}
      />

      {/* ================= HELP & LEGAL ================= */}

      <Route
        path="/help"
        element={<Help />}
      />

      <Route
        path="/terms"
        element={<TermsPage />}
      />

      <Route
        path="/terms-and-conditions"
        element={<TermsPage />}
      />

      <Route
        path="/privacy"
        element={<PrivacyPolicyPage />}
      />

      <Route
        path="/privacy-policy"
        element={<PrivacyPolicyPage />}
      />

      {/* ================= ADVOCATE QUALIFICATION TEST ================= */}
      <Route
        path="/advocate-test"
        element={<AdvocateTestPage />}
      />

      {/* ================= FALLBACK ================= */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
