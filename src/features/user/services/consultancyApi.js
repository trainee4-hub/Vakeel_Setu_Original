import {
  apiRequest,
  ApiError,
} from "@shared/services/apiClient";

/* ================================================================
   CREATE CONSULTANCY REQUEST (Legacy / Free Flow Booking Path)
   NOTE: Do NOT remove or disable under any circumstance.
   This remains the live path while PAYMENTS_ENABLED is off or
   if the backend checkout endpoint 404s/503s.
================================================================ */

export const createConsultancyRequest = async (payload) => {
  return apiRequest("/user/consultancy", {
    method: "POST",
    body: payload,
  });
};

/* ================================================================
   GET CONSULTANCY HISTORY
================================================================ */

export const getConsultancyHistory = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest(`/user/consultancy?${params.toString()}`, {
    method: "GET",
  });
};

/* ================================================================
   GET SINGLE CONSULTANCY REQUEST
================================================================ */

export const getConsultancyRequest = async (id) => {
  if (!id) {
    throw new Error("Consultancy request ID is required.");
  }

  return apiRequest(`/user/consultancy/${encodeURIComponent(id)}`, {
    method: "GET",
  });
};

/* ================================================================
   CONSULTANCY CHECKOUT (Phase A - Razorpay Integration)
   CRITICAL: NEVER send amount, price or currency to the backend.
   The backend decides the price. The frontend only displays what
   the checkout response returns.
================================================================ */

/**
 * Creates or reuses a Razorpay checkout order for a consultancy package.
 *
 * @param {Object} params
 * @param {string} params.callType - "CALL" or "VIDEO_CALL"
 * @param {number} params.duration - 15 or 30
 * @param {string} params.phoneNumber - 10-digit phone
 * @param {string} params.email - Valid email
 */
export const checkoutConsultancy = async ({
  callType,
  duration,
  phoneNumber,
  email,
}) => {
  // Defensive validation: ensure no price/amount is ever sent
  const payload = {
    callType,
    duration,
    phoneNumber,
    email,
  };

  try {
    const rawResponse = await apiRequest("/user/consultancy/checkout", {
      method: "POST",
      body: payload,
    });

    // Real backend shape verified on 2026-10-21:
    // { success: true, checkout: { checkoutId, razorpayOrderId, amount, currency, keyId, status, expiresAt, package, prefill } }
    const checkout =
      rawResponse?.checkout ||
      rawResponse?.data?.checkout ||
      rawResponse?.data ||
      rawResponse ||
      {};

    // Handle 200 with code ALREADY_PAID if returned in response body
    if (rawResponse?.code === "ALREADY_PAID" || checkout?.code === "ALREADY_PAID") {
      const alreadyPaidError = new ApiError(
        rawResponse?.message || "Payment for this package was already completed.",
        200,
        rawResponse
      );
      alreadyPaidError.code = "ALREADY_PAID";
      throw alreadyPaidError;
    }

    return {
      success: true,
      raw: rawResponse,
      checkout: {
        checkoutId: checkout?.checkoutId ?? checkout?.id ?? null,
        razorpayOrderId:
          checkout?.razorpayOrderId ??
          checkout?.orderId ??
          checkout?.order_id ??
          null,
        keyId: checkout?.keyId ?? checkout?.key_id ?? null,
        amount: checkout?.amount ?? null, // In PAISE (e.g. 49900)
        amountRupees: checkout?.amountRupees ?? checkout?.package?.price ?? null, // In RUPEES (e.g. 499)
        currency: checkout?.currency ?? "INR",
        status: checkout?.status ?? "CREATED",
        expiresAt: checkout?.expiresAt ?? null, // 30-min TTL ISO string
        prefill: checkout?.prefill ?? {
          contact: phoneNumber,
          email,
        },
        package: checkout?.package ?? {
          callType,
          duration,
        },
      },
    };
  } catch (err) {
    // Map documented status codes
    const status = err?.status;
    const code = err?.code || err?.data?.code;

    // 409 PAYMENT_PROCESSING -> Go to processing screen, do NOT open popup
    if (status === 409 || code === "PAYMENT_PROCESSING") {
      err.code = "PAYMENT_PROCESSING";
      err.userMessage =
        err?.message ||
        "Your previous payment is still being processed by the bank. Please wait — do not pay again.";
      throw err;
    }

    // 200 code ALREADY_PAID
    if (code === "ALREADY_PAID") {
      err.code = "ALREADY_PAID";
      err.userMessage =
        err?.message || "Payment for this package was already completed.";
      throw err;
    }

    // 400 code PAYMENT_REQUIRED -> Should never reach user; log it
    if (code === "PAYMENT_REQUIRED") {
      console.warn(
        "[consultancyApi] Received PAYMENT_REQUIRED from checkout endpoint:",
        err
      );
    }

    // 503 Payments temporarily unavailable
    if (status === 503) {
      err.userMessage = "Payments are temporarily unavailable. Please try again shortly.";
      throw err;
    }

    // Propagate for self-correcting 404 check or general error display
    throw err;
  }
};

