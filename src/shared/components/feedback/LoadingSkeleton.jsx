import Card from "../ui/Card";

function Bar({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <Card className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Bar className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Bar className="h-4 w-2/3" />
            <Bar className="h-3 w-1/3" />
          </div>
          <Bar className="hidden h-8 w-24 sm:block" />
        </div>
      ))}
    </Card>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading form">
      {[0, 1].map((block) => (
        <Card key={block} className="space-y-5 p-6">
          <Bar className="h-5 w-40" />
          {[0, 1, 2].map((field) => (
            <div key={field} className="space-y-2">
              <Bar className="h-3.5 w-28" />
              <Bar className="h-10 w-full" />
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="space-y-4 p-5">
          <Bar className="h-10 w-10 rounded-xl" />
          <Bar className="h-4 w-1/2" />
          <Bar className="h-7 w-16" />
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <Card className="divide-y divide-slate-100 overflow-hidden" aria-busy="true" aria-label="Loading table">
      <div className="flex items-center gap-4 bg-slate-50 px-5 py-3.5">
        {Array.from({ length: cols }).map((_, c) => (
          <Bar key={c} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Bar key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </Card>
  );
}

export default ListSkeleton;

