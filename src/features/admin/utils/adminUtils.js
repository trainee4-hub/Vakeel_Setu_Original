import { apiRequest, clearApiCache } from "@shared/services/apiClient";
import { getAuthToken } from "@/utils/auth";

export { clearApiCache, clearApiCache as clearAdminCache };

/* =========================================================================
   ADMIN — shared feature utilities

   adminRequest() is a thin wrapper over the existing apiRequest():
     - reuses API_BASE_URL, credentials: "include" and JSON/FormData handling
     - attaches the session Bearer token (cookie also works)
     - normalises errors (message + field errors)
     - broadcasts a 401 so the layout can end the session once
   ========================================================================= */

export const ADMIN_ROLE = "ADMIN";
export const ADMIN_UNAUTHORIZED_EVENT = "vakeelsetu:admin-unauthorized";

/* ------------------------------ ROUTES ------------------------------ */

const BASE = "/admin";
const CONTENT_BASE = "/admin/content";
const enc = (id) => encodeURIComponent(String(id));

function resourcePaths(segment) {
  return {
    list: `${CONTENT_BASE}/${segment}`,
    create: `${CONTENT_BASE}/${segment}/create`,
    edit: (id) => `${CONTENT_BASE}/${segment}/${enc(id)}/edit`,
  };
}

export const ADMIN_PATHS = {
  root: BASE,
  login: `${BASE}/login`,
  dashboard: `${BASE}/dashboard`,
  advocates: {
    list: `${BASE}/advocates`,
    detail: (id) => `${BASE}/advocates/${enc(id)}`,
  },
  users: {
    list: `${BASE}/users`,
    detail: (id) => `${BASE}/users/${enc(id)}`,
  },
  roles: {
    list: `${BASE}/roles`,
    create: `${BASE}/roles/create`,
    edit: (id) => `${BASE}/roles/${enc(id)}`,
  },
  consultancy: {
    list: `${BASE}/consultancy`,
  },
  advocateBookings: {
    list: `${BASE}/advocate-bookings`,
  },
  feedback: {
    list: `${BASE}/feedback`,
  },
  help: {
    list: `${BASE}/help`,
    detail: (id) => `${BASE}/help/${enc(id)}`,
  },
  contentCreators: {
    list: `${BASE}/content-creators`,
  },
  blogs: resourcePaths("blogs"),
  ipc: resourcePaths("ipc"),
  bns: resourcePaths("bns"),
  userRights: resourcePaths("user-rights"),
  bareActs: {
    list: `${CONTENT_BASE}/bare-acts`,
    categories: {
      create: `${CONTENT_BASE}/bare-acts/categories/create`,
      edit: (id) => `${CONTENT_BASE}/bare-acts/categories/${enc(id)}/edit`,
    },
    acts: {
      create: `${CONTENT_BASE}/bare-acts/acts/create`,
      edit: (id) => `${CONTENT_BASE}/bare-acts/acts/${enc(id)}/edit`,
    },
    sections: {
      create: `${CONTENT_BASE}/bare-acts/sections/create`,
      edit: (id) => `${CONTENT_BASE}/bare-acts/sections/${enc(id)}/edit`,
    },
  },
  guides: resourcePaths("guides"),
  updates: resourcePaths("updates"),
};

/** Public Legal Hub pages that render this content (from AppRoutes.jsx). */
export const PUBLIC_VIEW_PATHS = {
  blog: (blog) => (blog?.slug ? `/legal-hub/articles/${enc(blog.slug)}` : null),
  userRight: (right) => (right?.id ? `/legal-hub/rights/${enc(right.id)}` : null),
  guide: (guide) => (guide?.id ? `/legal-hub/guides/${enc(guide.id)}` : null),
  /* /legal-hub/:type/:id is an existing route in AppRoutes.jsx. */
  update: (update) => (update?.id ? `/legal-hub/updates/${enc(update.id)}` : null),
  /*
   * IPC/BNS have no public per-section route: the public pages are
   * /legal-hub/ipc and /legal-hub/bns, where LegalSectionExplorer reads ?q=
   * and runs the real GET /{ipc|bns}/search. Preview reuses that mechanism.
   */
  legalSection: (type, section) => {
    const sectionNo = String(section?.sectionNo ?? "").trim();
    if (!sectionNo) return null;
    return `/legal-hub/${type === "BNS" ? "bns" : "ipc"}?q=${encodeURIComponent(sectionNo)}`;
  },
};

/* ------------------------------- ROLE ------------------------------- */

/** "admin" | "ADMIN" → "ADMIN" */
export function normalizeRole(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
}

export function getAccountRole(user) {
  if (!user || typeof user !== "object") return null;
  return normalizeRole(user.role ?? user.accountType ?? user.userType ?? user.type);
}

export const ADMIN_PANEL_ROLES = ["ADMIN", "CONTENT_CREATOR"];

export function isAdminPanelAccount(user) {
  return ADMIN_PANEL_ROLES.includes(getAccountRole(user));
}

export function isFullAdmin(user) {
  return getAccountRole(user) === "ADMIN";
}

