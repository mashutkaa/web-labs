import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Прийом звітів про помилки з клієнта (`error.tsx`, Error Boundary).
 * Логує критичний контекст на сервері (Pino).
 */
export async function POST(request: NextRequest) {
  const request_id =
    request.headers.get("x-request-id") ?? request.headers.get("X-Request-Id");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return new Response(null, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const message =
    typeof b.message === "string" ? b.message : "client_error_report";
  const source = typeof b.source === "string" ? b.source : "unknown";

  logger.error(
    {
      log_label: "client_error_report",
      request_id,
      source,
      message,
      digest: typeof b.digest === "string" ? b.digest : undefined,
      url: typeof b.url === "string" ? b.url : undefined,
      stack: typeof b.stack === "string" ? b.stack : undefined,
      component_stack:
        typeof b.componentStack === "string" ? b.componentStack : undefined,
    },
    "client_reported_error",
  );

  return new Response(null, { status: 204 });
}
