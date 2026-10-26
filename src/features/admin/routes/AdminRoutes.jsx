import { Suspense, lazy } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import useAdminAuth from "../hooks/useAdminAuth";
import AdminLayout from "../components/layout/AdminLayout";
import { Icon } from "@shared/components/ui/Button";
import { buttonClass } from "@shared/components/ui/styles";
import ErrorBoundary from "@shared/components/feedback/ErrorBoundary";
import { ADMIN_PATHS } from "../utils/adminUtils";
import { ADMIN_PERMISSIONS } from "../utils/permissions";

const AdminLogin = lazy(() => import("../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));

// Platform Pages
const AdvocatesList = lazy(() => import("../pages/platform/advocates/AdvocatesList"));
const AdvocateDetail = lazy(() => import("../pages/platform/advocates/AdvocateDetail"));
const UsersList = lazy(() => import("../pages/platform/users/UsersList"));
const UserDetail = lazy(() => import("../pages/platform/users/UserDetail"));
const RolesList = lazy(() => import("../pages/platform/roles/RolesList"));
const RoleEditor = lazy(() => import("../pages/platform/roles/RoleEditor"));
const ConsultancyList = lazy(() => import("../pages/platform/consultancy/ConsultancyList"));
const AdvocateBookingsList = lazy(() => import("../pages/platform/advocateBookings/AdvocateBookingsList"));
const FeedbackList = lazy(() => import("../pages/platform/feedback/FeedbackList"));
const HelpRequestsList = lazy(() => import("../pages/platform/help/HelpRequestsList"));
const HelpRequestDetail = lazy(() => import("../pages/platform/help/HelpRequestDetail"));
const ContentCreatorsList = lazy(() => import("../pages/platform/contentCreators/ContentCreatorsList"));

// Content Pages
const BlogList = lazy(() => import("../pages/content/blogs/BlogList"));
const CreateBlog = lazy(() => import("../pages/content/blogs/CreateBlog"));
const EditBlog = lazy(() => import("../pages/content/blogs/EditBlog"));

const IPCList = lazy(() => import("../pages/content/ipc/IPCList"));
const CreateIPC = lazy(() => import("../pages/content/ipc/CreateIPC"));
const EditIPC = lazy(() => import("../pages/content/ipc/EditIPC"));

const BNSList = lazy(() => import("../pages/content/bns/BNSList"));
const CreateBNS = lazy(() => import("../pages/content/bns/CreateBNS"));
const EditBNS = lazy(() => import("../pages/content/bns/EditBNS"));

const UserRightsList = lazy(() => import("../pages/content/userRights/UserRightsList"));
const CreateUserRight = lazy(() => import("../pages/content/userRights/CreateUserRight"));
const EditUserRight = lazy(() => import("../pages/content/userRights/EditUserRight"));

const GuidesList = lazy(() => import("../pages/content/guides/GuidesList"));
const CreateGuide = lazy(() => import("../pages/content/guides/CreateGuide"));
const EditGuide = lazy(() => import("../pages/content/guides/EditGuide"));

const UpdatesList = lazy(() => import("../pages/content/updates/UpdatesList"));
const CreateUpdate = lazy(() => import("../pages/content/updates/CreateUpdate"));
const EditUpdate = lazy(() => import("../pages/content/updates/EditUpdate"));
const BareActsPage = lazy(() => import("../pages/content/bareActs/BareActsPage"));
const BareActCategoryEditor = lazy(() =>
  import("../pages/content/bareActs/BareActEditors").then((m) => ({ default: m.BareActCategoryEditor })),
);
const ActEditor = lazy(() =>
  import("../pages/content/bareActs/BareActEditors").then((m) => ({ default: m.ActEditor })),
);
const SectionEditor = lazy(() =>
  import("../pages/content/bareActs/BareActEditors").then((m) => ({ default: m.SectionEditor })),
);

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50" aria-busy="true">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-amber-500" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/* =========================================================
   ADMIN GUARD

   Waits for auth restore, then:
     unauthenticated → /admin/login
     ADMIN           → allowed
     USER / ADVOCATE → access screen (no redirect loop)
========================================================= */

function AdminGuard() {
  const { ready, isAuthenticated, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (!ready) return <FullScreenSpinner />;

  if (!isAuthenticated) {
    return <Navigate to={ADMIN_PATHS.login} replace state={{ from: location.pathname + location.search }} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Icon name="lock" className="text-[26px]" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-950">This area is for administrators</h1>
          <p className="mt-1 text-sm text-slate-600">Your current account doesn't have access to the admin dashboard.</p>
          <Link to="/" className={buttonClass("primary", "mt-6")}>
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

function PermissionRouteGuard({ required }) {
  const { has } = useAdminAuth();

  if (!has(required)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Icon name="lock" className="text-[26px]" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-950">You don't have access to this section</h2>
        <p className="mt-1 text-sm text-slate-600">Your account does not have permission to view or manage this content.</p>
        <Link to={ADMIN_PATHS.dashboard} className={buttonClass("primary", "mt-6")}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <Outlet />;
}

function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <Icon name="search_off" className="text-[26px]" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-950">Admin page not found</h2>
      <p className="mt-1 text-sm text-slate-600">The admin section you are looking for doesn't exist.</p>
      <Link to={ADMIN_PATHS.dashboard} className={buttonClass("primary", "mt-6")}>
        Back to Dashboard
      </Link>
    </div>
  );
}

/* =========================================================
   ROUTES — mounted in AppRoutes at /admin/*
========================================================= */

export default function AdminRoutes() {
  return (
    <ErrorBoundary fallbackUrl={ADMIN_PATHS.dashboard} fallbackLabel="Back to Dashboard">
      <Routes>
        <Route
          path="login"
        element={
          <Suspense fallback={<FullScreenSpinner />}>
            <AdminLogin />
          </Suspense>
        }
      />

      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to={ADMIN_PATHS.dashboard} replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* ==================== PLATFORM ROUTES ==================== */}
          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.ADVOCATES_VIEW]} />}>
            <Route path="advocates" element={<AdvocatesList />} />
            <Route path="advocates/:id" element={<AdvocateDetail />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.USERS_VIEW]} />}>
            <Route path="users" element={<UsersList />} />
            <Route path="users/:id" element={<UserDetail />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.ROLES_MANAGE]} />}>
            <Route path="roles" element={<RolesList />} />
            <Route path="roles/create" element={<RoleEditor />} />
            <Route path="roles/:id" element={<RoleEditor />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.CONSULTANCY_VIEW]} />}>
            <Route path="consultancy" element={<ConsultancyList />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.ADVOCATE_BOOKINGS_VIEW]} />}>
            <Route path="advocate-bookings" element={<AdvocateBookingsList />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.FEEDBACK_VIEW]} />}>
            <Route path="feedback" element={<FeedbackList />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.HELP_VIEW]} />}>
            <Route path="help" element={<HelpRequestsList />} />
            <Route path="help/:id" element={<HelpRequestDetail />} />
          </Route>

          <Route element={<PermissionRouteGuard required={[ADMIN_PERMISSIONS.CONTENT_CREATORS_VIEW]} />}>
            <Route path="content-creators" element={<ContentCreatorsList />} />
          </Route>

          {/* ==================== CONTENT ROUTES ==================== */}
          <Route path="content">
            <Route index element={<Navigate to={ADMIN_PATHS.blogs.list} replace />} />

            <Route
              element={
                <PermissionRouteGuard
                  required={[
                    ADMIN_PERMISSIONS.BLOGS_CREATE,
                    ADMIN_PERMISSIONS.BLOGS_UPDATE,
                    ADMIN_PERMISSIONS.BLOGS_DELETE,
                  ]}
                />
              }
            >
              <Route path="blogs" element={<BlogList />} />
              <Route path="blogs/create" element={<CreateBlog />} />
              <Route path="blogs/:id/edit" element={<EditBlog />} />
            </Route>

            <Route
              element={
                <PermissionRouteGuard
                  required={[ADMIN_PERMISSIONS.IPC_CREATE, ADMIN_PERMISSIONS.IPC_UPDATE]}
                />
              }
            >
              <Route path="ipc" element={<IPCList />} />
              <Route path="ipc/create" element={<CreateIPC />} />
              <Route path="ipc/:id/edit" element={<EditIPC />} />
            </Route>

            <Route
              element={
                <PermissionRouteGuard
                  required={[ADMIN_PERMISSIONS.BNS_CREATE, ADMIN_PERMISSIONS.BNS_UPDATE]}
                />
              }
            >
              <Route path="bns" element={<BNSList />} />
              <Route path="bns/create" element={<CreateBNS />} />
              <Route path="bns/:id/edit" element={<EditBNS />} />
            </Route>

            <Route
              element={
                <PermissionRouteGuard
                  required={[
                    ADMIN_PERMISSIONS.USER_RIGHTS_CREATE,
                    ADMIN_PERMISSIONS.USER_RIGHTS_UPDATE,
                    ADMIN_PERMISSIONS.USER_RIGHTS_DELETE,
                  ]}
                />
              }
            >
              <Route path="user-rights" element={<UserRightsList />} />
              <Route path="user-rights/create" element={<CreateUserRight />} />
              <Route path="user-rights/:id/edit" element={<EditUserRight />} />
            </Route>

            <Route
              element={
                <PermissionRouteGuard
                  required={[
                    ADMIN_PERMISSIONS.GUIDES_CREATE,
                    ADMIN_PERMISSIONS.GUIDES_UPDATE,
                    ADMIN_PERMISSIONS.GUIDES_DELETE,
                  ]}
                />
              }
            >
              <Route path="guides" element={<GuidesList />} />
              <Route path="guides/create" element={<CreateGuide />} />
              <Route path="guides/:id/edit" element={<EditGuide />} />
            </Route>

            <Route
              element={
                <PermissionRouteGuard
                  required={[
                    ADMIN_PERMISSIONS.UPDATES_CREATE,
                    ADMIN_PERMISSIONS.UPDATES_UPDATE,
                    ADMIN_PERMISSIONS.UPDATES_DELETE,
                  ]}
                />
              }
            >
              <Route path="updates" element={<UpdatesList />} />
              <Route path="updates/create" element={<CreateUpdate />} />
              <Route path="updates/:id/edit" element={<EditUpdate />} />
            </Route>

            <Route
              element={
                <PermissionRouteGuard
                  required={[ADMIN_PERMISSIONS.ACTS_CREATE, ADMIN_PERMISSIONS.ACTS_UPDATE]}
                />
              }
            >
              <Route path="bare-acts" element={<BareActsPage />} />
              <Route path="bare-acts/categories/create" element={<BareActCategoryEditor key="category-create" />} />
              <Route path="bare-acts/categories/:id/edit" element={<BareActCategoryEditor key="category-edit" />} />
              <Route path="bare-acts/acts/create" element={<ActEditor key="act-create" />} />
              <Route path="bare-acts/acts/:id/edit" element={<ActEditor key="act-edit" />} />
              <Route path="bare-acts/sections/create" element={<SectionEditor key="section-create" />} />
              <Route path="bare-acts/sections/:id/edit" element={<SectionEditor key="section-edit" />} />
            </Route>
          </Route>

          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Route>
    </Routes>
    </ErrorBoundary>
  );
}
