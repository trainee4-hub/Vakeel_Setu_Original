import { adminRequest, extractList, normalizePagination } from "../../utils/adminUtils";

/**
 * GET /api/admin/advocate-bookings
 * Query params: page, limit, status, mode, search, sortBy, sortOrder
 */
export async function getAdminAdvocateBookings({
  page = 1,
  limit = 10,
  status = "",
  mode = "",
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", String(status));
  if (mode) params.set("mode", String(mode));
  if (search) params.set("search", String(search));
  if (sortBy) params.set("sortBy", String(sortBy));
  if (sortOrder) params.set("sortOrder", String(sortOrder));

  const query = params.toString();
  const response = await adminRequest(`/admin/advocate-bookings${query ? `?${query}` : ""}`);
  const items = extractList(response, ["data", "bookings"]);
  return {
    items,
    pagination: normalizePagination(response?.pagination, page, limit, items.length),
  };
}
