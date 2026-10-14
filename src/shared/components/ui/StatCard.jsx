import { Link } from "react-router-dom";
import { Icon } from "./Button";

/** Shows a real total when `count` is a number; otherwise "Manage". */
export default function StatCard({ to, icon, label, caption, count }) {
  const hasCount = typeof count === "number" && Number.isFinite(count);
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-amber-50 group-hover:text-amber-600">
          <Icon name={icon} className="text-[22px]" />
        </div>
        <Icon name="arrow_outward" className="text-[18px] text-slate-300 transition group-hover:text-amber-500" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-950">
        {hasCount ? count.toLocaleString("en-IN") : <span className="text-lg text-slate-700">Manage</span>}
      </p>
      <p className="mt-1 text-xs text-slate-400">{caption}</p>
    </Link>
  );
}
