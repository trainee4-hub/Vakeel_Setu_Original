import { Button, Icon } from "./Button";

/** Uses backend pagination metadata only; hidden when there is one page. */
export default function Pagination({ pagination, onPageChange, disabled = false }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        icon="chevron_left"
        disabled={disabled || !hasPreviousPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <p className="text-sm text-slate-600" aria-live="polite">
        Page <span className="font-semibold text-slate-900">{currentPage}</span> of {totalPages}
      </p>
      <Button variant="secondary" disabled={disabled || !hasNextPage} onClick={() => onPageChange(currentPage + 1)}>
        Next
        <Icon name="chevron_right" className="text-[18px]" />
      </Button>
    </nav>
  );
}
