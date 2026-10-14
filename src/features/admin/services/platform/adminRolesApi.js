import { adminRequest, extractList, extractRecord, idPath, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/roles
 * Query params: page, limit, search, isActive
 */
export async function getRoles({ page = 1, limit = 20, search = "", isActive } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", String(search));
  if (typeof isActive === "boolean") params.set("isActive", String(isActive));

  const query = params.toString();
  const response = await adminRequest(`/admin/roles${query ? `?${query}` : ""}`);
  const items = extractList(response, ["roles", "data"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * GET /api/admin/roles/:id
 */
export async function getRole(id) {
  const response = await adminRequest(`/admin/roles/${idPath(id)}`);
  return extractRecord(response, ["role", "data"]);
}

/**
 * POST /api/admin/roles
 * Body: { name, displayName, description, permissionCodes }
 */
export async function createRole({ name, displayName, description, permissionCodes = [] }) {
  const response = await adminRequest("/admin/roles", {
    method: "POST",
    body: {
      name: String(name || "").trim().toUpperCase(),
      displayName: String(displayName || name || "").trim(),
      description: String(description || "").trim(),
      permissionCodes,
    },
  });
  return extractRecord(response, ["role", "data"]);
}

/**
 * PUT /api/admin/roles/:id
 * Body: { name, displayName, description, permissionCodes }
 */
export async function updateRole(id, { name, displayName, description, permissionCodes = [] }) {
  const response = await adminRequest(`/admin/roles/${idPath(id)}`, {
    method: "PUT",
    body: {
      ...(name ? { name: String(name).trim().toUpperCase() } : {}),
      displayName: String(displayName || "").trim(),
      description: String(description || "").trim(),
      permissionCodes,
    },
  });
  return extractRecord(response, ["role", "data"]);
}

/**
 * PATCH /api/admin/roles/:id/status
 * Body: { isActive: boolean }
 */
export async function updateRoleStatus(id, { isActive }) {
  const response = await adminRequest(`/admin/roles/${idPath(id)}/status`, {
    method: "PATCH",
    body: { isActive: Boolean(isActive) },
  });
  return extractRecord(response, ["role", "data"]);
}

/**
 * DELETE /api/admin/roles/:id
 */
export async function deleteRole(id) {
  return adminRequest(`/admin/roles/${idPath(id)}`, {
    method: "DELETE",
  });
}

/**
 * POST /api/admin/roles/:id/permissions
 * Body: { permissionCodes }
 */
export async function assignRolePermissions(id, { permissionCodes = [] }) {
  const response = await adminRequest(`/admin/roles/${idPath(id)}/permissions`, {
    method: "POST",
    body: { permissionCodes },
  });
  return extractRecord(response, ["role", "data"]);
}

/**
 * DELETE /api/admin/roles/:id/permissions
 * Body: { permissionCodes }
 */
export async function removeRolePermissions(id, { permissionCodes = [] }) {
  const response = await adminRequest(`/admin/roles/${idPath(id)}/permissions`, {
    method: "DELETE",
    body: { permissionCodes },
  });
  return extractRecord(response, ["role", "data"]);
}

/**
 * GET /api/admin/permissions?grouped=true
 * Returns { modules: { [module]: Permission[] } } or { permissions: Permission[] }
 */
export async function getSystemPermissions({ grouped = true } = {}) {
  const response = await adminRequest(`/admin/permissions${grouped ? "?grouped=true" : ""}`);
  return {
    modules: response?.modules ?? null,
    permissions: Array.isArray(response?.permissions) ? response.permissions : [],
    totalPermissions: response?.totalPermissions ?? 0,
  };
}
