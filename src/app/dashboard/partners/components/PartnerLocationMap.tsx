"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface PartnerLocationMapProps {
  lat?: number | null;
  lng?: number | null;
  label?: string;
  className?: string;
}

export default function PartnerLocationMap({
  lat,
  lng,
  label,
  className,
}: PartnerLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const hasCoordinates = useMemo(
    () => Number.isFinite(lat) && Number.isFinite(lng),
    [lat, lng],
  );

  useEffect(() => {
    let active = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initMap() {
      if (!hasCoordinates || !token || !mapContainerRef.current) return;

      try {
        setMapError(null);
        const mapboxglModule = await import("mapbox-gl");
        if (!active || !mapContainerRef.current || lat == null || lng == null) return;

        const mapboxgl = mapboxglModule.default;
        mapboxgl.accessToken = token;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/streets-v12",
          center: [lng, lat],
          zoom: 14,
          attributionControl: false,
        });
        mapRef.current = map;

        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

        map.on("error", (event) => {
          const message = event.error instanceof Error
            ? event.error.message
            : "Không thể tải bản đồ Mapbox.";
          setMapError(message);
        });

        map.once("load", () => {
          map.resize();
          if (markerRef.current) {
            markerRef.current.remove();
          }
          markerRef.current = new mapboxgl.Marker({ color: "#ef4444" })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 18 }).setHTML(
                `<div style="font-size:12px;line-height:1.4">${label || "Vị trí đối tác"}</div>`,
              ),
            )
            .addTo(map);
        });

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
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    };
  }, [hasCoordinates, label, lat, lng, token]);

  if (!hasCoordinates) {
    return (
      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        Chua co vi tri de hien thi ban do.
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
        Thiếu mã truy cập Mapbox. Thêm NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN vào .env.local để hiển thị bản đồ.
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="rounded-md border border-destructive/30 bg-secondary p-3 text-sm text-secondary-foreground">
        Không thể hiển thị Mapbox: {mapError}
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={className || "h-72 w-full overflow-hidden rounded-md border [&_.mapboxgl-canvas]:!outline-none"}
    />
  );
}
