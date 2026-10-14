import { FiRefreshCw, FiUserPlus } from "react-icons/fi";

import TeamEmptyState from "./TeamEmptyState";
import TeamMateCard from "./TeamMateCard";

/** Skeleton mirrors the real card so nothing shifts when data lands. */
const TeamSkeleton = () => (
  <div className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="rounded-[22px] border border-slate-200/80 bg-white p-4"
      >
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-100" />

          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            <div className="h-3 w-1/2 rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-2.5 w-1/2 rounded-full bg-slate-100" />
          <div className="h-2.5 w-1/3 rounded-full bg-slate-100" />
        </div>

        <div className="mt-4 h-[38px] rounded-xl bg-slate-100" />
      </div>
    ))}
  </div>
);

export default function AdvocateTeamSection({
  teamMates,
  loading,
  error,
  removingId,
  onAdd,
  onRetry,
  onViewProfile,
  onRemove,
}) {
  return (
    <section id="advocate-team" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-bold tracking-tight text-slate-950 sm:text-lg">
            Your Legal Team
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-slate-500">
            Build a trusted network of advocates you work with.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
        >
          <FiUserPlus className="shrink-0 text-[15px]" />
          Add Team Mate
        </button>
      </div>

      {loading ? (
        <TeamSkeleton />
      ) : error ? (
        <div className="rounded-[26px] border border-slate-200/80 bg-white px-5 py-10 text-center shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
          <p className="text-sm font-bold text-slate-900">
            {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
          >
            <FiRefreshCw className="shrink-0 text-[15px]" />
            Try Again
          </button>
        </div>
      ) : teamMates.length === 0 ? (
        <div className="rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
          <TeamEmptyState onAdd={onAdd} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teamMates.map((mate) => (
            <TeamMateCard
              key={mate?.id}
              mate={mate}
              removing={
                String(removingId) === String(mate?.id)
              }
              onView={onViewProfile}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}