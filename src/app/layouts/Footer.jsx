import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiHeadphones,
  FiShield,
  FiHome,
  FiSearch,
  FiCalendar,
  FiMessageSquare,
  FiCpu,
  FiFileText,
  FiBookOpen,
  FiBell,
  FiLayers,
  FiCheckSquare,
  FiHelpCircle,
  FiGrid,
  FiBookmark,
  FiLifeBuoy,
} from "react-icons/fi";
import {
  FaBalanceScale,
  FaCheckCircle,
} from "react-icons/fa";

import { useAuth } from "../../features/auth";

const Footer = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const currentYear = new Date().getFullYear();

  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: path,
        },
      });
      return;
    }

    navigate(path);
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-slate-950 text-white">
      {/* =====================================================
          SUBTLE BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-amber-500/[0.025]
            blur-[90px]
          "
        />

        <div
          className="
            absolute
            -bottom-32
            -right-24
            h-72
            w-72
            rounded-full
            bg-blue-500/[0.018]
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            left-0
            right-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-amber-500/30
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}
      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-5
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            CTA
        ================================================= */}
        <div className="pt-8">
          <div
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/70
              px-6
              py-5
              transition-all
              duration-300
              ease-out
              hover:border-slate-700
              hover:bg-slate-900/80
              sm:px-7
              sm:py-5
            "
          >
            {/* CTA Glow */}
            <div
              className="
                pointer-events-none
                absolute
                -right-10
                -top-10
                h-24
                w-24
                rounded-full
                bg-amber-500/5
                blur-2xl
                transition-all
                duration-500
                group-hover:scale-125
                group-hover:bg-amber-500/[0.08]
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* CTA TEXT */}
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                      bg-amber-500
                      shadow-[0_0_6px_1px_rgba(251,191,36,0.7),0_0_16px_5px_rgba(251,191,36,0.35),0_0_24px_8px_rgba(251,191,36,0.15)]
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-amber-400
                    "
                  >
                    Legal Help, Simplified
                  </span>
                </div>

                <h2
                  className="
                    text-xl
                    font-bold
                    leading-tight
                    tracking-tight
                    text-white
                    sm:text-2xl
                  "
                >
                  Know your rights.
                  <span className="text-amber-500">
                    {" "}
                    Find the right advocate.
                  </span>
                </h2>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-5
                    text-slate-300
                    sm:text-sm
                  "
                >
                  Connect with trusted advocates and useful legal resources.
                </p>
              </div>

              {/* CTA BUTTON */}
              <Link
                to="/find-lawyer"
                className="
                  group/cta
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  bg-amber-500
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-slate-950
                  shadow-[0_6px_20px_rgba(245,158,11,0.12)]
                  transition-all
                  duration-300
                  ease-out
                  hover:-translate-y-0.5
                  hover:bg-amber-400
                  hover:shadow-[0_10px_28px_rgba(245,158,11,0.18)]
                  active:translate-y-0
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-amber-400
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-slate-950
                "
              >
                Find a Lawyer

                <FiArrowRight
                  className="
                    text-base
                    transition-transform
                    duration-300
                    ease-out
                    group-hover/cta:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN FOOTER CONTENT
        ================================================= */}
        <div
          className="
            grid
            grid-cols-1
            gap-10
            py-12
            sm:grid-cols-2
            sm:gap-x-12
            sm:gap-y-10
            lg:grid-cols-[2.2fr_1fr_1fr_1.15fr]
            lg:gap-x-14
            lg:gap-y-0
          "
        >
          {/* =================================================
              BRAND
          ================================================= */}
          <div className="min-w-0">
            {/* BRAND LOGO */}
            <Link
              to="/"
              className="
                group/logo
                flex
                items-center
                gap-2.5
                text-left
                rounded-lg
                outline-none
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-900
                  text-amber-500
                  transition-all
                  duration-300
                  ease-out
                  group-hover/logo:-translate-y-0.5
                  group-hover/logo:border-amber-500/30
                  group-hover/logo:bg-slate-800
                  group-hover/logo:shadow-[0_8px_20px_rgba(245,158,11,0.08)]
                "
              >
                <FaBalanceScale
                  className="
                    text-xl
                    transition-transform
                    duration-300
                    group-hover/logo:scale-110
                  "
                />
              </div>

              <div>
                <h3
                  className="
                    whitespace-nowrap
                    text-xl
                    font-bold
                    leading-none
                    tracking-tight
                    text-white
                  "
                >
                  Advocate
                  <span className="text-amber-500">Connect</span>
                </h3>

                <p
                  className="
                    mt-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-slate-300
                  "
                >
                  Legal Tech Excellence
                </p>
              </div>
            </Link>

            {/* BRAND DESCRIPTION */}
            <p
              className="
                mt-5
                max-w-sm
                text-xs
                leading-5
                text-slate-300
                sm:text-[13px]
              "
            >
              Making legal help easier to understand, easier to access and
              easier to connect with. Discover trusted advocates and useful
              legal resources in one place.
            </p>

            {/* TRUST BADGES */}
            <div className="mt-4 flex flex-wrap gap-2">
              <TrustBadge
                icon={FaCheckCircle}
                text="Trusted Platform"
                iconClass="text-emerald-500"
              />

              <TrustBadge
                icon={FiShield}
                text="Secure & Private"
                iconClass="text-amber-500"
              />
            </div>
          </div>

          {/* =================================================
              PLATFORM
          ================================================= */}
          <div className="min-w-0">
            <FooterHeading icon={FiGrid}>Platform</FooterHeading>

            <FooterNav ariaLabel="Platform">
              <FooterLink
                label="Home"
                to="/"
                icon={FiHome}
              />

              <FooterLink
                label="Find Lawyer"
                to="/find-lawyer"
                icon={FiSearch}
              />

              <FooterLink
                label="Bookings"
                onClick={() => handleProtectedNavigation("/bookings")}
                icon={FiCalendar}
              />

              <FooterLink
                label="Messages"
                onClick={() => handleProtectedNavigation("/messages")}
                icon={FiMessageSquare}
              />

              <FooterLink
                label="Legal Assistant"
                onClick={() => handleProtectedNavigation("/legal-assistant")}
                icon={FiCpu}
              />
            </FooterNav>
          </div>

          {/* =================================================
              RESOURCES
          ================================================= */}
          <div className="min-w-0">
            <FooterHeading icon={FiBookmark}>Resources</FooterHeading>

            <FooterNav ariaLabel="Resources">
              <FooterLink
                label="Rights"
                to="/legal-hub/rights"
                icon={FiShield}
              />

              <FooterLink
                label="Articles"
                to="/legal-hub/articles"
                icon={FiFileText}
              />

              <FooterLink
                label="Guides"
                to="/legal-hub/guides"
                icon={FiBookOpen}
              />

              <FooterLink
                label="Updates"
                to="/legal-hub/updates"
                icon={FiBell}
              />

              <FooterLink
                label="All Resources"
                to="/legal-hub"
                icon={FiLayers}
              />
            </FooterNav>
          </div>

          {/* =================================================
              LEGAL & SUPPORT
          ================================================= */}
          <div className="min-w-0">
            <FooterHeading icon={FiLifeBuoy}>Legal & Support</FooterHeading>

            <FooterNav ariaLabel="Legal and Support">
              <FooterLink
                label="Terms of Service"
                to="/terms"
                icon={FiCheckSquare}
              />

              <FooterLink
                label="Support"
                to="/help"
                icon={FiHelpCircle}
              />
            </FooterNav>

            {/* SUPPORT CARD */}
            <Link
              to="/help"
              className="
                group/support
                mt-3
                flex
                w-full
                max-w-[210px]
                items-center
                gap-2.5
                rounded-lg
                border
                border-slate-800
                bg-slate-900/60
                px-2.5
                py-2
                text-left
                transition-all
                duration-300
                ease-out
                hover:-translate-y-0.5
                hover:border-emerald-500/30
                hover:bg-slate-900
                hover:shadow-[0_8px_22px_rgba(16,185,129,0.06)]
                active:translate-y-0
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-emerald-500/40
              "
            >
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  bg-emerald-500/10
                  transition-all
                  duration-300
                  group-hover/support:bg-emerald-500/15
                "
              >
                <FiHeadphones
                  className="
                    text-sm
                    text-emerald-500
                    transition-transform
                    duration-300
                    group-hover/support:scale-110
                  "
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-300">
                  Need help?
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    font-semibold
                    text-amber-500
                    transition-colors
                    duration-300
                    group-hover/support:text-amber-400
                  "
                >
                  Visit Support Center
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}
        <div
          className="
            h-px
            bg-slate-900
            transition-colors
            duration-300
          "
        />

        {/* =================================================
            BOTTOM BAR
        ================================================= */}
        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-2
            py-2.5
            sm:flex-row
          "
        >
          <p
            className="
              text-[10px]
              font-medium
              text-slate-500
              text-center
              transition-colors
              duration-300
              sm:text-left
            "
          >
            © {currentYear} AdvocateConnect. All rights reserved.
          </p>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-medium
              text-slate-500
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-500
                shadow-[0_0_7px_rgba(16,185,129,0.35)]
              "
            />

            Platform Operational
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   FOOTER HEADING
============================================================ */

