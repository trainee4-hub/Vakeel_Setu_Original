import React, { useEffect, useState } from "react";
import { FiChevronRight, FiList } from "react-icons/fi";

const TableOfContents = ({ toc = [], className = "" }) => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = toc.length - 1; i >= 0; i--) {
        const item = toc[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(item.id);
          return;
        }
      }
      if (toc.length > 0) {
        setActiveId(toc[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
    }
  };

  if (!toc || toc.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={`rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
        <FiList className="text-amber-600 text-sm" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          On This Page
        </h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">
          {toc.length} sections
        </span>
      </div>

      <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1 text-xs">
        {toc.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className={`group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-amber-50 font-bold text-amber-900 border-l-3 border-amber-500 pl-2"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`text-[10px] font-black shrink-0 ${
                    isActive ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{item.title.replace(/^\d+\.\s*/, "")}</span>
              </div>
              <FiChevronRight
                className={`text-xs shrink-0 transition-transform ${
                  isActive
                    ? "text-amber-600 translate-x-0.5"
                    : "text-slate-300 opacity-0 group-hover:opacity-100"
                }`}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default TableOfContents;
