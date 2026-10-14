import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ui/ConfirmModal";

/**
 * Cancel / Back ask before discarding edits; closing the tab triggers the
 * browser's own leave warning while the form is dirty.
 */
export default function useUnsavedChangesGuard(isDirty) {
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const requestLeave = useCallback(
    (to) => {
      if (isDirty) setPendingPath(to);
      else navigate(to);
    },
    [isDirty, navigate],
  );

  const cancel = useCallback(() => setPendingPath(null), []);

  const confirm = useCallback(() => {
    const to = pendingPath;
    setPendingPath(null);
    if (to) navigate(to);
  }, [pendingPath, navigate]);

  const discardModal = (
    <ConfirmModal
      open={pendingPath !== null}
      icon="edit_off"
      title="Discard unsaved changes?"
      description="Your edits on this page have not been saved and will be lost."
      confirmLabel="Discard changes"
      cancelLabel="Keep editing"
      onCancel={cancel}
      onConfirm={confirm}
    />
  );

  return { requestLeave, discardModal };
}