const FooterHeading = ({ icon: Icon, children }) => {
  return (
    <div className="flex items-center gap-2.5">
      {Icon && (
        <span
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-amber-500/25
            bg-gradient-to-br
            from-amber-500/15
            to-amber-500/5
            text-amber-400
            shadow-[0_0_12px_rgba(245,158,11,0.12)]
          "
          aria-hidden="true"
        >
          <Icon className="text-sm" />
        </span>
      )}
      <h4
        className="
          text-[11px]
          font-extrabold
          uppercase
          tracking-[0.16em]
          text-slate-200
        "
      >
        {children}
      </h4>
    </div>
  );
};

/* ============================================================
   FOOTER NAV
============================================================ */

const FooterNav = ({ children, ariaLabel }) => {
  return (
    <nav
      aria-label={ariaLabel}
      className="
        mt-4
        flex
        flex-col
        items-start
        gap-2.5
      "
    >
      {children}
    </nav>
  );
};

/* ============================================================
   FOOTER LINK
============================================================ */

const FooterLink = ({ label, to, onClick, icon: Icon }) => {
  const content = (
    <>
      {Icon && (
        <span
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-slate-800/90
            bg-slate-900/80
            text-slate-400
            transition-all
            duration-250
            ease-out
            group-hover/link:border-amber-500/30
            group-hover/link:bg-amber-500/10
            group-hover/link:text-amber-400
            group-hover/link:scale-105
          "
          aria-hidden="true"
        >
          <Icon className="text-xs transition-colors duration-250" />
        </span>
      )}
      <span className="transition-colors duration-250 group-hover/link:text-white">
        {label}
      </span>
    </>
  );

  const className =
    "group/link inline-flex items-center gap-2.5 text-left text-[13px] font-medium leading-5 text-slate-300 transition-all duration-250 ease-out hover:translate-x-1 focus:outline-none focus-visible:translate-x-1 focus-visible:text-amber-500";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
    >
      {content}
    </button>
  );
};

/* ============================================================
   TRUST BADGE
============================================================ */

const TrustBadge = ({
  icon,
  text,
  iconClass,
}) => {
  return (
    <div
      className="
        group/badge
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        border
        border-slate-800
        bg-slate-900/60
        px-2.5
        py-1.5
        text-[11px]
        font-medium
        text-slate-300
        transition-all
        duration-300
        ease-out
        hover:-translate-y-0.5
        hover:border-slate-700
        hover:bg-slate-900
      "
    >
      {React.createElement(icon, {
        className: `
          text-sm
          transition-transform
          duration-300
          group-hover/badge:scale-110
          ${iconClass}
        `,
      })}

      {text}
    </div>
  );
};

export default Footer;