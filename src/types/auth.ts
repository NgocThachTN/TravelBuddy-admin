export type Role = "ADMIN" | "MODERATOR";

export interface AdminSession {
  email: string;
  role: Role;
}

/** @deprecated Use AdminSession */
export type AdminPayload = AdminSession;
