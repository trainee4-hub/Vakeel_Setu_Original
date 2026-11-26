import React from "react";
import { termsPdfBlocks } from "../data/termsPdfBlocks";

/**
 * Renders the exact text from "Terms and conditions of Vakeel Setu legal tech platform.pdf"
 * with copy and selection restrictions applied.
 */
const TermsAndConditionsContent = () => {
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
      {termsPdfBlocks.map((block, index) => {
        if (block.type === "title") {
          return (
            <h1
              key={index}
              className="text-2xl sm:text-3xl font-bold text-slate-950 mb-6 pb-2 border-b border-slate-200"
            >
              {block.text}
            </h1>
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
              className="text-sm sm:text-base font-bold text-slate-900 mt-5 mb-2"
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

export default TermsAndConditionsContent;
