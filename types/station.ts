import { AirQualityData } from "./air-quality";

/**
 * Тип станції за функціональним призначенням
 */
export enum StationType {
  Urban = "Міська",
  Suburban = "Приміська",
  Rural = "Сільська",
  Industrial = "Промислова",
  Traffic = "Транспортна",
}

/**
 * Регіон України (опціонально)
 */
export enum Region {
  Kyiv = "м. Київ",
  Kharkiv = "м. Харків",
  Dnipro = "м. Днипро",
  Odesa = "м. Одеса",
  Lviv = "м. Львів",
  Donetsk = "Донецька область",
  Luhansk = "Луганська область",
  Zaporizhzhia = "Запорізька область",
  Kherson = "Херсонська область",
  Mykolaiv = "Миколаївська область",
  Kirovohrad = "Кіровоградська область",
  Poltava = "Полтавська область",
  Sumy = "Сумська область",
  Chernihiv = "Чернігівська область",
  Zhytomyr = "Житомирська область",
  Khmelnytskyi = "Хмельницька область",
  Vinnytsia = "Вінницька область",
  Cherkasy = "Черкаська область",
  Ternopil = "Тернопільська область",
  IvanoFrankivsk = "Івано-Франківська область",
  Lviv_Region = "Львівська область",
  Zakarpattia = "Закарпатська область",
}

/**
 * Географічні координати (широта, довгота)
 */
export interface Coordinates {
  /** Широта (latitude) */
  lat: number;
  /** Довгота (longitude) */
  lng: number;
  /** Висота над рівнем моря (м) - опціонально */
  altitude?: number;
}

/**
 * Статус здоров'я станції
 */
export enum StationStatus {
  Active = "Активна",
  Inactive = "Неактивна",
  Maintenance = "На обслуговуванні",
  Offline = "Офлайн",
  Error = "Помилка",
}

/**
 * Інформація про обладнання станції
 */
export interface EquipmentInfo {
  /** Модель приладу */
  model: string;
  /** Виробник */
  manufacturer: string;
  /** Дата встановлення */
  installedDate: string;
  /** Дата останньої калібрації */
  lastCalibration?: string;
  /** Дата наступної планової калібрації */
  nextCalibration?: string;
  /** Версія ПО */
  softwareVersion?: string;
}

/**
 * Статистика станції
 */
export interface StationStatistics {
  /** Коефіцієнт доступності даних (0-100%) */
  dataAvailability: number;
  /** Дата початку вимірювань */
  operationStartDate: string;
  /** Загальна кількість вимірювань */
  totalMeasurements: number;
  /** Середній AQI за останній місяць */
  averageAqi?: number;
  /** Максимальний AQI за останній місяць */
  maxAqi?: number;
  /** Мінімальний AQI за останній місяць */
  minAqi?: number;
}

/**
 * Станція моніторингу якості повітря
 */
export interface MonitoringStation {
  /** Унікальний ідентифікатор */
  id: string;
  /** Назва станції */
  name: string;
  /** Місто розташування */
  city: string;
  /** Країна розташування */
  country?: string;
  /** Регіон */
  region?: Region;
  /** Географічні координати */
  coordinates: Coordinates;
  /** Тип станції */
  type: StationType;
  /** Статус станції */
  status?: StationStatus;
  /** Активна станція */
  isActive: boolean;
  /** Дата встановлення */
  installedDate: string;
  /** Час останнього оновлення */
  lastUpdate: string;
  /** Поточні дані якості повітря */
  currentAqi?: AirQualityData;
  /** Інформація про обладнання */
  equipment?: EquipmentInfo;
  /** Статистика */
  statistics?: StationStatistics;
  /** Контактна особа/відповідальний */
  contactPerson?: string;
  /** Email для сповіщень */
  contactEmail?: string;
  /** Телефон */
  contactPhone?: string;
  /** Додаткові примітки */
  notes?: string;
}
