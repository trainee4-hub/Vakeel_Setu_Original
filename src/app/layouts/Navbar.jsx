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
  const isAdmin = normalizedRole === "admin";

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
     NAV ITEM RENDERER (HOVER UNDERLINE + ACTIVE PERSISTENCE)
  ========================================================================= */

  const renderNavTab = ({ to, onClick, paths, label, iconRight }) => {
    const active = isActive(paths);
    const tabClasses = `group relative inline-flex items-center gap-1.5 px-1 py-1.5 text-[15px] xl:text-base transition-colors duration-200 whitespace-nowrap cursor-pointer select-none ${
      active
        ? "font-bold text-amber-500"
        : "font-semibold text-slate-300 hover:text-amber-400"
    }`;

    const underline = (
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full bg-amber-500 transition-transform duration-300 ease-out origin-left ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    );

    if (to) {
      return (
        <Link to={to} className={tabClasses}>
          <span>{label}</span>
          {iconRight}
          {underline}
        </Link>
      );
    }

    return (
      <button type="button" onClick={onClick} className={tabClasses}>
        <span>{label}</span>
        {iconRight}
        {underline}
      </button>
    );
  };

  /* Mobile item active styling */
  const mobileNavItemClass = (paths) => {
    const active = isActive(paths);

    return `flex items-center justify-between w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-amber-500/15 text-amber-400 border-l-4 border-amber-400 pl-3.5"
        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
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
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-slate-800/80 bg-[#070b14]/90 shadow-md shadow-black/20 backdrop-blur-xl">
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
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 text-amber-400 shadow-sm transition-all duration-200 group-hover:border-amber-500/50 group-hover:text-amber-300">
              <FaScaleBalanced className="text-xl" />
            </div>

            <span
              className="notranslate text-lg font-bold text-white transition-colors sm:text-xl"
              translate="no"
            >
              Vakeel<span className="text-amber-400">Setu</span>
            </span>
          </Link>

          {/* =============================================================
              DESKTOP NAVIGATION
          ============================================================= */}

          <nav className="hidden items-center gap-6 lg:gap-6 xl:gap-8 lg:flex">
            {renderNavTab({
              to: isAdvocate ? "/advocate/dashboard" : "/",
              paths: isAdvocate ? "/advocate/dashboard" : "/",
              label: isAdvocate ? "Dashboard" : "Home",
            })}

            {!isAdvocate &&
              renderNavTab({
                to: "/find-lawyer",
                paths: "/find-lawyer",
                label: "Find Lawyer",
              })}

            {/* LEGAL ASSISTANT */}

            {loggedIn
              ? renderNavTab({
                  to: "/legal-assistant",
                  paths: "/legal-assistant",
                  label: "Legal Assistant",
                })
              : renderNavTab({
                  onClick: () => handleProtectedNavigation("/legal-assistant"),
                  paths: "/legal-assistant",
                  label: "Legal Assistant",
                })}

            {/* BOOKINGS */}

            {!isAdvocate &&
              !isAdmin &&
              (loggedIn
                ? renderNavTab({
                    to: "/bookings",
                    paths: "/bookings",
                    label: "My Bookings",
                  })
                : renderNavTab({
                    onClick: () => handleProtectedNavigation("/bookings"),
                    paths: "/bookings",
                    label: "My Bookings",
                  }))}

            {/* MESSAGES */}

            {loggedIn
              ? renderNavTab({
                  to: isAdvocate ? "/advocate/messages" : "/messages",
                  paths: isAdvocate ? "/advocate/messages" : "/messages",
                  label: "Messages",
                })
              : renderNavTab({
                  onClick: () => handleProtectedNavigation("/messages"),
                  paths: "/messages",
                  label: "Messages",
                })}

            {/* ===========================================================
                LEGAL HUB
            =========================================================== */}

            <div className="group relative">
              <button
                type="button"
                className={`group/btn relative inline-flex items-center gap-1.5 px-1 py-1.5 text-[15px] xl:text-base transition-colors duration-200 whitespace-nowrap cursor-pointer select-none ${
                  isActive("/legal-hub")
                    ? "font-bold text-amber-500"
                    : "font-semibold text-slate-300 hover:text-amber-400"
                }`}
              >
                <span>Legal Hub</span>
                <IoChevronDown className="text-sm transition-transform duration-200 group-hover:rotate-180" />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full bg-amber-500 transition-transform duration-300 ease-out origin-left ${
                    isActive("/legal-hub")
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100 group-hover/btn:scale-x-100"
                  }`}
                />
              </button>

              <div className="invisible absolute left-1/2 top-full z-[200] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="w-64 rounded-2xl border border-slate-800 bg-[#0d1424]/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl">
                  {/* RIGHTS */}

                  <Link
                    to="/legal-hub/rights"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/rights")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <FaGavel className="shrink-0 text-[18px] text-amber-400 transition-transform duration-200 group-hover/item:scale-110" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/rights")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        Rights
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
                        Know your legal rights
                      </p>
                    </div>
                  </Link>

                  {/* ARTICLES */}

                  <Link
                    to="/legal-hub/articles"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/articles")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <FaFileLines className="shrink-0 text-[18px] text-amber-400 transition-transform duration-200 group-hover/item:scale-110" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/articles")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        Articles
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
                        Latest legal articles
                      </p>
                    </div>
                  </Link>

                  {/* GUIDES */}

                  <Link
                    to="/legal-hub/guides"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/guides")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <FaBookOpen className="shrink-0 text-[18px] text-amber-400 transition-transform duration-200 group-hover/item:scale-110" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/guides")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        Guides
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
                        Step-by-step legal help
                      </p>
                    </div>
                  </Link>

                  {/* IPC */}

                  <Link
                    to="/legal-hub/ipc"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/ipc")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <FaBalanceScale className="shrink-0 text-[18px] text-amber-400 transition-transform duration-200 group-hover/item:scale-110" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/ipc")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        IPC
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
                        Indian Penal Code
                      </p>
                    </div>
                  </Link>

                  {/* BNS */}

                  <Link
                    to="/legal-hub/bns"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/bns")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <FaShieldHalved className="shrink-0 text-[18px] text-amber-400 transition-transform duration-200 group-hover/item:scale-110" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/bns")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        BNS
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
                        Bharatiya Nyaya Sanhita
                      </p>
                    </div>
                  </Link>

                  {/* LAW LIBRARY */}

                  <Link
                    to="/legal-hub/law-library"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/law-library")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <FaBookOpen className="shrink-0 text-[18px] text-amber-400 transition-transform duration-200 group-hover/item:scale-110" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/law-library")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        Law Library
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
                        Acts, Sections & Legal References
                      </p>
                    </div>
                  </Link>

                  {/* UPDATES */}

                  <Link
                    to="/legal-hub/updates"
                    className={`group/item flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                      isActive("/legal-hub/updates")
                        ? "bg-amber-500/15 text-amber-400"
                        : "text-slate-200 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <IoRefreshOutline className="shrink-0 text-[20px] text-amber-400 transition-transform duration-200 group-hover/item:rotate-180" />

                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isActive("/legal-hub/updates")
                            ? "text-amber-400"
                            : "text-slate-200 group-hover/item:text-amber-300"
                        }`}
                      >
                        Updates
                      </p>

                      <p className="text-xs text-slate-400 group-hover/item:text-slate-300">
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
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-800" />

                <div className="hidden space-y-1.5 sm:block">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
                  <div className="h-2.5 w-12 animate-pulse rounded bg-slate-800/60" />
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
                  className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-2.5 transition-all duration-200 hover:border-slate-700/60 hover:bg-slate-800/60"
                >
                  {/* PROFILE IMAGE */}

                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 shadow-md">
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
                      <FaRegUser className="text-[18px] text-slate-300" />
                    )}
                  </div>

                  {/* USER NAME */}

                  <div className="hidden text-left sm:block">
                    <p className="max-w-[120px] truncate text-sm font-bold text-slate-200">
                      {user?.name || user?.fullName || user?.email || "User"}
                    </p>

                    <p className="text-[10px] font-medium text-amber-400/90">
                      {isAdvocate ? "Advocate" : "Client"}
                    </p>
                  </div>

                  <IoChevronDown
                    className={`hidden text-sm text-slate-400 transition-transform duration-200 sm:block ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* =======================================================
                    PROFILE DROPDOWN
                ======================================================= */}

                {showProfileMenu && (
                  <div className="absolute right-0 top-full z-[100] mt-2 w-52 rounded-2xl border border-slate-800 bg-[#0d1424]/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-xl">
                    <Link
                      to={getProfileRoute()}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/80 hover:text-amber-300"
                    >
                      <FaRegUser className="shrink-0 text-base text-slate-400" />
                      Profile
                    </Link>

                    {isAdvocate ? (
                      <>
                        <Link
                          to="/advocate/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/80 hover:text-amber-300"
                        >
                          <FaScaleBalanced className="shrink-0 text-base text-amber-400" />
                          Dashboard
                        </Link>

                        <Link
                          to="/advocate/bookings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/80 hover:text-amber-300"
                        >
                          <FaRegCalendarAlt className="shrink-0 text-base text-slate-400" />
                          My Bookings
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/bookings"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/80 hover:text-amber-300"
                        >
                          <FaRegCalendarAlt className="shrink-0 text-base text-slate-400" />
                          My Bookings
                        </Link>

                        <Link
                          to="/payments"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/80 hover:text-amber-300"
                        >
                          <FaReceipt className="shrink-0 text-base text-slate-400" />
                          My Payments
                        </Link>

                        <Link
                          to="/saved-lawyers"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/80 hover:text-amber-300"
                        >
                          <FaRegBookmark className="shrink-0 text-base text-slate-400" />
                          Saved Lawyers
                        </Link>
                      </>
                    )}

                    <div className="my-1.5 h-px bg-slate-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                      <IoLogOutOutline className="shrink-0 text-xl font-bold" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* =========================================================
                  GUEST
              ========================================================= */

              <div className="flex items-center gap-2 sm:gap-2.5">
                <Link
                  to="/login"
                  className={`notranslate rounded-xl px-4 py-2 text-sm transition-all duration-200 ${
                    location.pathname === "/login"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#070b14]"
                      : "border border-slate-700/80 bg-slate-800/40 text-slate-200 font-semibold hover:border-slate-500 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  translate="no"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className={`notranslate rounded-xl px-5 py-2 text-sm transition-all duration-200 ${
                    location.pathname === "/signup"
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#070b14]"
                      : location.pathname === "/login"
                      ? "border border-slate-700/80 bg-slate-800/40 text-slate-300 font-semibold hover:border-slate-500 hover:text-white"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm shadow-amber-500/20 hover:brightness-110 hover:shadow-amber-500/30"
                  }`}
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/40 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenu ? (
                <IoClose className="text-[22px]" />
              ) : (
                <IoMenu className="text-[22px]" />
              )}
            </button>
          </div>
        </div>

        {/* ===============================================================
            MOBILE MENU
        =============================================================== */}

        {mobileMenu && (
          <div className="pb-4 lg:hidden">
            <div className="space-y-1 rounded-2xl border border-slate-800 bg-[#0d1424] p-2.5 shadow-2xl">
              {/* Home */}
              <Link
                to={isAdvocate ? "/advocate/dashboard" : "/"}
                onClick={handleMobileNavigation}
                className={mobileNavItemClass(
                  isAdvocate ? "/advocate/dashboard" : "/",
                )}
              >
                <span>{isAdvocate ? "Dashboard" : "Home"}</span>
              </Link>

              {/* Find Lawyer */}
              {!isAdvocate && (
                <Link
                  to="/find-lawyer"
                  onClick={handleMobileNavigation}
                  className={mobileNavItemClass("/find-lawyer")}
                >
                  <span>Find Lawyer</span>
                </Link>
              )}

              {/* Legal Hub - Public */}
              <Link
                to="/legal-hub"
                onClick={handleMobileNavigation}
                className={mobileNavItemClass("/legal-hub")}
              >
                <span>Legal Hub</span>
              </Link>

              {/* Legal Assistant - Protected */}
              {loggedIn ? (
                <Link
                  to="/legal-assistant"
                  onClick={handleMobileNavigation}
                  className={mobileNavItemClass("/legal-assistant")}
                >
                  <span>Legal Assistant</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation("/legal-assistant")}
                  className={mobileNavItemClass("/legal-assistant")}
                >
                  <span>Legal Assistant</span>
                </button>
              )}

              {/* My Bookings - Protected */}
              {!isAdvocate &&
                !isAdmin &&
                (loggedIn ? (
                  <Link
                    to="/bookings"
                    onClick={handleMobileNavigation}
                    className={mobileNavItemClass("/bookings")}
                  >
                    <span>My Bookings</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation("/bookings")}
                    className={mobileNavItemClass("/bookings")}
                  >
                    <span>My Bookings</span>
                  </button>
                ))}

              {/* My Payments - Protected */}
              {!isAdvocate &&
                !isAdmin &&
                (loggedIn ? (
                  <Link
                    to="/payments"
                    onClick={handleMobileNavigation}
                    className={mobileNavItemClass("/payments")}
                  >
                    <span>My Payments</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleProtectedNavigation("/payments")}
                    className={mobileNavItemClass("/payments")}
                  >
                    <span>My Payments</span>
                  </button>
                ))}

              {/* Messages - Protected */}
              {loggedIn ? (
                <Link
                  to={isAdvocate ? "/advocate/messages" : "/messages"}
                  onClick={handleMobileNavigation}
                  className={mobileNavItemClass(
                    isAdvocate ? "/advocate/messages" : "/messages",
                  )}
                >
                  <span>Messages</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation("/messages")}
                  className={mobileNavItemClass("/messages")}
                >
                  <span>Messages</span>
                </button>
              )}

              <div className="my-2.5 h-px bg-slate-800" />

              <LanguageTranslator mobile />

              {/* =========================================================
                  MOBILE AUTH
              ========================================================= */}

              {!authLoading && loggedIn && (
                <>
                  <div className="my-2.5 h-px bg-slate-800" />

                  <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800">
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
                        <FaRegUser className="text-[18px] text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-200">
                        {user?.name || user?.fullName || user?.email || "User"}
                      </p>

                      <p className="text-xs text-amber-400/90 font-medium">
                        {isAdvocate ? "Advocate" : "Client"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={getProfileRoute()}
                    onClick={handleMobileNavigation}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
                  >
                    <FaRegUser className="shrink-0 text-base text-slate-400" />
                    <span>Profile</span>
                  </Link>

                  {isAdvocate ? (
                    <Link
                      to="/advocate/dashboard"
                      onClick={handleMobileNavigation}
                      className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
                    >
                      <FaScaleBalanced className="shrink-0 text-base text-amber-400" />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      to="/saved-lawyers"
                      onClick={handleMobileNavigation}
                      className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
                    >
                      <FaRegBookmark className="shrink-0 text-base text-slate-400" />
                      <span>Saved Lawyers</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <IoLogOutOutline className="shrink-0 text-lg font-bold" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {!authLoading && !loggedIn && (
                <>
                  <div className="my-2.5 h-px bg-slate-800" />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={handleMobileNavigation}
                      className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm transition-all ${
                        location.pathname === "/login"
                          ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400 ring-offset-1 ring-offset-[#0d1424]"
                          : "border border-slate-700/80 bg-slate-800/60 font-semibold text-slate-200 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      Login
                    </Link>

                    <Link
                      to="/signup"
                      onClick={handleMobileNavigation}
                      className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm transition-all ${
                        location.pathname === "/signup"
                          ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400 ring-offset-1 ring-offset-[#0d1424]"
                          : location.pathname === "/login"
                          ? "border border-slate-700/80 bg-slate-800/60 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 font-bold text-slate-950 hover:brightness-110 shadow-sm shadow-amber-500/20"
                      }`}
                    >
                      Sign Up
                    </Link>
                  </div>
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
