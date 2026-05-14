import type { Measurement } from "@/types/measurement";
import { mockMeasurements } from "@/lib/mock-data";

export function filterMeasurementsByDateRange(
  measurements: Measurement[],
  startDate?: string | null,
  endDate?: string | null,
): Measurement[] {
  if (!startDate && !endDate) {
    return measurements;
  }
  const startTime = startDate ? new Date(startDate).getTime() : 0;
  const endTime = endDate ? new Date(endDate).getTime() : Date.now();
  return measurements.filter((m) => {
    const mTime = new Date(m.timestamp).getTime();
    return mTime >= startTime && mTime <= endTime;
  });
}

export function sortMeasurements(
  measurements: Measurement[],
  sort: "timestamp" | "aqi",
  order: "asc" | "desc",
): Measurement[] {
  const copy = [...measurements];
  if (sort === "aqi") {
    copy.sort((a, b) => {
      const diff = a.aqi - b.aqi;
      return order === "asc" ? diff : -diff;
    });
  } else {
    copy.sort((a, b) => {
      const diff =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return order === "asc" ? diff : -diff;
    });
  }
  return copy;
}

/**
 * Вимірювання станції після фільтра за датами та сортування.
 */
export function getPreparedMeasurementsForStation(
  stationId: string,
  options: {
    startDate?: string | null;
    endDate?: string | null;
    sort: "timestamp" | "aqi";
    order: "asc" | "desc";
  },
): Measurement[] {
  const raw = mockMeasurements[stationId] || [];
  const filtered = filterMeasurementsByDateRange(
    raw,
    options.startDate,
    options.endDate,
  );
  return sortMeasurements(filtered, options.sort, options.order);
}
