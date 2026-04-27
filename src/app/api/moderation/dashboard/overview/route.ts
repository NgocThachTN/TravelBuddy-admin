import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";
import { backendApi } from "@/lib/axios";
import { logAndExtract } from "@/lib/api-error";

type JsonObject = Record<string, unknown>;

function toRecord(value: unknown): JsonObject {
  return typeof value === "object" && value !== null
    ? (value as JsonObject)
    : {};
}

function toStringOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeTripCreationSeries(value: unknown) {
  return toArray(value)
    .map((item) => {
      const rec = toRecord(item);
      return {
        date: toStringOr(rec.date, toStringOr(rec.dateUtc, "")),
        count: toNumber(rec.count),
      };
    })
    .filter((item) => item.date.length > 0);
}

function normalizeTripCategoryDistribution(value: unknown) {
  return toArray(value)
    .map((item) => {
      const rec = toRecord(item);
      return {
        label: toStringOr(rec.label, toStringOr(rec.name, "")),
        value: toNumber(rec.value),
      };
    })
    .filter((item) => item.label.length > 0);
}

function normalizeTopDestinations(value: unknown) {
  return toArray(value)
    .map((item) => {
      const rec = toRecord(item);
      return {
        destinationName: toStringOr(
          rec.destinationName,
          toStringOr(rec.name, ""),
        ),
        tripCount: toNumber(rec.tripCount),
      };
    })
    .filter((item) => item.destinationName.length > 0);
}

function normalizeRecentActivities(value: unknown) {
  return toArray(value)
    .map((item) => {
      const rec = toRecord(item);
      return {
        activityType: toStringOr(rec.activityType, "User"),
        title: toStringOr(rec.title, ""),
        detail: toStringOr(rec.detail, ""),
        occurredAt: toStringOr(rec.occurredAt, new Date().toISOString()),
      };
    })
    .filter((item) => item.title.length > 0 || item.detail.length > 0);
}

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params: Record<string, string> = {};
  if (searchParams.has("windowDays")) {
    params.windowDays = searchParams.get("windowDays")!;
  }

  try {
    const { data } = await backendApi.get(
      "/api/v1/moderation/dashboard/overview",
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const wrapper = toRecord(data);
    const sourceData = toRecord(wrapper.data ?? data);
    const sourceKpis = toRecord(sourceData.kpis);
    const sourceSeries = toRecord(sourceData.series);

    const normalized = {
      generatedAtUtc: toStringOr(sourceData.generatedAtUtc, new Date().toISOString()),
      kpis: {
        totalTrips: toNumber(sourceKpis.totalTrips),
        pendingTripApprovals: toNumber(sourceKpis.pendingTripApprovals),
        approvedTrips: toNumber(sourceKpis.approvedTrips),
        rejectedTrips: toNumber(sourceKpis.rejectedTrips),
      },
      series: {
        tripCreation: normalizeTripCreationSeries(sourceSeries.tripCreation),
      },
      tripCategoryDistribution: normalizeTripCategoryDistribution(
        sourceData.tripCategoryDistribution,
      ),
      topDestinations: normalizeTopDestinations(sourceData.topDestinations),
      recentActivities: normalizeRecentActivities(sourceData.recentActivities),
    };

    return NextResponse.json({
      success: wrapper.success !== false,
      data: normalized,
    });
  } catch (err) {
    const e = logAndExtract(err, "GET moderation dashboard overview");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
