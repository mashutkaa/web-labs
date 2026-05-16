import Link from "next/link";
import { Home, MapPin, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="text-7xl font-black text-emerald-600/90">404</p>
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Сторінку не знайдено</h1>
        <p className="text-gray-600">
          За цією адресою нічого немає — перевірте URL або поверніться до
          панелі моніторингу.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Home className="h-4 w-4" aria-hidden />
          Головна
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          Карта
        </Link>
        <Link
          href="/pollutants"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <Search className="h-4 w-4" aria-hidden />
          Довідник
        </Link>
      </div>
    </div>
  );
}
