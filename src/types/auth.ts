export type Role = "ADMIN" | "MODERATOR";

export interface AdminSession {
  phone: string;
  role: Role;
}

/** @deprecated Use AdminSession */
export type AdminPayload = AdminSession;
