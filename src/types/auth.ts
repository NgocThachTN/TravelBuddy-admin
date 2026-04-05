export type Role = "ADMIN" | "MODERATOR";

export interface AdminSession {
  email: string;
  role: Role;
}

export interface MyProfileInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  relativePhone?: string;
  gender?: string;
  dateOfBirth?: string;
  [key: string]: unknown;
}

export interface MyProfileData {
  username?: string;
  profile?: MyProfileInfo | null;
  [key: string]: unknown;
}

/** @deprecated Use AdminSession */
export type AdminPayload = AdminSession;
