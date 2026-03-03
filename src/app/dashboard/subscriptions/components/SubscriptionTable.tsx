"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchSubscriptionPackages,
  deleteSubscriptionPackage,
} from "@/lib/api";
import type { SubscriptionPackage } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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
  LayoutGrid,
  List,
  MapPin,
  Users,
  Sparkles,
  Calendar,
  TrendingUp,
  Zap,
  Crown,
  Star,
} from "lucide-react";
import PaginationControl from "@/components/pagination-control";
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

function formatCompactPrice(amount: number) {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}tr`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(0)}k`;
  }
  return String(amount);
}

// Tier icon mapping based on price order
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
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  {
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200",
  },
];

function getTierConfig(index: number) {
  return TIER_CONFIG[index % TIER_CONFIG.length];
}

/* ─── Stat Summary Cards ─────────────────────────────────────────────── */
function StatsSummary({ packages }: { packages: SubscriptionPackage[] }) {
  const total = packages.length;
  const active = packages.filter((p) => p.isEnabled).length;
  const prices = packages.map((p) => p.price).filter((p) => p > 0);
  const avgPrice =
    prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const stats = [
    {
      label: "Tổng gói",
      value: String(total),
      icon: Package,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Đang hoạt động",
      value: String(active),
      icon: Zap,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Giá trung bình",
      value: avgPrice > 0 ? formatCompactPrice(avgPrice) : "—",
      icon: TrendingUp,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="border border-border/50 shadow-none py-0"
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                s.iconBg,
              )}
            >
              <s.icon className={cn("h-[18px] w-[18px]", s.iconColor)} />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight leading-none">
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ─── Package Card (Grid View) ───────────────────────────────────────── */
function PackageCard({
  pkg,
  tierIndex,
  onEdit,
  onDelete,
}: {
  pkg: SubscriptionPackage;
  tierIndex: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tier = getTierConfig(tierIndex);
  const TierIcon = tier.icon;

  const features = [
    {
      icon: MapPin,
      label: "Tạo trip",
      value:
        pkg.tripCreateLimit === 0
          ? "Không giới hạn"
          : `${pkg.tripCreateLimit} trip`,
    },
    {
      icon: Users,
      label: "Người tham gia",
      value:
        pkg.tripParticipantLimit === 0
          ? "Không giới hạn"
          : `${pkg.tripParticipantLimit} người`,
    },
    {
      icon: Sparkles,
      label: "AI Usage",
      value:
        pkg.aiUsageLimit === 0 ? "Không giới hạn" : `${pkg.aiUsageLimit} lượt`,
    },
  ];

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border transition-all duration-200 hover:shadow-lg py-0",
        pkg.isEnabled
          ? "border-border/50 hover:border-border"
          : "border-dashed border-border/40 opacity-70",
      )}
    >
      {/* Top gradient accent */}
      <div className={cn("h-1 bg-gradient-to-r", tier.gradient)} />

      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
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
              <h3 className="font-semibold text-sm leading-tight">
                {pkg.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={pkg.isEnabled ? "default" : "secondary"}
                  className={cn(
                    "rounded-full px-2 py-0 text-[10px] font-medium",
                    pkg.isEnabled
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {pkg.isEnabled ? "Hoạt động" : "Tắt"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              title="Chỉnh sửa"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              title="Xóa"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {formatVnd(pkg.price)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{pkg.durationDays} ngày</span>
          </div>
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {pkg.description}
          </p>
        )}

        {/* Feature list */}
        <div className="space-y-2.5 border-t pt-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-2.5 text-sm">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{f.label}</span>
              <span className="ml-auto text-xs font-medium text-foreground">
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground/60">
          Tạo ngày {formatDate(pkg.createdAt)}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function SubscriptionTable() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  // KEEP_PREVIOUS_DATA: split into two flags so old rows stay visible during page transitions
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // KEEP_PREVIOUS_DATA: monotone counter – only the latest request may update state
  const requestIdRef = useRef(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<SubscriptionPackage | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPackage | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [includeDisabled, setIncludeDisabled] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // KEEP_PREVIOUS_DATA: explicit params eliminate stale-closure risk; empty dep array is intentional
  const loadPackages = useCallback(
    async (nextPage: number, nextIncludeDisabled: boolean) => {
      const reqId = ++requestIdRef.current; // KEEP_PREVIOUS_DATA: stamp this request
      setIsFetching(true);
      try {
        const res = await fetchSubscriptionPackages(
          nextPage,
          PAGE_SIZE,
          nextIncludeDisabled,
        );
        if (reqId !== requestIdRef.current) return; // KEEP_PREVIOUS_DATA: discard stale response
        if (res?.data) {
          setPackages(res.data.items);
          setTotalCount(res.data.totalCount);
          setTotalPages(
            res.data.totalPages ??
              Math.max(1, Math.ceil(res.data.totalCount / PAGE_SIZE)),
          );
        }
        setError(null);
      } catch (err) {
        if (reqId !== requestIdRef.current) return; // KEEP_PREVIOUS_DATA: discard stale error
        // KEEP_PREVIOUS_DATA: set error flag but do NOT clear packages – old rows stay visible
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách gói đăng ký",
        );
      } finally {
        if (reqId === requestIdRef.current) {
          // KEEP_PREVIOUS_DATA
          setIsFetching(false);
          setIsInitialLoading(false);
        }
      }
    },
    [],
  ); // KEEP_PREVIOUS_DATA: no deps needed – all inputs are passed explicitly

  useEffect(() => {
    loadPackages(page, includeDisabled);
  }, [page, includeDisabled, loadPackages]);

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
      loadPackages(page, includeDisabled);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Sort packages by price for consistent tier assignment
  const sortedPackages = [...packages].sort((a, b) => a.price - b.price);

  // ── Loading skeleton (initial load only) ───────────────────────
  // KEEP_PREVIOUS_DATA: show skeleton only on first load; on page changes old rows stay
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border border-border/50 shadow-none py-0">
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

        {/* Cards skeleton */}
        <Card className="py-0">
          <div className="flex items-center justify-between border-b p-4">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-32" />
                  <div className="space-y-2 pt-3 border-t">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state (only full-page error on empty initial load failure) ─
  // KEEP_PREVIOUS_DATA: if we already have rows, show inline error banner instead
  if (error && packages.length === 0) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-14">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <Package className="h-7 w-7 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive mb-1">
            Đã xảy ra lỗi
          </p>
          <p className="text-xs text-destructive/70 mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPackages(page, includeDisabled)}
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
      {/* ── Summary Stats ── */}
      <StatsSummary packages={packages} />

      <Card className="overflow-hidden py-0">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-3">
            {/* Filter toggle – KEEP_PREVIOUS_DATA: disabled while fetching */}
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
              {([true, false] as const).map((val) => (
                <button
                  key={String(val)}
                  disabled={isFetching}
                  onClick={() => {
                    setIncludeDisabled(val);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    isFetching
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                    includeDisabled === val
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {val ? "Tất cả" : "Đang hoạt động"}
                </button>
              ))}
            </div>
            {/* KEEP_PREVIOUS_DATA: inline fetching indicator */}
            {isFetching ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Đang tải...
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {totalCount} gói
              </span>
            )}
            {/* KEEP_PREVIOUS_DATA: inline error banner when data is already present */}
            {error && packages.length > 0 && (
              <span className="text-xs text-destructive">{error}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-md p-1.5 transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Xem dạng thẻ"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "rounded-md p-1.5 transition-colors cursor-pointer",
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Xem dạng bảng"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => loadPackages(page, includeDisabled)}
              className="h-8 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Làm mới
            </Button>
            <Button size="sm" onClick={openCreate} className="h-8 gap-1.5">
              <Plus className="h-4 w-4" />
              Tạo gói mới
            </Button>
          </div>
        </div>

        {/* ── Content ── */}
        {packages.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có gói đăng ký nào
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
              Tạo gói đầu tiên để bắt đầu
            </p>
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Tạo gói mới
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid View ── */
          <div className="p-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedPackages.map((pkg, idx) => (
                <PackageCard
                  key={pkg.subscriptionPackageId}
                  pkg={pkg}
                  tierIndex={idx}
                  onEdit={() => openEdit(pkg)}
                  onDelete={() => setDeleteTarget(pkg)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── Table View ── */
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[220px] pl-5">Tên gói</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-center">Thời hạn</TableHead>
                  <TableHead className="text-center">Tạo trip</TableHead>
                  <TableHead className="text-center">Người tham gia</TableHead>
                  <TableHead className="text-center">AI</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Ngày tạo</TableHead>
                  <TableHead className="text-right w-[100px] pr-5">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPackages.map((pkg, idx) => {
                  const tier = getTierConfig(idx);
                  const TierIcon = tier.icon;
                  return (
                    <TableRow key={pkg.subscriptionPackageId} className="group">
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
                            <p className="font-medium text-sm leading-none">
                              {pkg.name}
                            </p>
                            {pkg.description && (
                              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                {pkg.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-emerald-600">
                        {formatVnd(pkg.price)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {pkg.durationDays} ngày
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {pkg.tripCreateLimit === 0 ? (
                          <span className="text-muted-foreground">&#8734;</span>
                        ) : (
                          pkg.tripCreateLimit
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {pkg.tripParticipantLimit === 0 ? (
                          <span className="text-muted-foreground">&#8734;</span>
                        ) : (
                          pkg.tripParticipantLimit
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {pkg.aiUsageLimit === 0 ? (
                          <span className="text-muted-foreground">&#8734;</span>
                        ) : (
                          pkg.aiUsageLimit
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={pkg.isEnabled ? "default" : "secondary"}
                          className={cn(
                            "rounded-full px-2.5 text-[11px]",
                            pkg.isEnabled
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {pkg.isEnabled ? "Hoạt động" : "Tắt"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {formatDate(pkg.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-5">
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

      {/* ── Create / Edit Form Dialog ── */}
      <SubscriptionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => loadPackages(page, includeDisabled)}
        editingPackage={editingPackage}
      />

      {/* ── Delete Confirm Dialog ── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa gói đăng ký?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa gói <strong>&quot;{deleteTarget?.name}&quot;</strong>.
              Hành động này không thể hoàn tác. Gói sẽ bị vô hiệu hóa và không
              còn hiển thị với người dùng.
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
    </>
  );
}
