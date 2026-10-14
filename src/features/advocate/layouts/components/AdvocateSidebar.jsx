import {
  CalendarDays,
  CheckCircle2,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Scale,
  Settings,
  UserRound,
  UserRoundPlus,
} from "lucide-react";

const cleanText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const getAdvocateName = (advocate) =>
  cleanText(advocate?.fullName) ||
  cleanText(advocate?.name) ||
  "Advocate";

const getInitials = (name) => {
  const parts = cleanText(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "AD";
  }

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

/* =========================================================
   AVATAR
========================================================= */

const AdvocateAvatar = ({
  advocate,
}) => {
  const name =
    getAdvocateName(advocate);

  const photo =
    advocate?.profilePhotoUrl ||
    advocate?.profileImage ||
    advocate?.avatar ||
    "";

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-xs font-extrabold text-amber-400">
      {getInitials(name)}
    </div>
  );
};

/* =========================================================
   SIDEBAR
========================================================= */

export default function AdvocateSidebar({
  advocate,
  currentPath,
  mobile = false,
  onNavigate,
  onLogout,
}) {
  const navigation = [
    {
      label: "Dashboard",
      path: "/advocate/dashboard",
      Icon: LayoutDashboard,
    },
    {
      label: "Bookings",
      path: "/advocate/bookings",
      Icon: CalendarDays,
    },
    {
      label: "Messages",
      path: "/advocate/messages",
      Icon: MessageSquare,
    },
    {
      label: "My Team",
      path: "/advocate/team",
      Icon: UserRoundPlus,
    },
    {
      label: "Profile",
      path: "/advocate/profile",
      Icon: UserRound,
    },
    {
      label: "Account Settings",
      path: "/advocate/account-settings",
      Icon: Settings,
    },
  ];

  /* =======================================================
     ACTIVE ROUTE
  ======================================================= */

  const isItemActive = (
    item,
  ) => {
    if (!currentPath) {
      return false;
    }

    if (
      item.path ===
      "/advocate/dashboard"
    ) {
      return (
        currentPath ===
        "/advocate/dashboard"
      );
    }

    return (
      currentPath === item.path ||
      currentPath.startsWith(
        `${item.path}/`,
      )
    );
  };

  /* =======================================================
     NAVIGATE
  ======================================================= */

  const handleNavigation = (
    path,
  ) => {
    if (
      typeof onNavigate ===
      "function"
    ) {
      onNavigate(path);
    }
  };

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-slate-950 text-white"
          : "fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col bg-slate-950 text-white lg:flex"
      }
    >
      {/* ===================================================
          BRAND
      =================================================== */}

      <div className="flex h-[76px] shrink-0 items-center border-b border-white/[0.06] px-4">
        <button
          type="button"
          onClick={() =>
            handleNavigation(
              "/advocate/dashboard",
            )
          }
          className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10">
            <Scale
              size={21}
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold tracking-tight text-white">
              Vakeel
              <span className="text-amber-400">
                Setu
              </span>
            </p>

            <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
              Advocate Workspace
            </p>
          </div>
        </button>
      </div>

      {/* ===================================================
          ADVOCATE PROFILE
      =================================================== */}

      <div className="px-3 pt-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-3">
          <div className="flex min-w-0 items-center gap-3">
            <AdvocateAvatar
              advocate={advocate}
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {getAdvocateName(
                  advocate,
                )}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />

                <span className="truncate text-[11px] font-medium text-slate-400">
                  Advocate Account
                </span>
              </div>
            </div>

            <CheckCircle2
              size={17}
              className="shrink-0 text-amber-400"
            />
          </div>
        </div>
      </div>

      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {navigation.map(
          (item) => {
            const active =
              isItemActive(item);

            const Icon =
              item.Icon;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() =>
                  handleNavigation(
                    item.path,
                  )
                }
                className={`group relative flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute -left-3 h-6 w-[3px] rounded-r-full bg-amber-400" />
                )}

                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    active
                      ? "text-amber-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />

                <span className="truncate">
                  {item.label}
                </span>
              </button>
            );
          },
        )}
      </nav>

      {/* ===================================================
          MEMBERSHIP / PRICING
      =================================================== */}

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() =>
            handleNavigation(
              "/advocate/pricing",
            )
          }
          className={`group w-full rounded-2xl border p-3.5 text-left transition-all ${
            currentPath ===
            "/advocate/pricing"
              ? "border-amber-400/30 bg-amber-500/10"
              : "border-white/[0.07] bg-white/[0.05] hover:bg-white/[0.075]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Crown
              size={17}
              className="shrink-0 text-amber-400"
            />

            <p className="text-sm font-bold text-white">
              Membership & Pricing
            </p>
          </div>

          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            Manage consultation pricing
            and professional services.
          </p>

          <div className="mt-3 rounded-xl bg-amber-500 px-3 py-2.5 text-center text-xs font-extrabold text-slate-950 transition-colors group-hover:bg-amber-400">
            Manage Pricing
          </div>
        </button>
      </div>

      {/* ===================================================
          LOGOUT
      =================================================== */}

      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut
            size={18}
            className="shrink-0"
          />

          Logout
        </button>
      </div>
    </aside>
  );
}