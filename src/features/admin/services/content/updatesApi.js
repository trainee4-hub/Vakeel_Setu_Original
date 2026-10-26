import { apiRequest } from "@shared/services/apiClient";
import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/* Reads: Admin owns its own reads directly via apiRequest (GET /updates, GET /updates/:id). */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, 10)));

export async function getUpdates({ page = 1, limit = 10 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);
  const params = new URLSearchParams({ page: String(p), limit: String(l) });

  const response = await apiRequest(`/updates?${params.toString()}`, { method: "GET" });
  const updates = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.updates)
      ? response.updates
      : [];
  const raw = response?.pagination ?? {};

  return {
    items: updates,
    pagination: {
      currentPage: toInt(raw.currentPage ?? raw.page, p),
      limit: toInt(raw.limit, l),
      total: toInt(raw.totalUpdates ?? raw.total, updates.length),
      totalPages: toInt(raw.totalPages, updates.length ? 1 : 0),
      hasNextPage: Boolean(raw.hasNextPage),
      hasPreviousPage: Boolean(raw.hasPreviousPage),
    },
  };
}

export async function getUpdate(id) {
  const cleanId = String(id ?? "").trim();
  if (!cleanId) throw new Error("An update ID is required.");
  const response = await apiRequest(`/updates/${encodeURIComponent(cleanId)}`, { method: "GET" });
  return response?.data ?? response?.update ?? null;
}

/* Mutations: JSON { title, oldDescription, newDescription }, Admin writes: POST /admin/updates, PATCH /admin/updates/:id, DELETE /admin/updates/:id. */

export async function createUpdate(body) {
  const response = await adminRequest("/admin/updates", { method: "POST", body });
  return extractRecord(response, ["data"]);
}

export async function updateUpdate(id, body) {
  const response = await adminRequest(`/admin/updates/${idPath(id)}`, { method: "PATCH", body });
  return extractRecord(response, ["data"]);
}

export function deleteUpdate(id) {
  return adminRequest(`/admin/updates/${idPath(id)}`, { method: "DELETE" });
}
