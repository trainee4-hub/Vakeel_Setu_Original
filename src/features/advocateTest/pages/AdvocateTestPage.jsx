import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Scale,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  FileCheck2,
  Send,
  HelpCircle,
  Award,
} from "lucide-react";
import {
  loginAdvocateTest,
  startAdvocateTest,
  saveAdvocateTestAnswers,
  submitAdvocateTest,
  rescheduleAdvocateTest,
} from "../services/advocateTestApi";
import LanguageTranslator from "../../../app/layouts/LanguageTranslator";

export default function AdvocateTestPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  // Page States: 'LOGIN' | 'RULES' | 'TESTING' | 'RESULT' | 'ALREADY_PASSED' | 'EXPIRED' | 'RESCHEDULE_DONE'
  const [screen, setScreen] = useState(() => {
    const saved = sessionStorage.getItem("vks_test_screen");
    const valid = ["LOGIN", "RULES", "TESTING", "RESULT", "ALREADY_PASSED", "EXPIRED", "RESCHEDULE_DONE"];
    return valid.includes(saved) ? saved : "LOGIN";
  });

  useEffect(() => {
    if (screen) {
      sessionStorage.setItem("vks_test_screen", screen);
    }
  }, [screen]);

  // Form inputs for Login
  const [barCouncilId, setBarCouncilId] = useState(() => {
    return sessionStorage.getItem("vks_test_bar_id") || "";
  });
  const [phone, setPhone] = useState(() => {
    return sessionStorage.getItem("vks_test_phone") || "";
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleBarCouncilChange = (val) => {
    setBarCouncilId(val);
    sessionStorage.setItem("vks_test_bar_id", val);
  };
  const handlePhoneChange = (val) => {
    setPhone(val);
    sessionStorage.setItem("vks_test_phone", val);
  };

  // Test Session Token & Rules
  const [testSession, setTestSession] = useState(() => {
    return sessionStorage.getItem("vks_test_session") || "";
  });
  const [rules, setRules] = useState({
    questions: 20,
    minutes: 20,
    passMark: 15,
  });

  // Test Data
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [index]: "A" | "B" | "C" | "D" }
  const [currentQIndex, setCurrentQIndex] = useState(() => {
    const saved = sessionStorage.getItem("vks_test_q_index");
    const num = Number(saved);
    return !isNaN(num) && num >= 0 && num < 20 ? num : 0;
  });
  const [visitedIndices, setVisitedIndices] = useState(() => new Set([0]));

  useEffect(() => {
    sessionStorage.setItem("vks_test_q_index", String(currentQIndex));
  }, [currentQIndex]);

  useEffect(() => {
    if (screen === "TESTING") {
      setVisitedIndices((prev) => {
        const next = new Set(prev);
        next.add(currentQIndex);
        Object.keys(selectedAnswers).forEach((idx) => next.add(Number(idx)));
        return next;
      });
    }
  }, [screen, currentQIndex, selectedAnswers]);

  // Timer: remaining seconds calculated from (deadlineAt - serverNow)
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const timerIntervalRef = useRef(null);

  // Autosave
  const [saveStatus, setSaveStatus] = useState("SAVED"); // 'SAVING' | 'SAVED' | 'ERROR'
  const autoSaveTimerRef = useRef(null);

  // Submit & Modal
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Result
  const [result, setResult] = useState(null);
  const [passedAtDate, setPassedAtDate] = useState("");

  // Reschedule state
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState("");

  // Update session storage when testSession changes
  useEffect(() => {
    if (testSession && token) {
      sessionStorage.setItem("vks_test_session", testSession);
      sessionStorage.setItem("vks_test_token", token);
    } else if (!testSession) {
      sessionStorage.removeItem("vks_test_session");
      sessionStorage.removeItem("vks_test_token");
    }
  }, [testSession, token]);

  // Auto-resume active test session on mount or reload if available
  useEffect(() => {
    const savedSession = sessionStorage.getItem("vks_test_session");
    const savedToken = sessionStorage.getItem("vks_test_token");

    if (!savedSession || !token || savedToken !== token) {
      if (screen === "TESTING" || screen === "RULES") {
        setScreen("LOGIN");
      }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoginLoading(true);
        const res = await startAdvocateTest(savedSession);
        if (cancelled) return;

        if (res?.questions && res.questions.length > 0) {
          setAttemptId(res.attemptId || "");
          setQuestions(res.questions);

          const restored = {};
          if (Array.isArray(res.savedAnswers)) {
            res.savedAnswers.forEach((ans) => {
              if (ans?.selected) {
                restored[ans.index] = ans.selected;
              }
            });
          }
          setSelectedAnswers(restored);

          if (res.serverNow && res.deadlineAt) {
            const sNow = new Date(res.serverNow).getTime();
            const dLine = new Date(res.deadlineAt).getTime();
            const diffSecs = Math.max(0, Math.floor((dLine - sNow) / 1000));
            setRemainingSeconds(diffSecs);
          } else {
            setRemainingSeconds(rules.minutes * 60);
          }

          setScreen("TESTING");
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          setTestSession("");
          sessionStorage.removeItem("vks_test_session");
          sessionStorage.removeItem("vks_test_token");
        }
      } finally {
        if (!cancelled) setLoginLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, rules.minutes]);

  /* =========================================================================
     TIMER COUNTDOWN
  ========================================================================= */
  useEffect(() => {
    if (screen === "TESTING" && remainingSeconds !== null) {
      if (remainingSeconds <= 0) {
        // Auto-submit when timer reaches 0
        handleFinalSubmit(true);
        return;
      }

      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            handleFinalSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerIntervalRef.current);
    }
  }, [screen, remainingSeconds]);

  /* =========================================================================
     HANDLE LOGIN
  ========================================================================= */
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      setLoginError("Missing test token in URL.");
      return;
    }
    if (!barCouncilId.trim()) {
      setLoginError("Please enter your Bar Council ID.");
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setLoginError("Please enter a valid 10-digit registered phone number.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await loginAdvocateTest({
        token,
        barCouncilId,
        phone: cleanPhone,
      });

      if (res?.testSession) {
        setTestSession(res.testSession);
        try {
          sessionStorage.setItem("vks_test_bar_id", barCouncilId);
          sessionStorage.setItem("vks_test_phone", cleanPhone);
        } catch (_) {}
      }

      if (res?.status === "READY") {
        if (res?.rules) setRules(res.rules);
        setScreen("RULES");
      } else if (res?.status === "IN_PROGRESS") {
        if (res?.attemptId) setAttemptId(res.attemptId);
        await initStartTest(res.testSession);
      } else if (res?.status === "COMPLETED") {
        setResult(res.result);
        setScreen("RESULT");
      } else if (res?.status === "ALREADY_PASSED") {
        setPassedAtDate(res.passedAt || "");
        setScreen("ALREADY_PASSED");
      } else {
        setScreen("RULES");
      }
    } catch (err) {
      console.error("Test login error:", err);
      if (err?.status === 410 || err?.code === "LINK_EXPIRED") {
        setScreen("EXPIRED");
      } else if (err?.status === 401 || err?.code === "INVALID_CREDENTIALS") {
        setLoginError("The details don't match this test link.");
      } else if (err?.status === 429 || err?.code === "TOO_MANY_ATTEMPTS") {
        setLoginError("Too many attempts. Please try again in 15 minutes.");
      } else {
        setLoginError(err?.message || "Failed to authenticate test link.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  /* =========================================================================
     START / RESUME TEST
  ========================================================================= */
  const initStartTest = async (sessionToken) => {
    const activeToken = sessionToken || testSession;
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await startAdvocateTest(activeToken);
      if (!res?.questions || res.questions.length === 0) {
        throw new Error("No test questions available.");
      }

      setAttemptId(res.attemptId || "");
      setQuestions(res.questions);

      // Restore saved answers if any
      const restored = {};
      if (Array.isArray(res.savedAnswers)) {
        res.savedAnswers.forEach((ans) => {
          if (ans?.selected) {
            restored[ans.index] = ans.selected;
          }
        });
      }
      setSelectedAnswers(restored);

      // Compute remaining timer from serverNow and deadlineAt
      if (res.serverNow && res.deadlineAt) {
        const sNow = new Date(res.serverNow).getTime();
        const dLine = new Date(res.deadlineAt).getTime();
        const diffSecs = Math.max(0, Math.floor((dLine - sNow) / 1000));
        setRemainingSeconds(diffSecs);
      } else {
        setRemainingSeconds(rules.minutes * 60);
      }

      setScreen("TESTING");
    } catch (err) {
      console.error("Start test error:", err);
      if (err?.status === 401) {
        setTestSession("");
        setScreen("LOGIN");
        setLoginError("Your session expired. Please verify your details again.");
      } else if (err?.status === 503 || err?.code === "TEST_UNAVAILABLE") {
        setLoginError("The test is temporarily unavailable. Please try later.");
      } else {
        setLoginError(err?.message || "Failed to start test.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  /* =========================================================================
     AUTOSAVE ON ANSWER SELECT
  ========================================================================= */
  const handleSelectOption = (qIndex, optionKey) => {
    const updated = {
      ...selectedAnswers,
      [qIndex]: optionKey,
    };
    setSelectedAnswers(updated);

    // Debounced autosave (~1s)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus("SAVING");
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const answersPayload = Object.entries(updated).map(([idx, key]) => ({
          index: Number(idx),
          selected: key,
        }));
        await saveAdvocateTestAnswers(testSession, answersPayload);
        setSaveStatus("SAVED");
      } catch (err) {
        console.error("Autosave error:", err);
        if (err?.status === 401) {
          setTestSession("");
          setScreen("LOGIN");
          setLoginError("Session expired. Please log in again to resume.");
        } else {
          setSaveStatus("ERROR");
        }
      }
    }, 1000);
  };

  /* =========================================================================
     SUBMIT TEST
  ========================================================================= */
  const handleFinalSubmit = async (auto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");

    // Prepare complete answers payload
    const allAnswers = questions.map((q, idx) => ({
      index: idx,
      selected: selectedAnswers[idx] || null,
    }));

    try {
      const res = await submitAdvocateTest(testSession, allAnswers);
      setResult(res);
      setScreen("RESULT");
      setShowConfirmSubmit(false);
    } catch (err) {
      console.error("Submit test error:", err);
      if (err?.status === 401) {
        setTestSession("");
        setScreen("LOGIN");
        setLoginError("Session expired while submitting. Please log in again.");
      } else {
        setSubmitError(err?.message || "Failed to submit test. Please retry.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================================
     RESCHEDULE TEST
  ========================================================================= */
  const handleReschedule = async () => {
    setRescheduleLoading(true);
    try {
      const res = await rescheduleAdvocateTest({
        testSession: testSession || null,
        token,
        barCouncilId,
        phone,
      });

      setRescheduleMessage(
        res?.message || "Your test will be rescheduled within 2 hours. A new link will be sent to your email."
      );
      setScreen("RESCHEDULE_DONE");
    } catch (err) {
      console.error("Reschedule error:", err);
      if (err?.status === 409 || err?.code === "ALREADY_PASSED") {
        setScreen("ALREADY_PASSED");
      } else {
        alert(err?.message || "Unable to request reschedule. Please try again later.");
      }
    } finally {
      setRescheduleLoading(false);
    }
  };

  /* =========================================================================
     FORMAT TIMER (MM:SS)
  ========================================================================= */
  const formatTimer = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds < 0) return "00:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(selectedAnswers).filter(
    (k) => selectedAnswers[k] != null
  ).length;

  const reached15Questions =
    Math.max(0, ...Array.from(visitedIndices)) >= 14 ||
    currentQIndex >= 14 ||
    answeredCount >= 15;

  /* =========================================================================
     RENDER CASE: NO TOKEN
  ========================================================================= */
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">
            Invalid Test Link
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            This verification test link is missing a valid token. Please open the exact link
            delivered to your registered email address.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
          >
            <span>Back to VakeelSetu Home</span>
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER: 1. LOGIN SCREEN
  ========================================================================= */
  if (screen === "LOGIN") {
    return (
      <div className="min-h-screen bg-slate-50/70 pb-16 pt-8 sm:pt-14">
        <div className="mx-auto max-w-md px-4">
          <div className="mb-4 flex items-center justify-end">
            <LanguageTranslator compact />
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 shadow-md">
              <Scale className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
              Advocate Qualification Test
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              VakeelSetu Bar Association Empanelment Verification
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-900">
              <p className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Identity Verification</span>
              </p>
              <p className="mt-1 text-amber-800/90">
                Please enter your Bar Council Enrollment ID and 10-digit registered mobile
                number to unlock your assessment session.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Bar Council ID / Enrollment Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. D/1234/2020 or MAH/5678/2019"
                  value={barCouncilId}
                  onChange={(e) => handleBarCouncilChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Registered Mobile Number (10 Digits)
                </label>
                <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-semibold text-slate-900 transition focus-within:border-amber-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-500">
                  <span className="mr-2 text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none focus:shadow-none"
                    style={{ outline: "none", boxShadow: "none", border: "none" }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow-md transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-60"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Test</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] text-slate-400">
                Link expires in 72 hours from dispatch • Single continuous session
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER: 2. RULES & INSTRUCTIONS SCREEN
  ========================================================================= */
  if (screen === "RULES") {
    return (
      <div className="min-h-screen bg-slate-50/70 pb-16 pt-12 sm:pt-20">
        <div className="mx-auto max-w-lg px-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    Assessment Instructions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Please review the examination parameters carefully
                  </p>
                </div>
              </div>

              <LanguageTranslator compact />
            </div>

            {loginError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <span className="font-semibold text-slate-500">Total Questions</span>
                <span className="font-bold text-slate-900">{rules.questions} Questions</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <span className="font-semibold text-slate-500">Total Time Allowed</span>
                <span className="font-bold text-slate-900">{rules.minutes} Minutes</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                <span className="font-semibold text-slate-500">Passing Criteria</span>
                <span className="font-bold text-emerald-700">{rules.passMark} Correct Answers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Question Format</span>
                <span className="font-bold text-slate-900">Multiple Choice (Single Correct)</span>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-xs text-slate-600 leading-relaxed list-disc pl-5">
              <li>Answers are automatically saved to our server every second as you select them.</li>
              <li>If you accidentally refresh or close the tab, you can re-enter within the 20-minute countdown with all saved answers intact.</li>
              <li>The test will automatically submit when the 20-minute timer reaches zero.</li>
              <li>Upon completion, you will immediately see your score and qualification outcome.</li>
            </ul>

            <button
              type="button"
              onClick={() => initStartTest(testSession)}
              disabled={loginLoading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading Questions...</span>
                </>
              ) : (
                <>
                  <span>Start Test Now</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER: 3. ACTIVE TEST SCREEN
  ========================================================================= */
  if (screen === "TESTING") {
    const activeQ = questions[currentQIndex] || {};
    const isLastQ = currentQIndex === questions.length - 1;
    const isFirstQ = currentQIndex === 0;

    return (
      <div className="min-h-screen bg-slate-50/70 pb-20 pt-4 sm:pt-6">
        <div className="mx-auto max-w-5xl px-4">
          {/* Top Bar: Timer & Status */}
          <header className="sticky top-4 z-40 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-md backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
                <Scale className="h-4 w-4" />
              </div>
              <span className="text-sm font-extrabold text-slate-950">
                Advocate Assessment
              </span>
            </div>

            {/* Live Synchronized Timer */}
            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-black transition-all ${
                remainingSeconds !== null && remainingSeconds < 180
                  ? "border-rose-300 bg-rose-50 text-rose-700 animate-pulse"
                  : "border-amber-200 bg-amber-50/80 text-amber-900"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Time Remaining:</span>
              <span className="font-mono text-sm tracking-wider">
                {formatTimer(remainingSeconds)}
              </span>
            </div>

            {/* Right: Language Translator & Autosave Status */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <LanguageTranslator compact />

              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    saveStatus === "SAVED"
                      ? "text-emerald-700"
                      : saveStatus === "SAVING"
                      ? "text-amber-600 animate-pulse"
                      : "text-rose-600"
                  }`}
                >
                  {saveStatus === "SAVED" && <CheckCircle2 className="h-3 w-3" />}
                  {saveStatus === "SAVING" && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span className="hidden sm:inline">
                    {saveStatus === "SAVED"
                      ? "Autosaved"
                      : saveStatus === "SAVING"
                      ? "Saving..."
                      : "Save Error"}
                  </span>
                </span>
              </div>
            </div>
          </header>

          {/* Main Assessment Body Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Active Question Card */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      selectedAnswers[currentQIndex]
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {selectedAnswers[currentQIndex] ? "Answered" : "Unanswered"}
                  </span>
                </div>

                {/* Question Statement */}
                <h3 className="mt-5 text-base font-bold leading-relaxed text-slate-900 sm:text-lg">
                  {activeQ.question}
                </h3>

                {/* Options List */}
                <div className="mt-6 space-y-3">
                  {Array.isArray(activeQ.options) &&
                    activeQ.options.map((opt) => {
                      const isSelected = selectedAnswers[currentQIndex] === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => handleSelectOption(currentQIndex, opt.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectOption(currentQIndex, opt.key);
                            }
                          }}
                          className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? "border-amber-400 bg-amber-50/40 text-slate-950 shadow-xs ring-1 ring-amber-400"
                              : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${
                              isSelected
                                ? "border-amber-500 bg-amber-500 text-slate-950"
                                : "border-slate-300 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {opt.key}
                          </div>
                          <span className="text-sm font-medium leading-snug">
                            {opt.text}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Question Footer Navigation */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    disabled={isFirstQ}
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {isLastQ ? (
                      <button
                        type="button"
                        onClick={() => setShowConfirmSubmit(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-500"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Submit Test</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentQIndex((prev) =>
                            Math.min(questions.length - 1, prev + 1)
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Question Palette & Overview */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Question Palette
                  </h4>
                  <span className="text-xs font-extrabold text-slate-800">
                    {answeredCount} / {questions.length} Answered
                  </span>
                </div>

                {/* 1-20 Numbered Grid */}
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {questions.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] != null;
                    const isCurrent = idx === currentQIndex;
                    const isVisited = visitedIndices.has(idx);

                    let colorClasses =
                      "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200";

                    if (isAnswered) {
                      colorClasses =
                        "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600";
                    } else if (isVisited) {
                      colorClasses =
                        "bg-rose-500 text-white shadow-xs hover:bg-rose-600";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentQIndex(idx)}
                        className={`flex h-10 items-center justify-center rounded-xl text-xs font-extrabold transition-all ${
                          isCurrent
                            ? "ring-2 ring-amber-500 ring-offset-2"
                            : ""
                        } ${colorClasses}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Palette Legend */}
                <div className="mt-6 flex items-center justify-around border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-emerald-500" />
                    <span>Answered</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-rose-500" />
                    <span>Unanswered</span>
                  </span>
                </div>

                {/* Direct Submit Action */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={!reached15Questions}
                    onClick={() => setShowConfirmSubmit(true)}
                    className={`w-full rounded-xl py-2.5 text-xs font-extrabold shadow-sm transition ${
                      !reached15Questions
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-950 text-white hover:bg-emerald-600 cursor-pointer"
                    }`}
                  >
                    Finish & Submit Test
                  </button>
                  {!reached15Questions && (
                    <p className="mt-1.5 text-center text-[10px] text-slate-400">
                      Reach Question 15 to enable submit
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                Submit Test Session?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                You have answered <strong>{answeredCount}</strong> out of{" "}
                <strong>{questions.length}</strong> questions.
                {answeredCount < questions.length && (
                  <span className="block mt-1 text-amber-700 font-semibold">
                    Warning: You still have {questions.length - answeredCount} unanswered questions!
                  </span>
                )}
              </p>

              {submitError && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                  {submitError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowConfirmSubmit(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Continue Answering
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleFinalSubmit(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Yes, Submit Now</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     RENDER: 4. RESULT SCREEN
  ========================================================================= */
  if (screen === "RESULT" && result) {
    const isPassed = Boolean(result.passed);
    const correctCount = result.correct ?? 0;
    const wrongCount = result.wrong ?? 0;
    const totalCount = result.total ?? (correctCount + wrongCount);
    const canReschedule = Boolean(result.canRequestReschedule);

    return (
      <div className="min-h-screen bg-slate-50/70 pb-16 pt-8 sm:pt-14">
        <div className="mx-auto max-w-lg px-4">
          <div className="mb-4 flex items-center justify-end">
            <LanguageTranslator compact />
          </div>
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-xl sm:p-10">
            <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
              {isPassed ? "You have passed the test." : "Test Completed"}
            </h2>

            <p className="mt-1.5 text-sm font-semibold text-slate-600">
              {isPassed
                ? "Congratulations! Your assessment has been verified and registered on the platform."
                : "You did not achieve the minimum required passing score."}
            </p>

            {/* Score Breakdown with contextual Status Badge */}
            <div
              className={`mt-6 rounded-2xl border p-5 sm:p-6 transition-all ${
                isPassed
                  ? "border-emerald-200/80 bg-emerald-50/40"
                  : "border-rose-200/80 bg-rose-50/30"
              }`}
            >
              <div className="flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold ${
                    isPassed
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isPassed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Passed (Criteria Met)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-600" />
                      <span>Not Qualified (&lt; 15 Correct)</span>
                    </>
                  )}
                </span>
              </div>

              <div className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
                <span className={isPassed ? "text-emerald-700" : "text-slate-900"}>
                  {correctCount} correct
                </span>
                {" · "}
                <span className={isPassed ? "text-slate-400" : "text-rose-600"}>
                  {wrongCount} wrong
                </span>
              </div>

              <p className="mt-1.5 text-xs text-slate-500 font-medium">
                out of {totalCount} total questions (Pass Criteria: 15 correct)
              </p>
            </div>

            {/* Pass state message */}
            {isPassed ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 leading-relaxed text-left">
                <p className="font-bold flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span>Next Step: Admin Verification</span>
                </p>
                <p className="mt-1 text-emerald-800">
                  Your profile is now queued for administrator review. You will receive an official
                  notification via email and SMS once your verification status is completed.
                </p>
              </div>
            ) : (
              /* Fail state reschedule action */
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 leading-relaxed text-left">
                  <p className="font-bold">Reschedule Option Available</p>
                  <p className="mt-1 text-amber-800">
                    Don’t worry! You can request a reschedule to re-take the qualification assessment.
                    A fresh test link will be scheduled to arrive in your email.
                  </p>
                </div>

                {canReschedule && (
                  <button
                    type="button"
                    disabled={rescheduleLoading}
                    onClick={handleReschedule}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50"
                  >
                    {rescheduleLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Requesting Reschedule...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Request Reschedule</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 border-t border-slate-100 pt-4">
              <Link
                to="/"
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Return to VakeelSetu Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER: 5. ALREADY PASSED SCREEN
  ========================================================================= */
  if (screen === "ALREADY_PASSED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">
            You have already passed the test.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Your legal qualification assessment has already been validated and marked as completed
            in our system{passedAtDate ? ` on ${new Date(passedAtDate).toLocaleDateString("en-IN")}` : ""}.
            No further test session is required.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
          >
            <span>Go to Advocate Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER: 6. EXPIRED LINK SCREEN (410)
  ========================================================================= */
  if (screen === "EXPIRED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Clock className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900">
            This test link has expired.
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Test links are valid for 72 hours following generation. You can request a new test
            link to be dispatched to your registered email address.
          </p>

          <button
            type="button"
            disabled={rescheduleLoading}
            onClick={handleReschedule}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950 disabled:opacity-50"
          >
            {rescheduleLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Scheduling Link...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Request Reschedule</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER: 7. RESCHEDULE SCHEDULED CONFIRMATION
  ========================================================================= */
  if (screen === "RESCHEDULE_DONE") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-extrabold text-slate-950">
            Reschedule Request Received
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {rescheduleMessage || "Your test will be rescheduled within 2 hours."}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            Please check your inbox (and spam/promotions folder) for the new test link.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
          >
            <span>Back to VakeelSetu Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

