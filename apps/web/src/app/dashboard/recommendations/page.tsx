"use client";

import { Suspense, useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Apple,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Footprints,
  Moon,
  Plus,
  Wind,
  X,
} from "lucide-react";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { RecommendationItem } from "@/types/api";
import { MockDataNotice } from "@/components/mock-data-notice";

const KNOWN_ORGANIZATIONS = [
  "WHO",
  "PERKI",
  "AHA",
  "PERKENI",
  "CDC",
  "ESC",
  "KEMENKES",
  "ADA",
  "ISH",
  "ACC",
  "GERMAS",
  "UBM",
];

function getSourceAbbreviation(source?: string): string {
  if (!source) return "EBM";
  const upper = source.toUpperCase();
  const matched: string[] = [];

  for (const org of KNOWN_ORGANIZATIONS) {
    // Regex matching word boundary so "CDC" doesn't match accidental substrings
    const regex = new RegExp(`\\b${org}\\b`, "i");
    if (regex.test(upper)) {
      matched.push(org === "KEMENKES" ? "Kemenkes" : org);
    }
  }

  if (matched.length > 0) {
    // Return max 2 abbreviations joined by " / " (e.g. "AHA / PERKI" or "CDC / Kemenkes")
    return matched.slice(0, 2).join(" / ");
  }

  // Fallback: extract any uppercase acronym with 2 to 7 letters
  const matches = source.match(/\b[A-Z]{2,7}\b/g);
  if (matches && matches.length > 0) {
    return matches.slice(0, 2).join(" / ");
  }

  return "EBM";
}

type PriorityLevel = "high" | "medium" | "low" | "protective";
type CategoryFilter = "all" | "activity" | "sleep" | "nutrition" | "stress";

interface EnrichedRecommendation extends RecommendationItem {
  priority: PriorityLevel;
  priorityLabel: string;
  priorityTextClass: string;
  cardBgClass: string;
  cardBorderClass: string;
  titleColorClass: string;
  sourceLinkClass: string;
  sourceIconClass: string;
  plusBtnClass: string;
  domainIcon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  shortSummary: string;
  targetMetric: string;
  rationale: string;
  rule_id: string;
}

