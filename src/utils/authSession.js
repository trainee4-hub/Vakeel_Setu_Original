export const AUTH_SESSION_HINT =
  "vakeel_auth_session";

export const GOOGLE_LOGIN_PENDING =
  "vakeel_google_login_pending";

export const setAuthSessionHint = () => {
  try {
    localStorage.setItem(
      AUTH_SESSION_HINT,
      "1",
    );
  } catch {
    // ignore
  }
};

export const hasAuthSessionHint = () => {
  try {
    return (
      localStorage.getItem(
        AUTH_SESSION_HINT,
      ) === "1"
    );
  } catch {
    return false;
  }
};

export const clearAuthSessionHint = () => {
  try {
    localStorage.removeItem(
      AUTH_SESSION_HINT,
    );
  } catch {
    // ignore
  }
};

export const setGoogleLoginPending = () => {
  try {
    sessionStorage.setItem(
      GOOGLE_LOGIN_PENDING,
      "1",
    );
  } catch {
    // ignore
  }
};

export const hasGoogleLoginPending = () => {
  try {
    return (
      sessionStorage.getItem(
        GOOGLE_LOGIN_PENDING,
      ) === "1"
    );
  } catch {
    return false;
  }
};

export const clearGoogleLoginPending = () => {
  try {
    sessionStorage.removeItem(
      GOOGLE_LOGIN_PENDING,
    );
  } catch {
    // ignore
  }
};