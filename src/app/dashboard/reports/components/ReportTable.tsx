"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchReports,
  processAdminReport,
} from "@/lib/api";
import type {
  ReportListItem,
  GetReportsParams,
  ResolvedActionCode,
  ReportDecisionCode,
  ProcessReportPayload,
} from "@/types";
import {
  RESOLVED_ACTION_LABELS,
  REPORT_DECISION_CODES,
  REPORT_DECISION_LABELS,
  reportStatusLabel,
  reportTargetTypeLabel,
  reportPriorityLabel,
  reportedPartyTypeLabel,
} from "@/types";
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
  CheckCircle,
  Megaphone,
  AlertTriangle,
  Map,
  MessageSquare,
  User,
  Handshake,
  LifeBuoy,
  MapPin,
} from "lucide-react";
import PaginationControl from "@/components/pagination-control";
import ReportDetailDialog from "./ReportDetailDialog";

const PAGE_SIZE = 15;

type StatusFilter = "all" | "Pending" | "Reviewing" | "Resolved" | "Rejected" | "Duplicate";
type TargetTypeFilter = "all" | string;

/* -- Helpers -- */
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

function getReporterName(item: ReportListItem) {
  const full = [item.reporterFirstName, item.reporterLastName].filter(Boolean).join(" ").trim();
  return full || "(Ã¡ÂºÂ¨n danh)";
}

function getInitials(item: ReportListItem) {
  const first = item.reporterFirstName?.trim();
  const last = item.reporterLastName?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return "?";
}

function statusBadgeVariant(status: number | string): "default" | "secondary" | "destructive" | "outline" {
  const s = typeof status === "number"
    ? (["Pending", "Reviewing", "Resolved", "Rejected", "Duplicate"] as const)[status]
    : status;
  switch (s) {
    case "Pending": return "destructive";
    case "Reviewing": return "secondary";
    case "Resolved": return "default";
    case "Rejected": return "outline";
    case "Duplicate": return "outline";
    default: return "secondary";
  }
}

function targetTypeIcon(targetType: number | string) {
  const t = typeof targetType === "number"
    ? (["Trip", "Post", "PostComment", "ServicePartner", "RescueRequest", "RescueRequestMessage", "TripMessage", "SocialCheckpoint", "User", "Other"] as const)[targetType]
    : targetType;
  switch (t) {
    case "Trip": return <Map className="h-3.5 w-3.5" />;
    case "Post": return <MessageSquare className="h-3.5 w-3.5" />;
    case "PostComment": return <MessageSquare className="h-3.5 w-3.5" />;
    case "ServicePartner": return <Handshake className="h-3.5 w-3.5" />;
    case "RescueRequest": return <LifeBuoy className="h-3.5 w-3.5" />;
    case "RescueRequestMessage": return <LifeBuoy className="h-3.5 w-3.5" />;
    case "TripMessage": return <MessageSquare className="h-3.5 w-3.5" />;
    case "SocialCheckpoint": return <MapPin className="h-3.5 w-3.5" />;
    case "User": return <User className="h-3.5 w-3.5" />;
    default: return <AlertTriangle className="h-3.5 w-3.5" />;
  }
}

function getAvailableResolvedActions(targetType: number | string): ResolvedActionCode[] {
  const targetCode = typeof targetType === "number"
    ? (["Trip", "Post", "PostComment", "ServicePartner", "RescueRequest", "RescueRequestMessage", "TripMessage", "SocialCheckpoint", "User", "Other"] as const)[targetType]
    : targetType;

  if (targetCode === "ServicePartner") {
    return ["None", "Warn", "SuspendPartner"];
  }

  if (targetCode === "User") {
    return ["None", "Warn", "LockUser", "BanUser"];
  }

  return ["None", "Warn"];
}

