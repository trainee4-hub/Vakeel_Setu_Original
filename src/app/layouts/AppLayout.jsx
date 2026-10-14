import { useLocation } from "react-router-dom";

import Navbar from "./Navbar";
import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";
import AppRoutes from "../routes/AppRoutes";
import { FloatingConsultant } from "../../features/user";


const isAdvocateWorkspace = (pathname) =>
  pathname.startsWith("/advocate/");

const isAdminWorkspace = (pathname) =>
  pathname === "/admin" ||
  pathname.startsWith("/admin/");

const FOOTER_HIDDEN_ROUTES = [
  "/login",
  "/signup",
];

function AppLayout() {
  const { pathname } = useLocation();

  const hidePublicChrome =
    isAdvocateWorkspace(pathname) ||
    isAdminWorkspace(pathname);

  const hideFooter =
    hidePublicChrome ||
    FOOTER_HIDDEN_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!hidePublicChrome && <Navbar />}

      {!hidePublicChrome && <Breadcrumbs />}
      {!hidePublicChrome && <FloatingConsultant/>}

      <main className="flex-1">
        <AppRoutes />
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default AppLayout;