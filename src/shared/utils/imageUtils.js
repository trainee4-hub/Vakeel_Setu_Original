import { API_BASE_URL, API_ROOT } from "../services/apiClient";

export const DEFAULT_AVATAR = "/default-avatar.png";

/**
 * Resolves a full, optimized image URL with dual-resolution variants (.avif).
 *
 * Backend Image Variants:
 * 1. "smallPhotoUrl": ~1.5 KB - 5 KB (.avif)
 *    Best for: listing cards, directory grids, search lists, circular avatars, and thumbnails.
 * 2. "mediumPhotoUrl": ~10 KB - 25 KB (.avif)
 *    Best for: detailed profile view, modal popup, and office full view.
 *
 * @param {string|object|null|undefined} src - Image URL string or object containing image fields
 * @param {"small"|"medium"} [variant="medium"] - Desired resolution variant ("small" or "medium")
 * @returns {string} Fully qualified and optimized image URL (or empty string if no valid source)
 */
export function getOptimizedImageUrl(src, variant = "medium") {
  if (!src) return "";

  let rawUrl = "";

  if (typeof src === "object") {
    if (variant === "small") {
      rawUrl =
        src.smallPhotoUrl ||
        src.smallUrl ||
        src.small ||
        src.mediumPhotoUrl ||
        src.profilePhotoSmallUrl ||
        src.photoSmallUrl ||
        src.profilePhotoUrl ||
        src.profileImage ||
        src.thumbnailUrl ||
        src.photo ||
        src.image ||
        src.imageUrl ||
        src.officePhotoSmallUrl ||
        src.imageSmallUrl ||
        src.url ||
        "";
    } else {
      rawUrl =
        src.mediumPhotoUrl ||
        src.smallPhotoUrl ||
        src.mediumUrl ||
        src.medium ||
        src.profilePhotoMediumUrl ||
        src.photoMediumUrl ||
        src.profilePhotoUrl ||
        src.profileImage ||
        src.photo ||
        src.image ||
        src.imageUrl ||
        src.thumbnailUrl ||
        src.officePhotoMediumUrl ||
        src.imageMediumUrl ||
        src.url ||
        "";
    }
  } else if (typeof src === "string") {
    rawUrl = src.trim();
  }

  if (!rawUrl) return "";

  // Blob and Data URLs (e.g. instant webcam capture or file selection preview)
  if (rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  // Prepend Base URL if relative path
  let fullUrl = rawUrl;
  if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
    const cleanPath = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
    if (cleanPath.startsWith("/api/")) {
      fullUrl = `${API_ROOT}${cleanPath}`;
    } else {
      // Backend specification: url.startsWith('http') ? url : `${API_BASE_URL}${url}`
      fullUrl = `${API_BASE_URL}${cleanPath}`;
    }
  }

  // Dual-size .avif variant resolution
  if (variant === "small") {
    fullUrl = fullUrl.replace(/\/medium\.avif(?=([?#]|$))/i, "/small.avif");
  } else if (variant === "medium") {
    fullUrl = fullUrl.replace(/\/small\.avif(?=([?#]|$))/i, "/medium.avif");
  }

  return fullUrl;
}

/**
 * Shorthand helper to get small.avif variant (~1.5 KB - 5 KB).
 * Recommended for: listing cards, search results, tables, circular avatars, and thumbnails.
 *
 * @param {string|object|null|undefined} src
 * @returns {string}
 */
export function getSmallImageUrl(src) {
  return getOptimizedImageUrl(src, "small");
}

/**
 * Shorthand helper to get medium.avif variant (~10 KB - 25 KB).
 * Recommended for: detailed profile view, modal popup, and office full view.
 *
 * @param {string|object|null|undefined} src
 * @returns {string}
 */
export function getMediumImageUrl(src) {
  return getOptimizedImageUrl(src, "medium");
}

export {
  IMAGE_MAX_BYTES,
  ALLOWED_IMAGE_TYPES,
  IMAGE_ACCEPT,
  validateImageFile,
} from "./imageValidation";
