"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export interface ReactErrorBoundaryProps {
  children: ReactNode;
  /** Заголовок у fallback */
  title?: string;
  /** Пояснення для користувача */
  description?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Класичний React Error Boundary — перехоплює помилки рендеру в дочірньому дереві (клієнт).
 * Поруч із `app/error.tsx` (Next.js) дає два рівні захисту.
 */
export class ReactErrorBoundary extends Component<
  ReactErrorBoundaryProps,
  State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error("[ReactErrorBoundary]", error, info.componentStack);
    }
    void fetch("/api/errors/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "react_error_boundary",
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        url:
          typeof window !== "undefined" ? window.location.href : undefined,
      }),
    }).catch(() => {});
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { children, title, description } = this.props;
    if (this.state.hasError && this.state.error) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <h2 className="text-lg font-semibold text-red-900">
            {title ?? "Щось пішло не так"}
          </h2>
          <p className="mt-2 text-sm text-red-800">
            {description ??
              "Сталася неочікувана помилка в інтерфейсі. Спробуйте оновити блок або перезавантажити сторінку."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Спробувати знову
          </button>
        </div>
      );
    }
    return children;
  }
}
