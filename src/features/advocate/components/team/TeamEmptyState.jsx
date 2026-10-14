import { FiUserPlus, FiUsers } from "react-icons/fi";

export default function TeamEmptyState({ onAdd }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-600">
        <FiUsers className="text-[22px]" />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-950">
        Build your legal team
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Search an advocate by BAR Council ID and add trusted colleagues to your
        professional team.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        <FiUserPlus className="shrink-0 text-[16px]" />
        Add Team Mate
      </button>
    </div>
  );
}