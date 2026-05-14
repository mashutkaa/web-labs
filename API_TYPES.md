# API Типи системи

Комплексна система типів для REST API, включаючи запити, відповіді та обробку помилок.

## Структура файлів

```
types/api/
├── error.ts          # Типи помилок та HTTP статус коди
├── request.ts        # Типи запитів до сервера
├── response.ts       # Типи відповідей від сервера
├── endpoints.ts      # Типи для ендпоінтів та API клієнта
└── index.ts          # Re-exports всіх типів
```

## 1. Помилки (error.ts)

### HTTP Статус Коди

```typescript
HTTP_STATUS = {
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
};
```

### Коди Помилок (ErrorCode Enum)

```typescript
enum ErrorCode {
  // Валідація (400)
  VALIDATION_ERROR = "VALIDATION_ERROR"
  INVALID_REQUEST = "INVALID_REQUEST"
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
  INVALID_FORMAT = "INVALID_FORMAT"
  OUT_OF_RANGE = "OUT_OF_RANGE"

  // Автентифікація (401)
  UNAUTHORIZED = "UNAUTHORIZED"
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
  TOKEN_EXPIRED = "TOKEN_EXPIRED"
  TOKEN_INVALID = "TOKEN_INVALID"

  // Авторизація (403)
  FORBIDDEN = "FORBIDDEN"
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"

  // Ресурс не знайдено (404)
  NOT_FOUND = "NOT_FOUND"
  STATION_NOT_FOUND = "STATION_NOT_FOUND"
  MEASUREMENT_NOT_FOUND = "MEASUREMENT_NOT_FOUND"

  // Конфлікти (409)
  CONFLICT = "CONFLICT"
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY"
  RESOURCE_EXISTS = "RESOURCE_EXISTS"

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"

  // Серверні помилки (500+)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
  DATABASE_ERROR = "DATABASE_ERROR"
}
```

### Типи Помилок

#### ValidationErrorResponse - Помилка валідації (400)

```typescript
interface ValidationErrorResponse extends ApiErrorBase {
  code: ErrorCode.VALIDATION_ERROR;
  fields: FieldError[]; // Помилки в кожному полі
}

interface FieldError {
  field: string; // Назва поля
  message: string; // Повідомлення про помилку
  type?: string; // Тип (required, format, range)
  value?: unknown; // Значення, що викликало помилку
}
```

