import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { submitFeedback } from "../services/feedbackApi";

export default function FeedbackModal({
  isOpen,
  onClose,
  isLoggedIn,
  user,
  token,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const textareaRef = useRef(null);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setErrorMessage("");
      setIsSuccess(false);
      setSubmitting(false);
      if (isLoggedIn) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, isLoggedIn]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const charCount = description.length;
  const isTooShort = description.trim().length > 0 && description.trim().length < 3;
  const isOverLimit = charCount > 2000;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = description.trim();

    if (!trimmed) {
      setErrorMessage("Please enter your feedback before submitting.");
      return;
    }

    if (trimmed.length < 3) {
      setErrorMessage("Feedback must be at least 3 characters long.");
      return;
    }

    if (trimmed.length > 2000) {
      setErrorMessage("Feedback cannot exceed 2000 characters.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await submitFeedback({
        description: trimmed,
        role: user?.role,
        token,
      });
      setIsSuccess(true);
    } catch (err) {
      const serverMsg =
        err?.data?.message ||
        err?.data?.errors?.[0]?.message ||
        err?.message ||
        "Failed to submit feedback. Please try again.";
      setErrorMessage(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login", {
      state: {
        from: location.pathname,
      },
    });
  };

  const userName =
    user?.name ||
    user?.fullName ||
    (user?.role?.toUpperCase() === "ADVOCATE" ? "Advocate" : "User");

  const userPhone = user?.phone || user?.phoneNumber || "";
  const isAdvocate = user?.role?.toUpperCase() === "ADVOCATE";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={() => !submitting && onClose()}
      />

      {/* Modal Dialog Card */}
      <div
        className="
          relative
          w-full
          max-w-lg
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-6
          shadow-2xl
          shadow-black/60
          transition-all
          sm:p-7
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Close dialog"
          className="
            absolute
            right-4
            top-4
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            border
            border-slate-800
            bg-slate-800/60
            text-slate-400
            transition-colors
            hover:border-slate-700
            hover:bg-slate-800
            hover:text-white
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-amber-500/50
            disabled:opacity-50
          "
        >
          <FiX className="text-base" />
        </button>

        {/* ========================================================
            CASE 1: SUCCESS STATE
        ======================================================== */}
        {isSuccess ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-8 ring-emerald-500/5">
              <FiCheckCircle className="text-3xl" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Thank You for Your Feedback!
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-300">
              Your feedback has been submitted successfully. Our team will review your comments to continuously improve the VakeelSetu experience.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="
                mt-6
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-r
                from-amber-500
                to-amber-600
                px-6
                text-sm
                font-semibold
                text-slate-950
                shadow-md
                shadow-amber-500/20
                transition-all
                hover:from-amber-400
                hover:to-amber-500
                active:scale-[0.98]
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-amber-500/50
              "
            >
              Done
            </button>
          </div>
        ) : !isLoggedIn ? (
          /* ========================================================
             CASE 2: NOT LOGGED IN STATE
          ======================================================== */
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-8 ring-amber-500/5">
              <FiLock className="text-2xl" />
            </div>

            <h3
              id="feedback-modal-title"
              className="text-lg font-bold text-white"
            >
              Sign In to Submit Feedback
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-300">
              To help us improve our platform and acknowledge your feedback, please sign in with your User or Advocate account.
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="
                  flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-800/40
                  text-sm
                  font-medium
                  text-slate-300
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLoginRedirect}
                className="
                  flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-amber-500
                  to-amber-600
                  text-sm
                  font-semibold
                  text-slate-950
                  shadow-md
                  shadow-amber-500/20
                  transition-all
                  hover:from-amber-400
                  hover:to-amber-500
                  active:scale-[0.98]
                "
              >
                <FiUser className="text-sm" />
                Sign In Now
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             CASE 3: AUTHENTICATED USER FEEDBACK FORM
          ======================================================== */
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <FiMessageSquare className="text-lg" />
              </div>

              <div>
                <h3
                  id="feedback-modal-title"
                  className="text-lg font-bold text-white"
                >
                  Feedback to Improve Us
                </h3>
                <p className="text-xs text-slate-400">
                  Share your thoughts, suggestions, or report platform issues.
                </p>
              </div>
            </div>

            {/* Submitter User Info Strip */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-medium text-slate-200">
                    {userName}
                  </p>
                  {userPhone && (
                    <p className="text-[11px] text-slate-400">
                      {userPhone}
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`
                  rounded-md
                  px-2
                  py-0.5
                  text-[11px]
                  font-medium
                  ${
                    isAdvocate
                      ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  }
                `}
              >
                {isAdvocate ? "Advocate" : "Client"}
              </span>
            </div>

            {/* Helper notice */}
            <p className="mt-2 text-[11px] text-slate-400">
              * Your name and phone number will be automatically linked to this feedback from your account.
            </p>

            {/* Feedback Description Textarea */}
            <div className="mt-3.5">
              <label
                htmlFor="feedback-description"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Your Feedback <span className="text-amber-400">*</span>
              </label>

              <textarea
                ref={textareaRef}
                id="feedback-description"
                rows={5}
                maxLength={2000}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                disabled={submitting}
                placeholder="What did you like? What can we do better? Any issues or suggestions you have in mind..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950/80
                  p-3
                  text-sm
                  text-slate-100
                  placeholder-slate-500
                  transition-colors
                  focus:border-amber-500
                  focus:bg-slate-950
                  focus:outline-none
                  focus:ring-1
                  focus:ring-amber-500/30
                  disabled:opacity-60
                "
              />

              {/* Character Counter & Helper */}
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <div>
                  {isTooShort ? (
                    <span className="text-amber-400">
                      At least 3 characters required ({description.trim().length}/3)
                    </span>
                  ) : isOverLimit ? (
                    <span className="text-red-400">Character limit exceeded</span>
                  ) : (
                    <span className="text-slate-500">Min 3, max 2000 characters</span>
                  )}
                </div>

                <span
                  className={`
                    font-mono
                    text-[11px]
                    ${
                      charCount > 1900
                        ? "text-amber-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  {charCount}/2000
                </span>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                <FiAlertCircle className="mt-0.5 shrink-0 text-sm text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="
                  h-10
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-800/40
                  px-4
                  text-sm
                  font-medium
                  text-slate-300
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || description.trim().length < 3 || isOverLimit}
                className="
                  flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-amber-500
                  to-amber-600
                  px-5
                  text-sm
                  font-semibold
                  text-slate-950
                  shadow-md
                  shadow-amber-500/20
                  transition-all
                  hover:from-amber-400
                  hover:to-amber-500
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting ? (
                  <>
                    <FiLoader className="animate-spin text-base" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="text-sm" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

