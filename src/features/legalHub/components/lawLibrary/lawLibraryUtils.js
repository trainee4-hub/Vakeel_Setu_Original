// Minimum characters needed to trigger search.
// Changed from 2 to 1 so that single-digit section searches (like "1", "2", "5") work properly.
export const MIN_SEARCH_LENGTH = 1;
export const SEARCH_DEBOUNCE_MS = 350;

export const ALL_CHAPTERS = "__all__";
export const NO_CHAPTER = "__none__";

export const cleanChapterNo = (val) => {
  if (val == null) return null;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") {
    return null;
  }
  return str;
};

export const cleanChapterName = (val) => {
  if (val == null) return null;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") {
    return null;
  }
  return str;
};

/**
 * Groups sections by chapterNo/chapterName preserving the exact sequence
 * returned by the API (no reordering or sorting).
 * A new group starts only when chapterNo or chapterName differs from the previous section.
 * When both chapterNo and chapterName are null, both fields are null.
 */
export function groupByChapter(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  const groups = [];
  let currentGroup = null;

  sections.forEach((section) => {
    const chapterNo = cleanChapterNo(section?.chapterNo);
    const chapterName = cleanChapterName(section?.chapterName);

    if (
      !currentGroup ||
      currentGroup.chapterNo !== chapterNo ||
      currentGroup.chapterName !== chapterName
    ) {
      currentGroup = {
        chapterNo,
        chapterName,
        sections: [section],
      };
      groups.push(currentGroup);
    } else {
      currentGroup.sections.push(section);
    }
  });

  return groups;
}

export const chapterLabel = (group) => {
  const chapterNo = cleanChapterNo(group?.chapterNo);
  const chapterName = cleanChapterName(group?.chapterName);

  if (!chapterNo && !chapterName) return null;
  if (!chapterNo) return chapterName;
  return chapterName
    ? `Chapter ${chapterNo} \u2013 ${chapterName}`
    : `Chapter ${chapterNo}`;
};

export const actTitle = (act) =>
  String(act?.heading || act?.act || "").trim() || "Untitled Act";

export const sectionLabel = (section) =>
  String(section?.section ?? "").trim();

/**
 * Flattens chapter groups into a continuous sequential reading order for an Act.
 * Preserves the exact sequence returned from the backend API.
 */
export function getSequentialSections(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  return [...sections];
}

/**
 * Parses a section number query or string into its numeric and letter parts.
 * Examples:
 *   "2" -> { full: "2", number: "2", letter: "" }
 *   "Section 2" -> { full: "2", number: "2", letter: "" }
 *   "sec 8" -> { full: "8", number: "8", letter: "" }
 *   "Section 28" -> { full: "28", number: "28", letter: "" }
 *   "28" -> { full: "28", number: "28", letter: "" }
 *   "2A" -> { full: "2a", number: "2", letter: "a" }
 *   "preliminary" -> null (text, not a section number)
 */
export function parseSectionNumber(str) {
  if (!str) return null;
  const cleaned = String(str)
    .trim()
    .replace(/^(?:section|sec|s\.|article|art|art\.|#)\s*/i, "")
    .trim();

  const match = cleaned.match(/^(\d+)[-_\s]*([a-zA-Z]*)$/i);
  if (match) {
    return {
      full: (match[1] + match[2]).toLowerCase(),
      number: match[1],
      letter: match[2]?.toLowerCase() || "",
    };
  }
  return null;
}

/**
 * Extracts parsed section number from a section object.
 */
export function getSectionParsed(sec) {
  if (!sec) return null;
  return (
    parseSectionNumber(sec.section) ||
    parseSectionNumber(String(sec.sectionOrder ?? "")) ||
    parseSectionNumber(sec.title)
  );
}

/**
 * Filters sections smartly:
 * 1. If searching an explicit chapter (e.g. "Chapter 4", "Chapter IV", "Ch 4A"):
 *    - Matches all sections in that chapter by string comparison.
 * 2. If searching a section/chapter number (e.g. "4", "2", "28", "2A", "Section 28"):
 *    - Matches exact section number OR exact chapter value (as strings).
 * 3. If searching a non-numeric chapter value (e.g. "IV", "4A", "IX-A"):
 *    - Matches exact chapter value (as strings).
 * 4. Keyword search across title, section label, description, and chapter metadata.
 */
export function filterSectionsSmart(sections = [], query = "") {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  const qTrim = String(query || "").trim();
  if (!qTrim) return [];

  const isExplicitChapter = /^(?:chapter|ch|ch\.)\s+/i.test(qTrim);
  const cleanChapterQuery = qTrim
    .replace(/^(?:chapter|ch|ch\.)\s*/i, "")
    .trim()
    .toLowerCase();

  if (isExplicitChapter && cleanChapterQuery) {
    const chapterMatches = sections.filter((sec) => {
      const cNo = cleanChapterNo(sec?.chapterNo);
      return cNo != null && cNo.toLowerCase() === cleanChapterQuery;
    });
    if (chapterMatches.length > 0) {
      return chapterMatches;
    }
  }

  const qLower = qTrim.toLowerCase();
  const qSec = parseSectionNumber(qTrim);

  if (qSec) {
    // Exact match on section number OR exact chapter value
    const exactMatches = sections.filter((sec) => {
      const sParsed = getSectionParsed(sec);
      const isSecMatch = sParsed && sParsed.full === qSec.full;
      const cNo = cleanChapterNo(sec?.chapterNo);
      const isChapMatch = cNo != null && cNo.toLowerCase() === qLower;
      return isSecMatch || isChapMatch;
    });

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Base number fallback (e.g. user typed "2" when act only has "2A")
    const baseMatches = sections.filter((sec) => {
      const sParsed = getSectionParsed(sec);
      return sParsed && sParsed.number === qSec.number;
    });

    if (baseMatches.length > 0) {
      return baseMatches;
    }
  } else {
    // Check for exact chapter value match (e.g. "IV", "IX-A")
    const chapterMatches = sections.filter((sec) => {
      const cNo = cleanChapterNo(sec?.chapterNo);
      return cNo != null && cNo.toLowerCase() === qLower;
    });

    if (chapterMatches.length > 0) {
      return chapterMatches;
    }
  }

  // Text keyword search
  return sections.filter((sec) => {
    const sStr = String(sec?.section || "").toLowerCase();
    const tStr = String(sec?.title || "").toLowerCase();
    const dStr = String(sec?.description || "").toLowerCase();
    const cNo = cleanChapterNo(sec?.chapterNo);
    const cNoLower = cNo ? cNo.toLowerCase() : "";
    const cName = cleanChapterName(sec?.chapterName);
    const cNameLower = cName ? cName.toLowerCase() : "";
    const cHeading = cNoLower ? `chapter ${cNoLower}` : "";

    return (
      sStr.includes(qLower) ||
      tStr.includes(qLower) ||
      dStr.includes(qLower) ||
      (cNoLower !== "" && cNoLower === qLower) ||
      (cHeading !== "" && cHeading.includes(qLower)) ||
      (cNameLower !== "" && cNameLower.includes(qLower))
    );
  });
}