import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TimeSeries } from "@/types/measurement";
import { Pollutant } from "@/types/air-quality";
interface PollutantChartProps {
  data: TimeSeries;
  height?: number;
}
export function PollutantChart({ data, height = 300 }: PollutantChartProps) {
  // Format data for Recharts
  const chartData = data.data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fullDate: new Date(point.timestamp).toLocaleString(),
    value: point.value,
  }));
  // Determine safe limit based on pollutant
  const getLimit = (pollutant: Pollutant) => {
    switch (pollutant) {
      case Pollutant.PM25:
        return 35;
      case Pollutant.PM10:
        return 50;
      case Pollutant.NO2:
        return 40;
      case Pollutant.SO2:
        return 20;
      case Pollutant.CO:
        return 4;
      case Pollutant.O3:
        return 100;
      default:
        return 50;
    }
  };
  const limit = getLimit(data.pollutant);
  return (
    <div
      style={{
        height: height,
        width: "100%",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="time"
            tick={{
              fontSize: 12,
              fill: "#888",
            }}
            tickMargin={10}
            minTickGap={30}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontSize: 12,
              fill: "#888",
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{
              fontWeight: "bold",
              color: "#333",
              marginBottom: "4px",
            }}
            formatter={(value: number) => [
              `${value.toFixed(1)} ${data.unit}`,
              data.pollutant,
            ]}
            labelFormatter={(label, payload) =>
              payload[0]?.payload.fullDate || label
            }
          />
          <ReferenceLine
            y={limit}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              position: "insideTopLeft",
              value: "Безпечна межа",
              fill: "#ef4444",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: "#059669",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
