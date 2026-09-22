"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Filter,
} from "lucide-react";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { RecommendationItem } from "@/types/api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

type PriorityLevel = "high" | "medium" | "low" | "protective";
type CategoryFilter = "all" | "activity" | "sleep" | "nutrition" | "stress";

interface EnrichedRecommendation extends RecommendationItem {
  priority: PriorityLevel;
  priorityLabel: string;
  priorityTextClass: string;
  priorityBorderClass: string;
  targetMetric: string;
  rationale: string;
  rule_id: string;
}

interface DomainMeta {
  label: string;
  defaultTargetMetric: string;
  defaultRationale: string;
}

const DOMAIN_METADATA: Record<string, DomainMeta> = {
  activity: {
    label: "Aktivitas Fisik",
    defaultTargetMetric: "Minimal 150 menit/minggu latihan intensitas sedang (jalan cepat/bersepeda).",
    defaultRationale: "Aktivitas fisik memfasilitasi translokasi GLUT-4 independen insulin pada otot rangka dan menjaga kelenturan arteri elastis.",
  },
  sleep: {
    label: "Pola Istirahat & Tidur",
    defaultTargetMetric: "7–8 jam tidur teratur setiap malam dengan jadwal tidur konsisten.",
    defaultRationale: "Tidur lelap gelombang lambat mendukung nocturnal dipping alami tekanan darah dan homeostasis regulasi hormon leptin/ghrelin.",
  },
  nutrition: {
    label: "Nutrisi & Metabolisme",
    defaultTargetMetric: "Asupan serat harian minimal 25 g dan pembatasan natrium < 2.000 mg/hari.",
    defaultRationale: "Manajemen asupan serat larut mengikat asam empedu di lumen usus, menstabilkan lonjakan glukosa postprandial, dan meredam aterosklerosis.",
  },
  stress: {
    label: "Manajemen Stres",
    defaultTargetMetric: "Latihan pernapasan dalam terstruktur (4-7-8) 10 menit setiap hari.",
    defaultRationale: "Stimulasi tonus nervus vagus meredakan hiperaktivitas simpatis dan menstabilkan variabilitas denyut jantung.",
  },
};

const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; textClass: string; borderClass: string }
> = {
  high: {
    label: "Prioritas Utama",
    textClass: "text-red-700",
    borderClass: "border-l-4 border-l-red-600/80",
  },
  medium: {
    label: "Prioritas Sedang",
    textClass: "text-amber-800",
    borderClass: "border-l-4 border-l-amber-600/80",
  },
  low: {
    label: "Prioritas Terpelihara",
    textClass: "text-brand-900/70",
    borderClass: "border-l-4 border-l-brand-900/30",
  },
  protective: {
    label: "Faktor Protektif",
    textClass: "text-emerald-800",
    borderClass: "border-l-4 border-l-emerald-600/80",
  },
};

