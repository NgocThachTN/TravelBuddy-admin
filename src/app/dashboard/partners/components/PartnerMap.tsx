"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PartnerMapProps {
  lat: number;
  lng: number;
}

export function PartnerMap({ lat, lng }: PartnerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    let active = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      
      if (!token) {
        setMapError("Thiếu Mapbox Access Token.");
        setIsLoading(false);
        return;
      }

      setMapError(null);
      setIsLoading(true);

      try {
        const mapboxglModule = await import("mapbox-gl");
        if (!active || !mapContainerRef.current) return;

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
          zoom: 15,
        });
        mapRef.current = map;

        map.on("error", (event) => {
          const message = event.error instanceof Error ? event.error.message : "Không thể tải bản đồ Mapbox.";
          setMapError(message);
        });

        map.once("load", () => {
          setIsLoading(false);
          map.resize();
        });
        
        markerRef.current = new mapboxgl.Marker({ color: "#f87171" })
          .setLngLat([lng, lat])
          .addTo(map);

      } catch (error) {
        if (!active) return;
        setMapError(error instanceof Error ? error.message : "Lỗi khi khởi tạo bản đồ");
        setIsLoading(false);
      }
    }

    initMap();

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, token]);

  if (mapError) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/5 p-4 text-center text-sm font-medium text-destructive">
        {mapError}
      </div>
    );
  }

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-md border">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
