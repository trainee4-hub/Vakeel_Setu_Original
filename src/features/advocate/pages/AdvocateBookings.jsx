import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Video,
} from "lucide-react";

import { getAdvocateAppointments } from "../services/advocateBookingApi";

/* =========================================================================
   ADVOCATE BOOKINGS
   Real endpoint: GET /api/advocate/appointments?status=...
   Tabs: ALL, UPCOMING, PAST_DUE, COMPLETED, REFUNDED
============================================================================ */

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const getBookingId = (booking) =>
  booking?.bookingId ||
  booking?.id ||
  booking?._id ||
  null;

const getClient = (booking) =>
  booking?.user ||
  booking?.client ||
  null;

const getClientName = (booking) => {
  const client = getClient(booking);
  return (
    cleanText(client?.name) ||
    cleanText(client?.fullName) ||
    "Client"
  );
};

const getInitials = (name) => {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "CL";
  }

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatISTDate = (isoString) => {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(isoString);
  }
};

const formatISTTimeSlot = (startAt, endAt, durationMinutes) => {
  if (!startAt) return "—";
  try {
    const start = new Date(startAt);
    if (Number.isNaN(start.getTime())) return "—";
    const startStr = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(start);

    if (endAt) {
      const end = new Date(endAt);
      if (!Number.isNaN(end.getTime())) {
        const endStr = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(end);
        return `${startStr} – ${endStr} (IST)`;
      }
    }

    if (durationMinutes) {
      return `${startStr} (${durationMinutes} mins IST)`;
    }

    return `${startStr} (IST)`;
  } catch {
    return "—";
  }
};

/**
 * FIX B: Consultation state derivation
 * Aligns with user side ("Pending" / "Completed") and admin ("Consultation Pending" / "Consultation Completed")
 */
const getDerivedStatus = (booking) => {
  const isCompleted = Boolean(booking?.completedAt || booking?.status === "COMPLETED");
  const isConfirmedOrPaid = ["CONFIRMED", "PAID"].includes(booking?.status);

  if (isCompleted) {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      tone: "emerald",
    };
  }

  if (isConfirmedOrPaid) {
    return {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      tone: "amber",
    };
  }

  if (booking?.status === "REFUNDED") {
    return {
      label: "Refunded",
      className: "border-purple-200 bg-purple-50 text-purple-700",
      tone: "purple",
    };
  }

  if (booking?.status === "CANCELLED") {
    return {
      label: "Cancelled",
      className: "border-red-200 bg-red-50 text-red-600",
      tone: "red",
    };
  }

  return {
    label: booking?.status || "Pending",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    tone: "slate",
  };
};

const getMode = (booking) => {
  const raw = cleanText(booking?.mode).toUpperCase();

  if (raw.includes("VIDEO")) {
    return {
      type: "video",
      label: "Video Call",
      Icon: Video,
    };
  }

  if (raw.includes("PHONE") || raw.includes("VOICE") || raw.includes("CALL")) {
    return {
      type: "call",
      label: "Voice Call",
      Icon: Phone,
    };
  }

  if (raw.includes("CHAT") || raw.includes("MESSAGE")) {
    return {
      type: "message",
      label: "Message Consultation",
      Icon: MessageSquare,
    };
  }

  return {
    type: "office",
    label: "In-Person Consultation",
    Icon: BriefcaseBusiness,
  };
};

/* =========================================================================
   SKELETON
============================================================================ */

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />
);

const AdvocateBookingsSkeleton = () => (
  <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
    <div className="w-full space-y-5 sm:space-y-6">
      <div className="rounded-[26px] border border-slate-200/70 bg-white p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-4 h-8 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-[430px] max-w-full" />

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[20px]" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="xl:col-span-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-4">
            <Skeleton className="h-11 w-full" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-7">
          <div className="min-h-[600px] rounded-[26px] border border-slate-200 bg-white p-6">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="mt-5 h-6 w-52" />
            <Skeleton className="mt-3 h-4 w-72" />
            <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
            <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </main>
);

