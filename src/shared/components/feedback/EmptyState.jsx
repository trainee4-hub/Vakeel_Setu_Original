import Card from "../ui/Card";
import { Icon } from "../ui/Button";

export default function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
        <Icon name={icon} className="text-[26px]" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export { EmptyState };
