"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  AlertCircle,
  Info,
  ChevronRight,
  Users,
  Footprints,
  Moon,
  Calendar,
  X,
  ExternalLink,
  SlidersHorizontal,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Scale,
  Cigarette,
  CigaretteOff,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { RiskAssessmentItem, HealthProfileResponse } from "@/types/api";
import { MockDataNotice } from "@/components/mock-data-notice";

interface ContributingFactorCardData {
  id: string;
  name: string;
  isModifiable: boolean;
  modifiableTag: "Dapat Diubah" | "Faktor Tetap";
  userValue: string;
  userValueSubtext?: string;
  isSupportive: boolean;
  rawWeight: number;
  weight: number;
  relativeLabel: "Tinggi" | "Sedang" | "Rendah";
  icon: React.ComponentType<{ className?: string }>;
  directionLabel: string;
  note: string;
  actionIndex: number;
}

interface DiseaseDetailMeta {
  title: string;
  conditionName: string;
  category: string;
  definition: string;
  guidelineSource: string;
  factors: {
    name: string;
    rawWeight: number;
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
    title: "Risiko Diabetes Tipe 2",
    conditionName: "Diabetes Melitus Tipe 2",
    category: "Metabolik & Endokrin",
    definition:
      "Estimasi tingkat risiko gangguan metabolisme glukosa dan resistensi insulin berbasis indikator gaya hidup, indeks massa tubuh, dan faktor demografis.",
    guidelineSource:
      "Pedoman Pengelolaan & Pencegahan DM Tipe 2 di Indonesia (PERKENI, 2021) & WHO Guidelines",
    // 6 Faktor Teratas (Top Contributing Factors) sesuai PRD §10.3.2.
    // Stres tidak termasuk sebagai dependency model MVP diabetes.
    factors: [
      {
        name: "Komposisi Tubuh",
        rawWeight: 35,
        impact: "increase",
        note: "Indeks massa tubuh mencerminkan proporsi beban metabolik dan potensi resistensi reseptor insulin perifer.",
        actionIndex: 2,
      },
      {
        name: "Aktivitas Fisik",
        rawWeight: 28,
        impact: "increase",
        note: "Aktivitas aerobik teratur membantu penyerapan glukosa selular mandiri dan kepekaan insulin.",
        actionIndex: 0,
      },
      {
        name: "Durasi Tidur",
        rawWeight: 18,
        impact: "increase",
        note: "Keteraturan istirahat malam 7–8 jam menjaga stabilitas hormon sirkadian pengatur metabolisme.",
        actionIndex: 1,
      },
      {
        name: "Riwayat Penyakit Keluarga",
        rawWeight: 22,
        impact: "increase",
        note: "Predisposisi genetik biologis dalam keluarga lini pertama yang dapat diimbangi kebiasaan hidup sehat.",
        actionIndex: 0,
      },
      {
        name: "Riwayat Merokok",
        rawWeight: 19,
        impact: "decrease",
        note: "Status bebas dari paparan rokok aktif melindungi integritas endotel dan kestabilan metabolik.",
        actionIndex: 0,
      },
      {
        name: "Usia",
        rawWeight: 25,
        impact: "increase",
        note: "Parameter biologis alami yang memengaruhi fungsi metabolik tubuh seiring pertambahan waktu.",
        actionIndex: 0,
      },
    ],
    actionPlan: [
      {
        title: "Pertahankan Rutinitas Gaya Hidup Aktif",
        description:
          "Pertahankan kebiasaan aerobik saat ini (300 menit/minggu) untuk menjaga kepekaan insulin dan fungsi vaskular optimal.",
        impactLabel: "Target: Panduan WHO 2020",
        evidenceId: "ref-dia-02",
      },
      {
        title: "Stabilisasi Jam Istirahat (7–8 Jam)",
        description:
          "Pertahankan jadwal tidur yang konsisten untuk mendukung ritme hormon metabolisme dan kebugaran basal.",
        impactLabel: "Target: Regulasi Sirkadian",
        evidenceId: "ref-dia-03",
      },
      {
        title: "Kelola Komposisi Tubuh & Pola Porsi",
        description:
          "Pilih karbohidrat berserat tinggi dan jaga berat badan seimbang untuk meringankan beban resistensi metabolik.",
        impactLabel: "Target: Pedoman PERKENI 2021",
        evidenceId: "ref-dia-01",
      },
    ],
  },
  hypertension: {
    title: "Risiko Hipertensi",
    conditionName: "Hipertensi",
    category: "Sirkulasi & Hemodinamik",
    definition:
      "Estimasi tingkat risiko resistensi pembuluh darah perifer dan peningkatan tekanan darah persisten berbasis analisis gaya hidup preventif.",
    guidelineSource:
      "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular (PERKI, 2021) & WHO/ISH Guidelines",
    factors: [
      {
        name: "Komposisi Tubuh",
        rawWeight: 32,
        impact: "increase",
        note: "Berat badan berlebih meningkatkan beban resistensi pompa jantung dalam mengalirkan darah.",
        actionIndex: 2,
      },
      {
        name: "Durasi Tidur",
        rawWeight: 26,
        impact: "increase",
        note: "Waktu istirahat yang cukup membantu penurunan alami tekanan darah di malam hari (nocturnal dipping).",
        actionIndex: 1,
      },
      {
        name: "Aktivitas Fisik",
        rawWeight: 24,
        impact: "increase",
        note: "Olahraga rutin merangsang kelenturan dinding arteri dan sirkulasi darah sehat.",
        actionIndex: 0,
      },
      {
        name: "Riwayat Merokok",
        rawWeight: 22,
        impact: "decrease",
        note: "Bebas dari zat nikotin menjaga dinding endotel pembuluh darah tetap lentur.",
        actionIndex: 0,
      },
      {
        name: "Riwayat Penyakit Keluarga",
        rawWeight: 20,
        impact: "increase",
        note: "Predisposisi genetik dalam silsilah keluarga terkait regulasi tekanan darah basal.",
        actionIndex: 0,
      },
      {
        name: "Usia",
        rawWeight: 27,
        impact: "increase",
        note: "Kekakuan alami pembuluh darah cenderung meningkat seiring perjalanan usia.",
        actionIndex: 0,
      },
    ],
    actionPlan: [
      {
        title: "Pertahankan Olahraga Aerobik Teratur",
        description:
          "Aktivitas aerobik intensitas sedang rutin merangsang kelenturan arteri dan membantu menurunkan tekanan perifer.",
        impactLabel: "Target: Panduan PERKI 2021",
        evidenceId: "ref-hyp-01",
      },
      {
        title: "Jaga Kualitas Istirahat Malam",
        description:
          "Pertahankan waktu tidur 7–8 jam untuk mendukung penurunan alami tekanan darah di malam hari.",
        impactLabel: "Target: Pemulihan Vaskular",
        evidenceId: "ref-hyp-03",
      },
      {
        title: "Pengurangan Asupan Natrium",
        description:
          "Batasi konsumsi garam tambahan di bawah 1 sendok teh (5 gram) per hari sesuai pola diet DASH.",
        impactLabel: "Target: Pola Diet DASH",
        evidenceId: "ref-hyp-02",
      },
    ],
  },
  cardiovascular: {
    title: "Risiko Kardiovaskular",
    conditionName: "Penyakit Kardiovaskular",
    category: "Kardiometabolik & Vaskular",
    definition:
      "Estimasi tingkat risiko beban kerja sirkulasi jantung dan kesehatan pembuluh darah koroner jangka panjang.",
    guidelineSource:
      "Pedoman Pencegahan Penyakit Kardiovaskular (PERKI & ESC Guidelines) & AHA Standards",
    factors: [
      {
        name: "Riwayat Merokok",
        rawWeight: 36,
        impact: "decrease",
        note: "Bebas dari paparan rokok aktif melindungi dinding arteri dari penumpukan plak aterosklerosis.",
        actionIndex: 0,
      },
      {
        name: "Aktivitas Fisik",
        rawWeight: 30,
        impact: "increase",
        note: "Kebugaran kardiorespirasi melatih daya tahan otot jantung dan sirkulasi pembuluh darah koroner.",
        actionIndex: 1,
      },
      {
        name: "Komposisi Tubuh",
        rawWeight: 27,
        impact: "increase",
        note: "Distribusi komposisi tubuh ideal meringankan beban denyut pompa jantung basal.",
        actionIndex: 1,
      },
      {
        name: "Durasi Tidur",
        rawWeight: 20,
        impact: "increase",
        note: "Istirahat malam berkualitas memberi waktu bagi otot jantung memulihkan ritme normal.",
        actionIndex: 2,
      },
      {
        name: "Riwayat Penyakit Keluarga",
        rawWeight: 21,
        impact: "increase",
        note: "Predisposisi kesehatan sirkulasi jantung dalam silsilah keluarga lini pertama.",
        actionIndex: 0,
      },
      {
        name: "Usia",
        rawWeight: 26,
        impact: "increase",
        note: "Kelenturan arteri secara alami berkurang seiring perjalanan pertambahan usia.",
        actionIndex: 0,
      },
    ],
    actionPlan: [
      {
        title: "Pertahankan Kebugaran Kardiorespirasi",
        description:
          "Pertahankan rutinitas olahraga aerobik teratur minimal 150 menit per minggu untuk melindungi otot jantung.",
        impactLabel: "Target: Panduan PERKI & ESC",
        evidenceId: "ref-cvd-01",
      },
      {
        title: "Interupsi Perilaku Duduk Diam",
        description:
          "Berdiri dan regangkan tubuh selama 3–5 menit setiap 60 menit duduk bekerja di meja.",
        impactLabel: "Target: Interupsi Sedentari",
        evidenceId: "ref-cvd-02",
      },
      {
        title: "Konsistensi Istirahat Sirkadian",
        description:
          "Pertahankan durasi tidur 7–8 jam untuk pemulihan ritme kardiometabolik optimal.",
        impactLabel: "Target: Pemulihan Jantung",
        evidenceId: "ref-cvd-03",
      },
    ],
  },
};

