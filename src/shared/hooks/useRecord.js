import { useCallback, useEffect, useState } from "react";
import { AdminApiError, toAdminError } from "../../features/admin";

/**
 * Loads one record for an edit page. `fetcher(id)` must be stable.
 * status: "idle" (no id) | "loading" | "success" | "error"
 */
export default function useRecord(fetcher, id) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = id ? `${id}:${reloadKey}` : null;
  const [result, setResult] = useState({ key: null, status: "loading", record: null, error: null });

  useEffect(() => {
    if (!requestKey) return undefined;
    let ignore = false;

    fetcher(id)
      .then((record) => {
        if (ignore) return;
        if (record) {
          setResult({ key: requestKey, status: "success", record, error: null });
        } else {
          setResult({
            key: requestKey,
            status: "error",
            record: null,
            error: new AdminApiError("This content could not be found.", { status: 404 }),
          });
        }
      })
      .catch((error) => {
        if (!ignore) setResult({ key: requestKey, status: "error", record: null, error: toAdminError(error) });
      });

    return () => {
      ignore = true;
    };
  }, [fetcher, id, requestKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const status = !requestKey ? "idle" : result.key === requestKey ? result.status : "loading";
  return { status, record: status === "success" ? result.record : null, error: result.error, reload };
}
