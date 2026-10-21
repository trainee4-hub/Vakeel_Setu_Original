import {
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiCalendar,
  FiHash,
  FiCreditCard,
} from "react-icons/fi";
import {
  formatPaiseToRupees,
  formatPaymentDate,
} from "../../utils/paymentUtils";

/* ================================================================
   1. CONFIRMING SCREEN
   Spinner + "Please don't close or refresh this page"
================================================================ */

export const PaymentConfirmingView = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-fade-in">
      {/* Outer Pulse Spinner */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <div className="absolute h-full w-full animate-ping rounded-full bg-amber-400/20" />
        <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
          <FiRefreshCw className="h-6 w-6 animate-spin text-amber-600" />
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-widest text-amber-600">
        Processing Payment
      </p>

      <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
        Confirming your booking...
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Please don't close or refresh this page while we confirm your payment with the bank.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs text-slate-500">
        <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
        <span>Communicating securely with payment gateway</span>
      </div>
    </div>
  );
};

/* ================================================================
   2. SUCCESS SCREEN
   "Booking confirmed", package, amount, Payment ID, Order ID,
   date, "Our team will contact you within 7 working days",
   button → My Consultancies
================================================================ */

export const PaymentSuccessView = ({
  paymentResult,
  onNavigateToBookings,
  onClose,
}) => {
  const pkg = paymentResult?.package;
  const packageTitle =
    pkg?.title ||
    `${pkg?.callType === "VIDEO_CALL" ? "Video Consultation" : "Voice Consultation"} (${pkg?.duration || 15} mins)`;

  const amountDisplay = paymentResult?.amountRupees
    ? `₹${Number(paymentResult.amountRupees).toLocaleString("en-IN")}`
    : paymentResult?.amount
      ? formatPaiseToRupees(paymentResult.amount)
      : pkg?.price
        ? `₹${pkg.price}`
        : "Paid";

  const orderId = paymentResult?.orderId || paymentResult?.checkoutId || null;
  const paymentId = paymentResult?.paymentId || null;
  const formattedDate = formatPaymentDate(paymentResult?.paidAt || new Date());

  return (
    <div className="flex flex-col items-center py-6 px-4 text-center animate-fade-in">
      {/* Check Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
        <FiCheck className="text-3xl stroke-[3]" />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-widest text-emerald-600">
        Payment Successful
      </p>

      <h3 className="mt-1 text-2xl font-black text-slate-900">
        Booking confirmed
      </h3>

      <p className="mt-1.5 text-sm text-slate-500">
        Your legal consultation request has been successfully scheduled.
      </p>

      {/* Summary Card */}
      <div className="mt-5 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Selected Package
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {packageTitle}
            </p>
          </div>
          <span className="text-base font-black text-slate-950">
            {amountDisplay}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-600">
          {paymentId ? (
            <>
              <div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <FiCreditCard className="size-3" />
                  <span>Payment ID</span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] font-bold text-slate-800 truncate" title={paymentId}>
                  {paymentId}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <FiHash className="size-3" />
                  <span>Order ID</span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] font-bold text-slate-800 truncate" title={orderId || ""}>
                  {orderId || "—"}
                </p>
              </div>
            </>
          ) : (
            <div className="col-span-2">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <FiHash className="size-3" />
                <span>Order ID</span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] font-bold text-slate-800 truncate" title={orderId || ""}>
                {orderId || "—"}
              </p>
            </div>
          )}

          <div className="col-span-2">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <FiCalendar className="size-3" />
              <span>Date</span>
            </div>
            <p className="mt-0.5 font-semibold text-slate-800">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Notice */}
      <div className="mt-4 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-left">
        <p className="text-xs font-bold leading-5 text-amber-900">
          📞 Our team will contact you within 7 working days to connect you with your legal expert.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex w-full max-w-md flex-col gap-2">
        <button
          type="button"
          onClick={onNavigateToBookings}
          className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-amber-500"
        >
          My Consultancies
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[40px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ================================================================
   3. FAILED SCREEN
   "Payment failed. No money was deducted; if it was, it will be
   auto-refunded by your bank." + Try again
================================================================ */

export const PaymentFailedView = ({
  errorMessage,
  onTryAgain,
  onClose,
}) => {
  return (
    <div className="flex flex-col items-center py-8 px-4 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
        <FiAlertCircle className="text-3xl" />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-widest text-red-600">
        Transaction Incomplete
      </p>

      <h3 className="mt-1 text-2xl font-black text-slate-900">
        Payment failed
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        No money was deducted; if it was, it will be auto-refunded by your bank.
      </p>

      {errorMessage && (
        <div className="mt-4 w-full max-w-md rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-semibold leading-5 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex w-full max-w-md flex-col gap-2">
        <button
          type="button"
          onClick={onTryAgain}
          className="flex min-h-[46px] w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-amber-500"
        >
          Try again
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[40px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ================================================================
   4. PROCESSING SCREEN
   "Your bank is still confirming the payment. Please do not pay
   again." + Check status. Hide Pay for this package.
================================================================ */

export const PaymentProcessingView = ({
  onCheckStatus,
  onClose,
}) => {
  return (
    <div className="flex flex-col items-center py-8 px-4 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
        <FiClock className="text-3xl" />
      </div>

      <p className="mt-4 text-xs font-black uppercase tracking-widest text-amber-700">
        Processing At Bank
      </p>

      <h3 className="mt-1 text-2xl font-black text-slate-900">
        Payment Processing
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Your bank is still confirming the payment. Please do not pay again.
      </p>

      <div className="mt-4 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
        <p className="text-xs font-semibold leading-5 text-amber-900">
          We are waiting for final confirmation from your bank or payment provider. Once confirmed, your consultancy will automatically appear under My Consultancies.
        </p>
      </div>

      <div className="mt-6 flex w-full max-w-md flex-col gap-2">
        <button
          type="button"
          onClick={onCheckStatus}
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-amber-500"
        >
          <FiRefreshCw className="size-4" />
          <span>Check status</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[40px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};
