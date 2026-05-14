/**
 * API Обработчики и утилиты для работы с запросами и ответами
 *
 * Включает функции для:
 * - Создания успешных и ошибочных ответов
 * - Пагинации данных
 * - Фильтрования и сортировки
 * - Обработки ошибок
 * - Валидации запросов
 * - Построения фильтров и компараторов
 * - Создания Next.js ответов
 */

import type {
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
} from "@/types/api/response";
import {
  ErrorCode,
  HTTP_STATUS,
} from "@/types/api/error";
import type {
  ApiErrorBase,
} from "@/types/api/error";

/**
 * Типы запросов
 */

/**
 * Информация о пагинации
 */
export interface Pagination {
  /** Поточна сторінка (починаючи з 1) */
  page: number;
  /** Елементів на сторінку */
  limit: number;
  /** Загальна кількість елементів */
  total: number;
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
 * Помилка API
 */
export interface ApiError extends ApiErrorBase {
  code: ErrorCode | string;
  message: string;
  statusCode: number;
  timestamp: string;
  fields?: Array<{
    field: string;
    message: string;
    type?: string;
    value?: unknown;
  }>;
  resourceId?: string;
  resourceType?: string;
}

/**
 * Параметри запиту для фільтрування
 */
export interface QueryParams {
  /** Текстовий пошук */
  search?: string;
  /** Місто */
  city?: string;
  /** Тип ресурсу */
  type?: string;
  /** Діапазон дат */
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  /** Інші параметри */
  [key: string]: unknown;
}

/**
 * Результат валідації
 */
export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    type?: string;
  }>;
}

/**
 * Результат пагінації з даними
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Результат фільтрування та сортування
 */
export interface FilteredResult<T> {
  data: T[];
  count: number;
}

/**
 * Успешный ответ с типизацией
 *
 * @param data - Данные для ответа
 * @param pagination - Опциональная информация о пагинации
 * @returns Успешный ответ API
 */
export function createSuccessResponse<T>(
  data: T,
  pagination?: Pagination,
): SuccessResponse<T> | PaginatedResponse<T> {
  const timestamp = new Date().toISOString();

  if (pagination) {
    return {
      success: true,
      data: data as T[],
      statusCode: HTTP_STATUS.OK,
      timestamp,
      pagination,
      metadata: {
        requestId: generateRequestId(),
        processingTime: 0,
        cached: false,
      },
    } as unknown as PaginatedResponse<T>;
  }

  return {
    success: true,
    data,
    statusCode: HTTP_STATUS.OK,
    timestamp,
    metadata: {
      requestId: generateRequestId(),
      processingTime: 0,
      cached: false,
    },
  };
}

/**
 * Ошибочный ответ
 *
 * @param error - Объект ошибки или строка
 * @param statusCode - Опциональный HTTP статус код
 * @returns Ошибочный ответ API
 */
export function createErrorResponse(
  error: ApiError | string,
  statusCode?: number,
): ErrorResponse {
  let apiError: ApiError;

  if (typeof error === "string") {
    apiError = {
      code: ErrorCode.INVALID_REQUEST,
      message: error,
      statusCode: statusCode || HTTP_STATUS.BAD_REQUEST,
      timestamp: new Date().toISOString(),
    };
  } else {
    apiError = {
      ...error,
      statusCode: statusCode || error.statusCode,
      timestamp: error.timestamp || new Date().toISOString(),
    };
  }

  return {
    success: false,
    error: apiError,
  };
}

/**
 * Пагинирање данных с расчётом смещения
 *
 * @param items - Массив данных
 * @param page - Номер страницы (начиная с 1)
 * @param limit - Максимум элементов на странице
 * @returns Объект с данными и информацией о пагинации
 * @throws Error если page < 1 или limit > 250
 */
export function paginateData<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  if (page < 1) {
    throw new Error("Page must be greater than or equal to 1");
  }

  if (limit > 250) {
    throw new Error("Limit cannot exceed 250");
  }

  if (limit < 1) {
    throw new Error("Limit must be greater than or equal to 1");
  }

  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedData = items.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Пагінація без винятку: при некоректних page/limit повертає помилку для відповіді 400.
 */
export function tryPaginate<T>(
  items: T[],
  page: number,
  limit: number,
):
  | { ok: true; data: T[]; pagination: Pagination }
  | { ok: false; message: string } {
  try {
    const { data, pagination } = paginateData(items, page, limit);
    return { ok: true, data, pagination };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid pagination parameters";
    return { ok: false, message };
  }
}

/**
 * Узгоджена відповідь 500 для catch-блоків маршрутів.
 */
