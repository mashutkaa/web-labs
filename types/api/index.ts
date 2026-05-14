/**
 * API типи - Re-exports всіх типів для зручності
 *
 * Замість import { X } from "./error"; import { Y } from "./request";
 * можна просто import { X, Y } from "./api";
 */

// ==================== Помилки ====================
export {
  HTTP_STATUS,
  ErrorCode,
  type FieldError,
  type ApiErrorBase,
  type ValidationErrorResponse,
  type AuthErrorResponse,
  type ForbiddenErrorResponse,
  type NotFoundErrorResponse,
  type ConflictErrorResponse,
  type RateLimitErrorResponse,
  type ServerErrorResponse,
  type ApiErrorResponse,
  isValidationError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isServerError,
  isRateLimitError,
} from "./error";

// ==================== Запити ====================
export {
  type HttpMethod,
  type RequestHeaders,
  type ApiRequest,
  type GetStationsQuery,
  type CreateStationRequest,
  type UpdateStationRequest,
  type GetMeasurementsQuery,
  type CreateMeasurementRequest,
  type GetAlertsQuery,
  type CreateAlertRequest,
  type UpdateAlertRequest,
  type ExportDataRequest,
  type GenerateReportRequest,
  type HealthCheckRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  type RegisterRequest,
  type SearchRequest,
  type BatchRequest,
  type BatchResponse,
} from "./request";

// ==================== Відповіді ====================
export {
  type SuccessResponse,
  type ErrorResponse,
  type ApiResponse,
  type CreatedResponse,
  type UpdatedResponse,
  type DeletedResponse,
  type PaginationMeta,
  type PaginatedResponse,
  type StationsListResponse,
  type StationDetailsResponse,
  type CreateStationResponse,
  type UpdateStationResponse,
  type DeleteStationResponse,
  type MeasurementsListResponse,
  type MeasurementDetailsResponse,
  type CreateMeasurementResponse,
  type TimeSeriesResponse,
  type TimeSeriesDataResponse,
  type HealthAlert,
  type AlertsListResponse,
  type AlertDetailsResponse,
  type CreateAlertResponse,
  type HealthCheckResponse,
  type HealthCheckDataResponse,
  type PlatformStatistics,
  type StatisticsResponse,
  type SearchResults,
  type SearchResponse,
  type LoginResponse,
  type LoginDataResponse,
  type RefreshTokenResponse,
  type RefreshTokenDataResponse,
  type ExportResponse,
  type ExportDataResponse,
  type ReportResponse,
  type GenerateReportDataResponse,
  type MessageResponse,
  type MessageDataResponse,
} from "./response";

// ==================== Ендпоінти ====================
export { HttpStatus, type ApiClient, type RouteMethod } from "./endpoints";

// ==================== Переексport із старого api.ts для сумісності ====================
export {
  type StationFilters,
  type PaginationParams,
  type TimeSeriesQueryParams,
  type ExportParams,
  type AlertQuery,
  type PageResponse,
  type CacheMetadata,
} from "../api";
