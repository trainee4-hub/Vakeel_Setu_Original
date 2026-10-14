import React, { forwardRef } from "react";
import {
  FiVideo,
  FiPhone,
  FiBriefcase,
  FiArrowRight,
} from "react-icons/fi";

/**
 * `forwardRef` is required: the container's scroll-to-booking effect calls
 * scrollIntoView() on this card's outer div.
 *
 * ⚠️ TEMPORARY BEHAVIOUR CARRIED OVER FROM THE ORIGINAL FILE ⚠️
 * The three consultation options below are rendered unconditionally, with
 * hardcoded "30 min" / "20 min" copy, rather than being driven by the real
 * eliteMembership voiceCall / videoCall / officeVisit services. That was the
 * ACTIVE implementation in the source (the real, service-driven block was
 * commented out), so it is preserved verbatim here to keep this refactor
 * structural. The obsolete commented-out duplicate has been deleted.
 *
 * Consequence to be aware of: the Proceed button is still disabled via
 * `canBook`, which IS derived from the real services — so a user can select an
 * option this advocate doesn't offer and find the button inert.
 */
const ConsultationCard = forwardRef(function ConsultationCard(
  {
    advocateName,
    highlight,
    consultType,
    onConsultTypeChange,
    activeFee,
    activeDuration,
    canBook,
    onBookingClick,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`bg-white p-6 rounded-2xl border shadow-sm transition-all duration-500 ${
        highlight
          ? "border-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.15),0_0_24px_rgba(245,158,11,0.3)]"
          : "border-slate-200"
      }`}
    >
      <h3 className="text-base font-bold text-slate-900 mb-1">
        Consult Now
      </h3>

      <p className="text-xs text-slate-500 mb-5">
        Secure a private session with {advocateName}.
      </p>

      {/* Consultation Fee */}
      <div className="mb-5 pb-5 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Consultation Fee
        </p>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900 leading-none">
            {consultType
              ? activeFee != null
                ? `₹${activeFee}`
                : "Contact"
              : "N/A"}
          </span>

          <span className="text-sm text-slate-500 pb-0.5">
            {consultType === "office"
              ? "/ meeting"
              : activeDuration
                ? `/ ${activeDuration} min`
                : consultType
                  ? "/ session"
                  : ""}
          </span>
        </div>
      </div>

      {/* TEMPORARY: always-visible consultation options — see note above. */}
      <div className="space-y-2.5 mb-5">
        {/* VIDEO CALL */}
        <label
          className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            consultType === "video"
              ? "border-amber-500 bg-amber-50"
              : "border-slate-200 hover:border-amber-300"
          }`}
        >
          <input
            type="radio"
            name="consultType"
            checked={consultType === "video"}
            onChange={() => onConsultTypeChange("video")}
            className="accent-amber-500"
          />

          <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <FiVideo
              className="text-lg text-amber-600"
              aria-hidden="true"
            />
          </span>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">
              Video Call
            </p>

            <p className="text-xs text-slate-500">
              30 min video consultation
            </p>
          </div>
        </label>

        {/* VOICE CALL */}
        <label
          className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            consultType === "voice"
              ? "border-sky-500 bg-sky-50"
              : "border-slate-200 hover:border-sky-300"
          }`}
        >
          <input
            type="radio"
            name="consultType"
            checked={consultType === "voice"}
            onChange={() => onConsultTypeChange("voice")}
            className="accent-sky-500"
          />

          <span className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
            <FiPhone
              className="text-lg text-sky-600"
              aria-hidden="true"
            />
          </span>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">
              Voice Call to Vakeel Setu
            </p>

            <p className="text-xs text-slate-500">
              20 min phone consultation
            </p>
          </div>
        </label>

        {/* OFFICE VISIT */}
        <label
          className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
            consultType === "office"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-emerald-300"
          }`}
        >
          <input
            type="radio"
            name="consultType"
            checked={consultType === "office"}
            onChange={() => onConsultTypeChange("office")}
            className="accent-emerald-500"
          />

          <span className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <FiBriefcase
              className="text-lg text-emerald-600"
              aria-hidden="true"
            />
          </span>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">
              Office Visit
            </p>

            <p className="text-xs text-slate-500">
              In-person office meeting
            </p>
          </div>
        </label>
      </div>

      {/* Booking Button */}
      <button
        type="button"
        onClick={onBookingClick}
        disabled={!canBook}
        className={`w-full h-12 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
          !canBook
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
        }`}
      >
        Proceed to Booking

        <FiArrowRight
          className="text-lg"
          aria-hidden="true"
        />
      </button>
    </div>
  );
});

export default ConsultationCard;