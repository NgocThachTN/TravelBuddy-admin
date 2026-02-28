# Quy Chuẩn Code — TravelBuddy Admin

> Tài liệu này quy định các tiêu chuẩn và quy ước lập trình cho dự án **TravelBuddy Admin**. Mọi thành viên trong nhóm phát triển cần tuân thủ để đảm bảo tính nhất quán, dễ bảo trì và mở rộng.

---

## ⚠️ Nguyên tắc quan trọng nhất: ĐƠN GIẢN

> **Code phải đơn giản đến mức người mới học lập trình cũng hiểu được.**

Đây là nguyên tắc xuyên suốt toàn bộ dự án. Khi viết code, luôn tự hỏi: _"Một sinh viên năm nhất đọc đoạn này có hiểu không?"_

### Quy tắc cụ thể

- **KHÔNG** dùng các hàm phức tạp, kỹ thuật nâng cao khi có cách viết đơn giản hơn.
- **Ưu tiên `for` / `if-else` rõ ràng** thay vì chain nhiều method liên tiếp (`.filter().map().reduce()`...).
- **KHÔNG** lồng ternary operator (`a ? b ? c : d : e`). Dùng `if-else` cho rõ ràng.
- **Tách logic phức tạp thành các hàm nhỏ** với tên gọi mô tả rõ ý nghĩa.
- **Viết comment giải thích** cho bất kỳ đoạn code nào không hiển nhiên.
- **Một hàm chỉ làm một việc.** Nếu hàm dài hơn 30 dòng, cân nhắc tách nhỏ.
- **Đặt tên biến / hàm rõ nghĩa**, không viết tắt khó hiểu.

```typescript
// ❌ Sai — quá phức tạp, khó đọc
const result = users
  .filter(u => u.status === "active")
  .reduce((acc, u) => ({ ...acc, [u.role]: [...(acc[u.role] || []), u] }), {} as Record<string, User[]>);

// ✅ Đúng — đơn giản, ai cũng hiểu
const activeUsers = [];
for (const user of users) {
  if (user.status === "active") {
    activeUsers.push(user);
  }
}

const groupedByRole: Record<string, User[]> = {};
for (const user of activeUsers) {
  if (!groupedByRole[user.role]) {
    groupedByRole[user.role] = [];
  }
  groupedByRole[user.role].push(user);
}
```

```typescript
// ❌ Sai — ternary lồng nhau
const label = status === "active" ? "Hoạt động" : status === "locked" ? "Bị khóa" : "Không rõ";

// ✅ Đúng — if-else hoặc hàm riêng
function getStatusLabel(status: string): string {
  if (status === "active") return "Hoạt động";
  if (status === "locked") return "Bị khóa";
  return "Không rõ";
}
```

```typescript
// ❌ Sai — tên biến tắt, khó hiểu
const fn = (d: unknown[]) => d.filter((x: any) => !!x);

// ✅ Đúng — tên rõ ràng, dễ đọc
function removeEmptyItems(items: unknown[]): unknown[] {
  const result = [];
  for (const item of items) {
    if (item) {
      result.push(item);
    }
  }
  return result;
}
```

---

## Mục lục

