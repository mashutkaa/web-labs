import { Pollutant, AirQualityIndex, determineAqiLevel } from "./air-quality";
import { PollutantReading } from "./air-quality";
import { POLLUTANT_THRESHOLDS } from "./constants";

/**
 * Утиліти для розрахунків екологічних показників
 */

/**
 * Розрахувати індекс якості повітря (AQI) з вимірювань забруднювачів
 * Використовує методику США EPA
 */
export function calculateAQI(readings: PollutantReading[]): number {
  if (readings.length === 0) return 0;

  // Розрахувати AQI для кожного забруднювача
  const aqis = readings.map((reading) => calculatePollutantAQI(reading));

  // Повернути максимальний AQI (найбільш забруднений)
  return Math.max(...aqis);
}

/**
 * Розрахувати AQI для одного забруднювача
 */
export function calculatePollutantAQI(reading: PollutantReading): number {
  const { pollutant, value } = reading;
  const thresholds = POLLUTANT_THRESHOLDS[pollutant];

  if (value <= thresholds.good) return 0 + (value / thresholds.good) * 50;
  if (value <= thresholds.moderate)
    return (
      50 +
      ((value - thresholds.good) / (thresholds.moderate - thresholds.good)) * 50
    );
  if (value <= thresholds.sensitive)
    return (
      100 +
      ((value - thresholds.moderate) /
        (thresholds.sensitive - thresholds.moderate)) *
        50
    );
  if (value <= thresholds.unhealthy)
    return (
      150 +
      ((value - thresholds.sensitive) /
        (thresholds.unhealthy - thresholds.sensitive)) *
        50
    );
  if (value <= thresholds.veryUnhealthy)
    return (
      200 +
      ((value - thresholds.unhealthy) /
        (thresholds.veryUnhealthy - thresholds.unhealthy)) *
        100
    );

  // Для значень > veryUnhealthy
  return (
    300 + ((value - thresholds.veryUnhealthy) / thresholds.veryUnhealthy) * 200
  );
}

/**
 * Визначити домінуючий забруднювач
 */
export function getDominantPollutant(readings: PollutantReading[]): Pollutant {
  if (readings.length === 0) return Pollutant.PM25;

  // Знайти забруднювач з найвищим AQI
  let maxAQI = 0;
  let dominant = readings[0].pollutant;

  for (const reading of readings) {
    const aqi = calculatePollutantAQI(reading);
    if (aqi > maxAQI) {
      maxAQI = aqi;
      dominant = reading.pollutant;
    }
  }

  return dominant;
}

/**
 * Розрахувати середній AQI за період
 */
export function calculateAverageAQI(aqiValues: number[]): number {
  if (aqiValues.length === 0) return 0;
  return Math.round(
    aqiValues.reduce((sum, aqi) => sum + aqi, 0) / aqiValues.length,
  );
}

/**
 * Розрахувати максимальний AQI за період
 */
export function calculateMaxAQI(aqiValues: number[]): number {
  if (aqiValues.length === 0) return 0;
  return Math.max(...aqiValues);
}

/**
 * Розрахувати мінімальний AQI за період
 */
export function calculateMinAQI(aqiValues: number[]): number {
  if (aqiValues.length === 0) return 0;
  return Math.min(...aqiValues);
}

/**
 * Визначити дні при надмірному забруднені
 */
export function getExceedanceDays(
  readings: Array<{ timestamp: string; aqi: number }>,
  threshold: number = 100,
): string[] {
  const days = new Set<string>();

  for (const reading of readings) {
    if (reading.aqi > threshold) {
      const date = new Date(reading.timestamp);
      const dateStr = date.toISOString().split("T")[0];
      days.add(dateStr);
    }
  }

  return Array.from(days).sort();
}

/**
 * Розрахувати тренд якості повітря
 * -1: погіршилася, 0: без змін, 1: покращилася
 */
export function calculateTrend(oldAQI: number, newAQI: number): -1 | 0 | 1 {
  const diff = newAQI - oldAQI;
  if (diff < -5) return 1; // Покращилася
  if (diff > 5) return -1; // Погіршилася
  return 0; // Без змін
}

/**
 * Отримати опис якості повітря
 */
export function getAQIDescription(aqi: number): AirQualityIndex {
  return determineAqiLevel(aqi);
}

/**
 * Перевірити, чи перевищена норма
 */
export function isExceeded(value: number, limit: number): boolean {
  return value > limit;
}

/**
 * Отримати відсоток від норми
 */
export function getPercentOfLimit(value: number, limit: number): number {
  return (value / limit) * 100;
}

/**
 * Класифікувати концентрацію забруднювача
 */
export function classifyPollutantLevel(
  reading: PollutantReading,
): "безпечна" | "обережна" | "висока" | "дуже висока" | "критична" {
  const percent = getPercentOfLimit(reading.value, reading.limit);

  if (percent <= 50) return "безпечна";
  if (percent <= 75) return "обережна";
  if (percent <= 100) return "висока";
  if (percent <= 150) return "дуже висока";
  return "критична";
}

/**
 * Порівняти два набори вимірювань
 */
export function compareReadings(
  before: PollutantReading[],
  after: PollutantReading[],
): Partial<
  Record<
    Pollutant,
    { before: number; after: number; change: number; changePercent: number }
  >
> {
  const result: Partial<
    Record<
      Pollutant,
      { before: number; after: number; change: number; changePercent: number }
    >
  > = {};

  const afterMap = new Map(after.map((r) => [r.pollutant, r.value]));

  for (const reading of before) {
    const afterValue = afterMap.get(reading.pollutant) || 0;
    const change = afterValue - reading.value;
    const changePercent =
      reading.value > 0 ? (change / reading.value) * 100 : 0;

    result[reading.pollutant] = {
      before: reading.value,
      after: afterValue,
      change,
      changePercent: Math.round(changePercent),
    };
  }

  return result;
}

/**
 * Визначити період дня для деталізації (ранок, день, вечір, ніч)
 */
export function getPeriodOfDay(
  hour: number,
): "Ніч" | "Ранок" | "День" | "Вечір" {
  if (hour >= 0 && hour < 6) return "Ніч";
  if (hour >= 6 && hour < 12) return "Ранок";
  if (hour >= 12 && hour < 18) return "День";
  return "Вечір";
}

/**
 * Розрахувати точку роси на основі температури та вологості
 */
export function calculateDewPoint(
  temperature: number,
  humidity: number,
): number {
  const a = 17.27;
  const b = 237.7;

  const alpha =
    (a * temperature) / (b + temperature) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);

  return Math.round(dewPoint * 10) / 10;
}

/**
 * Визначити вплив вітру на розповсюдження забруднень
 */
export function getWindImpact(
  windSpeed: number,
): "слабкий" | "помірний" | "сильний" | "дуже сильний" {
  if (windSpeed < 2) return "слабкий";
  if (windSpeed < 5) return "помірний";
  if (windSpeed < 10) return "сильний";
  return "дуже сильний";
}

/**
 * Вирахувати якість даних на основі кількості відсутніх вимірювань
 */
export function calculateDataQuality(
  totalMeasurements: number,
  validMeasurements: number,
): number {
  return Math.round((validMeasurements / totalMeasurements) * 100);
}
