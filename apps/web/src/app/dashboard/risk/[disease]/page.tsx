"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  AlertCircle,
  Sliders,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { RiskAssessmentItem, RiskLevel } from "@/types/api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MockDataNotice } from "@/components/mock-data-notice";
import { RiskBadge, getRiskTone } from "@/components/risk-badge";
import { LogoEmblem } from "@/components/logo";

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
    actionIndex: number;
  }[];
  actionPlan: {
    title: string;
    description: string;
    impactLabel: string;
    evidenceId: string;
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
        note: "Akumulasi jaringan adiposa memicu resistensi reseptor insulin perifer.",
        actionIndex: 2,
      },
      {
        name: "Aktivitas Fisik Rendah",
        weight: 28,
        impact: "increase",
        note: "Kurangnya kontraksi otot menurunkan translokasi transporter GLUT-4.",
        actionIndex: 0,
      },
      {
        name: "Durasi Tidur Kurang (< 6 Jam)",
        weight: 18,
        impact: "increase",
        note: "Memicu peningkatan kortisol diurnal dan resistensi metabolik nocturnal.",
        actionIndex: 1,
      },
      {
        name: "Kebiasaan Tidak Merokok",
        weight: 19,
        impact: "decrease",
        note: "Faktor protektif yang menurunkan stres oksidatif endotel vaskular.",
        actionIndex: 0,
      },
    ],
    actionPlan: [
      {
        title: "Aktivitas Aerobik 150 Menit/Minggu",
        description:
          "Bagi dalam 3–5 sesi (seperti jalan cepat atau sepeda) untuk meningkatkan ambilan glukosa tanpa insulin.",
        impactLabel: "Target: Panduan WHO 2020",
        evidenceId: "EVD-ACT-001",
      },
      {
        title: "Stabilisasi Jam Tidur (7–8 Jam)",
        description:
          "Jaga jadwal tidur konsisten guna menormalkan ritme sirkadian dan regulasi hormon metabolik.",
        impactLabel: "Target: Regulasi Sirkadian",
        evidenceId: "EVD-SLP-001",
      },
      {
        title: "Manajemen Porsi & Karbohidrat Kompleks",
        description:
          "Ganti karbohidrat sederhana dengan serat pangan tinggi (biji-bijian, sayuran) untuk menstabilkan kurva glikemik.",
        impactLabel: "Target: Konsensus PERKENI",
        evidenceId: "EVD-NUT-001",
      },
    ],
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
        note: "Hiperaktivitas sistem saraf simpatis memicu vasokonstriksi arteriol persisten.",
        actionIndex: 0,
      },
      {
        name: "Durasi & Kedalaman Istirahat",
        weight: 26,
        impact: "increase",
        note: "Gangguan istirahat menghambat nocturnal dipping alami regulasi tekanan darah.",
        actionIndex: 0,
      },
      {
        name: "Kebugaran Fisik Rutin",
        weight: 22,
        impact: "decrease",
        note: "Mendukung kelenturan endotel pembuluh darah dan pelepasan nitric oxide.",
        actionIndex: 2,
      },
      {
        name: "Riwayat Tekanan Darah Keluarga",
        weight: 20,
        impact: "increase",
        note: "Predisposisi genetik terhadap regulasi natrium ginjal dan tonus vaskular.",
        actionIndex: 1,
      },
    ],
    actionPlan: [
      {
        title: "Manajemen Stres & Protokol Relaksasi",
        description:
          "Latihan pernapasan dalam terstruktur (4-7-8) 10 menit setiap malam untuk meredam hiperaktivitas simpatis.",
        impactLabel: "Target: Relaksasi Parasimpatis",
        evidenceId: "EVD-STR-001",
      },
      {
        title: "Diet Rendah Natrium (Pola DASH)",
        description:
          "Batasi asupan natrium harian di bawah 2.000 mg dan perbanyak kalium dari buah dan sayuran segar.",
        impactLabel: "Target: Pola DASH & AHA",
        evidenceId: "EVD-NUT-002",
      },
      {
        title: "Latihan Kardiorespirasi Konsisten",
        description:
          "Jalan cepat atau renang teratur 30 menit sehari menjaga kelenturan dinding pembuluh arteri.",
        impactLabel: "Target: 150 Menit/Minggu",
        evidenceId: "EVD-ACT-002",
      },
    ],
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
        name: "Aktivitas Kardio & Perilaku Sedentari",
        weight: 34,
        impact: "increase",
        note: "Waktu duduk berkepanjangan memperlambat sirkulasi perifer dan metabolisme lipid.",
        actionIndex: 0,
      },
      {
        name: "Status Bebas Rokok",
        weight: 28,
        impact: "decrease",
        note: "Bebas dari paparan karbon monoksida dan stres endotel vaskular yang diinduksi nikotin.",
        actionIndex: 2,
      },
      {
        name: "Komposisi Massa Tubuh (BMI)",
        weight: 22,
        impact: "increase",
        note: "Meningkatkan beban kerja curah jantung basal untuk memenuhi perfusi jaringan.",
        actionIndex: 1,
      },
      {
        name: "Durasi Tidur Teratur",
        weight: 16,
        impact: "decrease",
        note: "Memberikan periode istirahat pemulihan miokardium yang memadai setiap malam.",
        actionIndex: 2,
      },
    ],
    actionPlan: [
      {
        title: "Hindari Perilaku Sedentari Panjang",
        description:
          "Berdiri dan regangkan tubuh minimal 3–5 menit setiap 60 menit duduk bekerja di meja.",
        impactLabel: "Target: Interupsi Sedentari",
        evidenceId: "EVD-ACT-003",
      },
      {
        title: "Latihan Kardiorespirasi Terukur",
        description:
          "Lakukan olahraga aerobik intensitas sedang minimal 150 menit per minggu secara rutin.",
        impactLabel: "Target: Panduan PERKI & ESC",
        evidenceId: "EVD-ACT-001",
      },
      {
        title: "Konsistensi Istirahat & Relaksasi Vaskular",
        description:
          "Pertahankan durasi tidur 7–8 jam untuk pemulihan ritme sirkadian kardiometabolik optimal.",
        impactLabel: "Target: Pemulihan Vaskular",
        evidenceId: "EVD-SLP-001",
      },
    ],
  },
};

