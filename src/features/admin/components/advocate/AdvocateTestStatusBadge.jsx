import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  History,
  RefreshCw,
  X,
  Award,
} from "lucide-react";
import { getAdvocateTestAttempts } from "../../services/platform/adminTestQuestionsApi";

export const TEST_STATUS_CONFIG = {
  PASSED: {
    label: "Passed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle,
  },
  LINK_SENT: {
    label: "Link sent",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Send,
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  LINK_EXPIRED: {
    label: "Link expired",
    className: "border-slate-200 bg-slate-100 text-slate-700",
    icon: Clock,
  },
  RESCHEDULE_REQUESTED: {
    label: "Reschedule requested",
    className: "border-purple-200 bg-purple-50 text-purple-800",
    icon: RefreshCw,
  },
  NOT_SENT: {
    label: "Not sent",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: AlertCircle,
  },
  NOT_REQUIRED: {
    label: "Not required",
    className: "border-slate-200 bg-slate-50 text-slate-500",
    icon: HelpCircle,
  },
};

export function AdvocateTestChip({ status }) {
  if (!status) return null;
  const normalized = String(status).toUpperCase();
  const cfg = TEST_STATUS_CONFIG[normalized] || {
    label: normalized,
    className: "border-slate-200 bg-slate-50 text-slate-600",
    icon: HelpCircle,
  };
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.className}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
}

export function AdvocateTestDetailCard({ test, advocateId, advocateName }) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [historyError, setHistoryError] = useState("");

  if (!test && !advocateId) return null;

  const testStatus = test?.status || "NOT_REQUIRED";
  const attemptsCount = test?.attemptsCount ?? 0;
  const latest = test?.latest;
  const best = test?.best;
  const passedAt = test?.passedAt;

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await getAdvocateTestAttempts(advocateId);
      setHistoryAttempts(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Test attempts fetch error:", err);
      setHistoryError(err?.message || "Failed to load test attempt history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Qualification Test Status
            </h4>
          </div>
          <AdvocateTestChip status={testStatus} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          {latest && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Latest Score
              </span>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {latest.correct ?? 0} correct · {latest.wrong ?? 0} wrong
              </p>
              <p className="text-[11px] text-slate-500">
                Total {latest.total ?? 20} questions {latest.autoSubmitted ? "(Auto-submitted)" : ""}
              </p>
            </div>
          )}

          {best && (
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Best Score
              </span>
              <p className="mt-1 text-sm font-extrabold text-emerald-700">
                {best.correct ?? 0} correct · {best.wrong ?? 0} wrong
              </p>
              <p className="text-[11px] text-slate-500">
                Total {best.total ?? 20} questions
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Attempts Count
            </span>
            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {attemptsCount} {attemptsCount === 1 ? "attempt" : "attempts"}
            </p>
            {passedAt && (
              <p className="text-[11px] text-emerald-700 font-semibold">
                Passed on: {new Date(passedAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-3">
            <button
              type="button"
              onClick={handleOpenHistory}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-950 transition"
            >
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span>View Test History</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-950">
                  Test Attempts History
                </h3>
                <p className="text-xs text-slate-500">
                  {advocateName ? `Advocate: ${advocateName}` : "Recorded assessment logs"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {historyLoading ? (
              <div className="flex h-40 items-center justify-center">
                <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
                <span className="ml-2 text-xs font-bold text-slate-500">
                  Loading test attempts...
                </span>
              </div>
            ) : historyError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                {historyError}
              </div>
            ) : historyAttempts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                No individual test attempts recorded yet.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {historyAttempts.map((attempt, idx) => {
                  const isPassed = Boolean(attempt.passed);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            Attempt #{idx + 1}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isPassed
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isPassed ? "PASSED" : "FAILED"}
                          </span>
                          {attempt.autoSubmitted && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] text-slate-500">
                              Timer Expired
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Started: {attempt.startedAt ? new Date(attempt.startedAt).toLocaleString("en-IN") : "—"}
                        </p>
                      </div>

                      <div className="text-right sm:text-right">
                        <span className="font-black text-slate-900">
                          {attempt.correctCount ?? 0} correct · {attempt.wrongCount ?? 0} wrong
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Submitted: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString("en-IN") : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

