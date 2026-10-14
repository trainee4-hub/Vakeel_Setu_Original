import React from "react";

const EmptyState = ({ onReset }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative mx-auto mb-8 h-28 w-28">
            <div className="absolute inset-0 rounded-[32px] border border-amber-100 bg-amber-50/70" />

            <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-[0_8px_25px_rgba(15,23,42,0.08)]">
              <span
                className="material-symbols-outlined text-[38px] text-amber-500"
                aria-hidden="true"
              >
                person_search
              </span>
            </div>

            <div className="absolute -right-1 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-md">
              <span
                className="material-symbols-outlined text-[16px]"
                aria-hidden="true"
              >
                search
              </span>
            </div>

            <span
              className="absolute bottom-1 left-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white"
              aria-hidden="true"
            />
          </div>

          <div className="mb-3 flex items-center justify-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
              No Matching Results
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
              aria-hidden="true"
            />
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            We couldn't find the right advocate
          </h3>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
            No advocates currently match all of your selected criteria. Try
            broadening your search or removing some filters to see more available
            advocates.
          </p>

          <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-3 text-left sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Broaden your filters
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  Try removing experience, rating or location filters.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">
                  location_on
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Try another location
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                  Search in a nearby city or state for more results.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:translate-y-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                restart_alt
              </span>
              Clear All Filters
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Start New Search
            </button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-slate-400">
              info
            </span>
            <p className="text-[11px] font-medium text-slate-400">
              You can always refine your search again after viewing results.
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
};

export default EmptyState;
