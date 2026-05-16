import { NextRequest } from "next/server";
import { headers } from "next/headers";
import {
  mockStations,
  mockMeasurements,
} from "@/lib/mock-data";
import {
  validateQuery,
  validateStationCreate,
} from "@/lib/api/validation";
import { validationErrorResponse } from "@/lib/api/validation-response";
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  filterAndSort,
  buildSortComparator,
  tryPaginate,
  HTTP_STATUS,
} from "@/lib/api/handlers";
import { internalServerErrorForRequest } from "@/lib/api/request-errors";
import { ErrorCode } from "@/types/api/error";
import { StationType, StationStatus } from "@/types/station";
import { AirQualityIndex, Pollutant } from "@/types/air-quality";
import type { MonitoringStation, Coordinates } from "@/types/station";
import { logger } from "@/lib/logger";

const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * GET /api/stations
 * Повертає список всіх станцій з пагінацією, фільтруванням та сортуванням
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      sort: searchParams.get("sort") || "name",
      order: searchParams.get("order") || "asc",
      search: searchParams.get("search"),
      city: searchParams.get("city"),
      type: searchParams.get("type"),
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      all: searchParams.get("all") ?? undefined,
    };

    const validation = validateQuery(queryData);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid query parameters",
        validation.error,
      );
    }

    const { page, limit, sort, order, search, city, type, startDate, endDate, all } =
      validation.data;

    const sortField = sort ?? "name";
    const sortOrder = (order ?? "asc") as "asc" | "desc";

    const filterFn = (station: MonitoringStation) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = station.name.toLowerCase().includes(searchLower);
        const matchesCity = station.city.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesCity) return false;
      }

      if (city) {
        if (station.city.toLowerCase() !== city.toLowerCase()) return false;
      }

      if (type) {
        const typeMap: Record<string, StationType> = {
          urban: StationType.Urban,
          suburban: StationType.Suburban,
          rural: StationType.Rural,
          industrial: StationType.Industrial,
          traffic: StationType.Traffic,
        };
        const mappedType = typeMap[type.toLowerCase()];
        if (mappedType && station.type !== mappedType) return false;
      }

      if (startDate || endDate) {
        const last = new Date(station.lastUpdate).getTime();
        if (startDate && last < startDate.getTime()) return false;
        if (endDate && last > endDate.getTime()) return false;
      }

      return true;
    };

    const sortComparator = buildSortComparator(
      sortField,
      sortOrder,
    ) as unknown as (a: MonitoringStation, b: MonitoringStation) => number;

    // Застосування фільтру та сортування
    const { data: filteredStations } = filterAndSort(
      mockStations,
      filterFn,
      sortComparator
    );

    let paginatedData: MonitoringStation[];
    let pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };

    if (all) {
      paginatedData = filteredStations;
      pagination = {
        page: 1,
        limit: filteredStations.length,
        total: filteredStations.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    } else {
      const paginated = tryPaginate(filteredStations, page, limit);
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
      paginatedData = paginated.data;
      pagination = paginated.pagination;
    }

    const stationsWithData = paginatedData.map((station) => ({
      ...station,
      currentAqi: station.currentAqi,
    }));

    const response = createSuccessResponse(stationsWithData, {
      ...pagination,
      sortBy: sortField,
      sortOrder,
    });

    const h = await headers();
    logger.debug(
      {
        route: "GET /api/stations",
        request_id: h.get("x-request-id") ?? undefined,
        returned_count: stationsWithData.length,
        all_flag: Boolean(all),
      },
      "stations_list_ok",
    );

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    return internalServerErrorForRequest(
      request,
      "GET /api/stations error:",
      error,
    );
  }
}

/**
 * POST /api/stations
 * Додає нову станцію
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валідація даних
    const validation = validateStationCreate(body);
    if (!validation.success) {
      return validationErrorResponse(
        "Invalid station data",
        validation.error,
      );
    }

    const { name, city, country, coordinates, elevation, type } =
      validation.data;

    // Перевірка що станція з такою назвою не існує
    const existingStation = mockStations.find(
      (station) => station.name.toLowerCase() === name.toLowerCase()
    );

    if (existingStation) {
      logger.warn(
        {
          route: "POST /api/stations",
          conflict_name: name,
          existing_id: existingStation.id,
        },
        "station_duplicate_name",
      );
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

    // Конвертування типу станції
    const typeMap: Record<string, StationType> = {
      urban: StationType.Urban,
      suburban: StationType.Suburban,
      rural: StationType.Rural,
      industrial: StationType.Industrial,
    };

    // Створення нової станції
    const newStation: MonitoringStation = {
      id: `st-${generateId()}`,
      name,
      city,
      country,
      coordinates: {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        altitude: elevation,
      } as Coordinates,
      type: typeMap[type],
      status: StationStatus.Active,
      isActive: true,
      installedDate: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      currentAqi: {
        aqi: 50,
        level: AirQualityIndex.Good,
        readings: [],
        dominantPollutant: Pollutant.PM25,
      },
    };

    // Додавання до mock даних
    mockStations.push(newStation);
    mockMeasurements[newStation.id] = [];

    const response = createSuccessResponse(newStation);

    return createNextResponse(response, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const errorResponse = {
        code: ErrorCode.INVALID_REQUEST,
        message: "Некоректний формат JSON у тілі запиту",
        statusCode: HTTP_STATUS.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      };

      return createNextResponse(
        createErrorResponse(errorResponse),
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return internalServerErrorForRequest(
      request,
      "POST /api/stations error:",
      error,
    );
  }
}

/**
 * OPTIONS /api/stations
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
