import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Button, Icon } from "@shared/components/ui/Button";
import { getUsers } from "../../../services/platform/adminUsersApi";
import { ADMIN_PATHS, formatDate } from "../../../utils/adminUtils";

function UserStatusBadge({ status, isActive }) {
  const s = String(status || "").toUpperCase();
  if (s === "DELETION_PENDING") {
    return (
      <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
        Deletion Pending
      </span>
    );
  }
  if (s === "ACTIVE" || isActive) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
      Inactive
    </span>
  );
}

export default function UsersList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page") || 1));
  const searchTerm = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchTerm);
  const debounceTimerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [reloadTrigger, setReloadTrigger] = useState(0);

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
      const result = await getUsers({
        page: currentPage,
        limit: 15,
        search: searchTerm,
      });
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handlePageChange = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = val.trim();

    // Instant clear when field is emptied
    if (!trimmed) {
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

  // Smart client-side filter fallback so that even if backend search has gaps,
  // matching users are filtered accurately by name, email, phone, city, or state
  const filteredItems = useMemo(() => {
    const items = Array.isArray(data.items) ? data.items : [];
    if (!searchTerm.trim()) return items;

    const query = searchTerm.trim().toLowerCase();
    return items.filter((row) => {
      const fullName = String(row.fullName || row.name || "").toLowerCase();
      const email = String(row.email || "").toLowerCase();
      const phone = String(row.phone || "").toLowerCase();
      const city = String(row.city || "").toLowerCase();
      const state = String(row.state || "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        city.includes(query) ||
        state.includes(query)
      );
    });
  }, [data.items, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="View registered platform clients and account verification statuses (read-only)."
      />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 max-w-md gap-2">
          <div className="relative flex-1">
            <input
              name="search"
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search by name, email, or phone…"
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
      </div>

      {/* Table & States */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : error ? (
        <ErrorState
          title="Could not load users"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="people"
          title="No users found"
          message={searchTerm ? "No users match your query." : "No client users found in the system."}
        />
      ) : (
        <div className="space-y-4">
          <ResourceTable
            data={filteredItems}
            keyField="id"
            columns={[
              {
                key: "user",
                header: "User",
                render: (row) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{row.fullName || "User"}</span>
                    <span className="text-xs text-slate-500">{row.email || "No email"}</span>
                  </div>
                ),
              },
              {
                key: "phone",
                header: "Phone",
                render: (row) => (
                  <span className="text-xs text-slate-700 font-mono">{row.phone || "—"}</span>
                ),
              },
              {
                key: "location",
                header: "Location",
                render: (row) => (
                  <span className="text-xs text-slate-600">
                    {[row.city, row.state].filter(Boolean).join(", ") || "—"}
                  </span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <UserStatusBadge status={row.status} isActive={row.isActive} />,
              },
              {
                key: "createdAt",
                header: "Joined",
                render: (row) => (
                  <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (row) => (
                  <Link
                    to={ADMIN_PATHS.users.detail(row.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    View <Icon name="chevron_right" className="text-[14px]" />
                  </Link>
                ),
              },
            ]}
          />

          <Pagination
            pagination={data.pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
