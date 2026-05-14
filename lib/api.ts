import { MonitoringStation } from "@/types/station";
import { Measurement, TimeSeries } from "@/types/measurement";
import {
  ApiResponse,
  PaginatedResponse,
  StationFilters,
  PaginationParams,
} from "@/types/api";
import { mockStations, mockMeasurements } from "./mock-data";
import { Pollutant } from "@/types/air-quality";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async getStations(
    filters?: StationFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<MonitoringStation>> {
    await delay(600); // Simulate network

    let filtered = [...mockStations];

    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.city.toLowerCase().includes(searchLower),
        );
      }
      if (filters.city) {
        filtered = filtered.filter((s) => s.city === filters.city);
      }
      if (filters.type) {
        filtered = filtered.filter((s) => s.type === filters.type);
      }
      if (filters.isActive !== undefined) {
        filtered = filtered.filter((s) => s.isActive === filters.isActive);
      }
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit;
    const paginatedData = filtered.slice(start, start + limit);

    return {
      data: paginatedData,
      error: null,
      timestamp: new Date().toISOString(),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  async getStationById(id: string): Promise<ApiResponse<MonitoringStation>> {
    await delay(400);

    const station = mockStations.find((s) => s.id === id);

    if (!station) {
      return {
        data: null,
        error: { code: "NOT_FOUND", message: "Station not found" },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      data: station,
      error: null,
      timestamp: new Date().toISOString(),
    };
  },

  async getStationMeasurements(
    stationId: string,
    days: number = 7,
  ): Promise<ApiResponse<Measurement[]>> {
    await delay(500);

    const measurements = mockMeasurements[stationId];

    if (!measurements) {
      return {
        data: null,
        error: {
          code: "NOT_FOUND",
          message: "Measurements not found for this station",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Filter by days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const filtered = measurements.filter(
      (m) => new Date(m.timestamp) >= cutoff,
    );

    return {
      data: filtered,
      error: null,
      timestamp: new Date().toISOString(),
    };
  },

  async getPollutantTimeSeries(
    stationId: string,
    pollutant: Pollutant,
    days: number = 7,
  ): Promise<ApiResponse<TimeSeries>> {
    await delay(300);

    const measurementsResponse = await this.getStationMeasurements(
      stationId,
      days,
    );

    if (measurementsResponse.error || !measurementsResponse.data) {
      return {
        data: null,
        error: measurementsResponse.error,
        timestamp: new Date().toISOString(),
      };
    }

    const measurements = measurementsResponse.data;

    // Find unit from first reading
    const firstReading = measurements[0]?.readings.find(
      (r) => r.pollutant === pollutant,
    );
    const unit = firstReading?.unit || "";

    const timeSeriesData = measurements.map((m) => {
      const reading = m.readings.find((r) => r.pollutant === pollutant);
      return {
        timestamp: m.timestamp,
        value: reading ? reading.value : 0,
      };
    });

    return {
      data: {
        pollutant,
        unit,
        data: timeSeriesData,
      },
      error: null,
      timestamp: new Date().toISOString(),
    };
  },
};
