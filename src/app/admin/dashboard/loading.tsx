export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[120px] animate-pulse rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-8 w-16 rounded-lg bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
              </div>
              <div className="h-11 w-11 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="h-[360px] animate-pulse rounded-2xl border border-border/60 bg-card lg:col-span-4" />
        <div className="h-[360px] animate-pulse rounded-2xl border border-border/60 bg-card lg:col-span-3" />
      </div>

      {/* Activity skeleton */}
      <div className="h-[300px] animate-pulse rounded-2xl border border-border/60 bg-card" />
    </div>
  );
}
