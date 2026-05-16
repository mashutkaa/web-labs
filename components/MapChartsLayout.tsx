"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  ChevronRight,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import { ChartsDashboardPanel } from "@/components/ChartsDashboardPanel";
import { gaEvent } from "@/lib/gtag";
import type { MonitoringStation } from "@/types/station";
import type { Measurement } from "@/types/measurement";

const StationsMapLazy = dynamic(
  () => import("@/components/StationsMap").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(55vh,520px)] min-h-[280px] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 animate-pulse md:min-h-[320px]"
        aria-busy="true"
      >
        Завантаження карти…
      </div>
    ),
  },
);

type PieScope = "network" | "station";

async function fetchMeasurementsClient(
  stationId: string,
  days: number,
  signal?: AbortSignal,
): Promise<Measurement[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    limit: "250",
    page: "1",
    sort: "timestamp",
    order: "asc",
  });
  const res = await fetch(
    `/api/stations/${encodeURIComponent(stationId)}/measurements?${params.toString()}`,
    { signal },
  );
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok || !json || typeof json !== "object") return [];
  const body = json as { success?: boolean; data?: Measurement[] };
  if (!body.success || !Array.isArray(body.data)) return [];
  return body.data;
}

export interface MapChartsLayoutProps {
  stations: MonitoringStation[];
}

