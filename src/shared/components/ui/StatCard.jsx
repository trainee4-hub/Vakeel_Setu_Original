import { Link } from "react-router-dom";
import { Icon } from "./Button";

const TONE_STYLES = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200/80",
  amber: "bg-amber-50 text-amber-600 ring-amber-200/80",
  rose: "bg-rose-50 text-rose-600 ring-rose-200/80",
  blue: "bg-blue-50 text-blue-600 ring-blue-200/80",
  violet: "bg-violet-50 text-violet-600 ring-violet-200/80",
  orange: "bg-orange-50 text-orange-600 ring-orange-200/80",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200/80",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-200/80",
  sky: "bg-sky-50 text-sky-600 ring-sky-200/80",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-200/80",
};

/** Shows a real total when `count` is a number; otherwise "Manage". */
export default function StatCard({ to, icon, label, caption, count, tone = "slate" }) {
  const hasCount = typeof count === "number" && Number.isFinite(count);
  const iconTone = TONE_STYLES[tone] || TONE_STYLES.slate;

  return (
    <Link
      to={to}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105 ${iconTone}`}>
          <Icon name={icon} filled className="text-[22px]" />
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-600">
          <Icon name="arrow_outward" className="text-[16px]" />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-slate-950">
          {hasCount ? count.toLocaleString("en-IN") : <span className="text-lg font-semibold text-slate-700">Manage</span>}
        </p>
        <p className="mt-1 text-xs text-slate-500">{caption}</p>
      </div>
    </Link>
  );
}
