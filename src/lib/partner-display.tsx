import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "amber" | "emerald" | "red" | "blue" | "secondary" | "outline";

interface StatusMeta {
  label: string;
  tone: StatusTone;
}

function getBadgeClassName(tone: StatusTone) {
  if (tone === "amber") {
    return "bg-amber-100 text-amber-800 hover:bg-amber-100";
  }
  if (tone === "emerald") {
    return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
  }
  if (tone === "red") {
    return "bg-red-100 text-red-800 hover:bg-red-100";
  }
  if (tone === "blue") {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }
  if (tone === "secondary") {
    return "bg-secondary text-secondary-foreground hover:bg-secondary";
  }
  return "";
}

export function getRegistrationStatusMeta(status?: string): StatusMeta {
  const normalized = status?.toLowerCase();

  if (normalized === "draft") {
    return { label: "Bản nháp", tone: "secondary" };
  }
  if (normalized === "submitted" || normalized === "inreview" || normalized === "pending") {
    return { label: "Chờ duyệt", tone: "amber" };
  }
  if (normalized === "approved") {
    return { label: "Đã duyệt", tone: "emerald" };
  }
  if (normalized === "rejected") {
    return { label: "Từ chối", tone: "red" };
  }
  if (normalized === "requestresubmission") {
    return { label: "Yêu cầu bổ sung hồ sơ", tone: "blue" };
  }
  if (normalized === "cancelled") {
    return { label: "Đã hủy", tone: "secondary" };
  }

  return { label: status || "Không xác định", tone: "outline" };
}

export function getServicePartnerStatusMeta(status?: string): StatusMeta {
  const normalized = status?.toLowerCase();

  if (normalized === "active") {
    return { label: "Đang hoạt động", tone: "emerald" };
  }
  if (normalized === "inactive") {
    return { label: "Chưa kích hoạt", tone: "secondary" };
  }
  if (normalized === "suspended") {
    return { label: "Tạm khóa", tone: "red" };
  }
  if (normalized === "deleted") {
    return { label: "Đã xóa", tone: "secondary" };
  }

  return { label: status || "Không xác định", tone: "outline" };
}

export function getVerificationStatusLabel(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "none") return "Chưa xác minh";
  if (normalized === "pending") return "Đang chờ xác minh";
  if (normalized === "verified") return "Đã xác minh";
  if (normalized === "rejected") return "Xác minh bị từ chối";
  if (normalized === "expired") return "Đã hết hạn";

  return status || "Không xác định";
}

export function getVehicleServiceScopeLabel(scope?: string) {
  const normalized = scope?.toLowerCase();

  if (normalized === "twowheels") return "Xe hai bánh";
  if (normalized === "fourwheels") return "Xe bốn bánh";

  return scope || "-";
}

export function renderStatusBadge(
  status: string | undefined,
  getMeta: (status?: string) => StatusMeta,
) {
  const meta = getMeta(status);

  return (
    <Badge
      variant={meta.tone === "outline" ? "outline" : "default"}
      className={cn(meta.tone !== "outline" && getBadgeClassName(meta.tone))}
    >
      {meta.label}
    </Badge>
  );
}

export function formatWardLabel(wardName?: string, wardCode?: number) {
  if (wardName) return wardName;
  if (wardCode != null) return `Phường/Xã mã ${wardCode}`;
  return "-";
}

export function formatFullAddress(parts: Array<string | number | null | undefined>) {
  const normalized = parts
    .map((part) => (part == null ? "" : String(part).trim()))
    .filter(Boolean);

  return normalized.length > 0 ? normalized.join(", ") : "-";
}
