"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sliders,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  FutureSimulationResponse,
  SimulationHorizon,
  HealthProfileResponse,
  ConsentStatusResponse,
} from "@/types/api";
import { Button } from "@/components/ui/button";

// ── Indonesian Locale Formatting Helpers (PRD §7.14, Locale ID) ──────────────

function formatNumberId(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return "0,0";
  return val.toFixed(decimals).replace(".", ",");
}

// ── Score Interpretation Bands (PRD BR-SCORE-006 & §10.4.2) ──────────────────
// BR-SCORE-006: 80–100 Excellent (Sangat baik), 60–79 Good (Baik),
// 40–59 Needs Improvement (Perlu perbaikan), 0–39 High Attention (Perlu perhatian).

function getScoreBand(score: number): { label: string; textClass: string; bgClass: string } {
  if (score >= 80) {
    return { label: "Sangat baik", textClass: "text-emerald-700", bgClass: "bg-emerald-50 border-emerald-200/60" };
  }
  if (score >= 60) {
    return { label: "Baik", textClass: "text-blue-700", bgClass: "bg-blue-50 border-blue-200/60" };
  }
  if (score >= 40) {
    return { label: "Perlu perbaikan", textClass: "text-amber-800", bgClass: "bg-amber-50 border-amber-200/60" };
  }
  return { label: "Perlu perhatian", textClass: "text-rose-800", bgClass: "bg-rose-50 border-rose-200/60" };
}

// PRD 10.4.2: Tingkat risiko kardiometabolik absolut (Rendah / Sedang / Tinggi - Point 8)
function getRiskBand(score: number): { label: string; textClass: string } {
  if (score < 30) {
    return { label: "Rendah", textClass: "text-neutral-500" };
  }
  if (score < 60) {
    return { label: "Sedang", textClass: "text-amber-800" };
  }
  return { label: "Tinggi", textClass: "text-amber-950 font-bold" };
}

// ── Combined 2-Line Trajectory Chart (Apple Simplicity, Skala Sumbu-Y Tetap 50–100) ──

interface DiscretePoint {
  horizon: 0 | 30 | 90 | 180;
  label: string;
  score: number;
  delta: number;
}

interface CombinedTrajectoryChartProps {
  healthPoints: DiscretePoint[];
  lifestylePoints: DiscretePoint[];
  selectedHorizon: SimulationHorizon;
}

