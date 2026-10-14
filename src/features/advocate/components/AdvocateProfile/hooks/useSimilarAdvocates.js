import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  API_BASE_URL,
  extractPracticeAreas,
} from "../utils/advocateProfileUtils";

/**
 * Real similar-advocates, fetched from the same GET /advocates endpoint
 * FindLawyer already uses â€” never fabricated. The backend doesn't send a
 * similarAdvocates field on the single-advocate response, so this fetches a
 * real pool, excludes the current advocate, and matches on practice area.
 *
 * Also owns the carousel auto-scroll lifecycle, because the rAF loop, the
 * resume timeout and the scroll container ref only make sense together.
 */
export default function useSimilarAdvocates({ advocateId, advocate }) {
  const [similarAdvocatesFetched, setSimilarAdvocatesFetched] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  const scrollRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  /* ---------------------------------------------------------------------
     FETCH
  --------------------------------------------------------------------- */

  useEffect(() => {
    if (!advocateId) return;

    const controller = new AbortController();

    setSimilarAdvocatesFetched([]);

    const fetchSimilarAdvocates = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("limit", 20);

        const response = await fetch(
          `${API_BASE_URL}/advocates?${queryParams.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load similar advocates");
        }

        if (controller.signal.aborted) return;

        // Excludes the current advocate by real id only. Practice-area
        // matching and the empty-match fallback happen in the derived
        // pipeline below, which needs this broader pool to fall back on.
        //
        // IMPORTANT: these are passed to AdvocateCard as-is (flat, exactly as
        // the real GET /advocates response shapes them). AdvocateCard reads
        // those flat field names directly, NOT the nested shape
        // mapDetailAdvocate produces. Only `_id` is added as an alias of the
        // real `id`, since AdvocateCard's click handler reads `advocate._id`.
        const rawList = Array.isArray(data.advocates) ? data.advocates : [];

        const candidates = rawList
          .filter((a) => a.id !== advocateId)
          .slice(0, 20)
          .map((a) => ({ ...a, _id: a.id }));

        setSimilarAdvocatesFetched(candidates);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Error fetching similar advocates:", error);

        if (!controller.signal.aborted) {
          setSimilarAdvocatesFetched([]);
        }
      }
    };

    fetchSimilarAdvocates();

    return () => controller.abort();
  }, [advocateId]);

  /* ---------------------------------------------------------------------
     DERIVED PIPELINE
     raw candidates -> exclude current advocate by real id -> case-insensitive
     practice-area match -> fall back to the excluded-self pool when nothing
     matches -> cap at 8.
  --------------------------------------------------------------------- */

  const currentPracticeAreaNames = useMemo(
    () => extractPracticeAreas(advocate),
    [advocate],
  );

  const { similarAdvocates, isSimilarFallback } = useMemo(() => {
    // Prefers a real similarAdvocates field from the backend if one is ever
    // added; otherwise uses the real advocates fetched above.
    const rawCandidates =
      advocate?.similarAdvocates?.length > 0
        ? advocate.similarAdvocates
        : similarAdvocatesFetched;

    const currentAdvocateId = advocate?._id ?? advocate?.id ?? advocateId;

    const excludingSelf = rawCandidates.filter(
      (adv) => (adv?._id ?? adv?.id) !== currentAdvocateId,
    );

    const currentAreasLower = currentPracticeAreaNames.map((name) =>
      name.toLowerCase(),
    );

    const practiceMatched = excludingSelf.filter((adv) => {
      const advAreas = extractPracticeAreas(adv).map((name) =>
        name.toLowerCase(),
      );
      return advAreas.some((area) => currentAreasLower.includes(area));
    });

    // True when there genuinely are candidates but none share a practice
    // area â€” keeps the subheading honest instead of claiming a match.
    const fallback = practiceMatched.length === 0 && excludingSelf.length > 0;

    const list = (practiceMatched.length > 0 ? practiceMatched : excludingSelf).slice(
      0,
      8,
    );

    return { similarAdvocates: list, isSimilarFallback: fallback };
  }, [advocate, advocateId, similarAdvocatesFetched, currentPracticeAreaNames]);

  /* ---------------------------------------------------------------------
     AUTO-SCROLL
     Only ever moves `scrollLeft` on the existing horizontal-scroll container,
     so manual touch/drag scrolling, clicks and AdvocateCard's own navigation
     all keep working. The list is rendered twice back-to-back, so once
     scrollLeft passes one full set it's silently wrapped rather than jumped.
  --------------------------------------------------------------------- */

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || similarAdvocates.length <= 1 || isPaused) return;

    let rafId;

    const step = () => {
      if (el) {
        el.scrollLeft += 0.6;
        const singleSetWidth = el.scrollWidth / 2;
        if (singleSetWidth > 0 && el.scrollLeft >= singleSetWidth) {
          el.scrollLeft -= singleSetWidth;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [isPaused, similarAdvocates.length]);

  /* Clear the pending resume timer on unmount so it can never fire against an
     unmounted component. */
  useEffect(
    () => () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    },
    [],
  );

  const handleInteractionStart = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    setIsPaused(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1200);
  }, []);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  return {
    similarAdvocates,
    isSimilarFallback,
    currentPracticeAreaNames,
    scrollRef,
    handleMouseEnter,
    handleMouseLeave,
    handleInteractionStart,
    handleInteractionEnd,
  };
}