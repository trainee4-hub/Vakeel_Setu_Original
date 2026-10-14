import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { getHelpRequests } from "../../../services/platform/adminHelpApi";
import { ADMIN_PATHS, formatDate } from "../../../utils/adminUtils";

export function HelpStatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "OPEN") {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20 whitespace-nowrap">
        Open
      </span>
    );
  }
  if (s === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20 whitespace-nowrap">
        In Progress
      </span>
    );
  }
  if (s === "RESOLVED") {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap">
        Resolved
      </span>
    );
  }
  if (s === "CLOSED") {
    return (
      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-600/20 whitespace-nowrap">
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10 whitespace-nowrap">
      {status || "—"}
    </span>
  );
}

const STATUS_TABS = [
  { id: "", label: "All", countKey: "total", icon: "inbox" },
  { id: "OPEN", label: "Open", countKey: "OPEN", icon: "pending_actions" },
  { id: "IN_PROGRESS", label: "In Progress", countKey: "IN_PROGRESS", icon: "sync" },
  { id: "RESOLVED", label: "Resolved", countKey: "RESOLVED", icon: "check_circle" },
  { id: "CLOSED", label: "Closed", countKey: "CLOSED", icon: "lock" },
];

export default function HelpRequestsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get("status") || "";
  const currentPage = Math.max(1, Number(searchParams.get("page") || 1));
  const searchTerm = searchParams.get("search") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {}, counts: null });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHelpRequests({
        page: currentPage,
        limit: 20,
        status: currentStatus,
        search: searchTerm,
      });
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load help requests.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStatus, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleStatusTabChange = (statusValue) => {
    const next = new URLSearchParams(searchParams);
    if (statusValue) {
      next.set("status", statusValue);
    } else {
      next.delete("status");
    }
    next.delete("page");
    setSearchParams(next);
  };

  const handlePageChange = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const value = form.elements.search?.value || "";
    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set("search", value.trim());
    } else {
      next.delete("search");
    }
    next.delete("page");
    setSearchParams(next);
  };

  const handleClearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    next.delete("page");
    setSearchParams(next);
  };

  const counts = data.counts || {};

  const getTabCount = (tab) => {
    if (data.counts) {
      if (tab.id === "") {
        return counts.total ?? counts.ALL ?? null;
      }
      return counts[tab.countKey] ?? counts[tab.id] ?? null;
    }
    // Fallback if backend does not supply counts object
    if (data.items && Array.isArray(data.items)) {
      if (tab.id === "") return data.pagination?.total ?? data.items.length;
      return data.items.filter((i) => i.status === tab.id).length;
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-full">
      <PageHeader
        title="Help Requests"
        description="Review and respond to citizen support inquiries and assistance requests."
      />

      {/* Status Filter Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
        <nav
          className="-mb-px flex space-x-2 sm:space-x-6 min-w-max pb-0.5"
          aria-label="Help status tabs"
        >
          {STATUS_TABS.map((tab) => {
            const active = currentStatus === tab.id;
            const count = getTabCount(tab);
            return (
              <button
                key={tab.id || "all"}
                type="button"
                onClick={() => handleStatusTabChange(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-3 px-2 sm:px-1 text-sm font-medium transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-t-lg ${
                  active
                    ? "border-amber-500 text-amber-600 font-semibold"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon
                  name={tab.icon}
                  className={`text-[18px] transition ${
                    active ? "text-amber-500" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
                {count !== null && count !== undefined ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition ${
                      active
                        ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row w-full sm:max-w-md gap-2">
          <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Icon name="search" className="text-[18px]" />
            </div>
            <input
              name="search"
              type="search"
              defaultValue={searchTerm}
              placeholder="Search by name, email, phone, ID…"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm transition"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button type="submit" variant="secondary" className="flex-1 sm:flex-none justify-center">
              Search
            </Button>
            {searchTerm ? (
              <Button
                type="button"
                variant="tertiary"
                onClick={handleClearSearch}
                className="flex-1 sm:flex-none justify-center"
              >
                Clear
              </Button>
            ) : null}
          </div>
        </form>
      </div>

      {/* Content States */}
      {loading ? (
        <TableSkeleton rows={6} cols={8} />
      ) : error ? (
        <ErrorState
          title="Could not load help requests"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="contact_support"
          title="No help requests found."
          message={
            searchTerm
              ? "No help requests match your search query."
              : currentStatus
                ? `No requests recorded under status "${currentStatus}".`
                : "No help requests recorded in the system."
          }
        />
      ) : (
        <div className="space-y-4 min-w-0">
          {/* Table Container: enables horizontal scrolling on tablet/small screens without double borders */}
          <div className="w-full [&>div]:!overflow-x-auto [&>div]:!overflow-y-hidden">
            <ResourceTable
              data={data.items}
              keyField="id"
              columns={[
                {
                  key: "referenceId",
                  header: "Reference ID",
                  primary: true,
                  className: "whitespace-nowrap font-mono text-xs w-[100px] !px-2 lg:!px-3.5",
                  render: (row) => (
                    <Link
                      to={ADMIN_PATHS.help.detail(row.id)}
                      className="font-mono font-bold text-amber-600 hover:text-amber-700 hover:underline whitespace-nowrap text-sm md:text-xs"
                    >
                      {row.referenceId || "—"}
                    </Link>
                  ),
                },
                {
                  key: "name",
                  header: "Name",
                  className: "whitespace-nowrap font-medium text-slate-900 w-[110px] !px-2 lg:!px-3.5",
                  render: (row) => (
                    <Link
                      to={ADMIN_PATHS.help.detail(row.id)}
                      className="truncate block max-w-[110px] font-medium text-slate-900 hover:text-amber-600 transition"
                      title={row.name}
                    >
                      {row.name || "—"}
                    </Link>
                  ),
                },
                {
                  key: "email",
                  header: "Email",
                  className: "text-slate-600 text-xs w-[135px] !px-2 lg:!px-3.5",
                  render: (row) => (
                    <span
                      className="truncate block max-w-[135px] text-xs text-slate-600"
                      title={row.email}
                    >
                      {row.email || "—"}
                    </span>
                  ),
                },
                {
                  key: "phoneNumber",
                  header: "Phone",
                  className: "font-mono text-xs text-slate-700 whitespace-nowrap w-[95px] !px-2 lg:!px-3.5",
                  render: (row) => row.phoneNumber || row.phone || "—",
                },
                {
                  key: "status",
                  header: "Status",
                  className: "whitespace-nowrap w-[85px] !px-2 lg:!px-3.5",
                  render: (row) => <HelpStatusBadge status={row.status} />,
                },
                {
                  key: "concern",
                  header: "Concern",
                  className: "text-xs text-slate-700 max-w-[160px] lg:max-w-[200px] !px-2 lg:!px-3.5",
                  render: (row) => {
                    const text = row.concern || "—";
                    return (
                      <span
                        className="text-xs text-slate-700 block max-w-[160px] lg:max-w-[200px] truncate"
                        title={text}
                      >
                        {text}
                      </span>
                    );
                  },
                },
                {
                  key: "createdAt",
                  header: "Received",
                  className: "whitespace-nowrap text-xs text-slate-500 w-[90px] !px-2 lg:!px-3.5",
                  render: (row) => formatDate(row.createdAt),
                },
                {
                  key: "responded",
                  header: "Responded",
                  className: "whitespace-nowrap text-xs w-[120px] !px-2 lg:!px-3.5",
                  render: (row) => {
                    if (!row.respondedAt) {
                      return <span className="text-slate-400 text-xs">—</span>;
                    }
                    const respondedBy = row.respondedByName ?? null;
                    return (
                      <div className="flex flex-col text-xs leading-tight">
                        <span className="text-slate-700 whitespace-nowrap font-medium">
                          {formatDate(row.respondedAt)}
                        </span>
                        {respondedBy ? (
                          <span
                            className="text-slate-400 text-[11px] truncate max-w-[115px]"
                            title={respondedBy}
                          >
                            by {respondedBy}
                          </span>
                        ) : null}
                      </div>
                    );
                  },
                },
              ]}
              actions={(row) => [
                {
                  key: "view",
                  label: "View Request",
                  icon: "chevron_right",
                  to: ADMIN_PATHS.help.detail(row.id),
                },
              ]}
            />
          </div>

          <Pagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
