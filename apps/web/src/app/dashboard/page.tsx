"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal as SFSlidersHorizontal,
  TrendingUp as SFChartUptrend,
  BookOpen as SFBookClosed,
  ArrowRight as SFArrowRight,
  AlertCircle as SFAlertCircle,
} from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { AssessmentSummaryResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MockDataNotice } from "@/components/mock-data-notice";
import { RiskBadge, getRiskTone } from "@/components/risk-badge";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthorized, assessment, isLoading, error, refetch: loadDashboard } = useLatestAssessment();
  const user = useMemo(
    () => (typeof window !== "undefined" ? apiClient.getStoredUser() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assessment]
  );
  const [highlightedRecId, setHighlightedRecId] = useState<string | null>(null);
  const [activeFactorFeature, setActiveFactorFeature] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState<ApiClientError | null>(null);

  const FEATURE_TO_CATEGORY: Record<string, "sleep" | "activity" | "nutrition" | "stress"> = {
    sleep_duration: "sleep",
    physical_activity: "activity",
    bmi: "nutrition",
    smoking_status: "activity",
    family_history: "nutrition",
    stress_level: "stress",
  };

  const handleFactorClick = (feature: string) => {
    setActiveFactorFeature(feature);
    const targetCategory = FEATURE_TO_CATEGORY[feature];
    const matchedRec = assessment?.recommendations.find(
      (r) => r.category === targetCategory
    );

    const targetId = matchedRec ? `rec-${matchedRec.id}` : "recommendations-section";
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (matchedRec) {
        setHighlightedRecId(matchedRec.id);
        setTimeout(() => {
          setHighlightedRecId(null);
        }, 2500);
      }
    }
  };

  const handleLogout = () => {
    apiClient.auth.logout();
    router.push("/login");
  };

  if (!isAuthorized || isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    if (error.kind === "not_found") {
      return (
        <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-brand-900/10 rounded-3xl p-8 shadow-xl shadow-brand-900/5 text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-900/10 text-brand-900 flex items-center justify-center mx-auto text-lg font-bold">
              H
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-brand-900">
                Belum Ada Asesmen Risiko
              </h1>
              <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                Anda belum memiliki hasil asesmen risiko preventif. Lengkapi profil kesehatan dan gaya hidup Anda untuk memulai estimasi model AI.
              </p>
            </div>
            {triggerError && (
              <p className="text-xs text-rose-600 font-medium">
                {triggerError.message}
              </p>
            )}
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
                      setTriggerError(
                        e instanceof ApiClientError
                          ? e
                          : new ApiClientError(0, "Gagal menjalankan asesmen.")
                      );
                    }
                  } finally {
                    setIsTriggering(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-md shadow-brand-900/15 transition-all cursor-pointer disabled:opacity-60"
              >
                <span>{isTriggering ? "Menjalankan Asesmen..." : "Jalankan Asesmen"}</span>
                <SFArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/onboarding/health-profile"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-brand-900/15 text-xs font-semibold text-brand-900/70 hover:text-brand-900 hover:bg-neutral-50 transition-all"
              >
                <span>Isi / Ubah Profil</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-brand-900/15 text-xs font-semibold text-brand-900/70 hover:text-brand-900 hover:bg-neutral-50 transition-all cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-rose-500/20 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <SFAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-brand-900">
              Gagal Memuat Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-rose-800/80 leading-relaxed">
              {error.message}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={loadDashboard}
              size="sm"
              className="px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-md shadow-brand-900/15"
            >
              Coba Lagi
            </Button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-brand-900/15 text-xs font-semibold text-brand-900/70 hover:text-brand-900"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }


  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Scrollable Dashboard Body */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl w-full mx-auto">
          {/* Welcome Header */}
          <div className="space-y-4 border-b border-brand-900/10 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
                  Halo, {user?.full_name?.split(" ")[0] || "Pengguna"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Ringkasan skor dan estimasi risiko dari profil gaya hidup Anda.
                </p>
              </div>
              {!assessment.is_mock && (
                <p className="text-xs text-muted-foreground">
                  Asesmen terakhir:{" "}
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
                    new Date(assessment.assessed_at)
                  )}
                </p>
              )}
            </div>
            {assessment.is_mock && <MockDataNotice />}
          </div>

          {/* Row 1: Score cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ScoreCard
              title="Health Score"
              description="Ringkasan dari BMI, aktivitas fisik, durasi tidur, dan kebiasaan merokok Anda."
              score={assessment.health_score}
            />
            <ScoreCard
              title="Lifestyle Score"
              description="Ringkasan kebiasaan harian Anda: tidur, aktivitas fisik, dan merokok."
              score={assessment.lifestyle_score}
            />
          </section>

          {/* Row 2: Estimated disease risk */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h2 className="text-base font-bold text-brand-900">Estimasi Risiko Kesehatan</h2>
              <p className="text-xs text-muted-foreground">
                Pilih kartu untuk melihat faktor yang memengaruhinya.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {assessment.risks.map((risk) => {
                const rawScore = risk.estimated_risk_score ?? risk.probability;
                const pct =
                  rawScore !== undefined
                    ? Math.round(rawScore <= 1.0 ? rawScore * 100 : rawScore)
                    : 0;
                const tone = getRiskTone(risk.risk_level);

                return (
                  <Link
                    key={risk.condition}
                    href={`/dashboard/risk/${risk.condition}`}
                    className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-900/30 hover:shadow-sm transition-all group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-brand-900">{risk.label}</h3>
                        <RiskBadge level={risk.risk_level} labelOverride={risk.risk_label} />
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums text-brand-900">
                          {pct}%
                        </span>
                        <span className="text-xs text-muted-foreground">estimasi skor risiko</span>
                      </div>

                      <div aria-hidden="true" className="h-1.5 w-full bg-brand-900/10 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${tone.fillClass}`} />
                      </div>

                      <p className="text-xs text-brand-900/70 leading-relaxed pt-1">
                        {risk.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-900/5 flex justify-between items-center text-xs text-muted-foreground">
                      <span>Tren: {TREND_LABELS[risk.trend]}</span>
                      <span className="font-semibold text-brand-900 group-hover:underline underline-offset-2">
                        Lihat rincian
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Row 3: Interactive Simulation Hub (Killer Features) */}
          <section className="rounded-2xl bg-brand-900 text-white p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-brand-200/60 uppercase">
                  Eksplorasi Skenario Preventif
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">Simulasi Gaya Hidup & Proyeksi Horison</h2>
                <p className="text-xs text-brand-200/80 leading-relaxed max-w-2xl">
                  Modul eksperimental untuk menguji dampak 4 variabel gaya hidup (Durasi Tidur, Aktivitas Fisik, Berat Badan, dan Status Bebas Rokok) terhadap estimasi risiko kesehatan.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-brand-200/60 uppercase block">
                  Status Engine AI/ML
                </span>
                <span className="text-xs font-mono font-semibold text-brand-200">
                  Tahap Kalibrasi Model (AI-002)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SFSlidersHorizontal aria-hidden="true" className="w-4 h-4 text-brand-200" />
                    <h3 className="text-sm font-bold text-white">What-If Simulator</h3>
                  </div>
                  <p className="text-xs text-brand-200/80 leading-relaxed">
                    Eksplorasi skenario interaktif: ubah durasi tidur, frekuensi latihan, dan target berat badan untuk melihat proyeksi perubahan estimasi risiko kardiometabolik Anda secara komparatif.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-brand-200/60">
                    Parameter: Tidur • Aktivitas Fisik • Berat Badan • Rokok
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">
                    Tersedia Sekarang
                  </span>
                  <Link
                    href="/dashboard/simulation/what-if"
                    className="text-xs font-semibold text-brand-200 hover:text-white underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>Buka What-If Simulator</span>
                    <SFArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <SFChartUptrend aria-hidden="true" className="w-4 h-4 text-brand-200" />
                    <h3 className="text-sm font-bold text-white">Proyeksi Horison 180 Hari</h3>
                  </div>
                  <p className="text-xs text-brand-200/80 leading-relaxed">
                    Analisis tren kardiometabolik 30, 90, dan 180 hari ke depan berdasarkan pola kebiasaan preventif saat ini tanpa intervensi spekulatif.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-brand-200/60">
                    Horison: 30 Hari • 90 Hari • 180 Hari
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-brand-200/60 uppercase">
                    Tahap Kalibrasi Model AI/ML
                  </span>
                  <Link
                    href="/dashboard/simulation/future"
                    className="text-xs font-semibold text-brand-200 hover:text-white underline underline-offset-2 flex items-center gap-1"
                  >
                    <span>Buka Proyeksi Horison</span>
                    <SFArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Row 4: Two-Column Analysis (Key Factors & Recommendations) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Top Contributing Factors (Explainable AI / Risk Factors) */}
            <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                  Analisis Penentu Risiko
                </p>
                <h2 className="text-base font-bold text-brand-900 mt-1">
                  Faktor Penentu Profil Risiko Anda
                </h2>
                <p className="text-xs text-brand-900/60 mt-0.5">
                  Klik salah satu faktor untuk melihat rekomendasi intervensi terarah di sebelahnya.
                </p>
              </div>

              <div className="space-y-3">
                {assessment.top_factors && assessment.top_factors.length > 0 ? (
                  assessment.top_factors.map((factor) => {
                    const isProtective = factor.impact === "decrease";
                    const isSelected = activeFactorFeature === factor.feature;

                    return (
                      <button
                        key={factor.feature}
                        type="button"
                        onClick={() => handleFactorClick(factor.feature)}
                        className={`w-full text-left p-3.5 rounded-xl border space-y-1.5 transition-all duration-200 group ${
                          isSelected
                            ? "bg-brand-50/90 border-brand-900/30 shadow-xs"
                            : "bg-brand-50/40 border-brand-900/5 hover:border-brand-900/20 hover:bg-brand-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-brand-900 group-hover:text-brand-900">
                            {factor.label}
                          </span>
                          <span
                            className={`text-[11px] font-mono font-bold ${
                              isProtective ? "text-emerald-800" : "text-amber-800"
                            }`}
                          >
                            {isProtective ? "Protektif" : `Beban +${factor.weight_percentage}%`}
                          </span>
                        </div>
                        <p className="text-xs text-brand-900/65 leading-relaxed">
                          {factor.description}
                        </p>
                        <div className="pt-2 flex items-center justify-between border-t border-brand-900/5">
                          <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase group-hover:text-brand-900/70">
                            Intervensi Terkait
                          </span>
                          <span className="text-[10px] font-mono font-bold text-brand-900/60 group-hover:text-brand-900 flex items-center gap-1">
                            Lihat Rencana Aksi ↓
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 rounded-xl bg-neutral-50/60 border border-brand-900/5 text-center">
                    <p className="text-xs text-brand-900/60 leading-relaxed">
                      Belum ada rincian faktor penentu risiko tambahan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Recommended Action Plan */}
            <div id="recommendations-section" className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                    Intervensi Terarah
                  </p>
                  <h2 className="text-base font-bold text-brand-900 mt-1">
                    Rencana Tindakan Berbasis Bukti
                  </h2>
                </div>
                <Link
                  href="/dashboard/recommendations"
                  className="text-xs font-semibold text-brand-900 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Lihat Semua</span>
                  <SFArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {assessment.recommendations && assessment.recommendations.length > 0 ? (
                  assessment.recommendations.map((rec) => {
                    const isHighlighted = highlightedRecId === rec.id;

                    return (
                      <div
                        id={`rec-${rec.id}`}
                        key={rec.id}
                        className={`p-3.5 rounded-xl border space-y-1.5 transition-all duration-300 ${
                          isHighlighted
                            ? "bg-brand-50/90 border-brand-700/50 ring-2 ring-brand-700/30 shadow-sm"
                            : "bg-brand-50/40 border-brand-900/5 hover:border-brand-900/15"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-brand-900">{rec.title}</h3>
                          <span className="text-[11px] font-mono font-bold text-brand-900/50">
                            Bukti Grade {rec.evidence_level}
                          </span>
                        </div>
                        <p className="text-xs text-brand-900/70 leading-relaxed">{rec.action}</p>
                        <div className="pt-2 flex items-center justify-between border-t border-brand-900/5">
                          <div className="flex items-center gap-1.5 text-[11px] text-brand-900/50 font-mono">
                            <SFBookClosed className="w-3 h-3 text-brand-900/40" />
                            <span>{rec.source}</span>
                          </div>
                          <Link
                            href={`/dashboard/evidence?ref=${rec.id}`}
                            className="text-[10px] font-mono font-bold text-brand-900/60 hover:text-brand-900 hover:underline"
                          >
                            Bukti Medis →
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 rounded-xl bg-neutral-50/60 border border-brand-900/5 text-center">
                    <p className="text-xs text-brand-900/60 leading-relaxed">
                      Belum ada rekomendasi tindakan untuk saat ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <footer className="pt-6 border-t border-brand-900/10">
            <DisclaimerBanner variant="banner" />
          </footer>
        </main>
      </div>
  );
}

const TREND_LABELS: Record<AssessmentSummaryResponse["risks"][number]["trend"], string> = {
  stable: "Stabil",
  increasing: "Meningkat",
  decreasing: "Menurun",
};

// Provisional cut-offs until the scoring formula is documented (Architecture §9.2).
function getScoreCategory(score: number) {
  if (score >= 80) return { label: "Kondisi Baik", className: "text-emerald-700" };
  if (score >= 60) return { label: "Cukup Sehat", className: "text-brand-900/70" };
  return { label: "Perlu Perhatian", className: "text-amber-700" };
}

function ScoreCard({ title, description, score }: { title: string; description: string; score: number }) {
  const category = getScoreCategory(score);

  return (
    <div className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
          {title}
        </h2>
        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${category.className}`}>
          {category.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold font-mono tracking-tight text-brand-900">
          {score}
        </span>
        <span className="text-xs font-mono text-brand-900/40">/100</span>
      </div>

      <p className="text-xs text-brand-900/60 leading-relaxed mt-auto pt-3 border-t border-brand-900/5">
        {description}
      </p>
    </div>
  );
}
