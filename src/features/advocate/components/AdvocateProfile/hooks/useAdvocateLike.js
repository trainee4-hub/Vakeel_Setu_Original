import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@features/auth";
import {
  getLikedAdvocates,
  likeAdvocate,
  unlikeAdvocate,
} from "@features/advocate/services/advocateApi";
import { isAdvocateUser } from "@/utils/advocateProfile";

const LIKED_STORAGE_KEY = "vakeel_setu_user_liked_advocates";

const getCachedLikedSet = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return new Set();
  try {
    const raw = window.sessionStorage.getItem(LIKED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const recordLikedInCache = (id, liked) => {
  if (typeof window === "undefined" || !window.sessionStorage || !id) return;
  try {
    const set = getCachedLikedSet();
    const strId = String(id);
    if (liked) {
      set.add(strId);
    } else {
      set.delete(strId);
    }
    window.sessionStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore sessionStorage write errors
  }
};

const normalizeCount = (value) => {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, count) : 0;
};

export default function useAdvocateLike({
  advocateId,
  initialLiked = false,
  initialLikeCount = 0,
  isLoggedIn: propIsLoggedIn,
  viewerIsAdvocate: propViewerIsAdvocate,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn: authIsLoggedIn } = useAuth();

  const isLoggedIn = propIsLoggedIn ?? authIsLoggedIn;
  const viewerIsAdvocate = propViewerIsAdvocate ?? isAdvocateUser(user);
  const canLike = !viewerIsAdvocate;

  const targetId = String(advocateId ?? "");
  const cachedIsLiked = targetId ? getCachedLikedSet().has(targetId) : false;

  const [isLiked, setIsLiked] = useState(() => {
    if (cachedIsLiked) return true;
    return Boolean(initialLiked);
  });

  const [likeCount, setLikeCount] = useState(() => {
    const baseCount = normalizeCount(initialLikeCount);
    if (cachedIsLiked && baseCount === 0) return 1;
    return baseCount;
  });

  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);

  const mutationPendingRef = useRef(false);
  const activeAdvocateIdRef = useRef(targetId);

  useEffect(() => {
    activeAdvocateIdRef.current = String(advocateId ?? "");
  }, [advocateId]);

  /*
   * Synchronize when advocate details or initial props arrive.
   */
  useEffect(() => {
    mutationPendingRef.current = false;
    setLikeError(null);

    const currentId = String(advocateId ?? "");
    const isCached = currentId ? getCachedLikedSet().has(currentId) : false;

    if (initialLiked === true || isCached) {
      setIsLiked(true);
    } else if (typeof initialLiked === "boolean") {
      setIsLiked(initialLiked);
    }

    if (initialLikeCount !== null && initialLikeCount !== undefined) {
      const serverNum = Number(initialLikeCount);
      if (Number.isFinite(serverNum)) {
        setLikeCount((prev) => {
          if ((initialLiked || isCached) && serverNum === 0) {
            return Math.max(prev, 1);
          }
          return Math.max(0, serverNum);
        });
      }
    }

    setIsLikeLoading(false);
  }, [advocateId, initialLiked, initialLikeCount]);

  /*
   * Background hydration from user's liked advocates list.
   * Ensures liked state and count remain consistent across page navigations.
   */
  useEffect(() => {
    if (!advocateId || !isLoggedIn || viewerIsAdvocate) {
      return undefined;
    }

    const currentAdvocateId = String(advocateId);
    let isCancelled = false;

    const syncLikedState = async () => {
      try {
        const likedList = await getLikedAdvocates();
        if (isCancelled || activeAdvocateIdRef.current !== currentAdvocateId) {
          return;
        }

        if (Array.isArray(likedList)) {
          const found = likedList.find(
            (item) =>
              String(item?.id ?? item?._id ?? item?.advocateId) ===
              currentAdvocateId,
          );

          if (found) {
            recordLikedInCache(currentAdvocateId, true);
            setIsLiked(true);
            const foundCount = Number(found.likeCount);
            if (Number.isFinite(foundCount)) {
              setLikeCount((prev) => Math.max(prev, foundCount));
            }
          } else if (!mutationPendingRef.current && initialLiked !== true) {
            recordLikedInCache(currentAdvocateId, false);
            setIsLiked(false);
          }
        }
      } catch {
        // Hydration error silently suppressed to protect user experience
      }
    };

    syncLikedState();

    return () => {
      isCancelled = true;
    };
  }, [advocateId, isLoggedIn, viewerIsAdvocate, initialLiked]);

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
     * ================================================================
     */

    setLikeError(null);
    setIsLiked(nextLiked);
    setLikeCount(optimisticCount);
    recordLikedInCache(requestAdvocateId, nextLiked);
    setIsLikeLoading(true);

    try {
      const result = nextLiked
        ? await likeAdvocate(advocateId)
        : await unlikeAdvocate(advocateId);

      if (activeAdvocateIdRef.current !== requestAdvocateId) {
        return;
      }

      if (typeof result?.liked === "boolean") {
        setIsLiked(result.liked);
        recordLikedInCache(requestAdvocateId, result.liked);
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
       * 409 = Already liked on server. Keep in liked state.
       */
      if (status === 409 && nextLiked) {
        setIsLiked(true);
        recordLikedInCache(requestAdvocateId, true);

        const serverCount = Number(
          error?.data?.data?.likeCount ?? error?.data?.likeCount,
        );

        if (Number.isFinite(serverCount)) {
          setLikeCount(Math.max(0, serverCount));
        } else {
          setLikeCount(optimisticCount);
        }

        setLikeError(null);
        return;
      }

      /*
       * 404 = Already unliked on server. Keep in unliked state.
       */
      if (status === 404 && !nextLiked) {
        setIsLiked(false);
        recordLikedInCache(requestAdvocateId, false);

        const serverCount = Number(
          error?.data?.data?.likeCount ?? error?.data?.likeCount,
        );

        if (Number.isFinite(serverCount)) {
          setLikeCount(Math.max(0, serverCount));
        } else {
          setLikeCount(optimisticCount);
        }

        setLikeError(null);
        return;
      }

      /*
       * Real request failure → rollback.
       */
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      recordLikedInCache(requestAdvocateId, previousLiked);

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