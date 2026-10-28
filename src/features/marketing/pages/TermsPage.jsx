import React from "react";
import { FiShield } from "react-icons/fi";
import TermsAndConditionsContent from "../components/TermsAndConditionsContent";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <FiShield className="text-sm" aria-hidden="true" />
            Legal & Compliance
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Terms of Service
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Please read these terms and conditions carefully before using the AdvocateConnect platform.
          </p>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <TermsAndConditionsContent />
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
