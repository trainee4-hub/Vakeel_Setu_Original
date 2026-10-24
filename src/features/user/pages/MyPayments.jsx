import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiExternalLink,
  FiHash,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";
import { getUserPayments } from "../services/consultancyApi";
import {
  formatPaiseToRupees,
  formatPaymentDateTime,
  getPaymentStatusLabel,
  getPaymentStatusBadgeClass,
} from "../utils/paymentUtils";

export default function MyPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserPayments({ page, limit: 10 });
      const rawPayments = response.data || [];
      const visiblePayments = rawPayments.filter((p) => {
        const st = String(p.status || "").toUpperCase();
        return st !== "REFUNDED" && st !== "REFUND_PENDING" && st !== "DUPLICATE_REFUNDED";
      });
      setPayments(visiblePayments);
      setPagination(
        response.pagination || {
          page,
          limit: 10,
          total: visiblePayments.length,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(
        err?.userMessage ||
          err?.message ||
          "Failed to load payments history. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.page) {
      fetchPayments(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPackageTitle = (item) => {
    const isVideo = item.callType === "VIDEO_CALL";
    const typeLabel = isVideo ? "Video Consultation" : "Voice Consultation";
    const durationLabel = item.duration ? `${item.duration} min` : "15 min";
    return `${typeLabel} (${durationLabel})`;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Actions */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Go back"
            >
              <FiArrowLeft className="text-base" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
                My Payments
              </h1>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                Track your consultation transactions and booking links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span>My Consultancies</span>
              <FiExternalLink className="size-3" />
            </Link>

            <button
              type="button"
              onClick={() => fetchPayments(pagination.page)}
              disabled={loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
              title="Refresh payments"
            >
              <FiRefreshCw className={`size-3.5 ${loading ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800">
                !
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-rose-900">
                  Unable to load payments
                </h4>
                <p className="mt-1 text-xs text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchPayments(pagination.page)}
                  className="mt-3 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-5 w-24 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-36 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && payments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <FiCreditCard className="text-3xl" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">
              No payments yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
              You haven't made any consultation booking payments yet. Book a session with our verified legal experts to get started.
            </p>
            <Link
              to="/bookings"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-amber-500"
            >
              <span>Book Consultation</span>
            </Link>
          </div>
        )}

        {/* Payments List */}
        {!loading && !error && payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((item) => {
              const packageTitle = getPackageTitle(item);
              const statusLabel = getPaymentStatusLabel(item.status);
              const statusBadgeClass = getPaymentStatusBadgeClass(item.status);
              const isPaid = String(item.status).toUpperCase() === "PAID";
              const amountDisplay = formatPaiseToRupees(item.amount, item.amountRupees);
              const orderId = item.razorpayOrderId || "—";
              const createdDate = formatPaymentDateTime(item.createdAt);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  {/* Top Bar: Date, Status, Amount */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <FiCalendar className="text-slate-400" />
                      <span>{createdDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${statusBadgeClass}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-base font-black text-slate-950">
                        {amountDisplay}
                      </span>
                    </div>
                  </div>

                  {/* Body Grid: Package, Order ID, Booking Link */}
                  <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                    {/* Package */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Consultation Package
                      </p>
                      <p className="mt-1 font-bold text-slate-900">
                        {packageTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {item.phoneNumber ? `Phone: ${item.phoneNumber}` : ""}
                      </p>
                    </div>

                    {/* Order ID */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Razorpay Order ID
                      </p>
                      <p className="mt-1 font-mono text-[11px] font-bold text-slate-800 truncate" title={orderId}>
                        {orderId}
                      </p>
                    </div>

                    {/* Booking Link (no dead link if null) */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Consultancy Booking
                      </p>
                      {item.consultancyRequestId ? (
                        <Link
                          to="/bookings"
                          className="mt-1 inline-flex items-center gap-1.5 font-bold text-amber-600 transition hover:text-amber-700 hover:underline"
                        >
                          <span>View in My Consultancies</span>
                          <FiExternalLink className="size-3" />
                        </Link>
                      ) : (
                        <p className="mt-1 text-slate-400">
                          {isPaid ? "Processing request..." : "No booking created"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
                <span className="font-semibold text-slate-500">
                  Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} transactions)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
