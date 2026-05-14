import type { Metadata } from "next";
import { AnalyticsChartsClient } from "@/components/AnalyticsChartsClient";
import {
  fetchStationsAll,
  fetchStationMeasurementsLastDays,
} from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Графіки — ЕкоМонітор",
  description:
    "Візуалізація якості повітря: лінійні графіки, стовпчики, кругові діаграми",
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const stations = await fetchStationsAll();
  const primary = stations[0];
  const measurements = primary
    ? await fetchStationMeasurementsLastDays(primary.id, 7)
    : [];

  return (
    <AnalyticsChartsClient
      stations={stations}
      measurements={measurements}
      lineStationName={primary?.name ?? "—"}
    />
  );
}
