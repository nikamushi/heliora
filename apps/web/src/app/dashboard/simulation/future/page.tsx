"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sliders,
  TrendingUp,
  ArrowRight,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  FutureSimulationResponse,
  SimulationHorizon,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { RiskBadge, getRiskTone } from "@/components/risk-badge";

const HORIZON_OPTIONS: { days: SimulationHorizon; label: string; period: string }[] = [
  { days: 30, label: "30 Hari", period: "Adaptasi Awal" },
  { days: 90, label: "90 Hari", period: "Respons Adaptif" },
  { days: 180, label: "180 Hari", period: "Stabilisasi Preventif" },
];

export default function FutureSimulationPage() {
  const router = useRouter();
  const { isAuthorized, redirectToLogin } = useRequireAuth();

  const [selectedHorizon, setSelectedHorizon] = useState<SimulationHorizon>(90);
  const [simulationData, setSimulationData] = useState<FutureSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  }, []);

  const handleHorizonSelect = useCallback((horizon: SimulationHorizon) => {
    setSelectedHorizon(horizon);
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadSimulation() {
      setError(null);
      try {
        const data = await apiClient.simulation.future({ horizon_days: selectedHorizon });
        if (!isCancelled) {
          setSimulationData(data);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof ApiClientError) {
          if (err.kind === "unauthorized") {
            redirectToLogin();
            return;
          }
          setError(err);
        } else {
          setError(new ApiClientError(0, "Gagal memuat hasil proyeksi masa depan."));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSimulation();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, selectedHorizon, reloadKey, redirectToLogin]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Top Header / Breadcrumb */}
      <header className="h-16 border-b border-brand-900/10 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-6 hidden lg:flex items-center">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link href="/dashboard" className="text-brand-900/50 uppercase hover:text-brand-900 transition-colors">
            Dashboard
          </Link>
          <span className="text-brand-900/30">/</span>
          <span className="text-brand-900/50 uppercase">Simulasi</span>
          <span className="text-brand-900/30">/</span>
          <span className="text-brand-900 font-bold uppercase">Proyeksi Horison</span>
        </div>
      </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-6xl w-full mx-auto">
          {/* Header Section */}
          <div className="space-y-2 border-b border-brand-900/10 pb-6">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
              Simulasi Kesehatan Preventif
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
                  Proyeksi Horison Masa Depan
                </h1>
                <p className="text-sm text-brand-900/70 mt-1 max-w-2xl leading-relaxed">
                  Eksplorasi estimasi lintasan risiko kardiometabolik dan skor kesehatan Anda dalam rentang 30, 90, dan 180 hari berdasarkan asumsi kelangsungan pola hidup saat ini.
                </p>
              </div>

              {/* Horizon Selector Tabs (STRICT NO PILL CHIPS) */}
              <div className="inline-flex rounded-xl p-1 bg-white border border-brand-900/15 shadow-xs">
                {HORIZON_OPTIONS.map((opt) => {
                  const isSelected = selectedHorizon === opt.days;
                  return (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => handleHorizonSelect(opt.days)}
                      disabled={isLoading}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center ${
                        isSelected
                          ? "bg-brand-900 text-white shadow-xs"
                          : "text-brand-900/70 hover:text-brand-900 hover:bg-neutral-100/60"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span
                        className={`text-[9px] font-mono ${
                          isSelected ? "text-emerald-300" : "text-brand-900/40"
                        }`}
                      >
                        {opt.period}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center space-y-4">
              <h2 className="text-base font-bold text-rose-900">
                {error.kind === "not_found" ? "Profil Kesehatan Belum Ada" : "Gagal Memuat Proyeksi"}
              </h2>
              <p className="text-xs text-rose-800/80 max-w-md mx-auto leading-relaxed">
                {error.message}
              </p>
              <div className="flex justify-center gap-2">
                {error.kind === "not_found" ? (
                  <Link
                    href="/onboarding/health-profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-semibold shadow-xs"
                  >
                    <span>Lengkapi Profil Kesehatan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Button
                    onClick={handleRetry}
                    size="sm"
                    className="rounded-xl bg-brand-900 text-white text-xs cursor-pointer"
                  >
                    Coba Lagi
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !error && (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-32 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
                <div className="h-32 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="h-48 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
                <div className="h-48 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
                <div className="h-48 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
              </div>
            </div>
          )}

          {/* Simulation Content */}
          {!isLoading && simulationData && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Row 1: Score Trajectory Comparison Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Health Score Card */}
                <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                        Skor Komposit Vitalitas
                      </p>
                      <h2 className="text-base font-bold text-brand-900 mt-0.5">
                        Health Score ({selectedHorizon} Hari)
                      </h2>
                    </div>
                    <Clock className="w-5 h-5 text-brand-900/40" />
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-mono text-brand-900/50 uppercase block">
                        Saat Ini
                      </span>
                      <span className="text-2xl font-bold tabular-nums text-brand-900/60">
                        {simulationData.baseline_health_score.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-brand-900/30">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-brand-900/50 uppercase block">
                        Proyeksi {selectedHorizon} Hari
                      </span>
                      <span className="text-3xl font-bold tabular-nums text-brand-900">
                        {simulationData.projected_health_score.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-brand-900/5 flex items-center justify-between text-xs">
                    <span className="text-brand-900/60">Estimasi Perubahan Bersih:</span>
                    <span
                      className={`font-mono font-bold ${
                        simulationData.projected_health_score >= simulationData.baseline_health_score
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {simulationData.projected_health_score >= simulationData.baseline_health_score ? "+" : ""}
                      {(simulationData.projected_health_score - simulationData.baseline_health_score).toFixed(1)} Poin
                    </span>
                  </div>
                </div>

                {/* Lifestyle Score Card */}
                <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                        Konsistensi Kebiasaan Harian
                      </p>
                      <h2 className="text-base font-bold text-brand-900 mt-0.5">
                        Lifestyle Score
                      </h2>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-brand-900/40" />
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] font-mono text-brand-900/50 uppercase block">
                        Saat Ini
                      </span>
                      <span className="text-2xl font-bold tabular-nums text-brand-900/60">
                        {simulationData.baseline_lifestyle_score.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-brand-900/30">
                      <ArrowRight className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-brand-900/50 uppercase block">
                        Target Pemeliharaan
                      </span>
                      <span className="text-3xl font-bold tabular-nums text-brand-900">
                        {simulationData.projected_lifestyle_score.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-brand-900/5 flex items-center justify-between text-xs">
                    <span className="text-brand-900/60">Status Adaptasi:</span>
                    <span className="font-mono font-semibold text-brand-900">
                      Kebiasaan Dipertahankan Konstan
                    </span>
                  </div>
                </div>
              </section>

              {/* Row 2: Per-Condition Disease Risk Trajectory Cards */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <h2 className="text-base font-bold text-brand-900">
                    Proyeksi Risiko Kardiometabolik ({selectedHorizon} Hari)
                  </h2>
                  <p className="text-xs text-brand-900/60">
                    Bandingkan estimasi risiko saat ini dengan hasil proyeksi model AI.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {simulationData.risk_trajectories.map((traj) => {
                    const tone = getRiskTone(traj.risk_level);
                    const isImproved = traj.delta_percentage < 0;
                    const isDeteriorated = traj.delta_percentage > 0;

                    return (
                      <div
                        key={traj.condition}
                        className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-brand-900">{traj.label}</h3>
                            <RiskBadge level={traj.risk_level} labelOverride={traj.risk_label} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-baseline text-xs">
                              <span className="text-brand-900/60">Saat Ini:</span>
                              <span className="font-mono font-semibold text-brand-900/70">
                                {traj.baseline_score.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-xs text-brand-900 font-medium">
                                Proyeksi {selectedHorizon} Hari:
                              </span>
                              <span className="text-xl font-bold font-mono text-brand-900">
                                {traj.projected_score.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Comparison Bar */}
                          <div className="space-y-1">
                            <div aria-hidden="true" className="h-1.5 w-full bg-brand-900/10 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, traj.projected_score)}%` }}
                                className={`h-full rounded-full ${tone.fillClass}`}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-brand-900/40">Delta Horison:</span>
                              <span
                                className={`font-bold ${
                                  isImproved
                                    ? "text-emerald-700"
                                    : isDeteriorated
                                    ? "text-amber-700"
                                    : "text-brand-900/60"
                                }`}
                              >
                                {traj.delta_percentage > 0 ? "+" : ""}
                                {traj.delta_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-brand-900/70 leading-relaxed pt-1">
                            {traj.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-brand-900/5 flex justify-between items-center text-xs">
                          <span className="text-brand-900/50 font-mono text-[10.5px]">
                            Tren: {traj.trend.toUpperCase()}
                          </span>
                          <Link
                            href={`/dashboard/risk/${traj.condition}`}
                            className="font-semibold text-brand-900 hover:underline underline-offset-2 flex items-center gap-1"
                          >
                            <span>Analisis</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Row 3: Modeling Assumptions (PRD AC-SIM-01) */}
              <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-900/70" />
                  <h2 className="text-sm font-bold text-brand-900">
                    Asumsi Pemodelan Skenario ({selectedHorizon} Hari)
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {simulationData.assumptions.map((assumption, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-brand-50/40 border border-brand-900/5 text-xs text-brand-900/70 flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="font-mono text-brand-900/40 shrink-0 mt-0.5">0{idx + 1}.</span>
                      <span>{assumption}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Row 4: What-If Exploration CTA Card */}
              <section className="rounded-2xl bg-brand-900 text-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-brand-200/60 uppercase">
                      Langkah Eksplorasi Berikutnya
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      Uji Perubahan Gaya Hidup di What-If Simulator
                    </h2>
                    <p className="text-xs text-brand-200/80 leading-relaxed">
                      Penasaran bagaimana jika Anda menambah durasi tidur 1 jam atau meningkatkan frekuensi olahraga ke 180 menit/minggu? Sesuaikan parameter interaktif tanpa mengubah profil asli Anda.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/simulation/what-if"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 hover:bg-neutral-100 text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Buka What-If Simulator</span>
                  </Link>
                </div>
              </section>

              {/* Row 5: Verbatim Medical Disclaimer */}
              <div className="pt-2">
                <DisclaimerBanner variant="banner" className="text-xs text-brand-900/65" />
              </div>
            </div>
          )}
        </main>
      </div>
  );
}
