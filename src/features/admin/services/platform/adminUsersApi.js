import { adminRequest, extractList, extractRecord, idPath, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/users
 * Query params: page, limit, search, role
 */
export async function getUsers({ page = 1, limit = 20, search = "", role = "" } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (search) params.set("search", String(search));
  if (role) params.set("role", String(role));

  const query = params.toString();
  const response = await adminRequest(`/admin/users${query ? `?${query}` : ""}`);
  const items = extractList(response, ["users", "data"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}

/**
 * GET /api/admin/users/:userId
 */
export async function getUser(userId) {
  const response = await adminRequest(`/admin/users/${idPath(userId)}`);
  return extractRecord(response, ["user", "data"]);
}

/**
 * GET /api/admin/users/:userId/roles?userType=USER|ADVOCATE|CONTENT_CREATOR
 */
export async function getUserRoles(userId, { userType = "USER" } = {}) {
  const params = new URLSearchParams();
  if (userType) params.set("userType", String(userType));
  const query = params.toString();
  const response = await adminRequest(`/admin/users/${idPath(userId)}/roles${query ? `?${query}` : ""}`);
  return {
    roles: extractList(response, ["roles", "assignedRoles", "data"]),
    roleNames: Array.isArray(response?.roleNames) ? response.roleNames : [],
    permissions: Array.isArray(response?.permissions) ? response.permissions : [],
    permissionCodes: Array.isArray(response?.permissionCodes) ? response.permissionCodes : [],
  };
}

/**
 * POST /api/admin/users/:userId/roles
 * Body: { roleName, userType }
 */
export async function assignUserRole(userId, { roleName, userType = "USER" }) {
  const response = await adminRequest(`/admin/users/${idPath(userId)}/roles`, {
    method: "POST",
    body: { roleName, userType },
  });
  return extractRecord(response, ["userRole", "data", "role"]);
}

/**
 * DELETE /api/admin/users/:userId/roles/:roleId
 */
export async function removeUserRole(userId, roleId) {
  return adminRequest(`/admin/users/${idPath(userId)}/roles/${idPath(roleId)}`, {
    method: "DELETE",
  });
}
