/* =========================================================================
   CENTRAL API CONFIG
============================================================================ */

const RAW_API_URL = (
  import.meta.env?.VITE_API_URL ||
  "backend-vakeelsetu.vercel.app"
).trim();

const API_ORIGIN =
  /^https?:\/\//i.test(RAW_API_URL)
    ? RAW_API_URL
    : RAW_API_URL.startsWith("localhost")
      ? `http://${RAW_API_URL}`
      : `https://${RAW_API_URL}`;

export const API_ROOT =
  API_ORIGIN
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "");

export const API_BASE_URL =
  `${API_ROOT}/api`;

export default API_BASE_URL;

/* =========================================================================
   ERROR
============================================================================ */

export class ApiError extends Error {
  constructor(
    message,
    status = 0,
    data = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code =
      data?.code || null;
  }
}

/* =========================================================================
   ERROR HELPERS
============================================================================ */

function statusFallback(status) {
  switch (status) {
    case 400:
    case 422:
      return "Please check the details you entered and try again.";

    case 401:
      return "Authentication required. Please login.";

    case 403:
      return "You don't have permission to do that.";

    case 404:
      return "That resource could not be found.";

    case 409:
      return "That conflicts with existing data.";

    case 429:
      return "Too many requests. Please wait a moment and try again.";

    default:
      return status >= 500
        ? "The server ran into a problem. Please try again shortly."
        : "Something went wrong. Please try again.";
  }
}

function getServerMessage(data) {
  const raw =
    data?.message ||
    data?.error;

  if (
    typeof raw !== "string"
  ) {
    return "";
  }

  const value =
    raw.trim();

  if (
    !value ||
    value.length > 240 ||
    value.includes("\n") ||
    /\bat\s+\w+\s+\(/.test(
      value,
    )
  ) {
    return "";
  }

  return value;
}

/* =========================================================================
   CACHE STORE (Option A: In-Memory Client Cache)
============================================================================ */

const apiCache = new Map();
const inFlightRequests = new Map();

const DEFAULT_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/* =========================================================================
   CENTRAL MUTATION -> READ CACHE INVALIDATION MAP
   Maps each admin mutation endpoint to every public & admin read resource path
   it affects (including query-param and sub-path variants).
============================================================================ */

export const MUTATION_INVALIDATION_MAP = {
  // Bare Acts: categories, acts, sections, search
  "/admin/bearer-acts": ["/bearer-acts", "/acts", "/sections", "/laws", "/admin/bearer-acts", "/admin/acts", "/admin/sections"],
  "/admin/acts":        ["/bearer-acts", "/acts", "/sections", "/laws", "/admin/bearer-acts", "/admin/acts", "/admin/sections"],
  "/admin/sections":    ["/bearer-acts", "/acts", "/sections", "/laws", "/admin/bearer-acts", "/admin/acts", "/admin/sections"],

  // Other Legal Hub content:
  "/admin/blogs":       ["/blogs", "/admin/blogs"],
  "/admin/ipc":         ["/ipc", "/admin/ipc"],
  "/admin/bns":         ["/bns", "/admin/bns"],
  "/admin/guides":      ["/guides", "/admin/guides"],
  "/admin/updates":     ["/updates", "/admin/updates"],
  "/admin/user-rights": ["/user-rights", "/admin/user-rights"],
};

function getApiPathFromCacheKey(key) {
  const colonIndex = key.indexOf(":");
  if (colonIndex === -1) return "";
  const urlStr = key.slice(colonIndex + 1);

  if (urlStr.startsWith(API_BASE_URL)) {
    const rel = urlStr.slice(API_BASE_URL.length);
    return rel.split("?")[0];
  }

  try {
    const parsed = new URL(urlStr);
    let pathname = parsed.pathname;
    if (pathname.startsWith("/api/")) {
      pathname = pathname.slice(4);
    } else if (pathname === "/api") {
      pathname = "/";
    }
    return pathname;
  } catch {
    return urlStr.split("?")[0];
  }
}

function isPathMatchingResource(cachedPath, targetResource) {
  const normCached = cachedPath.startsWith("/") ? cachedPath : `/${cachedPath}`;
  const normTarget = targetResource.startsWith("/") ? targetResource : `/${targetResource}`;

  if (normCached === normTarget) return true;
  if (normCached.startsWith(`${normTarget}/`)) return true;

  return false;
}

/**
 * Clear entries from the in-memory cache.
 * Accepts a resource string or an array of resource strings.
 * Matches exact resource boundaries regardless of token (admin, user, anon).
 * If empty/omitted, clears the entire cache.
 */
export function clearApiCache(resources = "") {
  if (!resources) {
    apiCache.clear();
    return;
  }

  const targets = Array.isArray(resources)
    ? resources.filter(Boolean)
    : [resources].filter(Boolean);

  if (targets.length === 0) {
    apiCache.clear();
    return;
  }

  for (const key of apiCache.keys()) {
    const cachedPath = getApiPathFromCacheKey(key);
    const shouldDelete = targets.some((target) => {
      if (typeof target === "string" && target.startsWith("/")) {
        return isPathMatchingResource(cachedPath, target);
      }
      return key.includes(target);
    });
    if (shouldDelete) {
      apiCache.delete(key);
    }
  }
}

function getResourcePrefix(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const parts = normalized.split("?")[0].split("/").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts[0] === "admin" && parts.length > 1) {
    return `/admin/${parts[1]}`;
  }
  return `/${parts[0]}`;
}

