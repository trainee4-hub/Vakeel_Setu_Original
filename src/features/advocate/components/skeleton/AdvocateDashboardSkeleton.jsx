const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
  />
);

const SidebarSkeleton = () => (
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col bg-slate-950 text-white lg:flex xl:w-[260px]">
    {/* Logo */}
    <div className="flex h-[76px] shrink-0 items-center border-b border-white/[0.06] px-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 bg-white/10" />

        <div>
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="mt-2 h-2.5 w-28 bg-white/[0.07]" />
        </div>
      </div>
    </div>

    {/* Profile */}
    <div className="px-4 pt-5">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.045] p-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />

          <div className="flex-1">
            <Skeleton className="h-3.5 w-28 bg-white/10" />
            <Skeleton className="mt-2 h-2.5 w-16 bg-white/[0.07]" />
          </div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <div className="mt-5 flex-1 space-y-2 px-3">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex h-11 items-center gap-3 rounded-xl px-3.5"
        >
          <Skeleton className="h-5 w-5 bg-white/[0.08]" />
          <Skeleton
            className={`h-3 bg-white/[0.08] ${
              index % 2 === 0 ? "w-24" : "w-20"
            }`}
          />
        </div>
      ))}
    </div>

    {/* Membership */}
    <div className="px-4 pb-3">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.05] p-4">
        <Skeleton className="h-4 w-28 bg-white/10" />
        <Skeleton className="mt-3 h-2.5 w-full bg-white/[0.07]" />
        <Skeleton className="mt-2 h-2.5 w-4/5 bg-white/[0.07]" />
        <Skeleton className="mt-4 h-9 w-full bg-amber-500/20" />
      </div>
    </div>

    {/* Logout */}
    <div className="border-t border-white/[0.06] p-3">
      <div className="flex h-11 items-center gap-3 px-3.5">
        <Skeleton className="h-5 w-5 bg-white/[0.08]" />
        <Skeleton className="h-3 w-16 bg-white/[0.08]" />
      </div>
    </div>
  </aside>
);

const MobileHeaderSkeleton = () => (
  <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 lg:hidden">
    <Skeleton className="h-10 w-10" />

    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-4 w-24" />
    </div>

    <Skeleton className="h-10 w-10" />
  </div>
);

const WelcomeSkeleton = () => (
  <section className="rounded-[26px] border border-slate-200/70 bg-white px-5 py-5 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:px-6 sm:py-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <Skeleton className="h-8 w-[72%] max-w-[480px]" />
        <Skeleton className="mt-3 h-4 w-[62%] max-w-[430px]" />
        <Skeleton className="mt-4 h-8 w-52 rounded-full" />
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <Skeleton className="h-11 w-11 rounded-full" />
        <Skeleton className="h-11 w-11 rounded-2xl" />
      </div>
    </div>
  </section>
);

const StatsSkeleton = () => (
  <section>
    <div className="mb-4">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mt-2 h-3 w-52" />
    </div>

    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-[150px] flex-col rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-5"
        >
          <Skeleton className="h-10 w-10" />
          <Skeleton className="mt-4 h-3 w-24" />
          <Skeleton className="mt-auto h-7 w-20" />
        </div>
      ))}
    </div>
  </section>
);

const SectionTitleSkeleton = ({ wide = false }) => (
  <div className="mb-4">
    <Skeleton className={`h-5 ${wide ? "w-44" : "w-32"}`} />
    <Skeleton className="mt-2 h-3 w-56 max-w-full" />
  </div>
);

const LargeConsultationSkeleton = () => (
  <div className="h-full min-h-[290px] rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-2 h-3 w-52" />
      </div>

      <Skeleton className="h-7 w-24 rounded-full" />
    </div>

    <div className="mt-8 flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-2xl" />

      <div className="flex-1">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
      </div>
    </div>

    <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>

    <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
      <Skeleton className="h-11 w-40" />
      <Skeleton className="h-3 w-52" />
    </div>
  </div>
);

const MembershipSkeleton = () => (
  <div className="h-full min-h-[290px] rounded-[26px] bg-slate-950 p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-11 w-11 bg-white/10" />
      <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
    </div>

    <Skeleton className="mt-6 h-5 w-4/5 bg-white/10" />
    <Skeleton className="mt-3 h-3 w-full bg-white/[0.07]" />
    <Skeleton className="mt-2 h-3 w-5/6 bg-white/[0.07]" />

    <div className="mt-6 space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full bg-white/10" />
          <Skeleton className="h-3 w-40 bg-white/[0.08]" />
        </div>
      ))}
    </div>

    <Skeleton className="mt-6 h-11 w-full bg-amber-500/20" />
  </div>
);

