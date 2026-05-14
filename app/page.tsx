import { fetchStationsAll } from "@/lib/server-api";
import { MonitoringStation } from "@/types/station";
import { AirQualityIndex } from "@/types/air-quality";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StationCard } from "@/components/StationCard";
import { StatsWidget } from "@/components/StatsWidget";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Панель моніторингу | ЕкоМонітор",
  description: "Огляд мережі екологічного моніторингу",
};

async function getStations(): Promise<MonitoringStation[]> {
  return fetchStationsAll();
}

export default async function Home() {
  const stations = await getStations();

  const activeStations = stations.filter((s) => s.isActive).length;
  const avgAqi =
    stations.length > 0
      ? Math.round(
          stations.reduce((acc, s) => acc + (s.currentAqi?.aqi || 0), 0) /
            stations.length,
        )
      : 0;
  const hazardousStations = stations.filter(
    (s) =>
      s.currentAqi?.level === AirQualityIndex.Hazardous ||
      s.currentAqi?.level === AirQualityIndex.VeryUnhealthy,
  ).length;

  const stationList = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Станції моніторингу</CardTitle>
      </CardHeader>
      <div className="divide-y divide-gray-100">
        {stations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Панель моніторингу</h1>
        <p className="text-gray-500 mt-1">
          Огляд мережі екологічного моніторингу
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsWidget
          title="Середній ІЯП мережі"
          value={avgAqi.toString()}
          iconType="activity"
          color="blue"
        />
        <StatsWidget
          title="Активні станції"
          value={`${activeStations}/${stations.length}`}
          iconType="check"
          color="emerald"
        />
        <StatsWidget
          title="Критичні сповіщення"
          value={hazardousStations.toString()}
          iconType="alert"
          color="orange"
        />
      </div>

      {/* Stations List */}
      {stationList}
    </div>
  );
}
