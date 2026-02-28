import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";

// ── Mock Data Store ──────────────────────────────────────────────────
// Replace this with real database queries when backend is ready.

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "locked";
  createdAt: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: "usr_001",
    name: "Nguyen Van A",
    email: "vana@example.com",
    role: "traveler",
    status: "active",
    createdAt: "2025-06-15T08:30:00Z",
  },
  {
    id: "usr_002",
    name: "Tran Thi B",
    email: "thib@example.com",
    role: "traveler",
    status: "active",
    createdAt: "2025-07-01T10:00:00Z",
  },
  {
    id: "usr_003",
    name: "Le Van C",
    email: "vanc@example.com",
    role: "host",
    status: "locked",
    createdAt: "2025-07-20T14:15:00Z",
  },
  {
    id: "usr_004",
    name: "Pham Thi D",
    email: "thid@example.com",
    role: "traveler",
    status: "active",
    createdAt: "2025-08-05T09:45:00Z",
  },
  {
    id: "usr_005",
    name: "Hoang Van E",
    email: "vane@example.com",
    role: "host",
    status: "active",
    createdAt: "2025-09-12T16:20:00Z",
  },
  {
    id: "usr_006",
    name: "Vo Thi F",
    email: "thif@example.com",
    role: "traveler",
    status: "locked",
    createdAt: "2025-10-03T11:30:00Z",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

async function authenticateAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const payload = await verifyAdminToken(token);
  return payload !== null;
}

// ── GET /api/admin/users ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!(await authenticateAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(MOCK_USERS);
}

// ── PATCH /api/admin/users ───────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!(await authenticateAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, action } = await req.json();

  if (!userId || !["lock", "unlock"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid payload. Provide userId and action (lock|unlock)." },
      { status: 400 }
    );
  }

  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  user.status = action === "lock" ? "locked" : "active";

  return NextResponse.json(user);
}
