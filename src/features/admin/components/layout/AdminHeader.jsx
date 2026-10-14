import { Icon } from "@shared/components/ui/Button";
import { getDisplayRole } from "../../utils/adminUtils";

export default function AdminHeader({ title, user, drawerOpen, onOpenMenu }) {
  const roleLabel = getDisplayRole(user);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        aria-expanded={drawerOpen}
        aria-controls="admin-mobile-sidebar"
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 lg:hidden"
      >
        <Icon name="menu" className="text-[24px]" />
      </button>

      <p className="flex-1 truncate text-sm font-semibold text-slate-900">
        <span className="lg:hidden">{roleLabel} · </span>
        {title}
      </p>

      <div className="hidden items-center gap-3 text-right sm:flex">
        <div className="leading-tight">
          <p className="text-sm font-medium text-slate-900">{user?.fullName || roleLabel}</p>
          {user?.email ? <p className="text-xs text-slate-500">{user.email}</p> : null}
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          {roleLabel}
        </span>
      </div>
    </header>
  );
}
