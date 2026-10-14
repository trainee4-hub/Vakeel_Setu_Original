/* Shared form rules for Content Creator editors. */
import { hasRichText } from "./richText";
export const META_TITLE_MAX = 60;
export const META_DESCRIPTION_MAX = 160;
export const USER_RIGHT_TITLE_MAX = 255;

/** "a, b ,, c" or ["a", " b "] → ["a", "b", "c"] */
export function parseKeywords(value) {
  if (Array.isArray(value)) return value.map((k) => String(k).trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

/** ["a", "b"] | "a,b" → "a, b" for an editable text input */
export function keywordsToInput(value) {
  return parseKeywords(value).join(", ");
}

export function requireText(errors, field, value, message) {
  if (!String(value ?? "").trim()) errors[field] = message;
}

/** Required rich-text field: "<p></p>" / "<p><br></p>" count as empty. */
export function requireRichText(errors, field, value, message) {
  if (!hasRichText(value)) errors[field] = message;
}
export function maxLength(errors, field, value, max, label) {
  if (!errors[field] && String(value ?? "").trim().length > max) {
    errors[field] = `${label} must be ${max} characters or fewer.`;
  }
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

/** Only the fields whose trimmed value changed — for PATCH requests. */
export function changedFields(form, initial, fields) {
  const out = {};
  fields.forEach((field) => {
    const value = String(form[field] ?? "").trim();
    if (value !== String(initial[field] ?? "").trim()) out[field] = value;
  });
  return out;
}
