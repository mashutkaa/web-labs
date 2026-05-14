"use client";

import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { MonitoringStation } from "@/types/station";
import { AqiBadge } from "@/components/AqiBadge";
import { Badge } from "@/components/ui/Badge";

interface StationCardProps {
  station: MonitoringStation;
}

export function StationCard({ station }: StationCardProps) {
  return (
    <Link
      href={`/stations/${station.id}`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-2 rounded-full mt-1 ${
              station.isActive
                ? "bg-emerald-100 text-emerald-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {station.name}
              {!station.isActive && <Badge variant="outline">Офлайн</Badge>}
            </h4>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span>{station.city}</span>
              <span>•</span>
              <span>{station.type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(station.lastUpdate).toLocaleTimeString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        {station.currentAqi && (
          <div className="flex items-center gap-4 md:text-right">
            <div className="hidden md:block">
              <p className="text-sm text-gray-500">Домінуючий забруднювач</p>
              <p className="font-medium text-gray-900">
                {station.currentAqi.dominantPollutant}
              </p>
            </div>
            <AqiBadge
              level={station.currentAqi.level}
              aqi={station.currentAqi.aqi}
              className="text-sm px-3 py-1.5"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
