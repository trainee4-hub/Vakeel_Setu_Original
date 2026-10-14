import React from "react";
import { FaGraduationCap } from "react-icons/fa";

/** Only renders when the backend actually provides advocate.education. */
export default function EducationSection({ educationList }) {
  if (educationList.length === 0) return null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
        <FaGraduationCap
          className="text-amber-500 text-xl shrink-0"
          aria-hidden="true"
        />
        Education
      </h2>

      <div className="relative pl-7 space-y-6 before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
        {educationList.map((edu, idx) => (
          <div key={idx} className="relative">
            <span className="absolute -left-7 top-1.5 size-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />

            <h4 className="font-bold text-slate-900 text-sm">
              {edu.degree || edu.title}
            </h4>

            <p className="text-sm text-slate-500">
              {edu.university || edu.institution}
            </p>

            {(edu.year || edu.graduationYear) && (
              <span className="text-xs font-semibold text-amber-600">
                {edu.year || edu.graduationYear}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}