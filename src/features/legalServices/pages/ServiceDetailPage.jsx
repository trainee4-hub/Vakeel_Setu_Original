import React, { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiAward,
  FiCheckCircle,
  FiShield,
} from "react-icons/fi";
import { MdGavel, MdVerified } from "react-icons/md";
import { FaScaleBalanced } from "react-icons/fa6";

import ServiceHero from "../components/ServiceHero";
import LegalConsultationCard from "../components/LegalConsultationCard";
import ServiceFaqAccordion from "../components/ServiceFaqAccordion";
import RelatedServices from "../components/RelatedServices";
import ProcessZigZagFlow from "../components/ProcessZigZagFlow";
import DocumentsRequiredGrid from "../components/DocumentsRequiredGrid";
import LegalServicesIntakeSection from "../components/LegalServicesIntakeSection";

import { resolveServiceData } from "../utils/contentResolver";
import { getRelatedServices } from "../data/legalServicesCatalogue";
import { setBreadcrumbLabel } from "../../../utils/breadcrumbStore";

// Color themes matching the first reference image (Cards with colored left accent borders)
const LAW_CARD_THEMES = [
  {
    border: "border-l-4 border-blue-600",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    iconColor: "text-blue-600",
    Icon: FaScaleBalanced,
  },
  {
    border: "border-l-4 border-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    iconColor: "text-emerald-600",
    Icon: FiShield,
  },
  {
    border: "border-l-4 border-amber-500",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    iconColor: "text-amber-600",
    Icon: MdGavel,
  },
  {
    border: "border-l-4 border-blue-600",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    iconColor: "text-blue-600",
    Icon: FiCheckCircle,
  },
  {
    border: "border-l-4 border-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    iconColor: "text-emerald-600",
    Icon: MdVerified,
  },
];

