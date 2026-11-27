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

const isChatWorkspace = (pathname) =>
  pathname === "/legal-assistant" ||
  pathname.startsWith("/legal-assistant/") ||
  pathname === "/ipc-wiki" ||
  pathname.startsWith("/ipc-wiki/");

function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isAdvocate = Boolean(user && isAdvocateUser(user));

  const isAdvocateTest = pathname === "/advocate-test" || pathname.startsWith("/advocate-test");

  // If the logged-in user is an Advocate, they must strictly and exclusively
  // access the Advocate panel. Any attempt to navigate back or visit
  // public/client routes redirects immediately to their Advocate Dashboard.
  // Exception: direct URL visits to /bookings allow Bookings to render its
  // required no-access screen without a redirect loop or silent diversion.
  // Exception 2: /advocate-test is public assessment portal accessed via email token.
  if (isAdvocate && !isAdvocateWorkspace(pathname) && !pathname.startsWith("/bookings") && !isAdvocateTest) {
    return <Navigate to="/advocate/dashboard" replace />;
  }

  const isChat = isChatWorkspace(pathname);

  const hidePublicChrome =
    isAdvocateWorkspace(pathname) ||
    isAdminWorkspace(pathname) ||
    isAdvocateTest ||
    isAdvocate;

  const hideFooter =
    hidePublicChrome ||
    FOOTER_HIDDEN_ROUTES.includes(pathname) ||
    isChat;

  const hideBreadcrumbs =
    hidePublicChrome ||
    isChat;

  const hideFloatingConsultant =
    hidePublicChrome ||
    isChat;

  return (
    <div className={`flex flex-col ${isChat ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      {!hidePublicChrome && <Navbar />}

      {!hideBreadcrumbs && <Breadcrumbs />}
      {!hideFloatingConsultant && <FloatingConsultant />}

      <main className={`flex-1 ${isChat ? "pt-20 h-[calc(100vh-80px)] overflow-hidden" : ""}`}>
        <AppRoutes />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default AppLayout;
