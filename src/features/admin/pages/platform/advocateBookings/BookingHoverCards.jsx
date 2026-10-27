import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiX, FiMail, FiCheck, FiVideo, FiPhone, FiBriefcase } from "react-icons/fi";
import CallPhoneButton from "@/features/advocate/components/CallPhoneButton";
import { ADMIN_PATHS, formatDate } from "../../../utils/adminUtils";


function formatAmount(amt) {
  if (amt == null || Number.isNaN(Number(amt))) return "—";
  const num = Number(amt);
  const isWhole = Number.isInteger(num);
  return `₹${num.toLocaleString("en-IN", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTimeSlot(startAt, endAt, durationMinutes) {
  if (!startAt) return "—";
  try {
    const s = new Date(startAt);
    const startStr = s.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    let endStr = "";
    if (endAt) {
      const e = new Date(endAt);
      endStr = e.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    const durationLabel = durationMinutes ? ` (${durationMinutes}m)` : "";
    return endStr ? `${startStr} – ${endStr}${durationLabel}` : `${startStr}${durationLabel}`;
  } catch {
    return String(startAt);
  }
}

function renderModeBadge(mode) {
  const norm = String(mode || "").toUpperCase();
  if (norm === "VIDEO_CALL") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
        <FiVideo className="shrink-0" size={11} />
        Video Call
      </span>
    );
  }
  if (norm === "VOICE_CALL") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
        <FiPhone className="shrink-0" size={11} />
        Voice Call
      </span>
    );
  }
  if (norm === "IN_PERSON") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <FiBriefcase className="shrink-0" size={11} />
        In Person
      </span>
    );
  }
  return <span className="text-xs text-slate-600 font-medium">{mode || "—"}</span>;
}

/**
 * Reusable portal-based click popover container.
 * Triggered on CLICK (not hover) per user request.
 * Renders into document.body so it is never clipped by table scroll containers.
 */
function ClickCardPopover({
  ariaLabel,
  className = "",
  triggerContent,
  renderCard,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: "bottom" });

  const triggerRef = useRef(null);
  const cardRef = useRef(null);

  const CARD_WIDTH = 360;
  const ESTIMATED_HEIGHT = 320;
  const MARGIN = 8;

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();

    // Close if trigger scrolled completely outside the viewport
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsOpen(false);
      return;
    }

    const triggerCenter = rect.left + rect.width / 2;
    let left = triggerCenter - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(window.innerWidth - CARD_WIDTH - 16, left));

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = 0;
    let placement = "bottom";

    if (spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow) {
      top = rect.top - MARGIN;
      placement = "top";
    } else {
      top = rect.bottom + MARGIN;
      placement = "bottom";
    }

    setCoords({ top, left, placement });
  }, [CARD_WIDTH, ESTIMATED_HEIGHT, MARGIN]);

  const handleToggleClick = useCallback(
    (e) => {
      e.stopPropagation();
      setIsOpen((prev) => {
        const next = !prev;
        if (next) updatePosition();
        return next;
      });
    },
    [updatePosition]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) updatePosition();
          return next;
        });
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [updatePosition]
  );

  // Reposition on scroll / window resize when open
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  // Click outside and global Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        cardRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleToggleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`group/cell cursor-pointer select-none rounded-xl p-2 -m-1 transition-all duration-150 hover:bg-amber-50/70 hover:ring-1 hover:ring-amber-200/80 focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
          isOpen ? "bg-amber-50/90 ring-1 ring-amber-300 shadow-2xs" : ""
        } ${className}`}
      >
        {triggerContent}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placement === "top" ? "translateY(-100%)" : "none",
              zIndex: 9999,
            }}
            className="w-[350px] sm:w-[360px] rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-950/20 overflow-hidden text-left transition duration-150 animate-in fade-in zoom-in-95"
            role="dialog"
            aria-label={ariaLabel}
          >
            {renderCard({ close })}
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Advocate Cell with Click Info Card:
 * Styled per the modern card layout reference (coloured header, avatar with initials,
 * name, ID beneath, status pills, 2-column labelled field grid, and full profile button).
 */
export function AdvocateHoverCell({ advocate, className = "" }) {
  const name = advocate?.fullName || advocate?.name || "—";
  const barCouncilId = advocate?.barCouncilId || "";
  const advocateId = advocate?.id || advocate?._id || "";
  const phone = advocate?.phone || "";
  const avatarUrl =
    advocate?.profilePhotoUrl ||
    advocate?.profilePhoto ||
    advocate?.avatarUrl ||
    advocate?.avatar ||
    advocate?.photo ||
    advocate?.image ||
    null;
  const isOnline = Boolean(advocate?.isOnline ?? advocate?.online ?? false);
  const firstLetter = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  const profileUrl = advocateId ? ADMIN_PATHS.advocates.detail(advocateId) : null;

  return (
    <ClickCardPopover
      ariaLabel={`Advocate details for ${name}. Click to view info card.`}
      className={className}
      triggerContent={
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <p className="font-semibold text-slate-900 text-sm group-hover/cell:text-amber-700 transition-colors truncate">
              {name}
            </p>
      
          </div>
          {barCouncilId ? (
            <p className="font-mono text-xs text-slate-500 truncate">ID: {barCouncilId}</p>
          ) : null}
          {phone ? <p className="font-mono text-[11px] text-slate-400 truncate">{phone}</p> : null}
        </div>
      }
      renderCard={({ close }) => (
        <>
          {/* Header Banner: Dark slate with amber accent, styled per reference */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white relative border-t-4 border-amber-500">
            {/* Top row: Category tag + Close button */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Advocate Details
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition focus:outline-none focus:ring-1 focus:ring-amber-400"
                aria-label="Close advocate card"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Profile Row: Avatar + Name + Status on the same line */}
            <div className="flex items-center gap-3">
              {/* Avatar Box with dynamic status border & pulsing status dot */}
              <div className="relative shrink-0">
                <div
                  className={`h-12 w-12 rounded-xl p-0.5 shadow-md shadow-slate-950/40 border-2 transition-all duration-300 flex items-center justify-center overflow-hidden bg-slate-900 ${
                    isOnline
                      ? "border-emerald-500 ring-2 ring-emerald-500/25"
                      : "border-slate-700 ring-1 ring-slate-800"
                  }`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: avatarUrl ? "none" : "flex" }}
                    className="avatar-fallback h-full w-full rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-base items-center justify-center shadow-inner"
                  >
                    {firstLetter}
                  </div>
                </div>

                {/* Small status dot on the border that pulses on both online and offline */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 transition-colors animate-pulse ${
                    isOnline ? "bg-emerald-400" : "bg-slate-500"
                  }`}
                  title={isOnline ? "Online" : "Offline"}
                  aria-label={isOnline ? "Online" : "Offline"}
                />
              </div>

              {/* Title and Online/Offline Badge in front of the name */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-white leading-tight truncate" title={name}>
                    {name}
                  </h4>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border shrink-0 ${
                      isOnline
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800/80 text-slate-300 border-slate-700"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body: Two-column grid of labelled real fields */}
          <div className="p-4 bg-slate-50/60 border-t border-slate-200/70">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mobile Number
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    {phone || "—"}
                  </span>
                  {phone && (
                    <CallPhoneButton phone={phone} clientName={name} size="sm" />
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bar Council ID
                </span>
                <p
                  className="font-mono text-xs font-semibold text-slate-800 mt-1 truncate"
                  title={barCouncilId}
                >
                  {barCouncilId || "—"}
                </p>
              </div>

            

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Verification
                </span>
                <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <FiCheck size={12} className="text-emerald-600 shrink-0" />
                  <span>Verified Legal Counsel</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Action Button (styled per reference image) */}
          {profileUrl ? (
            <div className="p-3 bg-white border-t border-slate-100">
              <Link
                to={profileUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <span>Open Advocate Profile</span>
                <span aria-hidden="true" className="text-amber-400">→</span>
              </Link>
            </div>
          ) : null}
        </>
      )}
    />
  );
}

