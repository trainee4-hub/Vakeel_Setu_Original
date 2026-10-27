import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../auth";
import { getAdvocateProfileCompletion } from "@/utils/advocateProfile";
import { getAdvocateAppointments } from "../services/advocateBookingApi";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -----------------------------------------------------------------------
     PROFILE COMPLETION
  ----------------------------------------------------------------------- */

  const completion = useMemo(
    () => getAdvocateProfileCompletion(user),
    [user],
  );

  /* -----------------------------------------------------------------------
     FETCH REAL APPOINTMENT DATA
  ----------------------------------------------------------------------- */

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdvocateAppointments(
        {
          status: "ALL",
          page: 1,
          limit: 50,
          _t: Date.now(),
        },
        { forceRefresh: true, cache: false },
      );

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
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
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
      const isCompleted = Boolean(b.completedAt || b.status === "COMPLETED");
      const isRefunded = b.status === "REFUNDED" || b.status === "CANCELLED";
      return !isCompleted && !isRefunded;
    });

    if (!active.length) return null;

    // Future or ongoing slot
    const futureOrOngoing = active.filter((b) => {
      const end = b.endAt
        ? new Date(b.endAt).getTime()
        : b.startAt
          ? new Date(b.startAt).getTime() + 30 * 60 * 1000
          : 0;
      return end >= now;
    });

    if (futureOrOngoing.length > 0) {
      return [...futureOrOngoing].sort(
        (a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime(),
      )[0];
    }

    // Fallback: earliest pending/confirmed booking
    return [...active].sort(
      (a, b) => new Date(a.startAt || 0).getTime() - new Date(b.startAt || 0).getTime(),
    )[0];
  }, [appointments]);

  /* -----------------------------------------------------------------------
     UPCOMING LIST
  ----------------------------------------------------------------------- */

  const upcomingList = useMemo(() => {
    return nextUpcoming ? [nextUpcoming] : [];
  }, [nextUpcoming]);

  /* -----------------------------------------------------------------------
     RECENT ACTIVITY (NEWEST FIRST)
  ----------------------------------------------------------------------- */

  const recentList = useMemo(() => {
    if (!appointments.length) return [];
    return [...appointments].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.startAt || 0).getTime();
      const timeB = new Date(b.createdAt || b.startAt || 0).getTime();
      return timeB - timeA;
    });
  }, [appointments]);

  /* -----------------------------------------------------------------------
     OVERVIEW STATS
  ----------------------------------------------------------------------- */

  const stats = useMemo(() => {
    return {
      todayBookings: todayBookingsCount,
      upcoming: counts.UPCOMING ?? 0,
      completed: counts.COMPLETED ?? 0,
      earnings: "Not available yet",
    };
  }, [todayBookingsCount, counts]);

  return {
    advocate: user,
    completion,
    appointments,
    counts,
    todayBookingsCount,
    upcoming: upcomingList,
    nextUpcoming,
    recent: recentList,
    stats,
    isLoading,
    error,
    refresh: fetchDashboardData,
  };
}