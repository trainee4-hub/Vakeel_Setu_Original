/* =========================================================================
   ADVOCATE PROFILE — COMPLETION POLICY (SINGLE SOURCE OF TRUTH)

   The backend does NOT return a profile-completion boolean, so completion is
   derived here and ONLY here. Login.jsx, the route guards, the Complete
   Profile page and the Dashboard all import from this file — none of them
   may declare their own field list.

   Registration already guarantees fullName / email / phone / profilePhotoUrl /
   gender / barCouncilId / aadhaarNumber / password / languagesSpoken / state /
   city / pincode, so none of those participate in this decision. Aadhaar,
   password and pincode additionally are not exposed by GET /advocate/profile
   and therefore cannot be used in a refresh-time guard at all.
   ========================================================================= */

export const REQUIRED_ADVOCATE_PROFILE_FIELDS = [
  "experienceYears",
  "casesHandled",
  "practiceAreas",
  "bestPracticeArea",
  "about",
  "courtPractice",
  "topCourtPractised",
];

/** Optional enhancements — never block dashboard access. */
export const OPTIONAL_ADVOCATE_PROFILE_FIELDS = [
  "voiceCallPricePer15Min",
  "videoCallPricePer15Min",
  "officeVisitDurationMinutes",
  "offlineVisitingFee",
  "country",
];

export const ADVOCATE_FIELD_LABELS = {
  experienceYears: "Years of experience",
  casesHandled: "Cases Handled",
  practiceAreas: "Practice areas",
  bestPracticeArea: "Best Practice area",
  about: "Professional bio",
  courtPractice: "Courts practised in",
  topCourtPractised: "Best Courts practised",
  voiceCallPricePer15Min: "Voice call price (15 min)",
  videoCallPricePer15Min: "Video call price (15 min)",
  officeVisitDurationMinutes: "Office visit duration (min)",
  offlineVisitingFee: "Office visit price",
  country: "Country",
};

/* -------------------------------------------------------------------------
   ROLE
------------------------------------------------------------------------- */

export const ADVOCATE_ROLES = ["advocate", "lawyer"];

/** GET /advocate/profile exposes the literal as `type: "advocate"`. */
export const getUserRole = (user) => {
  const role = user?.role ?? user?.type ?? user?.accountType ?? null;
  return typeof role === "string" ? role.trim().toLowerCase() : null;
};

export const isAdvocateUser = (user) =>
  ADVOCATE_ROLES.includes(getUserRole(user));

/**
 * Adds the `role` key the rest of the frontend reads, without mutating the
 * backend response. Apply this to every advocate object entering Redux:
 * login bootstrap, PATCH response, and photo-upload response.
 */
export const normalizeAdvocate = (advocate) => {
  if (!advocate) return null;

  return {
    ...advocate,
    role: advocate.role || advocate.type || "advocate",
  };
};

/* -------------------------------------------------------------------------
   VALUE PREDICATES
------------------------------------------------------------------------- */

const hasText = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasArrayValues = (value) => Array.isArray(value) && value.length > 0;

const hasNonNegativeNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0;
};

const hasValidBio = (value) => {
  if (!hasText(value)) {
    return false;
  }

  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;

  return words >= 50 && words <= 500;
};
/* Field -> predicate. Keeping this as a map means isAdvocateProfileComplete
   and getMissingAdvocateProfileFields can never drift apart. */
const FIELD_VALIDATORS = {
  experienceYears: hasNonNegativeNumber,
  casesHandled: hasNonNegativeNumber,

  practiceAreas: hasArrayValues,
  bestPracticeArea: hasText,

  about: hasValidBio,

  courtPractice: hasArrayValues,
  topCourtPractised: hasText,

  voiceCallPricePer15Min: (val) =>
    val === null || val === undefined || hasNonNegativeNumber(val),
  videoCallPricePer15Min: (val) =>
    val === null || val === undefined || hasNonNegativeNumber(val),
  officeVisitDurationMinutes: (val) => {
    if (val === null || val === undefined || val === "") return true;
    const num = Number(val);
    return Number.isInteger(num) && num >= 1 && num <= 1440;
  },
  offlineVisitingFee: (val) =>
    val === null || val === undefined || hasNonNegativeNumber(val),
};

/* -------------------------------------------------------------------------
   PUBLIC API
------------------------------------------------------------------------- */

export const isAdvocateOfficeDetailsComplete = (advocate) => {
  if (!advocate) return false;
  if (advocate.officeDetailsComplete === true) return true;
  const office = advocate.office || {};
  const photo = advocate.officePhotoUrl || office.photoUrl || office.officePhotoUrl;
  const lat = advocate.officeLatitude ?? office.latitude ?? office.officeLatitude;
  const lng = advocate.officeLongitude ?? office.longitude ?? office.officeLongitude;
  const hasCoords =
    lat !== null &&
    lat !== undefined &&
    lng !== null &&
    lng !== undefined &&
    !Number.isNaN(Number(lat)) &&
    !Number.isNaN(Number(lng));

  return Boolean(photo && hasCoords);
};

export const getMissingAdvocateProfileFields = (advocate) => {
  if (!advocate) {
    return [...REQUIRED_ADVOCATE_PROFILE_FIELDS];
  }

  return REQUIRED_ADVOCATE_PROFILE_FIELDS.filter(
    (field) => !FIELD_VALIDATORS[field](advocate[field]),
  );
};

/** THE decision function. */
export const isAdvocateProfileComplete = (advocate) => {
  if (!advocate) return false;

  return REQUIRED_ADVOCATE_PROFILE_FIELDS.every((field) =>
    FIELD_VALIDATORS[field](advocate[field]),
  );
};

/** Progress for the Complete Profile page and the dashboard card. */
export const getAdvocateProfileCompletion = (advocate) => {
  const missingFields = getMissingAdvocateProfileFields(advocate);

  const total = REQUIRED_ADVOCATE_PROFILE_FIELDS.length;
  const completed = total - missingFields.length;

  return {
    complete: missingFields.length === 0,
    completed,
    total,
    percentage: total === 0 ? 100 : Math.round((completed / total) * 100),
    missingFields,
    missingLabels: missingFields.map(
      (field) => ADVOCATE_FIELD_LABELS[field] || field,
    ),
  };
};

/**
 * Where an authenticated advocate belongs right now.
 *
 * Completion outranks any saved `from` location: an advocate who was heading
 * for the dashboard but hasn't finished their profile goes to complete-profile
 * regardless.
 */
export const resolveAdvocateRedirect = (advocate, from = null) => {
  if (!isAdvocateProfileComplete(advocate)) {
    return "/advocate/complete-profile";
  }

  if (
    from &&
    typeof from === "string" &&
    from.startsWith("/advocate/") &&
    from !== "/advocate/complete-profile"
  ) {
    return from;
  }

  return "/advocate/dashboard";
};
