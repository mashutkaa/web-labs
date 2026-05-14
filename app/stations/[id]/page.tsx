import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import {
  fetchStationById,
  fetchStationMeasurementsLastDays,
} from "@/lib/server-api";
import { Pollutant } from "@/types/air-quality";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AqiBadge } from "@/components/AqiBadge";
import { StationDetailClient } from "@/components/StationDetailClient";

export const dynamic = "force-dynamic";

interface StationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: StationDetailPageProps) {
  const params = await props.params;
  const station = await fetchStationById(params.id);

  if (!station) {
    return {
      title: "Станція не знайдена | Веб-Лабс",
    };
  }

  return {
    title: `${station.name} | Веб-Лабс`,
    description: `Детальна інформація про станцію ${station.name} в ${station.city}`,
  };
}

export default async function StationDetails(
  props: StationDetailPageProps,
) {
  const params = await props.params;
  const station = await fetchStationById(params.id);

  if (!station) {
    notFound();
  }

  const measurements = await fetchStationMeasurementsLastDays(params.id, 7);
  const currentMeasurement =
    measurements.length > 0 ? measurements[measurements.length - 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{station.name}</h1>
            {station.isActive ? (
              <Badge variant="default">Онлайн</Badge>
            ) : (
              <Badge variant="danger">Офлайн</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-gray-500 mt-2 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {station.city} ({station.type})
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Встановлено:{" "}
              {new Date(station.installedDate).toLocaleDateString("uk-UA")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Поточна якість повітря</CardTitle>
            </CardHeader>
            <CardContent>
              {currentMeasurement ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-6xl font-black text-gray-900 mb-2">
                    {currentMeasurement.aqi}
                  </div>
                  <AqiBadge
                    level={currentMeasurement.level}
                    className="text-base px-4 py-2 mb-6"
                  />

                  <div className="w-full grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                    <div className="text-center">
                      <Thermometer className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900">
                        {currentMeasurement.temperature}°C
                      </p>
                      <p className="text-xs text-gray-500">Темп.</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-100">
                      <Droplets className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900">
                        {currentMeasurement.humidity}%
                      </p>
                      <p className="text-xs text-gray-500">Вологість</p>
                    </div>
                    <div className="text-center">
                      <Wind className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm font-medium text-gray-900">
                        {currentMeasurement.windSpeed} м/с
                      </p>
                      <p className="text-xs text-gray-500">Вітер</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Поточні дані відсутні
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Показники забруднювачів</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {currentMeasurement?.readings.map((reading) => {
                  const percentOfLimit = Math.min(
                    100,
                    (reading.value / reading.limit) * 100,
                  );
                  const isWarning = percentOfLimit > 80;
                  const isDanger = percentOfLimit > 100;
                  let barColor = "bg-emerald-500";
                  if (isDanger) barColor = "bg-red-500";
                  else if (isWarning) barColor = "bg-orange-500";
                  return (
                    <div
                      key={reading.pollutant}
                      className="p-4 cursor-default hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">
                          {reading.pollutant}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {reading.value.toFixed(1)}{" "}
                          <span className="text-gray-500 font-normal">
                            {reading.unit}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${barColor} h-2 rounded-full transition-all duration-500`}
                          style={{
                            width: `${percentOfLimit}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0</span>
                        <span className="text-xs text-gray-500">
                          Ліміт: {reading.limit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <StationDetailClient
            measurements={measurements}
            pollutants={Array.from(
              new Set(
                measurements.flatMap((m) => m.readings.map((r) => r.pollutant)),
              ),
            ) as Pollutant[]}
          />
        </div>
      </div>
    </div>
  );
}
