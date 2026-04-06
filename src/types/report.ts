// -- Report Status (mirrors BE UserReportStatus enum) --
// BE returns integers: 0=Pending, 1=Reviewing, 2=Resolved, 3=Rejected, 4=Duplicate

export const REPORT_STATUS_CODES = [
  "Pending", // 0
  "Reviewing", // 1
  "Resolved", // 2
  "Rejected", // 3
  "Duplicate", // 4
] as const;

export type ReportStatusCode = (typeof REPORT_STATUS_CODES)[number];

export const REPORT_STATUS_LABELS: Record<ReportStatusCode, string> = {
  Pending: "Chờ xử lý",
  Reviewing: "Đang xem xét",
  Resolved: "Đã giải quyết",
  Rejected: "Đã từ chối",
  Duplicate: "Trùng lặp",
};

export function reportStatusFromNumber(value: number | null | undefined): ReportStatusCode | null {
  if (value === null || value === undefined) return null;
  return REPORT_STATUS_CODES[value] ?? null;
}

export function reportStatusLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const code = REPORT_STATUS_CODES[value];
    return code ? REPORT_STATUS_LABELS[code] : `Trạng thái ${value}`;
  }
  return REPORT_STATUS_LABELS[value as ReportStatusCode] ?? String(value);
}

// -- Report Target Type (mirrors BE ReportTargetTypeCode enum) --
// BE returns integers: 0=Trip, 1=Post, 2=PostComment, 3=ServicePartner, ...

export const REPORT_TARGET_TYPE_CODES = [
  "Trip", // 0
  "Post", // 1
  "PostComment", // 2
  "ServicePartner", // 3
  "RescueRequest", // 4
  "RescueRequestMessage", // 5
  "TripMessage", // 6
  "SocialCheckpoint", // 7
  "User", // 8
  "Other", // 9
] as const;

export type ReportTargetTypeCode = (typeof REPORT_TARGET_TYPE_CODES)[number];

export const REPORT_TARGET_TYPE_LABELS: Record<ReportTargetTypeCode, string> = {
  Trip: "Chuyến đi",
  Post: "Bài viết",
  PostComment: "Bình luận",
  ServicePartner: "Đối tác",
  RescueRequest: "Yêu cầu cứu hộ",
  RescueRequestMessage: "Tin nhắn cứu hộ",
  TripMessage: "Tin nhắn chuyến đi",
  SocialCheckpoint: "Checkpoint xã hội",
  User: "Người dùng",
  Other: "Khác",
};

export function reportTargetTypeLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const code = REPORT_TARGET_TYPE_CODES[value];
    return code ? REPORT_TARGET_TYPE_LABELS[code] : `Loại ${value}`;
  }
  return REPORT_TARGET_TYPE_LABELS[value as ReportTargetTypeCode] ?? String(value);
}

// -- Report Priority (mirrors BE UserReportPriority enum) --

export const REPORT_PRIORITY_CODES = ["Normal", "High"] as const;

export type ReportPriorityCode = (typeof REPORT_PRIORITY_CODES)[number];

export const REPORT_PRIORITY_LABELS: Record<ReportPriorityCode, string> = {
  Normal: "Bình thường",
  High: "Cao",
};

export function reportPriorityLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    const code = REPORT_PRIORITY_CODES[value];
    return code ? REPORT_PRIORITY_LABELS[code] : `Ưu tiên ${value}`;
  }
  return REPORT_PRIORITY_LABELS[value as ReportPriorityCode] ?? String(value);
}

// -- Resolved Action (mirrors BE ResolvedActionCode enum) --

export const RESOLVED_ACTION_CODES = [
  "None", // 0
  "Warn", // 1
  "RemoveContent", // 2
  "LockUser", // 3
  "BanUser", // 4
  "Refund", // 5
  "SuspendPartner", // 6
  "CancelRescueRequest", // 7
] as const;

export type ResolvedActionCode = (typeof RESOLVED_ACTION_CODES)[number];

export const RESOLVED_ACTION_LABELS: Record<ResolvedActionCode, string> = {
  None: "Không hành động",
  Warn: "Cảnh cáo",
  RemoveContent: "Gỡ nội dung",
  LockUser: "Khoá tài khoản",
  BanUser: "Cấm vĩnh viễn",
  Refund: "Hoàn tiền",
  SuspendPartner: "Tạm dừng đối tác",
  CancelRescueRequest: "Huỷ yêu cầu cứu hộ",
};

