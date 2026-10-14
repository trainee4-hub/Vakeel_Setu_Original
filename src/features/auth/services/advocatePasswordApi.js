import { API_BASE_URL } from "@shared/services/apiClient";

export class AdvocatePasswordApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);

    this.name = "AdvocatePasswordApiError";
    this.status = status;
    this.data = data;
  }
}

const parseErrorMessage = (data, fallback) => {
  if (Array.isArray(data?.errors) && data.errors.length) {
    const messages = data.errors
      .map((item) => item?.message)
      .filter(Boolean);

    if (messages.length) {
      return messages.join(" ");
    }
  }

  return data?.message || fallback;
};

const passwordRequest = async (endpoint, body) => {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("[advocatePasswordApi] POST", url);

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new AdvocatePasswordApiError(
      "Unable to connect to the server. Please try again.",
      0,
      null,
    );
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new AdvocatePasswordApiError(
      `Server returned an invalid response (${response.status}).`,
      response.status,
      {
        raw: text,
      },
    );
  }

  if (!response.ok || data?.success === false) {
    throw new AdvocatePasswordApiError(
      parseErrorMessage(
        data,
        "Unable to complete the request.",
      ),
      response.status,
      data,
    );
  }

  return data;
};

/* ============================================================
   REQUEST RESET OTP
============================================================ */

export const advocateForgotPassword = (payload) =>
  passwordRequest(
    "/advocate/forgot-password",
    payload,
  );

/* ============================================================
   RESEND RESET OTP
============================================================ */

export const advocateResendResetOtp = (payload) =>
  passwordRequest(
    "/advocate/resend-reset-otp",
    payload,
  );

/* ============================================================
   VERIFY RESET OTP
============================================================ */

export const advocateVerifyResetOtp = (payload) =>
  passwordRequest(
    "/advocate/verify-reset-otp",
    payload,
  );

/* ============================================================
   RESET PASSWORD
============================================================ */

export const advocateResetPassword = (payload) =>
  passwordRequest(
    "/advocate/reset-password",
    payload,
  );