import React from "react";
import { FiSliders } from "react-icons/fi";

import { SORT_OPTIONS } from "./utils/findLawyerUtils";

const ResultsToolbar = ({
  totalCount,
  onlineCount = 0,
  filters,
  setFilters,
}) => {
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

      {/* Online Advocates Toggle Strip - Fixed dimensions to eliminate layout shifts */}
      <div
        role="tablist"
        aria-label="Filter advocates by availability"
        className="inline-flex items-center h-10 rounded-xl border border-slate-200/90 bg-slate-100/90 p-1 gap-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] box-border"
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
          className={`h-8 px-4 rounded-lg text-xs font-bold transition-colors duration-150 inline-flex items-center justify-center shrink-0 ${
            !filters.onlyOnline
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
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
          className={`group h-8 px-3.5 rounded-lg text-xs font-bold transition-colors duration-150 inline-flex items-center justify-center gap-2 shrink-0 ${
            filters.onlyOnline
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
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
            className={`h-5 min-w-[20px] px-1.5 inline-flex items-center justify-center text-[10px] font-bold rounded-md border box-border ${
              filters.onlyOnline
                ? "bg-emerald-700/80 text-white border-emerald-500/40"
                : "bg-emerald-50 text-emerald-700 border-emerald-200/80"
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
          value={filters.sort || ""}
          disabled={false}
          onChange={(event) =>
            setFilters((previous) => ({
              ...previous,
              sort: event.target.value,
            }))
          }
          className="
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
            cursor-pointer
            hover:border-slate-300
            focus:border-amber-400
            focus:bg-white
            focus:ring-4
            focus:ring-amber-500/10
          "
          title="Sort advocates"
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