const ServiceDetailPage = () => {
  const { categorySlug, serviceSlug } = useParams();

  const data = useMemo(
    () => resolveServiceData(categorySlug, serviceSlug),
    [categorySlug, serviceSlug]
  );

  const related = useMemo(
    () => getRelatedServices(data?.categorySlug || categorySlug, data?.serviceSlug || serviceSlug, 4),
    [data, categorySlug, serviceSlug]
  );

  // Dynamic calculation of active sections for strictly continuous numbering (01, 02, 03...)
  const activeSections = useMemo(() => {
    if (!data) return [];
    const list = [];

    // 1. Introduction
    if (data.introduction?.summary) {
      list.push({
        id: "intro",
        key: "intro",
        title: "Introduction & Overview",
        subtitle: "Overview & Legal Foundation",
      });
    }

    // 2. Applicable Laws
    if (Array.isArray(data.applicableLaws) && data.applicableLaws.length > 0) {
      list.push({
        id: "applicable-laws",
        key: "applicable-laws",
        title: "Applicable Laws",
        subtitle: "Statutory Provisions",
      });
    }

    // 3. Documents Required - ONLY included if non-empty checklist exists!
    const hasDocuments =
      Array.isArray(data.documentsRequired) &&
      data.documentsRequired.length > 0 &&
      data.documentsRequired.some((g) => Array.isArray(g.items) && g.items.length > 0);

    if (hasDocuments) {
      list.push({
        id: "documents-required",
        key: "documents-required",
        title: "Documents Required",
        subtitle: "Checklist & Evidence",
      });
    }

    // 4. Why Choose VakeelSetu (Always present)
    list.push({
      id: "why-vakeelsetu",
      key: "why-vakeelsetu",
      title: "Why Choose VakeelSetu",
      subtitle: "The VakeelSetu Standard",
    });

    // 5. Frequently Asked Questions
    if (Array.isArray(data.faqs) && data.faqs.length > 0) {
      list.push({
        id: "faqs",
        key: "faqs",
        title: "Frequently Asked Questions",
        subtitle: "Direct Answers",
      });
    }

    // 6. Step-by-Step Legal Procedure
    if (Array.isArray(data.legalProcedure) && data.legalProcedure.length > 0) {
      list.push({
        id: "legal-procedure",
        key: "legal-procedure",
        title: "Step-by-Step Legal Procedure",
        subtitle: "Chronological Infographic",
      });
    }

    return list;
  }, [data]);

  const getSectionMeta = (key) => {
    const idx = activeSections.findIndex((s) => s.key === key);
    if (idx === -1) return null;
    const num = idx + 1;
    return {
      num,
      badge: String(num).padStart(2, "0"),
      title: `${num}. ${activeSections[idx].title}`,
      subtitle: activeSections[idx].subtitle,
    };
  };

  const introMeta = getSectionMeta("intro");
  const lawsMeta = getSectionMeta("applicable-laws");
  const docsMeta = getSectionMeta("documents-required");
  const whyMeta = getSectionMeta("why-vakeelsetu");
  const faqsMeta = getSectionMeta("faqs");
  const procMeta = getSectionMeta("legal-procedure");

  useEffect(() => {
    if (data) {
      if (data.categorySlug && data.categoryTitle) {
        setBreadcrumbLabel(data.categorySlug, data.categoryTitle);
      }
      if (data.serviceSlug && data.title) {
        setBreadcrumbLabel(data.serviceSlug, data.title);
      }
      document.title = data.seoTitle || `${data.title} | VakeelSetu`;
    }
  }, [data]);

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Service Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested legal service could not be located in our catalogue.
        </p>
        <Link
          to="/legal-services"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition"
        >
          <span>Browse Legal Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 1. HERO SECTION (Untouched As Required) */}
      <ServiceHero
        title={data.title}
        h1={data.h1}
        shortIntro={data.shortIntro}
        categoryTitle={data.categoryTitle}
        categorySlug={data.categorySlug}
        trustChips={data.trustChips}
      />

      {/* 2. MAIN CONTAINER WITH COMPACT STICKY SIDEBAR + CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT STICKY SIDEBAR (col-span-4) - Compact, clean, no clipping */}
          <div className="lg:col-span-4 order-2 lg:order-1 sticky top-20 self-start">
            <LegalConsultationCard serviceTitle={data.title} />
          </div>

          {/* MAIN CONTENT AREA (col-span-8) */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-10">

            {/* ═════════════════════════════════════════════════════════════
                SECTION 1: Introduction & Overview (Attractive Executive Redesign)
            ═════════════════════════════════════════════════════════════ */}
            {introMeta && (
              <section
                id="intro"
                className="scroll-mt-28 relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md"
              >
                {/* Subtle Ambient Glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />

                {/* Header Badge */}
                <div className="flex items-center gap-2.5 text-amber-600 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                    {introMeta.badge}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                    {introMeta.subtitle}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {introMeta.title}
                </h2>

                {/* Introduction Body Paragraphs with Curved / Rounded Accent Pill (Point 6) */}
                <div className="mt-5 flex items-stretch gap-4 sm:gap-5">
                  <div className="w-1.5 shrink-0 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-2xs" />
                  <div className="space-y-4 text-slate-700 font-normal text-sm sm:text-base leading-[1.8] tracking-normal">
                    {String(data.introduction.summary || "")
                      .split("\n\n")
                      .filter(Boolean)
                      .map((para, pIdx) => (
                        <p key={pIdx} className="text-slate-700 leading-[1.8]">
                          {para}
                        </p>
                      ))}
                  </div>
                </div>

                {/* 4 Feature Highlights Grid */}
                {data.introduction.highlights && (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-2">
                      <FiShield className="text-amber-600 text-sm" />
                      <span>Statutory Key Pillars & Safeguards</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {data.introduction.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-3.5 shadow-xs transition hover:border-amber-400/60 hover:shadow-sm"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                            <FiCheckCircle className="text-sm font-black" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800 leading-snug pt-0.5">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 2: Applicable Indian Laws (Auto-Hidden If Empty)
            ═════════════════════════════════════════════════════════════ */}
            {lawsMeta && (
              <section
                id="applicable-laws"
                className="scroll-mt-28 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-2.5 text-amber-600 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                    {lawsMeta.badge}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                    {lawsMeta.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {lawsMeta.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Key penal sections, statutory presumptions, and relief provisions governing this legal matter:
                </p>

                {/* Grid of Cards matching the First Reference Image */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {(data.applicableLaws || []).map((law, idx) => {
                    const theme = LAW_CARD_THEMES[idx % LAW_CARD_THEMES.length];
                    const CardIcon = theme.Icon;
                    const stepNumber = String(idx + 1).padStart(2, "0");

                    return (
                      <div
                        key={idx}
                        className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${theme.border}`}
                      >
                        <div>
                          {/* Top Row: Icon Badge (left) and Watermark Number (right) */}
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.iconColor} border ${theme.badgeBorder} shadow-xs`}
                            >
                              <CardIcon className="text-lg" />
                            </div>
                            <span className="text-3xl font-black text-slate-200 select-none tracking-tight">
                              {stepNumber}
                            </span>
                          </div>

                          {/* Title & Section */}
                          <div className="mt-3.5">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                              {law.title}
                            </h3>
                            {law.act && (
                              <p className="mt-1 text-[11px] font-bold text-slate-500">
                                {law.section} • {law.act}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                            {law.summary}
                          </p>
                        </div>

                        {law.tag && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {law.tag}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 3: Documents Required (AUTO-HIDDEN IF NO DOCUMENTS)
            ═════════════════════════════════════════════════════════════ */}
            {docsMeta && (
              <section
                id="documents-required"
                className="scroll-mt-28 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-2.5 text-amber-600 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                    {docsMeta.badge}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                    {docsMeta.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {docsMeta.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  Essential records required to substantiate your matter and ensure complete procedural compliance:
                </p>

                <DocumentsRequiredGrid documents={data.documentsRequired || []} />
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 4: Why Choose VakeelSetu
            ═════════════════════════════════════════════════════════════ */}
            {whyMeta && (
              <section
                id="why-vakeelsetu"
                className="scroll-mt-28 rounded-3xl border border-slate-900 bg-slate-950 p-6 sm:p-8 text-white shadow-xl"
              >
                <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-xs font-black text-amber-300">
                    {whyMeta.badge}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    {whyMeta.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {whyMeta.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Engineered for trust, precision, and seamless legal access across India:
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    data.whyChooseVakeelSetu ||
                    data.whyVakeelSetu ||
                    [
                      {
                        title: "Bar Council-Enrolled Advocates",
                        description: "Every matter is handled exclusively by verified legal practitioners.",
                      },
                      {
                        title: "Clear Fixed Pricing",
                        description: "Transparent professional charges without unexpected add-ons.",
                      },
                      {
                        title: "Pan-India Network",
                        description: "Advocates available across all major high courts and district jurisdictions.",
                      },
                    ]
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4"
                    >
                      <FiAward className="text-amber-400 text-lg mb-2" />
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 5: Frequently Asked Questions (FAQ Accordions)
            ═════════════════════════════════════════════════════════════ */}
            {faqsMeta && (
              <section
                id="faqs"
                className="scroll-mt-28 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-2.5 text-amber-600 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                    {faqsMeta.badge}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                    {faqsMeta.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {faqsMeta.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  Clear answers regarding legal requirements, limitation periods, territorial jurisdiction, and advocate assistance:
                </p>

                <ServiceFaqAccordion faqs={data.faqs || []} />
              </section>
            )}

            {/* RELATED SERVICES */}
            <RelatedServices
              services={related}
              categoryTitle={data.categoryTitle}
              categorySlug={data.categorySlug}
            />
          </article>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          FULL-PAGE WIDTH SECTION: STEP-BY-STEP LEGAL PROCEDURE
          Placed directly above the Intake Section so it spans 100% of page width
          with ZERO horizontal scrollbar!
      ═════════════════════════════════════════════════════════════ */}
      {procMeta && (
        <section
          id="legal-procedure"
          className="scroll-mt-28 border-t border-slate-200/90 bg-white py-14 sm:py-16 shadow-xs overflow-hidden"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl mb-8">
              <div className="flex items-center gap-2.5 text-amber-600 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                  {procMeta.badge}
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                  {procMeta.subtitle}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {procMeta.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Continuous statutory sequence from initial advocate evaluation to formal execution and resolution:
              </p>
            </div>

            {/* Full-Page Width Pillar Chevron Infographic */}
            <ProcessZigZagFlow steps={data.legalProcedure || []} />
          </div>
        </section>
      )}

      {/* HIGH-END LEGAL CONSULTATION INTAKE SECTION (Get Instant Legal Advice from High Court & Supreme Court Advocates) */}
      <LegalServicesIntakeSection
        defaultCategory={data.categoryTitle}
        defaultServiceTitle={data.title}
      />
    </div>
  );
};

export default ServiceDetailPage;
