"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TripCheckpoint, TripItinerary } from "@/types";
import { checkpointLabelVi, checkpointMetaByType } from "./checkpoint-meta";

interface TripCheckpointMapProps {
  checkpoints: TripCheckpoint[];
  itinerary?: TripItinerary | null;
}

interface DirectionsRoute {
  coordinates: [number, number][];
  distanceKm: number | null;
  durationMinutes: number | null;
}

function canUseMap(checkpoints: TripCheckpoint[], token: string | undefined) {
  return Boolean(token) && checkpoints.length > 0;
}

function formatDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} phút`;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return minute > 0 ? `${hour}h ${minute}p` : `${hour}h`;
}

async function fetchDirections(
  checkpoints: TripCheckpoint[],
  token: string,
): Promise<DirectionsRoute | null> {
  if (checkpoints.length < 2) return null;

  const coordinateList = checkpoints.map((cp) => `${cp.lng},${cp.lat}`).join(";");
  const params = new URLSearchParams({
    access_token: token,
    overview: "full",
    geometries: "geojson",
    language: "vi",
    steps: "false",
    voice_instructions: "false",
    banner_instructions: "false",
  });

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinateList}?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Mapbox Directions trả lỗi (${response.status})`);
  }

  const payload = await response.json() as {
    routes?: Array<{
      distance?: number;
      duration?: number;
      geometry?: {
        coordinates?: Array<[number, number]>;
      };
    }>;
  };
  const firstRoute = payload.routes?.[0];
  if (!firstRoute?.geometry?.coordinates?.length) return null;

  const routeCoordinates = firstRoute.geometry.coordinates
    .filter((point) => Array.isArray(point) && point.length >= 2)
    .map((point) => [Number(point[0]), Number(point[1])] as [number, number]);

  return {
    coordinates: routeCoordinates,
    distanceKm: typeof firstRoute.distance === "number"
      ? Number((firstRoute.distance / 1000).toFixed(1))
      : null,
    durationMinutes: typeof firstRoute.duration === "number"
      ? Math.round(firstRoute.duration / 60)
      : null,
  };
}

