/**
 * Узгоджений формат structured logging для ЕкоМонітор.
 *
 * Усі записи — JSON-рядки з обов’язковими полями:
 * - `level`: "error" | "warn" | "info" | "debug"
 * - `time` або `ts`: ISO-час (Pino додає `time` автоматично)
 * - `msg`: короткий опис події
 *
 * Додаткові поля залежать від шару:
 * - **middleware**: `layer`, `method`, `path`, `url`, `status_code`,
 *   `middleware_duration_ms`, `request_id`, `client_ip`, `user_agent`, `referer`
 * - **api**: `route`, `request_id`, `code`, `err` (об’єкт помилки Pino)
 */

export type LogLevel = "error" | "warn" | "info" | "debug";

/** Базові поля для серверних логів (Node / API). */
export interface BaseAppLogFields {
  level?: LogLevel;
  msg: string;
  /** Кореляція з middleware */
  request_id?: string | null;
  route?: string;
}

/** Запис access-логу з Next.js Middleware (Edge). */
export interface MiddlewareAccessLog {
  level: "info";
  layer: "middleware";
  msg: "http_request";
  ts: string;
  request_id: string;
  method: string;
  path: string;
  url: string;
  query?: string;
  status_code: number;
  middleware_duration_ms: number;
  client_ip?: string;
  user_agent?: string;
  referer?: string;
}