**Приклад:**

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Помилка валідації даних",
  "statusCode": 400,
  "timestamp": "2024-05-14T12:00:00Z",
  "fields": [
    {
      "field": "email",
      "message": "Невірний формат email",
      "type": "format"
    },
    {
      "field": "password",
      "message": "Пароль повинен бути мінімум 8 символів",
      "type": "range"
    }
  ]
}
```

#### AuthErrorResponse - Помилка автентифікації (401)

```typescript
interface AuthErrorResponse extends ApiErrorBase {
  code: ErrorCode.UNAUTHORIZED | ErrorCode.TOKEN_EXPIRED;
}
```

#### ForbiddenErrorResponse - Помилка авторизації (403)

```typescript
interface ForbiddenErrorResponse extends ApiErrorBase {
  code: ErrorCode.FORBIDDEN;
  requiredPermissions?: string[]; // Необхідні дозволи
}
```

#### NotFoundErrorResponse - Ресурс не знайдено (404)

```typescript
interface NotFoundErrorResponse extends ApiErrorBase {
  code: ErrorCode.NOT_FOUND;
  resourceId?: string; // ID ресурсу
  resourceType?: string; // Тип ресурсу
}
```

#### RateLimitErrorResponse - Rate limiting (429)

```typescript
interface RateLimitErrorResponse extends ApiErrorBase {
  code: ErrorCode.RATE_LIMIT_EXCEEDED;
  rateLimit?: number; // Дозволено запитів
  ratePeriodSeconds?: number; // За період (сек)
  retryAfter?: number; // Коли повторити (Unix timestamp)
}
```

#### ServerErrorResponse - Помилка сервера (500+)

```typescript
interface ServerErrorResponse extends ApiErrorBase {
  code: ErrorCode.INTERNAL_SERVER_ERROR;
  traceId?: string; // ID для трейсування
  retryable?: boolean;
}
```

### Допоміжні функції

```typescript
// Перевірка типу помилки
isValidationError(error: ApiErrorResponse): error is ValidationErrorResponse
isAuthError(error: ApiErrorResponse): error is AuthErrorResponse
isForbiddenError(error: ApiErrorResponse): error is ForbiddenErrorResponse
isNotFoundError(error: ApiErrorResponse): error is NotFoundErrorResponse
isServerError(error: ApiErrorResponse): error is ServerErrorResponse
isRateLimitError(error: ApiErrorResponse): error is RateLimitErrorResponse
```

## 2. Запити (request.ts)

### HTTP методи

```typescript
type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";
```

### Request Headers

```typescript
interface RequestHeaders {
  "content-type"?: "application/json" | "multipart/form-data";
  authorization?: string;
  "accept-language"?: string;
  "user-agent"?: string;
  "x-request-id"?: string;
  "x-api-version"?: string;
}
```

### Базовий запит

```typescript
interface ApiRequest<T = unknown> {
  method: HttpMethod;
  endpoint: string;
  body?: T; // POST/PUT/PATCH
  query?: Record<string, string | number>; // GET параметри
  headers?: RequestHeaders;
  timeout?: number;
  cache?: boolean;
  retry?: boolean;
}
```

### Запити до станцій

#### GET /stations - Список станцій

```typescript
interface GetStationsQuery extends PaginationParams {
  search?: string; // Текстовий пошук
  type?: StationType; // Фільтр за типом
  region?: string; // Фільтр за регіоном
  isActive?: boolean; // Активні станції
  minAqi?: number; // Мінімальний AQI
  maxAqi?: number; // Максимальний AQI
}
```

#### POST /stations - Створити станцію

```typescript
interface CreateStationRequest {
  name: string; // Обов'язково
  description?: string;
  type: StationType; // Обов'язково
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
}
```

#### PUT /stations/:id - Оновити станцію

```typescript
interface UpdateStationRequest extends Partial<CreateStationRequest> {
  id: string;
}
```

### Запити до вимірювань

#### GET /measurements - Список вимірювань

```typescript
interface GetMeasurementsQuery extends PaginationParams {
  stationId?: string;
  pollutant?: Pollutant;
  startDate?: string;
  endDate?: string;
  minAqi?: number;
  maxAqi?: number;
  status?: string;
}
```

#### POST /measurements - Нове вимірювання

```typescript
interface CreateMeasurementRequest {
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
  };
}
```

### Запити до сповіщень

#### GET /alerts - Список сповіщень

```typescript
interface GetAlertsQuery extends PaginationParams {
  minLevel?: string;
  activeOnly?: boolean;
  stationId?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
}
```

#### POST /alerts - Створити сповіщення

```typescript
interface CreateAlertRequest {
  stationId: string;
  level: string;
  pollutants: Pollutant[];
  message: string;
  startDate: string;
  endDate?: string;
  notifyRegions?: string[];
  recommendations?: string[];
}
```

### Експорт та звіти

```typescript
interface ExportDataRequest {
  stationIds?: string[];
  startDate: string;
  endDate: string;
  format: "csv" | "json" | "xlsx" | "pdf";
  pollutants?: Pollutant[];
  includeStatistics?: boolean;
}

interface GenerateReportRequest {
  type: "daily" | "weekly" | "monthly" | "annual" | "custom";
  stationIds?: string[];
  startDate: string;
  endDate: string;
  metrics: Array<"aqi" | "pollutants" | "health" | "trends">;
  language?: "uk" | "en";
}
```

### Аутентифікація

```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organization?: string;
}
```

## 3. Відповіді (response.ts)

### Успішна відповідь

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  statusCode: number; // 200-299
  timestamp: string; // ISO 8601
  version?: string;
  metadata?: {
    requestId?: string;
    processingTime?: number; // мс
    cached?: boolean;
    cacheTtl?: number; // сек
  };
}
```

### Помилка відповідь

```typescript
interface ErrorResponse {
  success: false;
  error: ApiErrorResponse;
  version?: string;
}
```

### Загальний тип

```typescript
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
```

### Спеціальні типи

```typescript
interface CreatedResponse<T> extends SuccessResponse<T> {
  statusCode: 201;
  location?: string; // URL нового ресурсу
}

interface UpdatedResponse extends SuccessResponse<null> {
  statusCode: 204;
  data: null;
}

interface DeletedResponse extends SuccessResponse<null> {
  statusCode: 204;
  data: null;
}
```

### Пагінована відповідь

```typescript
interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
  links?: {
    first?: string;
    last?: string;
    next?: string;
    previous?: string;
    self: string;
  };
}
```

### Примеры відповідей

#### Успішна відповідь (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "s_kyiv_center",
    "name": "Київ Центр",
    "type": "Міська",
    "coordinates": {
      "lat": 50.4501,
      "lng": 30.5234,
      "altitude": 100
    }
  },
  "statusCode": 200,
  "timestamp": "2024-05-14T12:00:00Z",
  "version": "1.0.0",
  "metadata": {
    "requestId": "req_abc123",
    "processingTime": 45,
    "cached": false
  }
}
```

#### Помилка валідації (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Помилка валідації даних",
    "statusCode": 400,
    "timestamp": "2024-05-14T12:00:00Z",
    "fields": [
      {
        "field": "email",
        "message": "Невірний формат email",
        "type": "format"
      }
    ]
  }
}
```

