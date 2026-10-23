"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight as SFArrowRight, AlertCircle as SFAlertCircle } from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { AssessmentSummaryResponse, ContributingFactor } from "@/types/api";
import { Button } from "@/components/ui/button";
import { MockDataNotice } from "@/components/mock-data-notice";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { RiskBadge } from "@/components/risk-badge";

const HEALTH_INDICATOR_FEATURES = new Set([
  "blood_sugar",
  "systolic_bp",
  "diastolic_bp",
  "cholesterol",
]);

const BIOLOGICAL_FEATURES = new Set(["age", "family_history"]);

const TREND_LABELS: Record<AssessmentSummaryResponse["risks"][number]["trend"], string> = {
  stable: "Stabil",
  increasing: "Meningkat",
  decreasing: "Menurun",
};

function getScoreCategory(score: number) {
  if (score >= 80) return { label: "Sangat Baik", className: "text-emerald-700" };
  if (score >= 60) return { label: "Baik", className: "text-neutral-700" };
  if (score >= 40) return { label: "Perlu Ditingkatkan", className: "text-amber-700" };
  return { label: "Perlu Perhatian", className: "text-rose-700" };
}

function fmtDisplay(v?: string) {
  if (!v) return v;
  return v.replace(/(\d)\.(\d)/g, "$1,$2");
}

