import React from "react";
import {
  FaCheckCircle,
  FaRegStar,
  FaStar,
} from "react-icons/fa";
import {
  FiAlertCircle,
  FiChevronDown,
  FiEdit3,
  FiMessageSquare,
  FiWifiOff,
} from "react-icons/fi";
import { IoClose } from "react-icons/io5";

import StarRating from "../common/StarRating";
import {REVIEWS_PREVIEW_COUNT,formatIndianDate,} from "../utils/advocateProfileUtils";

/**
 * Presentation for the whole Ratings & Reviews block. Every piece of state
 * arrives through props from useAdvocateReviews — this component owns none of
 * it, so the Quick Rate widget and the Write Review modal keep sharing one
 * `rating` / `reviewText` / `submittingReview` / `hasRated`.
 */
export default function ReviewsSection({
  // summary
  hasReviews,
  avgRating,
  reviewsCount,
  filledStars,
  ratingDistribution,

  // list
  reviews,
  sortedReviews,
  visibleReviews,
  reviewsLoading,
  reviewsError,
  onRetry,

  // controls
  reviewSort,
  onReviewSortChange,
  showAllReviews,
  onToggleShowAllReviews,

  // quick rate + write review
  // rating,
  hasRated,
  // onQuickRate,
  onOpenWriteReview,

  // edit + user review + alert props
  myReview,
  onOpenEditReview,
  onAlreadySubmittedClick,
  reviewAlert,
  onClearAlert,
}) {
  return (
    <div
      id="reviews"
      className="relative bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 scroll-mt-16"
    >
      {/* Floating Review Alert / Pop-up */}
      {reviewAlert && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md w-[calc(100%-3rem)] animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              reviewAlert.type === "success"
                ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30"
                : reviewAlert.type === "warning"
                  ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/30"
                  : "bg-rose-600 text-white border-rose-700 shadow-rose-600/30"
            }`}
          >
            {reviewAlert.type === "success" && (
              <FaCheckCircle className="text-xl shrink-0 mt-0.5" />
            )}
            {reviewAlert.type === "warning" && (
              <FiAlertCircle className="text-xl shrink-0 mt-0.5" />
            )}
            {reviewAlert.type === "error" && (
              <FiAlertCircle className="text-xl shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-semibold leading-snug">
              {reviewAlert.message}
            </div>
            <button
              type="button"
              onClick={onClearAlert}
              aria-label="Dismiss alert"
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <IoClose className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">
          Ratings & Reviews
        </h2>

        <div className="flex items-center gap-3">
          {hasRated ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAlreadySubmittedClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
                title="You have already submitted a review. Click for details."
              >
                <FaCheckCircle className="text-emerald-500 shrink-0 text-xs" />
                Review Submitted
              </button>

              <button
                type="button"
                onClick={onOpenEditReview}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200 shadow-sm hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <FiEdit3 className="shrink-0 text-sm" />
                Edit Review
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenWriteReview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
            >
              <FiMessageSquare className="shrink-0 text-sm" />
              Write a Review
            </button>
          )}

          {reviews.length > 1 && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="review-sort"
                className="text-xs font-semibold text-slate-400"
              >
                Sort by
              </label>

              <select
                id="review-sort"
                value={reviewSort}
                onChange={(e) =>
                  onReviewSortChange(e.target.value)
                }
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="newest">Newest</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      {hasReviews && (
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 pb-6 border-b border-slate-100">
          <div className="flex flex-col items-center md:items-start md:w-48 shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900">
                {avgRating
                  ? Number(avgRating).toFixed(1)
                  : "—"}
              </span>

              {avgRating && (
                <span className="text-sm font-medium text-slate-500">
                  / 5
                </span>
              )}
            </div>

            <StarRating
              rating={filledStars}
              sizeClass="text-lg"
              className="flex mt-2"
            />

            <span className="text-sm text-slate-500 mt-2">
              {hasReviews
                ? `${reviewsCount} review${
                    reviewsCount !== 1 ? "s" : ""
                  }`
                : "No Reviews"}
            </span>
          </div>

          {ratingDistribution && (
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const starCount =
                  ratingDistribution[star] || 0;

                const pct =
                  reviewsCount > 0
                    ? Math.round(
                        (starCount / reviewsCount) * 100,
                      )
                    : 0;

                return (
                  <div
                    key={star}
                    className="flex items-center gap-3"
                  >
                    <span className="w-12 text-xs font-semibold text-slate-500 shrink-0">
                      {star} star
                    </span>

                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-10 text-right text-xs text-slate-400 shrink-0">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Rate
      <div className="py-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Rate this Advocate
          </h3>

          <p className="text-slate-500 text-sm">
            Share your experience with a rating.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= rating;

            return (
              <button
                type="button"
                key={star}
                onClick={() => onQuickRate(star)}
                aria-label={`Rate ${star} star${
                  star > 1 ? "s" : ""
                }`}
                className="focus:outline-none transition-all duration-300 hover:scale-125 cursor-pointer"
              >
                {isActive ? (
                  <FaStar className="text-2xl text-amber-500 transition-colors" />
                ) : (
                  <FaRegStar className="text-2xl text-slate-300 transition-colors hover:text-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {hasRated && (
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
              <FaCheckCircle className="shrink-0 text-base" />
              Submitted
            </span>

            <button
              type="button"
              onClick={onOpenEditReview}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
            >
              <FiEdit3 className="text-xs" />
              Edit
            </button>
          </div>
        )}
      </div> */}

      {/* Review Cards */}
      <div className="pt-6 space-y-5">
        {reviewsLoading ? (
          <div className="space-y-5">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 animate-pulse"
              >
                <div className="size-10 rounded-full bg-slate-100 shrink-0" />

                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-1/3 bg-slate-100 rounded-full" />
                  <div className="h-3 w-1/4 bg-slate-100 rounded-full" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reviewsError ? (
          <div className="text-center py-10">
            <FiWifiOff className="mx-auto mb-3 text-4xl text-slate-300" />

            <p className="text-slate-400 text-sm mb-4">
              {reviewsError}
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : visibleReviews.length > 0 ? (
          visibleReviews.map((review) => {
            const isMyReview = Boolean(
              myReview && (
                review.id === myReview.id ||
                (review.user?.fullName && myReview.user?.fullName &&
                  review.user.fullName.trim().toLowerCase() === myReview.user.fullName.trim().toLowerCase())
              )
            );

            return (
              <div
                key={review.id}
                className={`flex gap-4 pb-5 border-b border-slate-100 last:border-0 last:pb-0 ${
                  isMyReview ? "p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60" : ""
                }`}
              >
                <div className={`size-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm ${
                  isMyReview ? "bg-amber-200 text-amber-800" : "bg-slate-100 text-slate-400"
                }`}>
                  {(review.user?.fullName || "User")[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {review.user?.fullName || "User"}
                      </span>

                      {isMyReview && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Your Review
                        </span>
                      )}
                    </div>

                    {isMyReview && (
                      <button
                        type="button"
                        onClick={onOpenEditReview}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 bg-white hover:bg-amber-100 border border-amber-200 transition-colors shadow-sm cursor-pointer"
                      >
                        <FiEdit3 className="text-xs" />
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <StarRating
                      rating={review.rating || 0}
                      sizeClass="text-sm"
                    />

                    {review.createdAt && (
                      <span className="text-xs text-slate-400">
                        {formatIndianDate(review.updatedAt || review.createdAt)}
                        {review.updatedAt && review.updatedAt !== review.createdAt ? " • Edited" : ""}
                      </span>
                    )}
                  </div>

                  {review.reviewText && (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {review.reviewText}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <FiMessageSquare className="mx-auto mb-3 text-4xl text-slate-300" />

            <p className="text-slate-400 text-sm">
              No reviews yet. Be the first to share your
              experience.
            </p>
          </div>
        )}
      </div>

      {/* See All Reviews */}
      {sortedReviews.length > REVIEWS_PREVIEW_COUNT && (
        <div className="pt-5 flex justify-center">
          <button
            type="button"
            onClick={onToggleShowAllReviews}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-sm hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 hover:shadow-md active:scale-[0.98] transition-all duration-300"
          >
            {showAllReviews
              ? "Show Fewer Reviews"
              : `See All Reviews (${sortedReviews.length})`}

            <FiChevronDown
              className={`text-[18px] transition-transform duration-300 ${
                showAllReviews ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}