const QuickActionsSkeleton = () => (
  <section className="flex h-full flex-col">
    <SectionTitleSkeleton />

    <div className="grid flex-1 grid-cols-2 auto-rows-fr gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex min-h-[124px] flex-col rounded-[22px] border border-slate-200/80 bg-white p-4"
        >
          <Skeleton className="h-10 w-10" />
          <Skeleton className="mt-auto h-3.5 w-24" />
          <Skeleton className="mt-2 h-2.5 w-20" />
        </div>
      ))}
    </div>
  </section>
);

const ActivitySkeleton = () => (
  <section className="flex h-full flex-col">
    <SectionTitleSkeleton wide />

    <div className="flex flex-1 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className={`flex flex-1 items-center gap-4 px-5 py-4 ${
            index !== 3 ? "border-b border-slate-100" : ""
          }`}
        >
          <Skeleton className="h-10 w-10 shrink-0" />

          <div className="flex-1">
            <Skeleton className="h-3.5 w-[48%]" />
            <Skeleton className="mt-2 h-3 w-[32%]" />
          </div>

          <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
          <Skeleton className="h-5 w-5" />
        </div>
      ))}
    </div>
  </section>
);

const ArticlesSkeleton = () => (
  <section className="flex h-full flex-col">
    <SectionTitleSkeleton />

    <div className="flex flex-1 flex-col rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={`flex flex-1 items-center justify-between gap-4 py-4 ${
            index !== 2 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="flex-1">
            <Skeleton className="h-4 w-[65%]" />
            <Skeleton className="mt-2 h-3 w-[42%]" />
          </div>

          <Skeleton className="h-5 w-5" />
        </div>
      ))}
    </div>
  </section>
);

const PerformanceSkeleton = () => (
  <section className="flex h-full flex-col">
    <SectionTitleSkeleton wide />

    <div className="flex flex-1 flex-col rounded-[26px] border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="flex flex-1 flex-col justify-between">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-[56px] items-center justify-between gap-4 border-b border-slate-100 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-3 w-28" />
            </div>

            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>

      <Skeleton className="mt-5 h-11 w-full" />
    </div>
  </section>
);

const NetworkSkeleton = () => (
  <section>
    <SectionTitleSkeleton wide />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[22px] border border-slate-200/80 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-2xl" />

            <div className="flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="mt-2 h-3 w-20" />
              <Skeleton className="mt-2 h-2.5 w-14" />
            </div>
          </div>

          <Skeleton className="mt-4 h-3 w-32" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      ))}
    </div>
  </section>
);

const BottomSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
    <div className="lg:col-span-8">
      <div className="flex min-h-[150px] items-center gap-4 rounded-[26px] border border-slate-200/80 bg-white p-6">
        <Skeleton className="h-11 w-11 shrink-0" />

        <div className="flex-1">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-2 h-3 w-[70%]" />
        </div>

        <Skeleton className="hidden h-11 w-24 sm:block" />
      </div>
    </div>

    <div className="lg:col-span-4">
      <div className="min-h-[150px] rounded-[26px] border border-slate-200/80 bg-white p-5">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="mt-4 h-4 w-40" />
        <Skeleton className="mt-3 h-3 w-full" />
        <Skeleton className="mt-5 h-10 w-32" />
      </div>
    </div>
  </div>
);

export default function AdvocateDashboardSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-600">
      <SidebarSkeleton />
      <MobileHeaderSkeleton />

      <div className="lg:ml-[250px] xl:ml-[260px]">
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
          <div className="space-y-5 sm:space-y-6">
            <WelcomeSkeleton />

            <StatsSkeleton />

            {/* Upcoming + Membership */}
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
              <div className="h-full xl:col-span-8">
                <LargeConsultationSkeleton />
              </div>

              <div className="h-full xl:col-span-4">
                <MembershipSkeleton />
              </div>
            </div>

            {/* Quick Actions + Activity */}
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
              <div className="h-full xl:col-span-4">
                <QuickActionsSkeleton />
              </div>

              <div className="h-full xl:col-span-8">
                <ActivitySkeleton />
              </div>
            </div>

            {/* Articles + Performance */}
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12 xl:gap-6">
              <div className="h-full xl:col-span-7">
                <ArticlesSkeleton />
              </div>

              <div className="h-full xl:col-span-5">
                <PerformanceSkeleton />
              </div>
            </div>

            <NetworkSkeleton />

            <BottomSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}