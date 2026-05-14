import { NextRequest } from "next/server";
import { mockStations, mockMeasurements } from "@/lib/mock-data";
import { getPreparedMeasurementsForStation } from "@/lib/api/measurement-query-helpers";
import {
  validateMeasurementsQuery,
  validateMeasurementCreate,
} from "@/lib/api/validation";
import { validationErrorResponse } from "@/lib/api/validation-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  tryPaginate,
  internalServerErrorResponse,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { ErrorCode } from "@/types/api/error";
import { AirQualityIndex } from "@/types/air-quality";
import type { Measurement } from "@/types/measurement";
import type { PollutantReading as PR } from "@/types/air-quality";

const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * GET /api/measurements
 * Повертає список вимірювань з пагінацією, фільтруванням та сортуванням
 * Query параметри:
 * - page (default 1)
 * - limit (default 20, max 100)
 * - stationId (обов'язково)
 * - startDate (ISO дата, optional)
 * - endDate (ISO дата, optional)
 * - sort (default "timestamp", options: "timestamp", "aqi")
 * - order (default "desc")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      stationId: searchParams.get("stationId"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      sort: searchParams.get("sort") || "timestamp",
      order: searchParams.get("order") || "desc",
    };

    // Валідація параметрів
    const validation = validateMeasurementsQuery(queryData);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid query parameters",
        validation.error,
      );
    }

    const { page, limit, stationId, startDate, endDate, sort, order } =
      validation.data;

    // Перевіра що станція існує
    const station = mockStations.find((s) => s.id === stationId);
    if (!station) {
      const errorResponse = {
        code: ErrorCode.STATION_NOT_FOUND,
        message: `Station with id "${stationId}" not found`,
        statusCode: HTTP_STATUS.NOT_FOUND,
        timestamp: new Date().toISOString(),
        resourceId: stationId,
        resourceType: "station",
      };

      return createNextResponse(
        createErrorResponse(errorResponse),
        HTTP_STATUS.NOT_FOUND
      );
    }

    const measurements = getPreparedMeasurementsForStation(stationId, {
      startDate,
      endDate,
      sort,
      order,
    });

    const paginated = tryPaginate(measurements, page, limit);
    if (!paginated.ok) {
      return createNextResponse(
        createErrorResponse({
          code: ErrorCode.OUT_OF_RANGE,
          message: paginated.message,
          statusCode: HTTP_STATUS.BAD_REQUEST,
          timestamp: new Date().toISOString(),
        }),
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const response = createSuccessResponse(paginated.data, {
      ...paginated.pagination,
      sortBy: sort,
      sortOrder: order as "asc" | "desc",
    });

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorResponse(
      "GET /api/measurements error:",
      error,
      "Failed to fetch measurements",
    );
  }
}

/**
 * POST /api/measurements
 * Додає нове вимірювання
 * Body: {stationId, timestamp, readings, temperature, humidity, windSpeed}
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валідація даних
    const validation = validateMeasurementCreate(body);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid measurement data",
        validation.error,
      );
    }

    const { stationId, timestamp, readings, temperature, humidity, windSpeed } =
      validation.data;

    // Перевіра що станція існує
    const station = mockStations.find((s) => s.id === stationId);
    if (!station) {
      const errorResponse = {
        code: ErrorCode.STATION_NOT_FOUND,
        message: `Station with id "${stationId}" not found`,
        statusCode: HTTP_STATUS.NOT_FOUND,
        timestamp: new Date().toISOString(),
        resourceId: stationId,
        resourceType: "station",
      };

      return createNextResponse(
        createErrorResponse(errorResponse),
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Розрахунок AQI з показників
    const calculateAqi = (readings: typeof validation.data.readings): number => {
      const values = readings.map((r) => (r.value / r.limit) * 100);
      const maxValue = Math.max(...values);

      if (maxValue <= 50) return maxValue;
      if (maxValue <= 100) return 50 + (maxValue - 50) * 1;
      if (maxValue <= 150) return 100 + (maxValue - 100) * 1;
      if (maxValue <= 200) return 150 + (maxValue - 150) * 1;
      if (maxValue <= 300) return 200 + (maxValue - 200) * 1;
      return 300 + (maxValue - 300) * 1;
    };

    // Визначення рівня якості
    const determineAqiLevel = (aqi: number): AirQualityIndex => {
      if (aqi <= 50) return AirQualityIndex.Good;
      if (aqi <= 100) return AirQualityIndex.Moderate;
      if (aqi <= 150) return AirQualityIndex.UnhealthySensitive;
      if (aqi <= 200) return AirQualityIndex.Unhealthy;
      if (aqi <= 300) return AirQualityIndex.VeryUnhealthy;
      return AirQualityIndex.Hazardous;
    };

    const aqi = Math.round(calculateAqi(readings));

    // Створення нового вимірювання
    const newMeasurement: Measurement = {
      id: generateId(),
      stationId,
      timestamp,
      readings: readings as PR[],
      aqi,
      level: determineAqiLevel(aqi),
      temperature,
      humidity,
      windSpeed,
      receivedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    // Додавання до mock даних
    if (!mockMeasurements[stationId]) {
      mockMeasurements[stationId] = [];
    }
    mockMeasurements[stationId].push(newMeasurement);

    const response = {
      success: true,
      data: newMeasurement,
      statusCode: HTTP_STATUS.CREATED,
      timestamp: new Date().toISOString(),
    };

    return createNextResponse(response, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const errorResponse = {
        code: ErrorCode.INVALID_REQUEST,
        message: "Invalid JSON in request body",
        statusCode: HTTP_STATUS.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      };

      return createNextResponse(
        createErrorResponse(errorResponse),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return internalServerErrorResponse(
      "POST /api/measurements error:",
      error,
      "Failed to create measurement",
    );
  }
}

/**
 * OPTIONS /api/measurements
 * CORS preflight
 */
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
