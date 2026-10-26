import { apiRequest } from "@shared/services/apiClient";
import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/* Reads: Admin owns its own reads directly via apiRequest (GET /guides, GET /guides/:id). */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, 10)));

export async function getGuides({ page = 1, limit = 10 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);
  const params = new URLSearchParams({ page: String(p), limit: String(l) });

  const response = await apiRequest(`/guides?${params.toString()}`, { method: "GET" });
  const guides = Array.isArray(response?.data) ? response.data : Array.isArray(response?.guides) ? response.guides : [];
  const raw = response?.pagination ?? {};

  return {
    items: guides,
    pagination: {
      currentPage: toInt(raw.currentPage ?? raw.page, p),
      limit: toInt(raw.limit, l),
      total: toInt(raw.totalGuides ?? raw.total, guides.length),
      totalPages: toInt(raw.totalPages, guides.length ? 1 : 0),
      hasNextPage: Boolean(raw.hasNextPage),
      hasPreviousPage: Boolean(raw.hasPreviousPage),
    },
  };
}

export async function getGuide(id) {
  const cleanId = String(id ?? "").trim();
  if (!cleanId) throw new Error("A guide ID is required.");
  const response = await apiRequest(`/guides/${encodeURIComponent(cleanId)}`, { method: "GET" });
  return response?.data ?? null;
}

/* Mutations: JSON, Admin writes (POST /admin/guides, PATCH /admin/guides/:id, DELETE /admin/guides/:id). Guide description is plain text. */

export async function createGuide(body) {
  const response = await adminRequest("/admin/guides", { method: "POST", body });
  return extractRecord(response, ["data"]);
}

export async function updateGuide(id, body) {
  const response = await adminRequest(`/admin/guides/${idPath(id)}`, { method: "PATCH", body });
  return extractRecord(response, ["data"]);
}

export function deleteGuide(id) {
  return adminRequest(`/admin/guides/${idPath(id)}`, { method: "DELETE" });
}