1. [Công nghệ sử dụng](#1-công-nghệ-sử-dụng)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Quy tắc đặt tên](#3-quy-tắc-đặt-tên)
4. [TypeScript](#4-typescript)
5. [React & Next.js](#5-react--nextjs)
6. [Tailwind CSS & Styling](#6-tailwind-css--styling)
7. [Component](#7-component)
8. [API & Xử lý dữ liệu](#8-api--xử-lý-dữ-liệu)
9. [Xác thực (Authentication)](#9-xác-thực-authentication)
10. [Quản lý lỗi](#10-quản-lý-lỗi)
11. [Hiệu suất](#11-hiệu-suất)
12. [Git & Workflow](#12-git--workflow)
13. [Ngôn ngữ giao diện](#13-ngôn-ngữ-giao-diện)

---

## 1. Công nghệ sử dụng

| Công nghệ      | Phiên bản | Mục đích                        |
| --------------- | --------- | ------------------------------- |
| Next.js         | 16.x      | Framework React (App Router)    |
| React           | 19.x      | Thư viện UI                     |
| TypeScript      | 5.x       | Kiểu dữ liệu tĩnh             |
| Tailwind CSS    | 4.x       | Utility-first CSS               |
| Recharts        | 3.x       | Biểu đồ (Dashboard)            |
| framer-motion   | 12.x      | Animation                       |
| lucide-react    | latest    | Icon system                     |
| jose            | 6.x       | JWT xác thực                    |
| clsx + twMerge  | latest    | Gộp class CSS thông minh        |

---

## 2. Cấu trúc thư mục

Dự án dùng folder `dashboard/` thực làm URL prefix `/dashboard/*` cho tất cả trang quản trị, và route group `(auth)` cho trang login.

```
src/
├── app/
│   ├── (auth)/                    # Route group — Xác thực
│   │   └── login/
│   │       ├── page.tsx           # Trang đăng nhập  →  /login
│   │       └── login.module.css
│   │
│   ├── dashboard/                 # Folder thực — URL prefix /dashboard
│   │   ├── components/            # Component dùng chung cho dashboard
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar.module.css
│   │   │   ├── Navbar.tsx
│   │   │   └── ui/
│   │   │       ├── Avatar.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── StatCard.tsx
│   │   ├── page.tsx               # Bảng điều khiển  →  /dashboard
│   │   ├── dashboard.module.css
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── layout.tsx             # Layout chung: Sidebar + Navbar
│   │   ├── users/                 # →  /dashboard/users
│   │   │   ├── page.tsx
│   │   │   ├── users.module.css
│   │   │   ├── components/
│   │   │   │   └── UserTable.tsx
│   │   │   └── [userId]/
│   │   │       ├── page.tsx       # →  /dashboard/users/:userId
│   │   │       └── layout.tsx
│   │   ├── trips/                 # →  /dashboard/trips
│   │   ├── reports/               # →  /dashboard/reports
│   │   ├── transactions/          # →  /dashboard/transactions
│   │   └── subscriptions/         # →  /dashboard/subscriptions
│   │
│   ├── api/
│   │   ├── admin/users/route.ts
│   │   └── auth/admin/
│   │       ├── login/route.ts
│   │       └── logout/route.ts
│   │
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Root → redirect /login
│   └── globals.css
│
├── features/
├── hooks/
├── shared/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── constants.ts
│   └── utils.ts
│
└── proxy.ts
```

### Nguyên tắc tổ chức

- **`dashboard/`** — Folder thực tạo URL prefix `/dashboard/*`. Tất cả trang quản trị nằm dưới đây.
- **`(auth)`** — Route group cho login (không ảnh hưởng URL).
- **CSS Modules** — Mỗi trang có 1 file `[tên].module.css` riêng, import dưới dạng `import styles from "./[tên].module.css"`. Dùng cho container/layout cơ bản, Tailwind xử lý chi tiết.
- **`app/`** — Chỉ chứa page, layout, loading, error. KHÔNG chứa logic business.
- **`dashboard/components/`** — Component dùng chung cho dashboard (sidebar, Navbar).
- **`dashboard/components/ui/`** — Component UI tái sử dụng (Button, Card, Badge, Avatar, StatCard).
- **`dashboard/[trang]/components/`** — Component riêng cho từng trang (ví dụ: `users/components/UserTable.tsx`).
- **`lib/`** — Hàm tiện ích, hằng số, logic xác thực. KHÔNG import React.
- **`features/`, `hooks/`, `shared/`** — Thư mục mở rộng cho feature modules, custom hooks, types/utilities dùng chung.
- Mỗi file chỉ export **một component chính** (có thể kèm sub-components nội bộ).

---

## 3. Quy tắc đặt tên

### File & Thư mục

| Loại                | Quy tắc        | Ví dụ                     |
| -------------------- | --------------- | -------------------------- |
| Component React      | PascalCase      | `UserTable.tsx`            |
| Page / Layout        | camelCase       | `page.tsx`, `layout.tsx`   |
| API Route            | camelCase       | `route.ts`                 |
| Utility / Lib        | camelCase       | `utils.ts`, `api.ts`       |
| Hằng số              | camelCase       | `constants.ts`             |
| Thư mục component    | PascalCase hoặc camelCase | `ui/`, `admin/`  |
| Dynamic route        | `[paramName]`   | `[userId]/`                |

### Biến & Hàm

```typescript
// ✅ Đúng
const userName = "Nguyen Van A";          // camelCase cho biến
const MAX_RETRY_COUNT = 3;               // UPPER_SNAKE_CASE cho hằng số
function handleSubmit() {}                // camelCase cho hàm
function UserCard() {}                    // PascalCase cho component

// ❌ Sai
const user_name = "...";                 // Không dùng snake_case
const Usercard = () => {};               // Component phải PascalCase đầy đủ
```

### Interface & Type

```typescript
// ✅ Đúng - PascalCase, không prefix "I"
interface UserProfile {
  id: string;
  name: string;
}

type ButtonVariant = "primary" | "outline" | "ghost";

// ❌ Sai
interface IUserProfile {}    // Không prefix "I"
type button_variant = ...;   // Phải PascalCase
```

---

## 4. TypeScript

### Quy tắc chung

- **Strict mode bật** (`"strict": true` trong tsconfig).
- **KHÔNG** dùng `any`. Nếu chưa biết kiểu, dùng `unknown` rồi thu hẹp kiểu.
- Ưu tiên `interface` cho object shape, `type` cho union/intersection.
- Export type riêng biệt khi cần: `export type { UserProfile }`.

### Props Component

```typescript
// ✅ Props định nghĩa bằng interface, đặt ngay trước component
interface ButtonProps {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export default function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  // ...
}
```

### Enum & Union

```typescript
// ✅ Ưu tiên union type thay vì enum
type UserStatus = "active" | "locked";
type UserRole = "traveler" | "host" | "admin";

// ❌ Tránh enum (trừ khi cần reverse mapping)
enum UserStatus { Active, Locked }
```

---

## 5. React & Next.js

### Server vs Client Components

```typescript
// Server Component (mặc định) — cho data fetching, SEO
// Không cần directive
export default async function DashboardPage() {
  const data = await fetchData();
  return <div>{/* render */}</div>;
}

// Client Component — cho interactivity, hooks, browser API
"use client";
export default function UserTable() {
  const [search, setSearch] = useState("");
  // ...
}
```

**Nguyên tắc:**
- Mặc định dùng **Server Component** (không thêm `"use client"`).
- Chỉ dùng **Client Component** khi cần: `useState`, `useEffect`, event handlers, browser API.
- Đẩy `"use client"` xuống component nhỏ nhất có thể.

### App Router

- Sử dụng **App Router** (thư mục `app/`), KHÔNG dùng Pages Router.
- Mỗi route cần có: `page.tsx` (bắt buộc), `loading.tsx` (khuyến nghị), `error.tsx` (cho route quan trọng).
- Layout dùng để chia sẻ UI chung (sidebar, navbar).
- `params` trong page luôn là `Promise` - phải `await`:

```typescript
interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { userId } = await params;
  // ...
}
```

### Hooks

- Chỉ gọi hooks ở **top level** của component.
- Custom hooks đặt prefix `use`: `useAuth()`, `useUsers()`.
- Hooks file đặt trong `lib/` hoặc `hooks/`.

---

## 6. Tailwind CSS & Styling

### Design Tokens

Tất cả màu sắc, spacing, và biến thiết kế được định nghĩa trong `globals.css` với `@theme inline`:

```css
@theme inline {
  --color-primary: #FCD240;
  --color-primary-hover: #E8B837;
  --color-primary-dark: #9B872F;
  --color-foreground: #1B2532;
  --color-muted-foreground: #667085;
  /* ... xem globals.css cho đầy đủ */
}
```

**KHÔNG** hardcode giá trị màu trong component. Luôn dùng token:

```tsx
// ✅ Đúng
<div className="text-foreground bg-card border-border" />

// ❌ Sai
<div className="text-[#1B2532] bg-[#FFFFFF] border-[#E1E8F0]" />
```

### Utility `cn()`

Dùng hàm `cn()` từ `lib/utils.ts` để gộp class có điều kiện:

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-xl border border-border p-4",       // Class cơ sở
  variant === "primary" && "bg-primary",         // Có điều kiện
  className                                       // Cho phép override
)} />
```

### Responsive Design

- Mobile-first: viết class cho mobile trước, breakpoint lớn hơn sau.
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
```

### Spacing & Border Radius

- Dùng `rounded-xl` (12px) cho card, button, input.
- Dùng `rounded-2xl` (16px) cho card lớn, dialog.
- Spacing: `gap-4` (16px) giữa các phần tử, `space-y-6` (24px) giữa section.

---

## 7. Component

### Cấu trúc Component

```typescript
"use client"; // Chỉ khi cần

import { useState } from "react";
// 1. React/Next imports
// 2. Third-party imports
// 3. Internal imports (@/...)
// 4. Types/interfaces
// 5. Constants

interface MyComponentProps {
  // props
}

export default function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 1. Hooks
  // 2. Derived state / computed values
  // 3. Event handlers
  // 4. Return JSX

  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// Sub-components (nếu có) đặt bên dưới
function SubComponent() {}
```

### UI Components (`components/ui/`)

Mỗi UI component cần:

1. **Props rõ ràng** với giá trị mặc định hợp lý.
2. **Prop `className`** để cho phép tùy chỉnh từ bên ngoài.
3. **Dùng `cn()`** để gộp class.
4. **Accessible** — aria labels, keyboard navigation khi cần.

```typescript
// Mẫu UI component
interface BadgeProps {
  variant?: "default" | "success" | "destructive" | "warning" | "info" | "outline";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={cn(BASE_CLASSES, VARIANT_MAP[variant], className)}>
      {children}
    </span>
  );
}
```

### Icon

- Dùng **lucide-react** cho tất cả icon.
- Size mặc định: `h-4 w-4` (16px) cho inline, `h-5 w-5` (20px) cho nav.
- KHÔNG dùng emoji trong UI (trừ branding logo 🌏).

```tsx
import { Users, Settings, ChevronRight } from "lucide-react";

<Users className="h-4 w-4 text-muted-foreground" />
```

---

## 8. API & Xử lý dữ liệu

### API Routes

- Đặt trong `app/api/` theo cấu trúc RESTful.
- Luôn validate input.
- Trả về JSON nhất quán:

```typescript
// Thành công
return Response.json({ data: users }, { status: 200 });

// Lỗi
return Response.json({ error: "Unauthorized" }, { status: 401 });
```

### Gọi API từ Client

- Hàm API tập trung trong `lib/api.ts`.
- Dùng `fetch` với error handling:

```typescript
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/admin/users", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  const { data } = await res.json();
  return data;
}
```

### Proxy & Middleware

- `proxy.ts` đóng vai trò **middleware xác thực** — kiểm tra JWT cookie trước khi cho truy cập dashboard routes.
- `next.config.ts` chứa **redirects** từ URL cũ `/admin/*` sang URL mới `/*`.
- Tất cả API call đến backend thông qua API Routes (`app/api/`).
- KHÔNG gọi trực tiếp đến backend URL từ client.

---

## 9. Xác thực (Authentication)

- JWT lưu trong **httpOnly cookie** (`tb_admin_session`).
- Thời hạn token: **8 giờ**.
- Middleware (`proxy.ts`) kiểm tra token cho tất cả route dưới `/dashboard/*`.
- Tất cả trang quản trị nằm dưới prefix `/dashboard/` — middleware chỉ cần match `/dashboard/:path*`.
- Redirect từ URL cũ `/admin/*` → `/dashboard/*` được xử lý qua `next.config.ts` redirects.
- Logout xóa cookie và redirect về `/login`.

```typescript
// Kiểm tra auth trong Server Component
import { verifySession } from "@/lib/auth";

const session = await verifySession();
if (!session) redirect("/login");
```

---

## 10. Quản lý lỗi

### Error Boundaries

- Mỗi route chính cần file `error.tsx`:

```typescript
"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Đã xảy ra lỗi</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
```

### Try-Catch

- Luôn bắt lỗi khi gọi API hoặc thao tác async.
- Hiển thị thông báo lỗi thân thiện cho người dùng.
- Log lỗi chi tiết (console hoặc logging service).

```typescript
try {
  await performAction();
} catch (err) {
  setError(err instanceof Error ? err.message : "Thao tác thất bại");
}
```

---

## 11. Hiệu suất

### Tối ưu hóa

- **Lazy load** component nặng với `dynamic()`:

```typescript
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
```

- **Image optimization**: Dùng `next/image` thay `<img>`.
- **Memo**: Dùng `React.memo`, `useMemo`, `useCallback` khi component render lại không cần thiết — nhưng KHÔNG dùng bừa bãi.

### Loading States

- Mọi thao tác async cần có loading indicator.
- Dùng skeleton loading cho trang (xem `dashboard/loading.tsx`).
- Disable button khi đang xử lý, hiển thị spinner.

---

## 12. Git & Workflow

### Nhánh (Branch)

| Nhánh         | Mục đích                    |
| ------------- | --------------------------- |
| `main`        | Production, luôn ổn định    |
| `develop`     | Nhánh phát triển chính      |
| `feature/*`   | Tính năng mới               |
| `fix/*`       | Sửa lỗi                    |
| `hotfix/*`    | Sửa lỗi khẩn (production)  |

### Commit Message

Theo format **Conventional Commits**:

```
<type>(<scope>): <mô tả ngắn>

[body - mô tả chi tiết nếu cần]
```

**Type:**

| Type       | Mô tả                               |
| ---------- | ------------------------------------ |
| `feat`     | Tính năng mới                        |
| `fix`      | Sửa lỗi                             |
| `refactor` | Tái cấu trúc (không thay đổi logic) |
| `style`    | Thay đổi giao diện / CSS            |
| `docs`     | Tài liệu                            |
| `chore`    | Cấu hình, dependencies              |
| `test`     | Thêm / sửa test                     |

**Ví dụ:**

```
feat(dashboard): thêm biểu đồ tăng trưởng người dùng
fix(auth): sửa lỗi token hết hạn không redirect
refactor(UserTable): tách logic filter thành custom hook
style(sidebar): cải thiện animation collapse
```

### Pull Request

- Title rõ ràng, mô tả thay đổi.
- Liên kết issue/task liên quan.
- Phải pass build (`next build`) trước khi merge.
- Cần ít nhất 1 review từ thành viên khác.

---

## 13. Ngôn ngữ giao diện

- Toàn bộ UI hiển thị bằng **tiếng Việt**.
- `<html lang="vi">` trong root layout.
- Ngày tháng format theo `vi-VN`:

```typescript
new Date().toLocaleDateString("vi-VN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});
```

- Code (biến, hàm, comment kỹ thuật) viết bằng **tiếng Anh**.
- Chuỗi hiển thị cho người dùng viết bằng **tiếng Việt**.

---

## Checklist trước khi commit

- [ ] Không có lỗi TypeScript (`npx tsc --noEmit`)
- [ ] Build thành công (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Không hardcode màu sắc — dùng design tokens
- [ ] Component có prop `className` để tùy chỉnh
- [ ] Loading state cho mọi thao tác async
- [ ] Text UI bằng tiếng Việt
- [ ] Không dùng `any`
- [ ] Import path dùng alias `@/` thay vì relative path dài

---

> **Cập nhật lần cuối:** Tháng 2, 2026
