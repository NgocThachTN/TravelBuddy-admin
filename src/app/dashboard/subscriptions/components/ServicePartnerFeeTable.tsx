"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  activateServicePartnerFee,
  deactivateServicePartnerFee,
  deleteServicePartnerFee,
  fetchServicePartnerFees,
} from "@/lib/api";
import type { ServicePartnerFee } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationControl from "@/components/pagination-control";
import ServicePartnerFeeForm from "./ServicePartnerFeeForm";
import {
  Calendar,
  DollarSign,
  LayoutGrid,
  List,
  Package,
  Pencil,
  Power,
  RefreshCw,
  Star,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";

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

function formatDuration(value: number, unit?: "Month" | "Year") {
  return `${value} ${unit === "Year" ? "năm" : "tháng"}`;
}

const TIER_CONFIG = [
  {
    icon: Star,
    gradient: "from-slate-500 to-slate-600",
    bg: "bg-slate-50",
    text: "text-slate-700",
    ring: "ring-slate-200",
  },
  {
    icon: Zap,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  {
    icon: TrendingUp,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
];

function getTierConfig(index: number) {
  return TIER_CONFIG[index % TIER_CONFIG.length];
}

function StatsSummary({ fees }: { fees: ServicePartnerFee[] }) {
  const activeCount = fees.filter((fee) => fee.isActive).length;
  const avgFee =
    fees.length > 0
      ? fees.reduce((sum, fee) => sum + fee.feeValue, 0) / fees.length
      : 0;

  const stats = [
    {
      label: "Tổng gói",
      value: String(fees.length),
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Đang hoạt động",
      value: String(activeCount),
      icon: Zap,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Phí trung bình",
      value: avgFee > 0 ? formatVnd(avgFee) : "—",
      icon: DollarSign,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border border-border/50 py-0 shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                stat.iconBg,
              )}
            >
              <stat.icon className={cn("h-[18px] w-[18px]", stat.iconColor)} />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none tracking-tight">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FeeCard({
  fee,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  fee: ServicePartnerFee;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const tier = getTierConfig(index);
  const TierIcon = tier.icon;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border py-0 transition-all duration-200 hover:shadow-lg",
        fee.isActive
          ? "border-border/50 hover:border-border"
          : "border-dashed border-border/40 opacity-75",
      )}
    >
      <div className={cn("h-1 bg-gradient-to-r", tier.gradient)} />
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                tier.bg,
                tier.ring,
              )}
            >
              <TierIcon className={cn("h-5 w-5", tier.text)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                {formatDuration(fee.durationValue, fee.durationUnit)}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={fee.isActive ? "default" : "secondary"}
                  className={cn(
                    "rounded-full px-2 py-0 text-[10px] font-medium",
                    fee.isActive
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {fee.isActive ? "Hoạt động" : "Tắt"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onToggleActive}
            >
              <Power className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatVnd(fee.feeValue)}
          </span>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Chu kỳ {formatDuration(fee.durationValue, fee.durationUnit)}</span>
          </div>
        </div>

        <p className="min-h-10 text-xs leading-relaxed text-muted-foreground">
          {fee.note || "Không có ghi chú cho gói đối tác này."}
        </p>

        <div className="mt-4 border-t pt-3 text-[11px] text-muted-foreground/60">
          Tạo ngày {formatDate(fee.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicePartnerFeeTable() {
  const [fees, setFees] = useState<ServicePartnerFee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const requestIdRef = useRef(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<ServicePartnerFee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServicePartnerFee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<ServicePartnerFee | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const loadFees = useCallback(
    async (nextPage: number, nextIncludeInactive: boolean) => {
      const requestId = ++requestIdRef.current;
      setIsFetching(true);
      try {
        const res = await fetchServicePartnerFees({
          pageNumber: nextPage,
          pageSize: PAGE_SIZE,
          includeInactive: nextIncludeInactive,
        });
        if (requestId !== requestIdRef.current) return;

        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        const nextTotalCount = res.data?.totalCount ?? items.length;
        setFees(items);
        setTotalCount(nextTotalCount);
        setTotalPages(
          res.data?.totalPages ?? Math.max(1, Math.ceil(nextTotalCount / PAGE_SIZE)),
        );
        setError(null);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách gói đối tác.",
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setIsFetching(false);
          setIsInitialLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadFees(page, includeInactive);
  }, [page, includeInactive, loadFees]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteServicePartnerFee(deleteTarget.servicePartnerFeeId);
      setDeleteTarget(null);
      loadFees(page, includeInactive);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!toggleTarget) return;
    try {
      setToggleLoading(true);
      if (toggleTarget.isActive) {
        await deactivateServicePartnerFee(toggleTarget.servicePartnerFeeId);
      } else {
        await activateServicePartnerFee(toggleTarget.servicePartnerFeeId);
      }
      setToggleTarget(null);
      loadFees(page, includeInactive);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại");
    } finally {
      setToggleLoading(false);
    }
  }

  const sortedFees = [...fees].sort((a, b) => a.feeValue - b.feeValue);

  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border border-border/50 py-0 shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="py-0">
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-4 rounded-xl border p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && fees.length === 0) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-14">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <Package className="h-7 w-7 text-destructive" />
          </div>
          <p className="mb-1 text-sm font-medium text-destructive">Đã xảy ra lỗi</p>
          <p className="mb-4 text-xs text-destructive/70">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadFees(page, includeInactive)}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <StatsSummary fees={fees} />

      <Card className="overflow-hidden py-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
              {([true, false] as const).map((value) => (
                <button
                  key={String(value)}
                  disabled={isFetching}
                  onClick={() => {
                    setIncludeInactive(value);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    isFetching ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    includeInactive === value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value ? "Tất cả" : "Đang hoạt động"}
                </button>
              ))}
            </div>

            {isFetching ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Đang tải...
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">{totalCount} gói</span>
            )}

            {error && fees.length > 0 && (
              <span className="text-xs text-destructive">{error}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "cursor-pointer rounded-md p-1.5 transition-colors",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "cursor-pointer rounded-md p-1.5 transition-colors",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => loadFees(page, includeInactive)}
              className="h-8 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Làm mới
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingFee(null);
                setFormOpen(true);
              }}
              className="h-8 gap-1.5"
            >
              <Package className="h-4 w-4" />
              Tạo gói mới
            </Button>
          </div>
        </div>

        {fees.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có gói đối tác nào
            </p>
            <p className="mb-4 mt-1 text-xs text-muted-foreground/60">
              Tạo gói đầu tiên để bắt đầu quản lý phí đối tác
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingFee(null);
                setFormOpen(true);
              }}
              className="gap-1.5"
            >
              <Package className="h-4 w-4" />
              Tạo gói mới
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedFees.map((fee, index) => (
                <FeeCard
                  key={fee.servicePartnerFeeId}
                  fee={fee}
                  index={index}
                  onEdit={() => {
                    setEditingFee(fee);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeleteTarget(fee)}
                  onToggleActive={() => setToggleTarget(fee)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[220px] pl-5">Gói đối tác</TableHead>
                  <TableHead className="text-right">Giá phí</TableHead>
                  <TableHead className="text-center">Chu kỳ</TableHead>
                  <TableHead className="text-center">Loại phí</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Ngày tạo</TableHead>
                  <TableHead className="pr-5 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFees.map((fee, index) => {
                  const tier = getTierConfig(index);
                  const TierIcon = tier.icon;
                  return (
                    <TableRow key={fee.servicePartnerFeeId} className="group">
                      <TableCell className="pl-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
                              tier.bg,
                              tier.ring,
                            )}
                          >
                            <TierIcon className={cn("h-4 w-4", tier.text)} />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none">
                              {formatDuration(fee.durationValue, fee.durationUnit)}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                              {fee.note || "Không có ghi chú"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-emerald-600">
                        {formatVnd(fee.feeValue)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatDuration(fee.durationValue, fee.durationUnit)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {fee.feeType ?? "SubscriptionFee"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={fee.isActive ? "default" : "secondary"}
                          className={cn(
                            "rounded-full px-2.5 text-[11px]",
                            fee.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {fee.isActive ? "Hoạt động" : "Tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {formatDate(fee.createdAt)}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingFee(fee);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setToggleTarget(fee)}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(fee)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <PaginationControl
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="border-t py-3"
        />
      </Card>

      <ServicePartnerFeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => loadFees(page, includeInactive)}
        editingFee={editingFee}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(value) => {
          if (!value) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói đối tác?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa gói{" "}
              <strong>
                &quot;{deleteTarget
                  ? formatDuration(
                      deleteTarget.durationValue,
                      deleteTarget.durationUnit,
                    )
                  : ""}&quot;
              </strong>
              . Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(value) => {
          if (!value) setToggleTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.isActive ? "Ngừng áp dụng gói?" : "Kích hoạt gói?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.isActive
                ? "Gói sẽ bị chuyển sang trạng thái tắt và không còn áp dụng."
                : "Gói sẽ được chuyển sang trạng thái hoạt động."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive} disabled={toggleLoading}>
              {toggleLoading ? "Đang cập nhật..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
