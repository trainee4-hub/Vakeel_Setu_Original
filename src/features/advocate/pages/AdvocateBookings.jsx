import {
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
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
  UserRound,
  Video,
} from "lucide-react";

import useAdvocateDashboard from "../hooks/useAdvocateDashboard";

/* =========================================================================
   ADVOCATE BOOKINGS

   IMPORTANT
   -------------------------------------------------------------------------
   No fake booking API is called here.

   This page consumes the same consultation collections already exposed by
   useAdvocateDashboard():

   - upcoming
   - pending
   - recent

   Once the dashboard hook is connected to the final booking API, this page
   automatically receives the same real data.
============================================================================ */

/* =========================================================================
   HELPERS
============================================================================ */

const cleanText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const getBookingId = (booking) =>
  booking?.id ||
  booking?._id ||
  booking?.consultationId ||
  booking?.bookingId ||
  null;

const getClient = (booking) =>
  booking?.user ||
  booking?.client ||
  booking?.customer ||
  booking?.bookedBy ||
  null;

const getClientName = (booking) => {
  const client = getClient(booking);

  return (
    cleanText(client?.fullName) ||
    cleanText(client?.name) ||
    cleanText(booking?.clientName) ||
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

const getPracticeArea = (booking) =>
  cleanText(booking?.practiceArea) ||
  cleanText(booking?.category) ||
  cleanText(booking?.legalIssue) ||
  cleanText(booking?.subject) ||
  "Legal Consultation";

const getBookingDate = (booking) =>
  booking?.scheduledDate ||
  booking?.date ||
  booking?.consultationDate ||
  null;

const getBookingTime = (booking) =>
  cleanText(booking?.scheduledTime) ||
  cleanText(booking?.scheduledTimeSlot) ||
  cleanText(booking?.time) ||
  "";

const getMeetingUrl = (booking) =>
  booking?.meetingLink ||
  booking?.meetingUrl ||
  booking?.joinLink ||
  booking?.videoCallLink ||
  null;

const normalizeStatus = (booking) =>
  cleanText(booking?.status)
    .toLowerCase()
    .replace(/\s+/g, "_");

const getStatusMeta = (booking) => {
  const status = normalizeStatus(booking);

  if (
    [
      "completed",
      "complete",
      "done",
    ].includes(status)
  ) {
    return {
      label: "Completed",
      className:
        "border-emerald-100 bg-emerald-50 text-emerald-700",
    };
  }

  if (
    [
      "cancelled",
      "canceled",
      "rejected",
    ].includes(status)
  ) {
    return {
      label: "Cancelled",
      className:
        "border-red-100 bg-red-50 text-red-600",
    };
  }

  if (
    [
      "pending",
      "requested",
      "request_pending",
    ].includes(status)
  ) {
    return {
      label: "Pending",
      className:
        "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Confirmed",
    className:
      "border-blue-100 bg-blue-50 text-blue-700",
  };
};

const getMode = (booking) => {
  const raw = cleanText(
    booking?.consultationMode ||
    booking?.mode ||
    booking?.consultationType ||
    booking?.type,
  )
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (
    [
      "video",
      "video_call",
      "videocall",
    ].includes(raw)
  ) {
    return {
      type: "video",
      label: "Video Consultation",
      Icon: Video,
    };
  }

  if (
    [
      "call",
      "voice",
      "phone",
      "voice_call",
    ].includes(raw)
  ) {
    return {
      type: "call",
      label: "Voice Consultation",
      Icon: Phone,
    };
  }

  if (
    [
      "message",
      "chat",
    ].includes(raw)
  ) {
    return {
      type: "message",
      label: "Message Consultation",
      Icon: MessageSquare,
    };
  }

  return {
    type: "office",
    label: "Office Consultation",
    Icon: BriefcaseBusiness,
  };
};

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const input = String(value);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(input)
    ? new Date(`${input}T00:00:00`)
    : new Date(input);

  if (Number.isNaN(date.getTime())) {
    return input;
  }

  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  const sameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDate(date, today)) {
    return "Today";
  }

  if (sameDate(date, tomorrow)) {
    return "Tomorrow";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== today.getFullYear()
        ? "numeric"
        : undefined,
  }).format(date);
};

