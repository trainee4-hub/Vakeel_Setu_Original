import React, { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Wallet,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowRight,
  HelpCircle,
  FileText,
} from "lucide-react";
import {
  getAdvocateEarnings,
  getAdvocateWithdrawals,
} from "../services/advocateEarningsApi";
import WithdrawalModal from "../components/earnings/WithdrawalModal";

export default function AdvocateEarnings() {
  const [activeTab, setActiveTab] = useState("ledger"); // 'ledger' | 'withdrawals'
  const [summary, setSummary] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [ledgerPagination, setLedgerPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("ALL");
  const [withdrawalPagination, setWithdrawalPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Load earnings & ledger
  const fetchEarningsData = useCallback(async (page = 1, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError("");

    try {
      const res = await getAdvocateEarnings({ page, limit: 15 });
      if (res?.summary) {
        setSummary(res.summary);
      }
      if (Array.isArray(res?.ledger)) {
        setLedger(res.ledger);
      }
      if (res?.pagination) {
        setLedgerPagination(res.pagination);
      }
    } catch (err) {
      setError(err?.message || "Failed to load earnings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load withdrawals list
  const fetchWithdrawalsData = useCallback(
    async (page = 1, status = withdrawalStatusFilter) => {
      try {
        const res = await getAdvocateWithdrawals({ page, limit: 10, status });
        if (Array.isArray(res?.withdrawals)) {
          setWithdrawals(res.withdrawals);
        }
        if (res?.pagination) {
          setWithdrawalPagination(res.pagination);
        }
      } catch (err) {
        // Silently handled or displayed in tab
      }
    },
    [withdrawalStatusFilter]
  );

  useEffect(() => {
    fetchEarningsData(1);
    fetchWithdrawalsData(1);
  }, [fetchEarningsData, fetchWithdrawalsData]);

  const handleWithdrawalSuccess = () => {
    setSuccessToast("Withdrawal request submitted successfully!");
    fetchEarningsData(1);
    fetchWithdrawalsData(1);
    setTimeout(() => setSuccessToast(""), 6000);
  };

  const available = summary?.available ?? 0;
  const isNegative = available < 0;
  const canWithdraw = Boolean(summary?.canWithdraw);
  const minWithdrawal = summary?.minWithdrawal || 500;
  const openWithdrawal = summary?.openWithdrawal;

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
    <main className="w-full max-w-none px-4 pb-16 pt-5 sm:px-6 sm:pt-6 lg:px-8 xl:px-10">
      <div className="w-full space-y-6">
        {/* Toast Notification */}
        {successToast && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{successToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessToast("")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TOP HERO HEADER */}
        <div className="flex flex-col justify-between gap-5 rounded-[26px] border border-slate-200/90 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.035)] sm:flex-row sm:items-center sm:p-7">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-600 shadow-sm">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Earnings & Withdrawals
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Track your consultation payouts, ledger passbook, and withdraw funds directly to your bank account.
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                fetchEarningsData(ledgerPagination.page || 1, true);
                fetchWithdrawalsData(withdrawalPagination.page || 1);
              }}
              disabled={refreshing}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-amber-500" : "text-slate-400"}`} />
              Refresh
            </button>

            {/* Withdraw Button with hint */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={!canWithdraw}
                className={`
                  inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 text-sm font-extrabold shadow-md transition-all
                  ${
                    canWithdraw
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98]"
                      : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 shadow-none"
                  }
                `}
              >
                <Wallet className="h-4 w-4" />
                Withdraw Funds
              </button>

              {/* Disabled Tooltip Hint */}
              {!canWithdraw && (
                <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-64 rounded-2xl border border-slate-200 bg-white p-3 text-center text-xs font-medium text-slate-600 shadow-xl group-hover:block">
                  {openWithdrawal ? (
                    <span className="text-amber-600 font-bold">
                      A withdrawal request is currently in process.
                    </span>
                  ) : available < minWithdrawal ? (
                    <span>
                      Minimum withdrawal balance is{" "}
                      <strong className="text-slate-900">₹{minWithdrawal.toLocaleString("en-IN")}</strong>.
                    </span>
                  ) : (
                    <span>No withdrawable balance available right now.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-950">
                Earnings data could not be refreshed
              </p>
              <p className="mt-0.5 text-xs text-amber-700">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchEarningsData(ledgerPagination.page || 1, true)}
              className="text-xs font-bold text-amber-900 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* 5 MODERN STAT CARDS */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 sm:gap-4">
          {/* 1. Available to Withdraw */}
          <div
            className={`
              flex flex-col justify-between rounded-[22px] border bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-0.5
              ${
                isNegative
                  ? "border-rose-200 ring-1 ring-rose-200/50"
                  : "border-slate-200/80"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Available to Withdraw
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  isNegative
                    ? "border-rose-100 bg-rose-50 text-rose-600"
                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
                }`}
              >
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4">
              <p
                className={`text-2xl font-black tracking-tight sm:text-[26px] ${
                  isNegative ? "text-rose-600" : "text-slate-950"
                }`}
              >
                ₹{Number(available).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              {isNegative ? (
                <p className="mt-1 text-[11px] font-bold text-rose-600">
                  Will be adjusted from future earnings
                </p>
              ) : (
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  Min. withdrawal ₹{minWithdrawal.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* 2. Pending Earnings */}
          <div className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                <Clock3 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-[26px]">
                ₹{Number(summary?.pending ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                From confirmed bookings in progress
              </p>
            </div>
          </div>

          {/* 3. In Process */}
          <div className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                In Process
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                <RefreshCw className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-[26px]">
                ₹{Number(summary?.inProcess ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                Requested or approved, not yet paid
              </p>
            </div>
          </div>

          {/* 4. Withdrawn */}
          <div className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Withdrawn
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-[26px]">
                ₹{Number(summary?.withdrawn ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                Successfully paid to your bank
              </p>
            </div>
          </div>

          {/* 5. Total Earned */}
          <div className="flex flex-col justify-between rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)] hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Earned
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-[26px]">
                ₹{Number(summary?.totalEarned ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                All-time consultation fees
              </p>
            </div>
          </div>
        </div>

        {/* MAIN LEDGER & WITHDRAWALS SECTION */}
        <section className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.035)] sm:p-7">
          {/* Segmented Toolbar Tabs */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`
                  inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm
                  ${
                    activeTab === "ledger"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/60 hover:text-amber-800"
                  }
                `}
              >
                <FileText className="h-4 w-4" />
                Earnings Ledger (Passbook)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("withdrawals")}
                className={`
                  inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition sm:text-sm
                  ${
                    activeTab === "withdrawals"
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/60 hover:text-amber-800"
                  }
                `}
              >
                <Building2 className="h-4 w-4" />
                My Withdrawals
                <span
                  className={`
                    rounded-full px-2 py-0.5 text-[10px] font-extrabold
                    ${
                      activeTab === "withdrawals"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-100 text-slate-600"
                    }
                  `}
                >
                  {withdrawals.length}
                </span>
              </button>
            </div>

            {/* Withdrawals Filter Pills */}
            {activeTab === "withdrawals" && (
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "REQUESTED", "APPROVED", "PAID", "REJECTED"].map((st) => {
                  const active = withdrawalStatusFilter === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setWithdrawalStatusFilter(st);
                        fetchWithdrawalsData(1, st);
                      }}
                      className={`
                        rounded-lg px-2.5 py-1 text-[11px] font-bold transition
                        ${
                          active
                            ? "bg-slate-950 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950"
                        }
                      `}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* TAB 1: EARNINGS LEDGER TABLE */}
          {activeTab === "ledger" && (
            <div className="mt-5">
              {loading ? (
                <div className="py-20 text-center text-slate-400">
                  <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-amber-500" />
                  <p className="text-sm font-semibold text-slate-600">Loading ledger records...</p>
                </div>
              ) : ledger.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    No ledger entries yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    When you complete client consultations, your consultation fees will automatically be credited here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="py-3.5 px-4">Date & Time</th>
                          <th className="py-3.5 px-4">Transaction / Description</th>
                          <th className="py-3.5 px-4">Reference</th>
                          <th className="py-3.5 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {ledger.map((entry) => {
                          const isCredit = entry.amount > 0;
                          return (
                            <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="whitespace-nowrap py-3.5 px-4 font-mono text-xs text-slate-500 font-medium">
                                {formatDate(entry.createdAt)}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                                      isCredit
                                        ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                        : "border-rose-100 bg-rose-50 text-rose-600"
                                    }`}
                                  >
                                    {isCredit ? (
                                      <ArrowDownLeft className="h-4 w-4" />
                                    ) : (
                                      <ArrowUpRight className="h-4 w-4" />
                                    )}
                                  </span>
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">
                                      {entry.label || entry.type}
                                    </p>
                                    {entry.booking && (
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Client: <strong className="text-slate-700">{entry.booking.userName}</strong> • Mode:{" "}
                                        <span className="font-medium text-slate-600">{entry.booking.mode}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap py-3.5 px-4">
                                <span className="inline-block rounded-lg border border-slate-200/70 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                                  {entry.booking?.bookingId || entry.withdrawalId || "-"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap py-3.5 px-4 text-right font-mono font-black text-sm sm:text-base">
                                <span className={isCredit ? "text-emerald-600" : "text-rose-600"}>
                                  {isCredit ? "+" : "-"}
                                  ₹{Math.abs(entry.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Ledger Pagination */}
                  {ledgerPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-slate-600">
                      <span>
                        Showing Page {ledgerPagination.page} of {ledgerPagination.totalPages} ({ledgerPagination.total} entries)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={ledgerPagination.page <= 1}
                          onClick={() => fetchEarningsData(ledgerPagination.page - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={ledgerPagination.page >= ledgerPagination.totalPages}
                          onClick={() => fetchEarningsData(ledgerPagination.page + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY WITHDRAWALS TABLE */}
          {activeTab === "withdrawals" && (
            <div className="mt-5">
              {withdrawals.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    No withdrawal requests found
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                    {withdrawalStatusFilter !== "ALL"
                      ? `No ${withdrawalStatusFilter.toLowerCase()} requests matching this filter.`
                      : "You have not submitted any bank withdrawal requests yet."}
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="py-3.5 px-4">Withdrawal ID</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Bank Account</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">UTR / Remarks</th>
                          <th className="py-3.5 px-4">Requested Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {withdrawals.map((item) => {
                          const st = item.status;
                          const isPaid = st === "PAID";
                          const isRejected = st === "REJECTED";
                          const isApproved = st === "APPROVED";
                          const isRequested = st === "REQUESTED";

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="whitespace-nowrap py-3.5 px-4 font-mono font-bold text-slate-900">
                                {item.withdrawalId}
                              </td>
                              <td className="whitespace-nowrap py-3.5 px-4 font-mono font-black text-sm sm:text-base text-slate-950">
                                ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-900">{item.bank?.bankName || "-"}</p>
                                <p className="text-xs font-mono text-slate-500 mt-0.5">
                                  {item.bank?.accountNumberMasked || "-"} • IFSC: {item.bank?.ifsc || "-"}
                                </p>
                              </td>
                              <td className="whitespace-nowrap py-3.5 px-4">
                                <span
                                  className={`
                                    inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border
                                    ${
                                      isPaid
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : isApproved
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : isRequested
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }
                                  `}
                                >
                                  {st}
                                </span>
                                <p className="mt-1 text-[11px] font-medium text-slate-400">
                                  {isRequested && "Waiting for admin review"}
                                  {isApproved && "Transfer in progress"}
                                  {isPaid && "Disbursed to bank"}
                                  {isRejected && "Rejected (funds released)"}
                                </p>
                              </td>
                              <td className="py-3.5 px-4 text-xs">
                                {isPaid && item.utr && (
                                  <div>
                                    <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono font-bold text-emerald-700">
                                      UTR: {item.utr}
                                    </span>
                                    {item.paidAt && (
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        Paid: {formatDate(item.paidAt)}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {isRejected && (
                                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700">
                                    <p className="font-bold text-[11px]">Reason:</p>
                                    <p className="text-xs mt-0.5">{item.rejectionReason || "Criteria not met"}</p>
                                  </div>
                                )}
                                {!isPaid && !isRejected && <span className="text-slate-400">-</span>}
                              </td>
                              <td className="whitespace-nowrap py-3.5 px-4 font-mono text-xs text-slate-500 font-medium">
                                {formatDate(item.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Withdrawals */}
                  {withdrawalPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-slate-600">
                      <span>
                        Showing Page {withdrawalPagination.page} of {withdrawalPagination.totalPages} ({withdrawalPagination.total} requests)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={withdrawalPagination.page <= 1}
                          onClick={() => fetchWithdrawalsData(withdrawalPagination.page - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={withdrawalPagination.page >= withdrawalPagination.totalPages}
                          onClick={() => fetchWithdrawalsData(withdrawalPagination.page + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* WITHDRAWAL MODAL */}
        <WithdrawalModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          summary={summary}
          onSuccess={handleWithdrawalSuccess}
        />
      </div>
    </main>
  );
}
