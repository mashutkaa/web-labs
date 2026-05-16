"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
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
        source: "next_app_error",
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        url:
          typeof window !== "undefined" ? window.location.href : undefined,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Щось пішло не так
        </h1>
        <p className="mt-3 text-gray-600">
          Сталася неочікувана помилка під час відображення сторінки. Подія
          зафіксована для аналізу. Спробуйте повторити дію або поверніться на
          головну.
        </p>
        {process.env.NODE_ENV === "development" && error.message ? (
          <p className="mt-4 rounded-lg bg-gray-100 p-3 text-left font-mono text-xs text-gray-700 break-all">
            {error.message}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Спробувати знову
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          На головну
        </Link>
      </div>
    </div>
  );
}
