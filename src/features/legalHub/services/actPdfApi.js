import {
  API_ROOT,
} from "@shared/services/apiClient";

/**
 * Central backend root comes from apiClient.js.
 *
 * Your .env can remain:
 *
 * VITE_API_URL="backend-vakeelsetu.vercel.app"
 *
 * apiClient.js normalizes it to:
 *
 * https://backend-vakeelsetu.vercel.app
 */

const ACT_PDF_BASE_URL =
  `${API_ROOT}/api`;

/* =========================================================================
   GET ALL PDFs ATTACHED TO AN ACT
============================================================================ */

/**
 * GET /api/acts/:actId/pdfs
 *
 * Public endpoint.
 * No authentication required.
 */
export const getActPdfs = async (
  actId,
  options = {},
) => {
  if (!actId) {
    return [];
  }

  const url =
    `${ACT_PDF_BASE_URL}/acts/${encodeURIComponent(
      actId,
    )}/pdfs`;

  if (import.meta.env.DEV) {
    console.log(
      "[actPdfApi] GET:",
      url,
    );
  }

  let response;

  try {
    response = await fetch(
      url,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        signal:
          options.signal,
      },
    );
  } catch (error) {
    if (
      error?.name ===
      "AbortError"
    ) {
      throw error;
    }

    const networkError =
      new Error(
        "Unable to reach the PDF service.",
      );

    networkError.cause =
      error;

    throw networkError;
  }

  let body = null;

  try {
    body =
      await response.json();
  } catch {
    body = null;
  }

  if (import.meta.env.DEV) {
    console.log(
      "[actPdfApi] status:",
      response.status,
    );

    console.log(
      "[actPdfApi] response:",
      body,
    );
  }

  if (!response.ok) {
    const error =
      new Error(
        body?.message ||
          `Unable to load Act PDFs (${response.status})`,
      );

    error.status =
      response.status;

    error.data =
      body;

    throw error;
  }

  return Array.isArray(
    body?.data,
  )
    ? body.data
    : [];
};

/* =========================================================================
   NORMALIZE PDF URL
============================================================================ */

/**
 * Converts PDF URL returned by backend
 * into a secure absolute URL using the current configured backend (API_ROOT).
 *
 * Discards whatever host and protocol the backend sends (e.g. http://localhost:5000
 * or http://backend-vakeelsetu.vercel.app) to prevent mixed-content blocking on HTTPS.
 *
 * Normalizes all path variations:
 *   - http://backend-vakeelsetu.vercel.app/api/acts/pdfs/:id/view
 *   - http://localhost:5000/api/acts/pdfs/:id/view
 *   - https://some-other-host/api/acts/pdfs/:id/view
 *   - /api/acts/pdfs/:id/view
 *   - /acts/pdfs/:id/view
 *
 * Guarantees no /api/api/ duplication and never returns http:// when API_ROOT is https.
 */
export const resolveActPdfUrl = (
  url,
) => {
  if (!url) {
    return "";
  }

  const value =
    String(url).trim();

  if (!value) {
    return "";
  }

  /*
   * Browser generated URLs should remain unchanged.
   */
  if (
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  let pathname = "";
  let search = "";
  let hash = "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      pathname = parsed.pathname;
      search = parsed.search;
      hash = parsed.hash;
    } catch {
      pathname = value.replace(/^https?:\/\/[^/]+/i, "");
    }
  } else {
    const match = value.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    pathname = match?.[1] || "";
    search = match?.[2] || "";
    hash = match?.[3] || "";
  }

  let cleanPath = pathname.replace(/^\/+/, "/");

  if (cleanPath === "/api" || cleanPath.startsWith("/api/")) {
    // Already starts with /api
  } else {
    cleanPath = `/api${cleanPath}`;
  }

  // Prevent duplicate /api/api/
  cleanPath = cleanPath.replace(/^\/api\/api\//, "/api/");

  return `${API_ROOT}${cleanPath}${search}${hash}`;
};

/* =========================================================================
   PDF VIEW URL
============================================================================ */

/**
 * Generates absolute view URL:
 * https://<backend>/api/acts/pdfs/:pdfId/view
 */
export const getActPdfViewUrl = (
  pdf,
) => {
  if (typeof pdf === "string") {
    return resolveActPdfUrl(pdf);
  }

  if (pdf?.id) {
    return `${ACT_PDF_BASE_URL}/acts/pdfs/${encodeURIComponent(
      pdf.id,
    )}/view`;
  }

  return resolveActPdfUrl(
    pdf?.viewUrl,
  );
};

/* =========================================================================
   PDF DOWNLOAD URL
============================================================================ */

/**
 * Generates absolute download URL:
 * https://<backend>/api/acts/pdfs/:pdfId/download
 */
export const getActPdfDownloadUrl = (
  pdf,
) => {
  if (typeof pdf === "string") {
    return resolveActPdfUrl(pdf);
  }

  if (pdf?.id) {
    return `${ACT_PDF_BASE_URL}/acts/pdfs/${encodeURIComponent(
      pdf.id,
    )}/download`;
  }

  return resolveActPdfUrl(
    pdf?.downloadUrl,
  );
};

/* =========================================================================
   PROBE PDF AVAILABILITY (HEAD check)
============================================================================ */

/**
 * Quick HEAD request to check whether the PDF is accessible on the server.
 * Returns { available: boolean, status: number, url: string, message?: string }
 */
export const checkActPdfAvailability = async (
  pdf,
  options = {},
) => {
  const viewUrl = getActPdfViewUrl(pdf);
  if (!viewUrl) {
    return {
      available: false,
      status: 0,
      url: "",
      message: "Invalid PDF URL",
    };
  }

  try {
    const response = await fetch(viewUrl, {
      method: "HEAD",
      signal: options.signal,
    });

    if (response.ok) {
      return {
        available: true,
        status: response.status,
        url: viewUrl,
      };
    }

    return {
      available: false,
      status: response.status,
      url: viewUrl,
      message:
        response.status === 404
          ? "PDF file not found on disk (404)"
          : `PDF unavailable (${response.status})`,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }
    return {
      available: false,
      status: 0,
      url: viewUrl,
      message: "Unable to reach PDF service",
    };
  }
};