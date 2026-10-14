import React, { useState } from "react";
import useFindLawyer from "./hooks/useFindLawyer";
import FilterSidebar from "./filters/FilterSidebar";
import SearchHeader from "./SearchHeader";
import ResultsToolbar from "./ResultsToolbar";
import AdvocateResults from "./AdvocateResults";
import Pagination from "./Pagination";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";
import EmptyState from "./states/EmptyState";

const FindLawyer = ({ onViewAdvocate, initialSpecialty = "" }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    visibleAdvocates,
    loading,
    error,
    filters,
    setFilters,
    tempFilters,
    setTempFilters,
    selectedExperienceRange,
    currentPage,
    setCurrentPage,
    totalCount,
    totalPages,
    fetchAdvocates,
    handleSearch,
    handleExperienceChange,
    handleResetFilters,
  } = useFindLawyer({ initialSpecialty });

  return (
    <div className="min-h-screen bg-[#FAFAF9] pt-8 font-sans text-slate-600 selection:bg-amber-100 selection:text-amber-900">
      <div className="mx-auto max-w-[1400px] px-6 pb-14 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 shadow-sm lg:hidden"
            onClick={() =>
              setShowMobileFilters((previous) => !previous)
            }
          >
            <span className="material-symbols-outlined">filter_list</span>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <FilterSidebar
            showMobileFilters={showMobileFilters}
            filters={filters}
            setFilters={setFilters}
            selectedExperienceRange={selectedExperienceRange}
            handleExperienceChange={handleExperienceChange}
            handleResetFilters={handleResetFilters}
          />

          <main className="w-full min-w-0 flex-1">
            <SearchHeader
              tempFilters={tempFilters}
              setTempFilters={setTempFilters}
              handleSearch={handleSearch}
            />

            <ResultsToolbar
              totalCount={totalCount}
              filters={filters}
              setFilters={setFilters}
            />

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onRetry={() => fetchAdvocates()} />
            ) : visibleAdvocates.length === 0 ? (
              <EmptyState onReset={handleResetFilters} />
            ) : (
              <>
                <AdvocateResults
                  advocates={visibleAdvocates}
                  filters={filters}
                  onViewAdvocate={onViewAdvocate}
                />

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }

        .fill-1 {
          font-variation-settings:
            'FILL' 1,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default FindLawyer;
