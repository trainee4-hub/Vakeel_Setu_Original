import React, { useState } from "react";

import {
  FaBalanceScale,
  FaCity,
  FaExclamationCircle,
  FaGavel,
  FaLandmark,
  FaMapPin,
  FaStar,
} from "react-icons/fa";

import {
  FaCheck,
  FaLocationDot,
} from "react-icons/fa6";

import { IoChevronDown } from "react-icons/io5";

import { CATEGORY_OPTIONS } from "@/constants/categories";
import FilterSection from "./FilterSection";

import {
  FILTER_INPUT_CLASS,
  INDIAN_STATES,
  RATING_OPTIONS,
  experienceOptions,
  isValidPincode,
} from "../utils/findLawyerUtils";

const FilterSidebar = ({
  showMobileFilters,
  filters,
  setFilters,
  selectedExperienceRange,
  handleExperienceChange,
  handleResetFilters,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <aside
      className={`
        w-full
        lg:w-[300px]
        xl:w-[320px]
        shrink-0
        lg:sticky
        lg:top-24
        self-start
        ${showMobileFilters ? "block" : "hidden lg:block"}
      `}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Filters
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Refine your search
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-bold text-amber-600 transition-all hover:text-amber-700 hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="custom-scrollbar -mr-6 max-h-[calc(100vh-190px)] space-y-7 overflow-y-auto pr-6">
          {/* =====================================================
              EXPERIENCE
          ====================================================== */}

          <FilterSection title="Experience">
            <div className="flex flex-wrap gap-2">
              {experienceOptions.map((option) => {
                const isSelected =
                  selectedExperienceRange === option.label;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() =>
                      handleExperienceChange(option)
                    }
                    className={`
                      px-3
                      py-1.5
                      rounded-lg
                      text-[11px]
                      font-bold
                      border
                      transition-all
                      duration-200
                      ${
                        isSelected
                          ? "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/20"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* =====================================================
              STATE
          ====================================================== */}

          <FilterSection title="State">
            <div className="relative">
              <FaLocationDot
                className="absolute left-3.5 top-1/2 z-20 -translate-y-1/2 pointer-events-none text-[17px] text-slate-400"
                aria-hidden="true"
              />

              <button
                type="button"
                id="advocate-state"
                onClick={() =>
                  setOpenDropdown((previous) =>
                    previous === "state" ? null : "state",
                  )
                }
                className="relative flex w-full h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-left text-[13px] font-semibold text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                aria-haspopup="listbox"
                aria-expanded={openDropdown === "state"}
              >
                <span
                  className={
                    filters.state
                      ? "text-slate-700"
                      : "text-slate-400"
                  }
                >
                  {filters.state || "All States"}
                </span>

                <IoChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[19px] text-slate-400 transition-transform duration-200 ${
                    openDropdown === "state"
                      ? "rotate-180 text-amber-500"
                      : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === "state" && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_15px_40px_rgba(15,23,42,0.14)] animate-in fade-in slide-in-from-top-1 duration-150">
                  <div
                    className="max-h-64 overflow-y-auto p-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
                    role="listbox"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={!filters.state}
                      onClick={() => {
                        setFilters((previous) => ({
                          ...previous,
                          state: "",
                        }));

                        setOpenDropdown(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-all duration-150 ${
                        !filters.state
                          ? "bg-amber-50 font-bold text-amber-700"
                          : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>All States</span>

                      {!filters.state && (
                        <FaCheck className="text-[14px] text-amber-600" />
                      )}
                    </button>

                    <div className="my-1.5 h-px bg-slate-100" />

                    {INDIAN_STATES.map((stateName) => {
                      const isSelected =
                        filters.state === stateName;

                      return (
                        <button
                          key={stateName}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setFilters((previous) => ({
                              ...previous,
                              state: stateName,
                            }));

                            setOpenDropdown(null);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-all duration-150 ${
                            isSelected
                              ? "bg-amber-50 font-bold text-amber-700"
                              : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{stateName}</span>

                          {isSelected && (
                            <FaCheck className="text-[14px] text-amber-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </FilterSection>

          {/* =====================================================
              CITY
          ====================================================== */}

          <FilterSection title="City">
            <div className="relative">
              <FaCity className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-slate-400" />

              <input
                type="text"
                value={filters.city}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    city: event.target.value,
                  }))
                }
                placeholder="Enter city"
                className={`${FILTER_INPUT_CLASS} pl-10`}
              />
            </div>
          </FilterSection>

          {/* =====================================================
              NEAR PINCODE
          ====================================================== */}

          <FilterSection title="Near Pincode">
            <div className="relative">
              <FaMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-slate-400" />

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={filters.pincode}
                onChange={(event) => {
                  const digitsOnly = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setFilters((previous) => ({
                    ...previous,
                    pincode: digitsOnly,
                  }));
                }}
                placeholder="Enter 6-digit pincode"
                className={`
                  ${FILTER_INPUT_CLASS}
                  pl-10
                  ${
                    filters.pincode &&
                    !isValidPincode(filters.pincode)
                      ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500/10"
                      : ""
                  }
                `}
              />
            </div>

            {filters.pincode &&
              !isValidPincode(filters.pincode) && (
                <div className="mt-2 flex items-start gap-1.5">
                  <FaExclamationCircle className="mt-0.5 shrink-0 text-[15px] text-red-500" />

                  <p className="text-[11px] leading-4 font-medium text-red-500">
                    Enter all 6 digits to search by nearby location.
                  </p>
                </div>
              )}
          </FilterSection>

          {/* =====================================================
              SPECIALTY
          ====================================================== */}

          <FilterSection title="Specialty">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((category) => {
                const isSelected =
                  filters.practiceArea === category.value;

                return (
                  <button
                    type="button"
                    key={category.value}
                    onClick={() =>
                      setFilters((previous) => ({
                        ...previous,
                        practiceArea: isSelected
                          ? ""
                          : category.value,
                      }))
                    }
                    className={`
                      px-3
                      py-1.5
                      rounded-full
                      text-[11px]
                      font-bold
                      border
                      transition-all
                      ${
                        isSelected
                          ? "bg-amber-100 border-amber-200 text-amber-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600"
                      }
                    `}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* =====================================================
              BEST PRACTICE AREA
          ====================================================== */}

          <FilterSection title="Best Practice Area">
            <div className="relative">
              <FaGavel
                className="absolute left-3.5 top-1/2 z-20 -translate-y-1/2 pointer-events-none text-[17px] text-slate-400"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((previous) =>
                    previous === "bestPracticeArea"
                      ? null
                      : "bestPracticeArea",
                  )
                }
                className="relative flex w-full h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-left text-[13px] font-semibold text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                aria-haspopup="listbox"
                aria-expanded={
                  openDropdown === "bestPracticeArea"
                }
              >
                <span
                  className={
                    filters.bestPracticeArea
                      ? "text-slate-700"
                      : "text-slate-400"
                  }
                >
                  {filters.bestPracticeArea
                    ? CATEGORY_OPTIONS.find(
                        (category) =>
                          category.value ===
                          filters.bestPracticeArea,
                      )?.label || filters.bestPracticeArea
                    : "Any Practice Area"}
                </span>

                <IoChevronDown
                  className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[19px] text-slate-400 transition-transform duration-200 ${
                    openDropdown === "bestPracticeArea"
                      ? "rotate-180 text-amber-500"
                      : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === "bestPracticeArea" && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_15px_40px_rgba(15,23,42,0.14)]">
                  <div
                    className="max-h-64 overflow-y-auto p-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
                    role="listbox"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={
                        !filters.bestPracticeArea
                      }
                      onClick={() => {
                        setFilters((previous) => ({
                          ...previous,
                          bestPracticeArea: "",
                        }));

                        setOpenDropdown(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-all duration-150 ${
                        !filters.bestPracticeArea
                          ? "bg-amber-50 font-bold text-amber-700"
                          : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>Any Practice Area</span>

                      {!filters.bestPracticeArea && (
                        <FaCheck className="text-[14px] text-amber-600" />
                      )}
                    </button>

                    <div className="my-1.5 h-px bg-slate-100" />

                    {CATEGORY_OPTIONS.map((category) => {
                      const isSelected =
                        filters.bestPracticeArea ===
                        category.value;

                      return (
                        <button
                          key={category.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setFilters((previous) => ({
                              ...previous,
                              bestPracticeArea:
                                category.value,
                            }));

                            setOpenDropdown(null);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-all duration-150 ${
                            isSelected
                              ? "bg-amber-50 font-bold text-amber-700"
                              : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{category.label}</span>

                          {isSelected && (
                            <FaCheck className="text-[14px] text-amber-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </FilterSection>

          {/* =====================================================
              TOP COURT PRACTISED
          ====================================================== */}

          <FilterSection title="Top Court Practised">
            <div className="relative">
              <FaLandmark className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-slate-400" />

              <input
                type="text"
                value={filters.topCourtPractised}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    topCourtPractised: event.target.value,
                  }))
                }
                placeholder="e.g. Supreme Court of India"
                className={`${FILTER_INPUT_CLASS} pl-10`}
              />
            </div>
          </FilterSection>

          {/* =====================================================
              PRACTISED COURT
          ====================================================== */}

          <FilterSection title="Practised Court">
            <div className="relative">
              <FaBalanceScale className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-slate-400" />

              <input
                type="text"
                value={filters.courtPractice}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    courtPractice: event.target.value,
                  }))
                }
                placeholder="e.g. Bombay High Court"
                className={`${FILTER_INPUT_CLASS} pl-10`}
              />
            </div>
          </FilterSection>

          {/* =====================================================
              MINIMUM RATING
          ====================================================== */}

          <FilterSection title="Minimum Rating">
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.label}
                  onClick={() =>
                    setFilters((previous) => ({
                      ...previous,
                      rating: option.value,
                    }))
                  }
                  className={`
                    px-3
                    py-1.5
                    rounded-lg
                    text-[11px]
                    font-bold
                    border
                    transition-all
                    ${
                      filters.rating === option.value
                        ? "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600"
                    }
                  `}
                >
                  {option.label !== "Any" && (
                    <FaStar className="mr-0.5 inline-block text-[12px] align-middle" />
                  )}

                  {option.label}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;