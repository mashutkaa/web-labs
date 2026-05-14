"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Measurement } from "@/types/measurement";
import { Pollutant } from "@/types/air-quality";

const SERIES_COLORS: Partial<Record<Pollutant, string>> = {
  [Pollutant.PM25]: "#059669",
  [Pollutant.PM10]: "#0ea5e9",
  [Pollutant.NO2]: "#d946ef",
  [Pollutant.SO2]: "#f59e0b",
  [Pollutant.CO]: "#64748b",
  [Pollutant.O3]: "#22c55e",
};

export interface MultiPollutantLineChartProps {
  measurements: Measurement[];
  pollutants: Pollutant[];
  height?: number;
  titleHint?: string;
}

export function MultiPollutantLineChart({
  measurements,
  pollutants,
  height = 360,
  titleHint,
}: MultiPollutantLineChartProps) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const { chartData, seriesKeys } = useMemo(() => {
    const sorted = [...measurements].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const keys = new Set<Pollutant>();
    const rows = sorted.map((m) => {
      const row: Record<string, string | number> = {
        time: new Date(m.timestamp).toLocaleString("uk-UA", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        fullDate: new Date(m.timestamp).toLocaleString("uk-UA"),
      };
      for (const r of m.readings) {
        if (pollutants.includes(r.pollutant)) {
          row[r.pollutant] = r.value;
          keys.add(r.pollutant);
        }
      }
      return row;
    });
    return { chartData: rows, seriesKeys: Array.from(keys) };
  }, [measurements, pollutants]);

  const toggleSeries = useCallback((dataKey: unknown) => {
    if (typeof dataKey !== "string") return;
    setHidden((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  }, []);

  if (chartData.length === 0 || seriesKeys.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        Немає даних для лінійного графіка
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {titleHint ? (
        <p className="text-sm text-gray-500">{titleHint}</p>
      ) : null}
      <p className="text-xs text-gray-400">
        Клік по пункту легенди — приховати або показати криву.
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            interval="preserveStartEnd"
            minTickGap={32}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            label={{
              value: "μg/m³ (CO — mg/m³)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#9ca3af" },
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
            }}
            labelFormatter={(_, payload) =>
              (payload[0]?.payload?.fullDate as string) ?? ""
            }
            formatter={(value: number, name: string) => [
              typeof value === "number" ? value.toFixed(2) : value,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 8 }}
            onClick={(e) => toggleSeries(e.dataKey)}
            formatter={(value) => (
              <span
                style={{
                  opacity: hidden[value] ? 0.45 : 1,
                  textDecoration: hidden[value] ? "line-through" : "none",
                }}
              >
                {value}
              </span>
            )}
          />
          {seriesKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={SERIES_COLORS[key] ?? "#64748b"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              hide={Boolean(hidden[key])}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
