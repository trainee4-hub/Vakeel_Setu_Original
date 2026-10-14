import { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { X } from "lucide-react";

import { useAuth } from "../../auth";
import {
  resetAdvocateProfileSync,
  useAdvocateOnlineStatus,
  logoutAdvocate,
} from "../index";

import AdvocateSidebar from "./components/AdvocateSidebar";
import AdvocateMobileHeader from "./components/AdvocateMobileHeader";

export default function AdvocateLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /*
   * Keep advocate presence management at layout level.
   *
   * AdvocateLayout remains mounted while navigating between
   * dashboard/profile/bookings/messages/team/etc., so the
   * heartbeat does not restart on every page change.
   */
  const advocateOnlineStatus =
    useAdvocateOnlineStatus({
      enabled: Boolean(user),

      initialIsOnline:
        typeof user?.isOnline === "boolean"
          ? user.isOnline
          : true,

      initialLastSeenAt:
        user?.lastSeenAt || null,
    });

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);

    /*
     * Allows routes such as:
     *
     * /advocate/dashboard#advocate-team
     */
    navigate(path);
  };

  /*
   * Backend logout is important because it immediately marks
   * the advocate offline.
   *
   * Local logout still runs even if the backend logout request
   * fails.
   */
  const handleLogout = async () => {
    try {
      await logoutAdvocate();
    } catch (error) {
      console.error(
        "Unable to update advocate logout status:",
        error,
      );
    } finally {
      resetAdvocateProfileSync();

      logout();

      navigate("/login", {
        replace: true,
      });
    }
  };

  const handleNotifications = () => {
    navigate("/advocate/dashboard");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-600 antialiased">
      <AdvocateSidebar
        advocate={user}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <AdvocateMobileHeader
        onMenu={() => setMobileMenuOpen(true)}
        onNotifications={handleNotifications}
      />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: -290 }}
              animate={{ x: 0 }}
              exit={{ x: -290 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 30,
              }}
              className="relative h-full w-[280px] max-w-[86vw] shadow-2xl"
            >
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="absolute right-3 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white"
                aria-label="Close menu"
              >
                <X size={19} />
              </button>

              <AdvocateSidebar
                mobile
                advocate={user}
                currentPath={location.pathname}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ONLY place where sidebar margin exists */}
      <div className="min-h-screen min-w-0 lg:ml-[280px]">
        <Outlet
          context={{
            advocateOnlineStatus,
          }}
        />
      </div>
    </div>
  );
}