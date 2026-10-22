import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  FaBalanceScale,
  FaGavel,
  FaRegBookmark,
  FaRegCalendarAlt,
  FaRegUser,
  FaReceipt,
} from "react-icons/fa";

import {
  FaBookOpen,
  FaFileLines,
  FaScaleBalanced,
  FaShieldHalved,
} from "react-icons/fa6";

import {
  IoChevronDown,
  IoClose,
  IoLogOutOutline,
  IoMenu,
  IoRefreshOutline,
} from "react-icons/io5";

import { useAuth } from "../../features/auth";
import LanguageTranslator from "./LanguageTranslator";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================================================
     AUTH
  ========================================================================= */

  const { user, isLoggedIn, authLoading, logout } = useAuth();

  const loggedIn = Boolean(isLoggedIn && user);

  const normalizedRole = String(
    user?.role || user?.accountType || user?.type || "",
  ).toLowerCase();

  const isAdvocate = normalizedRole === "advocate" || normalizedRole === "lawyer";

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  const profileMenuRef = useRef(null);

  /* Close profile menu on outside screen click */
  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showProfileMenu]);

  /* Close profile menu on route navigation */
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

  /* =========================================================================
     ACTIVE ROUTE
  ========================================================================= */

  const isActive = (paths) => {
    const routePaths = Array.isArray(paths) ? paths : [paths];

    return routePaths.some((path) => {
      if (path === "/") {
        return location.pathname === "/";
      }

      return (
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
    });
  };

  /* =========================================================================
     NAV ITEM CLASS
  ========================================================================= */

  const navItemClass = (paths) => {
    const active = isActive(paths);

    return `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${active
        ? "bg-white text-amber-600 shadow-sm"
        : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
      }`;
  };

  /* =========================================================================
     MOBILE NAVIGATION
  ========================================================================= */

  const handleMobileNavigation = () => {
    setMobileMenu(false);
    setShowProfileMenu(false);
  };

  /* =========================================================================
     PROTECTED NAVIGATION
  ========================================================================= */

  const handleProtectedNavigation = (path) => {
    setMobileMenu(false);
    setShowProfileMenu(false);

    if (!loggedIn) {
      navigate("/login", {
        state: {
          from: path,
        },
      });

      return;
    }

    navigate(path);
  };

  /* =========================================================================
     PROFILE ROUTE
  ========================================================================= */

  const getProfileRoute = () => {
    if (isAdvocate) {
      return "/advocate/profile";
    }

    return "/user-profile";
  };

  /* =========================================================================
     LOGOUT
  ========================================================================= */

  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      setMobileMenu(false);

      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-slate-200/60 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ===============================================================
            MAIN NAVBAR
        =============================================================== */}

        <div className="flex h-20 items-center justify-between">
          {/* =============================================================
              LOGO
          ============================================================= */}

          <Link
            to="/"
            onClick={handleMobileNavigation}
            className="notranslate group flex shrink-0 items-center gap-3"
            translate="no"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-500">
              <FaScaleBalanced className="text-2xl" />
            </div>

            <span className="text-lg font-bold text-slate-900 sm:text-xl">
              Vakeel<span className="text-amber-600">Setu</span>
            </span>
          </Link>

          {/* =============================================================
              DESKTOP NAVIGATION
          ============================================================= */}

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/50 bg-slate-100/60 p-1.5 lg:flex">
            <Link
              to={isAdvocate ? "/advocate/dashboard" : "/"}
              className={navItemClass(isAdvocate ? "/advocate/dashboard" : "/")}
            >
              {isAdvocate ? "Dashboard" : "Home"}
            </Link>

            {!isAdvocate && (
              <Link to="/find-lawyer" className={navItemClass("/find-lawyer")}>
                Find Lawyer
              </Link>
            )}

            {/* LEGAL ASSISTANT */}

            {loggedIn ? (
              <Link to="/legal-assistant" className={navItemClass("/legal-assistant")}>
                Legal Assistant
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/legal-assistant")}
                className={navItemClass("/legal-assistant")}
              >
                Legal Assistant
              </button>
            )}

            {/* BOOKINGS */}

            {loggedIn ? (
              <Link
                to={isAdvocate ? "/advocate/bookings" : "/bookings"}
                className={navItemClass(isAdvocate ? "/advocate/bookings" : "/bookings")}
              >
                My Bookings
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/bookings")}
                className={navItemClass("/bookings")}
              >
                My Bookings
              </button>
            )}

            {/* MESSAGES */}

            {loggedIn ? (
              <Link
                to={isAdvocate ? "/advocate/messages" : "/messages"}
                className={navItemClass(isAdvocate ? "/advocate/messages" : "/messages")}
              >
                Messages
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/messages")}
                className={navItemClass("/messages")}
              >
                Messages
              </button>
            )}

            {/* ===========================================================
                LEGAL HUB
            =========================================================== */}

            <div className="group relative">
              <button
                type="button"
                className={`${navItemClass(
                  "/legal-hub",
                )} flex items-center gap-1`}
              >
                Legal Hub
                <IoChevronDown className="text-base transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="invisible absolute left-1/2 top-full z-[200] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                  {/* RIGHTS */}

                  <Link
                    to="/legal-hub/rights"
                    className="group/item flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <FaGavel className="shrink-0 text-[20px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">Rights</p>

                      <p className="text-xs text-slate-400">
                        Know your legal rights
                      </p>
                    </div>
                  </Link>

                  {/* ARTICLES */}

                  <Link
                    to="/legal-hub/articles"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <FaFileLines className="shrink-0 text-[20px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Articles
                      </p>

                      <p className="text-xs text-slate-400">
                        Latest legal articles
                      </p>
                    </div>
                  </Link>

                  {/* GUIDES */}

                  <Link
                    to="/legal-hub/guides"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <FaBookOpen className="shrink-0 text-[20px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">Guides</p>

                      <p className="text-xs text-slate-400">
                        Step-by-step legal help
                      </p>
                    </div>
                  </Link>

                  {/* IPC */}

                  <Link
                    to="/legal-hub/ipc"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <FaBalanceScale className="shrink-0 text-[20px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">IPC</p>

                      <p className="text-xs text-slate-400">
                        Indian Penal Code
                      </p>
                    </div>
                  </Link>

                  {/* BNS */}

                  <Link
                    to="/legal-hub/bns"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <FaShieldHalved className="shrink-0 text-[20px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">BNS</p>

                      <p className="text-xs text-slate-400">
                        Bharatiya Nyaya Sanhita
                      </p>
                    </div>
                  </Link>

                  {/* LAW LIBRARY */}

                  <Link
                    to="/legal-hub/law-library"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <FaBookOpen className="shrink-0 text-[20px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Law Library
                      </p>

                      <p className="text-xs text-slate-400">
                        Acts, Sections & Legal References
                      </p>
                    </div>
                  </Link>

                  {/* UPDATES */}

                  <Link
                    to="/legal-hub/updates"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-amber-50"
                  >
                    <IoRefreshOutline className="shrink-0 text-[21px] text-amber-600" />

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Updates
                      </p>

                      <p className="text-xs text-slate-400">
                        Important legal updates
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* =============================================================
              RIGHT SIDE
          ============================================================= */}

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageTranslator />

            {/* ===========================================================
                AUTH LOADING
            =========================================================== */}

            {authLoading ? (
              <div className="hidden items-center gap-2 lg:flex">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />

                <div className="hidden space-y-1.5 sm:block">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  <div className="h-2.5 w-12 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ) : loggedIn ? (
              /* =========================================================
                  LOGGED IN USER
              ========================================================= */

              <div ref={profileMenuRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu((prev) => !prev);
                  }}
                  className="flex items-center gap-2 rounded-full p-1 pr-2 transition-all hover:bg-slate-50"
                >
                  {/* PROFILE IMAGE */}

                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-md">
                    {user?.profileUrl ||
                      user?.profilePhotoUrl ||
                      user?.avatar?.url ? (
                      <img
                        src={
                          user?.profileUrl ||
                          user?.profilePhotoUrl ||
                          user?.avatar?.url
                        }
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaRegUser className="text-[19px] text-slate-500" />
                    )}
                  </div>

                  {/* USER NAME */}

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[120px] truncate text-sm font-bold text-slate-800">
                      {user?.name || user?.fullName || user?.email || "User"}
                    </p>

                    <p className="text-[10px] font-medium text-slate-400">
                      {isAdvocate ? "Advocate" : "Profile"}
                    </p>
                  </div>

                  <IoChevronDown className="hidden text-sm text-slate-400 sm:block" />
                </button>

                {/* =======================================================
                    PROFILE DROPDOWN
                ======================================================= */}

                {showProfileMenu && (
                  <div className="absolute right-0 top-full z-[100] mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    <Link
                      to={getProfileRoute()}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <FaRegUser className="shrink-0 text-lg" />
                      Profile
                    </Link>

                    {isAdvocate ? (
                      <>
                        <Link
                          to="/advocate/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FaScaleBalanced className="shrink-0 text-lg text-amber-600" />
                          Dashboard
                        </Link>

                        <Link
                          to="/advocate/bookings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FaRegCalendarAlt className="shrink-0 text-lg" />
                          My Bookings
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/bookings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FaRegCalendarAlt className="shrink-0 text-lg" />
                          My Bookings
                        </Link>

                        <Link
                          to="/payments"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FaReceipt className="shrink-0 text-lg" />
                          My Payments
                        </Link>

                        <Link
                          to="/saved-lawyers"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <FaRegBookmark className="shrink-0 text-lg" />
                          Saved Lawyers
                        </Link>
                      </>
                    )}

                    <div className="my-1 h-px bg-slate-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-red-100 font-bold text-red-500 hover:text-red-600"
                    >
                      <IoLogOutOutline className="shrink-0 text-3xl font-bold " />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* =========================================================
                  GUEST
              ========================================================= */

              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="notranslate rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
                  translate="no"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="notranslate rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-bold text-white"
                  translate="no"
                >
                  Sign Up
                </Link>


              </div>
            )}

            {/* ===========================================================
                MOBILE MENU BUTTON
            =========================================================== */}

            <button
              type="button"
              onClick={() => {
                setMobileMenu((prev) => !prev);
                setShowProfileMenu(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenu ? (
                <IoClose className="text-[24px]" />
              ) : (
                <IoMenu className="text-[24px]" />
              )}
            </button>
          </div>
        </div>

        {/* ===============================================================
            MOBILE MENU
        =============================================================== */}

        {mobileMenu && (
          <div className="pb-4 lg:hidden">
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              {/* Home */}
              <Link
                to="/"
                onClick={handleMobileNavigation}
                className={`block w-full rounded-xl px-4 py-3 text-sm font-semibold ${isActive("/")
                    ? "bg-white text-amber-600"
                    : "text-slate-700 hover:bg-white"
                  }`}
              >
                Home
              </Link>

              {/* Find Lawyer */}
              <Link
                to="/find-lawyer"
                onClick={handleMobileNavigation}
                className={`block w-full rounded-xl px-4 py-3 text-sm font-semibold ${isActive("/find-lawyer")
                    ? "bg-white text-amber-600"
                    : "text-slate-700 hover:bg-white"
                  }`}
              >
                Find Lawyer
              </Link>

              {/* Legal Hub - Public */}
              <Link
                to="/legal-hub"
                onClick={handleMobileNavigation}
                className={`block w-full rounded-xl px-4 py-3 text-sm font-semibold ${isActive("/legal-hub")
                    ? "bg-white text-amber-600"
                    : "text-slate-700 hover:bg-white"
                  }`}
              >
                Legal Hub
              </Link>

              {/* Legal Assistant - Protected */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/legal-assistant")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Legal Assistant
              </button>

              {/* My Bookings - Protected */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/bookings")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-white"
              >
                My Bookings
              </button>

              {/* My Payments - Protected */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/payments")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-white"
              >
                My Payments
              </button>

              {/* Messages - Protected */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation("/messages")}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Messages
              </button>

              <div className="my-2 h-px bg-slate-200" />

              <LanguageTranslator mobile />

              {/* =========================================================
          MOBILE AUTH
      ========================================================= */}

              {!authLoading && loggedIn && (
                <>
                  <div className="my-2 h-px bg-slate-200" />

                  <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                      {user?.profileUrl ||
                        user?.profilePhotoUrl ||
                        user?.avatar?.url ? (
                        <img
                          src={
                            user?.profileUrl ||
                            user?.profilePhotoUrl ||
                            user?.avatar?.url
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaRegUser className="text-[19px] text-slate-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {user?.name || user?.fullName || user?.email || "User"}
                      </p>

                      <p className="text-xs text-slate-400">
                        {isAdvocate ? "Advocate" : "User"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={getProfileRoute()}
                    onClick={handleMobileNavigation}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                  >
                    <FaRegUser className="shrink-0 text-lg" />
                    Profile
                  </Link>

                  {isAdvocate ? (
                    <Link
                      to="/advocate/dashboard"
                      onClick={handleMobileNavigation}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                    >
                      <FaScaleBalanced className="shrink-0 text-lg text-amber-600" />
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/saved-lawyers"
                      onClick={handleMobileNavigation}
                      className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                    >
                      <FaRegBookmark className="shrink-0 text-lg" />
                      Saved Lawyers
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <IoLogOutOutline className="shrink-0 text-lg" />
                    Logout
                  </button>
                </>
              )}

              {!authLoading && !loggedIn && (
                <>
                  <div className="my-2 h-px bg-slate-200" />

                  <Link
                    to="/login"
                    onClick={handleMobileNavigation}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={handleMobileNavigation}
                    className="block w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-center text-sm font-bold text-white cursor-poi"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
