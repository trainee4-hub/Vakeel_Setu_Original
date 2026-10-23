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
  LegalAssistantPage as IpcWikiPage,
  SavedLawyer,
  Bookings,
  MyPayments,
  MessageConsultations,
} from "../../features/user";

import {
  FindLawyerPage,
  AdvocateProfilePage,
  AdvocatePricing,
  AdvocateRoutes,
} from "../../features/advocate";
import { Help, NotFoundPage } from "../../features/marketing";
import ErrorBoundary from "@shared/components/feedback/ErrorBoundary";

import ProtectedRoute from "./ProtectedRoute";
import DashboardEntry from "./DashboardEntry";
import ClientRoute from "./ClientRoute";
import GuestRoute from "./GuestRoute";

import { AdminRoutes } from "../../features/admin";

/* ================= LEGAL HUB ================= */

import {
  LegalHub,
  LegalHubDetail,
  Articles,
  BlogDetails,
  Rights,
  RightDetails,
  Guides,
  Updates,
  IPC,
  BNS,
  BareActSections,
  LawLibrary,
  ActsLibrary,
  ActDetails,
  SectionDetails,
} from "../../features/legalHub";


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

      {/* ================= USER ONLY ================= */}

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
            <IpcWikiPage />
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

      {/* =====================================================
          LEGAL HUB

          React Router v6 ranks static segments above dynamic
          ones, so:
            /legal-hub/articles/:slug -> BlogDetails
            /legal-hub/rights/:id     -> RightDetails
            /legal-hub/guides/:id     -> LegalHubDetail (via :type)

          /resources is kept only so any old Navbar or
          Breadcrumb link keeps working.
      ====================================================== */}

      <Route
        path="/legal-hub"
        element={<LegalHub />}
      />


      <Route
        path="/legal-hub/articles"
        element={<Articles />}
      />

      <Route
        path="/legal-hub/articles/:slug"
        element={<BlogDetails />}
      />

      <Route
        path="/legal-hub/rights"
        element={<Rights />}
      />

      <Route
        path="/legal-hub/rights/:id"
        element={<RightDetails />}
      />

      <Route
        path="/legal-hub/guides"
        element={<Guides />}
      />

      <Route
        path="/legal-hub/updates"
        element={<Updates />}
      />

      <Route
        path="/legal-hub/ipc"
        element={<IPC />}
      />

      <Route
        path="/legal-hub/bns"
        element={<BNS />}
      />
            <Route
        path="/legal-hub/law-library"
        element={<LawLibrary />}
      />

      <Route
        path="/legal-hub/law-library/acts"
        element={<ActsLibrary />}
      />

      <Route
        path="/legal-hub/law-library/acts/:actId"
        element={<ActDetails />}
      />

      <Route
        path="/legal-hub/law-library/acts/:actId/sections/:sectionId"
        element={<SectionDetails />}
      />

      

      <Route
        path="/legal-hub/:type/:id"
        element={<LegalHubDetail />}
      />

      {/* ================= HELP ================= */}

      <Route
        path="/help"
        element={<Help />}
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
