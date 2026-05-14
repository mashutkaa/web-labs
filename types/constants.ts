import { Pollutant, AirQualityIndex } from "./air-quality";

/**
 * Точна межа визначення дискретизації по сніжкам з НАМЕКВР/УГТИС та WHO
 */
export const POLLUTANT_THRESHOLDS: Record<
  Pollutant,
  {
    good: number;
    moderate: number;
    sensitive: number;
    unhealthy: number;
    veryUnhealthy: number;
  }
> = {
  [Pollutant.PM25]: {
    good: 12,
    moderate: 35,
    sensitive: 55,
    unhealthy: 150,
    veryUnhealthy: 250,
  },
  [Pollutant.PM10]: {
    good: 50,
    moderate: 150,
    sensitive: 250,
    unhealthy: 350,
    veryUnhealthy: 430,
  },
  [Pollutant.NO2]: {
    good: 53,
    moderate: 100,
    sensitive: 360,
    unhealthy: 649,
    veryUnhealthy: 1249,
  },
  [Pollutant.SO2]: {
    good: 46,
    moderate: 150,
    sensitive: 350,
    unhealthy: 1260,
    veryUnhealthy: 1880,
  },
  [Pollutant.CO]: {
    good: 4,
    moderate: 9,
    sensitive: 12,
    unhealthy: 15,
    veryUnhealthy: 30,
  },
  [Pollutant.O3]: {
    good: 54,
    moderate: 70,
    sensitive: 85,
    unhealthy: 105,
    veryUnhealthy: 200,
  },
};

/**
 * Порядок забруднювачів за важливістю для розрахунку AQI
 */
export const POLLUTANT_PRIORITY = [
  Pollutant.PM25,
  Pollutant.PM10,
  Pollutant.O3,
  Pollutant.NO2,
  Pollutant.SO2,
  Pollutant.CO,
];

/**
 * Збереження кольорів для різних рівнів якості
 */
export const AQI_COLORS: Record<AirQualityIndex, string> = {
  Добре: "#10b981", // emerald-500
  Помірно: "#f59e0b", // amber-500
  "Шкідливо для чутливих груп": "#f97316", // orange-500
  Шкідливо: "#ef4444", // red-500
  "Дуже шкідливо": "#a855f7", // purple-500
  Небезпечно: "#7c2d12", // rose-900
};

/**
 * Фонові кольори для AQI
 */
export const AQI_BG_COLORS: Record<AirQualityIndex, string> = {
  Добре: "bg-green-100",
  Помірно: "bg-yellow-100",
  "Шкідливо для чутливих груп": "bg-orange-100",
  Шкідливо: "bg-red-100",
  "Дуже шкідливо": "bg-purple-100",
  Небезпечно: "bg-rose-900",
};

/**
 * Текстові кольори для AQI
 */
export const AQI_TEXT_COLORS: Record<AirQualityIndex, string> = {
  Добре: "text-green-800",
  Помірно: "text-yellow-800",
  "Шкідливо для чутливих груп": "text-orange-800",
  Шкідливо: "text-red-800",
  "Дуже шкідливо": "text-purple-800",
  Небезпечно: "text-rose-100",
};

/**
 * Межові значення AQI
 */
export const AQI_BOUNDARIES = {
  GOOD: 50,
  MODERATE: 100,
  SENSITIVE: 150,
  UNHEALTHY: 200,
  VERY_UNHEALTHY: 300,
  HAZARDOUS: 500,
} as const;

/**
 * Середня частота оновлення даних (хвилини)
 */
export const DATA_UPDATE_FREQUENCY = 60; // 1 год

/**
 * Виконати основні рекомендації утримання
 */
export const CACHE_TTL = {
  STATIONS: 5 * 60, // 5 хвилин
  MEASUREMENTS: 10 * 60, // 10 хвилин
  TIME_SERIES: 30 * 60, // 30 хвилин
  STATISTICS: 60 * 60, // 1 година
  ALERTS: 2 * 60, // 2 хвилини
} as const;

/**
 * Налаштування для таймаутів запитів
 */
export const REQUEST_TIMEOUTS = {
  SHORT: 5000, // 5 секунд
  MEDIUM: 15000, // 15 секунд
  LONG: 30000, // 30 секунд
} as const;

/**
 * Мінімальна кількість вимірювань для розрахунку статистики
 */
export const MIN_MEASUREMENTS_FOR_STATS = 24; // 24 години

/**
 * Максимальна кількість днів для історії
 */
export const MAX_HISTORY_DAYS = 365;

/**
 * Формати дати
 */
export const DATE_FORMATS = {
  ISO: "YYYY-MM-DDTHH:mm:ssZ",
  SHORT: "DD.MM.YYYY",
  LONG: "DD MMMM YYYY",
  TIME_SHORT: "HH:mm",
  TIME_LONG: "HH:mm:ss",
  DATETIME_SHORT: "DD.MM.YYYY HH:mm",
  DATETIME_LONG: "DD MMMM YYYY HH:mm:ss",
} as const;

/**
 * Мови UI
 */
export const SUPPORTED_LANGUAGES = {
  UK: "uk", // Українська
  EN: "en", // Англійська
  RU: "ru", // Російська (якщо актуально)
} as const;

/**
 * Одиниці вимірювання за замовчуванням
 */
export const DEFAULT_UNITS = {
  CONCENTRATION_SMALL: "μg/m³",
  CONCENTRATION_LARGE: "mg/m³",
  TEMPERATURE: "°C",
  HUMIDITY: "%",
  PRESSURE: "гПа",
  WIND_SPEED: "м/с",
  VISIBILITY: "км",
  PRECIPITATION: "мм",
} as const;
