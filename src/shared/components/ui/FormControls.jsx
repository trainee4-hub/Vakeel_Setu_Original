import Card from "./Card";
import { Button, Icon } from "./Button";

export function CharCounter({ value = "", max }) {
  const length = value.length;
  const over = Boolean(max) && length > max;
  return (
    <span aria-live="polite" className={`text-xs tabular-nums ${over ? "font-semibold text-red-600" : "text-slate-400"}`}>
      {length}
      {max ? ` / ${max}` : ""}
    </span>
  );
}

export function FormField({ id, label, required = false, optional = false, hint, error, counter, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
          {required ? (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          ) : null}
          {optional ? <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span> : null}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </Card>
  );
}

export function FormErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <Icon name="error" className="mt-0.5 text-[18px]" />
      <p>{message}</p>
    </div>
  );
}

export function FormActions({ onCancel, submitting, submitLabel, submittingLabel }) {
  return (
    <div className="flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:justify-end">
      <Button variant="secondary" onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" loading={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  );
}
