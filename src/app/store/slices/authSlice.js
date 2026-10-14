import { createSlice } from "@reduxjs/toolkit";

import {
  clearAuthStorage,
  getAuthToken,
  getInitialAuthSnapshot,
  sanitizeUser,
  setAuthToken,
  setUserData,
} from "@/utils/auth";


import {
  clearAuthSessionHint,
  clearGoogleLoginPending,
  setAuthSessionHint,
} from "@/utils/authSession";
import {
  getCurrentUser,
  logout as logoutApi,
} from "@features/auth";

/* =========================================================================
   INITIAL STATE
========================================================================= */

const storedAuth =
  getInitialAuthSnapshot();

const initialState = {
  ...storedAuth,

  /*
   * Google OAuth ke baad browser reload hota hai.
   * Jab tak /api/auth/me complete nahi hota,
   * auth decision nahi lena.
   */
 authLoading: false,
authInitialized: false,
};

/* =========================================================================
   HELPERS
========================================================================= */

const extractAuthenticatedUser = (response) => {
  if (!response || typeof response !== "object") {
    return null;
  }

  /*
   * Backend response ke common possible shapes:
   *
   * { success: true, user: {...} }
   * { success: true, advocate: {...} }
   * { success: true, account: {...} }
   * { success: true, data: {...} }
   * { success: true, data: { user: {...} } }
   */
  return (
    response.user ||
    response.advocate ||
    response.account ||
    response.data?.user ||
    response.data?.advocate ||
    response.data?.account ||
    (
      response.data &&
      typeof response.data === "object"
        ? response.data
        : null
    )
  );
};

/* =========================================================================
   SLICE
========================================================================= */

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /* ---------------------------------------------------------------------
       NORMAL LOGIN

       Existing email / phone login jahan token frontend ko milta hai.
    --------------------------------------------------------------------- */

    credentialsSet: (
      state,
      action,
    ) => {
      state.user =
        action.payload.user;

      state.token =
        action.payload.token;

      state.isLoggedIn =
        action.payload.isLoggedIn;

      state.authLoading = false;
      state.authInitialized = true;
    },

    /* ---------------------------------------------------------------------
       GOOGLE / COOKIE SESSION RESTORE

       IMPORTANT:
       Token Redux me na hone par bhi user authenticated hai because
       backend HTTP-only cookie verify kar chuka hai.
    --------------------------------------------------------------------- */

    sessionRestored: (
      state,
      action,
    ) => {
      state.user =
        action.payload.user;

      /*
       * Existing local token ho to preserve karo.
       * Google OAuth case me null reh sakta hai — that's fine.
       */
      state.token =
        state.token ||
        getAuthToken() ||
        null;

      state.isLoggedIn =
        Boolean(action.payload.user);

      state.authLoading = false;
      state.authInitialized = true;
    },

    /* ---------------------------------------------------------------------
       PROFILE UPDATE
    --------------------------------------------------------------------- */

    profileSet: (
      state,
      action,
    ) => {
      state.user =
        action.payload.user;

      state.isLoggedIn =
        action.payload.isLoggedIn;

      state.authLoading = false;
      state.authInitialized = true;
    },

    authCheckStarted: (
      state,
    ) => {
      state.authLoading = true;
    },

    authCheckFinished: (
      state,
    ) => {
      state.authLoading = false;
      state.authInitialized = true;
    },

    authCleared: (
      state,
    ) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.authLoading = false;
      state.authInitialized = true;
    },
  },
});

const {
  credentialsSet,
  sessionRestored,
  profileSet,
  authCheckStarted,
  authCheckFinished,
  authCleared,
} = authSlice.actions;

export const finishAuthInitialization =
  () => (dispatch) => {
    dispatch(
      authCheckFinished(),
    );
  };

/* =========================================================================
   NORMAL LOGIN
========================================================================= */

/**
 * Existing normal login.
 *
 * login(userData, token)
 */

 export const login =
  (
    userData,
    token = null,
  ) =>
  (
    dispatch,
    getState,
  ) => {
    if (!userData) {
      console.error(
        "Login failed: userData is missing",
      );

      return false;
    }

    const secureUser =
      sanitizeUser(userData);

    if (token) {
      setAuthToken(token);
    }

    setUserData(
      secureUser,
    );

    /*
     * Next reload par App knows there was
     * a real authenticated session.
     */
    setAuthSessionHint();

    /*
     * Google pending marker agar kisi stale
     * flow se bacha hua ho to clear.
     */
    clearGoogleLoginPending();

    const effectiveToken =
      token ||
      getState().auth?.token ||
      getAuthToken();

    dispatch(
      credentialsSet({
        user: secureUser,

        token:
          effectiveToken ||
          null,

        /*
         * Authentication user existence se
         * determine karo, token-only se nahi.
         *
         * Cookie auth me frontend token null
         * ho sakta hai.
         */
        isLoggedIn:
          Boolean(secureUser),
      }),
    );

    return true;
  };
/* =========================================================================
   RESTORE AUTHENTICATED SESSION

   THIS FIXES GOOGLE LOGIN.
========================================================================= */

