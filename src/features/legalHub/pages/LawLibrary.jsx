import React, { useEffect, useState } from "react";
import { MdLocalLibrary } from "react-icons/md";

import {
  getCategories,
  getCategoryActs,
} from "../services/bareActsApi";

import LibraryResourceCard from "../components/lawLibrary/LibraryResourceCard";
import { LIBRARY_RESOURCES } from "../components/lawLibrary/libraries";
import { LawLibraryError } from "../components/lawLibrary/LawLibraryStates";

const LawLibrary = () => {
  const [actCount, setActCount] = useState(null);
  const [countLoading, setCountLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /*
    Total acts across every category.

    Each category is asked for limit=1 and only its
    pagination.total is read — no act lists are fetched to count.
  */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCountLoading(true);
      setError(null);

      try {
        const { categories } = await getCategories({
          page: 1,
          limit: 20,
        });

        if (cancelled) return;

        if (categories.length === 0) {
          setActCount(0);
          return;
        }

        const totals = await Promise.all(
          categories.map((category) =>
            getCategoryActs(category.id, {
              page: 1,
              limit: 1,
            })
              .then(
                (result) =>
                  result.pagination?.total ?? 0,
              )
              .catch(() => 0),
          ),
        );

        if (cancelled) return;

        setActCount(
          totals.reduce(
            (sum, total) => sum + total,
            0,
          ),
        );
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error(
            "[LawLibrary] act count failed:",
            err,
          );
        }

        /* No fabricated number — the metric is simply omitted. */
        setActCount(null);

        setError(
          "Unable to load the library right now.",
        );
      } finally {
        if (!cancelled) {
          setCountLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white px-4 pt-6 pb-12 sm:pt-8 sm:pb-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-amber-600">
            <MdLocalLibrary
              className="text-[24px]"
              aria-hidden="true"
            />

            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              Legal Hub
            </span>
          </div>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Explore the
            <span className="text-amber-600">
              {" "}
              Law Library.
            </span>
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            One place for Indian legislation, case law,
            legal templates, government forms, commission
            reports and legal terminology — with more
            libraries being added over time.
          </p>
        </div>
      </section>

      {/* =====================================================
          RESOURCES
      ====================================================== */}

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Explore Legal Resources
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            Start with Bare Acts &amp; Statutes — more
            libraries are on the way.
          </p>

          {error && (
            <div className="mt-8">
              <LawLibraryError
                message={error}
                onRetry={() =>
                  setReloadToken(
                    (token) => token + 1,
                  )
                }
              />
            </div>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LIBRARY_RESOURCES.map((resource) => (
              <LibraryResourceCard
                key={resource.key}
                resource={resource}
                count={
                  resource.enabled
                    ? actCount
                    : null
                }
                countLoading={
                  resource.enabled &&
                  countLoading
                }
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LawLibrary;