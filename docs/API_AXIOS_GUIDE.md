# Hướng Dẫn Gọi API — Axios Setup

> Tài liệu mô tả cách cấu hình và sử dụng Axios trong dự án **TravelBuddy Admin**.

---

## Tổng Quan

Dự án sử dụng **2 axios instance** được khai báo tập trung tại `src/lib/axios.ts`:

| Instance | Dùng ở đâu | Base URL | Mục đích |
|----------|------------|----------|----------|
| `api` | Client-side (components, pages, `src/lib/api.ts`) | `NEXT_PUBLIC_API_BASE_URL` (mặc định `""` = same-origin) | Gọi tới các Next.js API routes nội bộ |
| `backendApi` | Server-side (Next.js API routes trong `src/app/api/`) | `BACKEND_API_URL` (mặc định `http://localhost:5000`) | Gọi thẳng tới backend thật |

### Luồng request

```
Browser (Component)
  │
  │  api.get("/api/admin/subscriptions")
  ▼
Next.js API Route (src/app/api/admin/subscriptions/route.ts)
  │
  │  backendApi.get("/api/v1/admin/subscription-packages")
  ▼
Backend Server (BACKEND_API_URL)
```

---

## File Cấu Hình: `src/lib/axios.ts`

```typescript
import axios from "axios";

// Client-side — gọi tới Next.js API routes (cùng origin)
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Server-side — gọi thẳng tới backend
export const backendApi = axios.create({
  baseURL: process.env.BACKEND_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});
```

### Cấu hình mặc định

- **`api`**: `withCredentials: true` để tự động gửi cookie (JWT httpOnly) kèm mọi request.
- **`backendApi`**: Không cần `withCredentials` vì server-side tự đọc cookie và đính `Authorization` header.
- Cả hai đều set `Content-Type: application/json`.

---

## Biến Môi Trường

| Biến | File | Giá trị mẫu | Mô tả |
|------|------|-------------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `.env.local` | `""` (trống) | Client gọi cùng origin, không cần set |
| `BACKEND_API_URL` | `.env.local` | `https://travelbuddy.tienlab.me` | URL backend thật |

---

## Cách Sử Dụng

### 1. Client-side — dùng `api`

Import từ `@/lib/axios` hoặc gọi qua các hàm đã wrap sẵn trong `@/lib/api.ts`.

#### Gọi trực tiếp

```typescript
import { api } from "@/lib/axios";

// GET
const { data } = await api.get("/api/admin/users");

// GET với query params
const { data } = await api.get("/api/admin/subscriptions", {
  params: { pageNumber: 1, pageSize: 10, includeDisabled: true },
});

// POST
const { data } = await api.post("/api/auth/admin/login", {
  phoneNumber: "0912345678",
  password: "mypassword",
});

// PUT
const { data } = await api.put(`/api/admin/subscriptions/${id}`, payload);

// PATCH
const { data } = await api.patch("/api/admin/users", { userId, action: "lock" });

// DELETE
await api.delete(`/api/admin/subscriptions/${id}`);
```

#### Gọi qua hàm đã wrap (khuyến khích)

```typescript
import { fetchUsers, loginAdmin, fetchSubscriptionPackages } from "@/lib/api";

const users = await fetchUsers();
const result = await loginAdmin("0912345678", "password");
const packages = await fetchSubscriptionPackages(1, 10, true);
```

> **Khuyến khích**: Luôn wrap API call thành hàm riêng trong `src/lib/api.ts` rồi import vào component, thay vì gọi `api.get(...)` trực tiếp trong component.

### 2. Server-side — dùng `backendApi`

Dùng trong các file `route.ts` tại `src/app/api/`.

```typescript
import { backendApi } from "@/lib/axios";
import { AxiosError } from "axios";

// GET với auth header
const { data } = await backendApi.get("/api/v1/admin/subscription-packages", {
  params: { PageNumber: 1, PageSize: 10 },
  headers: { Authorization: `Bearer ${token}` },
});

// POST với auth header
const { data } = await backendApi.post(
  "/api/v1/admin/subscription-packages",
  body,
  { headers: { Authorization: `Bearer ${token}` } }
);

// DELETE
await backendApi.delete(`/api/v1/admin/subscription-packages/${id}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## Xử Lý Lỗi

