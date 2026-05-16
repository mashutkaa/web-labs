/**
 * Google Analytics 4 (gtag.js).
 * Задайте NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX у .env.local для увімкнення.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export function isGaEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

export function gaPageView(url: string): void {
  if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function gaEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isGaEnabled() || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}
