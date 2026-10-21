import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import {
  getAdvocates,
  getPendingAdvocates,
  getAdvocateDeletionRequests,
  getRejectedAdvocates,
} from "../../../services/platform/adminAdvocatesApi";
import { ADMIN_PATHS, daysUntil, formatDate, formatDateTime } from "../../../utils/adminUtils";

function StatusBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "ACTIVE") {
    return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Active</span>;
  }
  if (s === "BLOCKED") {
    return <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">Blocked</span>;
  }
  return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status || "—"}</span>;
}

function ApprovalBadge({ status }) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED") {
    return <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Approved</span>;
  }
  if (s === "PENDING") {
    return <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">Pending</span>;
  }
  if (s === "REJECTED") {
    return <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Rejected</span>;
  }
  return <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status || "—"}</span>;
}

function OnlineStatusDot({ isOnline }) {
  const online = Boolean(isOnline);
  return (
    <span
      className={`h-2 w-2 rounded-full shrink-0 ${
        online ? "bg-emerald-500" : "bg-slate-400"
      }`}
      title={online ? "Online" : "Offline"}
      aria-label={online ? "Online" : "Offline"}
      role="status"
    />
  );
}

export default function AdvocatesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "all";
  const currentPage = Math.max(1, Number(searchParams.get("page") || 1));
  const searchTerm = searchParams.get("search") || "";
  const approvalFilter = searchParams.get("approvalStatus") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [searchInput, setSearchInput] = useState(searchTerm);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (currentTab === "pending") {
        result = await getPendingAdvocates({ page: currentPage, limit: 15 });
      } else if (currentTab === "rejected") {
        result = await getRejectedAdvocates({ page: currentPage, limit: 15, search: searchTerm });
      } else if (currentTab === "deletions") {
        result = await getAdvocateDeletionRequests({ page: currentPage, limit: 15 });
      } else {
        result = await getAdvocates({
          page: currentPage,
          limit: 15,
          search: searchTerm,
          approvalStatus: approvalFilter || undefined,
        });
      }
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load advocates");
    } finally {
      setLoading(false);
    }
  }, [currentTab, currentPage, searchTerm, approvalFilter]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleTabChange = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    next.delete("page");
    setSearchParams(next);
  };

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      // Instant reset to all advocates when cleared
      const next = new URLSearchParams(searchParams);
      next.delete("search");
      next.delete("page");
      setSearchParams(next, { replace: true });
      return;
    }

    // 350ms debounced search
    debounceTimerRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      next.set("search", trimmed);
      next.delete("page");
      setSearchParams(next, { replace: true });
    }, 350);
  };

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchInput("");
    const next = new URLSearchParams(searchParams);
    next.delete("search");
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const trimmed = searchInput.trim();
    const next = new URLSearchParams(searchParams);
    if (trimmed) next.set("search", trimmed);
    else next.delete("search");
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  // Smart client-side filter fallback so that even if backend ignores search,
  // matching advocates are filtered accurately by name, email, phone, or bar ID
  const filteredItems = useMemo(() => {
    const items = Array.isArray(data.items) ? data.items : [];
    if (!searchTerm.trim()) return items;

    const query = searchTerm.trim().toLowerCase();
    return items.filter((row) => {
      const fullName = String(row.fullName || row.name || "").toLowerCase();
      const email = String(row.email || "").toLowerCase();
      const phone = String(row.phone || "").toLowerCase();
      const barId = String(row.barCouncilId || row.barId || "").toLowerCase();
      const city = String(row.city || "").toLowerCase();
      const state = String(row.state || "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        barId.includes(query) ||
        city.includes(query) ||
        state.includes(query)
      );
    });
  }, [data.items, searchTerm]);

  const handleApprovalFilterChange = (e) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) next.set("approvalStatus", val);
    else next.delete("approvalStatus");
    next.delete("page");
    setSearchParams(next);
  };

  const tabs = [
    { id: "all", label: "All Advocates", icon: "badge" },
    { id: "pending", label: "Pending Approvals", icon: "pending_actions" },
    { id: "rejected", label: "Rejected", icon: "cancel" },
    { id: "deletions", label: "Deletion Requests", icon: "delete_outline" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advocates"
        description="Oversee advocate registrations, credentials review, account status, rejected profiles, and deletion requests."
      />

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Advocate tabs">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-medium transition ${
                  active
                    ? "border-amber-500 text-amber-600 font-semibold"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon name={tab.icon} className="text-[18px]" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filter and Search Bar */}
      {currentTab === "all" || currentTab === "rejected" ? (
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex max-w-md flex-1 gap-2">
            <div className="relative flex-1">
              <input
                name="search"
                type="text"
                value={searchInput}
                onChange={handleInputChange}
                placeholder={
                  currentTab === "rejected"
                    ? "Search by name, email, phone, or bar ID…"
                    : "Search by name, email, or bar ID…"
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-2.5 my-auto flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              ) : null}
            </div>
            <Button type="submit" variant="secondary" icon="search">
              Search
            </Button>
            {searchTerm ? (
              <Button
                type="button"
                variant="tertiary"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            ) : null}
          </form>

          {/* Optional Approval Status filter on "All" tab */}
          {currentTab === "all" ? (
            <div className="flex items-center gap-2">
              <label htmlFor="all-approval-filter" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Approval:
              </label>
              <select
                id="all-approval-filter"
                value={approvalFilter}
                onChange={handleApprovalFilterChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">All Approvals</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Content States */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : error ? (
        <ErrorState
          title="Could not load advocates"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={currentTab === "rejected" ? "cancel" : "badge"}
          title={
            currentTab === "rejected"
              ? "No rejected profiles."
              : `No ${currentTab === "pending" ? "pending approval" : currentTab === "deletions" ? "deletion request" : ""} advocates found`
          }
          message={
            searchTerm
              ? "No advocates match your search criteria. Try a different query."
              : currentTab === "rejected"
                ? "There are currently no rejected advocate profiles in the system."
                : currentTab === "pending"
                  ? "The verification queue is clear! All advocates are reviewed."
                  : currentTab === "deletions"
                    ? "There are currently no active account deletion requests."
                    : "No registered advocates found in the database."
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <ResourceTable
              data={filteredItems}
              keyField="id"
              columns={
                currentTab === "deletions"
                  ? [
                      {
                        key: "advocate",
                        header: "Advocate",
                        primary: true,
                        render: (row) => (
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 truncate">
                              {row.fullName || row.name || "Advocate"}
                            </span>
                            <span className="text-xs text-slate-500 truncate">
                              {row.email || row.phone || "—"}
                            </span>
                          </div>
                        ),
                      },
                      {
                        key: "barCouncilId",
                        header: "Bar Council ID",
                        className: "whitespace-nowrap",
                        render: (row) => (
                          <span className="font-mono text-xs text-slate-700 whitespace-nowrap">
                            {row.barCouncilId || row.barId || "—"}
                          </span>
                        ),
                      },
                      {
                        key: "deletionRequestedAt",
                        header: "Requested",
                        className: "whitespace-nowrap",
                        render: (row) => (
                          <span className="text-xs text-slate-600 whitespace-nowrap">
                            {formatDate(row.deletionRequestedAt || row.createdAt)}
                          </span>
                        ),
                      },
                      {
                        key: "scheduledDeletionAt",
                        header: "Scheduled Deletion",
                        className: "whitespace-nowrap",
                        render: (row) => (
                          <span className="text-xs text-slate-600 whitespace-nowrap">
                            {formatDate(row.scheduledDeletionAt)}
                          </span>
                        ),
                      },
                      {
                        key: "daysLeft",
                        header: "Days Left",
                        className: "whitespace-nowrap",
                        render: (row) => {
                          const days = daysUntil(row.scheduledDeletionAt);
                          if (days === null) return <span className="text-xs text-slate-400">—</span>;
                          const urgent = days <= 3;
                          return (
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                                urgent
                                  ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                                  : "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20"
                              }`}
                            >
                              {days > 0 ? `${days} day${days === 1 ? "" : "s"}` : "Due Today"}
                            </span>
                          );
                        },
                      },
                      {
                        key: "actions",
                        header: "Actions",
                        className: "w-24 text-right whitespace-nowrap",
                        render: (row) => (
                          <Link
                            to={ADMIN_PATHS.advocates.detail(row.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 whitespace-nowrap"
                          >
                            Review <Icon name="chevron_right" className="text-[14px]" />
                          </Link>
                        ),
                      },
                    ]
                  : currentTab === "rejected"
                    ? [
                        {
                          key: "photo",
                          header: "Photo",
                          className: "w-12 whitespace-nowrap",
                          render: (row) =>
                            row.profilePhotoUrl ? (
                              <img
                                src={row.profilePhotoUrl}
                                alt={row.fullName || row.name || "Advocate"}
                                className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Icon name="person" className="text-[18px]" />
                              </div>
                            ),
                        },
                        {
                          key: "name",
                          header: "Name",
                          primary: true,
                          render: (row) => (
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <OnlineStatusDot isOnline={row.isOnline} />
                                <span className="font-semibold text-slate-900 truncate">
                                  {row.fullName || row.name || "Advocate"}
                                </span>
                              </div>
                            </div>
                          ),
                        },
                        {
                          key: "barCouncilId",
                          header: "Bar Council ID",
                          className: "whitespace-nowrap",
                          render: (row) => (
                            <span className="font-mono text-xs text-slate-700 whitespace-nowrap">
                              {row.barCouncilId || row.barId || "—"}
                            </span>
                          ),
                        },
                        {
                          key: "contact",
                          header: "Email / Phone",
                          render: (row) => (
                            <div className="flex flex-col min-w-0 text-xs text-slate-600 truncate">
                              <span className="truncate">{row.email || "—"}</span>
                              <span className="text-slate-400 truncate">{row.phone || "—"}</span>
                            </div>
                          ),
                        },
                        {
                          key: "bestPracticeArea",
                          header: "Practice Area",
                          className: "whitespace-nowrap text-xs text-slate-700",
                          render: (row) => row.bestPracticeArea || row.lawType || "—",
                        },
                        {
                          key: "location",
                          header: "City / State",
                          render: (row) => {
                            const loc = [row.city, row.state].filter(Boolean).join(", ") || "—";
                            return (
                              <span className="block max-w-[120px] truncate text-xs text-slate-600" title={loc}>
                                {loc}
                              </span>
                            );
                          },
                        },
                        {
                          key: "rejectionReason",
                          header: "Rejection Reason",
                          render: (row) => (
                            <span
                              className="block max-w-[160px] truncate text-xs text-red-700 font-medium"
                              title={row.rejectionReason || "—"}
                            >
                              {row.rejectionReason || "—"}
                            </span>
                          ),
                        },
                        {
                          key: "rejectedAt",
                          header: "Rejected At",
                          className: "whitespace-nowrap",
                          render: (row) => (
                            <span className="text-xs text-slate-600 whitespace-nowrap">
                              {formatDateTime(row.rejectedAt)}
                            </span>
                          ),
                        },
                        {
                          key: "submittedForApprovalAt",
                          header: "Submitted At",
                          className: "whitespace-nowrap",
                          render: (row) => (
                            <span className="text-xs text-slate-600 whitespace-nowrap">
                              {formatDate(row.submittedForApprovalAt)}
                            </span>
                          ),
                        },
                        {
                          key: "actions",
                          header: "Actions",
                          className: "w-20 text-right whitespace-nowrap",
                          render: (row) => (
                            <Link
                              to={ADMIN_PATHS.advocates.detail(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 whitespace-nowrap"
                            >
                              Review <Icon name="chevron_right" className="text-[14px]" />
                            </Link>
                          ),
                        },
                      ]
                    : [
                        {
                          key: "advocate",
                          header: "Advocate",
                          primary: true,
                          render: (row) => (
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <OnlineStatusDot isOnline={row.isOnline} />
                                <span className="font-semibold text-slate-900 truncate">
                                  {row.fullName || row.name || "Advocate"}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 truncate">
                                {row.email || row.phone || "—"}
                              </span>
                            </div>
                          ),
                        },
                        {
                          key: "barCouncilId",
                          header: "Bar Council ID",
                          className: "whitespace-nowrap",
                          render: (row) => (
                            <span className="font-mono text-xs text-slate-700 whitespace-nowrap">
                              {row.barCouncilId || row.barId || "—"}
                            </span>
                          ),
                        },
                        {
                          key: "location",
                          header: "City / State",
                          render: (row) => {
                            const loc = [row.city, row.state].filter(Boolean).join(", ") || "—";
                            return (
                              <span className="block max-w-[120px] truncate text-xs text-slate-600" title={loc}>
                                {loc}
                              </span>
                            );
                          },
                        },
                        {
                          key: "approvalStatus",
                          header: "Approval",
                          className: "whitespace-nowrap",
                          render: (row) => <ApprovalBadge status={row.approvalStatus} />,
                        },
                        {
                          key: "accountStatus",
                          header: "Account",
                          className: "whitespace-nowrap",
                          render: (row) => <StatusBadge status={row.accountStatus || row.status} />,
                        },
                        {
                          key: "callAvailability",
                          header: "Calls",
                          className: "whitespace-nowrap",
                          render: (row) => (
                            <span className="text-xs text-slate-600 whitespace-nowrap">
                              {row.callAvailability ? (
                                <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                                  <Icon name="check" className="text-[14px]" /> Yes
                                </span>
                              ) : (
                                <span className="text-slate-400">No</span>
                              )}
                            </span>
                          ),
                        },
                        {
                          key: "actions",
                          header: "Actions",
                          className: "w-20 text-right whitespace-nowrap",
                          render: (row) => (
                            <Link
                              to={ADMIN_PATHS.advocates.detail(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 whitespace-nowrap"
                            >
                              View <Icon name="chevron_right" className="text-[14px]" />
                            </Link>
                          ),
                        },
                      ]
              }
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
