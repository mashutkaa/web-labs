"use client";

import { useEffect, useRef } from "react";
import type { Map, LayerGroup, CircleMarker } from "leaflet";
import type { MonitoringStation } from "@/types/station";
import { AirQualityIndex } from "@/types/air-quality";
import "leaflet/dist/leaflet.css";

/** Межі України для початкового вигляду карти (південний захід — північний схід) */
const UKRAINE_BOUNDS: [[number, number], [number, number]] = [
  [44.35, 22.05],
  [52.45, 40.25],
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markerColor(station: MonitoringStation): string {
  const level = station.currentAqi?.level;
  if (level === AirQualityIndex.Hazardous) return "#7e0023";
  if (level === AirQualityIndex.VeryUnhealthy) return "#8f3f97";
  if (level === AirQualityIndex.Unhealthy) return "#e53935";
  if (level === AirQualityIndex.UnhealthySensitive) return "#ff9800";
  if (level === AirQualityIndex.Moderate) return "#fdd835";
  if (level === AirQualityIndex.Good) return "#2e7d32";
  const aqi = station.currentAqi?.aqi ?? 0;
  if (aqi <= 50) return "#2e7d32";
  if (aqi <= 100) return "#fdd835";
  if (aqi <= 150) return "#ff9800";
  if (aqi <= 200) return "#e53935";
  if (aqi <= 300) return "#8f3f97";
  return "#7e0023";
}

function popupHtml(station: MonitoringStation): string {
  const aqi = station.currentAqi?.aqi ?? "—";
  const level = station.currentAqi?.level ?? "—";
  const name = escapeHtml(station.name);
  const city = escapeHtml(station.city);
  const type = escapeHtml(String(station.type));
  const id = escapeHtml(station.id);
  return `
    <div class="leaflet-popup-eco" style="min-width:200px;font-family:system-ui,sans-serif">
      <strong style="font-size:14px">${name}</strong>
      <div style="font-size:12px;color:#444;margin:4px 0">${city} · ${type}</div>
      <div style="margin:6px 0"><strong>ІЯП:</strong> ${aqi}</div>
      <div style="font-size:12px;margin-bottom:8px">${typeof level === "string" ? escapeHtml(level) : level}</div>
      <a href="/stations/${id}" style="color:#059669;font-weight:600;font-size:13px">Детальніше →</a>
    </div>
  `;
}

type LeafletModule = typeof import("leaflet");

export interface StationsMapProps {
  stations: MonitoringStation[];
  selectedId: string | null;
  onSelectChange: (id: string | null) => void;
  /** Після зміни масштабу карти (для аналітики). */
  onZoomChange?: (zoomLevel: number) => void;
}

export function StationsMap({
  stations,
  selectedId,
  onSelectChange,
  onZoomChange,
}: StationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<CircleMarker[]>([]);
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const zoomListenerAttachedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    (async () => {
      const L: LeafletModule = await import("leaflet");
      if (cancelled || !el) return;

      if (!mapRef.current) {
        const map = L.map(el, {
          scrollWheelZoom: true,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        map.fitBounds(UKRAINE_BOUNDS, { padding: [24, 24] });
        const group = L.layerGroup().addTo(map);
        mapRef.current = map;
        layerRef.current = group;

        if (!zoomListenerAttachedRef.current) {
          zoomListenerAttachedRef.current = true;
          map.on("zoomend", () => {
            onZoomChangeRef.current?.(map.getZoom());
          });
        }
      }

      const map = mapRef.current!;
      const group = layerRef.current!;
      group.clearLayers();
      markersRef.current = [];

      stations.forEach((station) => {
        const { lat, lng } = station.coordinates;
        const selected = selectedId === station.id;
        const color = markerColor(station);
        const marker = L.circleMarker([lat, lng], {
          radius: selected ? 14 : 9,
          stroke: true,
          color: selected ? "#111827" : "#374151",
          weight: selected ? 3 : 1.5,
          opacity: 1,
          fillColor: color,
          fillOpacity: 0.9,
        });

        marker.bindPopup(popupHtml(station), { maxWidth: 280 });
        marker.on("click", () => {
          onSelectChange(station.id);
        });

        marker.addTo(group);
        markersRef.current.push(marker);
      });

      if (selectedId) {
        const sel = stations.find((s) => s.id === selectedId);
        if (sel) {
          const { lat, lng } = sel.coordinates;
          map.flyTo([lat, lng], Math.max(map.getZoom(), 9), { duration: 0.45 });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stations, selectedId, onSelectChange]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current = [];
      zoomListenerAttachedRef.current = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[min(55vh,520px)] w-full min-h-[280px] rounded-xl border border-gray-200 shadow-sm z-0 md:h-[min(60vh,540px)] md:min-h-[320px] xl:h-[min(62vh,580px)] xl:min-h-[360px]"
    />
  );
}

export default StationsMap;
