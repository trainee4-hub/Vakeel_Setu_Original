/**
 * Centralized feature flag configuration for consultancy payments.
 * 
 * Rules:
 * - Defaults to FALSE.
 * - Read in ONE place and passed down to components.
 * - Never committed as true in .env.
 */
export function isPaymentsEnabled() {
  const envVal =
    typeof import.meta !== "undefined" && import.meta?.env
      ? import.meta.env.VITE_PAYMENTS_ENABLED
      : undefined;
  return envVal === "true" || envVal === true;
}
