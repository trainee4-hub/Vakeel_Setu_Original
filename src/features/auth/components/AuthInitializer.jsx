import {
  useEffect,
  useRef,
} from "react";

import { useDispatch } from "react-redux";

import {
  finishAuthInitialization,
  restoreAuthSession,
} from "@app/store/slices/authSlice";

import {
  getAuthToken,
  getInitialAuthSnapshot,
} from "@/utils/auth";

import {
  hasAuthSessionHint,
  hasGoogleLoginPending,
} from "@/utils/authSession";

const AuthInitializer = () => {
  const dispatch = useDispatch();

  const restoreStartedRef =
    useRef(false);

  useEffect(() => {
    /*
     * React StrictMode development me effect twice
     * execute kar sakta hai.
     *
     * Restore request sirf once start honi chahiye.
     */
    if (restoreStartedRef.current) {
      return;
    }

    restoreStartedRef.current = true;

    const localAuth =
      getInitialAuthSnapshot();

    const hasLocalToken =
      Boolean(getAuthToken());

    const hasCachedUser =
      Boolean(
        localAuth?.user &&
          localAuth?.isLoggedIn,
      );

    const hasSessionHint =
      hasAuthSessionHint();

    const googleLoginPending =
      hasGoogleLoginPending();

    /*
     * Google OAuth backend callback "/" par redirect
     * kar sakta hai, isliye root entry par server
     * session verify karna zaroori hai.
     */
    const isRootEntry =
      window.location.pathname === "/";

    const shouldRestoreSession =
      isRootEntry ||
      hasLocalToken ||
      hasCachedUser ||
      hasSessionHint ||
      googleLoginPending;

    /*
     * Koi possible session nahi hai.
     *
     * Auth ko immediately initialized mark karo so
     * ProtectedRoute unnecessary wait na kare.
     */
    if (!shouldRestoreSession) {
      dispatch(
        finishAuthInitialization(),
      );

      return;
    }

    /*
     * Restore background me chalega.
     *
     * Ye component koi loading UI render nahi karta,
     * isliye application visually block nahi hogi.
     */
    dispatch(
      restoreAuthSession(),
    );
  }, [dispatch]);

  return null;
};

export default AuthInitializer;