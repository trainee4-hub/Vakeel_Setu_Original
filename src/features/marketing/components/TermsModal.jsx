import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import TermsAndConditionsContent from "./TermsAndConditionsContent";

const TermsModal = ({ isOpen, onClose }) => {
  // Close on Escape key, lock body scroll, and block copy/print/save keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      // Block Ctrl/Cmd + C (Copy), Ctrl/Cmd + P (Print), Ctrl/Cmd + S (Save), Ctrl/Cmd + A (Select All), Ctrl/Cmd + U (Source)
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (
        isCmdOrCtrl &&
        ["c", "C", "p", "P", "s", "S", "a", "A", "u", "U"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-heading"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none"
      }}
    >
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog in the center */}
      <div
        className="relative z-10 flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple clean Header without print or download options */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0">
          <span
            id="terms-modal-heading"
            className="text-sm sm:text-base font-bold text-slate-900 truncate"
          >
            Terms and conditions of Vakeel Setu legal tech platform
          </span>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors ml-4 shrink-0"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Scrollable exact PDF content with copy restriction */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12 sm:py-10 bg-white">
          <TermsAndConditionsContent />
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
