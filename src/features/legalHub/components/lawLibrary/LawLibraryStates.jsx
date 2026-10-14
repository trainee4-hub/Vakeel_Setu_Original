import React from "react";
import {
  FiAlertCircle,
  FiRefreshCw,
  FiBookOpen,
  FiBook,
  FiFileText,
  FiFolder,
  FiSearch,
  FiInbox,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

/* =========================================================
   EMPTY STATE ICON MAP
   Keeps existing string-based icon prop working.
========================================================= */
const EMPTY_ICON_MAP = {
  menu_book: FiBookOpen,
  book: FiBook,
  description: FiFileText,
  folder: FiFolder,
  search: FiSearch,
  inbox: FiInbox,
  error: FiAlertCircle,
};

/* =========================================================
   SKELETON
========================================================= */
export function LawLibrarySkeleton({
  count = 6,
  variant = "card",
}) {
  const shell =
    variant === "row"
      ? "h-[76px] rounded-xl"
      : "h-[150px] rounded-2xl";

  return (
    <div
      className={
        variant === "row"
          ? "animate-pulse space-y-3"
          : "grid animate-pulse gap-5 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${shell} border border-slate-200 bg-white`}
        />
      ))}
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */
export function LawLibraryError({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <FiAlertCircle className="text-[22px]" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {message || "Something went wrong."}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Please try again.
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          <FiRefreshCw className="text-base" />
          Retry
        </button>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */
export function LawLibraryEmpty({
  icon = "menu_book",
  title,
  message,
  action,
}) {
  const EmptyIcon = EMPTY_ICON_MAP[icon] || FiBookOpen;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        <EmptyIcon className="text-[22px]" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      {message && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {message}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */
export function Pagination({
  pagination,
  onChange,
  disabled,
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const { page, totalPages } = pagination;

  const button = (
    Icon,
    label,
    targetPage,
    isDisabled,
    iconLast = false,
  ) => (
    <button
      type="button"
      onClick={() => onChange(targetPage)}
      disabled={disabled || isDisabled}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
    >
      {!iconLast && (
        <Icon className="shrink-0 text-base" />
      )}

      {label}

      {iconLast && (
        <Icon className="shrink-0 text-base" />
      )}
    </button>
  );

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
    >
      {button(
        FiChevronLeft,
        "Previous",
        page - 1,
        page <= 1,
        false,
      )}

      <span className="px-2 text-sm font-bold text-slate-600">
        Page {page} of {totalPages}
      </span>

      {button(
        FiChevronRight,
        "Next",
        page + 1,
        page >= totalPages,
        true,
      )}
    </nav>
  );
}