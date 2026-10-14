const breadcrumbLabels = new Map();

export const setBreadcrumbLabel = (
  id,
  label,
) => {
  if (!id || !label) return;

  breadcrumbLabels.set(
    String(id),
    String(label),
  );

  window.dispatchEvent(
    new CustomEvent(
      "breadcrumb-label-change",
    ),
  );
};

export const getBreadcrumbLabel = (
  id,
) => {
  return (
    breadcrumbLabels.get(
      String(id),
    ) || null
  );
};

export const removeBreadcrumbLabel = (
  id,
) => {
  breadcrumbLabels.delete(
    String(id),
  );
};