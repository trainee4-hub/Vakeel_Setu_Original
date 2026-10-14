import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAuthToken } from "@/utils/auth";
import {
  API_BASE_URL,
  REVIEWS_PREVIEW_COUNT,
} from "../utils/advocateProfileUtils";

/**
 * Single source of truth for everything review-related.
 *
 * `rating` / `reviewText` / `submittingReview` / `hasRated` are deliberately
 * shared between the inline Quick Rate widget and the Write Review modal —
 * exactly as before. Neither consumer may hold its own copy.
 *
 * Endpoints preserved verbatim:
 *   GET  /advocates/:id/reviews?page=1&limit=10   (no auth)
 *   POST /advocates/:id/review                    (Bearer, no credentials)
 *        quick rate  -> { rating, reviewText: "" }
 *        full review -> { rating, reviewText }
 */
export default function useAdvocateReviews({
  advocateId,
  profileRetryToken,
  isLoggedIn,
  currentUser,
  navigate,
  locationPathname,
}) {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewsRefreshToken, setReviewsRefreshToken] = useState(0);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const [reviewSort, setReviewSort] = useState("newest");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewAlert, setReviewAlert] = useState(null);

  const isMountedRef = useRef(true);
  const alertTimerRef = useRef(null);

  const clearReviewAlert = useCallback(() => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
    }
    setReviewAlert(null);
  }, []);

  const showAlert = useCallback((type, message) => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }
    setReviewAlert({ type, message });
    alertTimerRef.current = setTimeout(() => {
      setReviewAlert(null);
      alertTimerRef.current = null;
    }, 4500);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  /* Clear the previous advocate's review UI state so nothing leaks across
     profiles. The fetch effect below refills reviews/summary/error. */
  useEffect(() => {
    setRating(0);
    setReviewText("");
    setHasRated(false);
    setSubmittingReview(false);
    setReviewSort("newest");
    setShowAllReviews(false);
    setIsWriteReviewOpen(false);
    setIsEditingReview(false);
    setReviewAlert(null);
  }, [advocateId]);

  /* Real reviews — GET /advocates/:id/reviews.
     Response contract: { success, reviews: [...], pagination, summary }.
     Each review has: id, rating, reviewText, createdAt, user.fullName. */
  useEffect(() => {
    if (!advocateId) return;

    const controller = new AbortController();

    const fetchReviews = async () => {
      setReviewsLoading(true);
      setReviewsError(null);

      try {
        const queryParams = new URLSearchParams();

        queryParams.set("page", "1");
        queryParams.set("limit", "10");

        const response = await fetch(
          `${API_BASE_URL}/advocates/${advocateId}/reviews?${queryParams.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch advocate reviews.");
        }

        if (controller.signal.aborted) return;

        setReviews(Array.isArray(data.reviews) ? data.reviews : []);

        setReviewSummary(
          data.summary
            ? {
                averageRating:
                  data.summary.averageRating != null
                    ? Number(data.summary.averageRating)
                    : 0,

                totalReviews:
                  data.summary.totalReviews != null
                    ? Number(data.summary.totalReviews)
                    : 0,

                distribution: {
                  0: Number(data.summary.distribution?.["0"] || 0),
                  1: Number(data.summary.distribution?.["1"] || 0),
                  2: Number(data.summary.distribution?.["2"] || 0),
                  3: Number(data.summary.distribution?.["3"] || 0),
                  4: Number(data.summary.distribution?.["4"] || 0),
                  5: Number(data.summary.distribution?.["5"] || 0),
                },
              }
            : null,
        );
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Failed to fetch advocate reviews:", error);

        setReviewsError(error.message || "Unable to load reviews.");

        setReviews([]);
        setReviewSummary(null);
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    };

    fetchReviews();

    return () => controller.abort();
  }, [advocateId, profileRetryToken, reviewsRefreshToken]);

  /* ---------------------------------------------------------------------
     CURRENT USER REVIEW DETECTION & SYNC
  --------------------------------------------------------------------- */

  const myReview = useMemo(() => {
    if (!isLoggedIn || !currentUser) return null;
    const currentId = currentUser.id || currentUser.userId || currentUser._id;
    const currentName = (currentUser.fullName || currentUser.name || "").trim().toLowerCase();

    return (
      reviews.find((r) => {
        if (r.userId && currentId && String(r.userId) === String(currentId)) return true;
        if (r.user?.id && currentId && String(r.user.id) === String(currentId)) return true;
        if (r.user?.fullName && currentName) {
          return r.user.fullName.trim().toLowerCase() === currentName;
        }
        return false;
      }) || null
    );
  }, [reviews, isLoggedIn, currentUser]);

  useEffect(() => {
    if (myReview) {
      setHasRated(true);
    }
  }, [myReview]);

  const effectiveHasRated = hasRated || Boolean(myReview);

  /* ---------------------------------------------------------------------
     QUICK RATE — stars in the reviews section
  --------------------------------------------------------------------- */

  const handleQuickRating = useCallback(
    async (ratingValue) => {
      if (!isLoggedIn) {
        navigate("/login", {
          state: {
            from: locationPathname,
          },
        });

        return;
      }

      if (effectiveHasRated) {
        showAlert(
          "warning",
          "You have already submitted a review. Click 'Edit Review' if you wish to update your rating or feedback.",
        );
        return;
      }

      const token = getAuthToken();

      if (
        !Number.isInteger(ratingValue) ||
        ratingValue < 1 ||
        ratingValue > 5
      ) {
        return;
      }

      setRating(ratingValue);

      try {
        setSubmittingReview(true);

        const response = await fetch(
          `${API_BASE_URL}/advocates/${advocateId}/review`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              rating: ratingValue,
              reviewText: "",
            }),
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          // If 409 Conflict, retry with PATCH
          if (response.status === 409) {
            const patchRes = await fetch(
              `${API_BASE_URL}/advocates/${advocateId}/review`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  rating: ratingValue,
                }),
              },
            );
            const patchData = await patchRes.json();
            if (!patchRes.ok || !patchData.success) {
              throw new Error(patchData.message || "Failed to submit rating.");
            }
          } else {
            throw new Error(data.message || "Failed to submit rating.");
          }
        }

        if (!isMountedRef.current) return;

        setHasRated(true);
        showAlert("success", "Rating submitted successfully!");

        // Refresh the real reviews + average rating + distribution.
        setReviewsRefreshToken((value) => value + 1);
      } catch (error) {
        console.error("Error submitting rating:", error);

        if (!isMountedRef.current) return;

        setRating(0);
        showAlert("error", error.message || "Unable to submit rating.");
      } finally {
        if (isMountedRef.current) {
          setSubmittingReview(false);
        }
      }
    },
    [effectiveHasRated, isLoggedIn, advocateId, navigate, locationPathname, showAlert],
  );

  /* ---------------------------------------------------------------------
     WRITE & EDIT REVIEW MODAL
  --------------------------------------------------------------------- */

  const openWriteReview = useCallback(() => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: locationPathname,
        },
      });

      return;
    }

    if (effectiveHasRated) {
      showAlert(
        "warning",
        "You have already submitted a review for this advocate. Click 'Edit Review' to make changes.",
      );
      return;
    }

    if (submittingReview) return;

    setReviewsError(null);
    setIsEditingReview(false);
    setRating(0);
    setReviewText("");
    setIsWriteReviewOpen(true);
  }, [
    effectiveHasRated,
    submittingReview,
    isLoggedIn,
    navigate,
    locationPathname,
    showAlert,
  ]);

  const openEditReview = useCallback(() => {
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: locationPathname,
        },
      });

      return;
    }

    if (submittingReview) return;

    setReviewsError(null);
    setIsEditingReview(true);

    if (myReview) {
      setRating(Number(myReview.rating) || 0);
      setReviewText(myReview.reviewText || "");
    } else {
      setRating(rating || 0);
      setReviewText(reviewText || "");
    }

    setIsWriteReviewOpen(true);
  }, [
    isLoggedIn,
    submittingReview,
    myReview,
    rating,
    reviewText,
    navigate,
    locationPathname,
  ]);

  const closeWriteReview = useCallback(() => {
    setIsWriteReviewOpen(false);
    setIsEditingReview(false);
  }, []);

  const handleAlreadySubmittedClick = useCallback(() => {
    showAlert(
      "warning",
      "You have already submitted a review for this advocate. Click 'Edit Review' to make changes.",
    );
  }, [showAlert]);

  /* Submits a full review (star rating + written text) through POST or PATCH
     with automatic 409 Conflict fallback to PATCH. */
  const submitFullReview = useCallback(async () => {
    if (rating === 0) {
      showAlert("error", "Please select a star rating before submitting.");
      return;
    }

    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          from: locationPathname,
        },
      });

      return;
    }

    const token = getAuthToken();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      showAlert("error", "Rating must be between 1 and 5 stars.");
      return;
    }

    setSubmittingReview(true);

    try {
      const isPatch = isEditingReview || effectiveHasRated;
      let method = isPatch ? "PATCH" : "POST";

      let response = await fetch(
        `${API_BASE_URL}/advocates/${advocateId}/review`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            reviewText: reviewText.trim(),
          }),
        },
      );

      let data = await response.json();

      // If POST returns 409 Conflict ("You have already reviewed this advocate"), seamlessly PATCH
      if (!response.ok && response.status === 409 && method === "POST") {
        method = "PATCH";
        response = await fetch(
          `${API_BASE_URL}/advocates/${advocateId}/review`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              rating,
              reviewText: reviewText.trim(),
            }),
          },
        );
        data = await response.json();
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review.");
      }

      if (!isMountedRef.current) return;

      setHasRated(true);
      setIsWriteReviewOpen(false);
      setIsEditingReview(false);

      showAlert(
        "success",
        method === "PATCH"
          ? "Your review has been updated successfully!"
          : "Review submitted successfully! Thank you for your feedback.",
      );

      // Fetch fresh reviews / averageRating / totalReviews / distribution.
      setReviewsRefreshToken((value) => value + 1);
    } catch (error) {
      console.error("Error submitting review:", error);
      if (isMountedRef.current) {
        showAlert("error", error.message || "Unable to submit review. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setSubmittingReview(false);
      }
    }
  }, [
    rating,
    reviewText,
    isEditingReview,
    effectiveHasRated,
    isLoggedIn,
    advocateId,
    navigate,
    locationPathname,
    showAlert,
  ]);

  const toggleShowAllReviews = useCallback(() => {
    setShowAllReviews((previous) => !previous);
  }, []);

  const handleReviewTextChange = useCallback((value) => {
    setReviewText(value.slice(0, 500));
  }, []);

  /* ---------------------------------------------------------------------
     DERIVED — client-side sort over the real reviews array
  --------------------------------------------------------------------- */

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort((a, b) => {
        if (reviewSort === "highest") return (b.rating || 0) - (a.rating || 0);
        if (reviewSort === "lowest") return (a.rating || 0) - (b.rating || 0);
        // "newest" (default) - uses latest update date or creation date
        const da = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const db = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return db - da;
      }),
    [reviews, reviewSort],
  );

  const visibleReviews = useMemo(
    () =>
      showAllReviews
        ? sortedReviews
        : sortedReviews.slice(0, REVIEWS_PREVIEW_COUNT),
    [sortedReviews, showAllReviews],
  );

  return {
    // data
    reviews,
    sortedReviews,
    visibleReviews,
    reviewSummary,
    reviewsLoading,
    reviewsError,
    myReview,

    // shared submission state
    rating,
    setRating,
    reviewText,
    onReviewTextChange: handleReviewTextChange,
    submittingReview,
    hasRated: effectiveHasRated,

    // ui state
    reviewSort,
    setReviewSort,
    showAllReviews,
    toggleShowAllReviews,
    isWriteReviewOpen,
    isEditingReview,
    reviewAlert,
    clearReviewAlert,

    // actions
    handleQuickRating,
    openWriteReview,
    openEditReview,
    closeWriteReview,
    handleAlreadySubmittedClick,
    submitFullReview,
  };
}