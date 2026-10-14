import { useCallback, useEffect, useRef, useState } from "react";

import { getAuthToken } from "@/utils/auth";
import { API_BASE_URL } from "../utils/advocateProfileUtils";

const getSavedId = (entry) =>
  entry?.id ??
  entry?._id ??
  entry?.advocateId ??
  entry?.advocate?.id ??
  entry?.advocate?._id ??
  null;

const readResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export default function useSavedLawyer({
  advocateId,
  initialSaved = null,
  isLoggedIn,
  viewerIsAdvocate = false,
  navigate,
  locationPathname,
}) {
  /*
   * If profile already gives isSaved, show it immediately.
   */
  const [isSaved, setIsSaved] = useState(Boolean(initialSaved));

  /*
   * Background hydration only.
   */
  const [savedLawyerLoading, setSavedLawyerLoading] = useState(false);

  /*
   * POST / DELETE mutation state.
   */
  const [savingLawyer, setSavingLawyer] = useState(false);

  const [savedLawyerError, setSavedLawyerError] = useState(null);

  /*
   * Prevent duplicate Save / Unsave requests.
   */
  const mutationPendingRef = useRef(false);

  /*
   * Used to prevent stale GET responses from overwriting
   * a newer Save / Unsave mutation.
   */
  const mutationVersionRef = useRef(0);

  /*
   * Keeps track of the currently viewed advocate.
   */
  const activeAdvocateIdRef = useRef(String(advocateId ?? ""));

  useEffect(() => {
    activeAdvocateIdRef.current = String(advocateId ?? "");
  }, [advocateId]);

  /* =====================================================================
     ADVOCATE CHANGE
  ===================================================================== */

  useEffect(() => {
    mutationVersionRef.current += 1;
    mutationPendingRef.current = false;

    /*
     * Advocate accounts cannot use Saved Lawyers.
     * Never retain a saved state when viewing as an advocate.
     */
    if (viewerIsAdvocate) {
      setIsSaved(false);
    } else {
      setIsSaved(Boolean(initialSaved));
    }

    setSavingLawyer(false);
    setSavedLawyerLoading(false);
    setSavedLawyerError(null);
  }, [advocateId, initialSaved, viewerIsAdvocate]);

  /* =====================================================================
     BACKGROUND SAVED STATUS
  ===================================================================== */

  useEffect(() => {
    /*
     * Saved-lawyers API is USER-only.
     *
     * IMPORTANT:
     * Do not call:
     *
     * GET /saved-lawyers
     *
     * for advocate accounts because backend correctly responds with 403.
     */
    if (
      !advocateId ||
      !isLoggedIn ||
      viewerIsAdvocate
    ) {
      setSavedLawyerLoading(false);

      if (viewerIsAdvocate) {
        setIsSaved(false);
        setSavedLawyerError(null);
      }

      return undefined;
    }

    /*
     * Profile API already positively confirmed that
     * this advocate is saved.
     */
    if (initialSaved === true) {
      setIsSaved(true);
      setSavedLawyerLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    const requestAdvocateId = String(advocateId);

    const versionAtStart =
      mutationVersionRef.current;

    const checkSavedState = async () => {
      const token = getAuthToken();

      setSavedLawyerLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/saved-lawyers`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          },
        );

        const data = await readResponse(response);

        if (controller.signal.aborted) {
          return;
        }

        /*
         * 401 = authentication expired.
         *
         * Background hydration should not automatically redirect.
         * The actual Save click can handle login navigation.
         */
        if (response.status === 401) {
          return;
        }

        /*
         * 403 should normally never happen now because advocate
         * accounts are blocked before this request.
         */
        if (response.status === 403) {
          return;
        }

        if (
          !response.ok ||
          data?.success === false
        ) {
          return;
        }

        /*
         * User may have clicked Save / Unsave while this GET
         * request was pending.
         *
         * Ignore stale GET response.
         */
        if (
          activeAdvocateIdRef.current !== requestAdvocateId ||
          mutationVersionRef.current !== versionAtStart
        ) {
          return;
        }

        const savedAdvocates =
          data?.data?.advocates ??
          data?.savedAdvocates ??
          data?.advocates ??
          data?.data ??
          [];

        if (!Array.isArray(savedAdvocates)) {
          return;
        }

        const alreadySaved = savedAdvocates.some(
          (entry) =>
            String(getSavedId(entry)) === requestAdvocateId,
        );

        setIsSaved(alreadySaved);
      } catch (error) {
        if (error?.name !== "AbortError") {
          /*
           * Background hydration failure should not block
           * normal page interaction.
           */
          console.warn(
            "Saved lawyer state sync failed:",
            error,
          );
        }
      } finally {
        if (
          !controller.signal.aborted &&
          activeAdvocateIdRef.current === requestAdvocateId
        ) {
          setSavedLawyerLoading(false);
        }
      }
    };

    checkSavedState();

    return () => {
      controller.abort();
    };
  }, [
    advocateId,
    initialSaved,
    isLoggedIn,
    viewerIsAdvocate,
  ]);

  /* =====================================================================
     SAVE / UNSAVE
  ===================================================================== */

  const toggleSavedLawyer = useCallback(async () => {
    /*
     * No advocate selected or another mutation already running.
     */
    if (
      !advocateId ||
      mutationPendingRef.current
    ) {
      return;
    }

    /*
     * Advocate accounts are not allowed to Save / Unsave.
     *
     * This protects against programmatic calls even though
     * the UI button is already disabled.
     */
    if (viewerIsAdvocate) {
      setSavedLawyerError(null);
      return;
    }

    /*
     * Guest user → login.
     */
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: locationPathname,
          fromAdvocateId: advocateId,
        },
      });

      return;
    }

    const previousSaved = isSaved;
    const nextSaved = !previousSaved;

    const requestAdvocateId =
      String(advocateId);

    mutationPendingRef.current = true;
    mutationVersionRef.current += 1;

    /*
     * ================================================================
     * OPTIMISTIC UI
     * ================================================================
     */

    setSavedLawyerError(null);
    setIsSaved(nextSaved);
    setSavingLawyer(true);

    const token = getAuthToken();

    try {
      let response;

      /* ================= SAVE ================= */

      if (nextSaved) {
        response = await fetch(
          `${API_BASE_URL}/saved-lawyers`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",

              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            body: JSON.stringify({
              advocateId,
            }),
          },
        );
      }

      /* ================= UNSAVE ================= */

      else {
        response = await fetch(
          `${API_BASE_URL}/saved-lawyers/${encodeURIComponent(
            advocateId,
          )}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          },
        );
      }

      const data = await readResponse(response);

      /*
       * User navigated to another advocate while request
       * was running. Do not update the new profile.
       */
      if (
        activeAdvocateIdRef.current !== requestAdvocateId
      ) {
        return;
      }

      if (
        !response.ok ||
        data?.success === false
      ) {
        const error = new Error(
          data?.message ||
            (nextSaved
              ? "Unable to save advocate."
              : "Unable to remove saved advocate."),
        );

        error.status = response.status;
        error.data = data;

        throw error;
      }

      /*
       * Prefer explicit backend state if available.
       */
      const serverSaved =
        typeof data?.isSaved === "boolean"
          ? data.isSaved
          : typeof data?.saved === "boolean"
            ? data.saved
            : typeof data?.data?.isSaved === "boolean"
              ? data.data.isSaved
              : typeof data?.data?.saved === "boolean"
                ? data.data.saved
                : nextSaved;

      setIsSaved(serverSaved);
    } catch (error) {
      if (
        activeAdvocateIdRef.current !== requestAdvocateId
      ) {
        return;
      }

      /*
       * Duplicate Save means backend confirms it
       * is already saved.
       */
      if (
        error?.status === 409 &&
        nextSaved
      ) {
        setIsSaved(true);
        setSavedLawyerError(null);
        return;
      }

      /*
       * Delete 404 means it is already unsaved.
       */
      if (
        error?.status === 404 &&
        !nextSaved
      ) {
        setIsSaved(false);
        setSavedLawyerError(null);
        return;
      }

      /*
       * Rollback optimistic state.
       */
      setIsSaved(previousSaved);

      /*
       * Authentication expired.
       */
      if (error?.status === 401) {
        navigate("/login", {
          state: {
            from: locationPathname,
            fromAdvocateId: advocateId,
          },
        });

        return;
      }

      /*
       * Safety fallback.
       *
       * Advocate requests should already be prevented above,
       * but don't expose a raw Forbidden error in the UI.
       */
      if (error?.status === 403) {
        setSavedLawyerError(
          "This account cannot save advocates.",
        );
        return;
      }

      setSavedLawyerError(
        error?.message ||
          (nextSaved
            ? "Unable to save advocate."
            : "Unable to remove saved advocate."),
      );
    } finally {
      if (
        activeAdvocateIdRef.current === requestAdvocateId
      ) {
        setSavingLawyer(false);
      }

      mutationPendingRef.current = false;
    }
  }, [
    advocateId,
    isLoggedIn,
    isSaved,
    viewerIsAdvocate,
    navigate,
    locationPathname,
  ]);

  return {
    isSaved,
    savingLawyer,
    savedLawyerLoading,
    savedLawyerError,
    toggleSavedLawyer,
  };
}