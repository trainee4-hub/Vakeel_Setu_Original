import DOMPurify from "dompurify";

/* =========================================================================
   RICH TEXT HELPERS — shared by the Content Creator editor and the public
   Legal Hub.

   Content is stored as an HTML string in the SAME API fields as before
   (content, description, paragraph, …). Older records may still hold plain
   text; every helper here accepts both.
   ========================================================================= */

/* Known formatting tags only, so plain text like "a <b c" or "<para>" stays text. */
const HTML_PATTERN =
  /<\/?(p|br|h[1-6]|strong|b|em|i|u|s|strike|del|sup|sub|span|a|ul|ol|li|blockquote|code|pre|hr|div)(\s[^>]*)?\/?>/i;

/** True when the string contains HTML markup (vs. legacy plain text). */
export function looksLikeHtml(value) {
  return typeof value === "string" && HTML_PATTERN.test(value);
}

export function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Legacy plain text → paragraphs (blank line) and line breaks (single newline). */
export function plainTextToHtml(text) {
  const source = String(text ?? "").replace(/\r\n?/g, "\n").trim();
  if (!source) return "";
  return source
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** What the editor should load: HTML as-is, plain text converted. */
export function toEditorHtml(value) {
  if (!value) return "";
  return looksLikeHtml(value) ? value : plainTextToHtml(value);
}

const BLOCK_BOUNDARY = /<\/(p|h[1-6]|li|blockquote|pre|div|tr)>|<br\s*\/?>|<hr\s*\/?>/gi;

const ENTITIES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/** Readable plain text for previews, counters and "is it empty?" checks. */
export function richTextToPlain(value) {
  if (!value) return "";
  const source = String(value);
  if (!looksLikeHtml(source)) return source.replace(/\s+/g, " ").trim();

  const spaced = source.replace(BLOCK_BOUNDARY, "$& ");

  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    // DOMParser builds an inert document: nothing in it runs or loads.
    const doc = new window.DOMParser().parseFromString(spaced, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  return spaced
    .replace(/<[^>]*>/g, "")
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (match) => ENTITIES[match] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

/** "<p></p>", "<p><br></p>", "<h2> </h2>" → false. */
export function hasRichText(value) {
  return richTextToPlain(value).length > 0;
}


/** Plain-text preview for cards and list rows, cut at a word boundary. */
export function richTextExcerpt(value, maxLength = 160) {
  const text = richTextToPlain(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

/* ------------------------------ SANITIZER ------------------------------ */

const ALLOWED_TAGS = [
  "p", "br", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "del",
  "sup", "sub", "span", "a",
  "ul", "ol", "li", "blockquote", "code", "pre", "hr",
];

const ALLOWED_ATTR = ["href", "target", "rel", "style", "start"];

/* Only the inline styles the editor itself produces. */
const ALLOWED_STYLES = {
  "text-align": /^(left|right|center|justify)$/i,
  "font-size": /^\d{1,2}(\.\d+)?(px|rem|em)$/i,
  "font-family": /^[a-z0-9 ,'"-]{1,120}$/i,
};

function filterStyle(style) {
  return String(style)
    .split(";")
    .map((declaration) => {
      const index = declaration.indexOf(":");
      if (index === -1) return null;
      const property = declaration.slice(0, index).trim().toLowerCase();
      const value = declaration.slice(index + 1).trim();
      const rule = ALLOWED_STYLES[property];
      return rule && rule.test(value) ? `${property}: ${value}` : null;
    })
    .filter(Boolean)
    .join("; ");
}

let purifier = null;

function getPurifier() {
  if (purifier || typeof window === "undefined") return purifier;

  purifier = DOMPurify(window); // private instance — hooks don't leak app-wide

  purifier.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName === "style") {
      const safe = filterStyle(data.attrValue);
      if (safe) data.attrValue = safe;
      else data.keepAttr = false;
    }
  });

  // purifier.addHook("afterSanitizeAttributes", (node) => {
  //   if (node.tagName === "A" && node.getAttribute("href")) {
  //     node.setAttribute("target", "_blank");
  //     node.setAttribute("rel", "noopener noreferrer nofollow");
  //   }
  // });

  purifier.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName !== "A") return;

  const href = node.getAttribute("href");

  if (!href) return;

  const safeHref =
    /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);

  if (!safeHref) {
    node.removeAttribute("href");
    node.removeAttribute("target");
    node.removeAttribute("rel");
    return;
  }

  node.setAttribute("target", "_blank");
  node.setAttribute("rel", "noopener noreferrer nofollow");
});

  return purifier;
}

/**
 * Removes scripts, event handlers, javascript: URLs, iframes, forms and any
 * style other than alignment / font size / font family. Formatting survives.
 * Returns "" when no DOM is available (the page is client-rendered anyway).
 */
export function sanitizeRichHtml(html) {
  const instance = getPurifier();
  if (!instance || !html) return "";
  return instance.sanitize(String(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}