// ── Trip Status Codes (mirrors BE TripStatusCode enum) ──
// BE returns integers (0=Draft, 1=Processing, 2=Recruiting, ...)

export const TRIP_STATUS_CODES = [
  "Draft",        // 0
  "Processing",   // 1
  "Recruiting",   // 2
  "AlmostFull",   // 3
  "Full",          // 4
  "Confirmed",    // 5
  "Ongoing",      // 6
  "Completed",    // 7
  "Cancelled",    // 8
  "Hidden",       // 9
  "InReview",     // 10
] as const;

export type TripStatusCode = (typeof TRIP_STATUS_CODES)[number];

export const TRIP_STATUS_LABELS: Record<TripStatusCode, string> = {
  Draft: "Bản nháp",
  Processing: "Đang xử lý",
  Recruiting: "Đang tuyển",
  AlmostFull: "Gần đầy",
  Full: "Đã đầy",
  Confirmed: "Đã xác nhận",
  Ongoing: "Đang diễn ra",
  Completed: "Hoàn thành",
  Cancelled: "Đã huỷ",
  Hidden: "Đã ẩn",
  InReview: "Chờ duyệt",
};

/** Convert numeric status from BE to string code */
export function tripStatusFromNumber(value: number | null | undefined): TripStatusCode | null {
  if (value === null || value === undefined) return null;
  return TRIP_STATUS_CODES[value] ?? null;
}

/** Get Vietnamese label from numeric status */
export function tripStatusLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const code = TRIP_STATUS_CODES[value];
    return code ? TRIP_STATUS_LABELS[code] : `Trạng thái ${value}`;
  }
  // if already a string code
  return TRIP_STATUS_LABELS[value as TripStatusCode] ?? String(value);
}

// ── Moderation Status ──
// BE returns integers: 0=Draft, 1=PendingReview, 2=Approved, 3=Rejected, 4=Hidden

export const MODERATION_STATUS_CODES = [
  "Draft",          // 0
  "PendingReview",  // 1
  "Approved",       // 2
  "Rejected",       // 3
  "Hidden",         // 4
] as const;

export type TripModerationStatus = (typeof MODERATION_STATUS_CODES)[number];

export const MODERATION_STATUS_LABELS: Record<TripModerationStatus, string> = {
  Draft: "Bản nháp",
  PendingReview: "Chờ duyệt",
  Approved: "Đã duyệt",
  Rejected: "Bị từ chối",
  Hidden: "Đã ẩn",
};

/** Convert numeric moderation status from BE to string */
export function moderationStatusFromNumber(value: number | null | undefined): TripModerationStatus | null {
  if (value === null || value === undefined) return null;
  return MODERATION_STATUS_CODES[value] ?? null;
}

export function moderationStatusLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const code = MODERATION_STATUS_CODES[value];
    return code ? MODERATION_STATUS_LABELS[code] : `Trạng thái ${value}`;
  }
  return MODERATION_STATUS_LABELS[value as TripModerationStatus] ?? String(value);
}

export type ContentScanStatusCode = 0 | 1 | 2 | 3;

export const SCAN_STATUS_LABELS: Record<number, string> = {
  0: "Chưa quét",
  1: "Sạch",
  2: "Cảnh báo",
  3: "Lỗi",
};

export type ModerationDecisionCode =
  | "Approve"
  | "Reject"
  | "Hide"
  | "NeedsEdit";

export const AI_MODERATION_STATUS_CODES = [
  "Open",
  "Assigned",
  "InReview",
  "Resolved",
  "Dismissed",
  "Failed",
] as const;

export type AiModerationStatusCode = (typeof AI_MODERATION_STATUS_CODES)[number];

export const AI_MODERATION_STATUS_LABELS: Record<AiModerationStatusCode, string> = {
  Open: "Mới tạo",
  Assigned: "Đã giao",
  InReview: "Đang duyệt",
  Resolved: "Đã xử lý",
  Dismissed: "Đã đóng",
  Failed: "Lỗi",
};

export function aiModerationStatusLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const code = AI_MODERATION_STATUS_CODES[value];
    return code ? AI_MODERATION_STATUS_LABELS[code] : `Trạng thái ${value}`;
  }
  return AI_MODERATION_STATUS_LABELS[value as AiModerationStatusCode] ?? String(value);
}

// ── Participant & Checkpoint enums ──

