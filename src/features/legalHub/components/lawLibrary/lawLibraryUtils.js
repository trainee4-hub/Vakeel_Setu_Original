// Minimum characters needed to trigger search.
// Changed from 2 to 1 so that single-digit section searches (like "1", "2", "5") work properly.
export const MIN_SEARCH_LENGTH = 1;
export const SEARCH_DEBOUNCE_MS = 350;

export const ALL_CHAPTERS = "__all__";

/** Sections order inside a chapter must follow the act, not the label. */
const naturalCompare = (a, b) =>
  String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });

/**
 * Groups sections by chapterNo, preserving the order the backend returned
 * them in. Sections with no chapter fall into one trailing group — never
 * invented chapter IDs, never a fabricated label.
 */ 
export function groupByChapter(sections = []) {
  const map = new Map();

  sections.forEach((section) => {
    const key =
      String(section?.chapterNo ?? "").trim() || ALL_CHAPTERS;

    if (!map.has(key)) {
      map.set(key, {
        chapterNo: key === ALL_CHAPTERS ? null : section.chapterNo,
        chapterName: String(section?.chapterName ?? "").trim() || null,
        sections: [],
      });
    }

    map.get(key).sections.push(section);
  });

  const groups = [...map.values()];

  const unchaptered = groups.filter((group) => group.chapterNo === null);
  const chaptered = groups
    .filter((group) => group.chapterNo !== null)
    .sort((a, b) => naturalCompare(a.chapterNo, b.chapterNo));

  return [...chaptered, ...unchaptered];
}

export const chapterLabel = (group) => {
  if (!group?.chapterNo) return "Other Sections";
  return group.chapterName
    ? `Chapter ${group.chapterNo} — ${group.chapterName}`
    : `Chapter ${group.chapterNo}`;
};

export const actTitle = (act) =>
  String(act?.heading || act?.act || "").trim() || "Untitled Act";

export const sectionLabel = (section) =>
  String(section?.section ?? "").trim();

/**
 * Flattens chapter groups into a continuous sequential reading order for an Act.
 * Preserves the exact chapter hierarchy (Chapter 1 -> Chapter 2 -> Chapter 3...)
 * and orders sections naturally within each chapter.
 */
export function getSequentialSections(sections = []) {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  const groups = groupByChapter(sections);
  const sequential = [];
  groups.forEach((group) => {
    const sorted = [...group.sections].sort((a, b) => {
      const orderA = a?.sectionOrder !== undefined && a?.sectionOrder !== null ? Number(a.sectionOrder) : NaN;
      const orderB = b?.sectionOrder !== undefined && b?.sectionOrder !== null ? Number(b.sectionOrder) : NaN;
      if (Number.isFinite(orderA) && Number.isFinite(orderB)) {
        return orderA - orderB;
      }
      return naturalCompare(a?.section || a?.title, b?.section || b?.title);
    });
    sequential.push(...sorted);
  });
  return sequential;
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
    .replace(/^(?:section|sec|s\.|article|art|art\.|\#)\s*/i, "")
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
 * 1. If searching a section number (e.g. "2", "8", "28", "2A", "Section 28"):
 *    - Matches EXACT section number (so "2" only gives Section 2, not 12, 20, 21, 28!).
 *    - Searching "8" only gives Section 8 (not 18, 28, 38!).
 *    - Searching "28" gives Section 28.
 *    - If no exact match (e.g. searched "2" and act only has "2A"), matches base number.
 * 2. If searching a text keyword (e.g. "power of state", "lok adalat", "rules"):
 *    - Performs normal text matching across title, section label, and description.
 */
export function filterSectionsSmart(sections = [], query = "") {
  if (!Array.isArray(sections) || sections.length === 0) return [];
  const qTrim = String(query || "").trim();
  if (!qTrim) return [];

  const qSec = parseSectionNumber(qTrim);

  if (qSec) {
    // Exact match on section number (e.g. "2" === "2", "28" === "28", "2a" === "2a")
    const exactMatches = sections.filter((sec) => {
      const sParsed = getSectionParsed(sec);
      return sParsed && sParsed.full === qSec.full;
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
  }

  // Text keyword search
  const qLower = qTrim.toLowerCase();
  return sections.filter((sec) => {
    const sStr = String(sec?.section || "").toLowerCase();
    const tStr = String(sec?.title || "").toLowerCase();
    const dStr = String(sec?.description || "").toLowerCase();
    return (
      sStr.includes(qLower) ||
      tStr.includes(qLower) ||
      dStr.includes(qLower)
    );
  });
}