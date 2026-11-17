import React, { useState, useMemo } from "react";
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

function formatAttemptDuration(startedAt, submittedAt) {
  if (!startedAt || !submittedAt) return "—";
  const start = new Date(startedAt).getTime();
  const end = new Date(submittedAt).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return "—";
  const diffSecs = Math.round((end - start) / 1000);
  const mins = Math.floor(diffSecs / 60);
  const secs = diffSecs % 60;
  if (mins === 0) return `${secs} sec${secs === 1 ? "" : "s"}`;
  if (secs === 0) return `${mins} min${mins === 1 ? "" : "s"}`;
  return `${mins}m ${secs}s`;
}

export function AdvocateTestDetailCard({ test, advocateId, advocateName }) {
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [modalError, setModalError] = useState("");

  if (!test && !advocateId) return null;

  const testStatus = (test?.status || "NOT_REQUIRED").toUpperCase();
  const attemptsCount = test?.attemptsCount ?? 0;
  const scoreData = test?.latest || test?.best || null;
  const passedAt = test?.passedAt;

  const handleOpenHistory = async () => {
    setShowModal(true);
    setModalLoading(true);
    setModalError("");
    try {
      const attemptsRes = await getAdvocateTestAttempts(advocateId);
      const attemptsList = Array.isArray(attemptsRes?.data) ? attemptsRes.data : [];
      setAttempts(attemptsList);
    } catch (err) {
      console.error("Test attempts history load error:", err);
      setModalError(err?.message || "Failed to load test attempt history.");
    } finally {
      setModalLoading(false);
    }
  };

  // Sort chronologically (oldest first) to accurately assign attempt numbers
  const chronologicalAttempts = useMemo(() => {
    return [...attempts].sort(
      (a, b) => new Date(a.startedAt || a.submittedAt || 0) - new Date(b.startedAt || b.submittedAt || 0)
    );
  }, [attempts]);

  // Display newest first, with accurate Attempt #
  const displayAttempts = useMemo(() => {
    return [...chronologicalAttempts].reverse().map((attempt) => {
      const originalIdx = chronologicalAttempts.indexOf(attempt);
      return {
        ...attempt,
        attemptNumber: originalIdx + 1,
        isLatest: originalIdx === chronologicalAttempts.length - 1,
      };
    });
  }, [chronologicalAttempts]);

  // Comparison data if 2 or more attempts exist
  const comparison = useMemo(() => {
    if (chronologicalAttempts.length < 2) return null;
    const initial = chronologicalAttempts[0];
    const latest = chronologicalAttempts[chronologicalAttempts.length - 1];

    return {
      initial,
      latest,
    };
  }, [chronologicalAttempts]);

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Qualification Test Status
            </h4>
          </div>
          {testStatus !== "RESCHEDULE_REQUESTED" && testStatus !== "FAILED" && (
            <AdvocateTestChip status={testStatus} />
          )}
        </div>

        {/* Status Banners */}
        {testStatus === "RESCHEDULE_REQUESTED" && (
          <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-4 text-purple-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-200 text-purple-800 shadow-2xs">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-purple-950">
                    Reschedule Requested
                  </h5>
                  <span className="rounded-full bg-purple-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-800">
                    Pending Link
                  </span>
                </div>
                <p className="mt-1 text-xs text-purple-800 leading-relaxed">
                  Advocate has requested to reschedule the qualification test. A fresh link will be sent to their email.
                </p>
              </div>
            </div>
          </div>
        )}

        {testStatus === "FAILED" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-200 text-rose-800 shadow-2xs">
                <XCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-rose-950">
                    Test Not Cleared
                  </h5>
                  <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-800">
                    Failed (15/20 Required)
                  </span>
                </div>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                  Advocate did not score the minimum 15 correct answers. They can request a reschedule.
                </p>
              </div>
            </div>
          </div>
        )}

        {testStatus === "PASSED" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    Test Passed
                  </h5>
                  <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    Cleared
                  </span>
                </div>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  Advocate has successfully passed the legal qualification test.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Single Unified Result Block */}
        {scoreData ? (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="text-slate-700 font-bold">Assessment Score</span>
              <span className="text-[11px] text-slate-500">
                Total {scoreData?.total ?? 20} Questions · Pass mark 15
              </span>
            </div>

            {/* Correct & Wrong side by side */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2.5 text-emerald-900 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-200 text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold">Correct</span>
                </div>
                <span className="text-base font-black text-emerald-700">
                  {scoreData?.correct ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-2.5 text-rose-900 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-200 text-rose-800">
                    <XCircle className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold">Wrong</span>
                </div>
                <span className="text-base font-black text-rose-700">
                  {scoreData?.wrong ?? 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
              <span>
                Attempts:{" "}
                <strong className="font-bold text-slate-800">
                  {attemptsCount} {attemptsCount === 1 ? "attempt" : "attempts"}
                </strong>
              </span>
              {passedAt ? (
                <span className="font-bold text-emerald-700">
                  Passed: {new Date(passedAt).toLocaleDateString("en-IN")}
                </span>
              ) : scoreData?.autoSubmitted ? (
                <span className="font-semibold text-amber-700">Auto-submitted</span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            No test attempt recorded yet.
          </div>
        )}

        {/* View Test History Button */}
        <button
          type="button"
          onClick={handleOpenHistory}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-[0.99] transition"
        >
          <History className="h-4 w-4 text-amber-500 shrink-0" />
          <span>View Test History</span>
        </button>
      </div>

      {/* Test Attempts History Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 sm:p-6 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl sm:max-w-3xl flex-col rounded-[28px] border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header with Generous Padding */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Test Attempts History
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {advocateName ? `Advocate: ${advocateName}` : "Recorded assessment logs"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body with Generous Padding */}
            <div className="flex-1 overflow-y-auto px-8 py-7 space-y-6">
              {modalLoading ? (
                <div className="flex h-56 items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                  <span className="ml-3 text-xs font-bold text-slate-600">
                    Loading test attempts...
                  </span>
                </div>
              ) : modalError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-xs text-rose-700">
                  {modalError}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Previous vs Latest Comparison Boxes (if attempts >= 2) - Clean without header words */}
                  {comparison && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Previous Attempt #1 */}
                      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Previous Attempt (Attempt #1)
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              comparison.initial.passed
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {comparison.initial.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                        <p className="mt-2 text-base font-black text-slate-900">
                          {comparison.initial.correctCount ?? 0} correct · {comparison.initial.wrongCount ?? 0} wrong
                        </p>
                        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/60 pt-2.5">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Time: <strong>{formatAttemptDuration(comparison.initial.startedAt, comparison.initial.submittedAt)}</strong>
                          </span>
                          <span>
                            {comparison.initial.startedAt
                              ? new Date(comparison.initial.startedAt).toLocaleDateString("en-IN")
                              : ""}
                          </span>
                        </div>
                      </div>

                      {/* Latest Attempt #2 */}
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                            Latest Attempt (Attempt #{chronologicalAttempts.length})
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              comparison.latest.passed
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {comparison.latest.passed ? "PASSED" : "FAILED"}
                          </span>
                        </div>
                        <p className="mt-2 text-base font-black text-emerald-950">
                          {comparison.latest.correctCount ?? 0} correct · {comparison.latest.wrongCount ?? 0} wrong
                        </p>
                        <div className="mt-2.5 flex items-center justify-between text-xs text-emerald-800 border-t border-emerald-200/60 pt-2.5">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            Time: <strong>{formatAttemptDuration(comparison.latest.startedAt, comparison.latest.submittedAt)}</strong>
                          </span>
                          <span>
                            {comparison.latest.startedAt
                              ? new Date(comparison.latest.startedAt).toLocaleDateString("en-IN")
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attempts List with Accurate Numbering & Durations */}
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    {displayAttempts.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-500">
                        No individual test attempts recorded yet.
                      </div>
                    ) : (
                      displayAttempts.map((attempt, idx) => {
                        const isPassed = Boolean(attempt.passed);
                        const durationStr = formatAttemptDuration(
                          attempt.startedAt,
                          attempt.submittedAt
                        );

                        return (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 text-xs hover:bg-slate-50/50 transition"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-sm">
                                  Attempt #{attempt.attemptNumber}
                                </span>
                                {attempt.isLatest && (
                                  <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                                    Latest
                                  </span>
                                )}
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    isPassed
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {isPassed ? "PASSED" : "FAILED"}
                                </span>
                                {attempt.autoSubmitted && (
                                  <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                                    Timer Expired
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                <span>
                                  Started:{" "}
                                  <strong className="text-slate-700">
                                    {attempt.startedAt
                                      ? new Date(attempt.startedAt).toLocaleString("en-IN")
                                      : "—"}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  Time Taken: {durationStr}
                                </span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                              <span className="text-sm font-black text-slate-900">
                                {attempt.correctCount ?? 0} correct · {attempt.wrongCount ?? 0} wrong
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Submitted:{" "}
                                {attempt.submittedAt
                                  ? new Date(attempt.submittedAt).toLocaleTimeString("en-IN")
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Generous Padding */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/70 px-8 py-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
