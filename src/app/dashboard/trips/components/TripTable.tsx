"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { fetchTrips, deleteTrip } from "@/lib/api";
import { extractApiError } from "@/lib/api-error";
import type { TripListItem, GetTripsParams } from "@/types";
import { TRIP_STATUS_CODES, tripStatusLabel } from "@/types";
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
  Search,
  Filter,
  RefreshCw,
  Eye,
  Map,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PaginationControl from "@/components/pagination-control";

const PAGE_SIZE = 15;

// ── Status badge styles ──

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  Processing: "bg-sky-100 text-sky-700 border-sky-200",
  Recruiting: "bg-emerald-100 text-emerald-700 border-emerald-200",
  AlmostFull: "bg-amber-100 text-amber-700 border-amber-200",
  Full: "bg-orange-100 text-orange-700 border-orange-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Ongoing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Completed: "bg-gray-100 text-gray-600 border-gray-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Hidden: "bg-gray-100 text-gray-500 border-gray-200",
  InReview: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

function getStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-500";
  const code = typeof status === "number" ? TRIP_STATUS_CODES[status] : status;
  return (code && STATUS_STYLES[code]) || "bg-gray-100 text-gray-500";
}

// ── Helper functions ──

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getOwnerName(trip: TripListItem) {
  const first = trip.ownerFirstName?.trim();
  const last = trip.ownerLastName?.trim();
  const full = [first, last].filter(Boolean).join(" ");
  return full || "(Chưa đặt tên)";
}

function getOwnerInitials(trip: TripListItem) {
  const first = trip.ownerFirstName?.trim();
  const last = trip.ownerLastName?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return "??";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Main component ──

export default function TripTable() {
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Delete trip state
  const [confirmTrip, setConfirmTrip] = useState<TripListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debounce search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadTrips = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const params: GetTripsParams = {
        pageNumber: p,
        pageSize: PAGE_SIZE,
        sortBy: "createdAt",
        sortDirection: "desc",
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const result = await fetchTrips(params);
      setTrips(result.data.items);
      setTotalCount(result.data.totalCount);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách chuyến đi");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadTrips(page);
  }, [loadTrips, page]);

  async function handleDeleteConfirm() {
    if (!confirmTrip) return;
    setDeleting(true);
    try {
      await deleteTrip(confirmTrip.tripId);
      setConfirmTrip(null);
      loadTrips(page);
    } catch (err) {
      const e = extractApiError(err, "Không thể xoá chuyến đi");
      setDeleteError(e.message);
      setConfirmTrip(null);
    } finally {
      setDeleting(false);
    }
  }

  // ── Loading skeleton ──
  if (loading && trips.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
              <Skeleton className="h-10 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Map className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => loadTrips(page)}>
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
            placeholder="Tìm chuyến đi theo tên…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 bg-background"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="shrink-0 h-9 w-9"
          onClick={() => loadTrips(page)}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* ── Count bar ── */}
      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Tổng cộng <span className="font-semibold text-foreground">{totalCount}</span> chuyến đi
        </span>
      </div>

      {/* ── Table ── */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chuyến đi</TableHead>
            <TableHead>Chủ trip</TableHead>
            <TableHead>Ngày bắt đầu</TableHead>
            <TableHead>Người tham gia</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Map className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Không tìm thấy chuyến đi</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hãy thử thay đổi từ khóa tìm kiếm
                </p>
              </TableCell>
            </TableRow>
          ) : (
            trips.map((trip) => (
              <TableRow key={trip.tripId} className="group">
                {/* Trip name + cover */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {trip.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={trip.coverImageUrl}
                        alt={trip.title || ""}
                        className="h-10 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded-md bg-muted">
                        <Map className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium max-w-[200px]">
                        {trip.title || "(Chưa đặt tên)"}
                      </p>
                      {trip.tripTypeCategories.length > 0 && (
                        <p className="truncate text-xs text-muted-foreground max-w-[200px]">
                          {trip.tripTypeCategories.map((c) => c.name).filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Owner */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      {trip.ownerAvatarUrl && (
                        <AvatarImage src={trip.ownerAvatarUrl} alt={getOwnerName(trip)} />
                      )}
                      <AvatarFallback
                        className={cn("text-[10px] font-semibold", getAvatarColor(trip.ownerUserId || trip.tripId))}
                      >
                        {getOwnerInitials(trip)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                      {getOwnerName(trip)}
                    </span>
                  </div>
                </TableCell>

                {/* Start date */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(trip.startTime)}
                </TableCell>

                {/* Participant count */}
                <TableCell className="text-sm text-muted-foreground">
                  {trip.maxParticipants ? `— / ${trip.maxParticipants}` : "—"}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge variant="outline" className={cn("text-[11px]", getStatusStyle(trip.currentStatus))}>
                    {tripStatusLabel(trip.currentStatus)}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`${ROUTES.TRIPS}/${trip.tripId}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => setConfirmTrip(trip)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xoá trip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="border-t p-4">
          <PaginationControl
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ── Confirm delete dialog ── */}
      <AlertDialog open={!!confirmTrip} onOpenChange={(open) => { if (!open) setConfirmTrip(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá chuyến đi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xoá chuyến đi{" "}
              <span className="font-semibold">&quot;{confirmTrip?.title || "(Chưa đặt tên)"}&quot;</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Đang xoá…" : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete error popup ── */}
      <Dialog open={!!deleteError} onOpenChange={(open) => { if (!open) setDeleteError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá chuyến đi thất bại</DialogTitle>
            <DialogDescription>{deleteError}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setDeleteError(null)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
