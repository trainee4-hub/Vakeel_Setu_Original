import { apiRequest } from "@shared/services/apiClient";

import { SUPPORTED_LAW_TYPES } from "../utils/bareActsConfig";

/* =========================================================================
   BARE ACTS — public read APIs (no authentication).

   GET /laws?lawType=&page=&limit=
   GET /laws/search?lawType=&q=&page=&limit=
   GET /laws/:id?lawType=

   API_BASE_URL already ends in /api, so paths here must not repeat it.

   The response shape for /laws was not supplied, so the readers below accept
   the documented Legal Hub variants (`data`, or a named key) rather than
   assuming one. Tighten once confirmed.
   ========================================================================= */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, 10)));

const normalizePagination = (raw = {}, page, limit, count) => ({
  currentPage: toInt(raw.currentPage ?? raw.page, page),
  limit: toInt(raw.limit, limit),
  total: toInt(raw.totalLaws ?? raw.totalSections ?? raw.total, count),
  totalPages: toInt(raw.totalPages, count ? 1 : 0),
  hasNextPage: Boolean(raw.hasNextPage),
  hasPreviousPage: Boolean(raw.hasPreviousPage),
});

const readList = (response) => {
  for (const key of ["data", "laws", "sections", "results"]) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
};

const readOne = (response) =>
  response?.data ?? response?.law ?? response?.section ?? null;

/** Guards against a hand-typed URL reaching the backend as a bad lawType. */
const requireLawType = (lawType) => {
  const value = String(lawType || "").trim().toUpperCase();

  if (!SUPPORTED_LAW_TYPES.includes(value)) {
    throw new Error("Unsupported act.");
  }

  return value;
};

const listShape = (response, page, limit) => {
  const sections = readList(response);

  return {
    sections,
    pagination: normalizePagination(
      response?.pagination,
      page,
      limit,
      sections.length,
    ),
  };
};

/** GET /laws?lawType=&page=&limit= */
export async function getBareActSections({ lawType, page = 1, limit = 10 } = {}) {
  const type = requireLawType(lawType);
  const p = safePage(page);
  const l = safeLimit(limit);

  const params = new URLSearchParams({
    lawType: type,
    page: String(p),
    limit: String(l),
  });

  const response = await apiRequest(`/laws?${params.toString()}`, {
    method: "GET",
  });

  return listShape(response, p, l);
}

/** GET /laws/search?lawType=&q=&page=&limit= */
export async function searchBareActSections({
  lawType,
  query,
  page = 1,
  limit = 10,
} = {}) {
  const type = requireLawType(lawType);
  const q = String(query || "").trim();

  if (!q) throw new Error("A search term is required.");

  const p = safePage(page);
  const l = safeLimit(limit);

  const params = new URLSearchParams({
    lawType: type,
    q,
    page: String(p),
    limit: String(l),
  });

  const response = await apiRequest(`/laws/search?${params.toString()}`, {
    method: "GET",
  });

  return listShape(response, p, l);
}

/** GET /laws/:id?lawType= — a 404 throws with status 404. */
export async function getBareActSectionById({ lawType, id } = {}) {
  const type = requireLawType(lawType);
  const cleanId = String(id || "").trim();

  if (!cleanId) throw new Error("A section ID is required.");

  const params = new URLSearchParams({ lawType: type });

  const response = await apiRequest(
    `/laws/${encodeURIComponent(cleanId)}?${params.toString()}`,
    { method: "GET" },
  );

  return readOne(response);
}


/* =========================================================================
   LAW LIBRARY — public, no authentication.

   Backend hierarchy: BearerAct (category) -> Act -> ActSection.
   "Chapter" is a frontend grouping over ActSection.chapterNo/chapterName —
   there is no chapter entity or endpoint.

   Public UI never shows the term "BearerAct"; it is called a Category.
   ========================================================================= */

// const readOne = (response) => response?.data ?? null;

const readMany = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.results)) return response.data.results;
  return [];
};