/**
 * Client Cell with Click Info Card:
 * Styled per the modern card layout reference (coloured header, avatar with initials,
 * name, booking reference beneath, status pills, 2-column labelled field grid,
 * and profile button).
 */
export function ClientHoverCell({ item, className = "" }) {
  const user = item?.user || {};
  const name = user.name || user.fullName || "—";
  const phone = user.phone || "";
  const email = user.email || "";
  const bookingRef = item?.bookingId || item?.id || "";
  const userId = user.id || user._id;

  const clientAvatarUrl =
    user?.profilePhotoUrl ||
    user?.profilePhoto ||
    user?.avatarUrl ||
    user?.avatar ||
    user?.photo ||
    user?.image ||
    null;
  const clientFirstLetter = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  const profileUrl = userId ? ADMIN_PATHS.users.detail(userId) : null;

  // Derived status strictly matching the Private Advocate Bookings tab's STATUS column
  const isCompleted = Boolean(
    item?.completedAt ||
    item?.status === "COMPLETED" ||
    item?.callStatus === "COMPLETED"
  );
  const isConfirmedOrPaid = ["CONFIRMED", "PAID"].includes(item?.status);
  const isHold = item?.status === "HOLD";
  const isRefundPending = item?.status === "REFUND_PENDING";
  const isRefunded = item?.status === "REFUNDED";
  const isCancelled = ["CANCELLED", "EXPIRED", "FAILED"].includes(item?.status);

  let statusBadge;
  if (isCompleted) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Consultation Completed
      </span>
    );
  } else if (isConfirmedOrPaid || item?.status === "PENDING" || item?.callStatus === "PENDING") {
    // When confirmed/paid, consultation call is pending — exactly matching the table's "Consultation Pending" status
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Consultation Pending
      </span>
    );
  } else if (isHold) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Slot Held
      </span>
    );
  } else if (isRefundPending) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        Refund Pending
      </span>
    );
  } else if (isRefunded) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-400/30">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Refunded
      </span>
    );
  } else if (isCancelled) {
    const raw = String(item?.status || "Cancelled");
    const label = raw.charAt(0) + raw.slice(1).toLowerCase();
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        {label}
      </span>
    );
  } else {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-500/30">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {item?.status || "—"}
      </span>
    );
  }

  const legacySubject = item?.subject || item?.notes;

  return (
    <ClickCardPopover
      ariaLabel={`Client details for ${name}. Click to view info card.`}
      className={className}
      triggerContent={
        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <p className="font-semibold text-slate-900 text-sm group-hover/cell:text-amber-700 transition-colors truncate">
              {name}
            </p>
            
          </div>
          <p className="font-mono text-xs text-slate-500 truncate">{phone || "—"}</p>
          {email ? (
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{email}</p>
          ) : null}
        </div>
      }
      renderCard={({ close }) => (
        <>
          {/* Header Banner: Dark slate with amber accent, styled per reference */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white relative border-t-4 border-amber-500">
            {/* Top row: Category tag + Close button */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 " />
                Client Details
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
                className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition focus:outline-none focus:ring-1 focus:ring-amber-400"
                aria-label="Close client card"
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Profile Row: Avatar + Name + Subtitle + Pills */}
            <div className="flex items-start gap-3">
              {/* Avatar Box with crisp white border frame */}
              <div className="h-12 w-12 rounded-xl bg-white p-0.5 shadow-md shadow-slate-950/40 ring-1 ring-white/20 shrink-0 flex items-center justify-center overflow-hidden">
                {clientAvatarUrl ? (
                  <img
                    src={clientAvatarUrl}
                    alt={name}
                    className="h-full w-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".avatar-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  style={{ display: clientAvatarUrl ? "none" : "flex" }}
                  className="avatar-fallback h-full w-full rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-base items-center justify-center shadow-inner"
                >
                  {clientFirstLetter}
                </div>
              </div>

              {/* Title, Booking Ref and Badges */}
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-white leading-tight truncate" title={name}>
                  {name}
                </h4>
                <p className="font-mono text-xs text-slate-300 truncate mt-0.5">
                  {bookingRef ? `Ref: ${bookingRef}` : "Client Consultation"}
                </p>

                {/* Status Pills (Client tag removed per user request) */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {statusBadge}
                </div>
              </div>
            </div>
          </div>

          {/* Body: Two-column grid of labelled real fields */}
          <div className="p-4 bg-slate-50/60 border-t border-slate-200/70 space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mobile Number
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-xs font-semibold text-slate-800">
                    {phone || "—"}
                  </span>
                  {phone && (
                    <CallPhoneButton phone={phone} clientName={name} size="sm" />
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </span>
                <div className="mt-1">
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-slate-800 hover:text-amber-600 hover:underline transition-colors truncate max-w-full tracking-normal"
                      title={email}
                    >
                      <FiMail className="shrink-0 text-slate-400" size={13} />
                      <span className="truncate">{email}</span>
                    </a>
                  ) : (
                    <span className="font-sans text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Consultation Mode
                </span>
                <div className="mt-1">{renderModeBadge(item?.mode)}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Amount
                </span>
                <p className="text-xs font-bold text-slate-900 mt-1">
                  {formatAmount(item?.breakdown?.total)}
                </p>
              </div>
            </div>

            {/* Scheduled Slot */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Scheduled Slot
              </span>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="font-semibold text-slate-800">{formatDate(item?.startAt)}</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {formatTimeSlot(item?.startAt, item?.endAt, item?.durationMinutes)}
                </span>
              </div>
            </div>

            {/* Legacy Subject / Notes (only if non-empty) */}
            {legacySubject ? (
              <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item?.subject ? "Subject" : "Notes"}
                </span>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed break-words">
                  {legacySubject}
                </p>
              </div>
            ) : null}
          </div>

          {/* Footer Action Button (styled per reference image) */}
          {profileUrl ? (
            <div className="p-3 bg-white border-t border-slate-100">
              <Link
                to={profileUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <span>Open Client Profile</span>
                <span aria-hidden="true" className="text-amber-400">→</span>
              </Link>
            </div>
          ) : null}
        </>
      )}
    />
  );
}
