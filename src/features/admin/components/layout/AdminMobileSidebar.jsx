import { useEffect, useRef } from "react";
import { Icon } from "@shared/components/ui/Button";
import AdminSidebar from "./AdminSidebar";

/** Off-canvas navigation below the lg breakpoint. */
export default function AdminMobileSidebar({ open, onClose, user, onSignOut, signingOut }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div id="admin-mobile-sidebar" className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-5 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Icon name="close" className="text-[22px]" />
        </button>
        <AdminSidebar user={user} onNavigate={onClose} onSignOut={onSignOut} signingOut={signingOut} />
      </div>
    </div>
  );
}
