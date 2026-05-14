"use client";

import { Card, CardContent } from "@/components/ui/Card";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

interface StatsWidgetProps {
  title: string;
  value: string;
  iconType: "activity" | "check" | "alert";
  color: "blue" | "emerald" | "orange";
}

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  check: CheckCircle,
  alert: AlertTriangle,
};

const colorConfig = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
};

export function StatsWidget({
  title,
  value,
  iconType,
  color,
}: StatsWidgetProps) {
  const Icon = iconMap[iconType];
  const colors = colorConfig[color];

  return (
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 ${colors.bg} ${colors.text} rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
