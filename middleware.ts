import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logMiddlewareAccess } from "@/lib/middleware-log";

export function middleware(request: NextRequest) {
  const started = Date.now();
  const requestId = crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("x-request-id", requestId);

  const duration = Date.now() - started;
  const fwd = request.headers.get("x-forwarded-for");
  const clientIp =
    fwd?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    undefined;

  logMiddlewareAccess({
    level: "info",
    layer: "middleware",
    msg: "http_request",
    ts: new Date().toISOString(),
    request_id: requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    url: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    query: request.nextUrl.search || undefined,
    status_code: response.status,
    middleware_duration_ms: duration,
    client_ip: clientIp,
    user_agent: request.headers.get("user-agent") ?? undefined,
    referer: request.headers.get("referer") ?? undefined,
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Виключити статику Next та іконки — лише сторінки та API.
     */
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
