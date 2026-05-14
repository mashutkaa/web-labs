/**
 * API Помилки та обробка помилок
 *
 * Включає типи для всіх можливих помилок у REST API,
 * включаючи валідацію, автентифікацію, авторизацію та серверні помилки.
 */

/**
 * HTTP статус коди для REST API
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Коди помилок для попередження клієнта
 */
export enum ErrorCode {
  // Валідація (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_REQUEST = "INVALID_REQUEST",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT = "INVALID_FORMAT",
  OUT_OF_RANGE = "OUT_OF_RANGE",

  // Автентифікація (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Авторизація (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Ресурс не знайдено (404)
  NOT_FOUND = "NOT_FOUND",
  STATION_NOT_FOUND = "STATION_NOT_FOUND",
  MEASUREMENT_NOT_FOUND = "MEASUREMENT_NOT_FOUND",
  ALERT_NOT_FOUND = "ALERT_NOT_FOUND",

  // Конфлікти (409)
  CONFLICT = "CONFLICT",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",
  CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION",

  // Семантика (422)
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
  BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Серверні помилки (500+)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
}

/**
 * Інформація про поле з помилкою (для валідації)
 */
export interface FieldError {
  /** Назва поля */
  field: string;
  /** Повідомлення про помилку */
  message: string;
  /** Тип помилки (required, format, range і т.д.) */
  type?: string;
  /** Значення, яке викликало помилку */
  value?: unknown;
}

/**
 * Базова помилка API
 */
export interface ApiErrorBase {
  /** Код помилки */
  code: ErrorCode | string;
  /** Повідомлення про помилку для користувача */
  message: string;
  /** HTTP статус код */
  statusCode: number;
  /** Час помилки (ISO 8601) */
  timestamp: string;
}

/**
 * Помилка валідації з деталями полів
 */
export interface ValidationErrorResponse extends ApiErrorBase {
  code: ErrorCode.VALIDATION_ERROR;
  /** Помилки в окремих полях */
  fields: FieldError[];
}

/**
 * Помилка автентифікації
 */
export interface AuthErrorResponse extends ApiErrorBase {
  code:
    | ErrorCode.UNAUTHORIZED
    | ErrorCode.INVALID_CREDENTIALS
    | ErrorCode.TOKEN_EXPIRED
    | ErrorCode.TOKEN_INVALID;
}

/**
 * Помилка авторизації
 */
export interface ForbiddenErrorResponse extends ApiErrorBase {
  code: ErrorCode.FORBIDDEN | ErrorCode.INSUFFICIENT_PERMISSIONS;
  /** Необхідні дозволи */
  requiredPermissions?: string[];
}

/**
 * Помилка «не знайдено»
 */
export interface NotFoundErrorResponse extends ApiErrorBase {
  code:
    | ErrorCode.NOT_FOUND
    | ErrorCode.STATION_NOT_FOUND
    | ErrorCode.MEASUREMENT_NOT_FOUND;
  /** ID ресурсу, який не знайдено */
  resourceId?: string;
  /** Тип ресурсу */
  resourceType?: string;
}

/**
 * Помилка конфлікту
 */
export interface ConflictErrorResponse extends ApiErrorBase {
  code:
    | ErrorCode.CONFLICT
    | ErrorCode.DUPLICATE_ENTRY
    | ErrorCode.RESOURCE_EXISTS
    | ErrorCode.CONCURRENT_MODIFICATION;
  /** Поточний стан ресурсу (для CONCURRENT_MODIFICATION) */
  currentState?: Record<string, unknown>;
}

/**
 * Помилка rate limiting
 */
export interface RateLimitErrorResponse extends ApiErrorBase {
  code: ErrorCode.RATE_LIMIT_EXCEEDED | ErrorCode.TOO_MANY_REQUESTS;
  /** Кількість дозволених запитів за період */
  rateLimit?: number;
  /** Період у секундах */
  ratePeriodSeconds?: number;
  /** Час, коли можна буде робити запити знову (Unix timestamp) */
  retryAfter?: number;
}

/**
 * Помилка сервера
 */
export interface ServerErrorResponse extends ApiErrorBase {
  code:
    | ErrorCode.INTERNAL_SERVER_ERROR
    | ErrorCode.SERVICE_UNAVAILABLE
    | ErrorCode.DATABASE_ERROR
    | ErrorCode.EXTERNAL_SERVICE_ERROR;
  /** ID трейса для допомоги підтримці */
  traceId?: string;
  /** Відновлення можливо чи ні */
  retryable?: boolean;
}

/**
 * Union тип всіх можливих помилок API
 */
export type ApiErrorResponse =
  | ValidationErrorResponse
  | AuthErrorResponse
  | ForbiddenErrorResponse
  | NotFoundErrorResponse
  | ConflictErrorResponse
  | RateLimitErrorResponse
  | ServerErrorResponse
  | ApiErrorBase;

/**
 * Допоміжна функція для перевірки типу помилки
 */
export function isValidationError(
  error: ApiErrorResponse,
): error is ValidationErrorResponse {
  return error.code === ErrorCode.VALIDATION_ERROR && "fields" in error;
}

export function isAuthError(
  error: ApiErrorResponse,
): error is AuthErrorResponse {
  return (
    error.code === ErrorCode.UNAUTHORIZED ||
    error.code === ErrorCode.INVALID_CREDENTIALS ||
    error.code === ErrorCode.TOKEN_EXPIRED ||
    error.code === ErrorCode.TOKEN_INVALID
  );
}

export function isForbiddenError(
  error: ApiErrorResponse,
): error is ForbiddenErrorResponse {
  return (
    error.code === ErrorCode.FORBIDDEN ||
    error.code === ErrorCode.INSUFFICIENT_PERMISSIONS
  );
}

export function isNotFoundError(
  error: ApiErrorResponse,
): error is NotFoundErrorResponse {
  return error.statusCode === 404;
}

export function isServerError(
  error: ApiErrorResponse,
): error is ServerErrorResponse {
  return error.statusCode >= 500;
}

export function isRateLimitError(
  error: ApiErrorResponse,
): error is RateLimitErrorResponse {
  return (
    error.code === ErrorCode.RATE_LIMIT_EXCEEDED ||
    error.code === ErrorCode.TOO_MANY_REQUESTS ||
    error.statusCode === 429
  );
}
