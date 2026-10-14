import { apiRequest } from "@shared/services/apiClient";
import { adminRequest, extractList, extractRecord, idPath, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/advocates
 * Query params: page, limit, status, approvalStatus, search
 */
export async function getAdvocates({ page = 1, limit = 20, status, approvalStatus, search } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", String(status));
  if (approvalStatus) params.set("approvalStatus", String(approvalStatus));
  if (search) params.set("search", String(search));

  const query = params.toString();
  const response = await adminRequest(`/admin/advocates${query ? `?${query}` : ""}`);
  const items = extractList(response, ["advocates", "data"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * GET /api/admin/advocates/pending
 */
export async function getPendingAdvocates({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const response = await adminRequest(`/admin/advocates/pending${query ? `?${query}` : ""}`);
  const items = extractList(response, ["data", "advocates"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * GET /api/admin/advocates/deletion-requests
 */
export async function getAdvocateDeletionRequests({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const response = await adminRequest(`/admin/advocates/deletion-requests${query ? `?${query}` : ""}`);
  const items = extractList(response, ["deletionRequests", "data", "advocates"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * GET /api/admin/advocates/:id
 */
export async function getAdvocate(id) {
  const response = await adminRequest(`/admin/advocates/${idPath(id)}`);
  return extractRecord(response, ["advocate", "data"]);
}

/**
 * PATCH /api/admin/advocates/:id/approve
 * Body: { approvalStatus: "APPROVED", callAvailability: boolean }
 */
export async function approveAdvocate(id, { approvalStatus = "APPROVED", callAvailability = false } = {}) {
  const response = await adminRequest(`/admin/advocates/${idPath(id)}/approve`, {
    method: "PATCH",
    body: { approvalStatus, callAvailability: Boolean(callAvailability) },
  });
  return extractRecord(response, ["advocate", "data"]);
}

/**
 * PATCH /api/admin/advocates/:id/reject
 * Body: { reason: string }
 */
export async function rejectAdvocate(id, { reason }) {
  const response = await adminRequest(`/admin/advocates/${idPath(id)}/reject`, {
    method: "PATCH",
    body: { reason: String(reason || "").trim() },
  });
  return extractRecord(response, ["advocate", "data"]);
}

/**
 * PATCH /api/admin/advocates/:id/status
 * Body: { status: "ACTIVE" | "BLOCKED" }
 */
export async function updateAdvocateStatus(id, { status }) {
  const response = await adminRequest(`/admin/advocates/${idPath(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
  return extractRecord(response, ["advocate", "data"]);
}

/**
 * PATCH /api/admin/advocates/:id/call-availability
 * Body: { callAvailability: boolean }
 */
export async function updateCallAvailability(id, { callAvailability }) {
  const response = await adminRequest(`/admin/advocates/${idPath(id)}/call-availability`, {
    method: "PATCH",
    body: { callAvailability: Boolean(callAvailability) },
  });
  return extractRecord(response, ["advocate", "data"]);
}

/**
 * PATCH /api/admin/advocates/:id/cancel-deletion
 */
export async function cancelAdvocateDeletion(id) {
  const response = await adminRequest(`/admin/advocates/${idPath(id)}/cancel-deletion`, {
    method: "PATCH",
  });
  return extractRecord(response, ["advocate", "data"]);
}

/**
 * DELETE /api/admin/advocates/:id/permanent
 */
export async function deleteAdvocatePermanently(id) {
  return adminRequest(`/admin/advocates/${idPath(id)}/permanent`, {
    method: "DELETE",
  });
}

/**
 * PATCH /api/admin/advocates/:id/profile
 * Body: patch object containing ONLY changed fields
 */
export async function updateAdvocateProfile(id, patch) {
  try {
    const response = await adminRequest(`/admin/advocates/${idPath(id)}/profile`, {
      method: "PATCH",
      body: patch,
    });
    return {
      data: extractRecord(response, ["data", "advocate"]),
      advocate: extractRecord(response, ["advocate", "data"]),
      changedFields: Array.isArray(response?.changedFields) ? response.changedFields : [],
      message: response?.message || "Profile updated",
      raw: response,
    };
  } catch (err) {
    if (err?.message?.includes("Bar Council ID is already registered")) {
      err.fieldErrors = {
        ...(err.fieldErrors || {}),
        barCouncilId: err.message,
      };
    }
    throw err;
  }
}

/**
 * GET /api/admin/advocates/rejected
 * Query params: page, limit, search
 */
export async function getRejectedAdvocates({ page = 1, limit = 20, search } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", String(search));

  const query = params.toString();
  const response = await adminRequest(`/admin/advocates/rejected${query ? `?${query}` : ""}`);
  const items = extractList(response, ["data", "advocates"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * GET /api/practice-areas
 */
export async function getPracticeAreas() {
  try {
    const response = await apiRequest("/practice-areas");
    return Array.isArray(response?.practiceAreas) ? response.practiceAreas : [];
  } catch {
    return [];
  }
}

/**
 * GET /api/courts
 */
export async function getCourts() {
  try {
    const response = await apiRequest("/courts");
    return Array.isArray(response?.courts) ? response.courts : [];
  } catch {
    return [];
  }
}

