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
 * into a URL using the current configured backend.
 *
 * This is useful if backend metadata contains:
 *
 * http://localhost:5000/api/...
 *
 * but frontend is using:
 *
 * https://backend-vakeelsetu.vercel.app
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
    value.startsWith(
      "blob:",
    ) ||
    value.startsWith(
      "data:",
    )
  ) {
    return value;
  }

  /*
   * Backend returned full URL:
   *
   * http://localhost:5000/api/acts/pdfs/ID/view
   *
   * We keep only pathname and attach current API_ROOT.
   */
  if (
    /^https?:\/\//i.test(
      value,
    )
  ) {
    try {
      const parsed =
        new URL(value);

      return `${API_ROOT}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return value;
    }
  }

  /*
   * Backend returned:
   *
   * /api/acts/pdfs/ID/view
   */
  if (
    value.startsWith("/")
  ) {
    return `${API_ROOT}${value}`;
  }

  /*
   * Backend returned:
   *
   * api/acts/pdfs/ID/view
   */
  return `${API_ROOT}/${value.replace(
    /^\/+/,
    "",
  )}`;
};

/* =========================================================================
   PDF VIEW URL
============================================================================ */

/**
 * Generates:
 *
 * https://backend-vakeelsetu.vercel.app
 * /api/acts/pdfs/:pdfId/view
 */
export const getActPdfViewUrl = (
  pdf,
) => {
  if (pdf?.id) {
    return `${ACT_PDF_BASE_URL}/acts/pdfs/${encodeURIComponent(
      pdf.id,
    )}/view`;
  }

  /*
   * Fallback when API somehow does not provide id.
   */
  return resolveActPdfUrl(
    pdf?.viewUrl,
  );
};

/* =========================================================================
   PDF DOWNLOAD URL
============================================================================ */

/**
 * Generates:
 *
 * https://backend-vakeelsetu.vercel.app
 * /api/acts/pdfs/:pdfId/download
 */
export const getActPdfDownloadUrl = (
  pdf,
) => {
  if (pdf?.id) {
    return `${ACT_PDF_BASE_URL}/acts/pdfs/${encodeURIComponent(
      pdf.id,
    )}/download`;
  }

  /*
   * Fallback when API somehow does not provide id.
   */
  return resolveActPdfUrl(
    pdf?.downloadUrl,
  );
};