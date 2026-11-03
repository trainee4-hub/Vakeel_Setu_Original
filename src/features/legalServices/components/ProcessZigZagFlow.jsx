import React from "react";
import {
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiFileText,
  FiSend,
  FiSearch,
} from "react-icons/fi";
import {
  HiOutlineDocumentText,
  HiOutlineNewspaper,
  HiOutlineIdentification,
  HiOutlineArrowUpTray,
  HiOutlineUserGroup,
  HiOutlineBuildingLibrary,
} from "react-icons/hi2";
import { MdGavel, MdOutlineVerified } from "react-icons/md";
import { FaScaleBalanced, FaBuildingColumns, FaUserCheck, FaHandshake } from "react-icons/fa6";

const STEP_FALLBACK_ICONS = [
  HiOutlineDocumentText,    // Step 1: Document Scrutiny
  FiEdit3,                  // Step 2: Legal Drafting
  HiOutlineNewspaper,       // Step 3: Public Notice / Mediation / Dispatch
  HiOutlineArrowUpTray,     // Step 4: Portal Filing / Submission
  HiOutlineIdentification,  // Step 5: Officer Audit / Personal Verification
  MdOutlineVerified,        // Step 6: Final Gazette / Decree
];

// Curated vibrant themes matching the reference infographic
const COLUMN_THEMES = [
  {
    name: "amber",
    hex: "#f59e0b",
    darkHex: "#d97706",
  },
  {
    name: "pink",
    hex: "#db2777",
    darkHex: "#be185d",
  },
  {
    name: "purple",
    hex: "#7c3aed",
    darkHex: "#6d28d9",
  },
  {
    name: "blue",
    hex: "#1d4ed8",
    darkHex: "#1e40af",
  },
  {
    name: "cyan",
    hex: "#0284c7",
    darkHex: "#0369a1",
  },
  {
    name: "emerald",
    hex: "#059669",
    darkHex: "#047857",
  },
  {
    name: "orange",
    hex: "#ea580c",
    darkHex: "#c2410c",
  },
  {
    name: "indigo",
    hex: "#4f46e5",
    darkHex: "#4338ca",
  },
];

// Domain-Aware Legal Step Icon Resolver
const resolveStepIcon = (step, idx) => {
  const text = `${step?.tag || ""} ${step?.title || ""} ${step?.description || ""}`.toLowerCase();

  // 1. Newspaper Public Notice / Gazette Advertisement / Media Journal
  if (
    text.includes("newspaper") ||
    text.includes("public notice") ||
    text.includes("advertisement") ||
    text.includes("journal notice") ||
    text.includes("publication")
  ) {
    return HiOutlineNewspaper;
  }

  // 2. Physical In-person / Officer / Biometric / Appearance Verification / Witness
  if (
    text.includes("physical") ||
    text.includes("in-person") ||
    text.includes("officer verification") ||
    text.includes("officer audit") ||
    text.includes("biometric") ||
    text.includes("witness") ||
    text.includes("appearance") ||
    text.includes("identification")
  ) {
    return HiOutlineIdentification;
  }

  // 3. Official Gazette / Government Certificate / CoI / Verified Trademark / Seal
  if (
    text.includes("gazette") ||
    text.includes("certified") ||
    text.includes("certificate") ||
    text.includes("coi") ||
    text.includes("trademark registration") ||
    text.includes("incorporation")
  ) {
    return MdOutlineVerified;
  }

  // 4. Portal Upload / Online Submission / e-Filing / SPICe+ / e-District / Saral
  if (
    text.includes("portal") ||
    text.includes("submission") ||
    text.includes("e-filing") ||
    text.includes("upload") ||
    text.includes("spice+") ||
    text.includes("saral")
  ) {
    return HiOutlineArrowUpTray;
  }

  // 5. Affidavit / Drafting / Legal Notice / Plaint / Deed / Petition / MoU / Charter
  if (
    text.includes("draft") ||
    text.includes("affidavit") ||
    text.includes("deed") ||
    text.includes("petition") ||
    text.includes("mou") ||
    text.includes("customiz") ||
    text.includes("stamp paper")
  ) {
    return FiEdit3;
  }

  // 6. Court / Judge / Arguments / Criminal / Bench Hearing / Quashing / Trial
  if (
    text.includes("court") ||
    text.includes("magistrate") ||
    text.includes("bench") ||
    text.includes("judge") ||
    text.includes("hearing") ||
    text.includes("bail") ||
    text.includes("quash") ||
    text.includes("trial")
  ) {
    return MdGavel;
  }

  // 7. Decree / Compensation / Recovery / Order / Law Balance / Mediation
  if (
    text.includes("decree") ||
    text.includes("award") ||
    text.includes("compensation") ||
    text.includes("restitution") ||
    text.includes("settle") ||
    text.includes("cause of action")
  ) {
    return FaScaleBalanced;
  }

  // 8. Dispatch / Postal / Speed Post / Registered Post / Notice Served
  if (
    text.includes("dispatch") ||
    text.includes("speed post") ||
    text.includes("registered post") ||
    text.includes("send") ||
    text.includes("mail")
  ) {
    return FiSend;
  }

  // 9. Scrutiny / Audit / Search / Verification / Return Memo
  if (
    text.includes("scrutiny") ||
    text.includes("search") ||
    text.includes("audit") ||
    text.includes("verification") ||
    text.includes("memo") ||
    text.includes("due diligence") ||
    text.includes("fir")
  ) {
    return HiOutlineDocumentText;
  }

  // 10. Cure period / Cooling-off / Waiting period
  if (
    text.includes("cure") ||
    text.includes("cooling") ||
    text.includes("limitation") ||
    text.includes("statutory period")
  ) {
    return FiClock;
  }

  return STEP_FALLBACK_ICONS[idx % STEP_FALLBACK_ICONS.length];
};

