/**
 * API Типи - комбінований формат для сумісності
 *
 * Цей файл підтримує ОБА формати:
 * 1. Старий формат: { data: T | null, error: ApiError | null }
 * 2. Новий формат: { success: true, data: T } | { success: false, error: ApiErrorResponse }
 *
 * Для новго коду, використовуйте імпорти з ./api/* модулів:
 *
 * import { ApiResponse, ApiErrorResponse, SuccessResponse } from "@/types/api";
 *
 * @see types/api/error.ts - Типи помилок
 * @see types/api/request.ts - Типи запитів
 * @see types/api/response.ts - Типи відповідей
 * @see types/api/endpoints.ts - Типи ендпоінтів
 * @see types/api/index.ts - Переекспорти всіх типів
 */

// Переекспортимо всі типи з нових модулів для сумісності
export {
  HTTP_STATUS,
  ErrorCode,
  type ApiErrorResponse,
  isValidationError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isServerError,
  isRateLimitError,
} from "./api/error";

export {
  type HttpMethod,
  type RequestHeaders,
  type ApiRequest,
  type GetStationsQuery,
  type CreateStationRequest,
  type UpdateStationRequest,
  type GetMeasurementsQuery,
  type CreateMeasurementRequest,
  type HealthCheckRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  type RegisterRequest,
} from "./api/request";

export {
  type SuccessResponse,
  type ErrorResponse,
  type CreatedResponse,
  type UpdatedResponse,
  type DeletedResponse,
  type PaginationMeta,
} from "./api/response";

export {
  HttpStatus,
  type ApiClient,
  type RouteMethod,
} from "./api/endpoints";

// ==================== Старі типи для сумісності ====================

/**
 * Помилка API (старий формат)
 * @deprecated Використовуйте ApiErrorResponse з ./api/error.ts
 */
export interface ApiError {
  /** Код помилки */
  code: string;
  /** Повідомлення про помилку */
  message: string;
  /** Деталі помилки */
  details?: unknown;
  /** HTTP статус код */
  statusCode?: number;
  /** Час помилки */
  timestamp?: string;
}

/**
 * Базова відповідь API (старий формат)
 * @deprecated Використовуйте SuccessResponse або ErrorResponse
 */
export interface ApiResponse<T> {
  /** Дані відповіді */
  data: T | null;
  /** Помилка (якщо є) */
  error: ApiError | null;
  /** Час отримання відповіді */
  timestamp: string;
  /** Версія API */
  version?: string;
}

/**
 * Пагінована відповідь API
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Метаінформація пагінації */
  meta: {
    /** Загальна кількість елементів */
    total: number;
    /** Поточна сторінка */
    page: number;
    /** Елементів на сторінку */
    limit: number;
    /** Загальна кількість сторінок */
    totalPages: number;
    /** Відсортовано за */
    sortBy?: string;
    /** Напрямок сортування */
    sortOrder?: "asc" | "desc";
  };
}

/**
 * Фільтри для пошуку станцій
 */
export interface StationFilters {
  /** Текстовий пошук */
  search?: string;
  /** Фільтр за містом */
  city?: string;
  /** Фільтр за типом станції */
  type?: string;
  /** Фільтр за активністю */
  isActive?: boolean;
  /** Фільтр за статусом */
  status?: string;
  /** Фільтр за регіоном */
  region?: string;
  /** Мінімальний AQI */
  minAqi?: number;
  /** Максимальний AQI */
  maxAqi?: number;
}

/**
 * Параметри пагінації
 */
export interface PaginationParams {
  /** Номер сторінки (починаючи з 1) */
  page?: number;
  /** Кількість елементів на сторінку */
  limit?: number;
  /** Сортування за полем */
  sortBy?: string;
  /** Напрямок сортування */
  sortOrder?: "asc" | "desc";
}

/**
 * Параметри запиту часового ряду
 */
export interface TimeSeriesQueryParams {
  /** Станція */
  stationId: string;
  /** Забруднювач */
  pollutant: string;
  /** Кількість днів для отримання */
  days?: number;
  /** Дата початку */
  startDate?: string;
  /** Дата кінця */
  endDate?: string;
  /** Гранульярність (hour, day, week) */
  granularity?: "hour" | "day" | "week";
}

/**
 * Параметри експорту даних
 */
export interface ExportParams {
  /** Станції для експорту */
  stationIds?: string[];
  /** Дата початку */
  startDate: string;
  /** Дата кінця */
  endDate: string;
  /** Формат експорту (csv, json, xlsx) */
  format: "csv" | "json" | "xlsx";
  /** Забруднювачі для експорту */
  pollutants?: string[];
  /** Включати статистику */
  includeStatistics?: boolean;
}

/**
 * Запит для сповіщень
 */
export interface AlertQuery {
  /** Найменший рівень сповіщення */
  minLevel?: string;
  /** Активні сповіщення */
  activeOnly?: boolean;
  /** Кількість днів історії */
  daysBack?: number;
}

/**
 * Успішна відповідь сторінки
 */
export interface PageResponse<T> extends PaginatedResponse<T> {
  /** Посилання на наступну сторінку */
  nextUrl?: string;
  /** Посилання на попередню сторінку */
  prevUrl?: string;
}

/**
 * Кеш метаінформація
 */
export interface CacheMetadata {
  /** Час кешування */
  cachedAt: string;
  /** TTL кешу (секунди) */
  ttl: number;
  /** Хеш вмісту */
  contentHash?: string;
}
