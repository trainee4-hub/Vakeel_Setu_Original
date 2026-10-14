import {
  API_BASE_URL,
  ApiError,
  apiRequest,
} from "@shared/services/apiClient";

/* =========================================================================
   ERROR
============================================================================ */

export class AuthApiError extends Error {
  constructor(
    message,
    status = 0,
    data = null,
  ) {
    super(message);

    this.name =
      "AuthApiError";

    this.status =
      status;

    this.data =
      data;

    this.code =
      data?.code || null;
  }
}

/* =========================================================================
   REQUEST WRAPPER
============================================================================ */

async function authRequest(
  path,
  options = {},
) {
  try {
    return await apiRequest(
      path,
      options,
    );
  } catch (error) {
    if (
      error instanceof
      AuthApiError
    ) {
      throw error;
    }

    if (
      error instanceof
      ApiError
    ) {
      throw new AuthApiError(
        error.message,
        error.status,
        error.data,
      );
    }

    throw new AuthApiError(
      error?.message ||
        "Something went wrong. Please try again.",
      0,
      null,
    );
  }
}

/* =========================================================================
   GOOGLE REGISTRATION
============================================================================ */

/**
 * README's newer unified OAuth contract:
 *
 * client = web | mobile
 *
 * Web registration callbacks:
 *
 * USER:
 * /register/user?step=2&registrationId=...
 *
 * ADVOCATE:
 * /register/advocate?step=2&registrationId=...
 */

function buildGoogleRegistrationUrl(
  role,
  registrationId = "",
) {
  const url =
    new URL(
      `${API_BASE_URL}/auth/${role}/google/register`,
    );

  /*
   * Latest README contract.
   */
  url.searchParams.set(
    "client",
    "web",
  );

  if (registrationId) {
    url.searchParams.set(
      "registrationId",
      registrationId,
    );
  }

  return url.toString();
}

export function getUserGoogleRegisterUrl(
  registrationId = "",
) {
  return buildGoogleRegistrationUrl(
    "user",
    registrationId,
  );
}

export function getAdvocateGoogleRegisterUrl(
  registrationId = "",
) {
  return buildGoogleRegistrationUrl(
    "advocate",
    registrationId,
  );
}

/* =========================================================================
   USER REGISTRATION
============================================================================ */

/* -------------------------------------------------------------------------
   STEP 1 — START REGISTRATION

   POST /api/auth/user/register/start
--------------------------------------------------------------------------- */

export async function startUserRegistration({
  fullName,
  email,
  registrationId,
}) {
  const cleanName =
    String(
      fullName || "",
    ).trim();

  const cleanEmail =
    String(
      email || "",
    )
      .trim()
      .toLowerCase();

  if (!cleanName) {
    throw new AuthApiError(
      "Full name is required.",
    );
  }

  if (!cleanEmail) {
    throw new AuthApiError(
      "Email is required.",
    );
  }

  return authRequest(
    "/auth/user/register/start",
    {
      method: "POST",

      body: {
        fullName:
          cleanName,

        email:
          cleanEmail,

        ...(registrationId
          ? {
              registrationId,
            }
          : {}),
      },
    },
  );
}

/* -------------------------------------------------------------------------
   RESEND USER REGISTRATION EMAIL OTP

   POST /api/auth/user/register/resend-email-otp
--------------------------------------------------------------------------- */

