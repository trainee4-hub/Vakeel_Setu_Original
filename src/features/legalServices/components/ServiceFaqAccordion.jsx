import React, { useState } from "react";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

const ServiceFaqAccordion = ({ faqs = [] }) => {
  const [openIndex, setOpenIndex] = useState(0); // first open by default

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-amber-300/80 bg-amber-50/30 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
            >
              <div className="flex items-start gap-3">
                <FiHelpCircle
                  className={`mt-0.5 text-base shrink-0 transition-colors ${
                    isOpen ? "text-amber-600" : "text-slate-400"
                  }`}
                />
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {faq.question}
                </span>
              </div>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                  isOpen
                    ? "rotate-180 bg-amber-500 text-slate-950"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <FiChevronDown className="text-sm" />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-amber-200/50 px-4 pb-5 pt-3 sm:px-5">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-7">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ServiceFaqAccordion;
