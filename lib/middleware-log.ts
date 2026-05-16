/**
 * Edge-сумісний structured log (без Pino) для `middleware.ts`.
 * Виводить один JSON-рядок на stderr/stdout для збору в journal / Docker / Vercel.
 */

import type { MiddlewareAccessLog } from "@/lib/logging-schema";

export function logMiddlewareAccess(entry: MiddlewareAccessLog): void {
  console.log(JSON.stringify(entry));
}
