import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../auth";
import { getAdvocateProfileCompletion } from "@/utils/advocateProfile";
import { getAdvocateAppointments } from "../services/advocateBookingApi";
import { getAdvocateEarnings } from "../services/advocateEarningsApi";

/* =========================================================================
   ADVOCATE DASHBOARD DATA

   Advocate profile is synced by AdvocateProfileGuard.
   Appointments and counts are fetched from the authoritative endpoint:
   GET /api/advocate/appointments?status=ALL&page=1&limit=50
   ========================================================================= */

const formatISTDateKey = (dateInput) => {
  if (!dateInput) return "";
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return "";
  }
};

export default function useAdvocateDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({
    ALL: 0,
    UPCOMING: 0,
    PAST_DUE: 0,
    COMPLETED: 0,
    REFUNDED: 0,
  });
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  /* -----------------------------------------------------------------------
     PROFILE COMPLETION
  ----------------------------------------------------------------------- */

  const completion = useMemo(
    () => getAdvocateProfileCompletion(user),
    [user],
  );

  /* -----------------------------------------------------------------------
     FETCH REAL APPOINTMENT & EARNINGS DATA
  ----------------------------------------------------------------------- */

  const lastFetchTimeRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!user || isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // 1. Fetch Authoritative Appointments
      const appointmentsPromise = getAdvocateAppointments(
        {
          status: "ALL",
          page: 1,
          limit: 50,
          _t: Date.now(),
        },
        { forceRefresh: true, cache: false },
      );

      // 2. Fetch Authoritative Earnings Summary
      const earningsPromise = getAdvocateEarnings({ page: 1, limit: 10 }).catch((err) => {
        console.warn("[Dashboard] Could not fetch earnings summary:", err);
        return null;
      });

      const [res, earningsRes] = await Promise.all([appointmentsPromise, earningsPromise]);

      if (res?.success) {
        setAppointments(res.appointments || []);
        if (res.counts) {
          setCounts(res.counts);
        }
      } else {
        throw new Error(res?.message || "Failed to load bookings");
      }

      if (earningsRes?.summary) {
        setEarningsSummary(earningsRes.summary);
      }
    } catch (err) {
      setError(err?.message || "Could not load consultation bookings.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
      lastFetchTimeRef.current = Date.now();
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData(false);

    // Periodic auto-sync every 25 seconds so new bookings and status updates reflect dynamically
    const pollInterval = setInterval(() => {
      fetchDashboardData(true);
    }, 25000);

    // Re-fetch on window focus, throttled to at most once every 10 seconds
    const onFocus = () => {
      if (Date.now() - lastFetchTimeRef.current < 10000 || isFetchingRef.current) {
        return;
      }
      fetchDashboardData(true);
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchDashboardData]);

  /* -----------------------------------------------------------------------
     TODAY'S BOOKINGS (COMPUTED IN IST)
  ----------------------------------------------------------------------- */

  const todayIST = formatISTDateKey(new Date());

  const todayBookingsCount = useMemo(() => {
    return appointments.filter((booking) => {
      if (!booking?.startAt) return false;
      return formatISTDateKey(booking.startAt) === todayIST;
    }).length;
  }, [appointments, todayIST]);

  /* -----------------------------------------------------------------------
     NEXT UPCOMING CONSULTATION
     Earliest active upcoming session (future or ongoing slot).
     Returns null if schedule is genuinely clear.
  ----------------------------------------------------------------------- */

  const nextUpcoming = useMemo(() => {
    if (!appointments.length) return null;

    const now = Date.now();

    const active = appointments.filter((b) => {
      if (!b) return false;
      const isCompleted = Boolean(
        b.completedAt ||
        b.status === "COMPLETED" ||
        b.callStatus === "COMPLETED"
      );
      const isRefunded = b.status === "REFUNDED" || b.status === "CANCELLED";
      return !isCompleted && !isRefunded;
    });

    if (!active.length) return null;

    // Future or ongoing slot
    const futureOrOngoing = active.filter((b) => {
      const startMs = new Date(b.scheduledAt || b.startAt || 0).getTime();
      const end = b.endAt
        ? new Date(b.endAt).getTime()
        : startMs
          ? startMs + (b.durationMinutes || 15) * 60 * 1000
          : 0;
      return end >= now;
    });

    if (futureOrOngoing.length > 0) {
      return [...futureOrOngoing].sort(
        (a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime(),
      )[0];
    }

    // When there are no future or ongoing sessions, schedule is genuinely clear!
    return null;
  }, [appointments]);

  /* -----------------------------------------------------------------------
     UPCOMING LIST
  ----------------------------------------------------------------------- */

  const upcomingList = useMemo(() => {
    return nextUpcoming ? [nextUpcoming] : [];
  }, [nextUpcoming]);

  /* -----------------------------------------------------------------------
     RECENT ACTIVITY (NEWEST BOOKING FIRST - confirmedAt descending)
  ----------------------------------------------------------------------- */

  const recentList = useMemo(() => {
    if (!appointments.length) return [];
    return [...appointments].sort((a, b) => {
      const idA = String(a?.id || a?.bookingId || a?._id || "");
      const idB = String(b?.id || b?.bookingId || b?._id || "");

      const getBookingTimestamp = (item) => {
        const raw =
          item?.confirmedAt ||
          item?.payment?.paidAt ||
          item?.createdAt ||
          item?.updatedAt;
        if (raw) {
          const t = new Date(raw).getTime();
          if (!Number.isNaN(t) && t > 0) return t;
        }
        const id = String(item?._id || item?.id || "");
        if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
          const t = parseInt(id.substring(0, 8), 16) * 1000;
          if (!Number.isNaN(t) && t > 0) return t;
        }
        return 0;
      };

      const dateA = getBookingTimestamp(a);
      const dateB = getBookingTimestamp(b);

      if (dateB !== dateA) return dateB - dateA;
      return idA.localeCompare(idB);
    });
  }, [appointments]);

  /* -----------------------------------------------------------------------
     DERIVED COUNTS & OVERVIEW STATS
  ----------------------------------------------------------------------- */

  const derivedCounts = useMemo(() => {
    let upCount = 0;
    let compCount = 0;
    let pastCount = 0;
    const now = Date.now();

    for (const b of appointments) {
      if (!b) continue;
      const isCompleted = Boolean(
        b.completedAt ||
        b.status === "COMPLETED" ||
        b.callStatus === "COMPLETED"
      );
      if (isCompleted) {
        compCount++;
        continue;
      }
      if (b.status === "CANCELLED" || b.status === "REFUNDED") {
        continue;
      }

      const slotTime = b.startAt ? new Date(b.startAt).getTime() : 0;
      if (slotTime > 0 && slotTime < now) {
        pastCount++;
      } else {
        upCount++;
      }
    }

    return {
      ALL: counts?.ALL ?? appointments.length,
      UPCOMING: (counts?.UPCOMING !== undefined && counts?.UPCOMING !== null) ? counts.UPCOMING : upCount,
      PAST_DUE: (counts?.PAST_DUE !== undefined && counts?.PAST_DUE !== null) ? counts.PAST_DUE : pastCount,
      COMPLETED: (counts?.COMPLETED !== undefined && counts?.COMPLETED !== null) ? counts.COMPLETED : compCount,
    };
  }, [appointments, counts]);

  /* -----------------------------------------------------------------------
     DYNAMIC EARNINGS CALCULATION
     Prioritizes official ledger summary; falls back to active appointments fee sum
  ----------------------------------------------------------------------- */

  const earningsAmount = useMemo(() => {
    // 1. Authoritative summary total
    if (earningsSummary) {
      if (typeof earningsSummary.totalEarned === "number" && earningsSummary.totalEarned >= 0) {
        return earningsSummary.totalEarned;
      }
      if (typeof earningsSummary.available === "number" && earningsSummary.available >= 0) {
        return earningsSummary.available;
      }
    }

    // 2. Fallback: Sum of consultation fees from confirmed/paid/completed bookings
    return appointments
      .filter((b) => !["CANCELLED", "REFUNDED"].includes(b?.status))
      .reduce((acc, b) => {
        const fee = Number(b?.fee ?? b?.amount ?? b?.consultationFee ?? b?.payment?.amount ?? 0);
        return acc + (!isNaN(fee) && fee > 0 ? fee : 0);
      }, 0);
  }, [earningsSummary, appointments]);

  const stats = useMemo(() => {
    return {
      todayBookings: todayBookingsCount,
      upcoming: derivedCounts.UPCOMING,
      completed: derivedCounts.COMPLETED,
      earnings: `₹${Number(earningsAmount || 0).toLocaleString("en-IN")}`,
      earningsAmount,
    };
  }, [todayBookingsCount, derivedCounts, earningsAmount]);

  return {
    advocate: user,
    completion,
    appointments,
    counts: derivedCounts,
    todayBookingsCount,
    upcoming: upcomingList,
    nextUpcoming,
    recent: recentList,
    stats,
    earningsSummary,
    earningsAmount,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchDashboardData(false),
  };
}