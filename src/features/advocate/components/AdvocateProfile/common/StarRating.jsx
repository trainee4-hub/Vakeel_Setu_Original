import React from "react";
import { FaStar } from "react-icons/fa";

/**
 * Display-only 5-star row. Replaces the [1,2,3,4,5].map block that was
 * repeated at four different sizes across the profile.
 *
 * Interactive star pickers (Quick Rate, Review modal) stay where they are —
 * folding their per-star buttons, aria-labels and hover states in here would
 * make the API worse, not better.
 */
export default function StarRating({
  rating = 0,
  total = 5,
  sizeClass = "text-base",
  activeClass = "text-amber-500",
  inactiveClass = "text-slate-200",
  className = "flex",
}) {
  return (
    <div className={className}>
      {Array.from({ length: total }, (_, index) => index + 1).map((star) => (
        <FaStar
          key={star}
          className={`${sizeClass} ${
            star <= rating ? activeClass : inactiveClass
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}