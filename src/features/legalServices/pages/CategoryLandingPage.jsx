import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiSearch,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";

import {
  findCategoryBySlug,
  LEGAL_SERVICES_CATEGORIES,
} from "../data/legalServicesCatalogue";
import { setBreadcrumbLabel } from "../../../utils/breadcrumbStore";
import LegalServicesIntakeSection from "../components/LegalServicesIntakeSection";

const CategoryLandingPage = () => {
  const { categorySlug } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const category = useMemo(
    () => findCategoryBySlug(categorySlug),
    [categorySlug]
  );

  useEffect(() => {
    if (category) {
      setBreadcrumbLabel(category.slug, category.title);
      document.title = `${category.title} Services | VakeelSetu`;
    }
  }, [category]);

  const filteredServices = useMemo(() => {
    if (!category) return [];
    if (!searchQuery.trim()) return category.services;
    const q = searchQuery.toLowerCase().trim();
    return category.services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.summary && s.summary.toLowerCase().includes(q))
    );
  }, [category, searchQuery]);

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Category Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          We could not find the legal service category you are looking for.
        </p>
        <Link
          to="/legal-services"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition"
        >
          <span>View All Legal Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Strip (Dark Navy + Gold) */}
      <section className="relative overflow-hidden bg-[#070b14] py-14 sm:py-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.12)_0%,rgba(7,11,20,0.85)_60%,#070b14_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <FaScaleBalanced className="text-xs" />
              <span>{category.services.length} Dedicated Services</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {category.title}
            </h1>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
              {category.shortDescription}
            </p>

            {/* Quick search input */}
            <div className="mt-8 relative max-w-lg">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search within ${category.title}...`}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-3.5 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-400 backdrop-blur-md focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Results bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Services ({filteredServices.length})
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <Link
              key={svc.slug}
              to={`/legal-services/${category.slug}/${svc.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                    <FaScaleBalanced className="text-sm" />
                  </div>
                  {svc.isSampleFullPage && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      ★ Full Researched
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {svc.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {svc.summary}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-700 group-hover:text-amber-600">
                <span>View Full Procedure</span>
                <FiArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No services matched "{searchQuery}" in this category.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
            >
              Show All Services
            </button>
          </div>
        )}

        {/* Other Categories Browser */}
        <div className="mt-16 rounded-3xl border border-slate-200/80 bg-slate-100/60 p-6 sm:p-8">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4">
            Explore Other Legal Service Categories
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {LEGAL_SERVICES_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to={`/legal-services/${c.slug}`}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  c.slug === category.slug
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                {c.number}. {c.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HIGH-END LEGAL CONSULTATION INTAKE SECTION */}
      <LegalServicesIntakeSection defaultCategory={category.title} />
    </div>
  );
};

export default CategoryLandingPage;
