# Типізація екологічних даних

Проєкт використовує комплексну систему типів для опису екологічних показників, моніторингових станцій та вимірювань якості повітря.

## Структура типів

### 1. `types/air-quality.ts` - Якість повітря

Визначає забруднювачі повітря та рівні якості.

#### Enum: `Pollutant`

- `PM2.5` - Дрібнодисперсні частинки
- `PM10` - Грубодисперсні частинки
- `NO2` - Діоксид азоту
- `SO2` - Діоксид сірки
- `CO` - Чадний газ
- `O3` - Озон

#### Enum: `AirQualityIndex`

Шкала якості повітря від ВОЗ:

- `Good` - Добре (0-50)
- `Moderate` - Помірно (51-100)
- `UnhealthySensitive` - Шкідливо для чутливих груп (101-150)
- `Unhealthy` - Шкідливо (151-200)
- `VeryUnhealthy` - Дуже шкідливо (201-300)
- `Hazardous` - Небезпечно (301+)

#### Interface: `PollutantReading`

```typescript
interface PollutantReading {
  pollutant: Pollutant; // Тип забруднювача
  value: number; // Концентрація
  unit: string; // Одиниця вимірювання
  limit: number; // Нормативна межа
  percentOfLimit?: number; // % від норми
  measuredAt?: string; // Час вимірювання
}
```

#### Interface: `AirQualityData`

```typescript
interface AirQualityData {
  aqi: number; // Індекс якості (0-500+)
  level: AirQualityIndex; // Рівень якості
  readings: PollutantReading[]; // Вимірювання
  dominantPollutant: Pollutant; // Основний забруднювач
  calculatedAt?: string; // Час розрахунку
  dataSource?: string; // Джерело даних
}
```

#### Константи

- `WHO_LIMITS` - Межі ВОЗ для кожного забруднювача
- `POLLUTANT_INFO` - Детальна інформація про забруднювачі

#### Функції

- `determineAqiLevel(aqi: number)` - Визначити рівень за числовим значенням
- `calculatePercentOfLimit(value, pollutant)` - Розрахувати відсоток від ліміту

---

### 2. `types/station.ts` - Моніторингова станція

Описує станції екологічного моніторингу.

#### Enum: `StationType`

- `Urban` - Міська
- `Suburban` - Приміська
- `Rural` - Сільська
- `Industrial` - Промислова
- `Traffic` - Транспортна

#### Enum: `StationStatus`

- `Active` - Активна
- `Inactive` - Неактивна
- `Maintenance` - На обслуговуванні
- `Offline` - Офлайн
- `Error` - Помилка

#### Interface: `Coordinates`

```typescript
interface Coordinates {
  lat: number; // Широта
  lng: number; // Довгота
  altitude?: number; // Висота над рівнем моря
}
```

#### Interface: `EquipmentInfo`

```typescript
interface EquipmentInfo {
  model: string; // Модель приладу
  manufacturer: string; // Виробник
  installedDate: string; // Дата встановлення
  lastCalibration?: string; // Дата останної калібрації
  nextCalibration?: string; // Дата наступної калібрації
  softwareVersion?: string; // Версія ПО
}
```

#### Interface: `StationStatistics`

```typescript
interface StationStatistics {
  dataAvailability: number; // % доступних даних
  operationStartDate: string; // Дата початку роботи
  totalMeasurements: number; // Кількість вимірювань
  averageAqi?: number; // Середній AQI
  maxAqi?: number; // Максимальний AQI
  minAqi?: number; // Мінімальний AQI
}
```

#### Interface: `MonitoringStation`

```typescript
interface MonitoringStation {
  id: string; // Ідентифікатор
  name: string; // Назва
  city: string; // Місто
  region?: Region; // Регіон
  coordinates: Coordinates; // Географія
  type: StationType; // Тип станції
  status?: StationStatus; // Статус
  isActive: boolean; // Активна?
  installedDate: string; // Дата встановлення
  lastUpdate: string; // Останнє оновлення
  currentAqi?: AirQualityData; // Поточні дані
  equipment?: EquipmentInfo; // Обладнання
  statistics?: StationStatistics; // Статистика
  contactPerson?: string; // Контактна особа
  contactEmail?: string; // Email
  contactPhone?: string; // Телефон
  notes?: string; // Примітки
}
```

---

### 3. `types/measurement.ts` - Вимірювання

Описує вимірювання та часові ряди.

#### Enum: `MeasurementStatus`

- `Valid` - Коректне
- `Suspicious` - Підозріле
- `Invalid` - Некоректне
- `Estimated` - Оцінене

#### Interface: `TimeSeriesPoint`

```typescript
interface TimeSeriesPoint {
  timestamp: string; // Час вимірювання
  value: number; // Значення
  status?: MeasurementStatus; // Статус
  qualityFlag?: number; // Якість (0-100%)
  notes?: string; // Примітки
}
```

#### Interface: `TimeSeriesStatistics`

```typescript
interface TimeSeriesStatistics {
  min: number; // Мінімум
  max: number; // Максимум
  mean: number; // Середнє
  stdDev: number; // Стандартне відхилення
  median: number; // Медіана
  percentile90: number; // 90-й перцентиль
  percentile95: number; // 95-й перцентиль
  validCount: number; // Коректні вимірювання
  totalCount: number; // Всього вимірювань
  dataAvailability: number; // % доступності
}
```

#### Interface: `TimeSeries`

