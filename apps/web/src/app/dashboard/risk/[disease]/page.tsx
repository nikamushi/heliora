"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sliders,
  TrendingUp,
  BookOpen,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { AssessmentSummaryResponse, RiskAssessmentItem, RiskLevel } from "@/types/api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MockDataNotice } from "@/components/mock-data-notice";
import { RiskBadge, getRiskTone } from "@/components/risk-badge";

interface DiseaseDetailMeta {
  title: string;
  category: string;
  definition: string;
  guidelineSource: string;
  factors: {
    name: string;
    weight: number;
    impact: "increase" | "decrease";
    note: string;
  }[];
  actionPlan: {
    title: string;
    description: string;
    impactLabel: string;
  }[];
}

const DISEASE_METADATA: Record<string, DiseaseDetailMeta> = {
  diabetes: {
    title: "Diabetes Melitus Tipe 2",
    category: "Metabolik & Endokrin",
    definition:
      "Estimasi tingkat risiko gangguan metabolisme glukosa dan resistensi insulin berbasis parameter CDC BRFSS, gaya hidup, dan indeks massa tubuh.",
    guidelineSource:
      "Konsensus Pengelolaan & Pencegahan DM Tipe 2 di Indonesia (PERKENI, 2021) & WHO Global Report on Diabetes",
    factors: [
      {
        name: "Indeks Massa Tubuh (BMI)",
        weight: 35,
        impact: "increase",
        note: "Akumulasi jaringan adiposa memicu resistensi reseptor insulin perifer."
      },
      {
        name: "Aktivitas Fisik Rendah",
        weight: 28,
        impact: "increase",
        note: "Kurangnya kontraksi otot menurunkan translokasi transporter GLUT-4."
      },
      {
        name: "Durasi Tidur Kurang (< 6 Jam)",
        weight: 18,
        impact: "increase",
        note: "Memicu peningkatan kortisol diurnal dan resistensi metabolik nocturnal."
      },
      {
        name: "Kebiasaan Tidak Merokok",
        weight: 19,
        impact: "decrease",
        note: "Faktor protektif yang menurunkan stres oksidatif vaskular."
      }
    ],
    actionPlan: [
      {
        title: "Aktivitas Aerobik 150 Menit/Minggu",
        description: "Bagi dalam 3–5 sesi (seperti jalan cepat atau sepeda) untuk meningkatkan ambilan glukosa tanpa insulin.",
        impactLabel: "Potensi reduksi risiko: -14%"
      },
      {
        title: "Stabilisasi Jam Tidur (7–8 Jam)",
        description: "Jaga jadwal tidur konsisten guna menormalkan ritme sirkadian dan regulasi nafsu makan leptin/ghrelin.",
        impactLabel: "Potensi reduksi risiko: -8%"
      },
      {
        title: "Manajemen Porsi & Karbohidrat Olahan",
        description: "Ganti karbohidrat sederhana dengan serat pangan tinggi (biji-bijian, sayuran hijau) untuk memperlambat lonjakan glikemik.",
        impactLabel: "Potensi reduksi risiko: -11%"
      }
    ]
  },
  hypertension: {
    title: "Hipertensi & Vaskular",
    category: "Sirkulasi & Hemodinamik",
    definition:
      "Estimasi tingkat risiko peningkatan resistensi vaskular sistemik dan tekanan arterial persisten berbasis pemodelan risiko preventif.",
    guidelineSource:
      "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular (PERKI, 2021) & AHA/ACC Hypertension Guidelines",
    factors: [
      {
        name: "Tingkat Beban Stres Harian",
        weight: 32,
        impact: "increase",
        note: "Hiperaktivitas sistem saraf simpatis memicu vasokonstriksi arteriol."
      },
      {
        name: "Durasi & Kedalaman Istirahat",
        weight: 26,
        impact: "increase",
        note: "Gangguan istirahat menghambat nocturnal dipping alami tekanan darah."
      },
      {
        name: "Kebugaran Fisik Rutin",
        weight: 22,
        impact: "decrease",
        note: "Mendukung kelenturan endotel pembuluh darah dan pelepasan nitric oxide."
      },
      {
        name: "Riwayat Tekanan Darah Keluarga",
        weight: 20,
        impact: "increase",
        note: "Predisposisi genetik terhadap regulasi natrium dan tonus vaskular."
      }
    ],
    actionPlan: [
      {
        title: "Manajemen Stres & Protokol Pernapasan",
        description: "Latihan pernapasan dalam terstruktur (4-7-8) 10 menit setiap malam untuk meredam tonus simpatis.",
        impactLabel: "Potensi reduksi risiko: -12%"
      },
      {
        title: "Diet Rendah Natrium (Pola DASH)",
        description: "Batasi asupan natrium harian di bawah 2.000 mg dan perbanyak kalium dari buah segar serta pisang/alpukat.",
        impactLabel: "Potensi reduksi risiko: -15%"
      },
      {
        title: "Latihan Kardiorespirasi Konsisten",
        description: "Jalan santai atau renang 30 menit sehari menjaga kelenturan dinding pembuluh arteri.",
        impactLabel: "Potensi reduksi risiko: -9%"
      }
    ]
  },
  cardiovascular: {
    title: "Penyakit Kardiovaskular",
    category: "Jantung & Sirkulasi Sistemik",
    definition:
      "Estimasi tingkat risiko beban hemodinamik jantung, disfungsi mikrovaskular, dan aterosklerosis preventif jangka panjang.",
    guidelineSource:
      "Panduan Pencegahan Primer Penyakit Kardiovaskular (PERKI & ESC Guidelines, 2021)",
    factors: [
      {
        name: "Aktivitas Kardio & Sedentari",
        weight: 34,
        impact: "increase",
        note: "Waktu duduk berkepanjangan memperlambat sirkulasi perifer dan profil lipid."
      },
      {
        name: "Status Bebas Rokok",
        weight: 28,
        impact: "decrease",
        note: "Bebas dari karbon monoksida dan stres endotel yang diinduksi nikotin."
      },
      {
        name: "Komposisi Massa Tubuh",
        weight: 22,
        impact: "increase",
        note: "Meningkatkan curah kerja jantung basal untuk memenuhi perfusi jaringan."
      },
      {
        name: "Durasi Tidur Teratur",
        weight: 16,
        impact: "decrease",
        note: "Memberikan periode istirahat pemulihan miokardium yang memadai."
      }
    ],
    actionPlan: [
      {
        title: "Hindari Perilaku Sedentari Panjang",
        description: "Berdiri dan regangkan tubuh minimal 3–5 menit setiap 60 menit duduk bekerja di meja.",
        impactLabel: "Potensi reduksi risiko: -10%"
      },
      {
        title: "Pertahankan Gaya Hidup Bebas Rokok",
        description: "Pertahankan perlindungan vaskular maksimal dari paparan tar dan zat karsinogenik aerosol.",
        impactLabel: "Proteksi optimal terjaga"
      },
      {
        title: "Pemeriksaan Profil Metabolik Berkala",
        description: "Cek tekanan darah dan profil kolesterol setahun sekali sebagai langkah pengawasan preventif.",
        impactLabel: "Deteksi dini preventif"
      }
    ]
  }
};

