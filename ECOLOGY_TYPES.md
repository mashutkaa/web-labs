# Типізація екологічних даних

Цей документ описує сповну структуру типізації для моніторингу якості повітря у проєкті web-labs.

## Структура типів

### 1. Якість повітря (`types/air-quality.ts`)

#### Забруднювачі (Enum Pollutant)

```typescript
enum Pollutant {
  PM25 = "PM2.5", // Дрібні частинки < 2.5 мкм
  PM10 = "PM10", // Частинки < 10 мкм
  NO2 = "NO2", // Діоксид азоту
  SO2 = "SO2", // Діоксид сірки
  CO = "CO", // Чадний газ
  O3 = "O3", // Озон
}
```

#### Шкала індексу якості повітря (Enum AirQualityIndex)

```typescript
enum AirQualityIndex {
  Good = "Добре", // AQI 0-50
  Moderate = "Помірно", // AQI 51-100
  UnhealthySensitive = "Шкідливо для чутливих груп", // AQI 101-150
  Unhealthy = "Шкідливо", // AQI 151-200
  VeryUnhealthy = "Дуже шкідливо", // AQI 201-300
  Hazardous = "Небезпечно", // AQI 301+
}
```

#### Вимірювання забруднювача (Interface PollutantReading)

```typescript
interface PollutantReading {
  pollutant: Pollutant; // Тип забруднювача
  value: number; // Концентрація
  unit: string; // Одиниця (μg/m³, mg/m³)
  limit: number; // Нормативна межа ВОЗ
  percentOfLimit?: number; // % від ліміту (0-100+)
  measuredAt?: string; // ISO 8601 час вимірювання
}
```

#### Дані про якість повітря (Interface AirQualityData)

```typescript
interface AirQualityData {
  aqi: number; // Індекс (0-500+)
  level: AirQualityIndex; // Категорія якості
  readings: PollutantReading[]; // Вимірювання
  dominantPollutant?: Pollutant; // Забруднювач з найвищим AQI
  timestamp: string; // ISO 8601
}
```

#### ВОЗ Стандарти (WHO_LIMITS)

```typescript
// 24-годинні ліміти (мкг/m³)
PM2.5: 35
PM10: 150
NO2: 200
SO2: 125
O3: 100
CO: 4000
```

### 2. Моніторингова станція (`types/station.ts`)

#### Тип станції (Enum StationType)

```typescript
enum StationType {
  Urban = "Міська", // Міські площі
  Suburban = "Приміська", // На межі міста
  Rural = "Сільська", // Сільські райони
  Industrial = "Промислова", // При промислових об'єктах
  Traffic = "Транспортна", // На основних магістралях
}
```

#### Статус станції (Enum StationStatus)

```typescript
enum StationStatus {
  Active = "Активна", // Функціонує нормально
  Maintenance = "Обслуговування", // На ремонті
  Offline = "Офлайн", // Не функціонує
  CalibrationRequired = "Потребує калібрування",
  DataQualityIssue = "Проблема з якістю даних",
}
```

#### Географічні координати (Interface Coordinates)

```typescript
interface Coordinates {
  lat: number; // Широта (-90 ... +90)
  lng: number; // Довгота (-180 ... +180)
  altitude?: number; // Висота над рівнем моря (м)
}
```

#### Інформація про обладнання (Interface EquipmentInfo)

```typescript
interface EquipmentInfo {
  id: string; // Унікальний ID
  type: string; // Тип (PM sensor, Gas analyzer)
  manufacturer: string; // Виробник
  model: string; // Модель
  serialNumber: string; // Заводський номер
  installationDate: string; // Дата встановлення (ISO 8601)
  lastCalibration?: string; // Дата останньої калібрування
  calibrationInterval?: number; // Інтервал калібрування (днів)
}
```

#### Статистика станції (Interface StationStatistics)

```typescript
interface StationStatistics {
  dataAvailability: number; // % даних (0-100)
  measurementCount: number; // Кількість вимірювань
  lastUpdate: string; // Останнє оновлення (ISO 8601)
  uptime: number; // % часу роботи
  averageResponseTime?: number; // Середній час відповіді (мс)
}
```

#### Моніторингова станція (Interface MonitoringStation)

```typescript
interface MonitoringStation {
  id: string; // Унікальний ID
  name: string; // Назва станції
  description?: string; // Опис
  type: StationType; // Тип станції
  status?: StationStatus; // Статус
  coordinates: Coordinates; // Географічна позиція
  region?: Region; // Регіон України
  equipment?: EquipmentInfo[]; // Список обладнання
  statistics?: StationStatistics; // Статистика роботи
  contactInfo?: {
    email?: string; // Email для контакту
    phone?: string; // Телефон
    organization?: string; // Організація-оператор
  };
  notes?: string; // Примітки
}
```

### 3. Часові ряди вимірювань (`types/measurement.ts`)

#### Статус вимірювання (Enum MeasurementStatus)

```typescript
enum MeasurementStatus {
  Valid = "Коректне", // Вимірювання валідне
  Suspicious = "Підозріле", // Потребує перевірки
  Invalid = "Некоректне", // Не використовувати
  Estimated = "Оцінене", // Розраховане, не виміряне
}
```

#### Точка часового ряду (Interface TimeSeriesPoint)

```typescript
interface TimeSeriesPoint {
  timestamp: string; // ISO 8601 час вимірювання
  value: number; // Значення забруднювача
  status?: MeasurementStatus; // Статус вимірювання
  qualityFlag?: number; // Якість (0-100%)
  notes?: string; // Примітки про вимірювання
}
```

