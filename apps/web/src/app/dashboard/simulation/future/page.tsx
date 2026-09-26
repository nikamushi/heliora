"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Sliders,
  TrendingUp,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  BookOpen,
  ArrowRight,
  ArrowLeft,
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
  const user = useMemo(
    () => (typeof window !== "undefined" ? apiClient.getStoredUser() : null),
    []
  );

  const [selectedHorizon, setSelectedHorizon] = useState<SimulationHorizon>(90);
  const [simulationData, setSimulationData] = useState<FutureSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRiskMenuExpanded, setIsRiskMenuExpanded] = useState(false);
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

  const handleLogout = () => {
    apiClient.auth.logout();
    router.push("/login");
  };

  const userInitials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "HL";

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-50/25 text-brand-900 selection:bg-brand-200 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-brand-900/10 bg-white/85 backdrop-blur-xl h-screen sticky top-0 p-5 z-20">
        <div className="space-y-6">
          {/* Brand Mark */}
          <Link href="/dashboard" className="flex items-center gap-3 px-1 group">
            <div className="size-9 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-emerald-300"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-brand-900 block leading-none">
                HELIORA
              </span>
              <span className="text-[10px] font-mono tracking-wider text-brand-900/50 uppercase mt-1 block">
                Preventive Health AI
              </span>
            </div>
          </Link>

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {/* Group 1: Menu Utama */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Menu Utama
              </p>
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 transition-all"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Ringkasan Klinis</span>
              </Link>

              {/* Disease Risk Sub-menu */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsRiskMenuExpanded(!isRiskMenuExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 shrink-0 text-brand-900" />
                    <span>Analisis Risiko</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isRiskMenuExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isRiskMenuExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    <Link
                      href="/dashboard/risk/diabetes"
                      className="block py-1 text-xs text-brand-900/60 hover:text-brand-900 transition-colors"
                    >
                      Diabetes Melitus
                    </Link>
                    <Link
                      href="/dashboard/risk/hypertension"
                      className="block py-1 text-xs text-brand-900/60 hover:text-brand-900 transition-colors"
                    >
                      Hipertensi
                    </Link>
                    <Link
                      href="/dashboard/risk/cardiovascular"
                      className="block py-1 text-xs text-brand-900/60 hover:text-brand-900 transition-colors"
                    >
                      Kardiovaskular
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Group 2: Intervensi & Bukti */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Intervensi &amp; Bukti
              </p>
              <Link
                href="/dashboard/recommendations"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Rencana Tindakan</span>
              </Link>
              <Link
                href="/dashboard/evidence"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Pusat Bukti Medis</span>
              </Link>
            </div>

            {/* Group 3: Simulasi */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Simulasi
              </p>
              <Link
                href="/dashboard/simulation/future"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-900 text-white shadow-xs transition-all"
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>Proyeksi Horison</span>
              </Link>
              <Link
                href="/dashboard/simulation/what-if"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>What-If Simulator</span>
              </Link>
            </div>

            {/* Group 4: Profil & Akun */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Profil &amp; Akun
              </p>
              <Link
                href="/onboarding/health-profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Profil Saya</span>
              </Link>
              <Link
                href="/onboarding/health-profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Pengaturan Akun</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-brand-900/10">
          <Link
            href="/onboarding/health-profile"
            className="p-2.5 rounded-xl bg-neutral-50/80 border border-brand-900/10 flex items-center gap-3 hover:bg-neutral-100/60 transition-colors"
          >
            <div className="size-8 rounded-xl bg-brand-900/10 border border-brand-900/15 text-brand-900 font-mono font-bold flex items-center justify-center text-xs shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-brand-900 truncate">
                {user?.full_name || "Pengguna Heliora"}
              </p>
              <p className="text-[10px] font-mono text-brand-900/50 truncate">
                {user?.email || "Profil Terverifikasi"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </aside>

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header / Breadcrumb */}
        <header className="h-16 border-b border-brand-900/10 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl border border-brand-900/15 text-brand-900 hover:bg-neutral-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono">
              <Link href="/dashboard" className="text-brand-900/50 uppercase hover:text-brand-900">
                Dashboard
              </Link>
              <span className="text-brand-900/30">/</span>
              <span className="text-brand-900/50 uppercase">Simulasi</span>
              <span className="text-brand-900/30">/</span>
              <span className="text-brand-900 font-bold uppercase">Proyeksi Horison</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900/70 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke Dashboard</span>
          </Link>
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
                    Bandingkan estimasi probabilitas risiko saat ini dengan hasil proyeksi model AI.
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
                <DisclaimerBanner variant="note" className="text-xs text-brand-900/65" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