const LEVEL_INTERPRETATION: Record<RiskLevel, string> = {
  low: "Kebiasaan yang Anda isi saat ini mendukung estimasi risiko yang lebih rendah. Pertahankan.",
  moderate: "Beberapa kebiasaan Anda masih bisa diperbaiki untuk menurunkan estimasi ini.",
  high: "Estimasi ini relatif tinggi. Pertimbangkan untuk membicarakannya dengan tenaga kesehatan.",
};

export default function RiskDetailPage() {
  const params = useParams();
  const diseaseKey = ((params?.disease as string) || "").toLowerCase();
  const { isAuthorized, redirectToLogin } = useRequireAuth();

  const [assessment, setAssessment] = useState<AssessmentSummaryResponse | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatestAssessment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.assessment.getLatest();
      setAssessment(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.kind === "unauthorized") {
          redirectToLogin();
          return;
        }
        setError(err);
      } else {
        setError(new ApiClientError(0, "Terjadi kendala saat memuat data analisis risiko."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchLatestAssessment();
  }, [isAuthorized, redirectToLogin]);

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <p className="text-sm font-medium text-brand-900/70">Memuat analisis risiko...</p>
      </div>
    );
  }

  if (error) {
    if (error.kind === "not_found") {
      return (
        <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-brand-900/10 rounded-3xl p-8 shadow-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-900/10 text-brand-900 flex items-center justify-center mx-auto text-lg font-bold">
              H
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-brand-900">
                Belum Ada Data Asesmen
              </h1>
              <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                Lengkapi profil kesehatan Anda terlebih dahulu agar model AI dapat memproyeksikan estimasi risiko untuk kondisi ini.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/onboarding/health-profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-md shadow-brand-900/15"
              >
                <span>Isi Profil Kesehatan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-brand-900/15 text-xs font-semibold text-brand-900/70 hover:text-brand-900 hover:bg-neutral-50"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-rose-500/20 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-brand-900">
              Gagal Memuat Analisis
            </h1>
            <p className="text-xs sm:text-sm text-rose-800/80 leading-relaxed">
              {error.message}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={fetchLatestAssessment}
              size="sm"
              className="px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-md shadow-brand-900/15"
            >
              Coba Lagi
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-brand-900/15 text-xs font-semibold text-brand-900/70 hover:text-brand-900"
            >
              Ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  const meta: DiseaseDetailMeta | undefined = DISEASE_METADATA[diseaseKey];
  const matchedRisk: RiskAssessmentItem | undefined = assessment.risks.find(
    (r) => r.condition.toLowerCase() === diseaseKey
  );

  if (!meta || !matchedRisk) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <h1 className="text-lg font-bold">Kondisi tidak ditemukan</h1>
          <p className="text-sm text-muted-foreground">
            Halaman ini hanya tersedia untuk diabetes, hipertensi, dan penyakit kardiovaskular.
          </p>
          <Link href="/dashboard" className="inline-block text-sm font-semibold text-brand-900 underline underline-offset-2">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Level comes from the assessment itself so this page always agrees with the dashboard card.
  const pct = Math.round(matchedRisk.probability * 100);
  const tone = getRiskTone(matchedRisk.risk_level);

  return (
    <div className="min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200">
      {/* Top Header */}
      <header className="border-b border-brand-900/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-brand-900/70 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft aria-hidden="true" className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {assessment.is_mock && <MockDataNotice />}

        <section className="space-y-2 border-b border-brand-900/10 pb-6">
          <p className="text-sm text-muted-foreground">{meta.category}</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
              {meta.title}
            </h1>
            <RiskBadge level={matchedRisk.risk_level} className="self-start sm:self-auto text-sm" />
          </div>
          <p className="text-sm text-brand-900/70 leading-relaxed max-w-2xl">
            {meta.definition}
          </p>
        </section>

        <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground">Skor Estimasi Risiko</h2>
              <p className="text-4xl font-bold tabular-nums text-brand-900 mt-1">{pct}%</p>
            </div>

            <p className="text-sm text-brand-900/70 max-w-sm sm:text-right">
              {LEVEL_INTERPRETATION[matchedRisk.risk_level]}
            </p>
          </div>

          <div className="space-y-2">
            <div
              role="img"
              aria-label={`Estimasi skor risiko ${pct} persen`}
              className="h-3 w-full bg-brand-900/10 rounded-full overflow-hidden p-0.5"
            >
              <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${tone.fillClass}`} />
            </div>
            <div aria-hidden="true" className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        {/* Contributing Factors */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
              Analisis Penentu Risiko
            </p>
            <h2 className="text-lg font-bold text-brand-900 mt-1">
              Faktor Penentu Skor Risiko Anda
            </h2>
            <p className="text-xs text-brand-900/60 mt-0.5">
              Bobot pengaruh variabel gaya hidup dan biometrik Anda terhadap kalkulasi model preventif.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {meta.factors.map((factor) => {
              const isBurden = factor.impact === "increase";

              return (
                <div
                  key={factor.name}
                  className="p-4 rounded-xl bg-white border border-brand-900/10 space-y-2.5 shadow-xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-brand-900">{factor.name}</span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isBurden ? "text-amber-700" : "text-emerald-700"
                      }`}
                    >
                      {isBurden ? `+${factor.weight}% Beban Risiko` : `-${factor.weight}% Protektif`}
                    </span>
                  </div>

                  {/* Visual Weight Bar */}
                  <div className="h-1.5 w-full bg-brand-900/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${factor.weight}%` }}
                      className={`h-full rounded-full ${
                        isBurden ? "bg-amber-600" : "bg-emerald-600"
                      }`}
                    />
                  </div>

                  <p className="text-xs text-brand-900/70 leading-relaxed">
                    {factor.note}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Targeted Action Plan */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
              Rencana Intervensi
            </p>
            <h2 className="text-lg font-bold text-brand-900 mt-1">
              Target Perubahan Gaya Hidup Paling Efektif
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {meta.actionPlan.map((action, idx) => (
              <div
                key={action.title}
                className="bg-white border border-brand-900/10 rounded-2xl p-5 flex flex-col justify-between space-y-3 shadow-xs"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-brand-900/40">
                    Langkah 0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-brand-900 leading-snug">
                    {action.title}
                  </h3>
                  <p className="text-xs text-brand-900/70 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-brand-900/5">
                  <span className="text-[11px] font-mono font-bold text-emerald-800">
                    {action.impactLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action CTAs (Simulation Integrations) */}
        <section className="p-6 rounded-2xl bg-brand-900 text-white space-y-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Simulasi Gaya Hidup</h2>
            <p className="text-xs text-brand-200/80 leading-relaxed max-w-xl">
              Simulasi sedang dibangun. Setelah tersedia, Anda bisa melihat bagaimana perubahan tidur,
              aktivitas fisik, dan berat badan memengaruhi estimasi risiko {meta.title}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button disabled className="h-10 px-5 rounded-xl border border-white/25 bg-white/10 text-white font-semibold text-xs disabled:opacity-100">
              <Sliders aria-hidden="true" className="w-3.5 h-3.5" />
              What-If Simulator
              <span className="inline-flex items-center gap-1 font-medium text-white/75">
                <Clock aria-hidden="true" className="w-3 h-3" />
                Segera hadir
              </span>
            </Button>

            <Button disabled className="h-10 px-5 rounded-xl border border-white/25 bg-white/10 text-white font-semibold text-xs disabled:opacity-100">
              <TrendingUp aria-hidden="true" className="w-3.5 h-3.5" />
              Proyeksi 180 Hari
              <span className="inline-flex items-center gap-1 font-medium text-white/75">
                <Clock aria-hidden="true" className="w-3 h-3" />
                Segera hadir
              </span>
            </Button>
          </div>
        </section>

        <section className="pt-4 border-t border-brand-900/10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-brand-900/60">
            <BookOpen aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
            <span>Dasar Referensi: {meta.guidelineSource}</span>
          </div>

          <DisclaimerBanner />
        </section>
      </main>
    </div>
  );
}