const ACTION_DESCRIPTIONS: Partial<Record<ResolvedActionCode, string>> = {
  None: "Kh\u00f4ng \u00e1p d\u1ee5ng bi\u1ec7n ph\u00e1p n\u00e0o, ch\u1ec9 l\u01b0u k\u1ebft qu\u1ea3 x\u00e1c minh.",
  Warn: "G\u1eedi nh\u1eafc nh\u1edf \u0111\u1ec3 ng\u01b0\u1eddi d\u00f9ng \u0111i\u1ec1u ch\u1ec9nh h\u00e0nh vi.",
  LockUser: "Kh\u00f3a t\u1ea1m th\u1eddi t\u00e0i kho\u1ea3n \u0111\u1ec3 ng\u0103n vi ph\u1ea1m ti\u1ebfp t\u1ee5c.",
  BanUser: "Ch\u1eb7n v\u0129nh vi\u1ec5n t\u00e0i kho\u1ea3n v\u00ec vi ph\u1ea1m nghi\u00eam tr\u1ecdng.",
  SuspendPartner: "T\u1ea1m d\u1eebng t\u00e0i kho\u1ea3n \u0111\u1ed1i t\u00e1c cho \u0111\u1ebfn khi \u0111\u01b0\u1ee3c m\u1edf l\u1ea1i.",
};

/* -- Process Dialog (unified resolve/reject/duplicate) -- */
interface ProcessDialogProps {
  report: ReportListItem | null;
  onClose: () => void;
  onConfirm: (payload: ProcessReportPayload) => Promise<void>;
  loading: boolean;
}

