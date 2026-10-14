import React from "react";
import {
  BsBookmark,
  BsBookmarkFill,
} from "react-icons/bs";

export default function SaveLawyerButton({
  isSaved,
  loading = false,
  saving = false,
  onClick,
}) {
  /*
   * `loading` = background status hydration.
   * It MUST NOT block interaction.
   *
   * `saving` = actual POST/DELETE mutation.
   */
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      aria-label={
        isSaved
          ? "Remove from saved advocates"
          : "Save advocate"
      }
      aria-pressed={isSaved}
      aria-busy={saving}
      title={
        loading
          ? "Checking saved status in background"
          : undefined
      }
      className={[
        "flex h-10 min-w-[88px] items-center justify-center gap-1.5 rounded-lg border px-3",
        "text-sm font-medium transition-all duration-200 active:scale-95",
        saving ? "cursor-wait" : "cursor-pointer",
        isSaved
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700",
      ].join(" ")}
    >
      {isSaved ? (
        <BsBookmarkFill
          className="shrink-0 scale-110 text-[17px] transition-all duration-200"
          aria-hidden="true"
        />
      ) : (
        <BsBookmark
          className="shrink-0 scale-100 text-[17px] transition-all duration-200"
          aria-hidden="true"
        />
      )}

      <span>{isSaved ? "Saved" : "Save"}</span>
    </button>
  );
}