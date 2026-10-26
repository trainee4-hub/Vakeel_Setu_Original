import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiHash,
  FiInfo,
  FiLock,
  FiMail,
  FiPhone,
  FiPrinter,
  FiRefreshCw,
  FiVideo,
  FiX,
  FiBriefcase,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../auth";
import { getUserRole } from "../../../utils/advocateProfile";
import {
  getUserBookings,
  getUserBookingById,
} from "../services/consultancyApi";
import {
  formatBookingAmount,
  formatPaymentDateTime,
  getBookingBadge,
  getTimelineEventLabel,
  getPaymentStatusLabel,
  getAdvocateBookingTitle,
  getConsultancyBookingTitle,
  getBookingDisplayTitle,
  getAdvocateAvatarData,
} from "../utils/paymentUtils";

/* =========================================================================
   STATUS TABS CONFIGURATION
========================================================================= */

const TAB_CONFIG = [
  { key: "ALL", label: "All" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
];

/* =========================================================================
   MAIN BOOKINGS COMPONENT
========================================================================= */

export default function Bookings() {
  const navigate = useNavigate();
  const { id: urlBookingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const role = getUserRole(user);

  // Role Gate: USERS only. Advocates/admins see no-access screen.
  const isForbiddenRole = role === "advocate" || role === "admin";

  // List State
  const rawStatus = (searchParams.get("status") || "ALL").toUpperCase();
  const validTabs = TAB_CONFIG.map((t) => t.key);
  const activeTab = validTabs.includes(rawStatus) ? rawStatus : "ALL";
  const rawType = (searchParams.get("type") || "ALL").toUpperCase();
  const selectedType = ["ALL", "CONSULTANCY", "ADVOCATE"].includes(rawType)
    ? rawType
    : "ALL";
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({
    ALL: 0,
    UPCOMING: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    REFUNDED: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState(null);

  // Detail State (when urlBookingId is present)
  const [detailBooking, setDetailBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Printable Receipt State
  const [receiptBooking, setReceiptBooking] = useState(null);

  /* -------------------------------------------------------------------------
     FETCH LIST DATA
  ------------------------------------------------------------------------- */
  const fetchBookingsList = useCallback(
    async (pageToFetch = 1, append = false) => {
      if (isForbiddenRole) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setListError(null);

      try {
        const response = await getUserBookings({
          status: activeTab,
          type: selectedType !== "ALL" ? selectedType : undefined,
          page: pageToFetch,
          limit: 10,
        });

        const nonRefunded = (response.bookings || []).filter((b) => {
          const st = String(b.status || "").toUpperCase();
          return st !== "REFUNDED" && st !== "REFUND_PENDING";
        });

        if (append) {
          setBookings((prev) => {
            const existingIds = new Set(prev.map((b) => b.id));
            const newItems = nonRefunded.filter((b) => !existingIds.has(b.id));
            return [...prev, ...newItems];
          });
        } else {
          setBookings(nonRefunded);
        }

        if (response.counts) {
          setCounts(response.counts);
        }

        if (response.pagination) {
          setPagination(response.pagination);
        }
      } catch (err) {
        if (err?.status === 401) {
          navigate("/login", { replace: true, state: { from: "/bookings" } });
          return;
        }
        if (err?.status === 403) {
          setListError({
            status: 403,
            message: "Access forbidden. Insufficient permissions.",
          });
          return;
        }
        setListError({
          status: err?.status || 500,
          message:
            err?.message || "Failed to load bookings. Please try again.",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, selectedType, isForbiddenRole, navigate]
  );

  /* -------------------------------------------------------------------------
     FETCH DETAIL DATA
  ------------------------------------------------------------------------- */
  const fetchBookingDetail = useCallback(
    async (id) => {
      if (!id || isForbiddenRole) return;
      setDetailLoading(true);
      setDetailError(null);

      try {
        const response = await getUserBookingById(id);
        const bookingStatus = String(response?.booking?.status || "").toUpperCase();
        if (response?.booking && bookingStatus !== "REFUNDED" && bookingStatus !== "REFUND_PENDING") {
          setDetailBooking(response.booking);
        } else {
          setDetailError({ status: 404, message: "Booking not found." });
        }
      } catch (err) {
        if (err?.status === 401) {
          navigate("/login", { replace: true, state: { from: `/bookings/${id}` } });
          return;
        }
        if (err?.status === 403) {
          setDetailError({
            status: 403,
            message: "Access forbidden. Insufficient permissions.",
          });
          return;
        }
        if (err?.status === 404) {
          setDetailError({ status: 404, message: "Booking not found." });
          return;
        }
        setDetailError({
          status: err?.status || 500,
          message: err?.message || "Failed to load booking details.",
        });
      } finally {
        setDetailLoading(false);
      }
    },
    [isForbiddenRole, navigate]
  );

  // Sync List when on /bookings without :id
  useEffect(() => {
    if (!urlBookingId && !isForbiddenRole) {
      fetchBookingsList(1, false);
    }
  }, [urlBookingId, activeTab, fetchBookingsList, isForbiddenRole]);

  // Sync Detail when urlBookingId changes
  useEffect(() => {
    if (urlBookingId && !isForbiddenRole) {
      fetchBookingDetail(urlBookingId);
    } else {
      setDetailBooking(null);
      setDetailError(null);
    }
  }, [urlBookingId, fetchBookingDetail, isForbiddenRole]);

  /* -------------------------------------------------------------------------
     HANDLERS
  ------------------------------------------------------------------------- */
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setSearchParams({ status: newTab });
  };

  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchBookingsList(pagination.page + 1, true);
    }
  };

  const handleResetFilters = () => {
    setSearchParams({ status: "ALL" });
  };

  const handleTypeChange = (newType) => {
    if (newType === selectedType) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newType === "ALL") {
        next.delete("type");
      } else {
        next.set("type", newType);
      }
      return next;
    });
  };

  /* -------------------------------------------------------------------------
     RENDER: ROLE FORBIDDEN (Advocate / Admin)
  ------------------------------------------------------------------------- */
  if (isForbiddenRole || listError?.status === 403 || detailError?.status === 403) {
    return (
      <NoAccessView
        role={role}
        onNavigateDashboard={() => {
          if (role === "advocate") navigate("/advocate/dashboard");
          else if (role === "admin") navigate("/admin/dashboard");
          else navigate("/dashboard");
        }}
      />
    );
  }

  /* -------------------------------------------------------------------------
     RENDER: DETAIL PAGE (when /bookings/:id is active)
  ------------------------------------------------------------------------- */
  if (urlBookingId) {
    return (
      <div className="min-h-screen bg-slate-50/70 pb-20 pt-20">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Top back button */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <FiArrowLeft className="text-base" />
              <span>Back to My Bookings</span>
            </button>
          </div>

          {detailLoading ? (
            <DetailSkeleton />
          ) : detailError ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                <FiInfo className="text-2xl" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {detailError.message || "Booking not found."}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                The requested consultation booking could not be retrieved or does not exist.
              </p>
              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-500"
              >
                Back to bookings
              </button>
            </div>
          ) : detailBooking ? (
            detailBooking.bookingType === "ADVOCATE" ? (
              <AdvocateBookingDetailView
                booking={detailBooking}
                onOpenReceipt={() => setReceiptBooking(detailBooking)}
              />
            ) : (
              <BookingDetailView
                booking={detailBooking}
                onOpenReceipt={() => setReceiptBooking(detailBooking)}
              />
            )
          ) : null}
        </div>

        {/* Printable Receipt Modal */}
        {receiptBooking && (
          <PrintableReceiptModal
            booking={receiptBooking}
            onClose={() => setReceiptBooking(null)}
          />
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------------------
     RENDER: LIST PAGE (/bookings)
  ------------------------------------------------------------------------- */
  const visibleTabs = TAB_CONFIG.filter((tab) => {
    if (tab.key === "PROCESSING") {
      return (counts.PROCESSING || 0) > 0;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <FiCalendar className="text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  My Bookings
                </h1>
                <p className="text-sm font-medium text-slate-500">
                  Track and manage your legal consultation bookings and payments.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/find-lawyer"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-amber-500 sm:self-auto"
          >
            <span>Book Consultation</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
          {visibleTabs.map((tab) => {
            const count = counts[tab.key] ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Type Filter Pills */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            Type:
          </span>
          {[
            { key: "ALL", label: "All Bookings" },
            { key: "CONSULTANCY", label: "Consultancy" },
            { key: "ADVOCATE", label: "Advocates" },
          ].map((t) => {
            const isSelected = selectedType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTypeChange(t.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        {loading ? (
          <ListSkeleton />
        ) : listError ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <FiInfo className="text-2xl" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Couldn&apos;t load your bookings
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {listError.message}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => fetchBookingsList(1, false)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-500"
              >
                <FiRefreshCw className="text-sm" />
                <span>Retry</span>
              </button>
              {listError.status === 400 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyBookingsTabState onBookConsultation={() => navigate("/find-lawyer")} />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => navigate(`/bookings/${booking.id}`)}
              />
            ))}

            {/* Pagination Load More */}
            {pagination.hasNextPage && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                      <span>Loading more...</span>
                    </>
                  ) : (
                    <span>Load More Bookings</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {receiptBooking && (
        <PrintableReceiptModal
          booking={receiptBooking}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
}

/* =========================================================================
   ADVOCATE HELPERS & CARD
========================================================================= */

function formatAdvocateSlotTime(startAt, endAt) {
  if (!startAt) return "";
  try {
    const start = new Date(startAt);
    const end = endAt ? new Date(endAt) : null;

    const datePart = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(start);

    const startTimePart = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(start);

    const endTimePart = end
      ? new Intl.DateTimeFormat("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }).format(end)
      : "";

    return `${datePart}, ${startTimePart}${endTimePart ? ` – ${endTimePart}` : ""} IST`;
  } catch {
    return String(startAt);
  }
}

function getAdvocateBadge(booking) {
  return getBookingBadge(booking);
}

function AdvocateBookingCard({ booking, onClick }) {
  const mode = booking.mode || booking.callType;
  const isVideo = mode === "VIDEO_CALL";
  const isInPerson = mode === "IN_PERSON";
  const badge = getAdvocateBadge(booking);
  const avatar = getAdvocateAvatarData(booking);
  const title = getAdvocateBookingTitle(booking);

  const rawTotal =
    booking.total ??
    booking.price ??
    (booking.totalPaise ? booking.totalPaise / 100 : null) ??
    (booking.breakdown?.total ?? 0);
  const formattedPrice = formatBookingAmount(rawTotal);

  const slotDisplay = booking.startAt
    ? formatAdvocateSlotTime(booking.startAt, booking.endAt)
    : formatPaymentDateTime(booking.createdAt);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400/80 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        {/* Left: Avatar/Icon, Title, Date */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {avatar.photo ? (
              <img
                src={avatar.photo}
                alt={avatar.name || "Advocate"}
                className="h-12 w-12 rounded-2xl border border-slate-200 object-cover"
              />
            ) : avatar.initial ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-lg font-black text-amber-700">
                {avatar.initial}
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600">
                {isVideo ? (
                  <FiVideo className="text-xl" />
                ) : isInPerson ? (
                  <FiBriefcase className="text-xl" />
                ) : (
                  <FiPhone className="text-xl" />
                )}
              </div>
            )}
            <div
              className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md text-[10px] text-white shadow-sm ${
                isVideo
                  ? "bg-purple-600"
                  : isInPerson
                  ? "bg-emerald-600"
                  : "bg-sky-600"
              }`}
              title={
                isVideo
                  ? "Video Call"
                  : isInPerson
                  ? "In-Person Consultation"
                  : "Voice Call"
              }
            >
              {isVideo ? (
                <FiVideo />
              ) : isInPerson ? (
                <FiBriefcase />
              ) : (
                <FiPhone />
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-950 transition group-hover:text-amber-600 sm:text-lg">
                {title}
              </h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.className}`}
              >
                {badge.label}
              </span>
              {booking.bookingId && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                  {booking.bookingId}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <FiCalendar className="text-slate-400" />
                <span>{slotDisplay}</span>
              </span>
              {booking.durationMinutes && (
                <span className="flex items-center gap-1">
                  <FiClock className="text-slate-400" />
                  <span>{booking.durationMinutes} min</span>
                </span>
              )}
              {booking.subject && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {booking.subject}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Price & Details Arrow */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <span className="text-lg font-black text-slate-950 sm:text-xl">
            {formattedPrice}
          </span>
          <span className="text-xs font-bold text-amber-600 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>

      {booking.status === "PAYMENT_PROCESSING" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs font-bold text-amber-900">
          <FiInfo className="shrink-0 text-base text-amber-600" />
          <span>Your bank is confirming the payment. Do not pay again.</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   BOOKING CARD COMPONENT
========================================================================= */

function BookingCard({ booking, onClick }) {
  if (booking.bookingType === "ADVOCATE") {
    return <AdvocateBookingCard booking={booking} onClick={onClick} />;
  }
  const isVideo = booking.callType === "VIDEO_CALL";
  const badge = getBookingBadge(booking);
  const formattedPrice = formatBookingAmount(booking.price);
  const formattedCreatedAt = formatPaymentDateTime(booking.createdAt);
  const title = getConsultancyBookingTitle(booking);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-amber-400/80 hover:shadow-md sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        {/* Left: Icon, Title, Date */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl shadow-inner ${
              isVideo
                ? "bg-purple-50 text-purple-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {isVideo ? <FiVideo /> : <FiPhone />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-950 transition group-hover:text-amber-600 sm:text-lg">
                {title}
              </h3>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <FiCalendar className="text-slate-400" />
                <span>Booked on {formattedCreatedAt}</span>
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="text-slate-400" />
                <span>{booking.durationMinutes} min</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Price & Details Arrow */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <span className="text-lg font-black text-slate-950 sm:text-xl">
            {formattedPrice}
          </span>
          <span className="text-xs font-bold text-amber-600 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>

      {/* Special Contextual Banners */}
      {booking.status === "PAYMENT_PROCESSING" && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs font-bold text-amber-900">
          <FiInfo className="shrink-0 text-base text-amber-600" />
          <span>Your bank is confirming the payment. Do not pay again.</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   BOOKING DETAIL VIEW
========================================================================= */

function BookingDetailView({ booking, onOpenReceipt }) {
  const isVideo = booking.callType === "VIDEO_CALL";
  const badge = getBookingBadge(booking);
  const formattedPrice = formatBookingAmount(booking.price);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner ${
                  isVideo
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {isVideo ? <FiVideo /> : <FiPhone />}
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badge.className}`}
                >
                  {badge.label}
                </span>
                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  {getConsultancyBookingTitle(booking)}
                </h2>
                {booking.bookingId && (
                  <p className="mt-1 text-xs text-slate-500">
                    Booking ID:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {booking.bookingId}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Consultation Fee
              </span>
              <span className="mt-0.5 text-2xl font-black text-slate-950">
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-8">
          {/* Consultation Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Consultation Specifics
            </h4>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Mode</span>
                <span className="font-bold text-slate-800">
                  {isVideo ? "Video Consultation" : "Voice Call Consultation"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-bold text-slate-800">
                  {booking.durationMinutes} minutes
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created At</span>
                <span className="font-semibold text-slate-800">
                  {formatPaymentDateTime(booking.createdAt)}
                </span>
              </div>
              {booking.completedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed At</span>
                  <span className="font-semibold text-emerald-700">
                    {formatPaymentDateTime(booking.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Registered Contact
            </h4>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <FiPhone className="text-slate-400 shrink-0" />
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">
                  {booking.contact?.phoneNumber || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-slate-400 shrink-0" />
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-800 truncate">
                  {booking.contact?.email || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary (if payment exists) */}
        {booking.payment && (
          <div className="border-t border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Payment Details
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {getPaymentStatusLabel(booking.payment.status)}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {formatBookingAmount(booking.payment.amount)}
                  </span>
                  {booking.payment.paidAt && (
                    <span className="text-xs text-slate-500">
                      Paid on {formatPaymentDateTime(booking.payment.paidAt)}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  {booking.payment.razorpayPaymentId && (
                    <p>
                      Payment ID:{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {booking.payment.razorpayPaymentId}
                      </span>
                    </p>
                  )}
                  {booking.payment.razorpayOrderId && (
                    <p>
                      Order ID:{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {booking.payment.razorpayOrderId}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* View Receipt Button */}
              {booking.actions?.canViewReceipt && (
                <button
                  type="button"
                  onClick={onOpenReceipt}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <FiFileText className="text-base text-amber-500" />
                  <span>View Receipt</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* End Card */}
      </div>

      {/* Audit Timeline Card */}
      {Array.isArray(booking.timeline) && booking.timeline.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
            Activity Timeline
          </h3>
          <div className="mt-6 space-y-6">
            {booking.timeline.map((item, index) => {
              const isLast = index === booking.timeline.length - 1;
              const eventLabel = getTimelineEventLabel(item.event);
              const formattedTime = formatPaymentDateTime(item.at);

              return (
                <div key={`${item.event}-${index}`} className="relative flex items-start gap-4">
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div className="absolute left-3 top-6 h-full w-0.5 bg-slate-200" />
                  )}

                  {/* Dot */}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {eventLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formattedTime}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   ADVOCATE BOOKING DETAIL VIEW
========================================================================= */

function AdvocateBookingDetailView({ booking, onOpenReceipt }) {
  const mode = booking.mode || booking.callType;
  const isVideo = mode === "VIDEO_CALL";
  const isInPerson = mode === "IN_PERSON";
  const badge = getAdvocateBadge(booking);
  const avatar = getAdvocateAvatarData(booking);
  const title = getAdvocateBookingTitle(booking);

  const rawTotal =
    booking.total ??
    booking.price ??
    (booking.totalPaise ? booking.totalPaise / 100 : null) ??
    (booking.breakdown?.total ?? 0);
  const formattedPrice = formatBookingAmount(rawTotal);

  const slotDisplay = booking.startAt
    ? formatAdvocateSlotTime(booking.startAt, booking.endAt)
    : formatPaymentDateTime(booking.createdAt);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              {avatar.photo ? (
                <img
                  src={avatar.photo}
                  alt={avatar.name || "Advocate"}
                  className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover"
                />
              ) : avatar.initial ? (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-2xl font-black text-amber-700">
                  {avatar.initial}
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600">
                  {isVideo ? (
                    <FiVideo className="text-2xl" />
                  ) : isInPerson ? (
                    <FiBriefcase className="text-2xl" />
                  ) : (
                    <FiPhone className="text-2xl" />
                  )}
                </div>
              )}
              <div>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badge.className}`}
                >
                  {badge.label}
                </span>
                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  {title}
                </h2>
                {booking.bookingId && (
                  <p className="mt-1 text-xs text-slate-500">
                    Booking ID:{" "}
                    <span className="font-mono font-semibold text-slate-700">
                      {booking.bookingId}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Total Fee
              </span>
              <span className="mt-0.5 text-2xl font-black text-slate-950">
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-8">
          {/* Consultation Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Consultation Specifics
            </h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Mode</span>
                <span className="font-bold text-slate-800">
                  {isVideo
                    ? "Video Consultation"
                    : isInPerson
                    ? "In-Person Consultation"
                    : "Voice Call Consultation"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Slot</span>
                <span className="font-bold text-slate-800">{slotDisplay}</span>
              </div>
              {booking.durationMinutes && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-bold text-slate-800">
                    {booking.durationMinutes} minutes
                  </span>
                </div>
              )}
              {booking.subject && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject</span>
                  <span className="font-semibold text-slate-800">
                    {booking.subject}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Registered Contact
            </h4>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm">
              <div className="flex items-center gap-2">
                <FiPhone className="shrink-0 text-slate-400" />
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">
                  {booking.contact?.phoneNumber || booking.userPhone || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="shrink-0 text-slate-400" />
                <span className="text-slate-500">Email:</span>
                <span className="truncate font-semibold text-slate-800">
                  {booking.contact?.email || booking.userEmail || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        {booking.payment && (
          <div className="border-t border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Payment Details
                </h4>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    {getPaymentStatusLabel(booking.payment.status)}
                  </span>
                  <span className="text-base font-black text-slate-900">
                    {formatBookingAmount(
                      booking.payment.amountRupees ||
                        (booking.payment.amount ? booking.payment.amount / 100 : rawTotal)
                    )}
                  </span>
                  {booking.payment.paidAt && (
                    <span className="text-xs text-slate-500">
                      Paid on {formatPaymentDateTime(booking.payment.paidAt)}
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  {booking.payment.razorpayPaymentId && (
                    <p>
                      Payment ID:{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {booking.payment.razorpayPaymentId}
                      </span>
                    </p>
                  )}
                  {booking.payment.razorpayOrderId && (
                    <p>
                      Order ID:{" "}
                      <span className="font-mono font-semibold text-slate-700">
                        {booking.payment.razorpayOrderId}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* View Receipt Button */}
              {(booking.actions?.canViewReceipt || booking.payment?.status === "PAID") && (
                <button
                  type="button"
                  onClick={onOpenReceipt}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <FiFileText className="text-base text-amber-500" />
                  <span>View Receipt</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audit Timeline Card */}
      {Array.isArray(booking.timeline) && booking.timeline.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
            Activity Timeline
          </h3>
          <div className="mt-6 space-y-6">
            {booking.timeline.map((item, index) => {
              const isLast = index === booking.timeline.length - 1;
              const eventLabel = getTimelineEventLabel(item.event);
              const formattedTime = formatPaymentDateTime(item.at);

              return (
                <div key={`${item.event}-${index}`} className="relative flex items-start gap-4">
                  {!isLast && (
                    <div className="absolute left-3 top-6 h-full w-0.5 bg-slate-200" />
                  )}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      {eventLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formattedTime}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   PRINTABLE RECEIPT MODAL (Zero PDF libraries, uses clean window.print)
========================================================================= */

function PrintableReceiptModal({ booking, onClose }) {
  const isVideo = booking.callType === "VIDEO_CALL";
  const amountFormatted = formatBookingAmount(booking.payment?.amount || booking.price);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm print:static print:bg-white print:p-0">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl print:w-full print:max-w-none print:border-none print:shadow-none">
        {/* Modal Top Bar - Hidden on print */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <FiFileText className="text-amber-500 text-lg" />
            <h3 className="text-sm font-bold text-slate-900">
              Consultancy Booking Receipt
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500"
            >
              <FiPrinter className="text-sm" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <FiX className="text-base" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="p-6 sm:p-8 print:p-8 text-slate-800">
          {/* Receipt Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Vakeel<span className="text-amber-500">Setu</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Verified Legal Consultation Service
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-600">
                RECEIPT
              </span>
              <p className="mt-1.5 text-xs text-slate-500">
                Date: {formatPaymentDateTime(booking.payment?.paidAt || booking.createdAt)}
              </p>
            </div>
          </div>

          {/* Reference Data */}
          <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Booking Reference
              </p>
              <p className="mt-1 font-mono font-semibold text-slate-900">
                {booking.bookingId || booking.id}
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Payment Status
              </p>
              <p className="mt-1 font-bold text-emerald-700">
                {getPaymentStatusLabel(booking.payment?.status || "PAID")}
              </p>
            </div>

            {booking.payment?.razorpayPaymentId && (
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Payment ID
                </p>
                <p className="mt-1 font-mono text-slate-800">
                  {booking.payment.razorpayPaymentId}
                </p>
              </div>
            )}
            {booking.payment?.razorpayOrderId && (
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Order ID
                </p>
                <p className="mt-1 font-mono text-slate-800">
                  {booking.payment.razorpayOrderId}
                </p>
              </div>
            )}
          </div>

          {/* Consultation Item */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 text-xs font-black uppercase tracking-wider text-slate-400">
              <span>Service Description</span>
              <span>Amount</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-bold text-slate-950">
                  {getBookingDisplayTitle(booking)}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {booking.bookingType === "ADVOCATE"
                    ? `Mode: ${
                        booking.mode === "VIDEO_CALL"
                          ? "Video Call"
                          : booking.mode === "IN_PERSON"
                          ? "In-Person Meeting"
                          : "Voice Call"
                      }${booking.subject ? ` • ${booking.subject}` : ""}${
                        booking.durationMinutes ? ` • ${booking.durationMinutes} min` : ""
                      }`
                    : `Expert Consultation • Mode: ${isVideo ? "Video Call" : "Voice Call"} • Duration: ${booking.durationMinutes} min`}
                </p>
              </div>
              <p className="text-base font-black text-slate-950">
                {amountFormatted}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-600">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
              Client Details
            </p>
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
              {booking.contact?.phoneNumber && (
                <span>Phone: {booking.contact.phoneNumber}</span>
              )}
              {booking.contact?.email && (
                <span>Email: {booking.contact.email}</span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 flex items-center justify-between border-t-2 border-slate-900 pt-4">
            <span className="text-sm font-black text-slate-950">
              Total Amount Paid
            </span>
            <span className="text-xl font-black text-slate-950">
              {amountFormatted}
            </span>
          </div>

          {/* Footer note */}
          <p className="mt-8 text-center text-[11px] text-slate-400">
            This is a computer-generated receipt for consultation services booked on VakeelSetu.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   NO ACCESS VIEW (Advocate / Admin)
========================================================================= */

function NoAccessView({ role, onNavigateDashboard }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <FiLock className="text-3xl" />
        </div>
        <h2 className="text-2xl font-black text-slate-950">
          Access forbidden
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Insufficient permissions. This bookings page is specifically designed for client consultation management.
        </p>
        <button
          type="button"
          onClick={onNavigateDashboard}
          className="mt-8 w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-500"
        >
          {role === "advocate" ? "Go to Advocate Portal" : "Go to Dashboard"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   EMPTY STATE
========================================================================= */

function EmptyBookingsTabState({ onBookConsultation }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm sm:p-16">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FiCalendar className="text-3xl" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">
        No bookings yet
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
        Connect with verified legal experts and get professional advice tailored to your needs.
      </p>
      <button
        type="button"
        onClick={onBookConsultation}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
      >
        <span>Book a consultation</span>
      </button>
    </div>
  );
}

/* =========================================================================
   LOADING SKELETONS
========================================================================= */

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-slate-200" />
                <div className="h-3 w-32 rounded bg-slate-100" />
              </div>
            </div>
            <div className="h-6 w-20 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 w-60 rounded bg-slate-200" />
            <div className="h-4 w-40 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="h-28 rounded-2xl bg-slate-100" />
          <div className="h-28 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}