const LEVEL_INTERPRETATION: Record<RiskLevel, string> = {
  low: "Estimasi risiko Anda berada pada kategori Lebih Rendah (Lower Risk). Terus pertahankan pola kebiasaan sehat saat ini.",
  moderate:
    "Estimasi risiko Anda berada pada kategori Moderat (Moderate Risk). Tindakan intervensi gaya hidup terencana sangat disarankan.",
  high: "Estimasi risiko Anda berada pada kategori Lebih Tinggi (Higher Risk). Prioritaskan penyesuaian gaya hidup dan konsultasikan dengan tenaga medis profesional.",
};

export default function RiskDetailPage() {
  const params = useParams();
  const diseaseKey = ((params?.disease as string) || "").toLowerCase();
  const {
    isAuthorized,
    assessment,
    isLoading,
    error,
    refetch: fetchLatestAssessment,
  } = useLatestAssessment();

  const [highlightedActionIdx, setHighlightedActionIdx] = useState<number | null>(null);
  const [activeFactorIdx, setActiveFactorIdx] = useState<number | null>(null);

  const handleFactorClick = (actionIndex: number, factorIdx: number) => {
    setActiveFactorIdx(factorIdx);
    const el = document.getElementById(`action-step-${actionIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedActionIdx(actionIndex);
      setTimeout(() => setHighlightedActionIdx(null), 2500);
    }
  };

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
            <LogoEmblem size={48} tone="soft" className="mx-auto rounded-2xl" />
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
                Kembali ke Dashboard
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

  const rawScore = matchedRisk.estimated_risk_score ?? matchedRisk.probability;
  const pct =
    rawScore !== undefined
      ? Math.round(rawScore <= 1.0 ? rawScore * 100 : rawScore)
      : 0;
  const tone = getRiskTone(matchedRisk.risk_level);

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Top Breadcrumb Header */}
      <header className="h-16 border-b border-brand-900/10 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-6 hidden lg:flex items-center">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link href="/dashboard" className="text-brand-900/50 uppercase hover:text-brand-900 transition-colors">
            Dashboard
          </Link>
          <span className="text-brand-900/30">/</span>
          <span className="text-brand-900/50 uppercase">Analisis Risiko</span>
          <span className="text-brand-900/30">/</span>
          <span className="text-brand-900 font-bold uppercase">{meta.title}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto">
        {assessment.is_mock && <MockDataNotice />}

        {/* Section 1: Disease Identity & Clinical Definition */}
        <section className="space-y-2 border-b border-brand-900/10 pb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
            {meta.category}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
              {meta.title}
            </h1>
            <RiskBadge
              level={matchedRisk.risk_level}
              labelOverride={matchedRisk.risk_label}
              className="self-start sm:self-auto text-sm"
            />
          </div>
          <p className="text-sm text-brand-900/70 leading-relaxed max-w-2xl">
            {meta.definition}
          </p>
        </section>

        {/* Section 2: Scorecard & Clinical Level Interpretation */}
        <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                Estimasi Skor Risiko
              </h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold font-mono tracking-tight text-brand-900">
                  {pct}%
                </span>
                <span className="text-xs font-mono text-brand-900/50">Estimasi Preventif</span>
              </div>
            </div>

            <p className="text-xs text-brand-900/70 max-w-sm sm:text-right leading-relaxed">
              {LEVEL_INTERPRETATION[matchedRisk.risk_level]}
            </p>
          </div>

          <div className="space-y-2">
            <div
              role="img"
              aria-label={`Estimasi skor risiko ${pct} persen`}
              className="h-2.5 w-full bg-brand-900/10 rounded-full overflow-hidden p-0.5"
            >
              <div style={{ width: `${pct}%` }} className={`h-full rounded-full ${tone.fillClass}`} />
            </div>
            <div aria-hidden="true" className="flex justify-between text-[11px] font-mono text-brand-900/50">
              <span>0% Risiko Minimal</span>
              <span>100% Beban Risiko Tinggi</span>
            </div>
          </div>
        </section>

        {/* Section 3: Disease-Specific Contributing Factors (Explainable AI / SHAP) */}
        <section className="space-y-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
              Explainable AI (XAI)
            </span>
            <h2 className="text-lg font-bold text-brand-900 mt-0.5">
              Faktor Gaya Hidup Penentu Estimasi Anda
            </h2>
            <p className="text-xs text-brand-900/60 mt-0.5">
              Analisis kontribusi faktor fisiologis terhadap estimasi risiko {meta.title}. Klik faktor untuk melihat langkah intervensi terkait.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {meta.factors.map((factor, idx) => {
              const isBurden = factor.impact === "increase";
              const isSelected = activeFactorIdx === idx;
              const weightVal = Math.round(factor.weight);

              return (
                <button
                  key={factor.name}
                  type="button"
                  onClick={() => handleFactorClick(factor.actionIndex, idx)}
                  className={`w-full text-left p-4 rounded-xl border space-y-2.5 shadow-xs transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? "bg-brand-50/90 border-brand-900/30"
                      : "bg-white border-brand-900/10 hover:border-brand-900/25 hover:bg-neutral-50/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand-900 group-hover:text-brand-900">
                      {factor.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isBurden ? "text-amber-700" : "text-emerald-700"
                      }`}
                    >
                      {isBurden ? `+${weightVal}% Beban Relatif` : `-${weightVal}% Protektif`}
                    </span>
                  </div>

                  {/* Visual Weight Bar */}
                  <div className="h-1.5 w-full bg-brand-900/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(5, weightVal))}%` }}
                      className={`h-full rounded-full ${
                        isBurden ? "bg-amber-600" : "bg-emerald-600"
                      }`}
                    />
                  </div>

                  <p className="text-xs text-brand-900/70 leading-relaxed">
                    {factor.note}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-brand-900/5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase group-hover:text-brand-900/70">
                      Rencana Aksi Terarah
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-900/60 group-hover:text-brand-900 flex items-center gap-1">
                      Lihat Langkah Tindakan ↓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 4: Disease-Specific Clinical Action Plan */}
        <section className="space-y-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
              Rencana Tindakan Klinis
            </span>
            <h2 className="text-lg font-bold text-brand-900 mt-0.5">
              Langkah Preventif Khusus {meta.title}
            </h2>
            <p className="text-xs text-brand-900/60 mt-0.5">
              Intervensi berbasis konsensus panduan medis untuk menurunkan beban risiko.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {meta.actionPlan.map((action, idx) => {
              const isTargeted = highlightedActionIdx === idx;

              return (
                <div
                  id={`action-step-${idx}`}
                  key={action.title}
                  className={`p-5 rounded-2xl border transition-all duration-300 space-y-3 ${
                    isTargeted
                      ? "bg-brand-50/90 border-brand-900/40 ring-2 ring-brand-900/20 shadow-md"
                      : "bg-white border-brand-900/10 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="size-6 rounded-lg bg-brand-900/10 text-brand-900 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-900">{action.title}</h3>
                        <span className="text-[10px] font-mono font-semibold text-emerald-800 uppercase block mt-0.5">
                          {action.impactLabel}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/evidence?ref=${action.evidenceId}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-brand-900/70 hover:text-brand-900 hover:underline shrink-0"
                    >
                      <BookOpen className="w-3 h-3 text-brand-900/50" />
                      <span>Bukti Medis →</span>
                    </Link>
                  </div>

                  <p className="text-xs text-brand-900/70 leading-relaxed pl-9">
                    {action.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Forward Navigation (What-If Simulator & Proyeksi Horison) */}
        <section className="p-6 rounded-2xl bg-brand-900 text-white space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-200/60 uppercase">
                Simulasi Eksploratif
              </span>
              <h2 className="text-lg font-bold text-white">Eksplorasi Skenario Gaya Hidup</h2>
              <p className="text-xs text-brand-200/80 leading-relaxed max-w-xl">
                Uji perubahan durasi tidur, kebugaran aerobik, dan target berat badan secara interaktif untuk memproyeksikan lintasan risiko preventif Anda.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[10px] font-mono font-bold text-brand-200/60 uppercase block">
                Simulator
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                Tersedia Sekarang
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. What-If Simulator Card (Correctly routed to /dashboard/simulation/what-if) */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sliders aria-hidden="true" className="w-4 h-4 text-brand-200" />
                  <h3 className="text-sm font-bold text-white">What-If Simulator</h3>
                </div>
                <p className="text-xs text-brand-200/75 leading-relaxed">
                  Uji skenario modifikasi parameter tidur, aktivitas, dan berat badan tanpa mengubah data profil asli Anda.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">
                  Interaktif
                </span>
                <Link
                  href="/dashboard/simulation/what-if"
                  className="text-xs font-semibold text-brand-200 hover:text-white underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Buka What-If Simulator</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. Proyeksi Horison Card (Correctly routed to /dashboard/simulation/future) */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp aria-hidden="true" className="w-4 h-4 text-brand-200" />
                  <h3 className="text-sm font-bold text-white">Proyeksi Horison 180 Hari</h3>
                </div>
                <p className="text-xs text-brand-200/75 leading-relaxed">
                  Visualisasi proyeksi lintasan risiko dan skor kesehatan preventif 30, 90, dan 180 hari ke depan.
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">
                  Multi-Horison
                </span>
                <Link
                  href="/dashboard/simulation/future"
                  className="text-xs font-semibold text-brand-200 hover:text-white underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Buka Proyeksi Horison</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Guideline Reference & Medical Disclaimer */}
        <section className="pt-4 border-t border-brand-900/10 space-y-4">
          <div className="flex items-center gap-2 text-xs text-brand-900/60 font-mono">
            <BookOpen aria-hidden="true" className="w-3.5 h-3.5 shrink-0 text-brand-900/50" />
            <span>Dasar Referensi: {meta.guidelineSource}</span>
          </div>

          <DisclaimerBanner variant="banner" />
        </section>
      </main>
    </div>
  );
}
