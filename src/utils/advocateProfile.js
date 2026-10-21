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
  "completeAddress",
  "videoCallChargePerMinute",
  "voiceCallChargePerMinute",
  "offlineVisitingFee",
];

/** Optional enhancements — never block dashboard access. */
export const OPTIONAL_ADVOCATE_PROFILE_FIELDS = [
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
  completeAddress: "Office address",
  videoCallChargePerMinute: "Video call fee",
  voiceCallChargePerMinute: "Voice call fee",
  offlineVisitingFee: "Office visit fee",
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

  completeAddress: hasText,

  videoCallChargePerMinute: hasNonNegativeNumber,
  voiceCallChargePerMinute: hasNonNegativeNumber,
  offlineVisitingFee: hasNonNegativeNumber,
};

/* -------------------------------------------------------------------------
   PUBLIC API
------------------------------------------------------------------------- */

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