#### Часовий ряд одного забруднювача (Interface TimeSeries)

```typescript
interface TimeSeries {
  pollutant: Pollutant; // Забруднювач
  unit: string; // Одиниця (μg/m³)
  data: TimeSeriesPoint[]; // Точки часового ряду
  statistics?: TimeSeriesStatistics; // Статистика
}
```

#### Статистика часового ряду (Interface TimeSeriesStatistics)

```typescript
interface TimeSeriesStatistics {
  min: number; // Мінімальне значення
  max: number; // Максимальне значення
  mean: number; // Середнє значення
  median?: number; // Медіана
  stdDev?: number; // Стандартне відхилення
  percentile90?: number; // 90-й перцентиль
  percentile95?: number; // 95-й перцентиль
  dataAvailability?: number; // % присутніх даних
  validCount?: number; // Кількість валідних вимірювань
}
```

#### Метеорологічні дані (Interface MeteorologyData)

```typescript
interface MeteorologyData {
  temperature?: number; // Температура (°C)
  humidity?: number; // Вологість (%RH)
  pressure?: number; // Атмосферний тиск (hPa)
  windSpeed?: number; // Швидкість вітру (м/с)
  windDirection?: number; // Напрямок вітру (0-360°)
  precipitation?: number; // Опади (мм)
  visibility?: number; // Видимість (м)
}
```

#### Вимірювання якості повітря (Interface Measurement)

```typescript
interface Measurement {
  id: string; // Унікальний ID
  stationId: string; // ID станції
  timestamp: string; // ISO 8601
  readings: PollutantReading[]; // Вимірювання забруднювачів
  aqi: number; // Обчислений AQI
  aqiLevel: AirQualityIndex; // Категорія якості
  meteorology?: MeteorologyData; // Метеорологічні дані
  metadata?: {
    source?: string; // Джерело даних
    processingTime?: number; // Час обробки (мс)
    qualityFlags?: Record<Pollutant, number>;
  };
}
```

## Приклади використання

### Створення вимірювання

```typescript
const measurement: Measurement = {
  id: "m20240115001",
  stationId: "s_kyiv_center",
  timestamp: new Date().toISOString(),
  readings: [
    {
      pollutant: Pollutant.PM25,
      value: 35,
      unit: "μg/m³",
      limit: 35,
      percentOfLimit: 100,
    },
    {
      pollutant: Pollutant.NO2,
      value: 45,
      unit: "μg/m³",
      limit: 200,
      percentOfLimit: 22.5,
    },
  ],
  aqi: 117,
  aqiLevel: AirQualityIndex.UnhealthySensitive,
  meteorology: {
    temperature: 5,
    humidity: 75,
    pressure: 1020,
    windSpeed: 2,
    windDirection: 180,
  },
};
```

### Створення станції

```typescript
const station: MonitoringStation = {
  id: "s_kyiv_center",
  name: "Моніторингова станція Київ Центр",
  type: StationType.Urban,
  status: StationStatus.Active,
  coordinates: {
    lat: 50.4501,
    lng: 30.5234,
    altitude: 100,
  },
  region: Region.Kyiv,
  equipment: [
    {
      id: "eq_pm_01",
      type: "PM Sensor",
      manufacturer: "Siemens",
      model: "SDS011",
      serialNumber: "ABC12345",
      installationDate: "2023-01-15",
    },
  ],
  contactInfo: {
    organization: "Мінпеку Мінеку",
    email: "info@nmaekw.gov.ua",
    phone: "+380442805050",
  },
};
```

### Обчислення статистики часового ряду

```typescript
const timeSeries: TimeSeries = {
  pollutant: Pollutant.PM25,
  unit: "μg/m³",
  data: [
    { timestamp: "2024-01-15T00:00Z", value: 32 },
    { timestamp: "2024-01-15T01:00Z", value: 35 },
    { timestamp: "2024-01-15T02:00Z", value: 38 },
    // ... більше точок
  ],
  statistics: {
    min: 30,
    max: 45,
    mean: 36.5,
    stdDev: 4.2,
    percentile90: 42,
    percentile95: 44,
    dataAvailability: 98,
    validCount: 168,
  },
};
```

## Утиліти для обчислень

Проєкт включає набір утиліт у `types/utils.ts`:

- `calculateAQI()` - обчислення загального AQI
- `calculatePollutantAQI()` - обчислення AQI для конкретного забруднювача
- `getDominantPollutant()` - визначення найвпливовішого забруднювача
- `classifyPollutantLevel()` - класифікація рівня забруднення
- `calculateTimeSeriesStatistics()` - статистичний аналіз часових рядів
- `calculateDataQuality()` - оцінка якості даних

## Константи

Проєкт включає константи у `types/constants.ts`:

- `POLLUTANT_THRESHOLDS` - ВОЗ ліміти для всіх забруднювачів
- `AQI_COLORS` - кольори для UI за AQI рівнями
- `AQI_BOUNDARIES` - межі AQI для кожної категорії
- `CACHE_TTL` - час кешування даних
- `DATE_FORMATS` - формати дат для UI

## Рекомендації для розвитку

1. **API інтеграція** - типи готові для REST API, GraphQL або WebSocket
2. **Базу даних** - структури підходять для MongoDB, PostgreSQL або SQLite
3. **Real-time оновлення** - TimeSeriesPoint підтримує streaming
4. **Здоров'я населення** - див. types/health-alert.ts для рекомендацій
5. **Звіти** - TimeSeriesStatistics підтримує аналітику та export

---

**Останнє оновлення:** Січень 2024
**Статус:** ✅ Повна типізація екологічних даних
