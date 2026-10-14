import { useMemo } from "react";
import { looksLikeHtml, sanitizeRichHtml } from "../../utils/richText";

/**
 * Safe renderer for CMS content on public pages.
 *   - HTML (rich editor output) → sanitised, then rendered as formatted markup
 *   - legacy plain text          → rendered as text, line breaks preserved
 * Never renders unsanitised HTML.
 */
export default function RichContent({ value, className = "", as: Tag = "div" }) {
  const html = useMemo(() => (looksLikeHtml(value) ? sanitizeRichHtml(value) : null), [value]);

  if (value === null || value === undefined || !String(value).trim()) return null;

  if (html === null) {
    return <Tag className={`whitespace-pre-line ${className}`}>{value}</Tag>;
  }

  return <Tag className={`vs-rich-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}