import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { MdSearchOff } from "react-icons/md";

import RichContent from "@shared/components/ui/RichContent";
import {
  richTextExcerpt,
  richTextToPlain,
} from "@shared/utils/richText";

/* =========================================================================
   LEGAL SECTION EXPLORER — shared by the public IPC and BNS pages.

   - list:    GET /{ipc|bns}?page=&limit=
   - search:  GET /{ipc|bns}/search?q=&page=&limit=   (server-side, debounced)
   - detail:  GET /{ipc|bns}/:id                      (when a card is opened)

   Search text and page live in the URL (?q=murder&page=2), so results are
   shareable and survive refresh/back.
   ========================================================================= */

const SEARCH_DELAY_MS = 350;

export default function LegalSectionExplorer({
  api,
  codeLabel,
  searchPlaceholder,
  pageSize = 15,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = (searchParams.get("q") || "").trim();

  const page = Math.max(
    1,
    Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  );

  /* ---------- search input (debounced into the URL) ---------- */

  const [draft, setDraft] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);

  // URL changed from outside (back button, quick-search link): mirror it.
  if (q !== syncedQ) {
    setSyncedQ(q);

    if (q !== draft.trim()) {
      setDraft(q);
    }
  }

  useEffect(() => {
    const next = draft.trim();

    if (next === q) return undefined;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }

      params.delete("page");

      setSearchParams(params, {
        replace: true,
      });
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [draft, q, searchParams, setSearchParams]);

  /* ---------- data ---------- */

  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${q}|${page}|${pageSize}|${reloadKey}`;

  const [result, setResult] = useState({
    key: null,
    status: "loading",
    sections: [],
    pagination: null,
    error: null,
  });

  useEffect(() => {
    let ignore = false;

    const request = q
      ? api.search({
          q,
          page,
          limit: pageSize,
        })
      : api.list({
          page,
          limit: pageSize,
        });

    request
      .then(({ sections, pagination }) => {
        if (!ignore) {
          setResult({
            key: requestKey,
            status: "success",
            sections,
            pagination,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setResult({
            key: requestKey,
            status: "error",
            sections: [],
            pagination: null,
            error:
              error?.message ||
              "We couldn't load sections right now.",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [api, q, page, pageSize, requestKey]);

  const loading = result.key !== requestKey;

  const { sections, pagination } = result;

  /* ---------- actions ---------- */

  const listTopRef = useRef(null);

  const [selected, setSelected] = useState(null);

  const goToPage = (next) => {
    const params = new URLSearchParams(searchParams);

    if (next <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(next));
    }

    setSearchParams(params);

    listTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const clearSearch = () => {
    setDraft("");

    const params = new URLSearchParams(searchParams);

    params.delete("q");
    params.delete("page");

    setSearchParams(params, {
      replace: true,
    });
  };

  const retry = () => {
    setReloadKey((key) => key + 1);
  };

  const closeModal = useCallback(() => {
    setSelected(null);
  }, []);

  const countText = (() => {
    if (loading || result.status !== "success") {
      return null;
    }

    const total = pagination?.total;

    const count =
      typeof total === "number" ? total : sections.length;

    const noun = count === 1 ? "section" : "sections";

    return q
      ? `${count} ${noun} found for “${q}”`
      : `${count} ${noun}`;
  })();

  return (
    <>
      {/* =====================================================
          SEARCH
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <label
                htmlFor={`${codeLabel}-search`}
                className="sr-only"
              >
                Search {codeLabel} sections
              </label>

              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[19px] text-slate-400"
              />

              <input
                id={`${codeLabel}-search`}
                type="search"
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value)
                }
                placeholder={searchPlaceholder}
                autoComplete="off"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
              />

              {draft ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <FiX
                    aria-hidden="true"
                    className="text-lg"
                  />
                </button>
              ) : null}
            </div>

            <p
              className="min-h-[20px] text-sm text-slate-500"
              aria-live="polite"
            >
              {countText}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SECTION LIST
      ====================================================== */}

      <section
        id="legal-sections"
        ref={listTopRef}
        className="scroll-mt-24 px-4 py-10 sm:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600">
                {codeLabel} Reference
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {q ? "Search Results" : "Explore Sections"}
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              Search by section number, offence or keyword.
            </p>
          </div>

          {loading && !sections.length ? (
            <SectionGridSkeleton count={6} />
          ) : result.status === "error" ? (
            <StatusCard
              icon="error"
              tone="error"
              title={`Couldn't load ${codeLabel} sections`}
              message={result.error}
              actionLabel="Try again"
              onAction={retry}
            />
          ) : !sections.length ? (
            q ? (
              <StatusCard
                icon="search_off"
                title={`No ${codeLabel} section found`}
                message="Try another section number, offence or keyword."
                actionLabel="Clear search"
                onAction={clearSearch}
              />
            ) : (
              <StatusCard
                icon="menu_book"
                title={`No ${codeLabel} sections published yet`}
                message="Sections will appear here once they are published."
              />
            )
          ) : (
            <>
              <div
                className={`grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3 ${
                  loading ? "opacity-60" : ""
                }`}
                aria-busy={loading || undefined}
              >
                {sections.map((section) => (
                  <SectionCard
                    key={section.id ?? section.sectionNo}
                    section={section}
                    codeLabel={codeLabel}
                    onOpen={() => setSelected(section)}
                  />
                ))}
              </div>

              <PaginationBar
                pagination={pagination}
                disabled={loading}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      </section>

      {selected ? (
        <SectionModal
          key={selected.id ?? selected.sectionNo}
          section={selected}
          api={api}
          codeLabel={codeLabel}
          onClose={closeModal}
        />
      ) : null}
    </>
  );
}

