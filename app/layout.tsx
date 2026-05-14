import type { Metadata } from "next";
import { Wind, Activity, BookOpen, Info } from "lucide-react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ЕкоМонітор - Панель моніторингу якості повітря",
  description: "Система моніторингу якості повітря в Україні",
};

const navItems = [
  {
    path: "/",
    label: "Панель моніторингу",
    icon: Activity,
  },
  {
    path: "/pollutants",
    label: "Довідник забруднювачів",
    icon: BookOpen,
  },
  {
    path: "/about",
    label: "Про проєкт",
    icon: Info,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="bg-gray-50">
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden md:block w-64 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto flex-shrink-0">
            <div className="p-6 flex items-center gap-2 text-emerald-600 font-bold text-2xl border-b border-gray-100">
              <Wind className="h-8 w-8" />
              <span>ЕкоМонітор</span>
            </div>

            <nav className="p-4 space-y-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-4 px-3">
                Меню
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icon className="h-5 w-5 text-gray-400" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  ЛР
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Лабораторна робота
                  </p>
                  <p className="text-xs text-gray-500">
                    Next.js та SSR концепції
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden">
            <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
