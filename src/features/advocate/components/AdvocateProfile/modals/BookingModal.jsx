import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiInfo,
  FiLock,
  FiMapPin,
  FiPhone,
  FiVideo,
  FiX,
} from "react-icons/fi";

import { FaExclamationCircle } from "react-icons/fa";

import {
  formatIndianDate,
} from "../utils/advocateProfileUtils";

/* =========================================================================
   HELPERS
============================================================================ */

const getTodayDate = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatFee = (value) => {
  const fee = Number(value);

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(fee)
  ) {
    return "Contact";
  }

  if (fee <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(fee);
};

/* =========================================================================
   CONSULTATION ICON
============================================================================ */

const ConsultationIcon = ({
  type,
  className = "",
}) => {
  if (type === "video") {
    return (
      <FiVideo
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (type === "voice") {
    return (
      <FiPhone
        className={className}
        aria-hidden="true"
      />
    );
  }

  if (type === "office") {
    return (
      <FiMapPin
        className={className}
        aria-hidden="true"
      />
    );
  }

  return null;
};

/* =========================================================================
   BOOKING MODAL
============================================================================ */

export default function BookingModal({
  open,

  mode = "book",
  consultationId = null,

  advocateName,
  advocatePhoto,
  advocateSpecialty,

  consultType,
  onConsultTypeChange,

  activeFee,
  videoFee,
  voiceFee,
  officeFee,

  // PAYMENT
  gstRate = 18,
  platformFee = 0,

  selectedDate,
  onDateChange,

  selectedTimeSlot,
  onSlotSelect,

  groupedSlots = {},

  availabilityLoading = false,
  availabilityError = "",

  isSlotPast = () => false,

  subjectOptions = [],

  bookingSubject,
  onSubjectChange,

  bookingDescription = "",
  onDescriptionChange,

  booking = false,
  bookingError = "",

  onClose,
  onConfirm,
}) {
  const [
    showValidation,
    setShowValidation,
  ] = useState(false);

  /* =======================================================================
     RESET VALIDATION WHEN MODAL OPENS
  ======================================================================= */

  useEffect(() => {
    if (open) {
      setShowValidation(false);
    }
  }, [open]);

  /* =======================================================================
     CONSULTATION OPTIONS
  ======================================================================= */

  const consultationOptions =
    useMemo(
      () => [
        {
          value: "video",
          label: "Video Call",
          fee: videoFee,
        },

        {
          value: "voice",
          label:
            "Voice Call to Vakeel Setu",
          fee: voiceFee,
        },

        {
          value: "office",
          label: "In-Person",
          fee: officeFee,
        },
      ],
      [
        videoFee,
        voiceFee,
        officeFee,
      ],
    );

  const selectedOption =
    consultationOptions.find(
      (option) =>
        option.value ===
        consultType,
    );

  const typeLabel =
    selectedOption?.label ||
    "Consultation";

  /* =======================================================================
     PAYMENT
  ======================================================================= */

  const paymentSummary =
    useMemo(() => {
      const parsedModePrice =
        Number(activeFee);

      const parsedGstRate =
        Number(gstRate);

      const parsedPlatformFee =
        Number(platformFee);

      const modePrice =
        Number.isFinite(
          parsedModePrice,
        ) &&
        parsedModePrice > 0
          ? parsedModePrice
          : 0;

      const safeGstRate =
        Number.isFinite(
          parsedGstRate,
        ) &&
        parsedGstRate >= 0
          ? parsedGstRate
          : 0;

      const safePlatformFee =
        Number.isFinite(
          parsedPlatformFee,
        ) &&
        parsedPlatformFee >= 0
          ? parsedPlatformFee
          : 0;

      const gstAmount =
        (modePrice *
          safeGstRate) /
        100;

      const total =
        modePrice +
        gstAmount +
        safePlatformFee;

      return {
        modePrice,
        gstRate:
          safeGstRate,
        gstAmount,
        platformFee:
          safePlatformFee,
        total,
      };
    }, [
      activeFee,
      gstRate,
      platformFee,
    ]);

  /* =======================================================================
     SLOT DATA
  ======================================================================= */

  const slotGroups =
    useMemo(
      () =>
        Object.entries(
          groupedSlots || {},
        ),
      [groupedSlots],
    );

  const availableSlots =
    useMemo(
      () =>
        slotGroups.flatMap(
          ([, slots]) => {
            if (
              !Array.isArray(
                slots,
              )
            ) {
              return [];
            }

            return slots.filter(
              (slot) =>
                !isSlotPast(
                  slot,
                ),
            );
          },
        ),
      [
        slotGroups,
        isSlotPast,
      ],
    );

  const hasAnySlot =
    availableSlots.length > 0;

  /* =======================================================================
     VALUES
  ======================================================================= */

  const todayDate =
    getTodayDate();

  const cleanSubject =
    String(
      bookingSubject || "",
    ).trim();

  const cleanDescription =
    String(
      bookingDescription || "",
    ).trim();

  const isReschedule =
    mode === "reschedule";

  /* =======================================================================
     VALIDATION
  ======================================================================= */

  const validationErrors =
    useMemo(() => {
      const errors = {};

      if (!consultType) {
        errors.consultType =
          "Please select a consultation mode.";
      }

      if (!selectedDate) {
        errors.date =
          "Please select a consultation date.";
      } else if (
        selectedDate < todayDate
      ) {
        errors.date =
          "Please select today or a future date.";
      }

      if (
        selectedDate &&
        hasAnySlot &&
        !selectedTimeSlot
      ) {
        errors.time =
          "Please select an available time slot.";
      }

      if (
        selectedDate &&
        !availabilityLoading &&
        !availabilityError &&
        !hasAnySlot
      ) {
        errors.time =
          "No slots are available for the selected date.";
      }

      if (!cleanSubject) {
        errors.subject =
          "Please select the subject of your legal matter.";
      }

      if (
        cleanSubject ===
          "Other" &&
        !cleanDescription
      ) {
        errors.description =
          "Please describe your legal matter.";
      }

      if (
        cleanDescription.length >
        500
      ) {
        errors.description =
          "Notes cannot exceed 500 characters.";
      }

      return errors;
    }, [
      consultType,
      selectedDate,
      selectedTimeSlot,
      cleanSubject,
      cleanDescription,
      todayDate,
      hasAnySlot,
      availabilityLoading,
      availabilityError,
    ]);

  const hasValidationErrors =
    Object.keys(
      validationErrors,
    ).length > 0;

  /* =======================================================================
     TEXT
  ======================================================================= */

  const modalTitle =
    isReschedule
      ? "Reschedule Consultation"
      : "Book Consultation";

  const confirmLabel =
    isReschedule
      ? "Confirm Reschedule"
      : paymentSummary.total > 0
        ? "Proceed to Payment"
        : "Confirm Booking";

  /* =======================================================================
     ACTIONS
  ======================================================================= */

  const closeModal = () => {
    if (booking) {
      return;
    }

    onClose?.();
  };

  const handleConfirmClick =
    () => {
      setShowValidation(true);

      if (
        booking ||
        availabilityLoading ||
        hasValidationErrors
      ) {
        return;
      }

      onConfirm?.();
    };

  /* =======================================================================
     CLOSED
  ======================================================================= */

  if (!open) {
    return null;
  }

  /* =======================================================================
     PAGE
  ======================================================================= */

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-3 pb-5 pt-16 sm:px-5 sm:pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close consultation booking"
        onClick={closeModal}
        className="fixed inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm"
      />

      {/* MODAL */}

      <div className="relative flex max-h-[calc(100vh-5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:max-h-[calc(100vh-6rem)]">
        {/* HEADER */}

        <header className="shrink-0 border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="booking-modal-title"
                  className="text-xl font-extrabold tracking-tight text-slate-950"
                >
                  {modalTitle}
                </h2>

                {isReschedule && (
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                    Reschedule
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select consultation
                mode, date and an
                available time slot.
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              disabled={booking}
              aria-label="Close booking dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 outline-none transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiX
                className="text-[18px]"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* ADVOCATE INFO */}

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            {advocatePhoto ? (
              <img
                src={advocatePhoto}
                alt={
                  advocateName ||
                  "Advocate"
                }
                className="h-12 w-12 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg font-extrabold text-amber-700">
                {String(
                  advocateName ||
                    "A",
                )
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">
                {advocateName ||
                  "Advocate"}
              </p>

              {advocateSpecialty && (
                <p className="mt-0.5 truncate text-xs font-semibold text-amber-700">
                  {
                    advocateSpecialty
                  }
                </p>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE BODY */}

        <div className="custom-scrollbar flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-6">
          {/* STEP 1 — CONSULTATION MODE */}

          <section>
            <StepHeader
              number="1"
              title="Consultation Mode"
              description="Choose how you want to consult."
            />

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {consultationOptions.map(
                (option) => {
                  const selected =
                    consultType ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      disabled={booking}
                      onClick={() =>
                        onConsultTypeChange?.(
                          option.value,
                        )
                      }
                      className={`rounded-2xl border p-3.5 text-left outline-none transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                        selected
                          ? "border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-500/10"
                          : showValidation &&
                              validationErrors.consultType
                            ? "border-red-200 bg-white"
                            : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <ConsultationIcon
                          type={
                            option.value
                          }
                          className={`text-[20px] ${
                            selected
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        />

                        {selected && (
                          <FiCheckCircle
                            className="text-[17px] text-amber-600"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      <p className="mt-3 text-xs font-extrabold text-slate-800">
                        {option.label}
                      </p>

                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        {formatFee(
                          option.fee,
                        )}
                      </p>
                    </button>
                  );
                },
              )}
            </div>

            {showValidation &&
              validationErrors.consultType && (
                <FieldError>
                  {
                    validationErrors.consultType
                  }
                </FieldError>
              )}
          </section>

          {/* STEP 2 — DATE */}

          <section>
            <StepHeader
              number="2"
              title="Select Date"
              description="Pick your preferred consultation date."
            />

            <input
              type="date"
              min={todayDate}
              value={
                selectedDate ||
                ""
              }
              onChange={(
                event,
              ) =>
                onDateChange?.(
                  event.target
                    .value,
                )
              }
              disabled={
                booking ||
                !consultType
              }
              className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                showValidation &&
                validationErrors.date
                  ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
              }`}
            />

            {!consultType &&
              !showValidation && (
                <p className="mt-2 text-xs font-medium text-amber-600">
                  Select a
                  consultation mode
                  first.
                </p>
              )}

            {showValidation &&
              validationErrors.date && (
                <FieldError>
                  {
                    validationErrors.date
                  }
                </FieldError>
              )}
          </section>

          {/* STEP 3 — TIME SLOT */}

          <section>
            <StepHeader
              number="3"
              title="Available Time"
              description="Choose one available slot."
              rightContent={
                selectedDate &&
                hasAnySlot &&
                !availabilityLoading ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                ) : null
              }
            />

            {!selectedDate ? (
              <div
                className={`rounded-2xl border border-dashed px-4 py-7 text-center ${
                  showValidation &&
                  validationErrors.date
                    ? "border-red-200 bg-red-50/30"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <FiCalendar
                  className="mx-auto text-[26px] text-slate-300"
                  aria-hidden="true"
                />

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Select a date to
                  see available
                  slots.
                </p>
              </div>
            ) : availabilityLoading ? (
              <div className="flex min-h-[110px] items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />

                  Loading available
                  slots...
                </div>
              </div>
            ) : availabilityError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <FaExclamationCircle
                    className="mt-0.5 shrink-0 text-[16px] text-red-500"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-xs font-bold text-red-700">
                      Unable to load
                      availability
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-red-600">
                      {
                        availabilityError
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : !hasAnySlot ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <div className="flex items-start gap-2">
                  <FiCalendar
                    className="mt-0.5 shrink-0 text-[17px] text-amber-600"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-xs font-bold text-amber-800">
                      No slots
                      available
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-amber-700">
                      No available
                      slots were found
                      for this date.
                      Please choose
                      another date.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {slotGroups.map(
                  ([
                    period,
                    slots,
                  ]) => {
                    if (
                      !Array.isArray(
                        slots,
                      ) ||
                      !slots.length
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={period}
                      >
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                          {period}
                        </p>

                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {slots.map(
                            (slot) => {
                              const unavailable =
                                isSlotPast(
                                  slot,
                                );

                              const selected =
                                selectedTimeSlot ===
                                slot;

                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={
                                    booking ||
                                    unavailable
                                  }
                                  aria-disabled={
                                    unavailable
                                  }
                                  aria-pressed={
                                    selected
                                  }
                                  onClick={() => {
                                    if (
                                      unavailable
                                    ) {
                                      return;
                                    }

                                    onSlotSelect?.(
                                      slot,
                                    );
                                  }}
                                  className={`min-h-[42px] rounded-xl border px-3 text-xs font-bold outline-none transition focus:outline-none ${
                                    unavailable
                                      ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through"
                                      : selected
                                        ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                                        : showValidation &&
                                            validationErrors.time
                                          ? "border-red-200 bg-white text-slate-600 hover:border-red-300"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}

            {showValidation &&
              validationErrors.time &&
              selectedDate &&
              !availabilityLoading &&
              !availabilityError && (
                <FieldError>
                  {
                    validationErrors.time
                  }
                </FieldError>
              )}
          </section>

          {/* STEP 4 — LEGAL MATTER */}

          <section>
            <StepHeader
              number="4"
              title="Legal Matter"
              description="Tell the advocate what you need help with."
            />

            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-700">
                Subject

                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <select
                  value={
                    bookingSubject ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    onSubjectChange?.(
                      event.target
                        .value,
                    )
                  }
                  disabled={booking}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    showValidation &&
                    validationErrors.subject
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
                  }`}
                >
                  <option
                    value=""
                    disabled
                  >
                    Select a subject
                  </option>

                  {subjectOptions.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ),
                  )}
                </select>

                <FiChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400"
                  aria-hidden="true"
                />
              </div>

              {showValidation &&
                validationErrors.subject && (
                  <FieldError>
                    {
                      validationErrors.subject
                    }
                  </FieldError>
                )}
            </div>

            {/* NOTES */}

            {bookingSubject && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-extrabold text-slate-700">
                    Notes for Lawyer

                    {bookingSubject ===
                      "Other" && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>

                  <span
                    className={`text-[10px] font-semibold ${
                      cleanDescription.length >
                      500
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {
                      cleanDescription.length
                    }
                    /500
                  </span>
                </div>

                <textarea
                  value={
                    bookingDescription ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    onDescriptionChange?.(
                      event.target
                        .value,
                    )
                  }
                  disabled={booking}
                  maxLength={500}
                  rows={4}
                  placeholder={
                    bookingSubject ===
                    "Other"
                      ? "Briefly describe your legal matter, relevant facts and what help you need."
                      : "Optional: Add information that may help the advocate prepare."
                  }
                  className={`w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition focus:bg-white focus:outline-none focus:ring-2 ${
                    showValidation &&
                    validationErrors.description
                      ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
                  }`}
                />

                {showValidation &&
                  validationErrors.description && (
                    <FieldError>
                      {
                        validationErrors.description
                      }
                    </FieldError>
                  )}
              </div>
            )}
          </section>

          {/* STEP 5 — REVIEW */}

          <section>
            <StepHeader
              number="5"
              title="Review"
              description="Check your booking details before continuing."
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
              <SummaryRow
                label="Advocate"
                value={
                  advocateName ||
                  "—"
                }
              />

              <SummaryRow
                label="Mode"
                value={
                  consultType
                    ? typeLabel
                    : "Not selected"
                }
              />

              <SummaryRow
                label="Date"
                value={
                  selectedDate
                    ? formatIndianDate(
                        selectedDate,
                      )
                    : "Not selected"
                }
              />

              <SummaryRow
                label="Time"
                value={
                  selectedTimeSlot ||
                  "Not selected"
                }
              />

              <SummaryRow
                label="Subject"
                value={
                  bookingSubject ||
                  "Not selected"
                }
              />

              <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 py-3.5">
                <span className="text-xs font-semibold text-slate-500">
                  Consultation Fee
                </span>

                <span className="text-sm font-extrabold text-slate-950">
                  {formatFee(
                    activeFee,
                  )}
                </span>
              </div>
            </div>

            {isReschedule &&
              consultationId && (
                <div className="mt-2 flex items-start gap-1.5 text-[10px] font-medium text-slate-400">
                  <FiInfo
                    className="mt-[1px] shrink-0 text-[14px]"
                    aria-hidden="true"
                  />

                  Existing
                  consultation will
                  be updated after
                  confirmation.
                </div>
              )}
          </section>

          {/* STEP 6 — PAYMENT SUMMARY */}

          <section>
            <StepHeader
              number="6"
              title="Payment Summary"
              description="Review the final payable amount before proceeding."
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {/* MODE PRICE */}

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    {typeLabel} Fee
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    Advocate consultation
                    charge
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-800">
                  {formatFee(
                    paymentSummary.modePrice,
                  )}
                </span>
              </div>

              {/* GST */}

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    GST
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    {
                      paymentSummary.gstRate
                    }
                    % on consultation
                    fee
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-800">
                  {formatFee(
                    paymentSummary.gstAmount,
                  )}
                </span>
              </div>

              {/* PLATFORM FEE */}

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5">
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Platform Fee
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    Booking and platform
                    service charge
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-800">
                  {paymentSummary.platformFee >
                  0
                    ? formatFee(
                        paymentSummary.platformFee,
                      )
                    : "₹0"}
                </span>
              </div>

              {/* TOTAL */}

              <div className="bg-slate-950 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-white">
                      Total Payable
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      Inclusive of applicable
                      charges
                    </p>
                  </div>

                  <span className="text-xl font-extrabold text-amber-400">
                    {formatFee(
                      paymentSummary.total,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3">
              <FiLock
                className="mt-0.5 shrink-0 text-[16px] text-blue-600"
                aria-hidden="true"
              />

              <p className="text-[11px] font-medium leading-5 text-blue-700">
                Your payment will be
                processed securely after
                confirming the consultation.
              </p>
            </div>
          </section>
        </div>

        {/* BACKEND / BOOKING ERROR */}

        {bookingError && (
          <div className="mx-5 mt-3 flex shrink-0 items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:mx-6">
            <FaExclamationCircle
              className="mt-0.5 shrink-0 text-[17px] text-red-500"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-xs font-extrabold text-red-700">
                Unable to complete
                booking
              </p>

              <p className="mt-0.5 break-words text-[11px] leading-5 text-red-600">
                {bookingError}
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <footer className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
          {showValidation &&
            hasValidationErrors &&
            !booking && (
              <p className="mb-3 text-center text-[11px] font-semibold text-red-600">
                Please correct the
                highlighted fields
                before continuing.
              </p>
            )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={booking}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 outline-none transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleConfirmClick
              }
              disabled={
                booking ||
                availabilityLoading
              }
              className="inline-flex min-h-[44px] min-w-[175px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-extrabold text-slate-950 outline-none transition hover:bg-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {booking ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />

                  {isReschedule
                    ? "Rescheduling..."
                    : "Processing..."}
                </>
              ) : (
                <>
                  {confirmLabel}

                  <FiArrowRight
                    className="text-[17px]"
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* =========================================================================
   STEP HEADER
============================================================================ */

function StepHeader({
  number,
  title,
  description,
  rightContent = null,
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-[10px] font-extrabold text-white">
          {number}
        </span>

        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {rightContent}
    </div>
  );
}

/* =========================================================================
   FIELD ERROR
============================================================================ */

function FieldError({
  children,
}) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-red-600">
      <FaExclamationCircle
        className="mt-[1px] shrink-0 text-[15px]"
        aria-hidden="true"
      />

      <span>
        {children}
      </span>
    </p>
  );
}

/* =========================================================================
   SUMMARY ROW
============================================================================ */

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 px-4 py-3">
      <span className="shrink-0 text-xs font-semibold text-slate-500">
        {label}
      </span>

      <span className="break-words text-right text-xs font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}