/* =========================================================================
   PIECES
   ========================================================================= */

function SectionCard({
  section,
  codeLabel,
  onOpen,
}) {
  /* Cards show plain-text excerpts — never raw HTML. */

  const previewSource =
    section.paragraph ||
    section.explanation ||
    section.content ||
    section.metaDescription ||
    "";

  const preview = richTextExcerpt(
    previewSource,
    180,
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20"
    >
      <div className="flex h-12 min-w-12 items-center justify-center self-start rounded-xl bg-amber-50 px-3 font-extrabold text-amber-700 transition group-hover:bg-amber-100">
        {section.sectionNo || "—"}
      </div>

      <h3 className="mt-5 text-[15px] font-bold leading-6 text-slate-900 transition group-hover:text-amber-600">
        {codeLabel} Section {section.sectionNo}
      </h3>

      {section.heading ? (
        <p className="mt-1 font-semibold leading-6 text-slate-700">
          {section.heading}
        </p>
      ) : null}

      {preview ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {preview}
        </p>
      ) : null}

      <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-bold text-amber-600">
        Read Section

        <FiChevronRight
          aria-hidden="true"
          className="text-base transition-transform group-hover:translate-x-1"
        />
      </span>
    </button>
  );
}

function SectionGridSkeleton({ count }) {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Loading sections"
    >
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="h-12 w-14 animate-pulse rounded-xl bg-slate-200/80" />

          <div className="mt-5 h-4 w-1/2 animate-pulse rounded bg-slate-200/80" />

          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-200/80" />

          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusCard({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  tone = "neutral",
}) {
  const renderIcon = () => {
    const iconClass = "text-[24px]";

    switch (icon) {
      case "error":
        return (
          <FiAlertCircle
            aria-hidden="true"
            className={iconClass}
          />
        );

      case "search_off":
        return (
          <MdSearchOff
            aria-hidden="true"
            className="text-[26px]"
          />
        );

      case "menu_book":
        return (
          <FiBookOpen
            aria-hidden="true"
            className={iconClass}
          />
        );

      default:
        return (
          <FiAlertCircle
            aria-hidden="true"
            className={iconClass}
          />
        );
    }
  };

  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center"
      role={tone === "error" ? "alert" : undefined}
    >
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
          tone === "error"
            ? "bg-red-50 text-red-500"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {renderIcon()}
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      {message ? (
        <p className="mt-2 text-sm text-slate-500">
          {message}
        </p>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PaginationBar({
  pagination,
  disabled,
  onPageChange,
}) {
  if (
    !pagination ||
    pagination.totalPages <= 1
  ) {
    return null;
  }

  const {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = pagination;

  const buttonClass =
    "inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700";

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between gap-3"
    >
      <button
        type="button"
        className={buttonClass}
        disabled={
          disabled || !hasPreviousPage
        }
        onClick={() =>
          onPageChange(currentPage - 1)
        }
      >
        <FiChevronLeft
          aria-hidden="true"
          className="text-lg"
        />

        Previous
      </button>

      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-bold text-slate-900">
          {currentPage}
        </span>{" "}
        of {totalPages}
      </p>

      <button
        type="button"
        className={buttonClass}
        disabled={disabled || !hasNextPage}
        onClick={() =>
          onPageChange(currentPage + 1)
        }
      >
        Next

        <FiChevronRight
          aria-hidden="true"
          className="text-lg"
        />
      </button>
    </nav>
  );
}

/* Opens with the list data immediately, then loads the full section. */

function SectionModal({
  section,
  api,
  codeLabel,
  onClose,
}) {
  const titleId = useId();
  const closeRef = useRef(null);

  const [reloadKey, setReloadKey] =
    useState(0);

  const [detail, setDetail] = useState({
    key: null,
    section: null,
    error: null,
  });

  const requestKey = section.id
    ? `${section.id}|${reloadKey}`
    : null;

  useEffect(() => {
    if (!requestKey) {
      return undefined;
    }

    let ignore = false;

    api
      .getById(section.id)
      .then((full) => {
        if (!ignore) {
          setDetail({
            key: requestKey,
            section: full,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setDetail({
            key: requestKey,
            section: null,
            error:
              error?.message ||
              "Couldn't load the full section.",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [
    api,
    section.id,
    requestKey,
  ]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement;

    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown,
      );

      if (
        previouslyFocused &&
        typeof previouslyFocused.focus ===
          "function"
      ) {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  const loadingDetail =
    Boolean(requestKey) &&
    detail.key !== requestKey;

  const detailError =
    !loadingDetail && detail.error;

  const view =
    (!loadingDetail && detail.section) ||
    section;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[28px] bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              {codeLabel} Section{" "}
              {view.sectionNo}
            </span>

            <h2
              id={titleId}
              className="mt-3 text-xl font-bold leading-7 text-slate-950"
            >
              {view.heading ||
                `${codeLabel} Section ${view.sectionNo}`}
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
          >
            <FiX
              aria-hidden="true"
              className="text-[20px]"
            />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
          {loadingDetail ? (
            <p
              className="flex items-center gap-2 text-xs font-semibold text-slate-400"
              aria-live="polite"
            >
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />

              Loading full section…
            </p>
          ) : null}

          {detailError ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4"
            >
              <p className="text-sm text-red-700">
                {detailError}
              </p>

              <button
                type="button"
                onClick={() =>
                  setReloadKey(
                    (key) => key + 1,
                  )
                }
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200"
              >
                Try again
              </button>
            </div>
          ) : null}

          <ModalBlock
            title="Section Text"
            text={view.paragraph}
          />

          <ModalBlock
            title="Explanation"
            text={view.explanation}
          />

          <ModalBlock
            title="Illustration"
            text={view.content}
          />

          {view.keywords?.length ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Keywords
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {view.keywords.map(
                  (keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {keyword}
                    </span>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* Rich or legacy plain text, rendered through the shared sanitizing renderer. */
/* Section text/explanation/content may be rich HTML — rendered sanitised. */

function ModalBlock({
  title,
  text,
}) {
  if (!richTextToPlain(text)) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>

      <RichContent
        value={text}
        className="mt-3 text-sm leading-7 text-slate-600"
      />
    </div>
  );
}