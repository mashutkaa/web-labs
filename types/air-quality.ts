/**
 * Забруднювачі повітря - основні параметри якості повітря
 */
export enum Pollutant {
  PM25 = "PM2.5",
  PM10 = "PM10",
  NO2 = "NO2",
  SO2 = "SO2",
  CO = "CO",
  O3 = "O3",
}

/**
 * Шкала індексу якості повітря (AQI)
 * Відповідає стандартам ВОЗ та НМАЕКВР
 */
export enum AirQualityIndex {
  Good = "Добре",
  Moderate = "Помірно",
  UnhealthySensitive = "Шкідливо для чутливих груп",
  Unhealthy = "Шкідливо",
  VeryUnhealthy = "Дуже шкідливо",
  Hazardous = "Небезпечно",
}

/**
 * Вимірювання однієї речовини
 */
export interface PollutantReading {
  /** Тип забруднювача */
  pollutant: Pollutant;
  /** Концентрація забруднювача */
  value: number;
  /** Одиниця вимірювання (μg/m³, mg/m³) */
  unit: string;
  /** Нормативна межа */
  limit: number;
  /** Відсоток від ліміту (0-100+) */
  percentOfLimit?: number;
  /** Час вимірювання */
  measuredAt?: string;
}

/**
 * Дані про якість повітря
 */
export interface AirQualityData {
  /** Індекс якості повітря (0-500+) */
  aqi: number;
  /** Рівень якості */
  level: AirQualityIndex;
  /** Вимірювання всіх забруднювачів */
  readings: PollutantReading[];
  /** Основний забруднювач */
  dominantPollutant: Pollutant;
  /** Час розрахунку AQI */
  calculatedAt?: string;
  /** Джерело даних */
  dataSource?: string;
}

/**
 * Інформація про забруднювач
 */
export interface PollutantInfo {
  /** Код забруднювача */
  code: Pollutant;
  /** Українська назва */
  nameUk: string;
  /** Англійська назва */
  nameEn: string;
  /** Опис */
  description: string;
  /** Основні джерела */
  sources: string[];
  /** WHO рекомендована межа (μg/m³ або mg/m³) */
  whoLimit: number;
  /** Од. вимірювання */
  unit: string;
  /** Період для норми (середньодобова, річна тощо) */
  limitPeriod: string;
  /** Здоровійні ризики */
  healthRisks: string[];
}

/**
 * Константи для стандартів ВОЗ
 */
export const WHO_LIMITS: Record<Pollutant, number> = {
  [Pollutant.PM25]: 35, // μg/m³ (24-hour mean)
  [Pollutant.PM10]: 50, // μg/m³ (24-hour mean)
  [Pollutant.NO2]: 40, // μg/m³ (annual mean)
  [Pollutant.SO2]: 20, // μg/m³ (24-hour mean)
  [Pollutant.CO]: 4, // mg/m³ (8-hour mean)
  [Pollutant.O3]: 100, // μg/m³ (8-hour mean)
};

/**
 * Інформація про забруднювачі
 */
export const POLLUTANT_INFO: Record<Pollutant, PollutantInfo> = {
  [Pollutant.PM25]: {
    code: Pollutant.PM25,
    nameUk: "Дрібнодисперсні частинки",
    nameEn: "Fine Particulate Matter",
    description: "Частинки діаметром ≤2.5 мікрон, здатні проникати в легені",
    sources: [
      "Транспорт",
      "Промисловість",
      "Спалювання палива",
      "Природні джерела",
    ],
    whoLimit: 35,
    unit: "μg/m³",
    limitPeriod: "24-годинна норма",
    healthRisks: [
      "Респіраторні захворювання",
      "Серцево-судинні захворювання",
      "Передчасна смертність",
    ],
  },
  [Pollutant.PM10]: {
    code: Pollutant.PM10,
    nameUk: "Грубодисперсні частинки",
    nameEn: "Coarse Particulate Matter",
    description: "Частинки діаметром 2.5-10 мікрон",
    sources: ["Дорожний пил", "Будівництво", "Вітер", "Промисловість"],
    whoLimit: 50,
    unit: "μg/m³",
    limitPeriod: "24-годинна норма",
    healthRisks: ["Бронхіт", "Астма", "Зниження легеневої функції"],
  },
  [Pollutant.NO2]: {
    code: Pollutant.NO2,
    nameUk: "Діоксид азоту",
    nameEn: "Nitrogen Dioxide",
    description: "Газ, що утворюється при спалюванні палива",
    sources: ["Транспорт", "Електростанції", "Промисловість"],
    whoLimit: 40,
    unit: "μg/m³",
    limitPeriod: "річна норма",
    healthRisks: ["Запалення дихальних шляхів", "Астма", "Знижена імунність"],
  },
  [Pollutant.SO2]: {
    code: Pollutant.SO2,
    nameUk: "Діоксид сірки",
    nameEn: "Sulfur Dioxide",
    description: "Газ, що утворюється при спалюванні сіркавмісного палива",
    sources: ["Електростанції", "Промисловість", "Вулкани"],
    whoLimit: 20,
    unit: "μg/m³",
    limitPeriod: "24-годинна норма",
    healthRisks: ["Астма", "Респіраторні захворювання", "Задишка"],
  },
  [Pollutant.CO]: {
    code: Pollutant.CO,
    nameUk: "Чадний газ",
    nameEn: "Carbon Monoxide",
    description: "Безбарвний газ без запаху",
    sources: ["Транспорт", "Отоплення", "Промисловість"],
    whoLimit: 4,
    unit: "mg/m³",
    limitPeriod: "8-годинна норма",
    healthRisks: ["Гіпоксія", "Серцеві захворювання", "Шкода ЦНС"],
  },
  [Pollutant.O3]: {
    code: Pollutant.O3,
    nameUk: "Озон",
    nameEn: "Ozone",
    description: "Газ, що утворюється хімічно в атмосфері",
    sources: ["Утворюється з NOx та VOC", "Вторинна забруднювання"],
    whoLimit: 100,
    unit: "μg/m³",
    limitPeriod: "8-годинна норма",
    healthRisks: ["Астма", "Кашель", "Зниження легеневої функції"],
  },
};

/**
 * Функція для визначення рівня AQI
 */
export function determineAqiLevel(aqi: number): AirQualityIndex {
  if (aqi <= 50) return AirQualityIndex.Good;
  if (aqi <= 100) return AirQualityIndex.Moderate;
  if (aqi <= 150) return AirQualityIndex.UnhealthySensitive;
  if (aqi <= 200) return AirQualityIndex.Unhealthy;
  if (aqi <= 300) return AirQualityIndex.VeryUnhealthy;
  return AirQualityIndex.Hazardous;
}

/**
 * Функція для розрахунку відсотка від ліміту
 */
export function calculatePercentOfLimit(
  value: number,
  pollutant: Pollutant,
): number {
  const limit = WHO_LIMITS[pollutant];
  return (value / limit) * 100;
}
