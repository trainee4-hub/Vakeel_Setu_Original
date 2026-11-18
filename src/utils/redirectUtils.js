/**
 * Redirect and Navigation Utilities for Auth Flows
 * Ensures guests are safely returned to their originating page after login or registration.
 */

const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/advocate-signup",
  "/advocate-signup/experience",
  "/advocate-signup/pricing",
];

/**
 * Validates whether a candidate path is a safe internal application route.
 * Prevents open redirect vulnerabilities (external links, javascript:, protocol-relative URLs).
 *
 * @param {unknown} candidate
 * @returns {string|null} Sanitized path or null if invalid/unsafe
 */
export function getSafeInternalRedirect(candidate) {
  if (!candidate || typeof candidate !== "string") {
    return null;
  }

  const trimmed = candidate.trim();

  // Must begin with a single "/"
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  // Must not contain URL scheme/protocol (e.g. javascript:, http:)
  const protocolCheck = trimmed.slice(0, 15).toLowerCase();
  if (protocolCheck.includes(":") || protocolCheck.includes("\\")) {
    return null;
  }

  // Strip query/hash to check the base path against auth loop blacklist
  const basePath = trimmed.split("?")[0].split("#")[0].toLowerCase();

  // Avoid redirecting back to auth pages to prevent loops
  const isAuthPage = AUTH_PATHS.some(
    (authPath) => basePath === authPath || basePath === `${authPath}/`,
  );

  if (isAuthPage) {
    return null;
  }

  return trimmed;
}

/**
 * Extracts and validates the intended return URL from search parameters or router state.
 * Priority: ?redirect= query parameter > location.state.from
 *
 * @param {URLSearchParams|string|null} searchParams
 * @param {object|null} locationState
 * @returns {string|null} Safe redirect path or null
 */
export function getAuthRedirectParam(searchParams, locationState) {
  let candidate = null;

  if (searchParams) {
    if (typeof searchParams === "string") {
      try {
        const parsed = new URLSearchParams(searchParams);
        candidate = parsed.get("redirect");
      } catch {
        candidate = null;
      }
    } else if (typeof searchParams.get === "function") {
      candidate = searchParams.get("redirect");
    }
  }

  if (!candidate && locationState && typeof locationState === "object") {
    candidate = locationState.from || null;
  }

  return getSafeInternalRedirect(candidate);
}

/**
 * Constructs a login or register URL with an encoded redirect query parameter.
 *
 * @param {"/login"|"/signup"} targetAuthPath
 * @param {string|null} currentPath
 * @returns {string} URL string (e.g. "/login?redirect=%2Fadvocates%2F123")
 */
export function buildAuthRedirectUrl(targetAuthPath, currentPath) {
  const safeCurrent = getSafeInternalRedirect(currentPath);

  if (!safeCurrent) {
    return targetAuthPath;
  }

  const encoded = encodeURIComponent(safeCurrent);
  return `${targetAuthPath}?redirect=${encoded}`;
}

