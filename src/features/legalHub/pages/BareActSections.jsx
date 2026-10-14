import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import RichContent from "@shared/components/ui/RichContent";
import { hasRichText, richTextExcerpt } from "@shared/utils/richText";


import {
  getBareActSectionById,
  getBareActSections,
  searchBareActSections,
} from "../services/bareActsApi";
import { findBareAct } from "../utils/bareActsConfig";

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 350;

const EMPTY_PAGINATION = {
  currentPage: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

/* Tolerant readers — the exact field names on a law section were not
   supplied, so nothing is assumed beyond what is actually present. */
const sectionNumber = (section) =>
  section?.sectionNo ?? section?.sectionNumber ?? section?.section ?? "";

const sectionHeading = (section) =>
  section?.heading ?? section?.title ?? "Untitled section";

const sectionBodies = (section) =>
  [
    { key: "paragraph", label: null, text: section?.paragraph },
    { key: "explanation", label: "Explanation", text: section?.explanation },
    { key: "content", label: "Details", text: section?.content },
  ].filter((entry) => hasRichText(entry.text));

const BareActSections = () => {
  const { lawType } = useParams();
  const navigate = useNavigate();

  const act = findBareAct(lawType);

  const [sections, setSections] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(Boolean(act));
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const [selected, setSelected] = useState(null);

  const listRef = useRef(null);

  /* Only the newest request may write state — guards against a slow search
     response overwriting a newer one. */
  const requestIdRef = useRef(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [lawType]);

  /* Debounce typing into the committed query, and reset to page 1. */
  useEffect(() => {
    const trimmed = searchInput.trim();

    const timer = setTimeout(() => {
      setQuery((current) => {
        if (current === trimmed) return current;
        setPage(1);
        return trimmed;
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* Depends only on stable inputs — never on sections/pagination, which it
     sets itself. */
  useEffect(() => {
    if (!act) return undefined;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    let cancelled = false;

    const isCurrent = () => !cancelled && requestIdRef.current === requestId;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = query
          ? await searchBareActSections({
              lawType: act.lawType,
              query,
              page,
              limit: PAGE_LIMIT,
            })
          : await getBareActSections({
              lawType: act.lawType,
              page,
              limit: PAGE_LIMIT,
            });

        if (!isCurrent()) return;

        setSections(result.sections);
        setPagination(result.pagination);
      } catch (err) {
        if (!isCurrent()) return;

        if (import.meta.env?.DEV) {
          console.error(`[BareActs] ${act.lawType} request failed:`, err);
        }

        setSections([]);
        setPagination(EMPTY_PAGINATION);
        setError("Unable to load sections.");
      } finally {
        if (isCurrent()) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [act, query, page, reloadToken]);

  const handlePageChange = useCallback(
    (nextPage) => {
      if (loading || nextPage === page) return;

      setPage(nextPage);
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [loading, page],
  );

  /* ---------------- unsupported act ---------------- */

  if (!act) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <span className="material-symbols-outlined text-3xl text-amber-600">
              menu_book
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Act not found
          </h1>

          <p className="mt-2 text-slate-500">
            This act is not available in the Legal Hub yet.
          </p>

          <button
            type="button"
            onClick={() => navigate("/legal-hub/law-library")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Bare Acts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="pt-6 sm:pt-8 pb-10 sm:pb-12 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
         

          <div className="flex items-center gap-2 text-amber-600">
            <span className="material-symbols-outlined">{act.icon}</span>
            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              {act.shortName}
            </span>
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            {act.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-7 text-slate-600">
            {act.description}
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <label htmlFor="bare-act-search" className="sr-only">
              Search {act.shortName} sections
            </label>

            <div className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 transition-all focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/20">
              <span className="material-symbols-outlined shrink-0 text-slate-400">
                search
              </span>

              <input
                id="bare-act-search"
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by section number or keyword..."
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm font-medium text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTIONS
      ====================================================== */}
      <section ref={listRef} className="py-16 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          {!loading && !error && sections.length > 0 && (
            <p className="mb-6 text-sm text-slate-500">
              {query
                ? `${pagination.total} result${pagination.total === 1 ? "" : "s"} for "${query}"`
                : `${pagination.total} section${pagination.total === 1 ? "" : "s"}`}
            </p>
          )}

          {loading ? (
            <SectionsSkeleton />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => setReloadToken((token) => token + 1)}
            />
          ) : sections.length === 0 ? (
            <EmptyState query={query} onClear={() => setSearchInput("")} />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sections.map((section) => (
                  <SectionCard
                    key={section.id || sectionNumber(section)}
                    section={section}
                    onClick={() => setSelected(section)}
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Sections pagination"
                  className="mt-12 flex flex-wrap items-center justify-center gap-3"
                >
                  <PaginationButton
                    icon="arrow_back"
                    label="Previous"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => handlePageChange(page - 1)}
                  />

                  <span className="px-2 text-sm font-bold text-slate-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <PaginationButton
                    icon="arrow_forward"
                    label="Next"
                    iconLast
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(page + 1)}
                  />
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {selected && (
        <SectionModal
          lawType={act.lawType}
          actShortName={act.shortName}
          section={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

/* ============================================================
   SECTION CARD
============================================================ */

const SectionCard = ({ section, onClick }) => {
  const number = sectionNumber(section);
  const bodies = sectionBodies(section);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      aria-label={`Open section ${number}`}
      className="
        group
        flex
        h-full
        cursor-pointer
        flex-col
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-amber-300
        hover:shadow-lg
        focus:outline-none
        focus-visible:border-amber-400
        focus-visible:ring-2
        focus-visible:ring-amber-500/30
      "
    >
      {number && (
        <span className="inline-flex w-fit items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
          Section {number}
        </span>
      )}

      <h3 className="mt-3 font-bold leading-6 text-slate-900 transition-colors group-hover:text-amber-600">
        {sectionHeading(section)}
      </h3>

            {bodies[0] && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {richTextExcerpt(bodies[0].text, 160)}
        </p>
      )}

      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-amber-600 transition-all group-hover:gap-2.5">
        Read section
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </span>
    </article>
  );
};

/* ============================================================
   SECTION MODAL

   Opens instantly from the list row, then fetches the full record —
   list responses may be truncated.
============================================================ */

const SectionModal = ({ lawType, actShortName, section, onClose }) => {
  const [detail, setDetail] = useState(section);
  const [loading, setLoading] = useState(Boolean(section?.id));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (!section?.id) return undefined;

    let cancelled = false;

    getBareActSectionById({ lawType, id: section.id })
      .then((result) => {
        if (cancelled) return;
        if (result) setDetail(result);
      })
      .catch((err) => {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error("[BareActs] section detail failed:", err);
        }

        /* The list row is still shown — only the extra detail is missing. */
        setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lawType, section?.id]);

  const number = sectionNumber(detail);
  const bodies = sectionBodies(detail);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Section ${number}`}
      className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-slate-200 bg-white shadow-2xl sm:max-w-2xl sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              {actShortName}
              {number && <span className="text-slate-400"> • Section {number}</span>}
            </p>

            <h2 className="mt-1 text-lg font-bold leading-6 text-slate-900">
              {sectionHeading(detail)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {loading && bodies.length === 0 ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-3 rounded-full bg-slate-100 ${index === 5 ? "w-2/3" : "w-full"}`}
                />
              ))}
            </div>
          ) : bodies.length === 0 ? (
            <p className="text-sm text-slate-500">
              The full text of this section is not available.
            </p>
          ) : (
                        <div className="space-y-6">
              {bodies.map((body) => (
                <div key={body.key}>
                  {body.label && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {body.label}
                    </p>
                  )}

                  <RichContent
                    value={body.text}
                    className="text-sm leading-7 text-slate-600"
                  />
                </div>
              ))}
            </div>
          )}

          {failed && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700">
              Showing partial text — the full section could not be loaded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PAGINATION + STATES
============================================================ */

const PaginationButton = ({ icon, label, disabled, onClick, iconLast }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
  >
    {!iconLast && (
      <span className="material-symbols-outlined text-base">{icon}</span>
    )}
    {label}
    {iconLast && (
      <span className="material-symbols-outlined text-base">{icon}</span>
    )}
  </button>
);

const SectionsSkeleton = () => (
  <div className="grid animate-pulse md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-6 w-24 rounded-lg bg-slate-100" />
        <div className="mt-3 h-4 w-4/5 rounded-full bg-slate-100" />

        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded-full bg-slate-100" />
          <div className="h-3 w-5/6 rounded-full bg-slate-100" />
          <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        </div>

        <div className="mt-5 h-3 w-24 rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
      <span className="material-symbols-outlined">error</span>
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">{message}</h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      Please try again.
    </p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
    >
      <span className="material-symbols-outlined text-base">refresh</span>
      Retry
    </button>
  </div>
);

const EmptyState = ({ query, onClear }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
      <span className="material-symbols-outlined">{query ? "search_off" : "menu_book"}</span>
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      {query ? `No sections match "${query}".` : "No sections are available yet."}
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {query
        ? "Try a different section number or keyword."
        : "Sections will appear here as soon as they are published."}
    </p>

    {query && (
      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
      >
        <span className="material-symbols-outlined text-base">close</span>
        Clear search
      </button>
    )}
  </div>
);

export default BareActSections;