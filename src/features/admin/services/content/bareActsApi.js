import { apiRequest } from "@shared/services/apiClient";
import { adminRequest, extractRecord, idPath } from "../../utils/adminUtils";

/* =========================================================================
   BARE ACTS  (backend spelling: BEARER_ACT / /bearer-acts)

   Public reads:
     GET /bearer-acts?page=&limit=
     GET /bearer-acts/:id
     GET /bearer-acts/:id/acts?page=&limit=
     GET /acts/:id
     GET /acts/:id/sections?page=&limit=
     GET /sections/:id

   Admin writes:
     POST /admin/bearer-acts
     { type: "BEARER_ACT" | "ACT" | "SECTION", operation: "CREATE" | "UPDATE", data: {…} }

   No DELETE operation exists in this contract, so the UI has no delete action.
   ========================================================================= */

export const DEFAULT_LIMIT = 20;
const MAX_AUTO_PAGES = 5; // safety cap when loading every page for a <select>

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function normalizePagination(raw, page, limit, count) {
  const source = raw && typeof raw === "object" ? raw : {};
  const currentPage = toInt(source.page ?? source.currentPage, page);
  const totalPages = Math.max(0, toInt(source.totalPages, count ? 1 : 0));
  return {
    currentPage,
    limit: toInt(source.limit, limit),
    total: toInt(source.total, null),
    totalPages,
    hasNextPage: typeof source.hasNextPage === "boolean" ? source.hasNextPage : currentPage < totalPages,
    hasPreviousPage: typeof source.hasPreviousPage === "boolean" ? source.hasPreviousPage : currentPage > 1,
  };
}

function toListResult(response, page, limit) {
  const items = Array.isArray(response?.data) ? response.data : [];
  return { items, pagination: normalizePagination(response?.pagination, page, limit, items.length) };
}

const query = (page, limit) =>
  new URLSearchParams({ page: String(Math.max(1, toInt(page, 1))), limit: String(Math.max(1, toInt(limit, DEFAULT_LIMIT))) }).toString();

/* ------------------------------- READS ------------------------------- */

export async function getBearerActs({ page = 1, limit = DEFAULT_LIMIT } = {}) {
  return toListResult(await apiRequest(`/bearer-acts?${query(page, limit)}`, { method: "GET" }), page, limit);
}

export async function getBearerAct(id) {
  const response = await apiRequest(`/bearer-acts/${idPath(id)}`, { method: "GET" });
  return extractRecord(response, ["data"]);
}

export async function getActsByBearerAct(bearerActId, { page = 1, limit = DEFAULT_LIMIT } = {}) {
  const response = await apiRequest(`/bearer-acts/${idPath(bearerActId)}/acts?${query(page, limit)}`, { method: "GET" });
  return toListResult(response, page, limit);
}

export async function getAct(id) {
  const response = await apiRequest(`/acts/${idPath(id)}`, { method: "GET" });
  return extractRecord(response, ["data"]);
}

export async function getActSections(actId, { page = 1, limit = DEFAULT_LIMIT } = {}) {
  const response = await apiRequest(`/acts/${idPath(actId)}/sections?${query(page, limit)}`, { method: "GET" });
  return toListResult(response, page, limit);
}

export async function getSection(id) {
  const response = await apiRequest(`/sections/${idPath(id)}`, { method: "GET" });
  return extractRecord(response, ["data"]);
}

/** Every page of a paginated read, for the category / act dropdowns. */
async function loadAllPages(loader) {
  const first = await loader({ page: 1, limit: 100 });
  const totalPages = Math.min(first.pagination?.totalPages ?? 1, MAX_AUTO_PAGES);
  const items = [...first.items];
  for (let page = 2; page <= totalPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop -- pages must be requested in order
    const next = await loader({ page, limit: 100 });
    items.push(...next.items);
  }
  return items;
}

export const getAllBearerActs = () => loadAllPages(getBearerActs);
export const getAllActs = (bearerActId) =>
  loadAllPages((params) => getActsByBearerAct(bearerActId, params));

/* ------------------------------- WRITES ------------------------------ */

/** POST /admin/bearer-acts — the single write endpoint. */
export async function writeBearerAct({ type, operation, data }) {
  const response = await adminRequest("/admin/bearer-acts", {
    method: "POST",
    body: { type, operation, data },
  });
  return extractRecord(response, ["data"]);
}

export const createBearerActCategory = (data) => writeBearerAct({ type: "BEARER_ACT", operation: "CREATE", data });
export const updateBearerActCategory = (data) => writeBearerAct({ type: "BEARER_ACT", operation: "UPDATE", data });

export const createAct = (data) => writeBearerAct({ type: "ACT", operation: "CREATE", data });
export const updateAct = (data) => writeBearerAct({ type: "ACT", operation: "UPDATE", data });

export const createSection = (data) => writeBearerAct({ type: "SECTION", operation: "CREATE", data });
export const updateSection = (data) => writeBearerAct({ type: "SECTION", operation: "UPDATE", data });

/* Display helpers shared by the lists and the dropdowns. */
export const categoryLabel = (category) => category?.name ?? "Untitled category";
export const actLabel = (act) => [act?.heading || act?.act, act?.year].filter(Boolean).join(" · ");
export const recordId = (record) => record?.id ?? record?._id ?? null;
