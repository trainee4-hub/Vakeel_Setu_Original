import {
  API_BASE_URL,
} from "@shared/services/apiClient";

export { API_BASE_URL };

/* =========================================================================
   PROFILE SECTION NAVIGATION
============================================================================ */

export const SECTION_LINKS = [
  {
    id: "about",
    label: "About",
  },
  {
    id: "practice-areas",
    label: "Practice Areas",
  },
  {
    id: "reviews",
    label: "Reviews",
  },
  {
    id: "similar",
    label: "Similar Advocates",
  },
];

/* =========================================================================
   STATIC DATA
============================================================================ */

export const TIME_SLOTS = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
];


export const SUBJECT_OPTIONS = [
  "Criminal Defence",
  "Corporate",
  "Family",
  "Personal Injury",
  "Employment",
  "IP Rights",
  "Real Estate",
  "Tax",
  "Immigration",
  "Civil Litigation",
  "Other",
];
export const REVIEWS_PREVIEW_COUNT = 3;

/* -------------------------------------------------------------------------
   FORMATTING
------------------------------------------------------------------------- */

export const formatPracticeArea = (value) => {
  if (!value) return "Advocate";

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* The `area.replace(/_/g," ").replace(/\b\w/g, upper)` pattern used inline for
   practice-area tags and courts. Kept separate from formatPracticeArea because
   it does NOT split camelCase — matching the original tag rendering exactly. */
export const formatTagLabel = (value) =>
  String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const formatIndianDate = (value) => {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* -------------------------------------------------------------------------
   PRACTICE AREAS
------------------------------------------------------------------------- */

// Normalizes a practice-area value into a flat array of display-name strings.
// Supports both shapes real or legacy data might arrive in:
//   ['Criminal Law', 'Corporate']              (string array)
//   [{ name: 'Criminal Law' }, ...]             (object array)
//   'Criminal Law'                              (single string)
export const getPracticeAreaNames = (source) => {
  if (!source) return [];

  const raw = Array.isArray(source) ? source : [source];

  return raw
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        return item.name || item.label || item.area || null;
      }
      return null;
    })
    .filter(Boolean);
};

// Reads practice areas off an advocate object regardless of shape: the
// mapped nested shape used throughout the profile
// (professionalCredentials.practiceAreas), or a raw/legacy flat object
// (practiceAreas or the singular practiceArea). Never invents a value —
// returns [] when the advocate genuinely has none on record.
export const extractPracticeAreas = (adv) => {
  const source =
    adv?.professionalCredentials?.practiceAreas ??
    adv?.practiceAreas ??
    adv?.practiceArea ??
    null;

  return getPracticeAreaNames(source);
};

/* -------------------------------------------------------------------------
   TIME SLOTS
------------------------------------------------------------------------- */

export const getSlotPeriod = (slot) => {
  const startPart = slot.split(" - ")[0];
  const [time, meridiem] = startPart.split(" ");
  let [hour] = time.split(":").map(Number);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  if (hour < 12) return "Morning";
  if (hour < 15) return "Afternoon";
  return "Evening";
};

export const groupSlotsByPeriod = (slots) =>
  slots.reduce((acc, slot) => {
    const period = getSlotPeriod(slot);
    acc[period] = acc[period] || [];
    acc[period].push(slot);
    return acc;
  }, {});

/* A slot only counts as "past" when the selected date is today. */
export const isSlotPastForDate = (slot, selectedDate) => {
  if (!selectedDate) return false;

  const todayStr = new Date().toISOString().split("T")[0];
  if (selectedDate !== todayStr) return false;

  const startPart = slot.split(" - ")[0];
  const [time, meridiem] = startPart.split(" ");
  let [hour, minute] = time.split(":").map(Number);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const slotDateTime = new Date();
  slotDateTime.setHours(hour, minute, 0, 0);

  return slotDateTime.getTime() < Date.now();
};

/* -------------------------------------------------------------------------
   ADVOCATE NORMALIZATION
------------------------------------------------------------------------- */

// Maps the real GET /advocates/:id response into the nested shape
// (personalDetails / professionalCredentials / eliteMembership) the profile UI
// reads everywhere. Every value is taken as-is; null stays null.
export function mapDetailAdvocate(a) {
  const videoFee =
    a.videoCallChargePerMinute != null
      ? Number(a.videoCallChargePerMinute)
      : null;
  const voiceFee =
    a.voiceCallChargePerMinute != null
      ? Number(a.voiceCallChargePerMinute)
      : null;
  const officeFee =
    a.offlineVisitingFee != null ? Number(a.offlineVisitingFee) : null;
  const avgRating = a.averageRating != null ? Number(a.averageRating) : null;

  // The documented /advocates/:id sample doesn't include a verification
  // flag at all. This checks the handful of plausible field names a
  // backend commonly uses for this, so the blue verified badge lights up
  // automatically the moment the API actually sends one — but it never
  // defaults to true, so an advocate is never marked verified without a
  // real signal from the backend.
  const isVerified = Boolean(
    a.isVerified ??
      a.verified ??
      a.isOnboardingCompleted ??
      a.kycVerified ??
      a.isBarCouncilVerified ??
      false,
  );

  return {
    _id: a.id,
    id: a.id,
    personalDetails: {
      fullName: a.fullName,
      profileUrl: a.profilePhotoUrl || null,
      gender: a.gender ?? null,
      location: {
        city: a.city ?? null,
        state: a.state ?? null,
      },
      language: Array.isArray(a.languagesSpoken) ? a.languagesSpoken : [],
    },
    professionalCredentials: {
      yearsOfExperience: a.experienceYears ?? null,
      casesSolved: a.casesHandled ?? null,
      practiceAreas: Array.isArray(a.practiceAreas) ? a.practiceAreas : [],
      courtsPracticedIn: Array.isArray(a.courtPractice) ? a.courtPractice : [],
      professionalSummary: a.about || "",
    },
    eliteMembership: {
      // No `status`/duration fields exist on the API — a service counts as
      // active only when the advocate actually configured a charge for it
      // (null charge = not offered), and duration is left unset rather than
      // invented.
      voiceCall: {
        status: voiceFee != null ? "active" : null,
        fee: voiceFee,
      },
      videoCall: {
        status: videoFee != null ? "active" : null,
        fee: videoFee,
      },
      officeVisit: {
        status: officeFee != null ? "active" : null,
        fee: officeFee,
        officeLocation: a.completeAddress || "",
      },
    },
    rating: avgRating,
    averageRating: avgRating,
    reviewsCount: a.totalReviews ?? 0,
    totalReviews: a.totalReviews ?? 0,
    /* Like data, passed through only when the API actually sends it.
       `likeCount` is a public figure; `isLiked` is viewer-specific and may be
       absent, in which case useAdvocateLike resolves it from
       GET /user/liked-advocates. Neither is defaulted to a fake value —
       likeCount stays null when unknown so the UI can tell "zero likes" apart
       from "not reported". */
    likeCount: Number.isFinite(Number(a.likeCount)) ? Number(a.likeCount) : null,
    isLiked: typeof a.isLiked === "boolean" ? a.isLiked : null,
    topCourtPractised: a.topCourtPractised ?? null,
    bestPracticeArea: a.bestPracticeArea ?? null,
    isOnboardingCompleted: isVerified,
    // NOTE: the real /advocates/:id response does not include a `reviews`
    // array — reviews come from GET /advocates/:id/reviews instead.
  };
}