import {
  Bell,
  Menu,
  Scale,
} from "lucide-react";

export default function AdvocateMobileHeader({
  onMenu,
  onNotifications,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="Open advocate navigation"
      >
        <Menu size={21} />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
          <Scale size={19} />
        </div>

        <span className="text-sm font-extrabold tracking-tight text-slate-950">
          Vakeel<span className="text-amber-500">Setu</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onNotifications}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell size={19} />

        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
      </button>
    </header>
  );
}