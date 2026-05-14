import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Code, Server, Database } from "lucide-react";

export const metadata = {
  title: "Про проєкт | ЕкоМонітор",
  description: "Інформація про проєкт моніторингу якості повітря",
};

export default function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Про проєкт</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Панель моніторингу якості повітря — Лабораторна робота №1
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Цілі проєкту</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-emerald max-w-none text-gray-600">
          <p>
            Цей навчальний проєкт демонструє веб-додаток, який будується на Next.js та TypeScript.
          </p>
          <ul className="mt-4 space-y-2 list-disc pl-5">
            <li>
              <strong>TypeScript:</strong> Широке використання
              інтерфейсів, перелічень, дженериків та строгої типізації.
            </li>
            <li>
              <strong>Імітація API:</strong> Реалістичний мок-API зі штучною
              затримкою, пагінацією та обробкою помилок.
            </li>
            <li>
              <strong>Архітектура компонентів:</strong> Повторно використовувані
              UI-компоненти, стилізовані з Tailwind CSS.
            </li>
            <li>
              <strong>Візуалізація даних:</strong> Інтеграція Recharts для
              відображення часових рядів екологічних даних.
            </li>
            <li>
              <strong>Next.js App Router:</strong> Сучасна маршрутизація на
              основі файлової системи з підтримкою динамічних маршрутів.
            </li>
            <li>
              <strong>Серверний рендеринг (SSR/SSG):</strong> Оптимізація
              продуктивності через серверні компоненти та статичну генерацію.
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Code className="h-8 w-8 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Архітектура TypeScript
            </h3>
            <p className="text-sm text-gray-600">
              Кодова база використовує строгу конфігурацію TypeScript. Моделі
              даних для станцій, вимірювань та відповідей API чітко визначені за
              допомогою інтерфейсів та перелічень, що забезпечує типобезпеку у
              всьому додатку.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Server className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Шар імітації API
            </h3>
            <p className="text-sm text-gray-600">
              Шар мок-API імітує мережеві запити зі штучними
              затримками. Він підтримує розширені функції, такі як фільтрація,
              сортування та пагінація, імітуючи реальний бекенд-сервіс.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Database className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Next.js App Router
            </h3>
            <p className="text-sm text-gray-600">
              Проєкт використовує сучасну маршрутизацію Next.js на основі App
              Router, яка забезпечує кращу виробництво та поділ на клієнтські та
              серверні компоненти.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <BookOpen className="h-8 w-8 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Навчальні матеріали
            </h3>
            <p className="text-sm text-gray-600">
              Цей проєкт демонструє найкращі практики розробки сучасних
              веб-додатків, включаючи управління станом, обробку помилок та
              оптимізацію продуктивності.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Технологічний стек</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Next.js 16</p>
              <p className="text-xs text-gray-500">App Router, SSR, SSG</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">TypeScript</p>
              <p className="text-xs text-gray-500">Строга типізація</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Tailwind CSS</p>
              <p className="text-xs text-gray-500">Стилізація</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Recharts</p>
              <p className="text-xs text-gray-500">Графіки та діаграми</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Lucide Icons</p>
              <p className="text-xs text-gray-500">Іконки</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">ESLint</p>
              <p className="text-xs text-gray-500">Контроль якості коду</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Контрольовані показники</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Проєкт відстежує наступні екологічні показники якості повітря відповідно до
            стандартів ВООЗ:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <li>✓ PM2.5 — Дрібнодисперсні частинки</li>
            <li>✓ PM10 — Грубодисперсні частинки</li>
            <li>✓ NO₂ — Діоксид азоту</li>
            <li>✓ O₃ — Озон</li>
            <li>✓ SO₂ — Діоксид сірки</li>
            <li>✓ CO — Чадний газ</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