/* =========================================================================
   AVATAR
============================================================================ */

const ClientAvatar = ({ booking, size = "md" }) => {
  const client = getClient(booking);
  const name = getClientName(booking);

  const image =
    client?.profilePhotoUrl ||
    client?.profileImage ||
    client?.avatar ||
    "";

  const sizeClass =
    size === "lg"
      ? "h-14 w-14 text-sm"
      : "h-11 w-11 text-xs";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-2xl object-cover ring-1 ring-slate-200`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 font-extrabold text-amber-700`}
    >
      {getInitials(name)}
    </div>
  );
};

/* =========================================================================
   MAIN COMPONENT
============================================================================ */

export default function AdvocateBookings() {
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({
    ALL: 0,
    UPCOMING: 0,
    PAST_DUE: 0,
    COMPLETED: 0,
    REFUNDED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async (selectedTab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdvocateAppointments({
        status: selectedTab,
        page: 1,
        limit: 50,
      });

      if (res?.success) {
        setAppointments(res.appointments || []);
        if (res.counts) {
          setCounts(res.counts);
        }
      } else {
        throw new Error(res?.message || "Failed to load bookings");
      }
    } catch (err) {
      setError(err?.message || "Could not load consultation bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments(tab);
  }, [loadAppointments, tab]);

  /* =========================================================================
     FILTER & SEARCH
  ========================================================================== */

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return appointments;

    return appointments.filter((booking) => {
      const client = getClient(booking);
      const searchable = [
        getClientName(booking),
        cleanText(booking?.bookingId),
        cleanText(booking?.subject),
        cleanText(client?.phone),
        cleanText(client?.email),
        cleanText(booking?.mode),
        cleanText(booking?.status),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [appointments, search]);

  /* =========================================================================
     SELECTED BOOKING
  ========================================================================== */

  const selectedBooking = useMemo(() => {
    if (selectedId) {
      const match = appointments.find(
        (b) => String(getBookingId(b)) === String(selectedId),
      );
      if (match) return match;
    }
    return filteredBookings[0] || null;
  }, [appointments, filteredBookings, selectedId]);

  /* =========================================================================
     TODAY COUNT (CALCULATED IN IST)
  ========================================================================== */

  const todayCount = useMemo(() => {
    const todayIST = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    return appointments.filter((booking) => {
      if (!booking?.startAt) return false;
      try {
        const itemIST = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(booking.startAt));
        return itemIST === todayIST;
      } catch {
        return false;
      }
    }).length;
  }, [appointments]);

  /* =========================================================================
     TABS CONFIGURATION (MATCHES API VALUES)
  ========================================================================== */

  const tabs = [
    { id: "ALL", label: "All", count: counts.ALL ?? appointments.length },
    { id: "UPCOMING", label: "Upcoming", count: counts.UPCOMING ?? 0 },
    { id: "PAST_DUE", label: "Past Due", count: counts.PAST_DUE ?? 0 },
    { id: "COMPLETED", label: "Completed", count: counts.COMPLETED ?? 0 },
    { id: "REFUNDED", label: "Refunded", count: counts.REFUNDED ?? 0 },
  ];

  /* =========================================================================
     PAGE RENDER
  ========================================================================== */

  if (loading && !appointments.length) {
    return <AdvocateBookingsSkeleton />;
  }

  return (
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
      <div className="w-full space-y-5 sm:space-y-6">
        {/* ===============================================================
            HEADER
        =============================================================== */}
        <MotionSection
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-full w-80 bg-gradient-to-l from-amber-50/80 to-transparent" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-700">
                <CalendarDays size={13} />
                Advocate Schedule
              </div>

              <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[29px]">
                Consultation Bookings
              </h1>

              <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                Review upcoming client consultations, past due sessions and booking details from one place.
              </p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={13} />
                  Live Advocate Workspace
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => loadAppointments(tab)}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* =============================================================
              FOUR STAT COUNTERS (WIRED TO REAL DATA)
          ============================================================= */}
          <div className="relative mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <BookingStat
              Icon={CalendarDays}
              label="Today"
              value={todayCount}
              tone="amber"
            />

            <BookingStat
              Icon={Clock3}
              label="Upcoming"
              value={counts.UPCOMING ?? 0}
              tone="blue"
            />

            <BookingStat
              Icon={AlertCircle}
              label="Past Due (Missed)"
              value={counts.PAST_DUE ?? 0}
              tone="violet"
            />

            <BookingStat
              Icon={CalendarCheck2}
              label="Completed"
              value={counts.COMPLETED ?? 0}
              tone="emerald"
            />
          </div>
        </MotionSection>

        {/* ===============================================================
            ERROR BANNER
        =============================================================== */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900">
                Booking information could not be refreshed
              </p>
              <p className="mt-0.5 text-xs leading-5 text-amber-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => loadAppointments(tab)}
              className="shrink-0 text-xs font-extrabold text-amber-700 hover:text-amber-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===============================================================
            TOOLBAR (TABS + SEARCH)
        =============================================================== */}
        <section className="rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {tabs.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-bold transition ${
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client, ID, subject..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
              />
            </div>
          </div>
        </section>

        {/* ===============================================================
            BOOKINGS WORKSPACE
        =============================================================== */}
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
          {/* =============================================================
              BOOKINGS LIST (LEFT)
          ============================================================= */}
          <section className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] xl:col-span-5">
            <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-[16px] font-extrabold text-slate-950">
                  {tabs.find((t) => t.id === tab)?.label || "All"} Bookings
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredBookings.length}{" "}
                  {filteredBookings.length === 1 ? "booking" : "bookings"}
                </p>
              </div>

              <CalendarCheck2 size={19} className="text-amber-500" />
            </div>

            {/* SCROLLABLE LIST */}
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredBookings.length ? (
                filteredBookings.map((booking, index) => {
                  const id = getBookingId(booking);
                  const currentId = getBookingId(selectedBooking);
                  const selected = String(id) === String(currentId);
                  const mode = getMode(booking);
                  const status = getDerivedStatus(booking);
                  const client = getClient(booking);
                  const clientName = getClientName(booking);

                  return (
                    <button
                      key={id || `booking-${index}`}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className={`group mb-2 flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all last:mb-0 ${
                        selected
                          ? "border-amber-300 bg-amber-50/70 shadow-sm"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60"
                      }`}
                    >
                      <ClientAvatar booking={booking} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {clientName}
                          </p>

                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-medium text-slate-600">
                            {booking.subject || "Legal Consultation"}
                          </p>
                          {booking.bookingId && (
                            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {booking.bookingId}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-400">
                          <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                            <CalendarDays size={11} className="text-amber-500" />
                            {formatISTDate(booking.startAt)}
                          </span>

                          <span>•</span>

                          <span>
                            {formatISTTimeSlot(booking.startAt, booking.endAt, booking.durationMinutes)}
                          </span>

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">
                            <mode.Icon size={11} />
                            {mode.label}
                          </span>
                        </div>

                        {/* Tappable client phone */}
                        {client?.phone && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                            <a
                              href={`tel:${client.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                            >
                              <Phone size={11} />
                              {client.phone}
                            </a>

                            <span className="font-extrabold text-slate-900 text-xs">
                              ₹{Number(booking.fee || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight
                        size={16}
                        className={`mt-3 shrink-0 transition ${
                          selected
                            ? "text-amber-500"
                            : "text-slate-300 group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full min-h-[460px] flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                    <CalendarDays size={23} />
                  </div>

                  <h3 className="mt-4 text-sm font-extrabold text-slate-950">
                    No bookings found
                  </h3>

                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                    {search
                      ? "Try changing your search query or tab."
                      : "No consultation bookings found for this category."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =============================================================
              BOOKING DETAILS (RIGHT PANEL)
          ============================================================= */}
          <section className="h-full min-h-[620px] rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] xl:col-span-7">
            {selectedBooking ? (
              <BookingDetails booking={selectedBooking} />
            ) : (
              <div className="flex h-full min-h-[620px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                  <CalendarCheck2 size={24} />
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-slate-950">
                  Select a consultation
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Choose a booking from the list to review client contact details, schedule and instructions.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================================
   STAT CARD
============================================================================ */

function BookingStat(props) {
  const tones = {
    amber: "border-amber-100 bg-amber-50/60 text-amber-600",
    blue: "border-blue-100 bg-blue-50/60 text-blue-600",
    violet: "border-violet-100 bg-violet-50/60 text-violet-600",
    emerald: "border-emerald-100 bg-emerald-50/60 text-emerald-600",
  };

  return (
    <div
      className={`rounded-[20px] border p-4 ${
        tones[props.tone] || tones.amber
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <props.Icon size={17} />
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">{props.label}</p>

      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
        {props.value}
      </p>
    </div>
  );
}

/* =========================================================================
   DETAIL PANEL
============================================================================ */

function BookingDetails({ booking }) {
  const client = getClient(booking);
  const clientName = getClientName(booking);
  const mode = getMode(booking);
  const status = getDerivedStatus(booking);

  const phone = cleanText(client?.phone);
  const email = cleanText(client?.email);

  return (
    <div className="p-5 sm:p-6 lg:p-7">
      {/* CLIENT HEADER */}
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <ClientAvatar booking={booking} size="lg" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-950">
                {clientName}
              </h2>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {booking.subject || "General Consultation"}
            </p>

            {booking.bookingId && (
              <p className="mt-1 font-mono text-xs font-bold text-slate-600">
                Ref: {booking.bookingId}
              </p>
            )}
          </div>
        </div>

        {/* CALL / EMAIL ACTIONS */}
        <div className="flex flex-wrap gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-400"
            >
              <Phone size={15} />
              Call Client
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            >
              <Mail size={15} />
              Email
            </a>
          )}
        </div>
      </div>

      {/* SCHEDULE CARDS (IST) */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
            <CalendarDays size={17} />
          </div>

          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Date (IST)
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">
            {formatISTDate(booking.startAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <Clock3 size={17} />
          </div>

          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Time Slot
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">
            {formatISTTimeSlot(booking.startAt, booking.endAt, booking.durationMinutes)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <mode.Icon size={17} />
          </div>

          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Consultation Mode
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">
            {mode.label}
          </p>
        </div>
      </div>

      {/* BACKEND INSTRUCTION MESSAGE */}
      {booking.message && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-amber-900">
              Instruction
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-amber-950">
              {booking.message}
            </p>
          </div>
        </div>
      )}

      {/* CLIENT CONTACT & CONSULTATION INFORMATION */}
      <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={17} className="text-amber-600" />
          <h3 className="text-sm font-extrabold text-slate-950">
            Client & Consultation Information
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
              Client Name
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">{clientName}</p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
              Phone Number
            </p>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:underline"
              >
                <Phone size={13} />
                {phone}
              </a>
            ) : (
              <p className="mt-1 text-sm text-slate-500">—</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
              Email Address
            </p>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:underline truncate max-w-full"
              >
                <Mail size={13} />
                {email}
              </a>
            ) : (
              <p className="mt-1 text-sm text-slate-500">—</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
              Consultation Fee
            </p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">
              ₹{Number(booking.fee || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {cleanText(booking?.subject) || "General Consultation"}
            </p>
          </div>
        </div>
      </section>

      {/* CONFIRMATION / WORKSPACE NOTE */}
      <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 p-4">
        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="text-xs font-extrabold text-blue-900">
            Booking Workspace Connected
          </p>
          <p className="mt-1 text-xs leading-5 text-blue-700">
            Consultations are loaded directly from your authenticated advocate account via{" "}
            <code className="font-mono font-bold">/api/advocate/appointments</code>.
          </p>
        </div>
      </div>
    </div>
  );
}