import React from "react";
import { FaStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

/**
 * Owns NO review state. `rating` / `reviewText` / `submitting` are the same
 * values the inline Quick Rate widget uses, passed down from
 * useAdvocateReviews — duplicating them here would silently split the flow.
 */
export default function ReviewModal({
  open,
  isEditing = false,
  rating,
  reviewText,
  submitting,
  onRatingChange,
  onReviewTextChange, 
  onSubmit,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => !submitting && onClose()}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">
            {isEditing ? "Edit Your Review" : "Write a Review"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close review dialog"
            className="size-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <IoClose className="text-[18px]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 w-fit">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  className="focus:outline-none transition-transform duration-200 hover:scale-125"
                >
                  <FaStar
                    className={`text-2xl transition-colors ${
                      star <= rating
                        ? "text-amber-500"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Your Review (Optional)
            </label>

            <textarea
              value={reviewText}
              onChange={(e) => onReviewTextChange(e.target.value)}
              placeholder="Share details of your experience with this advocate..."
              maxLength={500}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none h-28"
            ></textarea>

            <p className="text-[11px] text-slate-400 mt-1 text-right">
              {reviewText.length}/500
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 rounded-2xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || rating === 0}
            className={`px-6 py-2.5 rounded-2xl font-bold shadow-sm flex items-center justify-center min-w-[140px] transition-colors ${
              rating === 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {submitting ? (
              <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isEditing ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}