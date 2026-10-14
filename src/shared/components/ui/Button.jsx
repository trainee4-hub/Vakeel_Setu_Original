import { Link } from "react-router-dom";
import { buttonClass } from "./styles";

export function Icon({ name, className = "", filled = false }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

export function Spinner({ className = "h-4 w-4" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

/* React 19: `ref` is a regular prop on function components. */
export function Button({
  ref,
  variant = "primary",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon ? <Icon name={icon} className="text-[18px]" /> : null}
      {children}
    </button>
  );
}

export function LinkButton({ to, variant = "primary", icon, children, className = "", ...props }) {
  return (
    <Link to={to} className={buttonClass(variant, className)} {...props}>
      {icon ? <Icon name={icon} className="text-[18px]" /> : null}
      {children}
    </Link>
  );
}

const BACK_CLASS =
  "inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500";

/** Link when `to` is given; button when `onClick` is given (unsaved-changes guard). */
export function BackLink({ to, label, onClick }) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={BACK_CLASS}>
        <Icon name="arrow_back" className="text-[18px]" />
        {label}
      </button>
    );
  }
  return (
    <Link to={to} className={BACK_CLASS}>
      <Icon name="arrow_back" className="text-[18px]" />
      {label}
    </Link>
  );
}
