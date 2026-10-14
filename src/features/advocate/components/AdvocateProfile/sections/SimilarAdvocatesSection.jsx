import React from "react";
import { FiArrowRight } from "react-icons/fi";

// AdvocateCard currently lives in src/pages/ — imported from its real
// location rather than moved, since it is shared with FindLawyer.
import AdvocateCard from "../../AdvocateCard";

/**
 * Horizontal carousel of real advocates. The rAF auto-scroll, the pause/resume
 * timers and the scroll container ref all come from useSimilarAdvocates.
 */
export default function SimilarAdvocatesSection({
  similarAdvocates,
  isSimilarFallback,
  currentPracticeAreaNames,
  scrollRef,
  onMouseEnter,
  onMouseLeave,
  onInteractionStart,
  onInteractionEnd,
  onViewAdvocate,
}) {
  if (similarAdvocates.length === 0) return null;

  return (
    <div
      id="similar"
      className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 scroll-mt-16 min-w-0 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Similar Advocates
          </h2>

          {currentPracticeAreaNames.length > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">
              {isSimilarFallback
                ? "Other advocates you may also like"
                : `Top lawyers practicing in ${currentPracticeAreaNames
                    .slice(0, 3)
                    .join(", ")}`}
            </p>
          )}
        </div>

        <span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex">
          Scroll to see more
          <FiArrowRight
            className="shrink-0 text-[14px]"
            aria-hidden="true"
          />
        </span>
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <div
          ref={scrollRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onTouchStart={onInteractionStart}
          onTouchEnd={onInteractionEnd}
          onMouseDown={onInteractionStart}
          onMouseUp={onInteractionEnd}
          className="flex w-full min-w-0 gap-4 overflow-x-auto pb-3 px-1 no-scrollbar"
        >
          {/* Rendered twice back-to-back (real data only, nothing invented) so
              the auto-scroll can wrap seamlessly at the halfway point instead
              of visibly jumping back to the start. The second copy is hidden
              from assistive tech so it isn't announced twice. */}
          {(similarAdvocates.length > 1
            ? [...similarAdvocates, ...similarAdvocates]
            : similarAdvocates
          ).map((sim, idx) => (
            <div
              key={`${sim._id || idx}-${idx}`}
              aria-hidden={
                idx >= similarAdvocates.length ? true : undefined
              }
              className="
                shrink-0
                w-[calc(100vw-3.5rem)]
                sm:w-[440px]
                max-w-[440px]
                min-w-0
              "
            >
              <div className="w-full min-w-0 overflow-hidden">
                <AdvocateCard
                  advocate={sim}
                  onViewAdvocate={onViewAdvocate}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}