interface ScientificReferenceItem {
  id: string;
  title: string;
  organization: string;
  year: number;
  documentType: "Pedoman" | "Riset" | "Laporan";
  supports: string;
  lastVerified: string;
  scope?: string;
  url: string;
}

const DISEASE_SCIENTIFIC_REFERENCES: Record<string, ScientificReferenceItem[]> = {
  diabetes: [
    {
      id: "ref-dia-01",
      title: "Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia 2021",
      organization: "PERKENI",
      year: 2021,
      documentType: "Pedoman",
      supports: "usia, riwayat keluarga, dan berat badan (IMT)",
      lastVerified: "Sep 2026",
      scope:
        "Panduan nasional resmi mengenai penanganan gaya hidup, target indeks massa tubuh, serta stratifikasi faktor risiko usia dan riwayat keluarga pada populasi dewasa Indonesia.",
      url: "/dashboard/evidence?ref=evi-02&disease=diabetes",
    },
    {
      id: "ref-dia-02",
      title: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
      organization: "WHO",
      year: 2020,
      documentType: "Pedoman",
      supports: "aktivitas fisik",
      lastVerified: "Agt 2026",
      scope:
        "Rekomendasi aktivitas fisik aerobik intensitas sedang minimal 150–300 menit per minggu bagi orang dewasa untuk menurunkan risiko penyakit kardiometabolik.",
      url: "/dashboard/evidence?ref=evi-01&disease=diabetes",
    },
    {
      id: "ref-dia-03",
      title: "Standards of Care in Diabetes—2026",
      organization: "ADA",
      year: 2026,
      documentType: "Pedoman",
      supports: "durasi tidur dan status merokok",
      lastVerified: "Jan 2026",
      scope:
        "Pedoman klinis mengenai pengelolaan faktor risiko metabolik, keteraturan durasi tidur, dan berhenti merokok.",
      url: "/dashboard/evidence?disease=diabetes",
    },
  ],
  hypertension: [
    {
      id: "ref-hyp-01",
      title: "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular",
      organization: "PERKI",
      year: 2021,
      documentType: "Pedoman",
      supports: "aktivitas fisik dan berat badan (IMT)",
      lastVerified: "Sep 2026",
      scope:
        "Standar klinis nasional mengenai penanganan modifikasi gaya hidup kardiometabolik, olahraga teratur, dan pembatasan asupan natrium harian.",
      url: "/dashboard/evidence?ref=evi-07&disease=hypertension",
    },
    {
      id: "ref-hyp-02",
      title: "Global Hypertension Practice Guidelines",
      organization: "ISH & WHO",
      year: 2020,
      documentType: "Pedoman",
      supports: "aktivitas fisik dan status merokok",
      lastVerified: "Jul 2026",
      scope:
        "Ambang batas intervensi non-farmakologis: pembatasan garam harian di bawah 5 gram dan olahraga aerobik teratur 150 menit per minggu.",
      url: "/dashboard/evidence?disease=hypertension",
    },
    {
      id: "ref-hyp-03",
      title: "Korelasi Durasi dan Kualitas Tidur terhadap Tekanan Darah",
      organization: "CDC",
      year: 2022,
      documentType: "Riset",
      supports: "durasi tidur",
      lastVerified: "Nov 2026",
      scope:
        "Bukti pentingnya waktu tidur 7–8 jam untuk pemulihan alami ritme tekanan darah malam hari (nocturnal dipping) dan elastisitas vaskular.",
      url: "/dashboard/evidence?ref=evi-03&disease=hypertension",
    },
  ],
  cardiovascular: [
    {
      id: "ref-cvd-01",
      title: "ESC Guidelines on Cardiovascular Disease Prevention in Clinical Practice",
      organization: "ESC & PERKI",
      year: 2021,
      documentType: "Pedoman",
      supports: "aktivitas fisik dan status merokok",
      lastVerified: "Okt 2026",
      scope:
        "Rujukan klinis pencegahan primer penyakit jantung koroner melalui aktivitas fisik aerobik teratur dan eliminasi paparan asap rokok.",
      url: "/dashboard/evidence?ref=evi-04&disease=cardiovascular",
    },
    {
      id: "ref-cvd-02",
      title: "Guideline on the Primary Prevention of Cardiovascular Disease",
      organization: "ACC & AHA",
      year: 2019,
      documentType: "Pedoman",
      supports: "berat badan (IMT) dan aktivitas fisik",
      lastVerified: "Jun 2026",
      scope:
        "Protokol kebugaran kardiorespirasi, pembatasan waktu duduk diam berkelanjutan, dan pemantauan proporsi berat badan sehat.",
      url: "/dashboard/evidence?ref=evi-06&disease=cardiovascular",
    },
    {
      id: "ref-cvd-03",
      title: "Psychological Well-Being and Cardiovascular Health",
      organization: "AHA",
      year: 2021,
      documentType: "Riset",
      supports: "durasi tidur",
      lastVerified: "Mei 2026",
      scope:
        "Kajian klinis tentang keteraturan istirahat malam dan dampaknya terhadap stabilitas denyut pompa otot jantung basal.",
      url: "/dashboard/evidence?disease=cardiovascular",
    },
  ],
};

