import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@features/auth";
import {
  likeAdvocate,
  unlikeAdvocate,
} from "@features/advocate/services/advocateApi";
import { isAdvocateUser } from "@/utils/advocateProfile";

const normalizeCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, count) : 0;
};

export default function useAdvocateLike({
  advocateId,
  initialLiked = false,
  initialLikeCount = 0,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  const viewerIsAdvocate = isAdvocateUser(user);
  const canLike = Boolean(isLoggedIn && !viewerIsAdvocate);

  /*
   * IMPORTANT:
   * Initial state comes DIRECTLY from Advocate Profile response.
   *
   * No separate GET /user/liked-advocates request.
   */
  const [isLiked, setIsLiked] = useState(Boolean(initialLiked));
  const [likeCount, setLikeCount] = useState(
    normalizeCount(initialLikeCount),
  );

  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);

  const mutationPendingRef = useRef(false);
  const activeAdvocateIdRef = useRef(String(advocateId ?? ""));

  useEffect(() => {
    activeAdvocateIdRef.current = String(advocateId ?? "");
  }, [advocateId]);

  /*
   * As soon as Advocate Profile response arrives, synchronize immediately.
   *
   * No second API.
   */
  useEffect(() => {
    mutationPendingRef.current = false;

    setIsLiked(Boolean(initialLiked));
    setLikeCount(normalizeCount(initialLikeCount));
    setIsLikeLoading(false);
    setLikeError(null);
  }, [advocateId, initialLiked, initialLikeCount]);

  const toggleLike = useCallback(async () => {
    if (!advocateId || mutationPendingRef.current) {
      return;
    }

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: location.pathname + location.search,
        },
      });

      return;
    }

    if (viewerIsAdvocate) {
      setLikeError("Only user accounts can like advocates.");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = normalizeCount(likeCount);

    const nextLiked = !previousLiked;

    const optimisticCount = nextLiked
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    const requestAdvocateId = String(advocateId);

    /*
     * Synchronous request lock.
     */
    mutationPendingRef.current = true;

    /*
     * ================================================================
     * OPTIMISTIC UI
     *
     * USER SEES THIS IMMEDIATELY.
     * ================================================================
     */

    setLikeError(null);
    setIsLiked(nextLiked);
    setLikeCount(optimisticCount);
    setIsLikeLoading(true);

    try {
      const result = nextLiked
        ? await likeAdvocate(advocateId)
        : await unlikeAdvocate(advocateId);

      /*
       * Ignore Advocate A response if user has already moved to Advocate B.
       */
      if (activeAdvocateIdRef.current !== requestAdvocateId) {
        return;
      }

      /*
       * Backend is authoritative after mutation.
       */
      if (typeof result?.liked === "boolean") {
        setIsLiked(result.liked);
      }

      const serverCount = Number(result?.likeCount);

      if (Number.isFinite(serverCount)) {
        setLikeCount(Math.max(0, serverCount));
      }
    } catch (error) {
      if (activeAdvocateIdRef.current !== requestAdvocateId) {
        return;
      }

      const status = error?.status;

      /*
       * Already liked.
       *
       * Backend confirms logical state is liked.
       */
      if (status === 409 && nextLiked) {
        setIsLiked(true);

        const serverCount = Number(
          error?.data?.data?.likeCount ??
            error?.data?.likeCount,
        );

        if (Number.isFinite(serverCount)) {
          setLikeCount(Math.max(0, serverCount));
        } else {
          setLikeCount(previousCount);
        }

        setLikeError(null);
        return;
      }

      /*
       * Already unliked.
       *
       * Backend confirms logical state is false.
       */
      if (status === 404 && !nextLiked) {
        setIsLiked(false);

        const serverCount = Number(
          error?.data?.data?.likeCount ??
            error?.data?.likeCount,
        );

        if (Number.isFinite(serverCount)) {
          setLikeCount(Math.max(0, serverCount));
        } else {
          setLikeCount(previousCount);
        }

        setLikeError(null);
        return;
      }

      /*
       * Real request failure → rollback.
       */
      setIsLiked(previousLiked);
      setLikeCount(previousCount);

      if (status === 401) {
        navigate("/login", {
          state: {
            from: location.pathname + location.search,
          },
        });

        return;
      }

      setLikeError(
        error?.message ||
          "We couldn't update your like. Please try again.",
      );
    } finally {
      if (activeAdvocateIdRef.current === requestAdvocateId) {
        setIsLikeLoading(false);
      }

      mutationPendingRef.current = false;
    }
  }, [
    advocateId,
    isLoggedIn,
    viewerIsAdvocate,
    isLiked,
    likeCount,
    navigate,
    location.pathname,
    location.search,
  ]);

  return {
    isLiked,
    likeCount,
    isLikeLoading,
    likeError,
    canLike,
    viewerIsAdvocate,
    toggleLike,
  };
}