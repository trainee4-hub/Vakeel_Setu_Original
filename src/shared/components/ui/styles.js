/* Shared Tailwind class helpers (kept out of .jsx so Fast Refresh stays component-only). */

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS = {
  primary: "bg-amber-500 text-slate-950 shadow-sm hover:bg-amber-600 focus-visible:ring-amber-500",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
};

export function buttonClass(variant = "primary", extra = "") {
  return `${BASE} ${VARIANTS[variant] ?? VARIANTS.primary} ${extra}`;
}

const INPUT_BASE =
  "block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50";

export function fieldClass(hasError) {
  return `${INPUT_BASE} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-amber-400 focus:ring-amber-500/10"
  }`;
}

export function describedBy(id, { error, hint } = {}) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

