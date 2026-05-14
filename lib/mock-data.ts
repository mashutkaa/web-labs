import {
  AirQualityIndex,
  Pollutant,
  PollutantReading,
  AirQualityData,
  WHO_LIMITS,
} from "@/types/air-quality";
import {
  MonitoringStation,
  StationType,
  EquipmentInfo,
  StationStatus,
  Region,
} from "@/types/station";
import { Measurement } from "@/types/measurement";

/** Детермінований RNG (Mulberry32) — стабільні часові ряди між перезапусками */
function hashSeed(parts: (string | number)[]): number {
  const s = parts.join("|");
  let h = 1779033703;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

const determineAqiLevel = (aqi: number): AirQualityIndex => {
  if (aqi <= 50) return AirQualityIndex.Good;
  if (aqi <= 100) return AirQualityIndex.Moderate;
  if (aqi <= 150) return AirQualityIndex.UnhealthySensitive;
  if (aqi <= 200) return AirQualityIndex.Unhealthy;
  if (aqi <= 300) return AirQualityIndex.VeryUnhealthy;
  return AirQualityIndex.Hazardous;
};

const calculateAqiFromReadings = (readings: PollutantReading[]): number => {
  const values = readings.map((r) => (r.value / r.limit) * 100);
  const maxValue = Math.max(...values);
  if (maxValue <= 50) return maxValue;
  if (maxValue <= 100) return 50 + (maxValue - 50) * 1;
  if (maxValue <= 150) return 100 + (maxValue - 100) * 1;
  if (maxValue <= 200) return 150 + (maxValue - 150) * 1;
  if (maxValue <= 300) return 200 + (maxValue - 200) * 1;
  return 300 + (maxValue - 300) * 1;
};

const dominantPollutantFromReadings = (
  readings: PollutantReading[],
): Pollutant =>
  readings.reduce((prev, cur) =>
    cur.value / cur.limit > prev.value / prev.limit ? cur : prev,
  ).pollutant;

const airQualityFromReadings = (readings: PollutantReading[]): AirQualityData => {
  const aqi = Math.round(calculateAqiFromReadings(readings));
  return {
    aqi,
    level: determineAqiLevel(aqi),
    readings,
    dominantPollutant: dominantPollutantFromReadings(readings),
    calculatedAt: new Date().toISOString(),
  };
};

/**
 * Озон: фотохімічний пік удень, низький уночі та вранці (реалістична добова крива).
 */
function o3ForHour(hour: number, rnd: () => number): number {
  const isDay = hour >= 10 && hour <= 17;
  const isMorning = hour >= 7 && hour < 10;
  if (isDay) {
    const peak = hour >= 12 && hour <= 15 ? 1 : 0.75;
    return clamp((65 + rnd() * 55) * peak, 25, 160);
  }
  if (isMorning) {
    return clamp(25 + rnd() * 35, 15, 70);
  }
  return clamp(12 + rnd() * 28, 5, 55);
}

/**
 * Показники за типом локації, годиною доби та днем тижня (вихідні — менше транспортного навантаження).
 */
const generateReadingsForCityType = (
  cityType: StationType,
  hour: number,
  dayOfWeek: number,
  rnd: () => number,
): PollutantReading[] => {
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const nightTimeMultiplier = hour >= 22 || hour <= 5 ? 1.15 : 1;
  const rushHourMultiplier = isRushHour ? 1.35 : 0.92;
  const weekendFactor =
    dayOfWeek === 0 || dayOfWeek === 6
      ? cityType === StationType.Traffic ||
          cityType === StationType.Urban
        ? 0.82
        : 0.95
      : 1;

  let pm25Min: number;
  let pm25Max: number;
  let pm10Min: number;
  let pm10Max: number;
  let no2Min: number;
  let no2Max: number;
  let so2Min: number;
  let so2Max: number;

  switch (cityType) {
    case StationType.Industrial:
      pm25Min = 38;
      pm25Max = 115;
      pm10Min = 55;
      pm10Max = 190;
      no2Min = 35;
      no2Max = 95;
      so2Min = 12;
      so2Max = 48;
      break;
    case StationType.Traffic:
      pm25Min = 28;
      pm25Max = 95;
      pm10Min = 45;
      pm10Max = 160;
      no2Min = 45;
      no2Max = 120;
      so2Min = 6;
      so2Max = 28;
      break;
    case StationType.Urban:
      pm25Min = 18;
      pm25Max = 82;
      pm10Min = 32;
      pm10Max = 135;
      no2Min = 18;
      no2Max = 68;
      so2Min = 4;
      so2Max = 22;
      break;
    case StationType.Suburban:
      pm25Min = 12;
      pm25Max = 52;
      pm10Min = 22;
      pm10Max = 88;
      no2Min = 8;
      no2Max = 42;
      so2Min = 2;
      so2Max = 12;
      break;
    case StationType.Rural:
      pm25Min = 4;
      pm25Max = 28;
      pm10Min = 8;
      pm10Max = 45;
      no2Min = 3;
      no2Max = 18;
      so2Min = 1;
      so2Max = 8;
      break;
    default:
      pm25Min = 10;
      pm25Max = 70;
      pm10Min = 20;
      pm10Max = 110;
      no2Min = 10;
      no2Max = 55;
      so2Min = 3;
      so2Max = 18;
  }

  const jitter = 0.9 + rnd() * 0.2;
  const pm25 =
    clamp(
      (pm25Min + rnd() * (pm25Max - pm25Min)) *
        nightTimeMultiplier *
        rushHourMultiplier *
        weekendFactor *
        jitter,
      2,
      220,
    );
  const pm10 = clamp(
    (pm10Min + rnd() * (pm10Max - pm10Min)) *
      nightTimeMultiplier *
      rushHourMultiplier *
      weekendFactor *
      jitter,
    4,
    250,
  );

  const no2 = clamp(
    (no2Min + rnd() * (no2Max - no2Min)) * rushHourMultiplier * weekendFactor,
    2,
    180,
  );
  const so2 = clamp(
    (so2Min + rnd() * (so2Max - so2Min)) * (cityType === StationType.Industrial ? 1.1 : 1),
    1,
    60,
  );

  const coMg =
    cityType === StationType.Traffic || cityType === StationType.Urban
      ? clamp((0.35 + rnd() * 3.2) * rushHourMultiplier * weekendFactor, 0.1, 5)
      : clamp((0.15 + rnd() * 2.2) * rushHourMultiplier, 0.1, 4);

  const o3 = o3ForHour(hour, rnd);

  return [
    {
      pollutant: Pollutant.PM25,
      value: Math.round(pm25 * 10) / 10,
      unit: "µg/m³",
      limit: WHO_LIMITS[Pollutant.PM25],
    },
    {
      pollutant: Pollutant.PM10,
      value: Math.round(pm10 * 10) / 10,
      unit: "µg/m³",
      limit: WHO_LIMITS[Pollutant.PM10],
    },
    {
      pollutant: Pollutant.NO2,
      value: Math.round(no2 * 10) / 10,
      unit: "µg/m³",
      limit: WHO_LIMITS[Pollutant.NO2],
    },
    {
      pollutant: Pollutant.SO2,
      value: Math.round(so2 * 10) / 10,
      unit: "µg/m³",
      limit: WHO_LIMITS[Pollutant.SO2],
    },
    {
      pollutant: Pollutant.CO,
      value: Math.round(coMg * 100) / 100,
      unit: "mg/m³",
      limit: WHO_LIMITS[Pollutant.CO],
    },
    {
      pollutant: Pollutant.O3,
      value: Math.round(o3 * 10) / 10,
      unit: "µg/m³",
      limit: WHO_LIMITS[Pollutant.O3],
    },
  ];
};

const createEquipmentInfo = (stationId: string): EquipmentInfo => {
  const rnd = mulberry32(hashSeed(["equip", stationId]));
  const y = 2017 + Math.floor(rnd() * 7);
  const m = 1 + Math.floor(rnd() * 12);
  const d = 1 + Math.floor(rnd() * 28);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    model: `AQ-${stationId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase()}`,
    manufacturer: "EcoSensors UA",
    installedDate: `${y}-${pad(m)}-${pad(d)}T00:00:00Z`,
    lastCalibration: `${new Date().getFullYear()}-${pad(1 + Math.floor(rnd() * 6))}-${pad(1 + Math.floor(rnd() * 20))}T00:00:00Z`,
    nextCalibration: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0] + "T00:00:00Z",
    softwareVersion: "2.3.1",
  };
};

