import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAdminAuth from "../../hooks/useAdminAuth";
import { ADMIN_PATHS, ADMIN_UNAUTHORIZED_EVENT } from "../../utils/adminUtils";
import { ToastProvider } from "@shared/components/ui/Toast";
import { ListSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminMobileSidebar from "./AdminMobileSidebar";
import { sectionTitleFor } from "./navigation";

export default function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const endingSession = useRef(false);

  const endSession = useCallback(
    async (state) => {
      if (endingSession.current) return; // one logout, however many 401s arrive
      endingSession.current = true;
      setSigningOut(true);
      try {
        await signOut();
      } finally {
        navigate(ADMIN_PATHS.login, { replace: true, state });
      }
    },
    [signOut, navigate],
  );

  // A 401 from any protected Admin request ends the session.
  useEffect(() => {
    const onUnauthorized = () => endSession({ sessionExpired: true });
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [endSession]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const handleSignOut = () => endSession(undefined);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
          <AdminSidebar user={user} onSignOut={handleSignOut} signingOut={signingOut} />
        </aside>

        <AdminMobileSidebar
          open={drawerOpen}
          onClose={closeDrawer}
          user={user}
          onSignOut={handleSignOut}
          signingOut={signingOut}
        />

        <div className="lg:pl-64">
          <AdminHeader
            title={sectionTitleFor(pathname)}
            user={user}
            drawerOpen={drawerOpen}
            onOpenMenu={() => setDrawerOpen(true)}
          />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Suspense fallback={<ListSkeleton rows={4} />}>
              <Outlet />
            </Suspense>
          </main>
        </div>

      </div>
    </ToastProvider>
  );
}
