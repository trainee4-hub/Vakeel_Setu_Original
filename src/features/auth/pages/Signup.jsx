import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  startUserRegistration,
  resendUserRegistrationEmailOtp,
  verifyEmailOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  completeRegistration,
  getUserRegistrationSession,
  getUserGoogleRegisterUrl,
  getAdvocateGoogleRegisterUrl,
  AuthApiError,
} from "../services/authApi";

import MessageBanner, {
  InlineSuccess,
  FieldError,
} from "../components/signup/MessageBanner";

import OtpInput from "../components/signup/OtpInput";
import { API_BASE_URL } from "@shared/services/apiClient";

/* =========================================================================
   PAGE CONFIGURATION
   ========================================================================= */
const PAGE_CONTAINER = "max-w-[1360px] mx-auto px-6";

/* API base used by the advocate endpoints + the advocate Google redirect.
   Falls back to the local backend used during development. */


/* Public India Post lookup used to resolve District + State from a pincode. */
const PINCODE_LOOKUP_URL = "https://api.postalpincode.in/pincode";
const SIGNUP_ROLE_STORAGE_KEY = "vakeel_signup_role";

/* =========================================================================
   VALIDATION
   ========================================================================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^[0-9]{6}$/;
const AADHAAR_RE = /^[0-9]{12}$/;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function validateFullName(name) {
  const value = name.trim();
  if (!value) return "Please enter your full name.";
  if (value.length < 3) return "Full name must be at least 3 characters.";
  return "";
}

function validateEmail(email) {
  const value = email.trim();
  if (!value) return "Please enter your email address.";
  if (!EMAIL_RE.test(value)) return "Please enter a valid email address.";
  return "";
}

function validatePhone(phone) {
  const value = phone.trim();
  if (!value) return "Please enter your phone number.";
  if (!PHONE_RE.test(value)) return "Please enter a valid 10-digit phone number.";
  return "";
}

function validatePincode(pincode) {
  const value = pincode.trim();
  if (!value) return "Please enter your pincode.";
  if (!PINCODE_RE.test(value)) return "Please enter a valid 6-digit pincode.";
  return "";
}

function validateDistrict(district) {
  const value = district.trim();
  if (!value) return "Please enter your district.";
  if (value.length < 2) return "District must be at least 2 characters.";
  if (value.length > 100) return "District must be under 100 characters.";
  return "";
}

function validateState(state) {
  const value = state.trim();
  if (!value) return "Please enter your state.";
  if (value.length > 100) return "State must be under 100 characters.";
  return "";
}

function validateBarCouncilId(
  value,
) {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "Please enter your Bar Council ID.";
  }

  if (
    trimmed.length < 3 ||
    trimmed.length > 50
  ) {
    return "Bar Council ID must be between 3 and 50 characters.";
  }

  return "";
}

function validateAadhaar(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your Aadhaar number.";
  if (!AADHAAR_RE.test(trimmed))
    return "Aadhaar number must be exactly 12 digits.";
  return "";
}

function validateLanguages(languages) {
  return languages.length ? "" : "Please select at least one language.";
}

function validatePassword(password) {
  if (!password) return "Please create a password.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(password))
    return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number.";
  return "";
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
}

function validateProfilePhoto(file) {
  if (!file) return "Please select a photo to upload.";
  if (!ALLOWED_PHOTO_TYPES.includes(file.type))
    return "Only JPG, JPEG, PNG or WEBP images are allowed.";
  if (file.size > MAX_PHOTO_BYTES) return "Photo must be smaller than 5MB.";
  return "";
}

function formatBlockedUntil(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function maskAadhaar(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 12) return digits || "—";
  return `XXXX XXXX ${digits.slice(8)}`;
}

/* Trims a value only when it is genuinely a non-empty string. */
function cleanLookupValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

/* =========================================================================
   ADVOCATE API CLIENT
   These call the advocate endpoints exactly as documented. Move this block
   into services/authApi.js if you prefer all HTTP in one place.
   ========================================================================= */

class AdvocateApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "AdvocateApiError";
    this.status = status;
    /* The raw body is kept so callers can read remainingAttempts / blocked /
       blockedUntil straight off a 400 without re-parsing anything. */
    this.data = data || null;
    this.code = data?.code;
  }
}

function fallbackForStatus(status) {
  switch (status) {
    case 400:
    case 422:
      return "Please check the details you entered and try again.";
    case 401:
      return "Your registration session is no longer valid. Please start again.";
    case 403:
      return "This action isn't allowed right now.";
    case 409:
      return "An account with these details already exists. Please log in instead.";
    case 404:
      return "This service isn't available right now. Please try again later.";
    case 429:
      return "Too many attempts. Please wait a while before trying again.";
    case 500:
    case 502:
    case 503:
      return "The server ran into a problem. Please try again in a moment.";
    default:
      return "We couldn't complete your request right now. Please try again.";
  }
}

/* Backends sometimes return long technical strings. Only surface short,
   human-readable messages so stack traces never reach the UI. */
function isDisplayableMessage(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 240) return false;
  if (/\bat\s+\w+\s+\(/.test(trimmed)) return false;
  return true;
}

function sanitizeServerMessage(data) {
  if (!data) return "";

  /* Plain { message } / { error } shape. */
  const direct = data.message || data.error;
  if (isDisplayableMessage(direct)) return direct.trim();

  /* express-validator / class-validator shape:
     { errors: [{ msg, param }] } or { errors: ["..."] } */
  const list = Array.isArray(data.errors)
    ? data.errors
    : Array.isArray(data.error)
      ? data.error
      : null;

  if (list?.length) {
    const messages = list
      .map((entry) =>
        typeof entry === "string" ? entry : entry?.msg || entry?.message
      )
      .filter(isDisplayableMessage)
      .map((entry) => entry.trim());

    const joined = [...new Set(messages)].join(" ");
    if (isDisplayableMessage(joined)) return joined;
  }

  return "";
}

async function advocateRequest(
  path,
  { method = "POST", body, formData } = {}
) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      ...(formData ? {} : { headers: { "Content-Type": "application/json" } }),
      body: formData ? formData : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AdvocateApiError(
      "We couldn't reach the server. Please check your connection and try again."
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || data?.success === false) {
    /* Dev-only diagnostics: the banner shows a friendly message, but the
       console needs the route, status and raw body to be debuggable. */
    if (import.meta.env?.DEV) {
      console.warn(
        `[advocate api] ${method} ${path} -> ${response.status}`,
        data
      );
    }

    throw new AdvocateApiError(
      sanitizeServerMessage(data) || fallbackForStatus(response.status),
      response.status,
      data
    );
  }

  return data ?? {};
}

const advocateApi = {
  startRegistration: (payload) =>
    advocateRequest("/auth/advocate/register/start", { body: payload }),

  resendEmailOtp: (payload) =>
    advocateRequest("/auth/advocate/register/resend-email-otp", {
      body: payload,
    }),

  verifyEmail: (payload) =>
    advocateRequest("/auth/advocate/verify-email", { body: payload }),

  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append("profilePhoto", file);
    return advocateRequest("/auth/advocate/upload-profile-photo", {
      formData,
    });
  },

  sendPhoneOtp: (payload) =>
    advocateRequest("/auth/advocate/send-phone-otp", { body: payload }),

  verifyPhone: (payload) =>
    advocateRequest("/auth/advocate/verify-phone", { body: payload }),

  /* --- Aadhaar: OTP method --- */

  generateAadhaarOtp: ({ registrationId, aadhaarNumber }) =>
    advocateRequest("/auth/advocate/aadhaar/otp/generate", {
      body: { registrationId, aadhaar_number: aadhaarNumber },
    }),

  verifyAadhaarOtp: ({ registrationId, referenceId, otp }) =>
    advocateRequest("/auth/advocate/aadhaar/otp/verify", {
      body: { registrationId, reference_id: referenceId, otp },
    }),

  /* --- Aadhaar: DigiLocker method --- */

  initiateDigilocker: ({ registrationId, aadhaarNumber }) =>
    advocateRequest("/auth/advocate/aadhaar/initiate", {
      body: { registrationId, aadhaarNumber },
    }),

  verifyDigilocker: ({ registrationId, clientId }) =>
    advocateRequest("/auth/advocate/aadhaar/verify", {
      body: { registrationId, clientId },
    }),

  completeProfile: (payload) =>
    advocateRequest("/auth/advocate/profile", { body: payload }),

  getSession: (registrationId) =>
    advocateRequest(
      `/auth/advocate/register/session/${encodeURIComponent(
        registrationId
      )}`,
      { method: "GET" }
    ),
};

/* =========================================================================
   USER REGISTRATION SESSION

   Used after Google OAuth returns to:
   /signup?step=2&registrationId=...
   ========================================================================= */

// async function getUserRegistrationSession(registrationId) {
//   if (!registrationId) {
//     throw new Error(
//       "Registration session is missing. Please restart signup."
//     );
//   }

//   let response;

//   try {
//     response = await fetch(
//       `${API_BASE_URL}/auth/user/register/session/${encodeURIComponent(
//         registrationId
//       )}`,
//       {
//         method: "GET",
//         credentials: "include",
//         headers: { Accept: "application/json" },
//       }
//     );
//   } catch {
//     throw new Error(
//       "We couldn't reach the server while restoring your registration."
//     );
//   }

//   let data = null;

//   try {
//     data = await response.json();
//   } catch {
//     data = null;
//   }

//   if (!response.ok || data?.success === false) {
//     throw new Error(
//       sanitizeServerMessage(data) || fallbackForStatus(response.status)
//     );
//   }

//   return data ?? {};
// }

/* =========================================================================
   ERROR HANDLING
   ========================================================================= */

function describeApiError(err, context = "") {
  if (err instanceof AdvocateApiError) {
    return {
      title: "Something went wrong",
      message: err.message,
    };
  }

  const code = err instanceof AuthApiError ? err.code : "NETWORK_ERROR";

  switch (code) {
    case "EMAIL_EXISTS":
      return {
        title: "Email already registered",
        message: "This email is already associated with an account.",
        showLoginLink: true,
      };

    case "INVALID_OTP":
      return {
        title: context === "phone" ? "Invalid phone OTP" : "Invalid email OTP",
        message:
          "The verification code you entered is incorrect. Please try again.",
      };

    case "OTP_EXPIRED":
      return {
        title: "Verification code expired",
        message:
          "This verification code has expired. Please request a new one.",
      };

    default:
      return {
        title: "Something went wrong",
        message:
          "We couldn't complete your request right now. Please try again.",
      };
  }
}

/* Short message-only helper for inline field errors. */
function errorMessage(error, fallback, context = "") {
  if (error instanceof AdvocateApiError && error.message) return error.message;
  if (error instanceof AuthApiError) return describeApiError(error, context).message;

  /* Messages we throw ourselves are already user-facing; anything else
     (TypeError, etc.) falls back to the friendly default. */
  if (
    error?.name === "Error" &&
    typeof error.message === "string" &&
    error.message.length <= 180 &&
    !error.message.includes("\n")
  ) {
    return error.message;
  }

  return fallback;
}

function describeGeolocationError(error) {
  switch (error?.code) {
    case 1:
      return "Location access was blocked. Please allow location access in your browser and try again.";
    case 2:
      return "We couldn't determine your location. Please turn on location services and try again.";
    case 3:
      return "The location request timed out. Please try again.";
    default:
      return "We couldn't access your location. Please enable location services and try again.";
  }
}

function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: "UNSUPPORTED" });
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

/* =========================================================================
   STEP INDICATOR — USER FLOW (unchanged design)
   ========================================================================= */

function StepIndicator({ step, emailVerified, phoneVerified }) {
  return (
    <div className="mb-7 flex items-center">
      <StepBadge
        index={1}
        label="Account"
        active={step === 1}
        done={emailVerified}
      />

      <div
        className={`mx-2 h-px flex-1 transition-colors duration-300 ${
          emailVerified ? "bg-amber-400" : "bg-slate-200"
        }`}
      />

      <StepBadge
        index={2}
        label="Phone"
        active={step === 2}
        done={phoneVerified}
      />

      <div
        className={`mx-2 h-px flex-1 transition-colors duration-300 ${
          phoneVerified ? "bg-amber-400" : "bg-slate-200"
        }`}
      />

      <StepBadge
        index={3}
        label="Profile"
        active={step === 3}
        done={false}
      />
    </div>
  );
}

