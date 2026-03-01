---
description: Quy chuẩn tạo trang mới trong dashboard admin
---

# Quy chuẩn tạo trang Dashboard

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (`@/components/ui/*`)
- **Icons**: `lucide-react`
- **Charts**: `recharts`
- **Utils**: `@/lib/utils` → `cn()` (class merge)
- **Language**: TypeScript

## Cấu trúc thư mục

Mỗi route trong dashboard nên được tổ chức theo cấu trúc sau:

```
src/app/dashboard/
├── page.tsx                  ← Slim, chỉ import + layout composition
├── loading.tsx               ← Skeleton loader
├── layout.tsx                ← Shared layout (DashboardShell)
├── dashboard-shell.tsx       ← Shell: sidebar + navbar + breadcrumb
├── components/               ← Shared components (AppSidebar, Navbar)
│
├── [tên-trang]/              ← Folder cho trang cụ thể
│   └── components/           ← Components riêng của trang đó
│       ├── shared.tsx        ← Shared utilities, helpers, types
│       ├── header.tsx        ← Header section
│       ├── data-table.tsx    ← Table/list component
│       └── ...
│
├── overview/                 ← Ví dụ: trang tổng quan
│   └── components/
│       ├── shared.tsx
│       ├── dashboard-header.tsx
│       ├── stat-cards.tsx
│       ├── user-growth-chart.tsx
│       ├── trip-activity-chart.tsx
│       ├── trip-categories-chart.tsx
│       ├── top-destinations.tsx
│       ├── quick-actions.tsx
│       ├── system-status.tsx
│       └── recent-activity.tsx
│
├── users/
│   └── components/
│       └── ...
└── trips/
    └── components/
        └── ...
```

### Quy tắc

1. **`page.tsx` phải gọn** — chỉ chứa import, state chia sẻ, và JSX layout. Không viết logic/data trực tiếp.
2. **Mỗi section tách riêng** — mỗi khối UI (header, bảng, chart, danh sách) là 1 file component riêng.
3. **Mock data nằm trong component** — data giả (để dev/demo) đặt trong chính component sử dụng nó, không tạo file data riêng.
4. **`shared.tsx`** — chứa helpers, types, và small components dùng chung trong trang đó (tooltip, selectors, etc.)
5. **Naming**: kebab-case cho file (`stat-cards.tsx`), PascalCase cho component (`StatCards`).

## Quy chuẩn thiết kế UI

### Card & Container

```tsx
// ✅ Đúng — border mỏng, không shadow
<Card className="border border-border/50 shadow-none">

// ❌ Sai — shadow nặng
<Card className="shadow-lg">
```

### Typography

| Element          | Class                                                  |
|------------------|--------------------------------------------------------|
| Page title       | `text-[22px] font-semibold tracking-tight`             |
| Card title       | `text-sm font-medium`                                  |
| Card description | `text-[13px] text-muted-foreground`                    |
| Body text        | `text-[13px]`                                          |
| Small text       | `text-[12px]` hoặc `text-[11px]`                       |
| Numbers          | Thêm `tabular-nums` để số align đều                    |

### Header pattern

Mỗi trang có header gồm: tiêu đề + mô tả ngắn + action buttons

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
      Tiêu đề trang
    </h1>
    <p className="mt-1 text-[13px] text-muted-foreground">
      Mô tả ngắn gọn
    </p>
  </div>
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" className="h-8 text-[13px]">...</Button>
    <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 h-8 text-[13px]">...</Button>
  </div>
</div>
```

### Stat card pattern

```tsx
<Card className="border border-border/50 shadow-none hover:shadow-md transition-all duration-200 py-0 group">
  <CardContent className="p-5">
    {/* Icon + Badge trên cùng */}
    {/* Số lớn + Label + So sánh kỳ trước */}
    {/* Sparkline chart nhỏ góc phải */}
  </CardContent>
