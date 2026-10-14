import { useCallback, useState } from "react";
import { useCCToast } from "../components/ui/toastContext";

/**
 * Delete with confirmation. requestDelete(item) opens the modal;
 * spread `modalProps` into <DeleteConfirmationModal />.
 */
export default function useDeleteFlow(deleteFn, { successMessage, onDeleted }) {
  const toast = useCCToast();
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const cancel = useCallback(() => {
    if (!deleting) setTarget(null);
  }, [deleting]);

  const confirm = useCallback(async () => {
    if (!target || deleting) return;
    setDeleting(true);
    try {
      await deleteFn(target.id);
      toast.success(successMessage);
      setTarget(null);
      onDeleted?.(target);
    } catch (error) {
      if (error?.status === 401) return; // layout ends the session
      toast.error(error?.message || "Delete failed. Please try again.");
      if (error?.status === 404) {
        setTarget(null);
        onDeleted?.(target); // already gone — refresh the list
      }
    } finally {
      setDeleting(false);
    }
  }, [target, deleting, deleteFn, toast, successMessage, onDeleted]);

  return {
    requestDelete: setTarget,
    modalProps: { open: Boolean(target), target, loading: deleting, onCancel: cancel, onConfirm: confirm },
  };
}
