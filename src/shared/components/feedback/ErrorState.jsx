import Card from "../ui/Card";
import { Button, Icon } from "../ui/Button";

export default function ErrorState({ title = "Couldn't load this content", message, onRetry, action }) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center" role="alert">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <Icon name="error" className="text-[26px]" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-950">{title}</h2>
      {message ? <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p> : null}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onRetry ? (
          <Button variant="secondary" icon="refresh" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
        {action}
      </div>
    </Card>
  );
}

export { ErrorState };
