"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Pollutant } from "@/types/air-quality";

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

interface MeasurementChartProps {
  pollutant: Pollutant;
  data: TimeSeriesPoint[];
  unit: string;
  height?: number;
}

export function MeasurementChart({
  pollutant,
  data,
  unit,
  height = 300,
}: MeasurementChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Немає даних для відображення
      </div>
    );
  }

  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: point.value,
    timestamp: new Date(point.timestamp).getTime(),
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient
              id={`grad-${pollutant}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            label={{ value: unit, angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [
              `${value.toFixed(2)} ${unit}`,
              "Значення",
            ]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            fill={`url(#grad-${pollutant})`}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