type StationSeed = Omit<MonitoringStation, "currentAqi" | "lastUpdate">;

const STATION_SEEDS: StationSeed[] = [
  {
    id: "st-kyiv-001",
    name: "Хрещатик — міська фонова",
    city: "Київ",
    country: "Україна",
    region: Region.Kyiv,
    coordinates: { lat: 50.4501, lng: 30.5234, altitude: 116 },
    type: StationType.Urban,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2020-05-15T00:00:00Z",
    equipment: createEquipmentInfo("st-kyiv-001"),
    contactPerson: "Іван Петренко",
    contactEmail: "ivan.petrenko@eco.ua",
    contactPhone: "+380 44 123 45 67",
  },
  {
    id: "st-kyiv-002",
    name: "Святошин — приміська зона",
    city: "Київ",
    country: "Україна",
    region: Region.Kyiv,
    coordinates: { lat: 50.458, lng: 30.3897, altitude: 162 },
    type: StationType.Suburban,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2021-03-20T00:00:00Z",
    equipment: createEquipmentInfo("st-kyiv-002"),
    contactPerson: "Марія Кравченко",
    contactEmail: "maria.kravchenko@eco.ua",
    contactPhone: "+380 44 234 56 78",
  },
  {
    id: "st-kharkiv-001",
    name: "Сумська — транспортна магістраль",
    city: "Харків",
    country: "Україна",
    region: Region.Kharkiv,
    coordinates: { lat: 49.9935, lng: 36.2304, altitude: 152 },
    type: StationType.Traffic,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2022-04-12T00:00:00Z",
    equipment: createEquipmentInfo("st-kharkiv-001"),
    contactPerson: "Олексій Сидоренко",
    contactEmail: "oleksiy.sydorenko@eco.ua",
    contactPhone: "+380 57 210 44 88",
  },
  {
    id: "st-lviv-001",
    name: "Площа Ринок",
    city: "Львів",
    country: "Україна",
    region: Region.Lviv,
    coordinates: { lat: 49.8397, lng: 24.0297, altitude: 282 },
    type: StationType.Urban,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2019-08-10T00:00:00Z",
    equipment: createEquipmentInfo("st-lviv-001"),
    contactPerson: "Ольга Коваль",
    contactEmail: "olga.koval@eco.ua",
    contactPhone: "+380 32 345 67 89",
  },
  {
    id: "st-dnipro-001",
    name: "Промзона — Лівий берег",
    city: "Дніпро",
    country: "Україна",
    region: Region.Dnipro,
    coordinates: { lat: 48.4647, lng: 35.0462, altitude: 70 },
    type: StationType.Industrial,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2019-11-20T00:00:00Z",
    equipment: createEquipmentInfo("st-dnipro-001"),
    contactPerson: "Сергій Мельник",
    contactEmail: "sergiy.melnyk@eco.ua",
    contactPhone: "+380 56 456 78 90",
  },
  {
    id: "st-odesa-001",
    name: "Приморський район — морський фон",
    city: "Одеса",
    country: "Україна",
    region: Region.Odesa,
    coordinates: { lat: 46.4825, lng: 30.7233, altitude: 40 },
    type: StationType.Urban,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2020-09-30T00:00:00Z",
    equipment: createEquipmentInfo("st-odesa-001"),
    contactPerson: "Анатолій Морозов",
    contactEmail: "anatoly.morozov@eco.ua",
    contactPhone: "+380 48 567 89 01",
  },
  {
    id: "st-chornobyl-001",
    name: "Чорнобиль — зона спостереження",
    city: "Чорнобиль",
    country: "Україна",
    region: Region.Kyiv,
    coordinates: { lat: 51.3883, lng: 30.1141, altitude: 130 },
    type: StationType.Rural,
    status: StationStatus.Active,
    isActive: true,
    installedDate: "2018-06-15T00:00:00Z",
    equipment: createEquipmentInfo("st-chornobyl-001"),
    contactPerson: "Петро Бондаренко",
    contactEmail: "petro.bondarenko@eco.ua",
    contactPhone: "+380 33 678 90 12",
    notes: "Фоновий моніторинг у межах зони відчуження",
  },
];

