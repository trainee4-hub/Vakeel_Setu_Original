import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FiBookOpen,
  FiChevronDown,
  FiChevronRight,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { FaGavel } from "react-icons/fa";

import { getCategories, getCategoryActs } from "../services/bareActsApi";
import LawLibrarySearch from "../components/lawLibrary/LawLibrarySearch";
import {
  LawLibraryEmpty,
  LawLibraryError,
  LawLibrarySkeleton,
  Pagination,
} from "../components/lawLibrary/LawLibraryStates";
import { actTitle } from "../components/lawLibrary/lawLibraryUtils";

const ActsLibrary = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryId = searchParams.get("category") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const [acts, setActs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [actsLoading, setActsLoading] = useState(false);
  const [actsError, setActsError] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const selected =
    categories.find((category) => category.id === categoryId) || null;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /* Categories — loaded once. */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const result = await getCategories({
          page: 1,
          limit: 20,
        });

        if (cancelled) return;

        setCategories(result.categories);

        /* Default to the first category so the page is never blank. */
        if (!categoryId && result.categories.length > 0) {
          const next = new URLSearchParams(searchParams);

          next.set("category", result.categories[0].id);

          setSearchParams(next, {
            replace: true,
          });
        }
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error(
            "[ActsLibrary] GET /bearer-acts failed:",
            err,
          );
        }

        setCategories([]);
        setCategoriesError("Unable to load categories.");
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Acts — re-runs only on category/page change. */
  useEffect(() => {
    if (!categoryId) {
      setActs([]);
      setPagination(null);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      setActsLoading(true);
      setActsError(null);

      try {
        const result = await getCategoryActs(categoryId, {
          page,
          limit: 20,
        });

        if (cancelled) return;

        setActs(result.acts);
        setPagination(result.pagination);
      } catch (err) {
        if (cancelled) return;

        if (import.meta.env?.DEV) {
          console.error(
            "[ActsLibrary] GET /bearer-acts/:id/acts failed:",
            err,
          );
        }

        setActs([]);
        setPagination(null);
        setActsError("Unable to load acts.");
      } finally {
        if (!cancelled) {
          setActsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [categoryId, page, reloadToken]);

  const selectCategory = (id) => {
    const next = new URLSearchParams(searchParams);

    next.set("category", id);
    next.delete("page");

    setSearchParams(next);
    setDrawerOpen(false);
  };

  const changePage = (nextPage) => {
    const next = new URLSearchParams(searchParams);

    next.set("page", String(nextPage));

    setSearchParams(next);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const categoryList = (
    <nav aria-label="Legal categories" className="space-y-1">
      {categories.map((category) => {
        const active = category.id === categoryId;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => selectCategory(category.id)}
            aria-current={active ? "true" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 ${
              active
                ? "bg-amber-50 text-amber-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <FaGavel
              className={`shrink-0 text-[18px] ${
                active
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
              aria-hidden="true"
            />

            <span className="min-w-0 flex-1 truncate">
              {category.name}
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="border-b border-slate-100 bg-white px-4 pt-6 pb-10 sm:pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-amber-600">
            <FiBookOpen
              className="text-[22px]"
              aria-hidden="true"
            />

            <span className="text-sm font-bold uppercase tracking-[0.15em]">
              Law Library
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Bare Acts & Statutes
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Select a category to see the acts it contains, or search
            across every act and sectio n.
          </p>

          <div className="mt-7">
            <LawLibrarySearch placeholder="Search Bare Acts & Statutes..." />
          </div>
        </div>
      </section>

      {/* =====================================================
          SIDEBAR + LIST
      ====================================================== */}

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop sidebar */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Categories
              </p>

              {categoriesLoading ? (
                <div className="animate-pulse space-y-2 px-1">
                  {Array.from({ length: 8 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-9 rounded-xl bg-slate-100"
                      />
                    ),
                  )}
                </div>
              ) : categoriesError ? (
                <p className="px-3 pb-2 text-xs text-slate-500">
                  {categoriesError}
                </p>
              ) : (
                categoryList
              )}
            </div>
          </aside>

          <div className="min-w-0">
            {/* Mobile / tablet category control */}

            <div className="mb-6 lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
              >
                <span className="flex items-center gap-2">
                  <FiFilter
                    className="shrink-0 text-[19px] text-amber-600"
                    aria-hidden="true"
                  />

                  {selected
                    ? selected.name
                    : "Select a category"}
                </span>

                <FiChevronDown
                  className="shrink-0 text-[20px] text-slate-400"
                  aria-hidden="true"
                />
              </button>
            </div>

            {selected && (
              <div className="mb-6 flex flex-wrap items-baseline gap-3">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {selected.name}
                </h2>

                {pagination?.total > 0 && (
                  <span className="text-sm text-slate-500">
                    {pagination.total} act
                    {pagination.total === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            )}

            {actsLoading ? (
              <LawLibrarySkeleton
                count={8}
                variant="row"
              />
            ) : actsError ? (
              <LawLibraryError
                message={actsError}
                onRetry={() =>
                  setReloadToken(
                    (token) => token + 1,
                  )
                }
              />
            ) : !categoryId ? (
              <LawLibraryEmpty
                icon="category"
                title="Select a category to begin."
              />
            ) : acts.length === 0 ? (
              <LawLibraryEmpty
                icon="gavel"
                title="No acts in this category yet."
              />
            ) : (
              <>
                <ul className="space-y-3">
                  {acts.map((act) => (
                    <li key={act.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
  `/legal-hub/law-library/acts/${act.id}`,
  {
    state: {
      actName: actTitle(act),
    },
  },
)
                        }
                        className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus:outline-none focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                            {actTitle(act)}
                          </h3>

                          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                            {act.act && (
                              <span className="truncate">
                                {act.act}
                              </span>
                            )}

                            {act.act && act.year && (
                              <span>•</span>
                            )}

                            {act.year && (
                              <span>{act.year}</span>
                            )}
                          </p>
                        </div>

                        <FiChevronRight
                          className="shrink-0 text-[20px] text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-amber-500"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>

                <Pagination
                  pagination={pagination}
                  onChange={changePage}
                  disabled={actsLoading}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select a category"
          className="fixed inset-0 z-[120] flex items-end lg:hidden"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <div className="relative flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-[26px] border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-900">
                Categories
              </h2>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <FiX
                  className="text-[18px]"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {categoryList}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActsLibrary;