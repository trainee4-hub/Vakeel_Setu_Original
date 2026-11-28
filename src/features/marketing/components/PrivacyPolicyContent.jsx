import React from "react";
import { privacyPdfBlocks } from "../data/privacyPdfBlocks";

/**
 * Renders the exact text from "PRIVACY POLICY vakeelsetu.pdf"
 * with copy and selection restrictions applied.
 */
const PrivacyPolicyContent = () => {
  return (
    <article
      className="font-sans text-slate-900 leading-relaxed max-w-none select-none"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none"
      }}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {privacyPdfBlocks.map((block, index) => {
        if (block.type === "title") {
          return (
            <div key={index} className="text-center mb-6 pb-4 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                {block.text}
              </h1>
            </div>
          );
        }

        if (block.type === "subtitle") {
          return (
            <div key={index} className="text-center mb-2">
              <p className="text-base sm:text-lg font-semibold text-slate-900 whitespace-pre-line">
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "meta") {
          return (
            <div key={index} className="text-center mb-8 pb-4 border-b border-slate-100">
              <p className="text-xs sm:text-sm font-medium text-slate-500 whitespace-pre-line">
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "section") {
          return (
            <h2
              key={index}
              className="text-base sm:text-lg font-bold text-slate-950 mt-8 mb-3"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "subheading") {
          return (
            <h3
              key={index}
              className="text-sm sm:text-base font-semibold text-slate-900 mt-5 mb-2"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "bullet") {
          return (
            <div key={index} className="flex items-start gap-2.5 my-2 pl-2 sm:pl-3">
              <span className="shrink-0 text-slate-900 font-bold">•</span>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-800">
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "contact") {
          return (
            <div
              key={index}
              className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-sm sm:text-[15px] leading-relaxed text-slate-800"
            >
              <div className="space-y-1.5">
                {block.lines.map((item, lIdx) => (
                  <div key={lIdx} className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-semibold text-slate-900 min-w-[140px]">
                      {item.label}:
                    </span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "acknowledgement") {
          return (
            <div
              key={index}
              className="mt-8 pt-5 border-t border-slate-200 text-sm sm:text-[15px] italic text-slate-700 leading-relaxed"
            >
              <p>{block.text}</p>
            </div>
          );
        }

        return (
          <p
            key={index}
            className="my-3 text-sm sm:text-[15px] leading-7 text-slate-800 whitespace-pre-line"
          >
            {block.text}
          </p>
        );
      })}
    </article>
  );
};

export default PrivacyPolicyContent;
