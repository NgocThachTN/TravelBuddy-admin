"use client";

import { useEffect, useState } from "react";
import {
  createReport,
  fetchMyReports,
  fetchUserReportReasons,
} from "@/lib/api";
import type {
  CreateReportPayload,
  GetMyReportsParams,
  ReportListItem,
  ReportReasonDto,
} from "@/types";
import {
  REPORT_TARGET_TYPE_CODES,
  reportStatusLabel,
  reportTargetTypeLabel,
  reportedPartyTypeLabel,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import PaginationControl from "@/components/pagination-control";
import ReportDetailDialog from "../../reports/components/ReportDetailDialog";
import {
  Eye,
  Filter,
  Megaphone,
  Plus,
  RefreshCw,
  SendHorizontal,
} from "lucide-react";

const PAGE_SIZE = 10;
const CREATE_TARGET_TYPES = REPORT_TARGET_TYPE_CODES.filter((value) => value !== "Other");
const STATUS_OPTIONS = ["Pending", "Reviewing", "Resolved", "Rejected", "Duplicate"] as const;
const REPORTED_PARTY_OPTIONS = [
  { value: "TravelerUser", label: "Người dùng" },
  { value: "ServicePartner", label: "Đối tác dịch vụ" },
] as const;

type StatusFilter = "all" | (typeof STATUS_OPTIONS)[number];
type TargetTypeFilter = "all" | (typeof CREATE_TARGET_TYPES)[number];

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

function CreateReportDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateReportDialogProps) {
  const [targetType, setTargetType] = useState<(typeof CREATE_TARGET_TYPES)[number]>("Trip");
  const [targetId, setTargetId] = useState("");
  const [reportedPartyType, setReportedPartyType] = useState("none");
  const [reasonChoice, setReasonChoice] = useState<string | undefined>(undefined);
  const [reasonText, setReasonText] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [reasons, setReasons] = useState<ReportReasonDto[]>([]);
  const [reasonsLoading, setReasonsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadReasons() {
      try {
        setReasonsLoading(true);
        setError(null);
        const result = await fetchUserReportReasons(targetType);
        if (!active) return;
        setReasons(result.data ?? []);
      } catch (err) {
        if (!active) return;
        setReasons([]);
        setError(
          err instanceof Error ? err.message : "Không thể tải lý do báo cáo.",
        );
      } finally {
        if (active) {
          setReasonsLoading(false);
        }
      }
    }

    loadReasons();
    return () => {
      active = false;
    };
  }, [open, targetType]);

  useEffect(() => {
    if (!open) {
      setTargetType("Trip");
      setTargetId("");
      setReportedPartyType("none");
      setReasonChoice(undefined);
      setReasonText("");
      setEvidenceNote("");
      setReasons([]);
      setReasonsLoading(false);
      setLoading(false);
      setError(null);
    }
  }, [open]);

  async function handleSubmit() {
    const trimmedTargetId = targetId.trim();
    const trimmedReasonText = reasonText.trim();
    const trimmedEvidenceNote = evidenceNote.trim();

    if (!trimmedTargetId) {
      setError("Vui lòng nhập ID đối tượng bị báo cáo.");
      return;
    }

    if (!reasonChoice && !trimmedReasonText) {
      setError("Vui lòng chọn lý do hoặc nhập mô tả lý do báo cáo.");
      return;
    }

    const payload: CreateReportPayload = {
      targetType,
      targetId: trimmedTargetId,
      reasonId:
        reasonChoice && reasonChoice !== "custom"
          ? Number.parseInt(reasonChoice, 10)
          : null,
      reasonText: trimmedReasonText || null,
      evidenceNote: trimmedEvidenceNote || null,
      reportedPartyType:
        reportedPartyType === "none" ? null : reportedPartyType,
    };

    try {
      setLoading(true);
      setError(null);
      await createReport(payload);
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tạo báo cáo mới.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo báo cáo mới</DialogTitle>
          <DialogDescription>
            Dùng <code>GET /api/v1/reports/reasons</code> để lấy lý do và{" "}
            <code>POST /api/v1/reports</code> để gửi báo cáo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="targetType">Loại đối tượng</Label>
            <Select
              value={targetType}
              onValueChange={(value) => {
                setTargetType(value as (typeof CREATE_TARGET_TYPES)[number]);
                setReasonChoice(undefined);
                setError(null);
              }}
            >
              <SelectTrigger id="targetType">
                <SelectValue placeholder="Chọn loại đối tượng" />
              </SelectTrigger>
              <SelectContent>
                {CREATE_TARGET_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {reportTargetTypeLabel(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="targetId">ID đối tượng</Label>
            <Input
              id="targetId"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
              placeholder="Nhập GUID của đối tượng bị báo cáo"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reportedPartyType">Bên bị báo cáo</Label>
            <Select value={reportedPartyType} onValueChange={setReportedPartyType}>
              <SelectTrigger id="reportedPartyType">
                <SelectValue placeholder="Chọn bên bị báo cáo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không xác định</SelectItem>
                {REPORTED_PARTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reasonId">Lý do báo cáo</Label>
            <Select
              value={reasonChoice}
              onValueChange={(value) => {
                setReasonChoice(value);
                setError(null);
              }}
            >
              <SelectTrigger id="reasonId">
                <SelectValue
                  placeholder={
                    reasonsLoading ? "Đang tải lý do..." : "Chọn lý do báo cáo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.reasonId} value={String(reason.reasonId)}>
                    {reason.displayName}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Khác / tự nhập</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reasonText">Mô tả lý do</Label>
            <Textarea
              id="reasonText"
              value={reasonText}
              onChange={(event) => setReasonText(event.target.value)}
              placeholder="Nhập thêm chi tiết lý do báo cáo nếu cần"
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="evidenceNote">Ghi chú bằng chứng</Label>
            <Textarea
              id="evidenceNote"
              value={evidenceNote}
              onChange={(event) => setEvidenceNote(event.target.value)}
              placeholder="Ví dụ: nội dung vi phạm, thời điểm, ngữ cảnh..."
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading || reasonsLoading}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            {loading ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MyReportsTable() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>("all");
  const [reloadKey, setReloadKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<ReportListItem | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

        const params: GetMyReportsParams = {
          pageNumber: page,
          pageSize: PAGE_SIZE,
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        if (targetTypeFilter !== "all") {
          params.targetType = targetTypeFilter;
        }

        const result = await fetchMyReports(params);
        if (!active) return;

        setReports(result.data.items);
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.totalCount || 0);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách báo cáo của tôi.",
        );
        setReports([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();
    return () => {
      active = false;
    };
  }, [page, reloadKey, statusFilter, targetTypeFilter]);

  function handleCreated() {
    setPage(1);
    setReloadKey((value) => value + 1);
  }

  return (
    <>
      <CreateReportDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      <ReportDetailDialog
        reportId={detailReport?.reportId ?? null}
        reportPreview={detailReport}
        scope="mine"
        onClose={() => setDetailReport(null)}
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Báo cáo của tôi</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng <code>GET /api/v1/reports/me</code> và{" "}
                <code>GET /api/v1/reports/me/{"{reportId}"}</code> để theo dõi các báo cáo moderator đã gửi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setReloadKey((value) => value + 1)}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo báo cáo
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b px-4 py-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {reportStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={targetTypeFilter}
              onValueChange={(value) => {
                setTargetTypeFilter(value as TargetTypeFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Loại đối tượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại đối tượng</SelectItem>
                {CREATE_TARGET_TYPES.map((targetType) => (
                  <SelectItem key={targetType} value={targetType}>
                    {reportTargetTypeLabel(targetType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>
                Tổng cộng{" "}
                <span className="font-semibold text-foreground">
                  {totalCount}
                </span>{" "}
                báo cáo
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Megaphone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Chưa có báo cáo nào</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Moderator có thể tạo báo cáo mới bằng các endpoint{" "}
                  <code>reports/reasons</code> và <code>reports</code>.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại đối tượng</TableHead>
                    <TableHead>ID đối tượng</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Bên bị báo cáo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.reportId}>
                      <TableCell className="font-medium">
                        {reportTargetTypeLabel(report.targetType)}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-mono text-xs">
                        {report.targetPk}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {report.reason?.displayName || report.reasonDisplayName || "-"}
                          </p>
                          {report.reasonText && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {report.reasonText}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reportedPartyTypeLabel(report.reportedPartyType)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {reportStatusLabel(report.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailReport(report)}
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            Xem
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationControl
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="border-t py-3"
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
