import React from "react";

export function DashboardSkeleton() {
  return (
    <div
      className="flex-1 min-w-0 flex flex-col"
      aria-busy="true"
      aria-label="Memuat dashboard..."
    >
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-8 max-w-5xl w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="h-8 w-48 rounded-lg bg-neutral-200 animate-pulse" />
            <div className="h-3 w-40 rounded-md bg-neutral-200 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-neutral-200 animate-pulse" />
        </div>

        {/* Scores */}
        <section className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-3">
                <div className="h-4 w-32 rounded-md bg-neutral-200 animate-pulse" />
                <div className="h-10 w-20 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="h-3 w-24 rounded-md bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Risk */}
        <section className="space-y-4">
          <div className="h-5 w-32 rounded-md bg-neutral-200 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3">
                <div className="h-4 w-28 rounded-md bg-neutral-200 animate-pulse" />
                <div className="h-8 w-16 rounded-lg bg-neutral-200 animate-pulse" />
                <div className="h-2 w-full rounded-full bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Factors */}
        <section className="space-y-4">
          <div className="h-5 w-32 rounded-md bg-neutral-200 animate-pulse" />
          <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100 px-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="h-4 w-32 rounded-md bg-neutral-200 animate-pulse" />
                  <div className="h-3 w-24 rounded-md bg-neutral-200 animate-pulse" />
                </div>
                <div className="h-1 w-full rounded-full bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="space-y-3">
          <div className="h-5 w-36 rounded-md bg-neutral-200 animate-pulse" />
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-2">
                <div className="h-4 w-48 rounded-md bg-neutral-200 animate-pulse" />
                <div className="h-3 w-full rounded-md bg-neutral-200 animate-pulse" />
                <div className="h-3 w-3/4 rounded-md bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        {/* Simulator & Projection */}
        <section className="space-y-3">
          <div className="h-5 w-40 rounded-md bg-neutral-200 animate-pulse" />
          <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-4">
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded-md bg-neutral-200 animate-pulse" />
                  <div className="h-3 w-40 rounded-md bg-neutral-200 animate-pulse" />
                </div>
                <div className="h-4 w-4 rounded-md bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        <footer>
          <div className="h-3 w-full rounded-md bg-neutral-200 animate-pulse" />
        </footer>
      </main>
    </div>
  );
}