export function formatRoleTitle(str) {
  if (!str) return "Content Creator";
  if (/[a-z]/.test(str)) return str;
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getDisplayRole(user) {
  if (!user || typeof user !== "object") return "Admin";

  const rawRole = normalizeRole(user.role ?? user.accountType ?? user.userType ?? user.type);
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  const rolesList = Array.isArray(user.roles) ? user.roles : [];

  // Primary Admin check
  if (rawRole === "ADMIN" || rolesList.includes("ADMIN") || permissions.includes("*")) {
    return "Admin";
  }

  // If roleDetails is populated with custom displayName
  if (Array.isArray(user.roleDetails) && user.roleDetails.length > 0) {
    const detail = user.roleDetails[0];
    if (detail?.displayName) return detail.displayName;
    if (detail?.name) return formatRoleTitle(detail.name);
  }

  // If custom assigned role exists in roles array
  const customRole = rolesList.find((r) => r && r !== "ADMIN" && r !== "CONTENT_CREATOR");
  if (customRole) {
    return formatRoleTitle(customRole);
  }

  // If user.role is a custom assigned role
  if (user.role && user.role !== "ADMIN" && user.role !== "CONTENT_CREATOR") {
    return formatRoleTitle(user.role);
  }

  // Default fallback for staff accounts
  if (rawRole === "CONTENT_CREATOR" || rolesList.includes("CONTENT_CREATOR")) {
    return "Content Creator";
  }

  return "Admin";
}

/** Wildcard-aware: "*" matches everything, "blogs:*" matches "blogs:create". */
export function hasPermission(permissions, required) {
  if (!Array.isArray(permissions)) return false;
  if (permissions.includes("*")) return true;
  if (!required || (Array.isArray(required) && required.length === 0)) return true;
  const list = Array.isArray(required) ? required : [required];
  return list.some((code) => {
    if (permissions.includes(code)) return true;
    const module = String(code).split(":")[0];
    return permissions.includes(`${module}:*`);
  });
}

export const isAdminAccount = (user) => isFullAdmin(user);

/* ------------------------------ ERRORS ------------------------------ */

export class AdminApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {}, data = null } = {}) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.data = data;
  }
}

const STATUS_MESSAGES = {
  0: "We couldn't reach the server. Please check your connection and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "This content could not be found.",
  413: "The file is too large. The maximum size is 5 MB.",
  500: "The server ran into a problem. Please try again shortly.",
};

function extractFieldErrors(errors) {
  const out = {};
  if (Array.isArray(errors)) {
    errors.forEach((entry) => {
      if (!entry || typeof entry !== "object") return;
      const field = entry.field ?? entry.path ?? entry.param;
      const message = entry.message ?? entry.msg;
      if (field && message && !out[field]) out[field] = String(message);
    });
  } else if (errors && typeof errors === "object") {
    Object.entries(errors).forEach(([field, value]) => {
      const message = Array.isArray(value) ? value[0] : typeof value === "string" ? value : value?.message;
      if (message) out[field] = String(message);
    });
  }
  return out;
}

/** Converts ApiError (apiClient) or anything thrown into an AdminApiError. */
export function toAdminError(error) {
  if (error instanceof AdminApiError) return error;

  const status = Number(error?.status) || 0;
  const data = error?.data ?? null;

  let message;
  if (status === 403 || status === 413) message = STATUS_MESSAGES[status];
  else if (status >= 500) message = STATUS_MESSAGES[500];
  else message = error?.message || STATUS_MESSAGES[status] || "Something went wrong. Please try again.";

  return new AdminApiError(message, { status, fieldErrors: extractFieldErrors(data?.errors), data });
}

/* ------------------------------ REQUEST ----------------------------- */

/**
 * Protected Admin request.
 * @param {string} path  path WITHOUT "/api" (API_BASE_URL already ends in /api)
 */
export async function adminRequest(path, { method = "GET", body, formData, cache, cacheTtl, forceRefresh } = {}) {
  try {
    return await apiRequest(path, {
      method,
      body,
      formData,
      token: getAuthToken() || undefined,
      cache,
      cacheTtl,
      forceRefresh,
    });
  } catch (error) {
    const normalized = toAdminError(error);
    if (normalized.status === 401 && typeof window !== "undefined") {
      clearApiCache();
      window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
    }
    throw normalized;
  }
}

/** First plain-object value found under the given keys. */
export function extractRecord(response, keys) {
  for (const key of keys) {
    const value = response?.[key];
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
  }
  return null;
}

/** First array value found under the given keys, or the response itself if array. */
export function extractList(response, keys = ["data", "items"]) {
  if (Array.isArray(response)) return response;
  for (const key of keys) {
    const value = response?.[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

/** Normalized pagination helper across diverse backend response envelopes. */
export function normalizePagination(raw, page = 1, limit = 10, count = 0) {
  const source = raw && typeof raw === "object" ? raw : {};
  const toInt = (val, fallback) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  };
  const currentPage = Math.max(1, toInt(source.page ?? source.currentPage, page));
  const pageLimit = Math.max(1, toInt(source.limit, limit));
  const total = toInt(
    source.total ??
      source.totalItems ??
      source.totalAdvocates ??
      source.totalUsers ??
      source.totalRoles ??
      source.totalFeedback ??
      source.totalConsultations,
    count,
  );
  const totalPages = Math.max(0, toInt(source.totalPages, Math.ceil(total / pageLimit) || (count ? 1 : 0)));
  return {
    currentPage,
    limit: pageLimit,
    total,
    totalPages,
    hasNextPage: typeof source.hasNextPage === "boolean" ? source.hasNextPage : currentPage < totalPages,
    hasPreviousPage: typeof source.hasPreviousPage === "boolean" ? source.hasPreviousPage : currentPage > 1,
  };
}

/* ------------------------------- UX -------------------------------- */

/** Brings the page's error banner into view after a failed save. */
export function scrollToTop() {
  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------------ DISPLAY ----------------------------- */

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function countWords(text) {
  if (!text || typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function daysUntil(targetDate) {
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  if (Number.isNaN(target)) return null;
  const diffMs = target - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export const idPath = enc;