// BE returns TripRoleCode as integer:
// 0=Host, 1=LeadRider, 2=Support, 3=Member, 4=Navigator, 5=Medic, 6=Photographer, 7=TailRider

export const TRIP_ROLE_CODES = [
  "Host",         // 0
  "LeadRider",    // 1
  "Support",      // 2
  "Member",       // 3
  "Navigator",    // 4
  "Medic",        // 5
  "Photographer", // 6
  "TailRider",    // 7
] as const;

export type TripRoleCode = (typeof TRIP_ROLE_CODES)[number] | number;

export const TRIP_ROLE_LABELS: Record<string, string> = {
  Host: "Trưởng đoàn",
  LeadRider: "Dẫn đầu",
  Support: "Hỗ trợ",
  Member: "Thành viên",
  Navigator: "Hoa tiêu",
  Medic: "Y tế",
  Photographer: "Nhiếp ảnh",
  TailRider: "Chốt đoàn",
};

export function tripRoleLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const code = TRIP_ROLE_CODES[value];
    return code ? TRIP_ROLE_LABELS[code] : `Vai trò ${value}`;
  }
  return TRIP_ROLE_LABELS[value] ?? String(value);
}

// BE returns ParticipantStatusCode as integer: 0=Joined, 1=Left, 2=Removed, 3=Banned
export type ParticipantStatusCode = number | string;

export const PARTICIPANT_STATUS_LABELS: Record<number, string> = {
  0: "Đã tham gia",
  1: "Đã rời",
  2: "Bị xoá",
  3: "Bị cấm",
};

export type CheckpointTypeCode =
  | "Start"
  | "Stop"
  | "Destination"
  | "Return"
  | "End"
  | "Waypoint"
  | "Rest"
  | "Food"
  | "Cafe"
  | "Fuel"
  | "Repair"
  | "Parking"
  | "Hotel"
  | "Camping"
  | "Toilet"
  | "Viewpoint"
  | "Attraction"
  | "Water"
  | "Emergency"
  | "Hospital"
  | "Police"
  | "Hazard"
  | "Checkpoint"
  | "Ferry"
  | "Other";

export type MediaTypeCode = "Image" | "Video" | "Audio" | "File" | "Other" | number;

// ── Trip List Item (from TripListItemResponseDto) ──

export interface TripCategorySummary {
  name: string | null;
  iconUrl: string | null;
}

export interface TripListItem {
  tripId: string;
  title: string | null;
  coverImageUrl: string | null;
  ownerUserId: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  ownerAvatarUrl: string | null;
  startTime: string | null;
  startLat: number | null;
  startLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  vehicles: TripCategorySummary[];
  tripTypeCategories: TripCategorySummary[];
  minParticipants: number | null;
  maxParticipants: number | null;
  currentMemberCount?: number | null;
  pendingJoinRequestCount?: number | null;
  currentStatus: number | TripStatusCode | null;
  distanceKm?: number | null;
}

// ── Trip Detail (from TripDetailResponseDto) ──

export interface TripOwner {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  experienceLevel: number | null;
}

export interface TripItinerary {
  itineraryId: string;
  provider: string | null;
  providerRouteId: string | null;
  providerLink: string | null;
  originLat: number | null;
  originLng: number | null;
  destinationLat: number | null;
  destinationLng: number | null;
  travelMode: string | null;
  distanceM: number | null;
  durationS: number | null;
  waypoints: string | null;
}

export interface TripVehicleDetail {
  tripVehicleId: string;
  vehicleType: string | null;
}

export interface TripTypeDetail {
  tripTypeId: string;
  tripType: string | null;
}

export interface TripExpenseCategory {
  tripExpenseCategoryId: string;
  tripCheckpointId: string | null;
  expenseType: string | null;
  estimatedCost: number | null;
  note: string | null;
  isRequired: boolean;
}

export interface TripCheckpoint {
  tripCheckpointId: string;
  lat: number;
  lng: number;
  sequenceNo: number;
  plannedAt: string | null;
  note: string | null;
  tripCheckpointType: CheckpointTypeCode;
  status: string;
  provinceCode: number | null;
  districtCode: number | null;
  wardCode: number | null;
  locationName: string | null;
  displayAddress: string | null;
  mappingStatus: string | null;
  mappingReason: string | null;
  geocodeProvider: string | null;
  geocodeConfidence: number | null;
  costs: TripExpenseCategory[];
}

