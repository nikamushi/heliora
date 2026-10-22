"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  HealthProfileResponse,
  WhatIfSimulationResponse,
} from "@/types/api";

type SmokingStatus = "never" | "former" | "current";

interface BaselineValues {
  sleep: number;
  activity: number;
  weight: number;
  smoking: SmokingStatus;
  height: number;
}

/**
 * Format numbers cleanly: whole numbers without decimals ("8", "55"),
 * fractional numbers with Indonesian comma decimal ("7,5", "55,2").
 */
function formatCompactNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0";
  const rounded = Math.round(val * 10) / 10;
  if (Math.abs(rounded - Math.round(rounded)) < 0.001) {
    return Math.round(rounded).toString();
  }
  return rounded.toFixed(1).replace(".", ",");
}

interface RiskBandInfo {
  level: "low" | "moderate" | "high";
  label: "Rendah" | "Sedang" | "Tinggi";
}

// PRD BR-RISK-004 & AC-RISK-02: Product-defined Risk Bands (0-29% Rendah, 30-59% Sedang, 60-100% Tinggi)
function getRiskBand(score: number): RiskBandInfo {
  if (score < 30) {
    return { level: "low", label: "Rendah" };
  }
  if (score < 60) {
    return { level: "moderate", label: "Sedang" };
  }
  return { level: "high", label: "Tinggi" };
}

const SMOKING_OPTIONS: { value: SmokingStatus; label: string }[] = [
  { value: "never", label: "Tidak pernah" },
  { value: "former", label: "Mantan" },
  { value: "current", label: "Aktif" },
];

const SMOKING_LABEL_MAP: Record<SmokingStatus, string> = {
  never: "Tidak pernah",
  former: "Mantan",
  current: "Aktif",
};

/**
 * Synchronous client-side risk engine matching `apps/api/app/core/risk_engine.py` exactly.
 * Guarantees instantaneous, zero-latency 60fps updates while sliders are dragged.
 */
function calculateLocalRisk(
  profile: HealthProfileResponse | null,
  overrides: {
    sleep: number;
    activity: number;
    weight: number;
    smoking: SmokingStatus;
  }
) {
  if (!profile) return null;

  const age = Number(profile.age) || 30;
  const heightCm = Number(profile.height_cm) || 170;
  const heightM = heightCm / 100;
  const derivedBmi = Math.round((overrides.weight / (heightM * heightM)) * 10) / 10;
  const activity = overrides.activity;
  const sleep = overrides.sleep;
  const smoking = overrides.smoking;
  const familyHistory = Boolean(profile.family_history);
  const stress = profile.stress_level != null ? Number(profile.stress_level) : null;
  const bloodSugar = profile.blood_sugar_mg_dl != null ? Number(profile.blood_sugar_mg_dl) : null;
  const cholesterol = profile.cholesterol_mg_dl != null ? Number(profile.cholesterol_mg_dl) : null;

  let systolic: number | null = null;
  let diastolic: number | null = null;
  if (profile.blood_pressure && typeof profile.blood_pressure === "string" && profile.blood_pressure.includes("/")) {
    const parts = profile.blood_pressure.split("/");
    const s = parseFloat(parts[0]);
    const d = parseFloat(parts[1]);
    if (!isNaN(s) && !isNaN(d)) {
      systolic = s;
      diastolic = d;
    }
  }

  // 1. Diabetes Log-Odds
  let dmLogOdds = -3.2 + 0.028 * Math.max(0.0, age - 20.0);
  if (derivedBmi >= 30.0) {
    dmLogOdds += 1.2 + 0.04 * (derivedBmi - 30.0);
  } else if (derivedBmi >= 25.0) {
    dmLogOdds += 0.65;
  } else if (derivedBmi < 23.0) {
    dmLogOdds -= 0.35;
  }

  if (activity >= 150.0) {
    dmLogOdds -= 0.4;
  } else if (activity < 60.0) {
    dmLogOdds += 0.45;
  }

  if (familyHistory) {
    dmLogOdds += 0.75;
  }

  if (bloodSugar !== null) {
    if (bloodSugar >= 126.0) {
      dmLogOdds += 1.6;
    } else if (bloodSugar >= 100.0) {
      dmLogOdds += 0.7;
    } else if (bloodSugar < 90.0) {
      dmLogOdds -= 0.25;
    }
  }

  // 2. Hypertension Log-Odds
  let htLogOdds = -2.9 + 0.032 * Math.max(0.0, age - 20.0);
  if (sleep < 6.0) {
    htLogOdds += 0.55;
  } else if (sleep >= 6.5 && sleep <= 8.5) {
    htLogOdds -= 0.25;
  }

  if (stress !== null) {
    if (stress >= 7.0) {
      htLogOdds += 0.5;
    } else if (stress <= 3.0) {
      htLogOdds -= 0.2;
    }
  }

  if (smoking === "current") {
    htLogOdds += 0.45;
  } else if (smoking === "never") {
    htLogOdds -= 0.15;
  }

  if (systolic !== null && diastolic !== null) {
    if (systolic >= 140.0 || diastolic >= 90.0) {
      htLogOdds += 1.5;
    } else if (systolic >= 130.0 || diastolic >= 85.0) {
      htLogOdds += 0.65;
    } else if (systolic < 120.0 && diastolic < 80.0) {
      htLogOdds -= 0.35;
    }
  }

  if (derivedBmi >= 25.0) {
    htLogOdds += 0.45;
  }

  // 3. CVD Log-Odds
  let cvdLogOdds = -3.4 + 0.038 * Math.max(0.0, age - 20.0);
  if (smoking === "current") {
    cvdLogOdds += 1.1;
  } else if (smoking === "former") {
    cvdLogOdds += 0.3;
  } else if (smoking === "never") {
    cvdLogOdds -= 0.35;
  }

  if (cholesterol !== null) {
    if (cholesterol >= 240.0) {
      cvdLogOdds += 1.1;
    } else if (cholesterol >= 200.0) {
      cvdLogOdds += 0.45;
    } else if (cholesterol < 180.0) {
      cvdLogOdds -= 0.25;
    }
  }

  if (activity < 60.0) {
    cvdLogOdds += 0.45;
  } else if (activity >= 150.0) {
    cvdLogOdds -= 0.35;
  }

  if (htLogOdds > 0) {
    cvdLogOdds += 0.4;
  }

  const sigmoid = (z: number) => 1.0 / (1.0 + Math.exp(-Math.max(-50.0, Math.min(50.0, z))));
  const clampProb = (lo: number) => {
    const p = sigmoid(lo);
    return Math.max(0.0100, Math.min(0.9500, p));
  };

  return {
    diabetes: Math.round(clampProb(dmLogOdds) * 1000) / 10,
    hypertension: Math.round(clampProb(htLogOdds) * 1000) / 10,
    cardiovascular: Math.round(clampProb(cvdLogOdds) * 1000) / 10,
  };
}