export function internalServerErrorResponse(
  logLabel: string,
  error: unknown,
  message = "An unexpected error occurred",
): Response {
  console.error(logLabel, error);
  return createNextResponse(
    createErrorResponse({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    }),
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
}

/**
 * Фільтрування та сортування даних
 *
 * @param items - Вихідні дані
 * @param filterFn - Функція для фільтрування (опціонально)
 * @param sortFn - Функція для сортування (опціонально)
 * @returns Відфільтровані та відсортовані дані
 */
export function filterAndSort<T>(
  items: T[],
  filterFn?: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number,
): FilteredResult<T> {
  let filtered = items;

  if (filterFn) {
    filtered = items.filter(filterFn);
  }

  if (sortFn) {
    filtered = filtered.sort(sortFn);
  }

  return {
    data: filtered,
    count: filtered.length,
  };
}

/**
 * Обработка ошибки и преобразование её в ApiError
 *
 * @param error - Неизвестная ошибка
 * @returns ApiError объект для ответа
 */
export function handleApiError(error: unknown): ApiError {
  console.error("API Error:", error);

  if (error instanceof Error) {
    // Проверка на известные типы ошибок
    if (error.message.includes("validation")) {
      return {
        code: ErrorCode.VALIDATION_ERROR,
        message: error.message,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        timestamp: new Date().toISOString(),
      };
    }

    if (error.message.includes("not found")) {
      return {
        code: ErrorCode.NOT_FOUND,
        message: error.message,
        statusCode: HTTP_STATUS.NOT_FOUND,
        timestamp: new Date().toISOString(),
      };
    }

    if (error.message.includes("unauthorized")) {
      return {
        code: ErrorCode.UNAUTHORIZED,
        message: error.message,
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: error.message || "An unexpected error occurred",
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    };
  }

  // Обработка неизвестного типа ошибки
  return {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "An unexpected error occurred",
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Валидация данных по схеме (подддерживает объекты вида Zod-подобных схем)
 *
 * @param schema - Объект схемы с методом parse или safeParse
 * @param data - Данные для валидации
 * @returns Результат валидации
 */
export function validateRequest<T>(
  schema: {
    parse?: (data: unknown) => T;
    safeParse?: (data: unknown) => { success: boolean; data?: T; error?: Error };
  },
  data: unknown,
): ValidationResult<T> {
  try {
    // Проверка метода safeParse (Zod-подобная схема)
    if (schema.safeParse) {
      const result = schema.safeParse(data);
      if (result.success && result.data) {
        return {
          valid: true,
          data: result.data,
        };
      } else {
        // Извлечение ошибок из Zod-подобного результата
        const errors = extractValidationErrors(result.error);
        return {
          valid: false,
          errors,
        };
      }
    }

    // Проверка метода parse
    if (schema.parse) {
      const parsedData = schema.parse(data);
      return {
        valid: true,
        data: parsedData,
      };
    }

    return {
      valid: false,
      errors: [
        {
          field: "schema",
          message: "Invalid schema provided",
          type: "schema_error",
        },
      ],
    };
  } catch (error) {
    const errors = extractValidationErrors(error);
    return {
      valid: false,
      errors,
    };
  }
}

/**
 * Построение объекта фільтру из параметров запроса
 *
 * @param params - Параметры запроса
 * @returns Объект фільтру
 */
export function buildFilterQuery(params: QueryParams): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (params.search) {
    filter.search = params.search;
  }

  if (params.city) {
    filter.city = params.city;
  }

  if (params.type) {
    filter.type = params.type;
  }

  if (params.dateRange) {
    filter.startDate = params.dateRange.startDate;
    filter.endDate = params.dateRange.endDate;
  }

  // Добавить прочие параметры (не стандартные)
  Object.entries(params).forEach(([key, value]) => {
    if (
      !["search", "city", "type", "dateRange"].includes(key) &&
      value !== undefined
    ) {
      filter[key] = value;
    }
  });

  return filter;
}

/**
 * Построение функции сравнения для сортировки
 *
 * @param sortField - Поле для сортировки (по умолчанию 'name')
 * @param order - Направление сортировки ('asc' или 'desc')
 * @returns Функция компаратора для массива sort()
 */
export function buildSortComparator<T extends Record<string, unknown>>(
  sortField: string = "name",
  order: "asc" | "desc" = "asc",
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Обработка null/undefined значений
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Сравнение строк
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue, "uk");
      return order === "asc" ? comparison : -comparison;
    }

    // Сравнение чисел
    if (typeof aValue === "number" && typeof bValue === "number") {
      const comparison = aValue - bValue;
      return order === "asc" ? comparison : -comparison;
    }

    // Сравнение дат
    if (aValue instanceof Date && bValue instanceof Date) {
      const comparison = aValue.getTime() - bValue.getTime();
      return order === "asc" ? comparison : -comparison;
    }

    // Сравнение по строковому представлению
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr, "uk");
    return order === "asc" ? comparison : -comparison;
  };
}

/**
 * Создание Next.js Response объекта с JSON
 *
 * @param data - Данные для отправки
 * @param status - HTTP статус код
 * @returns Response объект
 */
export function createNextResponse(
  data: object,
  status: number = HTTP_STATUS.OK,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Request-ID, X-API-Version",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/**
 * Утилітні функції
 */

/**
 * Генерирање уникального ID запроса для трейсирания
 *
 * @returns Уникальный ID запроса
 */
function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `req_${timestamp}_${randomStr}`;
}

/**
 * Извлечение ошибок валидации из Zod-подобного объекта
 *
 * @param error - Объект ошибки
 * @returns Массив ошибок валидации
 */
function extractValidationErrors(error: unknown): Array<{
  field: string;
  message: string;
  type?: string;
}> {
  if (!error) {
    return [
      {
        field: "unknown",
        message: "Validation failed",
        type: "unknown",
      },
    ];
  }

  // Обработка Zod ошибок
  if (
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    const issues = (error as { issues: unknown[] }).issues;
    return issues
      .map((issue: unknown) => {
        if (typeof issue === "object" && issue !== null) {
          const issueObj = issue as {
            path?: (string | number)[];
            message?: string;
            code?: string;
          };
          return {
            field: issueObj.path?.join(".") || "unknown",
            message: issueObj.message || "Validation failed",
            type: issueObj.code,
          };
        }
        return {
          field: "unknown",
          message: String(issue),
          type: "unknown",
        };
      });
  }

  // Обработка стандартной ошибки
  if (error instanceof Error) {
    return [
      {
        field: "error",
        message: error.message,
        type: "error",
      },
    ];
  }

  return [
    {
      field: "unknown",
      message: String(error),
      type: "unknown",
    },
  ];
}


// Export constants
export { HTTP_STATUS, ErrorCode };