interface FactorModalDetails {
  whyItMatters: string;
  personalMeaning: string;
  clinicalNote?: string;
  evidenceRefId: string;
}

function getFactorModalDetails(
  factorName: string,
  isSupportive: boolean,
  diseaseKey: string,
  userVal: string
): FactorModalDetails {
  const nameLower = factorName.toLowerCase();
  const conditionLabel =
    diseaseKey === "diabetes"
      ? "Diabetes Melitus Tipe 2"
      : diseaseKey === "hypertension"
      ? "Hipertensi"
      : "Penyakit Kardiovaskular";

  if (nameLower.includes("aktivitas") || nameLower.includes("kardio") || nameLower.includes("kebugaran")) {
    return {
      whyItMatters:
        "Aktivitas fisik teratur membantu otot menggunakan glukosa darah secara mandiri serta meningkatkan sensitivitas reseptor insulin tanpa membebani sekresi pankreas (Pedoman WHO 2020).",
      personalMeaning: isSupportive
        ? `Tingkat aktivitas fisik Anda (${userVal}) telah melampaui target preventif 150 menit/minggu, berperan menurunkan skor estimasi risiko ${conditionLabel}.`
        : `Aktivitas fisik Anda saat ini berada di bawah target 150 menit/minggu, sehingga menjadi area fokus yang dapat ditingkatkan untuk menurunkan estimasi risiko ${conditionLabel}.`,
      evidenceRefId: "ref-dia-02",
    };
  }

  if (nameLower.includes("komposisi tubuh") || nameLower.includes("bmi") || nameLower.includes("massa tubuh")) {
    const isUnderweight = userVal.includes("18,") || userVal.includes("17,");
    return {
      whyItMatters:
        "Indeks Massa Tubuh (IMT) mencerminkan proporsi beban metabolik tubuh. Menjaga berat badan dalam rentang seimbang mencegah timbulnya resistensi insulin perifer (Pedoman PERKENI 2021).",
      personalMeaning: isSupportive
        ? `Nilai ${userVal} berada di bawah batas berat berlebih (23 kg/m²), sehingga dalam formulasi model ini memberikan pengaruh yang menurunkan skor estimasi risiko ${conditionLabel}.`
        : `Nilai ${userVal} berada di atas batas berat ideal, berkontribusi menaikkan skor estimasi risiko ${conditionLabel} pada model.`,
      clinicalNote: isUnderweight
        ? "Catatan klinis: Nilai IMT di bawah 18,5 kg/m² menurunkan skor estimasi diabetes pada model, namun mempertahankan berat badan dalam rentang ideal (18,5–22,9 kg/m²) tetap dianjurkan untuk status kesehatan umum."
        : undefined,
      evidenceRefId: "ref-dia-01",
    };
  }

  if (nameLower.includes("tidur") || nameLower.includes("istirahat")) {
    return {
      whyItMatters:
        "Waktu tidur yang konsisten 7–8 jam per hari mendukung kestabilan pelepasan hormon kortisol dan regulasi ritme metabolisme glukosa darah sirkadian (Standar ADA 2026).",
      personalMeaning: isSupportive
        ? `Durasi istirahat Anda (${userVal}) berada pada rentang yang direkomendasikan, memberikan kontribusi positif yang menstabilkan skor estimasi risiko ${conditionLabel}.`
        : `Durasi istirahat yang belum optimal menjadi salah satu faktor yang meningkatkan skor estimasi risiko ${conditionLabel} pada model.`,
      evidenceRefId: "ref-dia-03",
    };
  }

  if (nameLower.includes("merokok") || nameLower.includes("rokok")) {
    const isFormer = userVal.toLowerCase().includes("mantan");
    return {
      whyItMatters:
        "Paparan asap rokok memicu stres oksidatif dan peradangan vaskular yang dapat mengganggu respons sel endotel terhadap hormon insulin (Standar ADA 2026).",
      personalMeaning: isSupportive
        ? `Status bebas dari paparan rokok aktif saat ini memberikan perlindungan metabolik dan meringankan skor estimasi risiko ${conditionLabel}.`
        : `Paparan zat rokok berkontribusi meningkatkan beban estimasi risiko ${conditionLabel} pada model.`,
      clinicalNote: isFormer
        ? "Catatan epidemiologis dan model SHAP: Terhadap baseline populasi yang mencakup perokok aktif, keberhasilan berhenti merokok menghentikan proses inflamasi vaskular aktif sehingga model memberikan kontribusi protektif (menurunkan skor estimasi). Riwayat paparan masa lalu tetap dikelompokkan sebagai Faktor Tetap karena tidak dapat diubah lagi melalui intervensi gaya hidup saat ini."
        : undefined,
      evidenceRefId: "ref-dia-03",
    };
  }

  if (nameLower.includes("keluarga") || nameLower.includes("genetik")) {
    return {
      whyItMatters:
        "Riwayat penyakit pada keluarga lini pertama mencerminkan kecenderungan biologis awal yang bersifat bawaan (Pedoman PERKENI 2021).",
      personalMeaning: isSupportive
        ? `Tidak adanya riwayat keluarga dekat memberikan profil dasar yang lebih ringan pada model estimasi risiko ${conditionLabel}.`
        : `Adanya riwayat keluarga merupakan faktor tetap yang tidak dapat diubah, namun pengaruhnya dapat diimbangi secara efektif melalui konsistensi aktivitas fisik dan gaya hidup aktif.`,
      evidenceRefId: "ref-dia-01",
    };
  }

  if (nameLower.includes("usia") || nameLower.includes("umur") || nameLower.includes("age")) {
    return {
      whyItMatters:
        "Pertambahan usia merupakan parameter biologis alami yang memengaruhi kecepatan metabolisme tubuh dan sensitivitas insulin seiring waktu (Standar ADA 2026).",
      personalMeaning: isSupportive
        ? `Rentang usia Anda saat ini (${userVal}) memberikan profil awal yang lebih ringan pada model estimasi risiko ${conditionLabel}.`
        : `Faktor usia merupakan kondisi alami yang tidak dapat diubah; menjaga kebiasaan aktif dan nutrisi seimbang menjadi kunci penyeimbang utamanya.`,
      evidenceRefId: "ref-dia-03",
    };
  }

  return {
    whyItMatters: `${factorName} merupakan salah satu indikator penting yang diperhitungkan dalam formulasi estimasi risiko ini.`,
    personalMeaning: isSupportive
      ? `Faktor ini berperan dalam menjaga profil skor estimasi risiko ${conditionLabel} Anda tetap optimal.`
      : `Faktor ini berkontribusi terhadap kenaikan skor estimasi risiko ${conditionLabel} Anda.`,
    evidenceRefId: "ref-dia-01",
  };
}

function formatAssessmentDate(dateStr?: string): string {
  if (!dateStr) return "Hari ini";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Hari ini";

    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isToday) return "Hari ini";

    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    if (isYesterday) return "Kemarin";

    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return "Hari ini";
  }
}

