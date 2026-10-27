import React from "react";
import { Phone } from "lucide-react";

/**
 * Standardized call button across Advocate Dashboard, My Bookings, and Messages.
 * - Displays an accessible, pressable phone call action
 * - Initiates direct phone dialer via tel:
 * - Stops click event propagation so parent rows/cards do not activate
 */
export default function CallPhoneButton({ phone, clientName, size = "md", className = "" }) {
  if (!phone) return null;
  const sizeClasses = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const iconSize = size === "lg" ? 15 : 12;

  return (
    <a
      href={`tel:${phone}`}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Call ${clientName || "client"} at ${phone}`}
      title={`Call ${clientName || "client"} at ${phone}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 shadow-xs transition hover:border-green-400 hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/25 active:scale-95 ${sizeClasses} ${className}`}
    >
      <Phone size={iconSize} className="shrink-0" />
    </a>
  );
}
