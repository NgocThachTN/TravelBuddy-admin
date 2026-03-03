"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { fetchUsers, updateUserStatus } from "@/lib/api";
import type { User } from "@/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
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
  Search,
  Filter,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

type StatusFilter = "all" | "active" | "locked";
type RoleFilter = "all" | "traveler" | "host";

/* ── Avatar helpers ── */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, statusFilter, roleFilter]);

  async function handleToggleStatus(userId: string, currentStatus: string) {
    const action = currentStatus === "active" ? "lock" : "unlock";
    try {
      setActionLoading(userId);
      const updated = await updateUserStatus(userId, action);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setActionLoading(null);
    }
  }

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-16 rounded-md" />
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
          <Button variant="outline" size="sm" className="mt-4" onClick={loadUsers}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email hoặc ID…"
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
              {s === "all" ? "Tất cả" : s === "active" ? "Hoạt động" : "Bị khóa"}
            </button>
          ))}
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
          {(["all", "traveler", "host"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                roleFilter === r
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r === "all" ? "Tất cả" : r === "traveler" ? "Du khách" : "Chủ nhà"}
            </button>
          ))}
        </div>

        <Button variant="outline" size="icon" className="shrink-0 h-9 w-9" onClick={loadUsers}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Count Bar ── */}
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Hiển thị <span className="font-semibold text-foreground">{filtered.length}</span> người dùng
        </span>
      </div>

      {/* ── Table ── */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-12 text-center">
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
            paginated.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn("text-xs font-semibold", getAvatarColor(user.name))}>
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "default" : "destructive"}
                    className={cn(
                      user.status === "active" && "bg-success-light text-success-dark border-0"
                    )}
                  >
                    <span
                      className={cn(
                        "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                        user.status === "active" ? "bg-success-dark" : "bg-white"
                      )}
                    />
                    {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant={user.status === "active" ? "destructive" : "default"}
                      size="sm"
                      disabled={actionLoading === user.id}
                      onClick={() => handleToggleStatus(user.id, user.status)}
                    >
                      {actionLoading === user.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : user.status === "active" ? (
                        <Lock className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {actionLoading === user.id ? "" : user.status === "active" ? "Khóa" : "Mở khóa"}
                    </Button>
                    <Link href={`${ROUTES.USERS}/${user.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Xem
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Trang {page} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center">
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-xs text-muted-foreground">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer",
                      p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
