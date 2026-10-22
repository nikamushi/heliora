"use client";

import {
  Suspense,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  X,
} from "lucide-react";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { RecommendationItem } from "@/types/api";
import { MockDataNotice } from "@/components/mock-data-notice";
import {
  getEvidenceByRuleId,
  getEvidenceStrengthLabel,
} from "@/lib/evidence-database";

// ── Medical Disclaimer Copy (Single Source of Truth) ────────────────────────

export const MEDICAL_DISCLAIMER = {
  full: "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.",
} as const;

// ── Types ───────────────────────────────────────────────────────────────────

export type RecommendationCategory =
  | "all"
  | "consultation"
  | "activity"
  | "sleep"
  | "weight"
  | "smoking"
  | "stress";

export type PriorityLevel = "high" | "medium" | "low" | "protective";

export interface EnrichedRecommendation {
  id: string;
  rule_id: string;
  rank: number;
  actionTitle: string;
  techniqueDetail?: string;
  category: RecommendationCategory;
  categoryLabel: string;
  priority: PriorityLevel;
  isHighPriority: boolean;
  plainAction: string;
  personalReason: string | null;
  plainRationale: string;
  scientificDetail: string;
  evidenceStrength: "Kuat" | "Sedang" | "Terbatas";
  evidenceStrengthLabel: string;
  shortOrg: string;
  publication: string;
  year: number;
  evidenceSlug?: string;
  isSafetyCard?: boolean;
}

// ── Category Eyebrows (Sentence case, Minimal, Apple Health HIG) ────────────

const CATEGORY_LABELS: Record<Exclude<RecommendationCategory, "all">, string> = {
  consultation: "Konsultasi medis",
  activity: "Aktivitas fisik",
  sleep: "Pola tidur",
  weight: "Berat badan",
  smoking: "Kebiasaan merokok",
  stress: "Manajemen stres",
};

// ── Plain Action & Clinical Narrative Catalog ───────────────────────────────

interface ActionNarrative {
  actionTitle: string;
  techniqueDetail?: string;
  plainAction: string;
  plainRationale: string;
  scientificDetail: string;
}

