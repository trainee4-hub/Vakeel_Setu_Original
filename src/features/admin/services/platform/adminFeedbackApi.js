import { adminRequest, extractList, idPath, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/feedback
 * Query params: page, limit
 * Newest first by default
 */
export async function getFeedbackList({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const response = await adminRequest(`/admin/feedback${query ? `?${query}` : ""}`);
  const items = extractList(response, ["data", "feedback"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * DELETE /api/admin/feedback/:id
 */
export async function deleteFeedback(id) {
  return adminRequest(`/admin/feedback/${idPath(id)}`, {
    method: "DELETE",
  });
}
