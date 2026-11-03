import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { FaScaleBalanced } from "react-icons/fa6";

import { LEGAL_SERVICES_CATEGORIES } from "../data/legalServicesCatalogue";

// Multi-color dynamic themes cycling across cards on hover (Point 4)
const MEGA_CARD_THEMES = [
  {
    // 0: Amber / Luxury Gold
    hoverBorder: "hover:border-amber-400",
    hoverShadow: "hover:shadow-amber-500/15",
    hoverTitle: "group-hover:text-amber-800",
    accentBar: "group-hover:before:bg-amber-500",
    arrowColor: "text-amber-500",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200/80",
    badgeText: "text-amber-800",
  },
  {
    // 1: Royal Blue / Cobalt
    hoverBorder: "hover:border-blue-500",
    hoverShadow: "hover:shadow-blue-500/15",
    hoverTitle: "group-hover:text-blue-800",
    accentBar: "group-hover:before:bg-blue-500",
    arrowColor: "text-blue-500",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200/80",
    badgeText: "text-blue-800",
  },
  {
    // 2: Emerald Green
    hoverBorder: "hover:border-emerald-500",
    hoverShadow: "hover:shadow-emerald-500/15",
    hoverTitle: "group-hover:text-emerald-800",
    accentBar: "group-hover:before:bg-emerald-500",
    arrowColor: "text-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200/80",
    badgeText: "text-emerald-800",
  },
  {
    // 3: Purple / Violet
    hoverBorder: "hover:border-purple-500",
    hoverShadow: "hover:shadow-purple-500/15",
    hoverTitle: "group-hover:text-purple-800",
    accentBar: "group-hover:before:bg-purple-500",
    arrowColor: "text-purple-500",
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200/80",
    badgeText: "text-purple-800",
  },
  {
    // 4: Rose / Crimson
    hoverBorder: "hover:border-rose-500",
    hoverShadow: "hover:shadow-rose-500/15",
    hoverTitle: "group-hover:text-rose-800",
    accentBar: "group-hover:before:bg-rose-500",
    arrowColor: "text-rose-500",
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-200/80",
    badgeText: "text-rose-800",
  },
  {
    // 5: Teal / Cyan
    hoverBorder: "hover:border-teal-500",
    hoverShadow: "hover:shadow-teal-500/15",
    hoverTitle: "group-hover:text-teal-800",
    accentBar: "group-hover:before:bg-teal-500",
    arrowColor: "text-teal-500",
    badgeBg: "bg-teal-50",
    badgeBorder: "border-teal-200/80",
    badgeText: "text-teal-800",
  },
];

const LegalServicesMegaMenu = ({ navItemClass, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const timeoutRef = useRef(null);
  const location = useLocation();
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Close when pathname changes (official React pattern for previous render state)
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsOpen(false);
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const activeCategory = LEGAL_SERVICES_CATEGORIES[activeCategoryIdx] || LEGAL_SERVICES_CATEGORIES[0];
  const isCurrentActive = Boolean(isActive && isActive("/legal-services"));

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navbar Trigger Button: Updated to "Services" (Point 1) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`${navItemClass("/legal-services")} flex items-center gap-1.5 font-semibold transition-all duration-200 ${
          isOpen ? "text-amber-600 bg-amber-50/80" : ""
        } ${isCurrentActive ? "text-amber-600 font-bold" : ""}`}
      >
        <span>Services</span>
        <IoChevronDownIcon
          className={`text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-600" : "text-slate-400"
          }`}
        />
      </button>

      {/* Centered Mega Panel (Points 2, 3: Luxury, Modern, Animated) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Services Mega Menu"
          className="fixed left-1/2 -translate-x-1/2 top-[76px] z-[250] w-[1080px] max-w-[calc(100vw-32px)] animate-in fade-in slide-in-from-top-3 duration-300 ease-out"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_30px_90px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            {/* Mega Panel Body - Exactly 560px height so all 11 categories fit cleanly */}
            <div className="flex h-[560px]">
              {/* LEFT COLUMN: 11 Categories (fixed order 01 to 11) - NON-SCROLLABLE */}
              <div
                className="w-[340px] shrink-0 border-r border-slate-100 bg-slate-50/90 p-3 overflow-hidden flex flex-col justify-between"
                role="tablist"
                aria-label="Legal categories"
              >
                {LEGAL_SERVICES_CATEGORIES.map((cat, idx) => {
                  const isSelected = activeCategoryIdx === idx;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveCategoryIdx(idx)}
                      onClick={() => setActiveCategoryIdx(idx)}
                      className={`group flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-900/15 translate-x-1"
                          : "text-slate-700 hover:bg-white hover:text-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all duration-200 ${
                            isSelected
                              ? "bg-amber-500 text-slate-950 shadow-xs"
                              : "bg-slate-200/70 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800"
                          }`}
                        >
                          {cat.number}
                        </span>
                        <span className="text-[13px] sm:text-sm font-semibold truncate leading-tight">
                          {cat.title}
                        </span>
                      </div>
                      <FiChevronRight
                        className={`text-sm shrink-0 transition-transform duration-200 ${
                          isSelected
                            ? "text-amber-400 translate-x-1"
                            : "text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* RIGHT COLUMN: Modern Legal Service Cards with Generous Padding & Multi-Color Borders (Points 3 & 4) */}
              <div className="flex-1 p-7 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-white to-slate-50/40 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {/* Category Header Bar */}
                <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
                      <FaScaleBalanced className="text-sm" />
                    </div>
                    <h3 className="text-xl font-black text-slate-950 tracking-tight">
                      {activeCategory.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 border border-slate-200/70 px-3.5 py-1 text-xs font-bold text-slate-700 shadow-2xs">
                    {activeCategory.services.length} Services
                  </span>
                </div>

                {/* 2-Column Grid of Modern Cards with Generous Padding & Multi-Color Borders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCategory.services.map((svc, sIdx) => {
                    const theme = MEGA_CARD_THEMES[sIdx % MEGA_CARD_THEMES.length];

                    return (
                      <Link
                        key={svc.slug}
                        to={`/legal-services/${activeCategory.slug}/${svc.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 ${theme.hoverBorder} hover:shadow-xl ${theme.hoverShadow} before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-full before:bg-transparent ${theme.accentBar} before:transition-all before:duration-300 group-hover:before:w-1.5`}
                      >
                        <div>
                          {/* Title Row with Verified Pill and Multi-Color Hover Arrow */}
                          <div className="flex items-start justify-between gap-2.5">
                            <h4
                              className={`text-sm sm:text-[14.5px] font-black text-slate-900 ${theme.hoverTitle} transition-colors duration-200 leading-snug tracking-tight`}
                            >
                              {svc.title}
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              {svc.isSampleFullPage && (
                                <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                                  Verified
                                </span>
                              )}
                              <FiArrowRight
                                className={`${theme.arrowColor} text-base opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out`}
                              />
                            </div>
                          </div>

                          {/* Summary Description with Generous Spacing */}
                          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                            {svc.summary}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IoChevronDownIcon = ({ className = "" }) => (
  <svg
    className={`h-4 w-4 fill-current ${className}`}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export default LegalServicesMegaMenu;
