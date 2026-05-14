/**
 * API Запити - типи для всіх запитів до сервера
 *
 * Включає:
 * - HTTP методи (GET, POST, PUT, DELETE, PATCH)
 * - Headers та параметри
 * - Body типи для POST/PUT запитів
 * - Query параметри для фільтрації та пошуку
 */

import { Pollutant } from "../air-quality";
import { StationType } from "../station";
import { PaginationParams, TimeSeriesQueryParams } from "../api";

/**
 * HTTP методи
 */
export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

/**
 * Типові headers для запитів
 */
export interface RequestHeaders {
  /** Content-Type для тіла запиту */
  "content-type"?: "application/json" | "multipart/form-data" | "text/plain";
  /** Authorization header з токеном */
  authorization?: string;
  /** Accept-Language для локалізації */
  "accept-language"?: string;
  /** User-Agent */
  "user-agent"?: string;
  /** Ідентифікатор запиту для трейсування */
  "x-request-id"?: string;
  /** Версія API */
  "x-api-version"?: string;
  /** Кастомні headers */
  [key: string]: string | undefined;
}

/**
 * Базовий тип запиту
 */
export interface ApiRequest<T = unknown> {
  /** HTTP метод */
  method: HttpMethod;
  /** URL ендпоінту */
  endpoint: string;
  /** Тіло запиту (для POST/PUT/PATCH) */
  body?: T;
  /** Query параметри (для GET) */
  query?: Record<string, string | number | boolean | undefined>;
  /** Headers запиту */
  headers?: RequestHeaders;
  /** Timeout у мілісекундах */
  timeout?: number;
  /** Кешувати відповідь? */
  cache?: boolean;
  /** Повторити запит при помилці? */
  retry?: boolean;
}

/**
 * Параметри для запиту GET /stations
 */
export interface GetStationsQuery extends PaginationParams {
  search?: string;
  type?: StationType;
  region?: string;
  isActive?: boolean;
  status?: string;
  minAqi?: number;
  maxAqi?: number;
}

/**
 * Тіло для POST /stations (створення станції)
 */
export interface CreateStationRequest {
  name: string;
  description?: string;
  type: StationType;
  coordinates: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  region?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    organization?: string;
  };
  notes?: string;
}

/**
 * Тіло для PUT /stations/:id (оновлення станції)
 */
export interface UpdateStationRequest extends Partial<CreateStationRequest> {
  id: string;
}

/**
 * Параметри для запиту GET /measurements
 */
export interface GetMeasurementsQuery extends PaginationParams {
  stationId?: string;
  pollutant?: Pollutant;
  startDate?: string;
  endDate?: string;
  minAqi?: number;
  maxAqi?: number;
  status?: string;
}

/**
 * Тіло для POST /measurements (нове вимірювання)
 */
export interface CreateMeasurementRequest {
  stationId: string;
  timestamp: string;
  readings: Array<{
    pollutant: Pollutant;
    value: number;
    unit: string;
  }>;
  meteorology?: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    windSpeed?: number;
    windDirection?: number;
    precipitation?: number;
    visibility?: number;
  };
  metadata?: {
    source?: string;
    processingTime?: number;
  };
}

/**
 * Параметри для запиту GET /measurements/:id/timeseries
 */
export interface GetTimeSeriesQuery extends TimeSeriesQueryParams {
  includeStatistics?: boolean;
  aggregation?: "raw" | "hour" | "day" | "week" | "month";
}

/**
 * Параметри для запиту GET /alerts
 */
export interface GetAlertsQuery extends PaginationParams {
  minLevel?: string;
  activeOnly?: boolean;
  stationId?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Тіло для POST /alerts (створення сповіщення)
 */
export interface CreateAlertRequest {
  stationId: string;
  level: string;
  pollutants: Pollutant[];
  message: string;
  startDate: string;
  endDate?: string;
  notifyRegions?: string[];
  recommendations?: string[];
}

/**
 * Тіло для PUT /alerts/:id (оновлення сповіщення)
 */
export interface UpdateAlertRequest extends Partial<CreateAlertRequest> {
  id: string;
  status?: "active" | "resolved" | "archived";
}

/**
 * Параметри для експорту даних
 */
export interface ExportDataRequest {
  stationIds?: string[];
  startDate: string;
  endDate: string;
  format: "csv" | "json" | "xlsx" | "pdf";
  pollutants?: Pollutant[];
  includeStatistics?: boolean;
  includeMetadata?: boolean;
}

/**
 * Параметри для генерування звіту
 */
export interface GenerateReportRequest {
  type: "daily" | "weekly" | "monthly" | "annual" | "custom";
  stationIds?: string[];
  startDate: string;
  endDate: string;
  metrics: Array<"aqi" | "pollutants" | "health" | "trends">;
  language?: "uk" | "en";
}

/**
 * Тіло для POST /health-check
 * (опціональні параметри для детального статусу)
 */
export interface HealthCheckRequest {
  verbose?: boolean;
  checkDatabase?: boolean;
  checkExternalServices?: boolean;
}

/**
 * Аутентифікація - запит на логін
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Аутентифікація - запит на оновлення токену
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Аутентифікація - запит на реєстрацію
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organization?: string;
}

/**
 * Пошук та фільтрування
 */
export interface SearchRequest {
  query: string;
  type?: "stations" | "measurements" | "alerts" | "all";
  limit?: number;
  offset?: number;
}

/**
 * Batch запит для операцій над кількома ресурсами
 */
export interface BatchRequest<T> {
  operations: Array<{
    method: HttpMethod;
    endpoint: string;
    body?: T;
  }>;
}

/**
 * Batch відповідь
 */
export interface BatchResponse<T> {
  results: Array<{
    status: number;
    body?: T;
    error?: {
      code: string;
      message: string;
    };
  }>;
}
