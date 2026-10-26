import { apiRequest } from "@shared/services/apiClient";
import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/* Reads: Admin owns its own reads directly via apiRequest (GET /blogs, GET /blogs/:idOrSlug). */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, 10)));

export async function getBlogs({ page = 1, limit = 10 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);
  const params = new URLSearchParams({ page: String(p), limit: String(l) });

  const response = await apiRequest(`/blogs?${params.toString()}`, { method: "GET" });
  const blogs = Array.isArray(response?.blogs) ? response.blogs : Array.isArray(response?.data) ? response.data : [];
  const raw = response?.pagination ?? {};

  return {
    items: blogs,
    pagination: {
      currentPage: toInt(raw.currentPage ?? raw.page, p),
      limit: toInt(raw.limit, l),
      total: toInt(raw.totalBlogs ?? raw.total, blogs.length),
      totalPages: toInt(raw.totalPages, blogs.length ? 1 : 0),
      hasNextPage: Boolean(raw.hasNextPage),
      hasPreviousPage: Boolean(raw.hasPreviousPage),
    },
  };
}

export async function getBlog(id) {
  const cleanId = String(id ?? "").trim();
  if (!cleanId) throw new Error("A blog ID is required.");
  const response = await apiRequest(`/blogs/${encodeURIComponent(cleanId)}`, { method: "GET" });
  return response?.blog ?? response?.data ?? null;
}

/* Mutations: multipart/form-data, Admin writes: POST /admin/blogs, PUT /admin/blogs/:id, DELETE /admin/blogs/:id. */

export async function createBlog(formData) {
  const response = await adminRequest("/admin/blogs", { method: "POST", formData });
  return extractRecord(response, ["blog", "data"]);
}

export async function updateBlog(id, formData) {
  const response = await adminRequest(`/admin/blogs/${idPath(id)}`, { method: "PUT", formData });
  return extractRecord(response, ["blog", "data"]);
}

export function deleteBlog(id) {
  return adminRequest(`/admin/blogs/${idPath(id)}`, { method: "DELETE" });
}
