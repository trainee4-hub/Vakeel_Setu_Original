/* =========================================================================
   ADVOCATE COMPLETE PROFILE — FORM UTILITIES

   Pure functions only. No React, no state, no requests.
   ========================================================================= */

import { REQUIRED_ADVOCATE_PROFILE_FIELDS } from "./advocateProfile";

/** Fields the form owns. Optional ones never block completion. */
export const EDITABLE_NUMBER_FIELDS = [
  "experienceYears",
  "voiceCallPricePer15Min",
  "videoCallPricePer15Min",
  "officeVisitDurationMinutes",
  "offlineVisitingFee",
  "casesHandled",
];

export const EDITABLE_TEXT_FIELDS = [
  "bestPracticeArea",
  "about",
  "topCourtPractised",
];

export const EDITABLE_ARRAY_FIELDS = ["practiceAreas", "courtPractice"];

export const ABOUT_MIN_WORDS = 50;
export const ABOUT_MAX_WORDS = 500;

export const OFFICE_VISIT_MIN_MINUTES = 30;
export const OFFICE_VISIT_MAX_MINUTES = 180;
export const OFFICE_VISIT_STEP_MINUTES = 15;
export const OFFICE_VISIT_DURATION_ERROR =
  "Office visit duration must be at least 30 minutes and up to 3 hours in 15-minute increments (30, 45, 60, ...).";

/** Returns true when value is an integer >= 30, <= 180, and a multiple of 15. */
export const isValidOfficeVisitDuration = (value) => {
  const num = Number(value);
  return (
    Number.isInteger(num) &&
    num >= OFFICE_VISIT_MIN_MINUTES &&
    num <= OFFICE_VISIT_MAX_MINUTES &&
    num % OFFICE_VISIT_STEP_MINUTES === 0
  );
};

