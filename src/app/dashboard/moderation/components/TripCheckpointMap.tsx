"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TripCheckpoint, TripItinerary } from "@/types";
import { checkpointLabelVi, checkpointMetaByType } from "./checkpoint-meta";

interface TripCheckpointMapProps {
  checkpoints: TripCheckpoint[];
  itinerary?: TripItinerary | null;
  onRouteStatsChange?: (stats: { distanceKm: number | null; durationMinutes: number | null }) => void;
}

interface DirectionsRoute {
  coordinates: [number, number][];
  distanceKm: number | null;
  durationMinutes: number | null;
}

interface CheckpointMarkerLayout {
  key: string;
  coordinate: [number, number];
  offset: [number, number];
  primaryCheckpoint: TripCheckpoint;
  secondaryCheckpoint?: TripCheckpoint;
}

const OVERLAP_THRESHOLD_METERS = 2.5;
const FAN_OUT_RADIUS_PIXELS = 18;

function checkpointDistanceMeters(left: TripCheckpoint, right: TripCheckpoint) {
  const earthRadiusMeters = 6371000;
  const latitudeDeltaRadians = degreesToRadians(right.lat - left.lat);
  const longitudeDeltaRadians = degreesToRadians(right.lng - left.lng);
  const startLatitudeRadians = degreesToRadians(left.lat);
  const endLatitudeRadians = degreesToRadians(right.lat);

  const haversine = (Math.sin(latitudeDeltaRadians / 2) ** 2)
    + (Math.cos(startLatitudeRadians)
      * Math.cos(endLatitudeRadians)
      * (Math.sin(longitudeDeltaRadians / 2) ** 2));
  const angularDistance = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusMeters * angularDistance;
}

function degreesToRadians(value: number) {
  return value * (Math.PI / 180);
}

function buildCheckpointMarkerLayouts(checkpoints: TripCheckpoint[]): CheckpointMarkerLayout[] {
  const groups: TripCheckpoint[][] = [];
  checkpoints.forEach((checkpoint) => {
    const matchedGroup = groups.find((group) => checkpointDistanceMeters(checkpoint, group[0]) <= OVERLAP_THRESHOLD_METERS);
    if (matchedGroup) {
      matchedGroup.push(checkpoint);
      return;
    }
    groups.push([checkpoint]);
  });

  return groups.flatMap((group) => {
    const orderedGroup = [...group].sort((left, right) => {
      const bySequence = left.sequenceNo - right.sequenceNo;
      if (bySequence !== 0) return bySequence;
      return left.tripCheckpointId.localeCompare(right.tripCheckpointId);
    });

    if (orderedGroup.length === 1) {
      const checkpoint = orderedGroup[0];
      return [{
        key: checkpoint.tripCheckpointId,
        coordinate: [checkpoint.lng, checkpoint.lat] as [number, number],
        offset: [0, 0] as [number, number],
        primaryCheckpoint: checkpoint,
      }];
    }

    if (orderedGroup.length === 2) {
      const [primaryCheckpoint, secondaryCheckpoint] = orderedGroup;
      return [{
        key: `${primaryCheckpoint.tripCheckpointId}:${secondaryCheckpoint.tripCheckpointId}`,
        coordinate: [primaryCheckpoint.lng, primaryCheckpoint.lat] as [number, number],
        offset: [0, 0] as [number, number],
        primaryCheckpoint,
        secondaryCheckpoint,
      }];
    }

    const angleStep = (Math.PI * 2) / orderedGroup.length;
    const radiusPixels = FAN_OUT_RADIUS_PIXELS + Math.max(0, orderedGroup.length - 2) * 2;

    return orderedGroup.map((checkpoint, index) => {
      const angle = (-Math.PI / 2) + (angleStep * index);
      return {
        key: checkpoint.tripCheckpointId,
        coordinate: [checkpoint.lng, checkpoint.lat] as [number, number],
        offset: [
          Math.cos(angle) * radiusPixels,
          Math.sin(angle) * radiusPixels,
        ] as [number, number],
        primaryCheckpoint: checkpoint,
      };
    });
  });
}

