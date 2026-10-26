import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiLock,
  FiPhone,
  FiVideo,
  FiBriefcase,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  getAdvocateBusySlots,
  getAdvocateBookingQuote,
  createAdvocateCheckout,
  verifyAdvocatePayment,
  getAdvocateCheckoutStatus,
} from "../../../services/advocateBookingApi";
import {
  generateAdvocateSlots,
  groupAdvocateSlots,
  getAvailableDatesList,
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

export default function AdvocateBookingModal({
  isOpen,
  onClose,
  advocate,
  bookingOptions,
  initialMode,
  currentUser,
}) {
  const navigate = useNavigate();

  // Wizard Steps: 1: Mode, 2: Date, 3: Time, 4: Subject, 5: Review, 6: Payment
  const [step, setStep] = useState(1);

  // Selections
  const [selectedMode, setSelectedMode] = useState(initialMode || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); // { startAt, endAt, label, startEpochMs }
  const [selectedSubject, setSelectedSubject] = useState("");
  const [notes, setNotes] = useState("");

  // Slot generation & busy intervals state
  const [busySlots, setBusySlots] = useState([]);
  const [loadingBusySlots, setLoadingBusySlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  // Quote state
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  // Hold Timer state
  const [checkoutData, setCheckoutData] = useState(null);
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(null);
  const holdIntervalRef = useRef(null);

  const advocateId = advocate?.id || advocate?._id;
  const advocateName = advocate?.fullName || advocate?.personalDetails?.fullName || "Advocate";
  const modes = useMemo(() => (Array.isArray(bookingOptions?.modes) ? bookingOptions.modes : []), [bookingOptions]);
  const subjects = useMemo(() => (Array.isArray(bookingOptions?.subjects) ? bookingOptions.subjects : []), [bookingOptions]);
  const maxDaysAhead = bookingOptions?.maxDaysAhead ?? 30;
  const minLeadMinutes = bookingOptions?.minLeadMinutes ?? 15;

  // Sync mode if initialMode changes
  useEffect(() => {
    if (initialMode && modes.some((m) => m.mode === initialMode)) {
      setSelectedMode(initialMode);
    } else if (modes.length > 0 && !selectedMode) {
      setSelectedMode(modes[0].mode);
    }
  }, [initialMode, modes, selectedMode]);

  // Current active mode details
  const activeModeObj = useMemo(
    () => modes.find((m) => m.mode === selectedMode) || modes[0] || null,
    [modes, selectedMode]
  );

  // Available dates list (Asia/Kolkata calendar)
  const availableDates = useMemo(
    () => getAvailableDatesList(maxDaysAhead),
    [maxDaysAhead]
  );

  // Set default date to today or tomorrow if none selected
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0].dateString);
    }
  }, [selectedDate, availableDates]);

  // Fetch busy slots whenever date or advocate changes
  const fetchBusySlots = useCallback(async (dateStr) => {
    if (!advocateId || !dateStr) return;
    setLoadingBusySlots(true);
    setSlotError("");
    try {
      const res = await getAdvocateBusySlots(advocateId, dateStr);
      if (res && Array.isArray(res.busy)) {
        setBusySlots(res.busy);
      } else {
        setBusySlots([]);
      }
    } catch (err) {
      console.error("Failed to fetch busy slots:", err);
      setSlotError("Could not refresh real-time availability. Please try again.");
    } finally {
      setLoadingBusySlots(false);
    }
  }, [advocateId]);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchBusySlots(selectedDate);
    }
  }, [isOpen, selectedDate, fetchBusySlots]);

  // Generate slots in IST
  const rawSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateAdvocateSlots({
      dateString: selectedDate,
      durationMinutes: activeModeObj?.durationMinutes || 15,
      busySlots,
      minLeadMinutes,
      currentEpochMs: Date.now(),
    });
  }, [selectedDate, activeModeObj, busySlots, minLeadMinutes]);

  const groupedSlots = useMemo(() => groupAdvocateSlots(rawSlots), [rawSlots]);

  // Clear selected slot if mode or date changes and slot is no longer valid
  useEffect(() => {
    if (selectedSlot && (!selectedSlot.startAt.startsWith(selectedDate) || selectedSlot.disabled)) {
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedSlot]);

  // Fetch Quote when entering Review (step 5) or Payment (step 6)
  const fetchQuote = useCallback(async () => {
    if (!advocateId || !selectedMode || !selectedSlot?.startAt) return;
    setLoadingQuote(true);
    setQuoteError("");
    try {
      const res = await getAdvocateBookingQuote(advocateId, {
        mode: selectedMode,
        startAt: selectedSlot.startAt,
      });
      if (res && res.breakdown) {
        setQuote(res);
      } else {
        setQuoteError("Failed to retrieve price breakdown.");
      }
    } catch (err) {
      console.error("Error fetching quote:", err);
      const msg = err?.data?.message || err?.message || "Unable to get quote. Please try another slot.";
      setQuoteError(msg);
    } finally {
      setLoadingQuote(false);
    }
  }, [advocateId, selectedMode, selectedSlot]);

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
        // Hold lapsed: send user back to slot selection
        alert("Your slot hold has expired. Please select a time slot again.");
        setCheckoutData(null);
        setStep(3);
        fetchBusySlots(selectedDate);
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
      // Re-verify busy slots immediately before opening payment
      const freshBusyRes = await getAdvocateBusySlots(advocateId, selectedDate);
      const isStillAvailable = !(freshBusyRes?.busy || []).some((b) => {
        const busyStart = Date.parse(b.startAt);
        const busyEnd = Date.parse(b.endAt);
        return selectedSlot.startEpochMs < busyEnd && selectedSlot.endEpochMs > busyStart;
      });

      if (!isStillAvailable) {
        const slotErr = new Error("This slot was just booked. Please pick another time.");
        slotErr.code = "SLOT_TAKEN";
        throw slotErr;
      }

      const res = await createAdvocateCheckout({
        advocateId,
        mode: selectedMode,
        startAt: selectedSlot.startAt,
        subject: selectedSubject,
        notes: notes.trim() || undefined,
      });

      const co = res?.checkout || res;
      setCheckoutData(co);
      return co;
    },
    onVerifyPayment: async (verifyPayload) => {
      // Strict snake_case keys only
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

  // Reset wizard on modal open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedSlot(null);
      setSelectedSubject(subjects[0] || "");
      setNotes("");
      setQuote(null);
      setCheckoutData(null);
      resetPayment();
    }
  }, [isOpen, subjects, resetPayment]);

  if (!isOpen || advocate?.isOnline === false) return null;

  // Step Nav validation
  const canProceedFromStep = (s) => {
    if (s === 1) return Boolean(selectedMode);
    if (s === 2) return Boolean(selectedDate);
    if (s === 3) return Boolean(selectedSlot && !selectedSlot.disabled);
    if (s === 4) return Boolean(selectedSubject);
    if (s === 5) return Boolean(selectedMode && selectedDate && selectedSlot && selectedSubject);
    return true;
  };

  const handleNext = async () => {
    if (step === 3) {
      // Refresh busy slots on advancing past slot step
      await fetchBusySlots(selectedDate);
    }
    if (step === 4) {
      // Fetch quote before review step
      await fetchQuote();
    }
    if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // Format hold remaining timer string (MM:SS)
  const formatTimer = (sec) => {
    if (sec == null) return "10:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            {step > 1 && paymentState === PAYMENT_STATES.IDLE && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 -ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Back"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 id="booking-modal-title" className="text-lg font-bold text-slate-900 leading-tight">
                Book Consultation with {advocateName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Step {step} of 6 — {
                  step === 1 ? "Confirm Mode" :
                  step === 2 ? "Select Date" :
                  step === 3 ? "Pick Time Slot" :
                  step === 4 ? "Consultation Details" :
                  step === 5 ? "Review & Confirm" : "Payment"
                }
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={paymentState === PAYMENT_STATES.STARTING || paymentState === PAYMENT_STATES.CONFIRMING}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-amber-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[calc(85vh-160px)] overflow-y-auto">
          {/* ================= STEP 1: MODE ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Consultation Mode</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  You have chosen the following mode for your consultation with {advocateName}.
                </p>
              </div>

              {activeModeObj ? (
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500/20">
                  <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                    {React.createElement(getModeIcon(activeModeObj.mode), { className: "w-6 h-6" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-base">{activeModeObj.label}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {activeModeObj.durationMinutes} mins
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Professional 1-on-1 legal advice
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">
                      ₹{Number(activeModeObj.fee).toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-slate-400">Fee</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ================= STEP 2: DATE ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Choose Appointment Date</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available up to {maxDaysAhead} days ahead. Past dates are blocked.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.dateString;
                  return (
                    <button
                      key={item.dateString}
                      type="button"
                      onClick={() => setSelectedDate(item.dateString)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500 text-white shadow-sm font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <p className={`text-xs ${isSelected ? "text-amber-100" : "text-slate-400"}`}>
                        {item.isToday ? "Today" : item.display.split(",")[0]}
                      </p>
                      <p className="text-sm font-bold mt-0.5">
                        {item.display.split(",")[1] || item.display}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STEP 3: TIME SLOTS ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Select Time Slot ({activeModeObj?.durationMinutes || 15} mins)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Operating window: 10:00 AM – 6:00 PM IST (Lunch break: 1:00 PM – 2:00 PM)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchBusySlots(selectedDate)}
                  disabled={loadingBusySlots}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold py-1 px-2.5 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${loadingBusySlots ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              {slotError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <FiAlertCircle className="shrink-0 w-4 h-4" />
                  <span>{slotError}</span>
                </div>
              )}

              {loadingBusySlots && rawSlots.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                  Loading available time slots...
                </div>
              ) : (
                <div className="space-y-4">
                  {["Morning", "Afternoon", "Evening"].map((period) => {
                    const periodSlots = groupedSlots[period] || [];
                    if (periodSlots.length === 0) return null;

                    return (
                      <div key={period} className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {period}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {periodSlots.map((slot) => {
                            const isSelected = selectedSlot?.startAt === slot.startAt;
                            return (
                              <button
                                key={slot.startAt}
                                type="button"
                                disabled={slot.disabled}
                                onClick={() => setSelectedSlot(slot)}
                                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? "border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-500"
                                    : slot.disabled
                                    ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                                }`}
                              >
                                <span className="text-xs font-semibold">{slot.label}</span>
                                {slot.isBusy ? (
                                  <span className="text-[10px] text-red-400 font-medium">Booked</span>
                                ) : slot.isPastOrLead ? (
                                  <span className="text-[10px] text-slate-300">Passed</span>
                                ) : isSelected ? (
                                  <FiCheck className="w-4 h-4 text-amber-600" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 4: SUBJECT ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">What is this consultation regarding?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a legal subject and provide brief background notes.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Subject Matter <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setSelectedSubject(subj)}
                      className={`p-2.5 rounded-xl border text-xs text-center font-medium transition-all ${
                        selectedSubject === subj
                          ? "border-amber-500 bg-amber-500 text-white font-bold"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Brief Notes for Advocate (Optional)
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your legal matter or questions to help the advocate prepare..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 text-right mt-1">{notes.length}/500</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 5: REVIEW ================= */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Review Booking Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your appointment schedule before continuing to payment.
                </p>
              </div>

              {quoteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <FiAlertCircle className="shrink-0 w-4 h-4" />
                  <span>{quoteError}</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Advocate</span>
                  <span className="text-sm font-bold text-slate-900">{advocateName}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Mode</span>
                  <span className="text-sm font-bold text-slate-900">{activeModeObj?.label}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Date & Time</span>
                  <span className="text-sm font-bold text-slate-900 text-right">
                    {selectedSlot?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Subject</span>
                  <span className="text-sm font-bold text-slate-900">{selectedSubject}</span>
                </div>
                {notes && (
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block mb-1">Notes:</span>
                    <p className="bg-white p-2.5 rounded-lg border border-slate-200">{notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 6: PAYMENT ================= */}
          {step === 6 && (
            <div>
              {/* Confirming State */}
              {paymentState === PAYMENT_STATES.CONFIRMING && (
                <div className="py-10 text-center space-y-3">
                  <FiRefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900">Bank is confirming. Do not pay again.</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Please do not refresh or navigate away while we verify payment status with your bank.
                  </p>
                </div>
              )}

              {/* Success Outcome */}
              {paymentState === PAYMENT_STATES.SUCCESS && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <FiCheck className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      Booking confirmed! {advocateName} will contact you at {selectedSlot?.label}.
                    </h3>
                    {paymentResult?.booking?.bookingId && (
                      <p className="text-sm font-bold text-slate-700 mt-2 font-mono">
                        Booking ID: {paymentResult.booking.bookingId}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Total Paid: ₹{Number(paymentResult?.amountRupees || (quote?.breakdown?.total ?? 0)).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/bookings");
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-all"
                  >
                    View My Bookings
                  </button>
                </div>
              )}

              {/* Failed Outcome */}
              {paymentState === PAYMENT_STATES.FAILED && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <FiAlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Payment failed. Your slot was released.</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {paymentError || "Transaction was cancelled or declined by your bank."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetPayment();
                      setStep(3);
                      fetchBusySlots(selectedDate);
                    }}
                    className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
                  >
                    Pick Another Time Slot
                  </button>
                </div>
              )}

              {/* Ready to Pay / Processing Summary */}
              {paymentState !== PAYMENT_STATES.CONFIRMING &&
                paymentState !== PAYMENT_STATES.SUCCESS &&
                paymentState !== PAYMENT_STATES.FAILED && (
                  <div className="space-y-4">
                    {/* 10-Minute Hold Countdown Bar */}
                    {holdRemainingSeconds != null && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                          <FiClock className="w-4 h-4 text-amber-600" />
                          <span>Slot held temporarily for:</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-md border border-amber-300">
                          {formatTimer(holdRemainingSeconds)}
                        </span>
                      </div>
                    )}

                    {paymentError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <FiAlertCircle className="shrink-0 w-4 h-4" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Breakdown Verbatim from Quote */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Payment Summary
                      </p>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{activeModeObj?.label} Fee</span>
                        <span className="font-semibold text-slate-900">
                          ₹{Number(quote?.breakdown?.fee ?? activeModeObj?.fee ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">GST {quote?.breakdown?.gstPercent ?? 18}%</span>
                        <span className="font-semibold text-slate-900">
                          ₹{Number(quote?.breakdown?.gst ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Platform Fee</span>
                        <span className="font-semibold text-slate-900">
                          ₹{Number(quote?.breakdown?.platformFee ?? 25).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-base font-bold text-slate-900">Total Payable</span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{Number(quote?.breakdown?.total ?? activeModeObj?.total ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="button"
                      id="pay-advocate-booking-btn"
                      disabled={paymentState !== PAYMENT_STATES.IDLE || loadingQuote}
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
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all ${
                        paymentState !== PAYMENT_STATES.IDLE || loadingQuote
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.99]"
                      }`}
                    >
                      <FiLock className="w-4 h-4" />
                      <span>
                        {paymentState === PAYMENT_STATES.STARTING
                          ? "Opening Payment Window..."
                          : `Pay ₹${Number(quote?.breakdown?.total ?? activeModeObj?.total ?? 0).toLocaleString("en-IN")}`}
                      </span>
                    </button>

                    <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <FiShield className="w-3.5 h-3.5 text-emerald-500" />
                      100% Secure 256-bit encrypted test transaction
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 6 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {step === 1 ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={!canProceedFromStep(1) || loadingQuote}
                  onClick={handleNext}
                  className={`flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    !canProceedFromStep(1) || loadingQuote
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-amber-500 hover:bg-amber-600 text-white active:scale-95"
                  }`}
                >
                  <span>Continue</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors py-0.5"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={!canProceedFromStep(step) || loadingQuote}
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    !canProceedFromStep(step) || loadingQuote
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-amber-500 hover:bg-amber-600 text-white active:scale-95"
                  }`}
                >
                  <span>{step === 5 ? "Proceed to Payment" : "Continue"}</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
