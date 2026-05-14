import { NextRequest } from "next/server";
import { mockStations } from "@/lib/mock-data";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  internalServerErrorResponse,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { ErrorCode } from "@/types/api/error";

/**
 * GET /api/stations/[id]/current
 * Поточні показники якості повітря для станції (AQI, забруднювачі, оновлення).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const station = mockStations.find((s) => s.id === id);

    if (!station) {
      const errorResponse = {
        code: ErrorCode.STATION_NOT_FOUND,
        message: `Station with id "${id}" not found`,
        statusCode: HTTP_STATUS.NOT_FOUND,
        timestamp: new Date().toISOString(),
        resourceId: id,
        resourceType: "station",
      };

      return createNextResponse(
        createErrorResponse(errorResponse),
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const response = createSuccessResponse({
      stationId: station.id,
      name: station.name,
      city: station.city,
      lastUpdate: station.lastUpdate,
      current: station.currentAqi ?? null,
    });

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorResponse(
      "GET /api/stations/[id]/current error:",
      error,
      "Failed to fetch current indicators",
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
