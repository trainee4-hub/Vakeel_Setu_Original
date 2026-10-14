import LikeButton from "./LikeButton";
import SaveLawyerButton from "./SaveLawyerButton";

/**
 * Single action row: [ Like ♥ 26 ] [ Save 🔖 ].
 *
 * Like and Save are independent features with separate state, separate hooks
 * and separate endpoints.
 *
 * Advocate accounts cannot Like or Save other advocates.
 */
export default function AdvocateProfileActions({
  // Like
  isLiked,
  likeCount,
  isLikeLoading,
  likeError,
  canLike,
  viewerIsAdvocate,
  onLikeClick,

  // Save
  isSaved,
  savedLawyerLoading,
  savingLawyer,
  savedLawyerError,
  canSave,
  onSaveClick,
}) {
  /**
   * Keep the backend capability flag for Like as well.
   * Advocate accounts are always disabled.
   */
  const likeDisabled =
    viewerIsAdvocate ||
    canLike === false ||
    isLikeLoading;

  /**
   * Save follows the same account restriction.
   * Loading/saving also temporarily disables the control
   * to prevent duplicate API requests.
   */
  const saveDisabled =
    viewerIsAdvocate ||
    canSave === false ||
    savedLawyerLoading ||
    savingLawyer;

  return (
    <div className="shrink-0">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
        {/* ================= LIKE ================= */}
        <LikeButton
          isLiked={isLiked}
          likeCount={likeCount}
          loading={isLikeLoading}
          disabled={likeDisabled}
          title={
            viewerIsAdvocate
              ? "Only user accounts can like advocates"
              : undefined
          }
          onClick={
            likeDisabled
              ? undefined
              : onLikeClick
          }
        />

        {/* ================= SAVE ================= */}
        <SaveLawyerButton
          isSaved={isSaved}
          loading={savedLawyerLoading}
          saving={savingLawyer}
          disabled={saveDisabled}
          title={
            viewerIsAdvocate
              ? "Only user accounts can save advocates"
              : undefined
          }
          onClick={
            saveDisabled
              ? undefined
              : onSaveClick
          }
        />
      </div>

      {/* ================= ERRORS ================= */}

      {likeError && !viewerIsAdvocate && (
        <p className="mt-1 text-right text-xs text-rose-500">
          {likeError}
        </p>
      )}

      {savedLawyerError && !viewerIsAdvocate && (
        <p className="mt-1 text-right text-xs text-red-500">
          {savedLawyerError}
        </p>
      )}
    </div>
  );
}