import { useLocation, Navigate } from "react-router-dom";

import Navbar from "./Navbar";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";
import AppRoutes from "../routes/AppRoutes";
import { FloatingConsultant } from "../../features/user";
import { useAuth } from "../../features/auth";
import { isAdvocateUser } from "../../utils/advocateProfile";


const isAdvocateWorkspace = (pathname) =>
  pathname === "/advocate" || pathname.startsWith("/advocate/");

const isAdminWorkspace = (pathname) =>
  pathname === "/admin" ||
  pathname.startsWith("/admin/");

const FOOTER_HIDDEN_ROUTES = [
  "/login",
  "/signup",
];

function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isAdvocate = Boolean(user && isAdvocateUser(user));

  // If the logged-in user is an Advocate, they must strictly and exclusively
  // access the Advocate panel. Any attempt to navigate back or visit
  // public/client routes redirects immediately to their Advocate Dashboard.
  // Exception: direct URL visits to /bookings allow Bookings to render its
  // required no-access screen without a redirect loop or silent diversion.
  if (isAdvocate && !isAdvocateWorkspace(pathname) && !pathname.startsWith("/bookings")) {
    return <Navigate to="/advocate/dashboard" replace />;
  }

  const hidePublicChrome =
    isAdvocateWorkspace(pathname) ||
    isAdminWorkspace(pathname) ||
    isAdvocate;

  const hideFooter =
    hidePublicChrome ||
    FOOTER_HIDDEN_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!hidePublicChrome && <Navbar />}

      {!hidePublicChrome && <Breadcrumbs />}
      {!hidePublicChrome && <FloatingConsultant />}

      <main className="flex-1">
        <AppRoutes />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default AppLayout;