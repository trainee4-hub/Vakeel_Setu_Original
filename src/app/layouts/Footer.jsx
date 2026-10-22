import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiHeadphones,
  FiShield,
} from "react-icons/fi";
import {
  FaBalanceScale,
  FaCheckCircle,
} from "react-icons/fa";

import { useAuth } from "../../features/auth";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleNavigate = (path) => {
    // Hash navigation
    if (path.includes("#")) {
      const [pathname, hash] = path.split("#");

      if (location.pathname === pathname) {
        const element = document.getElementById(hash);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        return;
      }

      navigate(path);
      return;
    }

    navigate(path);

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
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
              <button
                type="button"
                onClick={() => handleNavigate("/find-lawyer")}
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
              </button>
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
            <button
              type="button"
              onClick={() => handleNavigate("/")}
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
            </button>

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
            <FooterHeading>Platform</FooterHeading>

            <FooterNav ariaLabel="Platform">
              <FooterLink
                label="Home"
                onClick={() => handleNavigate("/")}
              />

              <FooterLink
                label="Find Lawyer"
                onClick={() => handleNavigate("/find-lawyer")}
              />

              <FooterLink
                label="Bookings"
                onClick={() => handleProtectedNavigation("/bookings")}
              />

              <FooterLink
                label="Messages"
                onClick={() => handleProtectedNavigation("/messages")}
              />

              <FooterLink
                label="Legal Assistant"
                onClick={() => handleProtectedNavigation("/legal-assistant")}
              />
            </FooterNav>
          </div>

          {/* =================================================
              RESOURCES
          ================================================= */}
          <div className="min-w-0">
            <FooterHeading>Resources</FooterHeading>

            <FooterNav ariaLabel="Resources">
              <FooterLink
                label="Rights"
                onClick={() => handleNavigate("/resources#rights")}
              />

              <FooterLink
                label="Articles"
                onClick={() => handleNavigate("/resources#articles")}
              />

              <FooterLink
                label="Guides"
                onClick={() => handleNavigate("/resources#guides")}
              />

              <FooterLink
                label="Updates"
                onClick={() => handleNavigate("/resources#updates")}
              />

              <FooterLink
                label="All Resources"
                onClick={() => handleNavigate("/resources")}
              />
            </FooterNav>
          </div>

          {/* =================================================
              LEGAL & SUPPORT
          ================================================= */}
          <div className="min-w-0">
            <FooterHeading>Legal & Support</FooterHeading>

            <FooterNav ariaLabel="Legal and Support">
              <FooterLink
                label="Privacy Policy"
                onClick={() => handleNavigate("/privacy-policy")}
              />

              <FooterLink
                label="Terms of Service"
                onClick={() => handleNavigate("/terms")}
              />

              <FooterLink
                label="Support"
                onClick={() => handleNavigate("/help")}
              />
            </FooterNav>

            {/* SUPPORT CARD */}
            <button
              type="button"
              onClick={() => handleNavigate("/help")}
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
            </button>
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

const FooterHeading = ({ children }) => {
  return (
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

const FooterLink = ({ label, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group/link
        block
        w-fit
        shrink-0
        p-0
        m-0
        whitespace-nowrap
        text-left
        text-[13px]
        font-medium
        leading-5
        text-slate-300
        transition-all
        duration-250
        ease-out
        hover:translate-x-1
        hover:text-white
        focus:outline-none
        focus-visible:translate-x-1
        focus-visible:text-amber-500
      "
    >
      {label}
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