const ACTION_NARRATIVES: Record<string, ActionNarrative> = {
  "REC-ACT-01": {
    actionTitle: "Jalan cepat 30 menit sehari",
    techniqueDetail:
      "Pilih jalan kaki cepat dengan ritme teratur hingga napas terasa sedikit lebih dalam namun tetap bisa berbicara.",
    plainAction:
      "Jalan santai atau aktivitas aerobik ringan minimal 30 menit sehari untuk melancarkan sirkulasi.",
    plainRationale:
      "Aktivitas fisik teratur membantu otot menggunakan glukosa dengan lebih efisien dan meringankan kerja jantung.",
    scientificDetail:
      "Gerak aktif teratur membantu sel otot menyerap gula darah secara alami dan melancarkan aliran darah di seluruh tubuh.",
  },
  "REC-SLP-01": {
    actionTitle: "Tidur 7–9 jam per malam",
    techniqueDetail:
      "Redupkan lampu kamar dan letakkan gawai di luar jangkauan tempat tidur 30 menit sebelum tidur.",
    plainAction:
      "Jaga jadwal istirahat yang teratur dan kurangi paparan layar gawai sebelum tidur.",
    plainRationale:
      "Tidur yang cukup memberi waktu bagi pembuluh darah dan organ tubuh untuk memulihkan diri dari beban harian.",
    scientificDetail:
      "Tidur yang cukup membantu tekanan darah turun secara alami di malam hari dan menyeimbangkan hormon nafsu makan.",
  },
  "REC-NUT-01": {
    actionTitle: "Atur porsi makan dan tambah serat",
    techniqueDetail:
      "Isi setengah piring dengan sayuran dan buah, batasi porsi karbohidrat sederhana ke seperempat piring.",
    plainAction:
      "Kurangi makanan manis olahan dan perbanyak porsi sayur atau buah dalam menu harian.",
    plainRationale:
      "Makanan tinggi serat membantu rasa kenyang bertahan lebih lama dan mencegah lonjakan gula darah mendadak.",
    scientificDetail:
      "Serat pangan mengikat kelebihan kolesterol di saluran cerna dan membantu pelepasan gula ke aliran darah berlangsung bertahap.",
  },
  "REC-SMK-01": {
    actionTitle: "Kurangi rokok hingga berhenti total",
    techniqueDetail:
      "Tunda waktu rokok pertama di pagi hari dan ganti dengan minum air putih atau aktivitas pengalih.",
    plainAction:
      "Kurangi jumlah rokok per hari secara bertahap atau manfaatkan layanan pendampingan berhenti merokok.",
    plainRationale:
      "Mengurangi rokok dapat langsung meringankan beban dinding pembuluh darah dan mencegah penggumpalan darah.",
    scientificDetail:
      "Penghentian paparan asap rokok membantu memulihkan kelenturan dinding pembuluh darah dan mengurangi risiko sumbatan pembuluh jantung.",
  },
  "REC-STR-01": {
    actionTitle: "Latihan napas 10 menit sehari",
    techniqueDetail:
      "Tarik napas 4 hitungan, tahan 7, hembuskan 8. Mulai dengan 4 putaran, lalu lanjutkan dengan napas perlahan biasa hingga 10\u00A0menit. Jika terasa pusing, kembali bernapas normal.",
    plainAction:
      "Napas perlahan dengan teknik 4–7–8 untuk membantu menenangkan pikiran.",
    plainRationale:
      "Napas lambat dan teratur membantu menurunkan ketegangan fisik, memperlambat denyut jantung, dan menjaga ketenangan.",
    scientificDetail:
      "Latihan napas ritmik membantu merangsang saraf vagus (bagian saraf yang menenangkan tubuh), meredakan respons stres tubuh, dan menjaga ritme denyut jantung tetap teratur.",
  },
  "REC-GEN-01": {
    actionTitle: "Pertahankan kebiasaan sehat harian",
    techniqueDetail:
      "Lanjutkan rutinitas jalan kaki harian dan pola makan seimbang yang sudah berjalan.",
    plainAction:
      "Pertahankan aktivitas fisik rutin dan jadwal tidur yang sudah teratur.",
    plainRationale:
      "Konsistensi kebiasaan sehat adalah kunci perlindungan kardiometabolik jangka panjang.",
    scientificDetail:
      "Kontinuitas gaya hidup seimbang menjaga metabolisme tetap stabil dan melindungi kelenturan pembuluh darah.",
  },
  "REC-SAFETY-01": {
    actionTitle: "Konsultasi dengan dokter",
    techniqueDetail:
      "Bawa hasil estimasi risiko ini saat berkonsultasi dengan dokter untuk pemeriksaan fisik dan laboratorium penunjang.",
    plainAction:
      "Jadwalkan konsultasi dengan dokter untuk evaluasi kondisi kardiometabolik dan pemeriksaan penunjang secara langsung.",
    plainRationale:
      "Konsultasi langsung membantu memastikan kondisi kesehatanmu melalui pemeriksaan fisik dan laboratorium klinis secara objektif.",
    scientificDetail:
      "Pemeriksaan medis oleh dokter memastikan evaluasi menyeluruh terhadap tekanan darah, profil gula, dan profil lipid sebelum intervensi mandiri.",
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Component ───────────────────────────────────────────────────────────────

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const factorParam = searchParams.get("factor");

  const prefersReducedMotion = useReducedMotion();
  const { isAuthorized, isLoading, error, assessment, refetch } =
    useLatestAssessment();

  const [activeCategory, setActiveCategory] =
    useState<RecommendationCategory>("all");
  const [selectedModalRec, setSelectedModalRec] =
    useState<EnrichedRecommendation | null>(null);
  const [highlightedRecId, setHighlightedRecId] = useState<string | null>(null);
  const [isScientificOpen, setIsScientificOpen] = useState(false);
  const [lastTriggerId, setLastTriggerId] = useState<string | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleCloseModal = useCallback(() => {
    setSelectedModalRec(null);
    if (lastTriggerId) {
      const el = document.getElementById(lastTriggerId);
      if (el) {
        el.focus();
      }
    }
  }, [lastTriggerId]);

  const handleOpenModal = useCallback(
    (rec: EnrichedRecommendation, elementId: string) => {
      setIsScientificOpen(false);
      setLastTriggerId(elementId);
      setSelectedModalRec(rec);
    },
    []
  );

  // Autofocus close button when sheet opens
  useEffect(() => {
    if (selectedModalRec) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedModalRec]);

  // Keyboard navigation: Escape key & Focus Trap
  useEffect(() => {
    if (!selectedModalRec) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCloseModal();
        return;
      }

      if (e.key === "Tab" && modalContainerRef.current) {
        const focusableElements =
          modalContainerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModalRec, handleCloseModal]);

  // Enrich recommendations directly from verified Knowledge Base (BR-EVIDENCE-004)
  const enrichedRecommendations: EnrichedRecommendation[] = useMemo(() => {
    if (!assessment) return [];

    const list: EnrichedRecommendation[] = [];

    // 1. Safety Guardrail Check (BR-SAFETY-001, PRD 20.11)
    const highRiskConditions = (assessment.risks || [])
      .filter((r) => r.risk_level === "high" || (r.probability ?? 0) >= 0.6)
      .map((r) => r.label || r.condition);

    if (highRiskConditions.length > 0) {
      const conditionNames = highRiskConditions.join(" & ");
      const kbSafety = getEvidenceByRuleId("REC-SAFETY-01");
      const safetyNarrative = ACTION_NARRATIVES["REC-SAFETY-01"];

      list.push({
        id: "rec-safety-consultation",
        rule_id: "REC-SAFETY-01",
        rank: 1,
        actionTitle: safetyNarrative.actionTitle,
        techniqueDetail: safetyNarrative.techniqueDetail,
        category: "consultation",
        categoryLabel: CATEGORY_LABELS.consultation,
        priority: "high",
        isHighPriority: true,
        plainAction: safetyNarrative.plainAction,
        personalReason: `Estimasi risiko ${conditionNames} berada pada level yang perlu diperhatikan.`,
        plainRationale: safetyNarrative.plainRationale,
        scientificDetail: safetyNarrative.scientificDetail,
        evidenceStrength: "Kuat",
        evidenceStrengthLabel: "Bukti kuat",
        shortOrg: kbSafety?.shortOrg || "Kemenkes RI",
        publication: kbSafety?.publication || "Direktorat P2PTM Kemenkes RI, 2022",
        year: kbSafety?.year || 2022,
        isSafetyCard: true,
      });
    }

    // Map factors to extract personal reasons
    const factorMap = new Map<string, string>();
    if (assessment.top_factors) {
      for (const f of assessment.top_factors) {
        if (f.feature) {
          factorMap.set(f.feature.toLowerCase(), f.description);
        }
      }
    }

    // 2. Process clinical rule recommendations
    const rawRecs: RecommendationItem[] = assessment.recommendations || [];

    rawRecs.forEach((rec) => {
      const ruleId =
        rec.rule_id ||
        (rec.id.startsWith("REC-")
          ? rec.id
          : `REC-${rec.category.toUpperCase().slice(0, 3)}-01`);

      // Determine category taxonomy
      let category: RecommendationCategory = "activity";
      const ruleUpper = ruleId.toUpperCase();
      const titleLower = rec.title.toLowerCase();

      if (
        ruleUpper.includes("SMK") ||
        titleLower.includes("merokok") ||
        titleLower.includes("rokok")
      ) {
        category = "smoking";
      } else if (
        ruleUpper.includes("SLP") ||
        rec.category === "sleep" ||
        titleLower.includes("tidur")
      ) {
        category = "sleep";
      } else if (
        ruleUpper.includes("NUT") ||
        rec.category === "nutrition" ||
        titleLower.includes("berat") ||
        titleLower.includes("makan") ||
        titleLower.includes("diet")
      ) {
        category = "weight";
      } else if (
        ruleUpper.includes("STR") ||
        rec.category === "stress" ||
        titleLower.includes("stres") ||
        titleLower.includes("relaksasi")
      ) {
        category = "stress";
      } else {
        category = "activity";
      }

      const categoryLabel = CATEGORY_LABELS[category] || "Aktivitas fisik";
      const narrative = ACTION_NARRATIVES[ruleId] || {
        actionTitle: rec.title,
        plainAction: rec.action,
        plainRationale:
          "Langkah ini membantu menjaga metabolisme tubuh dan melindungi fungsi kardiovaskular secara bertahap.",
        scientificDetail:
          "Perubahan gaya hidup yang konsisten membantu memulihkan keseimbangan alami tubuh dan menekan faktor risiko kardiovaskular.",
      };

      // Retrieve metadata directly from verified Knowledge Base record (BR-EVIDENCE-004)
      const kbEvidence = getEvidenceByRuleId(ruleId);

      const priority: PriorityLevel =
        (rec.priority as PriorityLevel) || "medium";
      const isHighPriority = priority === "high";

      // Determine concise personal reason based on factors (no "Karena:" prefix)
      let personalReason: string | null = null;
      if (category === "activity") {
        personalReason =
          factorMap.get("physical_activity") ||
          "Aktivitas fisik mingguanmu saat ini di bawah anjuran 150 menit/minggu.";
      } else if (category === "sleep") {
        personalReason =
          factorMap.get("sleep_duration") ||
          "Durasi tidurmu rata-rata masih di bawah target 7–9 jam per malam.";
      } else if (category === "weight") {
        personalReason =
          factorMap.get("bmi") ||
          "Indeks Massa Tubuh (BMI) berada di atas rentang sehat.";
      } else if (category === "smoking") {
        personalReason =
          factorMap.get("smoking_status") ||
          "Kebiasaan merokok aktif menjadi pemicu utama beban pembuluh darah.";
      } else if (category === "stress") {
        personalReason =
          factorMap.get("stress_level") ||
          "Stres harian yang kamu laporkan tergolong tinggi.";
      }

      const shortOrg =
        kbEvidence?.shortOrg ||
        rec.source.split("—")[0].trim().split(" ")[0] ||
        "AHA";
      const publication =
        kbEvidence?.publication ||
        `${shortOrg}, ${kbEvidence?.year || 2021}`;
      const year = kbEvidence?.year || 2021;
      const strength: "Kuat" | "Sedang" | "Terbatas" = kbEvidence
        ? getEvidenceStrengthLabel(kbEvidence.evidence_level)
        : "Sedang";
      const evidenceStrengthLabel =
        strength === "Kuat"
          ? "Bukti kuat"
          : strength === "Sedang"
          ? "Bukti sedang"
          : "Bukti terbatas";

      list.push({
        id: rec.id || ruleId,
        rule_id: ruleId,
        rank: list.length + 1,
        actionTitle: narrative.actionTitle,
        techniqueDetail: narrative.techniqueDetail,
        category,
        categoryLabel,
        priority,
        isHighPriority,
        plainAction: narrative.plainAction,
        personalReason,
        plainRationale: narrative.plainRationale,
        scientificDetail: narrative.scientificDetail,
        evidenceStrength: strength,
        evidenceStrengthLabel,
        shortOrg,
        publication,
        year,
        evidenceSlug: kbEvidence?.slug,
      });
    });

    // Re-rank items consecutively and cap at 5 (AC-REC-02)
    return list.slice(0, 5).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [assessment]);

  // Compute category counts for chips
  const categoryCounts = useMemo(() => {
    const counts: Record<RecommendationCategory, number> = {
      all: enrichedRecommendations.length,
      consultation: 0,
      activity: 0,
      sleep: 0,
      weight: 0,
      smoking: 0,
      stress: 0,
    };

    enrichedRecommendations.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });

    return counts;
  }, [enrichedRecommendations]);

  // Available filter options (only show categories that have items > 0)
  const availableFilterOptions = useMemo(() => {
    const options: {
      id: RecommendationCategory;
      label: string;
      count: number;
    }[] = [{ id: "all", label: "Semua", count: categoryCounts.all }];

    const order: Exclude<RecommendationCategory, "all">[] = [
      "consultation",
      "activity",
      "sleep",
      "weight",
      "smoking",
      "stress",
    ];

    order.forEach((catId) => {
      const count = categoryCounts[catId];
      if (count > 0) {
        options.push({
          id: catId,
          label: CATEGORY_LABELS[catId] || catId,
          count,
        });
      }
    });

    return options;
  }, [categoryCounts]);

  // Filter recommendations based on active chip
  const filteredRecommendations = useMemo(() => {
    if (activeCategory === "all") return enrichedRecommendations;
    return enrichedRecommendations.filter((r) => r.category === activeCategory);
  }, [enrichedRecommendations, activeCategory]);

  // Handle deep-link scrolling for ?ref= or ?factor=
  useEffect(() => {
    if (!enrichedRecommendations.length) return;

    let targetId: string | null = null;

    if (refParam) {
      const matched = enrichedRecommendations.find(
        (r) =>
          r.id.toLowerCase() === refParam.toLowerCase() ||
          r.rule_id.toLowerCase() === refParam.toLowerCase()
      );
      if (matched) {
        targetId = matched.id;
      }
    } else if (factorParam) {
      let mappedCat: RecommendationCategory = "activity";
      if (factorParam.includes("sleep")) mappedCat = "sleep";
      else if (factorParam.includes("bmi") || factorParam.includes("weight"))
        mappedCat = "weight";
      else if (factorParam.includes("smoke")) mappedCat = "smoking";
      else if (factorParam.includes("stress")) mappedCat = "stress";

      const matched = enrichedRecommendations.find(
        (r) => r.category === mappedCat
      );
      if (matched) {
        targetId = matched.id;
      }
    }

    if (targetId) {
      const target = targetId;
      const highlightTimer = setTimeout(() => {
        setHighlightedRecId(target);
        const el = document.getElementById(`rec-${target}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 50);

      const clearTimer = setTimeout(() => {
        setHighlightedRecId(null);
      }, 3500);

      return () => {
        clearTimeout(highlightTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [refParam, factorParam, enrichedRecommendations]);

  // ── Render States ─────────────────────────────────────────────────────────

  // 1. Loading Skeleton State
  if (!isAuthorized || isLoading) {
    return (
      <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full">
        {/* Header Skeleton */}
        <section className="border-b border-neutral-200/80 pb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div className="space-y-2">
              <div className="h-10 sm:h-12 w-64 sm:w-80 bg-neutral-200/70 rounded-2xl animate-pulse" />
              <div className="h-4 w-72 bg-neutral-100 rounded-lg animate-pulse" />
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
              <div className="h-8 w-36 bg-neutral-100 rounded-lg animate-pulse" />
              <div className="h-3 w-28 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        </section>

        <div className="max-w-[720px] space-y-3.5 pt-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/70 space-y-3"
            >
              <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
              <div className="h-5 w-2/3 bg-neutral-200/70 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // 2. Error / Incomplete State
  if (error || !assessment) {
    const isConsentRevoked =
      error?.status === 403 ||
      error?.message?.toLowerCase().includes("active consent");
    const isProfileMissing = error?.kind === "not_found";

    return (
      <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-12 space-y-6 w-full flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md text-center space-y-4 p-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-600 flex items-center justify-center mx-auto">
            {isConsentRevoked ? (
              <ShieldAlert className="size-6 text-amber-700" strokeWidth={1.8} />
            ) : isProfileMissing ? (
              <Info className="size-6 text-neutral-700" strokeWidth={1.8} />
            ) : (
              <ShieldAlert className="size-6 text-rose-600" strokeWidth={1.8} />
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1E38]">
              {isConsentRevoked
                ? "Persetujuan Pengolahan Data Ditarik"
                : isProfileMissing
                ? "Belum Ada Rekomendasi"
                : "Gagal Memuat Rekomendasi"}
            </h1>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
              {isConsentRevoked
                ? "Pemrosesan rekomendasi preventif dihentikan. Berikan persetujuan kembali untuk melihat rekomendasi tindakan klinis personal Anda."
                : isProfileMissing
                ? "Lengkapi asesmen kesehatan awal untuk menghasilkan rekomendasi tindakan preventif yang disesuaikan."
                : "Terjadi gangguan saat mengambil data. Silakan coba muat ulang."}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            {isConsentRevoked ? (
              <Link
                href="/onboarding/consent"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <span>Berikan Persetujuan</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ) : isProfileMissing ? (
              <Link
                href="/onboarding/health-profile"
                className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-900 transition-colors"
              >
                <span>Mulai Asesmen Kesehatan</span>
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B1E38] text-white text-xs font-semibold hover:bg-[#16335a] transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="size-3.5" />
                <span>Coba Lagi</span>
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full select-text">
      {/* Mock Data Notice */}
      {assessment.is_mock && <MockDataNotice />}

      {/* ── Section 1: Page Header ──────────────────────────────────── */}
      <section className="border-b border-neutral-200/80 pb-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1E38] break-words">
              Tindakan Preventif
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed text-pretty">
              Langkah yang paling relevan untuk kondisimu.
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

      <div className="max-w-[720px] space-y-6 sm:space-y-8">
        {/* ── Section: Rincian Komponen Gaya Hidup (AC-SCORE-02) ──────── */}
        <section
          aria-labelledby="lifestyle-breakdown-heading"
          className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-neutral-100 pb-3">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                Rincian Lifestyle Score
              </span>
              <h2 id="lifestyle-breakdown-heading" className="text-base font-bold text-[#0B1E38] mt-0.5">
                Komposisi Skor Kebiasaan Harian
              </h2>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#0B1E38]">
                {Math.round(assessment.lifestyle_score)}
              </span>
              <span className="text-xs font-mono text-neutral-500">/ 100</span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Lifestyle Score dihitung berdasarkan 3 pilar kebiasaan harian yang dapat dimodifikasi secara mandiri sesuai pedoman kesehatan (AC-SCORE-02):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">Aktivitas Fisik</span>
                <span className="text-[10px] font-mono font-semibold text-neutral-500">Bobot 35%</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                WHO standard ≥ 150 menit/minggu untuk kesehatan kardiovaskular.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">Durasi Tidur</span>
                <span className="text-[10px] font-mono font-semibold text-neutral-500">Bobot 35%</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Rentang pemulihan optimal 7–9 jam/hari sesuai acuan Kemenkes/CDC.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900">Bebas Rokok</span>
                <span className="text-[10px] font-mono font-semibold text-neutral-500">Bobot 30%</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Bebas paparan tembakau aktif untuk meminimalkan beban vaskular.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2: Filter Chips (Only if categories > 1) ─────────── */}
        {availableFilterOptions.length > 2 && (
          <section
            aria-label="Filter kategori rekomendasi"
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
          >
            {availableFilterOptions.map((opt) => {
              const isSelected = activeCategory === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveCategory(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer shrink-0 select-none ${
                    isSelected
                      ? "bg-[#0B1E38] text-white shadow-xs"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 hover:text-neutral-900"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </section>
        )}

        {/* ── Section 3: Recommendations List ─────────────────────────── */}
        <section className="space-y-3.5">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => {
              const isTargeted = highlightedRecId === rec.id;

              return (
                <article
                  id={`rec-${rec.id}`}
                  key={rec.id}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="dialog"
                  aria-label={`Buka rincian: ${rec.actionTitle}`}
                  onClick={() => handleOpenModal(rec, `rec-${rec.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenModal(rec, `rec-${rec.id}`);
                    }
                  }}
                  className={`group text-left rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 transition-all duration-150 cursor-pointer outline-none hover:border-neutral-300 hover:shadow-xs hover:bg-neutral-50/30 active:scale-[0.99] active:bg-neutral-100/60 flex items-center justify-between gap-4 ${
                    isTargeted
                      ? "ring-2 ring-brand-700/60 border-brand-700 bg-brand-50/10"
                      : "focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Eyebrow & Optional Priority */}
                    <div className="flex items-center justify-between gap-3 pb-0.5">
                      <span className="text-xs font-medium text-neutral-500">
                        {rec.categoryLabel}
                      </span>

                      {/* Show priority text ONLY if there are multiple items and it's high priority */}
                      {enrichedRecommendations.length > 1 && rec.isHighPriority && (
                        <span className="text-xs font-semibold text-rose-700">
                          Prioritas tinggi
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#0B1E38] leading-snug text-pretty">
                      {rec.actionTitle}
                    </h2>

                    {/* Action Description */}
                    <p className="text-sm text-neutral-800 leading-relaxed font-normal pt-0.5 text-pretty">
                      {rec.plainAction}
                    </p>

                    {/* Personal Reason Line (Subtly distinct: 13px text-neutral-600) */}
                    {rec.personalReason && (
                      <p className="text-[13px] text-neutral-600 font-normal leading-relaxed pt-0.5 text-pretty">
                        {rec.personalReason}
                      </p>
                    )}

                    {/* Source Authority & "Kenapa saran ini?" Prompt */}
                    <div className="pt-2.5 flex items-center justify-between border-t border-neutral-100 text-xs text-neutral-500">
                      <span className="font-normal truncate">
                        {rec.shortOrg} · {rec.publication}
                      </span>
                      <span className="text-brand-700 font-semibold inline-flex items-center gap-1 shrink-0 group-hover:text-brand-900 group-hover:translate-x-0.5 transition-all">
                        <span>Kenapa saran ini?</span>
                        <ChevronRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            /* Empty State for Empty Category */
            <div className="py-12 px-6 text-center space-y-3">
              <div className="size-10 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                <Info className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#0B1E38]">
                  Belum ada rekomendasi di kategori ini
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
                  Area ini belum menjadi prioritas tindakan berdasarkan data
                  terakhirmu.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className="px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tampilkan Semua Kategori
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── Section 5: Page Footer Medical Disclaimer (BR-SAFETY-004) ─── */}
        <footer className="pt-8 sm:pt-12 pb-6 text-left">
          <p className="text-xs text-neutral-600 leading-relaxed font-normal text-pretty">
            {MEDICAL_DISCLAIMER.full}
          </p>
        </footer>
      </div>

      {/* ── Section 4: Detail Sheet (Apple Health Style) ─────────────── */}
      <AnimatePresence>
        {selectedModalRec && (
          <motion.div
            key="rec-modal-backdrop"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[15vh] p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={handleCloseModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rec-sheet-title"
          >
            <motion.div
              ref={modalContainerRef}
              key="rec-modal-card"
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.97, y: 6 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 6 }
              }
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-xl max-w-lg w-full relative border border-neutral-100 flex flex-col overflow-hidden p-6 sm:p-7 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Title & Close Button */}
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="rec-sheet-title"
                  className="text-lg sm:text-xl font-semibold text-[#0B1E38] tracking-tight leading-snug text-pretty"
                >
                  {selectedModalRec.actionTitle}
                </h2>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleCloseModal}
                  aria-label="Tutup"
                  className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Contextual How-To Instruction */}
              {selectedModalRec.techniqueDetail && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-800 leading-relaxed text-pretty">
                    {selectedModalRec.techniqueDetail}
                  </p>
                </div>
              )}

              {/* Body: Kenapa Membantu */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-[#0B1E38]">
                  Kenapa membantu
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-normal text-pretty">
                  {selectedModalRec.plainRationale}
                </p>
              </div>

              {/* Progressive Disclosure: Cara kerjanya di tubuh */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsScientificOpen((prev) => !prev)}
                  aria-expanded={isScientificOpen}
                  aria-controls="cara-kerja-tubuh-content"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 py-1 transition-colors cursor-pointer select-none"
                >
                  <span>Cara kerjanya di tubuh</span>
                  {isScientificOpen ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isScientificOpen && (
                    <motion.div
                      id="cara-kerja-tubuh-content"
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, height: 0 }
                      }
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 1, height: "auto" }
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, height: 0 }
                      }
                      transition={{
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <p className="pt-2 text-sm text-neutral-600 leading-relaxed font-normal text-pretty">
                        {selectedModalRec.scientificDetail}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Single Divider & Source Line */}
              <div className="pt-4 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <span className="text-neutral-600 font-normal">
                  {selectedModalRec.shortOrg} · {selectedModalRec.publication} · {selectedModalRec.evidenceStrengthLabel}
                </span>

                <Link
                  href={
                    selectedModalRec.evidenceSlug
                      ? `/dashboard/evidence?ref=${selectedModalRec.rule_id}&doc=${selectedModalRec.evidenceSlug}`
                      : `/dashboard/evidence?ref=${selectedModalRec.rule_id}`
                  }
                  className="inline-flex items-center gap-0.5 font-semibold text-brand-700 hover:text-brand-900 transition-colors shrink-0"
                >
                  <span>Dasar ilmiah</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-8 space-y-6 w-full flex items-center justify-center min-h-[50vh]">
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Memuat Tindakan Preventif...
          </p>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
