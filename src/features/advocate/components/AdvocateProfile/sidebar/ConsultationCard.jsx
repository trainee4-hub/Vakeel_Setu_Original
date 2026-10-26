import { forwardRef } from "react";
import {
  FiVideo,
  FiPhone,
  FiBriefcase,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";

function formatDurationLabel(minutes) {
  if (!minutes) return "";
  if (minutes === 60) return "1 hour";
  if (minutes > 60 && minutes % 60 === 0) return `${minutes / 60} hours`;
  return `${minutes} min`;
}

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

function getModeColors(mode, isSelected) {
  switch (mode) {
    case "VIDEO_CALL":
      return {
        border: isSelected ? "border-amber-500 bg-amber-50/70" : "border-slate-200 hover:border-amber-300",
        iconBg: "bg-amber-100 text-amber-600",
        dot: isSelected ? "bg-amber-600" : "border-2 border-slate-300 bg-white",
      };
    case "IN_PERSON":
      return {
        border: isSelected ? "border-emerald-500 bg-emerald-50/70" : "border-slate-200 hover:border-emerald-300",
        iconBg: "bg-emerald-100 text-emerald-600",
        dot: isSelected ? "bg-emerald-600" : "border-2 border-slate-300 bg-white",
      };
    case "VOICE_CALL":
    default:
      return {
        border: isSelected ? "border-sky-500 bg-sky-50/70" : "border-slate-200 hover:border-sky-300",
        iconBg: "bg-sky-100 text-sky-600",
        dot: isSelected ? "bg-sky-600" : "border-2 border-slate-300 bg-white",
      };
  }
}

const ConsultationCard = forwardRef(function ConsultationCard(
  {
    highlight,
    selectedMode,
    onSelectMode,
    bookingOptions,
    isOnline = false,
    loading = false,
    onProceed,
  },
  ref,
) {
  const isBookable = bookingOptions?.bookable !== false;
  const modes = Array.isArray(bookingOptions?.modes) ? bookingOptions.modes : [];
  const currentMode = modes.find((m) => m.mode === selectedMode) || modes[0] || null;

  return (
    <div
      ref={ref}
      className={`bg-white p-6 rounded-2xl border shadow-sm transition-all duration-500 ${
        highlight
          ? "border-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.15),0_0_24px_rgba(245,158,11,0.3)]"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900">
          Consult Now
        </h3>
        {isBookable && (
          isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Currently Offline
            </span>
          )
        )}
      </div>

      {/* Consultation Fee Display */}
      <div className="mb-5 pb-5 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Consultation Fee
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentMode?.fee != null
              ? `₹${Number(currentMode.fee).toLocaleString("en-IN")}`
              : "—"}
          </span>

          {currentMode?.durationMinutes && (
            <span className="text-sm font-medium text-slate-500">
              / {formatDurationLabel(currentMode.durationMinutes)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Taxes & platform fee computed at checkout
        </p>
      </div>

      {/* Dynamic Modes List from API */}
      {!isBookable || modes.length === 0 ? (
        <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-slate-200 text-center mb-5">
          <FiAlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Booking Not Available</p>
          <p className="text-xs text-slate-500 mt-0.5">
            This advocate is not accepting direct bookings at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 mb-5" role="radiogroup" aria-label="Consultation Mode">
          {modes.map((modeItem) => {
            const isSelected = selectedMode === modeItem.mode;
            const Icon = getModeIcon(modeItem.mode);
            const colors = getModeColors(modeItem.mode, isSelected);

            return (
              <label
                key={modeItem.mode}
                onClick={() => onSelectMode(modeItem.mode)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${colors.border}`}
              >
                <input
                  type="radio"
                  name="consultationMode"
                  value={modeItem.mode}
                  checked={isSelected}
                  onChange={() => onSelectMode(modeItem.mode)}
                  className="sr-only"
                />

                {/* Custom Radio Dot */}
                <span
                  className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${colors.dot}`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </span>

                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${colors.iconBg}`}>
                  <Icon className="text-lg" aria-hidden="true" />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm leading-tight">
                    {modeItem.label}
                  </p>
                  {/* <p className="text-xs text-slate-500 mt-0.5">
                    {formatDurationLabel(modeItem.durationMinutes)} session
                  </p> */}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ₹{Number(modeItem.fee).toLocaleString("en-IN")}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Booking Button */}
      <button
        type="button"
        id="proceed-to-booking-btn"
        onClick={onProceed}
        disabled={!isBookable || modes.length === 0 || loading}
        className={`w-full h-12 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
          !isBookable || modes.length === 0 || loading
            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            : "bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.99]"
        }`}
      >
        <span>Proceed to Booking</span>
        <FiArrowRight className="text-lg" aria-hidden="true" />
      </button>
    </div>
  );
});

export default ConsultationCard;