export interface TripParticipant {
  tripParticipantId: string;
  userId: string | null;
  roleInTrip: TripRoleCode;
  participantStatusId: ParticipantStatusCode | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface MediaAttachment {
  mediaAttachmentId: string;
  mediaUrl: string;
  mediaType: MediaTypeCode;
  sortOrder: number | null;
  createdAt: string;
}

export interface TripDetail {
  tripId: string;
  title: string | null;
  description: string | null;
  rule: string | null;
  itemRequired: string | null;
  startTime: string | null;
  endTime: string | null;
  backTime: string | null;
  registrationDeadline: string | null;
  minParticipants: number | null;
  maxParticipants: number | null;
  minParticipantsLevel: number | null;
  maxParticipantsLevel: number | null;
  isApprovalMemberEnable: boolean | null;
  currentStatus: number | TripStatusCode | null;
  depositAmount: number | null;
  depositCurrency: string | null;
  moderationStatus: number | TripModerationStatus | null;
  scanStatus: number | ContentScanStatusCode | null;
  publishedAt: string | null;
  qualityScore: number | null;
  createdAt: string;
  participantCount: number;
  owner: TripOwner | null;
  itinerary: TripItinerary | null;
  tripVehicles: TripVehicleDetail[];
  tripTypes: TripTypeDetail[];
  checkpoints: TripCheckpoint[];
  expenseCategories: TripExpenseCategory[];
  participants: TripParticipant[];
  mediaAttachments: MediaAttachment[];
}

// ── Query Params ──

export interface GetTripsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface UpdateAdminTripPayload {
  title?: string;
  description?: string;
  rule?: string;
  itemRequired?: string;
  startTime?: string;
  endTime?: string;
  backTime?: string;
  registrationDeadline?: string;
  minParticipants?: number;
  maxParticipants?: number;
  isApprovalMemberEnable?: boolean;
  currentStatus?: TripStatusCode | number;
}

// ── Moderation ──

export interface ReviewTripModerationPayload {
  decision: ModerationDecisionCode;
  decisionNote?: string;
}

export interface TripModerationDecisionResponse {
  taskId: string;
  tripId: string;
  decision: ModerationDecisionCode;
  decisionNote: string | null;
  moderationStatus: TripModerationStatus | null;
  currentStatus: TripStatusCode | null;
  scanStatus: ContentScanStatusCode | null;
  reviewedAt: string;
}

export interface GetTripModerationTasksParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  scanStatus?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface TripModerationTaskListItem {
  taskId: string;
  tripId: string;
  tripTitle: string | null;
  tripOwnerName: string | null;
  aiScore: number | null;
  aiLabels: string | null;
  aiStatus: number | ContentScanStatusCode | string | null;
  priority: number;
  status: number | AiModerationStatusCode | string;
  tripCurrentStatus: number | TripStatusCode | null;
  tripModerationStatus: number | TripModerationStatus | null;
  createdAt: string;
  assignedToName: string | null;
}

export interface TripModerationFlaggedItem {
  severity: "low" | "medium" | "high" | null;
  confidence: number | null;
  contentPath: string | null;
  evidence: string | null;
  reason: string | null;
  whatReviewerShouldCheck: string | null;
  suggestedReviewerAction: string | null;
}

export interface TripModerationTaskDetail {
  taskId: string;
  tripId: string;
  batchId?: string | null;
  status: number | AiModerationStatusCode | string;
  priority: number;
  createdAt: string;
  assignedToName: string | null;

  aiScore: number | null;
  aiLabels: string | null;
  aiStatus: number | ContentScanStatusCode | string | null;
  scanErrorMessage: string | null;

  success: boolean | null;
  moderationCode: "Clean" | "Flagged" | null;
  reviewPriority: "low" | "medium" | "high" | null;
  overallSummary: string | null;
  recommendedDecision: "approve" | "review" | "reject" | null;
  flaggedItems: TripModerationFlaggedItem[];
  safeSignals: string[];
  missingContext: string[];

  tripExists: boolean;
  isTripDeleted: boolean;
  tripTitle: string | null;
  tripDescription: string | null;
  tripRule: string | null;
  tripItemRequired: string | null;
  tripOwnerName: string | null;
  tripCurrentStatus: number | TripStatusCode | null;
  tripModerationStatus: number | TripModerationStatus | null;
  tripCreatedAt: string | null;
  tripStartTime: string | null;
  tripEndTime: string | null;
  tripRegistrationDeadline: string | null;
}
