/**
 * Formats an amount with an EXPLICIT unit argument ('RUPEES' or 'PAISE').
 * NO DEFAULT UNIT. Throws error if unit is omitted or invalid.
 *
 * @param {number|string} amount - Monetary amount
 * @param {'RUPEES'|'PAISE'} unit - Mandatory unit
 * @returns {string} Formatted Indian Rupee string (e.g. "₹899")
 */
export function formatMoney(amount, unit) {
  if (unit !== "RUPEES" && unit !== "PAISE") {
    throw new Error(
      `formatMoney requires an explicit unit argument ('RUPEES' or 'PAISE'). Received: ${unit}`
    );
  }

  if (amount === null || amount === undefined || amount === "") {
    return "";
  }

  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  const rupees = unit === "PAISE" ? Math.floor(numeric / 100) : numeric;
  return `₹${rupees.toLocaleString("en-IN")}`;
}

/**
 * Dedicated, clearly-named formatter for booking amounts (which are in RUPEES).
 *
 * @param {number|string} amountInRupees - Booking price/amount in rupees
 * @returns {string} Formatted Indian Rupee string (e.g. "₹899")
 */
export function formatBookingAmount(amountInRupees) {
  return formatMoney(amountInRupees, "RUPEES");
}

/**
 * Formats an amount to an Indian Rupee string (e.g. 49900 paise or 499 rupees -> "₹499").
 * Preserved for backwards compatibility with legacy payment callers.
 *
 * @param {number|string} paise - Amount in paise (e.g. 49900)
 * @param {number|string} [amountRupees] - Amount in rupees from backend (e.g. 499)
 * @returns {string} Formatted Indian Rupee string (e.g. "₹499")
 */
export function formatPaiseToRupees(paise, amountRupees = null) {
  if (amountRupees !== null && amountRupees !== undefined && amountRupees !== "") {
    return formatMoney(amountRupees, "RUPEES");
  }

  if (paise === null || paise === undefined || paise === "") {
    return "";
  }

  return formatMoney(paise, "PAISE");
}

/**
 * Exact user-facing payment status labels per specification.
 */
export const PAYMENT_STATUS_LABELS = {
  CREATED: "Payment not completed",
  PROCESSING: "Processing at bank, don't pay again",
  PAID: "Paid ✓",
  FAILED: "Failed",
  EXPIRED: "Not completed (expired)",
  REFUND_PENDING: "Cancelled",
  REFUNDED: "Cancelled",
  DUPLICATE_REFUNDED: "Cancelled",
};

/**
 * Returns user-facing status label for a payment status code.
 *
 * @param {string} status
 * @returns {string}
 */
export function getPaymentStatusLabel(status) {
  if (!status) return "";
  const normalized = String(status).toUpperCase();
  return PAYMENT_STATUS_LABELS[normalized] || normalized;
}

/**
 * Status color classes using existing design system tokens.
 */
