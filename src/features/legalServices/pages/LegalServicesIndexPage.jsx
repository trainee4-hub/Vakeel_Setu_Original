import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiCompass,
  FiSearch,
  FiShield,
  FiStar,
} from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";

import {
  LEGAL_SERVICES_CATEGORIES,
  ALL_LEGAL_SERVICES,
} from "../data/legalServicesCatalogue";
import { setBreadcrumbLabel } from "../../../utils/breadcrumbStore";
import LegalServicesIntakeSection from "../components/LegalServicesIntakeSection";

const LegalServicesIndexPage = () => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    setBreadcrumbLabel("legal-services", "Legal Services");
    document.title = "Legal Services Catalogue (87 Services) | VakeelSetu";
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return ALL_LEGAL_SERVICES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.categoryTitle.toLowerCase().includes(q) ||
        (s.summary && s.summary.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Index Hero */}
      <section className="relative overflow-hidden bg-[#070b14] py-16 sm:py-20 text-white">
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.16)_0%,rgba(7,11,20,0.85)_55%,#070b14_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-300 mb-4">
            <FaScaleBalanced className="text-xs" />
            <span>VakeelSetu Legal Services Catalogue</span>
            <span className="text-amber-400/50">•</span>
            <span>11 Categories • 87 Verified Services</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Authoritative Legal Services,{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Direct from Advocates
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed">
            From statutory demand notices to corporate contracts, matrimonial agreements, and cyber fraud relief—explore comprehensive legal procedures governed by Indian law.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-xl relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all 87 services (e.g., Cheque Bounce, Lease, NDA)..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 py-4 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-400 backdrop-blur-md focus:border-amber-500 focus:outline-none shadow-xl"
            />
          </div>

          {/* Quick search suggestions */}
          {search && searchResults.length > 0 && (
            <div className="mx-auto mt-3 max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-3 text-left shadow-2xl">
              <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-wider text-amber-400">
                Matching Services ({searchResults.length})
              </p>
              <div className="divide-y divide-slate-800">
                {searchResults.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/legal-services/${s.categorySlug}/${s.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{s.title}</p>
                      <p className="text-[10px] text-slate-400">{s.categoryTitle}</p>
                    </div>
                    <FiArrowRight className="text-xs text-amber-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-600">
              Structured Legal Architecture
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              11 Legal Service Categories
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500">
            87 Services Total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEGAL_SERVICES_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 font-black text-xs">
                    {cat.number}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black text-slate-600">
                    {cat.services.length} Services
                  </span>
                </div>

                <Link to={`/legal-services/${cat.slug}`}>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {cat.title}
                  </h3>
                </Link>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {cat.shortDescription}
                </p>

                {/* Service pills preview */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cat.services.slice(0, 4).map((s) => (
                    <Link
                      key={s.slug}
                      to={`/legal-services/${cat.slug}/${s.slug}`}
                      className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-amber-100 hover:text-amber-900 transition"
                    >
                      {s.title}
                    </Link>
                  ))}
                  {cat.services.length > 4 && (
                    <span className="rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-400">
                      +{cat.services.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  to={`/legal-services/${cat.slug}`}
                  className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-600 transition"
                >
                  <span>Explore All {cat.title}</span>
                  <FiArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HIGH-END LEGAL CONSULTATION INTAKE SECTION */}
      <LegalServicesIntakeSection />
    </div>
  );
};

export default LegalServicesIndexPage;
