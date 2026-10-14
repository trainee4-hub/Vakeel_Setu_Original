import React from "react";

import {
  MdEventAvailable,
  MdTaskAlt,
  MdPayments,
  MdForum,
  MdRateReview,
} from "react-icons/md";

const CONSULTATION_STEPS = [
  {
    step: 1,
    icon: MdEventAvailable,
    label: "Book",
  },
  {
    step: 2,
    icon: MdTaskAlt,
    label: "Advocate Accepts",
  },
  {
    step: 3,
    icon: MdPayments,
    label: "Payment",
  },
  {
    step: 4,
    icon: MdForum,
    label: "Meeting",
  },
  {
    step: 5,
    icon: MdRateReview,
    label: "Review",
  },
];

/** Generic explanatory steps — static, not data-dependent. */
export default function ConsultationProcessSection() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-100">
        How Consultation Works
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {CONSULTATION_STEPS.map((s) => {
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="size-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Icon className="text-lg" aria-hidden="true" />
              </div>

              <span className="text-[10px] font-bold text-slate-400">
                STEP {s.step}
              </span>

              <span className="text-xs font-semibold text-slate-700">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}