"use client";

import { useEffect } from "react";
import { gaEvent } from "@/lib/gtag";

export interface StationAnalyticsProps {
  stationId: string;
  stationName: string;
}

/** Подія перегляду картки моніторингової станції (GA4). */
export function StationAnalytics({
  stationId,
  stationName,
}: StationAnalyticsProps) {
  useEffect(() => {
    gaEvent("station_detail_view", {
      station_id: stationId,
      station_name: stationName,
    });
  }, [stationId, stationName]);

  return null;
}
