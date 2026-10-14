import React from "react";

const AdvocateCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
    <style>{`
      @keyframes advocateCardShimmerSweep {
        0% {
          transform: translateX(-100%);
        }

        100% {
          transform: translateX(100%);
        }
      }

      .advocate-card-shimmer {
        position: relative;
        overflow: hidden;
        background: #F1F5F9;
      }

      .advocate-card-shimmer::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,0.7),
          transparent
        );
        animation: advocateCardShimmerSweep 1.6s infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .advocate-card-shimmer::after {
          animation: none;
        }
      }
    `}</style>

    <div className="flex flex-col sm:flex-row gap-5">
      <div className="w-full sm:w-[96px] shrink-0 flex flex-row sm:flex-col items-center justify-center gap-3">
        <div className="size-20 rounded-full advocate-card-shimmer shrink-0" />
        <div className="h-3 w-12 advocate-card-shimmer rounded-full" />
      </div>

      <div className="flex-1 w-full space-y-2 py-1">
        <div className="h-4 advocate-card-shimmer rounded-full w-1/2" />
        <div className="h-3 advocate-card-shimmer rounded-full w-1/3" />
        <div className="h-3 advocate-card-shimmer rounded-full w-2/3" />
      </div>
    </div>

    <div className="w-full h-[46px] advocate-card-shimmer rounded-xl mt-6" />
  </div>
);

export default AdvocateCardSkeleton;