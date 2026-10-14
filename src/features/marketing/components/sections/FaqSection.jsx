import { useCallback, useState } from "react";
import { FiHelpCircle, FiInfo } from "react-icons/fi";

import RevealOnScroll from "../common/RevealOnScroll";
import FaqItem from "../common/FaqItem";

import {
  DASHBOARD_FAQS,
  PAGE_CONTAINER,
} from "../../data/dashboardData";

const FaqSection = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const handleToggleFaq = useCallback((index) => {
    setActiveFaqIndex((previous) =>
      previous === index ? null : index,
    );
  }, []);

  return (
    <RevealOnScroll>
      <section className="border-t border-slate-100 bg-slate-50 py-8 sm:py-10 lg:py-14">
        <div className={`${PAGE_CONTAINER} w-full`}>
          <div className="mb-6 w-full sm:mb-7">
            <div className="flex flex-col items-start">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
                <FiHelpCircle
                  className="shrink-0 text-[14px]"
                  aria-hidden="true"
                />
                Help Center
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                Frequently Asked Questions
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
                Everything you need to know about finding advocates,
                consultations, bookings, and using Vakeel Setu.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span
                  className="size-2 animate-pulse rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Quick answers
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="space-y-2.5">
              {DASHBOARD_FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
                  index={index}
                  isOpen={activeFaqIndex === index}
                  onToggle={() => handleToggleFaq(index)}
                />
              ))}
            </div>

            <div className="mt-5 flex justify-start">
              <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                <FiInfo
                  className="shrink-0 text-[15px] text-amber-500"
                  aria-hidden="true"
                />

                <span>
                  Still have questions? Connect with an advocate for
                  personalized legal guidance.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
};

export default FaqSection;