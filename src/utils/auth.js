import { clearApiCache } from "@shared/services/apiClient";

const AUTH_TOKEN_KEY = "vakeel_setu_auth_token";
const AUTH_USER_KEY = "vakeel_setu_auth_user";

const hasWindow = () =>
  typeof window !== "undefined" &&
  typeof window.localStorage !== "undefined" &&
  typeof window.sessionStorage !== "undefined";

const safeParse = (value, fallback = null) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "hashedPassword",
  "otp",
  "otpCode",
  "otpHash",
  "accessToken",
  "refreshToken",
  "token",
  "jwt",
  "secret",
]);

export const sanitizeUser = (value) => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(sanitizeUser);
  }

  if (typeof value !== "object") {
    return value;
  }

  const clean = {};

  Object.entries(value).forEach(([key, item]) => {
    if (SENSITIVE_KEYS.has(key)) return;
    clean[key] = sanitizeUser(item);
  });

  return clean;
};

/**
 * Authentication token:
 * - sessionStorage only
 * - survives refresh in the current tab
 * - is removed when the browser/tab session ends
 * - is never copied into localStorage
 */
export const getAuthToken = () => {
  if (!hasWindow()) return null;

  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token) => {
  if (!hasWindow()) return;

  if (!token) {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, String(token));
};

export const clearAuthToken = () => {
  if (!hasWindow()) return;
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Sanitized user profile:
 * - localStorage
 * - can be reused after refresh/reopen
 * - DOES NOT itself mean the user is authenticated
 *
 * The app considers a user logged in only when BOTH:
 *   1. a valid session token exists
 *   2. sanitized user data exists
 */
export const getUserData = () => {
  if (!hasWindow()) return null;

  const parsed = safeParse(
    window.localStorage.getItem(AUTH_USER_KEY),
    null,
  );

  return parsed && typeof parsed === "object" ? parsed : null;
};

export const setUserData = (userData) => {
  if (!hasWindow()) return;

  if (!userData) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  const secureUser = sanitizeUser(userData);

  try {
    window.localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(secureUser),
    );
  } catch (error) {
    console.error("Failed to persist user data:", error);
  }
};

export const clearUserData = () => {
  if (!hasWindow()) return;
  window.localStorage.removeItem(AUTH_USER_KEY);
};

export const clearAuthStorage = () => {
  clearAuthToken();
  clearUserData();
  clearApiCache();
};

export const getInitialAuthSnapshot = () => {
  const token = getAuthToken();
  const user = getUserData();

  return {
    user,
    token,
    isLoggedIn: Boolean(token && user),
  };
};

export const AUTH_STORAGE_KEYS = {
  token: AUTH_TOKEN_KEY,
  user: AUTH_USER_KEY,
};