const formatOfficeDurationLabel = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hrLabel = `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return mins > 0 ? `${hrLabel} ${mins} min` : hrLabel;
};

export const OFFICE_VISIT_DURATION_OPTIONS = Array.from(
  {
    length:
      (OFFICE_VISIT_MAX_MINUTES - OFFICE_VISIT_MIN_MINUTES) /
        OFFICE_VISIT_STEP_MINUTES +
      1,
  },
  (_, idx) => {
    const minutes =
      OFFICE_VISIT_MIN_MINUTES + idx * OFFICE_VISIT_STEP_MINUTES;
    return {
      value: String(minutes),
      label: formatOfficeDurationLabel(minutes),
    };
  },
);

/** Returns standard 15-min duration options, preserving an existing non-standard
 *  legacy value at the top if present so the select never silently blanks it. */
export const getOfficeVisitDurationOptions = (currentValue) => {
  const str = String(currentValue ?? "").trim();
  if (!str) return OFFICE_VISIT_DURATION_OPTIONS;
  const exists = OFFICE_VISIT_DURATION_OPTIONS.some((opt) => opt.value === str);
  if (exists) return OFFICE_VISIT_DURATION_OPTIONS;
  const num = Number(str);
  if (!Number.isFinite(num) || num <= 0) return OFFICE_VISIT_DURATION_OPTIONS;
  const label = isValidOfficeVisitDuration(num)
    ? formatOfficeDurationLabel(num)
    : `${num} min (invalid — select 30+ min in 15-min steps)`;
  return [{ value: str, label }, ...OFFICE_VISIT_DURATION_OPTIONS];
};

/** Shared by the live counter and the submit validator so the two can never
 *  disagree about what counts as a word. */
export const countWords = (value) =>
  String(value || "").trim().split(/\s+/).filter(Boolean).length;

/** Tag comparison is case-insensitive: "Civil Law" and "civil law" are the
 *  same entry, for both duplicate prevention and membership checks. */
export const sameTag = (a, b) =>
  String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** Inputs always yield strings; the API expects numbers. */
export const toNumberOrNull = (value) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const sameArray = (a, b) => {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];

  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

/** Advocate object -> form state. Numbers become strings for the inputs. */
export const buildFormStateFromAdvocate = (advocate) => {
  const source = advocate || {};

  const state = {};

  EDITABLE_NUMBER_FIELDS.forEach((field) => {
    state[field] =
      source[field] === null || source[field] === undefined
        ? ""
        : String(source[field]);
  });

  EDITABLE_TEXT_FIELDS.forEach((field) => {
    state[field] = source[field] ?? "";
  });

  EDITABLE_ARRAY_FIELDS.forEach((field) => {
    state[field] = Array.isArray(source[field]) ? [...source[field]] : [];
  });

  return state;
};

/**
 * Builds the PATCH body from ONLY what actually changed.
 *
 * The comparison happens on coerced values, not raw input strings — otherwise
 * an untouched fee loaded as the number 50 and held in the input as the string
 * "50" would look changed on every submit, and the PATCH would stop being
 * partial.
 */
export const buildAdvocateProfilePatch = (form, original) => {
  const source = original || {};
  const payload = {};

  EDITABLE_NUMBER_FIELDS.forEach((field) => {
    const next = toNumberOrNull(form[field]);
    const current = toNumberOrNull(source[field]);

    if (next !== current) {
      payload[field] = next;
    }
  });

  EDITABLE_TEXT_FIELDS.forEach((field) => {
    const next = (form[field] ?? "").trim();
    const current = (source[field] ?? "").trim();

    if (next && next !== current) {
      payload[field] = next;
    }
  });

  EDITABLE_ARRAY_FIELDS.forEach((field) => {
    const next = Array.isArray(form[field]) ? form[field] : [];
    const current = Array.isArray(source[field]) ? source[field] : [];

    if (next.length > 0 && !sameArray(next, current)) {
      payload[field] = next;
    }
  });

  return payload;
};

/* -------------------------------------------------------------------------
   VALIDATION — mirrors the completion policy, expressed per input so each
   field can show its own message.
------------------------------------------------------------------------- */

const requireNumber = (value, label) => {
  const number = toNumberOrNull(value);
  if (number === null) return `${label} is required.`;
  if (number < 0) return `${label} can't be negative.`;
  return "";
};

const _requireText = (value, label, minLength = 1) => {
  const text = (value ?? "").trim();
  if (!text) return `${label} is required.`;
  if (text.length < minLength)
    return `${label} must be at least ${minLength} characters.`;
  return "";
};

const requireArray = (value, label) =>
  Array.isArray(value) && value.length > 0
    ? ""
    : `Please add at least one ${label}.`;

