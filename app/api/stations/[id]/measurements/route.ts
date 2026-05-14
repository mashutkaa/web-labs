import { NextRequest } from "next/server";
import { mockStations } from "@/lib/mock-data";
import { validateMeasurementsQuery } from "@/lib/api/validation";
import { validationErrorResponse } from "@/lib/api/validation-response";
import { getPreparedMeasurementsForStation } from "@/lib/api/measurement-query-helpers";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  tryPaginate,
  internalServerErrorResponse,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { ErrorCode } from "@/types/api/error";

/**
 * GET /api/stations/[id]/measurements
 * Вимірювання станції за період (те саме, що GET /api/measurements?stationId=…).
 * Query: page, limit, startDate, endDate, sort, order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: stationId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      stationId,
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      sort: searchParams.get("sort") || "timestamp",
      order: searchParams.get("order") || "desc",
    };

    const validation = validateMeasurementsQuery(queryData);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid query parameters",
        validation.error,
      );
    }

    const { page, limit, startDate, endDate, sort, order } = validation.data;

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
        HTTP_STATUS.NOT_FOUND,
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
      "GET /api/stations/[id]/measurements error:",
      error,
      "Failed to fetch measurements",
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Request-ID, X-API-Version",
      "Access-Control-Max-Age": "86400",
    },
  });
}
