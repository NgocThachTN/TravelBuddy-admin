# Hướng Dẫn Xử Lý Lỗi & Validation Khi Gắn API

> **QUY TẮC BẮT BUỘC**: Mỗi khi gắn API mới, developer **PHẢI** đọc code backend (Controller, Service, Validator) để nắm rõ mọi lỗi có thể xảy ra, rồi xử lý đầy đủ trên frontend. Không được chỉ bắt lỗi chung chung.

---

## Mục lục

1. [Quy trình bắt buộc khi gắn API](#1-quy-trình-bắt-buộc-khi-gắn-api)
2. [Cấu trúc lỗi chuẩn từ Backend](#2-cấu-trúc-lỗi-chuẩn-từ-backend)
3. [HTTP Status Codes — ý nghĩa & cách xử lý](#3-http-status-codes--ý-nghĩa--cách-xử-lý)
4. [Validation phía Client (trước khi gọi API)](#4-validation-phía-client-trước-khi-gọi-api)
5. [Xử lý lỗi từ Backend (sau khi gọi API)](#5-xử-lý-lỗi-từ-backend-sau-khi-gọi-api)
6. [Pattern chuẩn cho proxy route (Next.js API Route)](#6-pattern-chuẩn-cho-proxy-route-nextjs-api-route)
7. [Pattern chuẩn cho component gọi API](#7-pattern-chuẩn-cho-component-gọi-api)
8. [Danh sách lỗi thường gặp từ Backend](#8-danh-sách-lỗi-thường-gặp-từ-backend)
9. [Checklist trước khi merge](#9-checklist-trước-khi-merge)

---

## 1. Quy trình bắt buộc khi gắn API

Mỗi khi gắn API mới, **PHẢI** thực hiện đủ các bước sau:

### Bước 1 — Đọc Backend

- Mở **Controller** tương ứng → xem endpoint nhận gì, trả gì, status code nào.
- Mở **Service** → xem tất cả các nhánh `throw` exception (NotFoundException, BadRequestException, ForbiddenException, ConflictException, ValidationException…).
- Mở **Validator** (nếu có FluentValidation hoặc DataAnnotations) → xem từng trường validate gì, message tiếng Việt là gì.
- **Ghi lại** danh sách tất cả lỗi có thể xảy ra (status code + message + field errors).

### Bước 2 — Validation phía Client

- Tạo hàm validate trên FE **trùng khớp** với các rule ở BE.
- Hiển thị lỗi **theo từng trường** (field-level), không chỉ show 1 message chung chung trên đầu form.

### Bước 3 — Xử lý lỗi từ Backend

- Trong `catch` block, đọc đúng cấu trúc lỗi từ response (`message`, `errors`).
- Map từng status code ra hành vi phù hợp (show toast, show field errors, redirect, countdown…).
- **KHÔNG BAO GIỜ** chỉ viết `catch (err) { setError("Có lỗi xảy ra") }`.

### Bước 4 — Test lỗi

- Tự test ít nhất: submit form trống, nhập sai format, nhập dữ liệu gây conflict, dùng account không có quyền.

---

## 2. Cấu trúc lỗi chuẩn từ Backend

Backend **luôn** trả lỗi theo cấu trúc `ErrorResponse`:

```json
{
  "statusCode": 400,
  "message": "Thông báo lỗi tiếng Việt",
  "errors": {
    "email": ["Email là bắt buộc", "Email không hợp lệ"],
    "password": ["Mật khẩu là bắt buộc"]
  },
  "detail": "[Chỉ hiện trong Development]",
  "traceId": "correlation-id",
  "timestamp": "2026-03-12T10:00:00Z"
}
```

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `statusCode` | `number` | HTTP status code |
| `message` | `string` | Thông báo lỗi chính (luôn có), tiếng Việt |
| `errors` | `Record<string, string[]>` \| `null` | Lỗi theo từng trường (chỉ có khi validation fail) |
| `detail` | `string` \| `null` | Chi tiết exception (chỉ có ở môi trường Development) |
| `traceId` | `string` | ID để trace log |
| `timestamp` | `string` | Thời điểm lỗi xảy ra |

### TypeScript type

```typescript
interface BackendErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  detail?: string;
  traceId?: string;
  timestamp?: string;
}
```

---

## 3. HTTP Status Codes — ý nghĩa & cách xử lý

| Status | Exception ở BE | Ý nghĩa | Cách xử lý trên FE |
|--------|---------------|---------|-------------------|
| **400** | `BadRequestException`, `ValidationException` | Dữ liệu không hợp lệ | Hiển thị `message` + `errors` theo từng trường |
| **401** | `UnauthorizedAccessException` | Chưa đăng nhập / token hết hạn | Redirect về `/login`, show message |
| **403** | `ForbiddenException` | Không có quyền / tài khoản bị khóa | Show message. Nếu là lockout → parse seconds, show countdown |
| **404** | `NotFoundException` | Không tìm thấy resource | Show message hoặc redirect về danh sách |
| **409** | `ConflictException` | Xung đột (trùng dữ liệu, trạng thái không cho phép) | Show message, có thể cần refresh data |
| **500** | Unhandled exceptions | Lỗi server | Show "Lỗi máy chủ, vui lòng thử lại sau" |
| **503** | `ServiceUnavailableException` | Dịch vụ bên ngoài không khả dụng | Show message, cho retry |

---

## 4. Validation phía Client (trước khi gọi API)

### Nguyên tắc

- **Mirror BE validation**: Mọi rule validate ở BE phải có tương ứng ở FE.
- **Hiển thị lỗi theo trường**: Dùng state `fieldErrors` để show lỗi dưới mỗi input.
- **Xoá lỗi khi user sửa**: Khi user thay đổi giá trị input, xoá lỗi của trường đó ngay.

### Ví dụ — cách đọc BE validator rồi tạo FE validation

**BE (FluentValidation / DataAnnotations):**

```csharp
// Ở BE: AdminLoginRequestDto
[Required(ErrorMessage = "Email là bắt buộc")]
[EmailAddress(ErrorMessage = "Email không hợp lệ")]
public string Email { get; set; }

[Required(ErrorMessage = "Mật khẩu là bắt buộc")]
public string Password { get; set; }
```

**FE (tương ứng):**

```typescript
function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};

  if (!email.trim()) {
    errors.email = "Email là bắt buộc";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Email không hợp lệ";
  }

  if (!password) {
    errors.password = "Mật khẩu là bắt buộc";
  }

  return errors;
}
```

### Cách hiển thị field error trong UI

```tsx
<input
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    // Xoá lỗi khi user sửa
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
  }}
  className={fieldErrors.email ? "border-destructive ..." : "border-border ..."}
/>
{fieldErrors.email && (
  <p className="mt-1.5 text-xs text-destructive">{fieldErrors.email}</p>
)}
```

---

## 5. Xử lý lỗi từ Backend (sau khi gọi API)

### 5.1. Trong Proxy Route (Next.js API Route)

Proxy route **PHẢI** forward đúng status code và message từ BE:

```typescript
// src/app/api/admin/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendApi } from "@/lib/axios";
import { AxiosError } from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = await backendApi.post("/api/v1/example", body);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status ?? 500;
      const beData = err.response?.data;
      return NextResponse.json(
        {
          error: beData?.message ?? "Có lỗi xảy ra",
          errors: beData?.errors ?? null, // Forward field errors!
        },
        { status }  // Forward status code gốc!
      );
    }
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
```

> **⚠️ SAI phổ biến**: Convert tất cả error thành status 400. Phải giữ nguyên status code gốc (401, 403, 404, 409…) để FE xử lý đúng.

### 5.2. Trong Component (Client-side)

```typescript
import { AxiosError } from "axios";

try {
  await callApi(payload);
} catch (err) {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const data = err.response?.data;

    // 1. Lỗi validation có field-level errors
    if (status === 400 && data?.errors) {
      setFieldErrors(data.errors);
      return;
    }

    // 2. Lỗi 403 lockout (có countdown)
    if (status === 403) {
      const seconds = extractLockoutSeconds(data?.error ?? "");
      if (seconds > 0) {
        setLockoutSeconds(seconds);
      }
    }

    // 3. Lỗi chung — show message
    setError(data?.error ?? data?.message ?? "Có lỗi xảy ra");
  }
}
```

### 5.3. Parse lockout countdown (nếu có)

Khi BE trả message dạng `"...tạm khóa 30 giây"`, FE cần parse số giây và hiển thị countdown:

```typescript
function extractLockoutSeconds(message: string): number {
  const match = message.match(/(\d+)\s*giây/);
  return match ? parseInt(match[1], 10) : 0;
}

// Countdown timer
useEffect(() => {
  if (lockoutSeconds <= 0) return;
  const timer = setInterval(() => {
    setLockoutSeconds((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        setError(null);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [lockoutSeconds]);
```

---

## 6. Pattern chuẩn cho proxy route (Next.js API Route)

### GET (lấy danh sách / chi tiết)

```typescript
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { data } = await backendApi.get("/api/v1/resource", {
      headers: { Authorization: `Bearer ${token}` },
      params: Object.fromEntries(req.nextUrl.searchParams),
    });

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status ?? 500;
      const beData = err.response?.data;
      return NextResponse.json(
        { error: beData?.message ?? "Có lỗi xảy ra", errors: beData?.errors ?? null },
        { status },
      );
    }
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
```

### POST / PATCH / DELETE

```typescript
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { data } = await backendApi.post("/api/v1/resource", body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status ?? 500;
      const beData = err.response?.data;
      return NextResponse.json(
        { error: beData?.message ?? "Có lỗi xảy ra", errors: beData?.errors ?? null },
        { status },
      );
    }
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
```

> **Lưu ý**: Luôn forward `errors` (field-level) từ BE. Không chỉ forward `message`.

---

## 7. Pattern chuẩn cho component gọi API

### Form submit với đầy đủ validation & error handling

```tsx
"use client";

import { useState, FormEvent, useCallback } from "react";
import { AxiosError } from "axios";

export default function ExampleForm() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Bước 1: Client-side validation (mirror BE rules)
  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Tên là bắt buộc";
    } else if (formData.name.trim().length > 100) {
      errors.name = "Tên không được quá 100 ký tự";
    }

    if (!formData.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Email không hợp lệ";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Bước 2: Submit với error handling đầy đủ
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      await createExample(formData);
      // Success handling...
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const data = err.response?.data;

        // Lỗi validation từ BE (có field-level errors)
        if (status === 400 && data?.errors) {
          const beFieldErrors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(data.errors)) {
            beFieldErrors[field] = (messages as string[])[0]; // Lấy message đầu tiên
          }
          setFieldErrors(beFieldErrors);
          return;
        }

        // Lỗi 409 conflict
        if (status === 409) {
          setError(data?.error ?? "Dữ liệu bị xung đột, vui lòng thử lại");
          return;
        }

        // Lỗi chung
        setError(data?.error ?? data?.message ?? "Có lỗi xảy ra");
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Input with field error */}
      <div>
        <input
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (fieldErrors.name) {
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }
          }}
          className={fieldErrors.name ? "border-destructive" : "border-border"}
        />
        {fieldErrors.name && (
          <p className="mt-1.5 text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : "Gửi"}
      </button>
    </form>
  );
}
```

---

## 8. Danh sách lỗi thường gặp từ Backend

### Auth (Xác thực)

| Message | Status | Khi nào |
|---------|--------|---------|
| `Email là bắt buộc` | 400 | Không nhập email |
| `Email không hợp lệ` | 400 | Sai format email |
| `Mật khẩu là bắt buộc` | 400 | Không nhập password |
| `Email hoặc mật khẩu không chính xác` | 401 | Sai thông tin đăng nhập |
| `Số điện thoại hoặc mật khẩu không chính xác` | 401 | Sai thông tin đăng nhập (phone) |
| `Tài khoản của bạn đã bị khóa` | 403 | Tài khoản bị khoá vĩnh viễn |
| `Tài khoản bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau {N} giây` | 403 | Đang trong thời gian lockout |
| `Đăng nhập sai quá nhiều lần. Tài khoản bị tạm khóa {N} giây` | 403 | Vừa bị lockout |
| `Mã OTP không hợp lệ hoặc đã hết hạn` | 400 | OTP sai hoặc hết 5 phút |
| `Refresh token không hợp lệ hoặc đã bị thu hồi` | 401 | Token bị revoke |
| `Refresh token đã hết hạn, vui lòng đăng nhập lại` | 401 | Token hết hạn |

### Quyền hạn

| Message | Status | Khi nào |
|---------|--------|---------|
| `Bạn không có quyền hạn để thao tác` | 403 | Không đủ quyền (default ForbiddenException) |
| `Bạn không có quyền truy cập trang quản trị` | 403 | Role không phải Admin/Moderator (FE route handler tự thêm) |

### Resource (Tài nguyên)

| Message | Status | Khi nào |
|---------|--------|---------|
| `Không tìm thấy [resource]` | 404 | Resource không tồn tại |
| `[Resource] đã tồn tại` | 409 | Tạo trùng |
| `Không thể [action] khi trạng thái là [status]` | 409 | Trạng thái không cho phép thao tác |

### Ví dụ (Wallet / Ví)

| Message | Status | Khi nào |
|---------|--------|---------|
| `Mã PIN không chính xác.` | 400 | Sai PIN |
| `Mã PIN phải gồm đúng 6 chữ số.` | 400 | PIN sai format |
| `Số dư ví không đủ để rút tiền và thanh toán phí.` | 400 | Không đủ tiền |
| `Tài khoản ngân hàng này đã tồn tại.` | 409 | Thêm bank account trùng |

### Ví dụ (Trip / Chuyến đi)

| Message | Status | Khi nào |
|---------|--------|---------|
| `Thời gian bắt đầu phải trước thời gian kết thúc` | 400 | StartTime >= EndTime |
| `Hạn đăng ký phải trước thời gian bắt đầu` | 400 | RegistrationDeadline >= StartTime |
| `Phải có ít nhất 1 điểm xuất phát` | 400 | Không có checkpoint Start |
| `Phải có ít nhất 1 điểm đến` | 400 | Không có checkpoint Destination |

---

## 9. Checklist trước khi merge

Khi gắn API mới, kiểm tra các mục sau trước khi tạo PR:

- [ ] **Đã đọc Controller + Service + Validator ở BE** — liệt kê được tất cả lỗi có thể xảy ra
- [ ] **Proxy route forward đúng status code** — không convert tất cả thành 400
- [ ] **Proxy route forward `errors` (field-level)** — không chỉ forward `message`
- [ ] **Client-side validation mirror BE rules** — required, format, min/max length…
- [ ] **Hiển thị field-level errors** — lỗi hiện dưới input tương ứng, không chỉ 1 message chung
- [ ] **Xoá field error khi user sửa** — onChange clear error của trường đó
- [ ] **Xử lý đúng từng status code** — 401 (redirect login), 403 (show message / countdown), 404 (show not found), 409 (show conflict)
- [ ] **Xử lý lockout countdown** — nếu API có rate limit / account lockout
- [ ] **Test: submit form trống** — field errors hiện đúng
- [ ] **Test: nhập sai format** — email, phone, PIN…
- [ ] **Test: gây lỗi 409** — tạo trùng dữ liệu
- [ ] **Test: không có quyền** — dùng account Moderator gọi API chỉ Admin mới được

---

## Tóm tắt

```
1. ĐỌC BE   → Biết tất cả lỗi có thể xảy ra
2. VALIDATE  → Mirror BE rules ở client-side  
3. FORWARD   → Proxy route giữ nguyên status + errors
4. EXTRACT   → Component đọc đúng cấu trúc ErrorResponse
5. DISPLAY   → Field-level errors + banner + countdown
6. TEST      → Thử tất cả các case lỗi
```

> **Nhớ**: Không bao giờ viết `catch { setError("Có lỗi") }`. Luôn đọc BE trước, xử lý từng case cụ thể.
