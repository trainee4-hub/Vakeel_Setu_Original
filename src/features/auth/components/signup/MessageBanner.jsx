import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

/**
 * MessageBanner
 * -----------------------------------------------------------------------
 * Reusable inline banner for the signup flow (and reusable elsewhere).
 * Three variants only — kept intentionally small and consistent rather
 * than a generic toast system, since every error in the spec is shown
 * inline near the relevant step/field.
 *
 * variant: "error" | "warning" | "success"
 * action: optional { label, onClick }
 */
export default function MessageBanner({
  variant = "error",
  title,
  message,
  action,
  className = "",
}) {
  const styles = {
    error: {
      wrap: "bg-red-50 border-red-200",
      icon: "text-red-500",
      title: "text-red-800",
      message: "text-red-700",
      action:
        "text-red-800 hover:text-red-900 border-red-300 hover:bg-red-100",
      Icon: FaExclamationCircle,
    },

    warning: {
      wrap: "bg-amber-50 border-amber-200",
      icon: "text-amber-500",
      title: "text-amber-800",
      message: "text-amber-700",
      action:
        "text-amber-800 hover:text-amber-900 border-amber-300 hover:bg-amber-100",
      Icon: FaExclamationTriangle,
    },

    success: {
      wrap: "bg-emerald-50 border-emerald-200",
      icon: "text-emerald-500",
      title: "text-emerald-800",
      message: "text-emerald-700",
      action:
        "text-emerald-800 hover:text-emerald-900 border-emerald-300 hover:bg-emerald-100",
      Icon: FaCheckCircle,
    },
  };

  const s = styles[variant] || styles.error;
  const Icon = s.Icon;

  if (!title && !message) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border ${s.wrap} px-4 py-3 ${className}`}
    >
      <Icon
        className={`mt-0.5 shrink-0 text-[20px] ${s.icon}`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        {title && (
          <p className={`text-sm font-semibold ${s.title}`}>
            {title}
          </p>
        )}

        {message && (
          <p className={`mt-0.5 text-sm ${s.message}`}>
            {message}
          </p>
        )}

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`mt-2 inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${s.action}`}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Small inline success line for compact confirmations like
 * "Email verified" next to a field.
 */
export function InlineSuccess({
  text,
  className = "",
}) {
  if (!text) return null;

  return (
    <p
      className={`flex items-center gap-1.5 text-sm font-medium text-emerald-600 ${className}`}
    >
      <FaCheckCircle
        className="shrink-0 text-[16px]"
        aria-hidden="true"
      />

      {text}
    </p>
  );
}

/**
 * Field-level error line, for validation messages under a single input.
 */
export function FieldError({
  text,
  className = "",
}) {
  if (!text) return null;

  return (
    <p
      className={`mt-1 flex items-center gap-1 text-xs font-medium text-red-600 ${className}`}
    >
      <FaExclamationCircle
        className="shrink-0 text-[14px]"
        aria-hidden="true"
      />

      {text}
    </p>
  );
}