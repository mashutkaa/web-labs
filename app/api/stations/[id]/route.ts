import { NextRequest } from "next/server";
import {
  mockStations,
  mockMeasurements,
} from "@/lib/mock-data";
import {
  validateUpdate,
} from "@/lib/api/validation";
import { validationErrorResponse } from "@/lib/api/validation-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  internalServerErrorResponse,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { ErrorCode } from "@/types/api/error";
import { StationType } from "@/types/station";

/**
 * GET /api/stations/[id]
 * Повертає деталі конкретної станції
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Пошук станції
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
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Включити поточні показники забруднювачів
    const stationWithData = {
      ...station,
      currentAqi: station.currentAqi,
      recentMeasurements: mockMeasurements[id]?.slice(-24) || [], // Останні 24 вимірювання
    };

    const response = createSuccessResponse(stationWithData);

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorResponse(
      "GET /api/stations/[id] error:",
      error,
      "Failed to fetch station",
    );
  }
}

/**
 * PUT /api/stations/[id]
 * Оновлює станцію
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Пошук станції
    const stationIndex = mockStations.findIndex((s) => s.id === id);

    if (stationIndex === -1) {
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
        HTTP_STATUS.NOT_FOUND
      );
    }

    const body = await request.json();

    // Валідація даних оновлення
    const validation = validateUpdate(body);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid station update data",
        validation.error,
      );
    }

    const { name, city, type } = validation.data;

    // Перевірка дублікату імені, якщо змінюється
    if (name && name !== mockStations[stationIndex].name) {
      const duplicate = mockStations.find(
        (s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== id
      );
      if (duplicate) {
        const errorResponse = {
          code: ErrorCode.DUPLICATE_ENTRY,
          message: `Station with name "${name}" already exists`,
          statusCode: HTTP_STATUS.CONFLICT,
          timestamp: new Date().toISOString(),
        };

        return createNextResponse(
          createErrorResponse(errorResponse),
          HTTP_STATUS.CONFLICT
        );
      }
    }

    // Оновлення станції
    const station = mockStations[stationIndex];
    const typeMap: Record<string, StationType> = {
      urban: StationType.Urban,
      suburban: StationType.Suburban,
      rural: StationType.Rural,
      industrial: StationType.Industrial,
    };

    if (name) station.name = name;
    if (city) station.city = city;
    if (type) station.type = typeMap[type];

    station.lastUpdate = new Date().toISOString();

    const response = createSuccessResponse(station);

    return createNextResponse(response, HTTP_STATUS.OK);
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
      "PUT /api/stations/[id] error:",
      error,
      "Failed to update station",
    );
  }
}

/**
 * DELETE /api/stations/[id]
 * Видаляє станцію
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Пошук станції
    const stationIndex = mockStations.findIndex((s) => s.id === id);

    if (stationIndex === -1) {
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
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Видалення станції
    mockStations.splice(stationIndex, 1);

    // Видалення вимірювань для цієї станції
    delete mockMeasurements[id];

    const response = {
      success: true,
      data: { success: true },
      statusCode: HTTP_STATUS.OK,
      timestamp: new Date().toISOString(),
    };

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorResponse(
      "DELETE /api/stations/[id] error:",
      error,
      "Failed to delete station",
    );
  }
}

/**
 * OPTIONS /api/stations/[id]
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
