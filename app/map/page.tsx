import { MapPin } from "lucide-react";
import { fetchStationsAll } from "@/lib/server-api";
import { MapPageClient } from "@/components/MapPageClient";

export const metadata = {
  title: "Карта станцій | ЕкоМонітор",
  description: "Інтерактивна карта моніторингових станцій якості повітря в Україні",
};

export default async function MapPage() {
  const stations = await fetchStationsAll();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <MapPin className="h-9 w-9 text-emerald-600 shrink-0 mt-1" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Карта моніторингових станцій
          </h1>
          <p className="text-gray-500 mt-1 max-w-3xl">
            Карта та графіки на одній сторінці: оберіть станцію маркером або з
            списку — з’являться часові ряди; стовпчики порівнюють усі станції,
            активна підсвічена. Є пошук, фільтр за містом, вибір періоду,
            перемикач кругової діаграми (мережа / одна станція) та кнопка
            скидання вибору.
          </p>
        </div>
      </div>

      <MapPageClient stations={stations} />
    </div>
  );
}
