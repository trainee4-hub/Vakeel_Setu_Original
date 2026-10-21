/**
 * Formats an amount to an Indian Rupee string (e.g. 49900 paise or 499 rupees -> "₹499").
 * 
 * Rules:
 * - When amountRupees is available (from backend response), it is used directly
 *   to eliminate any floating-point arithmetic or division risk.
 * - If only paise is provided, divides by 100 and formats using toLocaleString('en-IN').
 * - NEVER compute, infer or send a price to the backend.
 *
 * @param {number|string} paise - Amount in paise (e.g. 49900)
 * @param {number|string} [amountRupees] - Amount in rupees from backend (e.g. 499)
 * @returns {string} Formatted Indian Rupee string (e.g. "₹499")
 */
export function formatPaiseToRupees(paise, amountRupees = null) {
  if (amountRupees !== null && amountRupees !== undefined && amountRupees !== "") {
    const num = Number(amountRupees);
    if (Number.isFinite(num)) {
      return `₹${num.toLocaleString("en-IN")}`;
    }
  }

  if (paise === null || paise === undefined || paise === "") {
    return "";
  }

  const numeric = Number(paise);
  if (!Number.isFinite(numeric)) {
    return "";
  }

  const rupees = Math.floor(numeric / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
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
  REFUND_PENDING: "Refund in progress",
  REFUNDED: "Refunded",
  DUPLICATE_REFUNDED: "Extra payment refunded",
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
    case "REFUND_PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED":
    case "EXPIRED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "REFUNDED":
    case "DUPLICATE_REFUNDED":
      return "border-purple-200 bg-purple-50 text-purple-700";
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
