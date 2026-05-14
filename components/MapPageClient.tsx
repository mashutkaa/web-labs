"use client";

import type { MonitoringStation } from "@/types/station";
import { MapChartsLayout } from "@/components/MapChartsLayout";

export function MapPageClient({ stations }: { stations: MonitoringStation[] }) {
  return <MapChartsLayout stations={stations} />;
}
