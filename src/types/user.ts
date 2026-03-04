/** Khớp UserAccountListItemDto từ backend */
export interface UserListItem {
  userId: string;
  username: string;
  role: string;
  isLocked: boolean;
  isNeedUpdateProfile: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
}

/** Khớp UserAccountDetailDto từ backend */
export interface UserDetail extends UserListItem {
  bio: string;
  experienceLevel: string;
  relativePhone: string;
  authProviders: string[];
}

/** Params cho GET /api/v1/admin/users */
export interface GetUsersParams {
  pageNumber?: number;
  pageSize?: number;
  /** Traveler | ServicePartner | Moderator | Admin */
  role?: string;
  isLocked?: boolean;
  search?: string;
}

/** Payload tạo Moderator */
export interface CreateModeratorPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/** Response tạo Moderator */
export interface CreateModeratorResponse {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  createdAt: string;
}

/** Payload khoá tài khoản */
export interface LockAccountPayload {
  reason: string;
}

/**
 * @deprecated Dùng UserListItem thay thế.
 * Giữ lại để tránh lỗi biên dịch nếu có import cũ.
 */
export type User = UserListItem;
