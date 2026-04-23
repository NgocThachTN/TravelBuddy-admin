"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreditCard, RefreshCw, Search } from "lucide-react";
import {
  fetchAdminDepositTransactions,
  fetchAdminUserTransactions,
  fetchAdminUserSubscriptionTransactions,
} from "@/lib/api";
import type {
  AdminTransactionRecord,
  BePagedWrapper,
  GetAdminTransactionsParams,
} from "@/types";
import { cn } from "@/lib/utils";
import PaginationControl from "@/components/pagination-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

const PAGE_SIZE = 10;

type TransactionMode = "deposits" | "user-subscriptions" | "user-transactions";
type StatusFilter = "all" | "Pending" | "Processing" | "Completed" | "Failed";

interface TransactionsTableProps {
  mode: TransactionMode;
}

interface ParsedPagedResponse {
  items: AdminTransactionRecord[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}

interface NormalizedTransaction {
  key: string;
  transactionCode: string;
  walletId: string;
  userId: string;
  userName: string;
  userContact: string;
  amount: number | null;
  balanceBefore: number | null;
  balanceAfter: number | null;
  currency: string;
  status: string;
  paymentSource: string;
  packageName: string;
  userRole: string;
  operation: string;
  createdAt: string;
  startedAt: string;
  endedAt: string;
  note: string;
  gateway: string;
  accountNumber: string;
  code: string;
  content: string;
  transferType: string;
  transferAmount: number | null;
  referenceCode: string;
  sePayError: boolean | null;
  refType: string;
  refPk: string;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Processing", label: "Đang xử lý" },
  { value: "Completed", label: "Thành công" },
  { value: "Failed", label: "Thất bại" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecordArray(value: unknown): AdminTransactionRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readString(source: AdminTransactionRecord | null, keys: string[]): string | null {
  if (!source) return null;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (typeof value === "number" || typeof value === "bigint") {
      return String(value);
    }
  }

  return null;
}

function readNumber(source: AdminTransactionRecord | null, keys: string[]): number | null {
  if (!source) return null;

  for (const key of keys) {
    const parsed = toNumber(source[key]);
    if (parsed !== null) return parsed;
  }

  return null;
}

function readBoolean(source: AdminTransactionRecord | null, keys: string[]): boolean | null {
  if (!source) return null;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "y", "co", "có"].includes(normalized)) return true;
      if (["false", "0", "no", "n", "khong", "không"].includes(normalized)) return false;
    }
  }

  return null;
}

function readRecord(source: AdminTransactionRecord | null, keys: string[]): AdminTransactionRecord | null {
  if (!source) return null;

  for (const key of keys) {
    const value = source[key];
    if (isRecord(value)) return value;
  }

  return null;
}

function parsePagedResponse(payload: unknown): ParsedPagedResponse {
  const root = isRecord(payload) ? payload : null;
  const nestedData = root?.data;
  const data = isRecord(nestedData) ? nestedData : null;

  const candidateItems = [
    toRecordArray(data?.items),
    toRecordArray(root?.items),
    toRecordArray(nestedData),
  ];
  const items = candidateItems.find((candidate) => candidate.length > 0) ?? [];

  const fallbackTotal = items.length;

  return {
    items,
    totalCount: toNumber(data?.totalCount) ?? toNumber(root?.totalCount) ?? fallbackTotal,
    pageNumber: toNumber(data?.pageNumber) ?? toNumber(root?.pageNumber) ?? 1,
    totalPages: toNumber(data?.totalPages) ?? toNumber(root?.totalPages) ?? 1,
  };
}

function normalizeStatus(status: string) {
  const upper = status.toUpperCase();
  if (
    upper.includes("SUCCESS")
    || upper.includes("COMPLETED")
    || upper.includes("PAID")
    || upper.includes("APPROVED")
    || upper.includes("DONE")
  ) {
    return { label: "Thành công", className: "bg-emerald-100 text-emerald-700" };
  }
  if (
    upper.includes("PENDING")
    || upper.includes("PROCESS")
    || upper.includes("WAIT")
    || upper.includes("IN_PROGRESS")
  ) {
    return { label: "Đang xử lý", className: "bg-amber-100 text-amber-700" };
  }
  if (
    upper.includes("FAIL")
    || upper.includes("CANCEL")
    || upper.includes("REJECT")
    || upper.includes("EXPIRE")
    || upper.includes("ERROR")
  ) {
    return { label: "Thất bại", className: "bg-red-100 text-red-700" };
  }
  return { label: status || "Không rõ", className: "bg-muted text-muted-foreground" };
}