### Client-side

Axios tự throw error khi response status >= 400. Dùng `try/catch`:

```typescript
import { AxiosError } from "axios";

try {
  const { data } = await api.post("/api/auth/admin/login", credentials);
} catch (err) {
  if (err instanceof AxiosError) {
    console.error(err.response?.data?.error); // message từ server
    console.error(err.response?.status);       // HTTP status code
  }
}
```

### Server-side (trong API routes)

```typescript
import { AxiosError } from "axios";

try {
  const { data } = await backendApi.get("/api/v1/admin/...", { ... });
  return NextResponse.json(data);
} catch (err) {
  if (err instanceof AxiosError) {
    const msg = err.response?.data?.message ?? "Lỗi server";
    return NextResponse.json({ error: msg }, { status: err.response?.status ?? 500 });
  }
  return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
}
```

---

## Thêm API Mới

Khi cần thêm endpoint mới, làm theo 3 bước:

### Bước 1 — Thêm route constant vào `src/lib/constants.ts`

```typescript
export const API_ROUTES = {
  AUTH_LOGIN: "/api/auth/admin/login",
  AUTH_LOGOUT: "/api/auth/admin/logout",
  ADMIN_USERS: "/api/admin/users",
  ADMIN_SUBSCRIPTIONS: "/api/admin/subscriptions",
  ADMIN_TRIPS: "/api/admin/trips",           // ← thêm mới
} as const;
```

### Bước 2 — Tạo Next.js API route (nếu cần proxy tới backend)

Tạo file `src/app/api/admin/trips/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { backendApi } from "@/lib/axios";
import { AxiosError } from "axios";

export async function GET(req: NextRequest) {
  // xác thực token ...

  try {
    const { data } = await backendApi.get("/api/v1/admin/trips", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      return NextResponse.json(
        { error: err.response?.data?.message ?? "Lỗi" },
        { status: err.response?.status ?? 500 }
      );
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
```

### Bước 3 — Thêm hàm client vào `src/lib/api.ts`

```typescript
export async function fetchTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>(API_ROUTES.ADMIN_TRIPS);
  return data;
}
```

---

## Cấu Trúc File Liên Quan

```
src/
├── lib/
│   ├── axios.ts          ← 2 axios instance (api + backendApi)
│   ├── api.ts            ← Các hàm gọi API client-side (dùng `api`)
│   └── constants.ts      ← API_ROUTES constants
├── app/
│   └── api/
│       ├── auth/admin/
│       │   ├── login/route.ts    ← Proxy login (dùng `backendApi`)
│       │   └── logout/route.ts
│       └── admin/
│           ├── users/route.ts
│           └── subscriptions/
│               ├── route.ts      ← GET + POST (dùng `backendApi`)
│               └── [id]/route.ts ← GET + PUT + DELETE (dùng `backendApi`)
```

---

## Lưu Ý

- **Không** gọi `backendApi` từ client-side (component/page). Luôn gọi qua `api` tới Next.js API route rồi proxy sang backend.
- **Không** hardcode URL backend trong code. Luôn dùng biến môi trường `BACKEND_API_URL`.
- Khi thêm endpoint mới, nhớ cập nhật `API_ROUTES` trong `src/lib/constants.ts`.
- Axios tự `JSON.stringify` body và parse response, không cần gọi `JSON.stringify()` hay `.json()` thủ công.
- Dùng `params` option thay vì nối query string thủ công:

```typescript
// ✅ Đúng
api.get("/api/admin/subscriptions", { params: { pageNumber: 1 } });

// ❌ Sai — nối chuỗi thủ công
api.get(`/api/admin/subscriptions?pageNumber=${pageNumber}`);
```