export async function resendUserRegistrationEmailOtp({
  registrationId,
  email,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanEmail =
    String(
      email || "",
    )
      .trim()
      .toLowerCase();

  if (!cleanEmail) {
    throw new AuthApiError(
      "Email is required.",
    );
  }

  return authRequest(
    "/auth/user/register/resend-email-otp",
    {
      method: "POST",

      body: {
        registrationId,
        email:
          cleanEmail,
      },
    },
  );
}

/**
 * Backwards-compatible alias.
 *
 * Signup should preferably use
 * resendUserRegistrationEmailOtp().
 */
export async function sendEmailOtp(
  payload,
) {
  return resendUserRegistrationEmailOtp(
    payload,
  );
}

/* -------------------------------------------------------------------------
   VERIFY EMAIL

   POST /api/auth/user/verify-email
--------------------------------------------------------------------------- */

export async function verifyEmailOtp({
  registrationId,
  otp,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanOtp =
    String(
      otp || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new AuthApiError(
      "Please enter the 6-digit verification OTP.",
    );
  }

  return authRequest(
    "/auth/user/verify-email",
    {
      method: "POST",

      body: {
        registrationId,
        otp: cleanOtp,
      },
    },
  );
}

/* -------------------------------------------------------------------------
   USER REGISTRATION SESSION

   GET /api/auth/user/register/session/:registrationId
--------------------------------------------------------------------------- */

export async function getUserRegistrationSession(
  registrationId,
) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration ID is required to restore the user registration session.",
    );
  }

  return authRequest(
    `/auth/user/register/session/${encodeURIComponent(
      registrationId,
    )}`,
    {
      method: "GET",
    },
  );
}

/**
 * Backwards-compatible alias.
 */
export async function getRegistrationSession(
  registrationId,
) {
  return getUserRegistrationSession(
    registrationId,
  );
}

/* -------------------------------------------------------------------------
   USER PHONE OTP

   POST /api/auth/user/send-phone-otp
--------------------------------------------------------------------------- */