function formatDateTime(value: string) {
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

function formatMoney(amount: number | null, currency: string) {
  if (amount === null) return "-";

  const normalizedCurrency = (currency || "VND").toUpperCase();

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("vi-VN")} ${normalizedCurrency}`;
  }
}

function formatTransferType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "in") return "Tiền vào";
  if (normalized === "out") return "Tiền ra";
  return value || "-";
}

function formatSePayError(value: boolean | null) {
  if (value === null) return "-";
  return value ? "Có lỗi" : "Không có lỗi";
}

function formatUserRole(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "traveler") return "Người dùng";
  if (normalized === "servicepartner" || normalized === "service_partner") return "Đối tác dịch vụ";
  return value || "-";
}

function formatWalletOperation(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "credit") return "Cộng tiền";
  if (normalized === "debit") return "Trừ tiền";
  if (normalized === "freeze") return "Đóng băng";
  if (normalized === "unfreeze") return "Hoàn đóng băng";
  if (normalized === "consume") return "Sử dụng tiền đóng băng";
  if (normalized === "adjust") return "Điều chỉnh";
  return value || "-";
}

function formatPaymentSource(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "wallet") return "Ví TravelBuddy";
  if (normalized === "sepay") return "SePay";
  return value || "-";
}

function formatReferenceType(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "subscription_purchase") return "Thanh toán mua gói người dùng";
  if (normalized === "wallet_withdrawal_pending") return "Yêu cầu rút tiền đang chờ xử lý";
  if (normalized === "wallet_withdrawal_created") return "Tạo yêu cầu rút tiền";
  if (normalized === "wallet_withdrawal_completed") return "Yêu cầu rút tiền đã hoàn tất";
  if (normalized === "wallet_withdrawal_rejected") return "Yêu cầu rút tiền bị từ chối";
  if (normalized === "user_subscription_purchase") return "Mua gói người dùng";
  if (normalized === "sepay_topup") return "Nạp tiền SePay";
  if (normalized === "sepay_partner_topup") return "Nạp tiền SePay cho đối tác";
  if (normalized === "join_request_deposit") return "Đóng băng tiền cọc khi gửi yêu cầu tham gia";
  if (normalized === "join_request_refund") return "Hoàn tiền cọc yêu cầu tham gia";
  if (normalized === "participant_leave_refund") return "Hoàn tiền khi thành viên rời chuyến";
  if (normalized === "participant_leave_forfeit") return "Thu tiền cọc khi thành viên rời chuyến";
  if (normalized === "participant_owner_remove_refund") return "Hoàn tiền khi trưởng đoàn xóa thành viên";
  if (normalized === "participant_owner_remove_forfeit") return "Thu tiền cọc khi trưởng đoàn xóa thành viên";
  if (normalized === "participant_kick_failed_start_forfeit") {
    return "Thu tiền cọc do không điểm danh khởi hành";
  }
  if (normalized === "trip_deposit") return "Đặt cọc tham gia chuyến đi";
  if (normalized === "trip_deposit_refund") return "Hoàn tiền đặt cọc chuyến đi";
  if (normalized === "trip_complete_refund") return "Hoàn tiền cọc khi hoàn thành chuyến đi";
  if (normalized === "trip_complete_absent_forfeit") {
    return "Thu tiền cọc do vắng mặt khi hoàn thành chuyến đi";
  }
  if (normalized === "trip_auto_cancel_not_started_refund") {
    return "Hoàn tiền do chuyến bị hủy vì không khởi hành";
  }
  if (normalized === "rescue_payment") return "Thanh toán cứu hộ";
  if (normalized === "rescue_deposit_hold") return "Đóng băng tiền đặt cọc cứu hộ";
  if (normalized === "rescue_deposit_release") return "Hoàn đóng băng tiền đặt cọc cứu hộ";
  if (normalized === "rescue_deposit_transfer") return "Chuyển tiền đặt cọc cứu hộ";
  if (normalized === "rescue_deposit_settlement_out") return "Khấu trừ tiền đặt cọc cứu hộ";
  if (normalized === "rescue_commission") return "Hoa hồng cứu hộ";
  return value || "-";
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-muted/20 p-3", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 break-words font-medium">{value || "-"}</div>
    </div>
  );
}

function normalizeTransaction(
  item: AdminTransactionRecord,
  index: number,
): NormalizedTransaction {
  const order = readRecord(item, ["billingOrder", "order"]);
  const user = readRecord(item, ["user", "payer", "owner", "customer", "account"]);
  const wallet = readRecord(item, ["wallet", "walletInfo", "userWallet"]);

  const firstName =
    readString(user, ["firstName", "givenName"])
    ?? readString(item, ["firstName", "payerFirstName", "userFirstName"]);
  const lastName =
    readString(user, ["lastName", "familyName"])
    ?? readString(item, ["lastName", "payerLastName", "userLastName"]);

  const transactionCode =
    readString(item, [
      "paymentTxId",
      "paymentTransactionId",
      "transactionId",
      "providerTxId",
      "billingOrderId",
      "orderId",
      "id",
    ])
    ?? readString(order, ["billingOrderId", "orderId", "id"])
    ?? `TX-${index + 1}`;

  const explicitUserName =
    readString(user, ["fullName", "displayName", "name"])
    ?? readString(item, ["userName", "payerName", "fullName", "displayName", "name"]);
  const fullNameFromParts = [firstName, lastName].filter(Boolean).join(" ").trim();
  const userName = explicitUserName ?? (fullNameFromParts || "Khách hàng");

  const userContact =
    readString(user, ["email", "phoneNumber", "phone", "relativePhone"])
    ?? readString(item, ["userEmail", "payerEmail", "email", "userPhone", "phoneNumber"])
    ?? "-";

  const userId =
    readString(item, ["userId", "userID", "user_id"])
    ?? readString(user, ["userId", "id"])
    ?? "-";

  const walletId =
    readString(item, ["walletId", "walletID", "wallet_id"])
    ?? readString(wallet, ["walletId", "id"])
    ?? "-";

  const amount =
    readNumber(item, ["amount", "deltaAvailable", "deltaFrozen", "totalAmount", "amountPaid", "grossAmount", "price"])
    ?? readNumber(order, ["amount", "totalAmount", "amountPaid", "price"])
    ?? readNumber(wallet, ["deltaAvailable", "amount"]);
  const balanceBefore =
    readNumber(item, [
      "balanceBefore",
      "oldBalance",
      "previousBalance",
      "availableBalanceBefore",
      "beforeBalance",
    ])
    ?? readNumber(wallet, ["balanceBefore", "oldBalance", "balanceAvailableBefore"]);
  const balanceAfter =
    readNumber(item, [
      "balanceAfter",
      "newBalance",
      "currentBalance",
      "availableBalanceAfter",
      "afterBalance",
    ])
    ?? readNumber(wallet, ["balanceAfter", "newBalance", "balanceAvailableAfter", "balanceAvailable"]);
  const currency =
    readString(item, ["currency", "amountCurrency", "paymentCurrency"])
    ?? readString(order, ["currency", "amountCurrency"])
    ?? readString(wallet, ["currency"])
    ?? "VND";

  const status =
    readString(item, ["status", "transactionStatus", "paymentTxStatus", "orderStatus"])
    ?? readString(order, ["status", "orderStatus"])
    ?? "Unknown";

  const paymentSource =
    readString(item, ["paymentSource", "source", "method", "provider"])
    ?? readString(order, ["paymentSource", "source", "method", "provider"])
    ?? "-";

  const createdAt =
    readString(item, ["createdAt", "transactionDate", "paidAt", "completedAt"])
    ?? readString(order, ["createdAt", "paidAt", "completedAt"])
    ?? "";

  const subscription = readRecord(item, [
    "userSubscription",
    "subscription",
    "subscriptionInfo",
    "userSubscriptionInfo",
  ]);
  const startedAt =
    readString(item, ["startedAt", "startDate", "startAt", "periodStart", "validFrom"])
    ?? readString(order, ["startedAt", "startDate", "periodStart", "validFrom"])
    ?? readString(subscription, ["startedAt", "startDate", "startAt", "periodStart", "validFrom"])
    ?? "";
  const endedAt =
    readString(item, ["endedAt", "endDate", "endAt", "expiredAt", "expiresAt", "periodEnd", "validTo"])
    ?? readString(order, ["endedAt", "endDate", "expiredAt", "expiresAt", "periodEnd", "validTo"])
    ?? readString(subscription, [
      "endedAt",
      "endDate",
      "endAt",
      "expiredAt",
      "expiresAt",
      "periodEnd",
      "validTo",
    ])
    ?? "";

  const packageName =
    readString(item, ["subscriptionPackageName", "packageName", "subscriptionName", "planName"])
    ?? readString(order, ["subscriptionPackageName", "packageName", "subscriptionName", "planName"])
    ?? "-";
  const userRole = readString(item, ["userRole", "role", "accountRole"]) ?? "-";
  const operation = readString(item, ["operation", "op", "walletOperation"]) ?? "-";

  const note =
    readString(item, ["description", "note", "content", "message"])
    ?? readString(order, ["description", "note", "content"])
    ?? "-";

  const gateway = readString(item, ["gateway", "sePayGateway", "bankGateway"]) ?? "-";
  const accountNumber =
    readString(item, ["accountNumber", "sePayAccountNumber", "bankAccountNumber"]) ?? "-";
  const code = readString(item, ["code", "sePayCode"]) ?? "-";
  const content = readString(item, ["content", "sePayContent", "transferContent"]) ?? "-";
  const transferType = readString(item, ["transferType", "sePayTransferType"]) ?? "-";
  const transferAmount =
    readNumber(item, ["transferAmount", "sePayTransferAmount", "bankTransferAmount"])
    ?? amount;
  const referenceCode =
    readString(item, ["referenceCode", "sePayReferenceCode", "bankReferenceCode"]) ?? "-";
  const sePayError = readBoolean(item, ["error", "sePayError", "isError"]);
  const refType = readString(item, ["refType", "referenceType"]) ?? "-";
  const refPk = readString(item, ["refPk", "referenceId", "referencePk"]) ?? "-";

  return {
    key: `${transactionCode}-${createdAt}-${index}`,
    transactionCode,
    walletId,
    userId,
    userName,
    userContact,
    amount,
    balanceBefore,
    balanceAfter,
    currency,
    status,
    paymentSource,
    packageName,
    userRole,
    operation,
    createdAt,
    startedAt,
    endedAt,
    note,
    gateway,
    accountNumber,
    code,
    content,
    transferType,
    transferAmount,
    referenceCode,
    sePayError,
    refType,
    refPk,
  };
}

export default function TransactionsTable({ mode }: TransactionsTableProps) {
  const [rows, setRows] = useState<NormalizedTransaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [packageFilter, setPackageFilter] = useState("");
  const [selectedDepositTransaction, setSelectedDepositTransaction] =
    useState<NormalizedTransaction | null>(null);
  const [selectedUserTransaction, setSelectedUserTransaction] =
    useState<NormalizedTransaction | null>(null);
  const requestIdRef = useRef(0);

  const headerTitle =
    mode === "deposits"
      ? "Giao dịch nạp tiền"
      : mode === "user-transactions"
        ? "Giao dịch người dùng"
        : "Giao dịch mua gói người dùng";
  const emptyMessage =
    mode === "deposits"
      ? "Chưa có giao dịch nạp tiền phù hợp."
      : mode === "user-transactions"
        ? "Chưa có giao dịch người dùng phù hợp."
        : "Chưa có giao dịch mua gói người dùng phù hợp.";
  const searchPlaceholder =
    mode === "user-transactions"
      ? "Tìm theo SĐT, username, tên..."
      : "Tìm theo mã, tên, email...";

  const pageAmount = useMemo(
    () => rows.reduce((sum, row) => sum + (row.amount ?? 0), 0),
    [rows],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchText(searchText.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (mode !== "deposits") {
      setSelectedDepositTransaction(null);
    }
    if (mode !== "user-transactions") {
      setSelectedUserTransaction(null);
    }
  }, [mode]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText, statusFilter, packageFilter]);

  const loadTransactions = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      nextStatus: StatusFilter,
      nextPackageFilter: string,
    ) => {
      const currentRequestId = ++requestIdRef.current;
      setIsFetching(true);

      try {
        const params: GetAdminTransactionsParams = {
          pageNumber: nextPage,
          pageSize: PAGE_SIZE,
        };
        if (nextSearch) params.search = nextSearch;
        if (mode !== "user-transactions" && nextStatus !== "all") params.status = nextStatus;
        if (mode === "user-subscriptions" && nextPackageFilter.trim().length > 0) {
          params.packageName = nextPackageFilter.trim();
        }

        let response: BePagedWrapper<AdminTransactionRecord>;
        if (mode === "deposits") {
          response = await fetchAdminDepositTransactions(params);
        } else if (mode === "user-transactions") {
          response = await fetchAdminUserTransactions(params);
        } else {
          response = await fetchAdminUserSubscriptionTransactions(params);
        }

        if (currentRequestId !== requestIdRef.current) return;

        const parsed = parsePagedResponse(response);
        setRows(parsed.items.map((item, index) => normalizeTransaction(item, index)));
        setTotalCount(parsed.totalCount);
        setTotalPages(Math.max(1, parsed.totalPages));
        setError(null);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu giao dịch. Vui lòng thử lại.",
        );
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsFetching(false);
          setIsInitialLoading(false);
        }
      }
    },
    [mode],
  );

  useEffect(() => {
    void loadTransactions(page, debouncedSearchText, statusFilter, packageFilter);
  }, [page, debouncedSearchText, statusFilter, packageFilter, loadTransactions]);

  useEffect(() => {
    if (!selectedDepositTransaction) return;

    const existed = rows.some((row) => row.key === selectedDepositTransaction.key);
    if (!existed) {
      setSelectedDepositTransaction(null);
    }
  }, [rows, selectedDepositTransaction]);

  useEffect(() => {
    if (!selectedUserTransaction) return;

    const existed = rows.some((row) => row.key === selectedUserTransaction.key);
    if (!existed) {
      setSelectedUserTransaction(null);
    }
  }, [rows, selectedUserTransaction]);

  if (isInitialLoading) {
    return (
      <Card className="overflow-hidden py-0">
        <div className="border-b px-5 py-3.5">
          <Skeleton className="h-5 w-48" />
        </div>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && rows.length === 0) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-14">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <CreditCard className="h-7 w-7 text-destructive" />
          </div>
          <p className="mb-1 text-sm font-medium text-destructive">Không tải được dữ liệu</p>
          <p className="mb-4 text-center text-xs text-destructive/80">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void loadTransactions(page, debouncedSearchText, statusFilter, packageFilter)}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedStatusMeta = selectedDepositTransaction
    ? normalizeStatus(selectedDepositTransaction.status)
    : null;

  return (
    <>
      <Dialog
        open={mode === "deposits" && Boolean(selectedDepositTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDepositTransaction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch nạp tiền</DialogTitle>
          </DialogHeader>

          {selectedDepositTransaction && selectedStatusMeta && (
            <div className="space-y-4 text-sm">
              <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Mã giao dịch</p>
                <p className="break-all font-medium">{selectedDepositTransaction.transactionCode}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Ví của User nào</p>
                  <p className="font-medium">{selectedDepositTransaction.userName}</p>
                  <p className="break-all text-xs text-muted-foreground">
                    {selectedDepositTransaction.userContact}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    User ID: {selectedDepositTransaction.userId}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    Wallet ID: {selectedDepositTransaction.walletId}
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                    <Badge className={cn("mt-1 rounded-full px-2.5 text-[11px]", selectedStatusMeta.className)}>
                      {selectedStatusMeta.label}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Ngày giờ giao dịch</p>
                    <p className="font-medium">{formatDateTime(selectedDepositTransaction.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Số dư cũ</p>
                  <p className="mt-1 font-semibold">
                    {formatMoney(
                      selectedDepositTransaction.balanceBefore,
                      selectedDepositTransaction.currency,
                    )}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Số tiền nạp</p>
                  <p className="mt-1 font-semibold text-emerald-700">
                    {formatMoney(selectedDepositTransaction.amount, selectedDepositTransaction.currency)}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Số dư mới</p>
                  <p className="mt-1 font-semibold">
                    {formatMoney(
                      selectedDepositTransaction.balanceAfter,
                      selectedDepositTransaction.currency,
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-3">
                <div>
                  <p className="text-sm font-semibold">Thông tin SePay</p>
                  <p className="text-xs text-muted-foreground">
                    Dữ liệu SePay gửi về hệ thống
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem label="Cổng thanh toán" value={selectedDepositTransaction.gateway} />
                  <DetailItem label="Số tài khoản nhận" value={selectedDepositTransaction.accountNumber} />
                  <DetailItem
                    label="Loại chuyển khoản"
                    value={formatTransferType(selectedDepositTransaction.transferType)}
                  />
                  <DetailItem
                    label="Số tiền SePay ghi nhận"
                    value={formatMoney(
                      selectedDepositTransaction.transferAmount,
                      selectedDepositTransaction.currency,
                    )}
                  />
                  <DetailItem
                    label="Mã tham chiếu ngân hàng"
                    value={selectedDepositTransaction.referenceCode}
                  />
                  <DetailItem
                    label="Trạng thái lỗi"
                    value={formatSePayError(selectedDepositTransaction.sePayError)}
                  />
                  <DetailItem
                    label="Nội dung chuyển khoản"
                    value={selectedDepositTransaction.content}
                    className="sm:col-span-2"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={mode === "user-transactions" && Boolean(selectedUserTransaction)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserTransaction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch người dùng</DialogTitle>
          </DialogHeader>

          {selectedUserTransaction && (
            <div className="space-y-4 text-sm">
              <DetailItem
                label="Mã giao dịch"
                value={selectedUserTransaction.transactionCode}
                className="bg-muted/30"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Người dùng</p>
                  <p className="font-medium">{selectedUserTransaction.userName}</p>
                  <p className="break-all text-xs text-muted-foreground">
                    {selectedUserTransaction.userContact}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    User ID: {selectedUserTransaction.userId}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    Wallet ID: {selectedUserTransaction.walletId}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <DetailItem
                    label="Vai trò"
                    value={formatUserRole(selectedUserTransaction.userRole)}
                  />
                  <DetailItem
                    label="Loại giao dịch"
                    value={formatWalletOperation(selectedUserTransaction.operation)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DetailItem
                  label="Số dư trước"
                  value={formatMoney(
                    selectedUserTransaction.balanceBefore,
                    selectedUserTransaction.currency,
                  )}
                />
                <DetailItem
                  label="Biến động ví"
                  value={formatMoney(selectedUserTransaction.amount, selectedUserTransaction.currency)}
                />
                <DetailItem
                  label="Số dư sau"
                  value={formatMoney(
                    selectedUserTransaction.balanceAfter,
                    selectedUserTransaction.currency,
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Nguồn giao dịch"
                  value={formatPaymentSource(selectedUserTransaction.paymentSource)}
                />
                <DetailItem
                  label="Thời gian giao dịch"
                  value={formatDateTime(selectedUserTransaction.createdAt)}
                />
                <DetailItem
                  label="Loại tham chiếu"
                  value={formatReferenceType(selectedUserTransaction.refType)}
                />
                <DetailItem label="Mã tham chiếu" value={selectedUserTransaction.refPk} />
                <DetailItem
                  label="Ghi chú"
                  value={selectedUserTransaction.note}
                  className="sm:col-span-2"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-border/50 shadow-none py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tổng giao dịch</p>
            <p className="mt-1 text-xl font-semibold">{totalCount.toLocaleString("vi-VN")}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50 shadow-none py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Giá trị trang hiện tại</p>
            <p className="mt-1 text-xl font-semibold">
              {formatMoney(pageAmount, "VND")}
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
            <p className="text-sm font-semibold">{headerTitle}</p>
              <p className="text-xs text-muted-foreground">
              {isFetching ? "Đang cập nhật dữ liệu..." : `${totalCount} giao dịch`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-[220px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
              />
            </div>

            {mode === "user-subscriptions" && (
              <Input
                value={packageFilter}
                onChange={(event) => setPackageFilter(event.target.value)}
                placeholder="Lọc theo loại gói..."
                className="w-[220px]"
              />
            )}

            {mode !== "user-transactions" && (
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[180px]">
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
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() =>
                void loadTransactions(page, debouncedSearchText, statusFilter, packageFilter)}
            >
              <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isFetching && "animate-spin")} />
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
          <CardContent className="flex flex-col items-center py-16">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <CreditCard className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium">{emptyMessage}</p>
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="pl-5">Mã giao dịch</TableHead>
                    <TableHead>Người dùng</TableHead>
                    {mode === "user-transactions" && <TableHead>Vai trò</TableHead>}
                    {mode === "user-subscriptions" && <TableHead>Gói dịch vụ</TableHead>}
                    <TableHead className="text-right">
                      {mode === "user-transactions" ? "Biến động ví" : "Số tiền"}
                    </TableHead>
                    {mode !== "user-transactions" && (
                      <TableHead className="text-center">Trạng thái</TableHead>
                    )}
                    <TableHead>
                      {mode === "user-transactions" ? "Loại giao dịch" : "Nguồn thanh toán"}
                    </TableHead>
                    {mode === "user-subscriptions" && (
                      <>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày hết hạn</TableHead>
                      </>
                    )}
                    <TableHead className={mode === "deposits" ? "" : "pr-5"}>
                      {mode === "user-subscriptions" ? "Thời gian mua gói" : "Thời gian"}
                    </TableHead>
                    {(mode === "deposits" || mode === "user-transactions") && (
                      <TableHead className="pr-5 text-right">Thao tác</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const status = normalizeStatus(row.status);

                    return (
                      <TableRow key={row.key}>
                        <TableCell className="max-w-[220px] pl-5">
                          <p className="truncate text-sm font-medium">{row.transactionCode}</p>
                          {row.note !== "-" && (
                            <p className="truncate text-xs text-muted-foreground">{row.note}</p>
                          )}
                        </TableCell>

                        <TableCell className="max-w-[220px]">
                          <p className="truncate text-sm font-medium">{row.userName}</p>
                          <p className="truncate text-xs text-muted-foreground">{row.userContact}</p>
                        </TableCell>

                        {mode === "user-subscriptions" && (
                          <TableCell className="max-w-[180px]">
                            <p className="truncate text-sm">{row.packageName}</p>
                          </TableCell>
                        )}

                        {mode === "user-transactions" && (
                          <TableCell className="max-w-[150px]">
                            <p className="truncate text-sm">{formatUserRole(row.userRole)}</p>
                          </TableCell>
                        )}

                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            mode === "user-transactions" && (row.amount ?? 0) > 0 && "text-emerald-700",
                            mode === "user-transactions" && (row.amount ?? 0) < 0 && "text-red-700",
                          )}
                        >
                          {formatMoney(row.amount, row.currency)}
                        </TableCell>

                        {mode !== "user-transactions" && (
                          <TableCell className="text-center">
                            <Badge className={cn("rounded-full px-2.5 text-[11px]", status.className)}>
                              {status.label}
                            </Badge>
                          </TableCell>
                        )}

                        <TableCell className="max-w-[180px]">
                          <p className="truncate text-sm">
                            {mode === "user-transactions"
                              ? formatWalletOperation(row.operation)
                              : row.paymentSource}
                          </p>
                        </TableCell>

                        {mode === "user-subscriptions" && (
                          <>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(row.startedAt)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(row.endedAt)}
                            </TableCell>
                          </>
                        )}

                        <TableCell className={cn("text-sm text-muted-foreground", mode !== "deposits" && "pr-5")}>
                          {formatDateTime(row.createdAt)}
                        </TableCell>

                        {mode === "deposits" && (
                          <TableCell className="pr-5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedDepositTransaction(row)}
                            >
                              Xem chi tiết
                            </Button>
                          </TableCell>
                        )}

                        {mode === "user-transactions" && (
                          <TableCell className="pr-5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUserTransaction(row)}
                            >
                              Xem chi tiết
                            </Button>
                          </TableCell>
                        )}
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



