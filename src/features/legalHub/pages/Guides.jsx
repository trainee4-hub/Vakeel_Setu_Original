import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiRefreshCw,
} from "react-icons/fi";

import { getGuides } from "../services/legalHubApi";
import { richTextExcerpt } from "@shared/utils/richText";

/* The documented maximum. Pagination still renders if more ever exist. */
const PAGE_LIMIT = 50;

const EMPTY_PAGINATION = {
  currentPage: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const Guides = () => {
  const navigate = useNavigate();

  const [guides, setGuides] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Bumped by Retry so the effect re-runs without touching `page`. */
  const [reloadToken, setReloadToken] = useState(0);

  const gridRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /* Depends only on [page, reloadToken] — never on guides/pagination, which
     this effect itself sets. The `cancelled` flag stops a late response from
     updating state after unmount or after a newer request has started. */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getGuides({
          page,
          limit: PAGE_LIMIT,
        });

        if (cancelled) return;

        setGuides(result.guides);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error("[Guides] GET /guides failed:", err);
        }

        /* Never fall back to mock content. */
        setGuides([]);
        setPagination(EMPTY_PAGINATION);
        setError("Unable to load guides.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page, reloadToken]);

  const handlePageChange = (nextPage) => {
    if (loading || nextPage === page) return;

    setPage(nextPage);

    gridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="pt-6 sm:pt-8 pb-10 sm:pb-12 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-amber-600">
            <FiBookOpen
              className="text-[24px]"
              aria-hidden="true"
            />

            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              Legal Hub
            </span>
          </div>

          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
            Legal
            <span className="text-amber-600"> Guides.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-7 text-slate-600">
            Step-by-step guides that walk you through common legal processes,
            in plain and simple language.
          </p>
        </div>
      </section>

      {/* =====================================================
          GUIDES GRID
      ====================================================== */}

      <section
        ref={gridRef}
        className="py-16 px-4 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <GuidesSkeleton />
          ) : error ? (
            <ErrorState
              onRetry={() =>
                setReloadToken((token) => token + 1)
              }
            />
          ) : guides.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <GuideCard
                    key={guide.id}
                    title={guide.title}
                    description={guide.description}
                    onClick={() =>
                      navigate(`/legal-hub/guides/${guide.id}`)
                    }
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Guides pagination"
                  className="mt-12 flex flex-wrap items-center justify-center gap-3"
                >
                  <PaginationButton
                    direction="previous"
                    label="Previous"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() =>
                      handlePageChange(page - 1)
                    }
                  />

                  <span className="px-2 text-sm font-bold text-slate-600">
                    Page {pagination.currentPage} of{" "}
                    {pagination.totalPages}
                  </span>

                  <PaginationButton
                    direction="next"
                    label="Next"
                    iconLast
                    disabled={!pagination.hasNextPage}
                    onClick={() =>
                      handlePageChange(page + 1)
                    }
                  />
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

/* ============================================================
   GUIDE CARD

   Presentation only — receives data, never fetches it. The icon
   is one generic legal-guide glyph; the API carries no icon.
============================================================ */

const GuideCard = ({
  title,
  description,
  onClick,
}) => {
  return (
    <article
      onClick={onClick}
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
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-amber-300
        hover:shadow-xl
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-amber-50
        "
      >
        <FiBookOpen
          className="text-[24px] text-amber-600"
          aria-hidden="true"
        />
      </div>

      <h3
        className="
          mt-5
          font-bold
          text-slate-900
          group-hover:text-amber-600
          transition-colors
        "
      >
        {title}
      </h3>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">
          {richTextExcerpt(description, 180)}
        </p>
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        aria-label={`View guide: ${title}`}
        className="
          mt-auto
          inline-flex
          items-center
          gap-2
          self-start
          rounded-lg
          pt-5
          text-sm
          font-bold
          text-amber-600
          transition-all
          group-hover:gap-3
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-amber-500/40
        "
      >
        View Guide

        <FiArrowRight
          className="text-base"
          aria-hidden="true"
        />
      </button>
    </article>
  );
};

/* ============================================================
   PAGINATION
============================================================ */

const PaginationButton = ({
  direction,
  label,
  disabled,
  onClick,
  iconLast,
}) => {
  const Icon =
    direction === "next"
      ? FiArrowRight
      : FiArrowLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700"
    >
      {!iconLast && (
        <Icon
          className="text-base"
          aria-hidden="true"
        />
      )}

      {label}

      {iconLast && (
        <Icon
          className="text-base"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

/* ============================================================
   STATES
============================================================ */

const GuidesSkeleton = () => (
  <div className="grid animate-pulse md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="h-12 w-12 rounded-xl bg-slate-100" />

        <div className="mt-5 h-4 w-3/4 rounded-full bg-slate-100" />

        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded-full bg-slate-100" />
          <div className="h-3 w-5/6 rounded-full bg-slate-100" />
          <div className="h-3 w-2/3 rounded-full bg-slate-100" />
        </div>

        <div className="mt-6 h-3 w-24 rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
      <FiAlertCircle
        className="text-[24px]"
        aria-hidden="true"
      />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      Unable to load guides.
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      Please try again.
    </p>

    <button
      type="button"
      onClick={onRetry}
      className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
    >
      <FiRefreshCw
        className="text-base"
        aria-hidden="true"
      />

      Retry
    </button>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
      <FiBookOpen
        className="text-[24px]"
        aria-hidden="true"
      />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      No legal guides are available yet.
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      New guides will appear here as soon as they are published.
    </p>
  </div>
);

export default Guides;