#### Пагінована відповідь (200 OK)

```json
{
  "success": true,
  "data": [
    { "id": "s1", "name": "Станція 1" },
    { "id": "s2", "name": "Станція 2" }
  ],
  "statusCode": 200,
  "timestamp": "2024-05-14T12:00:00Z",
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "sortBy": "name",
    "sortOrder": "asc"
  },
  "links": {
    "first": "/api/stations?page=1",
    "last": "/api/stations?page=10",
    "next": "/api/stations?page=2",
    "self": "/api/stations?page=1"
  }
}
```

## 4. Ендпоінти (endpoints.ts)

### API Клієнт інтерфейс

```typescript
interface ApiClient {
  // Здоров'я
  healthCheck(): Promise<ApiResponse<{ status: string }>>;
  getStatistics(): Promise<ApiResponse<Record<string, unknown>>>;

  // Станції
  getStations(query?: Record<string, unknown>): Promise<StationsListResponse>;
  createStation(data: Record<string, unknown>): Promise<CreateStationResponse>;
  getStation(id: string): Promise<StationDetailsResponse>;
  updateStation(
    id: string,
    data: Record<string, unknown>,
  ): Promise<UpdateStationResponse>;
  deleteStation(id: string): Promise<DeleteStationResponse>;

  // Вимірювання
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

  // Сповіщення
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

  // Експорт
  exportData(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ downloadUrl: string }>>;
  generateReport(
    data: Record<string, unknown>,
  ): Promise<ApiResponse<{ reportId: string }>>;

  // Пошук
  search(query: Record<string, unknown>): Promise<ApiResponse<unknown[]>>;

  // Аутентифікація
  login(
    email: string,
    password: string,
  ): Promise<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>
  >;
  register(data: Record<string, unknown>): Promise<ApiResponse<{ id: string }>>;
  refreshToken(token: string): Promise<ApiResponse<{ accessToken: string }>>;
  logout(): Promise<ApiResponse<null>>;
}
```

### HTTP Статус Коди

```typescript
enum HttpStatus {
  OK = 200
  CREATED = 201
  ACCEPTED = 202
  NO_CONTENT = 204
  BAD_REQUEST = 400
  UNAUTHORIZED = 401
  FORBIDDEN = 403
  NOT_FOUND = 404
  CONFLICT = 409
  UNPROCESSABLE_ENTITY = 422
  TOO_MANY_REQUESTS = 429
  INTERNAL_SERVER_ERROR = 500
  SERVICE_UNAVAILABLE = 503
  GATEWAY_TIMEOUT = 504
}
```

## Приклади використання

### Обробка успішної відповіді

```typescript
const response = await client.getStations();

if (response.success) {
  // TypeScript знає, що response.data є масивом
  console.log(response.data.length);
  console.log(response.pagination.total);
} else {
  // TypeScript знає, що response.error є ApiErrorResponse
  console.error(response.error.message);
}
```

### Обробка помилок

```typescript
const response = await client.createStation(data);

if (!response.success) {
  const error = response.error;

  if (isValidationError(error)) {
    error.fields.forEach((field) => {
      console.log(`${field.field}: ${field.message}`);
    });
  } else if (isAuthError(error)) {
    // Потрібна автентифікація
    redirectToLogin();
  } else if (isRateLimitError(error)) {
    // Чекати перед повторною спробою
    await wait(error.retryAfter * 1000);
  } else if (isServerError(error)) {
    // Помилка сервера
    showErrorNotification(error.message);
  }
}
```

### Реалізація API клієнта

```typescript
class EcologyApiClient implements ApiClient {
  constructor(
    private baseUrl: string,
    private token?: string,
  ) {}

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    options?: { body?: unknown; query?: Record<string, unknown> },
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (options?.query) {
      Object.entries(options.query).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    return response.json();
  }

  async getStations(query?: Record<string, unknown>) {
    return this.request("GET", "/stations", { query });
  }

  async createStation(data: Record<string, unknown>) {
    return this.request("POST", "/stations", { body: data });
  }

  // ... інші методи
}
```

## Хорошие практики

1. **Завжди перевіряйте `success`** перед доступом до даних
2. **Використовуйте type guards** для специфічних типів помилок
3. **Обробляйте 429 статус** з `retryAfter` для rate limiting
4. **Перевіряйте `requestId`** для трейсування помилок
5. **Кешуйте відповіді** на основі `cacheTtl` метаданих

## Сумісність

Цей тип системи повністю сумісна з:

- RESTful API
- GraphQL (з адаптацією)
- WebSocket (для real-time)
- gRPC (з трансформацією)

---

**Останнє оновлення:** Май 2024  
**Версія:** 1.0.0  
**Статус:** ✅ Готово
