import { useCallback, useEffect, useState } from "react";
import { toAdminError } from "../utils/adminUtils";

/**
 * Paginated list with LOCAL page state, for the Bare Acts panels where three
 * lists share one screen (a URL ?page= would be ambiguous). Panels are keyed
 * by their parent selection, so switching category/act remounts them and no
 * stale page or stale rows survive.
 *
 * `fetcher` must be stable (useCallback in the panel).
 */
export default function useBareActsList(fetcher, { limit = 20, enabled = true } = {}) {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = enabled ? `${page}:${limit}:${reloadKey}` : null;
  const [result, setResult] = useState({ key: null, status: "idle", items: [], pagination: null, error: null });

  useEffect(() => {
    if (!requestKey) return undefined;
    let ignore = false;

    fetcher({ page, limit })
      .then(({ items, pagination }) => {
        if (!ignore) setResult({ key: requestKey, status: "success", items, pagination, error: null });
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

  const status = !enabled ? "idle" : result.key === requestKey ? result.status : "loading";
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return {
    status,
    items: result.items,
    pagination: result.pagination,
    error: result.error,
    page,
    setPage,
    reload,
  };
}