// -- Report Decision (mirrors BE UserReportDecision enum) --

export const REPORT_DECISION_CODES = ["Resolved", "Rejected", "Duplicate"] as const;

export type ReportDecisionCode = (typeof REPORT_DECISION_CODES)[number];

export const REPORT_DECISION_LABELS: Record<ReportDecisionCode, string> = {
  Resolved: "Giải quyết",
  Rejected: "Từ chối",
  Duplicate: "Trùng lặp",
};

// -- Reported Party Type (mirrors BE ReportedPartyTypeCode enum) --

export const REPORTED_PARTY_TYPE_CODES = ["None", "TravelerUser", "ServicePartner"] as const;

export type ReportedPartyTypeCode = (typeof REPORTED_PARTY_TYPE_CODES)[number];

export const REPORTED_PARTY_TYPE_LABELS: Record<ReportedPartyTypeCode, string> = {
  None: "Không xác định",
  TravelerUser: "Người dùng",
  ServicePartner: "Đối tác dịch vụ",
};

export function reportedPartyTypeLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    const code = REPORTED_PARTY_TYPE_CODES[value];
    return code ? REPORTED_PARTY_TYPE_LABELS[code] : `Bên ${value}`;
  }
  return REPORTED_PARTY_TYPE_LABELS[value as ReportedPartyTypeCode] ?? String(value);
}

export function resolvedActionLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    const code = RESOLVED_ACTION_CODES[value];
    return code ? RESOLVED_ACTION_LABELS[code] : `Hành động ${value}`;
  }
  return RESOLVED_ACTION_LABELS[value as ResolvedActionCode] ?? String(value);
}

export function resolvedActionsLabel(values: Array<number | string | null | undefined> | null | undefined): string {
  if (!values || values.length === 0) return "—";
  return values
    .map((value) => resolvedActionLabel(value))
    .filter(Boolean)
    .join(", ");
}

// -- DTOs --

export interface ReportReasonSummary {
  reasonId: number;
  reasonKey: string;
  displayName: string;
}

export interface ReportReasonDto {
  reasonId: number;
  reasonKey: string;
  displayName: string;
  targetScope: string | null;
  isEnabled: boolean;
}

export interface ReportListItem {
  reportId: string;
  reporterUserId: string;
  reporterFirstName: string | null;
  reporterLastName: string | null;
  reporterAvatarUrl: string | null;
  reporterName: string | null;
  reporterEmail: string | null;
  targetType: number | string | ReportTargetTypeCode;
  targetPk: string;
  reportedPartyType: number | string | ReportedPartyTypeCode | null;
  reason: ReportReasonSummary | null;
  reasonKey: string | null;
  reasonText: string | null;
  status: number | string | ReportStatusCode;
  priority: number | string | ReportPriorityCode | null;
  reasonId: number | null;
  reasonDisplayName: string | null;
  assignedToUserId: string | null;
  assignedToName: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ReportTargetDetailDto {
  targetType: string;
  targetId: string;
  displayName: string | null;
  content: string | null;
  status: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  relatedTripId: string | null;
  relatedPostId: string | null;
  relatedRescueRequestId: string | null;
  relatedPartnerId: string | null;
  metadataJson: string | null;
}

export interface ReportDetail extends ReportListItem {
  evidenceNote: string | null;
  targetSnapshot: string | null;
  resolvedAction: number | string | ResolvedActionCode | null;
  resolvedActions: Array<number | string | ResolvedActionCode> | null;
  resolvedNote: string | null;
  updatedAt: string | null;
  strikeExpiresAt: string | null;
  targetDetail: ReportTargetDetailDto | null;
}

export interface GetReportsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  targetType?: string;
  priority?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface GetMyReportsParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  targetType?: string;
}

export interface CreateReportPayload {
  targetType: number | string | ReportTargetTypeCode;
  targetId: string;
  reasonId?: number | null;
  reasonText?: string | null;
  evidenceNote?: string | null;
  reportedPartyType?: number | string | ReportedPartyTypeCode | null;
}

export interface ProcessReportPayload {
  decision: number;
  resolvedAction?: number;
  resolvedActions?: number[];
  resolvedNote?: string;
  priority?: number;
  createStrike?: boolean;
  strikeExpiresAt?: string;
}
