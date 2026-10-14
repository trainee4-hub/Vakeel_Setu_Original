import React from "react";
import {
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex justify-center">
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {/* Previous */}
        <button
          type="button"
          onClick={() =>
            setCurrentPage((previous) =>
              Math.max(previous - 1, 1),
            )
          }
          disabled={currentPage === 1}
          className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 1
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <IoChevronBack className="text-sm" />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).map(
          (_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                type="button"
                key={pageNumber}
                onClick={() =>
                  setCurrentPage(pageNumber)
                }
                className={`size-10 rounded-lg text-sm font-bold transition-all ${
                  currentPage === pageNumber
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {pageNumber}
              </button>
            );
          },
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() =>
            setCurrentPage((previous) =>
              Math.min(previous + 1, totalPages),
            )
          }
          disabled={currentPage === totalPages}
          className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === totalPages
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <IoChevronForward className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;