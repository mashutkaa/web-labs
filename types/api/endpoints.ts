/**
 * API Ендпоінти - типи для кожного ендпоінту
 *
 * Документація всіх доступних API ендпоінтів з типами запитів і відповідей
 */

import { ApiErrorResponse } from "./error";
import {
  ApiResponse,
  StationsListResponse,
  StationDetailsResponse,
  CreateStationResponse,
  UpdateStationResponse,
  DeleteStationResponse,
} from "./response";

/**
 * Ендпоінти API
 *
 * Повний список доступних ендпоінтів на сервері:
 *
 * ## Здоров'я сервера
 * - GET /health - Перевірка статусу сервера
 * - GET /statistics - Загальна статистика платформи
 *
 * ## Станції
 * - GET /stations - Список станцій (пагіновано; ?all=true — усі без пагінації)
 * - POST /stations - Створити нову станцію
 * - GET /stations/:id - Деталі станції
 * - GET /stations/:id/current - Поточні показники (AQI, забруднювачі)
 * - GET /stations/:id/measurements - Вимірювання станції за період
 * - PUT /stations/:id - Оновити станцію
 * - DELETE /stations/:id - Видалити станцію
 *
 * ## Вимірювання
 * - GET /measurements - Список вимірювань (пагіновано; stationId, startDate, endDate)
 * - POST /measurements - Додати вимірювання
 * - GET /measurements/:id - Деталі вимірювання
 * - GET /measurements/:id/timeseries - Часовий ряд
 *
 * ## Сповіщення
 * - GET /alerts - Список сповіщень
 * - POST /alerts - Створити сповіщення
 * - GET /alerts/:id - Деталі сповіщення
 * - PUT /alerts/:id - Оновити сповіщення
 * - DELETE /alerts/:id - Видалити сповіщення
 *
 * ## Експорт та звіти
 * - POST /export - Експортувати дані
 * - POST /report - Генерувати звіт
 *
 * ## Пошук
 * - GET /search - Глобальний пошук
 *
 * ## Аутентифікація
 * - POST /auth/login - Вхід
 * - POST /auth/register - Реєстрація
 * - POST /auth/refresh - Оновлення токену
 * - POST /auth/logout - Вихід
 */

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Генеральний API клієнт
 *
 * Приклад використання:
 * ```typescript
 * const client: ApiClient = {
 *   getStations: async (query?) => { ... },
 *   createStation: async (data) => { ... },
 *   // і т.д.
 * };
 * ```
 */
export interface ApiClient {
  // ==================== Здоров'я ====================
  healthCheck(): Promise<ApiResponse<{ status: string }>>;
  getStatistics(): Promise<ApiResponse<Record<string, unknown>>>;

  // ==================== Станції ====================
  getStations(query?: Record<string, unknown>): Promise<StationsListResponse>;
  createStation(
    data: Record<string, unknown>,
  ): Promise<CreateStationResponse | ApiErrorResponse>;
  getStation(id: string): Promise<StationDetailsResponse | ApiErrorResponse>;
  updateStation(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateStationResponse | ApiErrorResponse>;
  deleteStation(id: string): Promise<DeleteStationResponse | ApiErrorResponse>;

  // ==================== Вимірювання ====================
  getMeasurements(
    query?: Record<string, unknown>,
  ): Promise<ApiResponse<unknown[]>>;
  createMeasurement(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<unknown>>;
  getMeasurement(id: string): Promise<ApiResponse<unknown>>;
  getTimeSeries(
    id: string,
    query?: Record<string, unknown>,
  ): Promise<ApiResponse<unknown>>;

  // ==================== Сповіщення ====================
  getAlerts(query?: Record<string, unknown>): Promise<ApiResponse<unknown[]>>;
  createAlert(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ id: string }>>;
  getAlert(id: string): Promise<ApiResponse<unknown>>;
  updateAlert(
    id: string,
    data: Record<string, unknown>,
  ): Promise<ApiResponse<null>>;
  deleteAlert(id: string): Promise<ApiResponse<null>>;

  // ==================== Експорт ====================
  exportData(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ downloadUrl: string }>>;
  generateReport(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ reportId: string }>>;

  // ==================== Пошук ====================
  search(query: Record<string, unknown>): Promise<ApiResponse<unknown[]>>;

  // ==================== Аутентифікація ====================
  login(
    email: string,
    password: string,
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>>;
  register(data: Record<string, unknown>): Promise<ApiResponse<{ id: string }>>;
  refreshToken(token: string): Promise<ApiResponse<{ accessToken: string }>>;
  logout(): Promise<ApiResponse<null>>;
}

/**
 * Типи для маршрутів
 */
export type RouteMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