const ProcessZigZagFlow = ({ steps = [] }) => {
  if (!steps || steps.length === 0) return null;

  const totalSteps = steps.length;
  const isFewerSteps = totalSteps <= 4;

  // Dynamic layout & typography calibrated to step count (Point 5)
  // When steps are fewer (<= 4), cards are wider so title and text naturally scale up
  const containerHeight = isFewerSteps ? "485px" : "505px";
  const pillarHeight = isFewerSteps ? "h-[280px]" : "h-[295px]";
  const pinHeight = isFewerSteps ? "h-[145px]" : "h-[160px]";
  const pinLineHeight = isFewerSteps ? "h-12" : "h-14";

  const titleClass = isFewerSteps
    ? "text-sm sm:text-[15px] md:text-base font-black text-white leading-snug drop-shadow-xs"
    : "text-[12px] sm:text-[13px] font-black text-white leading-snug drop-shadow-xs";

  const descClass = isFewerSteps
    ? "text-[11.5px] sm:text-xs md:text-[13px] text-white/95 font-medium leading-relaxed mt-1.5"
    : "text-[10px] sm:text-[10.5px] text-white/95 font-medium leading-relaxed mt-1";

  const tagClass = isFewerSteps
    ? "inline-block rounded-full bg-white/25 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs backdrop-blur-xs"
    : "inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs backdrop-blur-xs";

  const iconOuterClass = isFewerSteps
    ? "flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full p-1 shadow-md transition-transform group-hover:scale-105"
    : "flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full p-1 shadow-md transition-transform group-hover:scale-105";

  const iconInnerClass = isFewerSteps
    ? "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white shadow-inner"
    : "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-inner";

  const iconCompClass = isFewerSteps ? "text-xl sm:text-2xl" : "text-lg sm:text-xl";

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP VIEW: FULL-WIDTH PILLAR CHEVRON ZIG-ZAG
             Spans 100% width cleanly without any horizontal scrollbar
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:block w-full py-4">
        <div
          className="w-full grid gap-3 sm:gap-4 items-stretch"
          style={{
            gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
          }}
        >
          {steps.map((step, idx) => {
            const isOdd = idx % 2 === 0; // 0, 2, 4 (Steps 1, 3, 5): Top Pin, Bottom Pillar
            const theme = COLUMN_THEMES[idx % COLUMN_THEMES.length];
            const IconComp = resolveStepIcon(step, idx);
            const stepNumber = String(step.step || idx + 1).padStart(2, "0");
            const stepTag = step.tag || `STAGE 0${idx + 1}`;

            return (
              <div
                key={step.step || idx}
                className="w-full flex flex-col items-center justify-between transition-transform duration-300 hover:-translate-y-1.5 group"
                style={{ height: containerHeight }}
              >
                {/* ═══════════════════════════════════════════════════
                    IF ODD (Steps 1, 3, 5...):
                    Top Pin ➔ Chevron (h-[44px]) ➔ Bottom Pillar
                ═══════════════════════════════════════════════════ */}
                {isOdd ? (
                  <>
                    {/* TOP SECTION: Pin Line with Large Bold Step Number */}
                    <div
                      className={`flex flex-col items-center justify-end w-full ${pinHeight} pb-1.5`}
                    >
                      <span
                        className="text-2xl sm:text-3xl font-black leading-none tracking-tight"
                        style={{ color: theme.hex }}
                      >
                        {stepNumber}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                        STEP
                      </span>
                      {/* Vertical Pin Line */}
                      <div
                        className={`w-0.5 ${pinLineHeight} mt-1.5 transition-all group-hover:h-16`}
                        style={{ backgroundColor: theme.hex }}
                      />
                      {/* Teardrop Pin Head */}
                      <div
                        className="w-3 h-3 rounded-full -mt-0.5 shadow-sm"
                        style={{ backgroundColor: theme.hex }}
                      />
                    </div>

                    {/* MIDDLE SECTION: Interlocking Chevron (Points UP) */}
                    <div className="w-full relative z-10 -my-0.5">
                      <div
                        className="w-full h-11 flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-widest shadow-md"
                        style={{
                          backgroundColor: theme.hex,
                          clipPath:
                            "polygon(50% 0%, 100% 28%, 100% 100%, 50% 72%, 0% 100%, 0% 28%)",
                        }}
                      >
                        <div className="flex items-center justify-center gap-1 opacity-90">
                          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                          <span className="h-2 w-2 rounded-full bg-white shadow-xs" />
                          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM SECTION: Full-Height Rounded Pillar with Balanced Tight Gap */}
                    <div
                      className={`w-full flex flex-col justify-between rounded-b-[36px] pt-4 pb-4 px-3 text-white shadow-lg transition-shadow group-hover:shadow-xl ${pillarHeight}`}
                      style={{ backgroundColor: theme.hex }}
                    >
                      {/* Text Content Area */}
                      <div className="text-center px-1 space-y-2">
                        <span className={tagClass}>
                          {stepTag}
                        </span>
                        <h4 className={titleClass}>
                          {step.title.replace(/^Step\s*\d+:\s*/i, "")}
                        </h4>
                        <p className={descClass}>
                          {step.description}
                        </p>
                      </div>

                      {/* Bottom Circular Double-Ring Icon Badge - Reduced Gap */}
                      <div className="mt-2.5 flex justify-center">
                        <div
                          className={iconOuterClass}
                          style={{ backgroundColor: theme.darkHex }}
                        >
                          <div className={iconInnerClass}>
                            <IconComp
                              className={iconCompClass}
                              style={{ color: theme.hex }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ═══════════════════════════════════════════════════
                      IF EVEN (Steps 2, 4, 6...):
                      Top Pillar ➔ Chevron (h-[44px]) ➔ Bottom Pin
                  ═══════════════════════════════════════════════════ */
                  <>
                    {/* TOP SECTION: Full-Height Rounded Pillar with Balanced Tight Gap */}
                    <div
                      className={`w-full flex flex-col justify-between rounded-t-[36px] pt-4 pb-4 px-3 text-white shadow-lg transition-shadow group-hover:shadow-xl ${pillarHeight}`}
                      style={{ backgroundColor: theme.hex }}
                    >
                      {/* Top Circular Double-Ring Icon Badge - Reduced Gap */}
                      <div className="mb-2.5 flex justify-center">
                        <div
                          className={iconOuterClass}
                          style={{ backgroundColor: theme.darkHex }}
                        >
                          <div className={iconInnerClass}>
                            <IconComp
                              className={iconCompClass}
                              style={{ color: theme.hex }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Text Content Area */}
                      <div className="text-center px-1 space-y-2">
                        <span className={tagClass}>
                          {stepTag}
                        </span>
                        <h4 className={titleClass}>
                          {step.title.replace(/^Step\s*\d+:\s*/i, "")}
                        </h4>
                        <p className={descClass}>
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* MIDDLE SECTION: Interlocking Chevron (Points DOWN) */}
                    <div className="w-full relative z-10 -my-0.5">
                      <div
                        className="w-full h-11 flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-widest shadow-md"
                        style={{
                          backgroundColor: theme.hex,
                          clipPath:
                            "polygon(50% 28%, 100% 0%, 100% 72%, 50% 100%, 0% 72%, 0% 0%)",
                        }}
                      >
                        <div className="flex items-center justify-center gap-1 opacity-90">
                          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                          <span className="h-2 w-2 rounded-full bg-white shadow-xs" />
                          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM SECTION: Pin Line with Large Bold Step Number */}
                    <div
                      className={`flex flex-col items-center justify-start w-full ${pinHeight} pt-1.5`}
                    >
                      {/* Teardrop Pin Head */}
                      <div
                        className="w-3 h-3 rounded-full -mb-0.5 shadow-sm"
                        style={{ backgroundColor: theme.hex }}
                      />
                      {/* Vertical Pin Line */}
                      <div
                        className={`w-0.5 ${pinLineHeight} mb-1.5 transition-all group-hover:h-16`}
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        STEP
                      </span>
                      <span
                        className="text-2xl sm:text-3xl font-black leading-none tracking-tight mt-0.5"
                        style={{ color: theme.hex }}
                      >
                        {stepNumber}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE & TABLET VIEW: CLEAN VERTICAL PILLAR CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden space-y-3.5 py-2">
        {steps.map((step, idx) => {
          const theme = COLUMN_THEMES[idx % COLUMN_THEMES.length];
          const IconComp = resolveStepIcon(step, idx);
          const stepNumber = String(step.step || idx + 1).padStart(2, "0");
          const stepTag = step.tag || `STAGE 0${idx + 1}`;

          return (
            <div
              key={step.step || idx}
              className="rounded-3xl overflow-hidden shadow-md border border-slate-100"
            >
              {/* Header Strip with Color and Step badge */}
              <div
                className="px-4 py-3 text-white flex items-center justify-between"
                style={{ backgroundColor: theme.hex }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md">
                    <IconComp className="text-lg" style={{ color: theme.hex }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                      STEP {stepNumber}
                    </span>
                    <h4 className="text-xs font-black text-white leading-tight">
                      {step.title.replace(/^Step\s*\d+:\s*/i, "")}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-black/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                    {stepTag}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white p-4">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {step.description}
                </p>

                {step.milestone && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <FiCheckCircle className="text-xs shrink-0" />
                    <span>{step.milestone}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessZigZagFlow;
