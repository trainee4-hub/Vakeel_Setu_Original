import React, { useCallback, useMemo } from "react";
import {
  FaGavel,
  FaLandmarkDome,
  FaLocationDot,
  FaStar,
} from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import {
  IoLanguageOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { useAuth } from "../../auth";
import AdvocateCardSkeleton from "./skeleton/AdvocateCardSkeleton";
import useAppLanguage from "@/hooks/useAppLanguage";
import { getBookLabel } from "@/utils/translationLabels";

const ChipIcon = () => (
  <FaGavel className="h-3 w-3 shrink-0 text-amber-600" />
);

export { AdvocateCardSkeleton };

const AdvocateCard = ({ advocate, onViewAdvocate }) => {
  /*
   * ============================================================
   * ACTUAL FIND-LAWYER API DATA
   * ============================================================
   */

  const id = advocate?.id;
  const fullName = advocate?.fullName;
  const profilePhotoUrl = advocate?.profilePhotoUrl;

  const experienceYears = advocate?.experienceYears;
  const casesHandled = advocate?.casesHandled;

  const practiceAreas = advocate?.practiceAreas;
  const bestPracticeArea = advocate?.bestPracticeArea;

  const courtPractice = advocate?.courtPractice;
  const topCourtPractised = advocate?.topCourtPractised;

  const languagesSpoken = advocate?.languagesSpoken;

  const state = advocate?.state;
  const city = advocate?.city;

  const videoCallChargePerMinute =
    advocate?.videoCallChargePerMinute;

  const voiceCallChargePerMinute =
    advocate?.voiceCallChargePerMinute;

  const offlineVisitingFee =
    advocate?.offlineVisitingFee;

  const averageRating = advocate?.averageRating;
  const totalReviews = advocate?.totalReviews;

  /*
   * IMPORTANT:
   * Find Lawyer API must return:
   *
   * isOnline: true | false
   *
   * If the field is missing, this safely becomes false.
   */
  const isOnline = advocate?.isOnline === true;

  const language = useAppLanguage();
  const { isLoggedIn } = useAuth();

  /*
   * ============================================================
   * RATING
   * ============================================================
   */

  const reviewCount = Number(totalReviews) || 0;

  const { hasRating, formattedRating } = useMemo(() => {
    const numericRating =
      averageRating !== null &&
      averageRating !== undefined &&
      averageRating !== ""
        ? Number(averageRating)
        : null;

    const validRating =
      numericRating !== null &&
      Number.isFinite(numericRating) &&
      reviewCount > 0;

    return {
      hasRating: validRating,
      formattedRating: validRating
        ? numericRating.toFixed(1)
        : null,
    };
  }, [averageRating, reviewCount]);

  /*
   * ============================================================
   * FEE
   * ============================================================
   */

  const feeValue = useMemo(() => {
    return (
      videoCallChargePerMinute ??
      voiceCallChargePerMinute ??
      offlineVisitingFee ??
      null
    );
  }, [
    videoCallChargePerMinute,
    voiceCallChargePerMinute,
    offlineVisitingFee,
  ]);

  const formattedFee = useMemo(() => {
    if (
      feeValue === null ||
      feeValue === undefined ||
      feeValue === ""
    ) {
      return null;
    }

    const numericFee = Number(feeValue);

    if (!Number.isFinite(numericFee)) {
      return null;
    }

    return numericFee.toLocaleString("en-IN");
  }, [feeValue]);

  /*
   * ============================================================
   * SAFE ARRAY DATA
   * ============================================================
   */

  const safePracticeAreas = Array.isArray(practiceAreas)
    ? practiceAreas
    : [];

  const safeCourtPractice = Array.isArray(courtPractice)
    ? courtPractice
    : [];

  const safeLanguages = Array.isArray(languagesSpoken)
    ? languagesSpoken
    : [];

  const displayPracticeArea =
    bestPracticeArea ||
    safePracticeAreas[0] ||
    "Not specified";

  const displayCourt =
    topCourtPractised ||
    safeCourtPractice[0] ||
    "Practicing Advocate";

  const displayLocation = [city, state]
    .filter(Boolean)
    .join(", ");

  /*
   * ============================================================
   * PROFILE NAVIGATION
   * ============================================================
   */

  const handleCardClick = useCallback(() => {
    if (!id) {
      console.error("Advocate ID missing:", advocate);
      return;
    }

    onViewAdvocate?.(id, {
      scrollToBooking: false,
    });
  }, [id, advocate, onViewAdvocate]);

  const handleCardKeyDown = useCallback(
    (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick],
  );

  /*
   * ============================================================
   * BOOK
   * ============================================================
   */

  const handleBookClick = useCallback(
    (event) => {
      event.stopPropagation();

      if (!id) {
        console.error("Advocate ID missing:", advocate);
        return;
      }

      if (!isLoggedIn) {
        window.location.href = "/login";
        return;
      }

      onViewAdvocate?.(id, {
        scrollToBooking: true,
      });
    },
    [
      id,
      advocate,
      isLoggedIn,
      onViewAdvocate,
    ],
  );

  if (!advocate) {
    return null;
  }

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      className="
        group
        w-full
        min-w-0
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        ease-out
        hover:-translate-y-1
        hover:shadow-md
        sm:p-6
      "
    >
      <div
        className="
          grid
          min-w-0
          grid-cols-1
          gap-5
          sm:grid-cols-[96px_minmax(0,1fr)]
        "
      >
        {/* ================= LEFT ================= */}

        <div
          className="
            flex
            w-full
            shrink-0
            flex-row
            items-center
            justify-center
            gap-4
            self-center
            sm:w-[96px]
            sm:flex-col
            sm:gap-3
          "
        >
          {/* ================= AVATAR ================= */}

          <div
            className="
              relative
              size-20
              shrink-0
              transition-transform
              duration-300
              ease-out
              group-hover:scale-[1.04]
            "
          >
            {/* Image container */}

            <div
              className={`
                h-full
                w-full
                overflow-hidden
                rounded-full
                border-[3px]
                bg-slate-100
                transition-colors
                duration-300
                ${
                  isOnline
                    ? "border-emerald-500"
                    : "border-slate-300"
                }
              `}
            >
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={fullName || "Advocate"}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";

                    const fallback =
                      event.currentTarget
                        .nextElementSibling;

                    if (fallback) {
                      fallback.style.display =
                        "flex";
                    }
                  }}
                />
              ) : null}

              {/* Initial fallback */}

              <div
                className="
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-slate-100
                "
                style={{
                  display: profilePhotoUrl
                    ? "none"
                    : "flex",
                }}
              >
                <span className="text-2xl font-bold text-amber-600">
                  {(fullName || "A")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            </div>

            {/* ================= PRESENCE DOT ================= */}

            <div
              className="
                absolute
                -bottom-0.5
                -right-0.5
                z-10
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                border-[3px]
                border-white
                bg-white
                shadow-sm
              "
              aria-label={
                isOnline ? "Online" : "Offline"
              }
            >
              {isOnline ? (
                <span className="relative flex h-3.5 w-3.5">
                  <span
                    className="
                      absolute
                      inline-flex
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-emerald-400
                      opacity-60
                    "
                  />

                  <span
                    className="
                      relative
                      inline-flex
                      h-3.5
                      w-3.5
                      rounded-full
                      bg-emerald-500
                    "
                  />
                </span>
              ) : (
                <span
                  className="
                    h-3.5
                    w-3.5
                    rounded-full
                    bg-slate-400
                  "
                />
              )}
            </div>
          </div>

          {/* ================= RATING / CASES ================= */}

          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <FaStar className="shrink-0 text-[15px] text-amber-500" />

                <span className="text-[17px] font-bold leading-none text-slate-900">
                  {hasRating
                    ? formattedRating
                    : "New"}
                </span>
              </div>

              <span className="mt-1 whitespace-nowrap text-[12px] leading-none text-slate-500">
                {hasRating && reviewCount > 0
                  ? `${reviewCount} Reviews`
                  : "No reviews yet"}
              </span>
            </div>

            <div className="flex items-center gap-1 whitespace-nowrap text-[13px] text-slate-600">
              <FaGavel className="shrink-0 text-[15px] text-amber-600" />

              <span>
                {casesHandled !== null &&
                casesHandled !== undefined
                  ? `${casesHandled} Cases`
                  : "Cases not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}

        <div
          className="
            flex
            h-full
            min-w-0
            w-full
            flex-col
            items-center
            text-center
            sm:items-start
            sm:text-left
          "
        >
          {/* NAME */}

          <div className="flex w-full min-w-0 items-center justify-start gap-1.5">
            <h4
              className="
                min-w-0
                max-w-[calc(100%-24px)]
                truncate
                text-[22px]
                font-bold
                leading-tight
                tracking-tight
                text-slate-900
              "
              title={fullName || "Advocate"}
            >
              {fullName || "Advocate"}
            </h4>

            <MdVerified className="inline-block shrink-0 text-[18px] text-[#1D9BF0]" />
          </div>

          {/* COURT */}

          <div
            className="
              mt-1
              flex
              w-full
              min-w-0
              items-center
              gap-1
              text-amber-600
            "
          >
            <FaLandmarkDome className="shrink-0 text-[13px]" />

            <span
              className="
                min-w-0
                truncate
                text-[14px]
                font-medium
              "
              title={displayCourt}
            >
              {displayCourt}
            </span>
          </div>

          {/* LOCATION / EXPERIENCE */}

          <div
            className="
              mt-3
              grid
              w-full
              min-w-0
              grid-cols-2
              gap-4
              text-[13px]
              text-slate-600
            "
          >
            <div className="flex min-w-0 items-center gap-1">
              <FaLocationDot className="shrink-0 text-[15px] text-amber-600" />

              <span
                className="min-w-0 truncate"
                title={
                  displayLocation || "India"
                }
              >
                {displayLocation || "India"}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-1 whitespace-nowrap">
              <IoTimeOutline className="shrink-0 text-[15px] text-amber-600" />

              <span className="truncate">
                {experienceYears !== null &&
                experienceYears !== undefined
                  ? `${experienceYears} Years`
                  : "Experience not specified"}
              </span>
            </div>
          </div>

          {/* LANGUAGES / PRACTICE AREA */}

          <div
            className="
              mt-1
              grid
              w-full
              min-w-0
              grid-cols-2
              gap-2
              text-[13px]
              text-slate-600
            "
          >
            <div className="flex min-w-0 items-center gap-1">
              <IoLanguageOutline className="shrink-0 text-[15px] text-amber-600" />

              <span
                className="min-w-0 truncate"
                title={
                  safeLanguages.length
                    ? safeLanguages.join(", ")
                    : "Languages not specified"
                }
              >
                {safeLanguages.length
                  ? `${safeLanguages
                      .slice(0, 2)
                      .join(", ")}${
                      safeLanguages.length > 2
                        ? " .."
                        : ""
                    }`
                  : "Languages not specified"}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-1">
              <ChipIcon />

              <span
                className="min-w-0 truncate"
                title={displayPracticeArea}
              >
                {displayPracticeArea}
              </span>
            </div>
          </div>

          {/* FEE / BOOK */}

          <div
            className="
              mt-1
              flex
              w-full
              items-center
              justify-between
              gap-4
              pt-2
            "
          >
            <div className="flex min-w-0 items-baseline">
              <span
                className="
                  text-[20px]
                  font-bold
                  leading-none
                  tracking-tight
                  text-slate-900
                "
              >
                {formattedFee
                  ? `₹${formattedFee}`
                  : "Contact"}
              </span>

              {formattedFee && (
                <span className="ml-1.5 whitespace-nowrap text-[14px] text-slate-500">
                  / Min
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleBookClick}
              className="
                notranslate
                h-10
                min-w-[100px]
                shrink-0
                whitespace-nowrap
                rounded-lg
                bg-amber-500
                px-6
                text-[13px]
                font-bold
                text-white
                shadow-lg
                shadow-amber-500/20
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-amber-600
                active:scale-95
              "
              translate="no"
            >
              {getBookLabel(language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AdvocateCard);