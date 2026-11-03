import React, { useCallback } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { HiCurrencyRupee } from "react-icons/hi2";

const LegalConsultationCard = ({ serviceTitle = "Legal Services", className = "" }) => {
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
    <div className={`w-full max-w-[340px] mx-auto lg:mx-0 flex flex-col gap-3.5 ${className}`}>
      {/* ─────────────────────────────────────────────────────────────
          1. MAIN CARD (Dark Navy + Gold — Matching Reference)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-[#0a0f1d] p-5 sm:p-6 shadow-2xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-amber-500/10">
        {/* Subtle Ambient Background Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />

        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-2.5 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>180+ Advocates Online</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black text-amber-300">
            <FiStar className="fill-amber-400 text-amber-400 text-xs" />
            <span>Highly Rated</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mt-4">
          <h3 className="text-xl font-black text-white leading-tight tracking-tight">
            Talk to Enrolled Advocates{" "}
            <span className="relative inline-block text-amber-400 underline decoration-amber-400/70 underline-offset-4">
              Across India
            </span>
          </h3>
          <p className="mt-2 text-xs text-slate-300/80 leading-relaxed">
            Get professional legal consultation for <strong className="text-slate-100 font-semibold">{serviceTitle}</strong> — fast, secure & affordable.
          </p>
        </div>

        {/* 3 Core Trust Pillars */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/60 transition hover:border-slate-700">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-amber-400 shadow-inner">
              <FiUsers className="text-sm" />
            </div>
            <span className="text-xs font-bold text-slate-200">Verified Advocate Network</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/60 transition hover:border-slate-700">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-amber-400 shadow-inner">
              <FiShield className="text-sm" />
            </div>
            <span className="text-xs font-bold text-slate-200">100% Confidential & Secure</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-900/60 p-2.5 border border-slate-800/60 transition hover:border-slate-700">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-amber-400 shadow-inner">
              <HiCurrencyRupee className="text-base" />
            </div>
            <span className="text-xs font-bold text-slate-200">Clear & Transparent Pricing</span>
          </div>
        </div>

        {/* How It Works (Numbered Steps) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            HOW IT WORKS
          </p>
          <div className="mt-3 space-y-2.5 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                1
              </span>
              <span>Choose your legal issue</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                2
              </span>
              <span>Connect with an enrolled advocate</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                3
              </span>
              <span>Get timely legal consultation</span>
            </div>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="mt-6 space-y-2.5">
          <button
            type="button"
            onClick={handleOpenConsultation}
            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 bg-[length:200%_auto] px-4 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:bg-right hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Get Legal Consultation Now</span>
            <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <FiClock className="text-amber-400 text-xs" />
            <span>Average response time: <strong>5 minutes</strong></span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEPARATE USER RATING CARD (Matching Reference)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 border border-amber-200/70 shadow-sm">
              <FiStar className="fill-amber-400 text-amber-500 text-base" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900">4.3 / 5 Rating</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Based on 12,000+ reviews</p>
            </div>
          </div>

          <div className="flex text-amber-400 text-xs gap-0.5">
            <FiStar className="fill-amber-400" />
            <FiStar className="fill-amber-400" />
            <FiStar className="fill-amber-400" />
            <FiStar className="fill-amber-400" />
            <FiStar className="fill-amber-400" />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CONFIDENTIALITY PILL (Matching Reference)
      ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/70 px-3.5 py-3 shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-900">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-sm" />
          <span>Your information is 100% confidential and never shared.</span>
        </div>
      </div>
    </div>
  );
};

export default LegalConsultationCard;
