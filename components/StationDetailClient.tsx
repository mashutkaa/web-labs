"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import { Pollutant } from "@/types/air-quality";
import { Measurement } from "@/types/measurement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MeasurementChart } from "@/components/MeasurementChart";

interface StationDetailClientProps {
  measurements: Measurement[];
  pollutants: Pollutant[];
}

export function StationDetailClient({
  measurements,
  pollutants,
}: StationDetailClientProps) {
  const [activePollutant, setActivePollutant] = useState<Pollutant>(
    pollutants[0] || ("PM2.5" as Pollutant),
  );

  if (pollutants.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Немає даних про забруднювачі
      </div>
    );
  }

  const chartData = measurements
    .filter((m) => m.readings.some((r) => r.pollutant === activePollutant))
    .map((m) => ({
      timestamp: m.timestamp,
      value:
        m.readings.find((r) => r.pollutant === activePollutant)?.value || 0,
    }));

  const unit =
    measurements
      .flatMap((m) => m.readings)
      .find((r) => r.pollutant === activePollutant)?.unit || "";

  return (
    <div className="space-y-4">
      {/* Pollutant Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pollutants.map((pollutant) => (
          <button
            key={pollutant}
            onClick={() => setActivePollutant(pollutant)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activePollutant === pollutant
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            {pollutant}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Тренд за 7 днів: {activePollutant}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Історичні вимірювання за останні 7 днів
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            <Activity className="h-4 w-4 mr-2 inline" /> Наживо
          </Badge>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <MeasurementChart
              pollutant={activePollutant}
              data={chartData}
              unit={unit}
              height={400}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              Немає даних для графіка
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
