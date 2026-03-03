import { cn } from "@/lib/utils";
import type { TimeRange } from "@/types";

export type { TimeRange } from "@/types";

const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "7 ngày",
  "30d": "30 ngày",
  "90d": "90 ngày",
};

export function TimeRangeSelector({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {(Object.keys(timeRangeLabels) as TimeRange[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "px-2.5 py-1 text-[12px] font-medium rounded-md transition-all cursor-pointer",
            value === key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {timeRangeLabels[key]}
        </button>
      ))}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ChartTooltipContent({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[13px] font-medium" style={{ color: p.stroke || p.fill }}>
          {p.value?.toLocaleString("vi-VN")} {unit}
        </p>
      ))}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ── Avatar helpers ── */
export function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const avatarColors = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getToday() {
  return new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