interface DomainMeta {
  label: string;
  defaultTargetMetric: string;
  defaultRationale: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

function getConciseSummary(rec: RecommendationItem): string {
  const cat = rec.category.toLowerCase();
  const title = rec.title.toLowerCase();

  // REC-ACT-01 / WHO 2020: Meningkatkan fungsi aerobik, sensitivitas insulin perifer, dan elastisitas vaskular
  if (cat === "activity" || title.includes("aktivitas") || title.includes("aerobik")) {
    return "Meningkatkan kebugaran vaskular dan sensitivitas insulin.";
  }
  // REC-SLP-01 / CDC & NSF: Mendukung penurunan tekanan darah nokturnal dan regulasi hormonal metabolik
  if (cat === "sleep" || title.includes("tidur")) {
    return "Mendukung pemulihan kardiometabolik dan regulasi hormonal.";
  }
  // REC-NUT-01 / PERKENI & AHA: Mencegah lonjakan glukosa postprandial dan akumulasi plak aterosklerotik
  if (cat === "nutrition" || title.includes("makan") || title.includes("diet") || title.includes("berat")) {
    return "Menstabilkan glukosa darah dan menurunkan beban aterosklerosis.";
  }
  // REC-STR-01 / AHA 2021: Menstimulasi tonus vagal parasimpatis dan menurunkan beban stres hemodinamik
  // REC-SMK-01 / ESC & Kemenkes: Mengurangi stres oksidatif endotel vaskular
  if (cat === "stress" || title.includes("merokok") || title.includes("stres") || title.includes("relaksasi")) {
    if (title.includes("merokok")) {
      return "Mencegah cedera endotel dan menurunkan risiko trombosis.";
    }
    return "Menstimulasi tonus vagus untuk kestabilan hemodinamik.";
  }
  return "Menjaga homeostasis fisiologis dan fungsi kardiovaskular.";
}

const DOMAIN_METADATA: Record<string, DomainMeta> = {
  activity: {
    label: "Aktivitas Fisik",
    defaultTargetMetric: "Minimal 150 menit/minggu latihan intensitas sedang (jalan cepat/bersepeda).",
    defaultRationale: "Aktivitas fisik memfasilitasi translokasi GLUT-4 independen insulin pada otot rangka dan menjaga kelenturan arteri elastis.",
    icon: Footprints,
  },
  sleep: {
    label: "Pola Istirahat & Tidur",
    defaultTargetMetric: "7–8 jam tidur teratur setiap malam dengan jadwal tidur konsisten.",
    defaultRationale: "Tidur lelap gelombang lambat mendukung nocturnal dipping alami tekanan darah dan homeostasis regulasi hormon leptin/ghrelin.",
    icon: Moon,
  },
  nutrition: {
    label: "Nutrisi & Metabolisme",
    defaultTargetMetric: "Asupan serat harian minimal 25 g dan pembatasan natrium < 2.000 mg/hari.",
    defaultRationale: "Manajemen asupan serat larut mengikat asam empedu di lumen usus, menstabilkan lonjakan glukosa postprandial, dan meredam aterosklerosis.",
    icon: Apple,
  },
  stress: {
    label: "Manajemen Stres",
    defaultTargetMetric: "Latihan pernapasan dalam terstruktur (4-7-8) 10 menit setiap hari.",
    defaultRationale: "Stimulasi tonus nervus vagus meredakan hiperaktivitas simpatis dan menstabilkan variabilitas denyut jantung.",
    icon: Wind,
  },
};

const PRIORITY_CONFIG: Record<
  PriorityLevel,
  {
    label: string;
    textClass: string;
    cardBgClass: string;
    cardBorderClass: string;
    titleColorClass: string;
    sourceLinkClass: string;
    sourceIconClass: string;
    plusBtnClass: string;
  }
> = {
  high: {
    label: "Prioritas Utama",
    textClass: "text-[#D94A55]",
    cardBgClass: "bg-[#FBE7E9] text-[#0B1E38] shadow-xs",
    cardBorderClass: "border-transparent",
    titleColorClass: "text-[#0B1E38]",
    sourceLinkClass: "text-[#D94A55]",
    sourceIconClass: "text-[#D94A55]",
    plusBtnClass: "bg-[#D94A55]/10 hover:bg-[#D94A55]/15 text-[#D94A55]",
  },
  medium: {
    label: "Prioritas Sedang",
    textClass: "text-[#C98208]",
    cardBgClass: "bg-[#FFF4D9] text-[#0B1E38] shadow-xs",
    cardBorderClass: "border-transparent",
    titleColorClass: "text-[#0B1E38]",
    sourceLinkClass: "text-[#C98208]",
    sourceIconClass: "text-[#C98208]",
    plusBtnClass: "bg-[#C98208]/10 hover:bg-[#C98208]/15 text-[#C98208]",
  },
  low: {
    label: "Prioritas Terpelihara",
    textClass: "text-[#64748B]",
    cardBgClass: "bg-[#EDF1F5] text-[#0B1E38] shadow-xs",
    cardBorderClass: "border-transparent",
    titleColorClass: "text-[#0B1E38]",
    sourceLinkClass: "text-[#64748B]",
    sourceIconClass: "text-[#64748B]",
    plusBtnClass: "bg-[#64748B]/10 hover:bg-[#64748B]/15 text-[#64748B]",
  },
  protective: {
    label: "Faktor Protektif",
    textClass: "text-[#167653]",
    cardBgClass: "bg-[#E7F3ED] text-[#0B1E38] shadow-xs",
    cardBorderClass: "border-transparent",
    titleColorClass: "text-[#0B1E38]",
    sourceLinkClass: "text-[#167653]",
    sourceIconClass: "text-[#167653]",
    plusBtnClass: "bg-[#167653]/10 hover:bg-[#167653]/15 text-[#167653]",
  },
};

const FEATURE_TO_CATEGORY: Record<string, CategoryFilter> = {
  sleep_duration: "sleep",
  physical_activity: "activity",
  bmi: "nutrition",
  smoking_status: "activity",
  family_history: "nutrition",
  stress_level: "stress",
};

const DOMAIN_OPTIONS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "activity", label: "Aktivitas Fisik" },
  { id: "sleep", label: "Pola Tidur" },
  { id: "nutrition", label: "Nutrisi & Diet" },
  { id: "stress", label: "Manajemen Stres" },
];

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const factorParam = searchParams.get("factor");

  const { isAuthorized, isLoading, error, assessment } = useLatestAssessment();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [highlightedRecId, setHighlightedRecId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedModalRec, setSelectedModalRec] = useState<EnrichedRecommendation | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedModalRec(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

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
        cardBgClass: priorityStyle.cardBgClass,
        cardBorderClass: priorityStyle.cardBorderClass,
        titleColorClass: priorityStyle.titleColorClass,
        sourceLinkClass: priorityStyle.sourceLinkClass,
        sourceIconClass: priorityStyle.sourceIconClass,
        plusBtnClass: priorityStyle.plusBtnClass,
        domainIcon: categoryMeta.icon || Activity,
        shortSummary: getConciseSummary(rec),
        targetMetric: categoryMeta.defaultTargetMetric,
        rationale: categoryMeta.defaultRationale,
        rule_id,
      };
    });
  }, [assessment]);

  // Deep-link auto scroll and highlight handling for ?ref= or ?factor=
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
      const targetCategory = FEATURE_TO_CATEGORY[factorParam] || factorParam;
      const matched = enrichedRecommendations.find((r) => r.category === targetCategory);
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
      }, 0);
      const clearTimer = setTimeout(() => {
        setHighlightedRecId(null);
      }, 3500);
      return () => {
        clearTimeout(highlightTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [refParam, factorParam, enrichedRecommendations]);

  const filteredRecommendations = useMemo(() => {
    if (activeCategory === "all") return enrichedRecommendations;
    return enrichedRecommendations.filter((r) => r.category === activeCategory);
  }, [enrichedRecommendations, activeCategory]);

  if (!isAuthorized || isLoading) {
    return (
      <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-neutral-400 uppercase">
            HELIORA
          </p>
          <p className="text-sm font-medium text-neutral-600">Memuat tindakan preventif...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full flex items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-3xl p-8 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto text-lg font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-[#0B1E38]">
              Belum Ada Rekomendasi
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {error.kind === "not_found"
                ? "Lengkapi profil kesehatan Anda terlebih dahulu agar sistem dapat memformulasikan rencana tindakan preventif."
                : error.message}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <Link
              href="/onboarding/health-profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B1E38] hover:bg-[#0B1E38]/90 text-white text-xs font-semibold shadow-xs"
            >
              <span>Lengkapi Profil Kesehatan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full select-text">
      {assessment.is_mock && <MockDataNotice />}

      {/* Section 1: Page Identity & Domain Filter Dropdown */}
      <section className="border-b border-brand-900/10 pb-5 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1E38] break-words">
            Tindakan Preventif
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 font-normal leading-relaxed">
            Temukan langkah preventif yang relevan dengan kondisi dan pola hidupmu.
          </p>
        </div>

        {/* Domain Filter Dropdown */}
        <div ref={dropdownRef} className="relative inline-block text-left self-start sm:self-end shrink-0 sm:pb-0.5">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center justify-between gap-3 px-4 py-2 rounded-full border border-neutral-200/90 bg-white text-xs sm:text-sm font-semibold text-[#0B1E38] shadow-xs hover:border-neutral-300 hover:bg-neutral-50/50 transition-all cursor-pointer select-none"
          >
            <span>
              {DOMAIN_OPTIONS.find((d) => d.id === activeCategory)?.label || "Semua"}
            </span>
            <ChevronDown
              className={`size-3.5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180 text-neutral-700" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div
              role="listbox"
              className="absolute right-0 z-30 mt-2 w-48 rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-lg shadow-neutral-900/5 focus:outline-none"
            >
              {DOMAIN_OPTIONS.map((opt) => {
                const isSelected = activeCategory === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setActiveCategory(opt.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-start px-3 py-2 text-xs sm:text-sm rounded-xl font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-neutral-100 text-[#0B1E38] font-bold"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Recommendations Cards Grid */}
      <section className="flex flex-wrap items-start justify-start gap-5 sm:gap-6 pt-2">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map((rec) => {
            const isTargeted = highlightedRecId === rec.id;
            const DomainIcon = rec.domainIcon;

            return (
              <article
                id={`rec-${rec.id}`}
                key={rec.id}
                onClick={() => setSelectedModalRec(rec)}
                className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-6 shadow-xs relative flex flex-col justify-between w-full sm:w-[300px] max-w-[300px] aspect-square shrink-0 cursor-pointer ${
                  rec.cardBgClass
                } ${rec.cardBorderClass} ${
                  isTargeted
                    ? "ring-2 ring-white/50 shadow-md"
                    : ""
                }`}
              >
                {/* Top: Large Domain Icon */}
                <div className="flex items-center justify-center pt-1 pb-2">
                  <DomainIcon
                    className={`size-14 sm:size-16 ${rec.sourceIconClass} shrink-0 pointer-events-none select-none opacity-90`}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Center: Title & Short Informative Headline (Apple Style) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-1 space-y-2">
                  <h3 className={`text-xl sm:text-2xl lg:text-[25px] font-bold ${rec.titleColorClass} tracking-tight leading-snug break-words`}>
                    {rec.title}
                  </h3>
                  <p className="text-[13.5px] sm:text-[14px] text-[#2D3E50] font-medium leading-relaxed line-clamp-2 max-w-[260px]">
                    {rec.shortSummary}
                  </p>
                </div>

                {/* Bottom: Abbreviated Source Link on left and circular '+' trigger button on right */}
                <div className="flex items-end justify-between pt-2">
                  <Link
                    href={`/dashboard/evidence?ref=${rec.rule_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold ${rec.sourceLinkClass}`}
                    title={`Lihat sumber: ${rec.source}`}
                  >
                    <span className="font-mono tracking-tight">
                      {getSourceAbbreviation(rec.source)}
                    </span>
                    <ExternalLink
                      className={`size-3.5 sm:size-4 ${rec.sourceIconClass} shrink-0`}
                      strokeWidth={2}
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModalRec(rec);
                    }}
                    className={`size-9 sm:size-10 rounded-full ${rec.plusBtnClass} flex items-center justify-center transition-all duration-200 cursor-pointer select-none group shrink-0`}
                    aria-label={`Lihat rincian ${rec.title}`}
                  >
                    <Plus
                      className="size-5 sm:size-5.5 text-current transition-transform duration-200"
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="w-full p-8 rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/80 text-center space-y-2">
            <p className="text-sm sm:text-base font-semibold text-[#0B1E38]">
              Tidak ada rekomendasi pada domain ini.
            </p>
            <p className="text-xs sm:text-sm text-neutral-500">
              Silakan pilih kategori lain atau tampilkan seluruh domain.
            </p>
          </div>
        )}
      </section>

      {/* Apple-style Progressive Disclosure Modal Dialog */}
      <AnimatePresence>
        {selectedModalRec && (
          <motion.div
            key="apple-rec-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
            onClick={() => setSelectedModalRec(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apple-rec-modal-title"
          >
            <motion.div
              key="apple-rec-modal-card"
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
                onClick={() => setSelectedModalRec(null)}
                aria-label="Tutup rincian"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 size-8 sm:size-9 lg:size-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer select-none"
              >
                <X className="size-4 sm:size-5" />
              </button>

              {/* Domain & Priority Meta */}
              <div className="flex items-center gap-2 mb-2 pr-10">
                <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                  [{DOMAIN_METADATA[selectedModalRec.category]?.label || selectedModalRec.category.toUpperCase()}]
                </span>
                <span className="text-neutral-300">•</span>
                <span className={`text-xs font-mono font-bold ${selectedModalRec.priorityTextClass}`}>
                  {selectedModalRec.priorityLabel}
                </span>
              </div>

              {/* Rec Title */}
              <h3
                id="apple-rec-modal-title"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0B1E38] tracking-tight leading-tight pr-10 mb-6 sm:mb-8 break-words"
              >
                {selectedModalRec.title}
              </h3>

              {/* Body Content - Apple Format */}
              <div className="space-y-6 sm:space-y-8 text-[#0B1E38]">
                {/* 1. Action Description */}
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
                    Rencana Aksi Klinis
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                    {selectedModalRec.action}
                  </p>
                </div>

                {/* 2. Target Specific */}
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
                    Target Spesifik Harian
                  </h4>
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
                      {selectedModalRec.targetMetric}
                    </p>
                  </div>
                </div>

                {/* 3. Physiological Rationale */}
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
                    Rasional Fisiologis & Mekanisme
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
                    {selectedModalRec.rationale}
                  </p>
                </div>

                {/* 4. Scientific Evidence & Source */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs sm:text-sm text-neutral-500 font-mono">
                      <span className="font-bold text-neutral-700">Tingkat Bukti:</span> Level {selectedModalRec.evidence_level} (Kuat)
                    </div>
                    <Link
                      href={`/dashboard/evidence?ref=${selectedModalRec.rule_id}`}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#007AFF] hover:underline"
                    >
                      <span>Buka di Evidence Center</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">
                    Sumber: {selectedModalRec.source}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Disclaimer */}
      <footer className="pt-10 sm:pt-14 pb-6 text-center select-text">
        <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-3xl mx-auto select-text cursor-text font-normal">
          HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.
        </p>
      </footer>
    </main>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full flex items-center justify-center min-h-[50vh]">
          <p className="text-xs font-mono font-bold text-neutral-400 uppercase">
            Memuat Tindakan Preventif...
          </p>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
