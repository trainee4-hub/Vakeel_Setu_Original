import {
  useCallback,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  login as loginAction,
  logout as logoutAction,
  restoreAuthSession as restoreAuthSessionAction,
  selectAuth,
  updateProfile as updateProfileAction,
  mergeProfile as mergeProfileAction,
} from "@app/store/slices/authSlice";

/**
 * Redux-backed authentication hook.
 *
 * Works for:
 *
 * - Normal phone/email login
 * - Google OAuth login
 * - HTTP-only cookie session restore
 * - Profile update
 * - Partial profile merge
 * - Logout
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  const {
    user,
    token,
    isLoggedIn,
    authLoading,
    authInitialized,
  } = useSelector(selectAuth);

  /* =========================================================
     NORMAL LOGIN
  ========================================================= */

  const login = useCallback(
    (
      userData,
      authToken = null,
    ) =>
      dispatch(
        loginAction(
          userData,
          authToken,
        ),
      ),
    [dispatch],
  );

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = useCallback(
    () =>
      dispatch(
        logoutAction(),
      ),
    [dispatch],
  );

  /* =========================================================
     RESTORE SESSION

     Used after Google OAuth redirects back to "/".

     Backend HTTP-only cookie gets checked through:
     GET /api/auth/me
  ========================================================= */

  const restoreSession =
    useCallback(
      () =>
        dispatch(
          restoreAuthSessionAction(),
        ),
      [dispatch],
    );

  /* =========================================================
     REPLACE COMPLETE PROFILE
  ========================================================= */

  const updateProfile =
    useCallback(
      (updatedUser) =>
        dispatch(
          updateProfileAction(
            updatedUser,
          ),
        ),
      [dispatch],
    );

  /* =========================================================
     MERGE PARTIAL PROFILE
  ========================================================= */

  const mergeProfile =
    useCallback(
      (partialUser) =>
        dispatch(
          mergeProfileAction(
            partialUser,
          ),
        ),
      [dispatch],
    );

  return {
    user,
    token,
    isLoggedIn,

    /*
     * Important for Google OAuth.
     */
    authLoading:
      Boolean(authLoading),

    authInitialized:
      Boolean(authInitialized),

    login,
    logout,
    restoreSession,
    updateProfile,
    mergeProfile,
  };
};

export default useAuth;