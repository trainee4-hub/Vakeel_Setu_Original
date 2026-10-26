import { Button, Icon } from "./Button";

const isPositiveNumber = (val) => typeof val === "number" && Number.isFinite(val) && val > 0;

const BUTTON_CLASS =
  "border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-950 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none";

/** Uses backend pagination metadata; supports derived boundary state. */
export default function Pagination({ pagination, onPageChange, disabled = false }) {
  if (!pagination || (typeof pagination.totalPages === "number" && pagination.totalPages < 1)) return null;

  const currentPage = pagination.currentPage ?? pagination.page;
  const totalPages = pagination.totalPages;

  const canDerive = isPositiveNumber(currentPage) && isPositiveNumber(totalPages);
  const canPrevious = canDerive ? currentPage > 1 : Boolean(pagination.hasPreviousPage);
  const canNext = canDerive ? currentPage < totalPages : Boolean(pagination.hasNextPage);

  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        icon="chevron_left"
        disabled={disabled || !canPrevious}
        onClick={() => onPageChange(currentPage - 1)}
        className={BUTTON_CLASS}
      >
        Previous
      </Button>
      <p className="text-sm text-slate-600" aria-live="polite">
        Page <span className="font-semibold text-slate-900">{currentPage}</span>
        {totalPages ? ` of ${totalPages}` : ""}
      </p>
      <Button
        variant="secondary"
        disabled={disabled || !canNext}
        onClick={() => onPageChange(currentPage + 1)}
        className={BUTTON_CLASS}
      >
        Next
        <Icon name="chevron_right" className="text-[18px]" />
      </Button>
    </nav>
  );
}

