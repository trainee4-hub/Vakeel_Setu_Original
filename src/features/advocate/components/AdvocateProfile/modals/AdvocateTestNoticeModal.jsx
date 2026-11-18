import React from "react";
import { createPortal } from "react-dom";
import { Mail, Clock, ShieldCheck, X, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdvocateTestNoticeModal({
  isOpen,
  onClose,
  testData = null,
  fallbackMessage = "Your profile has been submitted for approval.",
}) {
  if (!isOpen) return null;

  const isRequired = Boolean(testData?.required);
  const isLinkAlreadySent = Boolean(testData?.linkAlreadySent);
  const isScheduled = Boolean(testData?.scheduled);
  const emailSentTo = testData?.emailSentTo || "";
  const expiresAt = testData?.expiresAt;

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
            {isRequired ? <Mail className="h-7 w-7 text-amber-600" /> : <CheckCircle2 className="h-7 w-7 text-emerald-600" />}
          </div>

          <h3 className="mt-4 text-xl font-extrabold text-slate-950">
            {isRequired ? "Qualification Test Required" : "Profile Submitted"}
          </h3>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {isRequired ? (
              isScheduled ? (
                "Your test link will reach your email within 2 hours."
              ) : isLinkAlreadySent ? (
                "A test link was already sent to your registered email address."
              ) : (
                testData?.message ||
                "Your profile has been submitted for approval. Before that, you need to complete a test. The link has been sent to your email."
              )
            ) : (
              fallbackMessage
            )}
          </p>
        </div>

        {/* Metadata Details Pill */}
        {isRequired && (emailSentTo || formattedExpiry) && (
          <div className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-950">
            {emailSentTo && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-slate-600">Dispatched To:</span>
                <span className="font-bold text-slate-900 truncate">{emailSentTo}</span>
              </div>
            )}
            {formattedExpiry && (
              <div className="mt-2 flex items-center gap-2 border-t border-amber-200/50 pt-2 text-[11px] text-slate-600">
                <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Valid until:</span>
                <span className="font-semibold text-slate-900">{formattedExpiry}</span>
              </div>
            )}
          </div>
        )}

        {isRequired && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Assessment Parameters</span>
            </p>
            <p>• 20 random legal questions · 20 minutes countdown</p>
            <p>• Minimum 15 correct answers required to qualify</p>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
          >
            {isRequired ? "I Understand, Check Email" : "Continue to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}

