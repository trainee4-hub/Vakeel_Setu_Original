import { useCallback, useEffect, useState } from "react";
import PageHeader from "@shared/components/ui/PageHeader";
import ResourceTable from "@shared/components/ui/ResourceTable";
import Pagination from "@shared/components/ui/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { Icon } from "@shared/components/ui/Button";
import { getAdminAdvocateBookings } from "../../../services/platform/adminAdvocateBookingsApi";
import { formatDateTime, formatDate } from "../../../utils/adminUtils";
import { FiVideo, FiPhone, FiBriefcase, FiSearch, FiX } from "react-icons/fi";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "HOLD", label: "Slot Held" },
  { value: "PAST_DUE", label: "Past Due" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REFUND_PENDING", label: "Refund Pending" },
  { value: "REFUNDED", label: "Refunded" },
];

const MODE_OPTIONS = [
  { value: "", label: "All Modes" },
  { value: "VIDEO_CALL", label: "Video Call" },
  { value: "VOICE_CALL", label: "Voice Call" },
  { value: "IN_PERSON", label: "In Person" },
];

function formatTimeSlot(startAt, endAt, durationMinutes) {
  if (!startAt) return "—";
  try {
    const s = new Date(startAt);
    const startStr = s.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    let endStr = "";
    if (endAt) {
      const e = new Date(endAt);
      endStr = e.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    const durationLabel = durationMinutes ? ` (${durationMinutes}m)` : "";
    return endStr ? `${startStr} – ${endStr}${durationLabel}` : `${startStr}${durationLabel}`;
  } catch {
    return String(startAt);
  }
}

function renderModeBadge(mode) {
  const norm = String(mode || "").toUpperCase();
  if (norm === "VIDEO_CALL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
        <FiVideo className="text-sm shrink-0" />
        Video Call
      </span>
    );
  }
  if (norm === "VOICE_CALL") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
        <FiPhone className="text-sm shrink-0" />
        Voice Call
      </span>
    );
  }
  if (norm === "IN_PERSON") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <FiBriefcase className="text-sm shrink-0" />
        In Person
      </span>
    );
  }
  return <span className="text-xs text-slate-600 font-medium">{mode || "—"}</span>;
}

export default function AdvocateBookingsList() {
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ items: [], pagination: {} });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminAdvocateBookings({
        page,
        limit,
        status: statusFilter,
        mode: modeFilter,
        search: searchQuery,
      });
      setData(res);
    } catch (err) {
      setError(err?.message || "Failed to load advocate bookings.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, modeFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData, reloadTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const columns = [
    {
      key: "bookingReference",
      header: "Booking Reference",
      primary: true,
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
            {item.bookingId || item.id}
          </span>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client Details",
      render: (item) => (
        <div className="space-y-0.5 min-w-[140px]">
          <p className="font-semibold text-slate-900 text-sm">{item.user?.fullName || "—"}</p>
          <p className="font-mono text-xs text-slate-500">{item.user?.phone || "—"}</p>
          {item.user?.email && (
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{item.user.email}</p>
          )}
        </div>
      ),
    },
    {
      key: "advocate",
      header: "Advocate Details",
      render: (item) => (
        <div className="space-y-0.5 min-w-[140px]">
          <p className="font-semibold text-slate-900 text-sm">{item.advocate?.fullName || "—"}</p>
          {item.advocate?.barCouncilId && (
            <p className="font-mono text-xs text-slate-500">ID: {item.advocate.barCouncilId}</p>
          )}
          {item.advocate?.phone && (
            <p className="font-mono text-[11px] text-slate-400">{item.advocate.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (item) => renderModeBadge(item.mode),
    },
    {
      key: "slot",
      header: "Slot",
      render: (item) => (
        <div className="text-xs space-y-0.5 min-w-[130px]">
          <p className="font-semibold text-slate-900">{formatDate(item.startAt)}</p>
          <p className="text-slate-500">{formatTimeSlot(item.startAt, item.endAt, item.durationMinutes)}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (item) => (
        <div className="text-xs max-w-[180px] space-y-0.5">
          <p className="font-medium text-slate-900 truncate" title={item.subject}>
            {item.subject || "General Consultation"}
          </p>
          {item.notes && (
            <p className="text-slate-400 truncate text-[11px]" title={item.notes}>
              {item.notes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (item) => {
        const amt = item.amount ?? item.total ?? (item.totalPaise ? item.totalPaise / 100 : 0);
        return (
          <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
            ₹{Number(amt).toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const isCompleted = Boolean(item.completedAt || item.status === "COMPLETED");
        const isConfirmedOrPaid = ["CONFIRMED", "PAID"].includes(item.status);
        const isHold = item.status === "HOLD";
        const isRefundPending = item.status === "REFUND_PENDING";
        const isRefunded = item.status === "REFUNDED";

        let primaryBadge;
        if (isCompleted) {
          primaryBadge = (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Consultation Completed
            </span>
          );
        } else if (isConfirmedOrPaid) {
          primaryBadge = (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20">
              Consultation Pending
            </span>
          );
        } else if (isHold) {
          primaryBadge = (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Slot Held
            </span>
          );
        } else if (isRefundPending) {
          primaryBadge = (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Refund Pending
            </span>
          );
        } else if (isRefunded) {
          primaryBadge = (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-400/20">
              Refunded
            </span>
          );
        } else {
          primaryBadge = (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
              {item.status}
            </span>
          );
        }

        const paymentSubtext = isConfirmedOrPaid || isCompleted ? "Paid" : item.status;

        return (
          <div className="space-y-1">
            {primaryBadge}
            <p className="text-[10px] text-slate-400 font-medium">
              Payment: <span className="text-slate-600">{paymentSubtext}</span>
            </p>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Booked On",
      render: (item) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Private Advocate Bookings"
          description="Direct client-to-advocate consultation bookings. Read-only audit log."
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-48 sm:w-60 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <FiSearch className="absolute left-3 text-slate-400" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <FiX className="text-sm" />
              </button>
            )}
          </form>

          {/* Status Filter */}
          <select
            id="advocate-booking-status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mode Filter */}
          <select
            id="advocate-booking-mode"
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={9} />
      ) : error ? (
        <ErrorState
          title="Could not load advocate bookings"
          message={error}
          actionLabel="Retry"
          onAction={() => setReloadTrigger((k) => k + 1)}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon="event_note"
          title="No advocate bookings found"
          message={
            statusFilter || modeFilter || searchQuery
              ? "No bookings match the selected filters."
              : "No private advocate bookings recorded in the system yet."
          }
        />
      ) : (
        <div className="space-y-4">
          <ResourceTable
            items={data.items}
            columns={columns}
            keyField="id"
            caption="Private Advocate Bookings"
          />

          <Pagination
            pagination={data.pagination}
            page={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
