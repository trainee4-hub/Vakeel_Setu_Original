import React from "react";
import { cleanAnswerText, renderInlineMarkdown } from "../utils/legalAssistantUtils";

export const FormattedLegalMessage = ({ text }) => {
  if (!text) return null;
  const cleaned = cleanAnswerText(text);
  const lines = cleaned.split('\n');

  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    // Empty line
    if (!line) {
      flushList();
      elements.push(<div key={`spacer-${idx}`} className="h-2" />);
      return;
    }

    // Divider
    if (/^[-*_]{3,}$/.test(line)) {
      flushList();
      elements.push(<hr key={`hr-${idx}`} className="my-3 border-t border-slate-200" />);
      return;
    }

    // Markdown Heading (# or ## or ###) or Standalone bold line (**Heading**)
    const headingMatch = /^#{1,4}\s+(.+)$/.exec(line);
    const standaloneBold = /^\*\*([^*]+)\*\*[:\s]*$/.exec(line);

    if (headingMatch || standaloneBold) {
      flushList();
      const title = (headingMatch ? headingMatch[1] : standaloneBold[1]).trim();
      elements.push(
        <div key={`heading-${idx}`} className="mt-4 mb-2 pt-1 border-b border-amber-200/50 pb-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-amber-500 shrink-0" />
            <h4 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              {title}
            </h4>
          </div>
        </div>
      );
      return;
    }

    // Prefix bold with details: e.g. **विषय:** या **Subject:** या **फरियादी:**
    const prefixBold = /^\*\*([^*]+)\*\*:\s*(.+)$/.exec(line);
    if (prefixBold) {
      flushList();
      const title = prefixBold[1].trim();
      const body = prefixBold[2].trim();
      const isSubject = title.includes('विषय') || title.toLowerCase().includes('subject');
      elements.push(
        <div
          key={`prefix-${idx}`}
          className={`my-2 p-3 rounded-xl border text-sm ${
            isSubject
              ? 'bg-amber-50/80 border-amber-200/80 shadow-xs'
              : 'bg-slate-50 border-slate-200/70'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className={`font-bold shrink-0 ${isSubject ? 'text-amber-950' : 'text-slate-900'}`}>
              {title}:
            </span>
            <span className="text-slate-800 leading-relaxed">
              {renderInlineMarkdown(body)}
            </span>
          </div>
        </div>
      );
      return;
    }

    // Bullet point: - item or * item or • item
    const bulletMatch = /^[-*•]\s+(.+)$/.exec(line);
    if (bulletMatch) {
      listItems.push(
        <li key={`bullet-${idx}`} className="flex items-start gap-2 text-sm text-slate-800 leading-relaxed">
          <span className="text-amber-500 font-bold select-none text-base leading-none mt-0.5">•</span>
          <div className="flex-1">{renderInlineMarkdown(bulletMatch[1])}</div>
        </li>
      );
      return;
    }

    // Numbered item: 1. item or (1) item
    const numberedMatch = /^(\d+[.)]|\([0-9a-zA-Z]\))\s+(.+)$/.exec(line);
    if (numberedMatch) {
      flushList();
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2.5 my-1.5 text-sm text-slate-800 leading-relaxed">
          <span className="inline-flex items-center justify-center font-bold text-xs text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded shrink-0 select-none">
            {numberedMatch[1]}
          </span>
          <div className="flex-1">{renderInlineMarkdown(numberedMatch[2])}</div>
        </div>
      );
      return;
    }

    // Normal paragraph line
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="text-sm text-slate-800 leading-relaxed my-0.5">
        {renderInlineMarkdown(line)}
      </p>
    );
  });

  flushList();
  return <div className="space-y-0.5 notranslate" translate="no">{elements}</div>;
};

export default FormattedLegalMessage;
