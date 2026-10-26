import { apiRequest } from "@shared/services/apiClient";
import { createIPCSection, updateIPCSection } from "../../services/content/ipcApi";
import { createBNSSection, updateBNSSection } from "../../services/content/bnsApi";
import { ADMIN_PATHS } from "../../utils/adminUtils";

/* Public list services adapted to the { items, pagination } shape the CMS lists use. */

const toInt = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safePage = (page) => Math.max(1, toInt(page, 1));
const safeLimit = (limit) => Math.min(50, Math.max(1, toInt(limit, 15)));

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

async function fetchSections(endpoint, { page = 1, limit = 15 } = {}) {
  const p = safePage(page);
  const l = safeLimit(limit);
  const params = new URLSearchParams({ page: String(p), limit: String(l) });

  const response = await apiRequest(`/${endpoint}?${params.toString()}`, { method: "GET" });
  const rawList = readList(response);
  const sections = rawList.map(normalizeSection).filter(Boolean);
  const rawPagination = response?.pagination && typeof response.pagination === "object" ? response.pagination : {};

  return {
    items: sections,
    pagination: {
      currentPage: toInt(rawPagination.currentPage ?? rawPagination.page, p),
      limit: toInt(rawPagination.limit, l),
      total: toInt(rawPagination.total ?? rawPagination.totalSections, sections.length),
      totalPages: toInt(rawPagination.totalPages, sections.length ? 1 : 0),
      hasNextPage: Boolean(rawPagination.hasNextPage),
      hasPreviousPage: Boolean(rawPagination.hasPreviousPage),
    },
  };
}

async function fetchSectionById(endpoint, id) {
  const cleanId = String(id ?? "").trim();
  if (!cleanId) throw new Error("A section ID is required.");
  const response = await apiRequest(`/${endpoint}/${encodeURIComponent(cleanId)}`, { method: "GET" });
  return normalizeSection(readRecord(response));
}

export const LEGAL_SECTION_META = {
  IPC: {
    label: "IPC Sections",
    singular: "IPC Section",
    code: "Indian Penal Code",
    icon: "gavel",
    paths: ADMIN_PATHS.ipc,
    create: createIPCSection,
    update: updateIPCSection,
    getById: (id) => fetchSectionById("ipc", id),
    list: (params) => fetchSections("ipc", params),
    examples: { sectionNo: "302", heading: "Punishment for murder", keywords: "IPC Section 302, murder, Indian Penal Code" },
  },
  BNS: {
    label: "BNS Sections",
    singular: "BNS Section",
    code: "Bharatiya Nyaya Sanhita",
    icon: "balance",
    paths: ADMIN_PATHS.bns,
    create: createBNSSection,
    update: updateBNSSection,
    getById: (id) => fetchSectionById("bns", id),
    list: (params) => fetchSections("bns", params),
    examples: {
      sectionNo: "103",
      heading: "Punishment for murder under BNS",
      keywords: "BNS Section 103, murder, Bharatiya Nyaya Sanhita",
    },
  },
};

export const sectionIdOf = (section) => section?.id ?? section?._id ?? null;