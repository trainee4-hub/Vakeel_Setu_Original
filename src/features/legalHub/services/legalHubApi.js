import { apiRequest } from "@shared/services/apiClient";

/* =========================================================================
   LEGAL HUB — public read APIs (no authentication).

   GET /guides?page=&limit=     -> { data: [], pagination: { totalGuides } }
   GET /guides/:id              -> { data: {} }
   GET /updates?page=&limit=    -> { data: [], pagination: { totalUpdates } }
   GET /updates/:id             -> { data: {} }
   GET /blogs?page=&limit=      -> { blogs: [], pagination: { totalBlogs } }
   GET /blogs/:idOrSlug         -> { blog: {} }

   API_BASE_URL already ends in /api — paths here must never repeat it.
   User Rights live in userRightsApi.js.
   ========================================================================= */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/* Backend rejects page < 1 and limit > 50 with a 400 — clamp first. */
const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, 10)));

const normalizePagination = (raw = {}, page, limit, count, totalKey) => ({
  currentPage: toInt(raw.currentPage, page),
  limit: toInt(raw.limit, limit),
  total: toInt(raw[totalKey] ?? raw.total, count),
  totalPages: toInt(raw.totalPages, count ? 1 : 0),
  hasNextPage: Boolean(raw.hasNextPage),
  hasPreviousPage: Boolean(raw.hasPreviousPage),
});

/** First array found under any of the given keys, else []. */
const readList = (response, keys) => {
  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
};

const requireId = (value, label) => {
  const id = String(value ?? "").trim();
  if (!id) throw new Error(`A ${label} ID is required.`);
  return id;
};

const buildQuery = (page, limit) =>
  new URLSearchParams({ page: String(page), limit: String(limit) }).toString();

/* ------------------------------ GUIDES ------------------------------ */

export async function getGuides({ page = 1, limit = 10 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(`/guides?${buildQuery(p, l)}`, {
    method: "GET",
  });

  const guides = readList(response, ["data"]);

  return {
    guides,
    pagination: normalizePagination(
      response?.pagination,
      p,
      l,
      guides.length,
      "totalGuides",
    ),
  };
}

/** A 404 throws with status 404 ("Guide not found"). */
export async function getGuideById(id) {
  const cleanId = requireId(id, "guide");

  const response = await apiRequest(`/guides/${encodeURIComponent(cleanId)}`, {
    method: "GET",
  });

  return response?.data ?? null;
}

/* ------------------------------ UPDATES ----------------------------- */

export async function getUpdates({ page = 1, limit = 10 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(`/updates?${buildQuery(p, l)}`, {
    method: "GET",
  });

  /* `data` is expected (same as guides); `updates` accepted as a fallback
     until the response shape is confirmed. */
  const updates = readList(response, ["data", "updates"]);

  return {
    updates,
    pagination: normalizePagination(
      response?.pagination,
      p,
      l,
      updates.length,
      "totalUpdates",
    ),
  };
}

/** A 404 throws with status 404. */
export async function getUpdateById(id) {
  const cleanId = requireId(id, "update");

  const response = await apiRequest(`/updates/${encodeURIComponent(cleanId)}`, {
    method: "GET",
  });

  return response?.data ?? response?.update ?? null;
}

/* ------------------------------ BLOGS ------------------------------- */

export async function getBlogs({ page = 1, limit = 10 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(`/blogs?${buildQuery(p, l)}`, {
    method: "GET",
  });

  /* The blogs contract uses `blogs`, not `data`. */
  const blogs = readList(response, ["blogs"]);

  return {
    blogs,
    pagination: normalizePagination(
      response?.pagination,
      p,
      l,
      blogs.length,
      "totalBlogs",
    ),
  };
}

/** Accepts either the UUID or the slug — the backend resolves both. */
export async function getBlogById(idOrSlug) {
  const cleanId = requireId(idOrSlug, "article");

  const response = await apiRequest(`/blogs/${encodeURIComponent(cleanId)}`, {
    method: "GET",
  });

  /* The blogs contract uses `blog`, not `data`. */
  return response?.blog ?? null;
}