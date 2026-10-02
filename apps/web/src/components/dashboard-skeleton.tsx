import React from "react";

/**
 * HELIORA — High-End Clinical Semantic Dashboard Skeleton
 * 
 * Spec:
 * - Zero Cumulative Layout Shift (CLS = 0) matching /dashboard layout 1:1
 * - Specular Shimmer gradient wave (smooth editorial sheen)
 * - Faint biosignal EKG trace line for medical AI context
 * - Strictly editorial typography & bento geometry, NO pill chips
 */
export function DashboardSkeleton() {
  return (
    <div
      className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto"
      aria-busy="true"
      aria-label="Memuat ringkasan klinis dashboard..."
    >
      {/* ── Top Header Row Skeleton ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-900/10 pb-6">
        <div className="space-y-2.5">
          <div className="h-3.5 w-36 rounded-md shimmer-specular" />
          <div className="h-8 sm:h-9 w-60 sm:w-80 rounded-xl shimmer-specular" />
          <div className="h-4 w-72 sm:w-96 rounded-md shimmer-specular opacity-75" />
        </div>
        <div className="h-4 w-48 rounded-md shimmer-specular self-start sm:self-auto" />
      </div>

      {/* ── Row 1: Two Tabular Scorecards Skeleton (Health & Lifestyle) ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[170px]"
          >
            {/* Faint Biosignal EKG Wave Trace in Background */}
            <svg
              className="absolute -right-4 -bottom-3 w-48 h-24 opacity-[0.07] text-brand-900 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 12h3.5l2 2.5 3-10.5 3 16 2.5-10 2 2h4.5" />
            </svg>

            <div className="space-y-3">
              <div className="h-3 w-32 rounded-md shimmer-specular" />
              <div className="h-12 w-24 rounded-xl shimmer-specular" />
            </div>

            <div className="pt-4 border-t border-brand-900/5 flex items-center justify-between">
              <div className="h-3.5 w-44 rounded-md shimmer-specular" />
              <div className="h-3 w-20 rounded-md shimmer-specular" />
            </div>
          </div>
        ))}
      </section>

      {/* ── Row 2: Three Disease Risk Cards Skeleton ── */}
      <section className="space-y-3">
        <div className="h-3.5 w-40 rounded-md shimmer-specular" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between min-h-[190px]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-36 rounded-md shimmer-specular" />
                  <div className="h-3 w-16 rounded-md shimmer-specular" />
                </div>
                <div className="h-3 w-24 rounded-md shimmer-specular" />
                <div className="h-9 w-20 rounded-lg shimmer-specular mt-2" />
              </div>

              <div className="space-y-2 pt-2 border-t border-brand-900/5">
                <div className="h-1.5 w-full rounded-full shimmer-specular" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3 w-28 rounded-md shimmer-specular" />
                  <div className="h-3 w-16 rounded-md shimmer-specular" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Row 3: Interactive Simulation Hub Dark Card Skeleton ── */}
      <section className="bg-brand-900 rounded-3xl p-6 lg:p-8 text-white space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-2">
            <div className="h-3 w-36 rounded-md shimmer-dark-specular" />
            <div className="h-6 w-64 rounded-xl shimmer-dark-specular" />
            <div className="h-3 w-80 rounded-md shimmer-dark-specular opacity-75" />
          </div>
          <div className="h-4 w-40 rounded-md shimmer-dark-specular self-start sm:self-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-4 flex flex-col justify-between min-h-[160px]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded shimmer-dark-specular" />
                  <div className="h-4 w-36 rounded-md shimmer-dark-specular" />
                </div>
                <div className="h-3 w-full rounded-md shimmer-dark-specular opacity-80" />
                <div className="h-3 w-3/4 rounded-md shimmer-dark-specular opacity-80" />
                <div className="h-2.5 w-48 rounded shimmer-dark-specular opacity-60 pt-1" />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="h-3 w-24 rounded shimmer-dark-specular" />
                <div className="h-3.5 w-32 rounded shimmer-dark-specular" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Row 4: Two-Column Clinical Breakdown (XAI & Recommendations) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top Contributing Factors (XAI SHAP) */}
        <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="space-y-1.5 border-b border-brand-900/10 pb-3">
            <div className="h-3 w-32 rounded-md shimmer-specular" />
            <div className="h-5 w-56 rounded-lg shimmer-specular" />
            <div className="h-3 w-72 rounded-md shimmer-specular opacity-75" />
          </div>

          <div className="space-y-4 pt-1">
            {[78, 52, 65, 38].map((widthPercent, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-36 rounded-md shimmer-specular" />
                  <div className="h-3 w-16 rounded-md shimmer-specular" />
                </div>
                <div className="h-2 rounded-full shimmer-specular" style={{ width: `${widthPercent}%` }} />
                <div className="h-2.5 w-48 rounded shimmer-specular opacity-60" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Prioritized Clinical Recommendations */}
        <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-brand-900/10 pb-3">
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded-md shimmer-specular" />
              <div className="h-5 w-52 rounded-lg shimmer-specular" />
            </div>
            <div className="h-3.5 w-20 rounded-md shimmer-specular" />
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-brand-900/5 bg-brand-50/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-44 rounded-md shimmer-specular" />
                  <div className="h-3 w-20 rounded-md shimmer-specular" />
                </div>
                <div className="h-3 w-full rounded-md shimmer-specular" />
                <div className="h-3 w-4/5 rounded-md shimmer-specular" />
                <div className="pt-2 flex items-center justify-between border-t border-brand-900/5">
                  <div className="h-3 w-28 rounded-md shimmer-specular" />
                  <div className="h-3 w-20 rounded-md shimmer-specular" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer Statutory Disclaimer Bar Skeleton ── */}
      <footer className="pt-4 border-t border-brand-900/10">
        <div className="p-4 rounded-xl border border-brand-900/10 bg-white/60 flex items-center gap-3">
          <div className="size-4 rounded-full shimmer-specular shrink-0" />
          <div className="h-3 w-full rounded-md shimmer-specular" />
        </div>
      </footer>
    </div>
  );
}
