import { z } from "zod";

// Station creation schema
export const StationCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  elevation: z.number().optional(),
  type: z
    .enum(["urban", "suburban", "rural", "industrial"])
    .refine(
      (val) => ["urban", "suburban", "rural", "industrial"].includes(val),
      { message: "Type must be one of: urban, suburban, rural, industrial" },
    ),
});

export type StationCreate = z.infer<typeof StationCreateSchema>;

// Measurement reading schema
const ReadingSchema = z.object({
  pollutant: z.string().min(1, "Pollutant name is required"),
  value: z.number().min(0, "Value must be non-negative"),
  unit: z.string().min(1, "Unit is required"),
  limit: z.number().min(0, "Limit must be non-negative"),
});

// Measurement creation schema - supports both UUID and station ID format
export const MeasurementCreateSchema = z.object({
  stationId: z.string().min(1, "stationId is required"),
  timestamp: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Timestamp must be a valid ISO date string",
    ),
  readings: z.array(ReadingSchema).min(1, "At least one reading is required"),
  temperature: z.number().optional(),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).optional(),
});

export type MeasurementCreate = z.infer<typeof MeasurementCreateSchema>;

// Measurements query schema for listing
export const MeasurementsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(250, "Limit must not exceed 250")
      .default(20),
    stationId: z.string().min(1, "stationId is required"),
    startDate: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "startDate must be a valid ISO date string",
      )
      .nullish(),
    endDate: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "endDate must be a valid ISO date string",
      )
      .nullish(),
    sort: z.enum(["timestamp", "aqi"]).default("timestamp"),
    order: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) => {
      if (data.startDate != null && data.endDate != null) {
        return (
          Date.parse(String(data.endDate)) >= Date.parse(String(data.startDate))
        );
      }
      return true;
    },
    {
      message: "endDate must be on or after startDate",
      path: ["endDate"],
    },
  );

export type MeasurementsQuery = z.infer<typeof MeasurementsQuerySchema>;

// Time series query schema
export const TimeSeriesQuerySchema = z.object({
  stationId: z.string().min(1, "stationId is required"),
  days: z.coerce
    .number()
    .int()
    .min(1, "days must be at least 1")
    .max(30, "days cannot exceed 30")
    .default(7),
  pollutant: z.string().nullish(),
});

export type TimeSeriesQuery = z.infer<typeof TimeSeriesQuerySchema>;

// Query parameters schema
export const QuerySchema = z
  .object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must not exceed 100")
      .default(10),
    sort: z.enum(["name", "date", "aqi"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    search: z.string().nullish(),
    city: z.string().nullish(),
    type: z.string().nullish(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    /** Повернути всі станції без пагінації (true / 1) */
    all: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate.getTime() >= data.startDate.getTime();
      }
      return true;
    },
    {
      message: "endDate must be on or after startDate",
      path: ["endDate"],
    },
  )
  .transform((data) => ({
    ...data,
    search: data.search || undefined,
    city: data.city || undefined,
    type: data.type || undefined,
    all: data.all === "true" || data.all === "1",
  }));

export type Query = z.infer<typeof QuerySchema>;

// Update station schema
export const UpdateStationSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  city: z.string().min(1).optional(),
  type: z.enum(["urban", "suburban", "rural", "industrial"]).optional(),
});

export type UpdateStation = z.infer<typeof UpdateStationSchema>;

// Helper functions for validation
export function validateQuery(data: unknown) {
  return QuerySchema.safeParse(data);
}

export function validateStationCreate(data: unknown) {
  return StationCreateSchema.safeParse(data);
}

export function validateMeasurementCreate(data: unknown) {
  return MeasurementCreateSchema.safeParse(data);
}

export function validateMeasurementsQuery(data: unknown) {
  return MeasurementsQuerySchema.safeParse(data);
}

export function validateTimeSeriesQuery(data: unknown) {
  return TimeSeriesQuerySchema.safeParse(data);
}

export function validateUpdate(data: unknown) {
  return UpdateStationSchema.safeParse(data);
}

// Export all schemas as default
const schemas = {
  StationCreateSchema,
  MeasurementCreateSchema,
  MeasurementsQuerySchema,
  TimeSeriesQuerySchema,
  QuerySchema,
  UpdateStationSchema,
};

export default schemas;
