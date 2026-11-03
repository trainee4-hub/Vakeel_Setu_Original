import React, { useCallback } from "react";
import {
  FiArrowUp,
  FiClock,
  FiHeadphones,
  FiPhone,
  FiShield,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { MdOutlineGavel, MdVerified } from "react-icons/md";
import { FaScaleBalanced } from "react-icons/fa6";

const LegalServicesIntakeSection = ({
  defaultCategory = "",
  defaultServiceTitle = "",
  className = "",
}) => {
  const handleScrollToForm = useCallback(() => {
    // Check if consultation card or hero intake form is in DOM
    const formElement = document.querySelector("#intro") || document.querySelector("form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const matterContext = defaultServiceTitle || defaultCategory;

  return (
    <section
      id="legal-intake"
      className={`relative overflow-hidden bg-[#070b14] py-16 sm:py-20 text-white ${className}`}
    >
      {/* Background ambient lighting and fine technical grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.12)_0%,rgba(7,11,20,0.92)_50%,#070b14_100%)]" />
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-slate-800/30 blur-3xl" />
        <div className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* =========================================================
            HEADER & TRUST MESSAGING (Centered, Full-Width)
        ========================================================= */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
            <MdVerified className="text-sm text-amber-400" />
            <span>India's Verified Advocate Network</span>
            <span className="text-amber-400/50">•</span>
            <span>100% Confidential</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
            Get Instant Legal Advice from{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              High Court & Supreme Court Advocates
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mx-auto max-w-2xl">
            Don't let legal uncertainty cost you time, rights, or money. Discuss your matter {matterContext ? `for ${matterContext} ` : ""}directly with verified Bar Council-enrolled advocates across 450+ court jurisdictions in India over secure phone or HD video.
          </p>

          {/* Live Online Advocates Badge + Action */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-bold text-white">180+ Advocates Online</span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-amber-400">
                <FiStar className="fill-amber-400 text-xs" />
                <span className="font-bold text-white">4.9 / 5</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleScrollToForm}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition active:scale-95"
            >
              <span>Connect with an Advocate</span>
              <FiArrowUp className="text-sm" />
            </button>
          </div>
        </div>

        {/* =========================================================
            4 PILLARS (Clean 4-Column Grid)
        ========================================================= */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition hover:border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <MdOutlineGavel className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Bar Council Verified</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified credentials & active practice</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition hover:border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FiShield className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Attorney Privilege</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">100% encrypted & confidential data</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition hover:border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FiClock className="text-xl" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">15-Min Response</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Fast-track callback with zero wait</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm transition hover:border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FaScaleBalanced className="text-lg" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Transparent Pricing</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Fixed rates without hidden surprises</p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM TRUST & STATISTICS BAR
        ========================================================= */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-10">
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FiUser className="text-xl" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-white">206+</p>
              <p className="text-[11px] text-slate-400 font-medium">Lawyers Online Now</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FiPhone className="text-xl" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-white">75+</p>
              <p className="text-[11px] text-slate-400 font-medium">Ongoing Client Calls</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FiHeadphones className="text-xl" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-white">14K+</p>
              <p className="text-[11px] text-slate-400 font-medium">Satisfied Citizens</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FiStar className="text-xl fill-amber-400" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-white">4.9 / 5</p>
              <p className="text-[11px] text-slate-400 font-medium">Verified Client Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegalServicesIntakeSection;
