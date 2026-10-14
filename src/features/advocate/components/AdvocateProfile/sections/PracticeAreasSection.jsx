import React from "react";
import { BiCategoryAlt } from "react-icons/bi";
import { FaLandmark } from "react-icons/fa";

import { formatTagLabel } from "../utils/advocateProfileUtils";

/**
 * Practice Areas AND Courts Practiced deliberately live in one component:
 * they share the single `id="practice-areas"` anchor that the section nav
 * targets. Splitting them would break that navigation.
 */
export default function PracticeAreasSection({ practiceAreas, courts }) {
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
            practiceAreas.map((area, idx) => (
              <span
                key={idx}
                className="
                  w-fit
                  px-3 py-2
                  rounded-xl
                  bg-amber-50
                  border border-amber-200
                  text-amber-700
                  text-xs
                  font-bold
                  whitespace-nowrap
                "
              >
                {formatTagLabel(area)}
              </span>
            ))
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
            courts.map((court, idx) => (
              <span
                key={idx}
                className="
                  w-fit
                  inline-flex
                  items-center
                  gap-1.5
                  px-3 py-2
                  rounded-xl
                  bg-emerald-50
                  border border-emerald-200
                  text-emerald-700
                  text-xs
                  font-bold
                  whitespace-nowrap
                "
              >
                <FaLandmark
                  className="shrink-0 text-sm"
                  aria-hidden="true"
                />

                {court}
              </span>
            ))
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