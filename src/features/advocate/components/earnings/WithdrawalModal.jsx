import React, { useState, useEffect } from "react";
import {
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiShield,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import {
  getPayoutAccount,
  submitAdvocateWithdrawal,
} from "../../services/advocateEarningsApi";

export default function WithdrawalModal({
  isOpen,
  onClose,
  summary,
  onSuccess,
}) {
  const available = summary?.available || 0;
  const minWithdrawal = summary?.minWithdrawal || 500;

  const [amount, setAmount] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");

  const [savedAccount, setSavedAccount] = useState(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch saved payout bank account on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingSaved(true);
    setErrorMessage("");
    setShowConfirm(false);

    getPayoutAccount()
      .then((res) => {
        if (!isMounted) return;
        const acc = res?.account;
        if (acc) {
          setSavedAccount(acc);
          setAccountHolderName(acc.accountHolderName || "");
          setIfsc(acc.ifsc || "");
          setBankName(acc.bankName || "");
        }
      })
      .catch(() => {
        // Silently ignore if no saved account or error
      })
      .finally(() => {
        if (isMounted) setLoadingSaved(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleWithdrawAll = () => {
    if (available >= minWithdrawal) {
      setAmount(String(available));
    }
  };

  const handleIfscChange = (e) => {
    setIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11));
  };

  const handleAccountNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 18);
    setAccountNumber(digits);
  };

  const handleConfirmAccountNumberChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 18);
    setConfirmAccountNumber(digits);
  };

  const validate = () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount)) {
      return "Please enter a valid withdrawal amount.";
    }
    if (numAmount < minWithdrawal) {
      return `Withdrawal amount must be at least ₹${minWithdrawal.toLocaleString("en-IN")}.`;
    }
    if (numAmount > available) {
      return `Amount exceeds your available balance of ₹${available.toLocaleString("en-IN")}.`;
    }
    if (!accountHolderName.trim() || accountHolderName.trim().length < 2) {
      return "Account holder name must be at least 2 characters long.";
    }
    if (!accountNumber || accountNumber.length < 9) {
      return "Account number must be between 9 and 18 digits.";
    }
    if (accountNumber !== confirmAccountNumber) {
      return "Account numbers do not match.";
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc)) {
      return "Invalid IFSC code format (e.g., HDFC0001234 or SBIN0001234).";
    }
    if (!bankName.trim() || bankName.trim().length < 2) {
      return "Please enter your bank name.";
    }
    return null;
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const err = validate();
    if (err) {
      setErrorMessage(err);
      return;
    }

    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      await submitAdvocateWithdrawal({
        amount: Number(amount),
        accountHolderName,
        accountNumber,
        confirmAccountNumber,
        ifsc,
        bankName,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setShowConfirm(false);
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to submit withdrawal request. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const last4 = accountNumber.slice(-4) || "XXXX";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal Card */}
      <div
        className="
          relative
          w-full
          max-w-lg
          max-h-[90vh]
          overflow-y-auto
          rounded-[26px]
          border
          border-slate-200/90
          bg-white
          p-6
          shadow-2xl
          text-slate-900
          sm:p-7
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/70 bg-amber-50 text-amber-600 shadow-sm">
              <FaRupeeSign className="text-base" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950">
                Request Withdrawal
              </h3>
              <p className="text-xs text-slate-500">
                Transfer consultation earnings to your bank account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Available Balance Notice */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50/70 to-emerald-50/70 p-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Available to Withdraw
            </p>
            <p className="text-2xl font-black tracking-tight text-emerald-700">
              ₹{available.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-500">Minimum Payout</p>
            <p className="text-xs font-bold text-slate-800">
              ₹{minWithdrawal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Saved Bank Indicator */}
        {savedAccount && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950">
            <span>
              Saved Account: <strong className="font-bold text-slate-900">{savedAccount.bankName}</strong> ({savedAccount.accountNumberMasked})
            </span>
            <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 uppercase">
              Auto-Filled
            </span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
            <FiAlertCircle className="mt-0.5 shrink-0 text-sm text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* CONFIRMATION STEP */}
        {showConfirm ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
              <FiShield className="text-2xl" />
            </div>
            <h4 className="text-lg font-black text-slate-950">Confirm Bank Payout</h4>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to withdraw{" "}
              <strong className="font-black text-slate-950">
                ₹{Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>{" "}
              to <strong className="font-bold text-slate-900">{bankName}</strong> (Account ending in <strong>{last4}</strong>)?
            </p>
            <p className="mt-2 text-xs text-slate-500">
              This amount will be placed on hold immediately while the platform administrator reviews and disburses the transfer.
            </p>

            <div className="mt-6 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <FiLoader className="animate-spin text-base" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleInitialSubmit} className="mt-5 space-y-4">
            {/* Amount Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Amount to Withdraw (₹) <span className="text-amber-600">*</span>
                </label>
                {available >= minWithdrawal && (
                  <button
                    type="button"
                    onClick={handleWithdrawAll}
                    className="text-xs font-extrabold text-amber-600 hover:text-amber-700"
                  >
                    Withdraw All (₹{available.toFixed(2)})
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={minWithdrawal}
                  max={available}
                  placeholder={`Min ₹${minWithdrawal}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50/60
                    py-2.5
                    pl-8
                    pr-3.5
                    text-sm
                    font-bold
                    text-slate-950
                    placeholder-slate-400
                    focus:bg-white
                    focus:border-amber-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-amber-500/20
                    transition
                  "
                />
              </div>
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Account Holder Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name as per official bank records"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>

            {/* Account Number & Confirm Account Number */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Account Number <span className="text-amber-600">*</span>
                </label>
                <input
                  type="password"
                  placeholder="9–18 digit number"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-sm font-mono tracking-wider text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Confirm Account Number <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Re-enter account number"
                  value={confirmAccountNumber}
                  onChange={handleConfirmAccountNumberChange}
                  onPaste={(e) => {
                    e.preventDefault();
                    setErrorMessage("Pasting into confirm account number is disabled for security.");
                  }}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-sm font-mono tracking-wider text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            </div>

            {/* IFSC Code & Bank Name */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  IFSC Code <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={ifsc}
                  onChange={handleIfscChange}
                  required
                  maxLength={11}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-sm font-mono uppercase tracking-wider text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bank Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Bank of India"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            </div>

            {/* Note */}
            <p className="text-[11px] text-slate-500 leading-normal pt-1">
              * Bank account numbers are encrypted at rest with AES-256-GCM. We never share your full bank details.
            </p>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || available < minWithdrawal}
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-amber-500
                  to-amber-600
                  px-6
                  text-xs
                  font-extrabold
                  text-slate-950
                  shadow-md
                  shadow-amber-500/20
                  hover:from-amber-400
                  hover:to-amber-500
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  transition-all
                "
              >
                Proceed to Withdraw
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
