import type { NextRequest } from "next/server";
import { ErrorCode, HTTP_STATUS } from "@/types/api/error";
import {
  createErrorResponse,
  createNextResponse,
} from "@/lib/api/handlers";
import { logger } from "@/lib/logger";

const USER_500_UK =
  "На сервері сталася помилка. Спробуйте пізніше або зверніться до адміністратора.";

/**
 * 500 для API з контекстом запиту (лог + зрозуміле повідомлення клієнту).
 */
export function internalServerErrorForRequest(
  request: NextRequest,
  logLabel: string,
  error: unknown,
): Response {
  const request_id =
    request.headers.get("x-request-id") ?? request.headers.get("X-Request-Id");
  const route = `${request.method} ${request.nextUrl.pathname}`;
  const client_ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");

  if (error instanceof Error) {
    logger.error(
      {
        err: error,
        log_label: logLabel,
        request_id,
        route,
        client_ip,
        query: request.nextUrl.search || undefined,
      },
      "api_internal_error",
    );
  } else {
    logger.error(
      {
        err_value: String(error),
        log_label: logLabel,
        request_id,
        route,
        client_ip,
      },
      "api_internal_error",
    );
  }

  return createNextResponse(
    createErrorResponse({
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: USER_500_UK,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    }),
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
  );
}
