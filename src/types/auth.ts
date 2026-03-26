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
}

export interface MyProfileData {
  username?: string;
  profile?: MyProfileInfo;
}

/** @deprecated Use AdminSession */
export type AdminPayload = AdminSession;