</Card>
```

### Chart card pattern

```tsx
<Card className="lg:col-span-X border border-border/50 shadow-none">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
    <div>
      <CardTitle className="text-sm font-medium">Tiêu đề</CardTitle>
      <CardDescription className="text-[13px]">Mô tả</CardDescription>
    </div>
    {/* Action/selector bên phải */}
  </CardHeader>
  <CardContent className="pt-4">
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {/* Chart */}
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
```

### Chart tooltip (dùng chung)

```tsx
function ChartTooltipContent({ active, payload, label, unit }: any) {
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
```

### Chart config

```tsx
// Grid line
<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

// Axis
<XAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
<YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
```

### Trend badge

```tsx
// Tăng (xanh)
<span className="inline-flex items-center gap-0.5 text-[12px] font-medium rounded-full px-2 py-0.5 text-emerald-700 bg-emerald-50">
  <ArrowUpRight className="h-3 w-3" /> +12,5%
</span>

// Giảm (đỏ)
<span className="... text-rose-700 bg-rose-50">
  <ArrowDownRight className="h-3 w-3" /> -3,2%
</span>
```

### Icon container

```tsx
// Icon trong card/stat
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
  <Users className="h-[18px] w-[18px] text-blue-600" />
</div>
```

### Color palette cho icon backgrounds

| Mục đích      | Icon color         | Background         |
|---------------|--------------------|--------------------|
| Users/Primary | `text-blue-600`    | `bg-blue-50`       |
| Danger/Lock   | `text-rose-600`    | `bg-rose-50`       |
| Success/Trip  | `text-emerald-600` | `bg-emerald-50`    |
| Warning       | `text-amber-600`   | `bg-amber-50`      |
| Info/Report   | `text-violet-600`  | `bg-violet-50`     |
| Neutral       | `text-slate-600`   | `bg-slate-50`      |

### Layout grid

```tsx
// 3 charts cạnh nhau (4 + 3 + 3 = 10 cols)
<div className="grid gap-4 lg:grid-cols-10">
  <Component className="lg:col-span-4" />
  <Component className="lg:col-span-3" />
  <Component className="lg:col-span-3" />
</div>

// 3 panels cạnh nhau (5 + 4 + 3 = 12 cols)
<div className="grid gap-4 lg:grid-cols-12">
  <Component className="lg:col-span-5" />
  <Component className="lg:col-span-4" />
  <Component className="lg:col-span-3" />
</div>

// 4 stat cards
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
```

### Spacing

- Khoảng cách giữa các section: `space-y-6`
- Khoảng cách trong grid: `gap-4`
- Padding card content: `p-5` hoặc `p-6`

## Những điều KHÔNG nên làm

1. ❌ Không dùng `framer-motion` cho entrance animation (trang load phải stable ngay)
2. ❌ Không dùng gradient background, decorative orbs, wave SVG, particles
3. ❌ Không dùng `shadow-lg` / `shadow-xl` cho card — dùng `border` + `shadow-none`
4. ❌ Không dùng `font-extrabold` / `font-bold` — dùng `font-semibold` hoặc `font-medium`
5. ❌ Không dùng UPPERCASE cho titles — dùng sentence case
6. ❌ Không dùng dark tooltip background — dùng white background + border
7. ❌ Không hover effect quá flashy (golden glow, scale lớn) — dùng `hover:shadow-md` hoặc `hover:bg-muted/30`
8. ❌ Không viết toàn bộ page trong 1 file — phải tách components

## Loading skeleton

Mỗi trang cần có `loading.tsx` matching layout:

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PageLoading() {
  return (
    <div className="space-y-6">
      {/* Match header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      {/* Match content layout */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-border/50 shadow-none py-0">
            <CardContent className="p-5">
              <Skeleton className="h-9 w-9 rounded-lg mb-3" />
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## shadcn/ui components đã cài

`avatar`, `badge`, `breadcrumb`, `button`, `card`, `dropdown-menu`, `input`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `tabs`, `tooltip`
