import { useState } from "react";
import DetailItem from "./DetailItem";
import {
  getAdvocateName,
  getProfileUrl,
  getModeLabel,
  getModeIcon,
  formatDate,
  getTomorrowISO,
  handleReschedule,
  TIME_SLOTS,
  MODE_OPTIONS,
} from "@/utils/consultationHelpers";

/*
|--------------------------------------------------------------------------
| RESCHEDULE CONSULTATION (shared component)
|--------------------------------------------------------------------------
| Used from:
|   - pages/Bookings.jsx        (My Bookings → Active & Upcoming → Reschedule)
|   - Home/Dashboard             (Upcoming Consultation card → Reschedule)
|
| Both entry points render this exact component and pass the selected
| consultation/order as a prop — there is only ONE reschedule screen.
|
| Flow: form -> confirm -> success
|   form:    pick new date / time / mode (existing behavior, unchanged)
|   confirm: "Reschedule Consultation?" dialog before submitting
|   success: "Consultation Rescheduled" summary + Done
|
| No payment section anywhere in this component — the user already paid
| for the existing order, and this only updates date/time/mode on it.
|
| Props:
|   consultation  - the existing consultation/order object (already
|                    normalized: displayDate, displayTime, consultationMode,
|                    advocate, etc.)
|   onClose()     - called when the modal should close (Cancel, backdrop
|                    click, or "Done" after success)
|   onSuccess(updatedBooking) - called as soon as the reschedule succeeds,
|                    so the calling page (My Bookings or Home) can update
|                    its local list immediately. Does NOT close the modal
|                    by itself — the success step stays visible until the
|                    user taps "Done".
|--------------------------------------------------------------------------
*/

const RescheduleModal = ({ consultation, onClose, onSuccess }) => {
  const currentMode = consultation?.consultationMode;
  const preselectMode = ["video", "call", "in_person"].includes(currentMode) ? currentMode : "";

  const [step, setStep] = useState("form"); // 'form' | 'confirm' | 'success'
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMode, setSelectedMode] = useState(preselectMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const advocateName = getAdvocateName(consultation?.advocate);
  const minDate = getTomorrowISO();

  const canConfirm = Boolean(selectedDate && selectedTime && selectedMode);

  const handleGoToConfirm = () => {
    setError("");
    if (!selectedDate || !selectedTime || !selectedMode) {
      setError("Please select a date, time, and consultation mode.");
      return;
    }
    setStep("confirm");
  };

  const handleFinalConfirm = async () => {
    setError("");
    setLoading(true);

    try {
      const updatedBooking = await handleReschedule({
        orderId: consultation?._id,
        consultationId: consultation?._id,
        newDate: selectedDate,
        newTime: selectedTime,
        consultationMode: selectedMode,
      });

      setResult(updatedBooking);
      onSuccess(updatedBooking);
      setStep("success");
    } catch (err) {
      console.error("Reschedule error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={step === "confirm" ? undefined : onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            STEP 1: FORM
        ====================================================== */}
        {step === "form" && (
          <>
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Reschedule Consultation</h2>
                <p className="text-sm text-slate-500 mt-1">Choose a new date, time, and mode</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              {/* Advocate — read only, cannot be changed */}
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                  {getProfileUrl(consultation?.advocate) ? (
                    <img
                      src={getProfileUrl(consultation?.advocate)}
                      alt={advocateName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{advocateName}</h3>
                  <p className="text-sm text-slate-500">Advocate</p>
                </div>
              </div>

              {/* Current schedule */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Current Consultation
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <DetailItem icon="calendar_month" label="Date" value={consultation?.displayDate || "Date not available"} compact />
                  <DetailItem icon="schedule" label="Time" value={consultation?.displayTime || "Time not available"} compact />
                  <DetailItem icon="gavel" label="Type" value={consultation?.consultationType || "Legal Consultation"} compact />
                  <DetailItem icon={getModeIcon(currentMode)} label="Mode" value={getModeLabel(currentMode)} compact />
                </div>
              </div>

              {/* Select date */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Select New Date</h4>
                <input
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400"
                />
              </div>

              {/* Select time */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Select New Time</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedTime === time
                          ? "bg-amber-500 text-white border-amber-500 shadow-md"
                          : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select mode */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Consultation Mode</h4>
                <div className="space-y-2">
                  {MODE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedMode(option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        selectedMode === option.value
                          ? "bg-amber-50 border-amber-400 ring-1 ring-amber-300"
                          : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedMode === option.value ? "border-amber-500" : "border-slate-300"
                        }`}
                      >
                        {selectedMode === option.value && <span className="size-2 rounded-full bg-amber-500" />}
                      </span>
                      <span className="material-symbols-outlined text-slate-500 text-[20px]">{option.icon}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-800">{option.label}</span>
                        <span className="block text-xs text-slate-500">{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="flex gap-3 mt-7">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleGoToConfirm}
                  disabled={!canConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </>
        )}

        {/* =====================================================
            STEP 2: CONFIRM
        ====================================================== */}
        {step === "confirm" && (
          <div className="p-6">
            <div className="flex flex-col items-center text-center pt-2 pb-1">
              <div className="size-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-amber-500 text-3xl">event_repeat</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Reschedule Consultation?</h2>
              <p className="text-sm text-slate-500 mt-2">Your consultation will be moved to:</p>

              <div className="mt-4 w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3">
                <DetailItem icon="calendar_month" label="New Date" value={formatDate(selectedDate)} />
                <DetailItem icon="schedule" label="New Time" value={selectedTime} />
                <DetailItem icon={getModeIcon(selectedMode)} label="Mode" value={getModeLabel(selectedMode)} />
              </div>
            </div>

            {error && (
              <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-7">
              <button
                type="button"
                onClick={() => setStep("form")}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleFinalConfirm}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  "Confirm Reschedule"
                )}
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 3: SUCCESS
        ====================================================== */}
        {step === "success" && (
          <div className="p-6">
            <div className="flex flex-col items-center text-center pt-4 pb-2">
              <div className="size-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Consultation Rescheduled</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">
                Your consultation has been successfully rescheduled.
              </p>

              <div className="mt-6 w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3">
                <DetailItem icon="person" label="Advocate" value={advocateName} />
                <DetailItem icon="calendar_month" label="Date" value={result?.displayDate || formatDate(selectedDate)} />
                <DetailItem icon="schedule" label="Time" value={result?.displayTime || selectedTime} />
                <DetailItem icon={getModeIcon(selectedMode)} label="Mode" value={getModeLabel(selectedMode)} />
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-7 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RescheduleModal;
