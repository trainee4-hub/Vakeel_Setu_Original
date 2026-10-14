export default function DashboardErrorState({ message, onRetry }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-slate-50">
        <span className="material-symbols-outlined text-3xl text-slate-400">
          wifi_off
        </span>
      </div>

      <h2 className="mb-2 text-xl font-bold text-slate-950">
        Couldn't load your consultations
      </h2>

      <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500">
        {message || "Please check your connection and try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600"
      >
        Try again
      </button>
    </div>
  );
}
