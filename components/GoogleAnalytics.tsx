"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { GA_MEASUREMENT_ID, gaEvent, gaPageView, isGaEnabled } from "@/lib/gtag";

function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageTimingSent = useRef(false);

  useEffect(() => {
    if (!isGaEnabled()) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    gaPageView(url);

    if (pageTimingSent.current) return;
    if (typeof performance === "undefined") return;
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.loadEventEnd > 0) {
      pageTimingSent.current = true;
      const loadMs = Math.round(nav.loadEventEnd - nav.startTime);
      const dclMs = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      gaEvent("page_timing", {
        page_path: pathname,
        load_time_ms: loadMs,
        dom_content_loaded_ms: dclMs,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

function WebVitalsToGa() {
  useReportWebVitals((metric) => {
    gaEvent("web_vitals", {
      metric_name: metric.name,
      metric_rating: metric.rating,
      metric_id: metric.id,
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
    });
  });
  return null;
}

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
      <WebVitalsToGa />
    </>
  );
}
