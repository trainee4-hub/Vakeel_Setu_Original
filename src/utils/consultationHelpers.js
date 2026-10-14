

/* =========================================================
   CONSULTATION MODES
========================================================= */

export const MODE_OPTIONS = [
  {
    value: "message",
    label: "Message",
    icon: "chat",
  },
  {
    value: "video",
    label: "Video Call",
    icon: "videocam",
  },
  {
    value: "call",
    label: "Phone Call",
    icon: "call",
  },
  {
    value: "in_person",
    label: "Office Visit",
    icon: "location_on",
  },
];

/* =========================================================
   CONSULTATION TIME SLOTS
========================================================= */

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
];

/* =========================================================
   BASIC HELPERS
========================================================= */

export const normalizeText = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

export const titleCase = (value) => {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
};

/* =========================================================
   PERSON / PROFILE HELPERS
========================================================= */

export const getUserName = (user) => {
  if (!user) return "Client";

  return (
    user.fullName ||
    user.name ||
    user.personalDetails?.fullName ||
    user.personalDetails?.name ||
    "Client"
  );
};

export const getAdvocateName = (advocate) => {
  if (!advocate) return "Advocate";

  return (
    advocate.fullName ||
    advocate.name ||
    advocate.personalDetails?.fullName ||
    advocate.personalDetails?.name ||
    "Advocate"
  );
};

export const getProfileUrl = (person) => {
  if (!person) return "";

  return (
    person.profilePhotoUrl ||
    person.profileUrl ||
    person.photoUrl ||
    person.photo ||
    person.avatar ||
    person.personalDetails?.profilePhotoUrl ||
    person.personalDetails?.profileUrl ||
    person.personalDetails?.photoUrl ||
    person.personalDetails?.photo ||
    ""
  );
};

/* =========================================================
   PRACTICE AREA HELPERS
========================================================= */

export const getPracticeAreas = (advocate) => {
  if (!advocate) {
    return "Legal Professional";
  }

  const practiceAreas =
    advocate.practiceAreas ||
    advocate.professionalCredentials?.practiceAreas ||
    [];

  if (
    !Array.isArray(practiceAreas) ||
    practiceAreas.length === 0
  ) {
    return "Legal Professional";
  }

  return practiceAreas
    .filter(Boolean)
    .map(titleCase)
    .join(", ");
};

/* =========================================================
   MODE HELPERS
========================================================= */

export const normalizeMode = (value) => {
  const normalized = normalizeText(value);

  const aliases = {
    message: "message",
    chat: "message",

    video: "video",
    video_call: "video",
    videocall: "video",

    call: "call",
    voice: "call",
    phone: "call",
    audio: "call",
    voice_call: "call",

    offline: "in_person",
    office: "in_person",
    in_person: "in_person",
    "in-person": "in_person",
  };

  return (
    aliases[normalized] ||
    normalized ||
    "message"
  );
};

export const getModeLabel = (mode) => {
  const normalized = normalizeMode(mode);

  const option = MODE_OPTIONS.find(
    (item) => item.value === normalized,
  );

  return (
    option?.label ||
    titleCase(mode) ||
    "Consultation"
  );
};

export const getModeIcon = (mode) => {
  const normalized = normalizeMode(mode);

  const option = MODE_OPTIONS.find(
    (item) => item.value === normalized,
  );

  return option?.icon || "gavel";
};

/* =========================================================
   STATUS HELPERS
========================================================= */

export const normalizeStatus = (value) => {
  const normalized = normalizeText(value);

  if (normalized === "canceled") {
    return "cancelled";
  }

  return normalized;
};

export const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);

  const labels = {
    active: "Active",
    upcoming: "Upcoming",
    pending: "Pending",
    payment_pending: "Payment Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };

  return (
    labels[normalized] ||
    titleCase(status) ||
    "Unknown"
  );
};

export const getStatusIcon = (status) => {
  const normalized = normalizeStatus(status);

  const icons = {
    active: "radio_button_checked",
    upcoming: "event_upcoming",
    pending: "schedule",
    payment_pending: "payments",
    completed: "check_circle",
    cancelled: "cancel",
    rejected: "block",
  };

  return icons[normalized] || "info";
};