/* ================================================================
   VERIFY CONSULTANCY CHECKOUT PAYMENT
   NOTE: Razorpay callback is NOT proof of payment. Verify failure
   must be caught and ignored because polling is the true authority.
================================================================ */

/**
 * Verifies Razorpay payment signature on backend.
 *
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 */
export const verifyConsultancyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    const response = await apiRequest("/user/consultancy/checkout/verify", {
      method: "POST",
      body: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    });

    // UNVERIFIED — verify response shape to be captured after first successful payment in Step 4
    return response;
  } catch (err) {
    const code = err?.code || err?.data?.code;
    if (err?.status === 400 && code === "INVALID_SIGNATURE") {
      err.code = "INVALID_SIGNATURE";
      err.userMessage = "Payment signature verification failed. Please contact support.";
    }
    throw err;
  }
};

/* ================================================================
   GET CHECKOUT PAYMENT STATUS
   Polled until terminal state (PAID / FAILED / EXPIRED / PROCESSING).
================================================================ */

/**
 * Checks the status of an in-flight or completed checkout.
 *
 * @param {string} checkoutId - Internal checkout UUID
 */
export const getCheckoutStatus = async (checkoutId) => {
  if (!checkoutId) {
    throw new Error("Checkout ID is required.");
  }

  const response = await apiRequest(
    `/user/consultancy/checkout/${encodeURIComponent(checkoutId)}/status`,
    {
      method: "GET",
      cache: false, // Must not cache polling requests
    }
  );

  // Real backend shape verified on 2026-10-21:
  // { success: true, status: "...", payment: { id, amount, amountRupees, status, razorpayOrderId, consultancyRequestId, paidAt, expiresAt, attempts, consultancyRequest, user }, consultancyRequest: ... }
  const topStatus = response?.status;
  const paymentObj = response?.payment || {};
  const consultancyReq = response?.consultancyRequest || paymentObj?.consultancyRequest || null;

  // Search for paymentId inside payment, paymentObj, or attempts array
  const attempts = Array.isArray(paymentObj?.attempts) ? paymentObj.attempts : [];
  const latestCapturedAttempt = attempts.find(
    (a) => String(a?.status).toUpperCase() === "CAPTURED"
  );
  const paymentIdFromAttempt =
    latestCapturedAttempt?.razorpayPaymentId ||
    latestCapturedAttempt?.paymentId ||
    attempts[0]?.razorpayPaymentId ||
    null;

  const resolvedPaymentId =
    paymentObj?.razorpayPaymentId ||
    response?.razorpayPaymentId ||
    paymentIdFromAttempt ||
    null;

  return {
    success: true,
    raw: response,
    status: (topStatus || paymentObj?.status || "").toUpperCase(),
    amount: paymentObj?.amount ?? response?.amount ?? null, // in paise
    amountRupees: paymentObj?.amountRupees ?? response?.amountRupees ?? null, // in rupees
    consultancyRequestId:
      paymentObj?.consultancyRequestId ||
      consultancyReq?.id ||
      response?.consultancyRequestId ||
      null,
    consultancyRequest: consultancyReq,
    payment: paymentObj,
    razorpayPaymentId: resolvedPaymentId,
    razorpayOrderId:
      paymentObj?.razorpayOrderId ||
      response?.razorpayOrderId ||
      null,
    paidAt: paymentObj?.paidAt || response?.paidAt || null,
    expiresAt: paymentObj?.expiresAt || response?.expiresAt || null,
  };
};