export const restoreAuthSession =
  () =>
  async (
    dispatch,
    getState,
  ) => {
    /*
     * React StrictMode / multiple callers ke
     * duplicate simultaneous restore requests ko rokta hai.
     */
    const currentState =
      getState().auth;

    if (currentState?.authLoading) {
      return null;
    }

    const currentRole = currentState?.user?.role
      ? String(currentState.user.role).toUpperCase()
      : currentState?.user?.accountType
        ? String(currentState.user.accountType).toUpperCase()
        : "";

    if (currentRole === "ADMIN" || currentRole === "CONTENT_CREATOR") {
      dispatch(authCheckFinished());
      return currentState.user;
    }

    dispatch(
      authCheckStarted(),
    );

    try {
      /*
       * GET /api/auth/me
       *
       * authApi must use:
       * credentials: "include"
       */
      const response =
        await getCurrentUser();

      const rawUser =
        extractAuthenticatedUser(
          response,
        );

      if (!rawUser) {
        throw new Error(
          "Authenticated account was not returned by the server.",
        );
      }

      const secureUser =
        sanitizeUser(
          rawUser,
        );

      /*
       * Existing components ke liye cached profile.
       */
      setUserData(
        secureUser,
      );

      /*
       * Successful server authentication means
       * this is a real authenticated session.
       */
      setAuthSessionHint();

      /*
       * OAuth return successfully restored.
       */
      clearGoogleLoginPending();

      dispatch(
        sessionRestored({
          user: secureUser,
        }),
      );

      return secureUser;
    } catch (error) {
      /*
       * 401 means backend was reached correctly,
       * but no valid authenticated session exists.
       *
       * This is not an application error.
       */
      if (error?.status === 401) {
        const currentUser = getState().auth?.user;
        const role = currentUser?.role
          ? String(currentUser.role).toUpperCase()
          : currentUser?.accountType
            ? String(currentUser.accountType).toUpperCase()
            : "";
        if (role === "ADMIN" || role === "CONTENT_CREATOR") {
          dispatch(authCheckFinished());
          return currentUser;
        }

        clearAuthSessionHint();
        clearGoogleLoginPending();
        clearAuthStorage();

        dispatch(
          authCleared(),
        );

        return null;
      }

      /*
       * Network/server error:
       * don't destroy an already-valid local session
       * just because backend temporarily failed.
       */
      const authState =
        getState().auth;

      if (
        authState?.user &&
        authState?.isLoggedIn
      ) {
        dispatch(
          authCheckFinished(),
        );

        return authState.user;
      }

      console.error(
        "AUTH SESSION RESTORE ERROR:",
        error,
      );

      dispatch(
        authCleared(),
      );

      return null;
    }
  };

/* =========================================================================
   LOGOUT

   IMPORTANT FOR GOOGLE LOGIN:
   Backend cookie ko bhi clear karna padega.
========================================================================= */

export const logout =
  () =>
  async (dispatch) => {
    try {
      /*
       * Backend HTTP-only cookie clear.
       */
      await logoutApi();
    } catch (error) {
      console.warn(
        "Backend logout failed:",
        error?.message,
      );
    } finally {
      clearAuthStorage();

      clearAuthSessionHint();
      clearGoogleLoginPending();

      dispatch(
        authCleared(),
      );
    }
  };

/* =========================================================================
   UPDATE COMPLETE PROFILE
========================================================================= */

export const updateProfile =
  (updatedUser) =>
  (
    dispatch,
    getState,
  ) => {
    if (!updatedUser) {
      return false;
    }

    const secureUser =
      sanitizeUser(
        updatedUser,
      );

    setUserData(
      secureUser,
    );

    const authState =
      getState().auth;

    dispatch(
      profileSet({
        user: secureUser,

        /*
         * DON'T depend only on token.
         *
         * Google login can be authenticated through HTTP-only cookie.
         */
        isLoggedIn:
  Boolean(
    secureUser &&
    authState?.isLoggedIn
  ),
      }),
    );

    return true;
  };

/* =========================================================================
   MERGE PARTIAL PROFILE
========================================================================= */

export const mergeProfile =
  (partialUser) =>
  (
    dispatch,
    getState,
  ) => {
    if (
      !partialUser ||
      typeof partialUser !==
        "object"
    ) {
      return false;
    }

    const authState =
      getState().auth;

    const currentUser =
      authState?.user;

    const mergedUser =
      sanitizeUser({
        ...(
          currentUser &&
          typeof currentUser ===
            "object"
            ? currentUser
            : {}
        ),

        ...partialUser,
      });

    setUserData(
      mergedUser,
    );

    dispatch(
      profileSet({
        user:
          mergedUser,

        /*
         * HTTP-only cookie session ko logout mat samjho
         * just because state.token is null.
         */
       isLoggedIn:
  Boolean(
    mergedUser &&
    authState?.isLoggedIn
  ),
      }),
    );

    return true;
  };

/* =========================================================================
   SELECTORS
========================================================================= */

export const selectAuth =
  (state) =>
    state.auth;

export const selectAuthUser =
  (state) =>
    state.auth.user;

export const selectIsLoggedIn =
  (state) =>
    state.auth.isLoggedIn;

export const selectAuthToken =
  (state) =>
    state.auth.token;

export const selectAuthLoading =
  (state) =>
    state.auth.authLoading;

export const selectAuthInitialized =
  (state) =>
    state.auth.authInitialized;

export default authSlice.reducer;