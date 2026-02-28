# Cấu Trúc Dự Án — TravelBuddy Admin

> Tài liệu mô tả cấu trúc thư mục và quy ước tổ chức code của dự án.

## Tổng Quan

Dự án sử dụng **Next.js App Router** với folder `dashboard/` làm prefix cho tất cả trang quản trị. Mỗi trang có **CSS Module** riêng bên cạnh **Tailwind CSS**.

---

## Cây Thư Mục

```
src/
├── app/
│   ├── (auth)/                    # Route group — Xác thực (không ảnh hưởng URL)
│   │   └── login/
│   │       ├── page.tsx           # Trang đăng nhập  →  /login
│   │       └── login.module.css
│   │
│   ├── dashboard/                 # Folder thực — URL prefix /dashboard
│   │   ├── components/            # Component dùng chung cho dashboard
│   │   │   ├── sidebar.tsx        # Thanh điều hướng bên trái
│   │   │   ├── sidebar.module.css
│   │   │   ├── Navbar.tsx         # Thanh điều hướng trên cùng
│   │   │   └── ui/                # Component UI tái sử dụng
│   │   │       ├── Avatar.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       └── StatCard.tsx
│   │   │
│   │   ├── page.tsx               # Bảng điều khiển  →  /dashboard
│   │   ├── dashboard.module.css
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── layout.tsx             # Layout chung: Sidebar + Navbar + {children}
│   │   │
│   │   ├── users/                 # Quản lý người dùng  →  /dashboard/users
│   │   │   ├── page.tsx
│   │   │   ├── users.module.css
│   │   │   ├── components/
│   │   │   │   └── UserTable.tsx
│   │   │   └── [userId]/
│   │   │       ├── page.tsx       # Chi tiết  →  /dashboard/users/:userId
│   │   │       └── layout.tsx
│   │   │
│   │   ├── trips/                 # Quản lý chuyến đi  →  /dashboard/trips
│   │   │   ├── page.tsx
│   │   │   ├── trips.module.css
│   │   │   └── components/
│   │   │
│   │   ├── reports/               # Báo cáo & Khiếu nại  →  /dashboard/reports
│   │   │   ├── page.tsx
│   │   │   ├── reports.module.css
│   │   │   └── components/
│   │   │
│   │   ├── transactions/          # Quản lý giao dịch  →  /dashboard/transactions
│   │   │   ├── page.tsx
│   │   │   ├── transactions.module.css
│   │   │   └── components/
│   │   │
│   │   └── subscriptions/         # Gói đăng ký  →  /dashboard/subscriptions
│   │       ├── page.tsx
│   │       ├── subscriptions.module.css
│   │       └── components/
│   │
│   ├── api/                       # API Routes
│   │   ├── admin/users/route.ts   # GET/PATCH người dùng
│   │   └── auth/admin/
│   │       ├── login/route.ts     # POST đăng nhập
│   │       └── logout/route.ts    # POST đăng xuất
│   │
│   ├── layout.tsx                 # Root layout (html, body, fonts)
│   ├── page.tsx                   # Root page → redirect /login
│   └── globals.css                # Tailwind + design tokens
│
├── features/                      # Feature modules (mở rộng sau)
├── hooks/                         # Custom React hooks (mở rộng sau)
├── shared/                        # Tiện ích, types dùng chung (mở rộng sau)
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── constants.ts
│   └── utils.ts
│
└── proxy.ts                       # Middleware xác thực
```

---

## Quy Ước Quan Trọng

### 1. Routing

| Folder            | Mục đích               | URL prefix    |
| ----------------- | --------------------- | ------------- |
| `(auth)`          | Xác thực (login)      | Không có      |
| `dashboard/`      | Trang quản trị        | `/dashboard`  |

> `(auth)` là route group (không ảnh hưởng URL). `dashboard/` là folder thực, tạo URL prefix `/dashboard/*`.

### 2. CSS Modules

- Mỗi trang có 1 file CSS Module riêng: `[tên-trang].module.css`
- Import dưới dạng `import styles from "./[tên-trang].module.css"`
- Dùng cho container/layout cơ bản, Tailwind xử lý chi tiết

### 3. Đường Dẫn (Routes)

| Route                      | Mô tả                |
| -------------------------- | --------------------- |
| `/login`                   | Đăng nhập             |
| `/dashboard`               | Bảng điều khiển       |
| `/dashboard/users`         | Quản lý người dùng    |
| `/dashboard/users/:id`     | Chi tiết người dùng   |
| `/dashboard/trips`         | Quản lý chuyến đi     |
| `/dashboard/reports`       | Báo cáo & Khiếu nại  |
| `/dashboard/transactions`  | Quản lý giao dịch     |
| `/dashboard/subscriptions` | Gói đăng ký Planner   |
| `/dashboard/settings`      | Cài đặt hệ thống     |

### 4. Tổ Chức Component

- **`src/app/dashboard/components/`** — Component dùng chung cho dashboard (sidebar, Navbar)
- **`src/app/dashboard/components/ui/`** — Component UI tái sử dụng (Button, Card, Badge, Avatar, StatCard)
- **`src/app/dashboard/[trang]/components/`** — Component riêng cho từng trang (ví dụ: `users/components/UserTable.tsx`)
- Mỗi folder trang có thể có folder `components/` riêng chứa component chỉ dùng trong trang đó

### 5. Thư Mục Mở Rộng

| Thư mục      | Mục đích                                          |
| ------------ | ------------------------------------------------- |
| `features/`  | Feature modules (tách logic theo tính năng)       |
| `hooks/`     | Custom React hooks                                |
| `shared/`    | Types, constants, utilities dùng chung            |

---

## Công Nghệ Sử Dụng

| Công nghệ       | Phiên bản | Mục đích                     |
| ---------------- | --------- | ---------------------------- |
| Next.js          | 16.x      | Framework React (App Router) |
| React            | 19.x      | UI Library                   |
| TypeScript       | 5.x       | Type safety                  |
| Tailwind CSS     | 4.x       | Utility-first CSS            |
| framer-motion    | 12.x      | Animation (login page)       |
| recharts         | 3.x       | Charts (dashboard)           |
| lucide-react     | 0.575+    | Icon system                  |
| jose             | —         | JWT xác thực                 |
| clsx + tw-merge  | —         | Class merging utility        |
