import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button, Icon } from "./Button";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible confirmation dialog: focus moves in and is trapped,
 * Escape closes unless an action is in progress, focus returns on close.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  itemName,
  icon = "help",
  tone = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onCancel,
  onConfirm,
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);

  // Focus in on open; restore focus on close.
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    cancelRef.current?.focus();
    return () => {
      if (previouslyFocused && typeof previouslyFocused.focus === "function") previouslyFocused.focus();
    };
  }, [open]);

  // Escape + focus trap.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!loading) onCancel?.();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const nodes = dialogRef.current.querySelectorAll(FOCUSABLE);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;
  const danger = tone === "danger";

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-slate-950/50"
        aria-hidden="true"
        onClick={() => {
          if (!loading) onCancel?.();
        }}
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              danger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <Icon name={icon} className="text-[24px]" />
          </div>
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-slate-950">
              {title}
            </h2>
            <div id={descId} className="mt-1 space-y-2 text-sm text-slate-600">
              {itemName ? <p className="break-words font-medium text-slate-900">“{itemName}”</p> : null}
              {description ? <p>{description}</p> : null}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
