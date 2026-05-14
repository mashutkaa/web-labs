# API Обработчики (handlers.ts)

Утилиты для обработки API запросов и ответов в Next.js приложении.

## Функции

### createSuccessResponse<T>(data: T, pagination?: Pagination)

Создает успешный ответ API с опциональной пагинацией.

```typescript
// Без пагинации
const response = createSuccessResponse({ id: "1", name: "Test" });

// С пагинацией
const paginatedResponse = createSuccessResponse(
  [{ id: "1" }, { id: "2" }],
  {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNextPage: true,
    hasPreviousPage: false,
  }
);
```

### createErrorResponse(error: ApiError | string, statusCode?: number)

Создает ошибочный ответ API.

```typescript
// Из строки
const errorResp = createErrorResponse("Invalid data", 400);

// Из объекта ошибки
const errorResp = createErrorResponse({
  code: ErrorCode.VALIDATION_ERROR,
  message: "Email is invalid",
  statusCode: 400,
  timestamp: new Date().toISOString(),
  fields: [{ field: "email", message: "Invalid format" }],
});
```

### paginateData<T>(items: T[], page: number, limit: number)

Разбивает данные на страницы с расчетом смещения.

```typescript
const items = Array.from({ length: 150 }, (_, i) => ({ id: i }));
const result = paginateData(items, 2, 10);
// result.data содержит элементы 10-19
// result.pagination имеет информацию о пагинации
```

### filterAndSort<T>(items: T[], filterFn?, sortFn?)

Фильтрует и сортирует данные.

```typescript
const items = [
  { name: "Charlie", age: 30 },
  { name: "Alice", age: 25 },
];

const result = filterAndSort(
  items,
  (item) => item.age > 24,
  buildSortComparator("name", "asc")
);
```

### handleApiError(error: unknown)

Преобразует любую ошибку в стандартный формат ApiError.

```typescript
try {
  // некоторый код
} catch (error) {
  const apiError = handleApiError(error);
  return createNextResponse(createErrorResponse(apiError), apiError.statusCode);
}
```

### validateRequest<T>(schema, data)

Валидирует данные по Zod-подобной схеме.

```typescript
const result = validateRequest(myZodSchema, userData);
if (result.valid) {
  console.log(result.data);
} else {
  console.log(result.errors);
}
```

### buildFilterQuery(params: QueryParams)

Строит объект фильтра из параметров запроса.

```typescript
const filter = buildFilterQuery({
  search: "kyiv",
  city: "Kyiv",
  type: "urban",
  dateRange: {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
  },
});
```

### buildSortComparator<T>(sortField?, order?)

Создает функцию компаратора для сортировки.

```typescript
const comparator = buildSortComparator("name", "asc");
const sorted = items.sort(comparator);
```

### createNextResponse(data: object, status: number)

Создает Next.js Response объект с JSON.

```typescript
export async function GET() {
  const response = createSuccessResponse({ message: "OK" });
  return createNextResponse(response, 200);
}
```

## Типы

### Pagination

```typescript
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

### ApiError

```typescript
interface ApiError {
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
}
```

### QueryParams

```typescript
interface QueryParams {
  search?: string;
  city?: string;
  type?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  [key: string]: unknown;
}
```

## Пример использования в Route Handler

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  createNextResponse,
  paginateData,
  handleApiError,
  HTTP_STATUS,
} from "@/lib/api/handlers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const data = await fetchData();
    const paginated = paginateData(data, page, limit);
    const response = createSuccessResponse(paginated.data, paginated.pagination);

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    const apiError = handleApiError(error);
    const errorResp = createErrorResponse(apiError);
    return createNextResponse(errorResp, apiError.statusCode);
  }
}
```

## Экспорты

Все функции экспортируются как named exports:
- `createSuccessResponse`
- `createErrorResponse`
- `paginateData`
- `filterAndSort`
- `handleApiError`
- `validateRequest`
- `buildFilterQuery`
- `buildSortComparator`
- `createNextResponse`
- `HTTP_STATUS` (константы)
- `ErrorCode` (enum)

## Типы

- `Pagination`
- `ApiError`
- `QueryParams`
- `ValidationResult`
- `PaginatedResult`
- `FilteredResult`
