import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { FiUserX } from "react-icons/fi";

export default function OfflineAdvocateDialog({
  isOpen,
  onClose,
  onBookExpert,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-advocate-dialog-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 z-10"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <FiUserX className="size-5" />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="size-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <IoClose className="text-lg" />
            </button>
          </div>

          <h3
            id="offline-advocate-dialog-title"
            className="text-lg font-bold text-slate-900 leading-snug mb-2"
          >
            Advocate Offline
          </h3>

          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            This advocate is currently offline.
            <br />
            Would you like to book a consultation with our Expert Consultant instead?
          </p>

          <div className="flex flex-col sm:flex-row-reverse items-center gap-3">
            <button
              type="button"
              id="offline-dialog-book-expert-btn"
              onClick={onBookExpert}
              className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-colors text-center"
            >
              Book Expert Consultation
            </button>
            <button
              type="button"
              id="offline-dialog-not-now-btn"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-sm transition-colors text-center"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
