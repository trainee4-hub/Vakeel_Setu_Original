import React from "react";
import { formatStepperDuration } from "../../../utils/advocateSlotUtils";

/**
 * Premium Compact Pill Duration Stepper (+15 / -15)
 * Sleek, modern, and perfectly responsive across sidebar cards and modal dialogs.
 */
export default function DurationStepper({
  durationMinutes = 15,
  onIncrease,
  onDecrease,
  canIncrease = true,
  canDecrease = true,
  increaseTitle = "Add 15 minutes",
  decreaseTitle = "Reduce 15 minutes",
  className = "",
}) {
  return (
    <div
      className={`inline-flex items-center  sm:gap-1.5 p-1 rounded-full bg-slate-100/90 border border-slate-200 shadow-2xs select-none shrink-0 ${className}`}
      role="group"
      aria-label="Adjust consultation duration"
    >
      {/* Decrease Button */}
      <button
        type="button"
        disabled={!canDecrease}
        onClick={onDecrease}
        title={decreaseTitle}
        aria-label="Reduce duration by 15 minutes"
        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:active:scale-100 cursor-pointer"
      >
        <span className="text-sm sm:text-base font-black leading-none select-none">−</span>
      </button>

      {/* Duration Label */}
      <span className=" tracking-tighter sm:px-1 text-xs sm:text-sm font-bold text-slate-900 tabular-nums whitespace-nowrap text-center">
        {formatStepperDuration(durationMinutes)}
      </span>

      {/* Increase Button */}
      <button
        type="button"
        disabled={!canIncrease}
        onClick={onIncrease}
        title={increaseTitle}
        aria-label="Extend duration by 15 minutes"
        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95 bg-amber-500 text-white hover:bg-amber-600 shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-amber-500 disabled:active:scale-100 cursor-pointer"
      >
        <span className="text-sm sm:text-base font-black leading-none select-none">+</span>
      </button>
    </div>
  );
}
