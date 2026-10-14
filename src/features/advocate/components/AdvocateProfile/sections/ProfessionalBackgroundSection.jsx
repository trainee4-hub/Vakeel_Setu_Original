import React from "react";

import {
  FaAward,
  FaBriefcase,
  FaGavel,
  FaUsers,
} from "react-icons/fa";

import { MdVerified } from "react-icons/md";
import { RiHistoryLine } from "react-icons/ri";

/**
 * Experience, awards, memberships and bar council registration. Fully
 * data-driven — each sub-block renders only when it genuinely has data, and
 * the whole section is skipped when none of them do.
 */
export default function ProfessionalBackgroundSection({
  experienceList,
  awards,
  memberships,
  barCouncilNumber,
  locationStr,
}) {
  const hasAnything =
    experienceList.length > 0 ||
    awards.length > 0 ||
    memberships.length > 0 ||
    Boolean(barCouncilNumber);

  if (!hasAnything) return null;

  return (
    <section
      id="education-experience"
      className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="size-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <RiHistoryLine
            className="text-2xl"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Professional Background
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Experience, memberships, awards and bar council details
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Professional Experience */}
        {experienceList.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaBriefcase
                className="text-[20px] text-amber-600"
                aria-hidden="true"
              />

              <h3 className="text-base font-bold text-slate-900">
                Professional Experience
              </h3>
            </div>

            <div className="space-y-4">
              {experienceList.map((exp, idx) => (
                <div
                  key={idx}
                  className="relative pl-6 border-l-2 border-amber-100"
                >
                  <div className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-amber-500 ring-4 ring-amber-50" />

                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {exp.designation}
                        </h4>

                        <p className="text-sm text-slate-600 mt-1">
                          {exp.organization}
                        </p>
                      </div>

                      {(exp.startYear || exp.endYear) && (
                        <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                          {exp.startYear || "—"} –{" "}
                          {exp.endYear || "Present"}
                        </span>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <FaAward
                className="text-[20px] text-amber-600"
                aria-hidden="true"
              />

              <h3 className="text-base font-bold text-slate-900">
                Awards
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {awards.map((award, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 shrink-0 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FaAward
                        className="text-[20px]"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {award.title}
                      </h4>

                      {award.organization && (
                        <p className="text-xs text-slate-500 mt-1">
                          {award.organization}
                        </p>
                      )}

                      {award.year && (
                        <span className="inline-block mt-2 text-[11px] font-semibold text-slate-400">
                          {award.year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memberships */}
        {memberships.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <FaUsers
                className="text-[20px] text-amber-600"
                aria-hidden="true"
              />

              <h3 className="text-base font-bold text-slate-900">
                Memberships
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberships.map((mem, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <MdVerified
                        className="text-[21px]"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {mem.name}
                      </h4>

                      {mem.year && (
                        <span className="inline-block mt-2 text-[11px] font-semibold text-slate-400">
                          Since {mem.year}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar Council */}
        {barCouncilNumber && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <FaGavel
                className="text-[20px] text-amber-600"
                aria-hidden="true"
              />

              <h3 className="text-base font-bold text-slate-900">
                Bar Council
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Registration Number
                  </p>

                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {barCouncilNumber}
                  </p>
                </div>

                {locationStr && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Jurisdiction
                    </p>

                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {locationStr}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}