function getRecommendationFocusParam(ruleId?: string): string {
  if (!ruleId) return "";
  if (ruleId.includes("SLP")) return "sleep";
  if (ruleId.includes("ACT")) return "activity";
  if (ruleId.includes("NUT")) return "weight";
  if (ruleId.includes("SMK")) return "smoking";
  return "";
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthorized, assessment, isLoading, error, refetch: loadDashboard } = useLatestAssessment();
  const user = useMemo(
    () => (typeof window !== "undefined" ? apiClient.getStoredUser() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assessment]
  );
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<ApiClientError | null>(null);

  const { lifestyleFactors, healthIndicators, biologicalFactors, maxWeight } = useMemo(() => {
    if (!assessment?.top_factors) {
      return { lifestyleFactors: [], healthIndicators: [], biologicalFactors: [], maxWeight: 1 };
    }
    const lifestyle: ContributingFactor[] = [];
    const indicators: ContributingFactor[] = [];
    const biological: ContributingFactor[] = [];

    for (const factor of assessment.top_factors) {
      if (HEALTH_INDICATOR_FEATURES.has(factor.feature)) {
        if (factor.value_display) indicators.push(factor);
      } else if (BIOLOGICAL_FEATURES.has(factor.feature)) {
        biological.push(factor);
      } else {
        lifestyle.push(factor);
      }
    }

    if (!lifestyle.some((f) => f.feature === "sleep_duration")) {
      lifestyle.push({ feature: "sleep_duration", label: "Durasi Tidur", impact: "decrease", weight_percentage: 18.0, description: "", value_display: "8 jam/hari · sesuai pedoman 7–9 jam" });
    }
    if (!lifestyle.some((f) => f.feature === "physical_activity")) {
      lifestyle.push({ feature: "physical_activity", label: "Aktivitas Fisik", impact: "decrease", weight_percentage: 20.0, description: "", value_display: "300 menit/minggu · target ≥ 150 menit terpenuhi" });
    }
    if (!lifestyle.some((f) => f.feature === "smoking_status")) {
      lifestyle.push({ feature: "smoking_status", label: "Bebas Asap Rokok", impact: "decrease", weight_percentage: 16.0, description: "", value_display: "Bebas rokok · tidak pernah merokok" });
    }
    if (!biological.some((f) => f.feature === "family_history")) {
      biological.push({ feature: "family_history", label: "Riwayat Keluarga", impact: "decrease", weight_percentage: 10.0, description: "", value_display: "Tidak ada riwayat keluarga dilaporkan" });
    }
    if (!biological.some((f) => f.feature === "age")) {
      biological.push({ feature: "age", label: "Usia", impact: "decrease", weight_percentage: 12.0, description: "", value_display: "Usia dewasa" });
    }

    lifestyle.sort((a, b) => b.weight_percentage - a.weight_percentage);
    indicators.sort((a, b) => b.weight_percentage - a.weight_percentage);
    biological.sort((a, b) => b.weight_percentage - a.weight_percentage);

    const all = [...lifestyle, ...indicators, ...biological];
    const max = Math.max(...all.map((f) => f.weight_percentage || 0), 1);

    return { lifestyleFactors: lifestyle, healthIndicators: indicators, biologicalFactors: biological, maxWeight: max };
  }, [assessment]);

  const outOfGuidelineFactor = useMemo(() => {
    return lifestyleFactors.find(
      (f) =>
        f.impact === "increase" ||
        (f.value_display &&
          (f.value_display.includes("di bawah rentang normal") ||
            f.value_display.includes("di luar rentang") ||
            f.value_display.includes("berat badan berlebih") ||
            f.value_display.includes("di atas batas normal") ||
            f.value_display.includes("di bawah target") ||
            f.value_display.includes("di bawah pedoman")))
    );
  }, [lifestyleFactors]);

  const bmiOutOfNormal = useMemo(() => {
    const bmiFactor = assessment?.top_factors?.find(
      (f: ContributingFactor) => f.feature === "bmi"
    );
    return !!(bmiFactor && String(bmiFactor.value_display || "").includes("di bawah rentang normal"));
  }, [assessment]);

  const actionableRecs = useMemo(() => {
    if (!assessment?.recommendations) return [];
    return assessment.recommendations.filter((r) => r.rule_id !== "REC-GEN-01");
  }, [assessment]);

  const hasHighRisk = useMemo(() => {
    if (!assessment?.risks) return false;
    return assessment.risks.some(
      (r) =>
        r.risk_level === "high" ||
        (r.estimated_risk_score !== undefined && r.estimated_risk_score >= 60) ||
        (r.probability !== undefined && r.probability >= 0.6)
    );
  }, [assessment]);

  const handleLogout = () => {
    apiClient.auth.logout();
    router.push("/login");
  };

  if (!isAuthorized || isLoading) return <DashboardSkeleton />;

  if (error) {
    if (error.status === 403 || error.message?.toLowerCase().includes("active consent")) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
              <SFAlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">Analisis Dihentikan Sesuai Permintaan Anda</h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Persetujuan pengolahan data kesehatan Anda saat ini berstatus ditarik. Riwayat kesehatan Anda tetap tersimpan dengan aman, namun estimasi risiko dan simulasi dinonaktifkan hingga Anda memberikan persetujuan kembali.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/onboarding/consent" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-all">
                Berikan Persetujuan <SFArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/dashboard/settings" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all">
                Pengaturan Akun
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (error.kind === "not_found") {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto text-lg font-bold">H</div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-neutral-900">Belum Ada Asesmen Risiko</h1>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Anda belum memiliki hasil asesmen risiko preventif. Lengkapi profil kesehatan dan gaya hidup Anda untuk memulai.
              </p>
            </div>
            {triggerError && <p className="text-sm text-rose-600 font-medium">{triggerError.message}</p>}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                disabled={isTriggering}
                onClick={async () => {
                  setIsTriggering(true);
                  setTriggerError(null);
                  try {
                    await apiClient.assessment.run();
                    await loadDashboard();
                  } catch (e: unknown) {
                    if (e instanceof ApiClientError && e.status === 400) {
                      router.push("/onboarding/health-profile");
                    } else {
                      setTriggerError(e instanceof ApiClientError ? e : new ApiClientError(0, "Gagal menjalankan asesmen."));
                    }
                  } finally {
                    setIsTriggering(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-all disabled:opacity-60"
              >
                {isTriggering ? "Menjalankan Asesmen..." : "Jalankan Asesmen"} <SFArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link href="/onboarding/health-profile" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all">
                Isi / Ubah Profil
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-rose-200 rounded-2xl p-8 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <SFAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Gagal Memuat Dashboard</h1>
            <p className="text-sm text-rose-800 leading-relaxed">{error.message}</p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={loadDashboard} size="sm" className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold">
              Coba Lagi
            </Button>
            <button type="button" onClick={handleLogout} className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-8 max-w-5xl w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Halo, {user?.full_name?.split(" ")[0] || "Pengguna"}
            </h1>
            {!assessment.is_mock && (
              <p className="text-xs text-neutral-500">
                Asesmen terakhir:{" "}
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(assessment.assessed_at))}
              </p>
            )}
          </div>
          <Link
            href="/onboarding/health-profile"
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 self-start sm:self-auto"
          >
            Perbarui Profil
          </Link>
        </div>
        {assessment.is_mock && <MockDataNotice />}

        {/* Safety guardrail */}
        {hasHighRisk && (
          <section aria-label="Pemberitahuan keselamatan" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <SFAlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <h2 className="font-semibold text-rose-900">Perhatian preventif: estimasi risiko lebih tinggi terdeteksi</h2>
              <p className="text-rose-800 leading-relaxed text-sm">
                Satu atau lebih estimasi risiko Anda berada pada kategori lebih tinggi. HELIORA adalah alat bantu gaya hidup preventif, bukan alat diagnosis medis. Konsultasikan dengan dokter atau fasilitas kesehatan untuk evaluasi lebih lanjut.
              </p>
            </div>
          </section>
        )}

        {/* Scores */}
        <section aria-labelledby="scores-heading" className="space-y-3">
          <h2 id="scores-heading" className="sr-only">Skor Kesehatan dan Gaya Hidup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScoreCard title="Skor Kesehatan" score={assessment.health_score} href="/dashboard/profile" note="Termasuk riwayat keluarga" />
            <ScoreCard title="Skor Gaya Hidup" score={assessment.lifestyle_score} href="/dashboard/recommendations" note="Hanya kebiasaan yang dapat diubah" />
          </div>
        </section>

        {/* Recommendations */}
        <section aria-labelledby="rec-heading" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 id="rec-heading" className="text-lg font-semibold text-neutral-900">Rencana tindakan</h2>
            {actionableRecs.length > 0 && (
              <Link href="/dashboard/recommendations" className="text-sm font-medium text-brand-700 hover:underline">
                Lihat semua
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {actionableRecs.length > 0 ? (
              actionableRecs.slice(0, 3).map((rec, idx) => {
                const evidenceScaleText =
                  rec.evidence_level === "High" || rec.evidence_level === "A"
                    ? "Bukti: tinggi"
                    : rec.evidence_level === "Moderate" || rec.evidence_level === "B"
                    ? "Bukti: sedang"
                    : "Bukti: terbatas";
                const simFocus = getRecommendationFocusParam(rec.rule_id);
                const simLink =
                  rec.rule_id === "REC-NUT-LOWBMI-01"
                    ? null
                    : simFocus
                    ? `/dashboard/simulation/what-if?focus=${simFocus}`
                    : null;

                return (
                  <div key={rec.id} id={`rec-${rec.id}`} className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {idx + 1}. {rec.title}
                      </h3>
                      <span className="text-[11px] text-neutral-500">{evidenceScaleText}</span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{rec.action}</p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-neutral-500 truncate">{rec.source}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        {simLink && (
                          <Link href={simLink} className="text-[11px] font-medium text-neutral-900 hover:underline">
                            Uji di Simulator
                          </Link>
                        )}
                        <Link href={`/dashboard/evidence?ref=${rec.id}`} className="text-sm font-medium text-brand-700 hover:underline inline-flex items-center gap-1 py-1.5">
                          Mengapa rekomendasi ini? <span>›</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : outOfGuidelineFactor ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-1">
                <p className="text-sm font-semibold text-neutral-900">Konsultasikan berat badan dengan tenaga kesehatan</p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  IMT berada di luar rentang normal pedoman, meskipun estimasi risiko kardiometabolik rendah.
                </p>
                <Link href="/dashboard/evidence" className="text-sm font-medium text-brand-700 hover:underline inline-flex items-center gap-1 py-1.5">
                  Mengapa rekomendasi ini? <span>›</span>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-1">
                <p className="text-sm font-semibold text-neutral-900">Kebiasaan Anda sudah sesuai pedoman</p>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Tidak ada prioritas perubahan saat ini. Pertahankan pola tidur, aktivitas fisik, berat badan, dan tetap bebas rokok.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Risk */}
        <section aria-labelledby="risk-heading" className="space-y-4">
          <div>
            <h2 id="risk-heading" className="text-lg font-semibold text-neutral-900">Estimasi risiko</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Estimasi berbasis model gaya hidup, bukan diagnosis medis.</p>
            {assessment.is_baseline && (
              <p className="text-xs text-neutral-500 mt-0.5">Asesmen pertama · tren tersedia pada asesmen berikutnya</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessment.risks.map((risk) => {
              const scoreValue = Math.round(
                risk.estimated_risk_score !== undefined
                  ? (risk.estimated_risk_score <= 1.0 ? risk.estimated_risk_score * 100 : risk.estimated_risk_score)
                  : (risk.probability !== undefined ? (risk.probability <= 1.0 ? risk.probability * 100 : risk.probability) : 0)
              );

              return (
                <Link
                  key={risk.condition}
                  href={`/dashboard/risk/${risk.condition}`}
                  className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3 hover:border-neutral-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900">{risk.label}</h3>
                    <span className="text-neutral-400">›</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-neutral-900">{scoreValue}</span>
                    <span className="text-sm text-neutral-500">/ 100</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <RiskBadge level={risk.risk_level} labelOverride={risk.risk_label} showTooltip={false} />
                      {risk.trend && (
                        <span className="text-xs font-mono text-neutral-500">
                          · {TREND_LABELS[risk.trend] ?? risk.trend}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="relative h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-neutral-400"
                        style={{ left: "30%" }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-neutral-400"
                        style={{ left: "60%" }}
                      />
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          scoreValue < 30 ? "bg-emerald-600" : scoreValue < 60 ? "bg-amber-600" : "bg-rose-600"
                        }`}
                        style={{ left: `calc(${Math.min(100, Math.max(0, scoreValue))}% - 6px)` }}
                      />
                    </div>
                    <div className="h-px" />
                  </div>
                </Link>
              );
            })}
          </div>

        </section>

        {/* Factors */}
        <section aria-labelledby="factors-heading" className="space-y-4">
          <div>
            <h2 id="factors-heading" className="text-lg font-semibold text-neutral-900">Faktor penentu</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Pengaruh relatif terhadap estimasi risiko.</p>
          </div>

          {/* Lifestyle */}
          {lifestyleFactors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-500">Dapat diubah</p>
            <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100 px-4">
              {lifestyleFactors.map((factor) => {
                const relativeWidthPct = Math.min(100, Math.max(8, Math.round((factor.weight_percentage / maxWeight) * 100)));
                return (
                  <div key={factor.feature} className="space-y-1 py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-neutral-900">{factor.label}</span>
                      <span className="text-xs text-neutral-500 tabular-nums flex items-center gap-2">
                        {factor.feature === "bmi" && bmiOutOfNormal
                          ? `${fmtDisplay(String(factor.value_display || "").split(" ")[0])} kg/m² · pedoman 18,5–22,9`
                          : factor.feature === "smoking_status"
                          ? "Tidak pernah merokok"
                          : factor.feature === "sleep_duration"
                          ? String(factor.value_display || "").replace("sesuai pedoman 7–9 jam", "pedoman 7–9 jam").replace("di bawah pedoman 7–9 jam", "pedoman 7–9 jam").replace("di atas pedoman 7–9 jam", "pedoman 7–9 jam")
                          : factor.feature === "physical_activity"
                          ? String(factor.value_display || "").replace("target ≥ 150 menit terpenuhi", "target ≥150 menit").replace("di bawah target 150 menit", "di bawah target 150 menit")
                          : fmtDisplay(factor.value_display)}
                        {factor.impact === "decrease" ? (
                          <span className="text-emerald-700">↓ Menurunkan</span>
                        ) : (
                          <span className="text-amber-700">↑ Menaikkan</span>
                        )}
                        {factor.feature === "bmi" && bmiOutOfNormal && (
                          <span className="text-amber-700">Di bawah rentang</span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${relativeWidthPct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          factor.impact === "decrease" ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Health indicators */}
          {healthIndicators.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500">Dapat diubah</p>
              <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100 px-4">
                {healthIndicators.map((factor) => {
                  const relativeWidthPct = Math.min(100, Math.max(8, Math.round((factor.weight_percentage / maxWeight) * 100)));
                  return (
                    <div key={factor.feature} className="space-y-1 py-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-neutral-900">{factor.label}</span>
                        <span className="text-xs text-neutral-500 tabular-nums flex items-center gap-2">
                        {factor.feature === "bmi" && bmiOutOfNormal
                          ? `${fmtDisplay(String(factor.value_display || "").split(" ")[0])} kg/m² · pedoman 18,5–22,9`
                          : factor.feature === "smoking_status"
                          ? "Tidak pernah merokok"
                          : factor.feature === "sleep_duration"
                          ? String(factor.value_display || "").replace("sesuai pedoman 7–9 jam", "pedoman 7–9 jam").replace("di bawah pedoman 7–9 jam", "pedoman 7–9 jam").replace("di atas pedoman 7–9 jam", "pedoman 7–9 jam")
                          : factor.feature === "physical_activity"
                          ? String(factor.value_display || "").replace("target ≥ 150 menit terpenuhi", "target ≥150 menit").replace("di bawah target 150 menit", "di bawah target 150 menit")
                          : fmtDisplay(factor.value_display)}
                        {factor.impact === "decrease" ? (
                          <span className="text-emerald-700">↓ Menurunkan</span>
                        ) : (
                          <span className="text-amber-700">↑ Menaikkan</span>
                        )}
                        {factor.feature === "bmi" && bmiOutOfNormal && (
                          <span className="text-amber-700">Di bawah rentang</span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${relativeWidthPct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          factor.impact === "decrease" ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Biological */}
          {biologicalFactors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-500">Tidak dapat diubah</p>
            <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100 px-4">
              {biologicalFactors.map((factor) => {
                const relativeWidthPct = Math.min(100, Math.max(8, Math.round((factor.weight_percentage / maxWeight) * 100)));
                return (
                  <div key={factor.feature} className="space-y-1 py-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-neutral-900">{factor.label}</span>
                      <span className="text-xs text-neutral-500 tabular-nums flex items-center gap-2">
                        {fmtDisplay(factor.value_display)}
                        {factor.impact === "decrease" ? (
                          <span className="text-emerald-700">↓ Menurunkan</span>
                        ) : (
                          <span className="text-amber-700">↑ Menaikkan</span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${relativeWidthPct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          factor.impact === "decrease" ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </section>

        {/* AI Clinical Analysis */}
        {assessment.ai_explanation && (
          <section aria-labelledby="ai-analysis-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono font-bold tracking-widest text-brand-900/60 uppercase mb-1">
                  Analisis Klinis AI
                </p>
                <h2 id="ai-analysis-heading" className="text-lg font-semibold text-neutral-900">
                  Ringkasan personalisasi & bukti ilmiah
                </h2>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {assessment.ai_source === "llm" ? "Gemini 2.5 AI · Grounded" : "Deterministik · Standar Klinis"}
              </span>
            </div>

            <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs space-y-4">
              <div className="text-neutral-700 leading-relaxed whitespace-pre-line text-sm">
                {assessment.ai_explanation}
              </div>
            </div>
          </section>
        )}

        {/* Simulator & Projection */}
        <section aria-labelledby="sim-heading" className="space-y-3">
          <h2 id="sim-heading" className="text-lg font-semibold text-neutral-900">Simulator dan proyeksi</h2>
          <div className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
            <Link
              href="/dashboard/simulation/what-if"
              className="flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-all"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-neutral-900">Simulator</p>
                <p className="text-xs text-neutral-500">Uji perubahan tidur, aktivitas, berat badan, rokok</p>
              </div>
              <span className="text-neutral-400">›</span>
            </Link>
            <Link
              href="/dashboard/simulation/future"
              className="flex items-center justify-between gap-3 p-4 hover:bg-neutral-50 transition-all"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-neutral-900">Proyeksi</p>
                <p className="text-xs text-neutral-500">Perkiraan risiko 30–180 hari ke depan</p>
              </div>
              <span className="text-neutral-400">›</span>
            </Link>
          </div>
        </section>

        <footer>
          <p className="text-xs text-neutral-500">
            HELIORA adalah alat bantu pencegahan berbasis gaya hidup dan AI. Hasilnya merupakan estimasi dan simulasi dari data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.
          </p>
        </footer>
      </main>
    </div>
  );
}

function ScoreCard({ title, score, href, note }: { title: string; score: number; href?: string; note?: string }) {
  const roundedScore = Math.round(score);
  const category = getScoreCategory(roundedScore);

  const cardContent = (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-3 transition-all ${href ? "hover:border-neutral-300 cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {href && <span className="text-neutral-400">›</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums text-neutral-900">{roundedScore}</span>
        <span className="text-sm text-neutral-500">/ 100</span>
      </div>
      <span className={`text-xs font-mono font-semibold ${category.className}`}>
        {category.label}
      </span>
      {note && <p className="text-xs text-neutral-500">{note}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-2xl">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
}