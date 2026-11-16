import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  getTestQuestions,
  createTestQuestion,
  updateTestQuestion,
  deleteTestQuestion,
} from "../../../services/platform/adminTestQuestionsApi";

export default function TestQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [counts, setCounts] = useState({ active: 0, inactive: 0 });
  const [minimumRequired, setMinimumRequired] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State for Add / Edit
  const [modalMode, setModalMode] = useState(null); // 'CREATE' | 'EDIT' | null
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formOptions, setFormOptions] = useState(["", "", "", ""]);
  const [formCorrectOption, setFormCorrectOption] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState("");

  /* =========================================================================
     FETCH QUESTIONS
  ========================================================================= */
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getTestQuestions({
        status: statusFilter,
        search: searchQuery,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res?.data) {
        setQuestions(res.data);
      }
      if (res?.counts) {
        setCounts(res.counts);
      }
      if (res?.minimumRequired !== undefined) {
        setMinimumRequired(res.minimumRequired);
      }
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
      setError(err?.message || "Failed to load test questions.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* =========================================================================
     OPEN CREATE / EDIT MODAL
  ========================================================================= */
  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormQuestion("");
    setFormOptions(["", "", "", ""]);
    setFormCorrectOption(0);
    setFormIsActive(true);
    setFormError("");
    setModalMode("CREATE");
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormQuestion(q.question || "");
    const opts = Array.isArray(q.options)
      ? [
          q.options[0] || "",
          q.options[1] || "",
          q.options[2] || "",
          q.options[3] || "",
        ]
      : ["", "", "", ""];
    setFormOptions(opts);
    setFormCorrectOption(q.correctOption ?? 0);
    setFormIsActive(q.isActive ?? true);
    setFormError("");
    setModalMode("EDIT");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingQuestion(null);
    setFormError("");
  };

  /* =========================================================================
     SUBMIT CREATE / EDIT FORM
  ========================================================================= */
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormError("");

    // Local Validations per spec
    const cleanQ = formQuestion.trim();
    if (cleanQ.length < 5 || cleanQ.length > 1000) {
      setFormError("Question statement must be between 5 and 1000 characters.");
      return;
    }

    const cleanOpts = formOptions.map((o) => o.trim());
    for (let i = 0; i < 4; i++) {
      if (!cleanOpts[i] || cleanOpts[i].length < 1 || cleanOpts[i].length > 300) {
        setFormError(`Option ${String.fromCharCode(65 + i)} must be between 1 and 300 characters.`);
        return;
      }
    }

    // Check duplicate options
    const unique = new Set(cleanOpts.map((o) => o.toLowerCase()));
    if (unique.size < 4) {
      setFormError("All 4 options must be distinct and unique (no duplicates).");
      return;
    }

    setFormLoading(true);
    try {
      if (modalMode === "CREATE") {
        await createTestQuestion({
          question: cleanQ,
          options: cleanOpts,
          correctOption: formCorrectOption,
          isActive: formIsActive,
        });
      } else if (modalMode === "EDIT" && editingQuestion) {
        await updateTestQuestion(editingQuestion.id || editingQuestion._id, {
          question: cleanQ,
          options: cleanOpts,
          correctOption: formCorrectOption,
          isActive: formIsActive,
        });
      }

      closeModal();
      await fetchQuestions();
    } catch (err) {
      console.error("Save question error:", err);
      setFormError(err?.data?.message || err?.message || "Failed to save question.");
    } finally {
      setFormLoading(false);
    }
  };

  /* =========================================================================
     DELETE QUESTION
  ========================================================================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test question?")) {
      return;
    }

    setDeletingId(id);
    setDeleteWarning("");
    try {
      const res = await deleteTestQuestion(id);
      if (res?.warning) {
        setDeleteWarning(res.warning);
      }
      await fetchQuestions();
    } catch (err) {
      console.error("Delete question error:", err);
      alert(err?.message || "Failed to delete question.");
    } finally {
      setDeletingId(null);
    }
  };

  const isBelowMinimum = (counts.active || 0) < minimumRequired;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-950">
            Test Question Bank
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage legal qualification assessment questions for advocate onboarding
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 hover:text-slate-950"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Minimum Required Banner */}
      {isBelowMinimum && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-extrabold text-amber-950">
              Active Question Bank Warning
            </p>
            <p className="mt-0.5 text-amber-800">
              At least 20 active questions are needed — currently only {counts.active || 0} active.
              Advocates cannot start the test until at least {minimumRequired} active questions are available.
            </p>
          </div>
        </div>
      )}

      {/* Delete Warning Notice if any */}
      {deleteWarning && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{deleteWarning}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5">
          {[
            { key: "all", label: "All Questions", count: (counts.active || 0) + (counts.inactive || 0) },
            { key: "active", label: "Active", count: counts.active || 0 },
            { key: "inactive", label: "Inactive", count: counts.inactive || 0 },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <span className="ml-2 text-xs font-bold text-slate-500">
            Loading question bank...
          </span>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800">
          <p className="font-bold">{error}</p>
          <button
            type="button"
            onClick={fetchQuestions}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            No Questions Found
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {searchQuery
              ? "No questions match your search query."
              : "Get started by adding your first qualification test question."}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 hover:text-slate-950"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Question</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const qId = q.id || q._id;
            const correctOptIdx = q.correctOption ?? 0;
            return (
              <div
                key={qId || idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{(pagination.page - 1) * pagination.limit + idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          q.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {q.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-slate-950">
                      {q.question}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(q)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition"
                      title="Edit Question"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === qId}
                      onClick={() => handleDelete(qId)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-50"
                      title="Delete Question"
                    >
                      {deletingId === qId ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 4 Options Grid */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Array.isArray(q.options) &&
                    q.options.map((opt, optIdx) => {
                      const isCorrect = optIdx === correctOptIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50/60 font-bold text-emerald-950"
                              : "border-slate-100 bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>
                          {isCorrect && (
                            <span className="shrink-0 rounded-md bg-emerald-200/80 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                              Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} questions)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD / EDIT QUESTION MODAL
      ========================================================================= */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-950">
                {modalMode === "CREATE" ? "Add Test Question" : "Edit Test Question"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="mt-5 space-y-4">
              {/* Question Statement */}
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Question Statement (5–1000 characters) *
                </label>
                <textarea
                  rows={3}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. Under which section of CrPC is anticipatory bail granted?"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                  required
                />
              </div>

              {/* 4 Options Inputs with Correct Radio */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Options (4 Distinct Options, Select Radio for Correct) *
                </label>
                {[0, 1, 2, 3].map((optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isChecked = formCorrectOption === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2.5 rounded-xl border p-2 transition ${
                        isChecked
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-slate-200 bg-slate-50/40"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs font-black text-slate-700 pl-1">
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={isChecked}
                          onChange={() => setFormCorrectOption(optIdx)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{letter}</span>
                      </label>
                      <input
                        type="text"
                        value={formOptions[optIdx]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormOptions((prev) => {
                            const next = [...prev];
                            next[optIdx] = val;
                            return next;
                          });
                        }}
                        placeholder={`Option ${letter} text`}
                        className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none px-2"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Active (Include in random test question pool)
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-500 hover:text-slate-950 transition disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{modalMode === "CREATE" ? "Create Question" : "Save Changes"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

