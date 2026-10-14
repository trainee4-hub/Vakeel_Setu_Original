import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiX,
  FiChevronRight,
  FiFileText,
  FiGrid,
} from "react-icons/fi";
import { FaGavel } from "react-icons/fa";

import { searchLibrary } from "../../services/bareActsApi";
import {
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
  actTitle,
} from "./lawLibraryUtils";

const TYPE_META = {
  BEARER_ACT: {
    label: "Category",
    Icon: FiGrid,
  },
  ACT: {
    label: "Act",
    Icon: FaGavel,
  },
  SECTION: {
    label: "Section",
    Icon: FiFileText,
  },
};

/** Where a result sends the user; null means we cannot route it safely. */
const resultPath = (item) => {
  if (item?.type === "BEARER_ACT" && item?.bearerAct?.id) {
    return `/legal-hub/law-library/acts?category=${encodeURIComponent(
      item.bearerAct.id,
    )}`;
  }

  if (item?.type === "ACT" && item?.act?.id) {
    return `/legal-hub/law-library/acts/${encodeURIComponent(
      item.act.id,
    )}`;
  }

  if (
    item?.type === "SECTION" &&
    item?.act?.id &&
    item?.section?.id
  ) {
    return `/legal-hub/law-library/acts/${encodeURIComponent(
      item.act.id,
    )}/sections/${encodeURIComponent(item.section.id)}`;
  }

  return null;
};

const resultTitle = (item) => {
  if (item?.type === "BEARER_ACT") {
    return item.bearerAct?.name || "Category";
  }

  if (item?.type === "ACT") {
    return actTitle(item.act);
  }

  const number = String(item?.section?.section ?? "").trim();
  const title = item?.section?.title || "Section";

  return number ? `Section ${number} — ${title}` : title;
};

const resultContext = (item) => {
  if (item?.type === "BEARER_ACT") {
    return null;
  }

  if (item?.type === "ACT") {
    return item.bearerAct?.name || null;
  }

  return actTitle(item?.act);
};

export default function LawLibrarySearch({
  placeholder,
  autoFocus = false,
}) {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  /* Only the newest request may write state. */
  const requestIdRef = useRef(0);

  const trimmed = input.trim();
  const active = trimmed.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!active) {
      setResults([]);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const timer = setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      const isCurrent = () =>
        requestIdRef.current === requestId;

      setLoading(true);
      setError(null);

      searchLibrary({
        q: trimmed,
        page: 1,
        limit: 20,
      })
        .then((result) => {
          if (!isCurrent()) return;

          setResults(result.results);
          setOpen(true);
        })
        .catch((err) => {
          if (!isCurrent()) return;

          if (import.meta.env?.DEV) {
            console.error(
              "[LawLibrary] global search failed:",
              err,
            );
          }

          setResults([]);
          setError("Search is unavailable right now.");
          setOpen(true);
        })
        .finally(() => {
          if (isCurrent()) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed, active]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        onClickOutside,
      );
  }, []);

  const go = (item) => {
    const path = resultPath(item);

    if (!path) return;

    setOpen(false);
    setInput("");
    navigate(path);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full max-w-2xl"
    >
      <label
        htmlFor="law-library-search"
        className="sr-only"
      >
        Search the Law Library
      </label>

      {/* Search Input */}
      <div className="flex min-h-[56px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
        <FiSearch
          className="shrink-0 text-[20px] text-slate-400"
          aria-hidden="true"
        />

        <input
          id="law-library-search"
          type="text"
          value={input}
          autoFocus={autoFocus}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onFocus={() => active && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={
            placeholder ||
            "Search categories, acts and sections..."
          }
          className="min-w-0 flex-1 border-0 bg-transparent py-3.5 text-sm font-medium text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />

        {/* Loading Spinner */}
        {loading && (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-200 border-t-amber-500" />
        )}

        {/* Clear Search */}
        {input && !loading && (
          <button
            type="button"
            onClick={() => setInput("")}
            aria-label="Clear search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX
              className="text-[18px]"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Minimum Search Length */}
      {input && !active && (
        <p className="mt-2 px-1 text-xs text-slate-400">
          Type at least {MIN_SEARCH_LENGTH} character to search.
        </p>
      )}

      {/* Search Results */}
      {open && active && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[380px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
          {error ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              {error}
            </p>
          ) : loading && results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-400">
              Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500">
              No matches for &ldquo;{trimmed}&rdquo;.
            </p>
          ) : (
            results.map((item, index) => {
              const meta =
                TYPE_META[item?.type] ||
                TYPE_META.SECTION;

              const Icon = meta.Icon;
              const path = resultPath(item);
              const context = resultContext(item);

              /* An item we cannot route is not clickable rather than broken. */
              if (!path) return null;

              return (
                <button
                  key={`${item.type}-${index}`}
                  type="button"
                  onClick={() => go(item)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-amber-50"
                >
                  {/* Result Type Icon */}
                  <Icon
                    className="mt-0.5 shrink-0 text-[19px] text-amber-600"
                    aria-hidden="true"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      {meta.label}
                    </span>

                    <span className="mt-0.5 block truncate text-sm font-bold text-slate-900">
                      {resultTitle(item)}
                    </span>

                    {context && (
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {context}
                      </span>
                    )}
                  </span>

                  <FiChevronRight
                    className="mt-0.5 shrink-0 text-[20px] text-slate-300"
                    aria-hidden="true"
                  />
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}