import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function LikeButton({
  isLiked,
  likeCount,
  loading = false,
  disabled = false,
  title,
  onClick,
}) {
  const count = Number.isFinite(Number(likeCount))
    ? Math.max(0, Number(likeCount))
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-pressed={isLiked}
      aria-busy={loading}
      aria-label={isLiked ? "Unlike this advocate" : "Like this advocate"}
      className={[
        "flex h-10 min-w-[92px] items-center justify-center gap-1.5 rounded-lg border px-3",
        "text-sm font-medium transition-all duration-200 active:scale-95",
        disabled ? "cursor-not-allowed opacity-60" : "",
        loading ? "cursor-wait" : "",
        isLiked
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600",
      ].join(" ")}
    >
      {isLiked ? (
        <FaHeart className="size-[18px] shrink-0 scale-110 text-rose-500 transition-all duration-200" />
      ) : (
        <FaRegHeart className="size-[18px] shrink-0 text-current transition-all duration-200" />
      )}

      <span>{isLiked ? "Liked" : "Like"}</span>

      <span
        className={`text-xs font-bold tabular-nums ${
          isLiked ? "text-rose-500" : "text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}