/* ================================================================
   GET USER PAYMENTS HISTORY
================================================================ */

/**
 * Retrieves paginated list of user's payment records.
 *
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 */
export const getUserPayments = async ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  // Real backend shape verified on 2026-10-21:
  // { success: true, data: [ ...payments ], pagination: { total, page, limit, totalPages } }
  const response = await apiRequest(`/user/payments?${params.toString()}`, {
    method: "GET",
    cache: false,
  });

  return {
    success: response?.success ?? true,
    data: Array.isArray(response?.data) ? response.data : [],
    pagination: response?.pagination ?? {
      total: 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: 1,
    },
  };
};

/* ================================================================
   GET USER BOOKINGS (List with Tab Counts & Timeline Detail)
   Backend README §30 API Contract
================================================================ */

/**
 * Retrieves paginated list of user's consultancy bookings with tab counts.
 * Clamps limit to max 50 client-side to prevent backend 400 Zod error.
 *
 * @param {Object} options
 * @param {'ALL'|'UPCOMING'|'PROCESSING'|'COMPLETED'|'REFUNDED'} [options.status='ALL']
 * @param {string} [options.from] - ISO date or YYYY-MM-DD
 * @param {string} [options.to] - ISO date or YYYY-MM-DD
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {Promise<{success: boolean, bookings: Array, pagination: Object, counts: Object}>}
 */
export const getUserBookings = async ({
  status = "ALL",
  from,
  to,
  page = 1,
  limit = 10,
} = {}) => {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
  const safePage = Math.max(1, Number(page) || 1);

  const params = new URLSearchParams();
  if (status && String(status).toUpperCase() !== "ALL") {
    params.set("status", String(status).toUpperCase());
  } else {
    params.set("status", "ALL");
  }

  if (from) params.set("from", String(from));
  if (to) params.set("to", String(to));
  params.set("page", String(safePage));
  params.set("limit", String(safeLimit));

  // apiRequest prepends API_BASE_URL (which ends with /api), so path has NO /api prefix
  const response = await apiRequest(`/user/bookings?${params.toString()}`, {
    method: "GET",
    cache: false,
  });

  return {
    success: response?.success ?? true,
    bookings: Array.isArray(response?.bookings) ? response.bookings : [],
    pagination: response?.pagination ?? {
      page: safePage,
      limit: safeLimit,
      total: response?.bookings?.length || 0,
      totalPages: 1,
      hasNextPage: false,
    },
    counts: response?.counts ?? {
      ALL: 0,
      UPCOMING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      REFUNDED: 0,
    },
  };
};

/**
 * Retrieves single booking detail by ID (ConsultancyRequest ID or Payment ID for PROCESSING items)
 * including full audit timeline.
 *
 * @param {string} id - Booking UUID
 * @returns {Promise<{success: boolean, booking: Object}>}
 */
export const getUserBookingById = async (id) => {
  if (!id) {
    throw new Error("Booking ID is required.");
  }

  // apiRequest prepends API_BASE_URL (which ends with /api), so path has NO /api prefix
  const response = await apiRequest(`/user/bookings/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: false,
  });

  return {
    success: response?.success ?? true,
    booking: response?.booking || null,
  };
};