export default function TripCheckpointMap({ checkpoints, itinerary }: TripCheckpointMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsRoute, setDirectionsRoute] = useState<DirectionsRoute | null>(null);

  const sortedCheckpoints = useMemo(
    () => [...checkpoints].sort((a, b) => a.sequenceNo - b.sequenceNo),
    [checkpoints],
  );
  const geoCheckpoints = useMemo(
    () => sortedCheckpoints.filter((cp) => Number.isFinite(cp.lat) && Number.isFinite(cp.lng)),
    [sortedCheckpoints],
  );
  const straightLine = useMemo(
    () => geoCheckpoints.map((cp) => [cp.lng, cp.lat] as [number, number]),
    [geoCheckpoints],
  );
  const routeCoordinates = useMemo(
    () => (directionsRoute?.coordinates?.length ?? 0) >= 2 ? directionsRoute!.coordinates : straightLine,
    [directionsRoute, straightLine],
  );
  const mapStats = useMemo(() => {
    const distanceKm = directionsRoute?.distanceKm
      ?? (typeof itinerary?.distanceM === "number" ? Number((itinerary.distanceM / 1000).toFixed(1)) : null);
    const durationMinutes = directionsRoute?.durationMinutes
      ?? (typeof itinerary?.durationS === "number" ? Math.round(itinerary.durationS / 60) : null);
    return {
      points: geoCheckpoints.length,
      distanceKm,
      durationMinutes,
    };
  }, [directionsRoute, geoCheckpoints.length, itinerary]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const routeKey = useMemo(
    () => geoCheckpoints.map((cp) => `${cp.lat.toFixed(6)},${cp.lng.toFixed(6)}`).join("|"),
    [geoCheckpoints],
  );

  useEffect(() => {
    let active = true;

    async function loadDirections() {
      if (!token || geoCheckpoints.length < 2) {
        setDirectionsRoute(null);
        setDirectionsError(null);
        setDirectionsLoading(false);
        return;
      }

      setDirectionsLoading(true);
      setDirectionsError(null);
      try {
        const route = await fetchDirections(geoCheckpoints, token);
        if (!active) return;
        setDirectionsRoute(route);
      } catch (error) {
        if (!active) return;
        setDirectionsError(error instanceof Error ? error.message : "Không thể tải route từ Mapbox.");
        setDirectionsRoute(null);
      } finally {
        if (active) setDirectionsLoading(false);
      }
    }

    loadDirections();
    return () => {
      active = false;
    };
  }, [geoCheckpoints, routeKey, token]);

  useEffect(() => {
    let active = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initMap() {
      if (!mapContainerRef.current || !canUseMap(geoCheckpoints, token)) return;
      setMapError(null);

      try {
        const mapboxglModule = await import("mapbox-gl");
        if (!active || !mapContainerRef.current) return;

        const mapboxgl = mapboxglModule.default;
        mapboxgl.accessToken = token || "";

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const first = geoCheckpoints[0];
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
          center: [first.lng, first.lat],
          zoom: 10,
        });
        mapRef.current = map;

        const bounds = new mapboxgl.LngLatBounds();
        routeCoordinates.forEach(([lng, lat]) => bounds.extend([lng, lat]));

        map.on("error", (event) => {
          const message = event.error instanceof Error ? event.error.message : "Không thể tải bản đồ Mapbox.";
          setMapError(message);
        });

        map.once("load", () => {
          map.resize();
          setTimeout(() => map.resize(), 140);

          if (routeCoordinates.length >= 2 && !map.getSource("route")) {
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates,
                },
                properties: {},
              },
            });
            map.addLayer({
              id: "route-line",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#2563eb",
                "line-width": 4,
                "line-opacity": 0.85,
              },
            });
          }
        });

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = geoCheckpoints.map((cp, index) => {
          const meta = checkpointMetaByType(cp.tripCheckpointType);

          const el = document.createElement("div");
          el.className = "relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-white shadow";
          el.style.backgroundColor = meta.color;
          el.textContent = meta.markerGlyph;

          const indexTag = document.createElement("span");
          indexTag.className = "absolute -bottom-2 rounded-full bg-black/75 px-1 text-[9px] leading-3";
          indexTag.textContent = String(index + 1);
          el.appendChild(indexTag);

          const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<div style="font-size:12px;line-height:1.4">
              <strong>${cp.locationName || cp.displayAddress || "Checkpoint"}</strong><br/>
              <span>${checkpointLabelVi(cp.tripCheckpointType)}</span>
            </div>`,
          );

          return new mapboxgl.Marker({ element: el })
            .setLngLat([cp.lng, cp.lat])
            .setPopup(popup)
            .addTo(map);
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 13, duration: 0 });
        }

        resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        resizeObserver.observe(mapContainerRef.current);
      } catch (error) {
        setMapError(error instanceof Error ? error.message : "Không thể khởi tạo bản đồ Mapbox.");
      }
    }

    initMap();

    return () => {
      active = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };
  }, [geoCheckpoints, routeCoordinates, token]);

  if (!geoCheckpoints.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground">
        Không có checkpoint có tọa độ để hiển thị bản đồ.
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-900">Thiếu Mapbox access token.</p>
        <p className="text-xs text-amber-800">Thêm NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN vào .env.local để hiển thị bản đồ checkpoint.</p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm font-medium text-destructive">Không thể hiển thị Mapbox.</p>
        <p className="text-xs text-destructive/80">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-[420px] w-full overflow-hidden rounded-lg border [&_.mapboxgl-canvas]:!outline-none" />
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow">
          {mapStats.points} điểm
        </span>
        {typeof mapStats.distanceKm === "number" && (
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow">
            {mapStats.distanceKm.toFixed(1)} km
          </span>
        )}
        {formatDuration(mapStats.durationMinutes) && (
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow">
            {formatDuration(mapStats.durationMinutes)}
          </span>
        )}
      </div>
      {directionsLoading && (
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/75 px-2 py-0.5 text-[11px] text-white">
          Đang tính route...
        </span>
      )}
      {!directionsLoading && directionsError && (
        <span className="absolute right-3 top-3 max-w-[220px] rounded bg-amber-100 px-2 py-1 text-[10px] text-amber-800">
          {directionsError}. Đang dùng đường thẳng.
        </span>
      )}
    </div>
  );
}

