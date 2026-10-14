import { apiRequest } from "@shared/services/apiClient";
import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/* Reads: Admin owns its own reads directly via apiRequest (GET /user-rights, GET /user-rights/:id). */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export async function getUserRights({ page = 1, limit = 10 } = {}) {
  const safePage = Math.max(1, toInt(page, 1));
  const safeLimit = Math.min(50, Math.max(1, toInt(limit, 10)));
  const params = new URLSearchParams({
    page: String(safePage),
    limit: String(safeLimit),
  });

  const response = await apiRequest(`/user-rights?${params.toString()}`, { method: "GET" });
  const list = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.rights)
      ? response.rights
      : [];
  const raw = response?.pagination ?? {};

  return {
    items: list,
    pagination: {
      currentPage: toInt(raw.currentPage, safePage),
      limit: toInt(raw.limit, safeLimit),
      total: toInt(raw.totalRights, list.length),
      totalPages: toInt(raw.totalPages, list.length ? 1 : 0),
      hasNextPage: Boolean(raw.hasNextPage),
      hasPreviousPage: Boolean(raw.hasPreviousPage),
    },
  };
}

export async function getUserRight(id) {
  const cleanId = String(id ?? "").trim();
  if (!cleanId) throw new Error("A right ID is required.");
  const response = await apiRequest(`/user-rights/${encodeURIComponent(cleanId)}`, { method: "GET" });
  return response?.data ?? null;
}

/*
 * Mutations: POST /admin/user-rights, PATCH /admin/user-rights/:id, DELETE /admin/user-rights/:id.
 * Pass FormData when a photo is attached, a plain object otherwise.
 */

export async function createUserRight(payload) {
  const response = await adminRequest("/admin/user-rights", {
    method: "POST",
    ...(payload instanceof FormData ? { formData: payload } : { body: payload }),
  });
  return extractRecord(response, ["data"]);
}

export async function updateUserRight(id, payload) {
  const response = await adminRequest(`/admin/user-rights/${idPath(id)}`, {
    method: "PATCH",
    ...(payload instanceof FormData ? { formData: payload } : { body: payload }),
  });
  return extractRecord(response, ["data"]);
}

export function deleteUserRight(id) {
  return adminRequest(`/admin/user-rights/${idPath(id)}`, { method: "DELETE" });
}
