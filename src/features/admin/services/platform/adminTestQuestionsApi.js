import { apiRequest } from "@shared/services/apiClient";

/**
 * Admin Test Questions API
 */

export async function getTestQuestions({
  status = "all",
  search = "",
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search && search.trim()) params.set("search", search.trim());
  params.set("page", String(page));
  params.set("limit", String(limit));

  return apiRequest(`/admin/test-questions?${params.toString()}`, {
    method: "GET",
    cache: false,
  });
}

export async function createTestQuestion({
  question,
  options,
  correctOption,
  isActive = true,
}) {
  return apiRequest("/admin/test-questions", {
    method: "POST",
    body: {
      question: String(question || "").trim(),
      options: Array.isArray(options) ? options.map((o) => String(o || "").trim()) : [],
      correctOption: Number(correctOption),
      isActive: Boolean(isActive),
    },
  });
}

export async function updateTestQuestion(id, patch) {
  if (!id) throw new Error("Question ID is required");
  return apiRequest(`/admin/test-questions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteTestQuestion(id) {
  if (!id) throw new Error("Question ID is required");
  return apiRequest(`/admin/test-questions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * GET /api/admin/advocates/:advocateId/test-attempts
 * Returns test attempts history for an advocate
 */
export async function getAdvocateTestAttempts(advocateId) {
  if (!advocateId) throw new Error("Advocate ID is required");
  return apiRequest(`/admin/advocates/${encodeURIComponent(advocateId)}/test-attempts`, {
    method: "GET",
    cache: false,
  });
}

