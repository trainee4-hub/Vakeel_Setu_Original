import React, { useState } from "react";
import { MdVerified } from "react-icons/md";
import { FiArrowRight, FiMapPin, FiUsers } from "react-icons/fi";

import { formatTagLabel } from "../utils/advocateProfileUtils";

/**
 * Extract clean initials for fallback avatar (e.g. "Adv. Sanjay Gupta" -> "SG")
 */
function getInitials(name) {
  const parts = String(name || "")
    .replace(/^Adv\.?\s*/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format experience (e.g. "8 yrs")
 */
function getExperienceText(mate) {
  const exp = mate?.experienceYears ?? mate?.experience ?? null;
  if (exp === null || exp === undefined || exp === "") return null;
  const num = Number(exp);
  if (!Number.isFinite(num) || num < 0) return null;
  return `${num} ${num === 1 ? "yr" : "yrs"}`;
}

/**
 * Practice area label
 */
function getPracticeAreaText(mate) {
  const area =
    mate?.bestPracticeArea ||
    mate?.lawType ||
    mate?.specialization ||
    (Array.isArray(mate?.practiceAreas) && mate.practiceAreas[0]) ||
    null;

  if (!area) return "Advocate";
  return formatTagLabel(area);
}

/**
 * Individual Team Member Card (Public view)
 * PRIVACY: Absolutely no phone or email exposed.
 */
function TeamMemberCard({ mate, onViewMember }) {
  const [imageError, setImageError] = useState(false);

  const memberId = mate?.id || mate?._id || mate?.advocateId;
  const name = mate?.fullName || mate?.name || "Advocate";
  const photo =
    mate?.profilePhotoUrl ||
    mate?.profileImage ||
    mate?.avatar ||
    "";

  const practiceArea = getPracticeAreaText(mate);
  const experienceText = getExperienceText(mate);

  // Only accept explicit verification fields from API — never infer from status or barId
  const isVerified =
    typeof mate?.isVerified === "boolean"
      ? mate.isVerified
      : typeof mate?.verified === "boolean"
        ? mate.verified
        : false;

  const city = mate?.city ? String(mate.city).trim() : null;
  const state = mate?.state ? String(mate.state).trim() : null;
  const locationStr = [city, state].filter(Boolean).join(", ");

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`View ${name}'s public profile`}
      onClick={() => memberId && onViewMember(memberId)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && memberId) {
          e.preventDefault();
          onViewMember(memberId);
        }
      }}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40"
    >
      <div>
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            {photo && !imageError ? (
              <img
                src={photo}
                alt={name}
                onError={() => setImageError(true)}
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover ring-1 ring-slate-200/80 shadow-xs"
              />
            ) : (
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/70 font-bold text-xs sm:text-sm text-amber-800 shadow-xs">
                {getInitials(name)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                {name}
              </h3>
              {isVerified && (
                <span
                  title="Verified Advocate"
                  aria-label="Verified Advocate"
                  className="inline-flex items-center text-[#1D9BF0] shrink-0"
                >
                  <MdVerified className="text-[17px] sm:text-[18px]" />
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-xs font-semibold text-amber-700">
              {practiceArea}
            </p>

            {locationStr && (
              <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-400">
                <FiMapPin size={11} className="shrink-0 text-slate-400" />
                <span className="truncate">{locationStr}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Experience:
          </span>
          <span className="font-bold text-slate-800">
            {experienceText || "—"}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all">
          View Profile
          <FiArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}

/**
 * Public Profile "Our Team" Section
 * Renders team members of the viewed advocate.
 * Hides completely if the advocate has no team members.
 */
export default function TeamSection({ team, onViewMember }) {
  if (!Array.isArray(team) || team.length === 0) {
    return null;
  }

  // Filter out any invalid items
  const validTeam = team.filter((mate) => {
    const id = mate?.id || mate?._id || mate?.advocateId;
    return Boolean(id);
  });

  if (validTeam.length === 0) {
    return null;
  }

  return (
    <section
      id="team"
      aria-labelledby="our-team-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 scroll-mt-24 shadow-xs"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <FiUsers size={16} />
          </div>
          <h2
            id="our-team-heading"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Our Team
          </h2>
          <span className="inline-flex items-center justify-center rounded-full border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-xs font-bold text-amber-700">
            {validTeam.length} {validTeam.length === 1 ? "colleague" : "colleagues"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {validTeam.map((mate, index) => {
          const key = mate?.id || mate?._id || mate?.advocateId || index;
          return (
            <TeamMemberCard
              key={key}
              mate={mate}
              onViewMember={onViewMember}
            />
          );
        })}
      </div>
    </section>
  );
}
