import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 text-white flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          The link may be outdated, or the page may have moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          Go to home
        </Link>
      </section>
    </main>
  );
}
