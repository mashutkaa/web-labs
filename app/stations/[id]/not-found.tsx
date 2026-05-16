import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

export default function StationNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Radio className="h-14 w-14 text-gray-300" aria-hidden />
      <div className="max-w-md space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Станцію не знайдено
        </h1>
        <p className="text-gray-600">
          Моніторингової станції з таким ідентифікатором у системі немає. Оберіть
          іншу зі списку або на карті.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          До панелі
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Карта станцій
        </Link>
      </div>
    </div>
  );
}
