import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "@shared/components/ui/Button";
import useAdminAuth from "../../hooks/useAdminAuth";
import { getDisplayRole } from "../../utils/adminUtils";
import { ADMIN_NAV_GROUPS, initialsOf } from "./navigation";

export default function AdminSidebar({ user, onNavigate, onSignOut, signingOut = false }) {
  const { has } = useAdminAuth();
  const location = useLocation();
  const name = user?.fullName || "Admin";

  const visibleGroups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => has(item.permissions)),
  })).filter((group) => group.items.length > 0);

  // Check if current route is inside a group's items
  const isGroupActive = (group) =>
    group.items.some(
      (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    );

  // Open state for collapsible groups
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    ADMIN_NAV_GROUPS.forEach((group, idx) => {
      if (group.collapsible) {
        const key = group.title || `group-${idx}`;
        const hasActive = group.items.some(
          (item) =>
            window.location.pathname === item.to ||
            window.location.pathname.startsWith(`${item.to}/`),
        );
        initial[key] = hasActive;
      }
    });
    return initial;
  });

  // Auto-expand group when navigating to any of its children
  useEffect(() => {
    visibleGroups.forEach((group, idx) => {
      if (group.collapsible && isGroupActive(group)) {
        const key = group.title || `group-${idx}`;
        setOpenGroups((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
          <Icon name="balance" filled className="text-[22px]" />
        </div>
        <div className="leading-tight">
          <p
            className="notranslate text-base font-bold text-white"
            translate="no"
          >
            VakeelSetu
          </p>
          <p className="text-xs text-slate-400">{getDisplayRole(user)}</p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {visibleGroups.map((group, groupIndex) => {
          const groupKey = group.title || `group-${groupIndex}`;
          const isCollapsible = Boolean(group.collapsible);
          const isOpen = Boolean(openGroups[groupKey]);
          const isChildActive = isGroupActive(group);

          if (isCollapsible) {
            return (
              <div key={groupKey} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupKey)}
                  aria-expanded={isOpen}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                    isChildActive
                      ? "bg-amber-500/10 text-amber-400 font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={group.icon || "menu_book"}
                      filled={isChildActive}
                      className={`text-[20px] ${
                        isChildActive
                          ? "text-amber-400"
                          : "text-slate-400 group-hover:text-amber-400"
                      }`}
                    />
                    <span>{group.title}</span>
                  </div>
                  <Icon
                    name="expand_more"
                    className={`text-[20px] text-slate-400 transition-transform duration-200 group-hover:text-white ${
                      isOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <ul className="ml-3 space-y-1 border-l border-white/10 pl-3">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                              isActive
                                ? "bg-amber-500/15 text-amber-400 font-semibold"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Icon name={item.icon} filled={isActive} className="text-[18px]" />
                              <span>{item.label}</span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          return (
            <div key={groupKey} className="space-y-1">
              {group.title ? (
                <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {group.title}
                </p>
              ) : null}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                          isActive
                            ? "bg-amber-500/10 text-amber-400"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon name={item.icon} filled={isActive} className="text-[20px]" />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-amber-400">
            {initialsOf(name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            {user?.email ? <p className="truncate text-xs text-slate-400">{user.email}</p> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60"
        >
          <Icon name="logout" className="text-[20px]" />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
