import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSectionSkeleton({
  className,
  heightClass = "h-64",
}: {
  className?: string;
  heightClass?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/50 bg-card/70 p-6 shadow-none ${heightClass} ${className ?? ""}`}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-48 rounded bg-muted/80" />
        <div className="h-36 rounded-lg bg-muted/60" />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border border-border/50 py-0 shadow-none">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="grid gap-3 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[76px] rounded-lg" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-10">
        <Card className="lg:col-span-4 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-12" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </CardHeader>
          <CardContent className="pt-2">
            <Skeleton className="mx-auto h-[150px] w-[150px] rounded-full" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-1 w-12 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-5 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-2 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border border-border/50 shadow-none">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[84px] rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[6px] w-[6px] rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-border/50 pt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <div className="relative space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-full max-w-xl" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
