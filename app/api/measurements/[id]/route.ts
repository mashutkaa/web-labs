import { NextRequest } from "next/server";
import { mockMeasurements } from "@/lib/mock-data";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  internalServerErrorResponse,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { ErrorCode } from "@/types/api/error";

/**
 * GET /api/measurements/[id]
 * Повертає одне конкретне вимірювання по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Пошук вимірювання по ID у всіх станціях
    let measurement = null;
    for (const measurements of Object.values(mockMeasurements)) {
      const found = measurements.find((m) => m.id === id);
      if (found) {
        measurement = found;
        break;
      }
    }

    if (!measurement) {
      const errorResponse = {
        code: ErrorCode.MEASUREMENT_NOT_FOUND,
        message: `Measurement with id "${id}" not found`,
        statusCode: HTTP_STATUS.NOT_FOUND,
        timestamp: new Date().toISOString(),
        resourceId: id,
        resourceType: "measurement",
      };

      return createNextResponse(
        createErrorResponse(errorResponse),
        HTTP_STATUS.NOT_FOUND
      );
    }

    const response = createSuccessResponse(measurement);

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorResponse(
      "GET /api/measurements/[id] error:",
      error,
      "Failed to fetch measurement",
    );
  }
}

/**
 * OPTIONS /api/measurements/[id]
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
