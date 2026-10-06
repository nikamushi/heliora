"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Clock,
  Flame,
  Scale,
  Cigarette,
  Info,
  BookOpen,
  ArrowRight,
  ChevronRight,
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
  const { isAuthorized, redirectToLogin } = useRequireAuth();

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

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Scrollable Content Body */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl w-full mx-auto">
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
                      Parameter Eksplorasi Gaya Hidup
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

                {/* 1. Sleep Duration Control (4.0 - 12.0 hours, step 0.5) */}
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
                    min={4.0}
                    max={12.0}
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
                        ? "Defisit tidur (tingkat stres & kortisol)"
                        : sleepDuration <= 8.5
                        ? "Rentang optimal kardiometabolik"
                        : "Durasi istirahat panjang"}
                    </span>
                    <span className="font-mono text-brand-900/40 shrink-0">
                      Awal: {baselineValues.sleep.toFixed(1)}j
                    </span>
                  </div>
                </div>

                {/* 2. Physical Activity Control (0 - 360 min/week, step 15) */}
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
                    max={360}
                    step={15}
                    onValueChange={(val) => {
                      const v = typeof val === "number" ? val : val[0];
                      setActivityMin(v);
                    }}
                    className="py-1 cursor-pointer"
                  />

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

                {/* 3. Weight Adjustment (40.0 - 150.0 kg, step 0.5) & Live BMI */}
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
                        BMI: {liveDerivedBmi}
                      </span>
                    </div>
                  </div>

                  <Slider
                    value={[weightKg]}
                    min={40.0}
                    max={150.0}
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
                        ? "Kategori: Normal / Ideal"
                        : liveDerivedBmi < 30.0
                        ? "Kategori: Overweight"
                        : "Kategori: Obesitas"}
                    </span>
                    <span className="font-mono text-brand-900/40 shrink-0">
                      Awal: {baselineValues.weight.toFixed(1)}kg
                    </span>
                  </div>
                </div>

                {/* 4. Smoking Status Segmented Radio Toggle */}
                <div className="space-y-2.5 pt-3 border-t border-brand-900/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Cigarette className="w-3.5 h-3.5 text-brand-900/70" />
                      <span>Kebiasaan Merokok</span>
                    </label>
                    <span className="text-[10px] font-mono text-brand-900/40">
                      Awal: {baselineValues.smoking === "never" ? "Tidak Pernah" : baselineValues.smoking === "former" ? "Mantan" : "Perokok"}
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
                      Tidak Pernah
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
                      Mantan
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
                      Aktif
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Immutability Note Box (BR-SIM-007) */}
              <div className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4.5 space-y-2 text-xs text-brand-900/70 leading-relaxed">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-900/60 shrink-0" />
                  <span className="font-bold text-brand-900">
                    Garansi Tanpa Mutasi Database (BR-SIM-007)
                  </span>
                </div>
                <p className="text-[11.5px]">
                  Eksplorasi What-If dihitung murni di memori server untuk simulasi. Menggeser parameter tidak akan mengubah atau menimpa profil kesehatan resmi Anda.
                </p>
              </div>
            </div>

            {/* ── Right Column: Comparative Outcomes & Deltas (7 cols) ── */}
            <div className="lg:col-span-7 space-y-6">
              {/* HASIL ESTIMASI: BASELINE VS SIMULASI (§7.4 Wireframe) */}
              {simulationResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-900/10">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                        Hasil Estimasi: Baseline vs Simulasi
                      </span>
                      <h2 className="text-base font-bold text-brand-900 mt-0.5">
                        Komparasi Risiko Klinis
                      </h2>
                    </div>
                    <span className="text-xs font-mono font-semibold text-brand-900/60">
                      3 Penyakit Kardiometabolik
                    </span>
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

              {/* Kontrol Simulator: [↺ Reset ke Nilai Dasar] [📖 Buka Bukti Medis Terkait] (§7.4) */}
              <div className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                    Kontrol Simulator
                  </span>
                  <p className="text-xs text-brand-900/70">
                    Kembalikan nilai ke kondisi awal profil Anda atau eksplorasi dasar bukti klinis.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetToBaseline}
                    disabled={!isModifiedFromBaseline}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-900 bg-white border border-brand-900/15 hover:bg-neutral-50 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-brand-900/70" />
                    <span>Reset ke Nilai Dasar</span>
                  </button>

                  <Link
                    href="/dashboard/evidence"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-900 bg-neutral-50 border border-brand-900/15 hover:bg-neutral-100/80 shadow-xs transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-900/70" />
                    <span>Buka Bukti Medis Terkait</span>
                  </Link>
                </div>
              </div>

              {/* Horizon Simulation Bridge Card */}
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
          <DisclaimerBanner variant="banner" />
        </div>
      </main>
    </div>
  );
}
