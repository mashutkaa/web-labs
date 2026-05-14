# API документація — Моніторинг якості повітря

Повна документація REST API для системи моніторингу якості повітря в Україні.

## 📋 Огляд

API побудований на Next.js 16 з App Router та забезпечує повний CRUD функціонал для управління станціями моніторингу та вимірюваннями якості повітря.

**Base URL:** `http://localhost:3000/api` (розробка) або `https://your-domain.com/api` (production)

## 🔐 Аутентифікація

На цей момент API не вимагає аутентифікації. В production слід додати API keys або JWT токени.

## 📡 Endpoints

### Health Check

#### `GET /api/health`

Перевіряє статус API сервера.

**Query Parameters:** Нема

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-05-14T09:01:31.763Z",
  "version": "0.1.0",
  "uptime": 12345,
  "environment": "development"
}
```

---

### Станції моніторингу

#### `GET /api/stations`

Повертає список всіх моніторингових станцій з пагінацією та фільтруванням.

**Query Parameters:**

- `page` (number, default: 1) — номер сторінки
- `limit` (number, default: 10, max: 100) — кількість записів на сторінці
- `sort` (enum: "name", "date", "aqi", default: "name") — поле для сортування
- `order` (enum: "asc", "desc", default: "asc") — порядок сортування
- `search` (string, optional) — пошук по імені або місту
- `city` (string, optional) — фільтр по місту
- `type` (string, optional) — фільтр по типу станції (urban, suburban, rural, industrial)
- `startDate` (date, optional) — фільтр по дате з
- `endDate` (date, optional) — фільтр по дате до

**Example Request:**

```bash
curl "http://localhost:3000/api/stations?page=1&limit=5&sort=aqi&order=desc"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "st-kyiv-001",
      "name": "Станція Хрещатик",
      "city": "Київ",
      "country": "Україна",
      "coordinates": {
        "lat": 50.4501,
        "lng": 30.5234,
        "altitude": 116
      },
      "type": "Міська",
      "status": "Активна",
      "isActive": true,
      "currentAqi": {
        "aqi": 216,
        "level": "Дуже шкідливо",
        "readings": [...]
      },
      "equipment": {...},
      "contactPerson": "Іван Петренко",
      "contactEmail": "ivan.petrenko@eco.ua"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 6,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### `POST /api/stations`

Створює нову станцію моніторингу.

**Request Body:**

```json
{
  "name": "Нова станція",
  "city": "Київ",
  "country": "Україна",
  "coordinates": {
    "latitude": 50.45,
    "longitude": 30.52
  },
  "elevation": 116,
  "type": "urban"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "st-new-001",
    "name": "Нова станція",
    "city": "Київ",
    ...
  }
}
```

**Errors:**

- `400` — невалідні параметри
- `409` — станція з такою назвою вже існує

---

#### `GET /api/stations/[id]`

Повертає деталі конкретної станції з останніми вимірюваннями.

**Path Parameters:**

