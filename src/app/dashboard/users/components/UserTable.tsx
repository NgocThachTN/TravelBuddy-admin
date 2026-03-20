"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { fetchUsers, lockUser, unlockUser } from "@/lib/api";
import type { UserListItem, GetUsersParams } from "@/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  Users,
} from "lucide-react";
import PaginationControl from "@/components/pagination-control";

const PAGE_SIZE = 20;

type RoleFilter = "all" | "Traveler" | "ServicePartner" | "Moderator" | "Admin";
type StatusFilter = "all" | "active" | "locked";

interface UserTableProps {
  fixedRole?: Exclude<RoleFilter, "all">;
  hideRoleFilter?: boolean;
  totalLabel?: string;
}

/* ── Avatar / name helpers ── */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];
function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(user: UserListItem) {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return (user.username ?? "?").slice(0, 2).toUpperCase();
}
function getDisplayName(user: UserListItem) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || "(Chưa đặt tên)";
}

const ROLE_LABELS: Record<string, string> = {
  Traveler: "Du khách",
  ServicePartner: "Đối tác",
  Moderator: "Điều phối viên",
  Admin: "Quản trị viên",
};

/* ── Lock Dialog ── */
interface LockDialogProps {
  user: UserListItem | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading: boolean;
}
function LockDialog({ user, onClose, onConfirm, loading }: LockDialogProps) {
  const [reason, setReason] = useState("");

  async function handleConfirm() {
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent key={user?.userId ?? "lock-dialog"}>
        <DialogHeader>
          <DialogTitle>Khoá tài khoản</DialogTitle>
          <DialogDescription>
            Người dùng <span className="font-semibold">{user ? getDisplayName(user) : ""}</span> sẽ bị khoá.
            Vui lòng nhập lý do khoá.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="lock-reason">Lý do khoá</Label>
          <Textarea
            id="lock-reason"
            placeholder="Nhập lý do khoá tài khoản..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-right text-xs text-muted-foreground">{reason.length}/500</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Huỷ
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || loading}
            onClick={handleConfirm}
          >
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Xác nhận khoá
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ── */
export default function UserTable({
  fixedRole,
  hideRoleFilter = false,
  totalLabel = "người dùng",
}: UserTableProps) {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(fixedRole ?? "all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  // Debounce search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [search]);

  useEffect(() => {
    if (fixedRole) {
      setRoleFilter(fixedRole);
    }
  }, [fixedRole]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, statusFilter]);

  const [lockTarget, setLockTarget] = useState<UserListItem | null>(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const params: GetUsersParams = {
        pageNumber: p,
        pageSize: PAGE_SIZE,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (fixedRole) {
        params.role = fixedRole;
      } else if (roleFilter !== "all") {
        params.role = roleFilter;
      }
      if (statusFilter !== "all") params.isLocked = statusFilter === "locked";

      const result = await fetchUsers(params);
      setUsers(result.data.items);
      setTotalCount(result.data.totalCount);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, fixedRole, page, roleFilter, statusFilter]);

  useEffect(() => { loadUsers(page); }, [loadUsers, page]);

  async function handleLockConfirm(reason: string) {
    if (!lockTarget) return;
    try {
      setLockLoading(true);
      await lockUser(lockTarget.userId, reason);
      setLockTarget(null);
      await loadUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Khoá tài khoản thất bại");
    } finally {
      setLockLoading(false);
    }
  }

  async function handleUnlock(user: UserListItem) {
    try {
      setActionLoading(user.userId);
      await unlockUser(user.userId);
      await loadUsers(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Mở khoá thất bại");
    } finally {
      setActionLoading(null);
    }
  }

  /* ── Loading Skeleton ── */
  if (loading && users.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Users className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => loadUsers(page)}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <LockDialog
        user={lockTarget}
        onClose={() => setLockTarget(null)}
        onConfirm={handleLockConfirm}
        loading={lockLoading}
      />

      <Card className="overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm tên, email, SĐT, tên đăng nhập…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-background"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
            {(["all", "active", "locked"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  statusFilter === s
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "all" ? "Tất cả" : s === "active" ? "Hoạt động" : "Bị khoá"}
              </button>
            ))}
          </div>

          {!hideRoleFilter && (
            <Select
              value={roleFilter}
              onValueChange={(v) => setRoleFilter(v as RoleFilter)}
            >
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mọi vai trò</SelectItem>
                <SelectItem value="Traveler">Du khách</SelectItem>
                <SelectItem value="ServicePartner">Đối tác</SelectItem>
                <SelectItem value="Moderator">Điều phối viên</SelectItem>
                <SelectItem value="Admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => loadUsers(page)}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* ── Count Bar ── */}
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Tổng cộng <span className="font-semibold text-foreground">{totalCount}</span> {totalLabel}
          </span>
        </div>

        {/* ── Table ── */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Không tìm thấy người dùng</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hãy thử thay đổi từ khóa hoặc bộ lọc
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const displayName = getDisplayName(user);
                const isActing = actionLoading === user.userId;
                return (
                  <TableRow key={user.userId} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
                          <AvatarFallback className={cn("text-xs font-semibold", getAvatarColor(user.userId))}>
                            {getInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email || user.phone || user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={!user.isLocked ? "default" : "destructive"}
                        className={cn(
                          !user.isLocked && "bg-success-light text-success-dark border-0"
                        )}
                      >
                        <span
                          className={cn(
                            "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                            !user.isLocked ? "bg-success-dark" : "bg-white"
                          )}
                        />
                        {!user.isLocked ? "Hoạt động" : "Bị khoá"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {!user.isLocked ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isActing}
                            onClick={() => setLockTarget(user)}
                          >
                            <Lock className="mr-1.5 h-3.5 w-3.5" />
                            Khoá
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={isActing}
                            onClick={() => handleUnlock(user)}
                          >
                            {isActing ? (
                              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Unlock className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Mở khoá
                          </Button>
                        )}
                        <Link href={`${ROUTES.USERS}/${user.userId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Xem
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* ── Pagination ── */}
        <PaginationControl
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="border-t py-3"
        />
      </Card>
    </>
  );
}
