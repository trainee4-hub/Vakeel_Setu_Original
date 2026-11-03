import React from "react";
import { FiSliders } from "react-icons/fi";

import {
  SORT_OPTIONS,
  isValidPincode,
} from "./utils/findLawyerUtils";

const ResultsToolbar = ({
  totalCount,
  onlineCount = 0,
  filters,
  setFilters,
}) => {
  const sortingDisabled = isValidPincode(filters.pincode);

  return (
    <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap">
      <div>
        <p className="text-sm font-medium text-slate-500">
          <span className="font-bold text-slate-900">
            {filters.onlyOnline ? onlineCount : totalCount}
          </span>{" "}
          {filters.onlyOnline ? "Online Advocates Found" : "Advocates "}
        </p>
      </div>

      {/* Online Advocates Toggle Strip */}
      <div
        role="tablist"
        aria-label="Filter advocates by availability"
        className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!filters.onlyOnline}
          onClick={() =>
            setFilters((previous) => ({
              ...previous,
              onlyOnline: false,
            }))
          }
          className={`flex items-center rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
            !filters.onlyOnline
              ? "bg-emerald-600/90 text-slate-900 shadow-sm shadow-slate-200/60"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>All</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={Boolean(filters.onlyOnline)}
          onClick={() =>
            setFilters((previous) => ({
              ...previous,
              onlyOnline: !previous.onlyOnline,
            }))
          }
          className={`group flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
            filters.onlyOnline
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${
                filters.onlyOnline ? "animate-ping opacity-75" : "opacity-40"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                filters.onlyOnline ? "bg-white" : "bg-emerald-500"
              }`}
            />
          </span>
          <span>Online Now</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
              filters.onlyOnline
                ? "bg-emerald-700/70 text-white"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
            }`}
          >
            {onlineCount}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <FiSliders
          className="shrink-0 text-[18px] text-slate-400"
          aria-hidden="true"
        />

        <label
          htmlFor="advocate-sort"
          className="whitespace-nowrap text-xs font-bold text-slate-500"
        >
          Sort By
        </label>

        <select
          id="advocate-sort"
          value={filters.sort}
          disabled={sortingDisabled}
          onChange={(event) =>
            setFilters((previous) => ({
              ...previous,
              sort: event.target.value,
            }))
          }
          className={`
            h-11
            min-w-[190px]
            px-3.5
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            text-[13px]
            font-semibold
            text-slate-700
            shadow-sm
            outline-none
            transition-all
            duration-200
            appearance-none
            hover:border-slate-300
            focus:border-amber-400
            focus:bg-white
            focus:ring-4
            focus:ring-amber-500/10
            ${
              sortingDisabled
                ? "cursor-not-allowed bg-slate-100 text-slate-400 opacity-70"
                : "cursor-pointer"
            }
          `}
          title={
            sortingDisabled
              ? "Sorting by distance from your pincode"
              : "Sort advocates"
          }
        >
          {SORT_OPTIONS.map((option) => (
            <option
              key={option.label}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default ResultsToolbar;