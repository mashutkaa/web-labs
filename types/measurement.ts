import { AirQualityIndex, Pollutant, PollutantReading } from "./air-quality";

/**
 * Статус вимірювання
 */
export enum MeasurementStatus {
  Valid = "Коректне",
  Suspicious = "Підозріле",
  Invalid = "Некоректне",
  Estimated = "Оцінене",
}

/**
 * Точка часового ряду з додатковими метаданими
 */
export interface TimeSeriesPoint {
  /** Час вимірювання (ISO 8601) */
  timestamp: string;
  /** Значення забруднювача */
  value: number;
  /** Статус вимірювання */
  status?: MeasurementStatus;
  /** Прапор якості (0-100%) */
  qualityFlag?: number;
  /** Примітки */
  notes?: string;
}

/**
 * Часовий ряд вимірювань одного забруднювача
 */
export interface TimeSeries {
  /** Забруднювач */
  pollutant: Pollutant;
  /** Одиниця вимірювання */
  unit: string;
  /** Масив точок часового ряду */
  data: TimeSeriesPoint[];
  /** Статистика за період */
  statistics?: TimeSeriesStatistics;
}

/**
 * Статистика часового ряду
 */
export interface TimeSeriesStatistics {
  /** Мінімальне значення */
  min: number;
  /** Максимальне значення */
  max: number;
  /** Середнє значення */
  mean: number;
  /** Середньоквадратичне відхилення */
  stdDev: number;
  /** Медіана */
  median: number;
  /** 90-й перцентиль */
  percentile90: number;
  /** 95-й перцентиль */
  percentile95: number;
  /** Кількість коректних вимірювань */
  validCount: number;
  /** Загальна кількість вимірювань */
  totalCount: number;
  /** Коефіцієнт доступності даних */
  dataAvailability: number; // 0-100%
}

/**
 * Експозиція на забруднювач
 */
export interface Exposure {
  /** Забруднювач */
  pollutant: Pollutant;
  /** Тривалість експозиції (годин) */
  duration: number;
  /** Середня концентрація */
  averageConcentration: number;
  /** Піккова концентрація */
  peakConcentration: number;
  /** Наслідки для здоров'я */
  healthImpact?: string;
}

/**
 * Вимірювання (знімок якості повітря в конкретний момент)
 */
export interface Measurement {
  /** Унікальний ідентифікатор */
  id: string;
  /** Ідентифікатор станції */
  stationId: string;
  /** Час вимірювання (ISO 8601) */
  timestamp: string;
  /** Вимірювання всіх забруднювачів */
  readings: PollutantReading[];
  /** Індекс якості повітря */
  aqi: number;
  /** Рівень якості */
  level: AirQualityIndex;
  /** Температура повітря (°C) */
  temperature?: number;
  /** Вологість (%) */
  humidity?: number;
  /** Швидкість вітру (м/с) */
  windSpeed?: number;
  /** Напрямок вітру (градуси, 0-360) */
  windDirection?: number;
  /** Атмосферний тиск (гПа) */
  pressure?: number;
  /** Опади (мм) */
  precipitation?: number;
  /** Видимість (км) */
  visibility?: number;
  /** Статус вимірювання */
  status?: MeasurementStatus;
  /** Джерело даних */
  dataSource?: string;
  /** Час отримання даних сервером */
  receivedAt?: string;
  /** Час обробки/розрахунку */
  processedAt?: string;
  /** Експозиція за період */
  exposure?: Exposure[];
}

/**
 * Історія вимірювань
 */
export interface MeasurementHistory {
  /** Ідентифікатор станції */
  stationId: string;
  /** Масив вимірювань */
  measurements: Measurement[];
  /** Загальна кількість */
  count: number;
  /** Період (дата початку) */
  periodStart: string;
  /** Період (дата кінця) */
  periodEnd: string;
  /** Статистика */
  statistics?: TimeSeriesStatistics;
}

/**
 * Функція для розрахунку статистики часового ряду
 */
export function calculateTimeSeriesStatistics(
  data: TimeSeriesPoint[],
): TimeSeriesStatistics {
  const values = data.map((p) => p.value).sort((a, b) => a - b);
  const validCount = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / validCount;
  const variance =
    values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / validCount;
  const stdDev = Math.sqrt(variance);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean,
    stdDev,
    median: values[Math.floor(validCount / 2)],
    percentile90: values[Math.floor(validCount * 0.9)],
    percentile95: values[Math.floor(validCount * 0.95)],
    validCount,
    totalCount: data.length,
    dataAvailability: (validCount / data.length) * 100,
  };
}
