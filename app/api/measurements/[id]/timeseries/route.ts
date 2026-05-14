import { NextRequest } from "next/server";
import { mockMeasurements, mockStations } from "@/lib/mock-data";
import { validateTimeSeriesQuery } from "@/lib/api/validation";
import { validationErrorResponse } from "@/lib/api/validation-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  internalServerErrorResponse,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { ErrorCode } from "@/types/api/error";

/**
 * GET /api/measurements/[id]/timeseries
 * Часовий ряд для станції з валідацією query, фільтрацією та узгодженою відповіддю.
 * Query: stationId (за замовчуванням — id з шляху), days (1–30), pollutant (опційно)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    const queryData = {
      stationId: searchParams.get("stationId") || id,
      days: searchParams.get("days") || "7",
      pollutant: searchParams.get("pollutant"),
    };

    const validation = validateTimeSeriesQuery(queryData);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid query parameters",
        validation.error,
      );
    }

    const { stationId, days, pollutant } = validation.data;

    const station = mockStations.find((s) => s.id === stationId);
    if (!station) {
      return createNextResponse(
        createErrorResponse({
          code: ErrorCode.STATION_NOT_FOUND,
          message: `Station with id "${stationId}" not found`,
          statusCode: HTTP_STATUS.NOT_FOUND,
          timestamp: new Date().toISOString(),
          resourceId: stationId,
          resourceType: "station",
        }),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const measurements = mockMeasurements[stationId] || [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredMeasurements = measurements.filter((m) => {
      const mDate = new Date(m.timestamp);
      return mDate >= cutoffDate;
    });

    const timeSeriesPoints = filteredMeasurements
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .map((m) => ({
        timestamp: m.timestamp,
        aqi: m.aqi,
        readings: pollutant
          ? m.readings.filter((r) => r.pollutant === pollutant)
          : m.readings,
      }));

    const aqiValues = timeSeriesPoints.map((p) => p.aqi).sort((a, b) => a - b);
    const validCount = aqiValues.length;

    const statistics =
      validCount === 0
        ? {
            min: 0,
            max: 0,
            mean: 0,
            median: 0,
            stdDev: 0,
            dataAvailability: 0,
          }
        : (() => {
            const mean =
              aqiValues.reduce((acc, n) => acc + n, 0) / validCount;
            const variance =
              aqiValues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) /
              validCount;
            const stdDev = Math.sqrt(variance);
            return {
              min: Math.min(...aqiValues),
              max: Math.max(...aqiValues),
              mean: Math.round(mean),
              median: aqiValues[Math.floor(validCount / 2)] ?? 0,
              stdDev: Math.round(stdDev),
              dataAvailability: 100,
            };
          })();

    const payload = {
      stationId,
      stationName: station.name,
      startDate: cutoffDate.toISOString(),
      endDate: new Date().toISOString(),
      granularity: "hour" as const,
      pollutant: pollutant || "all",
      points: timeSeriesPoints,
      statistics,
    };

    const response = createSuccessResponse(payload);
    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorResponse(
      "GET /api/measurements/[id]/timeseries error:",
      error,
      "Failed to fetch time series data",
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Request-ID, X-API-Version",
      "Access-Control-Max-Age": "86400",
    },
  });
}