```typescript
interface TimeSeries {
  pollutant: Pollutant; // Забруднювач
  unit: string; // Одиниця
  data: TimeSeriesPoint[]; // Масив точок
  statistics?: TimeSeriesStatistics; // Статистика
}
```

#### Interface: `Measurement`

```typescript
interface Measurement {
  id: string; // Ідентифікатор
  stationId: string; // Ідентифікатор станції
  timestamp: string; // Час вимірювання
  readings: PollutantReading[]; // Вимірювання
  aqi: number; // Індекс якості
  level: AirQualityIndex; // Рівень якості

  // Метеорологічні дані
  temperature?: number; // Температура (°C)
  humidity?: number; // Вологість (%)
  windSpeed?: number; // Швидкість вітру (м/с)
  windDirection?: number; // Напрямок вітру (0-360°)
  pressure?: number; // Тиск (гПа)
  precipitation?: number; // Опади (мм)
  visibility?: number; // Видимість (км)

  status?: MeasurementStatus;
  dataSource?: string;
  receivedAt?: string;
  processedAt?: string;
}
```

---

### 4. `types/health-alert.ts` - Сповіщення про здоров'я

#### Enum: `AlertLevel`

- `Green` - Зелена (добре)
- `Yellow` - Жовта (помірно)
- `Orange` - Помаранчева (чутливі групи)
- `Red` - Червона (шкідливо)
- `Purple` - Фіолетова (дуже шкідливо)
- `Maroon` - Коричнева (небезпечно)

#### Interface: `HealthAlert`

```typescript
interface HealthAlert {
  id: string; // Ідентифікатор
  stationId: string; // Станція
  stationName: string; // Назва станції
  level: AlertLevel; // Рівень
  type: AlertType; // Тип сповіщення
  pollutant?: Pollutant; // Забруднювач
  concentration?: number; // Концентрація
  aqiLevel?: AirQualityIndex; // Рівень якості
  description: string; // Опис
  triggeredAt: string; // Час запуску
  resolvedAt?: string; // Час вирішення
  status: "Active" | "Resolved" | "Acknowledged";
  recommendations?: string[]; // Рекомендації
  validUntil?: string; // Дійсне до
  severity: number; // Серійність (0-10)
}
```

#### Interface: `HealthRecommendation`

```typescript
interface HealthRecommendation {
  aqiLevel: AirQualityIndex;
  populationAtRisk: string[]; // Вразливі групи
  activityLevel: string; // Рівень активності
  recommendations: string[]; // Рекомендації
  protectiveEquipment?: string[]; // ЗІЗ
}
```

---

### 5. `types/api.ts` - API Типи

#### Interface: `ApiResponse<T>`

```typescript
interface ApiResponse<T> {
  data: T | null; // Дані
  error: ApiError | null; // Помилка
  timestamp: string; // Час відповіді
  version?: string; // Версія API
}
```

#### Interface: `PaginatedResponse<T>`

```typescript
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number; // Всього елементів
    page: number; // Поточна сторінка
    limit: number; // На сторінку
    totalPages: number; // Всього сторінок
    sortBy?: string; // Сортування
    sortOrder?: "asc" | "desc"; // Напрямок
  };
}
```

---

### 6. `types/constants.ts` - Константи

Визначає межі для забруднювачів, кольори, таймаути, тощо.

```typescript
// Межі для кожного забруднювача
POLLUTANT_THRESHOLDS;

// Кольори для AQI
AQI_COLORS;
AQI_BG_COLORS;
AQI_TEXT_COLORS;

// TTL для кешу
CACHE_TTL;

// Таймаути запитів
REQUEST_TIMEOUTS;

// Формати дати
DATE_FORMATS;
```

---

### 7. `types/utils.ts` - Утилітарні функції

Функції для розрахунків:

```typescript
// Розрахункові функції
calculateAQI(readings);
calculatePollutantAQI(reading);
getDominantPollutant(readings);
calculateAverageAQI(values);
calculateTrend(oldAQI, newAQI);

// Класифікація
classifyPollutantLevel(reading);
getAQIDescription(aqi);
getPeriodOfDay(hour);

// Фізичні розрахунки
calculateDewPoint(temperature, humidity);
getWindImpact(windSpeed);

// Перевірки
isExceeded(value, limit);
getPercentOfLimit(value, limit);
calculateDataQuality(total, valid);
```

---

## Приклади використання

### Розрахувати AQI

```typescript
import { calculateAQI, PollutantReading } from "@/types";

const readings: PollutantReading[] = [
  { pollutant: Pollutant.PM25, value: 25, unit: "μg/m³", limit: 35 },
  { pollutant: Pollutant.PM10, value: 45, unit: "μg/m³", limit: 50 },
];

const aqi = calculateAQI(readings); // число
```

### Отримати рекомендації

```typescript
import { getHealthRecommendations, AirQualityIndex } from "@/types";

const recommendations = getHealthRecommendations(AirQualityIndex.Unhealthy);
```

### Розрахувати точку роси

```typescript
import { calculateDewPoint } from "@/types/utils";

const dewPoint = calculateDewPoint(20, 60); // 11.9°C
```

---

## Узгодженість типів

Всі типи узгоджені та дотримуються такого принципу:

- Використовуються `Enum` для фіксованих значень
- Використовуються `Interface` для об'єктів
- Опціональні поля позначені з `?`
- Вся документація включена через JSDoc коментарі
- Функції розраховуються в утилітах

Типи готові для використання в API, UI компонентів та обробки даних.
