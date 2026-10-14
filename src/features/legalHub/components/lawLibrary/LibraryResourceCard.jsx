import React from "react";
import { Link } from "react-router-dom";

import {
  FaBookOpen,
  FaFileContract,
  FaGavel,
  FaLandmark,
  FaScaleBalanced,
} from "react-icons/fa6";

import {
  FiArrowRight,
  FiBook,
  FiFileText,
} from "react-icons/fi";

/**
 * Maps the existing Material Symbol icon names from the resource data
 * to React Icons.
 *
 * This allows the existing resource data structure to remain unchanged.
 */
const ICON_MAP = {
  // Bare Acts / Statutes
  menu_book: FaBookOpen,
  book: FaBookOpen,
  library_books: FiBook,

  // Judgments
  gavel: FaGavel,

  // Agreements / Contracts
  contract: FaFileContract,
  description: FiFileText,

  // Areas of Law
  balance: FaScaleBalanced,

  // Rules / Regulations
  rule: FiFileText,

  // Government / Legal Forms
  assignment: FiFileText,
  article: FiFileText,

  // Law Commission Reports
  summarize: FiFileText,
  report: FiFileText,

  // Dictionary
  dictionary: FiBook,

  // Courts / Institutions
  account_balance: FaLandmark,
};

/**
 * One card shape for every library.
 * Enabled cards navigate; future ones show a Coming Soon chip
 * instead of a fabricated count.
 */
export default function LibraryResourceCard({
  resource,
  count,
  countLoading,
}) {
  const {
    title,
    description,
    metricLabel,
    icon,
    enabled,
    path,
  } = resource;

  /*
   * If an icon name isn't present in ICON_MAP,
   * use a safe default React Icon.
   */
  const ResourceIcon = ICON_MAP[icon] || FaBookOpen;

  const shell =
    "group flex h-full flex-col rounded-2xl border bg-white p-6 transition-all duration-300 focus:outline-none";

  const interactive = enabled
    ? "cursor-pointer border-slate-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
    : "border-slate-200/70";

  const body = (
    <>
      {/* Icon + Status */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            enabled
              ? "bg-amber-50 text-amber-600"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          <ResourceIcon
            className="text-[22px]"
            aria-hidden="true"
          />
        </div>

        {!enabled && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Coming Soon
          </span>
        )}
      </div>

      {/* Count */}
      <div className="mt-5">
        {enabled ? (
          countLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            count !== null && (
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {count.toLocaleString("en-IN")}+
              </p>
            )
          )
        ) : null}

        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
          {metricLabel}
        </p>
      </div>

      {/* Title */}
      <h3
        className={`mt-3 font-bold leading-6 ${
          enabled
            ? "text-slate-900 transition-colors group-hover:text-amber-600"
            : "text-slate-700"
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      {/* Explore */}
      {enabled && (
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-amber-600 transition-all group-hover:gap-2.5">
          Explore

          <FiArrowRight
            className="text-base"
            aria-hidden="true"
          />
        </span>
      )}
    </>
  );

  if (!enabled) {
    return (
      <article
        aria-disabled="true"
        className={`${shell} ${interactive}`}
      >
        {body}
      </article>
    );
  }

  return (
    <Link
      to={path}
      aria-label={`Explore ${title}`}
      className={`${shell} ${interactive}`}
    >
      {body}
    </Link>
  );
}