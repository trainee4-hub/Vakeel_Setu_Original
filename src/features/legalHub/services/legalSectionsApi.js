import { apiRequest } from "@shared/services/apiClient";

/* =========================================================================
   IPC / BNS — public read APIs (no authentication).

   GET /ipc?page=&limit=                 GET /bns?page=&limit=
   GET /ipc/:id                          GET /bns/:id
   GET /ipc/search?q=&page=&limit=       GET /bns/search?q=&page=&limit=

   API_BASE_URL already ends in /api — paths here must never repeat it.
   The exact list/pagination keys aren't documented yet, so the readers
   below accept the shapes the other Legal Hub endpoints use.
   ========================================================================= */

const DEFAULT_LIMIT = 15;

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, DEFAULT_LIMIT)));

const LIST_KEYS = ["data", "sections", "results", "ipc", "bns", "ipcSections", "bnsSections"];
const RECORD_KEYS = ["data", "section", "ipc", "bns", "ipcSection", "bnsSection"];

function readList(response) {
  if (Array.isArray(response)) return response;
  for (const key of LIST_KEYS) {
    if (Array.isArray(response?.[key])) return response[key];
  }
  return [];
}

function readRecord(response) {
  for (const key of RECORD_KEYS) {
    const value = response?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  }
  return null;
}

/** Keeps every backend field; guarantees id, sectionNo, heading and keywords. */
function normalizeSection(raw) {
  if (!raw || typeof raw !== "object") return null;

  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords.map((k) => String(k).trim()).filter(Boolean)
    : typeof raw.keywords === "string"
      ? raw.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

  return {
    ...raw,
    id: raw.id ?? raw._id ?? null,
    sectionNo: String(raw.sectionNo ?? raw.section ?? "").trim(),
    heading: String(raw.heading ?? raw.title ?? "").trim(),
    keywords,
  };
}

function normalizePagination(raw, page, limit, count) {
  const source = raw && typeof raw === "object" ? raw : {};
  const currentPage = toInt(source.currentPage ?? source.page, page);
  const totalPages = Math.max(0, toInt(source.totalPages, count ? 1 : 0));

  /* totalIpc / totalBns / totalSections / total — whichever the API sends. */
  const totalKey = Object.keys(source).find(
    (key) => /^total/i.test(key) && key !== "totalPages" && Number.isFinite(Number(source[key])),
  );

  return {
    currentPage,
    limit: toInt(source.limit, limit),
    total: totalKey ? Number(source[totalKey]) : null,
    totalPages,
    hasNextPage: typeof source.hasNextPage === "boolean" ? source.hasNextPage : currentPage < totalPages,
    hasPreviousPage: typeof source.hasPreviousPage === "boolean" ? source.hasPreviousPage : currentPage > 1,
  };
}

function toListResult(response, page, limit) {
  const sections = readList(response).map(normalizeSection).filter(Boolean);
  return {
    sections,
    pagination: normalizePagination(response?.pagination, page, limit, sections.length),
  };
}

function createSectionsApi(resource, label) {
  /** GET /{resource}?page=&limit= */
  async function list({ page = 1, limit = DEFAULT_LIMIT } = {}) {
    const p = safePage(page);
    const l = safeLimit(limit);
    const params = new URLSearchParams({ page: String(p), limit: String(l) });
    const response = await apiRequest(`/${resource}?${params.toString()}`, { method: "GET" });
    return toListResult(response, p, l);
  }

  /** GET /{resource}/search?q=&page=&limit= — an empty query falls back to list(). */
  async function search({ q, page = 1, limit = DEFAULT_LIMIT } = {}) {
    const query = String(q ?? "").trim();
    if (!query) return list({ page, limit });

    const p = safePage(page);
    const l = safeLimit(limit);
    const params = new URLSearchParams({ q: query, page: String(p), limit: String(l) });
    const response = await apiRequest(`/${resource}/search?${params.toString()}`, { method: "GET" });
    return toListResult(response, p, l);
  }

  /** GET /{resource}/:id — a 404 throws with status 404. */
  async function getById(id) {
    const cleanId = String(id ?? "").trim();
    if (!cleanId) throw new Error(`A ${label} ID is required.`);
    const response = await apiRequest(`/${resource}/${encodeURIComponent(cleanId)}`, { method: "GET" });
    return normalizeSection(readRecord(response));
  }

  return { list, search, getById };
}

export const ipcSectionsApi = createSectionsApi("ipc", "IPC section");
export const bnsSectionsApi = createSectionsApi("bns", "BNS section");

export const getIpcSections = ipcSectionsApi.list;
export const searchIpcSections = ipcSectionsApi.search;
export const getIpcSectionById = ipcSectionsApi.getById;

export const getBnsSections = bnsSectionsApi.list;
export const searchBnsSections = bnsSectionsApi.search;
export const getBnsSectionById = bnsSectionsApi.getById;