import { memo } from "react";
import {
  FaArrowRight,
  FaAward,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const PremiumAdvocateSlide = memo(function PremiumAdvocateSlide({
  advocate,
  isActive,
  onBookConsultation,
  onViewProfile,
}) {
  const advocateId = advocate?.id || advocate?._id;
  const advocateName = advocate?.fullName || "Advocate";

  const experienceYears = advocate?.experienceYears ?? null;
  const hasExperience = experienceYears != null;

  const practiceAreas = Array.isArray(advocate?.practiceAreas)
    ? advocate.practiceAreas
    : [];

  const practiceArea =
    practiceAreas.length > 0 ? practiceAreas[0] : "General Practice";

  const averageRating =
    advocate?.averageRating != null ? Number(advocate.averageRating) : null;

  const hasRating = averageRating != null && Number.isFinite(averageRating);
  const filledStars = hasRating ? Math.round(averageRating) : 0;
  const reviewCount = advocate?.totalReviews ?? 0;

  const videoFee =
    advocate?.videoCallChargePerMinute != null
      ? Number(advocate.videoCallChargePerMinute)
      : null;

  const voiceFee =
    advocate?.voiceCallChargePerMinute != null
      ? Number(advocate.voiceCallChargePerMinute)
      : null;

  const officeFee =
    advocate?.offlineVisitingFee != null
      ? Number(advocate.offlineVisitingFee)
      : null;

  const consultationFee = videoFee ?? voiceFee ?? officeFee ?? null;
  const profileImageUrl = advocate?.profilePhotoUrl || null;

  return (
    <div
      className={`
        absolute
        inset-0
        transition-all
        duration-700
        ease-out
        ${
          isActive
            ? "z-10 translate-x-0 opacity-100"
            : "pointer-events-none z-0 translate-x-4 opacity-0"
        }
      `}
      aria-hidden={!isActive}
    >
      <div className="flex h-full flex-col sm:flex-row">
        {/* Profile Image */}
        <div className="relative h-[155px] shrink-0 overflow-hidden bg-slate-100 sm:h-full sm:w-[40%]">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`Portrait of ${advocateName}`}
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={(event) => {
                event.currentTarget.style.display = "none";

                if (event.currentTarget.nextElementSibling) {
                  event.currentTarget.nextElementSibling.style.display = "flex";
                }
              }}
            />
          ) : null}

          {/* Fallback */}
          <div
            className="absolute inset-0 items-center justify-center bg-slate-100"
            style={{ display: profileImageUrl ? "none" : "flex" }}
          >
            <span className="text-3xl font-bold text-slate-400">
              {advocateName?.[0]?.toUpperCase()}
            </span>
          </div>

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-slate-950/10"
            aria-hidden="true"
          />

          {/* Featured Badge */}
          <div className="absolute left-4 top-4">
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/20
                bg-slate-950/55
                px-2.5
                py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-white
                backdrop-blur-md
              "
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-amber-400"
                aria-hidden="true"
              />
              Featured
            </span>
          </div>

          {/* Experience Badge */}
          {hasExperience && (
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
                <FaAward
                  className="shrink-0 text-[14px] text-amber-400"
                  aria-hidden="true"
                />
                {experienceYears} Years
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              {/* Practice Area */}
              <span className="inline-flex max-w-[190px] items-center truncate rounded-md bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                {practiceArea}
              </span>

              {/* Verified */}
              <div className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <MdVerified
                  className="shrink-0 text-[14px]"
                  aria-hidden="true"
                />
                Verified
              </div>
            </div>

            {/* Advocate Name */}
            <h3 className="mt-4 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
              {advocateName}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Experienced Legal Professional
            </p>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`text-[14px] ${
                      star <= filledStars
                        ? "text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>

              <span className="text-sm font-bold text-slate-900">
                {hasRating ? averageRating.toFixed(1) : "New"}
              </span>

              <span className="text-xs text-slate-400">
                {hasRating && reviewCount > 0
                  ? `(${reviewCount} reviews)`
                  : "(No reviews yet)"}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Experience
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {hasExperience ? `${experienceYears} Years` : "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Consultation
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  {consultationFee != null ? `₹${consultationFee}` : "Contact"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onBookConsultation(advocateId)}
              className="
                group
                inline-flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-amber-500
                px-4
                py-2.5
                text-xs
                font-bold
                text-slate-950
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-amber-400
                hover:shadow-md
                active:translate-y-0
              "
            >
              Book Consultation

              <FaArrowRight
                className="shrink-0 text-[14px] transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => onViewProfile(advocateId)}
              className="
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-600
                transition-all
                hover:border-amber-300
                hover:bg-amber-50
                hover:text-amber-600
              "
              aria-label="View advocate profile"
            >
              <FaUser
                className="text-[16px]"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PremiumAdvocateSlide;