export const validateAdvocateProfileForm = (form) => {
  const errors = {};

  /* ---- experience + cases (both required) ---- */

  const experienceError = requireNumber(
    form.experienceYears,
    "Years of experience",
  );
  if (experienceError) errors.experienceYears = experienceError;

  const casesError = requireNumber(
  form.casesHandled,
  "Cases Handled",
);

if (casesError) {
  errors.casesHandled = casesError;
}

  /* ---- practice areas + best area ---- */

  const practiceAreas = Array.isArray(form.practiceAreas)
    ? form.practiceAreas
    : [];

  const practiceAreasError = requireArray(practiceAreas, "practice area");
  if (practiceAreasError) errors.practiceAreas = practiceAreasError;

  const bestArea = String(form.bestPracticeArea ?? "").trim();

  if (!bestArea) {
    errors.bestPracticeArea = "Please select your best practice area.";
  } else if (!practiceAreas.some((area) => sameTag(area, bestArea))) {
    /* Guards against a stale selection surviving a tag removal. */
    errors.bestPracticeArea =
      "Best practice area must be one of your practice areas.";
  }

  /* ---- courts + best court ---- */

  const courts = Array.isArray(form.courtPractice) ? form.courtPractice : [];

  const courtsError = requireArray(courts, "court");
  if (courtsError) errors.courtPractice = courtsError;

  const bestCourt = String(form.topCourtPractised ?? "").trim();

  if (!bestCourt) {
    errors.topCourtPractised = "Please select your best court.";
  } else if (!courts.some((court) => sameTag(court, bestCourt))) {
    errors.topCourtPractised =
      "Best court must be one of the courts you practise in.";
  }

  /* ---- bio: 50-500 words ---- */

  const aboutText = String(form.about ?? "").trim();
  const aboutWords = countWords(aboutText);

  if (!aboutText) {
    errors.about = "Professional bio is required.";
  } else if (aboutWords < ABOUT_MIN_WORDS) {
    errors.about = `${plural(
      ABOUT_MIN_WORDS - aboutWords,
      "more word",
    )} required.`;
  } else if (aboutWords > ABOUT_MAX_WORDS) {
    errors.about = `${plural(
      aboutWords - ABOUT_MAX_WORDS,
      "word",
    )} over the limit.`;
  }

  /* ---- consultation pricing ---- */

  if (
    form.voiceCallPricePer15Min !== "" &&
    form.voiceCallPricePer15Min !== null &&
    form.voiceCallPricePer15Min !== undefined
  ) {
    const voiceVal = toNumberOrNull(form.voiceCallPricePer15Min);
    if (voiceVal === null || voiceVal < 0) {
      errors.voiceCallPricePer15Min = "Voice call price must be a valid non-negative number.";
    }
  }

  if (
    form.videoCallPricePer15Min !== "" &&
    form.videoCallPricePer15Min !== null &&
    form.videoCallPricePer15Min !== undefined
  ) {
    const videoVal = toNumberOrNull(form.videoCallPricePer15Min);
    if (videoVal === null || videoVal < 0) {
      errors.videoCallPricePer15Min = "Video call price must be a valid non-negative number.";
    }
  }

  const officeDurationVal = toNumberOrNull(form.officeVisitDurationMinutes);
  const officeFeeVal = toNumberOrNull(form.offlineVisitingFee);
  const hasOfficeDuration = officeDurationVal !== null;
  const hasOfficeFee = officeFeeVal !== null;

  if (hasOfficeDuration !== hasOfficeFee) {
    if (!hasOfficeDuration) {
      errors.officeVisitDurationMinutes = "Office visit duration and price must both be provided or both be empty.";
    }
    if (!hasOfficeFee) {
      errors.offlineVisitingFee = "Office visit duration and price must both be provided or both be empty.";
    }
  } else {
    if (hasOfficeDuration) {
      if (!isValidOfficeVisitDuration(officeDurationVal)) {
        errors.officeVisitDurationMinutes = OFFICE_VISIT_DURATION_ERROR;
      }
    }
    if (hasOfficeFee) {
      if (officeFeeVal < 0) {
        errors.offlineVisitingFee = "Office visit price cannot be negative.";
      }
    }
  }

  return errors;
};

/** Maps a backend validation payload onto form field names. */
export const mapServerFieldErrors = (data) => {
  const source = data?.errors || data?.fieldErrors || null;
  if (!source) return {};

  const known = new Set([
    ...REQUIRED_ADVOCATE_PROFILE_FIELDS,
    ...EDITABLE_NUMBER_FIELDS,
    ...EDITABLE_TEXT_FIELDS,
    ...EDITABLE_ARRAY_FIELDS,
  ]);

  const mapped = {};

  if (Array.isArray(source)) {
    source.forEach((err) => {
      if (err.field && err.message) {
        mapped[err.field] = String(err.message);
      }
    });
    return mapped;
  }

  if (typeof source === "object") {
    Object.entries(source).forEach(([field, message]) => {
      if (!known.has(field)) return;

      mapped[field] = Array.isArray(message)
        ? String(message[0])
        : String(message);
    });
  }

  return mapped;
};
