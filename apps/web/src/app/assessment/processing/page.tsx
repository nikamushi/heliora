"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

const STAGES = [
  { threshold: 25, label: "Validasi parameter biometrik dasar" },
  { threshold: 55, label: "Ekstraksi fitur kardiometabolik CDC BRFSS" },
  { threshold: 85, label: "Perhitungan bobot faktor gaya hidup (SHAP)" },
  { threshold: 100, label: "Penyusunan profil risiko personal" },
];

export default function AssessmentProcessingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/dashboard");
          }, 400);
          return 100;
        }
        // Smooth progression
        const step = prev < 50 ? 15 : prev < 80 ? 10 : 8;
        return Math.min(100, prev + step);
      });
    }, 380);

    return () => clearInterval(interval);
  }, [router]);

  const currentStage = STAGES.find((s) => progress <= s.threshold) || STAGES[STAGES.length - 1];

  return (
    <div className="flex h-screen max-h-screen overflow-hidden items-center justify-center bg-brand-50/20 px-6 text-brand-900 selection:bg-brand-200">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6">
        {/* Header */}
        <div className="space-y-1 text-center">
          <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            HELIORA Risk Engine
          </p>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-900">
            Menganalisis Profil Kesehatan
          </h1>
          <p className="text-xs text-brand-900/60 font-medium">
            Memproses estimasi risiko kardiometabolik berbasis data gaya hidup.
          </p>
        </div>

        {/* Progress Display */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <span className="text-brand-900 font-semibold">{currentStage.label}</span>
            <span className="font-bold text-brand-900">{progress}%</span>
          </div>

          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Pipeline Details */}
        <div className="border-t border-brand-900/10 pt-4 space-y-2">
          {STAGES.map((s, idx) => {
            const isDone = progress > s.threshold;
            const isCurrent = !isDone && (idx === 0 || progress > STAGES[idx - 1].threshold);

            return (
              <div
                key={s.label}
                className={`flex items-center justify-between text-[11px] transition-colors ${
                  isDone
                    ? "text-brand-900 font-medium"
                    : isCurrent
                    ? "text-brand-900 font-bold"
                    : "text-brand-900/30"
                }`}
              >
                <span>{s.label}</span>
                <span className="font-mono text-[10px]">
                  {isDone ? "Selesai" : isCurrent ? "Memproses..." : "Menunggu"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