const getTimestamp = (booking) => {
  const date = getBookingDate(booking);

  if (!date) {
    return 0;
  }

  const normalizedDate =
    /^\d{4}-\d{2}-\d{2}$/.test(String(date))
      ? `${date}T00:00:00`
      : date;

  const timestamp = new Date(normalizedDate).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
};

/* =========================================================================
   SKELETON
============================================================================ */

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
  />
);

const AdvocateBookingsSkeleton = () => (
  <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
    <div className="w-full space-y-5 sm:space-y-6">
      <div className="rounded-[26px] border border-slate-200/70 bg-white p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-4 h-8 w-72 max-w-full" />
        <Skeleton className="mt-3 h-4 w-[430px] max-w-full" />

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-28 rounded-[20px]"
              />
            ),
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="xl:col-span-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-4">
            <Skeleton className="h-11 w-full" />

            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-28 rounded-2xl"
                  />
                ),
              )}
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

const ClientAvatar = ({
  booking,
  size = "md",
}) => {
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
   MAIN
============================================================================ */

export default function AdvocateBookings() {
  const {
    upcoming,
    pending,
    recent,
    isLoading,
    error,
    refresh,
  } = useAdvocateDashboard();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] =
    useState(null);

  /* =========================================================================
     NORMALIZE COLLECTIONS

     Do not inject mock data here.
  ========================================================================== */

  const upcomingBookings = Array.isArray(upcoming)
    ? upcoming
    : [];

  const pendingBookings = Array.isArray(pending)
    ? pending
    : [];

  const completedBookings = Array.isArray(recent)
    ? recent
    : [];

  const allBookings = useMemo(() => {
    const map = new Map();

    [
      ...pendingBookings,
      ...upcomingBookings,
      ...completedBookings,
    ].forEach((booking, index) => {
      const id =
        getBookingId(booking) ||
        `booking-${index}`;

      if (!map.has(String(id))) {
        map.set(String(id), booking);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        getTimestamp(b) - getTimestamp(a),
    );
  }, [
    pendingBookings,
    upcomingBookings,
    completedBookings,
  ]);

  /* =========================================================================
     FILTER
  ========================================================================== */

  const filteredBookings = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return allBookings.filter((booking) => {
      const status = normalizeStatus(booking);

      let matchesFilter = true;

      if (filter === "upcoming") {
        matchesFilter =
          upcomingBookings.some(
            (entry) =>
              String(getBookingId(entry)) ===
              String(getBookingId(booking)),
          );
      }

      if (filter === "pending") {
        matchesFilter =
          pendingBookings.some(
            (entry) =>
              String(getBookingId(entry)) ===
              String(getBookingId(booking)),
          );
      }

      if (filter === "completed") {
        matchesFilter =
          completedBookings.some(
            (entry) =>
              String(getBookingId(entry)) ===
              String(getBookingId(booking)),
          ) ||
          status === "completed";
      }

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const client = getClient(booking);

      const searchable = [
        getClientName(booking),
        getPracticeArea(booking),
        client?.email,
        client?.phone,
        client?.city,
        client?.state,
        getMode(booking).label,
        cleanText(booking?.status),
      ]
        .map(cleanText)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [
    allBookings,
    completedBookings,
    filter,
    pendingBookings,
    search,
    upcomingBookings,
  ]);

  /* =========================================================================
     SELECTED
  ========================================================================== */

  const selectedBooking = useMemo(() => {
    if (selectedId) {
      const match = allBookings.find(
        (booking) =>
          String(getBookingId(booking)) ===
          String(selectedId),
      );

      if (match) {
        return match;
      }
    }

    return filteredBookings[0] || null;
  }, [
    allBookings,
    filteredBookings,
    selectedId,
  ]);

  /* =========================================================================
     STATS
  ========================================================================== */

  const todayCount = useMemo(() => {
    const today = new Date();

    return allBookings.filter((booking) => {
      const value = getBookingDate(booking);

      if (!value) return false;

      const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(
          String(value),
        )
          ? `${value}T00:00:00`
          : value,
      );

      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() ===
        today.getFullYear() &&
        date.getMonth() ===
        today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [allBookings]);

  const filters = [
    {
      id: "all",
      label: "All",
      count: allBookings.length,
    },
    {
      id: "upcoming",
      label: "Upcoming",
      count: upcomingBookings.length,
    },
    {
      id: "pending",
      label: "Pending",
      count: pendingBookings.length,
    },
    {
      id: "completed",
      label: "Completed",
      count: completedBookings.length,
    },
  ];

  /* =========================================================================
     LOADING
  ========================================================================== */

  if (isLoading && !allBookings.length) {
    return <AdvocateBookingsSkeleton />;
  }

  /* =========================================================================
     PAGE
  ========================================================================== */

  return (
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
      <div className="w-full space-y-5 sm:space-y-6">
        {/* ===============================================================
            HEADER
        =============================================================== */}

        <motion.section
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }}
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
                Review upcoming consultations,
                pending requests and completed
                client sessions from one place.
              </p>

              <div className="mt-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={13} />
                  Advocate workspace
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={refresh}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  isLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* =============================================================
              STATS
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
              value={upcomingBookings.length}
              tone="blue"
            />

            <BookingStat
              Icon={AlertCircle}
              label="Pending"
              value={pendingBookings.length}
              tone="violet"
            />

            <BookingStat
              Icon={CalendarCheck2}
              label="Completed"
              value={completedBookings.length}
              tone="emerald"
            />
          </div>
        </motion.section>

        {/* ===============================================================
            ERROR
        =============================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-900">
                Booking information could not
                be fully refreshed
              </p>

              <p className="mt-0.5 text-xs leading-5 text-amber-700">
                {error?.message ||
                  String(error)}
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              className="shrink-0 text-xs font-extrabold text-amber-700 hover:text-amber-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===============================================================
            TOOLBAR
        =============================================================== */}

        <section className="rounded-[22px] border border-slate-200/80 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.03)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {filters.map((item) => {
                const active =
                  filter === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setFilter(item.id)
                    }
                    className={`inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-bold transition ${active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                  >
                    {item.label}

                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${active
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
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search bookings..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
              />
            </div>
          </div>
        </section>


        {/* ===============================================================
            BOOKINGS WORKSPACE
        ================================================================ */}

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
          {/* =============================================================
                BOOKINGS LIST
            ============================================================= */}

          <section className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] xl:col-span-5">
            <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-[16px] font-extrabold text-slate-950">
                  {filter === "all"
                    ? "All Consultations"
                    : `${filter.charAt(0).toUpperCase() +
                    filter.slice(1)
                    } Consultations`}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredBookings.length}{" "}
                  {filteredBookings.length === 1
                    ? "booking"
                    : "bookings"}
                </p>
              </div>

              <CalendarCheck2
                size={19}
                className="text-amber-500"
              />
            </div>

            {/* SCROLLABLE CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredBookings.length ? (
                filteredBookings.map((booking, index) => {
                  const id = getBookingId(booking);

                  const currentId = getBookingId(
                    selectedBooking,
                  );

                  const selected =
                    String(id) === String(currentId);

                  const mode = getMode(booking);
                  const status = getStatusMeta(booking);

                  return (
                    <button
                      key={id || `booking-${index}`}
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className={`group mb-1 flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all last:mb-0 ${selected
                          ? "border-amber-200 bg-amber-50/70 shadow-sm"
                          : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                      <ClientAvatar booking={booking} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-extrabold text-slate-900">
                            {getClientName(booking)}
                          </p>

                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs font-medium text-slate-500">
                          {getPracticeArea(booking)}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={10} />

                            {formatDate(
                              getBookingDate(booking),
                            )}
                          </span>

                          {getBookingTime(booking) && (
                            <>
                              <span>•</span>

                              <span>
                                {getBookingTime(booking)}
                              </span>
                            </>
                          )}

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">
                            <mode.Icon size={10} />

                            {mode.type === "office"
                              ? "Office"
                              : mode.type === "video"
                                ? "Video"
                                : mode.type === "call"
                                  ? "Voice"
                                  : "Message"}
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        size={16}
                        className={`mt-3 shrink-0 transition ${selected
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
                      ? "Try changing your search or selected filter."
                      : "Your consultation bookings will appear here when booking data becomes available."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* =============================================================
      BOOKING DETAILS
  ============================================================= */}

          <section className="h-full min-h-[620px] rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)] xl:col-span-7">
            {selectedBooking ? (
              <BookingDetails
                booking={selectedBooking}
              />
            ) : (
              <div className="flex h-full min-h-[620px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
                  <CalendarCheck2 size={24} />
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-slate-950">
                  Select a consultation
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Choose a booking from the list to review
                  client, schedule and consultation
                  information.
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
   STAT
============================================================================ */

function BookingStat({
  Icon,
  label,
  value,
  tone,
}) {
  const tones = {
    amber:
      "border-amber-100 bg-amber-50/60 text-amber-600",
    blue:
      "border-blue-100 bg-blue-50/60 text-blue-600",
    violet:
      "border-violet-100 bg-violet-50/60 text-violet-600",
    emerald:
      "border-emerald-100 bg-emerald-50/60 text-emerald-600",
  };

  return (
    <div
      className={`rounded-[20px] border p-4 ${tones[tone] ||
        tones.amber
        }`}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon size={17} />
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}

/* =========================================================================
   DETAILS
============================================================================ */

function BookingDetails({ booking }) {
  const client = getClient(booking);
  const clientName = getClientName(booking);

  const mode = getMode(booking);
  const status = getStatusMeta(booking);

  const meetingUrl =
    getMeetingUrl(booking);

  const phone = cleanText(
    client?.phone,
  );

  const email = cleanText(
    client?.email,
  );

  const address = [
    client?.city,
    client?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const handlePrimaryAction = () => {
    if (meetingUrl) {
      window.open(
        meetingUrl,
        "_blank",
        "noopener,noreferrer",
      );

      return;
    }

    if (
      mode.type === "call" &&
      phone
    ) {
      window.location.href = `tel:${phone}`;

      return;
    }

    if (
      mode.type === "message" &&
      email
    ) {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-7">
      {/* ===============================================================
          CLIENT HEADER
      =============================================================== */}

      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <ClientAvatar
            booking={booking}
            size="lg"
          />

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
              {getPracticeArea(booking)}
            </p>

            {address && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin size={12} />
                {address}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
            >
              <Phone size={15} />
              Call
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

      {/* ===============================================================
          SCHEDULE
      =============================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
            <CalendarDays size={17} />
          </div>

          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Date
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">
            {formatDate(
              getBookingDate(booking),
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <Clock3 size={17} />
          </div>

          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Time
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">
            {getBookingTime(booking) ||
              "Not specified"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <mode.Icon size={17} />
          </div>

          <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            Consultation
          </p>

          <p className="mt-1 text-sm font-extrabold text-slate-800">
            {mode.label}
          </p>
        </div>
      </div>

      {/* ===============================================================
          CASE INFORMATION
      =============================================================== */}

      <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness
            size={17}
            className="text-amber-600"
          />

          <h3 className="text-sm font-extrabold text-slate-950">
            Consultation Details
          </h3>
        </div>

        <div className="mt-4 space-y-4">
          {(booking?.subject ||
            booking?.note) && (
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                  Subject
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                  {cleanText(
                    booking?.subject ||
                    booking?.note,
                  )}
                </p>
              </div>
            )}

          {booking?.description && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                Description
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {booking.description}
              </p>
            </div>
          )}

          {!booking?.subject &&
            !booking?.note &&
            !booking?.description && (
              <p className="text-sm leading-6 text-slate-500">
                No additional consultation
                details were provided.
              </p>
            )}
        </div>
      </section>

      {/* ===============================================================
          PRIMARY ACTION
      =============================================================== */}

      {meetingUrl && (
        <button
          type="button"
          onClick={handlePrimaryAction}
          className="mt-5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white shadow-md shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <Video size={17} />
          Join Meeting
        </button>
      )}

      {!meetingUrl &&
        mode.type === "call" &&
        phone && (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="mt-5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800"
          >
            <Phone size={17} />
            Call Client
          </button>
        )}

      {/* ===============================================================
          API NOTE
      =============================================================== */}

      <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-blue-100 bg-blue-50/60 p-4">
        <CheckCircle2
          size={17}
          className="mt-0.5 shrink-0 text-blue-600"
        />

        <div>
          <p className="text-xs font-extrabold text-blue-900">
            Booking workspace
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700">
            This page uses the consultation
            collections already supplied by the
            Advocate Dashboard data hook. No
            separate undocumented booking endpoint
            is called from this page.
          </p>
        </div>
      </div>
    </div>
  );
}