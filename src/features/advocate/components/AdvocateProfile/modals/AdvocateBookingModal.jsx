import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import {
  FiX,
  FiCalendar,
  FiSlash,
  FiClock,
  FiAlertCircle,
  FiLock,
  FiPhone,
  FiVideo,
  FiBriefcase,
  FiShield,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  getAdvocateBusySlots,
  createAdvocateCheckout,
  verifyAdvocatePayment,
  getAdvocateCheckoutStatus,
} from "../../../services/advocateBookingApi";
import {
  generateAdvocateSlots,
  getTodayISTDateString,
  addDaysToISTDateString,
  formatISTDateLong,
  formatSlotStartTime,
  getCalendarMonthMatrix,
} from "../../../utils/advocateSlotUtils";
import { usePaymentStateMachine, PAYMENT_STATES } from "@/features/user/hooks/usePaymentStateMachine";

function getModeIcon(mode) {
  switch (mode) {
    case "VIDEO_CALL":
      return FiVideo;
    case "IN_PERSON":
      return FiBriefcase;
    case "VOICE_CALL":
    default:
      return FiPhone;
  }
}

/** Formats YYYY-MM-DD into DD/MM/YYYY */
function formatDDMMYYYY(isoDateStr) {
  if (!isoDateStr || !isoDateStr.includes("-")) return "";
  const [y, m, d] = isoDateStr.split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Formats rupee amounts:
 * Whole amounts stay clean (₹510, ₹25).
 * Decimal amounts display 2 decimal places (₹91.80, ₹626.80).
 */
function formatRupees(amount) {
  if (amount == null || isNaN(amount)) return "0";
  const num = Number(amount);
  if (Number.isInteger(num)) {
    return num.toLocaleString("en-IN");
  }
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdvocateBookingModal({
  isOpen,
  onClose,
  advocate,
  bookingOptions,
  initialMode,
  currentUser,
  onBookingComplete,
}) {
  const navigate = useNavigate();

  const advocateId = advocate?.id || advocate?._id;
  const advocateName = advocate?.fullName || advocate?.personalDetails?.fullName || "Advocate";
  const modes = useMemo(() => (Array.isArray(bookingOptions?.modes) ? bookingOptions.modes : []), [bookingOptions]);
  const maxDaysAhead = bookingOptions?.maxDaysAhead ?? 30;
  const minLeadMinutes = bookingOptions?.minLeadMinutes ?? 15;

  // Selected Mode: Chosen prior to opening on Consult Now card
  const [selectedMode, setSelectedMode] = useState(initialMode || "");
  useEffect(() => {
    if (initialMode && modes.some((m) => m.mode === initialMode)) {
      setSelectedMode(initialMode);
    } else if (modes.length > 0 && !selectedMode) {
      setSelectedMode(modes[0].mode);
    }
  }, [initialMode, modes, selectedMode]);

  const activeModeObj = useMemo(
    () => modes.find((m) => m.mode === selectedMode) || modes[0] || null,
    [modes, selectedMode]
  );

  // Range bounds in IST
  const todayIST = useMemo(() => getTodayISTDateString(), []);
  const maxDateIST = useMemo(
    () => addDaysToISTDateString(todayIST, maxDaysAhead),
    [todayIST, maxDaysAhead]
  );

  // 1. DATE: A single dd/mm/yyyy input with integrated calendar picker
  const [dateInputValue, setDateInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD once valid
  const [dateError, setDateError] = useState("");

  // Calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const [y, m] = todayIST.split("-").map(Number);
    return { year: y, monthIndex: m - 1 };
  });

  const dateInputRef = useRef(null);
  const calendarBtnRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({});

  // 2. TIME SELECTION
  const [selectedSlot, setSelectedSlot] = useState(null); // slot object
  const [busySlots, setBusySlots] = useState([]);
  const [loadingBusySlots, setLoadingBusySlots] = useState(false);
  const [slotFetchError, setSlotFetchError] = useState("");

  // 3. BRIEF NOTES (optional, max 500 chars)
  const [notes, setNotes] = useState("");

  // Feedback & Slot conflict state
  const [slotTakenMessage, setSlotTakenMessage] = useState("");

  // Hold Timer state
  const [checkoutData, setCheckoutData] = useState(null);
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(null);
  const holdIntervalRef = useRef(null);

  // Scroller ref & scroll indicator states
  const slotScrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Lock background scroll while modal is open, restore when closed
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // Position calendar popover relative to input wrapper
  const updatePopoverPosition = useCallback(() => {
    if (!dateInputRef.current) return;
    const rect = dateInputRef.current.getBoundingClientRect();
    const popoverHeight = 310;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

    const top = openAbove ? rect.top - popoverHeight - 6 : rect.bottom + 6;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - 300));
    setPopoverStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 100000,
    });
  }, []);

  // Close calendar popover on outside click or Escape
  useEffect(() => {
    if (!isCalendarOpen) return;

    const handlePointerDown = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        calendarBtnRef.current &&
        !calendarBtnRef.current.contains(e.target)
      ) {
        setIsCalendarOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);

    updatePopoverPosition();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [isCalendarOpen, updatePopoverPosition]);

  // Update scroller overflow buttons & gradient fades
  const updateScrollIndicators = useCallback(() => {
    const el = slotScrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const handleScrollSlots = (direction) => {
    const el = slotScrollerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Fetch busy slots for valid selectedDate
  const fetchBusySlots = useCallback(async (dateStr) => {
    if (!advocateId || !dateStr) return;
    setLoadingBusySlots(true);
    setSlotFetchError("");
    try {
      const res = await getAdvocateBusySlots(advocateId, dateStr);
      if (res && Array.isArray(res.busy)) {
        setBusySlots(res.busy);
      } else {
        setBusySlots([]);
      }
    } catch (err) {
      console.error("Failed to fetch busy slots:", err);
      setSlotFetchError("Could not refresh live slot availability.");
    } finally {
      setLoadingBusySlots(false);
    }
  }, [advocateId]);

  // Fetch busy slots whenever a valid date is selected
  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchBusySlots(selectedDate);
    } else {
      setBusySlots([]);
    }
  }, [isOpen, selectedDate, fetchBusySlots]);

  // Generate slots in IST
  const rawSlots = useMemo(() => {
    if (!selectedDate) return [];
    const durationMinutes = activeModeObj?.durationMinutes || 15;
    return generateAdvocateSlots({
      dateString: selectedDate,
      durationMinutes,
      busySlots,
      minLeadMinutes,
      currentEpochMs: Date.now(),
    });
  }, [selectedDate, activeModeObj, busySlots, minLeadMinutes]);

  // Visible slots: Past slots and slots inside minLeadMinutes are HIDDEN
  // Busy slots ARE shown, but visibly disabled with distinct blocked styling
  const visibleSlots = useMemo(() => {
    return rawSlots.filter((slot) => !slot.isPastOrLead);
  }, [rawSlots]);

  // Sample slot start times to display before a date is chosen
  const sampleSlotStartTimes = useMemo(() => {
    const duration = activeModeObj?.durationMinutes || 15;
    if (duration === 60) {
      return ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
    }
    return [
      "10:00 AM",
      "10:15 AM",
      "10:30 AM",
      "10:45 AM",
      "11:00 AM",
      "11:15 AM",
      "11:30 AM",
      "11:45 AM",
      "12:00 PM",
      "12:15 PM",
      "12:30 PM",
    ];
  }, [activeModeObj]);

  // Recalculate scroller buttons whenever visible slots change
  useEffect(() => {
    const timeout = setTimeout(updateScrollIndicators, 100);
    return () => clearTimeout(timeout);
  }, [visibleSlots, selectedDate, updateScrollIndicators]);

  // Clear selected slot if mode changes or date becomes invalid
  useEffect(() => {
    if (selectedSlot) {
      if (!selectedDate || !selectedSlot.startAt.startsWith(selectedDate) || selectedSlot.disabled) {
        setSelectedSlot(null);
      }
    }
  }, [selectedDate, selectedSlot]);

  // Handle dd/mm/yyyy input formatting and range validation
  const handleDateInputChange = (e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 8);

    // Auto-format DD/MM/YYYY
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDateInputValue(formatted);
    setSlotTakenMessage("");

    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);
      const pad = (n) => String(n).padStart(2, "0");

      if (month < 1 || month > 12) {
        setDateError("Please enter a valid month (01–12).");
        setSelectedDate("");
        setSelectedSlot(null);
        return;
      }

      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      if (day < 1 || day > daysInMonth) {
        setDateError(`Please enter a valid day (01–${daysInMonth}) for this month.`);
        setSelectedDate("");
        setSelectedSlot(null);
        return;
      }

      const isoDateStr = `${year}-${pad(month)}-${pad(day)}`;

      // Sync calendar view to typed year and month
      setCalendarView({ year, monthIndex: month - 1 });

      if (isoDateStr < todayIST || isoDateStr > maxDateIST) {
        setDateError(`Date must be between ${formatDDMMYYYY(todayIST)} and ${formatDDMMYYYY(maxDateIST)}.`);
        setSelectedDate("");
        setSelectedSlot(null);
        return;
      }

      // Valid date within range!
      setDateError("");
      if (isoDateStr !== selectedDate) {
        setSelectedDate(isoDateStr);
        setSelectedSlot(null);
      }
    } else {
      // Incomplete date: clear selectedDate and selectedSlot
      if (selectedDate) {
        setSelectedDate("");
        setSelectedSlot(null);
      }
      if (dateError) {
        setDateError("");
      }
    }
  };

  const handleDateInputBlur = () => {
    const digits = dateInputValue.replace(/\D/g, "");
    if (digits.length > 0 && digits.length < 8) {
      setDateError(`Please enter a complete date (DD/MM/YYYY) between ${formatDDMMYYYY(todayIST)} and ${formatDDMMYYYY(maxDateIST)}.`);
    }
  };

  // Select date from calendar popover
  const handleSelectCalendarDate = (dateStr) => {
    setSelectedDate(dateStr);
    setDateInputValue(formatDDMMYYYY(dateStr));
    setSelectedSlot(null);
    setDateError("");
    setSlotTakenMessage("");
    setIsCalendarOpen(false);
  };

  // Calendar popover bounds & navigation
  const minYearMonthKey = `${todayIST.slice(0, 4)}-${todayIST.slice(5, 7)}`;
  const maxYearMonthKey = `${maxDateIST.slice(0, 4)}-${maxDateIST.slice(5, 7)}`;
  const currentViewKey = `${calendarView.year}-${String(calendarView.monthIndex + 1).padStart(2, "0")}`;

  const canPrevMonth = currentViewKey > minYearMonthKey;
  const canNextMonth = currentViewKey < maxYearMonthKey;

  const handlePrevMonth = () => {
    if (!canPrevMonth) return;
    setCalendarView((prev) => {
      if (prev.monthIndex === 0) {
        return { year: prev.year - 1, monthIndex: 11 };
      }
      return { year: prev.year, monthIndex: prev.monthIndex - 1 };
    });
  };

  const handleNextMonth = () => {
    if (!canNextMonth) return;
    setCalendarView((prev) => {
      if (prev.monthIndex === 11) {
        return { year: prev.year + 1, monthIndex: 0 };
      }
      return { year: prev.year, monthIndex: prev.monthIndex + 1 };
    });
  };

  const calendarMatrix = getCalendarMonthMatrix(calendarView.year, calendarView.monthIndex);
  const calendarMonthLabel = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(calendarView.year, calendarView.monthIndex, 15)));

  // Hold Timer management
  useEffect(() => {
    if (!checkoutData?.expiresAt) {
      setHoldRemainingSeconds(null);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      return;
    }

    const expiresEpochMs = new Date(checkoutData.expiresAt).getTime();

    const updateTimer = () => {
      const remainingMs = expiresEpochMs - Date.now();
      if (remainingMs <= 0) {
        setHoldRemainingSeconds(0);
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        alert("Your slot hold has expired. Please select a time slot again.");
        setCheckoutData(null);
        setSelectedSlot(null);
        if (selectedDate) fetchBusySlots(selectedDate);
      } else {
        setHoldRemainingSeconds(Math.floor(remainingMs / 1000));
      }
    };

    updateTimer();
    holdIntervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [checkoutData, selectedDate, fetchBusySlots]);

  // Payment State Machine
  const {
    state: paymentState,
    errorMessage: paymentError,
    paymentResult,
    startPayment,
    resetToIdle: resetPayment,
  } = usePaymentStateMachine({
    onInitiateCheckout: async () => {
      setSlotTakenMessage("");

      // Re-verify busy slots immediately before opening payment window
      const freshBusyRes = await getAdvocateBusySlots(advocateId, selectedDate);
      const isStillAvailable = !(freshBusyRes?.busy || []).some((b) => {
        const busyStart = Date.parse(b.startAt);
        const busyEnd = Date.parse(b.endAt);
        return selectedSlot.startEpochMs < busyEnd && selectedSlot.endEpochMs > busyStart;
      });

      if (!isStillAvailable) {
        setSlotTakenMessage("This slot was just booked. Please choose another time.");
        setSelectedSlot(null);
        fetchBusySlots(selectedDate);

        const slotErr = new Error("This slot was just booked. Please choose another time.");
        slotErr.code = "SLOT_TAKEN";
        throw slotErr;
      }

      // Checkout request WITHOUT subject
      const res = await createAdvocateCheckout({
        advocateId,
        mode: selectedMode,
        startAt: selectedSlot.startAt,
        notes: notes.trim() || undefined,
      });

      const co = res?.checkout || res;
      setCheckoutData(co);
      return co;
    },
    onVerifyPayment: async (verifyPayload) => {
      return verifyAdvocatePayment({
        razorpay_order_id: verifyPayload.razorpay_order_id,
        razorpay_payment_id: verifyPayload.razorpay_payment_id,
        razorpay_signature: verifyPayload.razorpay_signature,
      });
    },
    onCheckStatus: async (checkoutId) => {
      return getAdvocateCheckoutStatus(checkoutId);
    },
  });

  // Call onBookingComplete callback on successful payment
  useEffect(() => {
    if (paymentState === PAYMENT_STATES.SUCCESS && paymentResult) {
      onBookingComplete?.(paymentResult);
    }
  }, [paymentState, paymentResult, onBookingComplete]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setDateInputValue("");
      setSelectedDate("");
      setSelectedSlot(null);
      setDateError("");
      setNotes("");
      setSlotTakenMessage("");
      setSlotFetchError("");
      setIsCalendarOpen(false);
      setCheckoutData(null);
      resetPayment();

      const [y, m] = todayIST.split("-").map(Number);
      setCalendarView({ year: y, monthIndex: m - 1 });
    }
  }, [isOpen, todayIST, resetPayment]);

  if (!isOpen || advocate?.isOnline === false) return null;

  // Format hold timer
  const formatTimer = (sec) => {
    if (sec == null) return "10:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Fees from active mode object in booking-options
  const fee = Number(activeModeObj?.fee ?? 0);
  const gst = Number(activeModeObj?.gst ?? 0);
  const gstPercent = activeModeObj?.gstPercent ?? 18;
  const platformFee = Number(activeModeObj?.platformFee ?? 25);
  const totalPayable = Number(activeModeObj?.total ?? (fee + gst + platformFee));

  const isSubmitting =
    paymentState === PAYMENT_STATES.STARTING ||
    paymentState === PAYMENT_STATES.OPENED ||
    paymentState === PAYMENT_STATES.CONFIRMING;

  const isPayDisabled = !selectedDate || !selectedSlot || isSubmitting;

  const isOutcomeState =
    paymentState === PAYMENT_STATES.CONFIRMING ||
    paymentState === PAYMENT_STATES.SUCCESS ||
    paymentState === PAYMENT_STATES.FAILED;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)]">
        {/* ─────────────────────────────────────────────────────────────
            REGION 1: FIXED HEADER (Always visible, never scrolls away)
        ────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div>
            <h2 id="booking-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Book Consultation with {advocateName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant slot confirmation • 1-on-1 consultation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 -mr-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            REGION 2: SCROLLING BODY (The ONLY part that scrolls)
        ────────────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {/* Confirmed / Pending / Failed State Views */}
          {paymentState === PAYMENT_STATES.CONFIRMING && (
            <div className="py-8 text-center space-y-3 bg-amber-50/50 rounded-2xl border border-amber-200/70 p-6">
              <FiRefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Bank is confirming. Do not pay again.</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Please do not refresh or close this window while we verify transaction status with your bank.
              </p>
            </div>
          )}

          {paymentState === PAYMENT_STATES.SUCCESS && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <FiCheck className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Booking confirmed! {advocateName} will contact you at{" "}
                  {selectedSlot ? formatSlotStartTime(selectedSlot.startAt) : ""}.
                </h3>
                {paymentResult?.booking?.bookingId && (
                  <p className="text-xs font-bold text-slate-700 mt-2 font-mono bg-slate-100 py-1 px-3 rounded-lg inline-block">
                    Booking ID: {paymentResult.booking.bookingId}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Total Paid: ₹{formatRupees(paymentResult?.amountRupees || totalPayable)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/bookings");
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                View My Bookings
              </button>
            </div>
          )}

          {paymentState === PAYMENT_STATES.FAILED && (
            <div className="py-6 text-center space-y-3 bg-red-50/70 rounded-2xl border border-red-200 p-5">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <FiAlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Payment failed. Your slot was released.</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {paymentError || "Transaction was cancelled or declined by your bank."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetPayment();
                  if (selectedDate) fetchBusySlots(selectedDate);
                }}
                className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Try Another Time Slot
              </button>
            </div>
          )}

          {/* Form Content (Active during normal booking flow) */}
          {!isOutcomeState && (
            <>
              {/* Slot Hold Countdown Bar */}
              {holdRemainingSeconds != null && (
                <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <FiClock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Slot held temporarily for:</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                    {formatTimer(holdRemainingSeconds)}
                  </span>
                </div>
              )}

              {/* Slot Taken or Error Banners */}
              {(slotTakenMessage || paymentError) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
                  <FiAlertCircle className="shrink-0 w-4 h-4 text-red-500" />
                  <span>{slotTakenMessage || paymentError}</span>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  1. CHOOSE THE DATE: DD/MM/YYYY input + Calendar Picker
              ────────────────────────────────────────────────────────── */}
              <section className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="booking-date-input"
                    className="text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    1. Choose the Date
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Range: {formatDDMMYYYY(todayIST)} – {formatDDMMYYYY(maxDateIST)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    ref={dateInputRef}
                    id="booking-date-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={dateInputValue}
                    onChange={handleDateInputChange}
                    onBlur={handleDateInputBlur}
                    placeholder="DD/MM/YYYY"
                    aria-invalid={Boolean(dateError) || undefined}
                    className={`w-full p-3 pr-11 rounded-2xl border text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      dateError
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                        : "border-slate-200 focus:ring-amber-500/20 focus:border-amber-500"
                    }`}
                  />

                  <button
                    ref={calendarBtnRef}
                    type="button"
                    onClick={() => {
                      updatePopoverPosition();
                      setIsCalendarOpen((prev) => !prev);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50/70 rounded-xl transition-colors cursor-pointer"
                    title="Open calendar"
                    aria-label="Open date calendar"
                  >
                    <FiCalendar className="w-4 h-4" />
                  </button>
                </div>

                {dateError && (
                  <p className="text-[11px] text-red-600 mt-1">{dateError}</p>
                )}

                {/* Portaled Calendar Popover: Never clipped by scrolling body */}
                {isCalendarOpen &&
                  ReactDOM.createPortal(
                    <div
                      ref={popoverRef}
                      style={popoverStyle}
                      className="w-[285px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 animate-in fade-in zoom-in-95 duration-150"
                    >
                      {/* Month Header & Bounded Navigation */}
                      <div className="flex items-center justify-between mb-2.5 px-1">
                        <span className="text-xs font-bold text-slate-900">
                          {calendarMonthLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            disabled={!canPrevMonth}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                            aria-label="Previous month"
                          >
                            <FiChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            disabled={!canNextMonth}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
                            aria-label="Next month"
                          >
                            <FiChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Day of Week Headers */}
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {WEEKDAY_NAMES.map((name) => (
                          <span key={name} className="text-[10px] font-semibold text-slate-400 py-0.5">
                            {name}
                          </span>
                        ))}
                      </div>

                      {/* Weeks Grid */}
                      <div className="space-y-1">
                        {calendarMatrix.map((week, wIdx) => (
                          <div key={wIdx} className="grid grid-cols-7 gap-1">
                            {week.map((item, dIdx) => {
                              if (!item) {
                                return <div key={`empty-${dIdx}`} className="h-7 w-full" />;
                              }

                              const { day, dateString } = item;
                              const isPast = dateString < todayIST;
                              const isBeyondRange = dateString > maxDateIST;
                              const isDisabled = isPast || isBeyondRange;
                              const isToday = dateString === todayIST;
                              const isSelected = dateString === selectedDate;

                              return (
                                <button
                                  key={dateString}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => handleSelectCalendarDate(dateString)}
                                  className={`relative h-7 w-full rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                                    isSelected
                                      ? "bg-amber-500 text-white font-bold shadow-xs scale-105"
                                      : isDisabled
                                      ? "text-slate-300 bg-transparent cursor-not-allowed"
                                      : isToday
                                      ? "text-amber-800 font-bold bg-amber-50 border border-amber-300 hover:bg-amber-100 cursor-pointer"
                                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                                  }`}
                                >
                                  <span>{day}</span>
                                  {isToday && !isSelected && (
                                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
              </section>

              {/* ─────────────────────────────────────────────────────────
                  2. CHOOSE THE TIME: Shows disabled row before date picked
              ────────────────────────────────────────────────────────── */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Choose the Time
                  </label>
                  {selectedDate ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {activeModeObj?.durationMinutes || 15}m session • IST
                      </span>
                      <button
                        type="button"
                        onClick={() => fetchBusySlots(selectedDate)}
                        disabled={loadingBusySlots}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded-md transition-colors cursor-pointer"
                        title="Refresh availability"
                      >
                        <FiRefreshCw className={`w-3.5 h-3.5 ${loadingBusySlots ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Select a date to see available times
                    </span>
                  )}
                </div>

                {!selectedDate ? (
                  /* Disabled slot strip preview before date is selected */
                  <div className="relative group">
                    <div
                      ref={slotScrollerRef}
                      onScroll={updateScrollIndicators}
                      tabIndex={0}
                      className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none rounded-xl"
                    >
                      {sampleSlotStartTimes.map((timeStr) => (
                        <button
                          key={timeStr}
                          type="button"
                          disabled
                          aria-disabled="true"
                          tabIndex={-1}
                          className="shrink-0 px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50 text-slate-400 text-xs font-semibold cursor-not-allowed select-none"
                        >
                          {timeStr}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {slotFetchError && (
                      <p className="text-[11px] text-red-500">{slotFetchError}</p>
                    )}

                    {loadingBusySlots && visibleSlots.length === 0 ? (
                      <div className="py-3 text-xs text-slate-400 flex items-center gap-2">
                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        Loading available times...
                      </div>
                    ) : visibleSlots.length === 0 ? (
                      /* Quiet normal line when no slots left */
                      <p className="text-xs text-slate-500 py-1">
                        No bookable slots remaining for this date. Please pick another date.
                      </p>
                    ) : (
                      /* Active Horizontal Slot Scroller */
                      <div className="relative group">
                        {canScrollLeft && (
                          <button
                            type="button"
                            onClick={() => handleScrollSlots("left")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all -ml-2 cursor-pointer"
                            aria-label="Scroll slots left"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                        )}

                        {canScrollLeft && (
                          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-5" />
                        )}

                        <div
                          ref={slotScrollerRef}
                          onScroll={updateScrollIndicators}
                          tabIndex={0}
                          className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none focus:outline-none focus:ring-1 focus:ring-amber-400/50 rounded-xl"
                        >
                          {visibleSlots.map((slot) => {
                            const isSelected = selectedSlot?.startAt === slot.startAt;
                            const startTimeOnly = formatSlotStartTime(slot.startAt);

                            /* 3. Booked Slots: Visibly marked with blocked marker & strike */
                            if (slot.isBusy) {
                              return (
                                <button
                                  key={slot.startAt}
                                  type="button"
                                  disabled
                                  aria-disabled="true"
                                  tabIndex={-1}
                                  title="Already booked"
                                  className="shrink-0 px-3.5 py-2 rounded-xl border border-slate-300/80 bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed select-none flex items-center gap-1.5 transition-colors"
                                >
                                  <FiSlash className="w-3 h-3 text-red-400 shrink-0 stroke-[2.5]" aria-hidden="true" />
                                  <span className="line-through">{startTimeOnly}</span>
                                </button>
                              );
                            }

                            return (
                              <button
                                key={slot.startAt}
                                type="button"
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setSlotTakenMessage("");
                                }}
                                className={`shrink-0 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                  isSelected
                                    ? "border-amber-500 bg-amber-500 text-white font-bold shadow-xs scale-[1.02]"
                                    : "border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 bg-white text-slate-800"
                                }`}
                              >
                                {startTimeOnly}
                              </button>
                            );
                          })}
                        </div>

                        {canScrollRight && (
                          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-5" />
                        )}

                        {canScrollRight && (
                          <button
                            type="button"
                            onClick={() => handleScrollSlots("right")}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all -mr-2 cursor-pointer"
                            aria-label="Scroll slots right"
                          >
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* ─────────────────────────────────────────────────────────
                  3. BRIEF NOTES (OPTIONAL)
              ────────────────────────────────────────────────────────── */}
              <section className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="booking-notes-input"
                    className="text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    3. Brief notes for advocate <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">{notes.length}/500</span>
                </div>

                <textarea
                  id="booking-notes-input"
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share any background details or questions to help the advocate prepare..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
                />
              </section>

              {/* ─────────────────────────────────────────────────────────
                  4. SUMMARY (NO SUBJECT ROW)
              ────────────────────────────────────────────────────────── */}
              <section className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  4. Summary
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 text-xs sm:text-sm">
                  {/* Advocate */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Advocate</span>
                    <span className="font-bold text-slate-900">{advocateName}</span>
                  </div>

                  {/* Mode confirmation with fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mode</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      {activeModeObj && React.createElement(getModeIcon(activeModeObj.mode), {
                        className: "w-3.5 h-3.5 text-amber-600",
                      })}
                      <span>{activeModeObj?.label || selectedMode}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        ({activeModeObj?.durationMinutes || 15}m)
                      </span>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Date & Time</span>
                    <span className="font-bold text-slate-900 text-right">
                      {selectedDate && selectedSlot
                        ? `${formatISTDateLong(selectedDate)} at ${formatSlotStartTime(selectedSlot.startAt)} IST`
                        : selectedDate
                        ? `${formatISTDateLong(selectedDate)} (Pick a time above)`
                        : "Select date and time"}
                    </span>
                  </div>
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────
                  5. PRICE BREAKDOWN (Format clean whole & 2-decimal numbers)
              ────────────────────────────────────────────────────────── */}
              <section className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  5. Price Breakdown
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{activeModeObj?.label} Fee</span>
                    <span className="font-semibold text-slate-900">
                      ₹{formatRupees(fee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">GST ({gstPercent}%)</span>
                    <span className="font-semibold text-slate-900">
                      ₹{formatRupees(gst)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Platform Fee</span>
                    <span className="font-semibold text-slate-900">
                      ₹{formatRupees(platformFee)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Total</span>
                    <span className="text-lg font-black text-slate-900">
                      ₹{formatRupees(totalPayable)}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            REGION 3: FIXED FOOTER (Pinned to bottom, Pay button always visible)
        ────────────────────────────────────────────────────────────── */}
        {!isOutcomeState && (
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-white shrink-0 space-y-2 shadow-xs">
            <button
              type="button"
              id="pay-advocate-booking-btn"
              disabled={isPayDisabled}
              onClick={() =>
                startPayment(
                  {
                    title: `Consultation with ${advocateName}`,
                    duration: activeModeObj?.durationMinutes || 15,
                  },
                  {
                    phoneNumber: currentUser?.phone || "",
                    email: currentUser?.email || "",
                  }
                )
              }
              className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all ${
                isPayDisabled
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.99] cursor-pointer"
              }`}
            >
              <FiLock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Opening Payment Window..."
                  : !selectedDate
                  ? `Select a date to Pay ₹${formatRupees(totalPayable)}`
                  : !selectedSlot
                  ? `Select a time slot to Pay ₹${formatRupees(totalPayable)}`
                  : `Pay ₹${formatRupees(totalPayable)}`}
              </span>
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <FiShield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>100% Secure 256-bit encrypted transaction via Razorpay</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
