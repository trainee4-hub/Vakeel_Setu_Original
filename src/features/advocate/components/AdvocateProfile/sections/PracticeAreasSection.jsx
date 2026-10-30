import React from "react";
import { BiCategoryAlt } from "react-icons/bi";
import { FaLandmark, FaAward } from "react-icons/fa";

import { formatTagLabel } from "../utils/advocateProfileUtils";

/**
 * Practice Areas AND Courts Practiced deliberately live in one component:
 * they share the single `id="practice-areas"` anchor that the section nav
 * targets. Splitting them would break that navigation.
 */
export default function PracticeAreasSection({
  practiceAreas = [],
  courts = [],
  bestPracticeArea,
  topCourtPractised,
}) {
  return (
    <div id="practice-areas" className="space-y-4 scroll-mt-16">
      {/* Practice Areas */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <BiCategoryAlt
            className="shrink-0 text-xl text-amber-500"
            aria-hidden="true"
          />

          <h3 className="text-base font-bold text-slate-900">
            Practice Areas
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {practiceAreas.length > 0 ? (
            practiceAreas.map((area, idx) => {
              const cleanArea = String(area || "").trim().toLowerCase();
              const cleanBest = String(
                bestPracticeArea ||
                  (practiceAreas.length > 0 ? practiceAreas[0] : "")
              )
                .trim()
                .toLowerCase();

              const isBestArea =
                Boolean(cleanBest) &&
                (cleanArea === cleanBest ||
                  cleanArea.replace(/\s+/g, "") ===
                    cleanBest.replace(/\s+/g, "") ||
                  cleanArea.replace(/_/g, " ") ===
                    cleanBest.replace(/_/g, " ") ||
                  cleanArea.includes(cleanBest) ||
                  cleanBest.includes(cleanArea));

              return isBestArea ? (
                <span
                  key={idx}
                  className="w-fit inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-amber-500/10 border border-amber-400 text-amber-900 text-xs font-extrabold whitespace-nowrap shadow-xs ring-1 ring-amber-400/30"
                >
                  <BiCategoryAlt
                    className="shrink-0 text-sm text-amber-600"
                    aria-hidden="true"
                  />
                  <span>{formatTagLabel(area)}</span>
                  <span className="rounded-full bg-amber-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    Top Area
                  </span>
                </span>
              ) : (
                <span
                  key={idx}
                  className="w-fit inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold whitespace-nowrap"
                >
                  <BiCategoryAlt
                    className="shrink-0 text-xs text-slate-400"
                    aria-hidden="true"
                  />
                  <span>{formatTagLabel(area)}</span>
                </span>
              );
            })
          ) : (
            <span className="text-sm text-slate-400">
              Not specified
            </span>
          )}
        </div>
      </div>

      {/* Courts Practiced */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <FaLandmark
            className="shrink-0 text-xl text-emerald-500"
            aria-hidden="true"
          />

          <h3 className="text-base font-bold text-slate-900">
            Courts Practiced
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {courts.length > 0 ? (
            courts.map((court, idx) => {
              const cleanCourt = String(court || "").trim().toLowerCase();
              const cleanTopCourt = String(topCourtPractised || "")
                .trim()
                .toLowerCase();
              const isBestCourt =
                Boolean(cleanTopCourt) &&
                (cleanCourt === cleanTopCourt ||
                  cleanCourt.replace(/\s+/g, "") ===
                    cleanTopCourt.replace(/\s+/g, "") ||
                  cleanCourt.includes(cleanTopCourt) ||
                  cleanTopCourt.includes(cleanCourt));

              return isBestCourt ? (
                <span
                  key={idx}
                  className="w-fit inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 via-emerald-50 to-emerald-500/10 border border-emerald-400 text-emerald-900 text-xs font-extrabold whitespace-nowrap shadow-xs ring-1 ring-emerald-400/30"
                >
                  <FaLandmark
                    className="shrink-0 text-sm text-emerald-600"
                    aria-hidden="true"
                  />
                  <span>{court}</span>
                  <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                    Top Court
                  </span>
                </span>
              ) : (
                <span
                  key={idx}
                  className="w-fit inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold whitespace-nowrap"
                >
                  <FaLandmark
                    className="shrink-0 text-xs text-slate-400"
                    aria-hidden="true"
                  />
                  <span>{court}</span>
                </span>
              );
            })
          ) : (
            <span className="text-sm text-slate-400">
              Not specified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}