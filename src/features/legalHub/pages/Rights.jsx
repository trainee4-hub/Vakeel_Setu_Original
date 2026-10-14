import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBalanceScale,
  FaExclamationCircle,
  FaGavel,
} from "react-icons/fa";

import {
  FiArrowLeft,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

import {
  DEFAULT_PAGINATION,
  getUserRights,
} from "../services/userRightsApi";

import { richTextExcerpt } from "@shared/utils/richText";

const PAGE_LIMIT = 10;

const Rights = () => {
  const navigate = useNavigate();

  const [rights, setRights] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Bumped to re-run the effect on Retry without touching `page`. */
  const [reloadToken, setReloadToken] = useState(0);

  const gridRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /* Only [page, reloadToken] — never rights/pagination, which this effect
     sets and which would otherwise loop. */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getUserRights({
          page,
          limit: PAGE_LIMIT,
        });

        if (cancelled) return;

        setRights(result.rights);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;

        setRights([]);
        setPagination(DEFAULT_PAGINATION);

        setError(
          err?.message ||
            "We couldn't load your rights right now. Please try again.",
        );
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
    if (nextPage === page || loading) return;

    setPage(nextPage);

    gridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /* Skip the scroll on first paint so the hero isn't jumped past. */
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="pt-6 sm:pt-8 pb-10 sm:pb-12 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-amber-600">
            <FaGavel
              className="text-[20px]"
              aria-hidden="true"
            />

            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              Legal Hub
            </span>
          </div>

          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
            Know Your
            <span className="text-amber-600"> Rights.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-7 text-slate-600">
            Understand your basic legal rights in everyday situations — as a
            consumer, tenant, employee, and more.
          </p>
        </div>
      </section>

      {/* =====================================================
          RIGHTS GRID
      ====================================================== */}
      <section
        ref={gridRef}
        className="py-16 px-4 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <RightsSkeleton />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() =>
                setReloadToken((token) => token + 1)
              }
            />
          ) : rights.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {rights.map((right) => (
                  <LegalHubCard
                    key={right.id}
                    photo={right.photo}
                    title={right.title}
                    description={right.description}
                    onClick={() =>
                      navigate(
                        `/legal-hub/rights/${right.id}`,
                      )
                    }
                  />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Rights pagination"
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
   RESOURCE CARD
============================================================ */

const LegalHubCard = ({
  photo,
  title,
  description,
  onClick,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const showPhoto = Boolean(photo) && !imageFailed;

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onClick();
        }
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus:outline-none focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        {showPhoto ? (
          <img
            src={photo}
            alt={title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Fallback for a missing photo or a dead Cloudinary URL — never a
             broken-image icon. */
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100/60">
            <FaBalanceScale
              className="text-4xl text-amber-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-bold text-slate-900 transition-colors group-hover:text-amber-600">
          {title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {richTextExcerpt(description, 180)}
        </p>

        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-amber-600 transition-all group-hover:gap-2">
          Explore

          <FiArrowRight
            className="text-base"
            aria-hidden="true"
          />
        </span>
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

const RightsSkeleton = () => (
  <div className="grid animate-pulse sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
    {Array.from({ length: 10 }).map((_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <div className="aspect-[4/3] w-full bg-slate-100" />

        <div className="p-6">
          <div className="h-4 w-3/4 rounded-full bg-slate-100" />

          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-100" />
            <div className="h-3 w-5/6 rounded-full bg-slate-100" />
            <div className="h-3 w-2/3 rounded-full bg-slate-100" />
          </div>

          <div className="mt-6 h-3 w-20 rounded-full bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
      <FaExclamationCircle
        className="text-[20px]"
        aria-hidden="true"
      />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      Unable to load rights
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {message}
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

      Try again
    </button>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
      <FaGavel
        className="text-[20px]"
        aria-hidden="true"
      />
    </div>

    <h3 className="mt-4 text-lg font-bold text-slate-900">
      No rights have been published yet.
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      Legal rights will appear here as soon as they are added.
    </p>
  </div>
);

export default Rights;