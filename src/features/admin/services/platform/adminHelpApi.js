import { adminRequest, extractList, extractRecord, idPath, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/help?page&limit&status&search
 * limit max is 100
 * Server sorts newest first
 */
export async function getHelpRequests({ page = 1, limit = 20, status = "", search = "" } = {}) {
  const safeLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (safeLimit) params.set("limit", String(safeLimit));
  if (status) params.set("status", String(status));
  if (search && search.trim()) params.set("search", search.trim());

  const query = params.toString();
  const response = await adminRequest(`/admin/help${query ? `?${query}` : ""}`);
  const items = extractList(response, ["helpRequests", "data", "items"]);

  return {
    items,
    helpRequests: items,
    pagination: normalizePagination(response?.pagination, page, safeLimit, items.length),
    counts: response?.counts || null,
  };
}

/**
 * GET /api/admin/help/:id
 */
export async function getHelpRequest(id) {
  const response = await adminRequest(`/admin/help/${idPath(id)}`); 
  return extractRecord(response, ["helpRequest", "data"]);
}

/**
 * PATCH /api/admin/help/:id
 * Body: { response, status }
 */
export async function updateHelpRequest(id, { response: responseText, status } = {}) {
  const payload = {};
  if (responseText !== undefined) payload.response = responseText;
  if (status !== undefined) payload.status = status;

  const response = await adminRequest(`/admin/help/${idPath(id)}`, {
    method: "PATCH",
    body: payload,
  });
  return extractRecord(response, ["helpRequest", "data"]);
}
