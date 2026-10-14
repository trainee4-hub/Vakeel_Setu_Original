import React from "react";

import { SECTION_LINKS } from "../utils/advocateProfileUtils";

/**
 * Sticky in-page table of contents. Pure anchor links + native browser
 * scrolling; the only state is the active-link highlight, which the container
 * derives from an IntersectionObserver.
 *
 * The "similar" link is skipped when there are no similar advocates, since
 * that anchor target isn't rendered in that case.
 */
export default function ProfileSectionNav({ activeSection, hasSimilarAdvocates }) {
  const links = SECTION_LINKS.filter(
    (link) => link.id !== "similar" || hasSimilarAdvocates,
  );

  return (
    <div
      className="
        sticky top-0 z-30
        flex items-center gap-1
        overflow-x-auto
        rounded-b-lg
        border-t border-slate-200
        bg-white/90 backdrop-blur-md
        px-2
        shadow-sm
        no-scrollbar
      "
    >
      {links.map((link) => {
        const isActive = activeSection === link.id;

        return (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={`
              relative shrink-0 px-4 py-3 text-sm font-semibold
              transition-all duration-300 ease-out
              hover:text-amber-600
              after:absolute after:left-3 after:right-3 after:bottom-1.5
              after:h-[2px] after:rounded-full
              after:bg-amber-500
              after:origin-center
              after:transition-transform
              after:duration-300
              ${
                isActive
                  ? "text-amber-700 after:scale-x-100"
                  : "text-slate-500 after:scale-x-0 hover:after:scale-x-100"
              }
            `}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