export function MapChartsLayout({ stations }: MapChartsLayoutProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [days, setDays] = useState(7);
  const [pieScope, setPieScope] = useState<PieScope>("network");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [measureLoading, setMeasureLoading] = useState(false);
  const [measureError, setMeasureError] = useState<string | null>(null);

  const filtersBootRef = useRef(false);
  const lastZoomSentRef = useRef(0);

  const handleStationSelect = useCallback(
    (id: string | null, source: "map" | "list") => {
      setSelectedId(id);
      if (id) {
        gaEvent("map_station_click", {
          station_id: id,
          interaction_source: source,
        });
      }
    },
    [],
  );

  const onMapZoomEnd = useCallback((zoom: number) => {
    const now = Date.now();
    if (now - lastZoomSentRef.current < 2000) return;
    lastZoomSentRef.current = now;
    gaEvent("map_zoom", {
      zoom_level: Math.round(zoom * 10) / 10,
    });
  }, []);

  const cityOptions = useMemo(() => {
    const set = new Set(stations.map((s) => s.city).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "uk"));
  }, [stations]);

  const afterCityFilter = useMemo(() => {
    if (!cityFilter) return stations;
    return stations.filter((s) => s.city === cityFilter);
  }, [stations, cityFilter]);

  const visibleStations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return afterCityFilter;
    return afterCityFilter.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [afterCityFilter, search]);

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === selectedId) ?? null,
    [stations, selectedId],
  );

  useEffect(() => {
    if (!selectedId) {
      setMeasurements([]);
      setMeasureError(null);
      setMeasureLoading(false);
      return;
    }

    const ac = new AbortController();
    setMeasureLoading(true);
    setMeasureError(null);

    fetchMeasurementsClient(selectedId, days, ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) {
          setMeasurements(data);
        }
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        const msg =
          err instanceof Error ? err.message : "Не вдалося завантажити дані";
        setMeasureError(msg);
        setMeasurements([]);
      })
      .finally(() => {
        if (!ac.signal.aborted) setMeasureLoading(false);
      });

    return () => ac.abort();
  }, [selectedId, days]);

  useEffect(() => {
    if (!selectedId || measureLoading) return;
    if (measurements.length === 0) return;
    gaEvent("dashboard_charts_view", {
      station_id: selectedId,
      period_days: days,
      data_points: measurements.length,
    });
  }, [selectedId, days, measureLoading, measurements.length]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const q = search.trim();
      if (!q) return;
      gaEvent("charts_filter", {
        context: "map_dashboard",
        filter_type: "search",
        query_length: q.length,
      });
    }, 900);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!filtersBootRef.current) {
      filtersBootRef.current = true;
      return;
    }
    gaEvent("charts_filter", {
      context: "map_dashboard",
      filter_type: "city",
      city: cityFilter || "all",
    });
  }, [cityFilter]);

  useEffect(() => {
    if (!filtersBootRef.current) return;
    if (!selectedId) return;
    gaEvent("charts_filter", {
      context: "map_dashboard",
      filter_type: "period_days",
      period_days: days,
    });
  }, [days, selectedId]);

  const handleClearSelection = useCallback(() => {
    setSelectedId(null);
    setPieScope("network");
    gaEvent("map_selection_clear");
  }, []);

  const pieStations = useMemo(() => {
    if (pieScope === "station" && selectedStation) return [selectedStation];
    return stations;
  }, [pieScope, selectedStation, stations]);

  const pieFootnote =
    pieScope === "station" && selectedStation
      ? `Структура за поточним знімком станції «${selectedStation.name}».`
      : "Структура за сумою відсотків від нормативу по всій мережі станцій з даними.";

  const lineEmptySlot = (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-4 text-center text-gray-500">
      <MapPin className="h-10 w-10 text-gray-300" aria-hidden />
      <p className="max-w-sm">
        Оберіть станцію на карті або в списку ліворуч — тут з’явиться лінійний
        графік вимірювань за обраний період.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
      <section className="w-full shrink-0 space-y-4 xl:sticky xl:top-4 xl:max-w-[min(100%,440px)] xl:self-start">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
          <label className="block min-w-[140px] flex-1">
            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
              <Search className="h-3.5 w-3.5" aria-hidden />
              Пошук
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Назва, місто, id…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-2"
              autoComplete="off"
            />
          </label>
          <label className="block min-w-[160px]">
            <span className="mb-1 block text-xs font-medium text-gray-500">
              Місто
            </span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-2"
            >
              <option value="">Усі міста</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-[120px]">
            <span className="mb-1 block text-xs font-medium text-gray-500">
              Період графіка
            </span>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              disabled={!selectedId}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500/30 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value={7}>7 діб</option>
              <option value={14}>14 діб</option>
              <option value={30}>30 діб</option>
            </select>
          </label>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <h2 className="text-sm font-semibold text-gray-800">
              Станції ({visibleStations.length})
            </h2>
            {selectedId ? (
              <button
                type="button"
                onClick={handleClearSelection}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Скинути вибір
              </button>
            ) : null}
          </div>
          <ul
            className="max-h-[200px] space-y-1 overflow-y-auto overscroll-contain pr-1 sm:max-h-[240px]"
            role="listbox"
            aria-label="Список станцій"
          >
            {visibleStations.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-gray-500">
                Нічого не знайдено. Змініть фільтри.
              </li>
            ) : (
              visibleStations.map((s) => {
                const active = s.id === selectedId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => handleStationSelect(s.id, "list")}
                      className={`flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-emerald-50 ring-2 ring-emerald-500 ring-offset-1"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`font-medium ${active ? "text-emerald-900" : "text-gray-900"}`}
                      >
                        {s.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {s.city} · ІЯП {s.currentAqi?.aqi ?? "—"}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <StationsMapLazy
          stations={visibleStations}
          selectedId={selectedId}
          onSelectChange={(id) => handleStationSelect(id, "map")}
          onZoomChange={onMapZoomEnd}
        />

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          {selectedStation ? (
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Активна станція:</span>{" "}
                {selectedStation.name}
                <span className="text-emerald-800/90">
                  {" "}
                  ({selectedStation.city})
                </span>
              </p>
              <p className="text-emerald-900/90">
                ІЯП:{" "}
                <strong>{selectedStation.currentAqi?.aqi ?? "—"}</strong>
                {selectedStation.currentAqi?.level
                  ? ` · ${selectedStation.currentAqi.level}`
                  : null}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/stations/${encodeURIComponent(selectedStation.id)}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  Картка станції
                  <ChevronRight className="h-3.5 w-3.5 opacity-90" aria-hidden />
                </Link>
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-700/30 bg-white px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                >
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden />
                  Повна аналітика
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-emerald-900/90">
              Натисніть маркер на карті або рядок у списку, щоб побачити графіки
              цієї станції. Кнопка «Скинути вибір» очищує активну станцію.
            </p>
          )}
        </div>
      </section>

      <section className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Графіки поруч із картою
            </h2>
            <p className="text-sm text-gray-500">
              Стовпчики — уся мережа; лінія — обрана станція; круг — за
              фільтром нижче.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Кругова діаграма
            </span>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPieScope("network");
                  gaEvent("charts_filter", {
                    context: "map_dashboard",
                    filter_type: "pie_scope",
                    pie_scope: "network",
                  });
                }}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  pieScope === "network"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Уся мережа
              </button>
              <button
                type="button"
                disabled={!selectedStation}
                onClick={() => {
                  setPieScope("station");
                  gaEvent("charts_filter", {
                    context: "map_dashboard",
                    filter_type: "pie_scope",
                    pie_scope: "station",
                  });
                }}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  pieScope === "station"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Обрана станція
              </button>
            </div>
          </div>
        </div>

        {measureLoading ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Завантаження вимірювань…
          </div>
        ) : null}
        {measureError ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            {measureError}
          </p>
        ) : null}

        <ChartsDashboardPanel
          stations={stations}
          measurements={measurements}
          lineStationName={
            selectedStation?.name ?? "Оберіть станцію на карті"
          }
          barActiveStationId={selectedId}
          pieStations={pieStations}
          pieFootnote={pieFootnote}
          lineChartHeight={320}
          barChartHeight={320}
          pieChartHeight={340}
          lineEmptySlot={lineEmptySlot}
        />
      </section>
    </div>
  );
}
