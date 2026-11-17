import React, {
  // useCallback,
  useEffect,
  // useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { formatDurationHuman } from "@/shared/utils/formatDuration";
const motion = Motion;
void motion;
import {
  ArrowRight,
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Clock3,
  Crown,
  Eye,
  Gavel,
  IndianRupee,
  Lightbulb,
  LockKeyhole,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  UserRoundPlus,
  Users,
  Video,
  X,
} from "lucide-react";

import { apiRequest } from "@shared/services/apiClient";
import { rescheduleAdvocateTest } from "@/features/advocateTest/services/advocateTestApi";

import {
  ClientPublicProfile,
  AdvocateDashboardSkeleton,
  getAdvocateVerificationStatus,
} from "../index";

import useAdvocateDashboard from "../hooks/useAdvocateDashboard";
import useAdvocateTeam from "../hooks/useAdvocateTeam";

import { getEntityId } from "../utils/advocateDashboardUtils";

import DashboardErrorState from "../components/DashboardErrorState";

import AdvocateTeamSection from "../components/team/AdvocateTeamSection";
import AddTeamMateModal from "../components/team/AddTeamMateModal";
import RemoveTeamMateModal from "../components/team/RemoveTeamMateModal";
import CallPhoneButton from "../components/CallPhoneButton";


/* =========================================================================
   HELPERS
============================================================================ */

const cleanText = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getAdvocateName = (advocate) =>
  cleanText(advocate?.fullName) ||
  cleanText(advocate?.name) ||
  "Advocate";

const getInitials = (name) => {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "AD";

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";

  return "Good Evening";
};

const getFirstValue = (source, keys, fallback = null) => {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return fallback;
};

const hasObjectValues = (value) =>
  Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0,
  );

const formatShortDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  try {
    const getISTKey = (d) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);

    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);

    const dateKey = getISTKey(date);
    if (dateKey === getISTKey(today)) {
      return "Today";
    }

    if (dateKey === getISTKey(tomorrow)) {
      return "Tomorrow";
    }

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year:
        date.getFullYear() !== today.getFullYear()
          ? "numeric"
          : undefined,
    }).format(date);
  } catch {
    return "Date unavailable";
  }
};

const getConsultationClient = (
  consultation,
) =>
  consultation?.user ||
  consultation?.client ||
  consultation?.customer ||
  consultation?.bookedBy ||
  null;

const getClientName = (
  consultation,
) => {
  const client =
    getConsultationClient(
      consultation,
    );

  return (
    cleanText(client?.fullName) ||
    cleanText(client?.name) ||
    cleanText(
      consultation?.clientName,
    ) ||
    cleanText(
      consultation?.userName,
    ) ||
    "Client"
  );
};

const getClientPhone = (consultation) => {
  const client = getConsultationClient(consultation);
  return (
    cleanText(client?.phone) ||
    cleanText(consultation?.clientPhone) ||
    cleanText(consultation?.phone) ||
    ""
  );
};

const getPracticeArea = (
  consultation,
) =>
  cleanText(
    consultation?.subject,
  ) ||
  cleanText(
    consultation?.practiceArea,
  ) ||
  cleanText(
    consultation?.category,
  ) ||
  cleanText(
    consultation?.legalIssue,
  ) ||
  "Legal Consultation";

const getConsultationDate = (
  consultation,
) =>
  consultation?.scheduledAt ||
  consultation?.startAt ||
  consultation?.scheduledDate ||
  consultation?.date ||
  consultation?.consultationDate ||
  null;

const getConsultationTime = (
  consultation,
) => {
  const startAt = consultation?.scheduledAt || consultation?.startAt;
  if (startAt) {
    try {
      const start = new Date(startAt);
      if (!Number.isNaN(start.getTime())) {
        const startStr = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(start);

        const durationSuffix = consultation.durationMinutes ? ` · ${formatDurationHuman(consultation.durationMinutes, { subHourUnit: "min" })}` : "";
        return `${startStr}${durationSuffix}`;
      }
    } catch {
      // fallback
    }
  }

  return (
    cleanText(
      consultation?.scheduledTime,
    ) ||
    cleanText(
      consultation?.scheduledTimeSlot,
    ) ||
    cleanText(consultation?.time) ||
    "Time unavailable"
  );
};

const getMeetingUrl = (
  consultation,
) =>
  consultation?.meetingLink ||
  consultation?.meetingUrl ||
  consultation?.joinLink ||
  consultation?.videoCallLink ||
  null;

const getMode = (consultation) => {
  const raw = cleanText(
    consultation?.consultationMode ||
    consultation?.mode ||
    consultation?.consultationType,
  ).toUpperCase();

  if (raw.includes("VIDEO")) {
    return {
      type: "video",
      label: "Video Call",
      fullLabel: "Online Video Call",
      shortBadge: "Video",
      Icon: Video,
      badgeClass: "border-sky-300 bg-sky-50 text-sky-800 shadow-2xs font-extrabold",
      iconColor: "text-sky-600",
      avatarBg: "bg-sky-50 border-sky-200 text-sky-800",
      avatarBadgeBg: "bg-sky-500 text-white",
      cardBorder: "border-sky-200/90 bg-sky-50/50",
      detailIconBox: "border border-sky-200 bg-sky-100 text-sky-700",
    };
  }

  if (raw.includes("CALL") || raw.includes("PHONE") || raw.includes("VOICE")) {
    return {
      type: "call",
      label: "Voice Call",
      fullLabel: "Direct Voice Call",
      shortBadge: "Voice",
      Icon: Phone,
      badgeClass: "border-purple-300 bg-purple-50 text-purple-800 shadow-2xs font-extrabold",
      iconColor: "text-purple-600",
      avatarBg: "bg-purple-50 border-purple-200 text-purple-800",
      avatarBadgeBg: "bg-purple-600 text-white",
      cardBorder: "border-purple-200/90 bg-purple-50/50",
      detailIconBox: "border border-purple-200 bg-purple-100 text-purple-700",
    };
  }

  return {
    type: "in_person",
    label: "Personal Meeting",
    fullLabel: "In-Person Office Visit",
    shortBadge: "In-Person",
    Icon: BriefcaseBusiness,
    badgeClass: "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs font-black",
    iconColor: "text-emerald-700",
    avatarBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
    avatarBadgeBg: "bg-emerald-600 text-white",
    cardBorder: "border-emerald-200/90 bg-emerald-50/50",
    detailIconBox: "border border-emerald-200 bg-emerald-100 text-emerald-800",
  };
};

const getDerivedStatus = (booking) => {
  const isCompleted = Boolean(
    booking?.completedAt ||
    booking?.status === "COMPLETED" ||
    booking?.callStatus === "COMPLETED"
  );
  const isConfirmedOrPaid = ["CONFIRMED", "PAID"].includes(booking?.status);

  if (isCompleted) {
    return {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      tone: "emerald",
    };
  }

  if (booking?.status === "REFUNDED" || booking?.status === "REFUND_PENDING") {
    return {
      label: "Refunded",
      className: "border-purple-200 bg-purple-50 text-purple-700",
      tone: "purple",
    };
  }

  if (booking?.status === "CANCELLED") {
    return {
      label: "Cancelled",
      className: "border-rose-200 bg-rose-50 text-rose-700",
      tone: "rose",
    };
  }

  if (isConfirmedOrPaid) {
    const isSlotPast = booking?.startAt
      ? new Date(booking.startAt).getTime() < Date.now()
      : false;

    if (isSlotPast) {
      return {
        label: "Past Due",
        className: "border-amber-200 bg-amber-50 text-amber-800",
        tone: "amber",
      };
    }

    return {
      label: "Upcoming",
      className: "border-blue-200 bg-blue-50 text-blue-700",
      tone: "blue",
    };
  }

  return {
    label: cleanText(booking?.status) || "Upcoming",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    tone: "slate",
  };
};