function WhatIfSimulationContent() {
  const { isAuthorized, redirectToLogin } = useRequireAuth();
  const searchParams = useSearchParams();
  const previewParam = searchParams?.get("preview");

  // Profile data
  const [profile, setProfile] = useState<HealthProfileResponse | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState<ApiClientError | null>(null);

  // Pre-seed from cached health profile if available
  const cachedProfile = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("heliora_health_profile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const defaultSleep = cachedProfile?.sleep_duration_hours ? Number(cachedProfile.sleep_duration_hours) : 7.0;
  const defaultActivity = cachedProfile?.physical_activity_min_per_week ? Number(cachedProfile.physical_activity_min_per_week) : 150;
  const defaultWeight = cachedProfile?.weight_kg ? Number(cachedProfile.weight_kg) : 70.0;
  const defaultSmoking = (cachedProfile?.smoking_status as SmokingStatus) || "never";
  const defaultHeight = cachedProfile?.height_cm ? Number(cachedProfile.height_cm) : 170.0;

  // Interactive Overrides
  const [sleepDuration, setSleepDuration] = useState<number>(defaultSleep);
  const [activityMin, setActivityMin] = useState<number>(defaultActivity);
  const [weightKg, setWeightKg] = useState<number>(defaultWeight);
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>(defaultSmoking);

  // Baseline values state for delta comparison & reset
  const [baselineValues, setBaselineValues] = useState<BaselineValues>({
    sleep: defaultSleep,
    activity: defaultActivity,
    weight: defaultWeight,
    smoking: defaultSmoking,
    height: defaultHeight,
  });

  // Server simulation output state (for syncing)
  const [serverSimulation, setServerSimulation] = useState<WhatIfSimulationResponse | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  // Throttled live announcement string for screen readers (Point 2)
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  // 1. Initial Profile Fetching & Preview Mode Seeding
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

        // Preview Mode presets for design verification
        if (previewParam === "high") {
          setSleepDuration(4.0);
          setActivityMin(0);
          setWeightKg(Math.max(105, initWeight + 30));
          setSmokingStatus("current");
        } else if (previewParam === "moderate") {
          setSleepDuration(5.5);
          setActivityMin(60);
          setWeightKg(Math.max(85, initWeight + 15));
          setSmokingStatus("former");
        } else if (previewParam === "unchanged") {
          setSleepDuration(initSleep + 0.5);
          setActivityMin(initActivity);
          setWeightKg(initWeight);
          setSmokingStatus(initSmoking);
        } else {
          setSleepDuration(initSleep);
          setActivityMin(initActivity);
          setWeightKg(initWeight);
          setSmokingStatus(initSmoking);
        }

        // Run initial what-if simulation with current profile values
        const initialSim = await apiClient.simulation.whatIf({
          sleep_duration_hours: previewParam === "high" ? 4.0 : previewParam === "moderate" ? 5.5 : initSleep,
          physical_activity_min_per_week: previewParam === "high" ? 0 : previewParam === "moderate" ? 60 : initActivity,
          weight_kg: previewParam === "high" ? Math.max(105, initWeight + 30) : previewParam === "moderate" ? Math.max(85, initWeight + 15) : initWeight,
          smoking_status: previewParam === "high" ? "current" : initSmoking,
        });

        if (!isCancelled) {
          setServerSimulation(initialSim);
          if (previewParam === "error") {
            setSimulationError("Koneksi simulasi terganggu. Menampilkan hasil valid terakhir.");
          }
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
  }, [isAuthorized, redirectToLogin, previewParam]);

  // 2. Background server synchronization (without blocking instant UI updates)
  useEffect(() => {
    if (!profile || isInitialLoading) return;
    let isCancelled = false;

    const syncTimer = setTimeout(async () => {
      try {
        if (previewParam === "error") {
          throw new Error("Simulated network timeout");
        }

        const res = await apiClient.simulation.whatIf({
          sleep_duration_hours: sleepDuration,
          physical_activity_min_per_week: activityMin,
          weight_kg: weightKg,
          smoking_status: smokingStatus,
        });

        if (!isCancelled) {
          setServerSimulation(res);
          setSimulationError(null);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof ApiClientError && err.kind === "unauthorized") {
          redirectToLogin();
          return;
        }
        setSimulationError("Koneksi simulasi terganggu. Menampilkan hasil valid terakhir.");
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(syncTimer);
    };
  }, [sleepDuration, activityMin, weightKg, smokingStatus, profile, isInitialLoading, redirectToLogin, previewParam]);

  // 3. Reset All to Baseline Action (Label: "Kembalikan semua")
  const handleResetToBaseline = useCallback(() => {
    setSleepDuration(baselineValues.sleep);
    setActivityMin(baselineValues.activity);
    setWeightKg(baselineValues.weight);
    setSmokingStatus(baselineValues.smoking);
  }, [baselineValues]);

  // Check which parameters have been modified
  const isSleepModified = Math.abs(sleepDuration - baselineValues.sleep) > 0.01;
  const isActivityModified = Math.abs(activityMin - baselineValues.activity) > 1;
  const isWeightModified = Math.abs(weightKg - baselineValues.weight) > 0.1;
  const isSmokingModified = smokingStatus !== baselineValues.smoking;
  const isModifiedFromBaseline = isSleepModified || isActivityModified || isWeightModified || isSmokingModified;

  // Slider Min-Max ranges
  const sleepMin = Math.min(3.0, Math.floor(baselineValues.sleep));
  const sleepMax = Math.max(12.0, Math.ceil(baselineValues.sleep));

  const activityMinVal = 0;
  const activityMaxVal = Math.max(600, Math.ceil(baselineValues.activity / 50) * 50);

  const weightMinVal = Math.min(40.0, Math.floor(baselineValues.weight - 5));
  const weightMaxVal = Math.max(140.0, Math.ceil(baselineValues.weight + 5));

  // Instant Real-Time Synchronous Calculation (0ms latency, zero debounce)
  const baselineRisks = useMemo(() => {
    if (serverSimulation?.condition_comparisons) {
      const dm = serverSimulation.condition_comparisons.find((c) => c.condition === "diabetes")?.baseline_score;
      const ht = serverSimulation.condition_comparisons.find((c) => c.condition === "hypertension")?.baseline_score;
      const cvd = serverSimulation.condition_comparisons.find((c) => c.condition === "cardiovascular")?.baseline_score;
      if (dm !== undefined && ht !== undefined && cvd !== undefined) {
        return {
          diabetes: Math.round(dm * 10) / 10,
          hypertension: Math.round(ht * 10) / 10,
          cardiovascular: Math.round(cvd * 10) / 10,
        };
      }
    }
    if (!profile) return { diabetes: 1.9, hypertension: 4.0, cardiovascular: 3.5 };
    return calculateLocalRisk(profile, baselineValues) || { diabetes: 1.9, hypertension: 4.0, cardiovascular: 3.5 };
  }, [profile, baselineValues, serverSimulation]);

  const currentSimulatedRisks = useMemo(() => {
    if (!profile) return baselineRisks;
    return calculateLocalRisk(profile, {
      sleep: sleepDuration,
      activity: activityMin,
      weight: weightKg,
      smoking: smokingStatus,
    }) || baselineRisks;
  }, [profile, sleepDuration, activityMin, weightKg, smokingStatus, baselineRisks]);

  // Condition Results with strict mathematical consistency
  const conditions = useMemo(() => {
    const list: {
      condition: "diabetes" | "hypertension" | "cardiovascular";
      name: string;
      baseline_score: number;
      simulated_score: number;
      delta_percentage: number;
    }[] = [
      {
        condition: "diabetes",
        name: "Diabetes",
        baseline_score: baselineRisks.diabetes,
        simulated_score: isModifiedFromBaseline ? currentSimulatedRisks.diabetes : baselineRisks.diabetes,
        delta_percentage: 0,
      },
      {
        condition: "hypertension",
        name: "Hipertensi",
        baseline_score: baselineRisks.hypertension,
        simulated_score: isModifiedFromBaseline ? currentSimulatedRisks.hypertension : baselineRisks.hypertension,
        delta_percentage: 0,
      },
      {
        condition: "cardiovascular",
        name: "Kardiovaskular",
        baseline_score: baselineRisks.cardiovascular,
        simulated_score: isModifiedFromBaseline ? currentSimulatedRisks.cardiovascular : baselineRisks.cardiovascular,
        delta_percentage: 0,
      },
    ];

    return list.map((item) => {
      // If previewing unchanged demo state
      if (previewParam === "unchanged") {
        return {
          ...item,
          simulated_score: item.baseline_score,
          delta_percentage: 0.0,
        };
      }

      if (!isModifiedFromBaseline) {
        return {
          ...item,
          simulated_score: item.baseline_score,
          delta_percentage: 0.0,
        };
      }

      const displayDelta = Math.round((item.simulated_score - item.baseline_score) * 10) / 10;
      return {
        ...item,
        delta_percentage: displayDelta,
      };
    });
  }, [baselineRisks, currentSimulatedRisks, isModifiedFromBaseline, previewParam]);

  const hasHighRiskCondition = useMemo(() => {
    return isModifiedFromBaseline && conditions.some((c) => c.simulated_score >= 60.0);
  }, [conditions, isModifiedFromBaseline]);

  // Throttled announcement for screen readers (Point 2)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isModifiedFromBaseline) {
        setLiveAnnouncement("");
        return;
      }

      const summary = conditions
        .map((c) => {
          const delta = c.delta_percentage;
          const dir =
            delta > 0.05
              ? `naik ${formatCompactNumber(delta)}`
              : delta < -0.05
              ? `turun ${formatCompactNumber(Math.abs(delta))}`
              : "tidak berubah";
          return `${c.name} ${formatCompactNumber(c.simulated_score)} persen, ${dir}`;
        })
        .join("; ");
      setLiveAnnouncement(`Estimasi skenario 10 tahun diperbarui: ${summary}`);
    }, 600);

    return () => clearTimeout(timer);
  }, [conditions, isModifiedFromBaseline]);

  if (!isAuthorized) {
    return null;
  }

  // Pre-calculate slider percentages for dynamic tick contrast (Point 2)
  const sleepBaselinePercent = Math.min(100, Math.max(0, ((baselineValues.sleep - sleepMin) / (sleepMax - sleepMin)) * 100));
  const sleepCurrentPercent = Math.min(100, Math.max(0, ((sleepDuration - sleepMin) / (sleepMax - sleepMin)) * 100));
  const isSleepOverFill = sleepBaselinePercent <= sleepCurrentPercent;

  const activityBaselinePercent = Math.min(100, Math.max(0, ((baselineValues.activity - activityMinVal) / (activityMaxVal - activityMinVal)) * 100));
  const activityCurrentPercent = Math.min(100, Math.max(0, ((activityMin - activityMinVal) / (activityMaxVal - activityMinVal)) * 100));
  const isActivityOverFill = activityBaselinePercent <= activityCurrentPercent;

  const weightBaselinePercent = Math.min(100, Math.max(0, ((baselineValues.weight - weightMinVal) / (weightMaxVal - weightMinVal)) * 100));
  const weightCurrentPercent = Math.min(100, Math.max(0, ((weightKg - weightMinVal) / (weightMaxVal - weightMinVal)) * 100));
  const isWeightOverFill = weightBaselinePercent <= weightCurrentPercent;

  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full select-text selection:bg-neutral-200 dark:selection:bg-neutral-800 selection:text-neutral-900 dark:selection:text-neutral-100">
      {/* ── Screen Reader Throttled Live Region ── */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* ── Native Apple Slider Thumb Styling ── */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: #ffffff;
          border: 0.5px solid rgba(0, 0, 0, 0.06);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0, 0, 0, 0.2);
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.08);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          transform: scale(1.02);
        }
        input[type="range"]::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 9999px;
          background: #ffffff;
          border: 0.5px solid rgba(0, 0, 0, 0.06);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* ── Page Header: Skenario (Standard Dashboard Header Style) ── */}
      <header className="border-b border-brand-900/10 dark:border-neutral-800 pb-5 sm:pb-6">
        <div className="space-y-1.5 sm:space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1E38] dark:text-neutral-100 break-words">
            Skenario
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed">
            Ubah kebiasaan untuk melihat bagaimana estimasi model berubah. Data profil Anda tidak ikut berubah.
          </p>
        </div>
      </header>

      {/* Initial Loading / Error States */}
      {initialError && (
        <section aria-label="Error Profil" className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 p-6 text-center space-y-4">
          <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">
            {initialError.kind === "not_found" ? "Profil Kesehatan Belum Ada" : "Gagal Memuat Simulator"}
          </h2>
          <p className="text-xs text-rose-800/80 dark:text-rose-300/80 max-w-md mx-auto leading-relaxed">
            {initialError.message}
          </p>
          <div className="flex justify-center gap-2">
            <Link
              href="/onboarding/health-profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D5F3F] text-white text-xs font-semibold shadow-xs hover:bg-[#0B4F34] transition-colors"
            >
              <span>Lengkapi Profil Kesehatan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {!initialError && isInitialLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-2 animate-pulse" aria-busy="true" aria-label="Memuat parameter skenario...">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-7 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-96 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-7 w-56 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-64 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
          </div>
        </div>
      )}

      {!initialError && !isInitialLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ══════════════════════════════════════════════════════════════════
              KOLOM KIRI: INSET GROUPED LIST KEBIASAAN
             ══════════════════════════════════════════════════════════════════ */}
          <section aria-labelledby="heading-habits" className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between pb-0.5">
              <h2 id="heading-habits" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Kebiasaan
              </h2>

              {/* Reset All: Plain text button without background or border; subtle tint on hover/focus (No title tooltip) */}
              {isModifiedFromBaseline && (
                <button
                  type="button"
                  onClick={handleResetToBaseline}
                  aria-label="Kembalikan semua nilai ke kondisi saat ini"
                  className="min-h-[28px] inline-flex items-center px-2 py-0.5 text-xs font-medium text-[#0D5F3F] dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 focus-visible:bg-emerald-50/70 dark:focus-visible:bg-emerald-950/40 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-[#0D5F3F]"
                >
                  Kembalikan semua
                </button>
              )}
            </div>

            {simulationError && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>{simulationError}</span>
              </div>
            )}

            {/* Inset Grouped Container ala Apple Health/Settings */}
            <div className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs">
              {/* ── 1. Durasi Tidur (CSS Grid for Slider -> Reset Tab Order) ── */}
              <div className="p-4 sm:p-5 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1">
                {/* Visual Row 1: Label */}
                <label htmlFor="slider-sleep" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">
                  Durasi tidur
                </label>

                {/* Visual Row 1: Value */}
                <div className="col-start-3 text-right text-base font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  {formatCompactNumber(sleepDuration)} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">jam/hari</span>
                </div>

                {/* Visual Row 2: Slider Track (DOM Position: FIRST FOCUSABLE!) */}
                <div className="col-span-3 relative w-full flex items-center h-8">
                  {isSleepModified && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
                      style={{ left: `${sleepBaselinePercent}%` }}
                      aria-hidden="true"
                    >
                      <div
                        className={`w-0.5 h-2 rounded-full ${
                          isSleepOverFill
                            ? "bg-white shadow-xs"
                            : "bg-neutral-600 dark:bg-neutral-400"
                        }`}
                      />
                    </div>
                  )}

                  <input
                    id="slider-sleep"
                    type="range"
                    min={sleepMin}
                    max={sleepMax}
                    step={0.5}
                    value={sleepDuration}
                    onChange={(e) => setSleepDuration(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        e.preventDefault();
                        setSleepDuration((prev) => Math.min(sleepMax, Math.round((prev + 0.5) * 10) / 10));
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setSleepDuration((prev) => Math.max(sleepMin, Math.round((prev - 0.5) * 10) / 10));
                      }
                    }}
                    aria-label="Durasi tidur"
                    aria-valuemin={sleepMin}
                    aria-valuemax={sleepMax}
                    aria-valuenow={sleepDuration}
                    aria-valuetext={
                      isSleepModified
                        ? `${formatCompactNumber(sleepDuration)} jam per hari, sebelumnya ${formatCompactNumber(baselineValues.sleep)}`
                        : `${formatCompactNumber(sleepDuration)} jam per hari`
                    }
                    className="relative z-10 w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] focus-visible:ring-offset-2"
                    style={{
                      background: `linear-gradient(to right, #0D5F3F 0%, #0D5F3F ${sleepCurrentPercent}%, #E5E7EB ${sleepCurrentPercent}%, #E5E7EB 100%)`,
                    }}
                  />
                </div>

                {/* Visual Row 1: Reset Button (DOM Position: SECOND FOCUSABLE after slider!) */}
                {isSleepModified && (
                  <div className="col-start-2 row-start-1">
                    <button
                      type="button"
                      onClick={() => setSleepDuration(baselineValues.sleep)}
                      aria-label={`Kembalikan durasi tidur ke ${formatCompactNumber(baselineValues.sleep)} jam per hari`}
                      className="min-h-[28px] inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-[#0D5F3F] dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 focus-visible:bg-emerald-50/70 dark:focus-visible:bg-emerald-950/40 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-[#0D5F3F]"
                    >
                      Kembalikan ke {formatCompactNumber(baselineValues.sleep)} jam
                    </button>
                  </div>
                )}
              </div>

              {/* ── 2. Aktivitas Fisik (CSS Grid for Slider -> Reset Tab Order) ── */}
              <div className="p-4 sm:p-5 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1">
                <label htmlFor="slider-activity" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">
                  Aktivitas fisik
                </label>

                <div className="col-start-3 text-right text-base font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  {formatCompactNumber(activityMin)} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">menit/minggu</span>
                </div>

                <div className="col-span-3 relative w-full flex items-center h-8">
                  {isActivityModified && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
                      style={{ left: `${activityBaselinePercent}%` }}
                      aria-hidden="true"
                    >
                      <div
                        className={`w-0.5 h-2 rounded-full ${
                          isActivityOverFill
                            ? "bg-white shadow-xs"
                            : "bg-neutral-600 dark:bg-neutral-400"
                        }`}
                      />
                    </div>
                  )}

                  <input
                    id="slider-activity"
                    type="range"
                    min={activityMinVal}
                    max={activityMaxVal}
                    step={15}
                    value={activityMin}
                    onChange={(e) => setActivityMin(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        e.preventDefault();
                        setActivityMin((prev) => Math.min(activityMaxVal, prev + 15));
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setActivityMin((prev) => Math.max(activityMinVal, prev - 15));
                      }
                    }}
                    aria-label="Aktivitas fisik"
                    aria-valuemin={activityMinVal}
                    aria-valuemax={activityMaxVal}
                    aria-valuenow={activityMin}
                    aria-valuetext={
                      isActivityModified
                        ? `${formatCompactNumber(activityMin)} menit per minggu, sebelumnya ${formatCompactNumber(baselineValues.activity)}`
                        : `${formatCompactNumber(activityMin)} menit per minggu`
                    }
                    className="relative z-10 w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] focus-visible:ring-offset-2"
                    style={{
                      background: `linear-gradient(to right, #0D5F3F 0%, #0D5F3F ${activityCurrentPercent}%, #E5E7EB ${activityCurrentPercent}%, #E5E7EB 100%)`,
                    }}
                  />
                </div>

                {isActivityModified && (
                  <div className="col-start-2 row-start-1">
                    <button
                      type="button"
                      onClick={() => setActivityMin(baselineValues.activity)}
                      aria-label={`Kembalikan aktivitas fisik ke ${formatCompactNumber(baselineValues.activity)} menit per minggu`}
                      className="min-h-[28px] inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-[#0D5F3F] dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 focus-visible:bg-emerald-50/70 dark:focus-visible:bg-emerald-950/40 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-[#0D5F3F]"
                    >
                      Kembalikan ke {formatCompactNumber(baselineValues.activity)} mnt
                    </button>
                  </div>
                )}
              </div>

              {/* ── 3. Berat Badan (CSS Grid for Slider -> Reset Tab Order) ── */}
              <div className="p-4 sm:p-5 grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1">
                <label htmlFor="slider-weight" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 cursor-pointer">
                  Berat badan
                </label>

                <div className="col-start-3 text-right text-base font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  {formatCompactNumber(weightKg)} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">kg</span>
                </div>

                <div className="col-span-3 relative w-full flex items-center h-8">
                  {isWeightModified && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none z-20"
                      style={{ left: `${weightBaselinePercent}%` }}
                      aria-hidden="true"
                    >
                      <div
                        className={`w-0.5 h-2 rounded-full ${
                          isWeightOverFill
                            ? "bg-white shadow-xs"
                            : "bg-neutral-600 dark:bg-neutral-400"
                        }`}
                      />
                    </div>
                  )}

                  <input
                    id="slider-weight"
                    type="range"
                    min={weightMinVal}
                    max={weightMaxVal}
                    step={0.5}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        e.preventDefault();
                        setWeightKg((prev) => Math.min(weightMaxVal, Math.round((prev + 0.5) * 10) / 10));
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        e.preventDefault();
                        setWeightKg((prev) => Math.max(weightMinVal, Math.round((prev - 0.5) * 10) / 10));
                      }
                    }}
                    aria-label="Berat badan"
                    aria-valuemin={weightMinVal}
                    aria-valuemax={weightMaxVal}
                    aria-valuenow={weightKg}
                    aria-valuetext={
                      isWeightModified
                        ? `${formatCompactNumber(weightKg)} kilogram, sebelumnya ${formatCompactNumber(baselineValues.weight)}`
                        : `${formatCompactNumber(weightKg)} kilogram`
                    }
                    className="relative z-10 w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] focus-visible:ring-offset-2"
                    style={{
                      background: `linear-gradient(to right, #0D5F3F 0%, #0D5F3F ${weightCurrentPercent}%, #E5E7EB ${weightCurrentPercent}%, #E5E7EB 100%)`,
                    }}
                  />
                </div>

                {isWeightModified && (
                  <div className="col-start-2 row-start-1">
                    <button
                      type="button"
                      onClick={() => setWeightKg(baselineValues.weight)}
                      aria-label={`Kembalikan berat badan ke ${formatCompactNumber(baselineValues.weight)} kilogram`}
                      className="min-h-[28px] inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-[#0D5F3F] dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 focus-visible:bg-emerald-50/70 dark:focus-visible:bg-emerald-950/40 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-[#0D5F3F]"
                    >
                      Kembalikan ke {formatCompactNumber(baselineValues.weight)} kg
                    </button>
                  </div>
                )}
              </div>

              {/* ── 4. Status Merokok (Grid for Segments -> Reset Tab Order) ── */}
              <div className="p-4 sm:p-5 grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-2.5">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Status merokok
                </span>

                {/* Segmented Control Buttons (DOM: FIRST FOCUSABLE!) */}
                <div
                  role="radiogroup"
                  aria-label="Pilihan status merokok"
                  className="col-span-2 grid grid-cols-3 gap-1 bg-neutral-100/90 dark:bg-neutral-800/80 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60"
                >
                  {SMOKING_OPTIONS.map((opt) => {
                    const isSelected = smokingStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSmokingStatus(opt.value)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] ${
                          isSelected
                            ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/50 dark:border-neutral-600/50"
                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Reset Button (DOM: SECOND FOCUSABLE after segmented control!) */}
                {isSmokingModified && (
                  <div className="col-start-2 row-start-1">
                    <button
                      type="button"
                      onClick={() => setSmokingStatus(baselineValues.smoking)}
                      aria-label={`Kembalikan status merokok ke ${SMOKING_LABEL_MAP[baselineValues.smoking]}`}
                      className="min-h-[28px] inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-[#0D5F3F] dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 focus-visible:bg-emerald-50/70 dark:focus-visible:bg-emerald-950/40 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-[#0D5F3F]"
                    >
                      Kembalikan ke {SMOKING_LABEL_MAP[baselineValues.smoking]}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              KOLOM KANAN: ESTIMASI RISIKO 10 TAHUN
             ══════════════════════════════════════════════════════════════════ */}
          <aside
            aria-labelledby="heading-results"
            className="lg:col-span-5 lg:sticky lg:top-6 space-y-3"
          >
            {/* Header: Always "Estimasi risiko 10 tahun" */}
            <div className="flex items-center justify-between pb-0.5">
              <h2 id="heading-results" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Estimasi risiko 10 tahun
              </h2>
            </div>

            {/* Single-Layer Grouped Inset Card */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs"
            >
              {/* 3 Chronic Risk Rows: Diabetes, Hipertensi, Kardiovaskular */}
              {conditions.map((item) => {
                const delta = item.delta_percentage;
                const isDecreased = delta < -0.05;
                const isIncreased = delta > 0.05;

                const baselineBand = getRiskBand(item.baseline_score);
                const simulatedBand = getRiskBand(item.simulated_score);
                const isBandChanged = isModifiedFromBaseline && baselineBand.label !== simulatedBand.label;

                let deltaText = "tidak berubah";
                if (isDecreased) {
                  deltaText = `turun ${formatCompactNumber(Math.abs(delta))}`;
                } else if (isIncreased) {
                  deltaText = `naik ${formatCompactNumber(delta)}`;
                }

                return (
                  <div
                    key={item.condition}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/40 dark:hover:bg-neutral-800/40 transition-colors duration-150 motion-reduce:transition-none"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {item.name}
                      </h3>
                      {/* Scenario Category: Always present under name for stable vertical alignment */}
                      <p className="text-xs mt-0.5">
                        {isBandChanged ? (
                          <span className="font-semibold text-amber-800 dark:text-amber-400">
                            {baselineBand.label} → {simulatedBand.label}
                          </span>
                        ) : (
                          <span className="text-neutral-500 dark:text-neutral-400 font-normal">
                            {simulatedBand.label}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Right: Inline Comparison (high contrast regular weight, no truncation) */}
                    <div className="text-right shrink-0">
                      {!isModifiedFromBaseline ? (
                        <div className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 font-sans tracking-tight whitespace-nowrap">
                          {formatCompactNumber(item.baseline_score)}%
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="text-base sm:text-lg font-bold font-sans tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                            <span className="text-sm sm:text-base font-normal text-neutral-600 dark:text-neutral-400 mr-1.5">
                              {formatCompactNumber(item.baseline_score)}% →
                            </span>
                            <span>
                              {formatCompactNumber(item.simulated_score)}%
                            </span>
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal">
                            {deltaText}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footnote: Left-aligned with text-wrap:pretty and concise copy */}
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-left pt-1 leading-relaxed [text-wrap:pretty]">
              {isModifiedFromBaseline
                ? "Perubahan dalam %p. Simulasi model, bukan diagnosis medis."
                : "Simulasi model, bukan diagnosis medis."}
            </p>

            {/* High Risk Safety Guidance (FR-037 & Non-Alarming Tone) */}
            {hasHighRiskCondition && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Skenario ini menghasilkan estimasi pada Kategori Tinggi. Evaluasi ini bertujuan edukatif dan bukan diagnosis klinis. Konsultasikan dengan tenaga kesehatan untuk pemeriksaan formal.
                </p>
              </div>
            )}

            {/* Action Link: "Lihat tindakan" (Matching Nav Destination) */}
            <div className="pt-0.5">
              <Link
                href="/dashboard/recommendations"
                className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors shadow-2xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F]"
              >
                <span>Lihat tindakan</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Footer Disclaimer (Kanonik PRD §20.14 & FR-005, selaras dengan Proyeksi & halaman risiko) ── */}
      <footer className="pt-8 pb-10 border-t border-neutral-200/80 dark:border-neutral-800 mt-10">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed text-left max-w-3xl font-normal">
          HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.
        </p>
      </footer>
    </main>
  );
}

export default function WhatIfSimulationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 w-full animate-pulse">
          <div className="h-10 w-44 rounded-lg bg-neutral-200 dark:bg-neutral-800 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
            <div className="lg:col-span-5 h-96 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
          </div>
        </main>
      }
    >
      <WhatIfSimulationContent />
    </Suspense>
  );
}
