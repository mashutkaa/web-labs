"use client";

import { useCallback, useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { Measurement } from "@/types/measurement";
import { gaEvent } from "@/lib/gtag";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface StationExportButtonProps {
  stationId: string;
  stationName: string;
  measurements: Measurement[];
}

/** Експорт вимірювань у CSV + подія аналітики `data_export`. */
export function StationExportButton({
  stationId,
  stationName,
  measurements,
}: StationExportButtonProps) {
  const [busy, setBusy] = useState(false);

  const disabled = measurements.length === 0;

  const csvContent = useMemo(() => {
    const pollutants = [
      ...new Set(
        measurements.flatMap((m) => m.readings.map((r) => r.pollutant)),
      ),
    ];
    const header = [
      "timestamp",
      "aqi",
      "level",
      ...pollutants.map((p) => String(p)),
    ];
    const lines = [header.map((h) => escapeCsvCell(h)).join(",")];
    for (const m of measurements) {
      const row: string[] = [
        m.timestamp,
        String(m.aqi),
        String(m.level),
        ...pollutants.map((p) => {
          const r = m.readings.find((x) => x.pollutant === p);
          return r != null ? String(r.value) : "";
        }),
      ];
      lines.push(row.map((c) => escapeCsvCell(c)).join(","));
    }
    return lines.join("\n");
  }, [measurements]);

  const download = useCallback(() => {
    if (disabled) return;
    setBusy(true);
    try {
      const blob = new Blob(["\ufeff", csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eko-${stationId}-measurements.csv`;
      a.click();
      URL.revokeObjectURL(url);
      gaEvent("data_export", {
        format: "csv",
        station_id: stationId,
        station_name: stationName,
        row_count: measurements.length,
      });
    } finally {
      setBusy(false);
    }
  }, [
    csvContent,
    disabled,
    measurements.length,
    stationId,
    stationName,
  ]);

  return (
    <button
      type="button"
      onClick={download}
      disabled={disabled || busy}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download className="h-4 w-4 shrink-0" aria-hidden />
      Експорт CSV
    </button>
  );
}