const isMembershipActive = (
  advocate,
) => {
  const status = cleanText(
    advocate?.membership?.status ||
    advocate?.membershipStatus,
  ).toLowerCase();

  return (
    advocate?.isPremium === true ||
    advocate?.isMember === true ||
    status === "active"
  );
};

/* =========================================================================
   SHARED UI
============================================================================ */

const SectionHeading = ({
  title,
  description,
  action,
  onAction,
}) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-[17px] font-bold tracking-tight text-slate-950 sm:text-lg">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-[13px] leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>

    {action && (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-amber-600 transition-colors hover:text-amber-700"
      >
        {action}
        <ArrowRight size={14} />
      </button>
    )}
  </div>
);

/* =========================================================================
   WELCOME
============================================================================ */

const WelcomeSection = ({
  advocate,
  onNotifications,
  isAdminApproved,
  verificationLoading,
  isOnline = false,
  lastSeenAt = null,
  statusLoading = false,
  heartbeatError = "",
  changeOnlineStatus,
}) => {
  const handleStatusToggle = async () => {
    if (
      statusLoading ||
      typeof changeOnlineStatus !== "function"
    ) {
      return;
    }

    await changeOnlineStatus(!isOnline);
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-full w-72 bg-gradient-to-l from-amber-50/80 to-transparent" />

      <div className="relative flex items-start justify-between gap-5">
        {/* LEFT */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[24px] font-extrabold tracking-[-0.035em] text-slate-950 sm:text-[29px]">
              {getGreeting()},{" "}
              {getAdvocateName(advocate)}
            </h1>

            <Sparkles
              size={18}
              className="text-amber-500"
            />
          </div>

          <p className="mt-1.5 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
            Manage your consultations, professional presence and legal
            network.
          </p>

          {/* STATUS ROW */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* ADMIN APPROVAL */}
            {verificationLoading ? (
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                Checking Profile Status
              </span>
            ) : isAdminApproved ? (
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Available for Consultation
              </span>
            ) : (
              <span className="inline-flex h-9 items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Profile not approved
              </span>
            )}

            {/* ONLINE STATUS */}
            <div
              className={`inline-flex min-h-9 items-center gap-2.5 rounded-full border px-3 py-1.5 transition-colors ${
                isOnline
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isOnline
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              <span
                className={`min-w-[42px] text-xs font-extrabold ${
                  isOnline
                    ? "text-emerald-700"
                    : "text-slate-600"
                }`}
              >
                {statusLoading
                  ? "Updating"
                  : isOnline
                    ? "Online"
                    : "Offline"}
              </span>

              {/* TOGGLE */}
              <button
                type="button"
                role="switch"
                aria-checked={isOnline}
                aria-label={
                  isOnline
                    ? "Switch offline"
                    : "Switch online"
                }
                disabled={
                  statusLoading ||
                  typeof changeOnlineStatus !== "function"
                }
                onClick={handleStatusToggle}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
                  isOnline
                    ? "bg-emerald-500"
                    : "bg-slate-300"
                } ${
                  statusLoading
                    ? "cursor-wait opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <span
                  className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    isOnline
                      ? "left-[18px]"
                      : "left-[2px]"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ERROR */}
          {heartbeatError && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {heartbeatError}
            </p>
          )}

          {/* LAST SEEN */}
          {!isOnline && lastSeenAt && (
            <p className="mt-2 text-[11px] text-slate-400">
              Last active:{" "}
              {new Date(lastSeenAt).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
};

/* =========================================================================
   STAT CARDS
============================================================================ */

const StatCard = ({
  Icon,
  label,
  value,
  tone,
  onClick,
}) => {
  void Icon;
  const tones = {
    amber:
      "bg-amber-50 text-amber-600 border-amber-100",
    blue:
      "bg-blue-50 text-blue-600 border-blue-100",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet:
      "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{
        duration: 0.2,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`flex h-full flex-col rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-5 ${
        onClick ? "cursor-pointer active:scale-[0.98]" : ""
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tones[tone] ||
          tones.amber
          }`}
      >
        <Icon size={19} />
      </div>

      <p className="mt-4 text-[12px] font-semibold text-slate-500 sm:text-[13px]">
        {label}
      </p>

      <p
        className={`mt-auto pt-1 leading-tight tracking-tight text-slate-950 ${
          typeof value === "string" && value.length > 8
            ? "text-[16px] font-black text-slate-900 sm:text-[18px]"
            : "text-[21px] font-extrabold sm:text-[24px]"
        }`}
      >
        {value}
      </p>
    </motion.article>
  );
};

const OverviewStats = ({
  stats,
  todayCount = 0,
  upcomingCount = 0,
  completedCount = 0,
  onRefresh,
  isRefreshing = false,
  onNavigate,
}) => {
  const today = Number.isFinite(stats?.todayBookings)
    ? stats.todayBookings
    : todayCount;

  const upcoming = Number.isFinite(stats?.upcoming)
    ? stats.upcoming
    : upcomingCount;

  const completed = Number.isFinite(stats?.completed)
    ? stats.completed
    : completedCount;

  // Real, formatted earnings directly from advocate ledger or appointments
  const earningsDisplay =
    stats?.earnings && stats.earnings !== "Not available yet"
      ? stats.earnings
      : stats?.earningsAmount !== undefined
      ? `₹${Number(stats.earningsAmount || 0).toLocaleString("en-IN")}`
      : "₹0";

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-slate-950 sm:text-lg">
            Today's Overview
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            A quick snapshot of your practice today.
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800 disabled:opacity-60"
            title="Refresh bookings and earnings"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-amber-500" : "text-slate-400"}
            />
            <span>Refresh</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          Icon={CalendarDays}
          label="Today's Bookings"
          value={today}
          tone="amber"
          onClick={() => onNavigate?.("/advocate/bookings")}
        />

        <StatCard
          Icon={Clock3}
          label="Upcoming"
          value={upcoming}
          tone="blue"
          onClick={() => onNavigate?.("/advocate/bookings?status=UPCOMING")}
        />

        <StatCard
          Icon={CalendarCheck2}
          label="Completed"
          value={completed}
          tone="emerald"
          onClick={() => onNavigate?.("/advocate/bookings?status=COMPLETED")}
        />

        <StatCard
          Icon={IndianRupee}
          label="Total Earnings"
          value={earningsDisplay}
          tone="violet"
          onClick={() => onNavigate?.("/advocate/earnings")}
        />
      </div>
    </section>
  );
};

/* =========================================================================
   UPCOMING CONSULTATION
============================================================================ */

const UpcomingConsultation = ({
  consultation,
  onBookings,
  onOpenCalendar,
  onAddAvailability,
}) => {
  /* =========================================================================
     EMPTY STATE
  ========================================================================= */

  if (!consultation) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6"
      >
        <div className="relative flex flex-1 items-center justify-center">
          <div className="mx-auto flex w-full max-w-[600px] flex-col items-center text-center">
            {/* ICON */}

            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-slate-200 bg-slate-50 text-slate-600 sm:h-[78px] sm:w-[78px]">
              <CalendarCheck2
                size={31}
                strokeWidth={1.8}
              />
            </div>

            {/* TITLE */}

            <h3 className="mt-6 text-[21px] font-extrabold tracking-[-0.025em] text-slate-950 sm:text-[24px]">
              No Upcoming Consultation
            </h3>

            {/* DESCRIPTION */}

            <p className="mt-2 max-w-lg text-[13px] leading-6 text-slate-500 sm:text-sm">
              Your schedule is clear right now. Review your calendar or add
              availability so clients can choose a suitable consultation time.
            </p>

            {/* ACTIONS */}

            <div className="mt-7 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onOpenCalendar?.()}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <CalendarDays size={17} />
                Open Calendar
              </button>

              <button
                type="button"
                onClick={() => onAddAvailability?.()}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white shadow-md shadow-slate-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Plus size={17} />
                Add Availability
              </button>
            </div>

            {/* STATUS */}

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 size={13} />
              Your schedule is currently clear
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  /* =========================================================================
     EXISTING UPCOMING CONSULTATION
  ========================================================================= */

  const clientName =
    getClientName(
      consultation,
    );

  const clientPhone =
    getClientPhone(
      consultation,
    );

  const mode =
    getMode(
      consultation,
    );
  void mode;

  const meetingUrl =
    getMeetingUrl(
      consultation,
    );

  const handlePrimary = () => {
    if (mode.type === "video") {
      if (meetingUrl) {
        window.open(
          meetingUrl,
          "_blank",
          "noopener,noreferrer",
        );
        return;
      }
      onBookings?.();
      return;
    }

    if (mode.type === "call") {
      if (clientPhone) {
        window.location.href = `tel:${clientPhone}`;
        return;
      }
      onBookings?.();
      return;
    }

    onBookings?.();
  };

  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className="relative h-full overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6"
    >
      {/* VERY SUBTLE ACCENT */}

      <div className="pointer-events-none absolute right-0 top-0 h-40 w-56 bg-gradient-to-bl from-slate-50 to-transparent" />

      <div className="relative">
        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-600">
              Upcoming Consultation
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Your next scheduled client session
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 size={13} />

            Confirmed
          </span>
        </div>

        {/* CLIENT */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border font-extrabold transition-colors ${mode.avatarBg}`}
              >
                {getInitials(clientName)}
              </div>
              <span
                title={mode.label}
                className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-xs ${mode.avatarBadgeBg}`}
              >
                <mode.Icon size={8} strokeWidth={3} />
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[17px] font-extrabold text-slate-950">
                {clientName}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {consultation?.subject || getPracticeArea(consultation)}
              </p>
            </div>
          </div>

          {clientPhone && (
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white px-3 py-1.5 shadow-2xs transition-colors hover:border-amber-200">
              <CallPhoneButton
                phone={clientPhone}
                clientName={clientName}
                size="md"
              />
              <a
                href={`tel:${clientPhone}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Call ${clientName} at ${clientPhone}`}
                title={`Call ${clientPhone}`}
                className="font-mono text-xs sm:text-sm font-bold tracking-tight text-slate-800 hover:text-amber-600 hover:underline transition-colors"
              >
                {clientPhone}
              </a>
            </div>
          )}
        </div>

        {/* CONSULTATION DETAILS */}

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-600">
            <CalendarDays
              size={16}
              className="text-slate-400"
            />

            {formatShortDate(
              getConsultationDate(
                consultation,
              ),
            )}

            <span className="text-slate-300">
              •
            </span>

            {getConsultationTime(
              consultation,
            )}
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${mode.badgeClass}`}>
            <mode.Icon size={14} className={mode.iconColor} />
            <span>{mode.fullLabel || mode.label}</span>
          </span>
        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePrimary}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 cursor-pointer"
          >
            <mode.Icon size={17} />
            <span>
              {mode.type === "video"
                ? (meetingUrl ? "Join Video Call" : "Join Meeting")
                : mode.type === "call"
                  ? "Call Client"
                  : "View Booking Details"}
            </span>
          </button>

          {(mode.type === "video" || mode.type === "call") && (
            <button
              type="button"
              onClick={() => onBookings?.()}
              className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================================
   MEMBERSHIP
============================================================================ */

const MembershipCard = ({
  advocate,
  onMembership,
}) => {
  const active =
    isMembershipActive(
      advocate,
    );

  return (
    <motion.section
      id="advocate-membership"
      whileHover={{ y: -2 }}
      className="relative h-full overflow-hidden rounded-[26px] bg-slate-950 p-6 text-white shadow-[0_16px_45px_rgba(15,23,42,0.15)]"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
            <Crown size={21} />
          </div>

          {active && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
              Active
            </span>
          )}
        </div>

        <h2 className="mt-5 text-lg font-extrabold">
          {active
            ? "Premium Membership"
            : "Grow Your Professional Presence"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          {active
            ? "Your premium professional features are currently active."
            : "Upgrade your membership to unlock additional professional tools."}
        </p>

        {!active && (
          <div className="mt-5 space-y-2.5">
            {[
              "Publish professional articles",
              "Increase profile visibility",
              "Unlock premium networking",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[13px] text-slate-300"
              >
                <CheckCircle2
                  size={15}
                  className="text-amber-400"
                />

                {item}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onMembership}
          className="mt-6 min-h-[44px] w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 transition hover:bg-amber-400"
        >
          {active
            ? "Manage Membership"
            : "View Membership Plans"}
        </button>
      </div>
    </motion.section>
  );
};

/* =========================================================================
   QUICK ACTIONS
============================================================================ */

const QuickActions = ({
  membershipActive,
  onBookings,
  onTeam,
  onArticles,
  // onNetwork,
}) => {
  const actions = [
    {
      label: "Manage Bookings",
      description:
        "View your schedule",
      Icon: CalendarDays,
      onClick: onBookings,
    },
    {
      label: "My Team",
      description:
        "Your legal team",
      Icon: UserRoundPlus,
      onClick: onTeam,
    },
    {
      label: "Add Article",
      description:
        membershipActive
          ? "Share legal insights"
          : "Membership required",
      Icon: BookOpen,
      onClick: onArticles,
      locked:
        !membershipActive,
    },
  ];

  return (
    <section className="flex h-full flex-col">
      <SectionHeading
        title="Quick Actions"
        description="Your most-used professional tools."
      />

      <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3">
        {actions.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={
              item.onClick
            }
            className="relative flex h-full min-h-[124px] flex-col rounded-[22px] border border-slate-200/80 bg-white p-4 text-left shadow-[0_8px_28px_rgba(15,23,42,0.035)] transition-all duration-200 hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
          >
            {item.locked && (
              <LockKeyhole
                size={14}
                className="absolute right-3 top-3 text-slate-400"
              />
            )}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
              <item.Icon
                size={18}
              />
            </div>

            <div className="mt-auto pt-3">
              <p className="text-[13px] font-extrabold leading-5 text-slate-900">
                {item.label}
              </p>

              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                {
                  item.description
                }
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

/* =========================================================================
   RECENT ACTIVITY
============================================================================ */

const RecentActivity = ({
  recent,
  onBookings,
}) => {
  const safeRecent =
    Array.isArray(recent)
      ? recent
      : [];

  const entries =
    safeRecent.slice(0, 5);

  return (
    <section className="flex h-full flex-col">
      <SectionHeading
        title="Recent Activity"
        description="Your latest consultation activity."
        action="View all"
        onAction={() => onBookings?.()}
      />

      <div className="flex flex-1 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
        {entries.length ? (
          entries.map(
            (item, index) => {
              const derived = getDerivedStatus(item);
              const dateStr = item?.startAt
                ? formatShortDate(item.startAt)
                : getConsultationDate(item)
                  ? formatShortDate(getConsultationDate(item))
                  : "";
              const timeStr = item?.startAt ? getConsultationTime(item) : "";
              const ItemMode = getMode(item);
              void ItemMode;

              return (
                <button
                  key={
                    getEntityId(
                      item,
                    ) || index
                  }
                  type="button"
                  onClick={() =>
                    onBookings?.(item)
                  }
                  className={`group flex min-h-[82px] flex-1 items-center gap-4 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-slate-50 sm:px-5 ${index !==
                    entries.length -
                    1
                    ? "border-b border-slate-100"
                    : ""
                    }`}
                >
                  {/* Client Avatar with Mode Indicator */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border font-extrabold transition-colors ${ItemMode.avatarBg}`}
                    >
                      {getInitials(getClientName(item))}
                    </div>
                    <span
                      title={ItemMode.label}
                      className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white shadow-2xs ${ItemMode.avatarBadgeBg}`}
                    >
                      <ItemMode.Icon size={7} strokeWidth={3} />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-bold leading-5 text-slate-800 sm:text-sm">
                        Consultation with{" "}
                        <span className="font-extrabold text-slate-950">
                          {getClientName(item)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      {/* Mode Badge Pill */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-tight ${ItemMode.badgeClass}`}
                      >
                        <ItemMode.Icon size={10} className={ItemMode.iconColor} />
                        <span>{ItemMode.label}</span>
                      </span>

                      {dateStr && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 font-semibold">{dateStr}</span>
                        </>
                      )}
                      {timeStr && timeStr !== "Time unavailable" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-slate-500">{timeStr}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {/* Consultation Fee badge if present */}
                    {item?.fee ? (
                      <span className="hidden font-mono text-xs font-black text-slate-800 sm:inline-block">
                        ₹{Number(item.fee).toLocaleString("en-IN")}
                      </span>
                    ) : null}

                    <span className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize sm:inline-flex ${derived.className}`}>
                      {derived.label}
                    </span>

                    <ChevronRight
                      size={17}
                      className="text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400"
                    />
                  </div>
                </button>
              );
            },
          )
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <Clock3 size={20} />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-900">
              No recent activity
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your recent consultations will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

/* =========================================================================
   ARTICLES
============================================================================ */

const ArticlesSection = ({
  articles,
  membershipActive,
  onMembership,
  onArticles,
}) => {
  const safeArticles =
    Array.isArray(articles)
      ? articles
      : [];

  return (
    <section
      id="advocate-articles"
      className="flex h-full flex-col"
    >
      <SectionHeading
        title="Your Articles"
        description="Build authority by sharing professional legal knowledge."
        action={
          membershipActive
            ? "View articles"
            : undefined
        }
        onAction={onArticles}
      />

      <div className="flex flex-1 flex-col rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
        {!membershipActive ? (
          <div className="flex flex-1 flex-col items-center justify-center py-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
              <LockKeyhole
                size={21}
              />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-slate-950">
              Membership Required
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Upgrade your
              membership to publish
              professional legal
              articles.
            </p>

            <button
              type="button"
              onClick={
                onMembership
              }
              className="mt-5 min-h-[44px] rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              View Membership
            </button>
          </div>
        ) : safeArticles.length ? (
          <div className="flex flex-1 flex-col divide-y divide-slate-100">
            {safeArticles
              .slice(0, 3)
              .map(
                (
                  article,
                  index,
                ) => (
                  <button
                    key={
                      article?.id ||
                      article?._id ||
                      index
                    }
                    type="button"
                    onClick={
                      onArticles
                    }
                    className="group flex min-h-[76px] flex-1 items-center justify-between gap-4 py-3.5 text-left transition-colors hover:bg-slate-50/60 sm:px-1"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">
                        {article?.title ||
                          "Untitled Article"}
                      </p>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                        <span>
                          {article?.category ||
                            "Legal Article"}
                        </span>

                        {article?.views !==
                          undefined && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {
                                  article.views
                                }{" "}
                                views
                              </span>
                            </>
                          )}

                        {article?.likes !==
                          undefined && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {
                                  article.likes
                                }{" "}
                                likes
                              </span>
                            </>
                          )}
                      </div>
                    </div>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-400"
                    />
                  </button>
                ),
              )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center py-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
              <BookOpen
                size={22}
              />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-slate-950">
              Publish your first
              article
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Share your legal
              knowledge with the
              community.
            </p>

            <button
              type="button"
              onClick={onArticles}
              className="mt-5 min-h-[44px] rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
            >
              Add Article
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* =========================================================================
   PROFILE PERFORMANCE
============================================================================ */

const ProfilePerformance = ({
  advocate,
  stats,
  onProfile,
  canViewProfile,
}) => {
  const merged = {
    ...(stats || {}),
    ...(advocate || {}),
  };

  const metrics = [
    {
      label: "Profile Views",
      value: getFirstValue(
        merged,
        [
          "profileViews",
          "totalProfileViews",
        ],
        "--",
      ),
      Icon: Eye,
    },
    {
      label:
        "Consultation Requests",
      value: getFirstValue(
        stats,
        [
          "consultationRequests",
          "totalRequests",
          "requests",
        ],
        "--",
      ),
      Icon: BriefcaseBusiness,
    },
    {
      label: "Response Rate",
      value: (() => {
        const rate =
          getFirstValue(
            stats,
            [
              "responseRate",
              "replyRate",
            ],
            "--",
          );

        return rate === "--"
          ? "--"
          : `${rate}%`;
      })(),
      Icon: TrendingUp,
    },
    {
      label: "Average Rating",
      value:
        advocate?.averageRating ??
        advocate?.rating ??
        "--",
      Icon: Star,
    },
  ];

  return (
    <section className="flex h-full flex-col">
      <SectionHeading
        title="Profile Performance"
        description="Track your professional presence."
      />

      <div className="flex flex-1 flex-col rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
        <div className="flex flex-1 flex-col justify-between">
          {metrics.map(
            (metric) => (
              <div
                key={
                  metric.label
                }
                className="flex min-h-[56px] items-center justify-between gap-4 border-b border-slate-100 px-1 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <metric.Icon
                      size={17}
                    />
                  </div>

                  <span className="truncate text-[13px] font-medium text-slate-500">
                    {
                      metric.label
                    }
                  </span>
                </div>

                <span className="shrink-0 text-sm font-extrabold tabular-nums text-slate-900">
                  {
                    metric.value
                  }
                </span>
              </div>
            ),
          )}
        </div>

        {canViewProfile && (
          <button
            type="button"
            onClick={onProfile}
            className="mt-5 min-h-[44px] w-full shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
          >
            Manage Profile
          </button>
        )}
      </div>
    </section>
  );
};

/* =========================================================================
   REQUESTS
============================================================================ */

const RequestsCard = ({
  count,
  onManage,
}) => (
  <section className="h-full rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
    <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <BriefcaseBusiness
            size={20}
          />
        </div>

        <div>
          <h2 className="text-[17px] font-extrabold text-slate-950">
            Consultation Requests
          </h2>

          <p className="mt-1 max-w-lg text-[13px] leading-5 text-slate-500">
            Review clients waiting
            for your response and
            manage your schedule.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <div>
          <p className="text-xs font-medium text-slate-400">
            Pending
          </p>

          <p className="mt-1 text-2xl font-extrabold text-slate-950">
            {count}
          </p>
        </div>

        <button
          type="button"
          onClick={onManage}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Manage
        </button>
      </div>
    </div>
  </section>
);

/* =========================================================================
   HELP
============================================================================ */

const HelpCard = ({
  onHelp,
}) => (
  <section className="h-full rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
      <Lightbulb size={19} />
    </div>

    <h2 className="mt-4 text-base font-extrabold text-slate-950">
      Help Improve <span className="notranslate" translate="no">Vakeel Setu</span>
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Have an idea or suggestion?
      Help us make the advocate
      experience better.
    </p>

    <button
      type="button"
      onClick={onHelp}
      className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
    >
      Send Suggestion
    </button>
  </section>
);
/* =========================================================================
   ADVOCATE CALENDAR
============================================================================ */

const AdvocateCalendarModal = ({
  open,
  mode,
  availabilitySlots,
  onClose,
  onModeChange,
  onSaveAvailability,
}) => {
  const now = new Date();

  const getLocalDateKey = (date) => {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ),
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getLocalDateKey(now),
  );

  const [
    startTime,
    setStartTime,
  ] = useState("10:00");

  const [
    endTime,
    setEndTime,
  ] = useState("11:00");

  const [
    validationError,
    setValidationError,
  ] = useState("");

  if (!open) {
    return null;
  }

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1,
    ).getDay();

  const totalDays =
    new Date(
      year,
      month + 1,
      0,
    ).getDate();

  const monthLabel =
    currentMonth.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      },
    );

  const calendarCells = [
    ...Array(firstDay).fill(
      null,
    ),

    ...Array.from(
      {
        length: totalDays,
      },
      (_, index) =>
        index + 1,
    ),
  ];

  const createDateKey = (
    day,
  ) => {
    const monthValue =
      String(
        month + 1,
      ).padStart(2, "0");

    const dayValue =
      String(day).padStart(
        2,
        "0",
      );

    return `${year}-${monthValue}-${dayValue}`;
  };

  const selectedSlots =
    availabilitySlots.filter(
      (slot) =>
        slot.date ===
        selectedDate,
    );

  const formattedSelectedDate =
    selectedDate
      ? new Date(
        `${selectedDate}T00:00:00`,
      ).toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
      : "";

  const changeMonth = (
    amount,
  ) => {
    setCurrentMonth(
      new Date(
        year,
        month + amount,
        1,
      ),
    );
  };

  const handleSave = () => {
    setValidationError("");

    if (
      !selectedDate ||
      !startTime ||
      !endTime
    ) {
      setValidationError(
        "Please select a date, start time and end time.",
      );

      return;
    }

    if (
      startTime >= endTime
    ) {
      setValidationError(
        "End time must be later than start time.",
      );

      return;
    }

    const duplicate =
      availabilitySlots.some(
        (slot) =>
          slot.date ===
          selectedDate &&
          slot.startTime ===
          startTime &&
          slot.endTime ===
          endTime,
      );

    if (duplicate) {
      setValidationError(
        "This availability slot already exists.",
      );

      return;
    }

    onSaveAvailability?.({
      date: selectedDate,
      startTime,
      endTime,
    });

    setValidationError("");
  };

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={
        onClose
      }
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        onMouseDown={(
          event,
        ) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
              Consultation Calendar
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Review your schedule and
              manage client booking
              availability.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close calendar"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODE SWITCH */}

        <div className="shrink-0 border-b border-slate-100 px-5 py-3 sm:px-6">
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                onModeChange(
                  "calendar",
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${mode ===
                "calendar"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Calendar
            </button>

            <button
              type="button"
              onClick={() => {
                setValidationError("");

                onModeChange(
                  "availability",
                );
              }}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${mode ===
                "availability"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Add Availability
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
          {/* CALENDAR LEFT */}

          <div className="border-b border-slate-100 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  changeMonth(-1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Previous month"
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              <h3 className="text-sm font-extrabold text-slate-900">
                {monthLabel}
              </h3>

              <button
                type="button"
                onClick={() =>
                  changeMonth(1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label="Next month"
              >
                <ChevronRight
                  size={17}
                />
              </button>
            </div>

            {/* WEEK HEADINGS */}

            <div className="mt-5 grid grid-cols-7 gap-1">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400"
                >
                  {day}
                </div>
              ))}

              {/* DATES */}

              {calendarCells.map(
                (
                  day,
                  index,
                ) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square"
                      />
                    );
                  }

                  const dateKey =
                    createDateKey(
                      day,
                    );

                  const selected =
                    selectedDate ===
                    dateKey;

                  const isToday =
                    dateKey ===
                    getLocalDateKey(
                      now,
                    );

                  const hasSlot =
                    availabilitySlots.some(
                      (slot) =>
                        slot.date ===
                        dateKey,
                    );

                  return (
                    <button
                      key={
                        dateKey
                      }
                      type="button"
                      onClick={() => {
                        setSelectedDate(
                          dateKey,
                        );

                        setValidationError(
                          "",
                        );
                      }}
                      className={`relative aspect-square rounded-xl text-xs font-bold transition ${selected
                        ? "bg-slate-950 text-white shadow-sm"
                        : isToday
                          ? "border border-slate-300 bg-slate-50 text-slate-950"
                          : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {day}

                      {hasSlot && (
                        <span
                          className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${selected
                            ? "bg-emerald-300"
                            : "bg-emerald-500"
                            }`}
                        />
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}

          <div className="bg-slate-50/50 p-5 sm:p-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
              Selected Date
            </p>

            <h3 className="mt-1 text-[15px] font-extrabold leading-6 text-slate-950">
              {formattedSelectedDate}
            </h3>

            {mode ===
              "availability" ? (
              /* =====================================================
                 ADD AVAILABILITY
              ===================================================== */

              <div className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={
                        startTime
                      }
                      onChange={(
                        event,
                      ) => {
                        setStartTime(
                          event
                            .target
                            .value,
                        );

                        setValidationError(
                          "",
                        );
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={
                        endTime
                      }
                      onChange={(
                        event,
                      ) => {
                        setEndTime(
                          event
                            .target
                            .value,
                        );

                        setValidationError(
                          "",
                        );
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
                  <Clock3
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <p className="text-[11px] leading-5 text-slate-500">
                    Add the time range
                    during which clients
                    can request a
                    consultation with
                    you.
                  </p>
                </div>

                {validationError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">
                    {
                      validationError
                    }
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800"
                >
                  <Plus
                    size={16}
                  />

                  Save Availability
                </button>
              </div>
            ) : (
              /* =====================================================
                 CALENDAR VIEW
              ===================================================== */

              <div className="mt-6">
                {selectedSlots.length ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-700">
                        Your Availability
                      </p>

                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        {
                          selectedSlots.length
                        }{" "}
                        {selectedSlots.length ===
                          1
                          ? "slot"
                          : "slots"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {selectedSlots.map(
                        (slot) => (
                          <div
                            key={
                              slot.id
                            }
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <Clock3
                                size={
                                  16
                                }
                              />
                            </div>

                            <div>
                              <p className="text-xs font-extrabold text-slate-800">
                                Available
                              </p>

                              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                {
                                  slot.startTime
                                }{" "}
                                –{" "}
                                {
                                  slot.endTime
                                }
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                      <CalendarDays
                        size={20}
                      />
                    </div>

                    <p className="mt-3 text-sm font-extrabold text-slate-900">
                      No availability
                      added
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      You haven't added
                      an available
                      consultation window
                      for this date.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onModeChange(
                          "availability",
                        )
                      }
                      className="mt-4 inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Plus
                        size={14}
                      />

                      Add Availability
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
/* =========================================================================
   MAIN DASHBOARD
============================================================================ */

export default function AdvocateDashboard() {
  const navigate = useNavigate();

  /* =====================================================================
     REAL DASHBOARD API DATA
  ===================================================================== */

  const dashboard =
    useAdvocateDashboard() ||
    {};

  const {
    advocate = null,
    upcoming = [],
    nextUpcoming = null,
    pending = [],
    recent = [],
    stats = {},
    counts = {},
    todayBookingsCount = 0,
    completion = null,
    isLoading = false,
    isRefreshing = false,
    error = null,
    refresh,
  } = dashboard;

  const { advocateOnlineStatus } = useOutletContext() || {};

  const {
    isOnline = false,
    lastSeenAt = null,
    statusLoading = false,
    heartbeatError = "",
    changeOnlineStatus,
  } = advocateOnlineStatus || {};



  /* =====================================================================
   CALENDAR / AVAILABILITY
===================================================================== */

  const [
    calendarOpen,
    setCalendarOpen,
  ] = useState(false);

  const [
    calendarMode,
    setCalendarMode,
  ] = useState("calendar");

  const [
    availabilitySlots,
    setAvailabilitySlots,
  ] = useState([]);

  const openCalendar = () => {
    setCalendarMode("calendar");
    setCalendarOpen(true);
  };

  const openAvailability = () => {
    setCalendarMode("availability");
    setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
  };

  // Verification Status 

  const [
    verificationStatus,
    setVerificationStatus,
  ] = useState(null);

  const [
    verificationLoading,
    setVerificationLoading,
  ] = useState(true);


  useEffect(() => {
    let active = true;

    const loadVerificationStatus =
      async () => {
        try {
          setVerificationLoading(true);

          const response =
            await getAdvocateVerificationStatus();

          if (!active) {
            return;
          }

          setVerificationStatus(response);
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Dashboard verification status error:",
            error,
          );

          setVerificationStatus(null);
        } finally {
          if (active) {
            setVerificationLoading(false);
          }
        }
      };

    loadVerificationStatus();

    return () => {
      active = false;
    };
  }, []);

  // Qualification Test Status & Actions
  const [approvalData, setApprovalData] = useState(null);
  const [showTestInstructions, setShowTestInstructions] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiRequest("/advocate/profile/approval-status");
        if (active && res) {
          setApprovalData(res);
        }
      } catch (err) {
        console.error("Dashboard approval status fetch error:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRequestReschedule = async () => {
    setRescheduleLoading(true);
    setRescheduleMessage("");
    try {
      const res = await rescheduleAdvocateTest({
        barCouncilId: displayAdvocate?.barCouncilId || displayAdvocate?.barId,
        phone: displayAdvocate?.phone || displayAdvocate?.mobile,
      });
      setRescheduleMessage(
        res?.message ||
          "Your test has been rescheduled. A new link will reach your email within 2 hours."
      );
      setApprovalData((prev) => ({
        ...prev,
        test: {
          ...(prev?.test || {}),
          status: "RESCHEDULE_REQUESTED",
        },
      }));
    } catch (err) {
      alert(err?.message || "Unable to request reschedule. Please try again later.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Dismissable passed test banner state
  const [isPassedBannerDismissed, setIsPassedBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem("dismissed_advocate_test_passed_banner") === "true";
    } catch {
      return false;
    }
  });

  const handleDismissPassedBanner = () => {
    setIsPassedBannerDismissed(true);
    try {
      localStorage.setItem("dismissed_advocate_test_passed_banner", "true");
    } catch {
      // ignore
    }
  };



  const handleSaveAvailability = (slot) => {
    setAvailabilitySlots((current) => [
      ...current,
      {
        ...slot,
        id: `${slot.date}-${slot.startTime}-${slot.endTime}-${Date.now()}`,
      },
    ]);

    setCalendarMode("calendar");
  };
  /* =====================================================================
     TEAM API DATA
  ===================================================================== */

  const team =
    useAdvocateTeam() || {};

  const [
    selectedClient,
    setSelectedClient,
  ] = useState(null);

  const [
    teamModalOpen,
    setTeamModalOpen,
  ] = useState(false);

  const [
    teamMateToRemove,
    setTeamMateToRemove,
  ] = useState(null);



  /* =====================================================================
     SAFE API VALUES
  ===================================================================== */

  const displayAdvocate =
    advocate || null;

  const displayUpcoming =
    Array.isArray(upcoming)
      ? upcoming
      : [];

  const displayPending =
    Array.isArray(pending)
      ? pending
      : [];

  const displayRecent =
    Array.isArray(recent)
      ? recent
      : [];

  const displayStats =
    hasObjectValues(stats)
      ? stats
      : {};

  const displayArticles =
    Array.isArray(
      advocate?.articles,
    )
      ? advocate.articles
      : [];

  const safeTeamMates =
    Array.isArray(
      team?.teamMates,
    )
      ? team.teamMates
      : [];

  const membershipActive =
    isMembershipActive(
      displayAdvocate,
    );




  /* =====================================================================
     PROFILE COMPLETION
  ===================================================================== */

  const rawCompletion =
    typeof completion ===
      "number"
      ? completion
      : completion?.percentage ??
      completion?.progress ??
      100;

  const completionPercentage =
    Number(rawCompletion);

  const profileIncomplete =
    Number.isFinite(
      completionPercentage,
    ) &&
    completionPercentage < 100;

  /* =====================================================================
     ACTIONS
  ===================================================================== */

  const handleProfile = () => {
    navigate(
      "/advocate/profile",
    );
  };

  const handleMembership = () => {
    navigate(
      "/advocate/pricing",
    );
  };

  const handleTeam = () => {
    navigate(
      "/advocate/team",
    );
  };

  const handleArticles = () => {
    if (!membershipActive) {
      navigate(
        "/advocate/pricing",
      );
      return;
    }

    navigate(
      "/legal-hub/articles",
    );
  };

  const handleNotifications =
    () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  /* =====================================================================
     TEAM MODALS
  ===================================================================== */

  const openTeamModal = () => {
    team?.resetSearch?.();
    setTeamModalOpen(true);
  };

  const closeTeamModal = () => {
    setTeamModalOpen(false);
    team?.resetSearch?.();
  };

  const confirmRemoveTeamMate =
    async () => {
      const teamMateId =
        teamMateToRemove?.id ||
        teamMateToRemove?._id ||
        null;

      if (!teamMateId) {
        return;
      }

      const removed =
        await team
          ?.removeTeamMate?.(
            teamMateId,
          );

      if (removed) {
        setTeamMateToRemove(
          null,
        );
      }
    };

  /* =====================================================================
     LOADING
  ===================================================================== */

  if (
    isLoading &&
    !displayAdvocate
  ) {
    return (
      <AdvocateDashboardSkeleton />
    );
  }

  /* =====================================================================
     CLIENT PROFILE
  ===================================================================== */

  if (selectedClient) {
    return (
      <main className="w-full px-4 pb-20 pt-6 sm:px-5 lg:px-6 xl:px-8">
        <ClientPublicProfile
          user={{
            ...selectedClient,

            consultationCount:
              displayRecent.filter(
                (entry) =>
                  String(
                    getEntityId(
                      getConsultationClient(
                        entry,
                      ),
                    ) || "",
                  ) ===
                  String(
                    getEntityId(
                      selectedClient,
                    ) || "",
                  ),
              ).length,
          }}
          onBack={() =>
            setSelectedClient(
              null,
            )
          }
        />
      </main>
    );
  }

  /* =====================================================================
     HARD API ERROR
  ===================================================================== */

  if (
    !displayAdvocate &&
    error
  ) {
    return (
      <main className="w-full px-4 py-10 sm:px-5 lg:px-6 xl:px-8">
        <DashboardErrorState
          message={
            typeof error ===
              "string"
              ? error
              : error?.message ||
              "Unable to load advocate dashboard."
          }
          onRetry={() =>
            refresh?.()
          }
        />
      </main>
    );
  }


  const approvalStatus =
    String(
      verificationStatus?.status || "",
    )
      .trim()
      .toUpperCase();



  const accountStatus =
    String(
      advocate?.accountStatus ||
      advocate?.status ||
      "",
    )
      .trim()
      .toUpperCase();

  const isProfileBlocked =
    accountStatus === "BLOCKED";

  const isAdminApproved =
    approvalStatus === "APPROVED" &&
    !isProfileBlocked;

  // Qualification Test Status derivation
  const testInfo = approvalData?.test || displayAdvocate?.test || null;
  const rawTestStatus = String(
    testInfo?.status || (displayAdvocate?.testPassedAt ? "PASSED" : "NOT_SENT")
  ).toUpperCase();
  const isTestPassed = rawTestStatus === "PASSED" || Boolean(displayAdvocate?.testPassedAt);
  const isTestFailed = rawTestStatus === "FAILED";
  const isTestRescheduled = rawTestStatus === "RESCHEDULE_REQUESTED";
  const isTestPending =
    !isTestPassed &&
    !isTestFailed &&
    !isTestRescheduled &&
    (rawTestStatus === "LINK_SENT" ||
      rawTestStatus === "IN_PROGRESS" ||
      rawTestStatus === "NOT_SENT" ||
      Boolean(testInfo?.required));

  const shouldShowTestBanner =
    !isAdminApproved &&
    rawTestStatus !== "NOT_REQUIRED" &&
    (isTestPending || isTestFailed || isTestRescheduled || (isTestPassed && !isPassedBannerDismissed));

  /* =====================================================================
     DASHBOARD
  ===================================================================== */

  return (
    <>
      <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
        <div className="w-full space-y-5 sm:space-y-6">
          {/* =========================================================
              WELCOME
          ========================================================= */}

          <WelcomeSection
  advocate={displayAdvocate}
  onNotifications={handleNotifications}
  isAdminApproved={isAdminApproved}
  verificationLoading={verificationLoading}
  isOnline={isOnline}
  lastSeenAt={lastSeenAt}
  statusLoading={statusLoading}
  heartbeatError={heartbeatError}
  changeOnlineStatus={changeOnlineStatus}
/>

          {/* =========================================================
              LOCATION 1: QUALIFICATION TEST HERO ALERT BANNER
          ========================================================= */}
          {shouldShowTestBanner && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              {/* State 1: Amber Banner (Pending / Link Sent) */}
              {isTestPending && (
                <div className="relative overflow-hidden rounded-[24px] border border-amber-300 bg-amber-50/90 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-amber-950">
                            Action Required: Complete Qualification Test
                          </h2>
                          <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-black text-amber-900 uppercase tracking-wider">
                            Pending
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-amber-800 leading-relaxed max-w-3xl">
                          A legal qualification test link has been sent to your registered email (valid for 72 hours). Profile activation requires clearing the test (15/20 correct answers).
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowTestInstructions(true)}
                      className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-600 active:scale-[0.99] transition"
                    >
                      <span>Check Email / Instructions</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* State 2: Soft Red Banner (Test Not Cleared / Failed / Reschedule) */}
              {(isTestFailed || isTestRescheduled) && (
                <div className="relative overflow-hidden rounded-[24px] border border-rose-300 bg-rose-50/90 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xs">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-rose-950">
                            {isTestRescheduled
                              ? "Test Reschedule Requested"
                              : "Qualification Test Not Cleared"}
                          </h2>
                          <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-[10px] font-black text-rose-900 uppercase tracking-wider">
                            {isTestRescheduled ? "Rescheduled" : "Failed (15/20 Required)"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-rose-800 leading-relaxed max-w-3xl">
                          {isTestRescheduled
                            ? (rescheduleMessage || "You have requested a reschedule. A new test link will reach your email within 2 hours.")
                            : "You scored below the passing mark (15/20). A reschedule can be requested to take a fresh test."}
                        </p>
                      </div>
                    </div>

                    {!isTestRescheduled ? (
                      <button
                        type="button"
                        disabled={rescheduleLoading}
                        onClick={handleRequestReschedule}
                        className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-[0.99] transition disabled:opacity-50"
                      >
                        {rescheduleLoading ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Requesting...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Request Reschedule</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-rose-200/80 px-4 py-2 text-xs font-bold text-rose-900">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Link Scheduled by Email</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* State 3: Green Success Banner (Test Passed) */}
              {isTestPassed && !isPassedBannerDismissed && (
                <div className="relative overflow-hidden rounded-[24px] border border-emerald-300 bg-emerald-50/90 p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-extrabold text-emerald-950">
                            Qualification Test Cleared (Passed)
                          </h2>
                          <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-black text-emerald-900 uppercase tracking-wider">
                            15/20 Passed
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-emerald-800 leading-relaxed max-w-3xl">
                          You have successfully passed the test. Your profile is currently under final review by the VakeelSetu Admin team.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Under Final Admin Review</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleDismissPassedBanner}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300 bg-white/90 text-emerald-800 shadow-2xs hover:bg-emerald-100 transition"
                        title="Dismiss notification"
                        aria-label="Dismiss banner"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* =========================================================
              PROFILE COMPLETION
          ========================================================= */}

          {profileIncomplete && (
            <section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                    <UserRound
                      size={18}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-extrabold text-slate-950">
                      Complete your
                      professional
                      profile
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Your profile is{" "}
                      {
                        completionPercentage
                      }
                      % complete.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/advocate/complete-profile",
                    )
                  }
                  className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Complete Profile
                </button>
              </div>
            </section>
          )}

          {/* =========================================================
              OVERVIEW
          ========================================================= */}

          <OverviewStats
            stats={displayStats}
            todayCount={todayBookingsCount}
            upcomingCount={
              counts?.UPCOMING ?? displayUpcoming.length
            }
            completedCount={
              counts?.COMPLETED ?? 0
            }
            onRefresh={refresh}
            isRefreshing={isRefreshing}
            onNavigate={navigate}
          />

          {/* =========================================================
              UPCOMING + MEMBERSHIP
          ========================================================= */}

          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
            <div className="h-full xl:col-span-8">
              <UpcomingConsultation
                consultation={
                  nextUpcoming ||
                  displayUpcoming[0] ||
                  null
                }
                onBookings={() => {
                  const target = nextUpcoming || displayUpcoming[0];
                  const targetId = getEntityId(target);
                  if (targetId) {
                    navigate(`/advocate/bookings?id=${targetId}`, {
                      state: { selectedId: targetId },
                    });
                  } else {
                    navigate("/advocate/bookings");
                  }
                }}
                onViewClient={
                  setSelectedClient
                }
                onOpenCalendar={
                  openCalendar
                }
                onAddAvailability={
                  openAvailability
                }
              />
            </div>

            <div className="h-full xl:col-span-4">
              <MembershipCard
                advocate={
                  displayAdvocate
                }
                onMembership={
                  handleMembership
                }
              />
            </div>
          </div>

          {/* =========================================================
              QUICK ACTIONS + RECENT
          ========================================================= */}

          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
            <div className="h-full xl:col-span-4">
              <QuickActions
                membershipActive={
                  membershipActive
                }
                onBookings={() =>
                  navigate(
                    "/advocate/bookings",
                  )
                }
                onTeam={
                  handleTeam
                }
                onArticles={
                  handleArticles
                }
                onNetwork={() =>
                  navigate(
                    "/advocate/network",
                  )
                }
              />
            </div>

            <div className="h-full xl:col-span-8">
              <RecentActivity
                recent={
                  displayRecent
                }
                onBookings={(item) => {
                  if (item) {
                    const id = getEntityId(item);
                    navigate(`/advocate/bookings?id=${id}`, {
                      state: { selectedId: id },
                    });
                  } else {
                    navigate("/advocate/bookings");
                  }
                }}
              />
            </div>
          </div>

          {/* =========================================================
              ARTICLES + PROFILE PERFORMANCE
          ========================================================= */}

          <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
            <div className="h-full xl:col-span-7">
              <ArticlesSection
                articles={
                  displayArticles
                }
                membershipActive={
                  membershipActive
                }
                onMembership={
                  handleMembership
                }
                onArticles={
                  handleArticles
                }
              />
            </div>

            <div className="h-full xl:col-span-5">
              <ProfilePerformance
                advocate={
                  displayAdvocate
                }
                stats={
                  displayStats
                }
                onProfile={
                  handleProfile
                }
                canViewProfile={Boolean(
                  displayAdvocate,
                )}
              />
            </div>
          </div>

          {/* =========================================================
              CONNECT WITH LAWYERS / NETWORK SECTION REMOVED
          ========================================================= */}

          {/* =========================================================
              LEGAL TEAM
          ========================================================= */}

          {Boolean(
            team?.isAdvocateViewer,
          ) && (
              <AdvocateTeamSection
                teamMates={
                  safeTeamMates
                }
                loading={Boolean(
                  team?.teamLoading,
                )}
                error={
                  team?.teamError ||
                  null
                }
                removingId={
                  team?.removingId ||
                  null
                }
                onAdd={
                  openTeamModal
                }
                onRetry={() =>
                  team?.refreshTeam?.()
                }
                onViewProfile={(
                  mate,
                ) => {
                  const mateId =
                    mate?.id ||
                    mate?._id;

                  if (mateId) {
                    navigate(
                      `/advocate/team/${mateId}`,
                    );
                  }
                }}
                onRemove={
                  setTeamMateToRemove
                }
              />
            )}

          {/* =============================================================
    CALENDAR / AVAILABILITY MODAL
============================================================= */}

          <AdvocateCalendarModal
            open={
              calendarOpen
            }
            mode={
              calendarMode
            }
            availabilitySlots={
              availabilitySlots
            }
            onClose={
              closeCalendar
            }
            onModeChange={
              setCalendarMode
            }
            onSaveAvailability={
              handleSaveAvailability
            }
          />

          {/* =========================================================
              REQUESTS + HELP
          ========================================================= */}

          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="h-full lg:col-span-8">
              <RequestsCard
                count={
                  displayPending.length
                }
                onManage={() =>
                  navigate(
                    "/advocate/bookings",
                  )
                }
              />
            </div>

            <div className="h-full lg:col-span-4">
              <HelpCard
                onHelp={() =>
                  navigate(
                    "/help",
                  )
                }
              />
            </div>
          </div>

          <div className="h-2" />
        </div>
      </main>

      {/* =============================================================
          TEAM MODALS
      ============================================================= */}

      {Boolean(
        team?.isAdvocateViewer,
      ) && (
          <>
            <AddTeamMateModal
              open={
                teamModalOpen
              }
              team={team}
              onClose={
                closeTeamModal
              }
            />

            <RemoveTeamMateModal
              mate={
                teamMateToRemove
              }
              removing={
                String(
                  team?.removingId ||
                  "",
                ) ===
                String(
                  teamMateToRemove?.id ||
                  teamMateToRemove?._id ||
                  "",
                )
              }
              error={
                team?.removeError ||
                null
              }
              onCancel={() =>
                setTeamMateToRemove(
                  null,
                )
              }
              onConfirm={
                confirmRemoveTeamMate
              }
            />
          </>
        )}

      {/* Test Instructions Modal */}
      {showTestInstructions && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  Qualification Assessment Details
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Test link sent to: {testInfo?.emailSentTo || displayAdvocate?.email || "your email"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTestInstructions(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950">
                <p className="font-bold text-xs">How to complete your assessment:</p>
                <ol className="mt-2 list-decimal list-inside space-y-1.5 text-amber-900 text-xs">
                  <li>Check your registered email inbox (and Spam folder) for the test link.</li>
                  <li>Open the link: It will ask for your <strong>Bar Council ID</strong> and registered <strong>Phone number</strong> (no password/OTP needed).</li>
                  <li>You will be presented with <strong>20 multiple-choice questions</strong> with a <strong>20-minute countdown timer</strong>.</li>
                  <li>Score at least <strong>15 correct answers</strong> to qualify.</li>
                  <li>Link validity: <strong>72 hours</strong> from submission.</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowTestInstructions(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}