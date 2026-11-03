import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiLock,
  FiPhoneCall,
  FiShield,
  FiStar,
  FiVideo,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { FaScaleBalanced } from "react-icons/fa6";

import LegalConsultationIntakeCard from "./LegalConsultationIntakeCard";

const TRUST_ICON_MAP = {
  shield: FiShield,
  clock: FiClock,
  lock: FiLock,
  phone: FiPhoneCall,
  verified: MdVerified,
  video: FiVideo,
};

const ServiceHero = ({
  title,
  h1,
  shortIntro,
  categoryTitle,
  categorySlug,
  trustChips = [],
}) => {
  const handleOpenConsultation = useCallback(() => {
    const eventDetail = { handled: false };
    const customEvent = new CustomEvent("vakeelsetu:open-consultancy", {
      bubbles: true,
      cancelable: true,
      detail: eventDetail,
    });
    window.dispatchEvent(customEvent);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#070b14] py-12 sm:py-16 text-white">
      {/* Background ambient lighting and fine technical grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.14)_0%,rgba(7,11,20,0.85)_55%,#070b14_100%)]" />
        <div className="absolute -left-20 top-1/2 h-72 w-72 rounded-full bg-slate-800/30 blur-3xl" />
        <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* =========================================================
              LEFT COLUMN (Hero Content & Trust Assurance)
          ========================================================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Category Chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <FaScaleBalanced className="text-xs text-amber-400" />
              <Link
                to={`/legal-services/${categorySlug}`}
                className="hover:text-amber-200 hover:underline transition-colors"
              >
                {categoryTitle}
              </Link>
              <span className="text-amber-400/50">•</span>
              <span>Statutory Legal Service</span>
            </div>

            {/* H1 Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {h1 || title}
            </h1>

            {/* Short Intro Line — Typography matching Reference Image 4 */}
            <p className="text-sm sm:text-base text-slate-300/90 font-normal leading-[1.8] tracking-normal max-w-2xl">
              {shortIntro}
            </p>

            {/* Trust Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {trustChips.map((chip, index) => {
                const IconComponent = TRUST_ICON_MAP[chip.icon] || FiCheckCircle;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-sm"
                  >
                    <IconComponent className="text-amber-400 text-sm shrink-0" />
                    <span>{chip.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Guarantee Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-900/60 border border-slate-800 px-2.5 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-bold text-emerald-400">180+ Advocates Online</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <FiClock className="text-amber-400" />
                <span>15-Min Guaranteed Callback</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <FiLock className="text-amber-400" />
                <span>100% Confidential</span>
              </div>
            </div>

            {/* Consultation Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenConsultation}
                className="flex items-center gap-2.5 rounded-xl bg-amber-500 px-6 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:bg-amber-400 hover:shadow-amber-500/30 active:scale-95"
              >
                <FiPhoneCall className="text-base text-slate-950" />
                <span>Get Instant Consultation</span>
              </button>

              <Link
                to="/find-lawyer"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <span>Find Verified Advocates</span>
              </Link>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: SMART LEGAL INTAKE CARD
          ========================================================= */}
          <div className="lg:col-span-5">
            <LegalConsultationIntakeCard
              defaultCategory={categoryTitle}
              defaultServiceTitle={title}
              compact={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceHero;
