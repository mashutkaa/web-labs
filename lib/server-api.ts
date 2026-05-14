import { headers } from "next/headers";
import type { MonitoringStation } from "@/types/station";
import type { Measurement } from "@/types/measurement";

const fetchOptions: RequestInit = { cache: "no-store" };

/**
 * Базовий URL для звернень до власного API з серверних компонентів (SSR).
 * У продакшені задайте NEXT_PUBLIC_APP_URL (наприклад https://your-domain.com).
 */
export async function getServerOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const origin = await getServerOrigin();
    const url = `${origin}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, fetchOptions);
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok || !json || typeof json !== "object") {
      return null;
    }
    const body = json as { success?: boolean; data?: T };
    if (!body.success || body.data === undefined) {
      return null;
    }
    return body.data;
  } catch {
    return null;
  }
}

/** Усі станції (відповідає GET /api/stations?all=true) */
export async function fetchStationsAll(): Promise<MonitoringStation[]> {
  const data = await apiGet<MonitoringStation[]>("/api/stations?all=true");
  return data ?? [];
}

/** Дані станції (GET /api/stations/[id]) */
export async function fetchStationById(
  id: string,
): Promise<MonitoringStation | null> {
  const encoded = encodeURIComponent(id);
  return apiGet<MonitoringStation>(`/api/stations/${encoded}`);
}

/** Вимірювання за останні `days` діб через GET /api/stations/[id]/measurements */
export async function fetchStationMeasurementsLastDays(
  stationId: string,
  days: number,
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
  const encoded = encodeURIComponent(stationId);
  const data = await apiGet<Measurement[]>(
    `/api/stations/${encoded}/measurements?${params.toString()}`,
  );
  return data ?? [];
}
