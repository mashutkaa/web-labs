import { AirQualityIndex, Pollutant } from "./air-quality";

/**
 * Рівень сповіщення про здоров'я
 */
export enum AlertLevel {
  Green = "Зелена", // Добре
  Yellow = "Жовта", // Помірно
  Orange = "Помаранчева", // Шкідливо для чутливих груп
  Red = "Червона", // Шкідливо
  Purple = "Фіолетова", // Дуже шкідливо
  Maroon = "Коричнева", // Небезпечно
}

/**
 * Тип сповіщення
 */
export enum AlertType {
  AirQuality = "Якість повітря",
  HealthWarning = "Попередження про здоров'я",
  Equipment = "Обладнання",
  DataQuality = "Якість даних",
}

/**
 * Рекомендація для населення
 */
export interface HealthRecommendation {
  /** Рівень якості */
  aqiLevel: AirQualityIndex;
  /** Риск для населення */
  populationAtRisk: string[];
  /** Рекомендована активність */
  activityLevel:
    | "Нормальна"
    | "Обмежена"
    | "Дуже обмежена"
    | "Максимально обмежена";
  /** Рекомендації */
  recommendations: string[];
  /** Рекомендовані засоби захисту */
  protectiveEquipment?: string[];
}

/**
 * Сповіщення про якість повітря або здоров'я
 */
export interface HealthAlert {
  /** Унікальний ідентифікатор */
  id: string;
  /** Станція, яка спричинила сповіщення */
  stationId: string;
  /** Назва станції */
  stationName: string;
  /** Рівень сповіщення */
  level: AlertLevel;
  /** Тип сповіщення */
  type: AlertType;
  /** Забруднювач (якщо актуально) */
  pollutant?: Pollutant;
  /** Концентрація забруднювача */
  concentration?: number;
  /** Поточна якість повітря */
  aqiLevel?: AirQualityIndex;
  /** Подробиця сповіщення */
  description: string;
  /** Час запуску сповіщення */
  triggeredAt: string;
  /** Час вирішення (якщо закрито) */
  resolvedAt?: string;
  /** Статус сповіщення */
  status: "Active" | "Resolved" | "Acknowledged";
  /** Рекомендації */
  recommendations?: string[];
  /** Час дійсності сповіщення */
  validUntil?: string;
  /** Серійність (0-10) */
  severity: number;
}

/**
 * Статистика сповіщень
 */
export interface AlertStatistics {
  /** Загальна кількість активних сповіщень */
  totalActive: number;
  /** Кількість по рівнях */
  byLevel: Record<AlertLevel, number>;
  /** Кількість по типам */
  byType: Record<AlertType, number>;
  /** Станції з найвищим рівнем */
  topStations: string[];
  /** Забруднювачі, що найбільше викликають сповіщення */
  topPollutants: Pollutant[];
}

/**
 * Рекомендації для різних груп населення
 */
export const HEALTH_RECOMMENDATIONS: Record<
  AirQualityIndex,
  HealthRecommendation
> = {
  Добре: {
    aqiLevel: "Добре" as AirQualityIndex,
    populationAtRisk: [],
    activityLevel: "Нормальна",
    recommendations: [
      "Можна займатися спортом на улиці",
      "Нормальні умови для всіх груп населення",
    ],
  },
  Помірно: {
    aqiLevel: "Помірно" as AirQualityIndex,
    populationAtRisk: [
      "Люди зі серцево-судинними захворюваннями",
      "Люди з астмою",
    ],
    activityLevel: "Нормальна",
    recommendations: [
      "Вразливі групи можуть розглядати обмеження інтенсивної активності",
      "Можна займатися спортом, але слід слідити за симптомами",
    ],
    protectiveEquipment: ["Маска для обличчя (опціонально)"],
  },
  "Шкідливо для чутливих груп": {
    aqiLevel: "Шкідливо для чутливих груп" as AirQualityIndex,
    populationAtRisk: [
      "Діти",
      "Пенсіонери",
      "Люди з респіраторними захворюваннями",
      "Люди із серцево-судинними захворюваннями",
    ],
    activityLevel: "Обмежена",
    recommendations: [
      "Вразливим групам слід уникати інтенсивної активності на улиці",
      "Загальне населення може займатися звичайною активністю",
      "Розглянути залишення вдома для вразливих груп",
    ],
    protectiveEquipment: ["Маска для обличчя (рекомендується)"],
  },
  Шкідливо: {
    aqiLevel: "Шкідливо" as AirQualityIndex,
    populationAtRisk: [
      "Діти",
      "Пенсіонери",
      "Люди з респіраторними захворюваннями",
      "Люди із серцево-судинними захворюваннями",
      "Вагітні жінки",
    ],
    activityLevel: "Дуже обмежена",
    recommendations: [
      "Загальне населення повинно обмежити тривалу діяльність на улиці",
      "Вразливим групам слід залишатися в приміщенні",
      "Закрити вікна та двері",
      "Використовувати повітрязаправних",
    ],
    protectiveEquipment: ["FFP2/N95 маска"],
  },
  "Дуже шкідливо": {
    aqiLevel: "Дуже шкідливо" as AirQualityIndex,
    populationAtRisk: ["Все населення"],
    activityLevel: "Максимально обмежена",
    recommendations: [
      "Все населення повинно уникати зовнішніх діяльностей",
      "Залишайтеся вдома",
      "Закрити всі вікна та двері",
      "Використовувати воздухопроцизак",
    ],
    protectiveEquipment: ["FFP2/N95 маска"],
  },
  Небезпечно: {
    aqiLevel: "Небезпечно" as AirQualityIndex,
    populationAtRisk: ["Все населення"],
    activityLevel: "Максимально обмежена",
    recommendations: [
      "Не виходьте на вулицю",
      "Закройте всі вікна та двері",
      "Залишайтеся в приміщенні з очищеним повітрям",
      "Обмежте фізичну активність",
      "Розглянути евакуацію з області",
    ],
    protectiveEquipment: ["FFP2/N95 маска або респіратор"],
  },
};

/**
 * Функція для отримання рекомендацій за рівнем якості
 */
export function getHealthRecommendations(
  aqiLevel: AirQualityIndex,
): HealthRecommendation {
  return HEALTH_RECOMMENDATIONS[aqiLevel];
}
