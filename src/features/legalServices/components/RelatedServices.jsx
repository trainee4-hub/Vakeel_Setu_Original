import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFileText } from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";

const RelatedServices = ({ services = [], categoryTitle = "", categorySlug = "" }) => {
  if (!services || services.length === 0) return null;

  return (
    <section className="mt-14 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
            More in {categoryTitle}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Related Legal Services
          </h2>
        </div>
        <Link
          to={`/legal-services/${categorySlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
        >
          <span>View All in {categoryTitle}</span>
          <FiArrowRight className="text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <Link
            key={svc.slug}
            to={`/legal-services/${svc.categorySlug || categorySlug}/${svc.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <FaScaleBalanced className="text-xs" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Advocate Service
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                {svc.title}
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {svc.summary}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-amber-600 pt-2 border-t border-slate-100">
              <span>View Requirements & Procedure</span>
              <FiArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedServices;
