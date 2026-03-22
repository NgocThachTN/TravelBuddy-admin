"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TripCheckpoint } from "@/types";

interface TripCheckpointMapProps {
  checkpoints: TripCheckpoint[];
}

function markerColorByType(type: string | number | null | undefined) {
  const value = String(type || "").toLowerCase();
  if (value === "start") return "#16a34a";
  if (value === "destination") return "#dc2626";
  if (value === "return") return "#0d9488";
  if (value === "end") return "#7c3aed";
  return "#2563eb";
}

function canUseMap(checkpoints: TripCheckpoint[], token: string | undefined) {
  return Boolean(token) && checkpoints.length > 0;
}

export default function TripCheckpointMap({ checkpoints }: TripCheckpointMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const sortedCheckpoints = useMemo(
    () => [...checkpoints].sort((a, b) => a.sequenceNo - b.sequenceNo),
    [checkpoints],
  );

  useEffect(() => {
    let active = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initMap() {
      const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!mapContainerRef.current || !canUseMap(sortedCheckpoints, token)) return;
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

        const first = sortedCheckpoints[0];
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
          center: [first.lng, first.lat],
          zoom: 10,
        });
        mapRef.current = map;

        const bounds = new mapboxgl.LngLatBounds();
        const coords = sortedCheckpoints.map((cp) => [cp.lng, cp.lat] as [number, number]);
        coords.forEach(([lng, lat]) => bounds.extend([lng, lat]));

        map.on("error", (event) => {
          const message = event.error instanceof Error ? event.error.message : "Không thể tải bản đồ Mapbox.";
          setMapError(message);
        });

        map.once("load", () => {
          map.resize();
          setTimeout(() => map.resize(), 140);

          if (coords.length >= 2 && !map.getSource("route")) {
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: coords,
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
        markersRef.current = sortedCheckpoints.map((cp, index) => {
          const el = document.createElement("div");
          el.className = "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white shadow";
          el.style.backgroundColor = markerColorByType(cp.tripCheckpointType);
          el.textContent = String(index + 1);

          const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
            `<div style="font-size:12px;line-height:1.4">
              <strong>${cp.locationName || cp.displayAddress || "Checkpoint"}</strong><br/>
              <span>${cp.tripCheckpointType}</span>
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
  }, [sortedCheckpoints]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!sortedCheckpoints.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground">
        Không có checkpoint để hiển thị bản đồ.
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

  return <div ref={mapContainerRef} className="h-[420px] w-full overflow-hidden rounded-lg border [&_.mapboxgl-canvas]:!outline-none" />;
}