function checkpointMarkerTitle(checkpoint: TripCheckpoint) {
  return checkpoint.locationName || checkpoint.displayAddress || "Checkpoint";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildCheckpointPopupHtml(layout: CheckpointMarkerLayout) {
  const checkpoints = layout.secondaryCheckpoint
    ? [layout.primaryCheckpoint, layout.secondaryCheckpoint]
    : [layout.primaryCheckpoint];

  return checkpoints.map((checkpoint, index) => {
    const divider = index === 0 || checkpoints.length === 1
      ? ""
      : '<div style="margin:6px 0;border-top:1px solid rgba(148,163,184,0.35)"></div>';
    return `${divider}<div style="font-size:12px;line-height:1.4">
      <strong>${escapeHtml(checkpointMarkerTitle(checkpoint))}</strong><br/>
      <span>#${checkpoint.sequenceNo} - ${escapeHtml(checkpointLabelVi(checkpoint.tripCheckpointType))}</span>
    </div>`;
  }).join("");
}

function buildCheckpointMarkerElement(layout: CheckpointMarkerLayout) {
  const primaryMeta = checkpointMetaByType(layout.primaryCheckpoint.tripCheckpointType);
  const secondaryMeta = layout.secondaryCheckpoint
    ? checkpointMetaByType(layout.secondaryCheckpoint.tripCheckpointType)
    : null;

  const element = document.createElement("div");
  Object.assign(element.style, {
    position: "relative",
    display: "flex",
    width: "32px",
    height: "32px",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "999px",
    border: "2px solid #ffffff",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.28)",
    cursor: "pointer",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "700",
    lineHeight: "1",
    userSelect: "none",
  });
  element.dataset.markerKey = layout.key;

  if (secondaryMeta) {
    element.style.background = `linear-gradient(90deg, ${primaryMeta.color} 0 50%, ${secondaryMeta.color} 50% 100%)`;

    const leftGlyph = document.createElement("span");
    leftGlyph.textContent = primaryMeta.markerGlyph;
    Object.assign(leftGlyph.style, {
      position: "absolute",
      left: "6px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
    });
    element.appendChild(leftGlyph);

    const divider = document.createElement("span");
    Object.assign(divider.style, {
      position: "absolute",
      left: "50%",
      top: "6px",
      width: "1.5px",
      height: "14px",
      backgroundColor: "rgba(255,255,255,0.82)",
      transform: "translateX(-50%)",
      pointerEvents: "none",
    });
    element.appendChild(divider);

    const rightGlyph = document.createElement("span");
    rightGlyph.textContent = secondaryMeta.markerGlyph;
    Object.assign(rightGlyph.style, {
      position: "absolute",
      right: "6px",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
    });
    element.appendChild(rightGlyph);
  } else {
    element.style.backgroundColor = primaryMeta.color;
    element.textContent = primaryMeta.markerGlyph;
  }

  const indexTag = document.createElement("span");
  indexTag.textContent = layout.secondaryCheckpoint
    ? `${layout.primaryCheckpoint.sequenceNo}/${layout.secondaryCheckpoint.sequenceNo}`
    : String(layout.primaryCheckpoint.sequenceNo);
  Object.assign(indexTag.style, {
    position: "absolute",
    bottom: "-8px",
    padding: "0 4px",
    borderRadius: "999px",
    backgroundColor: "rgba(15,23,42,0.78)",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: "700",
    lineHeight: "14px",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  });
  element.appendChild(indexTag);

  return element;
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

export default function TripCheckpointMap({
  checkpoints,
  itinerary,
  onRouteStatsChange,
}: TripCheckpointMapProps) {
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
  const markerLayouts = useMemo(
    () => buildCheckpointMarkerLayouts(geoCheckpoints),
    [geoCheckpoints],
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

  useEffect(() => {
    onRouteStatsChange?.({
      distanceKm: mapStats.distanceKm,
      durationMinutes: mapStats.durationMinutes,
    });
  }, [mapStats.distanceKm, mapStats.durationMinutes, onRouteStatsChange]);

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
        markersRef.current = markerLayouts.map((layout) => {
          const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
            buildCheckpointPopupHtml(layout),
          );

          /*
            `<div style="font-size:12px;line-height:1.4">
              <strong>${cp.locationName || cp.displayAddress || "Điểm dừng"}</strong><br/>
              <span>${checkpointLabelVi(cp.tripCheckpointType)}</span>
            </div>`,
          */

          return new mapboxgl.Marker({
            element: buildCheckpointMarkerElement(layout),
            offset: layout.offset,
          })
            .setLngLat(layout.coordinate)
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
  }, [geoCheckpoints, markerLayouts, routeCoordinates, token]);

  if (!geoCheckpoints.length) {
    return (
      <div className="flex h-[65vh] min-h-[500px] items-center justify-center rounded-lg border bg-secondary text-secondary-foreground/20 text-sm text-muted-foreground">
        Không có checkpoint có tọa độ để hiển thị bản đồ.
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-[65vh] min-h-[500px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary p-4 text-center">
        <p className="text-sm font-medium text-secondary-foreground">Thiếu Mapbox access token.</p>
        <p className="text-xs text-secondary-foreground">Thêm NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN vào .env.local để hiển thị bản đồ checkpoint.</p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex h-[65vh] min-h-[500px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-secondary text-secondary-foreground p-4 text-center">
        <p className="text-sm font-medium text-foreground">Không thể hiển thị Mapbox.</p>
        <p className="text-xs text-foreground/80">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-[65vh] min-h-[500px] w-full overflow-hidden rounded-lg border [&_.mapboxgl-canvas]:!outline-none" />
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
        <span className="absolute right-3 top-3 max-w-[220px] rounded bg-secondary px-2 py-1 text-[10px] text-secondary-foreground">
          {directionsError}. Đang dùng đường thẳng.
        </span>
      )}
    </div>
  );
}
