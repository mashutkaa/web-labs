/**
 * Structured logging (Pino) для Node.js runtime: API routes, Server Components, lib.
 * Рівень: LOG_LEVEL (debug | info | warn | error | silent), за замовчуванням
 * development → debug, production → info.
 *
 * @see lib/logging-schema.ts — опис полів логів
 */

import pino from "pino";

function resolveLevel(): pino.LevelWithSilent {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (
    raw === "debug" ||
    raw === "info" ||
    raw === "warn" ||
    raw === "error" ||
    raw === "silent"
  ) {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export const logger = pino({
  level: resolveLevel(),
  base: {
    service: "eko-monitor",
    env: process.env.NODE_ENV ?? "development",
  },
});
