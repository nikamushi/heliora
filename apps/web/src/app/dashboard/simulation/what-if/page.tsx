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
  RotateCcw,
  Clock,
  Flame,
  Scale,
  Cigarette,
  Sparkles,
  Info,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  HealthProfileResponse,
  WhatIfSimulationResponse,
} from "@/types/api";
import { Slider } from "@/components/ui/slider";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

type SmokingStatus = "never" | "former" | "current";

interface BaselineValues {
  sleep: number;
  activity: number;
  weight: number;
  smoking: SmokingStatus;
  height: number;
}

export default function WhatIfSimulationPage() {
  const router = useRouter();
  const { isAuthorized, redirectToLogin } = useRequireAuth();
  const user = useMemo(
    () => (typeof window !== "undefined" ? apiClient.getStoredUser() : null),
    []
  );

  // Baseline profile data
  const [profile, setProfile] = useState<HealthProfileResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState<ApiClientError | null>(null);

  // Interactive Overrides
  const [sleepDuration, setSleepDuration] = useState<number>(7.0);
  const [activityMin, setActivityMin] = useState<number>(150);
  const [weightKg, setWeightKg] = useState<number>(70.0);
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>("never");

  // Baseline values state for delta comparison, reset, and reactive display
  const [baselineValues, setBaselineValues] = useState<BaselineValues>({
    sleep: 7.0,
    activity: 150,
    weight: 70.0,
    smoking: "never",
    height: 170.0,
  });

  // Simulation output state
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Navigation UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRiskMenuExpanded, setIsRiskMenuExpanded] = useState(false);

  // 1. Initial Profile Fetching
  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadBaseline() {
      setIsInitialLoading(true);
      setInitialError(null);
      try {
        const fetchedProfile = await apiClient.healthProfile.get();
        if (isCancelled) return;

        if (!fetchedProfile) {
          setInitialError(
            new ApiClientError(404, "Profil kesehatan belum ditemukan. Silakan lengkapi profil terlebih dahulu.")
          );
          return;
        }

        setProfile(fetchedProfile);

        const initSleep = fetchedProfile.sleep_duration_hours ? Number(fetchedProfile.sleep_duration_hours) : 7.0;
        const initActivity = fetchedProfile.physical_activity_min_per_week
          ? Number(fetchedProfile.physical_activity_min_per_week)
          : 150;
        const initWeight = fetchedProfile.weight_kg ? Number(fetchedProfile.weight_kg) : 70.0;
        const initSmoking = (fetchedProfile.smoking_status as SmokingStatus) || "never";
        const initHeight = fetchedProfile.height_cm ? Number(fetchedProfile.height_cm) : 170.0;

        const initialBaselines: BaselineValues = {
          sleep: initSleep,
          activity: initActivity,
          weight: initWeight,
          smoking: initSmoking,
          height: initHeight,
        };

        setBaselineValues(initialBaselines);
        setSleepDuration(initSleep);
        setActivityMin(initActivity);
        setWeightKg(initWeight);
        setSmokingStatus(initSmoking);

        // Run initial what-if simulation with baseline values
        const initialSim = await apiClient.simulation.whatIf({
          sleep_duration_hours: initSleep,
          physical_activity_min_per_week: initActivity,
          weight_kg: initWeight,
          smoking_status: initSmoking,
        });

        if (!isCancelled) {
          setSimulationResult(initialSim);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof ApiClientError) {
          if (err.kind === "unauthorized") {
            redirectToLogin();
            return;
          }
          setInitialError(err);
        } else {
          setInitialError(
            new ApiClientError(0, "Gagal memuat profil dasar untuk simulator.")
          );
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    }

    loadBaseline();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, redirectToLogin]);

  // 2. Debounced Real-time Recalculation Trigger (< 1s feedback)
  useEffect(() => {
    if (!profile || isInitialLoading) return;

    let isCancelled = false;

    const debounceTimer = setTimeout(async () => {
      setIsSimulating(true);
      setSimulationError(null);
      try {
        const res = await apiClient.simulation.whatIf({
          sleep_duration_hours: sleepDuration,
          physical_activity_min_per_week: activityMin,
          weight_kg: weightKg,
          smoking_status: smokingStatus,
        });

        if (!isCancelled) {
          setSimulationResult(res);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof ApiClientError && err.kind === "unauthorized") {
          redirectToLogin();
          return;
        }
        setSimulationError("Terjadi kendala saat menghitung skenario What-If.");
      } finally {
        if (!isCancelled) {
          setIsSimulating(false);
        }
      }
    }, 320); // 320ms debounce for responsive live interaction

    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [sleepDuration, activityMin, weightKg, smokingStatus, profile, isInitialLoading, redirectToLogin]);

  // 3. Reset to Baseline Action
  const handleResetToBaseline = useCallback(() => {
    setSleepDuration(baselineValues.sleep);
    setActivityMin(baselineValues.activity);
    setWeightKg(baselineValues.weight);
    setSmokingStatus(baselineValues.smoking);
  }, [baselineValues]);

  const isModifiedFromBaseline = useMemo(() => {
    return (
      Math.abs(sleepDuration - baselineValues.sleep) > 0.01 ||
      Math.abs(activityMin - baselineValues.activity) > 1 ||
      Math.abs(weightKg - baselineValues.weight) > 0.1 ||
      smokingStatus !== baselineValues.smoking
    );
  }, [sleepDuration, activityMin, weightKg, smokingStatus, baselineValues]);

  // Derived BMI calculation
  const liveDerivedBmi = useMemo(() => {
    const heightM = (baselineValues.height || 170) / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }, [weightKg, baselineValues.height]);

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
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>Proyeksi Horison</span>
              </Link>
              <Link
                href="/dashboard/simulation/what-if"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-900 text-white shadow-xs transition-all"
              >
                <Sliders className="w-4 h-4 shrink-0 text-emerald-300" />
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
              <span className="text-brand-900 font-bold uppercase">What-If Simulator</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/simulation/future"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900/70 hover:text-brand-900 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Proyeksi Horison</span>
            </Link>
            <span className="hidden sm:inline text-brand-900/20">|</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-900/70 hover:text-brand-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-6xl w-full mx-auto">
          {/* Header Section */}
          <div className="space-y-2 border-b border-brand-900/10 pb-6">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
              Simulasi Gaya Hidup Interaktif
            </span>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
                  What-If Health Simulator
                </h1>
                <p className="text-sm text-brand-900/70 mt-1 max-w-2xl leading-relaxed">
                  Uji penyesuaian durasi tidur, intensitas aktivitas, berat badan, dan status merokok untuk melihat proyeksi dampak seketika terhadap risiko kardiometabolik Anda.
                </p>
              </div>

              {/* Reset to Baseline Button */}
              {isModifiedFromBaseline && (
                <button
                  type="button"
                  onClick={handleResetToBaseline}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-900 bg-white border border-brand-900/20 hover:bg-neutral-50 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-brand-900/70" />
                  <span>Reset ke Kondisi Awal</span>
                </button>
              )}
            </div>
          </div>

          {/* Initial Loading / Error States */}
          {initialError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center space-y-4">
              <h2 className="text-base font-bold text-rose-900">
                {initialError.kind === "not_found" ? "Profil Kesehatan Belum Ada" : "Gagal Memuat Simulator"}
              </h2>
              <p className="text-xs text-rose-800/80 max-w-md mx-auto leading-relaxed">
                {initialError.message}
              </p>
              <div className="flex justify-center gap-2">
                <Link
                  href="/onboarding/health-profile"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-semibold shadow-xs"
                >
                  <span>Lengkapi Profil Kesehatan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {isInitialLoading && !initialError && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
              <div className="lg:col-span-5 h-96 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
              <div className="lg:col-span-7 h-96 rounded-2xl bg-brand-900/5 border border-brand-900/10" />
            </div>
          )}

          {/* Interactive Simulation Workspace */}
          {!isInitialLoading && !initialError && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ── Left Column: Interactive Lifestyle Controls (5 cols) ── */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                        Variabel Modifikasi
                      </span>
                      <h2 className="text-base font-bold text-brand-900 mt-0.5">
                        Kontrol Parameter
                      </h2>
                    </div>
                    {isSimulating ? (
                      <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 animate-pulse uppercase">
                        Menghitung...
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-brand-900/40 uppercase">
                        Real-time AI
                      </span>
                    )}
                  </div>

                  {simulationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      {simulationError}
                    </div>
                  )}

                  {/* 1. Sleep Duration Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-900/70" />
                        <span>Durasi Tidur Harian</span>
                      </label>
                      <span className="text-sm font-bold font-mono text-brand-900">
                        {sleepDuration.toFixed(1)} Jam
                      </span>
                    </div>

                    <Slider
                      value={[sleepDuration]}
                      min={4}
                      max={12}
                      step={0.5}
                      onValueChange={(val) => {
                        const v = typeof val === "number" ? val : val[0];
                        setSleepDuration(v);
                      }}
                      className="py-1 cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-brand-900/60 font-medium">
                        {sleepDuration < 6.5
                          ? "Defisit tidur (meningkatkan kortisol & resistensi insulin)"
                          : sleepDuration <= 8.5
                          ? "Rentang optimal kardiometabolik"
                          : "Panjang / Durasi istirahat tinggi"}
                      </span>
                      <span className="font-mono text-brand-900/40 shrink-0">
                        Awal: {baselineValues.sleep.toFixed(1)}j
                      </span>
                    </div>
                  </div>

                  {/* 2. Physical Activity Control */}
                  <div className="space-y-3 pt-3 border-t border-brand-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-brand-900/70" />
                        <span>Aktivitas Fisik Aerobik</span>
                      </label>
                      <span className="text-sm font-bold font-mono text-brand-900">
                        {activityMin} Mnt / Mgg
                      </span>
                    </div>

                    <Slider
                      value={[activityMin]}
                      min={0}
                      max={450}
                      step={15}
                      onValueChange={(val) => {
                        const v = typeof val === "number" ? val : val[0];
                        setActivityMin(v);
                      }}
                      className="py-1 cursor-pointer"
                    />

                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setActivityMin(30)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                          activityMin === 30
                            ? "bg-brand-900 text-white border-brand-900"
                            : "bg-neutral-50/70 text-brand-900/70 border-brand-900/10 hover:bg-neutral-100"
                        }`}
                      >
                        Sedentari (30m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityMin(150)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                          activityMin === 150
                            ? "bg-brand-900 text-white border-brand-900"
                            : "bg-neutral-50/70 text-brand-900/70 border-brand-900/10 hover:bg-neutral-100"
                        }`}
                      >
                        Target WHO (150m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityMin(300)}
                        className={`px-2 py-1.5 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                          activityMin === 300
                            ? "bg-brand-900 text-white border-brand-900"
                            : "bg-neutral-50/70 text-brand-900/70 border-brand-900/10 hover:bg-neutral-100"
                        }`}
                      >
                        Kardio Aktif (300m)
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] text-brand-900/60">
                      <span>
                        {activityMin < 150
                          ? "Di bawah anjuran kardioprotektif WHO"
                          : activityMin <= 300
                          ? "Mencukupi anjuran standar WHO"
                          : "Aktivitas kardiorespirasi sangat tinggi"}
                      </span>
                      <span className="font-mono text-brand-900/40 shrink-0">
                        Awal: {baselineValues.activity}m
                      </span>
                    </div>
                  </div>

                  {/* 3. Weight Adjustment & Live BMI */}
                  <div className="space-y-3 pt-3 border-t border-brand-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-brand-900/70" />
                        <span>Estimasi Berat Badan</span>
                      </label>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-brand-900">
                          {weightKg.toFixed(1)} kg
                        </span>
                        <span className="text-[10px] font-mono text-brand-900/50 block">
                          BMI Proyeksi: {liveDerivedBmi}
                        </span>
                      </div>
                    </div>

                    <Slider
                      value={[weightKg]}
                      min={40}
                      max={140}
                      step={0.5}
                      onValueChange={(val) => {
                        const v = typeof val === "number" ? val : val[0];
                        setWeightKg(v);
                      }}
                      className="py-1 cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="text-brand-900/60 font-medium">
                        {liveDerivedBmi < 18.5
                          ? "Kategori: Berat Kurang"
                          : liveDerivedBmi < 25.0
                          ? "Kategori: Berat Badan Normal / Ideal"
                          : liveDerivedBmi < 30.0
                          ? "Kategori: Kelebihan Berat Badan (Overweight)"
                          : "Kategori: Obesitas"}
                      </span>
                      <span className="font-mono text-brand-900/40 shrink-0">
                        Awal: {baselineValues.weight.toFixed(1)}kg
                      </span>
                    </div>
                  </div>

                  {/* 4. Smoking Status Segmented Selector */}
                  <div className="space-y-2.5 pt-3 border-t border-brand-900/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Cigarette className="w-3.5 h-3.5 text-brand-900/70" />
                        <span>Kebiasaan Merokok</span>
                      </label>
                      <span className="text-[10px] font-mono text-brand-900/40">
                        Awal: {baselineValues.smoking === "never" ? "Bebas Rokok" : baselineValues.smoking === "former" ? "Mantan" : "Perokok"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSmokingStatus("never")}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          smokingStatus === "never"
                            ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                            : "bg-white text-brand-900/70 border-brand-900/15 hover:bg-neutral-50"
                        }`}
                      >
                        Bebas Rokok
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmokingStatus("former")}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          smokingStatus === "former"
                            ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                            : "bg-white text-brand-900/70 border-brand-900/15 hover:bg-neutral-50"
                        }`}
                      >
                        Mantan Perokok
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmokingStatus("current")}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                          smokingStatus === "current"
                            ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                            : "bg-white text-brand-900/70 border-brand-900/15 hover:bg-neutral-50"
                        }`}
                      >
                        Perokok Aktif
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulation Immutability Note Box */}
                <div className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4.5 space-y-2 text-xs text-brand-900/70 leading-relaxed">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-900/60 shrink-0" />
                    <span className="font-bold text-brand-900">
                      Garansi Profil Tanpa Mutasi (PRD BR-SIM-007)
                    </span>
                  </div>
                  <p className="text-[11.5px]">
                    Eksplorasi What-If dihitung murni di memori server untuk keperluan simulasi. Menggeser parameter tidak akan mengubah atau menimpa profil kesehatan resmi Anda.
                  </p>
                </div>
              </div>

              {/* ── Right Column: Comparative Outcomes & Deltas (7 cols) ── */}
              <div className="lg:col-span-7 space-y-6">
                {/* Composite Scores Comparison Card */}
                {simulationResult && (
                  <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                          Komparasi Komposit Vitalitas
                        </span>
                        <h2 className="text-base font-bold text-brand-900 mt-0.5">
                          Proyeksi Dampak Skor
                        </h2>
                      </div>
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Health Score Comparison Box */}
                      <div className="p-4 rounded-xl bg-neutral-50/70 border border-brand-900/10 space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-brand-900/50 uppercase block">
                          Overall Health Score
                        </span>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-brand-900/50 block font-mono">
                              Awal: {simulationResult.baseline_health_score.toFixed(1)}
                            </span>
                            <span className="text-2xl font-bold font-mono text-brand-900">
                              {simulationResult.simulated_health_score.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs font-mono font-bold ${
                                simulationResult.health_score_delta > 0
                                  ? "text-emerald-700"
                                  : simulationResult.health_score_delta < 0
                                  ? "text-rose-700"
                                  : "text-brand-900/60"
                              }`}
                            >
                              {simulationResult.health_score_delta > 0 ? "+" : ""}
                              {simulationResult.health_score_delta.toFixed(1)} poin
                            </span>
                            <span className="text-[10px] text-brand-900/40 block">
                              Delta Vitalitas
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lifestyle Score Comparison Box */}
                      <div className="p-4 rounded-xl bg-neutral-50/70 border border-brand-900/10 space-y-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-brand-900/50 uppercase block">
                          Lifestyle Habits Score
                        </span>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-brand-900/50 block font-mono">
                              Awal: {simulationResult.baseline_lifestyle_score.toFixed(1)}
                            </span>
                            <span className="text-2xl font-bold font-mono text-brand-900">
                              {simulationResult.simulated_lifestyle_score.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-xs font-mono font-bold ${
                                simulationResult.lifestyle_score_delta > 0
                                  ? "text-emerald-700"
                                  : simulationResult.lifestyle_score_delta < 0
                                  ? "text-rose-700"
                                  : "text-brand-900/60"
                              }`}
                            >
                              {simulationResult.lifestyle_score_delta > 0 ? "+" : ""}
                              {simulationResult.lifestyle_score_delta.toFixed(1)} poin
                            </span>
                            <span className="text-[10px] text-brand-900/40 block">
                              Delta Gaya Hidup
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Per-Disease Condition Comparison Cards */}
                {simulationResult && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                        Hasil Analisis Per Penyakit Kronis
                      </span>
                      <h2 className="text-base font-bold text-brand-900 mt-0.5">
                        Komparasi Risiko Klinis
                      </h2>
                    </div>

                    <div className="space-y-3.5">
                      {simulationResult.condition_comparisons.map((comp) => {
                        const isReduction = comp.delta_percentage < -0.3;
                        const isIncrease = comp.delta_percentage > 0.3;

                        return (
                          <div
                            key={comp.condition}
                            className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs space-y-3.5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-mono tracking-wider text-brand-900/50 uppercase block">
                                  {comp.condition}
                                </span>
                                <h3 className="text-base font-bold text-brand-900">
                                  {comp.label}
                                </h3>
                              </div>

                              <div className="text-right">
                                <span
                                  className={`text-xs font-mono font-bold ${
                                    isReduction
                                      ? "text-emerald-700"
                                      : isIncrease
                                      ? "text-rose-700"
                                      : "text-brand-900/60"
                                  }`}
                                >
                                  {comp.delta_percentage > 0 ? "+" : ""}
                                  {comp.delta_percentage.toFixed(1)}%
                                </span>
                                <span className="text-[10px] font-mono text-brand-900/50 uppercase block">
                                  Tingkat: {comp.risk_label}
                                </span>
                              </div>
                            </div>

                            {/* Comparison Metric Bars */}
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-brand-900/60">
                                  Kondisi Awal: <strong className="text-brand-900">{comp.baseline_score.toFixed(1)}%</strong>
                                </span>
                                <span className="text-brand-900/60">
                                  Skenario: <strong className="text-brand-900">{comp.simulated_score.toFixed(1)}%</strong>
                                </span>
                              </div>

                              {/* Dual-bar comparison */}
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-brand-900/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-brand-900/35 transition-all duration-300 rounded-full"
                                    style={{ width: `${Math.min(100, Math.max(0, comp.baseline_score))}%` }}
                                  />
                                </div>
                                <div className="h-2 w-full bg-brand-900/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 rounded-full ${
                                      isReduction
                                        ? "bg-emerald-600"
                                        : isIncrease
                                        ? "bg-rose-600"
                                        : "bg-brand-900"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, comp.simulated_score))}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Clinical Impact Summary */}
                            <div className="pt-2 border-t border-brand-900/5 flex items-center justify-between gap-3 text-xs">
                              <p className="text-brand-900/70 text-[11.5px] leading-relaxed">
                                {comp.impact_summary}
                              </p>
                              <Link
                                href={`/dashboard/risk/${comp.condition}`}
                                className="font-semibold text-brand-900 hover:underline underline-offset-2 flex items-center gap-1 shrink-0 text-xs"
                              >
                                <span>Detail</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Horizon Simulation Navigation Card */}
                <div className="rounded-2xl bg-brand-900 text-white p-6 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase block">
                        Eksplorasi Waktu
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Lihat Proyeksi Horison 30, 90, dan 180 Hari
                      </h3>
                      <p className="text-xs text-brand-200/80 leading-relaxed max-w-lg">
                        Cari tahu bagaimana kebiasaan harian Anda terakumulasi menjadi tren kesehatan jangka panjang dalam hitungan bulan.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/simulation/future"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-900 text-xs font-semibold shadow-xs hover:bg-neutral-100 transition-colors shrink-0"
                    >
                      <span>Buka Horison Waktu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verbatim Disclaimer Banner (PRD FR-005) */}
          <div className="pt-4">
            <DisclaimerBanner />
          </div>
        </main>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-900/50 backdrop-blur-xs flex lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-brand-900 tracking-tight">HELIORA</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-brand-900/50 hover:bg-neutral-100 text-xs font-mono"
                >
                  [TUTUP]
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900 hover:bg-neutral-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Ringkasan Klinis</span>
                </Link>
                <Link
                  href="/dashboard/recommendations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900 hover:bg-neutral-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Rencana Tindakan</span>
                </Link>
                <Link
                  href="/dashboard/evidence"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900 hover:bg-neutral-50"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Pusat Bukti Medis</span>
                </Link>
                <Link
                  href="/dashboard/simulation/future"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900 hover:bg-neutral-50"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Proyeksi Horison</span>
                </Link>
                <Link
                  href="/dashboard/simulation/what-if"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-900 text-white"
                >
                  <Sliders className="w-4 h-4 text-emerald-300" />
                  <span>What-If Simulator</span>
                </Link>
              </nav>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 text-center text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl"
            >
              Keluar dari Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
