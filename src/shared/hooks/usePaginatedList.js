import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toAdminError } from "../../features/admin";

/**
 * Standard CMS list hook:
 *   - synchronises `page` with the URL search param (?page=1)
 *   - resets to page 1 on search / filter changes
 *   - reloads on demand (after mutation)
 *   - supports optimistic/instant delete row removal via `afterDelete(id)`
 *
 * `fetcher({ page, limit })` must return `{ items, pagination }`.
 * `fetcher` must be stable across renders (module-level or useCallback).
 *
 * status: "loading" | "success" | "error"
 */
export default function usePaginatedList(fetcher, { limit = 10 } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${page}:${limit}:${reloadKey}`;
  const [result, setResult] = useState({ key: null, status: "loading", items: [], pagination: null, error: null });

  useEffect(() => {
    let ignore = false;

    fetcher({ page, limit })
      .then(({ items, pagination }) => {
        if (!ignore) {
          const rawItems = Array.isArray(items) ? items : [];
          let resolvedItems = rawItems;
          let resolvedPagination = pagination ?? null;

          // Client-side fallback if backend returns full unpaginated array
          if (rawItems.length > limit) {
            const total = pagination?.total ?? rawItems.length;
            const totalPages = Math.ceil(total / limit) || 1;
            const startIndex = (page - 1) * limit;
            resolvedItems = rawItems.slice(startIndex, startIndex + limit);
            resolvedPagination = {
              ...(pagination || {}),
              currentPage: page,
              page,
              limit,
              total,
              totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            };
          }

          setResult({
            key: requestKey,
            status: "success",
            items: resolvedItems,
            pagination: resolvedPagination,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (!ignore) {
          setResult({ key: requestKey, status: "error", items: [], pagination: null, error: toAdminError(error) });
        }
      });

    return () => {
      ignore = true;
    };
  }, [fetcher, page, limit, requestKey]);

  const setPage = useCallback(
    (nextPage) => {
      const target = typeof nextPage === "function" ? nextPage(page) : nextPage;
      const clean = Math.max(1, parseInt(target, 10) || 1);
      setSearchParams((params) => {
        const copy = new URLSearchParams(params);
        if (clean === 1) copy.delete("page");
        else copy.set("page", String(clean));
        return copy;
      });
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [page, setSearchParams],
  );

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const afterDelete = useCallback(
    (id) => {
      setResult((prev) => {
        const nextItems = prev.items.filter((item) => (item?.id ?? item?._id) !== id);
        // If the current page is emptied and wasn't page 1, roll back one page.
        if (nextItems.length === 0 && page > 1) {
          setPage(page - 1);
          return prev;
        }
        const prevTotal = prev.pagination?.total;
        const nextTotal = typeof prevTotal === "number" ? Math.max(0, prevTotal - 1) : prevTotal;
        return {
          ...prev,
          items: nextItems,
          pagination: prev.pagination ? { ...prev.pagination, total: nextTotal } : null,
        };
      });
    },
    [page, setPage],
  );

  const status = result.key === requestKey ? result.status : "loading";
  return {
    status,
    items: result.items,
    pagination: result.pagination,
    error: result.error,
    page,
    setPage,
    reload,
    afterDelete,
  };
}