/**
 * Генерує часовий ряд погодинних вимірювань за останні `days` днів.
 * Значення детерміновані від stationId (відтворювані), з добовими та тижневими варіаціями.
 */
export function generateHistoricalMeasurements(
  stationId: string,
  stationType: StationType,
  days: number = 35,
): Measurement[] {
  const measurements: Measurement[] = [];
  const now = new Date();

  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(
      now.getTime() - dayOffset * 24 * 60 * 60 * 1000,
    );
    const dayOfWeek = dayDate.getDay();

    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(
        now.getTime() -
          (dayOffset * 24 + (23 - hour)) * 60 * 60 * 1000,
      );

      const rnd = mulberry32(
        hashSeed([stationId, dayOffset, hour, stationType]),
      );

      const readings = generateReadingsForCityType(
        stationType,
        hour,
        dayOfWeek,
        rnd,
      );
      const aqi = calculateAqiFromReadings(readings);

      const tempBase =
        8 +
        Math.sin(((hour - 6) / 24) * Math.PI * 2) * 8 +
        (dayOffset < 10 ? 4 : 0);
      const temperature = clamp(
        tempBase + (rnd() - 0.5) * 6,
        -12,
        36,
      );
      const humidityBase = 72 - (hour >= 8 && hour <= 18 ? 18 : -5);
      const humidity = clamp(
        humidityBase + (rnd() - 0.5) * 14,
        28,
        96,
      );
      const windSpeedBase = hour >= 11 && hour <= 17 ? 7.5 : 3.8;
      const windSpeed = clamp(
        windSpeedBase + (rnd() - 0.5) * 4,
        0,
        18,
      );

      const iso = timestamp.toISOString();
      measurements.push({
        id: `${stationId}-d${String(dayOffset).padStart(2, "0")}h${String(hour).padStart(2, "0")}`,
        stationId,
        timestamp: iso,
        readings,
        aqi: Math.round(aqi),
        level: determineAqiLevel(aqi),
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        windDirection: Math.floor(rnd() * 360),
        pressure: Math.round((1005 + rnd() * 18) * 10) / 10,
        visibility: Math.round((6 + rnd() * 14) * 10) / 10,
        receivedAt: iso,
        processedAt: iso,
      });
    }
  }

  return measurements.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

function buildStationsAndMeasurements(): {
  mockStations: MonitoringStation[];
  mockMeasurements: Record<string, Measurement[]>;
} {
  const mockMeasurements: Record<string, Measurement[]> = {};
  const mockStations: MonitoringStation[] = STATION_SEEDS.map((seed) => {
    const series = generateHistoricalMeasurements(seed.id, seed.type, 35);
    mockMeasurements[seed.id] = series;
    const last = series[series.length - 1]!;
    return {
      ...seed,
      lastUpdate: last.timestamp,
      currentAqi: airQualityFromReadings(last.readings),
    };
  });
  return { mockStations, mockMeasurements };
}

export const { mockStations, mockMeasurements } = buildStationsAndMeasurements();
