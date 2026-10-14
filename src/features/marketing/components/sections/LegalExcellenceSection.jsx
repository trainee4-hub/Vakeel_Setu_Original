import { FiAlertCircle, FiUserX } from "react-icons/fi";

import { AdvocateCard, AdvocateCardSkeleton } from "@features/advocate";
import { PAGE_CONTAINER } from "../../data/dashboardData";
import RevealOnScroll from "../common/RevealOnScroll";

const LegalExcellenceSection = ({
  advocates,
  advocatesTripled,
  loading,
  error,
  onViewAdvocate,
}) => {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24">
      <RevealOnScroll delay={100}>
        <div
          className={`${PAGE_CONTAINER} mb-8 flex flex-col items-end justify-between gap-6 sm:mb-10 md:flex-row`}
        >
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Legal Excellence
            </h2>

            <p className="mt-2 max-w-xl text-base text-slate-500 sm:text-lg">
              Connect with India's most distinguished legal minds available
              for immediate consultation.
            </p>
          </div>
        </div>

        <div className="flex w-full overflow-hidden">
          <div
            className={`flex w-max py-4 ${
              advocatesTripled.length > 0
                ? "animate-infinite-scroll hover:cursor-grab active:cursor-grabbing"
                : ""
            }`}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`advocate-skeleton-${index}`}
                  className="mx-2 w-[calc(100vw-3rem)] max-w-[440px] shrink-0 sm:mx-3"
                >
                  <AdvocateCardSkeleton />
                </div>
              ))
            ) : error ? (
              <div className="w-screen max-w-[1400px] px-4 py-10 text-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10">
                  <FiAlertCircle className="mx-auto text-3xl text-slate-300" />

                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    Unable to load advocates
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Please try again later.
                  </p>
                </div>
              </div>
            ) : advocates.length > 0 ? (
              advocatesTripled.map((advocate, index) => (
                <div
                  key={`${advocate.id || advocate._id}-${index}`}
                  className="mx-2 w-[calc(100vw-3rem)] max-w-[440px] shrink-0 sm:mx-3"
                >
                  <AdvocateCard
                    advocate={advocate}
                    onViewAdvocate={() => onViewAdvocate(advocate)}
                  />
                </div>
              ))
            ) : (
              <div className="w-screen max-w-[1400px] px-4 py-10 text-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10">
                  <FiUserX className="mx-auto text-3xl text-slate-300" />

                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    No advocates available
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    There are currently no advocates to display.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default LegalExcellenceSection;