- `id` (string) — ID станції

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "st-kyiv-001",
    "name": "Станція Хрещатик",
    "city": "Київ",
    "currentAqi": {...},
    "recentMeasurements": [
      {
        "timestamp": "2026-05-14T09:00:00Z",
        "aqi": 216,
        "readings": [...]
      }
    ]
  }
}
```

**Errors:**

- `404` — станція не знайдена

---

#### `PUT /api/stations/[id]`

Оновлює інформацію про станцію.

**Request Body:**

```json
{
  "name": "Оновлена назва",
  "city": "Львів",
  "type": "suburban"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "st-kyiv-001",
    "name": "Оновлена назва",
    "city": "Львів",
    ...
  }
}
```

**Errors:**

- `400` — невалідні параметри
- `404` — станція не знайдена
- `409` — конфлікт (дубліката)

---

#### `DELETE /api/stations/[id]`

Видаляє станцію та всі пов'язані вимірювання.

**Response (200):**

```json
{
  "success": true,
  "message": "Station deleted successfully"
}
```

**Errors:**

- `404` — станція не знайдена

---

### Вимірювання

#### `GET /api/measurements`

Повертає вимірювання для конкретної станції.

**Query Parameters:**

- `stationId` (string, required) — ID станції
- `page` (number, default: 1) — номер сторінки
- `limit` (number, default: 20, max: 100) — записів на сторінці
- `startDate` (date, optional) — фільтр з дати (ISO 8601)
- `endDate` (date, optional) — фільтр по дату (ISO 8601)
- `sort` (enum: "timestamp", "aqi", default: "timestamp")
- `order` (enum: "asc", "desc", default: "desc")

**Example Request:**

```bash
curl "http://localhost:3000/api/measurements?stationId=st-kyiv-001&days=7&page=1&limit=10"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "meas-001",
      "stationId": "st-kyiv-001",
      "timestamp": "2026-05-14T09:00:00Z",
      "aqi": 216,
      "readings": [
        {
          "pollutant": "PM2.5",
          "value": 65.988,
          "unit": "µg/m³",
          "limit": 35
        }
      ],
      "meteorological": {
        "temperature": 20.5,
        "humidity": 65,
        "windSpeed": 5.2,
        "windDirection": 220,
        "pressure": 1013.25,
        "visibility": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 720,
    "totalPages": 72
  }
}
```

**Errors:**

- `400` — невалідні параметри
- `404` — станція не знайдена

---

#### `POST /api/measurements`

Додає нове вимірювання для станції.

**Request Body:**

```json
{
  "stationId": "st-kyiv-001",
  "timestamp": "2026-05-14T10:00:00Z",
  "readings": [
    {
      "pollutant": "PM2.5",
      "value": 45.5,
      "unit": "µg/m³",
      "limit": 35
    },
    {
      "pollutant": "PM10",
      "value": 60.0,
      "unit": "µg/m³",
      "limit": 50
    }
  ],
  "temperature": 20.5,
  "humidity": 65,
  "windSpeed": 5.2
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "meas-new-001",
    "stationId": "st-kyiv-001",
    "timestamp": "2026-05-14T10:00:00Z",
    "aqi": 128,
    ...
  }
}
```

**Errors:**

- `400` — невалідні параметри
- `404` — станція не знайдена

---

#### `GET /api/measurements/[id]`

Повертає деталі конкретного вимірювання.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "meas-001",
    "stationId": "st-kyiv-001",
    "timestamp": "2026-05-14T09:00:00Z",
    "aqi": 216,
    "readings": [...],
    "meteorological": {...}
  }
}
```

**Errors:**

- `404` — вимірювання не знайдено

---

#### `GET /api/measurements/[id]/timeseries`

Повертає часовий ряд для станції за певну кількість днів.

**Query Parameters:**

- `stationId` (string, required) — ID станції
- `days` (number, default: 7, max: 30) — кількість днів історії
- `pollutant` (string, optional) — фільтр по окремому забруднювачу

**Example Request:**

```bash
curl "http://localhost:3000/api/measurements/meas-001/timeseries?stationId=st-kyiv-001&days=7&pollutant=PM2.5"
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-05-07T09:00:00Z",
      "aqi": 180,
      "readings": [
        {
          "pollutant": "PM2.5",
          "value": 55.2,
          "unit": "µg/m³"
        }
      ]
    },
    {
      "timestamp": "2026-05-08T09:00:00Z",
      "aqi": 195,
      "readings": [...]
    }
  ],
  "period": {
    "startDate": "2026-05-07T00:00:00Z",
    "endDate": "2026-05-14T00:00:00Z",
    "days": 7
  }
}
```

**Errors:**

- `400` — невалідні параметри
- `404` — станція не знайдена

---

## 🔴 Обробка помилок

