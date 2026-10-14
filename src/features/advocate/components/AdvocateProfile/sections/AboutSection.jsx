import React from "react";

import { formatTagLabel } from "../utils/advocateProfileUtils";

/**
 * NOTE: the fallback prose below is preserved exactly as it exists today.
 * When `professionalSummary` is empty the UI generates a biography from the
 * advocate's numbers. That is a content-behaviour question, deliberately left
 * untouched by this structural refactor — see the notes.
 */
export default function AboutSection({
  advocateName,
  professionalSummary,
  yearsOfExperience,
  casesSolved,
  practiceAreas,
  courts,
}) {
  return (
    <div
      id="about"
      className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 scroll-mt-24"
    >
      <h2 className="text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
        About
      </h2>

      <div className="space-y-4 text-slate-600 leading-relaxed text-sm sm:text-base">
        <p>
          {professionalSummary ||
            `A distinguished legal practitioner with over ${yearsOfExperience} years of exemplary service in the Indian judicial system. Specializing in ${
              practiceAreas.slice(0, 2).map(formatTagLabel).join(" and ") ||
              "various legal matters"
            }, ${advocateName} has built a reputation for meticulous preparation and effective advocacy.`}
        </p>

        <p>
          Having successfully argued over {casesSolved} cases in{" "}
          {courts.slice(0, 2).join(" and ") || "various courts"}, they combine
          deep theoretical knowledge with practical courtroom strategy. Their
          approach is client-centric, ensuring that every legal avenue is
          explored to protect rights and secure favorable outcomes.
        </p>
      </div>
    </div>
  );
}
