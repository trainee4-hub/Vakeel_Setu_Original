import React, { useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiExternalLink,
  FiFileText,
  FiFolder,
  FiInfo,
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
import TableOfContents from "../components/TableOfContents";

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

    // Verbatim Content Model (Prompt 3): if data.sections exists, use PDF's exact sections!
    if (Array.isArray(data.sections) && data.sections.length > 0) {
      const validSections = data.sections.filter(
        (sec) =>
          (Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) ||
          (Array.isArray(sec.bullets) && sec.bullets.length > 0) ||
          (Array.isArray(sec.subsections) && sec.subsections.length > 0) ||
          (Array.isArray(sec.items) && sec.items.length > 0)
      );

      const list = validSections.map((sec, idx) => {
        const rawHeading = sec.heading || `Section ${idx + 1}`;
        const cleanHeading = rawHeading.replace(/^\d+(\.\d+)*\.\s*/, "").trim();
        const secId =
          sec.id ||
          `section-${cleanHeading
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")}`;

        const sub = sec.subtitle || "";

        return {
          id: secId,
          key: `verbatim-sec-${idx}`,
          title: cleanHeading,
          rawTitle: rawHeading,
          subtitle: sub,
          secIndex: idx,
        };
      });

      const whyItems = data.whyChooseVakeelSetu || data.whyVakeelSetu;
      if (Array.isArray(whyItems) && whyItems.length > 0) {
        list.push({
          id: "why-vakeelsetu",
          key: "why-vakeelsetu",
          title: "Why Choose VakeelSetu",
          subtitle: "The VakeelSetu Standard",
        });
      }

      if (Array.isArray(data.faqs) && data.faqs.length > 0) {
        list.push({
          id: "faqs",
          key: "faqs",
          title: "Frequently Asked Questions",
          subtitle: "Direct Answers",
        });
      }

      return list;
    }

    const list = [];

    // 1. Introduction & Overview (PDF Point 1)
    if (data.introduction?.summary) {
      list.push({
        id: "intro",
        key: "intro",
        title: "Introduction & Overview",
        subtitle: "Overview & Legal Foundation",
      });
    }

    // 2. Objectives & Importance (PDF Point 2)
    const hasObjectives = Boolean(
      (Array.isArray(data.objectives) && data.objectives.length > 0) ||
      (Array.isArray(data.introduction?.highlights) && data.introduction.highlights.length > 0)
    );
    if (hasObjectives) {
      list.push({
        id: "objectives",
        key: "objectives",
        title: data.objectivesTitle || "Objectives & Importance",
        subtitle: "Key Purpose & Legal Protection",
      });
    }

    // 3. Applicable Laws & Legal Framework (PDF Point 3 - Dynamic Title Support)
    const hasLaws = Boolean(
      (Array.isArray(data.legalFramework?.sections) && data.legalFramework.sections.length > 0) ||
      (Array.isArray(data.applicableLaws) && data.applicableLaws.length > 0)
    );
    if (hasLaws) {
      list.push({
        id: "applicable-laws",
        key: "applicable-laws",
        title: data.lawsHeading || data.applicableLawsTitle || "Applicable Laws & Legal Framework",
        subtitle: "Statutory Provisions",
      });
    }

    // 4. Documents Required (PDF Point 4 - ONLY if non-empty checklist exists)
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

    // Dynamic Additional Sections (Placed before Why Choose)
    if (Array.isArray(data.additionalSections) && data.additionalSections.length > 0) {
      data.additionalSections.forEach((sec, idx) => {
        if (!sec || !sec.heading) return;
        const hasContent =
          (Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) ||
          (Array.isArray(sec.bullets) && sec.bullets.length > 0);
        if (!hasContent) return;

        const secId =
          sec.id ||
          `section-${sec.heading
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")}`;

        list.push({
          id: secId,
          key: `additional-${idx}`,
          title: sec.heading,
          subtitle: sec.subtitle || "Key Provisions & Summary",
        });
      });
    }

    // 5. Why Choose VakeelSetu
    const whyItems = data.whyChooseVakeelSetu || data.whyVakeelSetu;
    if (Array.isArray(whyItems) && whyItems.length > 0) {
      list.push({
        id: "why-vakeelsetu",
        key: "why-vakeelsetu",
        title: "Why Choose VakeelSetu",
        subtitle: "The VakeelSetu Standard",
      });
    }

    // 6. Step-by-Step Legal Procedure (ONLY if authentic procedure exists)
    const showProcedure =
      data.hasProcedure !== false &&
      Array.isArray(data.legalProcedure) &&
      data.legalProcedure.length > 0;

    if (showProcedure) {
      list.push({
        id: "legal-procedure",
        key: "legal-procedure",
        title: "Step-by-Step Legal Procedure",
        subtitle: "Chronological Sequence",
      });
    }

    // 7. Frequently Asked Questions (Below Procedure!)
    if (Array.isArray(data.faqs) && data.faqs.length > 0) {
      list.push({
        id: "faqs",
        key: "faqs",
        title: "Frequently Asked Questions",
        subtitle: "Direct Answers",
      });
    }

    return list;
  }, [data]);

  const getSectionMeta = (key) => {
    const idx = activeSections.findIndex((s) => s.key === key);
    if (idx === -1) return null;
    const num = idx + 1;
    const rawTitle = activeSections[idx].title || "";
    // If heading already has leading number like "2. " or "2.1.", strip it from display title so badge + title is clean
    const cleanTitle = rawTitle.replace(/^\d+(\.\d+)*\.\s*/, "").trim();
    return {
      num,
      badge: String(num).padStart(2, "0"),
      title: cleanTitle,
      fullTitle: `${num}. ${cleanTitle}`,
      subtitle: activeSections[idx].subtitle,
    };
  };

  const introMeta = getSectionMeta("intro");
  const objectivesMeta = getSectionMeta("objectives");
  const lawsMeta = getSectionMeta("applicable-laws");
  const docsMeta = getSectionMeta("documents-required");
  const whyMeta = getSectionMeta("why-vakeelsetu");
  const procMeta = getSectionMeta("legal-procedure");
  const faqsMeta = getSectionMeta("faqs");

  // Dynamic TOC ensuring ONLY sections actually rendered appear
  const filteredToc = useMemo(() => {
    if (!data) return [];
    const activeIds = new Set(activeSections.map((s) => s.id));
    if (Array.isArray(data.toc) && data.toc.length > 0) {
      return data.toc.filter((item) => activeIds.has(item.id));
    }
    return activeSections.map((s) => ({
      id: s.id,
      title: (s.title || "").replace(/^\d+(\.\d+)*\.\s*/, "").trim(),
    }));
  }, [data, activeSections]);

  const handleOpenConsultation = useCallback(() => {
    const eventDetail = { handled: false };
    const customEvent = new CustomEvent("vakeelsetu:open-consultancy", {
      bubbles: true,
      cancelable: true,
      detail: eventDetail,
    });
    window.dispatchEvent(customEvent);
  }, []);

  const renderTextWithLinks = useCallback((text) => {
    if (!text || typeof text !== "string") return text;
    // Regex matches either http(s) URLs or **bold** text
    const tokenRegex = /(https?:\/\/[^\s]+|\*\*[^*]+\*\*)/g;
    const parts = text.split(tokenRegex);
    if (parts.length === 1) return text;
    return parts.map((part, i) => {
      if (!part) return null;
      if (/^https?:\/\//.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 underline underline-offset-2 font-medium break-all transition"
          >
            <span>{part}</span>
            <FiExternalLink className="inline text-xs shrink-0 text-slate-500" />
          </a>
        );
      }
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <span key={i} className="font-semibold text-slate-800">
            {part.slice(2, -2)}
          </span>
        );
      }
      return part;
    });
  }, []);

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
          <div className="lg:col-span-4 order-2 lg:order-1 sticky top-20 self-start space-y-6">
            {filteredToc.length > 0 && (
              <TableOfContents toc={filteredToc} />
            )}
            <LegalConsultationCard serviceTitle={data.title} />
          </div>

          {/* MAIN CONTENT AREA (col-span-8) */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-10">

            {/* ═════════════════════════════════════════════════════════════
                VERBATIM PDF CONTENT MODEL (Prompt 3 - 100% PDF Sections)
            ═════════════════════════════════════════════════════════════ */}
            {Array.isArray(data.sections) && data.sections.length > 0 ? (
              data.sections
                .filter(
                  (sec) =>
                    (Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0) ||
                    (Array.isArray(sec.bullets) && sec.bullets.length > 0) ||
                    (Array.isArray(sec.subsections) && sec.subsections.length > 0) ||
                    (Array.isArray(sec.items) && sec.items.length > 0)
                )
                .map((sec, idx) => {
                const meta = getSectionMeta(`verbatim-sec-${idx}`);
                if (!meta || !sec || !sec.heading) return null;

                const rawHeading = sec.heading || `section-${idx + 1}`;
                const cleanHeading = rawHeading.replace(/^\d+(\.\d+)*\.\s*/, "").trim();
                const secId =
                  sec.id ||
                  `section-${cleanHeading
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")}`;

                const hasParagraphs = Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0;
                const hasBullets = Array.isArray(sec.bullets) && sec.bullets.length > 0;

                // Mutually exclusive section type determination to guarantee zero duplicate rendering
                let sectionType = "standard";
                if (idx === 0 || /intro/i.test(cleanHeading)) {
                  sectionType = "intro";
                } else if (/judicial\s*principle/i.test(cleanHeading)) {
                  sectionType = "judicial";
                } else if (/^(conclusion|advice disclaimer|practical point)/i.test(cleanHeading)) {
                  sectionType = "conclusion";
                } else if (/document/i.test(cleanHeading)) {
                  sectionType = "document";
                } else if (/law|framework|act\b|statutory/i.test(cleanHeading)) {
                  sectionType = "laws";
                }

                const isIntroSection = sectionType === "intro";
                const isJudicialSection = sectionType === "judicial";
                const isConclusionSection = sectionType === "conclusion";
                const isDocumentsSection = sectionType === "document";
                const isLawsSection = sectionType === "laws";

                // Intelligent split of intro paragraphs around bullets (lead-in paragraphs ending with ':' belong before bullets)
                let beforeIntroParas = sec.paragraphs || [];
                let afterIntroParas = [];
                if (isIntroSection && hasBullets && hasParagraphs) {
                  const colonIdx = sec.paragraphs.findIndex((p) => /:\s*$/.test(String(p).trim()));
                  if (colonIdx !== -1) {
                    beforeIntroParas = sec.paragraphs.slice(0, colonIdx + 1);
                    afterIntroParas = sec.paragraphs.slice(colonIdx + 1);
                  } else {
                    beforeIntroParas = [sec.paragraphs[0]];
                    afterIntroParas = sec.paragraphs.slice(1);
                  }
                }

                return (
                  <section
                    key={idx}
                    id={secId}
                    className="scroll-mt-28 relative overflow-hidden rounded-3xl border border-slate-200/90 hover:border-amber-400/80 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    {/* Subtle Ambient Glow */}
                    <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl" />

                    {/* Header Badge & Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                        {meta.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                        {meta.title}
                      </h2>
                      {meta.subtitle && (
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          {meta.subtitle}
                        </span>
                      )}
                    </div>

                    {/* ═════════════════════════════════════════════════════════════
                        SECTION 1: INTRODUCTION (Curved Amber Accent Bar)
                    ═════════════════════════════════════════════════════════════ */}
                    {isIntroSection && hasParagraphs && (
                      <div className="mt-5 flex items-stretch gap-4 sm:gap-5">
                        <div className="w-2 sm:w-2.5 shrink-0 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-xs ring-1 ring-amber-400/25 my-1" />
                        <div className="space-y-5 sm:space-y-6 text-slate-700 font-normal text-sm sm:text-base leading-[1.85] tracking-normal">
                          {beforeIntroParas.map((paraBlock, pIdx) => {
                            const subParas = String(paraBlock || "")
                              .split(/\n+/)
                              .map((p) => p.trim())
                              .filter(Boolean);
                            return (
                              <React.Fragment key={pIdx}>
                                {subParas.map((para, spIdx) => (
                                  <p key={spIdx} className="leading-[1.85]">
                                    {renderTextWithLinks(para)}
                                  </p>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Introduction Sub-Points / Criteria (Single-Column Vertical Stack: Ek ke niche ek) */}
                    {isIntroSection && hasBullets && (
                      <div className="mt-5 space-y-2.5">
                        {sec.bullets.map((bullet, bIdx) => {
                          const colonIdx = bullet.indexOf(":");
                          const hasColon = colonIdx !== -1 && colonIdx < 80;
                          const title = hasColon ? bullet.slice(0, colonIdx).trim() : "";
                          const desc = hasColon ? bullet.slice(colonIdx + 1).trim() : bullet;
                          const cleanDesc = desc.replace(/^\(?\d+\)?[\.\)]?\s*/, "").replace(/;\s*(and|or)?\s*$/i, "").trim();

                          return (
                            <div
                              key={bIdx}
                              className="flex items-start gap-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 p-3.5 sm:p-4 transition-colors"
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-950 text-xs font-black shadow-xs">
                                {bIdx + 1}
                              </div>
                              <div className="pt-0.5 min-w-0 flex-1">
                                {title && (
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 leading-snug">
                                    {renderTextWithLinks(title)}
                                  </h4>
                                )}
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                                  {renderTextWithLinks(cleanDesc)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Concluding Paragraphs in Intro after Bullets (if any) */}
                    {isIntroSection && hasBullets && afterIntroParas.length > 0 && (
                      <div className="mt-5 space-y-4 text-slate-700 font-normal text-sm sm:text-base leading-[1.85]">
                        {afterIntroParas.map((paraBlock, pIdx) => (
                          <p key={pIdx}>{renderTextWithLinks(paraBlock)}</p>
                        ))}
                      </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════════
                        JUDICIAL PRINCIPLES SECTION (Landmark Precedent Callout Box)
                    ═════════════════════════════════════════════════════════════ */}
                    {isJudicialSection && (
                      <div className="mt-5 rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-amber-950 mb-3">
                          <FaScaleBalanced className="text-amber-700 text-base shrink-0" />
                          <span>Landmark Judicial Precedent</span>
                        </div>
                        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-[1.85] font-normal">
                          {sec.paragraphs.map((paraBlock, pIdx) => (
                            <p key={pIdx}>{renderTextWithLinks(paraBlock)}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════════
                        CONCLUSION SECTION (Amber Dot Overview Card)
                    ═════════════════════════════════════════════════════════════ */}
                    {isConclusionSection && (
                      <div className="mt-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 shadow-xs">
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                          Conclusion & Legal Overview
                        </h3>
                        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-[1.85] font-normal">
                          {sec.paragraphs.map((paraBlock, pIdx) => (
                            <p key={pIdx}>{renderTextWithLinks(paraBlock)}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════════
                        DOCUMENTS SECTION: CARD-GRID DESIGN (2-Column Grid)
                    ═════════════════════════════════════════════════════════════ */}
                    {isDocumentsSection && (() => {
                      const noteBullets = [];
                      const docBullets = [];

                      (sec.bullets || []).forEach((b) => {
                        if (/^(note|important|disclaimer|statutory note|please note|official references?|reference)\s*:/i.test(b.trim()) || /https?:\/\//i.test(b.trim())) {
                          noteBullets.push(b);
                        } else {
                          docBullets.push(b);
                        }
                      });

                      return (
                        <>
                          {hasParagraphs && (
                            <div className="mt-5 space-y-5 sm:space-y-6">
                              {sec.paragraphs.map((p, pIdx) => (
                                <p key={pIdx} className="text-slate-700 text-sm sm:text-base leading-[1.85] font-normal">
                                  {renderTextWithLinks(p)}
                                </p>
                              ))}
                            </div>
                          )}
                          {docBullets.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {docBullets.map((bullet, bIdx) => {
                                const colonIdx = bullet.indexOf(":");
                                const docName = colonIdx !== -1 ? bullet.slice(0, colonIdx).trim() : bullet;
                                const docDetail = colonIdx !== -1 ? bullet.slice(colonIdx + 1).trim() : "";
                                return (
                                  <div
                                    key={bIdx}
                                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/90 hover:shadow-lg hover:shadow-amber-500/5 h-full"
                                  >
                                    <div className="flex items-start gap-3.5">
                                      <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black shadow-sm shadow-amber-500/30">
                                        <FiCheck className="text-sm stroke-[3]" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
                                          {docName}
                                        </h4>
                                        {docDetail && (
                                          <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
                                            {docDetail}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {/* Static Verified Tags (No link) */}
                                    <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-slate-100/80 text-[10px] text-slate-400 font-semibold">
                                      <span className="flex items-center gap-1">
                                        <FiFileText className="text-slate-400" />
                                        <span>Mandatory Proof</span>
                                      </span>
                                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                                        Checklist Item
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {/* Full-width callout for any notes/disclaimers/official references in Documents section */}
                          {noteBullets.map((noteText, nIdx) => {
                            const isRef = /^(official\s*reference|reference|official\s*references)/i.test(noteText.trim());
                            const cleanText = noteText.replace(/^(note|important|disclaimer|statutory note|please note|official references|official reference)\s*:\s*/i, "");

                            if (isRef) {
                              return (
                                <div
                                  key={nIdx}
                                  id="official-references"
                                  className="mt-5 w-full rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 shadow-2xs text-left"
                                >
                                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/80">
                                    <FiBookOpen className="text-slate-600 text-sm shrink-0" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                      Official Statutory Reference
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                                    {renderTextWithLinks(cleanText)}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={nIdx}
                                className="mt-5 w-full flex items-start gap-3.5 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/30 to-white p-4 sm:p-5 shadow-xs"
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                                  <FiInfo className="text-base font-bold" />
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                  <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md mb-2">
                                    Important Note
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                                    {renderTextWithLinks(cleanText)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}

                    {/* ═════════════════════════════════════════════════════════════
                        LEGAL FRAMEWORK SECTION: EXECUTIVE STATUTE CARDS (FIX 1)
                    ═════════════════════════════════════════════════════════════ */}
                    {isLawsSection && (
                      <div className="mt-6 space-y-5">
                        {/* Introductory context paragraphs if any */}
                        {hasParagraphs && hasBullets && (
                          <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-[1.85] font-normal mb-5">
                            {sec.paragraphs.map((paraBlock, pIdx) => {
                              const subParas = String(paraBlock || "")
                                .split(/\n+/)
                                .map((p) => p.trim())
                                .filter(Boolean);
                              return (
                                <React.Fragment key={pIdx}>
                                  {subParas.map((para, spIdx) => (
                                    <p key={spIdx}>{renderTextWithLinks(para)}</p>
                                  ))}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        {/* Hierarchical Subsections Model (Heading -> Sub-headings -> Sections / Bullets) */}
                        {Array.isArray(sec.subsections) && sec.subsections.length > 0 ? (
                          sec.subsections.map((sub, sIdx) => {
                            const isFirst = sIdx === 0;
                            return (
                              <div
                                key={sIdx}
                                className={`overflow-hidden rounded-2xl border ${
                                  isFirst
                                    ? "border-amber-400/80 bg-gradient-to-br from-white via-amber-50/20 to-slate-50/60 shadow-xs"
                                    : "border-slate-200/90 bg-white"
                                } p-5 sm:p-6 shadow-xs transition hover:border-amber-400/60 hover:shadow-sm`}
                              >
                                {/* Sub-heading Title Row */}
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-400 text-xs font-black shadow-xs">
                                    {sub.badge || String.fromCharCode(65 + sIdx)}
                                  </span>
                                  <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                                    {sub.title}
                                  </h3>
                                </div>

                                {/* Sub-heading Intro / Description */}
                                {sub.intro && (
                                  <p className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-[1.85] font-normal">
                                    {renderTextWithLinks(sub.intro)}
                                  </p>
                                )}

                                {/* Sub-heading Bullets / Provisions (e.g. Section 5, Section 7, Section 8) */}
                                {Array.isArray(sub.bullets) && sub.bullets.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    {sub.bullets.map((bullet, bIdx) => {
                                      const colonIdx = bullet.indexOf(":");
                                      const hasColon = colonIdx !== -1 && colonIdx < 80;
                                      const bTitle = hasColon ? bullet.slice(0, colonIdx).trim() : "";
                                      const bDesc = hasColon ? bullet.slice(colonIdx + 1).trim() : bullet;

                                      return (
                                        <div
                                          key={bIdx}
                                          className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4 text-xs sm:text-sm transition hover:border-amber-300 hover:bg-amber-50/30"
                                        >
                                          {bTitle && (
                                            <span className="font-black mr-2 text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
                                              {bTitle}
                                            </span>
                                          )}
                                          <span className="text-slate-700 leading-relaxed font-normal">
                                            {renderTextWithLinks(bDesc)}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : Array.isArray(data.legalFramework?.sections) && data.legalFramework.sections.length > 0 && !hasBullets ? (
                          data.legalFramework.sections.map((part, pIdx) => (
                            <div
                              key={pIdx}
                              className={`overflow-hidden rounded-2xl border ${
                                pIdx === 0
                                  ? "border-amber-400/80 bg-gradient-to-br from-white via-amber-50/20 to-slate-50/60 shadow-xs"
                                  : "border-slate-200/90 bg-slate-50/40"
                              } p-5 sm:p-6 shadow-xs transition hover:border-amber-400/60 hover:shadow-sm`}
                            >
                              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-400 text-xs font-black shadow-xs">
                                  {part.letter || String.fromCharCode(65 + pIdx)}
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                                  {part.title}
                                </h3>
                              </div>
                              {part.description && (
                                <p className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-[1.85] font-normal">
                                  {part.description}
                                </p>
                              )}
                            </div>
                          ))
                        ) : hasBullets ? (
                          /* If bullets are present in the legal section (e.g. Medical Negligence) */
                          sec.bullets.map((bullet, bIdx) => {
                            const colonIdx = bullet.indexOf(":");
                            const hasColon = colonIdx !== -1 && colonIdx < 80;
                            const rawLeadTitle = hasColon ? bullet.slice(0, colonIdx).trim() : "";
                            const leadTitle = rawLeadTitle.replace(/^\d+(\.\d+)*\.\s*/, "").trim();
                            const leadDesc = hasColon ? bullet.slice(colonIdx + 1).trim() : bullet;
                            const isFirst = bIdx === 0;

                            return (
                              <div
                                key={bIdx}
                                className={`overflow-hidden rounded-2xl border ${
                                  isFirst
                                    ? "border-amber-400/80 bg-gradient-to-br from-white via-amber-50/20 to-slate-50/60 shadow-xs"
                                    : "border-slate-200/90 bg-slate-50/40"
                                } p-5 sm:p-6 shadow-xs transition hover:border-amber-400/60 hover:shadow-sm`}
                              >
                                <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-400 text-xs font-black shadow-xs">
                                    {String.fromCharCode(65 + bIdx)}
                                  </span>
                                  <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                                    {leadTitle || `Part ${String.fromCharCode(65 + bIdx)}`}
                                  </h3>
                                </div>
                                {leadDesc && (
                                  <p className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-[1.85] font-normal">
                                    {leadDesc}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          /* If paragraphs in legal section (e.g. Birth Certificate - no fake Part A box) */
                          <div className="space-y-5 sm:space-y-6">
                            {sec.paragraphs.map((paraBlock, pIdx) => {
                              const subParas = String(paraBlock || "")
                                .split(/\n+/)
                                .map((p) => p.trim())
                                .filter(Boolean);
                              return (
                                <React.Fragment key={pIdx}>
                                  {subParas.map((para, spIdx) => (
                                    <p
                                      key={spIdx}
                                      className="text-slate-700 text-sm sm:text-base leading-[1.85] font-normal"
                                    >
                                      {renderTextWithLinks(para)}
                                    </p>
                                  ))}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═════════════════════════════════════════════════════════════
                        STANDARD / OTHER SECTIONS (Why Needed, Clauses, Process)
                    ═════════════════════════════════════════════════════════════ */}
                    {!isIntroSection && !isJudicialSection && !isConclusionSection && !isDocumentsSection && !isLawsSection && (
                      <>
                        {hasParagraphs && (
                          <div className="mt-5 space-y-5 sm:space-y-6 text-slate-700 text-sm sm:text-base leading-[1.85] font-normal">
                            {sec.paragraphs.map((paraBlock, pIdx) => {
                              const subParas = String(paraBlock || "")
                                .split(/\n+/)
                                .map((p) => p.trim())
                                .filter(Boolean);
                              return (
                                <React.Fragment key={pIdx}>
                                  {subParas.map((para, spIdx) => (
                                    <p key={spIdx} className="leading-[1.85]">
                                      {renderTextWithLinks(para)}
                                    </p>
                                  ))}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}

                        {/* Hierarchical Subsections Model for Standard Sections (e.g. Affidavit Types, Rent Distinctions) */}
                        {Array.isArray(sec.subsections) && sec.subsections.length > 0 && (
                          <div className="mt-6 space-y-5">
                            {sec.subsections.map((sub, sIdx) => {
                              const isFirst = sIdx === 0;
                              return (
                                <div
                                  key={sIdx}
                                  className={`overflow-hidden rounded-2xl border ${
                                    isFirst
                                      ? "border-amber-400/80 bg-gradient-to-br from-white via-amber-50/20 to-slate-50/60 shadow-xs"
                                      : "border-slate-200/90 bg-white"
                                  } p-5 sm:p-6 shadow-xs transition hover:border-amber-400/60 hover:shadow-sm`}
                                >
                                  {/* Sub-heading Title Row */}
                                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-400 text-xs font-black shadow-xs">
                                      {sub.badge || String.fromCharCode(65 + sIdx)}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                                      {sub.title}
                                    </h3>
                                  </div>

                                  {/* Sub-heading Intro / Description */}
                                  {sub.intro && (
                                    <p className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-[1.85] font-normal">
                                      {renderTextWithLinks(sub.intro)}
                                    </p>
                                  )}

                                  {/* Sub-heading Bullets / Provisions */}
                                  {Array.isArray(sub.bullets) && sub.bullets.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {sub.bullets.map((bullet, bIdx) => {
                                        const colonIdx = bullet.indexOf(":");
                                        const hasColon = colonIdx !== -1 && colonIdx < 80;
                                        const bTitle = hasColon ? bullet.slice(0, colonIdx).trim() : "";
                                        const bDesc = hasColon ? bullet.slice(colonIdx + 1).trim() : bullet;

                                        return (
                                          <div
                                            key={bIdx}
                                            className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4 text-xs sm:text-sm transition hover:border-amber-300 hover:bg-amber-50/30"
                                          >
                                            {bTitle && (
                                              <span className="font-black mr-2 text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
                                                {bTitle}
                                              </span>
                                            )}
                                            <span className="text-slate-700 leading-relaxed font-normal">
                                              {renderTextWithLinks(bDesc)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {hasBullets && (() => {
                          const noteBullets = [];
                          const gridBullets = [];

                          sec.bullets.forEach((bullet) => {
                            if (/^(note|important|disclaimer|statutory note|please note|official references|official reference)\s*:/i.test(bullet.trim())) {
                              noteBullets.push(bullet);
                            } else {
                              gridBullets.push(bullet);
                            }
                          });

                          return (
                            <div className="mt-6 space-y-4">
                              {/* Standard checklist / criteria points */}
                              {gridBullets.length > 0 && (
                                <div className={`grid grid-cols-1 ${gridBullets.length > 1 ? "sm:grid-cols-2" : ""} gap-4`}>
                                  {gridBullets.map((bullet, bIdx) => {
                                    const colonIdx = bullet.indexOf(":");
                                    const hasColon = colonIdx !== -1 && colonIdx < 80;
                                    const rawTitle = hasColon ? bullet.slice(0, colonIdx).trim() : "";
                                    const title = rawTitle.replace(/^\d+(\.\d+)*\.\s*/, "").trim();
                                    const desc = hasColon ? bullet.slice(colonIdx + 1).trim() : bullet;

                                    return (
                                      <div
                                        key={bIdx}
                                        className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-amber-50/20 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-sm"
                                      >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 shadow-xs">
                                          <FiCheckCircle className="text-base font-black" />
                                        </div>
                                        <div className="pt-0.5 min-w-0 flex-1">
                                          {title && (
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1 leading-snug">
                                              {title}
                                            </h4>
                                          )}
                                          <p className={`text-xs sm:text-sm leading-relaxed ${title ? "text-slate-700 font-normal" : "font-semibold text-slate-800"}`}>
                                            {renderTextWithLinks(desc)}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Full-Width Executive Callout Card for Notes / Disclaimers / Official References */}
                              {noteBullets.map((noteText, nIdx) => {
                                const isRef = /^(official\s*reference|reference|official\s*references)/i.test(noteText.trim());
                                const cleanText = noteText.replace(/^(note|important|disclaimer|statutory note|please note|official references|official reference)\s*:\s*/i, "");

                                if (isRef) {
                                  return (
                                    <div
                                      key={nIdx}
                                      id="official-references"
                                      className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 shadow-2xs text-left"
                                    >
                                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/80">
                                        <FiBookOpen className="text-slate-600 text-sm shrink-0" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                          Official Statutory Reference
                                        </span>
                                      </div>
                                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                                        {renderTextWithLinks(cleanText)}
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={nIdx}
                                    className="w-full flex items-start gap-3.5 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/30 to-white p-4 sm:p-5 shadow-xs"
                                  >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                                      <FiInfo className="text-base font-bold" />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                      <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md mb-2">
                                        Important Note
                                      </span>
                                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                                        {renderTextWithLinks(cleanText)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </section>
                );
              })
            ) : (
              <>
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

                {/* Introduction Body Paragraphs with Curved / Rounded Accent Pill */}
                <div className="mt-5 flex items-stretch gap-4 sm:gap-5">
                  <div className="w-2 sm:w-2.5 shrink-0 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-xs ring-1 ring-amber-400/25 my-1" />
                  <div className="space-y-4 text-slate-700 font-normal text-sm sm:text-base leading-[1.8] tracking-normal">
                    {String(data.introduction?.summary || "")
                      .split("\n\n")
                      .filter(Boolean)
                      .map((para, pIdx) => (
                        <p key={pIdx} className="text-slate-700 leading-[1.8]">
                          {para}
                        </p>
                      ))}
                  </div>
                </div>
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 2: Objectives & Importance (PDF Point 2)
            ═════════════════════════════════════════════════════════════ */}
            {objectivesMeta && (
              <section
                id="objectives"
                className="scroll-mt-28 relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-2.5 text-amber-600 mb-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                    {objectivesMeta.badge}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                    {objectivesMeta.subtitle}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  {objectivesMeta.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                  Core statutory objectives, legal benefits, and evidentiary safeguards established under this matter:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    data.objectives ||
                    data.introduction?.highlights ||
                    []
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-amber-50/20 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-sm"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 shadow-xs">
                        <FiCheckCircle className="text-base font-black" />
                      </div>
                      <div className="pt-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                          {typeof item === "string" ? item : item.title || item.text}
                        </span>
                        {item.description && (
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed font-normal">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 3: Applicable Indian Laws (Dynamic Title & Readable Statute Layout)
            ═════════════════════════════════════════════════════════════ */}
            {lawsMeta && (
              <section
                id="applicable-laws"
                className="scroll-mt-28 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md"
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
                  Key statutory sections, regulatory provisions, and relief standards governing this legal matter:
                </p>

                {/* Unified Executive Statute Renderer (Marriage Certificate Layout for ALL services) */}
                {(() => {
                  const items =
                    Array.isArray(data.legalFramework?.sections) &&
                    data.legalFramework.sections.length > 0
                      ? data.legalFramework.sections
                      : Array.isArray(data.applicableLaws)
                      ? data.applicableLaws.map((law, idx) => ({
                          letter: String.fromCharCode(65 + idx),
                          title: law.act
                            ? law.title && law.title !== law.act
                              ? `${law.act} (${law.title})`
                              : law.act
                            : law.title,
                          section: law.section,
                          description: law.summary,
                          tag: law.tag,
                          bullets: law.bullets || [],
                          caseLaw: law.caseLaw,
                        }))
                      : [];

                  return (
                    <div className="mt-6 space-y-6">
                      {items.map((part, pIdx) => (
                        <div
                          key={pIdx}
                          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/40 p-5 sm:p-6 shadow-xs transition hover:border-amber-400/60 hover:shadow-sm"
                        >
                          {/* Sub-header row */}
                          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                            {part.letter && (
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-400 text-xs font-black shadow-xs">
                                {part.letter}
                              </span>
                            )}
                            <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                              {part.title}
                            </h3>
                            {part.tag && (
                              <span className="ml-auto inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                {part.tag}
                              </span>
                            )}
                          </div>

                          {/* Section / Statute reference */}
                          {part.section && (
                            <p className="mt-3 text-xs sm:text-sm font-bold text-amber-700">
                              {part.section}
                            </p>
                          )}

                          {/* Description paragraph if present */}
                          {part.description && (
                            <p className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                              {part.description}
                            </p>
                          )}

                          {/* Statutory bullet points with bold Section labels */}
                          {Array.isArray(part.bullets) && part.bullets.length > 0 && (
                            <div className="mt-4 space-y-3 pl-1 sm:pl-2">
                              {part.bullets.map((bullet, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed"
                                >
                                  <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500 mt-1.5 shadow-xs" />
                                  <div>
                                    {bullet.label && (
                                      <strong className="text-slate-950 font-bold mr-1.5">
                                        {bullet.label}:
                                      </strong>
                                    )}
                                    <span>{bullet.text || bullet}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Judicial Case Law / Supreme Court Precedent Callout */}
                          {part.caseLaw && (
                            <div className="mt-5 rounded-xl border border-amber-300/70 bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-4 shadow-xs">
                              <div className="flex items-center gap-2 text-xs font-black text-amber-900 mb-1.5">
                                <FaScaleBalanced className="text-amber-700 text-sm" />
                                <span>Landmark Judicial Precedent • {part.caseLaw.citation}</span>
                              </div>
                              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                {part.caseLaw.summary}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Top-Level Judicial Principles (e.g. Jacob Mathew from Advocate PDF) */}
                {data.legalFramework?.judicialPrinciples && (
                  <div className="mt-6 rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-amber-950 mb-2">
                      <FaScaleBalanced className="text-amber-700 text-base shrink-0" />
                      <span>
                        Judicial Principles •{" "}
                        {data.legalFramework.judicialPrinciples.caseName ||
                          data.legalFramework.judicialPrinciples.citation ||
                          "Landmark Judicial Precedent"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {data.legalFramework.judicialPrinciples.summary ||
                        data.legalFramework.judicialPrinciples}
                    </p>
                  </div>
                )}

                {/* Statutory Conclusion / Summary from Advocate PDF */}
                {data.conclusion && (
                  <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 shadow-xs">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      Conclusion & Legal Overview
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {data.conclusion}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 4: Documents Required (AUTO-HIDDEN IF NO DOCUMENTS)
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
                CONTENT-DRIVEN ADDITIONAL SECTIONS (Placed before Why Choose)
            ═════════════════════════════════════════════════════════════ */}
            {Array.isArray(data.additionalSections) &&
              data.additionalSections.map((sec, idx) => {
                const meta = getSectionMeta(`additional-${idx}`);
                if (!meta || !sec || !sec.heading) return null;

                const hasParagraphs = Array.isArray(sec.paragraphs) && sec.paragraphs.length > 0;
                const hasBullets = Array.isArray(sec.bullets) && sec.bullets.length > 0;
                if (!hasParagraphs && !hasBullets) return null;

                const secId =
                  sec.id ||
                  `section-${sec.heading
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")}`;

                return (
                  <section
                    key={idx}
                    id={secId}
                    className="scroll-mt-28 relative overflow-hidden rounded-3xl border border-slate-200/90 hover:border-amber-400/80 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-xs">
                        {meta.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                        {meta.title}
                      </h2>
                      {meta.subtitle && (
                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                          {meta.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Bullets (e.g. Essential Clause list) */}
                    {hasBullets && (
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {sec.bullets.map((bullet, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-amber-50/20 p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/80 hover:shadow-sm"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 shadow-xs mt-0.5">
                              <FiCheck className="text-sm font-black stroke-[3]" />
                            </div>
                            <div className="pt-0.5">
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                {bullet}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Paragraphs (e.g. Conclusion text) */}
                    {hasParagraphs && (
                      <div className="mt-6 space-y-4">
                        {sec.paragraphs.map((para, pIdx) => (
                          <div
                            key={pIdx}
                            className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 shadow-xs"
                          >
                            <p className="text-xs sm:text-sm text-slate-700 leading-[1.8] font-normal">
                              {para}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
              </>
            )}

            {/* ═════════════════════════════════════════════════════════════
                SECTION 5: Why Choose VakeelSetu
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
                CONSULTATION CTA BANNER (AUTO-HIDDEN IF NO CTA DATA)
            ═════════════════════════════════════════════════════════════ */}
            {data.consultationCta && data.consultationCta.headline && (
              <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#070b14] via-[#0d1424] to-[#121b33] p-6 sm:p-8 text-white shadow-xl">
                <div className="max-w-2xl">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {data.consultationCta.headline}
                  </h2>
                  {data.consultationCta.subheadline && (
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {data.consultationCta.subheadline}
                    </p>
                  )}
                  {Array.isArray(data.consultationCta.points) && data.consultationCta.points.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                      {data.consultationCta.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <FiCheck className="text-amber-400 shrink-0 font-bold" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenConsultation}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
                    >
                      <span>{data.consultationCta.primaryButtonText || "Consult an Advocate"}</span>
                      <FiArrowRight />
                    </button>
                    <Link
                      to="/find-lawyer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                    >
                      <span>{data.consultationCta.secondaryButtonText || "Explore Verified Lawyers"}</span>
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* ═════════════════════════════════════════════════════════════
                STATUTORY LEGAL DISCLAIMER (AUTO-HIDDEN IF ABSENT)
            ═════════════════════════════════════════════════════════════ */}
            {data.disclaimer && (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-100/60 p-4 sm:p-5 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
                <FiInfo className="text-slate-400 text-base shrink-0 mt-0.5" />
                <p className="text-[11.5px] leading-relaxed">
                  {data.disclaimer}
                </p>
              </div>
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

      {/* ═════════════════════════════════════════════════════════════
          FULL-PAGE WIDTH SECTION: FREQUENTLY ASKED QUESTIONS
          Placed directly below the Step-by-Step Legal Procedure!
      ═════════════════════════════════════════════════════════════ */}
      {faqsMeta && Array.isArray(data.faqs) && data.faqs.length > 0 && (
        <section
          id="faqs"
          className="scroll-mt-28 border-t border-slate-200/90 bg-slate-50/70 py-14 sm:py-16 shadow-xs"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 mb-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                  {faqsMeta.badge}
                </span>
                <span>{faqsMeta.subtitle}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {faqsMeta.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Clear answers regarding legal requirements, timelines, documentation, and advocate representation:
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
              <ServiceFaqAccordion faqs={data.faqs || []} />
            </div>
          </div>
        </section>
      )}

      {/* HIGH-END LEGAL CONSULTATION INTAKE SECTION */}
      <LegalServicesIntakeSection
        defaultCategory={data.categoryTitle}
        defaultServiceTitle={data.title}
      />
    </div>
  );
};

export default ServiceDetailPage;