const readPagination = (raw = {}, page, limit, count) => ({
  page: toInt(raw.page ?? raw.currentPage, page),
  limit: toInt(raw.limit, limit),
  total: toInt(raw.total, count),
  totalPages: toInt(raw.totalPages, count ? 1 : 0),
});

const pageQuery = (page, limit, extra = {}) =>
  new URLSearchParams({
    page: String(safePage(page)),
    limit: String(safeLimit(limit)),
    ...extra,
  }).toString();

const requireParam = (value, label) => {
  const cleaned = String(value ?? "").trim();
  if (!cleaned) throw new Error(`A ${label} is required.`);
  return cleaned;
};

/** GET /bearer-acts — legal categories. */
export async function getCategories({ page = 1, limit = 20 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(`/bearer-acts?${pageQuery(p, l)}`, {
    method: "GET",
  });

  const categories = readMany(response);

  return {
    categories,
    pagination: readPagination(response?.pagination, p, l, categories.length),
  };
}

/** GET /bearer-acts/:id */
export async function getCategory(id) {
  const categoryId = requireParam(id, "category ID");

  const response = await apiRequest(
    `/bearer-acts/${encodeURIComponent(categoryId)}`,
    { method: "GET" },
  );

  return readOne(response);
}

/** GET /bearer-acts/:id/acts */
export async function getCategoryActs(id, { page = 1, limit = 20 } = {}) {
  const categoryId = requireParam(id, "category ID");
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(
    `/bearer-acts/${encodeURIComponent(categoryId)}/acts?${pageQuery(p, l)}`,
    { method: "GET" },
  );

  const acts = readMany(response);

  return {
    acts,
    pagination: readPagination(response?.pagination, p, l, acts.length),
  };
}

/**
 * GET /acts/:id — returns the act plus its sections.
 *
 * When `sections` is present this is the complete set, so chapter navigation
 * is built from it and no extra request is made.
 */
export async function getAct(id) {
  const actId = requireParam(id, "act ID");

  const response = await apiRequest(`/acts/${encodeURIComponent(actId)}`, {
    method: "GET",
  });

  const act = readOne(response);
  if (!act) return null;

  return {
    act,
    sections: Array.isArray(act.sections) ? act.sections : null,
  };
}

/** GET /acts/:id/sections — fallback when /acts/:id omits sections. */
export async function getActSections(id, { page = 1, limit = 20 } = {}) {
  const actId = requireParam(id, "act ID");
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(
    `/acts/${encodeURIComponent(actId)}/sections?${pageQuery(p, l)}`,
    { method: "GET" },
  );

  const sections = readMany(response);

  return {
    sections,
    pagination: readPagination(response?.pagination, p, l, sections.length),
  };
}

/** GET /sections/:id */
export async function getSection(id) {
  const sectionId = requireParam(id, "section ID");

  const response = await apiRequest(
    `/sections/${encodeURIComponent(sectionId)}`,
    { method: "GET" },
  );

  return readOne(response);
}

/** GET /bearer-acts/search — mixed BEARER_ACT / ACT / SECTION results. */
export async function searchLibrary({ q, page = 1, limit = 20 } = {}) {
  const query = requireParam(q, "search term");
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(
    `/bearer-acts/search?${pageQuery(p, l, { q: query })}`,
    { method: "GET" },
  );

  const results = readMany(response);

  return {
    results,
    pagination: readPagination(response?.pagination, p, l, results.length),
  };
}

/** GET /acts/:actId/search — data is { act, results }. */
export async function searchAct(actId, { q, page = 1, limit = 20 } = {}) {
  const id = requireParam(actId, "act ID");
  const query = requireParam(q, "search term");
  const p = safePage(page);
  const l = safeLimit(limit);

  const response = await apiRequest(
    `/acts/${encodeURIComponent(id)}/search?${pageQuery(p, l, { q: query })}`,
    { method: "GET" },
  );

  const results = Array.isArray(response?.data?.results)
    ? response.data.results
    : [];

  return {
    act: response?.data?.act ?? null,
    results,
    pagination: readPagination(response?.pagination, p, l, results.length),
  };
}