export const getStatusColor = (status) => {
  const normalized = normalizeStatus(status);

  const colors = {
    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    upcoming:
      "bg-blue-50 text-blue-700 border-blue-200",

    pending:
      "bg-amber-50 text-amber-700 border-amber-200",

    payment_pending:
      "bg-amber-50 text-amber-700 border-amber-200",

    completed:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    cancelled:
      "bg-red-50 text-red-700 border-red-200",

    rejected:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    colors[normalized] ||
    "bg-slate-50 text-slate-600 border-slate-200"
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

const isSimpleDate = (value) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(
    String(value || ""),
  );
};

/**
 * Display format:
 * 2026-09-02 -> 02 Sep 2026
 */
export const formatDate = (value) => {
  if (!value) {
    return "Date not available";
  }

  if (isSimpleDate(value)) {
    const [year, month, day] = String(value)
      .split("-")
      .map(Number);

    const localDate = new Date(
      year,
      month - 1,
      day,
    );

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(localDate);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/**
 * Returns YYYY-MM-DD.
 * Useful for:
 *
 * <input type="date" value={...} />
 */
export const formatDateForInput = (value) => {
  if (!value) {
    return "";
  }

  if (isSimpleDate(value)) {
    return String(value);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Today's local date:
 * YYYY-MM-DD
 */
export const getTodayDate = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Tomorrow's local date:
 * YYYY-MM-DD
 */
export const getTomorrowISO = () => {
  const tomorrow = new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1,
  );

  const year = tomorrow.getFullYear();

  const month = String(
    tomorrow.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    tomorrow.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   AMOUNT HELPERS
========================================================= */

export const getConsultationAmount = (
  consultation,
) => {
  if (!consultation) {
    return 0;
  }

  const value =
    consultation.payment?.amount ??
    consultation.amount ??
    consultation.consultationFee ??
    consultation.fee ??
    0;

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/* =========================================================
   CONSULTATION NORMALIZATION
========================================================= */

export const normalizeConsultation = (
  consultation,
) => {
  if (
    !consultation ||
    typeof consultation !== "object"
  ) {
    return null;
  }

  const rawMode =
    consultation.consultationMode ||
    consultation.mode ||
    consultation.type ||
    "message";

  const consultationMode =
    normalizeMode(rawMode);

  const rawStatus =
    consultation.status ||
    consultation.consultationStatus ||
    "pending";

  const status =
    normalizeStatus(rawStatus);

  const date =
    consultation.date ||
    consultation.scheduledDate ||
    consultation.bookingDate ||
    consultation.scheduledAt ||
    null;

  const time =
    consultation.time ||
    consultation.scheduledTimeSlot ||
    consultation.scheduledTime ||
    consultation.timeSlot ||
    "";

  const displayAmount =
    getConsultationAmount(
      consultation,
    );

  return {
    ...consultation,

    _id:
      consultation._id ||
      consultation.id ||
      consultation.consultationId ||
      null,

    status,

    consultationMode,

    consultationType:
      consultation.consultationType ||
      (consultationMode === "message"
        ? "Message Consultation"
        : "Legal Consultation"),

    displayDate:
      formatDate(date),

    displayTime:
      time ||
      "Time not available",

    displayAmount,
  };
};





/* =========================================================
   RESCHEDULE CONSULTATION
========================================================= */

/**
 * Temporary local reschedule implementation.
 *
 * Current Bookings.jsx demo/fallback data par run kar raha hai,
 * isliye abhi backend endpoint call nahi kiya ja raha.
 *
 * RescheduleModal expects:
 *
 * await handleReschedule({
 *   orderId,
 *   consultationId,
 *   newDate,
 *   newTime,
 *   consultationMode,
 * });
 *
 * Later backend ready hone par sirf isi function ke andar
 * fetch request replace karni hogi.
 */
export const handleReschedule = async ({
  orderId,
  consultationId,
  newDate,
  newTime,
  consultationMode,
}) => {
  const id =
    consultationId ||
    orderId;

  if (!id) {
    throw new Error(
      "Consultation ID is missing.",
    );
  }

  if (!newDate) {
    throw new Error(
      "Please select a new consultation date.",
    );
  }

  if (!newTime) {
    throw new Error(
      "Please select a new consultation time.",
    );
  }

  const normalizedMode =
    normalizeMode(
      consultationMode,
    );

  const allowedModes =
    MODE_OPTIONS.map(
      (option) => option.value,
    );

  if (
    !allowedModes.includes(
      normalizedMode,
    )
  ) {
    throw new Error(
      "Please select a valid consultation mode.",
    );
  }

  if (
    !TIME_SLOTS.includes(
      newTime,
    )
  ) {
    throw new Error(
      "Please select a valid consultation time.",
    );
  }

  /*
   * Keep the temporary async behavior,
   * same as a real API request.
   */
  await new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        400,
      );
    },
  );

  return {
    _id: id,

    id,

    consultationId: id,

    date: newDate,

    scheduledDate:
      newDate,

    time: newTime,

    scheduledTime:
      newTime,

    scheduledTimeSlot:
      newTime,

    consultationMode:
      normalizedMode,

    consultationType:
      normalizedMode ===
      "message"
        ? "Message Consultation"
        : "Legal Consultation",

    displayDate:
      formatDate(newDate),

    displayTime:
      newTime,

    updatedAt:
      new Date().toISOString(),
  };
};