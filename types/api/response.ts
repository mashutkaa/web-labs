/**
 * API Відповіді - типи для всіх відповідей від сервера
 *
 * Включає:
 * - Успішні відповіді (200, 201)
 * - Помилки (4xx, 5xx)
 * - Пагінація та метаданні
 * - Спеціальні типи (Created, Updated, Deleted)
 */

import { ApiErrorResponse } from "./error";
import { MonitoringStation } from "../station";
import { Measurement } from "../measurement";

/**
 * Успішна відповідь API з даними
 */
export interface SuccessResponse<T> {
  /** Статус операції */
  success: true;
  /** Дані відповіді */
  data: T;
  /** HTTP статус код */
  statusCode: number;
  /** Час отримання відповіді (ISO 8601) */
  timestamp: string;
  /** Версія API */
  version?: string;
  /** Метаданні відповіді */
  metadata?: {
    /** ID запиту для трейсування */
    requestId?: string;
    /** Час обробки сервером (мс) */
    processingTime?: number;
    /** Кешовано? */
    cached?: boolean;
    /** TTL кешу (сек) */
    cacheTtl?: number;
  };
}

/**
 * Помилка API відповідь
 */
export interface ErrorResponse {
  /** Статус операції */
  success: false;
  /** Помилка */
  error: ApiErrorResponse;
  /** Версія API */
  version?: string;
}

/**
 * Загальний тип відповіді API
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Відповідь на успішне створення ресурсу (201 Created)
 */
export interface CreatedResponse<T> extends SuccessResponse<T> {
  statusCode: 201;
  /** URL нового ресурсу */
  location?: string;
}

/**
 * Відповідь на успішне оновлення (204 No Content)
 */
export interface UpdatedResponse extends SuccessResponse<null> {
  statusCode: 204;
  data: null;
}

/**
 * Відповідь на успішне видалення (204 No Content)
 */
export interface DeletedResponse extends SuccessResponse<null> {
  statusCode: 204;
  data: null;
}

/**
 * Мета-інформація для пагінованої відповіді
 */
export interface PaginationMeta {
  /** Загальна кількість елементів */
  total: number;
  /** Поточна сторінка (починаючи з 1) */
  page: number;
  /** Елементів на сторінку */
  limit: number;
  /** Загальна кількість сторінок */
  totalPages: number;
  /** Є наступна сторінка? */
  hasNextPage: boolean;
  /** Є попередня сторінка? */
  hasPreviousPage: boolean;
  /** Відсортовано за */
  sortBy?: string;
  /** Напрямок сортування */
  sortOrder?: "asc" | "desc";
}

/**
 * Пагінована відповідь API
 */
export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  /** Мета-інформація пагінації */
  pagination: PaginationMeta;
  /** Посилання навігації */
  links?: {
    /** Посилання на першу сторінку */
    first?: string;
    /** Посилання на останню сторінку */
    last?: string;
    /** Посилання на наступну сторінку */
    next?: string;
    /** Посилання на попередню сторінку */
    previous?: string;
    /** Посилання на поточну сторінку */
    self: string;
  };
}

/**
 * Список станцій (пагінована відповідь)
 */
export type StationsListResponse = PaginatedResponse<MonitoringStation>;

/**
 * Деталі однієї станції
 */
export type StationDetailsResponse = SuccessResponse<MonitoringStation>;

/**
 * Створення станції
 */
export type CreateStationResponse = CreatedResponse<MonitoringStation>;

/**
 * Оновлення станції
 */
export type UpdateStationResponse = UpdatedResponse;

/**
 * Видалення станції
 */
export type DeleteStationResponse = DeletedResponse;

/**
 * Список вимірювань
 */
export type MeasurementsListResponse = PaginatedResponse<Measurement>;

/**
 * Деталі одного вимірювання
 */
export type MeasurementDetailsResponse = SuccessResponse<Measurement>;

/**
 * Створення вимірювання
 */
export type CreateMeasurementResponse = CreatedResponse<Measurement>;

/**
 * Часовий ряд для забруднювача
 */
export interface TimeSeriesResponse {
  stationId: string;
  stationName: string;
  pollutant: string;
  startDate: string;
  endDate: string;
  granularity: "hour" | "day" | "week" | "month";
  points: Array<{
    timestamp: string;
    value: number;
    status?: string;
    qualityFlag?: number;
  }>;
  statistics?: {
    min: number;
    max: number;
    mean: number;
    median?: number;
    stdDev?: number;
    dataAvailability: number;
  };
}

export type TimeSeriesDataResponse = SuccessResponse<TimeSeriesResponse>;

/**
 * Сповіщення про якість повітря
 */
export interface HealthAlert {
  id: string;
  stationId: string;
  stationName: string;
  level: string;
  pollutants: string[];
  message: string;
  startDate: string;
  endDate?: string;
  status: "active" | "resolved" | "archived";
  createdAt: string;
  updatedAt: string;
}

/**
 * Список сповіщень
 */
export type AlertsListResponse = PaginatedResponse<HealthAlert>;

/**
 * Деталі одного сповіщення
 */
export type AlertDetailsResponse = SuccessResponse<HealthAlert>;

/**
 * Створення сповіщення
 */
export type CreateAlertResponse = CreatedResponse<HealthAlert>;

/**
 * Статус здоров'я сервера (Health Check)
 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  services?: {
    database?: "up" | "down" | "slow";
    externalApi?: "up" | "down" | "slow";
    cache?: "up" | "down" | "slow";
  };
  metrics?: {
    requestsPerSecond?: number;
    averageResponseTime?: number;
    errorRate?: number;
    activeDatabaseConnections?: number;
  };
}

export type HealthCheckDataResponse = SuccessResponse<HealthCheckResponse>;

/**
 * Статистика платформи
 */
export interface PlatformStatistics {
  totalStations: number;
  activeStations: number;
  totalMeasurements: number;
  averageAqi: number;
  regionsWithAlerts: string[];
  lastUpdateTime: string;
  dataAvailability: number;
}

export type StatisticsResponse = SuccessResponse<PlatformStatistics>;

/**
 * Результати пошуку
 */
export interface SearchResults {
  query: string;
  type: string;
  results: Array<{
    id: string;
    type: "station" | "measurement" | "alert";
    title: string;
    description?: string;
    relevance: number;
    metadata?: Record<string, unknown>;
  }>;
  totalCount: number;
}

export type SearchResponse = SuccessResponse<SearchResults>;

/**
 * Аутентифікація - логін
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

export type LoginDataResponse = SuccessResponse<LoginResponse>;

/**
 * Аутентифікація - оновлення токену
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export type RefreshTokenDataResponse = SuccessResponse<RefreshTokenResponse>;

/**
 * Експорт даних
 */
export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  format: string;
  size: number;
  expiresIn: number;
}

export type ExportDataResponse = SuccessResponse<ExportResponse>;

/**
 * Генерування звіту
 */
export interface ReportResponse {
  reportId: string;
  downloadUrl: string;
  format: string;
  generatedAt: string;
  expiresIn: number;
}

export type GenerateReportDataResponse = SuccessResponse<ReportResponse>;

/**
 * Повідомлення про успіх без конкретних даних
 */
export interface MessageResponse {
  message: string;
  details?: Record<string, unknown>;
}

export type MessageDataResponse = SuccessResponse<MessageResponse>;