Усі помилки повертаються у форматі:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "statusCode": 400,
    "timestamp": "2026-05-14T09:01:31.763Z",
    "fields": [
      {
        "field": "page",
        "message": "Page must be at least 1",
        "type": "invalid_type"
      }
    ]
  }
}
```

### Коди помилок

| Код                      | Статус | Опис                             |
| ------------------------ | ------ | -------------------------------- |
| `VALIDATION_ERROR`       | 400    | Невалідні параметри запиту       |
| `STATION_NOT_FOUND`      | 404    | Станція не знайдена              |
| `MEASUREMENT_NOT_FOUND`  | 404    | Вимірювання не знайдено          |
| `STATION_ALREADY_EXISTS` | 409    | Станція з такою назвою вже існує |
| `INVALID_STATION_ID`     | 400    | Невалідний ID станції            |
| `INTERNAL_SERVER_ERROR`  | 500    | Внутрішня помилка сервера        |

---

## 📊 Типи даних

### Забруднювачі (Pollutant)

- `PM2.5` — Дрібні частинки (< 2.5 мкм)
- `PM10` — Дрібні частинки (< 10 мкм)
- `NO2` — Діоксид азоту
- `O3` — Озон
- `SO2` — Діоксид сірки
- `CO` — Монооксид вуглецю

### Типи станцій (StationType)

- `urban` — Міська
- `suburban` — Приміська
- `rural` — Сільська
- `industrial` — Промислова

### AQI Рівні

| Діапазон | Рівень                   | Вплив на здоров'я  |
| -------- | ------------------------ | ------------------ |
| 0-50     | 🟢 Добре                 | Немає              |
| 51-100   | 🟡 Задовільно            | Мінімальний        |
| 101-150  | 🟠 Шкідливо для чутливих | Чутливі групи      |
| 151-200  | 🔴 Шкідливо              | Загальне населення |
| 201-300  | 🟣 Дуже шкідливо         | Серйозні проблеми  |
| 301+     | ⚫ Небезпечно            | Екстрені заходи    |

---

## 💡 Приклади використання

### JavaScript/TypeScript

```javascript
// Отримання списку станцій
const response = await fetch("/api/stations?page=1&limit=10");
const { data, pagination } = await response.json();

// Отримання вимірювань для станції
const measurements = await fetch(
  "/api/measurements?stationId=st-kyiv-001&days=7",
);

// Створення нової станції
const newStation = await fetch("/api/stations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Нова станція",
    city: "Львів",
    country: "Україна",
    coordinates: { latitude: 49.84, longitude: 24.03 },
    type: "urban",
  }),
});

// Добавлення вимірювання
const measurement = await fetch("/api/measurements", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stationId: "st-kyiv-001",
    timestamp: new Date().toISOString(),
    readings: [{ pollutant: "PM2.5", value: 45.5, unit: "µg/m³", limit: 35 }],
    temperature: 20.5,
    humidity: 65,
    windSpeed: 5.2,
  }),
});
```

### cURL

```bash
# Отримання станцій
curl "http://localhost:3000/api/stations?page=1&limit=5"

# Отримання деталей станції
curl "http://localhost:3000/api/stations/st-kyiv-001"

# Отримання вимірювань
curl "http://localhost:3000/api/measurements?stationId=st-kyiv-001"

# Отримання часового ряду
curl "http://localhost:3000/api/measurements/meas-001/timeseries?stationId=st-kyiv-001&days=7"

# Створення станції
curl -X POST http://localhost:3000/api/stations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Нова станція",
    "city": "Київ",
    "country": "Україна",
    "coordinates": {"latitude": 50.45, "longitude": 30.52},
    "type": "urban"
  }'

# Добавлення вимірювання
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "st-kyiv-001",
    "timestamp": "2026-05-14T10:00:00Z",
    "readings": [
      {"pollutant": "PM2.5", "value": 45.5, "unit": "µg/m³", "limit": 35}
    ],
    "temperature": 20.5,
    "humidity": 65,
    "windSpeed": 5.2
  }'

# Оновлення станції
curl -X PUT http://localhost:3000/api/stations/st-kyiv-001 \
  -H "Content-Type: application/json" \
  -d '{"name": "Оновлена назва"}'

# Видалення станції
curl -X DELETE http://localhost:3000/api/stations/st-kyiv-001
```

---

## 🚀 Performance

- **Пагінація:** підтримує до 100 записів на сторінці
- **Кешування:** відповіді кешуються браузером (30 секунд)
- **Сортування:** O(n log n) для оптимальної продуктивності
- **Фільтрування:** індексовані за основними полями

---

## 📝 Версіонування

API версія: **0.1.0**

Для майбутніх змін буде використовуватися URL вersion: `/api/v2/stations`

---

## 📞 Підтримка

Для питань та звітів про помилки, будь ласка, зв'яжіться з командою розробки.
