"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import {
  approveAdminWalletWithdrawal,
  fetchAdminWalletWithdrawalWorkQueue,
  markAdminWalletWithdrawalProcessing,
  rejectAdminWalletWithdrawal,
} from "@/lib/api";
import type {
  AdminWalletWithdrawalRecord,
  AdminWalletWithdrawalStatusFilter,
  GetAdminWalletWithdrawalsParams,
} from "@/types";
import { cn } from "@/lib/utils";
import PaginationControl from "@/components/pagination-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 10;

type QueueStatusFilter = AdminWalletWithdrawalStatusFilter;

interface QueueDataState {
  items: AdminWalletWithdrawalRecord[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}

const STATUS_OPTIONS: { value: QueueStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
];

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("vi-VN")} ${currency || "VND"}`;
  }
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusMeta(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "pending") {
    return { label: "Chờ xử lý", className: "bg-amber-100 text-amber-700" };
  }
  if (normalized === "processing") {
    return { label: "Đang xử lý", className: "bg-blue-100 text-blue-700" };
  }
  if (normalized === "completed") {
    return { label: "Đã hoàn tất", className: "bg-emerald-100 text-emerald-700" };
  }
  if (normalized === "rejected") {
    return { label: "Đã từ chối", className: "bg-red-100 text-red-700" };
  }
  return { label: status || "Không rõ", className: "bg-muted text-muted-foreground" };
}

function shortId(value: string) {
  if (!value) return "-";
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function extractQueueData(payload: unknown, fallbackPage: number): QueueDataState {
  if (typeof payload !== "object" || payload === null) {
    return { items: [], totalCount: 0, pageNumber: fallbackPage, totalPages: 1 };
  }

  const root = payload as {
    data?: {
      items?: AdminWalletWithdrawalRecord[];
      totalCount?: number;
      pageNumber?: number;
      totalPages?: number;
    };
  };

  return {
    items: Array.isArray(root.data?.items) ? root.data?.items : [],
    totalCount: typeof root.data?.totalCount === "number" ? root.data.totalCount : 0,
    pageNumber: typeof root.data?.pageNumber === "number" ? root.data.pageNumber : fallbackPage,
    totalPages: typeof root.data?.totalPages === "number" ? root.data.totalPages : 1,
  };
}

function canMarkProcessing(item: AdminWalletWithdrawalRecord) {
  return item.status?.toLowerCase() === "pending";
}

function canApproveOrReject(item: AdminWalletWithdrawalRecord) {
  return item.status?.toLowerCase() === "processing";
}

export default function WalletWithdrawalsTable() {
  const [rows, setRows] = useState<AdminWalletWithdrawalRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>("all");

  const [processingTarget, setProcessingTarget] = useState<AdminWalletWithdrawalRecord | null>(null);
  const [approveTarget, setApproveTarget] = useState<AdminWalletWithdrawalRecord | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminWalletWithdrawalRecord | null>(null);
  const [processingNote, setProcessingNote] = useState("");
  const [externalRef, setExternalRef] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText, statusFilter]);

  const loadWithdrawals = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      nextStatusFilter: QueueStatusFilter,
    ) => {
      const currentRequestId = ++requestIdRef.current;
      setIsFetching(true);

      try {
        const params: GetAdminWalletWithdrawalsParams = {
          pageNumber: nextPage,
          pageSize: PAGE_SIZE,
          status: nextStatusFilter,
        };
        if (nextSearch.length > 0) {
          params.search = nextSearch;
        }

        const response = await fetchAdminWalletWithdrawalWorkQueue(params);
        if (currentRequestId !== requestIdRef.current) return;

        const parsed = extractQueueData(response, nextPage);
        setRows(parsed.items);
        setTotalCount(parsed.totalCount);
        setTotalPages(Math.max(1, parsed.totalPages));
        setError(null);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải hàng đợi rút tiền ví.",
        );
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsFetching(false);
          setIsInitialLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadWithdrawals(page, debouncedSearchText, statusFilter);
  }, [loadWithdrawals, page, debouncedSearchText, statusFilter]);

  const pageNetAmount = useMemo(
    () => rows.reduce((sum, row) => sum + (row.netAmount ?? 0), 0),
    [rows],
  );

  async function handleMarkProcessing() {
    if (!processingTarget) return;
    setActionLoading(true);
    try {
      await markAdminWalletWithdrawalProcessing(processingTarget.withdrawalId, {
        note: processingNote.trim() || undefined,
      });
      setProcessingTarget(null);
      setProcessingNote("");
      await loadWithdrawals(page, debouncedSearchText, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể nhận xử lý lệnh rút.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!approveTarget) return;
    if (!externalRef.trim()) {
      alert("Vui lòng nhập mã giao dịch ngân hàng.");
      return;
    }

    setActionLoading(true);
    try {
      await approveAdminWalletWithdrawal(approveTarget.withdrawalId, {
        externalTransactionRef: externalRef.trim(),
      });
      setApproveTarget(null);
      setExternalRef("");
      await loadWithdrawals(page, debouncedSearchText, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể duyệt lệnh rút.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    if (!rejectedReason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }

    setActionLoading(true);
    try {
      await rejectAdminWalletWithdrawal(rejectTarget.withdrawalId, {
        rejectedReason: rejectedReason.trim(),
      });
      setRejectTarget(null);
      setRejectedReason("");
      await loadWithdrawals(page, debouncedSearchText, statusFilter);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể từ chối lệnh rút.");
    } finally {
      setActionLoading(false);
    }
  }

  if (isInitialLoading) {
    return (
      <Card className="overflow-hidden py-0">
        <CardContent className="space-y-3 p-5">
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error && rows.length === 0) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-10">
          <p className="mb-4 text-sm font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void loadWithdrawals(page, debouncedSearchText, statusFilter)}
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
      <Dialog
        open={!!processingTarget}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setProcessingTarget(null);
            setProcessingNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhận xử lý lệnh rút</DialogTitle>
            <DialogDescription>
              Chuyển lệnh sang trạng thái đang xử lý trước khi duyệt hoặc từ chối.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="processing-note">Ghi chú nội bộ (không bắt buộc)</Label>
            <Textarea
              id="processing-note"
              value={processingNote}
              onChange={(event) => setProcessingNote(event.target.value)}
              placeholder="Ví dụ: Đã giao kế toán chuyển khoản"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => {
                setProcessingTarget(null);
                setProcessingNote("");
              }}
            >
              Huỷ
            </Button>
            <Button disabled={actionLoading} onClick={handleMarkProcessing}>
              {actionLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Clock3 className="mr-2 h-4 w-4" />
              )}
              Xác nhận nhận xử lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setApproveTarget(null);
            setExternalRef("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt lệnh rút tiền</DialogTitle>
            <DialogDescription>
              Nhập mã giao dịch ngân hàng sau khi đã chuyển khoản thủ công.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="external-ref">Mã giao dịch ngân hàng</Label>
            <Input
              id="external-ref"
              value={externalRef}
              onChange={(event) => setExternalRef(event.target.value)}
              placeholder="Ví dụ: VCB-20260414-001"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => {
                setApproveTarget(null);
                setExternalRef("");
              }}
            >
              Huỷ
            </Button>
            <Button disabled={actionLoading} onClick={handleApprove}>
              {actionLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Duyệt lệnh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setRejectTarget(null);
            setRejectedReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối lệnh rút tiền</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối. Hệ thống sẽ hoàn số tiền đang đóng băng cho user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Lý do từ chối</Label>
            <Textarea
              id="reject-reason"
              value={rejectedReason}
              onChange={(event) => setRejectedReason(event.target.value)}
              placeholder="Ví dụ: Sai thông tin người nhận"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => {
                setRejectTarget(null);
                setRejectedReason("");
              }}
            >
              Huỷ
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={handleReject}
            >
              {actionLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border border-border/50 shadow-none py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tổng lệnh trong hàng đợi</p>
              <p className="mt-1 text-xl font-semibold">
                {totalCount.toLocaleString("vi-VN")}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-none py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Tổng thực nhận trang hiện tại</p>
              <p className="mt-1 text-xl font-semibold">
                {formatMoney(pageNetAmount, "VND")}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border/50 shadow-none py-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Trang</p>
              <p className="mt-1 text-xl font-semibold">
                {page}/{Math.max(totalPages, 1)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Hàng đợi xử lý rút tiền</p>
              <p className="text-xs text-muted-foreground">
                {isFetching ? "Đang cập nhật dữ liệu..." : `${totalCount} yêu cầu`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-[240px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm mã lệnh, user, ngân hàng..."
                  className="pl-8"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as QueueStatusFilter)}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                disabled={isFetching}
                onClick={() =>
                  void loadWithdrawals(page, debouncedSearchText, statusFilter)}
              >
                <RefreshCw
                  className={cn("mr-2 h-3.5 w-3.5", isFetching && "animate-spin")}
                />
                Làm mới
              </Button>
            </div>
          </div>

          {error && rows.length > 0 && (
            <p className="border-b bg-destructive/5 px-5 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {rows.length === 0 ? (
            <CardContent className="py-16 text-center">
              <p className="text-sm font-medium">Không có lệnh rút tiền nào trong bộ lọc hiện tại</p>
            </CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-5">Mã lệnh</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Ngân hàng nhận</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead>Thời gian tạo</TableHead>
                      <TableHead className="pr-5 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const status = statusMeta(row.status ?? "");
                      const accountDisplay = row.bankAccountNumber
                        || row.maskedBankAccountNumber
                        || "-";

                      return (
                        <TableRow key={row.withdrawalId}>
                          <TableCell className="pl-5">
                            <p className="font-medium">{shortId(row.withdrawalId)}</p>
                            <p className="text-xs text-muted-foreground">
                              {row.withdrawalId}
                            </p>
                          </TableCell>

                          <TableCell className="max-w-[240px]">
                            <p className="truncate text-sm font-medium">
                              {row.userName || "-"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {row.userPhone || row.userEmail || row.userId}
                            </p>
                          </TableCell>

                          <TableCell className="max-w-[260px]">
                            <p className="truncate text-sm font-medium">
                              {(row.bankCode || "-")
                                + (row.bankAccountHolder ? ` - ${row.bankAccountHolder}` : "")}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {accountDisplay}
                            </p>
                          </TableCell>

                          <TableCell className="text-right">
                            <p className="text-sm font-semibold">
                              {formatMoney(row.amount ?? 0, row.currency || "VND")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Phí: {formatMoney(row.feeAmount ?? 0, row.currency || "VND")}
                            </p>
                            <p className="text-xs text-emerald-700">
                              Thực nhận:{" "}
                              {formatMoney(row.netAmount ?? 0, row.currency || "VND")}
                            </p>
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              className={cn(
                                "rounded-full px-2.5 text-[11px]",
                                status.className,
                              )}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(row.createdAt)}
                          </TableCell>

                          <TableCell className="pr-5">
                            <div className="flex justify-end gap-2">
                              {canMarkProcessing(row) && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setProcessingTarget(row);
                                    setProcessingNote("");
                                  }}
                                >
                                  Nhận xử lý
                                </Button>
                              )}

                              {canApproveOrReject(row) && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setApproveTarget(row);
                                      setExternalRef("");
                                    }}
                                  >
                                    Duyệt
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setRejectTarget(row);
                                      setRejectedReason("");
                                    }}
                                  >
                                    Từ chối
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <PaginationControl
                currentPage={page}
                totalPages={Math.max(totalPages, 1)}
                onPageChange={setPage}
                className="border-t py-3"
              />
            </>
          )}
        </Card>
      </div>
    </>
  );
}