export async function sendPhoneOtp({
  registrationId,
  phone,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanPhone =
    String(
      phone || "",
    )
      .replace(/\D/g, "")
      .slice(0, 10);

  if (
    !/^\d{10}$/.test(
      cleanPhone,
    )
  ) {
    throw new AuthApiError(
      "Please enter a valid 10-digit phone number.",
    );
  }

  return authRequest(
    "/auth/user/send-phone-otp",
    {
      method: "POST",

      body: {
        registrationId,
        phone:
          cleanPhone,
      },
    },
  );
}

/* -------------------------------------------------------------------------
   VERIFY USER PHONE

   POST /api/auth/user/verify-phone
--------------------------------------------------------------------------- */

export async function verifyPhoneOtp({
  registrationId,
  otp,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanOtp =
    String(
      otp || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new AuthApiError(
      "Please enter the 6-digit phone verification OTP.",
    );
  }

  return authRequest(
    "/auth/user/verify-phone",
    {
      method: "POST",

      body: {
        registrationId,
        otp: cleanOtp,
      },
    },
  );
}

/* -------------------------------------------------------------------------
   COMPLETE USER PROFILE

   POST /api/auth/user/profile
--------------------------------------------------------------------------- */

export async function completeProfile(
  payload,
) {
  if (
    !payload?.registrationId
  ) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const body = {
    registrationId:
      payload.registrationId,

    city:
      String(
        payload.city || "",
      ).trim(),

    state:
      String(
        payload.state || "",
      ).trim(),

    pincode:
      String(
        payload.pincode || "",
      ).trim(),
  };

  if (
    typeof payload.latitude ===
      "number" &&
    typeof payload.longitude ===
      "number"
  ) {
    body.latitude =
      payload.latitude;

    body.longitude =
      payload.longitude;
  }

  return authRequest(
    "/auth/user/profile",
    {
      method: "POST",
      body,
    },
  );
}

export async function completeRegistration(
  payload,
) {
  return completeProfile(
    payload,
  );
}

/* =========================================================================
   ADVOCATE REGISTRATION
============================================================================ */

/* -------------------------------------------------------------------------
   STEP 1

   POST /api/auth/advocate/register/start
--------------------------------------------------------------------------- */

export async function startAdvocateRegistration({
  fullName,
  email,
  registrationId,
}) {
  const cleanName =
    String(
      fullName || "",
    ).trim();

  const cleanEmail =
    String(
      email || "",
    )
      .trim()
      .toLowerCase();

  if (!cleanName) {
    throw new AuthApiError(
      "Full name is required.",
    );
  }

  if (!cleanEmail) {
    throw new AuthApiError(
      "Email is required.",
    );
  }

  return authRequest(
    "/auth/advocate/register/start",
    {
      method: "POST",

      body: {
        fullName:
          cleanName,

        email:
          cleanEmail,

        ...(registrationId
          ? {
              registrationId,
            }
          : {}),
      },
    },
  );
}

/* -------------------------------------------------------------------------
   RESEND ADVOCATE EMAIL OTP
--------------------------------------------------------------------------- */

export async function resendAdvocateEmailOtp({
  registrationId,
  email,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanEmail =
    String(
      email || "",
    )
      .trim()
      .toLowerCase();

  return authRequest(
    "/auth/advocate/register/resend-email-otp",
    {
      method: "POST",

      body: {
        registrationId,
        email:
          cleanEmail,
      },
    },
  );
}

/* -------------------------------------------------------------------------
   VERIFY ADVOCATE EMAIL
--------------------------------------------------------------------------- */

export async function verifyAdvocateEmailOtp({
  registrationId,
  otp,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanOtp =
    String(
      otp || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new AuthApiError(
      "Please enter the 6-digit verification OTP.",
    );
  }

  return authRequest(
    "/auth/advocate/verify-email",
    {
      method: "POST",

      body: {
        registrationId,
        otp:
          cleanOtp,
      },
    },
  );
}

/* -------------------------------------------------------------------------
   ADVOCATE REGISTRATION SESSION
--------------------------------------------------------------------------- */

export async function getAdvocateRegistrationSession(
  registrationId,
) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration ID is required to restore the advocate registration session.",
    );
  }

  return authRequest(
    `/auth/advocate/register/session/${encodeURIComponent(
      registrationId,
    )}`,
    {
      method: "GET",
    },
  );
}

/* -------------------------------------------------------------------------
   STEP 2 — PROFILE PHOTO
--------------------------------------------------------------------------- */

export async function uploadAdvocateRegistrationPhoto(
  file,
) {
  if (!file) {
    throw new AuthApiError(
      "Please choose a profile photo.",
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      file.type,
    )
  ) {
    throw new AuthApiError(
      "Only JPG, JPEG, PNG or WEBP images are allowed.",
    );
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    throw new AuthApiError(
      "Profile photo must be smaller than 5MB.",
    );
  }

  const formData =
    new FormData();

  formData.append(
    "profilePhoto",
    file,
  );

  return authRequest(
    "/auth/advocate/upload-profile-photo",
    {
      method: "POST",
      formData,
    },
  );
}

/**
 * Backward-compatible registration alias.
 *
 * Do not confuse with:
 * /api/advocate/profile/photo
 *
 * which is for an authenticated Advocate.
 */
export const uploadAdvocateProfilePhoto =
  uploadAdvocateRegistrationPhoto;

/* -------------------------------------------------------------------------
   STEP 2 — SAVE PHOTO + GENDER
--------------------------------------------------------------------------- */

export async function updateAdvocateBasicDetails({
  registrationId,
  fullName,
  email,
  profilePhotoUrl,
  profilePhotoPublicId,
  gender,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  return authRequest(
    "/auth/advocate/register/start",
    {
      method: "POST",

      body: {
        registrationId,

        fullName:
          String(
            fullName || "",
          ).trim(),

        email:
          String(
            email || "",
          )
            .trim()
            .toLowerCase(),

        profilePhotoUrl,
        profilePhotoPublicId,
        gender,
      },
    },
  );
}

/* -------------------------------------------------------------------------
   STEP 3 — ADVOCATE PHONE OTP
--------------------------------------------------------------------------- */

export async function sendAdvocatePhoneOtp({
  registrationId,
  phone,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanPhone =
    String(
      phone || "",
    )
      .replace(/\D/g, "")
      .slice(0, 10);

  if (
    !/^\d{10}$/.test(
      cleanPhone,
    )
  ) {
    throw new AuthApiError(
      "Please enter a valid 10-digit phone number.",
    );
  }

  return authRequest(
    "/auth/advocate/send-phone-otp",
    {
      method: "POST",

      body: {
        registrationId,
        phone:
          cleanPhone,
      },
    },
  );
}

export async function verifyAdvocatePhoneOtp({
  registrationId,
  otp,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanOtp =
    String(
      otp || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new AuthApiError(
      "Please enter the 6-digit phone verification OTP.",
    );
  }

  return authRequest(
    "/auth/advocate/verify-phone",
    {
      method: "POST",

      body: {
        registrationId,
        otp:
          cleanOtp,
      },
    },
  );
}

/* =========================================================================
   ADVOCATE AADHAAR OTP
============================================================================ */

export async function generateAdvocateAadhaarOtp({
  registrationId,
  aadhaarNumber,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanAadhaar =
    String(
      aadhaarNumber || "",
    )
      .replace(/\D/g, "")
      .slice(0, 12);

  if (
    !/^\d{12}$/.test(
      cleanAadhaar,
    )
  ) {
    throw new AuthApiError(
      "Aadhaar number must be exactly 12 digits.",
    );
  }

  return authRequest(
    "/auth/advocate/aadhaar/otp/generate",
    {
      method: "POST",

      body: {
        registrationId,

        /*
         * Backend README explicitly requires snake_case.
         */
        aadhaar_number:
          cleanAadhaar,
      },
    },
  );
}

export async function verifyAdvocateAadhaarOtp({
  registrationId,
  referenceId,
  otp,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  if (!referenceId) {
    throw new AuthApiError(
      "Aadhaar OTP reference ID is missing.",
    );
  }

  const cleanOtp =
    String(
      otp || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new AuthApiError(
      "Please enter the 6-digit Aadhaar OTP.",
    );
  }

  return authRequest(
    "/auth/advocate/aadhaar/otp/verify",
    {
      method: "POST",

      body: {
        registrationId,

        /*
         * Backend README explicitly requires snake_case.
         */
        reference_id:
          referenceId,

        otp:
          cleanOtp,
      },
    },
  );
}

/* =========================================================================
   ADVOCATE DIGILOCKER
============================================================================ */

export async function initiateAdvocateDigilocker({
  registrationId,
  aadhaarNumber,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanAadhaar =
    String(
      aadhaarNumber || "",
    )
      .replace(/\D/g, "")
      .slice(0, 12);

  if (
    !/^\d{12}$/.test(
      cleanAadhaar,
    )
  ) {
    throw new AuthApiError(
      "Aadhaar number must be exactly 12 digits.",
    );
  }

  return authRequest(
    "/auth/advocate/aadhaar/initiate",
    {
      method: "POST",

      body: {
        registrationId,
        aadhaarNumber:
          cleanAadhaar,
      },
    },
  );
}

export async function verifyAdvocateDigilocker({
  registrationId,
  clientId,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  if (!clientId) {
    throw new AuthApiError(
      "DigiLocker verification session is missing.",
    );
  }

  return authRequest(
    "/auth/advocate/aadhaar/verify",
    {
      method: "POST",

      body: {
        registrationId,
        clientId,
      },
    },
  );
}

/* =========================================================================
   COMPLETE ADVOCATE REGISTRATION
============================================================================ */

export async function completeAdvocateRegistration({
  registrationId,
  barCouncilId,
  aadhaarNumber,
  password,
  languagesSpoken,
  state,
  city,
  pincode,
  latitude,
  longitude,
}) {
  if (!registrationId) {
    throw new AuthApiError(
      "Registration session is missing.",
    );
  }

  const cleanPincode =
    String(
      pincode || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanPincode,
    )
  ) {
    throw new AuthApiError(
      "Pincode must be exactly 6 digits.",
    );
  }

  const body = {
    registrationId,

    barCouncilId:
      String(
        barCouncilId || "",
      ).trim(),

    aadhaarNumber:
      String(
        aadhaarNumber || "",
      )
        .replace(/\D/g, "")
        .slice(0, 12),

    password:
      String(
        password || "",
      ),

    languagesSpoken:
      Array.isArray(
        languagesSpoken,
      )
        ? languagesSpoken
        : [],

    state:
      String(
        state || "",
      ).trim(),

    city:
      String(
        city || "",
      ).trim(),

    pincode:
      cleanPincode,
  };

  /*
   * README says latitude / longitude are optional.
   */
  if (
    typeof latitude ===
      "number" &&
    typeof longitude ===
      "number"
  ) {
    body.latitude =
      latitude;

    body.longitude =
      longitude;
  }

  /*
   * IMPORTANT:
   * Do NOT send country.
   */
  return authRequest(
    "/auth/advocate/profile",
    {
      method: "POST",
      body,
    },
  );
}

/* =========================================================================
   USER LOGIN
============================================================================ */

export async function loginSendOtp({
  phone,
}) {
  const cleanPhone =
    String(
      phone || "",
    )
      .replace(/\D/g, "")
      .slice(0, 10);

  if (
    !/^\d{10}$/.test(
      cleanPhone,
    )
  ) {
    throw new AuthApiError(
      "Phone number is required.",
    );
  }

  return authRequest(
    "/auth/user/login/send-otp",
    {
      method: "POST",

      body: {
        phone:
          cleanPhone,
      },
    },
  );
}

export async function loginVerifyOtp({
  phone,
  otp,
}) {
  return authRequest(
    "/auth/user/login/verify-otp",
    {
      method: "POST",

      body: {
        phone:
          String(
            phone || "",
          ).trim(),

        otp:
          String(
            otp || "",
          ).trim(),
      },
    },
  );
}

export async function loginSendEmailOtp({
  email,
}) {
  const cleanEmail =
    String(
      email || "",
    )
      .trim()
      .toLowerCase();

  if (!cleanEmail) {
    throw new AuthApiError(
      "Email is required.",
    );
  }

  return authRequest(
    "/auth/user/login/send-email-otp",
    {
      method: "POST",

      body: {
        email:
          cleanEmail,
      },
    },
  );
}

export async function loginVerifyEmailOtp({
  email,
  otp,
}) {
  return authRequest(
    "/auth/user/login/verify-email-otp",
    {
      method: "POST",

      body: {
        email:
          String(
            email || "",
          )
            .trim()
            .toLowerCase(),

        otp:
          String(
            otp || "",
          ).trim(),
      },
    },
  );
}

/* =========================================================================
   CURRENT AUTH USER
============================================================================ */

export async function getCurrentUser() {
  return authRequest(
    "/auth/me",
    {
      method: "GET",
    },
  );
}

/* =========================================================================
   LEGACY GENERIC LOGOUT
============================================================================ */

export async function logout() {
  return authRequest(
    "/auth/logout",
    {
      method: "POST",
    },
  );
}

/* =========================================================================
   USER ACCOUNT DELETION
============================================================================ */

export async function requestUserDeletionOtp() {
  return authRequest(
    "/user/delete-account/request-otp",
    {
      method: "POST",
    },
  );
}

export async function verifyUserDeletionOtp({
  otp,
}) {
  const cleanOtp =
    String(
      otp || "",
    ).trim();

  if (
    !/^\d{6}$/.test(
      cleanOtp,
    )
  ) {
    throw new AuthApiError(
      "Please enter the 6-digit verification OTP.",
    );
  }

  return authRequest(
    "/user/delete-account/verify-otp",
    {
      method: "POST",

      body: {
        otp:
          cleanOtp,
      },
    },
  );
}