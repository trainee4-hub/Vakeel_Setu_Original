import { apiRequest } from "@shared/services/apiClient";

/* =========================================================================
   USER RIGHTS — public Legal Hub content, no authentication.

   GET /user-rights?page=&limit=   -> { success, data: [], pagination: {} }
   GET /user-rights/:id            -> { success, data: {} }

   API_BASE_URL already ends in /api, so paths here must not repeat it.
   Errors are deliberately not caught — the pages surface them.
   ========================================================================= */

const DEFAULT_PAGINATION = {
  currentPage: 1,
  limit: 10,
  totalRights: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/**
 * Normalises the list response so the page never has to guess at shape.
 * `data` is the documented array; `rights` is accepted only as a fallback.
 */
export async function getUserRights({ page = 1, limit = 10 } = {}) {
  const safePage = Math.max(1, toInt(page, 1));

  /* Backend caps limit at 50 — clamped here so a bad call can't 400. */
  const safeLimit = Math.min(50, Math.max(1, toInt(limit, 10)));

  const params = new URLSearchParams({
    page: String(safePage),
    limit: String(safeLimit),
  });

  const response = await apiRequest(`/user-rights?${params.toString()}`, {
    method: "GET",
  });

  const list = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.rights)
      ? response.rights
      : [];

  const raw = response?.pagination ?? {};

  return {
    rights: list,
    pagination: {
      currentPage: toInt(raw.currentPage, safePage),
      limit: toInt(raw.limit, safeLimit),
      totalRights: toInt(raw.totalRights, list.length),
      totalPages: toInt(raw.totalPages, list.length ? 1 : 0),
      hasNextPage: Boolean(raw.hasNextPage),
      hasPreviousPage: Boolean(raw.hasPreviousPage),
    },
  };
}

/** A 404 throws with the backend's "User Right not found" message. */
export async function getUserRightById(id) {
  const cleanId = String(id ?? "").trim();

  if (!cleanId) {
    throw new Error("A right ID is required.");
  }

  const response = await apiRequest(
    `/user-rights/${encodeURIComponent(cleanId)}`,
    { method: "GET" },
  );

  return response?.data ?? null;
}

export { DEFAULT_PAGINATION };