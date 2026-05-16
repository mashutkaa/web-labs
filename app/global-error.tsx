"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void fetch("/api/errors/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "next_global_error",
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url:
          typeof window !== "undefined" ? window.location.href : undefined,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="uk">
      <body className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900 antialiased">
        <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-red-800">
            Критична помилка додатку
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Не вдалося завантажити кореневий інтерфейс. Подія надіслана в журнал
            сервера. Спробуйте оновити сторінку.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Оновити
          </button>
        </div>
      </body>
    </html>
  );
}
