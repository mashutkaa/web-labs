"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonitoringStation } from "@/types/station";

export interface StationsAqiBarChartProps {
  stations: MonitoringStation[];
  height?: number;
  /** Підсвітити стовпчик ІЯП для цієї станції */
  activeStationId?: string | null;
}

function shortName(name: string, max = 14) {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export function StationsAqiBarChart({
  stations,
  height = 360,
  activeStationId,
}: StationsAqiBarChartProps) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const chartData = useMemo(() => {
    const withAqi = stations.filter((s) => s.currentAqi != null);
    const values = withAqi.map((s) => s.currentAqi!.aqi);
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length === 0
        ? 0
        : sorted.length % 2 === 1
          ? sorted[(sorted.length - 1) / 2]!
          : (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2;

    return withAqi.map((s) => ({
      stationId: s.id,
      name: shortName(s.name),
      fullName: s.name,
      aqi: s.currentAqi!.aqi,
      networkMedian: Math.round(median * 10) / 10,
    }));
  }, [stations]);

  const toggleSeries = useCallback((dataKey: unknown) => {
    if (typeof dataKey !== "string") return;
    setHidden((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  }, []);

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        Немає даних ІЯП для стовпчикової діаграми
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <p className="text-xs text-gray-400">
        Порівняння поточного ІЯП станцій із медіаною мережі. Клік по легенді —
        приховати/показати серію.
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            angle={-35}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            label={{
              value: "ІЯП",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: "#9ca3af" },
            }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
            formatter={(value: number, name: string) => {
              const label =
                name === "aqi"
                  ? "Поточний ІЯП"
                  : name === "networkMedian"
                    ? "Медіана мережі"
                    : name;
              return [value, label];
            }}
            labelFormatter={(_, payload) =>
              (payload[0]?.payload?.fullName as string) ?? ""
            }
          />
          <Legend
            onClick={(e) => toggleSeries(e.dataKey)}
            formatter={(value) => {
              const label =
                value === "aqi"
                  ? "Поточний ІЯП"
                  : value === "networkMedian"
                    ? "Медіана мережі"
                    : value;
              return (
                <span
                  style={{
                    opacity: hidden[value] ? 0.45 : 1,
                    textDecoration: hidden[value] ? "line-through" : "none",
                  }}
                >
                  {label}
                </span>
              );
            }}
          />
          <Bar
            dataKey="aqi"
            name="aqi"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            hide={Boolean(hidden.aqi)}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.stationId}
                fill={
                  activeStationId && entry.stationId === activeStationId
                    ? "#047857"
                    : "#10b981"
                }
              />
            ))}
          </Bar>
          <Bar
            dataKey="networkMedian"
            name="networkMedian"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            hide={Boolean(hidden.networkMedian)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
