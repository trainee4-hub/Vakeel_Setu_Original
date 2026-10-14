import ConfirmModal from "./ConfirmModal";

/** One delete confirmation for every content type. */
export default function DeleteConfirmationModal({
  open,
  title,
  itemName,
  loading = false,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
}) {
  return (
    <ConfirmModal
      open={open}
      icon="delete"
      tone="danger"
      title={title}
      itemName={itemName}
      description="This action cannot be undone."
      confirmLabel={loading ? "Deleting…" : confirmLabel}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
