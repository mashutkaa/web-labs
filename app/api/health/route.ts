import { createNextResponse, HTTP_STATUS } from "@/lib/api/handlers";

const startTime = Date.now();
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "0.1.0";

export async function GET() {
  try {
    const now = Date.now();
    const uptime = Math.floor((now - startTime) / 1000);

    const response = {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      uptime,
      environment: process.env.NODE_ENV || "unknown",
    };

    return createNextResponse(response, HTTP_STATUS.OK);
  } catch (error) {
    const errorResponse = {
      status: "error" as const,
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      environment: process.env.NODE_ENV || "unknown",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return createNextResponse(errorResponse, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
}
