"use client";

import type { MonitoringStation } from "@/types/station";
import { MapChartsLayout } from "@/components/MapChartsLayout";
import { ReactErrorBoundary } from "@/components/ReactErrorBoundary";

export function MapPageClient({ stations }: { stations: MonitoringStation[] }) {
  return (
    <ReactErrorBoundary
      title="Помилка на сторінці карти"
      description="Не вдалося відобразити карту або графіки. Натисніть «Спробувати знову» або оновіть сторінку."
    >
      <MapChartsLayout stations={stations} />
    </ReactErrorBoundary>
  );
}
