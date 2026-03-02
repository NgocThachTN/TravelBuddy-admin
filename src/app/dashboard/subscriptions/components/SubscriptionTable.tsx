"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchSubscriptionPackages,
  deleteSubscriptionPackage,
  type SubscriptionPackage,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SubscriptionForm from "./SubscriptionForm";

const PAGE_SIZE = 10;

function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SubscriptionTable() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPackage | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [includeDisabled, setIncludeDisabled] = useState(true);

  const loadPackages = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const res = await fetchSubscriptionPackages(p, PAGE_SIZE, includeDisabled);
      if (res?.data) {
        setPackages(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages ?? Math.max(1, Math.ceil(res.data.totalCount / PAGE_SIZE)));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách gói đăng ký");
    } finally {
      setLoading(false);
    }
  }, [page, includeDisabled]);

  useEffect(() => { loadPackages(page); }, [page, includeDisabled]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditingPackage(null);
    setFormOpen(true);
  }

  function openEdit(pkg: SubscriptionPackage) {
    setEditingPackage(pkg);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteSubscriptionPackage(deleteTarget.subscriptionPackageId);
      setDeleteTarget(null);
      loadPackages(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────
  if (loading && packages.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between border-b p-4">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-10">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Package className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => loadPackages(page)}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Tổng: <strong className="text-foreground">{totalCount}</strong> gói</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle disabled packages */}
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  onClick={() => { setIncludeDisabled(val); setPage(1); }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    includeDisabled === val
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {val ? "Tất cả" : "Đang hoạt động"}
                </button>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={() => loadPackages(page)} className="h-9 gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Làm mới
            </Button>
            <Button size="sm" onClick={openCreate} className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              Tạo gói mới
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[220px]">Tên gói</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-center">Thời hạn</TableHead>
                <TableHead className="text-center">Tạo trip</TableHead>
                <TableHead className="text-center">Người tham gia</TableHead>
                <TableHead className="text-center">AI</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
                <TableHead className="text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Chưa có gói đăng ký nào
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.subscriptionPackageId} className="group">
                    <TableCell>
                      <div>
                        <p className="font-medium leading-none">{pkg.name}</p>
                        {pkg.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-emerald-600">
                      {formatVnd(pkg.price)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {pkg.durationDays} ngày
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {pkg.tripCreateLimit === 0 ? "∞" : pkg.tripCreateLimit}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {pkg.tripParticipantLimit === 0 ? "∞" : pkg.tripParticipantLimit}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {pkg.aiUsageLimit === 0 ? "∞" : pkg.aiUsageLimit}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={pkg.isEnabled ? "default" : "secondary"}
                        className={cn(
                          "rounded-full px-2.5 text-[11px]",
                          pkg.isEnabled
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {pkg.isEnabled ? "Hoạt động" : "Tắt"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {formatDate(pkg.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(pkg)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(pkg)}
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <span>
              Trang {page}/{totalPages} &mdash; {totalCount} gói
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Create / Edit Form Dialog ── */}
      <SubscriptionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => loadPackages(page)}
        editingPackage={editingPackage}
      />

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói đăng ký?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa gói <strong>&quot;{deleteTarget?.name}&quot;</strong>.
              Hành động này không thể hoàn tác. Gói sẽ bị vô hiệu hóa và không còn
              hiển thị với người dùng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Đang xóa…" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
