"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { MonitoringStation } from "@/types/station";
import { Pollutant } from "@/types/air-quality";

const SLICE_COLORS: Partial<Record<Pollutant, string>> = {
  [Pollutant.PM25]: "#059669",
  [Pollutant.PM10]: "#0ea5e9",
  [Pollutant.NO2]: "#d946ef",
  [Pollutant.SO2]: "#f59e0b",
  [Pollutant.CO]: "#64748b",
  [Pollutant.O3]: "#22c55e",
};

const DEFAULT_COLOR = "#94a3b8";

export interface PollutionSharePieChartProps {
  stations: MonitoringStation[];
  height?: number;
}

type PieRow = { name: string; value: number; pollutant: Pollutant };

export function PollutionSharePieChart({
  stations,
  height = 360,
}: PollutionSharePieChartProps) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const fullData = useMemo(() => {
    const acc = new Map<Pollutant, number>();
    for (const s of stations) {
      const readings = s.currentAqi?.readings ?? [];
      for (const r of readings) {
        const w = r.percentOfLimit ?? r.value;
        acc.set(r.pollutant, (acc.get(r.pollutant) ?? 0) + w);
      }
    }
    const rows: PieRow[] = [];
    for (const [pollutant, value] of acc) {
      if (value > 0) rows.push({ name: pollutant, value, pollutant });
    }
    return rows.sort((a, b) => b.value - a.value);
  }, [stations]);

  const chartData = useMemo(
    () => fullData.filter((d) => !hidden[d.pollutant]),
    [fullData, hidden],
  );

  if (fullData.length > 0 && chartData.length === 0) {
    return (
      <div className="w-full space-y-2">
        <p className="text-sm text-amber-700">
          Усі сегменти приховано. Клікніть по легенді, щоб повернути хоча б один
          показник.
        </p>
      </div>
    );
  }

  const toggleSlice = useCallback((pollutant: string) => {
    setHidden((prev) => ({ ...prev, [pollutant]: !prev[pollutant] }));
  }, []);

  const handleLegendClick = useCallback(
    (e: { value?: string }) => {
      if (e.value) toggleSlice(e.value);
    },
    [toggleSlice],
  );

  if (fullData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        Немає даних для кругової діаграми структури забруднення
      </div>
    );
  }

  const totalVisible = chartData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div className="w-full space-y-2">
      <p className="text-xs text-gray-400">
        Частка за сумою відсотків від нормативу по мережі станцій. Клік по
        легенді — виключити/повернути сегмент.
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={96}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.pollutant}
                fill={SLICE_COLORS[entry.pollutant] ?? DEFAULT_COLOR}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
            formatter={(value: number, name: string) => {
              const pct = ((value / totalVisible) * 100).toFixed(1);
              return [`${value.toFixed(1)} ум. од. (${pct}% видимих)`, name];
            }}
          />
          <Legend
            onClick={handleLegendClick}
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
