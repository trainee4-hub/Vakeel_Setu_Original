import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Button";
import { ToastContext } from "./toastContext";

const TONES = {
  success: { icon: "check_circle", className: "border-emerald-700 bg-emerald-600 text-white", close: "text-emerald-100 hover:text-white" },
  error: { icon: "error", className: "border-red-700 bg-red-600 text-white", close: "text-red-100 hover:text-white" },
  info: { icon: "info", className: "border-slate-200 bg-white text-slate-800", close: "text-slate-400 hover:text-slate-700" },
};

/** Toast stack scoped to the Content Creator workspace. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (tone, message) => {
      if (!message) return;
      counter.current += 1;
      const id = counter.current;
      setToasts((list) => [...list.slice(-3), { id, tone, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), tone === "error" ? 6000 : 4000));
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((timer) => clearTimeout(timer));
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[10001] flex flex-col items-center gap-2"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] ?? TONES.info;
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${tone.className}`}
            >
              <Icon name={tone.icon} filled className="mt-0.5 text-[20px]" />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className={`rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${tone.close}`}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

const NOOP = { success: () => {}, error: () => {}, info: () => {} };

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext) ?? NOOP;
  return useMemo(
    () => ({
      ...ctx,
      show: (message, type = "info") => {
        if (type === "success") ctx.success(message);
        else if (type === "error") ctx.error(message);
        else ctx.info(message);
      },
    }),
    [ctx],
  );
}

export default ToastProvider;