export function getPaymentStatusBadgeClass(status) {
  const normalized = String(status || "").toUpperCase();
  switch (normalized) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
    case "EXPIRED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "REFUNDED":
    case "DUPLICATE_REFUNDED":
    case "REFUND_PENDING":
    case "CREATED":
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

/**
 * Formats an ISO date/timestamp string into Indian locale date format.
 *
 * @param {string|Date} dateValue
 * @returns {string} Formatted date (e.g. "21 Oct 2026")
 */
export function formatPaymentDate(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats date and time for timestamps.
 *
 * @param {string|Date} dateValue
 * @returns {string}
 */
export function formatPaymentDateTime(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Resolves the verified Razorpay payment ID from the server response:
 * 1. payment.razorpayPaymentId, if present
 * 2. otherwise, the attempt in attempts[] whose status is "CAPTURED" (never by index/position)
 * 3. otherwise, null (so only Order ID is displayed)
 *
 * Never uses client-supplied callback parameters for display.
 *
 * @param {object} statusResult - Full server response from GET /user/consultancy/checkout/:id/status
 * @returns {string|null}
 */
export function extractCapturedPaymentId(statusResult) {
  if (!statusResult || typeof statusResult !== "object") return null;

  const payment = statusResult.payment || statusResult;

  // a) payment.razorpayPaymentId, if present
  if (payment?.razorpayPaymentId && typeof payment.razorpayPaymentId === "string" && payment.razorpayPaymentId.trim()) {
    return payment.razorpayPaymentId.trim();
  }
  if (statusResult?.razorpayPaymentId && typeof statusResult.razorpayPaymentId === "string" && statusResult.razorpayPaymentId.trim()) {
    return statusResult.razorpayPaymentId.trim();
  }

  // b) otherwise, find attempt in attempts[] whose status is "CAPTURED"
  const attempts = Array.isArray(payment?.attempts)
    ? payment.attempts
    : Array.isArray(statusResult?.attempts)
      ? statusResult.attempts
      : [];

  const capturedAttempt = attempts.find(
    (att) => String(att?.status || "").toUpperCase() === "CAPTURED"
  );

  if (capturedAttempt?.razorpayPaymentId && typeof capturedAttempt.razorpayPaymentId === "string") {
    return capturedAttempt.razorpayPaymentId.trim();
  }

  // c) otherwise null
  return null;
}

/**
 * Returns color classes for booking status chips per design spec:
 * - CONFIRMED / REQUESTED: blue
 * - PAYMENT_PROCESSING: amber
 * - COMPLETED: emerald
 * - REFUND_IN_PROGRESS / REFUNDED: slate
 *
 * @param {string} status
 * @returns {string}
 */
export function getBookingStatusBadgeClass(status) {
  const normalized = String(status || "").toUpperCase();
  switch (normalized) {
    case "CONFIRMED":
    case "REQUESTED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "PAYMENT_PROCESSING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

/**
 * Resolves the badge label and styling for a booking.
 * Strictly follows README §30.5.C priority to avoid the trap where PAYMENT_PROCESSING
 * or REFUNDED bookings carry callStatus: "PENDING" or "COMPLETED".
 *
 * @param {object} booking
 * @returns {{ label: string, className: string }}
 */
export function getBookingBadge(booking) {
  if (!booking) {
    return { label: "", className: "" };
  }

  const status = String(booking.status || "").toUpperCase();
  const callStatus = String(booking.callStatus || "").toUpperCase();

  // 1. Payment problem states win over everything
  if (status === "PAYMENT_PROCESSING") {
    return {
      label: "Processing",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (["CANCELLED", "EXPIRED", "FAILED"].includes(status)) {
    return {
      label: status.charAt(0) + status.slice(1).toLowerCase(),
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }
  if (status === "HOLD") {
    return {
      label: "Slot Held",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (["REFUND_PENDING", "REFUNDED"].includes(status)) {
    return {
      label: status === "REFUND_PENDING" ? "Refund Pending" : "Refunded",
      className: getBookingStatusBadgeClass(status),
    };
  }

  // 2. Consultation call status
  if (callStatus === "PENDING") {
    return {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }
  if (callStatus === "COMPLETED") {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  // 3. Otherwise normal mapping
  if (status === "SCHEDULED") {
    return {
      label: "Scheduled",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }
  if (["CONFIRMED", "REQUESTED", "PAID"].includes(status)) {
    return {
      label: "Confirmed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    label: booking.statusLabel || status,
    className: getBookingStatusBadgeClass(status),
  };
}

/**
 * Maps raw timeline event enums to clean, user-facing sentences:
 * - PAYMENT_PAID       → "Payment received"
 * - BOOKING_CONFIRMED  → "Booking confirmed"
 * - COMPLETED          → "Consultation completed"
 * - REFUND_INITIATED   → "Booking cancelled"
 * - REFUNDED           → "Booking cancelled"
 * - anything else      → sentence case (underscores → spaces)
 *
 * @param {string} event
 * @returns {string}
 */
export function getTimelineEventLabel(event) {
  if (!event) return "";
  const normalized = String(event).toUpperCase();
  switch (normalized) {
    case "PAYMENT_PAID":
      return "Payment received";
    case "BOOKING_CONFIRMED":
      return "Booking confirmed";
    case "COMPLETED":
      return "Consultation completed";
    case "REFUND_INITIATED":
    case "REFUNDED":
      return "Booking cancelled";
    default: {
      const lower = String(event).replace(/_/g, " ").toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
  }
}

/**
 * Resolves title for advocate booking:
 * "{Mode} with {advocateName} • {duration} min"
 * e.g. "Video Call with JOY • 15 min"
 */
export function getAdvocateBookingTitle(booking) {
  if (!booking) return "";
  const rawMode = booking.mode || booking.callType;
  const modeLabel =
    rawMode === "VIDEO_CALL"
      ? "Video Call"
      : rawMode === "IN_PERSON"
      ? "In-Person Meeting"
      : "Voice Call";

  const advocateName =
    booking.advocate?.fullName ||
    booking.advocateName ||
    booking.advocate?.name ||
    "";

  const duration = booking.durationMinutes || booking.duration || 15;

  if (advocateName) {
    return `${modeLabel} with ${advocateName} • ${duration} min`;
  }
  return `${modeLabel} Consultation • ${duration} min`;
}

/**
 * Resolves title for consultancy booking:
 * "Expert Consultation • {Mode} • {duration} min"
 * e.g. "Expert Consultation • Video Call • 15 min"
 */
export function getConsultancyBookingTitle(booking) {
  if (!booking) return "";
  const isVideo = (booking.callType || booking.mode) === "VIDEO_CALL";
  const modeLabel = isVideo ? "Video Call" : "Voice Call";
  const duration = booking.durationMinutes || booking.duration || 15;
  return `Expert Consultation • ${modeLabel} • ${duration} min`;
}

/**
 * Resolves the display title based on bookingType.
 */
export function getBookingDisplayTitle(booking) {
  if (!booking) return "";
  if (booking.bookingType === "ADVOCATE") {
    return getAdvocateBookingTitle(booking);
  }
  return getConsultancyBookingTitle(booking);
}

/**
 * Resolves avatar information for an advocate booking:
 * - photo: real photo url if present
 * - name: advocate's full name
 * - initial: derived strictly from the advocate's real name (removing "Adv." prefix)
 */
export function getAdvocateAvatarData(booking) {
  if (!booking) return { photo: null, name: "", initial: null };
  const photo =
    booking.advocate?.profilePhotoUrl ||
    booking.advocatePhoto ||
    booking.profilePhotoUrl ||
    null;

  const rawName =
    booking.advocate?.fullName ||
    booking.advocateName ||
    booking.advocate?.name ||
    "";

  const cleaned = rawName.trim().replace(/^Adv\.?\s+/i, "");
  const initial = cleaned ? cleaned[0].toUpperCase() : null;

  return {
    photo,
    name: rawName,
    initial,
  };
}


