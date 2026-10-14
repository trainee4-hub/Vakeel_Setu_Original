import React from "react";

const AdvocateProfileSkeleton = () => (
  <div className="min-h-screen max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 ">
    <style>{`
      @keyframes shimmerSweep {
        0% {
          transform: translateX(-100%);
        }

        100% {
          transform: translateX(100%);
        }
      }

      .shimmer {
        position: relative;
        overflow: hidden;
        background: #F1F5F9;
      }

      .shimmer::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,0.7),
          transparent
        );
        animation: shimmerSweep 1.6s infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .shimmer::after {
          animation: none;
        }
      }
    `}</style>

    {/* Profile Header */}
    <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="size-28 sm:size-32 rounded-lg shimmer shrink-0" />

        <div className="flex-1 w-full space-y-3">
          <div className="h-5 w-32 shimmer rounded" />
          <div className="h-8 w-2/3 shimmer rounded" />
          <div className="h-4 w-1/3 shimmer rounded" />

          <div className="flex gap-3 pt-2">
            <div className="h-8 w-24 shimmer rounded" />
            <div className="h-8 w-24 shimmer rounded" />
            <div className="h-8 w-24 shimmer rounded" />
          </div>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-lg bg-white border border-slate-200 overflow-hidden"
        >
          <div className="w-full h-full shimmer" />
        </div>
      ))}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="h-48 rounded-lg bg-white border border-slate-200 overflow-hidden">
          <div className="w-full h-full shimmer" />
        </div>

        <div className="h-64 rounded-lg bg-white border border-slate-200 overflow-hidden">
          <div className="w-full h-full shimmer" />
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="h-96 rounded-lg bg-white border border-slate-200 overflow-hidden">
          <div className="w-full h-full shimmer" />
        </div>
      </div>
    </div>
  </div>
);

export default AdvocateProfileSkeleton;