import { useCallback, useEffect, useState } from "react";
import { toAdminError } from "../../features/admin";

/**
 * Loads a dropdown's options asynchronously on mount (or on demand).
 * `loader` must be stable (useCallback or module-level function).
 * status: "idle" (enabled=false) | "loading" | "success" | "error"
 */
export default function useAsyncOptions(loader, { enabled = true } = {}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: enabled ? "loading" : "idle", options: [], error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    let ignore = false;
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    loader()
      .then((options) => {
        if (!ignore) setState({ status: "success", options: options ?? [], error: null });
      })
      .catch((error) => {
        if (!ignore) setState({ status: "error", options: [], error: toAdminError(error) });
      });

    return () => {
      ignore = true;
    };
  }, [loader, enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const items = Array.isArray(state.options) ? state.options : [];
  return { ...state, items, options: items, reload };
}
