export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

/** Returns an error message, or null when the file is acceptable. */
export function validateImageFile(file) {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Use a JPEG, JPG, PNG or WEBP image.";
  if (file.size > IMAGE_MAX_BYTES) {
    return `The image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The maximum is 5 MB.`;
  }
  return null;
}
