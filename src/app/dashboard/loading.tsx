import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardGroupLoading() {
  return (
    <div className="space-y-8">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1B2532] via-[#2A3743] to-[#1B2532] p-6 sm:p-8">
        <Skeleton className="h-8 w-72 bg-white/10" />
        <Skeleton className="mt-3 h-4 w-48 bg-white/10" />
        <Skeleton className="mt-2 h-4 w-64 bg-white/10" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm py-0">
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Activity skeleton */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
