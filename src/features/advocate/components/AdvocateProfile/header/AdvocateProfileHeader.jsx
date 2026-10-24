import React from "react";
import { MdVerified } from "react-icons/md";
import {
  FaMedal,
  FaAward,
  FaChartLine,
  FaMapMarkerAlt,
  FaLanguage,
  FaClock,
} from "react-icons/fa";

import AdvocateProfileActions from "./AdvocateProfileActions";
import StarRating from "../common/StarRating";
import {
  formatPracticeArea,
  formatTagLabel,
} from "../utils/advocateProfileUtils";

/**
 * Plain website-style profile header: no overlapping avatar, no dark app-style
 * banner — photo, info and stats sit side by side in one flat card, the way a
 * directory site lays out a listing header.
 *
 * No API calls live here. Like / Save state arrives entirely through props.
 */
export default function AdvocateProfileHeader({
  advocateName,
  profileImageUrl,
  practiceAreas,
  filledStars,
  hasReviews,
  avgRating,
  reviewsCount,
  yearsOfExperience,
  casesSolved,
  successRate,
  locationStr,
  languages,
  nextAvailableSlot,

  isOnline = false,

  isLiked,
  likeCount,
  isLikeLoading,
  likeError,
  canLike,
  viewerIsAdvocate,
  onLikeClick,

  isSaved,
  savedLawyerLoading,
  savingLawyer,
  savedLawyerError,
  canSave,
  onSaveClick,
}) {

        {/* ================= PHOTO ================= */}
return (
  <div className="p-6 sm:p-8">
    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">

      {/* ================= PHOTO ================= */}
      <div className="relative shrink-0 self-center">
        {/* Profile Image */}
        <div
          className={`
            h-32
            w-32
            overflow-hidden
            rounded-full
            border-[4px]
            bg-slate-50
            shadow-sm
            transition-colors
            duration-300
            ${
              isOnline
                ? "border-emerald-500"
                : "border-slate-300"
            }
          `}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={advocateName || "Advocate"}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";

                const fallback =
                  e.currentTarget.nextElementSibling;

                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}

          <div
            className="
              h-full
              w-full
              items-center
              justify-center
              bg-slate-100
            "
            style={{
              display: profileImageUrl
                ? "none"
                : "flex",
            }}
          >
            <span className="text-3xl font-bold text-slate-400">
              {advocateName?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
        </div>

        {/* Online / Offline Dot */}
        <div
          className="
            absolute
            bottom-[10px]
            right-[10px]
            z-20
            flex
            items-center
            justify-center
            rounded-full
            border-2
            border-white
            bg-white
            p-[2px]
            shadow-sm
          "
          title={isOnline ? "Online" : "Offline"}
          aria-label={isOnline ? "Online" : "Offline"}
        >
          {isOnline ? (
            <span className="relative flex h-4 w-4">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-75
                "
              />

              <span
                className="
                  relative
                  inline-flex
                  h-[0.80rem]
                  w-[0.80rem]
                  rounded-full
                  bg-emerald-500
                "
              />
            </span>
          ) : (
            <span
              className="
                h-[0.80rem]
                w-[0.80rem]
                rounded-full
                bg-slate-400
              "
            />
          )}
        </div>
      </div>

      {/* ================= PROFILE INFO ================= */}
      <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {advocateName}
                </h1>
                <span
                  title="Verified Advocate"
                  aria-label="Verified Advocate"
                  className="inline-flex items-center text-[#1D9BF0] shrink-0 transition-transform duration-150 hover:scale-110 cursor-default"
                >
                  <MdVerified className="text-[20px] sm:text-[22px]" />
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-500 font-medium mt-0.5">
                {formatPracticeArea(practiceAreas?.[0])}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2">
                <StarRating rating={filledStars} sizeClass="text-base" />

                <span className="text-sm font-bold text-slate-700">
                  {hasReviews ? avgRating.toFixed(1) : "—"}
                </span>

                <span className="text-xs text-slate-400">
                  {hasReviews
                    ? `(${reviewsCount} reviews)`
                    : "No Reviews"}
                </span>
              </div>
            </div>

            {/* ================= LIKE + SAVE ================= */}
            <AdvocateProfileActions
              // Like
              isLiked={isLiked}
              likeCount={likeCount}
              isLikeLoading={isLikeLoading}
              likeError={likeError}
              canLike={canLike}
              viewerIsAdvocate={viewerIsAdvocate}
              onLikeClick={onLikeClick}

              // Save
              isSaved={isSaved}
              savedLawyerLoading={savedLawyerLoading}
              savingLawyer={savingLawyer}
              savedLawyerError={savedLawyerError}
              canSave={canSave}
              onSaveClick={onSaveClick}
            />
          </div>

          {/* ================= FACT ROW ================= */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1.5 mt-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <FaMedal className="text-amber-500 text-base" />
              {yearsOfExperience}+ Years
            </span>

            <span className="text-slate-300">•</span>

            <span className="inline-flex items-center gap-1">
              <FaAward className="text-emerald-500 text-base" />
              {casesSolved} Cases Handled
            </span>

            {/* Only rendered when backend provides real won/total ratio */}
            {successRate != null && (
              <>
                <span className="text-slate-300">•</span>

                <span className="inline-flex items-center gap-1">
                  <FaChartLine className="text-emerald-500 text-base" />
                  {successRate}% Success Rate
                </span>
              </>
            )}

            <span className="text-slate-300">•</span>

            <span className="inline-flex items-center gap-1">
              <FaMapMarkerAlt className="text-amber-500 text-base" />
              {locationStr}
            </span>

            <span className="text-slate-300">•</span>

            <span className="inline-flex items-center gap-1">
              <FaLanguage className="text-amber-500 text-base" />
              {languages}
            </span>

            {/* Only rendered when backend exposes real next slot */}
            {nextAvailableSlot && (
              <>
                <span className="text-slate-300">•</span>

                <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                  <FaClock className="text-amber-500 text-base" />
                  Next Available: {nextAvailableSlot}
                </span>
              </>
            )}
          </div>

          {/* ================= PRACTICE AREA TAGS ================= */}
          {practiceAreas?.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
              {practiceAreas.slice(0, 4).map((area, idx) => (
                <span
                  key={`${String(area)}-${idx}`}
                  className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold"
                >
                  {formatTagLabel(area)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}