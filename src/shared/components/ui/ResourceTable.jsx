import { Link } from "react-router-dom";
import { Icon } from "./Button";

/**
 * Responsive management list: a table from md up, stacked cards on mobile.
 * columns: [{ key, header, render(item), className?, primary? }]
 * actions(item) → [{ key, label, icon, to?, href?, onClick?, tone? } | false]
 */
export default function ResourceTable({
  items,
  data,
  columns,
  keyField,
  getKey = (item) => (keyField && item?.[keyField] ? item[keyField] : (item?.id ?? item?._id)),
  actions,
  caption,
  busy = false,
}) {
  const rows = items ?? data ?? [];
  const primary = columns.find((column) => column.primary) ?? columns[0];
  const secondary = columns.filter((column) => column !== primary);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity ${
        busy ? "opacity-60" : ""
      }`}
      aria-busy={busy || undefined}
    >
      <table className="hidden w-full text-left text-sm md:table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`px-3.5 py-3 sm:px-4  ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
            {actions ? (
              <th scope="col" className="px-3.5 py-3 sm:px-4 text-right">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((item) => (
            <tr
              key={getKey(item)}
              className={`align-middle ${item.__isNew ? "bg-emerald-50/70" : "hover:bg-slate-50/60"}`}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-3.5 py-3 sm:px-4 sm:py-3.5 text-slate-600 ${column.className ?? ""}`}>
                  {column === primary && item.__isNew ? <NewBadge /> : null}
                  {column.render(item)}
                </td>
              ))}
              {actions ? (
                <td className="px-3.5 py-3 sm:px-4 sm:py-3.5">
                  <RowActions actions={actions(item)} compact />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-slate-100 md:hidden" aria-label={caption}>
        {rows.map((item) => (
                    <li key={getKey(item)} className={`space-y-3 p-4 ${item.__isNew ? "bg-emerald-50/70" : ""}`}>
            <div>
              {item.__isNew ? <NewBadge /> : null}
              {primary.render(item)}
            </div>
            {secondary.length ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {secondary.map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-slate-400">{column.header}</dt>
                    <dd className="truncate text-slate-700">{column.render(item)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {actions ? <RowActions actions={actions(item)} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewBadge() {
  return (
    <span className="mb-1.5 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      Just added
    </span>
  );
}

const ACTION_CLASS =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500";

function RowActions({ actions, compact = false }) {
  const visible = actions.filter(Boolean);
  if (!visible.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${compact ? "justify-end" : ""}`}>
      {visible.map((action) => {
        const tone =
          action.tone === "danger" ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
        const content = (
          <>
            <Icon name={action.icon} className="text-[18px]" />
            <span className={compact ? "sr-only" : ""}>{action.label}</span>
          </>
        );
        const common = {
          className: `${ACTION_CLASS} ${tone}`,
          title: action.label,
          "aria-label": compact ? action.label : undefined,
        };

        if (action.href) {
          return (
            <a key={action.key} href={action.href} target="_blank" rel="noopener noreferrer" {...common}>
              {content}
            </a>
          );
        }
        if (action.to) {
          return (
            <Link key={action.key} to={action.to} {...common}>
              {content}
            </Link>
          );
        }
        return (
          <button key={action.key} type="button" onClick={action.onClick} {...common}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