export default function RecommendationsPage() {
  const { isAuthorized, isLoading, error, assessment } = useLatestAssessment();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  // Enrich recommendations with clinical targets, priority levels, and rationales using data-driven config
  const enrichedRecommendations: EnrichedRecommendation[] = useMemo(() => {
    if (!assessment || !assessment.recommendations) return [];

    return assessment.recommendations.map((rec) => {
      const categoryMeta = DOMAIN_METADATA[rec.category] || {
        label: rec.category.toUpperCase(),
        defaultTargetMetric: "Optimalisasi gaya hidup harian berkelanjutan.",
        defaultRationale: "Intervensi gaya hidup terbukti menurunkan biomarker inflamasi vaskular dan beban kardiometabolik.",
      };

      const priority: PriorityLevel = (rec.priority as PriorityLevel) || "medium";
      const priorityStyle = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
      const rule_id = rec.rule_id || (rec.id.startsWith("REC-") ? rec.id : `REC-${rec.category.toUpperCase().slice(0, 3)}-01`);

      return {
        ...rec,
        priority,
        priorityLabel: priorityStyle.label,
        priorityTextClass: priorityStyle.textClass,
        priorityBorderClass: priorityStyle.borderClass,
        targetMetric: categoryMeta.defaultTargetMetric,
        rationale: categoryMeta.defaultRationale,
        rule_id,
      };
    });
  }, [assessment]);

  const filteredRecommendations = useMemo(() => {
    if (activeCategory === "all") return enrichedRecommendations;
    return enrichedRecommendations.filter((r) => r.category === activeCategory);
  }, [enrichedRecommendations, activeCategory]);

  if (!isAuthorized || isLoading) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            HELIORA
          </p>
          <p className="text-sm font-medium text-brand-900/70">Memuat rencana intervensi klinis...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-brand-900/10 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-900/10 text-brand-900 flex items-center justify-center mx-auto text-lg font-bold">
            H
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-brand-900">
              Belum Ada Rekomendasi
            </h1>
            <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
              Lengkapi profil kesehatan Anda agar sistem dapat menyusun rencana tindakan preventif yang disesuaikan secara personal.
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
    <div className="min-h-screen bg-[#FBFDFB] text-brand-900 selection:bg-brand-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-brand-900/10 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900/60 hover:text-brand-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <span className="text-brand-900/20">/</span>
            <span className="text-xs font-mono font-bold tracking-wider text-brand-900 uppercase">
              Rencana Tindakan
            </span>
          </div>

          <Link
            href="/dashboard/evidence"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-900/60" />
            <span>Pusat Bukti Medis →</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 flex-1 w-full">
        {/* Title Section */}
        <section className="space-y-2">
          <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            Intervensi Terarah
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-900">
                Rencana Intervensi Gaya Hidup
              </h1>
              <p className="text-xs sm:text-sm text-brand-900/70 max-w-2xl mt-1 leading-relaxed">
                Tindakan preventif berbasis bukti ilmiah untuk menekan faktor risiko kardiometabolik dan memperkuat proteksi fisiologis jangka panjang.
              </p>
            </div>

            {/* Assessment timestamp */}
            <div className="text-right sm:text-right shrink-0">
              <span className="text-[10px] font-mono font-bold text-brand-900/40 uppercase block">
                Berdasarkan Asesmen
              </span>
              <span className="text-xs font-mono font-semibold text-brand-900">
                {new Date(assessment.assessed_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Filter Controls — Rectangular Flat Tabs (Strict No Pill Chips) */}
        <section className="flex flex-wrap items-center gap-2 pt-2 border-b border-brand-900/10 pb-4">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-900/50 mr-2 uppercase">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Domain:</span>
          </div>

          {[
            { id: "all", label: "Semua Domain" },
            { id: "activity", label: "Aktivitas Fisik" },
            { id: "sleep", label: "Pola Tidur" },
            { id: "nutrition", label: "Nutrisi & Diet" },
            { id: "stress", label: "Manajemen Stres" },
          ].map((tab) => {
            const isActive = activeCategory === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id as CategoryFilter)}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                    : "bg-white text-brand-900/70 border-brand-900/15 hover:border-brand-900/30 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </section>

        {/* Recommendations Cards Grid */}
        <section className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((rec) => {
              return (
                <article
                  key={rec.id}
                  className={`bg-white rounded-2xl border border-brand-900/10 p-6 sm:p-7 shadow-xs space-y-4 transition-all hover:border-brand-900/25 ${rec.priorityBorderClass}`}
                >
                  {/* Card Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-900/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                        [{DOMAIN_METADATA[rec.category]?.label || rec.category.toUpperCase()}]
                      </span>
                      <span className="text-brand-900/20">•</span>
                      <span
                        className={`text-[11px] font-mono font-bold ${rec.priorityTextClass}`}
                      >
                        {rec.priorityLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-brand-900/50">
                      <span>Tingkat Bukti:</span>
                      <span className="font-bold text-brand-900">Level {rec.evidence_level} (Kuat)</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-bold text-brand-900">
                      {rec.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-900/80 leading-relaxed font-medium">
                      {rec.action}
                    </p>
                  </div>

                  {/* Clinical Target & Rationale Bento Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-brand-50/40 border border-brand-900/5 space-y-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-brand-900/50 uppercase block">
                        Target Spesifik
                      </span>
                      <p className="text-xs text-brand-900/80 leading-relaxed">
                        {rec.targetMetric}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-brand-50/40 border border-brand-900/5 space-y-1">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-brand-900/50 uppercase block">
                        Rasional Fisiologis
                      </span>
                      <p className="text-xs text-brand-900/70 leading-relaxed">
                        {rec.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom CTA & Guideline Source */}
                  <div className="pt-3 border-t border-brand-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-brand-900/60 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-brand-900/40 shrink-0" />
                      <span className="truncate max-w-md">{rec.source}</span>
                    </div>

                    <Link
                      href={`/dashboard/evidence?ref=${rec.rule_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:text-brand-800 underline underline-offset-4 shrink-0"
                    >
                      <span>Lihat Dasar Ilmiah Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-brand-900/10 text-center space-y-2">
              <p className="text-sm font-semibold text-brand-900">
                Tidak ada rekomendasi pada domain ini.
              </p>
              <p className="text-xs text-brand-900/60">
                Silakan pilih kategori lain atau tampilkan seluruh domain.
              </p>
            </div>
          )}
        </section>

        {/* Footer Disclaimer */}
        <footer className="pt-6 border-t border-brand-900/10">
          <DisclaimerBanner />
        </footer>
      </main>
    </div>
  );
}