function StepBadge({ index, label, active, done }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full",
          "text-xs font-bold transition-all duration-300",
          done
            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
            : active
              ? "scale-110 bg-amber-500 text-white shadow-md shadow-amber-500/25"
              : "bg-slate-100 text-slate-400",
        ].join(" ")}
      >
        {done ? (
          <span className="material-symbols-outlined text-[17px]">check</span>
        ) : (
          index
        )}
      </span>

      <span
        className={[
          "hidden text-xs font-semibold transition-colors duration-300 sm:inline",
          active
            ? "text-slate-900"
            : done
              ? "text-slate-600"
              : "text-slate-400",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

/* =========================================================================
   STEP INDICATOR — ADVOCATE FLOW (7 steps)
   ========================================================================= */

const ADVOCATE_STEPS = [
  { id: 1, label: "Account", subtitle: "Start with your basic information." },
  { id: 2, label: "Photo & Gender", subtitle: "Add a photo clients will see." },
  { id: 3, label: "Phone", subtitle: "Verify your mobile number." },
  {
    id: 4,
    label: "Professional",
    subtitle: "Tell us about your practice credentials.",
  },
  { id: 5, label: "Security", subtitle: "Create a password for your account." },
  { id: 6, label: "Location", subtitle: "Where do you practice?" },
  { id: 7, label: "Review", subtitle: "Check everything before you finish." },
];

const ADVOCATE_TOTAL_STEPS = ADVOCATE_STEPS.length;

function AdvocateStepIndicator({ step }) {
  const current =
    ADVOCATE_STEPS.find((entry) => entry.id === step) ?? ADVOCATE_STEPS[0];

  const percent = Math.round((step / ADVOCATE_TOTAL_STEPS) * 100);

  return (
    <div className="mb-7">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600">
          Step {step} of {ADVOCATE_TOTAL_STEPS}
        </span>

        <span className="text-[11px] font-semibold text-slate-500">
          {current.label}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* =========================================================================
   FORM INPUT
   ========================================================================= */

function FormInput({ icon, label, error, success, action, ...props }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[13px] font-semibold text-slate-700">
          {label}
        </label>

        {success && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="material-symbols-outlined text-[15px]">
              verified
            </span>
            Verified
          </span>
        )}
      </div>

     <div
  className={[
    "group flex min-h-[48px] items-center gap-2.5 rounded-xl",
    "bg-slate-50/80 px-3.5",
    "border border-transparent",
    "transition-all duration-200",
    "hover:bg-slate-100/70",
    "focus-within:bg-white",
    "focus-within:border-amber-500",
    "focus-within:ring-2",
    "focus-within:ring-amber-500/20",
    "focus-within:hover:bg-white",
    error
      ? "border-red-400 ring-2 ring-red-100 bg-red-50/30"
      : "",
  ].join(" ")}
>
  {icon && (
    <span
      className={[
        "material-symbols-outlined shrink-0 text-[19px]",
        "text-slate-400 transition-colors duration-200",
        "group-focus-within:text-amber-500",
        error ? "text-red-400" : "",
      ].join(" ")}
    >
      {icon}
    </span>
  )}

  <input
    {...props}
    className="
      min-w-0
      flex-1
      w-full
      border-0
      border-transparent
      bg-transparent
      py-3
      text-[13px]
      font-medium
      text-slate-800
      outline-none
      ring-0
      focus:border-0
      focus:border-transparent
      focus:outline-none
      focus:ring-0
      placeholder:text-slate-400
    "
  />

  {action}

  {success && (
    <span className="material-symbols-outlined shrink-0 text-[18px] text-emerald-500">
      check_circle
    </span>
  )}
</div>

      <FieldError text={error} />
    </div>
  );
}

/* =========================================================================
   SEARCHABLE SELECT
   ========================================================================= */

function SearchableSelect({
  label,
  icon,
  placeholder = "Select...",
  value,
  options = [],
  onChange,
  error,
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("")
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    direction: "down",
  });

  /* -----------------------------------------------------------------------
     Filter options
  ----------------------------------------------------------------------- */

  const filteredOptions = options.filter((option) =>
    option
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* -----------------------------------------------------------------------
     Calculate dropdown position
  ----------------------------------------------------------------------- */

  const updatePosition = () => {
    if (!wrapperRef.current) return;

    const rect =
      wrapperRef.current.getBoundingClientRect();

    const dropdownHeight = 300;
    const gap = 6;

    const spaceBelow =
      window.innerHeight - rect.bottom;

    const spaceAbove = rect.top;

    /*
      If there is not enough space below
      but enough space above -> open upward.
    */

    const shouldOpenUp =
      spaceBelow < dropdownHeight &&
      spaceAbove > spaceBelow;

    setPosition({
      left: rect.left,
      width: rect.width,
      top: shouldOpenUp
        ? Math.max(
            8,
            rect.top - dropdownHeight - gap
          )
        : rect.bottom + gap,
      direction: shouldOpenUp
        ? "up"
        : "down",
    });
  };

  /* -----------------------------------------------------------------------
     Open dropdown
  ----------------------------------------------------------------------- */

  const handleOpen = () => {
    if (disabled) return;

    updatePosition();
    setOpen(true);
  };

  /* -----------------------------------------------------------------------
     Update position while scrolling/resizing
  ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener(
      "resize",
      handleUpdate
    );

    window.addEventListener(
      "scroll",
      handleUpdate,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleUpdate
      );

      window.removeEventListener(
        "scroll",
        handleUpdate,
        true
      );
    };
  }, [open]);

  /* -----------------------------------------------------------------------
     Outside click
  ----------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      const clickedInsideSelect =
        wrapperRef.current?.contains(
          event.target
        );

      const clickedInsideDropdown =
        dropdownRef.current?.contains(
          event.target
        );

      if (
        !clickedInsideSelect &&
        !clickedInsideDropdown
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  /* -----------------------------------------------------------------------
     Select option
  ----------------------------------------------------------------------- */

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      {/* ================================================================
          SELECT FIELD
      ================================================================ */}

      <div
        ref={wrapperRef}
        className="w-full"
      >
        <label className="mb-2 block text-[13px] font-semibold text-slate-700">
          {label}
        </label>

        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          className={[
            "group flex w-full min-h-[48px]",
            "items-center gap-2.5 rounded-xl",
            "px-3.5",
            "text-left",
            "transition-all duration-200",
            "outline-none",
            "border-0",
            "appearance-none",
            "focus:outline-none",
            disabled
              ? "cursor-not-allowed bg-slate-100 opacity-60"
              : "cursor-pointer bg-slate-50/80 hover:bg-slate-100/80",
            open
              ? "bg-white ring-2 ring-amber-500/70"
              : "",
            error
              ? "bg-red-50/30 ring-2 ring-red-100"
              : "",
          ].join(" ")}
        >
          {/* Icon */}

          {icon && (
            <span
              className={[
                "material-symbols-outlined",
                "shrink-0 text-[19px]",
                "transition-colors",
                open
                  ? "text-amber-500"
                  : "text-slate-400",
                error
                  ? "text-red-400"
                  : "",
              ].join(" ")}
            >
              {icon}
            </span>
          )}

          {/* Selected value */}

          <span
            className={[
              "min-w-0 flex-1",
              "truncate",
              "py-3",
              "text-[13px]",
              "font-medium",
              value
                ? "text-slate-800"
                : "text-slate-400",
            ].join(" ")}
          >
            {value || placeholder}
          </span>

          {/* Arrow */}

          <span
            className={[
              "material-symbols-outlined",
              "shrink-0 text-[19px]",
              "transition-transform duration-200",
              open
                ? "rotate-180 text-amber-500"
                : "text-slate-400",
            ].join(" ")}
          >
            expand_more
          </span>
        </button>

        {error && (
          <p className="mt-1.5 text-[11px] font-medium text-red-500">
            {error}
          </p>
        )}
      </div>

      {/* ================================================================
          DROPDOWN
          Fixed positioning prevents clipping
      ================================================================ */}

      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 99999,
          }}
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_20px_50px_rgba(15,23,42,0.16)]
          "
        >
          {/* Search */}

          <div className="border-b border-slate-100 p-2.5">
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-amber-200
                bg-white
                px-3
                transition-all
                focus-within:ring-2
                focus-within:ring-amber-500/20
              "
            >
              <span className="material-symbols-outlined shrink-0 text-[19px] text-slate-400">
                search
              </span>

              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={`Search ${label.toLowerCase()}...`}
                className="
                  min-w-0
                  flex-1
                  border-0
                  bg-transparent
                  py-2.5
                  text-[13px]
                  font-medium
                  text-slate-800
                  outline-none
                  ring-0
                  focus:border-0
                  focus:outline-none
                  focus:ring-0
                  placeholder:text-slate-400
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    flex
                    h-6
                    w-6
                    items-center
                    justify-center
                    rounded-full
                    text-slate-400
                    hover:bg-slate-100
                    hover:text-slate-600
                  "
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Options */}

          <div className="max-h-[240px] overflow-y-auto p-1.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected =
                  option === value;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      handleSelect(option)
                    }
                    className={[
                      "flex w-full items-center",
                      "justify-between",
                      "rounded-xl",
                      "px-3 py-2.5",
                      "text-left",
                      "text-[13px]",
                      "font-medium",
                      "transition-colors",
                      selected
                        ? "bg-amber-50 text-amber-600"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <span>{option}</span>

                    {selected && (
                      <span className="material-symbols-outlined text-[17px] text-amber-500">
                        check
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center">
                <span className="material-symbols-outlined text-[24px] text-slate-300">
                  search_off
                </span>

                <p className="mt-2 text-[12px] font-medium text-slate-400">
                  No {label.toLowerCase()} found
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================================
   CHIP SELECT — single (gender) or multi (languages)
   ========================================================================= */

function ChipSelect({
  label,
  hint,
  options,
  value,
  onChange,
  error,
  multiple = false,
}) {
  const selectedValues = multiple ? value : value ? [value] : [];

  const toggle = (option) => {
    if (multiple) {
      onChange(
        value.includes(option)
          ? value.filter((entry) => entry !== option)
          : [...value, option]
      );
      return;
    }

    onChange(value === option ? "" : option);
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-semibold text-slate-700">
          {label}
        </label>

        {hint && (
          <span className="text-[11px] text-slate-400">{hint}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = selectedValues.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              aria-pressed={selected}
              className={[
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2",
                "text-[12px] font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-amber-500/40 focus-visible:ring-offset-2",
                selected
                  ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/10"
                  : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white",
              ].join(" ")}
            >
              {selected && (
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
              )}
              {option}
            </button>
          );
        })}
      </div>

      <FieldError text={error} />
    </div>
  );
}

/* =========================================================================
   BUTTONS
   ========================================================================= */

const PRIMARY_BUTTON_CLASSES = `
  flex
  w-full
  items-center
  justify-center
  gap-2
  rounded-xl
  bg-amber-500
  font-bold
  text-white
  shadow-sm
  shadow-amber-500/20
  transition-all
  duration-200
  hover:-translate-y-0.5
  hover:bg-amber-600
  hover:shadow-md
  active:translate-y-0
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-amber-500/40
  focus-visible:ring-offset-2
  disabled:cursor-not-allowed
  disabled:opacity-50
  disabled:hover:translate-y-0
`;

function PrimaryButton({
  children,
  loading = false,
  loadingText = "Please wait...",
  icon = "arrow_forward",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        PRIMARY_BUTTON_CLASSES,
        size === "sm" ? "py-2.5 text-[12px]" : "py-3 text-[13px]",
        className,
      ].join(" ")}
    >
      {loading ? (
        <>
          <span
            className={[
              "animate-spin rounded-full border-2 border-white/40 border-t-white",
              size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
            ].join(" ")}
          />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {icon && (
            <span className="material-symbols-outlined text-[17px]">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function SecondaryButton({ children, icon = "arrow_back", ...props }) {
  return (
    <button
      {...props}
      type="button"
      className="
        flex
        shrink-0
        items-center
        justify-center
        gap-1.5
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3
        text-[13px]
        font-bold
        text-slate-600
        transition-all
        duration-200
        hover:border-slate-300
        hover:bg-slate-50
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-amber-500/40
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {icon && (
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      )}
      {children}
    </button>
  );
}

function StepNav({
  onBack,
  backLabel = "Back",
  onContinue,
  continueLabel = "Continue",
  continueIcon = "arrow_forward",
  loading = false,
  loadingText = "Saving...",
  disabled = false,
}) {
  return (
    <div className="flex items-center gap-3">
      {onBack && (
        <SecondaryButton onClick={onBack} disabled={loading}>
          {backLabel}
        </SecondaryButton>
      )}

      <PrimaryButton
        type="button"
        onClick={onContinue}
        loading={loading}
        loadingText={loadingText}
        disabled={disabled}
        icon={continueIcon}
      >
        {continueLabel}
      </PrimaryButton>
    </div>
  );
}

/* =========================================================================
   SECTION HEADING (advocate steps)
   ========================================================================= */

function StepHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-600">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-sm font-bold text-slate-900">{title}</h3>

      {description && (
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   ROLE CARD
   ========================================================================= */

function RoleCard({ icon, title, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group relative flex flex-col items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-2",
        selected
          ? "border-amber-400 bg-amber-50/70 shadow-sm shadow-amber-500/10"
          : "border-slate-200 bg-slate-50/70 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md hover:shadow-slate-900/5",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200",
          selected
            ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20"
            : "border border-slate-200 bg-white text-slate-400 group-hover:text-slate-600",
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>

      <div>
        <p
          className={[
            "text-[13px] font-bold",
            selected ? "text-slate-900" : "text-slate-700",
          ].join(" ")}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {description}
        </p>
      </div>

      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
          <span className="material-symbols-outlined text-[13px]">check</span>
        </span>
      )}
    </button>
  );
}

function VerifyAction({ verified, onClick, loading, disabled }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600">
        <span className="material-symbols-outlined text-[14px]">check</span>
        Verified
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        shrink-0
        rounded-lg
        bg-amber-500
        px-3
        py-1.5
        text-[11px]
        font-bold
        text-white
        shadow-sm
        shadow-amber-500/20
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:bg-amber-600
        hover:shadow-md
        active:translate-y-0
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-amber-500/40
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:hover:translate-y-0
      "
    >
      {loading ? "Sending..." : "Verify"}
    </button>
  );
}

/* =========================================================================
   RESEND COOLDOWN
   ========================================================================= */

function useResendCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [secondsLeft]);

  return {
    secondsLeft,
    start,
    canResend: secondsLeft === 0,
  };
}

function ResendRow({ cooldown, resending, onResend }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
      <span>Didn't receive the code?</span>

      {cooldown.canResend ? (
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          className="font-bold text-amber-600 transition-colors hover:text-amber-700 disabled:opacity-50"
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      ) : (
        <span className="font-semibold text-slate-400">
          Resend in {cooldown.secondsLeft}s
        </span>
      )}
    </div>
  );
}

/* =========================================================================
   PHONE VERIFICATION CARD
   Shared by the USER step 2 and the ADVOCATE step 3 so the OTP markup and
   behaviour exist exactly once.
   ========================================================================= */

function PhoneVerificationCard({
  eyebrow = "Contact verification",
  title = "Verify your phone number",
  description = "We'll use this number to keep your account secure.",
  phone,
  onPhoneChange,
  phoneError,
  phoneOtpSent,
  phoneOtp,
  setPhoneOtp,
  phoneOtpError,
  phoneVerified,
  sendingPhoneOtp,
  verifyingPhone,
  resendingPhoneOtp,
  cooldown,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-4">
        <StepHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>

      {/* Phone */}

      <FormInput
        icon="phone"
        label="Phone Number"
        type="tel"
        placeholder="10-digit mobile number"
        value={phone}
        onChange={(event) => onPhoneChange(event.target.value)}
        error={phoneError}
        success={phoneVerified}
        disabled={phoneVerified}
        action={
          !phoneVerified ? (
            <VerifyAction
              verified={false}
              onClick={onSendOtp}
              loading={sendingPhoneOtp}
              disabled={sendingPhoneOtp}
            />
          ) : null
        }
      />

      {/* ==============================================================
          PHONE OTP
      ============================================================== */}

      {phoneOtpSent && !phoneVerified && (
        <div className="mt-4 border-t border-slate-200/70 pt-4">
          <div className="mb-2">
            <p className="text-[11px] font-semibold text-slate-600">
              Enter verification code
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Code sent to {phone}
            </p>
          </div>

          {phoneOtpError && (
            <div className="mb-3">
              <MessageBanner
                variant="error"
                title="Verification failed"
                message={phoneOtpError}
              />
            </div>
          )}

          <OtpInput
            value={phoneOtp}
            onChange={setPhoneOtp}
            length={OTP_LENGTH}
            error={!!phoneOtpError}
            disabled={verifyingPhone}
          />

          {/* Verify phone */}

          <div className="mt-3">
            <PrimaryButton
              type="button"
              size="sm"
              onClick={onVerifyOtp}
              loading={verifyingPhone}
              loadingText="Verifying..."
              icon="check"
            >
              Verify Phone
            </PrimaryButton>
          </div>

          {/* Resend */}

          <div className="mt-3">
            <ResendRow
              cooldown={cooldown}
              resending={resendingPhoneOtp}
              onResend={onResendOtp}
            />
          </div>
        </div>
      )}

      {/* Success */}

      {phoneVerified && (
        <div className="mt-3">
          <InlineSuccess text="Phone number verified successfully" />
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   PINCODE LOCATION FIELDS

   Shared by the USER step 3 and the ADVOCATE step 6. Every value and handler
   comes from the single lookup state held in the main Signup component, so
   the API logic exists exactly once.

   Order is always: Pincode -> District -> State.
   ========================================================================= */

function PincodeLocationFields({
  pincode,
  onPincodeChange,
  pincodeError,
  lookupLoading,
  lookupStatus,
  district,
  onDistrictChange,
  districtError,
  districtAutoFilled,
  state,
  onStateChange,
  stateError,
  stateAutoFilled,
  disabled = false,
}) {
  const pincodeComplete = PINCODE_RE.test(pincode);

  /* District and State stay locked until a complete pincode has been
     entered, so nobody types a district for a pincode that will overwrite
     it a moment later. */
  const fieldsLocked = disabled || !pincodeComplete || lookupLoading;

  const statusColor =
    lookupStatus?.type === "success"
      ? "text-emerald-600"
      : lookupStatus?.type === "warning"
        ? "text-amber-600"
        : "text-slate-500";

  return (
    <div className="space-y-4">
      {/* Pincode — always first */}

      <FormInput
        icon="pin_drop"
        label="Pincode"
        placeholder="Enter 6-digit pincode"
        inputMode="numeric"
        value={pincode}
        onChange={(event) => onPincodeChange(event.target.value)}
        error={pincodeError}
        disabled={disabled}
        action={
          lookupLoading ? (
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
          ) : null
        }
      />

      {/* Lookup outcome */}

      {lookupLoading ? (
        <p className="text-[11px] font-medium text-slate-500">
          Looking up your location...
        </p>
      ) : lookupStatus?.message ? (
        lookupStatus.type === "success" ? (
          <InlineSuccess text={lookupStatus.message} />
        ) : (
          <p className={`text-[11px] font-medium leading-4 ${statusColor}`}>
            {lookupStatus.message}
          </p>
        )
      ) : null}

      {/* District + State */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          icon="location_city"
          label="District"
          placeholder={
            pincodeComplete ? "Enter your district" : "Enter pincode first"
          }
          value={district}
          onChange={(event) => onDistrictChange(event.target.value)}
          error={districtError}
          readOnly={districtAutoFilled}
          disabled={fieldsLocked}
          action={
            districtAutoFilled ? (
              <span className="material-symbols-outlined shrink-0 text-[18px] text-emerald-500">
                check_circle
              </span>
            ) : null
          }
          autoComplete="off"
        />

        {stateAutoFilled ? (
          <FormInput
            icon="map"
            label="State"
            value={state}
            onChange={(event) => onStateChange(event.target.value)}
            error={stateError}
            readOnly
            disabled={disabled}
            action={
              <span className="material-symbols-outlined shrink-0 text-[18px] text-emerald-500">
                check_circle
              </span>
            }
            autoComplete="off"
          />
        ) : (
          <SearchableSelect
            icon="map"
            label="State"
            placeholder={
              pincodeComplete ? "Select state" : "Enter pincode first"
            }
            value={state}
            options={INDIAN_STATES}
            onChange={onStateChange}
            error={stateError}
            disabled={fieldsLocked}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   OPTION DATA
   ========================================================================= */

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "English",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Urdu",
  "Kannada",
  "Malayalam",
  "Odia",
  "Punjabi",
  "Assamese",
];

/* Kept as the manual fallback for when the pincode lookup returns a District
   but no State. */
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

/* =========================================================================
   MAIN SIGNUP COMPONENT
   ========================================================================= */

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(1);

  /* =======================================================================
     STEP 1 STATE (shared by both roles)
  ======================================================================= */

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(() => {
    if (typeof window === "undefined") return "client";

    return sessionStorage.getItem(SIGNUP_ROLE_STORAGE_KEY) === "advocate"
      ? "advocate"
      : "client";
  });
  const [email, setEmail] = useState("");

  const isAdvocate = role === "advocate";

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [emailOtpStage, setEmailOtpStage] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState("");

  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [resendingEmailOtp, setResendingEmailOtp] = useState(false);

  const emailCooldown = useResendCooldown();

  const [googleLoading, setGoogleLoading] = useState(false);

  const [step1Banner, setStep1Banner] = useState(null);

  const [registrationId, setRegistrationId] = useState("");
  const [restoringSession, setRestoringSession] = useState(false);

  /* =======================================================================
     PHONE STATE (USER step 2 / ADVOCATE step 3)
  ======================================================================= */

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState("");

  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [resendingPhoneOtp, setResendingPhoneOtp] = useState(false);

  const phoneCooldown = useResendCooldown();

  /* =======================================================================
     LOCATION STATE (USER step 3 / ADVOCATE step 6)

     The UI calls this "District". The backend still expects the key `city`,
     so the value is mapped at submit time — see the two payloads below.
  ======================================================================= */

  const [pincode, setPincode] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const [pincodeError, setPincodeError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [stateError, setStateError] = useState("");

  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);
  const [pincodeLookupStatus, setPincodeLookupStatus] = useState({
    type: "",
    message: "",
  });

  const [districtAutoFilled, setDistrictAutoFilled] = useState(false);
  const [stateAutoFilled, setStateAutoFilled] = useState(false);

  const [coords, setCoords] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");

  /* =======================================================================
     SHARED SUBMIT STATE + BANNER FOR EVERY STEP AFTER STEP 1
  ======================================================================= */

  const [registering, setRegistering] = useState(false);
  const [flowBanner, setFlowBanner] = useState(null);

  /* =======================================================================
     ADVOCATE STEP 2 — PHOTO + GENDER
  ======================================================================= */

  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profilePhotoPublicId, setProfilePhotoPublicId] = useState("");
  const [gender, setGender] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingBasicDetails, setSavingBasicDetails] = useState(false);

  /* =======================================================================
     ADVOCATE STEP 4 — PROFESSIONAL INFORMATION
  ======================================================================= */

  const [barCouncilId, setBarCouncilId] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState([]);

  const [barCouncilIdError, setBarCouncilIdError] = useState("");
  const [aadhaarError, setAadhaarError] = useState("");
  const [languagesError, setLanguagesError] = useState("");

  /* =======================================================================
     ADVOCATE STEP 4 — AADHAAR VERIFICATION (OTP or DigiLocker)
  ======================================================================= */

  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarVerificationMethod, setAadhaarVerificationMethod] =
    useState("");

  const [aadhaarMethod, setAadhaarMethod] = useState("");

  const [aadhaarReferenceId, setAadhaarReferenceId] = useState("");
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [aadhaarOtpError, setAadhaarOtpError] = useState("");

  const [aadhaarClientId, setAadhaarClientId] = useState("");
  const [digilockerUrl, setDigilockerUrl] = useState("");

  /* Lockout state is mirrored from the backend only — never computed here. */
  const [aadhaarBlocked, setAadhaarBlocked] = useState(false);
  const [aadhaarBlockedUntil, setAadhaarBlockedUntil] = useState(null);
  const [aadhaarRemainingAttempts, setAadhaarRemainingAttempts] =
    useState(null);

  const [generatingAadhaarOtp, setGeneratingAadhaarOtp] = useState(false);
  const [verifyingAadhaarOtp, setVerifyingAadhaarOtp] = useState(false);
  const [initiatingDigilocker, setInitiatingDigilocker] = useState(false);
  const [checkingDigilocker, setCheckingDigilocker] = useState(false);

  /* =======================================================================
     ADVOCATE STEP 5 — PASSWORD
  ======================================================================= */

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  /* =========================================================================
     ADVOCATE SESSION RESTORE
  ========================================================================= */

  /* Steps 4-7 are collected client-side and only persisted when the profile
     endpoint is called, so a refresh resumes at the last server-verified
     step rather than at whatever `step` the URL claims. */
  const resolveAdvocateStep = (session) => {
    if (session?.phoneVerified) return 4;
    if (session?.emailVerified && session?.profilePhotoUrl && session?.gender)
      return 3;
    if (session?.emailVerified) return 2;
    return 1;
  };

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const restoreAdvocateSession = useCallback(async (id) => {
    setRestoringSession(true);
    setStep1Banner(null);
    setFlowBanner(null);

    try {
      const result = await advocateApi.getSession(id);

      if (!isMountedRef.current) return;

      const session = result?.session;

      if (!session) {
        throw new AdvocateApiError(
          "This registration session is no longer available."
        );
      }

      setFullName(session.fullName || "");
      setEmail(session.email || "");
      setEmailVerified(Boolean(session.emailVerified));
      setPhone(session.phone || "");
      setPhoneVerified(Boolean(session.phoneVerified));
      setProfilePhotoUrl(session.profilePhotoUrl || "");
      setProfilePhotoPublicId(session.profilePhotoPublicId || "");
      setGender(session.gender || "");

      setEmailOtpStage(false);
      setEmailOtp("");
      setEmailOtpError("");

      setStep(resolveAdvocateStep(session));
    } catch (error) {
      if (!isMountedRef.current) return;

      /* Drop the dead registrationId from the URL, otherwise every refresh
         re-requests a session the backend has already rejected. */
      const next = new URLSearchParams(window.location.search);
      next.delete("registrationId");
      next.delete("step");
      setSearchParams(next, { replace: true });

      setRegistrationId("");
      setStep(1);
      setStep1Banner({
        variant: "warning",
        title: "Couldn't resume your registration",
        message: `${errorMessage(
          error,
          "That registration session is no longer available."
        )} Please start again below.`,
      });
    } finally {
      if (isMountedRef.current) setRestoringSession(false);
    }
  }, [setSearchParams]);

  /* =========================================================================
     USER SESSION RESTORE

     Google registration verifies the email on the backend, then returns with
     registrationId. The session decides whether the user belongs on step 2
     (phone) or step 3 (address/profile).
  ========================================================================= */

  const restoreUserSession = useCallback(
    async (id) => {
      setRestoringSession(true);
      setStep1Banner(null);
      setFlowBanner(null);

      try {
        const result = await getUserRegistrationSession(id);

        if (!isMountedRef.current) return;

        const session = result?.session;

        if (!session) {
          throw new Error(
            "This registration session is no longer available."
          );
        }

        setRole("client");
        setRegistrationId(session.id || id);
        setFullName(session.fullName || "");
        setEmail(session.email || "");
        setEmailVerified(Boolean(session.emailVerified));
        setPhone(session.phone || "");
        setPhoneVerified(Boolean(session.phoneVerified));

        setEmailOtpStage(false);
        setEmailOtp("");
        setEmailOtpError("");
        setPhoneOtpSent(false);
        setPhoneOtp("");
        setPhoneOtpError("");
        setGoogleLoading(false);

        if (!session.emailVerified) {
          setStep(1);
        } else if (!session.phoneVerified) {
          setStep(2);
        } else {
          setStep(3);
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        console.error("USER REGISTRATION SESSION RESTORE ERROR:", error);

        const next = new URLSearchParams(window.location.search);
        next.delete("registrationId");
        next.delete("step");
        next.delete("google");
        setSearchParams(next, { replace: true });

        setRegistrationId("");
        setRole("client");
        setStep(1);
        setStep1Banner({
          variant: "warning",
          title: "Couldn't resume your registration",
          message: `${errorMessage(
            error,
            "That registration session is no longer available."
          )} Please start again below.`,
        });
      } finally {
        if (isMountedRef.current) setRestoringSession(false);
      }
    },
    [setSearchParams]
  );

  /* =========================================================================
     SAME-PAGE SIGNUP / GOOGLE CALLBACK BOOTSTRAP

     Every registration step stays on ONE route:

       /signup?registrationId=...&step=1
       /signup?registrationId=...&step=2
       /signup?registrationId=...&step=3

     Google temporarily leaves the site for OAuth, but the backend returns to
     /signup — never /register/user or /register/advocate.
  ========================================================================= */

  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const urlRegistrationId = searchParams.get("registrationId");
    const callbackError = searchParams.get("error");
    const urlRole =
  searchParams.get(
    "role",
  );

    const savedRole =
      typeof window !== "undefined"
        ? sessionStorage.getItem(SIGNUP_ROLE_STORAGE_KEY)
        : null;

    const callbackRole =
  callbackError ===
  "advocate_exists"
    ? "advocate"
    : callbackError ===
        "account_exists"
      ? "client"
      : urlRole ===
          "advocate"
        ? "advocate"
        : urlRole ===
            "client"
          ? "client"
          : savedRole ===
              "advocate"
            ? "advocate"
            : "client";

    setRole(callbackRole);

    /* ================================================================
       GOOGLE SIGNUP ERROR
    ================================================================ */
    if (callbackError) {
      setGoogleLoading(false);
      setStep(1);

      const accountExists =
        callbackError === "account_exists" ||
        callbackError === "advocate_exists";

      if (accountExists) {
        const isExistingAdvocate = callbackError === "advocate_exists";

        setRole(isExistingAdvocate ? "advocate" : "client");

        setStep1Banner({
          variant: "warning",
          title: isExistingAdvocate
            ? "Advocate already exists"
            : "User already exists",
          message: isExistingAdvocate
            ? "An advocate account with this Google email already exists. Redirecting you to login..."
            : "A user account with this Google email already exists. Redirecting you to login...",
        });

        const redirectTimer = window.setTimeout(() => {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(SIGNUP_ROLE_STORAGE_KEY);
          }

          navigate(
  isExistingAdvocate
    ? "/login"
    : "/login",
  {
    replace: true,

    state: {
      googleAccountExists:
        true,

      accountType:
        isExistingAdvocate
          ? "ADVOCATE"
          : "USER",

      role:
        isExistingAdvocate
          ? "advocate"
          : "citizen",
    },
  },
);
        }, 2200);

        return () => window.clearTimeout(redirectTimer);
      }

      const messages = {
        google_auth_failed:
          "Google authentication failed. Please try again.",
        google_email_missing:
          "Google did not provide an email address. Please use email registration instead.",
        session_expired:
          "Your registration session expired. Please start registration again.",
        invalid_registration_state:
          "This Google registration session does not match the selected account type.",
        server_error:
          "Google registration could not be completed. Please try again.",
      };

      setStep1Banner({
        variant: "error",
        title: "Google signup failed",
        message:
          messages[callbackError] ||
          "Google registration could not be completed. Please try again.",
      });

      const next = new URLSearchParams(searchParams);
      next.delete("error");
      next.delete("google");
      setSearchParams(next, { replace: true });

      return;
    }

    if (!urlRegistrationId) return;

    setRegistrationId(urlRegistrationId);

    /* ================================================================
       SAME /signup PAGE — RESTORE THE CORRECT FLOW

       The selected role is saved before leaving for Google. Because OAuth
       returns to the same browser tab, sessionStorage survives the round trip.
    ================================================================ */
    if (
  callbackRole ===
  "advocate"
) {
  setRole(
    "advocate",
  );

  sessionStorage.setItem(
    SIGNUP_ROLE_STORAGE_KEY,
    "advocate",
  );

  restoreAdvocateSession(
    urlRegistrationId,
  );

  return;
}

setRole(
  "client",
);

sessionStorage.setItem(
  SIGNUP_ROLE_STORAGE_KEY,
  "client",
);

restoreUserSession(
  urlRegistrationId,
);

    // Bootstrap intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keep the current wizard step + registrationId in the URL so a refresh
     can restore either the User or Advocate registration session. */
  useEffect(() => {
    if (!registrationId) return;

    if (
      searchParams.get("registrationId") === registrationId &&
      searchParams.get("step") === String(step)
    ) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set("registrationId", registrationId);
    next.set("step", String(step));
    setSearchParams(next, { replace: true });
  }, [registrationId, step, searchParams, setSearchParams]);

  /* =========================================================================
     PINCODE -> DISTRICT + STATE LOOKUP

     Runs automatically once the pincode is exactly 6 digits, never before.
     An AbortController plus a `cancelled` flag guarantee that a slow reply
     for an older pincode can never overwrite the current one.
  ========================================================================= */

  useEffect(() => {
    if (!PINCODE_RE.test(pincode)) return undefined;

    const controller = new AbortController();
    let cancelled = false;

    const applyManualFallback = (message) => {
      setDistrictAutoFilled(false);
      setStateAutoFilled(false);
      setPincodeLookupStatus({ type: "error", message });
    };

    const lookup = async () => {
      setPincodeLookupLoading(true);
      setPincodeLookupStatus({ type: "", message: "" });

      try {
        if (import.meta.env?.DEV) {
          console.log("LOOKING UP PINCODE:", pincode);
        }

        const response = await fetch(`${PINCODE_LOOKUP_URL}/${pincode}`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.log("PINCODE API RESPONSE:", data);
        }

        const entry = Array.isArray(data) ? data[0] : null;

        const offices = Array.isArray(entry?.PostOffice)
          ? entry.PostOffice
          : [];

        const usable =
          entry?.Status === "Success" && offices.length > 0;

        if (!usable) {
          applyManualFallback(
            "We couldn't detect your location automatically. Please enter your district and state manually."
          );
          return;
        }

        /* Prefer the first entry that actually carries a District or State. */
        const match =
          offices.find(
            (office) =>
              cleanLookupValue(office?.District) ||
              cleanLookupValue(office?.State)
          ) || offices[0];

        const foundDistrict = cleanLookupValue(match?.District);
        const foundState = cleanLookupValue(match?.State);

        if (import.meta.env?.DEV) {
          console.log("DISTRICT:", foundDistrict);
          console.log("STATE:", foundState);
        }

        if (foundDistrict && foundState) {
          setDistrict(foundDistrict);
          setState(foundState);
          setDistrictAutoFilled(true);
          setStateAutoFilled(true);
          setDistrictError("");
          setStateError("");
          setPincodeLookupStatus({
            type: "success",
            message: `${foundDistrict}, ${foundState} detected automatically.`,
          });
          return;
        }

        if (foundState) {
          setState(foundState);
          setStateAutoFilled(true);
          setStateError("");
          setDistrict("");
          setDistrictAutoFilled(false);
          setPincodeLookupStatus({
            type: "warning",
            message:
              "State detected. District was not returned, so please enter it manually.",
          });
          return;
        }

        if (foundDistrict) {
          setDistrict(foundDistrict);
          setDistrictAutoFilled(true);
          setDistrictError("");
          setState("");
          setStateAutoFilled(false);
          setPincodeLookupStatus({
            type: "warning",
            message:
              "District detected. State was not returned, so please select it manually.",
          });
          return;
        }

        applyManualFallback(
          "We couldn't detect your location automatically. Please enter your district and state manually."
        );
      } catch (error) {
        if (error?.name === "AbortError" || cancelled) return;

        console.error("Pincode lookup failed:", error);

        applyManualFallback(
          "We couldn't detect your location automatically. Please enter your district and state manually."
        );
      } finally {
        if (!cancelled) setPincodeLookupLoading(false);
      }
    };

    lookup();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pincode]);

  /* Any pincode edit invalidates whatever the previous lookup produced. */
  const handlePincodeChange = (value) => {
    const digits = String(value).replace(/\D/g, "").slice(0, 6);

    setPincode(digits);
    setPincodeError("");

    setDistrict("");
    setState("");
    setDistrictError("");
    setStateError("");
    setDistrictAutoFilled(false);
    setStateAutoFilled(false);
    setPincodeLookupStatus({ type: "", message: "" });
  };

  const handleDistrictChange = (value) => {
    if (districtAutoFilled) return;

    setDistrict(value);
    setDistrictError("");
  };

  const handleStateChange = (value) => {
    if (stateAutoFilled) return;

    setState(value);
    setStateError("");
  };

  const resetLocationFields = () => {
    setPincode("");
    setDistrict("");
    setState("");
    setPincodeError("");
    setDistrictError("");
    setStateError("");
    setDistrictAutoFilled(false);
    setStateAutoFilled(false);
    setPincodeLookupStatus({ type: "", message: "" });
    setPincodeLookupLoading(false);
  };

  /* Single bundle handed to both Step2 and AdvocateLocationStep so the two
     flows can never drift apart. */
  const locationFieldProps = {
    pincode,
    onPincodeChange: handlePincodeChange,
    pincodeError,
    lookupLoading: pincodeLookupLoading,
    lookupStatus: pincodeLookupStatus,
    district,
    onDistrictChange: handleDistrictChange,
    districtError,
    districtAutoFilled,
    state,
    onStateChange: handleStateChange,
    stateError,
    stateAutoFilled,
  };

  /* =========================================================================
     SHARED BANNERS
  ========================================================================= */

  const sessionExpiredBanner = {
    variant: "error",
    title: "Registration session expired",
    message: "Please restart the registration process.",
  };

  /* =========================================================================
     ROLE
  ========================================================================= */

  const handleRoleChange = (nextRole) => {
    if (nextRole === role) return;

    setRole(nextRole);

    if (typeof window !== "undefined") {
      sessionStorage.setItem(SIGNUP_ROLE_STORAGE_KEY, nextRole);
    }

    setStep(1);

    setRegistrationId("");
    setEmailOtpStage(false);
    setEmailOtp("");
    setEmailOtpError("");
    setEmailVerified(false);

    setPhoneOtpSent(false);
    setPhoneOtp("");
    setPhoneOtpError("");
    setPhoneVerified(false);

    /* Location must not leak between the two flows. */
    resetLocationFields();

    setStep1Banner(null);
    setFlowBanner(null);

    if (searchParams.get("registrationId") || searchParams.get("step")) {
      const next = new URLSearchParams(searchParams);
      next.delete("registrationId");
      next.delete("step");
      setSearchParams(next, { replace: true });
    }
  };

  /* =========================================================================
     STEP 1 — START REGISTRATION (both roles)
  ========================================================================= */

  const handleContinueWithEmail = async (event) => {
    if (event) event.preventDefault();
    if (sendingEmailOtp) return;

    const nameErr = validateFullName(fullName);
    const emailErr = validateEmail(email);

    setNameError(nameErr);
    setEmailError(emailErr);

    if (nameErr || emailErr) return;

    setSendingEmailOtp(true);
    setStep1Banner(null);

    try {
      const result = isAdvocate
        ? await advocateApi.startRegistration({
            fullName: fullName.trim(),
            email: email.trim(),
            ...(registrationId ? { registrationId } : {}),
          })
        : await startUserRegistration({
            fullName: fullName.trim(),
            email: email.trim(),
            ...(registrationId ? { registrationId } : {}),
          });

      if (!result?.registrationId) {
        throw new Error(
          "Registration session was not created. Please try again."
        );
      }

      setRegistrationId(result.registrationId);

      setEmailOtpStage(true);
      setEmailOtp("");
      setEmailOtpError("");
      emailCooldown.start();
    } catch (error) {
      const description = describeApiError(error, "email");

      setStep1Banner({
        variant: "error",
        title: description.title,
        message: description.showLoginLink
          ? `${description.message} Please log in instead.`
          : errorMessage(error, description.message, "email"),
      });
    } finally {
      setSendingEmailOtp(false);
    }
  };

  /* =========================================================================
     STEP 1 — EMAIL OTP
  ========================================================================= */

  const handleResendEmailOtp = async () => {
    if (resendingEmailOtp || !emailCooldown.canResend) return;

    if (!registrationId) {
      setEmailOtpError(
        "Registration session is missing. Please restart signup."
      );
      return;
    }

    setResendingEmailOtp(true);
    setEmailOtpError("");
    setStep1Banner(null);

    try {
      if (isAdvocate) {
  await advocateApi.resendEmailOtp({
    registrationId,
    email: email.trim(),
  });
} else {
  await resendUserRegistrationEmailOtp({
    registrationId,
    email: email.trim(),
  });
}

      setEmailOtp("");
      emailCooldown.start();

      setStep1Banner({
        variant: "success",
        title: "OTP sent",
        message: "A new verification code has been sent to your email.",
      });
    } catch (error) {
      setEmailOtpError(
        errorMessage(
          error,
          "We couldn't resend the code. Please try again.",
          "email"
        )
      );
    } finally {
      setResendingEmailOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (verifyingEmail) return;

    if (emailOtp.length !== OTP_LENGTH) {
      setEmailOtpError(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    if (!registrationId) {
      setEmailOtpError(
        "Registration session is missing. Please restart signup."
      );
      return;
    }

    setVerifyingEmail(true);
    setEmailOtpError("");

    try {
      const result = isAdvocate
        ? await advocateApi.verifyEmail({ registrationId, otp: emailOtp })
        : await verifyEmailOtp({ registrationId, otp: emailOtp });

      if (result?.registrationId) setRegistrationId(result.registrationId);

      const registration = result?.registration;
      if (registration?.fullName) setFullName(registration.fullName);
      if (registration?.email) setEmail(registration.email);

      setEmailVerified(true);
      setEmailOtpStage(false);
      setEmailOtp("");

      /* Both flows move to step 2 next (advocate responds with nextStep: 2). */
      setStep(2);
    } catch (error) {
      setEmailOtpError(
        errorMessage(error, "Invalid OTP. Please try again.", "email")
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailError("");

    if (emailVerified) {
      setEmailVerified(false);
      setEmailOtpStage(false);
      setEmailOtp("");
    }
  };

  /* =========================================================================
     STEP 1 — GOOGLE
  ========================================================================= */

  const handleGoogleContinue = () => {
  if (googleLoading) {
    return;
  }

  setStep1Banner(null);
  setGoogleLoading(true);

  try {
    const selectedRole =
      isAdvocate
        ? "advocate"
        : "client";

    /*
     * Fallback for older backend redirects.
     * New backend also sends role in callback URL.
     */
    sessionStorage.setItem(
      SIGNUP_ROLE_STORAGE_KEY,
      selectedRole,
    );

    const googleUrl =
      isAdvocate
        ? getAdvocateGoogleRegisterUrl(
            registrationId,
          )
        : getUserGoogleRegisterUrl(
            registrationId,
          );

    if (
      import.meta.env.DEV
    ) {
      console.log(
        `[signup] ${selectedRole} Google registration:`,
        googleUrl,
      );
    }

    window.location.assign(
      googleUrl,
    );
  } catch (error) {
    console.error(
      "GOOGLE REGISTRATION REDIRECT ERROR:",
      error,
    );

    setGoogleLoading(false);

    setStep1Banner({
      variant: "error",
      title:
        "Google signup failed",
      message:
        error?.message ||
        "We couldn't start Google registration. Please try again.",
    });
  }
};

  /* =========================================================================
     ADVOCATE STEP 2 — PHOTO + GENDER
  ========================================================================= */

  const handleProfilePhotoSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validationError = validateProfilePhoto(file);
    setPhotoError(validationError);
    if (validationError) return;

    setUploadingPhoto(true);
    setFlowBanner(null);

    try {
      const result = await advocateApi.uploadProfilePhoto(file);

      if (!result?.profilePhotoUrl) {
        throw new AdvocateApiError(
          "The photo was not saved. Please try uploading it again."
        );
      }

      setProfilePhotoUrl(result.profilePhotoUrl);
      setProfilePhotoPublicId(result.profilePhotoPublicId || "");
    } catch (error) {
      setPhotoError(
        errorMessage(error, "We couldn't upload your photo. Please try again.")
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveAdvocateBasics = async () => {
    if (savingBasicDetails || uploadingPhoto) return;

    const photoErr = profilePhotoUrl ? "" : "Please upload a profile photo.";
    const genderErr = gender ? "" : "Please select your gender.";

    setPhotoError(photoErr);
    setGenderError(genderErr);

    if (photoErr || genderErr) return;

    if (!registrationId) {
      setFlowBanner(sessionExpiredBanner);
      return;
    }

    setSavingBasicDetails(true);
    setFlowBanner(null);

    try {
      const result = await advocateApi.startRegistration({
        fullName: fullName.trim(),
        email: email.trim(),
        profilePhotoUrl,
        profilePhotoPublicId,
        gender,
        registrationId,
      });

      if (result?.registrationId) setRegistrationId(result.registrationId);

      setStep(3);
    } catch (error) {
      setFlowBanner({
        variant: "error",
        title: "Couldn't save your details",
        message: errorMessage(
          error,
          "We couldn't save your profile details. Please try again."
        ),
      });
    } finally {
      setSavingBasicDetails(false);
    }
  };

  /* =========================================================================
     PHONE (USER step 2 / ADVOCATE step 3)
  ========================================================================= */

  const handlePhoneChange = (value) => {
    setPhone(value);
    setPhoneError("");

    if (phoneVerified || phoneOtpSent) {
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp("");
      setPhoneOtpError("");
    }
  };

  const handleSendPhoneOtp = async () => {
    if (sendingPhoneOtp) return;

    const error = validatePhone(phone);

    setPhoneError(error);
    setFlowBanner(null);

    if (error) return;

    if (!registrationId) {
      setFlowBanner(sessionExpiredBanner);
      return;
    }

    setSendingPhoneOtp(true);

    try {
      if (isAdvocate) {
        await advocateApi.sendPhoneOtp({ registrationId, phone: phone.trim() });
      } else {
        await sendPhoneOtp({ registrationId, phone: phone.trim() });
      }

      setPhoneOtpSent(true);
      setPhoneOtp("");
      setPhoneOtpError("");

      phoneCooldown.start();
    } catch (error) {
      const description = describeApiError(error, "phone");

      setFlowBanner({
        variant: "error",
        title: description.title,
        message: description.message,
      });
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (verifyingPhone) return;

    if (phoneOtp.length !== OTP_LENGTH) {
      setPhoneOtpError(
        `Please enter the ${OTP_LENGTH}-digit verification code.`
      );
      return;
    }

    if (!registrationId) {
      setPhoneOtpError("Registration session expired. Please restart signup.");
      return;
    }

    setVerifyingPhone(true);
    setPhoneOtpError("");

    try {
      if (isAdvocate) {
        await advocateApi.verifyPhone({ registrationId, otp: phoneOtp });
      } else {
        await verifyPhoneOtp({ registrationId, otp: phoneOtp });
      }

      setPhoneVerified(true);
      setPhoneOtpError("");

      if (!isAdvocate) {
        setFlowBanner(null);
        setStep(3);
      }
    } catch (error) {
      setPhoneOtpError(
        errorMessage(
          error,
          "The code you entered is incorrect. Please try again.",
          "phone"
        )
      );
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (!phoneCooldown.canResend || resendingPhoneOtp) return;

    if (!registrationId) {
      setPhoneOtpError("Registration session expired. Please restart signup.");
      return;
    }

    setResendingPhoneOtp(true);
    setPhoneOtpError("");

    try {
      if (isAdvocate) {
        await advocateApi.sendPhoneOtp({ registrationId, phone: phone.trim() });
      } else {
        await sendPhoneOtp({ registrationId, phone: phone.trim() });
      }

      phoneCooldown.start();
    } catch (error) {
      setPhoneOtpError(
        errorMessage(
          error,
          "Unable to resend the OTP. Please try again.",
          "phone"
        )
      );
    } finally {
      setResendingPhoneOtp(false);
    }
  };

  /* =========================================================================
     ADVOCATE STEP 4 — PROFESSIONAL INFORMATION
  ========================================================================= */

  /* Backend is the single source of truth for attempts + lockout; this only
     mirrors whatever it reports, on success or failure. */
  const applyAadhaarLockState = (data) => {
    if (!data) return;

    if (typeof data.remainingAttempts === "number") {
      setAadhaarRemainingAttempts(data.remainingAttempts);
    }

    if (typeof data.blocked === "boolean") {
      setAadhaarBlocked(data.blocked);
    }

    if (data.blockedUntil) {
      setAadhaarBlockedUntil(data.blockedUntil);
    }
  };

  const handleAadhaarNumberChange = (value) => {
    if (aadhaarVerified) return;

    setAadhaarNumber(value);
    setAadhaarError("");

    /* Any change invalidates a pending OTP reference or DigiLocker session. */
    setAadhaarReferenceId("");
    setAadhaarOtpSent(false);
    setAadhaarOtp("");
    setAadhaarOtpError("");
    setAadhaarClientId("");
    setDigilockerUrl("");
  };

  const handleSelectAadhaarMethod = (method) => {
    if (aadhaarVerified || aadhaarBlocked) return;

    setAadhaarMethod(method);
    setAadhaarError("");
    setAadhaarOtpError("");
  };

  const guardAadhaarRequest = () => {
    if (aadhaarBlocked) return false;

    if (!registrationId) {
      setFlowBanner(sessionExpiredBanner);
      return false;
    }

    const aadhaarErr = validateAadhaar(aadhaarNumber);
    setAadhaarError(aadhaarErr);

    return !aadhaarErr;
  };

  const handleGenerateAadhaarOtp = async () => {
    if (generatingAadhaarOtp || aadhaarVerified) return;
    if (!guardAadhaarRequest()) return;

    setGeneratingAadhaarOtp(true);
    setAadhaarOtpError("");
    setFlowBanner(null);

    try {
      const result = await advocateApi.generateAadhaarOtp({
        registrationId,
        aadhaarNumber: aadhaarNumber.trim(),
      });

      applyAadhaarLockState(result);

      setAadhaarReferenceId(result?.reference_id || "");
      setAadhaarOtpSent(true);
      setAadhaarOtp("");
    } catch (error) {
      applyAadhaarLockState(error?.data);
      setAadhaarError(
        errorMessage(
          error,
          "We couldn't send the Aadhaar OTP. Please try again."
        )
      );
    } finally {
      setGeneratingAadhaarOtp(false);
    }
  };

  const handleVerifyAadhaarOtp = async () => {
    if (verifyingAadhaarOtp || aadhaarVerified || aadhaarBlocked) return;

    if (aadhaarOtp.length !== OTP_LENGTH) {
      setAadhaarOtpError(
        `Please enter the ${OTP_LENGTH}-digit Aadhaar OTP.`
      );
      return;
    }

    if (!aadhaarReferenceId) {
      setAadhaarOtpError(
        "This Aadhaar OTP request has expired. Please request a new code."
      );
      return;
    }

    setVerifyingAadhaarOtp(true);
    setAadhaarOtpError("");

    try {
      const result = await advocateApi.verifyAadhaarOtp({
        registrationId,
        referenceId: aadhaarReferenceId,
        otp: aadhaarOtp,
      });

      applyAadhaarLockState(result);

      if (result?.aadhaarVerified) {
        setAadhaarVerified(true);
        setAadhaarVerificationMethod("OTP");
        setAadhaarOtpSent(false);
        setAadhaarOtp("");
        setAadhaarError("");
      } else {
        setAadhaarOtpError(
          "Aadhaar could not be verified. Please try again."
        );
      }
    } catch (error) {
      applyAadhaarLockState(error?.data);
      setAadhaarOtpError(
        errorMessage(
          error,
          "The Aadhaar OTP you entered is incorrect. Please try again."
        )
      );
    } finally {
      setVerifyingAadhaarOtp(false);
    }
  };

  const handleInitiateDigilocker = async () => {
    if (initiatingDigilocker || aadhaarVerified) return;
    if (!guardAadhaarRequest()) return;

    setInitiatingDigilocker(true);
    setFlowBanner(null);

    try {
      const result = await advocateApi.initiateDigilocker({
        registrationId,
        aadhaarNumber: aadhaarNumber.trim(),
      });

      applyAadhaarLockState(result);

      setAadhaarClientId(result?.clientId || "");
      setDigilockerUrl(result?.url || "");

      /* Always use the URL the backend returns, and open it in a new tab so
         the wizard keeps its state instead of unloading. */
      if (result?.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      applyAadhaarLockState(error?.data);
      setAadhaarError(
        errorMessage(
          error,
          "We couldn't start DigiLocker verification. Please try again."
        )
      );
    } finally {
      setInitiatingDigilocker(false);
    }
  };

  const handleCheckDigilockerStatus = async () => {
    if (checkingDigilocker || aadhaarVerified || aadhaarBlocked) return;

    if (!aadhaarClientId) {
      setAadhaarError(
        "Please start DigiLocker verification before checking its status."
      );
      return;
    }

    setCheckingDigilocker(true);
    setAadhaarError("");

    try {
      const result = await advocateApi.verifyDigilocker({
        registrationId,
        clientId: aadhaarClientId,
      });

      applyAadhaarLockState(result);

      if (result?.aadhaarVerified) {
        setAadhaarVerified(true);
        setAadhaarVerificationMethod("DIGILOCKER");
        setDigilockerUrl("");
      } else {
        setAadhaarError(
          "DigiLocker hasn't confirmed your Aadhaar yet. Complete the DigiLocker steps, then check again."
        );
      }
    } catch (error) {
      applyAadhaarLockState(error?.data);
      setAadhaarError(
        errorMessage(
          error,
          "We couldn't confirm your DigiLocker verification. Please try again."
        )
      );
    } finally {
      setCheckingDigilocker(false);
    }
  };

  const handleSubmitProfessional = () => {
    const barErr = validateBarCouncilId(barCouncilId);
    const aadhaarErr = validateAadhaar(aadhaarNumber);
    const languagesErr = validateLanguages(languagesSpoken);

    setBarCouncilIdError(barErr);
    setAadhaarError(aadhaarErr);
    setLanguagesError(languagesErr);

    if (barErr || aadhaarErr || languagesErr) return;

    if (!aadhaarVerified) {
      setFlowBanner({
        variant: "warning",
        title: "Aadhaar verification required",
        message:
          "Verify your Aadhaar with an OTP or through DigiLocker before continuing.",
      });
      return;
    }

    setFlowBanner(null);
    setStep(5);
  };

  /* =========================================================================
     ADVOCATE STEP 5 — PASSWORD
  ========================================================================= */

  const handleSubmitPassword = () => {
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    setPasswordError(passErr);
    setConfirmPasswordError(confirmErr);

    if (passErr || confirmErr) return;

    setFlowBanner(null);
    setStep(6);
  };

  /* =========================================================================
     LOCATION
  ========================================================================= */

  const handleDetectLocation = async () => {
    if (locatingUser) return;

    setLocatingUser(true);
    setLocationNotice("");

    try {
      const position = await requestGeolocation();

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setLocationNotice("Location captured.");
    } catch (error) {
      setCoords(null);
      setLocationNotice(
        error?.code === "UNSUPPORTED"
          ? "Your browser doesn't support location services. You can continue without it."
          : describeGeolocationError(error)
      );
    } finally {
      setLocatingUser(false);
    }
  };

  const handleSubmitAdvocateLocation = async () => {
    if (pincodeLookupLoading) return;

    const pinErr = validatePincode(pincode);
    const districtErr = validateDistrict(district);
    const stateErr = validateState(state);

    setPincodeError(pinErr);
    setDistrictError(districtErr);
    setStateError(stateErr);

    if (pinErr || districtErr || stateErr) return;

    /* Coordinates are optional for the backend, so a silent best-effort
       attempt must never block the advocate from continuing. */
    if (!coords && navigator.geolocation) {
      setLocatingUser(true);

      try {
        const position = await requestGeolocation();
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } catch {
        setCoords(null);
      } finally {
        setLocatingUser(false);
      }
    }

    setFlowBanner(null);
    setStep(7);
  };

  /* =========================================================================
     ADVOCATE STEP 7 — FINAL SUBMISSION
  ========================================================================= */

  const handleCompleteAdvocateRegistration = async () => {
    if (registering) return;

    if (!registrationId) {
      setFlowBanner(sessionExpiredBanner);
      return;
    }

    if (!emailVerified || !phoneVerified) {
      setFlowBanner({
        variant: "warning",
        title: "Verification required",
        message:
          "Please verify both your email and phone before completing registration.",
      });
      return;
    }

    if (!aadhaarVerified) {
      setFlowBanner({
        variant: "warning",
        title: "Aadhaar verification required",
        message:
          "Your Aadhaar must be verified before your advocate account can be created.",
      });
      setStep(4);
      return;
    }

    const barErr = validateBarCouncilId(barCouncilId);
    const aadhaarErr = validateAadhaar(aadhaarNumber);
    const languagesErr = validateLanguages(languagesSpoken);
    const passErr = validatePassword(password);

    if (barErr || aadhaarErr || languagesErr || passErr) {
      setBarCouncilIdError(barErr);
      setAadhaarError(aadhaarErr);
      setLanguagesError(languagesErr);
      setPasswordError(passErr);
      setStep(passErr && !barErr && !aadhaarErr && !languagesErr ? 5 : 4);
      return;
    }

    const pinErr = validatePincode(pincode);
    const districtErr = validateDistrict(district);
    const stateErr = validateState(state);

    if (pinErr || districtErr || stateErr) {
      setPincodeError(pinErr);
      setDistrictError(districtErr);
      setStateError(stateErr);
      setStep(6);
      return;
    }

    setRegistering(true);
    setFlowBanner(null);

    try {
      /* The UI collects "District", but the backend still expects `city`. */
      const payload = {
        registrationId,
        barCouncilId: barCouncilId.trim(),
        aadhaarNumber: aadhaarNumber.trim(),
        password,
        languagesSpoken,
        state: state.trim(),
        city: district.trim(),
        pincode: pincode.trim(),
      };

      if (coords) {
        payload.latitude = coords.latitude;
        payload.longitude = coords.longitude;
      }

      await advocateApi.completeProfile(payload);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SIGNUP_ROLE_STORAGE_KEY);
      }

      navigate("/login", {
        replace: true,
        state: {
          accountCreated: true,
          registrationComplete: true,
          accountType: "ADVOCATE",
          role: "advocate",
          email: email.trim(),
        },
      });
    } catch (error) {
      setFlowBanner({
        variant: "error",
        title: "Registration failed",
        message: errorMessage(
          error,
          "We couldn't complete your registration. Please review your details and try again."
        ),
      });
    } finally {
      setRegistering(false);
    }
  };

  /* =========================================================================
     USER — FINAL REGISTRATION
  ========================================================================= */

  const canCompleteRegistration = useMemo(
    () =>
      emailVerified &&
      phoneVerified &&
      validatePhone(phone) === "" &&
      validatePincode(pincode) === "" &&
      validateDistrict(district) === "" &&
      validateState(state) === "" &&
      !pincodeLookupLoading,
    [
      emailVerified,
      phoneVerified,
      phone,
      pincode,
      district,
      state,
      pincodeLookupLoading,
    ]
  );

  const handleCompleteRegistration = async (event) => {
    event.preventDefault();

    if (registering || pincodeLookupLoading) return;

    if (!emailVerified) {
      setFlowBanner({
        variant: "warning",
        title: "Email verification required",
        message: "Please verify your email before completing registration.",
      });
      return;
    }

    if (!phoneVerified) {
      setFlowBanner({
        variant: "warning",
        title: "Phone verification required",
        message: "Please verify your phone before completing registration.",
      });
      return;
    }

    const pinError = validatePincode(pincode);
    const districtErr = validateDistrict(district);
    const stateErr = validateState(state);

    setPincodeError(pinError);
    setDistrictError(districtErr);
    setStateError(stateErr);

    if (pinError || districtErr || stateErr) return;

    if (!registrationId) {
      setFlowBanner(sessionExpiredBanner);
      return;
    }

    setFlowBanner(null);
    setRegistering(true);

    /* Browser coordinates are optional in the User profile contract. Try to
       capture them, but never block registration when permission is denied. */
    let position = null;

    if (navigator.geolocation) {
      try {
        position = await requestGeolocation();
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn("Optional user geolocation was not captured:", error);
        }
      }
    }

    try {
      /* The UI collects "District", while the backend field is still `city`.
         Phone is already stored in the verified registration session. */
      const payload = {
        registrationId,
        pincode: pincode.trim(),
        city: district.trim(),
        state: state.trim(),
      };

      if (position) {
        payload.latitude = position.coords.latitude;
        payload.longitude = position.coords.longitude;
      }

      await completeRegistration(payload);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SIGNUP_ROLE_STORAGE_KEY);
      }

      navigate("/login", {
        replace: true,
        state: {
          accountCreated: true,
          registrationComplete: true,
          accountType: "USER",
          role: "citizen",
          email: email.trim(),
        },
      });
    } catch (error) {
      const description = describeApiError(error);

      setFlowBanner({
        variant: "error",
        title: description.title,
        message: errorMessage(error, description.message),
      });
    } finally {
      setRegistering(false);
    }
  };

  /* =========================================================================
     NAVIGATION HELPERS
  ========================================================================= */

  const goToStep = (target) => {
    setFlowBanner(null);
    setStep(target);
  };

  const goBackToStep1 = () => {
    setStep(1);
    setFlowBanner(null);
  };

  /* =========================================================================
     HEADER COPY
  ========================================================================= */

  const headerSubtitle = isAdvocate
    ? ADVOCATE_STEPS.find((entry) => entry.id === step)?.subtitle ??
      "Complete your advocate profile."
    : step === 1
      ? "Start with your name and verify your email."
      : step === 2
        ? "Verify your mobile number to continue."
        : "Add your address and complete your profile.";

  /* =========================================================================
     RENDER
  ========================================================================= */

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-0 pb-10 sm:pt-28">
      
      <style>{`
      @keyframes signupFade {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .signup-fade {
        animation: signupFade .28s ease-out;
      }

      @keyframes gentleFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }

      .signup-logo-mark {
        animation: gentleFloat 5s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .signup-fade,
        .signup-logo-mark {
          animation: none;
        }
      }
    `}</style>

      {/* ================================================================
        MAIN PAGE CONTAINER
    ================================================================= */}

      <div className={PAGE_CONTAINER}>
        <div
          className="
          relative
          flex
          w-full
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-slate-200/70
          bg-white
          shadow-[0_1px_2px_rgba(15,23,42,0.04),0_32px_80px_-24px_rgba(15,23,42,0.18)]
          transition-shadow
          duration-500
          lg:flex-row
          lg:min-h-[720px]
          lg:items-stretch
        "
        >
          {/* Single accent stripe across the top of the WHOLE card. */}
          <div
            className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-20
            h-1
            bg-gradient-to-r
            from-amber-400
            via-amber-500
            to-orange-400
          "
          />

          {/* ================================================================
            LEFT BRAND PANEL
        ================================================================= */}

          <aside
            className="
            relative
            hidden
            shrink-0
            overflow-hidden
            bg-slate-950
            text-white
            lg:flex
            lg:w-[400px]
            xl:w-[460px]
            flex-col
            xl:px-2
          "
          >
            {/* Background glow */}

            <div
              className="
              pointer-events-none
              absolute
              -left-28
              -top-28
              h-80
              w-80
              rounded-full
              bg-amber-500/[0.10]
              blur-3xl
            "
            />

            <div
              className="
              pointer-events-none
              absolute
              -bottom-40
              -right-40
              h-96
              w-96
              rounded-full
              bg-blue-500/[0.05]
              blur-3xl
            "
            />

            {/* Dot texture */}

            <div
              className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.045]
            "
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Oversized watermark mark */}

            <span
              aria-hidden="true"
              className="
              material-symbols-outlined
              pointer-events-none
              absolute
              -bottom-16
              -right-10
              select-none
              text-[280px]
              leading-none
              text-white/[0.025]
            "
            >
              balance
            </span>

            {/* ============================================================
              HEADER ZONE
          ============================================================ */}

            <div
              className="
              relative
              z-10
              flex
              items-center
              justify-between
              border-b
              border-white/[0.06]
              px-8
              py-7
              xl:px-10
            "
            >
              <Link
                to="/"
                className="
                group
                inline-flex
                w-fit
                items-center
                gap-2.5
              "
              >
                <div
                  className="
                  signup-logo-mark
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  text-amber-400
                  transition-colors
                  duration-300
                  group-hover:border-amber-400/30
                  group-hover:bg-amber-400/[0.08]
                "
                >
                  <span className="material-symbols-outlined text-[20px]">
                    balance
                  </span>
                </div>

                <span className="text-base font-bold tracking-tight">
                  Vakeel
                  <span className="text-amber-400"> Setu</span>
                </span>
              </Link>

              <span
                className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/[0.08]
                bg-white/[0.03]
                px-2.5
                py-1
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
              >
                <span className="material-symbols-outlined text-[13px] text-amber-400">
                  shield
                </span>
                Secure Signup
              </span>
            </div>

            {/* ============================================================
              BODY ZONE
          ============================================================ */}

            <div
              className="
              relative
              z-10
              flex
              flex-1
              flex-col
              justify-center
              px-8
              py-10
              xl:px-10
            "
            >
              <div className="max-w-xl">
                {/* Badge */}

                <div
                  className="
                  mb-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-amber-400/20
                  bg-amber-400/[0.07]
                  px-3
                  py-1.5
                "
                >
                  <span
                    className="
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    bg-amber-500
                    shadow-[0_0_6px_1px_rgba(251,191,36,0.7),0_0_16px_5px_rgba(251,191,36,0.35),0_0_24px_8px_rgba(251,191,36,0.15)]
                  "
                  />
                  <span
                    className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-amber-300
                  "
                  >
                    Legal consultations, simplified
                  </span>
                </div>

                {/* Heading */}

                <h1
                  className="
                  text-4xl
                  font-extrabold
                  leading-[1.08]
                  tracking-tight
                  xl:text-[46px]
                "
                >
                  Your legal journey
                  <br />
                  <span className="relative inline-block text-amber-400">
                    starts here.
                    <svg
                      viewBox="0 0 260 14"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      className="absolute left-0 -bottom-1.5 h-3 w-full text-amber-400/70"
                    >
                      <path
                        d="M2 9.5C48 3, 96 2, 130 6.5C164 11, 212 4, 258 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Description */}

                <p
                  className="
                  mt-5
                  max-w-lg
                  text-[14px]
                  leading-7
                  text-slate-400
                  xl:text-[15px]
                "
                >
                  Create your account and connect with trusted advocates through a
                  simple, secure and reliable legal platform.
                </p>

                {/* ==========================================================
                  BENEFITS
              ========================================================== */}

                <div
                  className="
                  mt-9
                  max-w-lg
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  p-1.5
                "
                >
                  {[
                    ["verified_user", "Verified contact information"],
                    ["lock", "Secure & private experience"],
                    ["gavel", "Trusted legal platform"],
                  ].map(([icon, text], index, arr) => (
                    <div
                      key={text}
                      className={[
                        "group flex items-center gap-3 px-3.5 py-3 transition-all duration-300 hover:bg-white/[0.04] rounded-xl",
                        index !== arr.length - 1
                          ? "border-b border-white/[0.05]"
                          : "",
                      ].join(" ")}
                    >
                      <div
                        className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-amber-400/10
                        text-amber-400
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      "
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {icon}
                        </span>
                      </div>

                      <span
                        className="
                        text-[13px]
                        font-medium
                        text-slate-300
                      "
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ============================================================
              FOOTER ZONE
          ============================================================ */}

            <div
              className="
              relative
              z-10
              flex
              items-center
              justify-between
              border-t
              border-white/[0.06]
              px-8
              py-6
              xl:px-10
            "
            >
              <p className="text-[10px] text-slate-600">
                © {new Date().getFullYear()} Vakeel Setu. All rights reserved.
              </p>

              <span className="material-symbols-outlined text-[15px] text-slate-700">
                balance
              </span>
            </div>
          </aside>

          {/* ================================================================
            RIGHT FORM PANEL
            The form body is centered both vertically and horizontally and
            constrained to max-w-xl. On mobile the vertical padding keeps
            it comfortable while the card grows with the content.
        ================================================================= */}

          <main className="flex min-w-0 flex-1 flex-col bg-white">
            <div
              className="
              flex
              min-h-full
              flex-1
              items-center
              justify-center
              px-5
              py-8
              sm:px-7
              sm:py-10
              lg:px-8
              xl:px-10
            "
            >
              <div className="w-full max-w-xl">
                {/* ==========================================================
                  MOBILE LOGO
              ========================================================== */}

                <div className="mb-6 flex justify-center lg:hidden">
                  <Link to="/" className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">
                      balance
                    </span>

                    <span className="text-lg font-bold text-slate-900">
                      Vakeel
                      <span className="text-amber-500"> Setu</span>
                    </span>
                  </Link>
                </div>

                {/* ==========================================================
                  HEADER
              ========================================================== */}

                <div className="mb-7">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-amber-500
                      shadow-[0_0_10px_rgba(245,158,11,.45)]
                    "
                    />

                    <span
                      className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.17em]
                      text-amber-600
                    "
                    >
                      {isAdvocate ? "Advocate registration" : "Create account"}
                    </span>
                  </div>

                  <h2
                    className="
                    text-2xl
                    font-extrabold
                    tracking-tight
                    text-slate-900
                  "
                  >
                    {isAdvocate
                      ? "Register as an advocate"
                      : "Create your account"}
                  </h2>

                  <p
                    className="
                    mt-1.5
                    text-[13px]
                    leading-5
                    text-slate-500
                  "
                  >
                    {headerSubtitle}
                  </p>
                </div>

                {/* ==========================================================
                  PROGRESS
              ========================================================== */}

                {isAdvocate ? (
                  <AdvocateStepIndicator step={step} />
                ) : (
                  <StepIndicator
                    step={step}
                    emailVerified={emailVerified}
                    phoneVerified={phoneVerified}
                  />
                )}

                {/* ==========================================================
                  SESSION RESTORE
              ========================================================== */}

                {restoringSession ? (
                  <div className="signup-fade flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-12">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
                    <p className="text-[12px] font-semibold text-slate-500">
                      Restoring your registration...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ======================================================
                      STEP 1 — shared by both roles
                  ====================================================== */}

                    {step === 1 && (
                      <Step1
                        fullName={fullName}
                        setFullName={setFullName}
                        nameError={nameError}
                        role={role}
                        onRoleChange={handleRoleChange}
                        email={email}
                        onEmailChange={handleEmailChange}
                        emailError={emailError}
                        emailOtpStage={emailOtpStage}
                        emailOtp={emailOtp}
                        setEmailOtp={setEmailOtp}
                        emailOtpError={emailOtpError}
                        sendingEmailOtp={sendingEmailOtp}
                        verifyingEmail={verifyingEmail}
                        resendingEmailOtp={resendingEmailOtp}
                        cooldown={emailCooldown}
                        banner={step1Banner}
                        onContinue={handleContinueWithEmail}
                        onVerify={handleVerifyEmail}
                        onResend={handleResendEmailOtp}
                        onEditEmail={() => setEmailOtpStage(false)}
                        googleLoading={googleLoading}
                        onGoogleContinue={handleGoogleContinue}
                      />
                    )}

                    {/* ======================================================
                      USER — STEP 2
                  ====================================================== */}

                    {!isAdvocate && step === 2 && (
                      <Step2
                        onBack={goBackToStep1}
                        phone={phone}
                        onPhoneChange={handlePhoneChange}
                        phoneError={phoneError}
                        phoneOtpSent={phoneOtpSent}
                        phoneOtp={phoneOtp}
                        setPhoneOtp={setPhoneOtp}
                        phoneOtpError={phoneOtpError}
                        phoneVerified={phoneVerified}
                        sendingPhoneOtp={sendingPhoneOtp}
                        verifyingPhone={verifyingPhone}
                        resendingPhoneOtp={resendingPhoneOtp}
                        cooldown={phoneCooldown}
                        onSendOtp={handleSendPhoneOtp}
                        onVerifyOtp={handleVerifyPhone}
                        onResendOtp={handleResendPhoneOtp}
                        banner={flowBanner}
                        onContinue={() => goToStep(3)}
                      />
                    )}

                    {/* ======================================================
                      USER — STEP 3
                  ====================================================== */}

                    {!isAdvocate && step === 3 && (
                      <Step3
                        onBack={() => goToStep(2)}
                        location={locationFieldProps}
                        banner={flowBanner}
                        registering={registering}
                        canSubmit={canCompleteRegistration}
                        onSubmit={handleCompleteRegistration}
                      />
                    )}

                    {/* ======================================================
                      ADVOCATE — STEP 2
                  ====================================================== */}

                    {isAdvocate && step === 2 && (
                      <AdvocatePhotoStep
                        banner={flowBanner}
                        profilePhotoUrl={profilePhotoUrl}
                        photoError={photoError}
                        uploadingPhoto={uploadingPhoto}
                        onSelectPhoto={handleProfilePhotoSelect}
                        gender={gender}
                        onGenderChange={(value) => {
                          setGender(value);
                          setGenderError("");
                        }}
                        genderError={genderError}
                        saving={savingBasicDetails}
                        onBack={goBackToStep1}
                        onContinue={handleSaveAdvocateBasics}
                      />
                    )}

                    {/* ======================================================
                      ADVOCATE — STEP 3
                  ====================================================== */}

                    {isAdvocate && step === 3 && (
                      <AdvocatePhoneStep
                        banner={flowBanner}
                        phone={phone}
                        onPhoneChange={handlePhoneChange}
                        phoneError={phoneError}
                        phoneOtpSent={phoneOtpSent}
                        phoneOtp={phoneOtp}
                        setPhoneOtp={setPhoneOtp}
                        phoneOtpError={phoneOtpError}
                        phoneVerified={phoneVerified}
                        sendingPhoneOtp={sendingPhoneOtp}
                        verifyingPhone={verifyingPhone}
                        resendingPhoneOtp={resendingPhoneOtp}
                        cooldown={phoneCooldown}
                        onSendOtp={handleSendPhoneOtp}
                        onVerifyOtp={handleVerifyPhone}
                        onResendOtp={handleResendPhoneOtp}
                        onBack={() => goToStep(2)}
                        onContinue={() => goToStep(4)}
                      />
                    )}

                    {/* ======================================================
                      ADVOCATE — STEP 4
                  ====================================================== */}

                    {isAdvocate && step === 4 && (
                      <AdvocateProfessionalStep
                        banner={flowBanner}
                        barCouncilId={barCouncilId}
                        setBarCouncilId={(value) => {
                          setBarCouncilId(value);
                          setBarCouncilIdError("");
                        }}
                        barCouncilIdError={barCouncilIdError}
                        aadhaarNumber={aadhaarNumber}
                        onAadhaarNumberChange={handleAadhaarNumberChange}
                        aadhaarError={aadhaarError}
                        aadhaarVerified={aadhaarVerified}
                        aadhaarVerificationMethod={aadhaarVerificationMethod}
                        aadhaarMethod={aadhaarMethod}
                        onSelectAadhaarMethod={handleSelectAadhaarMethod}
                        aadhaarOtpSent={aadhaarOtpSent}
                        aadhaarOtp={aadhaarOtp}
                        setAadhaarOtp={setAadhaarOtp}
                        aadhaarOtpError={aadhaarOtpError}
                        aadhaarBlocked={aadhaarBlocked}
                        aadhaarBlockedUntil={aadhaarBlockedUntil}
                        aadhaarRemainingAttempts={aadhaarRemainingAttempts}
                        digilockerUrl={digilockerUrl}
                        aadhaarClientId={aadhaarClientId}
                        generatingAadhaarOtp={generatingAadhaarOtp}
                        verifyingAadhaarOtp={verifyingAadhaarOtp}
                        initiatingDigilocker={initiatingDigilocker}
                        checkingDigilocker={checkingDigilocker}
                        onGenerateAadhaarOtp={handleGenerateAadhaarOtp}
                        onVerifyAadhaarOtp={handleVerifyAadhaarOtp}
                        onInitiateDigilocker={handleInitiateDigilocker}
                        onCheckDigilocker={handleCheckDigilockerStatus}
                        languagesSpoken={languagesSpoken}
                        setLanguagesSpoken={(value) => {
                          setLanguagesSpoken(value);
                          setLanguagesError("");
                        }}
                        languagesError={languagesError}
                        onBack={() => goToStep(3)}
                        onContinue={handleSubmitProfessional}
                      />
                    )}

                    {/* ======================================================
                      ADVOCATE — STEP 5
                  ====================================================== */}

                    {isAdvocate && step === 5 && (
                      <AdvocatePasswordStep
                        banner={flowBanner}
                        password={password}
                        setPassword={(value) => {
                          setPassword(value);
                          setPasswordError("");
                        }}
                        passwordError={passwordError}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={(value) => {
                          setConfirmPassword(value);
                          setConfirmPasswordError("");
                        }}
                        confirmPasswordError={confirmPasswordError}
                        onBack={() => goToStep(4)}
                        onContinue={handleSubmitPassword}
                      />
                    )}

                    {/* ======================================================
                      ADVOCATE — STEP 6
                  ====================================================== */}

                    {isAdvocate && step === 6 && (
                      <AdvocateLocationStep
                        banner={flowBanner}
                        location={locationFieldProps}
                        lookupLoading={pincodeLookupLoading}
                        coords={coords}
                        locating={locatingUser}
                        locationNotice={locationNotice}
                        onDetectLocation={handleDetectLocation}
                        onBack={() => goToStep(5)}
                        onContinue={handleSubmitAdvocateLocation}
                      />
                    )}

                    {/* ======================================================
                      ADVOCATE — STEP 7
                  ====================================================== */}

                    {isAdvocate && step === 7 && (
                      <AdvocateReviewStep
                        banner={flowBanner}
                        fullName={fullName}
                        email={email}
                        profilePhotoUrl={profilePhotoUrl}
                        gender={gender}
                        phone={phone}
                        barCouncilId={barCouncilId}
                        aadhaarNumber={aadhaarNumber}
                        aadhaarVerified={aadhaarVerified}
                        aadhaarVerificationMethod={aadhaarVerificationMethod}
                        languagesSpoken={languagesSpoken}
                        state={state}
                        district={district}
                        pincode={pincode}
                        registering={registering}
                        onEdit={goToStep}
                        onBack={() => goToStep(6)}
                        onSubmit={handleCompleteAdvocateRegistration}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ============================================================
              FOOTER BAND
          ============================================================ */}

            <div
              className="
              border-t
              border-slate-100
              bg-slate-50/60
              px-5
              py-5
              sm:px-7
              lg:px-8
              xl:px-10
            "
            >
              <p
                className="
                text-center
                text-[13px]
                text-slate-500
              "
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="
                  font-bold
                  text-amber-600
                  transition-colors
                  hover:text-amber-700
                "
                >
                  Log in
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   STEP 1 COMPONENT (shared)
   ========================================================================= */

function Step1({
  fullName,
  setFullName,
  nameError,
  role,
  onRoleChange,
  email,
  onEmailChange,
  emailError,
  emailOtpStage,
  emailOtp,
  setEmailOtp,
  emailOtpError,
  sendingEmailOtp,
  verifyingEmail,
  resendingEmailOtp,
  cooldown,
  banner,
  onContinue,
  onVerify,
  onResend,
  onEditEmail,
  googleLoading,
  onGoogleContinue,
}) {
  /* =======================================================================
     EMAIL OTP SCREEN
  ======================================================================= */

  if (emailOtpStage) {
    return (
      <div className="signup-fade space-y-5">
        {/* OTP Header */}

        <div
          className="
            rounded-2xl
            border
            border-amber-100
            bg-amber-50/70
            p-4
          "
        >
          <div className="flex gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white
                text-amber-500
                shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_4px_12px_-2px_rgba(245,158,11,0.25)]
              "
            >
              <span className="material-symbols-outlined text-[19px]">
                mail
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Verify your email
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                We've sent a 6-digit code to{" "}
                <span className="font-semibold text-slate-700">{email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Resend / status banner */}

        {banner && (
          <MessageBanner
            variant={banner.variant}
            title={banner.title}
            message={banner.message}
          />
        )}

        {/* OTP Error */}

        {emailOtpError && (
          <MessageBanner
            variant="error"
            title="Verification failed"
            message={emailOtpError}
          />
        )}

        {/* OTP Input */}

        <div>
          <div
            className="
              mb-2
              flex
              items-center
              justify-between
            "
          >
            <span className="text-[12px] font-semibold text-slate-600">
              Verification code
            </span>

            <button
              type="button"
              onClick={onEditEmail}
              className="
                text-[11px]
                font-bold
                text-amber-600
                hover:text-amber-700
              "
            >
              Change email
            </button>
          </div>

          <OtpInput
            value={emailOtp}
            onChange={setEmailOtp}
            length={OTP_LENGTH}
            error={!!emailOtpError}
            disabled={verifyingEmail}
          />
        </div>

        {/* Verify */}

        <PrimaryButton
          type="button"
          onClick={onVerify}
          loading={verifyingEmail}
          loadingText="Verifying..."
        >
          Verify Email
        </PrimaryButton>

        {/* Resend */}

        <ResendRow
          cooldown={cooldown}
          resending={resendingEmailOtp}
          onResend={onResend}
        />
      </div>
    );
  }

  /* =======================================================================
     EMAIL FORM
  ======================================================================= */

  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <form onSubmit={onContinue} className="space-y-4">
        {/* Full Name */}

        <FormInput
          icon="person"
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          error={nameError}
          autoComplete="name"
        />

        {/* Email */}

        <FormInput
          icon="mail"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          error={emailError}
          autoComplete="email"
          disabled={sendingEmailOtp}
          action={
            <VerifyAction
              verified={false}
              onClick={onContinue}
              loading={sendingEmailOtp}
              disabled={sendingEmailOtp}
            />
          }
        />

        {/* Role — Client keeps the existing single-page flow, Advocate
            switches this same page into the 7-step advocate wizard. */}

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-slate-700">
            I am signing up as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <RoleCard
              icon="person"
              title="Client"
              description="I need legal help"
              selected={role === "client"}
              onClick={() => onRoleChange("client")}
            />
            <RoleCard
              icon="gavel"
              title="Advocate"
              description="I provide legal help"
              selected={role === "advocate"}
              onClick={() => onRoleChange("advocate")}
            />
          </div>
        </div>
      </form>

      {/* ================================================================
          OR
      ================================================================= */}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-100" />

        <span
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-slate-400
          "
        >
          or
        </span>

        <span className="h-px flex-1 bg-slate-100" />
      </div>

      {/* Google */}

      <button
        type="button"
        onClick={onGoogleContinue}
        disabled={googleLoading}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-3
          rounded-xl
          border
          border-slate-200
          bg-white
          py-3
          text-[13px]
          font-bold
          text-slate-700
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-slate-300
          hover:bg-slate-50
          hover:shadow-md
          hover:shadow-slate-900/5
          active:translate-y-0
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-amber-500/40
          focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          disabled:opacity-50
          disabled:hover:translate-y-0
        "
      >
        {googleLoading ? (
          <>
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-slate-300
                border-t-slate-600
              "
            />
            Connecting...
          </>
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>

      {/* Terms */}

      <p className="text-center text-[10px] leading-4 text-slate-400">
        By continuing, you agree to our terms and privacy policy.
      </p>
    </div>
  );
}

/* =========================================================================
   USER — STEP 2 COMPONENT
   ========================================================================= */

function Step2({
  onBack,
  phone,
  onPhoneChange,
  phoneError,
  phoneOtpSent,
  phoneOtp,
  setPhoneOtp,
  phoneOtpError,
  phoneVerified,
  sendingPhoneOtp,
  verifyingPhone,
  resendingPhoneOtp,
  cooldown,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  banner,
  onContinue,
}) {
  return (
    <div className="signup-fade space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-700"
      >
        <span className="material-symbols-outlined text-[16px]">
          arrow_back
        </span>
        Back to account
      </button>

      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <PhoneVerificationCard
        eyebrow="Step 2"
        title="Verify your phone number"
        description="We'll verify your mobile number before collecting your address details."
        phone={phone}
        onPhoneChange={onPhoneChange}
        phoneError={phoneError}
        phoneOtpSent={phoneOtpSent}
        phoneOtp={phoneOtp}
        setPhoneOtp={setPhoneOtp}
        phoneOtpError={phoneOtpError}
        phoneVerified={phoneVerified}
        sendingPhoneOtp={sendingPhoneOtp}
        verifyingPhone={verifyingPhone}
        resendingPhoneOtp={resendingPhoneOtp}
        cooldown={cooldown}
        onSendOtp={onSendOtp}
        onVerifyOtp={onVerifyOtp}
        onResendOtp={onResendOtp}
      />

      {phoneVerified && (
        <PrimaryButton type="button" onClick={onContinue}>
          Continue to Address
        </PrimaryButton>
      )}

      {!phoneVerified && (
        <p className="text-center text-[10px] text-slate-400">
          Verify your phone number to continue to Step 3.
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   USER — STEP 3 COMPONENT
   ========================================================================= */

function Step3({
  onBack,
  location,
  banner,
  registering,
  canSubmit,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="signup-fade space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition-colors hover:text-slate-700"
      >
        <span className="material-symbols-outlined text-[16px]">
          arrow_back
        </span>
        Back to phone verification
      </button>

      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="mb-4">
          <StepHeading
            eyebrow="Step 3"
            title="Address & profile details"
            description="Enter your pincode and we'll automatically detect your district and state."
          />
        </div>

        <PincodeLocationFields {...location} />
      </div>

      <PrimaryButton
        type="submit"
        disabled={!canSubmit}
        loading={registering}
        loadingText="Creating account..."
      >
        Complete Registration
      </PrimaryButton>
    </form>
  );
}

/* =========================================================================
   ADVOCATE — STEP 2: PROFILE PHOTO + GENDER
   ========================================================================= */

function AdvocatePhotoStep({
  banner,
  profilePhotoUrl,
  photoError,
  uploadingPhoto,
  onSelectPhoto,
  gender,
  onGenderChange,
  genderError,
  saving,
  onBack,
  onContinue,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="mb-4">
          <StepHeading
            eyebrow="Advocate profile"
            title="Add your profile photo"
            description="Clients see this photo on your profile and in search results."
          />
        </div>

        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-20
              w-20
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
            "
          >
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Advocate profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-[30px] text-slate-300">
                account_circle
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3.5
                py-2.5
                text-[12px]
                font-bold
                text-slate-700
                transition-all
                duration-200
                hover:border-slate-300
                hover:bg-slate-50
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-amber-500/40
                focus-visible:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {uploadingPhoto ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    upload
                  </span>
                  {profilePhotoUrl ? "Change photo" : "Upload photo"}
                </>
              )}
            </button>

            <p className="mt-2 text-[11px] leading-4 text-slate-400">
              JPG, JPEG, PNG or WEBP. Maximum size 5MB.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={onSelectPhoto}
        />

        <FieldError text={photoError} />

        {profilePhotoUrl && !photoError && (
          <div className="mt-3">
            <InlineSuccess text="Profile photo uploaded successfully" />
          </div>
        )}
      </div>

      <ChipSelect
        label="Gender"
        options={GENDER_OPTIONS}
        value={gender}
        onChange={onGenderChange}
        error={genderError}
      />

      <StepNav
        onBack={onBack}
        onContinue={onContinue}
        loading={saving}
        loadingText="Saving..."
        disabled={uploadingPhoto}
      />
    </div>
  );
}

/* =========================================================================
   ADVOCATE — STEP 3: PHONE
   ========================================================================= */

function AdvocatePhoneStep({
  banner,
  phone,
  onPhoneChange,
  phoneError,
  phoneOtpSent,
  phoneOtp,
  setPhoneOtp,
  phoneOtpError,
  phoneVerified,
  sendingPhoneOtp,
  verifyingPhone,
  resendingPhoneOtp,
  cooldown,
  onSendOtp,
  onVerifyOtp,
  onResendOtp,
  onBack,
  onContinue,
}) {
  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <PhoneVerificationCard
        eyebrow="Contact verification"
        title="Verify your phone number"
        description="Clients contact you on this number, so it must be verified."
        phone={phone}
        onPhoneChange={onPhoneChange}
        phoneError={phoneError}
        phoneOtpSent={phoneOtpSent}
        phoneOtp={phoneOtp}
        setPhoneOtp={setPhoneOtp}
        phoneOtpError={phoneOtpError}
        phoneVerified={phoneVerified}
        sendingPhoneOtp={sendingPhoneOtp}
        verifyingPhone={verifyingPhone}
        resendingPhoneOtp={resendingPhoneOtp}
        cooldown={cooldown}
        onSendOtp={onSendOtp}
        onVerifyOtp={onVerifyOtp}
        onResendOtp={onResendOtp}
      />

      <StepNav
        onBack={onBack}
        onContinue={onContinue}
        disabled={!phoneVerified}
      />

      {!phoneVerified && (
        <p className="text-center text-[10px] text-slate-400">
          Phone verification is required before you can continue.
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   ADVOCATE — STEP 4: PROFESSIONAL INFORMATION
   ========================================================================= */

function AadhaarMethodButton({ icon, label, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5",
        "text-[12px] font-bold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-amber-500/40 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/10"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </button>
  );
}

function AadhaarVerificationCard({
  aadhaarNumber,
  onAadhaarNumberChange,
  aadhaarError,
  aadhaarVerified,
  aadhaarVerificationMethod,
  aadhaarMethod,
  onSelectAadhaarMethod,
  aadhaarOtpSent,
  aadhaarOtp,
  setAadhaarOtp,
  aadhaarOtpError,
  aadhaarBlocked,
  aadhaarBlockedUntil,
  aadhaarRemainingAttempts,
  digilockerUrl,
  aadhaarClientId,
  generatingAadhaarOtp,
  verifyingAadhaarOtp,
  initiatingDigilocker,
  checkingDigilocker,
  onGenerateAadhaarOtp,
  onVerifyAadhaarOtp,
  onInitiateDigilocker,
  onCheckDigilocker,
}) {
  const controlsDisabled = aadhaarBlocked || aadhaarVerified;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-4">
        <StepHeading
          eyebrow="Identity verification"
          title="Verify your Aadhaar"
          description="Choose Aadhaar OTP or DigiLocker. Verification is required to finish registration."
        />
      </div>

      <FormInput
        icon="fingerprint"
        label="Aadhaar Number"
        placeholder="12-digit Aadhaar number"
        inputMode="numeric"
        value={aadhaarNumber}
        onChange={(event) =>
          onAadhaarNumberChange(
            event.target.value.replace(/\D/g, "").slice(0, 12)
          )
        }
        error={aadhaarError}
        success={aadhaarVerified}
        disabled={aadhaarVerified}
        autoComplete="off"
      />

      {/* ================================================================
          BLOCKED — backend is the source of truth
      ================================================================= */}

      {aadhaarBlocked && !aadhaarVerified && (
        <div className="mt-3">
          <MessageBanner
            variant="error"
            title="Aadhaar verification temporarily blocked"
            message={
              aadhaarBlockedUntil
                ? `You can try again after ${formatBlockedUntil(
                    aadhaarBlockedUntil
                  )}.`
                : "Too many failed attempts. Please try again later."
            }
          />
        </div>
      )}

      {/* ================================================================
          VERIFIED
      ================================================================= */}

      {aadhaarVerified ? (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">
              verified
            </span>
            <p className="text-[13px] font-bold text-emerald-700">
              Aadhaar verified
            </p>
          </div>

          <p className="mt-1 text-[11px] font-medium text-emerald-700/80">
            Verification method:{" "}
            {aadhaarVerificationMethod === "DIGILOCKER"
              ? "DigiLocker"
              : "Aadhaar OTP"}
          </p>
        </div>
      ) : (
        <>
          {/* ============================================================
              METHOD PICKER
          ============================================================ */}

          <div className="mt-4">
            <p className="mb-2 text-[12px] font-semibold text-slate-600">
              Choose a verification method
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <AadhaarMethodButton
                icon="sms"
                label="Aadhaar OTP"
                selected={aadhaarMethod === "OTP"}
                onClick={() => onSelectAadhaarMethod("OTP")}
                disabled={controlsDisabled}
              />

              <AadhaarMethodButton
                icon="account_balance"
                label="DigiLocker"
                selected={aadhaarMethod === "DIGILOCKER"}
                onClick={() => onSelectAadhaarMethod("DIGILOCKER")}
                disabled={controlsDisabled}
              />
            </div>
          </div>

          {/* ============================================================
              METHOD 1 — AADHAAR OTP
          ============================================================ */}

          {aadhaarMethod === "OTP" && (
            <div className="mt-4 border-t border-slate-200/70 pt-4">
              {!aadhaarOtpSent ? (
                <PrimaryButton
                  type="button"
                  size="sm"
                  icon="send"
                  onClick={onGenerateAadhaarOtp}
                  loading={generatingAadhaarOtp}
                  loadingText="Sending OTP..."
                  disabled={controlsDisabled}
                >
                  Send OTP to Aadhaar-linked mobile
                </PrimaryButton>
              ) : (
                <>
                  <div className="mb-2">
                    <p className="text-[11px] font-semibold text-slate-600">
                      Enter Aadhaar OTP
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Sent to the mobile number linked with your Aadhaar.
                    </p>
                  </div>

                  {aadhaarOtpError && (
                    <div className="mb-3">
                      <MessageBanner
                        variant="error"
                        title="Aadhaar verification failed"
                        message={aadhaarOtpError}
                      />
                    </div>
                  )}

                  <OtpInput
                    value={aadhaarOtp}
                    onChange={setAadhaarOtp}
                    length={OTP_LENGTH}
                    error={!!aadhaarOtpError}
                    disabled={verifyingAadhaarOtp || aadhaarBlocked}
                  />

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <PrimaryButton
                      type="button"
                      size="sm"
                      icon="check"
                      onClick={onVerifyAadhaarOtp}
                      loading={verifyingAadhaarOtp}
                      loadingText="Verifying..."
                      disabled={controlsDisabled}
                    >
                      Verify OTP
                    </PrimaryButton>

                    <button
                      type="button"
                      onClick={onGenerateAadhaarOtp}
                      disabled={controlsDisabled || generatingAadhaarOtp}
                      className="
                        shrink-0
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-2.5
                        text-[12px]
                        font-bold
                        text-slate-600
                        transition-colors
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {generatingAadhaarOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================================
              METHOD 2 — DIGILOCKER
          ============================================================ */}

          {aadhaarMethod === "DIGILOCKER" && (
            <div className="mt-4 border-t border-slate-200/70 pt-4">
              <p className="mb-3 text-[11px] leading-4 text-slate-500">
                DigiLocker opens in a new tab. Complete the steps there, then
                come back and check your status.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <PrimaryButton
                  type="button"
                  size="sm"
                  icon="open_in_new"
                  onClick={onInitiateDigilocker}
                  loading={initiatingDigilocker}
                  loadingText="Opening DigiLocker..."
                  disabled={controlsDisabled}
                >
                  {aadhaarClientId
                    ? "Reopen DigiLocker"
                    : "Continue with DigiLocker"}
                </PrimaryButton>

                {aadhaarClientId && (
                  <button
                    type="button"
                    onClick={onCheckDigilocker}
                    disabled={controlsDisabled || checkingDigilocker}
                    className="
                      shrink-0
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3.5
                      py-2.5
                      text-[12px]
                      font-bold
                      text-slate-600
                      transition-colors
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {checkingDigilocker ? "Checking..." : "I've completed it"}
                  </button>
                )}
              </div>

              {digilockerUrl && (
  <p className="mt-2 text-[10px] leading-4 text-slate-400">
    Didn't the tab open?{" "}
    <a
      href={digilockerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold text-amber-600 transition-colors hover:text-amber-700"
    >
      Open DigiLocker manually
    </a>
  </p>
)}
            </div>
          )}

          {/* ============================================================
              REMAINING ATTEMPTS
          ============================================================ */}

          {!aadhaarBlocked &&
            typeof aadhaarRemainingAttempts === "number" && (
              <p className="mt-3 text-[11px] font-semibold text-amber-600">
                {aadhaarRemainingAttempts} verification{" "}
                {aadhaarRemainingAttempts === 1 ? "attempt" : "attempts"}{" "}
                remaining.
              </p>
            )}
        </>
      )}
    </div>
  );
}

function AdvocateProfessionalStep({
  banner,
  barCouncilId,
  setBarCouncilId,
  barCouncilIdError,
  languagesSpoken,
  setLanguagesSpoken,
  languagesError,
  onBack,
  onContinue,
  ...aadhaarProps
}) {
  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="mb-4">
          <StepHeading
            eyebrow="Professional information"
            title="Your practice credentials"
            description="These details are used to verify you as a practising advocate."
          />
        </div>

        <FormInput
          icon="badge"
          label="Bar Council ID"
          placeholder="e.g. MAH/1234/2024"
          value={barCouncilId}
          onChange={(event) => setBarCouncilId(event.target.value)}
          error={barCouncilIdError}
          autoComplete="off"
        />
      </div>

      <AadhaarVerificationCard {...aadhaarProps} />

      <ChipSelect
        label="Languages spoken"
        hint="Select all that apply"
        options={LANGUAGE_OPTIONS}
        value={languagesSpoken}
        onChange={setLanguagesSpoken}
        error={languagesError}
        multiple
      />

      <StepNav
        onBack={onBack}
        onContinue={onContinue}
        disabled={!aadhaarProps.aadhaarVerified}
      />

      {!aadhaarProps.aadhaarVerified && (
        <p className="text-center text-[10px] text-slate-400">
          Aadhaar verification is required before you can continue.
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   ADVOCATE — STEP 5: PASSWORD
   ========================================================================= */

function AdvocatePasswordStep({
  banner,
  password,
  setPassword,
  passwordError,
  confirmPassword,
  setConfirmPassword,
  confirmPasswordError,
  onBack,
  onContinue,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggle = (
    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="
        shrink-0
        rounded-lg
        px-1.5
        py-1
        text-slate-400
        transition-colors
        hover:text-slate-600
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-amber-500/40
      "
    >
      <span className="material-symbols-outlined text-[18px]">
        {showPassword ? "visibility_off" : "visibility"}
      </span>
    </button>
  );

  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="mb-4">
          <StepHeading
            eyebrow="Account security"
            title="Create your password"
            description="Use at least 8 characters with one letter and one number."
          />
        </div>

        <div className="space-y-4">
          <FormInput
            icon="lock"
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={passwordError}
            autoComplete="new-password"
            action={toggle}
          />

          <FormInput
            icon="lock_reset"
            label="Confirm Password"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={confirmPasswordError}
            autoComplete="new-password"
          />
        </div>
      </div>

      <StepNav onBack={onBack} onContinue={onContinue} />
    </div>
  );
}

/* =========================================================================
   ADVOCATE — STEP 6: LOCATION
   ========================================================================= */

function AdvocateLocationStep({
  banner,
  location,
  lookupLoading,
  coords,
  locating,
  locationNotice,
  onDetectLocation,
  onBack,
  onContinue,
}) {
  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="mb-4">
          <StepHeading
            eyebrow="Practice location"
            title="Where do you practise?"
            description="Enter your pincode and we'll fill in your district and state."
          />
        </div>

        <PincodeLocationFields {...location} />

        {/* Optional coordinates */}

        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-slate-700">
                Precise location (optional)
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Helps clients near you find your profile first.
              </p>
            </div>

            <button
              type="button"
              onClick={onDetectLocation}
              disabled={locating}
              className="
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-lg
                bg-white
                px-3
                py-2
                text-[11px]
                font-bold
                text-slate-700
                ring-1
                ring-slate-200
                transition-colors
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <span className="material-symbols-outlined text-[15px]">
                my_location
              </span>
              {locating ? "Locating..." : "Use my location"}
            </button>
          </div>

          {coords && (
            <div className="mt-2">
              <InlineSuccess
                text={`Location captured (${coords.latitude.toFixed(
                  4
                )}, ${coords.longitude.toFixed(4)})`}
              />
            </div>
          )}

          {!coords && locationNotice && (
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              {locationNotice}
            </p>
          )}
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onContinue={onContinue}
        loading={locating}
        loadingText="Checking location..."
        continueLabel="Review details"
        disabled={lookupLoading}
      />
    </div>
  );
}

/* =========================================================================
   ADVOCATE — STEP 7: REVIEW
   ========================================================================= */

function ReviewRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[13px] font-semibold text-slate-800">
          {value || "—"}
        </p>
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 text-[11px] font-bold text-amber-600 transition-colors hover:text-amber-700"
        >
          Edit
        </button>
      )}
    </div>
  );
}

function AdvocateReviewStep({
  banner,
  fullName,
  email,
  profilePhotoUrl,
  gender,
  phone,
  barCouncilId,
  aadhaarNumber,
  aadhaarVerified,
  aadhaarVerificationMethod,
  languagesSpoken,
  state,
  district,
  pincode,
  registering,
  onEdit,
  onBack,
  onSubmit,
}) {
  return (
    <div className="signup-fade space-y-5">
      {banner && (
        <MessageBanner
          variant={banner.variant}
          title={banner.title}
          message={banner.message}
        />
      )}

      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="mb-4">
          <StepHeading
            eyebrow="Final check"
            title="Review your details"
            description="Make sure everything is correct before you finish."
          />
        </div>

        {/* Identity */}

        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt="Advocate profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-[24px] text-slate-300">
                account_circle
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold text-slate-900">
              {fullName || "—"}
            </p>
            <p className="truncate text-[12px] text-slate-500">{email}</p>
          </div>

          <button
            type="button"
            onClick={() => onEdit(2)}
            className="ml-auto shrink-0 text-[11px] font-bold text-amber-600 transition-colors hover:text-amber-700"
          >
            Edit
          </button>
        </div>

        {/* Details */}

        <div className="mt-3 rounded-xl border border-slate-100 bg-white px-3.5 py-1">
          <ReviewRow label="Gender" value={gender} onEdit={() => onEdit(2)} />
          <ReviewRow label="Phone" value={phone} onEdit={() => onEdit(3)} />
          <ReviewRow
            label="Bar Council ID"
            value={barCouncilId}
            onEdit={() => onEdit(4)}
          />
          <ReviewRow
            label="Aadhaar"
            value={maskAadhaar(aadhaarNumber)}
            onEdit={() => onEdit(4)}
          />
          <ReviewRow
            label="Aadhaar status"
            value={
              aadhaarVerified
                ? `Verified via ${
                    aadhaarVerificationMethod === "DIGILOCKER"
                      ? "DigiLocker"
                      : "Aadhaar OTP"
                  }`
                : "Not verified"
            }
            onEdit={aadhaarVerified ? undefined : () => onEdit(4)}
          />
          <ReviewRow
            label="Languages"
            value={languagesSpoken.join(", ")}
            onEdit={() => onEdit(4)}
          />
          <ReviewRow
            label="Password"
            value="••••••••"
            onEdit={() => onEdit(5)}
          />
          <ReviewRow
            label="Location"
            value={[district, state, pincode].filter(Boolean).join(", ")}
            onEdit={() => onEdit(6)}
          />
        </div>
      </div>

      <StepNav
        onBack={onBack}
        onContinue={onSubmit}
        continueLabel="Complete Registration"
        loading={registering}
        loadingText="Creating account..."
      />
    </div>
  );
}

/* =========================================================================
   GOOGLE ICON
   ========================================================================= */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />

      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />

      <path
        fill="#FBBC05"
        d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33Z"
      />

      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58A8.53 8.53 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}