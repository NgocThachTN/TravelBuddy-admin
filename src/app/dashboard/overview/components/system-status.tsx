import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const systemServices = [
  { label: "API Server", latency: "12ms", uptime: "99.98%" },
  { label: "Database", latency: "3ms", uptime: "99.99%" },
  { label: "CDN", latency: "8ms", uptime: "100%" },
  { label: "Auth Service", latency: "5ms", uptime: "99.97%" },
];

export function SystemStatus() {
  return (
    <Card className="lg:col-span-3 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Hệ thống</CardTitle>
        <span className="text-[11px] text-muted-foreground/60">30s trước</span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {systemServices.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
                <span className="text-[13px] text-foreground">{s.label}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground tabular-nums">
                <span>{s.latency}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-emerald-600">{s.uptime}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Trung bình phản hồi</span>
            <span className="font-medium text-foreground">7ms</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
