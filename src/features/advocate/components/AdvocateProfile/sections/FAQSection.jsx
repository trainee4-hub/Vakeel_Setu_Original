import React from "react";
import { FiHelpCircle, FiChevronDown } from "react-icons/fi";

/**
 * Real backend FAQs only. When the backend hasn't provided any for this
 * advocate the section simply doesn't render — no invented questions.
 */
export default function FAQSection({ faqs }) {
  if (faqs.length === 0) return null;

  return (
    <div
      id="faq"
      className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 scroll-mt-16"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <FiHelpCircle className="text-xl" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Common questions about consultation and appointments.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500">
          {faqs.length} Questions
        </span>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <details
            key={faq._id || faq.id || idx}
            className="group rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden transition-all duration-300 hover:border-amber-200 hover:bg-white"
          >
            <summary className="flex items-center gap-4 cursor-pointer list-none px-4 sm:px-5 py-4">
              {/* Number */}
              <span className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[11px] font-bold text-slate-400 group-open:bg-amber-50 group-open:border-amber-200 group-open:text-amber-600 transition-colors">
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Question */}
              <span className="flex-1 text-sm sm:text-base font-semibold text-slate-800">
                {faq.question}
              </span>

              {/* Arrow */}
              <FiChevronDown className="shrink-0 text-[20px] text-slate-400 transition-transform duration-300 group-open:rotate-180" />
            </summary>

            {/* Answer */}
            <div className="px-4 sm:px-5 pb-4">
              <div className="ml-12 pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}