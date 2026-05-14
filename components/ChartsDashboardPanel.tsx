"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MultiPollutantLineChart } from "@/components/charts/MultiPollutantLineChart";
import { StationsAqiBarChart } from "@/components/charts/StationsAqiBarChart";
import { PollutionSharePieChart } from "@/components/charts/PollutionSharePieChart";
import type { MonitoringStation } from "@/types/station";
import type { Measurement } from "@/types/measurement";
import { Pollutant } from "@/types/air-quality";

const LINE_POLLUTANTS: Pollutant[] = [
  Pollutant.PM25,
  Pollutant.PM10,
  Pollutant.NO2,
  Pollutant.O3,
];

export interface ChartsDashboardPanelProps {
  stations: MonitoringStation[];
  /** Дані для лінійного графіка (обрана станція) */
  measurements: Measurement[];
  lineStationName: string;
  /** Підсвітити стовпчик обраної станції на діаграмі порівняння */
  barActiveStationId?: string | null;
  /** Станції для кругової діаграми (мережа або одна обрана) */
  pieStations: MonitoringStation[];
  pieFootnote?: string;
  lineChartHeight?: number;
  barChartHeight?: number;
  pieChartHeight?: number;
  lineEmptySlot?: ReactNode;
}

export function ChartsDashboardPanel({
  stations,
  measurements,
  lineStationName,
  barActiveStationId,
  pieStations,
  pieFootnote,
  lineChartHeight = 380,
  barChartHeight = 380,
  pieChartHeight = 400,
  lineEmptySlot,
}: ChartsDashboardPanelProps) {
  const showLine = measurements.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Лінійний графік: зміна показників у часі</CardTitle>
          <p className="text-sm text-gray-500">
            Станція: {lineStationName}. Показано до чотирьох забруднювачів на
            одній шкалі часу.
          </p>
        </CardHeader>
        <CardContent>
          {showLine ? (
            <MultiPollutantLineChart
              measurements={measurements}
              pollutants={LINE_POLLUTANTS}
              height={lineChartHeight}
            />
          ) : (
            lineEmptySlot ?? (
              <div
                className="flex flex-col items-center justify-center gap-2 text-center text-gray-500"
                style={{ minHeight: lineChartHeight }}
              >
                <p>Оберіть станцію на карті або в списку, щоб побачити графік.</p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Стовпчикова діаграма: порівняння станцій</CardTitle>
          <p className="text-sm text-gray-500">
            Поточний ІЯП та медіана мережі. Обрана станція підсвічена темнішим
            кольором.
          </p>
        </CardHeader>
        <CardContent>
          <StationsAqiBarChart
            stations={stations}
            height={barChartHeight}
            activeStationId={barActiveStationId ?? undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Кругова діаграма: структура забруднення</CardTitle>
          <p className="text-sm text-gray-500">
            {pieFootnote ??
              "Сума відсотків від нормативу по кожному забруднювачу в зрізі обраних станцій."}
          </p>
        </CardHeader>
        <CardContent>
          <PollutionSharePieChart
            stations={pieStations}
            height={pieChartHeight}
          />
        </CardContent>
      </Card>
    </div>
  );
}
