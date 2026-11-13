import { apiRequest } from "@shared/services/apiClient";

/**
 * GET /api/advocates/:id/booking-options
 * Public options for booking with an advocate:
 * Returns: { bookable, modes, subjects, slotMinutes, inPersonMinutes, minLeadMinutes, maxDaysAhead, timezone }
 */
export async function getAdvocateBookingOptions(advocateId) {
  if (!advocateId) throw new Error("advocateId is required");
  return apiRequest(`/advocates/${encodeURIComponent(advocateId)}/booking-options`);
}

/**
 * GET /api/advocates/:id/busy-slots?date=YYYY-MM-DD
 * Returns: { success: true, date, timezone: "Asia/Kolkata", busy: [{ startAt, endAt }] }
 */
export async function getAdvocateBusySlots(advocateId, dateString) {
  if (!advocateId) throw new Error("advocateId is required");
  if (!dateString) throw new Error("dateString (YYYY-MM-DD) is required");
  return apiRequest(`/advocates/${encodeURIComponent(advocateId)}/busy-slots?date=${encodeURIComponent(dateString)}`);
}

/**
 * POST /api/advocates/:id/booking-quote
 * Authenticated user only (401 otherwise).
 * Body: { mode, startAt, durationMinutes? }
 * Returns: { success: true, available: true, startAt, endAt, durationMinutes, mode, breakdown: { fee, gst, platformFee, total, totalPaise, ... } }
 */
export async function getAdvocateBookingQuote(advocateId, { mode, startAt, durationMinutes }) {
  if (!advocateId) throw new Error("advocateId is required");
  return apiRequest(`/advocates/${encodeURIComponent(advocateId)}/booking-quote`, {
    method: "POST",
    body: {
      mode,
      startAt,
      ...(durationMinutes ? { durationMinutes: Number(durationMinutes) } : {}),
    },
  });
}

/**
 * POST /api/user/advocate-bookings/checkout
 * Authenticated user only.
 * Body: { advocateId, mode, startAt, durationMinutes?, notes? }
 * Returns: { success: true, checkout: { checkoutId, razorpayOrderId, amount, currency, keyId, status, expiresAt, booking, prefill } }
 */
export async function createAdvocateCheckout({ advocateId, mode, startAt, durationMinutes, notes }) {
  return apiRequest("/user/advocate-bookings/checkout", {
    method: "POST",
    body: {
      advocateId,
      mode,
      startAt,
      ...(durationMinutes ? { durationMinutes: Number(durationMinutes) } : {}),
      ...(notes ? { notes: String(notes).trim() } : {}),
    },
  });
}

/**
 * POST /api/user/advocate-bookings/checkout/verify
 * Authenticated user only.
 * Strictly requires snake_case keys: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export async function verifyAdvocatePayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  return apiRequest("/user/advocate-bookings/checkout/verify", {
    method: "POST",
    body: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
  });
}

/**
 * GET /api/user/advocate-bookings/checkout/:checkoutId/status
 * Authenticated user only.
 * Returns: { success: true, status: "PAID" | "CREATED" | "FAILED" | "EXPIRED", payment, booking }
 */
export async function getAdvocateCheckoutStatus(checkoutId) {
  if (!checkoutId) throw new Error("checkoutId is required");
  return apiRequest(`/user/advocate-bookings/checkout/${encodeURIComponent(checkoutId)}/status`);
}

/**
 * POST /api/user/advocate-bookings/checkout/:checkoutId/cancel
 * Authenticated user only.
 * Safely checks with Razorpay before releasing the temporary slot hold.
 * Returns: { success: true, result: "RELEASED" | "PAYMENT_PROCESSING" | "PAID" | "HOLD_KEPT" | "ALREADY_CLOSED", message?: string, bookingId?: string }
 */
export async function cancelAdvocateCheckout(checkoutId) {
  if (!checkoutId) throw new Error("checkoutId is required");
  return apiRequest(`/user/advocate-bookings/checkout/${encodeURIComponent(checkoutId)}/cancel`, {
    method: "POST",
  });
}

/**
 * GET /api/advocate/appointments?status=ALL&page=1&limit=20
 * Authenticated advocate only.
 * Valid statuses: ALL, UPCOMING, PAST_DUE, COMPLETED, REFUNDED.
 * Returns: { success: true, appointments: [...], counts: { ALL, UPCOMING, PAST_DUE, COMPLETED, REFUNDED }, pagination: { page, limit, total, totalPages } }
 */
export async function getAdvocateAppointments(
  { status = "ALL", page = 1, limit = 50, _t } = {},
  options = {},
) {
  const query = new URLSearchParams();
  if (status) query.set("status", String(status).toUpperCase());
  if (page) query.set("page", String(page));
  if (limit) query.set("limit", String(limit));
  if (_t) query.set("_t", String(_t));

  return apiRequest(`/advocate/appointments?${query.toString()}`, {
    cache: false,
    forceRefresh: true,
    ...options,
  });
}

/**
 * PATCH /api/advocate/appointments/:id/complete
 * Authenticated advocate only.
 * Marks an advocate's own appointment as complete.
 */
export async function completeAdvocateAppointment(id) {
  if (!id) throw new Error("Appointment ID is required");
  return apiRequest(`/advocate/appointments/${encodeURIComponent(id)}/complete`, {
    method: "PATCH",
  });
}

