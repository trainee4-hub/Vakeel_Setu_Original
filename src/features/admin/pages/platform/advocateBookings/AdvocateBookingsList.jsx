import { useCallback, useEffect, useState } from "react";
import PageHeader from "@shared/components/ui/PageHeader";
import Pagination from "@shared/components/ui/Pagination";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { getAdminAdvocateBookings } from "../../../services/platform/adminAdvocateBookingsApi";
import { formatDateTime, formatDate } from "../../../utils/adminUtils";
import { FiVideo, FiPhone, FiBriefcase, FiSearch, FiX, FiCopy, FiCheck, FiAlertCircle } from "react-icons/fi";
import { AdvocateHoverCell, ClientHoverCell } from "./BookingHoverCards";

function BookingRefButton({ reference, className = "" }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!reference) return;

    let successful = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(reference);
        successful = true;
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = reference;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        successful = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        successful = false;
      }
    }

    if (successful) {
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setFailed(true);
      setCopied(false);
      setTimeout(() => setFailed(false), 2000);
    }
  };

  if (!reference) return <span className="text-slate-400 font-mono text-xs">—</span>;

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : failed ? "Failed to copy" : "Click to copy booking reference"}
      aria-label={`Copy booking reference ${reference}`}
      className={`group/ref inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-1 rounded-md border transition cursor-pointer select-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
        copied
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : failed
          ? "border-rose-300 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 hover:border-slate-300"
      } ${className}`}
    >
      {copied ? (
        <>
          <FiCheck className="text-emerald-600 shrink-0" size={12} />
          <span>Copied</span>
        </>
      ) : failed ? (
        <>
          <FiAlertCircle className="text-rose-600 shrink-0" size={12} />
          <span>Failed</span>
        </>
      ) : (
        <>
          <FiCopy className="text-slate-400 group-hover/ref:text-slate-600 shrink-0" size={11} />
          <span>{reference}</span>
        </>
      )}
    </button>
  );
}

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

  // 8 columns — Subject column removed per requirement 4
  const columns = [
    {
      key: "bookingReference",
      header: "Booking Reference",
      className: "whitespace-nowrap w-[150px]",
      primary: true,
      render: (item) => (
        <div>
          <BookingRefButton reference={item.bookingId || item.id} />
        </div>
      ),
    },
    {
      key: "client",
      header: "Client Details",
      className: "min-w-[150px]",
      render: (item) => <ClientHoverCell item={item} />,
    },
    {
      key: "advocate",
      header: "Advocate Details",
      className: "min-w-[150px]",
      render: (item) => <AdvocateHoverCell advocate={item.advocate} />,
    },
    {
      key: "mode",
      header: "Mode",
      className: "whitespace-nowrap w-[110px]",
      render: (item) => renderModeBadge(item.mode),
    },
    {
      key: "slot",
      header: "Slot",
      className: "min-w-[140px]",
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-slate-900">{formatDate(item.startAt)}</p>
          <p className="text-slate-500 font-mono text-[11px]">
            {formatTimeSlot(item.startAt, item.endAt, item.durationMinutes)}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "whitespace-nowrap w-[90px]",
      render: (item) => {
        const amt = item.breakdown?.total;
        if (amt == null || Number.isNaN(Number(amt))) {
          return <span className="text-xs text-slate-400 font-medium">—</span>;
        }
        const num = Number(amt);
        const isWhole = Number.isInteger(num);
        return (
          <span className="font-bold text-slate-900 text-sm whitespace-nowrap">
            ₹{num.toLocaleString("en-IN", {
              minimumFractionDigits: isWhole ? 0 : 2,
              maximumFractionDigits: isWhole ? 0 : 2,
            })}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[160px]",
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

        // const paymentSubtext = isConfirmedOrPaid || isCompleted ? "Paid" : item.status;

        return (
          <div className="space-y-1">
            {primaryBadge}
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Booked On",
      className: "whitespace-nowrap w-[140px]",
      render: (item) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(item.confirmedAt || item.payment?.paidAt || item.createdAt)}
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
            className="rounded-xl border border-slate-300 bg-white pl-5 pl-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
        <TableSkeleton rows={6} cols={8} />
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
          {/* Responsive Table Container with horizontal scroll on narrow screens */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="hidden w-full min-w-[920px] text-left text-sm md:table">
                <caption className="sr-only">Private Advocate Bookings</caption>
                <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`px-3.5 py-3 sm:px-4 ${column.className ?? ""}`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((item) => (
                    <tr
                      key={item.id || item._id}
                      className="align-middle hover:bg-slate-50/60 transition-colors"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-3.5 py-3 sm:px-4 sm:py-3.5 text-slate-600 ${column.className ?? ""}`}
                        >
                          {column.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked card view (< 768px) */}
            <ul className="divide-y divide-slate-100 md:hidden" aria-label="Private Advocate Bookings">
              {data.items.map((item) => (
                <li key={item.id || item._id} className="space-y-3 p-4">
                  <div>{columns[0].render(item)}</div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                    {columns.slice(1).map((column) => (
                      <div key={column.key} className="min-w-0">
                        <dt className="text-[11px] font-semibold text-slate-400">{column.header}</dt>
                        <dd className="mt-0.5 text-slate-700">{column.render(item)}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          </div>

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
