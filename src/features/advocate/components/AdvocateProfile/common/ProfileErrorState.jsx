import React from "react";

/**
 * Shown when the advocate could not be resolved. Same card either way — only
 * the heading, message and whether a "Try Again" action is offered differ,
 * depending on whether this was a genuine 404 or a network/API failure.
 */
export default function ProfileErrorState({ fetchError, onBack, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center bg-white p-10 sm:p-12 rounded-lg border border-slate-200 shadow-sm max-w-md">
        <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-5">
          <span className="material-symbols-outlined text-3xl text-slate-400">
            {fetchError ? "wifi_off" : "person_off"}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {fetchError ? "Couldn't Load This Profile" : "Advocate Not Found"}
        </h2>

        <p className="text-slate-500 mb-6">
          {fetchError || "The profile you're looking for doesn't exist."}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Go Back
          </button>

          {fetchError && (
            <button
              onClick={onRetry}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
