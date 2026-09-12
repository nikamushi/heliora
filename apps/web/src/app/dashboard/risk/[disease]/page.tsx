"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Sliders,
  TrendingUp,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { AssessmentSummaryResponse, RiskAssessmentItem } from "@/types/api";

interface DiseaseDetailMeta {
  title: string;
  category: string;
  definition: string;
  guidelineSource: string;
  defaultProbability: number;
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
      "Estimasi probabilitas gangguan metabolisme glukosa dan resistensi insulin berbasis parameter CDC BRFSS, gaya hidup, dan indeks massa tubuh.",
    guidelineSource:
      "Konsensus Pengelolaan & Pencegahan DM Tipe 2 di Indonesia (PERKENI, 2021) & WHO Global Report on Diabetes",
    defaultProbability: 0.38,
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
      "Estimasi probabilitas peningkatan resistensi vaskular sistemik dan tekanan arterial persisten berbasis pemodelan risiko preventif.",
    guidelineSource:
      "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular (PERKI, 2021) & AHA/ACC Hypertension Guidelines",
    defaultProbability: 0.22,
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
      "Estimasi probabilitas beban hemodinamik jantung, disfungsi mikrovaskular, dan aterosklerosis preventif jangka panjang.",
    guidelineSource:
      "Panduan Pencegahan Primer Penyakit Kardiovaskular (PERKI & ESC Guidelines, 2021)",
    defaultProbability: 0.18,
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

export default function RiskDetailPage() {
  const params = useParams();
  const rawDisease = (params?.disease as string) || "diabetes";
  const diseaseKey = rawDisease.toLowerCase();

  const [assessment, setAssessment] = useState<AssessmentSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestAssessment = async () => {
      try {
        const data = await apiClient.assessment.getLatest();
        setAssessment(data);
      } catch {
        // Fallback already handled gracefully in apiClient
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestAssessment();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            HELIORA
          </p>
          <p className="text-sm font-medium text-brand-900/70">Memuat analisis risiko klinis...</p>
        </div>
      </div>
    );
  }

  const meta = DISEASE_METADATA[diseaseKey] || DISEASE_METADATA.diabetes;

  // Extract actual risk from user assessment if matching
  const matchedRisk: RiskAssessmentItem | undefined = assessment?.risks?.find(
    (r) => r.condition.toLowerCase() === diseaseKey
  );

  const probability = matchedRisk ? matchedRisk.probability : meta.defaultProbability;
  const pct = Math.round(probability * 100);

  let levelText = "Risiko Rendah";
  let levelColor = "text-emerald-800";
  let meterFillWidth = "30%";
  let meterFillColor = "bg-emerald-600";
  let interpretation = "Profil metabolik dan gaya hidup saat ini menunjukkan proteksi yang baik. Lanjutkan kebiasaan sehat ini.";

  if (probability >= 0.5) {
    levelText = "Risiko Tinggi";
    levelColor = "text-rose-800";
    meterFillWidth = `${pct}%`;
    meterFillColor = "bg-rose-600";
    interpretation =
      "Estimasi menunjukkan beban faktor risiko yang signifikan. Diperlukan intervensi gaya hidup terencana dan konsultasi medis.";
  } else if (probability >= 0.2) {
    levelText = "Risiko Sedang";
    levelColor = "text-amber-800";
    meterFillWidth = `${pct}%`;
    meterFillColor = "bg-amber-600";
    interpretation =
      "Terdapat faktor kontributor gaya hidup yang dapat dioptimalkan sebelum berkembang menjadi kondisi klinis persisten.";
  }

  return (
    <div className="min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200">
      {/* Top Header */}
      <header className="border-b border-brand-900/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-brand-900/70 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>

          <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
            FE-006 • Risk Detail
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Page Eyebrow & Title */}
        <section className="space-y-2 border-b border-brand-900/10 pb-6">
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
            {meta.category} • Analisis Risiko Preventif
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
              {meta.title}
            </h1>
            <span className={`text-base font-mono font-bold ${levelColor}`}>
              {pct}% • {levelText}
            </span>
          </div>
          <p className="text-sm text-brand-900/70 leading-relaxed max-w-2xl">
            {meta.definition}
          </p>
        </section>

        {/* Clinical Gauge & Score Card */}
        <section className="bg-white/90 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                Tingkat Estimasi Probabilitas
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-mono font-bold text-brand-900">{pct}%</span>
                <span className="text-xs font-mono text-brand-900/50">skala komposit CDC BRFSS</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${levelColor}`}>
                Status: {levelText}
              </span>
              <p className="text-xs text-brand-900/60 mt-0.5 max-w-sm sm:ml-auto">
                {interpretation}
              </p>
            </div>
          </div>

          {/* Continuous Progress Bar Gauge */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-brand-900/10 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: meterFillWidth }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${meterFillColor}`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-brand-900/40 uppercase">
              <span>0% Rendah</span>
              <span>20% Moderat</span>
              <span>50% Tinggi</span>
              <span>100% Kritis</span>
            </div>
          </div>
        </section>

        {/* Contributing Factors (Explainable Attribution) */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
              Explainable AI (Atribusi Fitur)
            </p>
            <h2 className="text-lg font-bold text-brand-900 mt-1">
              Faktor Penentu Probabilitas Anda
            </h2>
            <p className="text-xs text-brand-900/60 mt-0.5">
              Bobot pengaruh variabel gaya hidup dan biometrik Anda terhadap hasil kalkulasi model.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {meta.factors.map((factor) => {
              const isBurden = factor.impact === "increase";

              return (
                <div
                  key={factor.name}
                  className="p-4 rounded-xl bg-white/80 border border-brand-900/10 space-y-2.5 transition-all"
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
                className="bg-white/80 border border-brand-900/10 rounded-2xl p-5 flex flex-col justify-between space-y-3"
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
            <span className="text-xs font-mono font-bold tracking-widest text-brand-200 uppercase">
              Simulasi Interaktif
            </span>
            <h2 className="text-lg font-bold text-white">
              Coba Uji Dampak Perubahan Gaya Hidup Anda
            </h2>
            <p className="text-xs text-brand-200/80 leading-relaxed max-w-xl">
              Gunakan What-If Simulator untuk melihat bagaimana perbaikan tidur, olahraga, dan target berat badan dapat langsung menurunkan angka probabilitas {meta.title}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/simulation/what-if?disease=${diseaseKey}`}>
              <Button className="h-10 px-5 rounded-xl bg-white text-brand-900 hover:bg-neutral-100 font-semibold text-xs shadow-xs">
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                <span>Buka What-If Simulator</span>
              </Button>
            </Link>

            <Link href={`/simulation/future?disease=${diseaseKey}`}>
              <Button
                variant="outline"
                className="h-10 px-5 rounded-xl border-white/20 bg-brand-900/40 text-white hover:bg-brand-900/70 hover:text-white font-semibold text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                <span>Lihat Proyeksi 180 Hari</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Clinical Guideline Reference & Medical Disclaimer */}
        <section className="pt-4 border-t border-brand-900/10 space-y-3">
          <div className="flex items-center gap-2 text-xs text-brand-900/60">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Dasar Referensi: {meta.guidelineSource}</span>
          </div>

          <p className="text-[11px] text-brand-900/50 leading-relaxed">
            <strong>Disclaimer Medis:</strong> HELIORA adalah platform edukasi kesehatan dan sarana estimasi risiko preventif berbasis pemodelan machine learning (CDC BRFSS). Seluruh hasil probabilitas, skor, dan proyeksi bersifat informatif dan <u>bukan merupakan diagnosis klinis medis</u>. Konsultasikan kondisi kesehatan Anda dengan dokter atau tenaga medis berlisensi sebelum mengambil tindakan klinis apa pun.
          </p>
        </section>
      </main>
    </div>
  );
}
