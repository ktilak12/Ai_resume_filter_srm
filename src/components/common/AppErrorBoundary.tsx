import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Keeps an unexpected rendering error from turning the entire portal into a
 * blank screen, while giving the user a clear path back to a working page.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Keep diagnostic information available during development without exposing it to users.
    if (import.meta.env.DEV) {
      console.error('Unhandled application error', error, errorInfo);
    }
  }

  private handleReturnHome = (): void => {
    window.location.assign('/');
  };

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-zinc-950 px-6 text-white flex items-center justify-center" role="alert">
        <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">SRM ResumeAI</p>
          <h1 className="mt-3 text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            We could not load this page. Your saved data has not been changed.
          </p>
          <button
            type="button"
            onClick={this.handleReturnHome}
            className="mt-6 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Return to home
          </button>
        </section>
      </main>
    );
  }
}
