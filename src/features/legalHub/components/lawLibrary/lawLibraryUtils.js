// Minimum characters needed to trigger search.
// Changed from 2 to 1 so that single-digit section searches (like "1", "2", "5") work properly.
export const MIN_SEARCH_LENGTH = 1;
export const SEARCH_DEBOUNCE_MS = 350;

export const ALL_CHAPTERS = "__all__";



/**
 * Groups sections by chapterNo, preserving the order the backend returned
 * them in. Sections with no chapter fall into one trailing group — never
 * invented chapter IDs, never a fabricated label.
 */ 
export function groupByChapter(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) return [];

  const groups = [];
  let currentGroup = null;

  sections.forEach((section) => {
    const rawNo = section?.chapterNo;
    const chapterNo =
      rawNo != null && String(rawNo).trim() !== ""
        ? String(rawNo).trim()
        : null;

    const rawName = section?.chapterName;
    const chapterName =
      rawName != null && String(rawName).trim() !== ""
        ? String(rawName).trim()
        : null;

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
  const rawNo = group?.chapterNo;
  const hasChapterNo = rawNo != null && String(rawNo).trim() !== "";
  const chapterNo = hasChapterNo ? String(rawNo).trim() : null;
  const chapterName = String(group?.chapterName ?? "").trim();

  if (!chapterNo) return chapterName || "Other Sections";
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
      const cNo = String(sec?.chapterNo ?? "").trim().toLowerCase();
      return cNo !== "" && cNo === cleanChapterQuery;
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
      const cNo = String(sec?.chapterNo ?? "").trim().toLowerCase();
      const isChapMatch = cNo !== "" && cNo === qLower;
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
      const cNo = String(sec?.chapterNo ?? "").trim().toLowerCase();
      return cNo !== "" && cNo === qLower;
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
    const cNo = String(sec?.chapterNo ?? "").trim().toLowerCase();
    const cName = String(sec?.chapterName ?? "").toLowerCase();
    const cHeading = cNo ? `chapter ${cNo}` : "";

    return (
      sStr.includes(qLower) ||
      tStr.includes(qLower) ||
      dStr.includes(qLower) ||
      (cNo !== "" && cNo === qLower) ||
      (cHeading !== "" && cHeading.includes(qLower)) ||
      cName.includes(qLower)
    );
  });
}