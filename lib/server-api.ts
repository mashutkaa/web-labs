import { headers } from "next/headers";
import { getPreparedMeasurementsForStation } from "@/lib/api/measurement-query-helpers";
import { mockStations } from "@/lib/mock-data";
import { logger } from "@/lib/logger";
import type { MonitoringStation } from "@/types/station";
import type { Measurement } from "@/types/measurement";

const fetchOptions: RequestInit = { cache: "no-store" };

function isLocalhostUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

/**
 * Базовий URL для звернень до власного API з серверних компонентів (SSR).
 *
 * На Vercel: задайте NEXT_PUBLIC_APP_URL=https://ваш-домен.vercel.app
 * (не localhost). Якщо змінна порожня або localhost — використовується VERCEL_URL
 * або заголовки поточного запиту.
 */
export async function getServerOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const onVercel = Boolean(process.env.VERCEL);

  if (fromEnv && !(onVercel && isLocalhostUrl(fromEnv))) {
    return fromEnv;
  }

  if (onVercel && fromEnv && isLocalhostUrl(fromEnv)) {
    logger.warn(
      {
        configured: fromEnv,
        hint: "Set NEXT_PUBLIC_APP_URL to your Vercel https URL, not localhost",
      },
      "ignored_localhost_app_url_on_vercel",
    );
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelHost) {
    const host = vercelHost.startsWith("http")
      ? vercelHost
      : `https://${vercelHost}`;
    return host.replace(/\/$/, "");
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
      logger.warn(
        { path, status: res.status, origin },
        "server_api_fetch_not_ok",
      );
      return null;
    }
    const body = json as { success?: boolean; data?: T };
    if (!body.success || body.data === undefined) {
      return null;
    }
    return body.data;
  } catch (err) {
    logger.warn(
      {
        path,
        err: err instanceof Error ? err.message : String(err),
      },
      "server_api_fetch_failed",
    );
    return null;
  }
}

/** Усі станції (відповідає GET /api/stations?all=true) */
export async function fetchStationsAll(): Promise<MonitoringStation[]> {
  const data = await apiGet<MonitoringStation[]>("/api/stations?all=true");
  if (data && data.length > 0) {
    return data;
  }
  logger.warn(
    { fallback: "mockStations", count: mockStations.length },
    "fetchStationsAll_using_mock_fallback",
  );
  return mockStations;
}

/** Дані станції (GET /api/stations/[id]) */
export async function fetchStationById(
  id: string,
): Promise<MonitoringStation | null> {
  const encoded = encodeURIComponent(id);
  const data = await apiGet<MonitoringStation>(`/api/stations/${encoded}`);
  if (data) return data;
  return mockStations.find((s) => s.id === id) ?? null;
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
  if (data && data.length > 0) {
    return data;
  }
  return getPreparedMeasurementsForStation(stationId, {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    sort: "timestamp",
    order: "asc",
  }).slice(0, 250);
}
