import { AirQualityIndex } from "@/types/air-quality";

interface AqiBadgeProps {
  level: AirQualityIndex;
  aqi?: number;
  className?: string;
}
export function AqiBadge({ level, aqi, className = "" }: AqiBadgeProps) {
  const getAqiColor = (level: AirQualityIndex) => {
    switch (level) {
      case AirQualityIndex.Good:
        return "bg-green-100 text-green-800 border-green-200";
      case AirQualityIndex.Moderate:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case AirQualityIndex.UnhealthySensitive:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case AirQualityIndex.Unhealthy:
        return "bg-red-100 text-red-800 border-red-200";
      case AirQualityIndex.VeryUnhealthy:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case AirQualityIndex.Hazardous:
        return "bg-rose-900 text-rose-100 border-rose-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getAqiColor(level)} ${className}`}
    >
      {aqi !== undefined && <span className="mr-1.5 font-bold">{aqi} ІЯП</span>}
      {level}
    </span>
  );
}
