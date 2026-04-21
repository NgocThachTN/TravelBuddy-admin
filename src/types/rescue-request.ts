export type RescueRequestStatus =
  | "New"
  | "Received"
  | "InProgress"
  | "Arrived"
  | "Completed"
  | "Rejected"
  | "Cancelled";

export interface GetRescueRequestsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: RescueRequestStatus | "all";
  sortBy?: "createdAt" | "receivedAt" | "status";
  sortDirection?: "asc" | "desc";
}

export interface RescueRequestListItem {
  rescueRequestId: string;
  travelerUserId: string | null;
  assignedPartnerId: string | null;
  travelerDisplayName: string | null;
  travelerPhone: string | null;
  assignedPartnerName: string | null;
  vehicleType: string | null;
  vehicleName: string | null;
  vehicleNumber: string | null;
  breakdownLat: number | null;
  breakdownLng: number | null;
  distanceKm: number | null;
  servicesTotalAmount: number | null;
  travelFeeAmount: number | null;
  totalOrderAmount: number | null;
  depositPercent: number | null;
  depositAmount: number | null;
  status: RescueRequestStatus | string | null;
  cancelReason: string | null;
  rejectReasonCode: string | null;
  createdAt: string;
  receivedAt: string | null;
  inProgressAt: string | null;
  arrivedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  serviceTypes: string[];
}

export interface RescueRequestServiceItem {
  servicePartnerOfferingId: string;
  serviceType: string;
  unitPriceAmount: number;
}

export interface RescueRequestDetail extends RescueRequestListItem {
  travelerAvatarUrl: string | null;
  assignedPartnerPhone: string | null;
  assignedPartnerAvatarUrl: string | null;
  note: string | null;
  addressNote: string | null;
  commissionAmount: number | null;
  confirmationCodeGeneratedAt: string | null;
  travelerPhotoUrls: string[];
  serviceItems: RescueRequestServiceItem[];
}

export interface UpdateModeratorRescueRequestStatusPayload {
  status: Exclude<RescueRequestStatus, "New">;
  reason: string;
  rejectReasonCode?: RescueRequestRejectReasonCode;
}

export type RescueRequestRejectReasonCode =
  | "NO_CAPACITY"
  | "PERSONAL_EMERGENCY"
  | "SAFETY_CONCERN";

export const RESCUE_REQUEST_STATUSES: RescueRequestStatus[] = [
  "New",
  "Received",
  "InProgress",
  "Arrived",
  "Completed",
  "Rejected",
  "Cancelled",
];

export const RESCUE_REQUEST_MODERATOR_TARGET_STATUSES: Exclude<
  RescueRequestStatus,
  "New"
>[] = ["Received", "InProgress", "Arrived", "Completed", "Rejected", "Cancelled"];

export const RESCUE_REQUEST_REJECT_REASONS: RescueRequestRejectReasonCode[] = [
  "NO_CAPACITY",
  "PERSONAL_EMERGENCY",
  "SAFETY_CONCERN",
];

export const RESCUE_REQUEST_STATUS_LABELS: Record<string, string> = {
  New: "Mới tạo",
  Received: "Đã tiếp nhận",
  InProgress: "Đang di chuyển",
  Arrived: "Đã đến nơi",
  Completed: "Hoàn tất",
  Rejected: "Đã từ chối",
  Cancelled: "Đã hủy",
};

export const RESCUE_REQUEST_CANCEL_REASON_LABELS: Record<string, string> = {
  TRAVELER_CANCELLED: "Người đi hủy",
  NO_PARTNER_ACCEPTED: "Không có đối tác tiếp nhận",
  PARTNER_ABORTED: "Đối tác hủy",
  SYSTEM_CANCELLED: "Hệ thống hủy",
};

export const RESCUE_REQUEST_REJECT_REASON_LABELS: Record<string, string> = {
  NO_CAPACITY: "Đối tác quá tải",
  PERSONAL_EMERGENCY: "Đối tác có việc khẩn cấp",
  SAFETY_CONCERN: "Lo ngại an toàn",
};

export function rescueRequestStatusLabel(status?: string | null) {
  if (!status) return "Không rõ";
  return RESCUE_REQUEST_STATUS_LABELS[status] ?? status;
}
