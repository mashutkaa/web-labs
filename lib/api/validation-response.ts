import type { ZodError } from "zod";
import type { FieldError } from "@/types/api/error";
import { ErrorCode, HTTP_STATUS } from "@/types/api/error";
import { createErrorResponse, createNextResponse } from "@/lib/api/handlers";

/**
 * Перетворює Zod issues у структуру полів для відповіді API.
 */
export function zodIssuesToFieldErrors(error: ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
    type: issue.code,
  }));
}

/**
 * JSON-відповідь 400 з кодом VALIDATION_ERROR та списком полів.
 */
export function validationErrorResponse(
  message: string,
  error: ZodError,
): Response {
  const payload = {
    code: ErrorCode.VALIDATION_ERROR,
    message,
    statusCode: HTTP_STATUS.BAD_REQUEST,
    timestamp: new Date().toISOString(),
    fields: zodIssuesToFieldErrors(error),
  };
  return createNextResponse(
    createErrorResponse(payload),
    HTTP_STATUS.BAD_REQUEST,
  );
}
