import React from "react";
import { Phone } from "lucide-react";

/**
 * Standardized call button across Advocate Dashboard, My Bookings, and Messages.
 * - Displays an accessible, pressable phone call action
 * - Initiates direct phone dialer via tel:
 * - Stops click event propagation so parent rows/cards do not activate
 */
export default function CallPhoneButton({
  phone,
  clientName,
  size = "md",
  className = "",
}) {
  if (!phone) return null;

  const sizeClasses = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-8 w-8 rounded-xl",
    lg: "h-9 w-9 rounded-xl",
  }[size] || "h-8 w-8 rounded-xl";

  const iconSize = {
    sm: 13,
    md: 14,
    lg: 16,
  }[size] || 14;

  return (
    <a
      href={`tel:${phone}`}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Call ${clientName || "client"} at ${phone}`}
      title={`Call ${clientName || "client"} at ${phone}`}
      className={`inline-flex shrink-0 items-center justify-center border border-amber-300/90 bg-amber-50 text-amber-700 shadow-2xs transition-all duration-150 hover:scale-105 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/25 active:scale-95 ${sizeClasses} ${className}`}
    >
      <Phone size={iconSize} className="shrink-0" />
    </a>
  );
}
