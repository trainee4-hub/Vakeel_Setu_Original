import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import { MdOutlineUpdate } from "react-icons/md";

import { getUpdates } from "../services/legalHubApi";
import { richTextExcerpt, richTextToPlain } from "@shared/utils/richText";

const PAGE_LIMIT = 50;

const EMPTY_PAGINATION = {
  currentPage: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(richTextToPlain(value));

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const Updates = () => {
  const navigate = useNavigate();

  const [updates, setUpdates] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const gridRef = useRef(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /* [page, reloadToken] only — never updates/pagination, which this effect
     sets. `cancelled` blocks state writes after unmount or a newer request. */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getUpdates({
          page,
          limit: PAGE_LIMIT,
        });

        if (cancelled) return;

        setUpdates(result.updates);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error("[Updates] GET /updates failed:", err);
        }

        /* Never fall back to mock content. */
        setUpdates([]);
        setPagination(EMPTY_PAGINATION);
        setError("Unable to load legal updates.");
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
            <MdOutlineUpdate
              className="text-[24px]"
              aria-hidden="true"
            />

            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              Legal Hub
            </span>
          </div>

          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
            Legal
            <span className="text-amber-600"> Updates.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-7 text-slate-600">
            Stay informed about important legal developments and regulatory
            changes that may affect you.
          </p>
        </div>
      </section>

      {/* =====================================================
          UPDATES GRID
      ====================================================== */}
      <section
        ref={gridRef}
        className="py-16 px-4 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <UpdatesSkeleton />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() =>
                setReloadToken((token) => token + 1)
              }
            />
          ) : updates.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-5">
                {updates.map((update) => (
                  <UpdateCard
                    key={update.id}
                    title={update.title}
                    summary={update.newDescription}
                    date={formatDate(update.createdAt)}
                    onClick={() =>
                      navigate(
                        `/legal-hub/updates/${update.id}`,
                      )
                    }
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Updates pagination"
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
   UPDATE CARD — presentation only, never fetches
============================================================ */

const UpdateCard = ({
  title,
  summary,
  date,
  onClick,
}) => {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onClick();
        }
      }}
      aria-label={`Read update: ${title}`}
      className="
        group
        h-full
        cursor-pointer
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        focus:outline-none
        focus-visible:border-amber-400
        focus-visible:ring-2
        focus-visible:ring-amber-500/30
      "
    >
      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-amber-50
          "
        >
          <MdOutlineUpdate
            className="text-[24px] text-amber-600"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-amber-600
            "
          >
            Legal Update
            {date && (
              <span className="text-slate-400">
                {" "}
                • {date}
              </span>
            )}
          </p>

          <h3
            className="
              mt-1
              font-bold
              leading-6
              text-slate-900
              group-hover:text-amber-600
              transition-colors
            "
          >
            {title}
          </h3>

          {summary && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {richTextExcerpt(summary, 140)}
            </p>
          )}
        </div>

        <FiArrowRight
          className="
            mt-2.5
            shrink-0
            text-[20px]
            text-slate-400
            transition-transform
            group-hover:translate-x-1
          "
          aria-hidden="true"
        />
      </div>
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
    direction === "previous"
      ? FiArrowLeft
      : FiArrowRight;

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

const UpdatesSkeleton = () => (
  <div className="grid animate-pulse md:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map(
      (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />

            <div className="flex-1 space-y-2.5">
              <div className="h-2.5 w-24 rounded-full bg-slate-100" />
              <div className="h-4 w-4/5 rounded-full bg-slate-100" />
              <div className="h-3 w-full rounded-full bg-slate-100" />
              <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ),
    )}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
      <FiAlertCircle
        className="text-[22px]"
        aria-hidden="true"
      />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      {message}
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
      <MdOutlineUpdate
        className="text-[24px]"
        aria-hidden="true"
      />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      No legal updates are available yet.
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      New updates will appear here as soon as they are published.
    </p>
  </div>
);

export default Updates;