"use client";

import Link from "next/link";
import { Calendar, Map, Users } from "lucide-react";
import type { TripListItem } from "@/types";
import { tripStatusLabel } from "@/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserTripsTabsProps {
  joinedTrips: TripListItem[];
  ownedTrips: TripListItem[];
}

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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-500 border-gray-200";
  const code = typeof status === "number"
    ? [
      "Draft",
      "Processing",
      "Recruiting",
      "AlmostFull",
      "Full",
      "Confirmed",
      "Ongoing",
      "Completed",
      "Cancelled",
      "Hidden",
      "InReview",
    ][status]
    : status;
  return (code && STATUS_STYLES[code]) || "bg-gray-100 text-gray-500 border-gray-200";
}

function participantSummary(trip: TripListItem) {
  const countedMembers =
    typeof trip.currentMemberCount === "number" && Number.isFinite(trip.currentMemberCount)
      ? Math.max(1, trip.currentMemberCount)
      : 1;
  return trip.maxParticipants ? `${countedMembers} / ${trip.maxParticipants}` : `${countedMembers}`;
}

function TripsTable({ trips, emptyText }: { trips: TripListItem[]; emptyText: string }) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Map className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">{emptyText}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Chuyến đi</TableHead>
          <TableHead>Ngày bắt đầu</TableHead>
          <TableHead>Người tham gia</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trips.map((trip) => (
          <TableRow key={trip.tripId}>
            <TableCell>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{trip.title || "(Chưa đặt tên)"}</p>
                <p className="truncate text-xs text-muted-foreground">{trip.tripId}</p>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(trip.startTime)}
              </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {participantSummary(trip)}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("text-[11px]", getStatusStyle(trip.currentStatus))}>
                {tripStatusLabel(trip.currentStatus)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm" asChild>
                <Link href={`${ROUTES.TRIPS}/${trip.tripId}`}>
                  Xem chi tiết
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function UserTripsTabs({ joinedTrips, ownedTrips }: UserTripsTabsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Lịch sử chuyến đi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="joined">
          <TabsList className="h-10">
            <TabsTrigger value="joined">Đã tham gia ({joinedTrips.length})</TabsTrigger>
            <TabsTrigger value="owned">Đã tạo ({ownedTrips.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="joined" className="mt-4">
            <div className="rounded-lg border">
              <TripsTable trips={joinedTrips} emptyText="Người dùng chưa tham gia chuyến đi nào" />
            </div>
          </TabsContent>
          <TabsContent value="owned" className="mt-4">
            <div className="rounded-lg border">
              <TripsTable trips={ownedTrips} emptyText="Người dùng chưa tạo chuyến đi nào" />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