function RiskPageSkeleton() {
  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-8 w-full select-text animate-pulse" aria-busy="true" aria-label="Memuat analisis risiko kesehatan">
      {/* Header Skeleton */}
      <section className="border-b border-neutral-200/80 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="space-y-2">
            <div className="h-10 sm:h-12 w-64 sm:w-80 bg-neutral-200/70 rounded-2xl" />
            <div className="h-4 w-72 sm:w-96 bg-neutral-100 rounded-lg" />
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto shrink-0">
            <div className="h-8 w-36 bg-neutral-100 rounded-lg" />
            <div className="h-3 w-28 bg-neutral-100 rounded" />
          </div>
        </div>
      </section>

      {/* Top 2 Cards: Estimasi & Prioritas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Estimasi Skeleton */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[280px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-neutral-200/70 rounded-md" />
              <div className="h-3 w-24 bg-neutral-100 rounded-md" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-1">
              <div className="space-y-2">
                <div className="h-16 w-36 bg-neutral-200/70 rounded-2xl" />
                <div className="h-5 w-44 bg-neutral-100 rounded-full" />
              </div>
              <div className="w-full sm:w-64 space-y-2">
                <div className="h-2 w-full bg-neutral-100 rounded-full" />
                <div className="h-3 w-full bg-neutral-100/60 rounded-md" />
              </div>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
            <div className="h-3 w-56 bg-neutral-100 rounded-md" />
          </div>
        </div>

        {/* Prioritas Skeleton */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[280px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-neutral-200/70 rounded-md" />
              <div className="h-5 w-32 bg-neutral-100 rounded-full" />
            </div>
            <div className="space-y-2.5 pt-1">
              <div className="h-6 w-3/4 bg-neutral-200/70 rounded-lg" />
              <div className="h-4 w-full bg-neutral-100 rounded-md" />
              <div className="h-4 w-5/6 bg-neutral-100 rounded-md" />
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-end">
            <div className="h-8 w-36 bg-neutral-100 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Factors Grid Skeleton */}
      <section className="space-y-5 pt-6">
        <div className="space-y-2">
          <div className="h-6 w-56 bg-neutral-200/70 rounded-lg" />
          <div className="h-4 w-80 bg-neutral-100 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200/80 bg-white p-5 flex flex-col justify-between min-h-[170px] space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-neutral-100 rounded-full" />
                  <div className="size-4 bg-neutral-100 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-neutral-200/60 rounded-md" />
                  <div className="h-6 w-32 bg-neutral-200/80 rounded-lg" />
                  <div className="h-3 w-20 bg-neutral-100 rounded-md" />
                </div>
              </div>
              <div className="mt-auto pt-4 space-y-2">
                <div className="h-3 w-full bg-neutral-100 rounded-md" />
                <div className="h-1.5 w-full bg-neutral-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function RiskDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const diseaseParam = params?.disease as string | undefined;
  const diseaseKey = diseaseParam?.toLowerCase() || "diabetes";

  // Demo toggle support: Allows judges / presenters to demo various PRD states
  const demoParam = searchParams.get("demo");
  const isDemoHigh = demoParam === "high";
  const isDemoModerate = demoParam === "moderate";
  const isDemoEmpty = demoParam === "empty";
  const isDemoLoading = demoParam === "loading";
  const isDemoError = demoParam === "error";
  const isDemoFallbackRag = demoParam === "fallback_rag";

  const { assessment, isLoading, error, refetch } = useLatestAssessment();
  const [healthProfile, setHealthProfile] = useState<HealthProfileResponse | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHeroFocusDisclosure, setShowHeroFocusDisclosure] = useState(false);
  const [factorTab, setFactorTab] = useState<"all" | "modifiable" | "non_modifiable">("all");
  const [selectedModalFactor, setSelectedModalFactor] = useState<ContributingFactorCardData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHealthProfile() {
      try {
        const hp = await apiClient.healthProfile.get();
        if (isMounted) setHealthProfile(hp);
      } catch {
        // Fallback or ignore if profile already loaded
      }
    }
    loadHealthProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard accessibility: Close factor modal on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedModalFactor) {
        setSelectedModalFactor(null);
      }
    },
    [selectedModalFactor]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // State 4: Loading Skeleton (NFR §13.2)
  if (isLoading || isDemoLoading) {
    return <RiskPageSkeleton />;
  }

  // ── Empty State: Persetujuan Ditarik (BR-CONSENT-003) ──
  if (
    error?.status === 403 ||
    error?.message?.toLowerCase().includes("active consent")
  ) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white border border-neutral-200/80 rounded-3xl p-8 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-amber-800" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Analisis Risiko Dinonaktifkan
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Persetujuan pengolahan data kardiometabolik Anda saat ini ditarik. Berikan persetujuan kembali untuk melihat kalkulasi risiko kardiometabolik dan rincian faktor pemicu.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/onboarding/consent"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Berikan Persetujuan
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
            >
              Pengaturan Akun
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 5: AI Service Failure Handling (FR-042)
  if (isDemoError || (error && error.status !== 404)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white border border-rose-200/80 rounded-3xl p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Kalkulasi Estimasi Sedang Mengalami Kendala
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Sistem kecerdasan buatan belum dapat menyelesaikan kalkulasi asesmen risiko saat ini. Untuk menjaga keamanan informasi medis, sistem tidak menampilkan skor estimasi yang tidak valid. Seluruh data profil kesehatan Anda tersimpan dengan aman.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => refetch()}
              size="sm"
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
            >
              Coba Lagi
            </Button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Profil Belum Lengkap / Belum Assessment (FR-004, FR-006)
  if (isDemoEmpty || !assessment || error?.status === 404) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white border border-neutral-200/80 rounded-3xl p-8 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6 text-neutral-700" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Lengkapi Profil untuk Menghitung Estimasi Risiko
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Estimasi risiko kardiometabolik dan atribusi Explainable AI (SHAP) membutuhkan data gaya hidup dasar seperti durasi tidur, kebiasaan olahraga, dan komposisi tubuh Anda.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/onboarding/health-profile"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
            >
              <span>Lengkapi Profil Kesehatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Kembali ke Ringkasan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const meta: DiseaseDetailMeta | undefined = DISEASE_METADATA[diseaseKey];
  const matchedRisk: RiskAssessmentItem | undefined = assessment.risks.find(
    (r) => r.condition.toLowerCase() === diseaseKey
  );

  if (!meta || !matchedRisk) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-3">
          <h1 className="text-lg font-bold text-neutral-900">Kondisi tidak ditemukan</h1>
          <p className="text-sm text-neutral-600">
            Halaman ini tersedia untuk diabetes, hipertensi, dan penyakit kardiovaskular.
          </p>
          <Link
            href="/dashboard/risk/diabetes"
            className="inline-block text-sm font-semibold text-neutral-900 underline underline-offset-2"
          >
            Buka Halaman Diabetes
          </Link>
        </div>
      </div>
    );
  }

  // PRD §10.4.1 & BR-RISK-004:
  // Format as Score (0–100) and standardized Indonesian category labels:
  // 0–29: Lebih rendah | 30–59: Sedang | 60–100: Lebih tinggi
  // Support Demo Modes for presentation (FR-037/038 & BR-RISK-004)
  const baseScore = matchedRisk.estimated_risk_score ?? ((matchedRisk.probability ?? 0) * 100);
  const scoreInt = isDemoHigh ? 68 : isDemoModerate ? 44 : Math.max(0, Math.min(100, Math.round(Number(baseScore))));

  const riskTier: "low" | "moderate" | "high" =
    scoreInt < 30 ? "low" : scoreInt < 60 ? "moderate" : "high";

  // ── Modifiable parameters extraction from profile ──
  const activityMin = isDemoHigh ? 45 : isDemoModerate ? 90 : (healthProfile?.physical_activity_min_per_week ?? 300);
  const sleepHours = isDemoHigh ? 5.0 : isDemoModerate ? 6.5 : (healthProfile?.sleep_duration_hours ?? 7.5);
  const smokingStatus = isDemoHigh ? "current" : isDemoModerate ? "former" : (healthProfile?.smoking_status ?? "former");
  const bmiVal = isDemoHigh ? 31.2 : isDemoModerate ? 24.2 : (healthProfile?.bmi ?? 18.4);
  const userAge = isDemoHigh ? 52 : isDemoModerate ? 38 : (healthProfile?.age ?? 28);
  const hasFamilyHistory = isDemoHigh ? true : isDemoModerate ? false : (healthProfile?.family_history ?? false);

  // ── Construct Ranked Contributing Factors with User Values & Normalized Weights (Sum = 100%) ──
  const rawFactorsList = meta.factors.map((metaFactor) => {
    const nameLower = metaFactor.name.toLowerCase();

    // Match top factor from backend SHAP output if available
    const matchedTopFactor = assessment.top_factors?.find((tf) => {
      const ml = metaFactor.name.toLowerCase();
      const tl = tf.label.toLowerCase();
      const tfFeat = tf.feature.toLowerCase();
      return (
        ml.includes(tl) ||
        tl.includes(ml) ||
        (tfFeat === "bmi" && ml.includes("komposisi")) ||
        (tfFeat === "physical_activity" && ml.includes("aktivitas")) ||
        (tfFeat === "smoking_status" && ml.includes("rokok")) ||
        (tfFeat === "sleep_duration" && ml.includes("tidur")) ||
        (tfFeat === "family_history" && ml.includes("keluarga"))
      );
    });

    let isModifiable = true;
    let modifiableTag: "Dapat Diubah" | "Faktor Tetap" = "Dapat Diubah";
    let userVal = "-";
    let userValSubtext: string | undefined = undefined;
    let isSupportive = false;
    let factorIcon = Footprints;

    if (nameLower.includes("komposisi tubuh") || nameLower.includes("bmi")) {
      factorIcon = Scale;
      isModifiable = true;
      modifiableTag = "Dapat Diubah";
      userVal = `IMT ${Number(bmiVal).toFixed(1).replace(".", ",")} kg/m²`;
      if (isDemoHigh) {
        userVal = "IMT 31,2 kg/m²";
        userValSubtext = "Kategori Obesitas I";
        isSupportive = false;
      } else if (isDemoModerate) {
        userVal = "IMT 24,2 kg/m²";
        userValSubtext = undefined;
        isSupportive = false;
      } else {
        isSupportive = bmiVal < 23.0;
      }
    } else if (nameLower.includes("aktivitas fisik") || nameLower.includes("kebugaran")) {
      factorIcon = Footprints;
      isModifiable = true;
      modifiableTag = "Dapat Diubah";
      if (isDemoHigh) {
        userVal = "45 menit/minggu";
        isSupportive = false;
      } else if (isDemoModerate) {
        userVal = "90 menit/minggu";
        isSupportive = false;
      } else {
        userVal = `${activityMin} menit/minggu`;
        isSupportive = activityMin >= 150;
      }
    } else if (nameLower.includes("tidur")) {
      factorIcon = Moon;
      isModifiable = true;
      modifiableTag = "Dapat Diubah";
      if (isDemoHigh) {
        userVal = "5,0 jam/hari";
        isSupportive = false;
      } else if (isDemoModerate) {
        userVal = "6,5 jam/hari";
        isSupportive = false;
      } else {
        userVal = `${Number(sleepHours).toFixed(1).replace(".", ",")} jam/hari`;
        isSupportive = sleepHours >= 7 && sleepHours <= 9;
      }
    } else if (nameLower.includes("merokok")) {
      if (isDemoHigh) {
        factorIcon = Cigarette;
        userVal = "Perokok aktif";
        isModifiable = true;
        modifiableTag = "Dapat Diubah";
        isSupportive = false;
      } else if (isDemoModerate) {
        factorIcon = CigaretteOff;
        userVal = "Mantan perokok";
        isModifiable = false;
        modifiableTag = "Faktor Tetap";
        isSupportive = true;
      } else {
        if (smokingStatus === "never") {
          factorIcon = CigaretteOff;
          userVal = "Tidak pernah";
          isModifiable = false;
          modifiableTag = "Faktor Tetap";
          isSupportive = true;
        } else if (smokingStatus === "former") {
          factorIcon = CigaretteOff;
          userVal = "Mantan perokok";
          // Former smoker cannot be undone via simulation: classified as fixed past history
          isModifiable = false;
          modifiableTag = "Faktor Tetap";
          isSupportive = true;
        } else {
          factorIcon = Cigarette;
          userVal = "Perokok aktif";
          isModifiable = true;
          modifiableTag = "Dapat Diubah";
          isSupportive = false;
        }
      }
    } else if (nameLower.includes("keluarga")) {
      factorIcon = Users;
      isModifiable = false;
      modifiableTag = "Faktor Tetap";
      if (isDemoHigh) {
        userVal = "Ada riwayat";
        isSupportive = false;
      } else {
        userVal = hasFamilyHistory ? "Ada riwayat" : "Tidak ada";
        isSupportive = !hasFamilyHistory;
      }
    } else if (nameLower.includes("usia")) {
      factorIcon = Calendar;
      isModifiable = false;
      modifiableTag = "Faktor Tetap";
      userVal = `${userAge} tahun`;
      isSupportive = userAge < 45;
    }

    if (matchedTopFactor && !isDemoHigh && !isDemoModerate) {
      isSupportive = matchedTopFactor.impact === "decrease" || matchedTopFactor.weight_percentage < 0;
    }

    const calculatedRawWeight = (isDemoHigh || isDemoModerate)
      ? metaFactor.rawWeight * (isSupportive ? 0.7 : 1.3)
      : matchedTopFactor
      ? Math.abs(matchedTopFactor.weight_percentage)
      : metaFactor.rawWeight;

    return {
      id: metaFactor.name,
      name: metaFactor.name,
      isModifiable,
      modifiableTag,
      userValue: userVal,
      userValueSubtext: userValSubtext,
      isSupportive,
      rawWeight: calculatedRawWeight,
      icon: factorIcon,
      directionLabel: isSupportive ? "Menurunkan estimasi" : "Menaikkan estimasi",
      note: metaFactor.note,
      actionIndex: metaFactor.actionIndex,
    };
  });

  // Normalisasi bobot sehingga TOTAL pengaruh tepat 100% (PRD & UX mathematical consistency)
  const totalRawWeight = rawFactorsList.reduce((acc, f) => acc + f.rawWeight, 0);
  const initialPercentages = rawFactorsList.map((f) =>
    Math.max(5, Math.round((f.rawWeight / totalRawWeight) * 100))
  );
  const sumInitial = initialPercentages.reduce((a, b) => a + b, 0);
  const roundingDiscrepancy = 100 - sumInitial;

  const allContributingFactors: ContributingFactorCardData[] = rawFactorsList
    .map((f, idx) => {
      const pct = initialPercentages[idx] + (idx === 0 ? roundingDiscrepancy : 0);
      const relativeLabel: "Tinggi" | "Sedang" | "Rendah" =
        pct >= 24 ? "Tinggi" : pct >= 14 ? "Sedang" : "Rendah";

      return {
        ...f,
        weight: pct,
        relativeLabel,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  const displayedFactors = allContributingFactors.filter((f) => {
    if (factorTab === "modifiable") return f.isModifiable;
    if (factorTab === "non_modifiable") return !f.isModifiable;
    return true;
  });

  // ── Construct Prioritas (Focus Card) adhering to Rule Engine & Non-Alarming principle ──
  const priorityFocus = (() => {
    // 1. Defisit: Aktivitas fisik < 150 menit/minggu (BR-REC-003)
    if (activityMin < 150) {
      return {
        title: "Tingkatkan aktivitas fisik",
        actionText:
          "Peningkatan aktivitas aerobik teratur secara bertahap berkontribusi menurunkan estimasi risiko.",
        badgeLabel: riskTier === "high" ? "Area Fokus Utama" : "Area Fokus",
        badgeVariant: "focus" as const,
        isWarning: false,
        factorName: "Aktivitas Fisik",
        whyReason: `Aktivitas fisik Anda saat ini tercatat ${activityMin} menit/minggu, di bawah rekomendasi WHO 2020 dan PERKENI 2021 (minimal 150 menit aerobik intensitas sedang per minggu).`,
        evidenceId: "ref-dia-02",
      };
    }

    // 2. Defisit: Merokok aktif (BR-REC-004)
    if (smokingStatus === "current") {
      return {
        title: "Hentikan kebiasaan merokok",
        actionText:
          "Penghentian paparan asap rokok berkontribusi signifikan menurunkan estimasi risiko.",
        badgeLabel: riskTier === "high" ? "Area Fokus Utama" : "Area Fokus",
        badgeVariant: "focus" as const,
        isWarning: false,
        factorName: "Riwayat Merokok",
        whyReason:
          "Status Anda teridentifikasi sebagai perokok aktif. Pedoman PERKENI dan WHO merekomendasikan penghentian total paparan asap rokok untuk pemulihan fungsi metabolik dan vaskular.",
        evidenceId: "ref-dia-03",
      };
    }

    // 3. Defisit: Durasi tidur kurang dari 7 jam (BR-REC-005)
    if (sleepHours < 7.0) {
      return {
        title: "Optimalkan durasi tidur",
        actionText:
          "Kecukupan dan keteraturan waktu istirahat malam berkontribusi pada kestabilan profil risiko.",
        badgeLabel: riskTier === "high" ? "Area Fokus Utama" : "Area Fokus",
        badgeVariant: "focus" as const,
        isWarning: false,
        factorName: "Durasi Tidur",
        whyReason: `Durasi tidur Anda saat ini ${Number(sleepHours).toFixed(1).replace(".", ",")} jam/hari, di bawah target konsensus AASM dan CDC (7–9 jam per malam untuk menjaga ritme metabolik optimal).`,
        evidenceId: "ref-dia-03",
      };
    }

    // 4. Defisit: IMT berlebih (>= 25) (BR-REC-006)
    if (bmiVal >= 25.0) {
      return {
        title: "Kelola komposisi tubuh",
        actionText:
          "Pengelolaan berat badan dan pola makan bergizi seimbang berkontribusi meringankan beban metabolik.",
        badgeLabel: riskTier === "high" ? "Area Fokus Utama" : "Area Fokus",
        badgeVariant: "focus" as const,
        isWarning: false,
        factorName: "Komposisi Tubuh",
        whyReason: `IMT Anda saat ini ${Number(bmiVal).toFixed(1).replace(".", ",")} kg/m², di atas batas sehat rekomendasi PERKENI 2021 (18,5–22,9 kg/m² untuk populasi dewasa).`,
        evidenceId: "ref-dia-01",
      };
    }

    // 5. Seluruh parameter gaya hidup optimal namun skor risiko tinggi karena faktor usia/keluarga (FR-037/038)
    if (riskTier === "high") {
      return {
        title: "Konsultasi evaluasi berkala",
        actionText:
          "Parameter gaya hidup Anda sudah baik. Diskusikan hasil estimasi ini dengan dokter untuk pemeriksaan rutin.",
        badgeLabel: "Evaluasi Terarah",
        badgeVariant: "clinical" as const,
        isWarning: false,
        factorName: "Kategori Lebih Tinggi",
        whyReason:
          "Gaya hidup Anda telah memenuhi target preventif, namun estimasi skor model dipengaruhi oleh parameter biologis atau riwayat keluarga yang memerlukan pemeriksaan klinis objektif berkala.",
        evidenceId: "ref-dia-01",
      };
    }

    // 6. Mode "Pertahankan" (Seluruh parameter tercapai & skor optimal - BR-REC-008):
    const formattedSleepProse =
      Number(sleepHours) % 1 === 0
        ? String(Math.round(Number(sleepHours)))
        : Number(sleepHours).toFixed(1).replace(".", ",");
    return {
      title: "Aktivitas dan tidur sudah sesuai target",
      actionText:
        "Kebiasaan aktivitas fisik dan pola istirahat Anda saat ini berkontribusi pada estimasi risiko yang lebih rendah.",
      badgeLabel: undefined as string | undefined,
      badgeVariant: "protective" as const,
      isWarning: false,
      factorName: "Aktivitas Fisik",
      whyReason: `Aktivitas fisik Anda (${activityMin} menit/minggu) telah memenuhi target WHO (≥150 menit/minggu), dan durasi tidur (${formattedSleepProse} jam/hari) berada dalam rentang target konsensus AASM & CDC (7–9 jam/hari).`,
      evidenceId: "ref-dia-02",
    };
  })();

  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-8 w-full select-text">
      {assessment.is_mock && <MockDataNotice />}

      {/* ── Section 1: Judul Halaman & Konteks Waktu ── */}
      <section className="border-b border-neutral-200/80 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1E38]">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Skor estimasi berdasarkan profil gaya hidup Anda
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 self-start sm:self-auto shrink-0">
            <Link
              href="/onboarding/health-profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Perbarui Data Kesehatan</span>
            </Link>
            <span className="text-[11px] text-neutral-500 font-normal">
              Terakhir asesmen: {formatAssessmentDate(assessment.assessed_at)}
            </span>
          </div>
        </div>
      </section>

      {/* Fallback RAG Notice Banner (PRD FR-043) */}
      {isDemoFallbackRag && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-950">Mode Penjelasan Terstandarisasi (FR-043)</p>
            <p className="leading-relaxed text-amber-800">
              Layanan narasi generatif AI sedang dalam pemeliharaan. Seluruh estimasi kuantitatif model machine learning, bobot faktor kontributor (SHAP), dan rekomendasi aturan preventif tetap berfungsi penuh berbasis rujukan pedoman klinis resmi.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 2 & 3: Estimasi Risiko (Kiri) & Prioritas Anda (Kanan) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Sisi Kiri: Kartu Estimasi Risiko (PRD §10.4.1 & BR-RISK-004) */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 relative flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
                Estimasi Risiko
              </h2>
              <button
                type="button"
                onClick={() => setShowExplanation((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 font-medium transition-colors cursor-pointer select-none"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Tentang estimasi</span>
              </button>
            </div>

            {/* Score Hero & Calibrated Horizontal Gauge Track */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-1">
              {/* Primary Score Hero: "{scoreInt} / 100" and single status label */}
              <div className="space-y-1">
                <div className="flex items-baseline font-bold leading-none tracking-tight text-[#0B1E38]">
                  <span className="text-6xl sm:text-7xl lg:text-[84px] font-bold">
                    {scoreInt}
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold ml-1.5 text-neutral-600">
                    / 100
                  </span>
                </div>
              </div>

              {/* 3-Band Horizontal Gauge Track (0-29, 30-59, 60-100) */}
              <div className="w-full sm:w-64 md:w-72 space-y-2 pb-1">
                <div className="relative py-2 flex items-center">
                  <div className="h-2 w-full rounded-full flex overflow-hidden bg-neutral-100">
                    <div className="w-[30%] bg-emerald-100 border-r border-white/70" />
                    <div className="w-[30%] bg-amber-100 border-r border-white/70" />
                    <div className="w-[40%] bg-rose-100" />
                  </div>

                  <div
                    style={{
                      left: `${Math.min(96, Math.max(4, scoreInt))}%`,
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300"
                  >
                    <div
                      className={`size-4 rounded-full border-2 border-white shadow-xs ring-2 ${
                        riskTier === "low"
                          ? "bg-emerald-600 ring-emerald-500/25"
                          : riskTier === "moderate"
                          ? "bg-amber-500 ring-amber-500/25"
                          : "bg-rose-600 ring-rose-500/25"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-10 text-[10px] select-none">
                  <span
                    className={`col-span-3 text-center transition-colors ${
                      riskTier === "low"
                        ? "font-bold text-neutral-900"
                        : "font-medium text-neutral-600"
                    }`}
                  >
                    Lebih rendah
                  </span>
                  <span
                    className={`col-span-3 text-center transition-colors ${
                      riskTier === "moderate"
                        ? "font-bold text-neutral-900"
                        : "font-medium text-neutral-600"
                    }`}
                  >
                    Sedang
                  </span>
                  <span
                    className={`col-span-4 text-center transition-colors ${
                      riskTier === "high"
                        ? "font-bold text-neutral-900"
                        : "font-medium text-neutral-600"
                    }`}
                  >
                    Lebih tinggi
                  </span>
                </div>
              </div>
            </div>

            {/* High Risk Safety Warning Guardrail (PRD FR-037/038 & BR-RISK-005) */}
            {riskTier === "high" && (
              <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs space-y-1.5 mt-3">
                <div className="flex items-center gap-2 font-bold text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Perhatian Evaluasi Klinis</span>
                </div>
                <p className="leading-relaxed text-rose-700">
                  Estimasi skor berada pada kategori lebih tinggi ({scoreInt}/100) berdasarkan parameter gaya hidup Anda. Ini bukan diagnosis penyakit, melainkan anjuran untuk berkonsultasi langsung dengan dokter guna pemeriksaan berkala objektif.
                </p>
              </div>
            )}

            {/* Model Transparency Disclosure Accordion */}
            <AnimatePresence initial={false}>
              {showExplanation && (
                <motion.div
                  key="model-explanation-disclosure"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    transition: {
                      height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.16, ease: "linear" },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      height: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.12, ease: "linear" },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="bg-neutral-50 p-4 rounded-xl text-xs space-y-2 text-neutral-600 leading-relaxed">
                    <div className="font-semibold text-neutral-900">
                      Transparansi Model Estimasi Risiko (XGBoost v1.1)
                    </div>
                    <p>
                      Skor dihitung dari analisis multivariat faktor gaya hidup (durasi tidur, aktivitas fisik, IMT, status merokok) dan data demografis yang diselaraskan dengan pedoman PERKENI 2021 dan dataset survei CDC BRFSS.
                    </p>
                    <div className="pt-2.5 border-t border-neutral-200/60 space-y-1.5">
                      <span className="text-[11px] font-semibold text-neutral-800 block">
                        Ambang kategori skor
                      </span>
                      <ul className="space-y-1 text-[11px] text-neutral-600">
                        <li className="flex items-baseline justify-between py-0.5">
                          <span>Lebih rendah</span>
                          <span className="tabular-nums text-neutral-500 font-medium">0–29</span>
                        </li>
                        <li className="flex items-baseline justify-between py-0.5">
                          <span>Sedang</span>
                          <span className="tabular-nums text-neutral-500 font-medium">30–59</span>
                        </li>
                        <li className="flex items-baseline justify-between py-0.5">
                          <span>Lebih tinggi</span>
                          <span className="tabular-nums text-neutral-500 font-medium">60–100</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* In-Card Caption pinned to bottom with mt-auto */}
          <div className="mt-auto pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600 font-medium">
            <span>Skor estimasi model, bukan diagnosis medis.</span>
          </div>
        </div>

        {/* Sisi Kanan: Kartu Prioritas Anda */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 relative flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
                Prioritas
              </h2>
              {priorityFocus.badgeLabel && (
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    priorityFocus.badgeVariant === "protective"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : priorityFocus.badgeVariant === "focus"
                      ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                      : "bg-rose-50 text-rose-700 border border-rose-200/80"
                  }`}
                >
                  {priorityFocus.badgeLabel}
                </span>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-3">
                {priorityFocus.badgeVariant === "protective" ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : priorityFocus.badgeVariant === "focus" ? (
                  <SlidersHorizontal className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0B1E38] tracking-tight leading-snug">
                    {priorityFocus.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
                    {priorityFocus.actionText}
                  </p>
                </div>
              </div>

              {/* Affordance "Mengapa prioritas ini?" (BR-EVIDENCE-005) */}
              <div className="pt-2 pb-2.5">
                <button
                  type="button"
                  onClick={() => setShowHeroFocusDisclosure((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
                >
                  <span>Mengapa prioritas ini?</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showHeroFocusDisclosure ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {showHeroFocusDisclosure && (
                    <motion.div
                      key="hero-focus-disclosure"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.16, ease: "linear" },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          height: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.12, ease: "linear" },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2.5 p-3.5 bg-neutral-50 rounded-xl text-xs text-neutral-700 space-y-1.5 border border-neutral-100/80">
                        <p className="leading-relaxed">{priorityFocus.whyReason}</p>
                        <Link
                          href={`/dashboard/evidence?ref=${priorityFocus.evidenceId}&disease=${diseaseKey}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline pt-0.5"
                        >
                          <span>Buka di Evidence Center</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Row: Secondary tinted style so Risk Score remains primary focal anchor */}
          <div className="mt-auto pt-6 border-t border-neutral-100 flex items-center justify-end">
            <Link
              href="/dashboard/recommendations"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200/80 text-xs font-semibold transition-colors shrink-0"
            >
              <span>Buka Rencana Tindakan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Section 4: Faktor yang Berkontribusi (XAI & Balanced 6-Card Grid) ── */}
      <section className="space-y-5 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0B1E38] tracking-tight">
              Faktor yang berkontribusi
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
              Faktor diurutkan berdasarkan kekuatan pengaruhnya terhadap model estimasi risiko Anda.
            </p>
          </div>

          {/* Segmented Control: Semua | Dapat Diubah | Faktor Tetap */}
          <div className="inline-grid grid-cols-3 p-1 bg-neutral-100 rounded-full text-xs font-medium gap-1 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setFactorTab("all")}
              className={`px-3 py-1 text-center rounded-full transition-all cursor-pointer ${
                factorTab === "all"
                  ? "bg-white text-neutral-900 font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFactorTab("modifiable")}
              className={`px-3 py-1 text-center rounded-full transition-all cursor-pointer ${
                factorTab === "modifiable"
                  ? "bg-white text-neutral-900 font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Dapat Diubah
            </button>
            <button
              type="button"
              onClick={() => setFactorTab("non_modifiable")}
              className={`px-3 py-1 text-center rounded-full transition-all cursor-pointer ${
                factorTab === "non_modifiable"
                  ? "bg-white text-neutral-900 font-bold shadow-2xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Faktor Tetap
            </button>
          </div>
        </div>

        {/* 3-Column Responsive Grid (Balanced 6 cards: 3x2 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedFactors.map((factor) => {
            const isProtective = factor.isSupportive;

            return (
              <div
                key={factor.id}
                onClick={() => setSelectedModalFactor(factor)}
                className="rounded-2xl border border-neutral-200/80 hover:border-neutral-300 bg-white p-5 relative flex flex-col shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer group"
              >
                {/* Top Section: Header & Identity */}
                <div className="space-y-3">
                  {/* Header Row: Title & Chevron */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-neutral-700">
                      {factor.name}
                    </h4>
                    <Info className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 transition-colors shrink-0 mt-0.5" />
                  </div>

                  {/* Factor Real User Value */}
                  <div className="space-y-1">
                    <div
                      className={`text-xl font-bold tracking-tight ${
                        !factor.isModifiable ? "text-neutral-900" : "text-teal-600"
                      }`}
                    >
                      {factor.userValue}
                    </div>
                    {factor.userValueSubtext && (
                      <p className="text-[11px] text-neutral-600 font-medium">
                        {factor.userValueSubtext}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direction & Impact Bar with Neutral Direction Colors */}
                <div className="mt-auto pt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        !factor.isModifiable
                          ? "text-neutral-900"
                          : "text-teal-800"
                      }`}
                    >
                      {isProtective ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                      {factor.directionLabel}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        !factor.isModifiable ? "text-neutral-600" : "text-teal-700"
                      }`}
                    >
                      Pengaruh {factor.weight}%
                    </span>
                  </div>

                  {/* Relative contribution visual bar */}
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, Math.max(12, factor.weight * 2.8))}%` }}
                      className={`h-full rounded-full ${
                        !factor.isModifiable
                          ? "bg-neutral-900"
                          : "bg-teal-600"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-neutral-600 font-medium">
          Catatan: Arah pengaruh menunjukkan bagaimana tiap faktor memengaruhi skor model, bukan penilaian kondisi kesehatan Anda.
        </p>

        {/* Factor Drill-in Dialog Modal with Accessibility (Esc key, Focus Trap, ARIA) */}
        <AnimatePresence>
          {selectedModalFactor && (() => {
            const isSupportive = selectedModalFactor.isSupportive;
            const details = getFactorModalDetails(
              selectedModalFactor.name,
              isSupportive,
              diseaseKey,
              selectedModalFactor.userValue
            );

            return (
              <motion.div
                key="factor-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
                onClick={() => setSelectedModalFactor(null)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-factor-title"
              >
                <motion.div
                  key="factor-modal-card"
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative border border-neutral-100 space-y-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedModalFactor(null)}
                    aria-label="Tutup dialog rincian faktor"
                    className="absolute top-5 right-5 size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>

                  <h3
                    id="modal-factor-title"
                    className="text-2xl font-bold text-neutral-900 tracking-tight"
                  >
                    {selectedModalFactor.name}
                  </h3>

                  <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-neutral-900">Mengapa faktor ini penting?</h4>
                      <p>{details.whyItMatters}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-neutral-900">Dalam estimasi risiko Anda</h4>
                      <p>{details.personalMeaning}</p>
                    </div>

                    {details.clinicalNote && (
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs leading-relaxed">
                        {details.clinicalNote}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      {selectedModalFactor.isModifiable ? (
                        <Link
                          href={`/dashboard/simulation/what-if?disease=${diseaseKey}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <span>Coba di Simulasi Skenario</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-neutral-600 text-xs space-y-2">
                          <p className="leading-relaxed">
                            Faktor ini merupakan parameter biologis atau riwayat yang bersifat tetap dan tidak dapat diubah melalui simulasi skenario. Fokuskan pada faktor gaya hidup aktif untuk menyeimbangkan profil risiko Anda.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setFactorTab("modifiable");
                              setSelectedModalFactor(null);
                            }}
                            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline cursor-pointer"
                          >
                            <span>Lihat faktor yang dapat diubah</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      {/* ── Section 5: Langkah Berikutnya ── */}
      <section className="space-y-4 pt-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Langkah Berikutnya
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Card 1: Proyeksi Risiko */}
          <Link
            href="/dashboard/simulation/future"
            className="group rounded-2xl border border-neutral-200/80 hover:border-neutral-300 bg-white hover:bg-neutral-50/50 p-5 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                  <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                    Proyeksi Risiko
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Perkiraan skor risiko Anda dalam 30, 90, dan 180 hari jika pola hidup tetap sama.
              </p>
            </div>
          </Link>

          {/* Card 2: Simulasi Gaya Hidup */}
          <Link
            href={`/dashboard/simulation/what-if?disease=${diseaseKey}`}
            className="group rounded-2xl border border-neutral-200/80 hover:border-neutral-300 bg-white hover:bg-neutral-50/50 p-5 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                  <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                    Simulasi Gaya Hidup
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Ubah jam tidur, olahraga, atau berat badan, lalu lihat pengaruhnya pada skor.
              </p>
            </div>
          </Link>

          {/* Card 3: Rencana Tindakan */}
          <Link
            href="/dashboard/recommendations"
            className="group rounded-2xl border border-neutral-200/80 hover:border-neutral-300 bg-white hover:bg-neutral-50/50 p-5 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                  <h4 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                    Rencana Tindakan
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Langkah pencegahan yang disusun dari profil Anda.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Section 6: Dasar Ilmiah (Pedoman & Metadata PRD §13.11.1) ── */}
      <section className="space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Dasar Ilmiah
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
              Pedoman yang menjadi dasar rekomendasi dan penjelasan faktor risiko Anda.
            </p>
          </div>
          <Link
            href="/dashboard/evidence"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-700 hover:underline shrink-0 pt-1 sm:pt-0"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Grouped List dengan Hairline Separator */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden divide-y divide-neutral-200/80 shadow-xs">
          {(DISEASE_SCIENTIFIC_REFERENCES[diseaseKey] || DISEASE_SCIENTIFIC_REFERENCES.diabetes).map((item) => {
            const hasUrl = Boolean(item.url);
            const rowContent = (
              <div className="flex items-start justify-between gap-4 p-4 sm:p-5 group-hover:bg-neutral-50/70 transition-colors">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <h4 className="text-[15px] sm:text-base font-semibold text-neutral-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-[13px] text-neutral-500 font-normal">
                    {item.organization} · {item.year} · {item.documentType} · Terakhir diverifikasi {item.lastVerified}
                  </p>
                  <p className="text-xs text-neutral-600 font-normal">
                    <span className="text-neutral-500">Untuk:</span> {item.supports}
                  </p>
                </div>
                {hasUrl ? (
                  <ArrowUpRight
                    className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );

            return hasUrl ? (
              <Link
                key={item.id}
                href={item.url}
                aria-label={`Buka dokumen ${item.title}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                {rowContent}
              </Link>
            ) : (
              <div key={item.id} className="group block">
                {rowContent}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 7: Footer Disclaimer (Kanonik PRD §20.14 & FR-005) ── */}
      <footer className="pt-8 pb-10 border-t border-neutral-200/80 mt-10">
        <p className="text-xs text-neutral-500 leading-relaxed text-left max-w-3xl font-normal">
          HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi/proyeksi berdasarkan data dan model yang digunakan, bukan diagnosis medis, bukan pengganti konsultasi dokter, dan bukan kepastian mengenai kondisi kesehatan seseorang.
        </p>
      </footer>
    </main>
  );
}
