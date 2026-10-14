/* =========================================================================
   ADVOCATE DASHBOARD — PURE UTILITIES
   No React, no state, no requests.
   ========================================================================= */

export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const formatDashboardDate = (date = new Date()) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatShortDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getFirstName = (fullName) =>
  String(fullName || "").trim().split(/\s+/)[0] || "Advocate";

/** Advocate ids arrive as `id` from GET /advocate/profile; older records use
 *  `_id`. Read both rather than assuming either. */
export const getEntityId = (entity) =>
  entity?.id ?? entity?._id ?? null;

/* -------------------------------------------------------------------------
   CONSULTATIONS
------------------------------------------------------------------------- */

/** The other party on a consultation, from the advocate's point of view. */
export const getConsultationClient = (consultation) => {
  const client = consultation?.user || null;

  return {
    id: getEntityId(client),
    name: client?.fullName || client?.name || "Client",
    avatar: client?.profileUrl || client?.avatar?.url || null,
    raw: client,
  };
};

/** Icon + label for whichever consultation types the backend actually sends.
 *  Unknown types fall back to a neutral icon rather than being dropped. */
export const describeConsultationType = (type) => {
  switch (String(type || "").toLowerCase()) {
    case "video":
      return { icon: "video_call", label: "Video call", tone: "amber" };
    case "voice":
      return { icon: "call", label: "Voice call", tone: "sky" };
    case "office":
    case "offline":
      return { icon: "storefront", label: "Office visit", tone: "emerald" };
    case "message":
      return { icon: "chat", label: "Message", tone: "amber" };
    default:
      return { icon: "forum", label: type || "Consultation", tone: "slate" };
  }
};

export const describeConsultationStatus = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "active":
    case "accepted":
      return { label: "Active", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "completed":
      return { label: "Completed", dot: "bg-blue-500", chip: "bg-blue-50 text-blue-700 border-blue-200" };
    case "pending":
    case "requested":
      return { label: "Pending", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-700 border-amber-200" };
    case "cancelled":
    case "rejected":
      return { label: "Cancelled", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-600 border-slate-200" };
    default:
      return { label: status || "Unknown", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-600 border-slate-200" };
  }
};

const isPending = (consultation) =>
  ["pending", "requested"].includes(
    String(consultation?.status || "").toLowerCase(),
  );

const isCompleted = (consultation) =>
  String(consultation?.status || "").toLowerCase() === "completed";

const isCancelled = (consultation) =>
  ["cancelled", "rejected"].includes(
    String(consultation?.status || "").toLowerCase(),
  );

/** A consultation counts as upcoming only when the backend actually gave it a
 *  future scheduled date. Nothing is inferred for unscheduled requests. */
const isUpcoming = (consultation) => {
  if (isCompleted(consultation) || isCancelled(consultation)) return false;
  if (!consultation?.scheduledDate) return false;

  const scheduled = new Date(consultation.scheduledDate);
  if (Number.isNaN(scheduled.getTime())) return false;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return scheduled.getTime() >= startOfToday.getTime();
};

const byNewest = (a, b) =>
  new Date(b?.createdAt || 0).getTime() -
  new Date(a?.createdAt || 0).getTime();

const bySoonest = (a, b) =>
  new Date(a?.scheduledDate || 0).getTime() -
  new Date(b?.scheduledDate || 0).getTime();

/**
 * Groups the real consultation list. Every number here is a count of actual
 * records — nothing is estimated or filled in.
 */
export const summariseConsultations = (consultations = []) => {
  const list = Array.isArray(consultations) ? consultations : [];

  const upcoming = list.filter(isUpcoming).sort(bySoonest);
  const pending = list.filter(isPending).sort(byNewest);
  const completed = list.filter(isCompleted);
  const recent = [...list].sort(byNewest);

  /* Distinct clients across all consultations. */
  const clientIds = new Set(
    list.map((entry) => getEntityId(entry?.user)).filter(Boolean),
  );

  return {
    all: list,
    upcoming,
    pending,
    completed,
    recent,
    stats: {
      total: list.length,
      upcoming: upcoming.length,
      pending: pending.length,
      completed: completed.length,
      clients: clientIds.size,
    },
  };
};

/* -------------------------------------------------------------------------
   CONSULTATION MODES — real configured fees from the advocate profile
------------------------------------------------------------------------- */

export const getConsultationModes = (advocate) => {
  const modes = [
    {
      key: "video",
      label: "Video call",
      icon: "video_call",
      fee: advocate?.videoCallChargePerMinute,
      unit: "/min",
    },
    {
      key: "voice",
      label: "Voice call",
      icon: "call",
      fee: advocate?.voiceCallChargePerMinute,
      unit: "/min",
    },
    {
      key: "office",
      label: "Office visit",
      icon: "storefront",
      fee: advocate?.offlineVisitingFee,
      unit: "/visit",
    },
  ];

  return modes.map((mode) => {
    const numeric = Number(mode.fee);
    const configured = mode.fee !== null && mode.fee !== undefined && Number.isFinite(numeric);

    return {
      ...mode,
      configured,
      display: configured ? `₹${numeric}` : "Not set",
    };
  });
};
