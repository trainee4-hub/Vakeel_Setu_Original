import { useEffect, useState } from "react";
import {
  FiSearch,
  FiUserCheck,
  FiCalendar,
  FiMessageCircle,
  FiCheckCircle,
  FiFileText,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import {
  HOW_IT_WORKS_STEPS,
  PAGE_CONTAINER,
} from "../../data/dashboardData";

import RevealOnScroll from "../common/RevealOnScroll";
import PremiumAdvocateSlide from "../common/PremiumAdvocateSlide";

/*
  Material Symbol name -> React Icon mapping

  This lets HOW_IT_WORKS_STEPS keep its existing `icon` values,
  so dashboardData does not need to be changed.
*/
const STEP_ICON_MAP = {
  search: FiSearch,
  person_search: FiSearch,
  person: FiUserCheck,
  person_check: FiUserCheck,
  verified_user: FiShield,
  groups: FiUsers,
  group: FiUsers,

  calendar_month: FiCalendar,
  event: FiCalendar,
  schedule: FiCalendar,

  chat: FiMessageCircle,
  forum: FiMessageCircle,
  message: FiMessageCircle,

  description: FiFileText,
  article: FiFileText,
  contract: FiFileText,

  check_circle: FiCheckCircle,
  task_alt: FiCheckCircle,
  verified: FiCheckCircle,
};

const HowItWorksSection = ({
  premiumAdvocates,
  onBookConsultation,
  onViewProfile,
}) => {
  const [premiumIndex, setPremiumIndex] = useState(0);

  useEffect(() => {
    if (premiumAdvocates.length <= 1) {
      setPremiumIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setPremiumIndex(
        (previous) =>
          (previous + 1) % premiumAdvocates.length,
      );
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [premiumAdvocates.length]);

  return (
    <RevealOnScroll delay={200}>
      <section
        id="how-it-works"
        className="relative overflow-hidden bg-slate-50 py-14 sm:py-16 lg:py-20"
      >
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-400/[0.05] blur-3xl" />

          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-slate-300/[0.08] blur-3xl" />
        </div>

        <div className={`${PAGE_CONTAINER} relative z-10`}>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            {/* ==============================
                LEFT CONTENT
            ============================== */}

            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-amber-500"
                  aria-hidden="true"
                />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                  Simple. Smart. Secure.
                </span>
              </div>

              <h2 className="text-3xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-[44px]">
                <span className="block">
                  The Future of Legal
                </span>

                <span className="mt-2.5 block text-amber-500">
                  Consultation is Here.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                Experience a seamless journey from inquiry to
                resolution. Connect with experienced advocates and
                get the right legal guidance for your case.
              </p>

              {/* ==============================
                  HOW IT WORKS STEPS
              ============================== */}

              <div className="mt-7">
                {HOW_IT_WORKS_STEPS.map((step, index) => {
                  const StepIcon =
                    STEP_ICON_MAP[step.icon] || FiCheckCircle;

                  return (
                    <div
                      key={step.number}
                      className="group relative flex gap-4 pb-6 last:pb-0"
                    >
                      {index !==
                        HOW_IT_WORKS_STEPS.length - 1 && (
                        <div
                          className="absolute left-[20px] top-[43px] h-[calc(100%-17px)] w-px bg-slate-200 transition-colors duration-300 group-hover:bg-amber-200"
                          aria-hidden="true"
                        />
                      )}

                      <div
                        className="
                          relative
                          z-10
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          text-amber-600
                          shadow-sm
                          transition-all
                          duration-300
                          group-hover:-translate-y-0.5
                          group-hover:border-amber-200
                          group-hover:bg-amber-500
                          group-hover:text-white
                        "
                      >
                        <StepIcon
                          className="text-[19px]"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 sm:text-base">
                            {step.title}
                          </h4>
                        </div>

                        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 sm:text-sm">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==============================
                FEATURED ADVOCATES
            ============================== */}

            <div
              className="
                relative
                w-full
                overflow-hidden
                rounded-[26px]
                border
                border-slate-200
                bg-white
                shadow-[0_20px_60px_rgba(15,23,42,0.12)]
              "
            >
              <div className="relative z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-600">
                    Legal Excellence
                  </p>

                  <h3 className="mt-0.5 text-base font-extrabold text-slate-900 sm:text-lg">
                    Featured Advocates
                  </h3>
                </div>

                <div
                  className="flex items-center gap-1.5"
                  aria-hidden="true"
                >
                  {premiumAdvocates.map(
                    (advocate, index) => (
                      <div
                        key={
                          advocate?.id ||
                          advocate?._id ||
                          index
                        }
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          index === premiumIndex
                            ? "w-6 bg-amber-500"
                            : "w-1.5 bg-slate-200"
                        }`}
                      />
                    ),
                  )}
                </div>
              </div>

              <div className="relative h-[350px] sm:h-[365px]">
                {premiumAdvocates.map(
                  (advocate, index) => (
                    <PremiumAdvocateSlide
                      key={
                        advocate?.id ||
                        advocate?._id ||
                        index
                      }
                      advocate={advocate}
                      isActive={index === premiumIndex}
                      onBookConsultation={
                        onBookConsultation
                      }
                      onViewProfile={onViewProfile}
                    />
                  ),
                )}
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
};

export default HowItWorksSection;