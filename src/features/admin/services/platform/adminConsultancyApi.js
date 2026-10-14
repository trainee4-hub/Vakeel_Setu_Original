import { adminRequest, extractList, extractRecord, idPath, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/consultancy
 * Query params: status (PENDING|COMPLETED), page, limit
 * FIFO (oldest first by backend default, client must not re-sort)
 */
export async function getConsultancyRequests({ page = 1, limit = 20, status = "" } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", String(status));

  const query = params.toString();
  const response = await adminRequest(`/admin/consultancy${query ? `?${query}` : ""}`);
  const items = extractList(response, ["data", "consultations"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * PATCH /api/admin/consultancy/:id/status
 * Body: { status: "COMPLETED" }
 */
export async function updateConsultancyStatus(id, { status = "COMPLETED" } = {}) {
  const response = await adminRequest(`/admin/consultancy/${idPath(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
  return extractRecord(response, ["consultation", "data"]);
}
