import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../auth";
import { getAdvocateProfile } from "../services/advocateApi";
import { isAdvocateUser, normalizeAdvocate } from "@/utils/advocateProfile";

/* =========================================================================
   ADVOCATE PROFILE SYNC

   On a browser refresh the persisted user in localStorage may be stale, so a
   route decision must NOT be made from it alone. This hook re-fetches
   GET /advocate/profile once per session, pushes the normalized advocate into
   Redux, and reports a status the guards can wait on.

   The in-flight promise and the "already synced" flag live at module scope so
   that the dashboard guard and the complete-profile guard mounting in the same
   navigation share ONE request instead of firing two.
   ========================================================================= */

let syncState = {
  promise: null,
  done: false,
};

/** Call on logout so the next advocate re-syncs from scratch. */
export const resetAdvocateProfileSync = () => {
  syncState = { promise: null, done: false };
};

/** Call after a PATCH / photo upload — Redux already holds fresher data. */
export const markAdvocateProfileSynced = () => {
  syncState = { promise: null, done: true };
};

export function useAdvocateProfileSync() {
  const { user, isLoggedIn, updateProfile } = useAuth();

  const isAdvocate = isAdvocateUser(user);
  const shouldSync = isLoggedIn && isAdvocate;

  const [status, setStatus] = useState(() => {
    if (!shouldSync) return "ready";
    return syncState.done ? "ready" : "loading";
  });

  const [error, setError] = useState(null);

  const runSync = useCallback(async () => {
    if (!syncState.promise) {
      syncState.promise = getAdvocateProfile();
    }
    return syncState.promise;
  }, []);

  useEffect(() => {
    /* Not an authenticated advocate — nothing to sync, and the auth guard
       handles the redirect. Never leave status stuck on "loading". */
    if (!shouldSync) {
      setStatus("ready");
      setError(null);
      return undefined;
    }

    if (syncState.done) {
      setStatus("ready");
      return undefined;
    }

    let cancelled = false;

    setStatus("loading");
    setError(null);

    runSync()
      .then((advocate) => {
        if (cancelled) return;

        updateProfile(normalizeAdvocate(advocate));
        syncState.done = true;
        setStatus("ready");
      })
      .catch((err) => {
        /* Clear the cached promise so a retry actually re-requests. */
        syncState.promise = null;

        if (cancelled) return;

        setError(err);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [shouldSync, runSync, updateProfile]);

  const refresh = useCallback(() => {
    syncState = { promise: null, done: false };
    setStatus("loading");
    setError(null);

    return runSync()
      .then((advocate) => {
        updateProfile(normalizeAdvocate(advocate));
        syncState.done = true;
        setStatus("ready");
        return advocate;
      })
      .catch((err) => {
        syncState.promise = null;
        setError(err);
        setStatus("error");
        throw err;
      });
  }, [runSync, updateProfile]);

  return {
    advocate: user,
    status,
    isSyncing: status === "loading",
    error,
    refresh,
  };
}

export default useAdvocateProfileSync;