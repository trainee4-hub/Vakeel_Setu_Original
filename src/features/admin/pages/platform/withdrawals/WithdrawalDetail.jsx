import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@shared/components/ui/PageHeader";
import ConfirmModal from "@shared/components/ui/ConfirmModal";
import { ErrorState } from "@shared/components/feedback/ErrorState";
import { useToast } from "@shared/components/ui/Toast";
import useAdminAuth from "../../../hooks/useAdminAuth";
import { ADMIN_PERMISSIONS } from "../../../utils/permissions";
import {
  getAdminWithdrawalDetail,
  approveWithdrawal,
  markPaidWithdrawal,
  rejectWithdrawal,
} from "../../../services/platform/adminWithdrawalsApi";
import {
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiShield,
  FiUser,
  FiCreditCard,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";

export default function WithdrawalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { has } = useAdminAuth();

  const canManage = has(ADMIN_PERMISSIONS.PAYOUTS_MANAGE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawal, setWithdrawal] = useState(null);

  // Actions
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminWithdrawalDetail(id);
      if (res?.withdrawal) {
        setWithdrawal(res.withdrawal);
      } else {
        setError("Withdrawal request not found.");
      }
    } catch (err) {
      setError(err?.message || "Failed to load withdrawal details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveWithdrawal(withdrawal.id);
      toast.show("Withdrawal approved successfully.", "success");
      setShowApproveModal(false);
      loadDetail();
    } catch (err) {
      toast.show(err?.message || "Failed to approve withdrawal.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = rejectionReason.trim();
    if (!reason || reason.length < 5) {
      toast.show("Please enter a rejection reason (min 5 chars).", "error");
      return;
    }
    setActionLoading(true);
    try {
      await rejectWithdrawal(withdrawal.id, { reason });
      toast.show("Withdrawal rejected and held funds released.", "info");
      setShowRejectModal(false);
      setRejectionReason("");
      loadDetail();
    } catch (err) {
      toast.show(err?.message || "Failed to reject withdrawal.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    const utr = utrNumber.trim();
    if (!utr || utr.length < 6) {
      toast.show("Please enter a valid UTR / transaction reference number.", "error");
      return;
    }
    setActionLoading(true);
    try {
      await markPaidWithdrawal(withdrawal.id, {
        utr,
        paidAt: new Date().toISOString(),
      });
      toast.show("Withdrawal marked as PAID.", "success");
      setShowPaidModal(false);
      setUtrNumber("");
      loadDetail();
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

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <FiRefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-amber-400" />
        <p className="text-sm">Loading withdrawal details...</p>
      </div>
    );
  }

  if (error || !withdrawal) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/withdrawals"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
        >
          <FiArrowLeft /> Back to Withdrawals
        </Link>
        <ErrorState
          title="Withdrawal not found"
          message={error || "Could not find withdrawal record."}
          onRetry={loadDetail}
        />
      </div>
    );
  }

  const st = withdrawal.status;
  const isRequested = st === "REQUESTED";
  const isApproved = st === "APPROVED";
  const isPaid = st === "PAID";
  const isRejected = st === "REJECTED";

  const bank = withdrawal.bank || {};
  const adv = withdrawal.advocate || {};
  const flags = withdrawal.flags || {};
  const summary = withdrawal.advocateSummary || {};
  const history = withdrawal.reviewHistory || {};

  // Unmasked account number (only available if backend returns it for payouts:manage)
  const displayAccountNumber = bank.accountNumber || bank.accountNumberMasked || "-";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/withdrawals"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <FiArrowLeft /> Back to Withdrawals
        </Link>

        {/* Action Buttons */}
        {canManage && (
          <div className="flex items-center gap-2">
            {isRequested && (
              <button
                type="button"
                onClick={() => setShowApproveModal(true)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
              >
                Approve Request
              </button>
            )}

            {isApproved && (
              <button
                type="button"
                onClick={() => setShowPaidModal(true)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500"
              >
                Mark as Paid (Enter UTR)
              </button>
            )}

            {(isRequested || isApproved) && (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="rounded-xl bg-red-600/20 border border-red-500/30 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-600/30"
              >
                Reject Request
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Header Card */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xl font-black text-amber-400">
              {withdrawal.withdrawalId}
            </span>
            <span
              className={`
                rounded-md px-2.5 py-0.5 text-xs font-bold
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
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Requested on {formatDate(withdrawal.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Withdrawal Amount
          </p>
          <p className="font-mono text-3xl font-black text-white">
            ₹{Number(withdrawal.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Security Warnings if any */}
      {(flags.bankAccountChanged || flags.holderNameMatches === false) && (
        <div className="space-y-2">
          {flags.bankAccountChanged && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              <FiAlertTriangle className="text-base shrink-0 text-amber-400" />
              <span>
                <strong>Warning:</strong> This advocate has provided a new/different bank account compared to prior payouts. Verify before approving.
              </span>
            </div>
          )}
          {flags.holderNameMatches === false && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <FiAlertCircle className="text-base shrink-0 text-red-400" />
              <span>
                <strong>High Risk:</strong> Bank account holder name (&quot;{bank.accountHolderName}&quot;) does not match the advocate profile name (&quot;{adv.fullName || adv.name}&quot;).
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid: Bank Details & Advocate Profile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bank Account Details Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <FiCreditCard />
            </div>
            <h3 className="font-bold text-white text-sm">Disbursement Bank Details</h3>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div>
              <p className="text-slate-400">Account Holder Name</p>
              <p className="font-semibold text-white text-sm">{bank.accountHolderName || "-"}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400">Account Number</p>
                <p className="font-mono font-bold text-base text-amber-400 tracking-wider">
                  {displayAccountNumber}
                </p>
              </div>
              {bank.accountNumber && (
                <button
                  type="button"
                  onClick={() => handleCopy(bank.accountNumber, "acc")}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-slate-300 hover:text-white"
                >
                  {copiedField === "acc" ? (
                    <>
                      <FiCheck className="text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <FiCopy /> Copy A/C
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-slate-400">Bank Name</p>
                <p className="font-semibold text-slate-200">{bank.bankName || "-"}</p>
              </div>

              <div>
                <p className="text-slate-400">IFSC Code</p>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-slate-200">{bank.ifsc || "-"}</span>
                  {bank.ifsc && (
                    <button
                      type="button"
                      onClick={() => handleCopy(bank.ifsc, "ifsc")}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedField === "ifsc" ? <FiCheck className="text-emerald-400 text-xs" /> : <FiCopy className="text-xs" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advocate Profile & Balance Summary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <FiUser />
            </div>
            <h3 className="font-bold text-white text-sm">Advocate Profile & Earnings</h3>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">{adv.fullName || adv.name || "Advocate"}</p>
                <p className="text-slate-400">{adv.phone} • {adv.email || "-"}</p>
                {adv.barCouncilId && (
                  <p className="font-mono text-slate-400">Bar Council ID: {adv.barCouncilId}</p>
                )}
              </div>
              {adv.id && (
                <Link
                  to={`/admin/advocates/${adv.id}`}
                  className="rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                >
                  View Profile
                </Link>
              )}
            </div>

            {/* Current Balance Snapshot */}
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Available</p>
                <p className="font-mono font-bold text-emerald-400">
                  ₹{Number(summary.available ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Pending</p>
                <p className="font-mono font-bold text-amber-400">
                  ₹{Number(summary.pending ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Withdrawn</p>
                <p className="font-mono font-bold text-purple-400">
                  ₹{Number(summary.withdrawn ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle / Review History */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl text-xs">
        <h4 className="font-bold text-white text-sm mb-3">Audit & Review History</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-slate-400 font-medium">Approved Details</p>
            {history.approvedAt ? (
              <div className="mt-1">
                <p className="text-white font-semibold">Approved</p>
                <p className="text-slate-400 text-[11px]">{formatDate(history.approvedAt)}</p>
                {history.approvedBy && (
                  <p className="text-slate-500 text-[10px]">By: {history.approvedBy}</p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 mt-1">Pending approval</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-slate-400 font-medium">Payment & UTR Details</p>
            {history.paidAt ? (
              <div className="mt-1">
                <p className="text-emerald-400 font-bold font-mono">UTR: {history.utr || "PAID"}</p>
                <p className="text-slate-400 text-[11px]">{formatDate(history.paidAt)}</p>
                {history.paidBy && (
                  <p className="text-slate-500 text-[10px]">By: {history.paidBy}</p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 mt-1">Not disbursed yet</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-slate-400 font-medium">Rejection Details</p>
            {history.rejectedAt ? (
              <div className="mt-1 text-red-400">
                <p className="font-semibold">Rejected</p>
                <p className="text-[11px]">{history.rejectionReason || "No reason given"}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{formatDate(history.rejectedAt)}</p>
              </div>
            ) : (
              <p className="text-slate-500 mt-1">Not rejected</p>
            )}
          </div>
        </div>
      </div>

      {/* APPROVE CONFIRMATION MODAL */}
      <ConfirmModal
        open={showApproveModal}
        title="Approve Withdrawal Request"
        description={`Approve payout of ₹${Number(withdrawal.amount).toFixed(2)} to ${bank.bankName} (${bank.accountHolderName})? Status will transition to APPROVED.`}
        confirmLabel="Approve"
        cancelLabel="Cancel"
        tone="primary"
        loading={actionLoading}
        onCancel={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
      />

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold">Reject Withdrawal</h3>
            <p className="mt-1 text-xs text-slate-400">
              Rejecting releases ₹{Number(withdrawal.amount).toFixed(2)} back to the advocate&apos;s available balance immediately.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowRejectModal(false)}
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

      {/* MARK PAID MODAL */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h3 className="text-lg font-bold">Mark as Paid</h3>
            <p className="mt-1 text-xs text-slate-400">
              Enter bank transfer UTR or transaction reference number for ₹
              {Number(withdrawal.amount).toFixed(2)}.
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
                onClick={() => setShowPaidModal(false)}
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

