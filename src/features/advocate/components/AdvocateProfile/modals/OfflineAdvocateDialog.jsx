import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { FiUserX } from "react-icons/fi";

export default function OfflineAdvocateDialog({
  isOpen,
  onClose,
  onBookExpert,
  advocateName,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = advocateName || "This advocate";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-advocate-dialog-title"
    >
      {/* Dimmed backdrop with soft blur */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Premium modal card surface */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl shadow-slate-950/20 border border-slate-200/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close (X) button anchored in top-right corner */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 h-9 w-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer z-10"
        >
          <IoClose className="text-xl" />
        </button>

        {/* Centered Modal Content with generous breathing room */}
        <div className="px-6 py-8 sm:px-8 sm:py-9 flex flex-col items-center text-center">
          {/* Centered soft-tinted offline icon badge */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 shadow-xs mb-5 shrink-0">
            <FiUserX className="h-6 w-6 text-amber-600" aria-hidden="true" />
          </div>

          {/* Strong, confident centered heading */}
          <h3
            id="offline-advocate-dialog-title"
            className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mb-2.5"
          >
            Advocate Offline
          </h3>

          {/* Centered explanation in a comfortable reading width */}
          <p className="max-w-xs sm:max-w-sm text-sm sm:text-[15px] text-slate-500 leading-relaxed mb-7">
            {displayName} is currently offline. Would you like to book a consultation with our Consultant Team instead?
          </p>

          {/* Centered actions: Amber primary focal point + Quiet ghost secondary */}
          <div className="flex flex-col sm:flex-row-reverse items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              id="offline-dialog-book-expert-btn"
              onClick={onBookExpert}
              className="w-full sm:w-auto px-6 h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer shrink-0"
            >
              Book Expert Consultation
            </button>
            <button
              type="button"
              id="offline-dialog-not-now-btn"
              onClick={onClose}
              className="w-full sm:w-auto px-5 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 active:bg-slate-200/60 font-medium text-sm transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer shrink-0"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