function safeClone(data) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(data);
    } catch {
      // ignore and fallback
    }
  }
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    return data;
  }
}

/* =========================================================================
   REQUEST
============================================================================ */

function getStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.sessionStorage?.getItem("vakeel_setu_auth_token") ||
      window.localStorage?.getItem("vakeel_setu_auth_token") ||
      null
    );
  } catch {
    return null;
  }
}

export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    formData,
    token,
    headers = {},
    cache = true,
    cacheTtl = DEFAULT_CACHE_TTL_MS,
    forceRefresh = false,
  } = {},
) {
  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  const url =
    `${API_BASE_URL}${normalizedPath}`;

  const resolvedToken =
    token !== undefined ? token : getStoredToken();

  const isGet = method.toUpperCase() === "GET";
  const cacheKey = `${resolvedToken || "anon"}:${url}`;

  // 1. Cache hit check
  if (isGet && cache !== false && !forceRefresh) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      if (import.meta.env.DEV) {
        console.log(`[apiClient] (cache hit) GET ${url}`);
      }
      return safeClone(cached.data);
    }

    // 2. In-flight request coalescing
    if (inFlightRequests.has(cacheKey)) {
      if (import.meta.env.DEV) {
        console.log(`[apiClient] (in-flight join) GET ${url}`);
      }
      const shared = await inFlightRequests.get(cacheKey);
      return safeClone(shared);
    }
  }

  const execute = async () => {
    if (import.meta.env.DEV) {
      console.log(
        `[apiClient] ${method} ${url}`,
      );
    }

    let response;

    try {
      response = await fetch(
        url,
        {
          method,

          credentials:
            "include",

          headers: {
            ...(formData
              ? {}
              : {
                "Content-Type":
                  "application/json",
              }),

            ...(resolvedToken
              ? {
                Authorization:
                  `Bearer ${resolvedToken}`,
              }
              : {}),

            ...headers,
          },

          body: formData
            ? formData
            : body !== undefined
              ? JSON.stringify(
                body,
              )
              : undefined,
        },
      );
    } catch {
      throw new ApiError(
        "We couldn't reach the server. Please check your connection and try again.",
        0,
        null,
      );
    }

    const contentType =
      response.headers.get(
        "content-type",
      ) || "";

    let data = null;

    if (
      contentType.includes(
        "application/json",
      )
    ) {
      try {
        data =
          await response.json();
      } catch {
        data = null;
      }
    } else {
      const text =
        await response.text();

      if (!response.ok) {
        throw new ApiError(
          statusFallback(
            response.status,
          ),
          response.status,
          {
            raw: text,
          },
        );
      }

      return {
        success: true,
        data: text,
      };
    }

    if (
      !response.ok ||
      data?.success === false
    ) {
      throw new ApiError(
        getServerMessage(data) ||
        statusFallback(
          response.status,
        ),
        response.status,
        data,
      );
    }

    const result = data ?? {};

    // 3. Store in cache if successful GET
    if (isGet && cache !== false) {
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl: cacheTtl,
      });
    } else if (!isGet) {
      // 4. Invalidate related cache on mutation
      const prefix = getResourcePrefix(normalizedPath);
      const mappedTargets = MUTATION_INVALIDATION_MAP[prefix];
      if (mappedTargets && mappedTargets.length > 0) {
        if (import.meta.env.DEV) {
          console.log(`[apiClient] (cache invalidate) mutation ${normalizedPath} clearing:`, mappedTargets);
        }
        clearApiCache(mappedTargets);
      } else if (prefix) {
        clearApiCache(prefix);
      }
    }

    return result;
  };

  if (isGet && cache !== false && !forceRefresh) {
    const flight = execute();
    inFlightRequests.set(cacheKey, flight);
    try {
      const result = await flight;
      return safeClone(result);
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  return execute();
}