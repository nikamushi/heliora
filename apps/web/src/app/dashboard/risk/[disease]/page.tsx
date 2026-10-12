"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  AlertCircle,
  BookOpen,
  Info,
  ChevronRight,
  Activity,
  CheckCircle2,
  PersonStanding,
  Users,
  Footprints,
  Plus,
  Moon,
  Wind,
  Apple,
  Zap,
  Calendar,
  X,
  Droplet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { RiskAssessmentItem, RiskLevel, HealthProfileResponse } from "@/types/api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { MockDataNotice } from "@/components/mock-data-notice";

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
      "Estimasi tingkat risiko gangguan metabolisme glukosa dan resistensi insulin berbasis indikator CDC BRFSS, gaya hidup, dan indeks massa tubuh.",
    guidelineSource:
      "Konsensus Pengelolaan & Pencegahan DM Tipe 2 di Indonesia (PERKENI, 2021) & WHO Global Report on Diabetes",
    factors: [
      {
        name: "Komposisi Tubuh",
        weight: 35,
        impact: "increase",
        note: "Akumulasi jaringan adiposa memicu resistensi reseptor insulin perifer.",
        actionIndex: 2,
      },
      {
        name: "Aktivitas Fisik",
        weight: 28,
        impact: "increase",
        note: "Kurangnya kontraksi otot menurunkan translokasi transporter GLUT-4.",
        actionIndex: 0,
      },
      {
        name: "Tidur",
        weight: 18,
        impact: "increase",
        note: "Memicu peningkatan kortisol diurnal dan resistensi metabolik nocturnal.",
        actionIndex: 1,
      },
      {
        name: "Riwayat Penyakit Keluarga",
        weight: 22,
        impact: "increase",
        note: "Predisposisi genetik bawaan menurunkan kapasitas kompensasi sekresi insulin sel beta pankreas.",
        actionIndex: 0,
      },
      {
        name: "Merokok",
        weight: 19,
        impact: "decrease",
        note: "Faktor protektif yang menurunkan stres oksidatif endotel vaskular.",
        actionIndex: 0,
      },
      {
        name: "Usia",
        weight: 25,
        impact: "increase",
        note: "Penuaan selular metabolik menurunkan sensitivitas insulin dan kapasitas cadangan sel beta.",
        actionIndex: 0,
      },
      {
        name: "Tingkat Stres",
        weight: 16,
        impact: "increase",
        note: "Stres psikososial memicu sekresi kortisol berlebih yang mengganggu homeostasis glukosa.",
        actionIndex: 1,
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
    title: "Hipertensi",
    category: "Sirkulasi & Hemodinamik",
    definition:
      "Estimasi tingkat risiko peningkatan resistensi vaskular sistemik dan tekanan arterial persisten berbasis analisis risiko preventif.",
    guidelineSource:
      "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular (PERKI, 2021) & AHA/ACC Hypertension Guidelines",
    factors: [
      {
        name: "Tingkat Stres",
        weight: 32,
        impact: "increase",
        note: "Hiperaktivitas sistem saraf simpatis memicu vasokonstriksi arteriol persisten.",
        actionIndex: 0,
      },
      {
        name: "Tidur",
        weight: 26,
        impact: "increase",
        note: "Gangguan istirahat menghambat nocturnal dipping alami regulasi tekanan darah.",
        actionIndex: 0,
      },
      {
        name: "Aktivitas Fisik",
        weight: 22,
        impact: "decrease",
        note: "Mendukung kelenturan endotel pembuluh darah dan pelepasan nitric oxide.",
        actionIndex: 2,
      },
      {
        name: "Riwayat Penyakit Keluarga",
        weight: 20,
        impact: "increase",
        note: "Predisposisi genetik terhadap regulasi natrium ginjal dan tonus vaskular.",
        actionIndex: 1,
      },
      {
        name: "Usia",
        weight: 24,
        impact: "increase",
        note: "Penurunan komplians elastin aorta seiring usia meningkatkan tekanan nadi sistolik.",
        actionIndex: 1,
      },
      {
        name: "Komposisi Tubuh",
        weight: 19,
        impact: "increase",
        note: "Kelebihan massa tubuh menambah resistensi vaskular sistemik dan beban kerja jantung.",
        actionIndex: 2,
      },
      {
        name: "Merokok",
        weight: 16,
        impact: "decrease",
        note: "Mencegah vasokonstriksi akut dan menjaga elastisitas dinding arteri.",
        actionIndex: 0,
      },
      {
        name: "Tekanan Darah",
        weight: 35,
        impact: "increase",
        note: "Beban resistensi vaskular sirkulasi perifer dan tekanan hemodinamik arterial persisten.",
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
    title: "Kardiovaskular",
    category: "Jantung & Sirkulasi Sistemik",
    definition:
      "Estimasi tingkat risiko beban hemodinamik jantung, disfungsi mikrovaskular, dan aterosklerosis preventif jangka panjang.",
    guidelineSource:
      "Panduan Pencegahan Primer Penyakit Kardiovaskular (PERKI & ESC Guidelines, 2021)",
    factors: [
      {
        name: "Aktivitas Fisik",
        weight: 34,
        impact: "increase",
        note: "Waktu duduk berkepanjangan memperlambat sirkulasi perifer dan metabolisme lipid.",
        actionIndex: 0,
      },
      {
        name: "Merokok",
        weight: 28,
        impact: "decrease",
        note: "Bebas dari paparan karbon monoksida dan stres endotel vaskular yang diinduksi nikotin.",
        actionIndex: 2,
      },
      {
        name: "Komposisi Tubuh",
        weight: 22,
        impact: "increase",
        note: "Meningkatkan beban kerja curah jantung basal untuk memenuhi perfusi jaringan.",
        actionIndex: 1,
      },
      {
        name: "Tidur",
        weight: 16,
        impact: "decrease",
        note: "Memberikan periode istirahat pemulihan miokardium yang memadai setiap malam.",
        actionIndex: 2,
      },
      {
        name: "Riwayat Penyakit Keluarga",
        weight: 21,
        impact: "increase",
        note: "Predisposisi genetik bawaan terhadap aterogenesis koroner dini.",
        actionIndex: 0,
      },
      {
        name: "Tekanan Darah",
        weight: 25,
        impact: "increase",
        note: "Beban tekanan sirkulasi arteri yang tinggi memicu hipertrofi miokardium dan kekakuan vaskular.",
        actionIndex: 1,
      },
      {
        name: "Usia",
        weight: 26,
        impact: "increase",
        note: "Penurunan komplians aorta dan penumpukan plak aterosklerotik seiring bertambahnya usia.",
        actionIndex: 0,
      },
      {
        name: "Tingkat Stres",
        weight: 18,
        impact: "increase",
        note: "Aktivasi simpatis berlebih memicu peningkatan denyut jantung basal dan beban kerja miokardium.",
        actionIndex: 1,
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

interface ScientificReferenceItem {
  id: string;
  title: string;
  organization: string;
  year: number;
  badge: string;
  scope: string;
  url: string;
}

const DISEASE_SCIENTIFIC_REFERENCES: Record<string, ScientificReferenceItem[]> = {
  diabetes: [
    {
      id: "ref-dia-01",
      title: "Konsensus Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 di Indonesia",
      organization: "PERKENI",
      year: 2021,
      badge: "Pedoman Nasional",
      scope: "Standar kriteria gaya hidup, regulasi nutrisi medis, dan ambang risiko kardiometabolik di Indonesia.",
      url: "/dashboard/evidence?ref=evi-02&disease=diabetes",
    },
    {
      id: "ref-dia-02",
      title: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
      organization: "World Health Organization",
      year: 2020,
      badge: "Konsensus Global",
      scope: "Ambang aktivitas aerobik minimal 150–300 menit per minggu untuk translokasi GLUT-4 dan sensitivitas insulin.",
      url: "/dashboard/evidence?ref=evi-01&disease=diabetes",
    },
    {
      id: "ref-dia-03",
      title: "CDC BRFSS & ADA Standards of Medical Care in Diabetes",
      organization: "CDC & ADA",
      year: 2023,
      badge: "Studi Epidemiologi",
      scope: "Dasar pembobotan multivariat gaya hidup, indeks massa tubuh (BMI), dan riwayat keluarga dalam estimasi risiko preventif.",
      url: "/dashboard/evidence?disease=diabetes",
    },
  ],
  hypertension: [
    {
      id: "ref-hyp-01",
      title: "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular",
      organization: "PERKI",
      year: 2021,
      badge: "Pedoman Nasional",
      scope: "Standar stratifikasi tekanan darah, pengaruh retensi natrium, dan pedoman gaya hidup kardiologis.",
      url: "/dashboard/evidence?ref=evi-07&disease=hypertension",
    },
    {
      id: "ref-hyp-02",
      title: "Global Hypertension Practice Guidelines",
      organization: "ISH & AHA",
      year: 2020,
      badge: "Konsensus Global",
      scope: "Ambang batas intervensi non-farmakologis: pembatasan natrium, manajemen stres, dan higiene tidur.",
      url: "/dashboard/evidence?disease=hypertension",
    },
    {
      id: "ref-hyp-03",
      title: "Korelasi Durasi dan Kualitas Tidur terhadap Risiko Hipertensi",
      organization: "CDC & Kemenkes RI",
      year: 2022,
      badge: "Klinis & Epidemiologi",
      scope: "Evidensi fenomena nocturnal dipping tekanan darah dan dampak durasi istirahat terhadap resistensi vaskular.",
      url: "/dashboard/evidence?ref=evi-03&disease=hypertension",
    },
  ],
  cardiovascular: [
    {
      id: "ref-cvd-01",
      title: "ESC Guidelines on Cardiovascular Disease Prevention in Clinical Practice",
      organization: "ESC & PERKI",
      year: 2021,
      badge: "Pedoman Klinis",
      scope: "Rujukan pencegahan primer aterosklerosis, penghentian merokok, dan pengendalian profil lipid.",
      url: "/dashboard/evidence?ref=evi-04&disease=cardiovascular",
    },
    {
      id: "ref-cvd-02",
      title: "Guideline on the Primary Prevention of Cardiovascular Disease",
      organization: "ACC & AHA",
      year: 2019,
      badge: "Konsensus Internasional",
      scope: "Protokol komprehensif gaya hidup sehat, kebugaran kardiorespirasi, dan estimasi risiko jangka panjang.",
      url: "/dashboard/evidence?ref=evi-06&disease=cardiovascular",
    },
    {
      id: "ref-cvd-03",
      title: "Psychological Health, Well-Being, and Mind-Heart-Body Connection",
      organization: "American Heart Association",
      year: 2021,
      badge: "Pernyataan Ilmiah",
      scope: "Pengaruh aktivasi aksis stres neuroendokrin terhadap percepatan kekakuan vaskular dan ritme denyut jantung.",
      url: "/dashboard/evidence?ref=evi-05&disease=cardiovascular",
    },
  ],
};

const LEVEL_INTERPRETATION: Record<RiskLevel, string> = {
  low: "Risiko Anda tergolong rendah. Pertahankan kebiasaan sehat Anda.",
  moderate:
    "Estimasi risiko Anda berada pada kategori Sedang. Tindakan intervensi gaya hidup terencana sangat disarankan.",
  high: "Estimasi risiko Anda berada pada kategori Tinggi. Prioritaskan penyesuaian gaya hidup dan konsultasikan dengan tenaga medis profesional.",
};

interface SelectedFactorModalData {
  id: string;
  name: string;
  group?: string;
  status: string;
  note: string;
  actionIndex?: number;
}

interface FactorModalDetails {
  whyItMatters: string;
  personalMeaning: string;
}

function getFactorModalDetails(
  factorName: string,
  isSupportive: boolean,
  note: string,
  diseaseKey: string
): FactorModalDetails {
  const nameLower = factorName.toLowerCase();
  const conditionLabel =
    diseaseKey === "diabetes"
      ? "Diabetes Melitus"
      : diseaseKey === "hypertension"
      ? "Hipertensi"
      : "Kardiovaskular";

  if (nameLower.includes("aktivitas") || nameLower.includes("kardio") || nameLower.includes("kebugaran")) {
    return {
      whyItMatters:
        "Aktivitas fisik merupakan salah satu kebiasaan utama yang diperhitungkan dalam menjaga metabolisme energi dan kesehatan peredaran darah.",
      personalMeaning: isSupportive
        ? `Tingkat aktivitas fisik Anda saat ini berperan dalam menjaga estimasi risiko ${conditionLabel} tetap rendah.`
        : `Tingkat aktivitas fisik menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
    };
  }

  if (nameLower.includes("komposisi tubuh") || nameLower.includes("bmi") || nameLower.includes("massa tubuh")) {
    return {
      whyItMatters:
        "Komposisi tubuh merupakan salah satu faktor yang diperhitungkan dalam estimasi risiko ini.",
      personalMeaning: isSupportive
        ? `Komposisi tubuh menjadi salah satu faktor yang berperan dalam menjaga profil estimasi risiko ${conditionLabel} Anda tetap stabil.`
        : `Komposisi tubuh menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
    };
  }

  if (nameLower.includes("tidur") || nameLower.includes("istirahat")) {
    return {
      whyItMatters:
        "Pola dan durasi tidur merupakan salah satu faktor pemulihan alami yang diperhitungkan dalam kestabilan hormon dan tekanan darah.",
      personalMeaning: isSupportive
        ? `Durasi istirahat yang cukup berperan positif dalam mendukung estimasi profil risiko ${conditionLabel} Anda.`
        : `Waktu istirahat yang kurang atau pola tidur yang tidak teratur menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
    };
  }

  if (nameLower.includes("merokok") || nameLower.includes("rokok")) {
    return {
      whyItMatters:
        "Status paparan rokok merupakan salah satu faktor gaya hidup yang diperhitungkan dalam kesehatan pembuluh darah dan fungsi metabolik.",
      personalMeaning: isSupportive
        ? `Status bebas dari paparan rokok berperan penting dalam melindungi estimasi risiko ${conditionLabel} Anda.`
        : `Kebiasaan merokok menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
    };
  }

  if (nameLower.includes("stres")) {
    return {
      whyItMatters:
        "Tingkat stres harian merupakan salah satu faktor yang diperhitungkan karena memengaruhi keseimbangan hormon dan regulasi tekanan darah.",
      personalMeaning: isSupportive
        ? `Pengelolaan stres yang baik berperan dalam menjaga kestabilan estimasi risiko ${conditionLabel} Anda.`
        : `Tingkat stres yang dialami menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
    };
  }

  if (nameLower.includes("keluarga") || nameLower.includes("genetik")) {
    return {
      whyItMatters:
        "Riwayat kesehatan keluarga merupakan salah satu faktor biologis yang diperhitungkan dalam menilai kecenderungan awal risiko kesehatan.",
      personalMeaning: isSupportive
        ? `Tidak adanya riwayat keluarga dekat berperan meringankan estimasi risiko ${conditionLabel} Anda.`
        : `Riwayat dalam keluarga menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda, yang dapat diimbangi dengan kebiasaan hidup sehat.`,
    };
  }

  if (nameLower.includes("usia") || nameLower.includes("umur") || nameLower.includes("age")) {
    return {
      whyItMatters:
        "Usia merupakan salah satu parameter demografis yang diperhitungkan dalam estimasi perubahan fungsi fisiologis tubuh dari waktu ke waktu.",
      personalMeaning: isSupportive
        ? `Rentang usia Anda saat ini berperan sebagai faktor pendukung dalam estimasi risiko ${conditionLabel} Anda.`
        : `Faktor usia berkontribusi terhadap estimasi risiko ${conditionLabel} Anda, sehingga konsistensi gaya hidup preventif menjadi semakin penting.`,
    };
  }

  if (nameLower.includes("gula darah") || nameLower.includes("glukosa") || nameLower.includes("blood_sugar")) {
    return {
      whyItMatters:
        "Kadar gula darah merupakan indikator laboratorium klinis utama dalam mengevaluasi regulasi glikemik basal, sensitivitas insulin, dan fungsi sekresi sel beta pankreas.",
      personalMeaning: isSupportive
        ? `Kadar gula darah Anda berada dalam rentang normal (<100 mg/dL), berperan kuat melindungi profil metabolik Anda dari risiko ${conditionLabel}.`
        : `Kadar gula darah Anda berada di atas ambang batas normal, menjadi indikator klinis prioritas yang memicu peningkatan estimasi risiko ${conditionLabel}.`,
    };
  }

  if (nameLower.includes("tekanan darah") || nameLower.includes("vaskular")) {
    return {
      whyItMatters:
        "Tekanan darah merupakan salah satu indikator vital yang diperhitungkan dalam menilai sirkulasi darah dan beban kerja jantung.",
      personalMeaning: isSupportive
        ? `Tekanan darah Anda yang terkontrol berperan penting dalam menjaga estimasi risiko ${conditionLabel} dalam batas aman.`
        : `Tekanan darah menjadi salah satu faktor yang berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
    };
  }

  return {
    whyItMatters: `${factorName} merupakan salah satu faktor yang diperhitungkan dalam estimasi risiko ini.`,
    personalMeaning: isSupportive
      ? `Faktor ini berperan dalam menjaga estimasi risiko ${conditionLabel} Anda tetap optimal.`
      : `Faktor ini berkontribusi terhadap estimasi risiko ${conditionLabel} Anda.`,
  };
}

export default function RiskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const diseaseKey = ((params?.disease as string) || "").toLowerCase();
  const {
    isAuthorized,
    assessment,
    isLoading,
    error,
    refetch: fetchLatestAssessment,
  } = useLatestAssessment();

  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showHeroFocusDisclosure, setShowHeroFocusDisclosure] = useState<boolean>(false);
  const [selectedModalFactor, setSelectedModalFactor] = useState<SelectedFactorModalData | null>(null);
  const [factorTab, setFactorTab] = useState<"clinical" | "supportive">("clinical");
  const [healthProfile, setHealthProfile] = useState<HealthProfileResponse | null>(null);

  useEffect(() => {
    if (!selectedModalFactor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedModalFactor(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModalFactor]);

  useEffect(() => {
    if (selectedModalFactor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedModalFactor]);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;
    apiClient.healthProfile
      .get()
      .then((hp) => {
        if (!isCancelled) {
          setHealthProfile(hp);
        }
      })
      .catch(() => {
        // Fallback anggap profil belum ada atau gunakan asesmen
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-white text-brand-900 flex items-center justify-center p-6">
        <p className="text-sm font-medium text-brand-900/70">Memuat analisis risiko...</p>
      </div>
    );
  }

  if (error) {
    if (error.kind === "not_found") {
      return (
        <div className="min-h-screen bg-white text-brand-900 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-brand-900/10 rounded-3xl p-8 shadow-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-900/10 text-brand-900 flex items-center justify-center mx-auto text-lg font-bold">
              H
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-brand-900">
                Belum Ada Data Asesmen
              </h1>
              <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                Lengkapi profil kesehatan Anda terlebih dahulu agar sistem dapat memproyeksikan estimasi risiko untuk kondisi ini.
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
      <div className="min-h-screen bg-white text-brand-900 flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-white text-brand-900 flex items-center justify-center p-6">
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
      ? (rawScore <= 1.0 ? rawScore * 100 : Number(rawScore))
          .toFixed(1)
          .replace(/\.0$/, "")
      : "0";

  // Bind to real assessment top factors (Explainable AI SHAP) merged with meta.factors & healthProfile to ensure full clinical accuracy
  const factorsToDisplay = meta.factors.map((metaFactor) => {
    const matchedTopFactor = assessment.top_factors?.find((tf) => {
      const ml = metaFactor.name.toLowerCase();
      const tl = tf.label.toLowerCase();
      const tfFeat = tf.feature.toLowerCase();
      return (
        ml.includes(tl) ||
        tl.includes(ml) ||
        (tfFeat === "bmi" && ml.includes("bmi")) ||
        (tfFeat === "physical_activity" &&
          (ml.includes("aktivitas") || ml.includes("kardio") || ml.includes("kebugaran"))) ||
        (tfFeat === "smoking_status" && (ml.includes("rokok") || ml.includes("merokok"))) ||
        (tfFeat === "sleep_duration" && (ml.includes("tidur") || ml.includes("istirahat"))) ||
        (tfFeat === "family_history" && ml.includes("keluarga"))
      );
    });

    const nameLower = metaFactor.name.toLowerCase();
    let isSupportive = false;
    let factorNote = metaFactor.note;

    if (matchedTopFactor) {
      isSupportive = matchedTopFactor.impact === "decrease" || matchedTopFactor.weight_percentage < 0;
      factorNote = matchedTopFactor.description || metaFactor.note;
    } else if (healthProfile) {
      if (nameLower.includes("stres")) {
        const s = healthProfile.stress_level;
        isSupportive = s !== null && s !== undefined ? s <= 5 : true;
        factorNote = isSupportive
          ? (s !== null && s !== undefined ? `Tingkat beban stres (${s}/10) terkendali dengan baik, menjaga stabilitas tonus vaskular.` : "Tingkat stres harian terkendali dengan baik.")
          : (s !== null && s !== undefined ? `Tingkat beban stres (${s}/10) cenderung tinggi, memicu vasokonstriksi arteriol persisten.` : "Hiperaktivitas sistem saraf simpatis memicu vasokonstriksi arteriol persisten.");
      } else if (nameLower.includes("tidur") || nameLower.includes("istirahat")) {
        const sl = healthProfile.sleep_duration_hours;
        isSupportive = sl !== null && sl !== undefined ? sl >= 6.5 : true;
        factorNote = isSupportive
          ? (sl !== null && sl !== undefined ? `Durasi istirahat (${sl} jam/hari) stabil, mendukung nocturnal dipping alami tekanan arterial.` : "Durasi tidur teratur menjaga regulasi vaskular.")
          : (sl !== null && sl !== undefined ? `Durasi istirahat (${sl} jam/hari) kurang dari optimal, menghambat relaksasi kardiovaskular nokturnal.` : "Gangguan istirahat menghambat nocturnal dipping alami regulasi tekanan darah.");
      } else if (nameLower.includes("kardio") || nameLower.includes("kebugaran") || nameLower.includes("aktivitas")) {
        const act = healthProfile.physical_activity_min_per_week;
        isSupportive = act !== null && act !== undefined ? act >= 150 : true;
        factorNote = isSupportive
          ? (act !== null && act !== undefined ? `Aktivitas fisik (${act} menit/minggu) mencukupi target WHO, mendukung kelenturan endotel pembuluh darah.` : "Aktivitas fisik rutin mendukung pelepasan nitric oxide dan kelenturan vaskular.")
          : (act !== null && act !== undefined ? `Aktivitas fisik (${act} menit/minggu) masih di bawah batas 150 menit/minggu rekomendasi WHO.` : "Kurangnya kebugaran fisik rutin menurunkan kelenturan dinding vaskular.");
      } else if (nameLower.includes("keluarga")) {
        isSupportive = !healthProfile.family_history;
        factorNote = isSupportive
          ? "Tidak ada riwayat penyakit langsung dalam keluarga lini pertama, predisposisi genetik bawaan rendah."
          : "Tercatat riwayat penyakit dalam keluarga, mengindikasikan predisposisi genetik terhadap tonus vaskular & aterogenesis.";
      } else if (nameLower.includes("bmi") || nameLower.includes("massa tubuh") || nameLower.includes("komposisi")) {
        const bmiVal = healthProfile.bmi ?? (healthProfile.weight_kg && healthProfile.height_cm ? Number((healthProfile.weight_kg / Math.pow(healthProfile.height_cm / 100, 2)).toFixed(1)) : null);
        isSupportive = bmiVal !== null ? bmiVal < 25.0 : true;
        factorNote = isSupportive
          ? (bmiVal !== null ? `Komposisi tubuh (BMI ${bmiVal}) dalam rentang sehat, menjaga beban kerja sirkulasi jantung.` : "Massa tubuh berada dalam rentang ideal.")
          : (bmiVal !== null ? `Komposisi tubuh (BMI ${bmiVal}) tergolong di atas ambang batas ideal, menambah resistensi vaskular sistemik.` : "Kelebihan massa tubuh menambah resistensi vaskular sistemik dan beban kerja jantung.");
      } else if (nameLower.includes("rokok")) {
        const smk = String(healthProfile.smoking_status).toLowerCase();
        isSupportive = smk === "never" || smk === "former";
        factorNote = smk === "never"
          ? "Status bebas rokok mencegah vasokonstriksi akut dan menjaga elastisitas dinding pembuluh darah."
          : smk === "former"
          ? "Riwayat mantan perokok: Penghentian merokok secara progresif memulihkan integritas endotel."
          : "Kebiasaan merokok aktif memicu disfungsi endotel vaskular dan mempercepat pembentukan plak.";
      } else if (nameLower.includes("tekanan darah") || nameLower.includes("vaskular")) {
        const bp = healthProfile.blood_pressure;
        if (bp) {
          const parts = bp.split("/").map((s: string) => Number(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            isSupportive = parts[0] < 130 && parts[1] < 85;
            factorNote = isSupportive
              ? `Tekanan darah (${bp} mmHg) berada dalam batas normotensif optimal.`
              : `Tekanan darah (${bp} mmHg) tergolong prehipertensi/hipertensi, menambah beban resistensi sirkulasi arterial.`;
          } else {
            isSupportive = true;
          }
        } else {
          isSupportive = true;
          factorNote = "Data tekanan darah belum dicatat langsung; evaluasi profil hemodinamik diestimasi dari parameter gaya hidup Anda.";
        }
      } else if (nameLower.includes("gula darah") || nameLower.includes("glukosa")) {
        const bs = healthProfile.blood_sugar_mg_dl;
        if (bs !== null && bs !== undefined) {
          isSupportive = bs < 100;
          factorNote = isSupportive
            ? `Kadar gula darah (${bs} mg/dL) berada dalam rentang normal optimal (<100 mg/dL).`
            : bs >= 126
            ? `Kadar gula darah (${bs} mg/dL) memenuhi kriteria klinis hiperglikemia (≥126 mg/dL).`
            : `Kadar gula darah (${bs} mg/dL) tergolong prediabetes (100–125 mg/dL), meningkatkan beban resistensi metabolik.`;
        } else {
          isSupportive = true;
          factorNote = "Data gula darah belum dicatat; evaluasi glikemik diestimasi dari parameter gaya hidup & biometrik Anda.";
        }
      } else if (nameLower.includes("usia") || nameLower.includes("umur") || nameLower.includes("age")) {
        const ageVal = healthProfile.age;
        isSupportive = ageVal !== null && ageVal !== undefined ? ageVal < 45 : true;
        factorNote = isSupportive
          ? (ageVal !== null && ageVal !== undefined ? `Usia (${ageVal} tahun) di bawah ambang klinis 45 tahun, komplians elastin vaskular terjaga baik.` : "Usia berada dalam rentang optimal.")
          : (ageVal !== null && ageVal !== undefined ? `Usia (${ageVal} tahun) berada pada rentang ≥45 tahun, terjadi penurunan alami komplians elastin vaskular.` : "Penurunan komplians elastin aorta seiring usia meningkatkan beban denyut nadi sistolik.");
      } else {
        isSupportive = metaFactor.impact === "decrease";
        factorNote = metaFactor.note;
      }
    } else {
      isSupportive = metaFactor.impact === "decrease";
      factorNote = metaFactor.note;
    }

    let IconComponent = Activity;
    let accent = isSupportive ? "text-[#10B981]" : "text-[#FF8A00]";
    let prefix = metaFactor.name + " ";
    let highlight = isSupportive ? "kondisi optimal" : "perlu perhatian";
    let suffix = ".";

    if (nameLower.includes("stres")) {
      IconComponent = Zap;
      accent = "text-[#FF8A00]";
      prefix = "Tingkat stres harian ";
      highlight = isSupportive ? "terkelola dengan baik" : "memicu beban simpatis";
      suffix = " persisten.";
    } else if (nameLower.includes("tidur") || nameLower.includes("istirahat")) {
      IconComponent = Moon;
      accent = "text-[#5856D6]";
      prefix = "Durasi istirahat ";
      highlight = isSupportive ? "teratur 7–8 jam" : "kurang dari optimal";
      suffix = " per malam.";
    } else if (nameLower.includes("kardio") || nameLower.includes("kebugaran") || nameLower.includes("aktivitas")) {
      IconComponent = Footprints;
      accent = "text-[#FF8A00]";
      prefix = "Aktivitas fisik ";
      highlight = isSupportive ? "menjaga elastisitas arteri" : "perlu ditingkatkan";
      suffix = " secara rutin.";
    } else if (nameLower.includes("keluarga")) {
      IconComponent = Users;
      accent = "text-[#10B981]";
      prefix = "Riwayat keluarga ";
      highlight = isSupportive ? "predisposisi genetik rendah" : "tercatat predisposisi genetik";
      suffix = " lini pertama.";
    } else if (nameLower.includes("natrium") || nameLower.includes("dash") || nameLower.includes("nutrisi")) {
      IconComponent = Apple;
      accent = "text-[#E11D48]";
      prefix = "Pola asupan diet ";
      highlight = isSupportive ? "mendukung regulasi vaskular" : "perlu kontrol natrium & diet";
      suffix = " harian.";
    } else if (nameLower.includes("bmi") || nameLower.includes("massa tubuh") || nameLower.includes("komposisi")) {
      IconComponent = PersonStanding;
      accent = "text-[#AF52DE]";
      prefix = "Komposisi massa tubuh ";
      highlight = isSupportive ? "dalam rentang ideal" : "meningkatkan resistensi vaskular";
      suffix = " sistemik.";
    } else if (nameLower.includes("rokok")) {
      IconComponent = Wind;
      accent = "text-[#0891B2]";
      prefix = "Status ";
      highlight = isSupportive ? "bebas asap rokok" : "paparan rokok aktif";
      suffix = isSupportive ? " melindungi endotel pembuluh." : " memicu stres vaskular.";
    } else if (nameLower.includes("tekanan darah") || nameLower.includes("vaskular")) {
      IconComponent = Activity;
      accent = "text-[#E11D48]";
      prefix = "Profil hemodinamik ";
      highlight = isSupportive ? "tekanan arterial terjaga" : "beban resistensi vaskular";
      suffix = " sirkulasi.";
    } else if (nameLower.includes("gula darah") || nameLower.includes("glukosa")) {
      IconComponent = Droplet;
      accent = "text-[#0D9488]";
      prefix = "Regulasi glukosa ";
      highlight = isSupportive ? "dalam batas normal" : "terindikasi elevasi klinis";
      suffix = " (<100 mg/dL).";
    } else if (nameLower.includes("usia") || nameLower.includes("umur") || nameLower.includes("age")) {
      IconComponent = Calendar;
      accent = "text-[#007AFF]";
      prefix = "Lintasan usia ";
      highlight = isSupportive ? "dalam rentang optimal" : "di atas ambang risiko";
      suffix = " penuaan biologis.";
    }

    const isClinical =
      nameLower.includes("tekanan darah") ||
      nameLower.includes("vaskular") ||
      nameLower.includes("bmi") ||
      nameLower.includes("massa tubuh") ||
      nameLower.includes("komposisi tubuh") ||
      nameLower.includes("usia") ||
      nameLower.includes("umur") ||
      nameLower.includes("age") ||
      nameLower.includes("keluarga") ||
      nameLower.includes("kolesterol") ||
      nameLower.includes("gula darah");

    return {
      id: metaFactor.name,
      name: metaFactor.name,
      group: (isClinical ? "clinical" : "supportive") as "clinical" | "supportive",
      prefix,
      highlight,
      suffix,
      icon: IconComponent,
      accentColor: accent,
      status: isSupportive ? "Mendukung" : "Perlu perhatian",
      weight: matchedTopFactor
        ? Number(matchedTopFactor.weight_percentage).toFixed(1).replace(/\.0$/, "")
        : String(metaFactor.weight),
      impact: isSupportive ? "decrease" : "increase",
      note: factorNote,
      actionIndex: metaFactor.actionIndex,
    };
  });

  // Khusus Diabetes Melitus: tampilkan seluruh daftar faktor klinis & gaya hidup
  // dengan status dinamis ("Mendukung" | "Perlu perhatian") berbasis data asesmen.
  const diabetesFactors = (() => {
    if (diseaseKey !== "diabetes" || !assessment) return [];

    const topFactors = assessment.top_factors || [];

    const findFactor = (keywords: string[]) => {
      return topFactors.find((f) => {
        const feat = f.feature.toLowerCase();
        const lbl = f.label.toLowerCase();
        return keywords.some((kw) => feat.includes(kw) || lbl.includes(kw));
      });
    };

    // 1. Aktivitas Fisik
    const actFactor = findFactor(["physical_activity", "activity", "aktivitas"]);
    const actVal = healthProfile?.physical_activity_min_per_week;
    const isActLow = actFactor
      ? (actFactor.impact === "increase" || actFactor.weight_percentage > 0)
      : (actVal !== undefined && actVal !== null ? actVal < 150 : assessment.recommendations?.some((r) => r.category === "activity" && r.priority !== "protective"));

    const actStatus: "Mendukung" | "Perlu perhatian" = isActLow ? "Perlu perhatian" : "Mendukung";
    const actNote = isActLow
      ? (actFactor?.description || (actVal !== undefined && actVal !== null ? `Tingkat aktivitas fisik (${actVal} menit/minggu) masih di bawah batas minimal 150 menit/minggu rekomendasi WHO.` : "Tingkat aktivitas fisik harian masih di bawah rekomendasi minimal WHO 150 menit/minggu."))
      : (actFactor?.description || (actVal !== undefined && actVal !== null ? `Aktivitas fisik (${actVal} menit/minggu) mencukupi rekomendasi kardioprotektif WHO (≥150 menit/minggu).` : "Aktivitas fisik mencukupi rekomendasi kardioprotektif WHO (≥150 menit/minggu)."));

    // 2. BMI
    const bmiFactor = findFactor(["bmi", "massa tubuh", "berat"]);
    const bmiVal = healthProfile?.bmi ?? (healthProfile?.weight_kg && healthProfile?.height_cm ? Number((healthProfile.weight_kg / Math.pow(healthProfile.height_cm / 100, 2)).toFixed(1)) : null);
    const isBmiHigh = bmiFactor
      ? (bmiFactor.impact === "increase" || bmiFactor.weight_percentage > 0)
      : (bmiVal !== null ? bmiVal >= 25.0 : false);

    const bmiStatus: "Mendukung" | "Perlu perhatian" = isBmiHigh ? "Perlu perhatian" : "Mendukung";
    const bmiNote = bmiFactor?.description || (isBmiHigh
      ? (bmiVal !== null ? `BMI (${bmiVal}) tergolong di atas ambang batas ideal, meningkatkan beban resistensi insulin.` : "BMI berada di luar rentang optimal, meningkatkan beban resistensi insulin.")
      : (bmiVal !== null ? `BMI (${bmiVal}) berada pada rentang sehat dan melindungi fungsi metabolik.` : "BMI berada pada rentang sehat dan melindungi fungsi metabolik."));

    // 3. Tidur
    const sleepFactor = findFactor(["sleep", "tidur"]);
    const sleepVal = healthProfile?.sleep_duration_hours;
    const isSleepLow = sleepFactor
      ? (sleepFactor.impact === "increase" || sleepFactor.weight_percentage > 0)
      : (sleepVal !== undefined && sleepVal !== null ? sleepVal < 6.5 : assessment.recommendations?.some((r) => r.category === "sleep" && r.priority !== "protective"));

    const sleepStatus: "Mendukung" | "Perlu perhatian" = isSleepLow ? "Perlu perhatian" : "Mendukung";
    const sleepNote = sleepFactor?.description || (isSleepLow
      ? (sleepVal !== undefined && sleepVal !== null ? `Durasi tidur (${sleepVal} jam/hari) kurang dari anjuran (7–8 jam), meningkatkan stres metabolik nocturnal.` : "Durasi tidur kurang dari 6 jam atau tidak teratur memicu resistensi metabolik.")
      : (sleepVal !== undefined && sleepVal !== null ? `Durasi tidur (${sleepVal} jam/hari) teratur dan stabil, menjaga regulasi diurnal dan sensitivitas insulin.` : "Durasi tidur teratur menjaga sensitivitas insulin dan regulasi diurnal."));

    // 4. Riwayat Penyakit Keluarga
    const famFactor = findFactor(["family", "keluarga", "genetik"]);
    const hasFamilyRisk = famFactor
      ? (famFactor.impact === "increase" || famFactor.weight_percentage > 0)
      : (healthProfile ? Boolean(healthProfile.family_history) : false);

    const famStatus: "Mendukung" | "Perlu perhatian" = hasFamilyRisk ? "Perlu perhatian" : "Mendukung";
    const famNote = famFactor?.description || (hasFamilyRisk
      ? "Terdapat riwayat diabetes dalam keluarga yang menurunkan ambang toleransi metabolik tubuh."
      : "Tidak ada riwayat diabetes langsung dalam keluarga, predisposisi genetik bawaan rendah.");

    // 5. Kebiasaan Merokok
    const smokeFactor = findFactor(["smoking", "merokok", "rokok"]);
    const smokeVal = healthProfile ? String(healthProfile.smoking_status).toLowerCase() : null;
    const isSmokingActive = smokeFactor
      ? (smokeFactor.impact === "increase" || smokeFactor.weight_percentage > 0)
      : (smokeVal ? smokeVal === "current" : false);

    const smokeStatus: "Mendukung" | "Perlu perhatian" = isSmokingActive ? "Perlu perhatian" : "Mendukung";
    const smokeNote = smokeFactor?.description || (isSmokingActive
      ? "Kebiasaan merokok aktif memicu stres oksidatif sistemik dan memperparah disfungsi metabolik."
      : smokeVal === "former"
      ? "Riwayat mantan perokok: Penghentian merokok melindungi fungsi vaskular dan pemulihan metabolik."
      : "Status bebas asap rokok melindungi kelenturan endotel dan sensitivitas insulin.");

    // 6. Tingkat Stres
    const stressFactor = findFactor(["stress", "stres"]);
    const strVal = healthProfile?.stress_level;
    const isStressElevated = stressFactor
      ? (stressFactor.impact === "increase" || stressFactor.weight_percentage > 0)
      : (strVal !== undefined && strVal !== null ? strVal > 5 : false);

    const strStatus: "Mendukung" | "Perlu perhatian" = isStressElevated ? "Perlu perhatian" : "Mendukung";
    const strNote = stressFactor?.description || (isStressElevated
      ? (strVal !== undefined && strVal !== null ? `Beban stres harian (${strVal}/10) memicu aktivasi aksis HPA dan sekresi kortisol yang mengganggu metabolisme glukosa.` : "Beban stres harian memicu aktivasi aksis HPA dan sekresi kortisol yang mengganggu metabolisme glukosa.")
      : (strVal !== undefined && strVal !== null ? `Tingkat stres harian (${strVal}/10) terkendali dengan baik, menjaga stabilitas metabolik.` : "Tingkat stres harian terkendali dengan baik, menjaga stabilitas hormon kortisol dan regulasi metabolik."));

    // 7. Usia
    const ageFactor = findFactor(["age", "usia", "umur"]);
    const ageVal = healthProfile?.age;
    const isAgeRisk = ageFactor
      ? (ageFactor.impact === "increase" || ageFactor.weight_percentage > 0)
      : (ageVal !== undefined && ageVal !== null ? ageVal >= 45 : false);

    const ageStatus: "Mendukung" | "Perlu perhatian" = isAgeRisk ? "Perlu perhatian" : "Mendukung";
    const ageNote = ageFactor?.description || (isAgeRisk
      ? (ageVal !== undefined && ageVal !== null ? `Usia (${ageVal} tahun) berada pada rentang ≥45 tahun, terjadi penurunan alami kapasitas cadangan sel beta.` : "Penuaan selular seiring usia (≥45 tahun) secara bertahap menurunkan sensitivitas insulin dan massa otot rangka.")
      : (ageVal !== undefined && ageVal !== null ? `Usia (${ageVal} tahun) berada di bawah ambang klinis 45 tahun, melindungi kapasitas cadangan metabolisme.` : "Usia di bawah ambang batas klinis 45 tahun memberikan perlindungan relatif terhadap kapasitas cadangan metabolisme."));

    // 8. Gula Darah (Klinis - Ditampilkan HANYA jika data diinput oleh user)
    const bsFactor = findFactor(["blood_sugar", "gula darah", "glukosa", "glucose"]);
    const bsVal = healthProfile?.blood_sugar_mg_dl;
    const hasBsInput = typeof bsVal === "number" && !isNaN(bsVal) && bsVal > 0;
    const isBsHigh = hasBsInput
      ? (bsVal >= 100 || (bsFactor ? (bsFactor.impact === "increase" || bsFactor.weight_percentage > 0) : false))
      : false;

    const bsStatus: "Mendukung" | "Perlu perhatian" = isBsHigh ? "Perlu perhatian" : "Mendukung";
    const bsNote = bsFactor?.description || (isBsHigh
      ? (bsVal !== undefined && bsVal !== null
          ? (bsVal >= 126
              ? `Kadar gula darah (${bsVal} mg/dL) memenuhi kriteria klinis hiperglikemia (≥126 mg/dL), mengindikasikan resistensi metabolik signifikan.`
              : `Kadar gula darah (${bsVal} mg/dL) tergolong prediabetes (100–125 mg/dL), meningkatkan beban kompensasi sekresi insulin.`)
          : "Kadar gula darah berada di atas ambang normal (≥100 mg/dL), mengindikasikan gangguan toleransi glukosa.")
      : (bsVal !== undefined && bsVal !== null
          ? `Kadar gula darah (${bsVal} mg/dL) berada dalam rentang normal optimal (<100 mg/dL), regulasi insulin bekerja efektif.`
          : "Regulasi glikemik basal berada dalam batas aman dan mendukung sensitivitas insulin."));

    const factorsList = [
      {
        id: "activity",
        name: "Aktivitas Fisik",
        group: "supportive",
        prefix: "Aktivitas fisik ",
        highlight: actStatus === "Mendukung" ? "mencukupi target WHO" : "di bawah 150 menit",
        suffix: actStatus === "Mendukung" ? " 150 menit/minggu." : " per minggu.",
        status: actStatus,
        note: actNote,
        icon: Footprints,
        accentColor: "text-[#FF8A00]",
        actionIndex: 0,
      },
      {
        id: "bmi",
        name: "Komposisi Tubuh",
        group: "clinical",
        prefix: "Indeks massa tubuh ",
        highlight: bmiStatus === "Mendukung" ? "dalam rentang sehat" : "di atas ambang ideal",
        suffix: bmiStatus === "Mendukung" ? " melindungi metabolisme." : " pemicu resistensi.",
        status: bmiStatus,
        note: bmiNote,
        icon: PersonStanding,
        accentColor: "text-[#AF52DE]",
        actionIndex: 2,
      },
      ...(hasBsInput
        ? [
            {
              id: "blood_sugar",
              name: "Gula Darah",
              group: "clinical",
              prefix: "Kadar glukosa ",
              highlight: bsStatus === "Mendukung" ? "dalam batas normal" : "terindikasi elevasi klinis",
              suffix: bsStatus === "Mendukung" ? " (<100 mg/dL)." : " pemicu resistensi.",
              status: bsStatus,
              note: bsNote,
              icon: Droplet,
              accentColor: "text-[#0D9488]",
              actionIndex: 2,
            },
          ]
        : []),
      {
        id: "family",
        name: "Riwayat Penyakit Keluarga",
        group: "clinical",
        prefix: "Riwayat keluarga ",
        highlight: famStatus === "Mendukung" ? "predisposisi genetik rendah" : "tercatat riwayat diabetes",
        suffix: " lini pertama.",
        status: famStatus,
        note: famNote,
        icon: Users,
        accentColor: "text-[#10B981]",
        actionIndex: 0,
      },
      {
        id: "age",
        name: "Usia",
        group: "clinical",
        prefix: "Lintasan usia ",
        highlight: ageStatus === "Mendukung" ? "dalam rentang optimal" : "di atas ambang 45 tahun",
        suffix: ageStatus === "Mendukung" ? " melindungi kapasitas sel." : " meningkatkan beban metabolik.",
        status: ageStatus,
        note: ageNote,
        icon: Calendar,
        accentColor: "text-[#007AFF]",
        actionIndex: 0,
      },
      {
        id: "sleep",
        name: "Tidur",
        group: "supportive",
        prefix: "Durasi istirahat tidur ",
        highlight: sleepStatus === "Mendukung" ? "stabil 7–8 jam" : "kurang dari 6 jam",
        suffix: " per malam.",
        status: sleepStatus,
        note: sleepNote,
        icon: Moon,
        accentColor: "text-[#5856D6]",
        actionIndex: 1,
      },
      {
        id: "smoking",
        name: "Merokok",
        group: "supportive",
        prefix: "Status ",
        highlight: smokeStatus === "Mendukung" ? "bebas asap rokok" : "merokok aktif",
        suffix: smokeStatus === "Mendukung" ? " melindungi pembuluh." : " memicu stres endotel.",
        status: smokeStatus,
        note: smokeNote,
        icon: Wind,
        accentColor: "text-[#0891B2]",
        actionIndex: 0,
      },
      {
        id: "stress",
        name: "Tingkat Stres",
        group: "supportive",
        prefix: "Tingkat beban stres ",
        highlight: strStatus === "Mendukung" ? "terkelola dengan baik" : "memicu beban simpatis",
        suffix: strStatus === "Mendukung" ? " menjaga kestabilan glukosa." : " & sekresi kortisol.",
        status: strStatus,
        note: strNote,
        icon: Zap,
        accentColor: "text-[#FF8A00]",
        actionIndex: 1,
      },
    ];
    return factorsList;
  })();

  // Evaluasi Kandidat Fokus untuk Diabetes:
  // Berdasarkan 5 PARAMETER UTAMA yang digunakan dalam perhitungan risiko Diabetes:
  // 1. Indeks Massa Tubuh (IMT / BMI) -> Standar Kemenkes/Asia-Pasifik: Normal <23-25, Overweight >=25, Obesitas >=30
  // 2. Aktivitas Fisik -> Standar WHO: Normal >=150 mnt/mgg, Sedentari/Kurang <150 mnt/mgg (kurang gerak)
  // 3. Gula Darah -> Standar PERKENI/ADA: Normal <100 mg/dL, Prediabetes 100-125, Hiperglikemia >=126
  // 4. Riwayat Penyakit Keluarga -> Standar Genetika Klinis: Ada riwayat lini pertama (orang tua/saudara)
  // 5. Usia -> Standar Kardiometabolik: Ambang batas degeneratif sel beta >=45 tahun
  const diabetesFocusCandidates = (() => {
    if (diseaseKey !== "diabetes" || !assessment) return [];

    const topFactors = assessment.top_factors || [];

    const findFactor = (keywords: string[]) => {
      return topFactors.find((f) => {
        const feat = f.feature.toLowerCase();
        const lbl = f.label.toLowerCase();
        return keywords.some((kw) => feat.includes(kw) || lbl.includes(kw));
      });
    };

    // ── 1. Komposisi Tubuh (IMT) ──
    const bmiF = findFactor(["bmi", "massa tubuh", "berat"]);
    const bmiVal = healthProfile?.bmi ?? (healthProfile?.weight_kg && healthProfile?.height_cm ? Number((healthProfile.weight_kg / Math.pow(healthProfile.height_cm / 100, 2)).toFixed(1)) : null);
    // Standar: Abnormal/Perlu Perhatian jika BMI >= 25.0 (ambang batas overweight Asia-Pasifik / Kemenkes)
    const isBmiAbnormal = bmiVal !== null
      ? bmiVal >= 25.0
      : (bmiF ? (bmiF.impact === "increase" || bmiF.weight_percentage > 0) : false);
    // Bobot kontribusi klinis: BMI obesitas (>=30) berbobot 35, overweight (>=25) berbobot 28
    const bmiWeight = bmiF?.weight_percentage
      ? Number(bmiF.weight_percentage)
      : (bmiVal !== null ? (bmiVal >= 30.0 ? 35 : bmiVal >= 25.0 ? 28 : 0) : 0);

    // ── 2. Aktivitas Fisik ──
    const actF = findFactor(["physical_activity", "activity", "aktivitas"]);
    const actVal = healthProfile?.physical_activity_min_per_week;
    // Standar WHO: Abnormal/Kurang jika di bawah 150 menit/minggu
    const isActAbnormal = actVal !== undefined && actVal !== null
      ? actVal < 150
      : (actF ? (actF.impact === "increase" || actF.weight_percentage > 0) : false);
    // Bobot kontribusi klinis: Sedentari berat (<60 mnt) berbobot 30, kurang (<150 mnt) berbobot 25
    const actWeight = actF?.weight_percentage
      ? Number(actF.weight_percentage)
      : (actVal !== undefined && actVal !== null ? (actVal < 60 ? 30 : actVal < 150 ? 25 : 0) : 0);

    // ── 3. Gula Darah (Kondisional: Hanya jika di-input oleh user) ──
    const bsF = findFactor(["blood_sugar", "gula darah", "glukosa", "glucose"]);
    const bsVal = healthProfile?.blood_sugar_mg_dl;
    const hasBsInput = typeof bsVal === "number" && !isNaN(bsVal) && bsVal > 0;
    // Standar PERKENI/ADA: Abnormal jika >= 100 mg/dL (prediabetes 100-125, diabetes >=126)
    const isBsAbnormal = hasBsInput && (
      bsVal >= 100 || (bsF ? (bsF.impact === "increase" || bsF.weight_percentage > 0) : false)
    );
    // Bobot kontribusi klinis: Hiperglikemia (>=126) berbobot 40, Prediabetes (>=100) berbobot 32
    const bsWeight = !hasBsInput
      ? 0
      : (bsF?.weight_percentage
          ? Number(bsF.weight_percentage)
          : (bsVal >= 126 ? 40 : bsVal >= 100 ? 32 : 0));

    // ── 4. Riwayat Penyakit Keluarga ──
    const famF = findFactor(["family", "keluarga", "genetik"]);
    const hasFamRisk = healthProfile
      ? Boolean(healthProfile.family_history)
      : (famF ? (famF.impact === "increase" || famF.weight_percentage > 0) : false);
    const famWeight = famF?.weight_percentage
      ? Number(famF.weight_percentage)
      : (hasFamRisk ? 22 : 0);

    // ── 5. Usia ──
    const ageF = findFactor(["age", "usia", "umur"]);
    const ageVal = healthProfile?.age;
    // Standar Kemenkes/PERKENI: Usia >= 45 tahun merupakan kelompok risiko peningkatan intoleransi glukosa
    const isAgeAbnormal = ageVal !== undefined && ageVal !== null
      ? ageVal >= 45
      : (ageF ? (ageF.impact === "increase" || ageF.weight_percentage > 0) : false);
    const ageWeight = ageF?.weight_percentage
      ? Number(ageF.weight_percentage)
      : (ageVal !== undefined && ageVal !== null && ageVal >= 45 ? Math.min(26, 15 + (ageVal - 45) * 0.8) : 0);

    const candidates = [
      ...(hasBsInput
        ? [
            {
              id: "blood_sugar",
              title: "Gula Darah",
              group: "clinical" as const,
              groupLabel: "Faktor Klinis",
              icon: Droplet,
              accentColor: "text-[#0D9488]",
              needsAttention: Boolean(isBsAbnormal),
              weight: bsWeight,
              statusBadge: isBsAbnormal ? "Prioritas" : "Optimal",
              actionIdx: 2,
              actionCta: "Bukti Medis →",
              evidenceUrl: "/dashboard/evidence?ref=evi-02&disease=diabetes",
              whyReason: isBsAbnormal
                ? (bsVal !== undefined && bsVal !== null
                    ? (bsVal >= 126
                        ? `Kadar gula darah Anda (${bsVal} mg/dL) berada di atas ambang batas normal (≥126 mg/dL). Sebagai parameter pengukuran diabetes paling langsung, faktor ini menjadi fokus prioritas utama penanganan klinis.`
                        : `Kadar gula darah Anda (${bsVal} mg/dL) berada di atas batas normal (kategori prediabetes 100–125 mg/dL). Indikator klinis ini langsung menjadi fokus utama untuk mencegah progresivitas resistensi glukosa.`)
                    : "Kadar gula darah teridentifikasi di atas ambang batas normal, menjadi fokus utama intervensi.")
                : "Kadar gula darah berada dalam batas normal sehat (<100 mg/dL), merefleksikan sensitivitas insulin perifer yang baik.",
              clinicalImpact: isBsAbnormal
                ? "Elevasi glukosa darah menandakan kegagalan penekanan glukoneogenesis hati dan resistensi reseptor perifer yang memerlukan pemantauan ketat."
                : "Menjaga glikemia basal dalam rentang homeostasis normal dan melindungi fungsi mikrosirkulasi.",
              description:
                bsF?.description ||
                (isBsAbnormal
                  ? "Kadar gula darah di atas batas normal meningkatkan risiko klinis resistensi insulin secara langsung."
                  : "Kadar gula darah dalam rentang normal optimal mendukung stabilitas glikemik."),
            },
          ]
        : []),
      {
        id: "bmi",
        title: "Komposisi Tubuh",
        group: "clinical" as const,
        groupLabel: "Faktor Klinis",
        icon: PersonStanding,
        accentColor: "text-[#AF52DE]",
        needsAttention: Boolean(isBmiAbnormal),
        weight: bmiWeight,
        statusBadge: isBmiAbnormal ? "Prioritas" : "Optimal",
        actionIdx: 2,
        actionCta: "Bukti Medis →",
        evidenceUrl: "/dashboard/evidence?ref=evi-02&disease=diabetes",
        whyReason: isBmiAbnormal
          ? (bmiVal !== null
              ? `Indeks Massa Tubuh Anda (${bmiVal}) berada di atas batas normal standar Asia-Pasifik (≥25.0 kg/m²). Faktor ini masuk ke fokus karena adipositas viseral berlebih merupakan pendorong utama resistensi reseptor insulin.`
              : "Indeks massa tubuh Anda berada di atas ambang optimal dan menjadi pendorong utama beban resistensi metabolik.")
          : "Indeks massa tubuh berada dalam rentang sehat (18.5–24.9 kg/m²) dan melindungi fungsi metabolik jangka panjang.",
        clinicalImpact: isBmiAbnormal
          ? "Jaringan adipositas berlebih melepaskan asam lemak bebas dan sitokin inflamasi yang secara langsung memblokir kerja insulin pada reseptor sel hati dan otot."
          : "Menjaga sensitivitas reseptor insulin perifer serta mencegah kelelahan kompensasi sel beta pankreas.",
        description:
          bmiF?.description ||
          (isBmiAbnormal
            ? "Indeks massa tubuh dan lingkar pinggang berada di atas rentang optimal, meningkatkan beban resistensi insulin."
            : "Indeks massa tubuh berada dalam rentang sehat dan melindungi fungsi metabolik."),
      },
      {
        id: "activity",
        title: "Aktivitas Fisik",
        group: "supportive" as const,
        groupLabel: "Faktor Gaya Hidup",
        icon: Footprints,
        accentColor: "text-[#FF8A00]",
        needsAttention: Boolean(isActAbnormal),
        weight: actWeight,
        statusBadge: isActAbnormal ? "Prioritas" : "Optimal",
        actionIdx: 0,
        actionCta: "Bukti Medis →",
        evidenceUrl: "/dashboard/evidence?ref=evi-01&disease=diabetes",
        whyReason: isActAbnormal
          ? (actVal !== undefined && actVal !== null
              ? `Aktivitas fisik Anda (${actVal} menit/minggu) berada di bawah batas standar WHO (minimal 150 menit/minggu). Faktor ini masuk ke fokus karena kontraksi otot adalah mekanisme utama penyerapan glukosa non-insulin.`
              : "Tingkat aktivitas fisik harian Anda berada di bawah standar rekomendasi 150 menit/minggu.")
          : "Tingkat aktivitas fisik harian mencukupi standar kardioprotektif WHO (≥150 menit/minggu) dan mendukung sensitivitas insulin.",
        clinicalImpact: isActAbnormal
          ? "Kurangnya kontraksi otot secara signifikan menurunkan translokasi transporter GLUT4 pada membran sel, menyebabkan glukosa menumpuk di aliran darah."
          : "Meningkatkan klirens glukosa darah dan menurunkan resistensi metabolik perifer secara konsisten.",
        description:
          actF?.description ||
          (isActAbnormal
            ? "Tingkat aktivitas fisik harian masih di bawah rekomendasi minimal WHO 150 menit/minggu, meningkatkan risiko resistensi metabolik."
            : "Tingkat aktivitas fisik mencukupi rekomendasi kardioprotektif WHO dan mendukung regulasi glukosa."),
      },
      {
        id: "family",
        title: "Riwayat Penyakit Keluarga",
        group: "clinical" as const,
        groupLabel: "Faktor Klinis",
        icon: Users,
        accentColor: "text-[#10B981]",
        needsAttention: Boolean(hasFamRisk),
        weight: famWeight,
        statusBadge: hasFamRisk ? "Pantau" : "Rendah",
        actionIdx: 1,
        actionCta: "Bukti Medis →",
        evidenceUrl: "/dashboard/evidence?ref=evi-08&disease=diabetes",
        whyReason: hasFamRisk
          ? "Tercatat riwayat diabetes melitus pada keluarga lini pertama Anda. Faktor klinis ini masuk ke fokus karena predisposisi genetik bawaan menurunkan ambang toleransi tubuh Anda terhadap stres metabolik."
          : "Tidak ada riwayat diabetes langsung dalam keluarga, sehingga predisposisi genetik bawaan rendah.",
        clinicalImpact: hasFamRisk
          ? "Predisposisi genetik membatasi kapasitas kompensasi sekresi insulin oleh sel beta pankreas saat menerima lonjakan glukosa, menuntut disiplin preventif yang lebih ketat."
          : "Kapasitas sekresi pankreas tidak dibebani kerentanan genetik bawaan keluarga langsung.",
        description:
          famF?.description ||
          (hasFamRisk
            ? "Adanya riwayat keluarga dengan diabetes meningkatkan predisposisi genetik yang memerlukan pemantauan glukosa berkala."
            : "Tidak ada riwayat diabetes keluarga langsung yang meningkatkan predisposisi genetik."),
      },
      {
        id: "age",
        title: "Usia",
        group: "clinical" as const,
        groupLabel: "Faktor Klinis",
        icon: Calendar,
        accentColor: "text-[#007AFF]",
        needsAttention: Boolean(isAgeAbnormal),
        weight: ageWeight,
        statusBadge: isAgeAbnormal ? "Pantau" : "Optimal",
        actionIdx: 0,
        actionCta: "Bukti Medis →",
        evidenceUrl: "/dashboard/evidence?disease=diabetes",
        whyReason: isAgeAbnormal
          ? (ageVal !== undefined && ageVal !== null
              ? `Usia Anda (${ageVal} tahun) telah mencapai ambang batas degeneratif klinis (≥45 tahun). Faktor ini masuk ke fokus karena penuaan selular menurunkan massa otot rangka dan kapasitas sekresi pankreas.`
              : "Usia telah mencapai ambang batas peningkatan risiko degeneratif metabolik.")
          : "Usia kronologis Anda masih di bawah ambang klinis 45 tahun, memberikan proteksi kapasitas cadangan metabolik yang baik.",
        clinicalImpact: isAgeAbnormal
          ? "Penuaan seluler secara alami mengurangi sensitivitas reseptor insulin perifer, menuntut kompensasi lewat kebiasaan gaya hidup yang lebih konsisten."
          : "Kapasitas cadangan sekresi sel beta pankreas belum terpengaruh laju penuaan biologis yang signifikan.",
        description:
          ageF?.description ||
          (isAgeAbnormal
            ? "Faktor usia ≥45 tahun meningkatkan risiko progresivitas gangguan toleransi glukosa."
            : "Usia di bawah 45 tahun mendukung stabilitas metabolik."),
      },
    ];
    return candidates;
  })();

  const topDiabetesFocus = (() => {
    if (!diabetesFocusCandidates || diabetesFocusCandidates.length === 0) return null;
    const attentionCandidates = diabetesFocusCandidates.filter((c) => c.needsAttention);
    if (attentionCandidates.length > 0) {
      // Prioritaskan faktor yang membutuhkan perhatian dengan bobot beban risiko SHAP tertinggi
      return [...attentionCandidates].sort((a, b) => b.weight - a.weight)[0];
    }
    // Jika semua faktor optimal (tidak ada faktor yang membutuhkan perhatian khusus)
    return {
      id: "all_optimal",
      title: "Pertahankan kebiasaan sehat Anda",
      group: "supportive" as const,
      groupLabel: "Gaya Hidup & Klinis",
      icon: CheckCircle2,
      accentColor: "text-[#10B981]",
      needsAttention: false,
      weight: 0,
      statusBadge: "Optimal",
      actionIdx: 0,
      actionCta: "Bukti Medis →",
      evidenceUrl: "/dashboard/evidence?disease=diabetes",
      whyReason: "Seluruh faktor klinis dan gaya hidup Anda saat ini berada dalam rentang yang baik dan terkontrol.",
      clinicalImpact: "Tidak ada beban risiko metabolik aktif yang terdeteksi dari indikator klinis utama.",
      description: "Seluruh faktor klinis dan gaya hidup Anda saat ini berada dalam rentang yang baik dan terkontrol.",
    };
  })();

  const diseaseCardTheme = (() => {
    if (diseaseKey === "hypertension") {
      return {
        cardGradient:
          "bg-gradient-to-br from-[#FFF1F2] via-[#FFF8F8]/70 to-white border-[#E11D48]/[0.08] shadow-[0_2px_12px_rgba(225,29,72,0.02)]",
        accentText: "text-[#E11D48]",
        dotBg: "bg-[#E11D48] ring-[#E11D48]/25",
      };
    }
    if (diseaseKey === "cardiovascular") {
      return {
        cardGradient:
          "bg-gradient-to-br from-[#FFFBEB] via-[#FFFDF5]/70 to-white border-[#D97706]/[0.10] shadow-[0_2px_12px_rgba(217,119,6,0.02)]",
        accentText: "text-[#D97706]",
        dotBg: "bg-[#D97706] ring-[#D97706]/25",
      };
    }
    return {
      cardGradient:
        "bg-gradient-to-br from-[#F1F7FF] via-[#F8FBFF]/70 to-white border-[#007AFF]/[0.08] shadow-[0_2px_12px_rgba(0,122,255,0.02)]",
      accentText: "text-[#007AFF]",
      dotBg: "bg-[#007AFF] ring-[#007AFF]/25",
    };
  })();

  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full">
      {assessment.is_mock && <MockDataNotice />}

      {/* Section 1: Disease Identity */}
      <section className="border-b border-brand-900/10 pb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-normal text-[#0B1E38] break-words">
          {meta.title}
        </h1>
      </section>

      {/* Section 2 & 3: Scorecard (Kiri) & Explainable AI XAI (Kanan) Side-by-Side (50:50 ratio on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* Sisi Kiri: Estimasi Risiko (50%) */}
        <section className="space-y-4">
          {/* Estimasi Risiko Card - Semantic Disease Tint (Red: Hypertension, Amber: Cardiovascular, Blue: Diabetes) */}
          <div
            className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-7 lg:p-8 relative flex flex-col justify-between ${diseaseCardTheme.cardGradient}`}
          >
            {/* Card Header */}
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-medium text-neutral-500 tracking-normal block">
                Estimasi Risiko
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 mt-4 sm:mt-6">
              {/* Primary Hero: 1.9% with interpretation 'Rendah' directly underneath */}
              <div className="shrink-0 space-y-1">
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-[96px] xl:text-[104px] font-bold leading-none tracking-tight text-[#0B1E38] flex items-baseline">
                  <span>{pct}</span>
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-none ml-1 text-[#0B1E38]/50 tracking-tight">%</span>
                </div>
                <p
                  className={`text-base sm:text-lg lg:text-xl font-semibold tracking-normal ${diseaseCardTheme.accentText}`}
                >
                  {(() => {
                    const label = (matchedRisk.risk_label || "").toLowerCase();
                    if (label.includes("low") || matchedRisk.risk_level === "low") return "Rendah";
                    if (label.includes("mod") || matchedRisk.risk_level === "moderate") return "Sedang";
                    if (label.includes("high") || matchedRisk.risk_level === "high") return "Tinggi";
                    return matchedRisk.risk_label || "Rendah";
                  })()}
                </p>
              </div>

              {/* Minimalist Apple-style Scale / Reference Track on Right mapped to Backend Thresholds */}
              <div className="w-full sm:w-64 md:w-72 lg:w-80 space-y-2 pb-1">
                {(() => {
                  // Validated backend clinical thresholds from AssessmentService._to_risk_level:
                  // Low (Rendah):     0.00 – 0.25 (0% – 25%)   -> mapped to 0% – 33.33% of track
                  // Moderate (Sedang): 0.25 – 0.50 (25% – 50%)  -> mapped to 33.33% – 66.66% of track
                  // High (Tinggi):    0.50 – 1.00 (50% – 100%) -> mapped to 66.66% – 100% of track
                  const rawP = Number(pct);
                  let calculatedPercent = 0;

                  if (rawP <= 25) {
                    calculatedPercent = (Math.max(0, rawP) / 25) * 33.333;
                  } else if (rawP <= 50) {
                    calculatedPercent = 33.333 + ((rawP - 25) / 25) * 33.333;
                  } else {
                    calculatedPercent = 66.666 + ((Math.min(100, rawP) - 50) / 50) * 33.334;
                  }

                  // Precise dot offset ensuring the dot center aligns exactly with calculatedPercent
                  // while keeping its radius (7px) visually within the rounded track extremities.
                  return (
                    <>
                      <div className="relative py-2 flex items-center">
                        {/* Subtle unified track line */}
                        <div className="h-1 w-full rounded-full bg-neutral-200/90 relative">
                          {/* Clinical Threshold Boundary Marks at 25% (33.33%) and 50% (66.66%) */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-[33.333%] w-0.5 h-2 bg-neutral-300 rounded-full" />
                          <div className="absolute top-1/2 -translate-y-1/2 left-[66.666%] w-0.5 h-2 bg-neutral-300 rounded-full" />
                        </div>

                        {/* Clinically Anchored Marker Dot */}
                        <div
                          style={{
                            left: `calc(7px + (${calculatedPercent}% * ((100% - 14px) / 100)))`,
                          }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 flex items-center justify-center"
                        >
                          <div
                            className={`size-3.5 rounded-full border-2 border-white shadow-xs ring-1 ${diseaseCardTheme.dotBg}`}
                          />
                        </div>
                      </div>

                      {/* Clinical scale category labels perfectly centered beneath respective tiers */}
                      <div className="flex justify-between items-center text-[11px] font-medium text-neutral-400 select-none tracking-[0.012em]">
                        <span className="w-1/3 text-left">Rendah</span>
                        <span className="w-1/3 text-center">Sedang</span>
                        <span className="w-1/3 text-right">Tinggi</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Bottom-right info trigger */}
            <div className="flex justify-end mt-4 pt-1">
              <button
                type="button"
                onClick={() => setShowExplanation((prev) => !prev)}
                aria-expanded={showExplanation}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-normal text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer select-none group tracking-normal"
              >
                <Info className="size-3 sm:size-3.5 text-neutral-400/80 group-hover:text-neutral-600 transition-colors" />
                <span>Tentang estimasi</span>
              </button>
            </div>

            {/* Progressive Disclosure: Context Explanation revealed on request */}
            <AnimatePresence initial={false}>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    transition: {
                      height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.25, delay: 0.05, ease: "easeOut" },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.18, ease: "easeIn" },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-600 leading-relaxed space-y-1.5 select-text cursor-text">
                    <p className="font-medium text-[#0B1E38] tracking-normal">
                      {matchedRisk.risk_level === "high"
                        ? `Risiko ${meta.title} Anda tergolong tinggi (${pct}%). Prioritaskan penyesuaian gaya hidup dan konsultasikan dengan tenaga medis.`
                        : matchedRisk.risk_level === "moderate"
                        ? `Risiko ${meta.title} Anda tergolong sedang (${pct}%). Tindakan intervensi gaya hidup terencana disarankan.`
                        : `Risiko ${meta.title} Anda tergolong rendah (${pct}%). Pertahankan kebiasaan sehat Anda.`}
                    </p>
                    <p className="text-[11px] text-neutral-400 tracking-normal">
                      {matchedRisk.risk_level === "high"
                        ? `Estimasi ini dihitung berdasarkan profil kesehatan dan riwayat gaya hidup Anda. Berada dalam rentang risiko tinggi (>50%) pada skala ambang klinis ${meta.category.toLowerCase()}, menunjukkan perlunya evaluasi parameter terkait secara berkala.`
                        : matchedRisk.risk_level === "moderate"
                        ? `Estimasi ini dihitung berdasarkan profil kesehatan dan riwayat gaya hidup Anda. Berada dalam rentang risiko sedang (25%–50%) pada skala ambang klinis ${meta.category.toLowerCase()}, menandakan perlunya langkah preventif aktif sebelum berkembang lebih lanjut.`
                        : `Estimasi ini dihitung berdasarkan profil kesehatan dan riwayat gaya hidup Anda. Berada dalam rentang risiko rendah (0%–25%) pada skala ambang klinis ${meta.category.toLowerCase()}, yang menunjukkan stabilitas parameter kesehatan Anda saat ini.`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Sisi Kanan: Card "Fokus" Minimalis & Bersih (50%) */}
        <section className="space-y-4">
          {(() => {
            const heroFocus = (() => {
              if (diseaseKey === "diabetes") {
                return (
                  topDiabetesFocus || {
                    id: "all_optimal",
                    title: "Pertahankan kebiasaan sehat Anda",
                    icon: CheckCircle2,
                    accentColor: "text-[#10B981]",
                    needsAttention: false,
                    actionIdx: 0,
                  }
                );
              }

              // Untuk penyakit selain diabetes: cari faktor yang berstatus "Perlu perhatian" atau meningkatkan risiko dengan bobot tertinggi
              const attentionFactors = factorsToDisplay
                .filter((f) => f.status === "Perlu perhatian" || f.impact === "increase")
                .sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0));
              const attentionFactor = attentionFactors[0];

              if (attentionFactor) {
                const fName = attentionFactor.name || "Gaya Hidup";
                const fNote = attentionFactor.note;
                const actIdx = attentionFactor.actionIndex ?? 0;
                const matchedPlan = meta?.actionPlan?.[actIdx];
                const evId = matchedPlan?.evidenceId || (diseaseKey === "hypertension" ? "evi-07" : "evi-04");
                const grp = attentionFactor.group || "supportive";

                return {
                  id: attentionFactor.id || "factor",
                  title: fName,
                  group: grp,
                  groupLabel: grp === "clinical" ? "Faktor Klinis" : "Faktor Gaya Hidup",
                  icon: attentionFactor.icon || Footprints,
                  accentColor: attentionFactor.accentColor || "text-[#FF8A00]",
                  needsAttention: true,
                  actionIdx: actIdx,
                  weight: Number(attentionFactor.weight || 0),
                  evidenceUrl: `/dashboard/evidence?ref=${evId}&disease=${diseaseKey}`,
                  whyReason: `Faktor ini diidentifikasi oleh sistem sebagai pendorong risiko utama yang melampaui batas referensi sehat pada profil kesehatan Anda.`,
                  clinicalImpact: fNote || `Mempengaruhi mekanisme fisiologis dan metabolisme yang mendasari peningkatan probabilitas ${meta.title}.`,
                  description:
                    fNote ||
                    "Faktor ini berkontribusi terhadap peningkatan beban risiko dan disarankan untuk mendapatkan intervensi terarah.",
                };
              }

              // Jika seluruh data dari backend aman / optimal:
              return {
                id: "all_optimal",
                title: "Pertahankan kebiasaan sehat Anda",
                group: "supportive" as const,
                groupLabel: "Gaya Hidup & Klinis",
                icon: CheckCircle2,
                accentColor: "text-[#10B981]",
                needsAttention: false,
                actionIdx: 0,
                weight: 0,
                evidenceUrl: `/dashboard/evidence?disease=${diseaseKey}`,
                whyReason: "Seluruh indikator kesehatan Anda saat ini berada dalam kondisi optimal.",
                clinicalImpact: "Tidak ada beban risiko aktif yang memerlukan intervensi segera.",
                description: "Seluruh indikator kesehatan Anda saat ini berada dalam kondisi optimal.",
              };
            })();
            const HeroIcon = heroFocus.icon;

            return (
              <>
                <div
                  className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-7 lg:p-8 relative flex flex-col justify-between shadow-xs"
                >
                {/* Card Header matching Estimasi Risiko title position */}
                <div>
                  <h2 className="text-sm sm:text-base lg:text-lg font-medium text-neutral-500 tracking-normal block">
                    Fokus
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <HeroIcon
                      className={`size-7 sm:size-8 lg:size-9 shrink-0 pointer-events-none select-none mt-0.5 sm:mt-0 ${
                        heroFocus.needsAttention ? heroFocus.accentColor || "text-[#FF8A00]" : "text-[#10B981]"
                      }`}
                    />
                    <div className="flex flex-col sm:block min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#0B1E38] tracking-tight leading-snug break-words">
                        {heroFocus.title}
                      </h3>

                      {/* Mobile view: Perlu perhatian di bawah title */}
                      {heroFocus.needsAttention && (
                        <button
                          type="button"
                          onClick={() => setShowHeroFocusDisclosure((prev) => !prev)}
                          aria-expanded={showHeroFocusDisclosure}
                          className="sm:hidden inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-800 transition-colors mt-1.5 self-start cursor-pointer group select-none"
                        >
                          <span className="text-xs sm:text-sm font-medium tracking-normal whitespace-nowrap">
                            Perlu perhatian
                          </span>
                          <ChevronRight
                            className={`size-3.5 sm:size-4 text-neutral-400 group-hover:text-neutral-600 shrink-0 pointer-events-none select-none transition-transform duration-300 ease-out ${
                              showHeroFocusDisclosure ? "rotate-90 text-neutral-700" : "translate-y-[0.5px]"
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Desktop view (sm ke atas): Perlu perhatian di sisi kanan */}
                  {heroFocus.needsAttention && (
                    <button
                      type="button"
                      onClick={() => setShowHeroFocusDisclosure((prev) => !prev)}
                      aria-expanded={showHeroFocusDisclosure}
                      className="hidden sm:inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 transition-colors shrink-0 cursor-pointer group select-none self-center"
                    >
                      <span className="text-xs sm:text-sm lg:text-base font-medium tracking-normal whitespace-nowrap">
                        Perlu perhatian
                      </span>
                      <ChevronRight
                        className={`size-4 sm:size-4.5 text-neutral-400 group-hover:text-neutral-600 shrink-0 pointer-events-none select-none transition-transform duration-300 ease-out ${
                          showHeroFocusDisclosure ? "rotate-90 text-neutral-700" : "translate-y-[0.5px]"
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Progressive Disclosure: Penjelasan Klinis Kenapa Masuk Fokus & Perlu Perhatian */}
                <AnimatePresence initial={false}>
                  {heroFocus.needsAttention && showHeroFocusDisclosure && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.25, delay: 0.05, ease: "easeOut" },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.18, ease: "easeIn" },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-neutral-100 text-xs leading-relaxed space-y-2">
                        <p className="text-xs sm:text-[13px] text-[#0B1E38] font-normal leading-relaxed">
                          {heroFocus.whyReason || heroFocus.description}
                        </p>

                        <div>
                          <Link
                            href={heroFocus.evidenceUrl || `/dashboard/evidence?disease=${diseaseKey}`}
                            className="inline-block text-xs font-semibold text-[#007AFF] hover:underline cursor-pointer"
                          >
                            Bukti medis
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Penjelasan Umum Penentuan Fokus oleh Sistem */}
              <div className="px-1 pt-0.5 text-xs text-neutral-500 leading-relaxed font-medium">
                <p>
                  Temukan apa yang paling penting bagi Anda. Sistem menyoroti faktor yang paling berpengaruh terhadap estimasi risiko, membantu Anda memahami area yang perlu diperhatikan terlebih dahulu tanpa harus menelusuri seluruh profil kesehatan Anda.
                </p>
              </div>
            </>
          );
        })()}
        </section>
      </div>

      {/* Section: Contributing Factors Cards (Apple-inspired design) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B1E38] tracking-tight">
            Faktor yang berkontribusi
          </h3>

          <div className="inline-grid grid-cols-2 p-1 bg-neutral-100/90 rounded-full text-[11px] sm:text-xs font-medium gap-1 self-start sm:self-auto max-w-full">
            <button
              type="button"
              onClick={() => setFactorTab("clinical")}
              className={`w-18 sm:w-20 py-1 px-1.5 text-center rounded-full transition-all select-none flex items-center justify-center shrink-0 cursor-pointer ${
                factorTab === "clinical"
                  ? "bg-white text-neutral-900 font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <span className="truncate">Klinis</span>
            </button>
            <button
              type="button"
              onClick={() => setFactorTab("supportive")}
              className={`w-18 sm:w-20 py-1 px-1.5 text-center rounded-full transition-all select-none flex items-center justify-center shrink-0 cursor-pointer ${
                factorTab === "supportive"
                  ? "bg-white text-neutral-900 font-bold shadow-xs"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <span className="truncate">Gaya Hidup</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-3 sm:gap-4">
          {(diseaseKey === "diabetes"
            ? diabetesFactors.filter((f) => f.group === factorTab)
            : factorsToDisplay.filter((f) => f.group === factorTab)
          ).map((factor) => {
            const FactorIcon = factor.icon;

            return (
              <div
                key={factor.id}
                onClick={() => setSelectedModalFactor(factor)}
                className="rounded-2xl sm:rounded-3xl border border-neutral-200/80 hover:border-neutral-300 bg-white p-5 sm:p-6 relative flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-200 w-[220px] h-[220px] cursor-pointer"
              >
                {/* Top: Factor Title */}
                <div>
                  <h4 className={`text-base sm:text-lg lg:text-xl font-bold ${factor.accentColor} tracking-tight leading-snug break-words`}>
                    {factor.name}
                  </h4>
                </div>

                {/* Bottom: Icon on left and circular '+' trigger button on right */}
                <div className="flex items-end justify-between pt-2">
                  <FactorIcon
                    className={`size-12 sm:size-14 ${factor.accentColor} shrink-0 pointer-events-none select-none`}
                    strokeWidth={1.6}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModalFactor(factor);
                    }}
                    className="size-9 sm:size-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-all duration-200 cursor-pointer select-none group shrink-0"
                    aria-label={`Lihat rincian ${factor.name}`}
                  >
                    <Plus
                      className="size-5 sm:size-5.5 text-neutral-600 group-hover:text-neutral-900 transition-transform duration-200"
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Apple-style Progressive Disclosure Modal Dialog */}
        <AnimatePresence>
          {selectedModalFactor && (() => {
            const isSupportive = selectedModalFactor.status === "Mendukung";
            const details = getFactorModalDetails(
              selectedModalFactor.name,
              isSupportive,
              selectedModalFactor.note,
              diseaseKey
            );

            return (
              <motion.div
                key="apple-factor-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
                onClick={() => setSelectedModalFactor(null)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="apple-factor-modal-title"
              >
                <motion.div
                  key="apple-factor-modal-card"
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-[24px] sm:rounded-[32px] lg:rounded-[36px] shadow-2xl max-w-lg sm:max-w-xl lg:max-w-2xl w-full p-5 sm:p-8 md:p-10 lg:p-12 relative border border-neutral-100 overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top-Right Circular Close Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedModalFactor(null)}
                    aria-label="Tutup rincian"
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 size-8 sm:size-9 lg:size-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer select-none"
                  >
                    <X className="size-4 sm:size-5" />
                  </button>

                  {/* Factor Title */}
                  <h3
                    id="apple-factor-modal-title"
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0B1E38] tracking-tight leading-tight pr-10 mb-4 sm:mb-6 md:mb-8 break-words"
                  >
                    {selectedModalFactor.name}
                  </h3>

                  {/* Body Content - Apple Format */}
                  <div className="space-y-6 sm:space-y-8 text-[#0B1E38]">
                    {/* 3. Why it matters */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
                        Mengapa ini berpengaruh?
                      </h4>
                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                        {details.whyItMatters}
                      </p>
                    </div>

                    {/* 4. Personal meaning */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
                        Dalam estimasi Anda
                      </h4>
                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                        {details.personalMeaning}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      {/* Section: Untuk Anda (Pahami Sekarang) */}
      <section className="space-y-6 pt-2">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B1E38] tracking-tight">
            Pahami Sekarang
          </h3>
          <p className="text-base sm:text-lg font-medium text-neutral-600 leading-relaxed max-w-2xl">
            Ketahui apa yang memengaruhi risiko Anda. Jelajahi apa yang bisa berubah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full">
          {/* Card 1: Proyeksi */}
          <div
            role="link"
            tabIndex={0}
            onClick={() => {
              const selection = window.getSelection();
              if (selection && selection.toString().trim().length > 0) return;
              router.push("/dashboard/simulation/future");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/dashboard/simulation/future");
              }
            }}
            className="group grid grid-cols-2 items-center gap-3.5 sm:gap-4.5 rounded-2xl sm:rounded-3xl border border-[#E0F2E2] hover:border-[#CDEACC] bg-[#F4FBF4] p-3.5 sm:p-4.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 cursor-pointer select-text"
          >
            <div className="relative w-full aspect-[626/518] rounded-xl overflow-hidden flex items-center justify-center select-none pointer-events-none">
              <Image
                src="/images/panel-health-projection.avif"
                alt="Ilustrasi Proyeksi"
                width={626}
                height={518}
                className="w-full h-auto object-contain select-none pointer-events-none"
                priority
                draggable={false}
              />
            </div>

            <div className="flex flex-col justify-center min-w-0 py-0.5 select-text">
              <div className="select-text">
                <h4 className="text-sm sm:text-base font-bold text-[#0B1E38] leading-snug select-text cursor-text">
                  Lihat Proyeksi
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 sm:mt-1.5 leading-relaxed select-text cursor-text">
                  Estimasi risiko kesehatan di masa depan.
                </p>
              </div>

              <div className="mt-2.5 sm:mt-3 flex items-center">
                <span className="inline-flex items-end gap-1 text-xs sm:text-sm font-semibold text-[#15803D] group-hover:underline select-text">
                  <span className="select-text cursor-text">Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 pointer-events-none select-none" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Simulasi */}
          <div
            role="link"
            tabIndex={0}
            onClick={() => {
              const selection = window.getSelection();
              if (selection && selection.toString().trim().length > 0) return;
              router.push(`/dashboard/simulation/what-if?disease=${diseaseKey}`);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push(`/dashboard/simulation/what-if?disease=${diseaseKey}`);
              }
            }}
            className="group grid grid-cols-2 items-center gap-3.5 sm:gap-4.5 rounded-2xl sm:rounded-3xl border border-[#DCE8FC] hover:border-[#C7DCFB] bg-[#F0F6FE] p-3.5 sm:p-4.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer select-text"
          >
            <div className="relative w-full aspect-[626/518] rounded-xl overflow-hidden flex items-center justify-center select-none pointer-events-none">
              <Image
                src="/images/panel-what-if-simulation.avif"
                alt="Ilustrasi Simulasi"
                width={626}
                height={518}
                className="w-full h-auto object-contain select-none pointer-events-none"
                priority
                draggable={false}
              />
            </div>

            <div className="flex flex-col justify-center min-w-0 py-0.5 select-text">
              <div className="select-text">
                <h4 className="text-sm sm:text-base font-bold text-[#0B1E38] leading-snug select-text cursor-text">
                  Coba Simulasi
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 sm:mt-1.5 leading-relaxed select-text cursor-text">
                  Dampak perubahan gaya hidup pada risiko.
                </p>
              </div>

              <div className="mt-2.5 sm:mt-3 flex items-center">
                <span className="inline-flex items-end gap-1 text-xs sm:text-sm font-semibold text-[#2563EB] group-hover:underline select-text">
                  <span className="select-text cursor-text">Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 pointer-events-none select-none" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Tindakan */}
          <div
            role="link"
            tabIndex={0}
            onClick={() => {
              const selection = window.getSelection();
              if (selection && selection.toString().trim().length > 0) return;
              router.push("/dashboard/recommendations");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/dashboard/recommendations");
              }
            }}
            className="group grid grid-cols-2 items-center gap-3.5 sm:gap-4.5 rounded-2xl sm:rounded-3xl border border-[#EBE2FC] hover:border-[#DDD0FB] bg-[#F5F0FE] p-3.5 sm:p-4.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 cursor-pointer select-text"
          >
            <div className="relative w-full aspect-[626/518] rounded-xl overflow-hidden flex items-center justify-center select-none pointer-events-none">
              <Image
                src="/images/panel-preventive-steps.avif"
                alt="Ilustrasi Tindakan"
                width={626}
                height={518}
                className="w-full h-auto object-contain select-none pointer-events-none"
                priority
                draggable={false}
              />
            </div>

            <div className="flex flex-col justify-center min-w-0 py-0.5 select-text">
              <div className="select-text">
                <h4 className="text-sm sm:text-base font-bold text-[#0B1E38] leading-snug select-text cursor-text">
                  Ambil Tindakan
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 sm:mt-1.5 leading-relaxed select-text cursor-text">
                  Saran preventif sesuai profil kesehatan.
                </p>
              </div>

              <div className="mt-2.5 sm:mt-3 flex items-center">
                <span className="inline-flex items-end gap-1 text-xs sm:text-sm font-semibold text-[#7C3AED] group-hover:underline select-text">
                  <span className="select-text cursor-text">Selengkapnya</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 pointer-events-none select-none" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Dasar Ilmiah */}
      <section className="space-y-6 pt-2">
        <div className="space-y-1.5 sm:space-y-2">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0B1E38] tracking-tight">
            Dasar Ilmiah
          </h3>
          <p className="text-base sm:text-lg font-medium text-neutral-600 leading-relaxed max-w-3xl">
            Referensi ilmiah tepercaya yang mendukung insight dan rekomendasi Heliora, membantu Anda memahami dasar di balik setiap saran kesehatan yang diberikan.
          </p>
        </div>

        {/* List Referensi Ilmiah — Editorial Format (Tanpa Border) */}
        <div className="space-y-2 sm:space-y-3 select-text">
          {(DISEASE_SCIENTIFIC_REFERENCES[diseaseKey] || DISEASE_SCIENTIFIC_REFERENCES.diabetes).map((item) => (
            <div
              key={item.id}
              className="py-4 sm:py-5 flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-6 group transition-colors hover:bg-neutral-50/70 px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-2xl select-text"
            >
              {/* Meta: Organisasi & Tahun di sisi kiri */}
              <div className="shrink-0 md:w-52 select-text">
                <span className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight select-text">
                  {item.organization} ({item.year})
                </span>
              </div>

              {/* Main Content: Judul & Cakupan Relevansi */}
              <div className="flex-1 min-w-0 space-y-1.5 select-text">
                <h4 className="text-base sm:text-lg font-bold text-[#0B1E38] tracking-tight leading-snug select-text cursor-text">
                  {item.title}
                </h4>
                <p className="text-sm text-neutral-600 leading-relaxed select-text cursor-text">
                  {item.scope}
                </p>
              </div>

              {/* Ujung Kanan: Badge & Link ke Evidence Center */}
              <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-start gap-2 sm:gap-2.5 pt-2 md:pt-0.5 select-text">
                <span className="text-[11px] font-medium text-neutral-500 whitespace-nowrap select-text">
                  {item.badge}
                </span>

                <Link
                  href={item.url}
                  className="inline-flex items-end gap-1 text-xs sm:text-sm font-semibold text-[#0B1E38] group-hover:text-[#15803D] transition-colors select-text"
                >
                  <span className="select-text cursor-pointer">Lihat Dokumen</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 pointer-events-none select-none" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="pt-10 sm:pt-14 pb-6 text-center select-text">
        <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-3xl mx-auto select-text cursor-text font-normal">
          HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.
        </p>
      </footer>
    </main>
  );
}
