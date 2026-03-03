# Hướng Dẫn Quản Lý Types — TravelBuddy Admin

> Tài liệu quy định cách tổ chức và sử dụng các kiểu dữ liệu (interface, type) trong dự án.

---

## Quy Tắc Chung

> **Mọi interface/type dùng chung đều phải nằm trong `src/types/`.**

- **KHÔNG** định nghĩa interface/type trong file component, lib, hay route nếu nó được dùng ở nhiều nơi.
- Chỉ giữ lại type **cục bộ** (component Props, local filter types) trong chính file đó nếu nó chỉ dùng duy nhất tại 1 file.

---

## Cấu Trúc Folder `src/types/`

```
src/types/
├── index.ts          ← Barrel export — import tất cả từ đây
├── auth.ts           ← Role, AdminSession, AdminPayload
├── user.ts           ← User
├── subscription.ts   ← SubscriptionPackage, CreateSubscriptionPackagePayload, ...
├── api.ts            ← BePagedWrapper<T>, BeWrapper<T> (generic API response)
├── nav.ts            ← NavItem, NavGroup
└── dashboard.ts      ← TimeRange
```

### Mô tả từng file

| File | Chứa gì | Dùng ở đâu |
|------|---------|------------|
| `auth.ts` | `Role`, `AdminSession`, `AdminPayload` | Auth, RBAC, sidebar, navbar, middleware |
| `user.ts` | `User` | UserTable, API routes |
| `subscription.ts` | `SubscriptionPackage`, `SubscriptionPackagesResponse`, `CreateSubscriptionPackagePayload`, `UpdateSubscriptionPackagePayload` | SubscriptionTable, SubscriptionForm, API |
| `api.ts` | `BePagedWrapper<T>`, `BeWrapper<T>` | Wrapper chung cho response từ backend |
| `nav.ts` | `NavItem`, `NavGroup` | Sidebar navigation |
| `dashboard.ts` | `TimeRange` | Dashboard charts |
| `index.ts` | Re-export tất cả | Entry point duy nhất để import |

---

## Cách Import

### Luôn import từ `@/types` (qua barrel export)

```typescript
import type { User, Role, SubscriptionPackage } from "@/types";
```

### KHÔNG import trực tiếp từ file con (trừ khi ở `proxy.ts` dùng relative path)

```typescript
// ❌ Sai
import type { User } from "@/types/user";

// ✅ Đúng
import type { User } from "@/types";
```

### Ngoại lệ: `proxy.ts` (edge runtime)

File `proxy.ts` chạy ở edge runtime nên dùng relative path:

```typescript
import type { Role } from "./types/auth";
```

---

## Khi Nào Đưa Type Vào `src/types/`

| Tình huống | Đưa vào `src/types/`? |
|------------|----------------------|
| Interface dùng ở >= 2 file | **Có** |
| Interface chỉ dùng trong 1 file (Props, local) | Không, giữ tại file đó |
| Generic response wrapper (dùng ở api.ts, routes) | **Có** → `types/api.ts` |
| Type cho feature mới (vd: Trip, Partner) | **Có** → tạo file mới `types/trip.ts` |

---

## Thêm Type Mới

### Bước 1 — Tạo hoặc mở file type tương ứng

Ví dụ thêm type cho Trip:

```typescript
// src/types/trip.ts
export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: "draft" | "published" | "completed" | "cancelled";
  createdAt: string;
}
```

### Bước 2 — Export từ `index.ts`

```typescript
// src/types/index.ts
export type { Trip } from "./trip";
```

### Bước 3 — Import và sử dụng

```typescript
import type { Trip } from "@/types";
```

---

## Backward Compatibility

Các file `src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/rbac.ts`, `src/lib/nav.ts` đều **re-export** types từ `@/types`. Điều này đảm bảo code cũ import từ `@/lib/api` vẫn hoạt động:

```typescript
// Cả hai cách đều work
import type { User } from "@/types";           // ✅ Khuyến khích
import type { User } from "@/lib/api";          // ✅ Vẫn work (backward compatible)
```

> **Khuyến khích**: Dần chuyển sang import từ `@/types` để thống nhất.

---

## Types Cục Bộ (Giữ Tại File)

Các type sau chỉ dùng trong 1 file nên giữ nguyên tại chỗ:

| Type | File | Lý do |
|------|------|-------|
| `Props` | `SubscriptionForm.tsx` | Component props cục bộ |
| `DashboardShellProps` | `dashboard-shell.tsx` | Component props cục bộ |
| `AppSidebarProps` | `app-sidebar.tsx` | Component props cục bộ |
| `NavbarProps` | `Navbar.tsx` | Component props cục bộ |
| `StatusFilter`, `RoleFilter` | `UserTable.tsx` | Filter state cục bộ |
| `PageProps` | `[userId]/page.tsx` | Next.js page params |
| `Params` | `[id]/route.ts` | Next.js route params |
| `MockUser` | `users/route.ts` | Mock data cục bộ |
| `SidebarContextProps` | `sidebar.tsx` | UI library internal |
