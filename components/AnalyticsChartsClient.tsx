"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { ChartsDashboardPanel } from "@/components/ChartsDashboardPanel";
import { gaEvent } from "@/lib/gtag";
import type { MonitoringStation } from "@/types/station";
import type { Measurement } from "@/types/measurement";

export interface AnalyticsChartsClientProps {
  stations: MonitoringStation[];
  measurements: Measurement[];
  lineStationName: string;
}

export function AnalyticsChartsClient({
  stations,
  measurements,
  lineStationName,
}: AnalyticsChartsClientProps) {
  useEffect(() => {
    gaEvent("analytics_charts_page", {
      section: "standalone",
      has_line_data: measurements.length > 0,
    });
  }, [measurements.length]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Графіки та аналітика
        </h1>
        <p className="max-w-3xl text-gray-600">
          Лінійний графік показує динаміку кількох показників у часі; стовпчики
          порівнюють ІЯП станцій із медіаною мережі; кругова діаграма відображає
          структуру внеску забруднювачів за поточними знімками по мережі. Усі
          графіки мають підказки при наведенні, легенду та можливість
          приховувати окремі серії кліком по легенді.
        </p>
        <p>
          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            Карта з інтегрованими графіками
          </Link>
        </p>
      </header>

      <ChartsDashboardPanel
        stations={stations}
        measurements={measurements}
        lineStationName={lineStationName}
        barActiveStationId={null}
        pieStations={stations}
        pieFootnote="Сума відсотків від нормативу по кожному забруднювачу в агрегованому зрізі мережі (чим більше значення, тим більший внесок у «вагу» сумарного ризику)."
      />
    </div>
  );
}
