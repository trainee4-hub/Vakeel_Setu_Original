import React from "react";

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-50">
        <span className="material-symbols-outlined text-4xl text-red-300">
          error_outline
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold text-slate-900">
        Couldn't load advocates
      </h3>

      <p className="mx-auto mb-8 max-w-xs text-slate-500">{error}</p>

      <button
        type="button"
        onClick={onRetry}
        className="px-8 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState;
