import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import Pagination from "@shared/components/ui/Pagination";
import ConfirmModal from "@shared/components/ui/ConfirmModal";
import { EmptyState } from "@shared/components/feedback/EmptyState";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { TableSkeleton } from "@shared/components/feedback/LoadingSkeleton";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import {
  getAdminWithdrawals,
  approveWithdrawal,
  markPaidWithdrawal,
  rejectWithdrawal,
} from "../../../services/platform/adminWithdrawalsApi";
import {
  FiSearch,
  FiX,
  FiCopy,
  FiCheck,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";

const STATUS_TABS = ["ALL", "REQUESTED", "APPROVED", "PAID", "REJECTED"];

export default function WithdrawalsList() {
  const navigate = useNavigate();
  const toast = useToast();
  const { has } = useAdminAuth();

  const canManage = has(ADMIN_PERMISSIONS.PAYOUTS_MANAGE);

  const [status, setStatus] = useState("REQUESTED");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [counts, setCounts] = useState({
    ALL: 0,
    REQUESTED: 0,
    APPROVED: 0,
    PAID: 0,
    REJECTED: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  // Action Modals State
  const [approvingItem, setApprovingItem] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [payingItem, setPayingItem] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminWithdrawals({
        status,
        search,
        from: fromDate,
        to: toDate,
        page,
        limit,
      });

      if (Array.isArray(res?.withdrawals)) {
        setWithdrawals(res.withdrawals);
      } else {
        setWithdrawals([]);
      }

      if (res?.counts) {
        setCounts((prev) => ({ ...prev, ...res.counts }));
      }

      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err?.message || "Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  }, [status, search, fromDate, toDate, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Actions
  const handleApprove = async () => {
    if (!approvingItem) return;
    setActionLoading(true);
    try {
      await approveWithdrawal(approvingItem.id);
      toast.show(`Withdrawal ${approvingItem.withdrawalId} approved.`, "success");
      setApprovingItem(null);
      loadData();
    } catch (err) {
      toast.show(err?.message || "Failed to approve withdrawal.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingItem) return;
    const reason = rejectionReason.trim();
    if (!reason || reason.length < 5) {
      toast.show("Please enter a rejection reason (min 5 characters).", "error");
      return;
    }
    setActionLoading(true);
    try {
      await rejectWithdrawal(rejectingItem.id, { reason });
      toast.show(`Withdrawal ${rejectingItem.withdrawalId} rejected. Funds released.`, "info");
      setRejectingItem(null);
      setRejectionReason("");
      loadData();
    } catch (err) {
      toast.show(err?.message || "Failed to reject withdrawal.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!payingItem) return;
    const utr = utrNumber.trim();
    if (!utr || utr.length < 6) {
      toast.show("Please enter a valid UTR / transaction reference number.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await markPaidWithdrawal(payingItem.id, {
        utr,
        paidAt: new Date().toISOString(),
      });
      toast.show(`Withdrawal marked as PAID with UTR: ${utr}`, "success");
      setPayingItem(null);
      setUtrNumber("");
      loadData();
    } catch (err) {
      toast.show(err?.message || "Failed to mark withdrawal as paid.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal Requests"
        description="Review advocate bank withdrawal requests, verify payout accounts, and disburse consultation earnings."
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab] ?? 0;
          const active = status === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              className={`
                flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all
                ${
                  active
                    ? "border border-amber-500/40 bg-amber-500/10 text-amber-400"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                }
              `}
            >
              <span>{tab === "ALL" ? "All Requests" : tab}</span>
              <span
                className={`
                  rounded-full px-2 py-0.5 text-[10px] font-bold
                  ${active ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-300"}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Withdrawal ID, advocate name, phone, or UTR..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <FiX className="text-xs" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={loadData}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <FiRefreshCw className={`text-xs ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Main Table / States */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : error ? (
        <ErrorState
          title="Could not load withdrawals"
          message={error}
          onRetry={loadData}
        />
      ) : withdrawals.length === 0 ? (
        <EmptyState
          title="No withdrawal requests found"
          message={
            search
              ? "No requests matched your search query."
              : `There are currently no withdrawal requests in '${status}' status.`
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Withdrawal ID</th>
                  <th className="py-3.5 px-4">Advocate</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Bank Details</th>
                  <th className="py-3.5 px-4">Status & Alerts</th>
                  <th className="py-3.5 px-4">Requested At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {withdrawals.map((item) => {
                  const st = item.status;
                  const isPaid = st === "PAID";
                  const isApproved = st === "APPROVED";
                  const isRequested = st === "REQUESTED";
                  const isRejected = st === "REJECTED";

                  const hasNewBank = item.flags?.bankAccountChanged;
                  const hasNameMismatch = item.flags?.holderNameMatches === false;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/admin/withdrawals/${item.id}`)}
                      className="cursor-pointer hover:bg-slate-800/40 transition-colors"
                    >
                      {/* ID with Copy */}
                      <td className="whitespace-nowrap py-3.5 px-4">
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-mono font-bold text-amber-400">
                            {item.withdrawalId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.withdrawalId)}
                            title="Copy ID"
                            className="text-slate-500 hover:text-white"
                          >
                            {copiedId === item.withdrawalId ? (
                              <FiCheck className="text-emerald-400 text-xs" />
                            ) : (
                              <FiCopy className="text-xs" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Advocate */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">
                          {item.advocate?.name || item.advocate?.fullName || "Advocate"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.advocate?.phone || "-"}
                        </p>
                        {item.advocate?.barCouncilId && (
                          <p className="text-[10px] font-mono text-slate-500">
                            BC: {item.advocate.barCouncilId}
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap py-3.5 px-4 font-mono font-bold text-sm text-white">
                        ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200 font-medium">
                          {item.bank?.bankName || "-"}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {item.bank?.accountNumberMasked || "-"} • {item.bank?.ifsc || "-"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          A/C: {item.bank?.accountHolderName || "-"}
                        </p>
                      </td>

                      {/* Status & Warning Badges */}
                      <td className="whitespace-nowrap py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`
                              inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold
                              ${
                                isPaid
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : isApproved
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                  : isRequested
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }
                            `}
                          >
                            {st}
                          </span>

                          {/* Security Badges */}
                          {hasNewBank && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
                              <FiAlertTriangle className="text-[10px]" />
                              New bank account
                            </span>
                          )}

                          {hasNameMismatch && (
                            <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/20">
                              <FiAlertCircle className="text-[10px]" />
                              Name mismatch
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Requested At */}
                      <td className="whitespace-nowrap py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td
                        className="whitespace-nowrap py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/withdrawals/${item.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white"
                          >
                            Review
                            <FiExternalLink className="text-[10px]" />
                          </Link>

                          {canManage && isRequested && (
                            <button
                              type="button"
                              onClick={() => setApprovingItem(item)}
                              className="rounded-lg bg-blue-600/20 border border-blue-500/30 px-2.5 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30"
                            >
                              Approve
                            </button>
                          )}

                          {canManage && isApproved && (
                            <button
                              type="button"
                              onClick={() => {
                                setPayingItem(item);
                                setUtrNumber("");
                              }}
                              className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30"
                            >
                              Pay (UTR)
                            </button>
                          )}

                          {canManage && (isRequested || isApproved) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingItem(item);
                                setRejectionReason("");
                              }}
                              className="rounded-lg bg-red-600/20 border border-red-500/30 px-2 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-600/30"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-slate-800 p-4">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      <ConfirmModal
        open={Boolean(approvingItem)}
        title="Approve Withdrawal Request"
        description={`Are you sure you want to approve payout request ${approvingItem?.withdrawalId} for ₹${Number(approvingItem?.amount || 0).toFixed(2)} to ${approvingItem?.advocate?.name}? Status will transition to APPROVED.`}
        confirmLabel="Approve Request"
        cancelLabel="Cancel"
        tone="primary"
        loading={actionLoading}
        onCancel={() => setApprovingItem(null)}
        onConfirm={handleApprove}
      />

      {/* REJECT MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold">Reject Withdrawal</h3>
            <p className="mt-1 text-xs text-slate-400">
              Rejecting will release held funds (₹{Number(rejectingItem.amount).toFixed(2)}) back to the advocate&apos;s available balance immediately.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this request is being rejected (e.g., incorrect bank IFSC, name mismatch)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setRejectingItem(null)}
                className="rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || rejectionReason.trim().length < 5}
                onClick={handleReject}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK PAID MODAL WITH UTR */}
      {payingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold">Mark as Paid</h3>
            <p className="mt-1 text-xs text-slate-400">
              Enter the bank transfer UTR or transaction reference number for payout{" "}
              <strong className="text-amber-400">{payingItem.withdrawalId}</strong> (₹
              {Number(payingItem.amount).toFixed(2)}).
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                UTR / Reference Number <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. UTR123456789012"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setPayingItem(null)}
                className="rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || utrNumber.trim().length < 6}
                onClick={handleMarkPaid}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Mark as Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

