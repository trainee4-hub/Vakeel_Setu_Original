import React from "react";
import { FiSliders } from "react-icons/fi";

import {
  SORT_OPTIONS,
  isValidPincode,
} from "./utils/findLawyerUtils";

const ResultsToolbar = ({
  totalCount,
  filters,
  setFilters,
}) => {
  const sortingDisabled = isValidPincode(filters.pincode);

  return (
    <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">
          <span className="font-bold text-slate-900">
            {totalCount}
          </span>{" "}
          Advocates Found
        </p>
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