function CombinedTrajectoryChart({
  healthPoints,
  lifestylePoints,
  selectedHorizon,
}: CombinedTrajectoryChartProps) {
  // Tooltip hanya aktif saat hover interaktif, tidak muncul otomatis di load (Point 1)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const svgWidth = 760;
  const svgHeight = 150;
  const pad = { top: 22, right: 36, bottom: 34, left: 40 };
  const chartW = svgWidth - pad.left - pad.right;
  const chartH = svgHeight - pad.top - pad.bottom;
  const baselineY = pad.top + chartH;

  // Fixed domain [50, 100] with 3 horizontal lines: 100, 75, 50 (Point 9)
  const floorVal = 50;
  const ceilVal = 100;
  const span = ceilVal - floorVal;
  const getY = useCallback(
    (val: number) =>
      baselineY - ((Math.min(ceilVal, Math.max(floorVal, val)) - floorVal) / span) * chartH,
    [baselineY, chartH, span]
  );

  const healthCoords = useMemo(() => {
    return healthPoints.map((p, idx) => {
      const x = pad.left + (idx / Math.max(1, healthPoints.length - 1)) * chartW;
      const y = getY(p.score);
      const isSelected = p.horizon === selectedHorizon;
      return { x, y, point: p, idx, isSelected };
    });
  }, [healthPoints, pad.left, chartW, getY, selectedHorizon]);

  const lifestyleCoords = useMemo(() => {
    return lifestylePoints.map((p, idx) => {
      const x = pad.left + (idx / Math.max(1, lifestylePoints.length - 1)) * chartW;
      const y = getY(p.score);
      const isSelected = p.horizon === selectedHorizon;
      return { x, y, point: p, idx, isSelected };
    });
  }, [lifestylePoints, pad.left, chartW, getY, selectedHorizon]);

  const healthLineD = useMemo(() => {
    if (healthCoords.length === 0) return "";
    return (
      `M ${healthCoords[0].x.toFixed(1)} ${healthCoords[0].y.toFixed(1)} ` +
      healthCoords.slice(1).map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ")
    );
  }, [healthCoords]);

  const lifestyleLineD = useMemo(() => {
    if (lifestyleCoords.length === 0) return "";
    return (
      `M ${lifestyleCoords[0].x.toFixed(1)} ${lifestyleCoords[0].y.toFixed(1)} ` +
      lifestyleCoords.slice(1).map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ")
    );
  }, [lifestyleCoords]);

  const gridLines = [100, 75, 50];

  const currentHealthScore = Math.round(
    healthPoints.find((p) => p.horizon === selectedHorizon)?.score ?? healthPoints[0]?.score ?? 96
  );
  const currentLifestyleScore = Math.round(
    lifestylePoints.find((p) => p.horizon === selectedHorizon)?.score ?? lifestylePoints[0]?.score ?? 100
  );

  return (
    <div
      role="figure"
      aria-label={`Skor Kesehatan ${currentHealthScore} dan Skor Gaya Hidup ${currentLifestyleScore}, stabil hingga 180 hari`}
      className="relative w-full select-none"
    >
      {/* Hidden Data Table for Screen Readers (Point 8) */}
      <div className="sr-only">
        <table>
          <caption>Proyeksi Skor Kesehatan dan Skor Gaya Hidup</caption>
          <thead>
            <tr>
              <th scope="col">Horizon</th>
              <th scope="col">Skor Kesehatan</th>
              <th scope="col">Skor Gaya Hidup</th>
            </tr>
          </thead>
          <tbody>
            {healthPoints.map((hp, idx) => (
              <tr key={hp.horizon}>
                <td>{hp.label}</td>
                <td>{Math.round(hp.score)}</td>
                <td>{Math.round(lifestylePoints[idx]?.score ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto block overflow-visible"
      >
        {/* 3 Solid Horizontal Grid Lines with Left-Aligned Y Ticks (D22, Point 9) */}
        {gridLines.map((val) => {
          const y = getY(val);
          return (
            <g key={`grid-line-${val}`}>
              <line
                x1={pad.left}
                y1={y}
                x2={pad.left + chartW}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
              <text
                x={pad.left - 8}
                y={y + 3.5}
                textAnchor="end"
                className="text-[10px] tabular-nums fill-neutral-400 select-none font-medium"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Health Score Curve (#0F7A4E) */}
        {healthLineD && (
          <path
            d={healthLineD}
            fill="none"
            stroke="#0F7A4E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Lifestyle Score Curve (#2563EB) */}
        {lifestyleLineD && (
          <path
            d={lifestyleLineD}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Milestone Nodes: Ring berongga dihapus, hanya titik terisi di horizon terpilih (Point 7) */}
        {healthCoords.map((c, i) => {
          const lc = lifestyleCoords[i];
          const isSelected = c.isSelected;

          return (
            <g key={`milestone-${c.point.horizon}`}>
              {/* Only render filled dot on selected milestone (Point 7) */}
              {isSelected && (
                <>
                  <circle cx={c.x} cy={c.y} r="5" fill="#0F7A4E" />
                  {lc && <circle cx={lc.x} cy={lc.y} r="5" fill="#2563EB" />}
                </>
              )}

              {/* X Axis Label (Bold for selected horizon) */}
              <text
                x={c.x}
                y={baselineY + 18}
                textAnchor="middle"
                className={`text-[11px] select-none ${
                  isSelected ? "font-bold fill-[#0B1E38]" : "font-medium fill-neutral-400"
                }`}
              >
                {c.point.label}
              </text>

              {/* Interactive Hover Area (Point 1 & 18) */}
              <rect
                x={c.x - 28}
                y={pad.top}
                width={56}
                height={chartH + 20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip Only on Hover or Focus (Point 1 & 18) */}
      {hoveredIdx !== null && healthCoords[hoveredIdx] && lifestyleCoords[hoveredIdx] && (
        <div
          style={{ left: `${(healthCoords[hoveredIdx].x / svgWidth) * 100}%` }}
          className="absolute -top-3.5 -translate-x-1/2 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0B1E38] text-white text-[11px] tabular-nums shadow-md pointer-events-none z-10 whitespace-nowrap"
        >
          <span className="font-semibold text-neutral-300">{healthCoords[hoveredIdx].point.label}:</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {Math.round(healthCoords[hoveredIdx].point.score)}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {Math.round(lifestyleCoords[hoveredIdx].point.score)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Horizon Options & Condition Metadata ─────────────────────────────────────

const HORIZON_OPTIONS: { days: SimulationHorizon; label: string }[] = [
  { days: 30, label: "30 hari" },
  { days: 90, label: "90 hari" },
  { days: 180, label: "180 hari" },
];

// Judul kartu ringkas tanpa redundansi "Estimasi risiko" (Point 6)
const RISK_CONDITION_METADATA: Record<
  string,
  { title: string; diseaseSlug: string }
> = {
  diabetes: {
    title: "Diabetes",
    diseaseSlug: "diabetes",
  },
  hypertension: {
    title: "Hipertensi",
    diseaseSlug: "hypertension",
  },
  cardiovascular: {
    title: "Kardiovaskular",
    diseaseSlug: "cardiovascular",
  },
};

// ── Main Page Component ──────────────────────────────────────────────────────

export default function FutureSimulationPage() {
  const { isAuthorized, redirectToLogin } = useRequireAuth();
  const searchParams = useSearchParams();
  const urlPreview = searchParams?.get("preview");

  // State switcher for testing: 'normal' | 'high-risk' | 'empty' | 'error' | 'loading'
  const [previewState, setPreviewState] = useState<string>(urlPreview || "normal");

  const [selectedHorizon, setSelectedHorizon] = useState<SimulationHorizon>(30);
  const [simulations, setSimulations] = useState<Record<SimulationHorizon, FutureSimulationResponse | null>>({
    30: null,
    90: null,
    180: null,
  });
  const [healthProfile, setHealthProfile] = useState<HealthProfileResponse | null>(null);
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Collapsible Modeling Assumptions State (Point 2: Di paling bawah halaman)
  const [isAssumptionsOpen, setIsAssumptionsOpen] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setPreviewState("normal");
    setReloadKey((prev) => prev + 1);
  }, []);

  const handleHorizonSelect = useCallback((horizon: SimulationHorizon) => {
    setSelectedHorizon(horizon);
  }, []);

  // Parallel Fetch: 30, 90, 180, User Profile, and Consent Status
  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadAllSimulations() {
      setError(null);
      try {
        if (previewState === "empty") {
          throw new ApiClientError(404, "Profil kesehatan belum ditemukan.");
        }
        if (previewState === "error") {
          throw new ApiClientError(500, "Proyeksi belum bisa dihitung.");
        }

        const [res30, res90, res180, profileRes, consentRes] = await Promise.all([
          apiClient.simulation.future({ horizon_days: 30 }),
          apiClient.simulation.future({ horizon_days: 90 }),
          apiClient.simulation.future({ horizon_days: 180 }),
          apiClient.healthProfile.get().catch(() => null),
          apiClient.consent.getStatus().catch(() => null),
        ]);

        if (!isCancelled) {
          // If in high-risk preview mode, inject high-risk CVD with FR-037 threshold
          if (previewState === "high-risk" && res30) {
            const injectHighRisk = (sim: FutureSimulationResponse): FutureSimulationResponse => ({
              ...sim,
              risk_trajectories: sim.risk_trajectories.map((traj) =>
                traj.condition === "cardiovascular"
                  ? {
                      ...traj,
                      projected_score: 64.2,
                      baseline_score: 61.0,
                      delta_percentage: 3.2,
                      risk_level: "high",
                      risk_label: "Higher",
                      trend: "increasing",
                    }
                  : traj
              ),
            });
            setSimulations({
              30: injectHighRisk(res30),
              90: injectHighRisk(res90),
              180: injectHighRisk(res180),
            });
          } else {
            setSimulations({
              30: res30,
              90: res90,
              180: res180,
            });
          }
          setHealthProfile(profileRes);
          setConsentStatus(consentRes);
          setIsLoading(false);
          setIsRetrying(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setIsLoading(false);
          setIsRetrying(false);
          if (err instanceof ApiClientError) {
            if (err.kind === "unauthorized") {
              redirectToLogin();
              return;
            }
            setError(err);
          } else {
            setError(new ApiClientError(500, "Terjadi kesalahan internal saat memuat data proyeksi."));
          }
        }
      }
    }

    loadAllSimulations();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, reloadKey, redirectToLogin, previewState]);

  // Active current simulation data based on selected horizon
  const currentSim = simulations[selectedHorizon];

  // Discrete trajectory points for Health Score across all 4 milestones
  const healthTrajectoryPoints: DiscretePoint[] = useMemo(() => {
    if (!currentSim) return [];
    const baseline = currentSim.baseline_health_score;
    const s30 = simulations[30]?.projected_health_score ?? baseline;
    const s90 = simulations[90]?.projected_health_score ?? baseline;
    const s180 = simulations[180]?.projected_health_score ?? baseline;

    return [
      { horizon: 0, label: "Saat ini", score: baseline, delta: 0 },
      { horizon: 30, label: "30 hari", score: s30, delta: Number((s30 - baseline).toFixed(1)) },
      { horizon: 90, label: "90 hari", score: s90, delta: Number((s90 - baseline).toFixed(1)) },
      { horizon: 180, label: "180 hari", score: s180, delta: Number((s180 - baseline).toFixed(1)) },
    ];
  }, [currentSim, simulations]);

  // Discrete trajectory points for Lifestyle Score across all 4 milestones
  const lifestyleTrajectoryPoints: DiscretePoint[] = useMemo(() => {
    if (!currentSim) return [];
    const baseline = currentSim.baseline_lifestyle_score;
    const s30 = simulations[30]?.projected_lifestyle_score ?? baseline;
    const s90 = simulations[90]?.projected_lifestyle_score ?? baseline;
    const s180 = simulations[180]?.projected_lifestyle_score ?? baseline;

    return [
      { horizon: 0, label: "Saat ini", score: baseline, delta: 0 },
      { horizon: 30, label: "30 hari", score: s30, delta: Number((s30 - baseline).toFixed(1)) },
      { horizon: 90, label: "90 hari", score: s90, delta: Number((s90 - baseline).toFixed(1)) },
      { horizon: 180, label: "180 hari", score: s180, delta: Number((s180 - baseline).toFixed(1)) },
    ];
  }, [currentSim, simulations]);

  // Smoking status label helper
  const smokingLabel = useMemo(() => {
    const raw = healthProfile?.smoking_status?.toLowerCase();
    if (raw === "never") return "Tidak merokok";
    if (raw === "former") return "Mantan perokok";
    if (raw === "current") return "Perokok aktif";
    return "Status merokok stabil";
  }, [healthProfile]);

  // Stress level helper with direction (skala 1–5 sesuai PRD 11.4.3 & F27)
  const stressText = useMemo(() => {
    if (healthProfile?.stress_level !== null && healthProfile?.stress_level !== undefined) {
      const val = Math.min(5, Math.max(1, healthProfile.stress_level));
      const direction = val >= 4 ? "tinggi" : val >= 3 ? "sedang" : "rendah";
      return `${val}/5 (${direction})`;
    }
    return "3/5 (sedang)";
  }, [healthProfile]);

  // Family history helper from profile (Point 4)
  const familyHistoryText = useMemo(() => {
    if (healthProfile?.family_history) {
      return healthProfile.family_history_details || "Ada riwayat kardiometabolik";
    }
    return "Tidak ada riwayat";
  }, [healthProfile]);

  // BMI helper with transparent category (F26)
  const bmiVal = healthProfile?.bmi ? Number(healthProfile.bmi) : 18.4;
  const bmiText = formatNumberId(bmiVal);
  const bmiCategory =
    bmiVal < 18.5
      ? "berat kurang"
      : bmiVal < 23.0
      ? "normal"
      : bmiVal < 25.0
      ? "berlebih"
      : "obesitas";

  const activityText = healthProfile
    ? `${healthProfile.physical_activity_min_per_week} menit/minggu`
    : "300 menit/minggu";
  const sleepText = healthProfile
    ? `${formatNumberId(healthProfile.sleep_duration_hours)} jam/hari`
    : "8,0 jam/hari";

  // Consent & empty state conditions (BR-CONSENT-001 & BR-CONSENT-003)
  const isConsentRevoked =
    consentStatus?.active_consent?.revoked_at !== null &&
    consentStatus?.active_consent?.revoked_at !== undefined;
  const isConsentMissing = consentStatus !== null && !consentStatus.has_active_consent;

  if (!isAuthorized) {
    return null;
  }

  const showLoadingSkeleton = previewState === "loading" || (isLoading && !error);

  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full select-text">
      {/* ── 1. Header Halaman (Standard Dashboard Title Style & Horizon Control) ── */}
      <section className="border-b border-brand-900/10 pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1E38] break-words">
            Proyeksi
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 font-normal leading-relaxed">
            Perkiraan skor Anda jika kebiasaan saat ini tidak berubah.
          </p>
        </div>

        {/* Native Segmented Control berlaku untuk seluruh halaman (Point 1) */}
        <div
          role="radiogroup"
          aria-label="Pilihan horizon proyeksi"
          className="inline-flex items-center p-1 rounded-xl bg-neutral-100 border border-neutral-200/80 shrink-0 self-start sm:self-auto"
        >
          {HORIZON_OPTIONS.map((opt) => {
            const isSelected = selectedHorizon === opt.days;
            return (
              <button
                key={opt.days}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleHorizonSelect(opt.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-white text-[#0B1E38] shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── State: Empty / Consent State (BR-CONSENT-001 & BR-CONSENT-003) ── */}
      {error && error.kind === "not_found" && previewState !== "loading" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-900/10 flex items-center justify-center mx-auto text-brand-900">
            {isConsentRevoked || isConsentMissing ? (
              <ShieldAlert className="w-6 h-6 text-brand-900" />
            ) : (
              <ClipboardList className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#0B1E38]">
              {isConsentRevoked
                ? "Persetujuan medis dinonaktifkan"
                : isConsentMissing
                ? "Persetujuan medis diperlukan"
                : "Profil kesehatan belum tersedia"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              {isConsentRevoked
                ? "Persetujuan privasi Anda saat ini nonaktif. Aktifkan kembali persetujuan untuk mengakses estimasi dan simulasi masa depan."
                : isConsentMissing
                ? "Untuk menghitung proyeksi kesehatan, HELIORA memerlukan persetujuan pemrosesan data medis Anda."
                : "Proyeksi dihitung dari profil kesehatan Anda. Lengkapi profil untuk melihatnya."}
            </p>
          </div>
          <Link
            href={isConsentRevoked || isConsentMissing ? "/onboarding/consent" : "/onboarding/health-profile"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <span>
              {isConsentRevoked
                ? "Aktifkan persetujuan"
                : isConsentMissing
                ? "Beri persetujuan medis"
                : "Lengkapi profil kesehatan"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── State: Error / Risk Engine Failure (FR-042) ── */}
      {error && error.kind !== "not_found" && previewState !== "loading" && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-600">
            <AlertCircle className="w-5 h-5 text-neutral-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-[#0B1E38]">
              Proyeksi belum bisa dihitung
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Proyeksi belum bisa dihitung. Data Anda aman. Coba lagi dalam beberapa saat.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs px-5 py-2.5 font-semibold gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              <span>{isRetrying ? "Memuat ulang..." : "Coba lagi"}</span>
            </Button>
          </div>
          <p className="text-xs text-neutral-400 pt-1">
            Atau lihat estimasi saat ini di{" "}
            <Link href="/dashboard/risk" className="underline font-semibold text-neutral-600 hover:text-brand-900">
              halaman Risiko
            </Link>
            .
          </p>
        </div>
      )}

      {/* ── State: Loading Skeleton ── */}
      {showLoadingSkeleton && (
        <div className="space-y-6 animate-pulse motion-reduce:animate-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-28 rounded-2xl bg-neutral-200/70 border border-neutral-200/80" />
            <div className="h-28 rounded-2xl bg-neutral-200/70 border border-neutral-200/80" />
          </div>
          <div className="h-48 rounded-2xl bg-neutral-200/70 border border-neutral-200/80" />
          <div className="h-40 rounded-2xl bg-neutral-200/70 border border-neutral-200/80" />
          <div className="h-12 rounded-2xl bg-neutral-200/70 border border-neutral-200/80" />
        </div>
      )}

      {/* ── Simulation Content ── */}
      {!showLoadingSkeleton && !error && currentSim && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* ── 2. Section Skor & Grafik Gabungan (PRD 8.10, AC-SIM-01, Apple Simplicity) ── */}
          {(() => {
            const healthScoreInt = Math.round(currentSim.projected_health_score);
            const lifestyleScoreInt = Math.round(currentSim.projected_lifestyle_score);

            const rawHealthDelta = currentSim.projected_health_score - currentSim.baseline_health_score;
            const rawLifestyleDelta = currentSim.projected_lifestyle_score - currentSim.baseline_lifestyle_score;

            const healthDeltaInt = Math.round(rawHealthDelta);
            const lifestyleDeltaInt = Math.round(rawLifestyleDelta);

            const healthBand = getScoreBand(currentSim.projected_health_score);
            const lifestyleBand = getScoreBand(currentSim.projected_lifestyle_score);

            return (
              <section className="space-y-4 sm:space-y-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E38] tracking-tight">
                    Skor
                  </h2>
                </div>

                {/* 2 Kartu Skor Berdampingan (Tanpa '· stabil', delta hanya jika >= 1 poin - Point 5) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Kartu Skor Kesehatan */}
                  <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-semibold text-neutral-700">
                        Kesehatan
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0F7A4E] tabular-nums">
                          {healthScoreInt}
                        </span>
                        <span className="text-sm text-neutral-400 font-medium">/ 100</span>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-500 font-medium flex items-center gap-1.5 pt-0.5">
                        <span className="font-semibold text-neutral-700">{healthBand.label}</span>
                        {Math.abs(rawHealthDelta) >= 1 && (
                          healthDeltaInt > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                              · <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> +{healthDeltaInt} dari saat ini
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-rose-700 font-semibold">
                              · <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" /> −{Math.abs(healthDeltaInt)} dari saat ini
                            </span>
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Kartu Skor Gaya Hidup */}
                  <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-semibold text-neutral-700">
                        Gaya Hidup
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-bold tracking-tight text-[#2563EB] tabular-nums">
                          {lifestyleScoreInt}
                        </span>
                        <span className="text-sm text-neutral-400 font-medium">/ 100</span>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-500 font-medium flex items-center gap-1.5 pt-0.5">
                        <span className="font-semibold text-neutral-700">{lifestyleBand.label}</span>
                        {Math.abs(rawLifestyleDelta) >= 1 && (
                          lifestyleDeltaInt > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                              · <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" /> +{lifestyleDeltaInt} dari saat ini
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-rose-700 font-semibold">
                              · <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" /> −{Math.abs(lifestyleDeltaInt)} dari saat ini
                            </span>
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Satu Grafik Gabungan Dua Garis (D17–D22, Point 7 & 8) */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs">
                  <CombinedTrajectoryChart
                    healthPoints={healthTrajectoryPoints}
                    lifestylePoints={lifestyleTrajectoryPoints}
                    selectedHorizon={selectedHorizon}
                  />
                </div>
              </section>
            );
          })()}

          {/* ── 3. Seksi Risiko Kardiometabolik (Point 6–13: Grouped List Apple Health) ── */}
          {(() => {
            const allRisksLow = currentSim.risk_trajectories.every((t) => t.projected_score < 30);

            return (
              <section className="space-y-4 sm:space-y-5 pt-6">
                {/* Judul & Kalimat Jawaban (Gaya page risiko) */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E38] tracking-tight">
                    Risiko kardiometabolik
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                    {allRisksLow
                      ? "Ketiga risiko diperkirakan tetap rendah."
                      : `Perkiraan dalam ${selectedHorizon} hari berdasarkan profil Anda.`}
                  </p>
                </div>

                {/* Grouped List Pattern (Point 12 & Usulan Bentuk Akhir) */}
                <div className="divide-y divide-neutral-200/70 rounded-2xl bg-white border border-neutral-200/80 shadow-xs overflow-hidden">
                  {currentSim.risk_trajectories.map((traj) => {
                    const meta = RISK_CONDITION_METADATA[traj.condition] || {
                      title: traj.condition === "diabetes" ? "Diabetes" : traj.condition === "hypertension" ? "Hipertensi" : "Kardiovaskular",
                      diseaseSlug: traj.condition,
                    };
                    const riskBand = getRiskBand(traj.projected_score);
                    const absDelta = Math.abs(traj.delta_percentage);
                    const isSignificantChange = absDelta >= 1.0;

                    return (
                      <Link
                        key={traj.condition}
                        href={`/dashboard/risk/${meta.diseaseSlug}`}
                        className="group flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-neutral-50/80 transition-colors text-left"
                      >
                        <span className="font-semibold text-sm sm:text-base text-[#0B1E38] group-hover:text-brand-900 transition-colors">
                          {meta.title}
                        </span>

                        <div className="flex items-center gap-4 sm:gap-6 tabular-nums">
                          {/* Delta hanya jika >= 1 poin (Point 9 & 11) */}
                          {isSignificantChange && (
                            <span
                              className={`text-xs font-semibold inline-flex items-center gap-0.5 ${
                                traj.delta_percentage < 0 ? "text-emerald-700" : "text-amber-800"
                              }`}
                            >
                              {traj.delta_percentage < 0 ? (
                                <>
                                  <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                                  <span>turun {formatNumberId(absDelta)}%</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                                  <span>naik +{formatNumberId(absDelta)}%</span>
                                </>
                              )}
                            </span>
                          )}

                          {/* Kategori Tingkat Risiko: Teks biasa tanpa pill (Point 8) */}
                          <span className={`text-xs sm:text-sm font-medium ${riskBand.textClass}`}>
                            {riskBand.label}
                          </span>

                          {/* Nilai Probabilitas / Skor Risiko (Point 10) */}
                          <span className="text-sm sm:text-base font-bold text-[#0B1E38] min-w-[3rem] text-right">
                            {formatNumberId(traj.projected_score)}%
                          </span>

                          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Safety Alert jika ada kategori risiko tinggi (FR-037 & PRD 6.20) */}
                {currentSim.risk_trajectories.some((t) => t.risk_level === "high" || t.projected_score >= 60) && (
                  <div
                    role="alert"
                    className="text-xs text-amber-950 bg-amber-50/90 p-3.5 rounded-xl border border-amber-300/80 leading-relaxed space-y-1 text-left mt-3"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Perhatian</span>
                    </div>
                    <p>
                      Satu atau lebih estimasi risiko Anda berada di kategori lebih tinggi. Ini bukan diagnosis medis. Pertimbangkan untuk berkonsultasi dengan tenaga kesehatan.
                    </p>
                  </div>
                )}
              </section>
            );
          })()}

          {/* ── 4. Banner Asumsi (Dipindahkan ke Bawah Seluruh Hasil - Point 2, 3, 4, 6, 10, 11) ── */}
          <section className="pt-6">
            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/80 p-4 sm:p-5 transition-all">
              <button
                type="button"
                onClick={() => setIsAssumptionsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-left text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer select-none"
              >
                <span>Berdasarkan 7 asumsi</span>
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800">
                  {isAssumptionsOpen ? "Tutup" : "Lihat"}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isAssumptionsOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {isAssumptionsOpen && (
                <div className="pt-4 mt-3 border-t border-neutral-200/60 space-y-4 text-xs text-neutral-600 animate-in fade-in duration-200">
                  {/* Grup 1: Dari profil Anda (Point 4, 10 & 11: 1 kolom rata kiri-kanan, sentence case) */}
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-neutral-800 text-xs">
                      Dari profil Anda
                    </h3>
                    <div className="divide-y divide-neutral-200/60 rounded-xl bg-white border border-neutral-200/70 px-4 py-0.5 text-xs">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">Aktivitas fisik</span>
                        <span className="font-medium text-neutral-900 tabular-nums">{activityText}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">Durasi tidur</span>
                        <span className="font-medium text-neutral-900 tabular-nums">{sleepText}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">IMT</span>
                        <span className="font-medium text-neutral-900 tabular-nums">{bmiText} ({bmiCategory}){bmiVal < 18.5 ? " — IMT di bawah rentang normal" : ""}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">Tingkat stres</span>
                        <span className="font-medium text-neutral-900 tabular-nums">{stressText}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">Status merokok</span>
                        <span className="font-medium text-neutral-900">{smokingLabel}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">Riwayat keluarga</span>
                        <span className="font-medium text-neutral-900">{familyHistoryText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grup 2: Ketentuan model (Point 6 & 11: Tanpa baris kelangsungan kebiasaan, teks ringkas) */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="font-semibold text-neutral-800 text-xs">
                      Ketentuan model
                    </h3>
                    <div className="divide-y divide-neutral-200/60 rounded-xl bg-white border border-neutral-200/70 px-4 py-0.5 text-xs">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-neutral-500">Obat & perawatan</span>
                        <span className="font-medium text-neutral-900">Tidak ada yang baru</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── 5. CTA "Skenario" (Diseragamkan dengan Sidebar, PRD 8.16, BR-WHATIF-003, Gaya page risiko) ── */}
          <section className="pt-6">
            <div className="rounded-2xl bg-white border border-brand-900/10 p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1 max-w-xl">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E38] tracking-tight">
                    Uji perubahan gaya hidup di Skenario
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-0.5">
                    Coba ubah aktivitas, tidur, atau berat badan dan lihat pengaruhnya pada estimasi. Profil Anda tidak akan berubah.
                  </p>
                </div>

                <Link
                  href="/dashboard/simulation/what-if"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Buka Skenario</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ── 6. Footer Disclaimer (Kanonik PRD §20.14 & FR-005, gaya page risiko) ── */}
          <footer className="pt-8 pb-10 border-t border-neutral-200/80 mt-10">
            <p className="text-xs text-neutral-500 leading-relaxed text-left max-w-3xl font-normal">
              HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan. Proyeksi didasarkan pada asumsi kelangsungan kebiasaan, bukan kepastian klinis masa depan.
            </p>
          </footer>
        </div>
      )}
    </main>
  );
}