function ProcessDialog({ report, onClose, onConfirm, loading }: ProcessDialogProps) {
  return (
    <Dialog open={!!report} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        {report && (
          <ProcessForm
            report={report}
            onClose={onClose}
            onConfirm={onConfirm}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProcessForm({
  report,
  onClose,
  onConfirm,
  loading,
}: {
  report: ReportListItem;
  onClose: () => void;
  onConfirm: (payload: ProcessReportPayload) => Promise<void>;
  loading: boolean;
}) {
  const availableActions = getAvailableResolvedActions(report.targetType);
  const defaultSelectedAction: ResolvedActionCode =
    availableActions.includes("Warn") ? "Warn" : availableActions[0];
  const [decision, setDecision] = useState<ReportDecisionCode>("Resolved");
  const [selectedActions, setSelectedActions] = useState<ResolvedActionCode[]>([defaultSelectedAction]);
  const [note, setNote] = useState("");
  const [createStrike, setCreateStrike] = useState(false);
  const [strikeExpiresAt, setStrikeExpiresAt] = useState("");

  const decisionIndex = REPORT_DECISION_CODES.indexOf(decision);
  const normalizedSelectedActions = selectedActions.filter((action) =>
    availableActions.includes(action),
  );

  function toggleAction(action: ResolvedActionCode) {
    setSelectedActions((current) => {
      const normalizedCurrent = current.filter((value) =>
        availableActions.includes(value),
      );

      if (action === "None") {
        return normalizedCurrent.includes("None") ? [] : ["None"];
      }

      const withoutNone = normalizedCurrent.filter((value) => value !== "None");
      if (withoutNone.includes(action)) {
        return withoutNone.filter((value) => value !== action);
      }

      return [...withoutNone, action];
    });
  }

  function handleSubmit() {
    const payload: ProcessReportPayload = {
      decision: decisionIndex,
    };
    if (decision === "Resolved") {
      const resolvedActionIndexes = normalizedSelectedActions
        .map((action) => (["None", "Warn", "RemoveContent", "LockUser", "BanUser", "Refund", "SuspendPartner", "CancelRescueRequest"] as const).indexOf(action))
        .filter((value) => value >= 0);
      if (resolvedActionIndexes.length > 0) {
        payload.resolvedActions = resolvedActionIndexes;
        payload.resolvedAction = resolvedActionIndexes[0];
      }
    }
    if (note) payload.resolvedNote = note;
    if (createStrike) {
      payload.createStrike = true;
      if (strikeExpiresAt) payload.strikeExpiresAt = new Date(strikeExpiresAt).toISOString();
    }
    onConfirm(payload);
  }

  const disableSubmit = decision === "Resolved" && normalizedSelectedActions.length === 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Xá»­ lÃ½ bÃ¡o cÃ¡o</DialogTitle>
        <DialogDescription>
          BÃ¡o cÃ¡o tá»«{" "}
          <span className="font-semibold">{getReporterName(report)}</span>
          {" \u2014 "}
          {reportTargetTypeLabel(report.targetType)}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* Decision */}
        <div className="space-y-2">
          <Label>{"Quy\u1ebft \u0111\u1ecbnh"}</Label>
          <Select value={decision} onValueChange={(v) => setDecision(v as ReportDecisionCode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_DECISION_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {REPORT_DECISION_LABELS[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolved Action (only when Resolved) */}
        {decision === "Resolved" && (
          <div className="space-y-2 rounded-lg border p-3">
            <Label>H\u00e0nh \u0111\u1ed9ng x\u1eed l\u00fd (c\u00f3 th\u1ec3 ch\u1ecdn nhi\u1ec1u)</Label>
            <div className="space-y-2">
              {availableActions.map((action) => {
                const isChecked = normalizedSelectedActions.includes(action);
                return (
                  <label
                    key={action}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-2",
                      isChecked ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAction(action)}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium">{RESOLVED_ACTION_LABELS[action]}</span>
                      {ACTION_DESCRIPTIONS[action] && (
                        <span className="block text-xs text-muted-foreground">
                          {ACTION_DESCRIPTIONS[action]}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            {normalizedSelectedActions.length === 0 && (
              <p className="text-xs text-destructive">Vui l\u00f2ng ch\u1ecdn \u00edt nh\u1ea5t 1 h\u00e0nh \u0111\u1ed9ng x\u1eed l\u00fd.</p>
            )}
          </div>
        )}

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="process-note">Ghi chÃº</Label>
          <Textarea
            id="process-note"
            placeholder="Nháº­p ghi chÃº xá»­ lÃ½..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
          />
          <p className="text-right text-xs text-muted-foreground">{note.length}/2000</p>
        </div>

        {/* Strike */}
        {decision === "Resolved" && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="create-strike"
                checked={createStrike}
                onChange={(e) => setCreateStrike(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="create-strike" className="cursor-pointer">
                Ghi nh\u1eadn vi ph\u1ea1m cho ng\u01b0\u1eddi d\u00f9ng
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Ghi nh\u1eadn vi ph\u1ea1m gi\u00fap h\u1ec7 th\u1ed1ng theo d\u00f5i l\u1ecbch s\u1eed t\u00e1i ph\u1ea1m \u0111\u1ec3 x\u1eed l\u00fd m\u1ea1nh h\u01a1n khi c\u1ea7n.
            </p>
            {createStrike && (
              <div className="space-y-2">
                <Label htmlFor="strike-expires">{"H\u1ebft h\u1ea1n strike (kh\u00f4ng b\u1eaft bu\u1ed9c)"}</Label>
                <Input
                  id="strike-expires"
                  type="datetime-local"
                  value={strikeExpiresAt}
                  onChange={(e) => setStrikeExpiresAt(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          HuÃ¡Â»Â·
        </Button>
        <Button
          variant={decision === "Rejected" ? "destructive" : "default"}
          disabled={loading || disableSubmit}
          onClick={handleSubmit}
        >
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          XÃ¡c nháº­n
        </Button>
      </DialogFooter>
    </>
  );
}

/* -- Main Report Table -- */
export default function ReportTable() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<TargetTypeFilter>("all");
  const [page, setPage] = useState(1);

  // Debounce
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, targetTypeFilter]);

  // Dialogs
  const [processTarget, setProcessTarget] = useState<ReportListItem | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [detailReport, setDetailReport] = useState<ReportListItem | null>(null);

  const loadReports = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const params: GetReportsParams = {
        pageNumber: p,
        pageSize: PAGE_SIZE,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "all") params.status = statusFilter;
      if (targetTypeFilter !== "all") params.targetType = targetTypeFilter;

      const result = await fetchReports(params);
      setReports(result.data.items);
      setTotalCount(result.data.totalCount);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch b\u00e1o c\u00e1o");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, targetTypeFilter]);

  useEffect(() => { loadReports(page); }, [loadReports, page]);

  async function handleProcess(payload: ProcessReportPayload) {
    if (!processTarget) return;
    try {
      setDialogLoading(true);
      await processAdminReport(processTarget.reportId, payload);
      setProcessTarget(null);
      await loadReports(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xá»­ lÃ½ bÃ¡o cÃ¡o tháº¥t báº¡i");
    } finally {
      setDialogLoading(false);
    }
  }

  /* -- Loading Skeleton -- */
  if (loading && reports.length === 0) {
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

  /* -- Error State -- */
  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Megaphone className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => loadReports(page)}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            ThÃ¡Â»Â­ lÃ¡ÂºÂ¡i
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ProcessDialog
        report={processTarget}
        onClose={() => setProcessTarget(null)}
        onConfirm={handleProcess}
        loading={dialogLoading}
      />
      <ReportDetailDialog
        reportId={detailReport?.reportId ?? null}
        scope="admin"
        onClose={() => setDetailReport(null)}
      />

      <Card className="overflow-hidden">
        {/* -- Toolbar -- */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="TÃ¬m kiáº¿m bÃ¡o cÃ¡o..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-background"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Tráº¡ng thÃ¡i" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
              <SelectItem value="Pending">Chá» xá»­ lÃ½</SelectItem>
              <SelectItem value="Reviewing">Äang xem xÃ©t</SelectItem>
              <SelectItem value="Resolved">ÄÃ£ giáº£i quyáº¿t</SelectItem>
              <SelectItem value="Rejected">{"\u0110\u00e3 t\u1eeb ch\u1ed1i"}</SelectItem>
              <SelectItem value="Duplicate">TrÃ¹ng láº·p</SelectItem>
            </SelectContent>
          </Select>

          {/* Target Type Filter */}
          <Select value={targetTypeFilter} onValueChange={(v) => setTargetTypeFilter(v as TargetTypeFilter)}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder={"Lo\u1ea1i \u0111\u1ed1i t\u01b0\u1ee3ng"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">TÃ¡ÂºÂ¥t cÃ¡ÂºÂ£ loÃ¡ÂºÂ¡i</SelectItem>
              <SelectItem value="User">NgÆ°á»i dÃ¹ng</SelectItem>
              <SelectItem value="ServicePartner">{"\u0110\u1ed1i t\u00e1c"}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => loadReports(page)}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* -- Count Bar -- */}
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {"T\u1ed5ng c\u1ed9ng "}<span className="font-semibold text-foreground">{totalCount}</span>{" b\u00e1o c\u00e1o"}
          </span>
        </div>

        {/* -- Table -- */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NgÆ°á»i bÃ¡o cÃ¡o</TableHead>
              <TableHead>LoÃ¡ÂºÂ¡i</TableHead>
              <TableHead>{"B\u00ean b\u1ecb t\u1ed1"}</TableHead>
              <TableHead>LÃ½ do</TableHead>
              <TableHead>Tráº¡ng thÃ¡i</TableHead>
              <TableHead>Æ¯u tiÃªn</TableHead>
              <TableHead>NgÃ y táº¡o</TableHead>
              <TableHead className="text-right">Thao tÃ¡c</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Megaphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">KhÃ´ng tÃ¬m tháº¥y bÃ¡o cÃ¡o</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"H\u00e3y th\u1eed thay \u0111\u1ed5i b\u1ed9 l\u1ecdc ho\u1eb7c t\u1eeb kho\u00e1 t\u00ecm ki\u1ebfm"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const name = getReporterName(report);
                const isPending = report.status === 0 || report.status === "Pending";
                const isReviewing = report.status === 1 || report.status === "Reviewing";
                const canAct = isPending || isReviewing;

                return (
                  <TableRow key={report.reportId} className="group">
                    {/* Reporter */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {report.reporterAvatarUrl && (
                            <AvatarImage src={report.reporterAvatarUrl} alt={name} />
                          )}
                          <AvatarFallback
                            className={cn("text-xs font-semibold", getAvatarColor(report.reporterUserId))}
                          >
                            {getInitials(report)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{name}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Target Type */}
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {targetTypeIcon(report.targetType)}
                        {reportTargetTypeLabel(report.targetType)}
                      </Badge>
                    </TableCell>

                    {/* Reported Party */}
                    <TableCell className="text-sm text-muted-foreground">
                      {reportedPartyTypeLabel(report.reportedPartyType)}
                    </TableCell>

                    {/* Reason */}
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm">
                        {report.reason?.displayName || report.reasonDisplayName || report.reasonText || "\u2014"}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={statusBadgeVariant(report.status)}>
                        {reportStatusLabel(report.status)}
                      </Badge>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      {(report.priority === 1 || report.priority === "High") ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Cao
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {reportPriorityLabel(report.priority)}
                        </span>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(report.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {canAct && (
                          <Button
                            size="sm"
                            onClick={() => setProcessTarget(report)}
                          >
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Xá»­ lÃ½
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailReport(report)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Xem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* -- Pagination -- */}
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

