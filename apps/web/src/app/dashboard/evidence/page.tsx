"use client";

import { Suspense, useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ExternalLink,
  X,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useLatestAssessment } from "@/lib/use-latest-assessment";
import { apiClient } from "@/lib/api-client";
import {
  EVIDENCE_DATABASE,
  getEvidenceBySlugOrId,
  formatLastReviewedDate,
  getEarliestEvidenceReviewDate,
  type ClinicalEvidence,
  type EvidenceCategory,
} from "@/lib/evidence-database";

// ── Category Definitions ───────────────────────────────────────────────────
interface CategoryOption {
  id: "all" | EvidenceCategory;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Semua" },
  { id: "activity", label: "Aktivitas Fisik" },
  { id: "sleep", label: "Pola Tidur" },
  { id: "weight", label: "Berat Badan & Nutrisi" },
  { id: "smoking", label: "Kebiasaan Merokok" },
  { id: "consultation", label: "Konsultasi Medis" },
  { id: "stress", label: "Manajemen Stres" },
];

const DISEASE_TO_EVIDENCE_MAP: Record<string, string> = {
  diabetes: "evi-02",
  hypertension: "evi-06",
  cardiovascular: "evi-04",
};

// ── Detail Modal Component (Isolated State per Document) ───────────────────
interface EvidenceDetailModalProps {
  evidence: ClinicalEvidence;
  onClose: () => void;
  userActiveRuleIds: Set<string>;
}

function EvidenceDetailModal({
  evidence,
  onClose,
  userActiveRuleIds,
}: EvidenceDetailModalProps) {
  const [showGradeInfo, setShowGradeInfo] = useState(false);
  const [showRelatedPub, setShowRelatedPub] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const gradePopoverRef = useRef<HTMLDivElement | null>(null);

  // Lock background body scroll while dialog is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Focus trap & Escape key handler
  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showGradeInfo) {
          setShowGradeInfo(false);
          return;
        }
        onClose();
        return;
      }

      if (e.key === "Tab" && modalContainerRef.current) {
        const focusable = modalContainerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        showGradeInfo &&
        gradePopoverRef.current &&
        !gradePopoverRef.current.contains(e.target as Node)
      ) {
        setShowGradeInfo(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGradeInfo, onClose]);

  const handleCopyCitation = useCallback(async (citationText: string) => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
    } catch {
      // Graceful fallback
    }
  }, []);

  return (
    <motion.div
      key="evidence-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-detail-title"
    >
      <motion.div
        ref={modalContainerRef}
        key={`evidence-modal-card-${evidence.id}`}
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-white sm:rounded-2xl shadow-xl flex flex-col overflow-hidden my-auto border-0 sm:border sm:border-neutral-200 relative"
      >
        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* 1. Baris Atas: Judul, Metadata & Tombol Tutup ✕ */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0 flex-1">
              <h2
                id="evidence-detail-title"
                className="text-xl sm:text-[22px] font-semibold text-neutral-900 leading-snug"
              >
                {evidence.title}
              </h2>
              <p className="text-[13px] text-neutral-600 font-normal flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                <span>{evidence.organization}</span>
                <span className="text-neutral-300">·</span>
                <span>{evidence.year}</span>
                <span className="text-neutral-300">·</span>
                <span>{evidence.evidenceType}</span>
                <span className="text-neutral-300">·</span>
                <span>{evidence.categoryLabel}</span>
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="size-8 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 -mt-1 -mr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* 2. Ringkasan (Body 15px) */}
          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-neutral-900">
              Ringkasan
            </h3>
            <p className="text-[15px] text-neutral-800 font-normal leading-relaxed">
              {evidence.plainSummary}
            </p>
          </section>

          {/* 3. Dasar untuk Rekomendasi (Flat List dengan Chevron) */}
          <section className="space-y-3">
            <h3 className="text-[15px] font-semibold text-neutral-900">
              Dasar untuk rekomendasi
            </h3>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
              {evidence.supportedRecommendations.map((rec) => {
                const isActive = userActiveRuleIds.has(rec.ruleId.toUpperCase());

                return (
                  <Link
                    key={rec.ruleId}
                    href={`/dashboard/recommendations?ref=${rec.ruleId}`}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/90 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900 focus-visible:ring-offset-1 rounded-lg"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-neutral-900 group-hover:text-brand-900 transition-colors">
                          {rec.title}
                        </span>
                        {isActive && (
                          <span className="text-xs text-brand-900 font-normal">
                            (aktif di profil Anda)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 font-normal leading-normal">
                        {rec.actionText}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* 4. Penilaian Bukti (Satu Baris + Popover Tanpa Geser Layout) */}
          <section className="space-y-2">
            <h3 className="text-[15px] font-semibold text-neutral-900">
              Penilaian bukti
            </h3>

            {evidence.hasFormalGrading ? (
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-neutral-700 font-normal relative">
                <span>
                  Rekomendasi {evidence.recommendationStrength?.toLowerCase() || "kuat"}
                </span>
                <span className="text-neutral-300">·</span>
                <span>
                  Kepastian bukti {evidence.evidenceCertainty?.toLowerCase() || "sedang"}
                </span>
                <span className="text-neutral-600">
                  ({evidence.evidenceGradingSystem})
                </span>

                {/* Info Button: Area klik minimal 24x24px, Accessible */}
                <div ref={gradePopoverRef} className="relative inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowGradeInfo((prev) => !prev)}
                    aria-label="Apa itu WHO GRADE?"
                    aria-expanded={showGradeInfo}
                    className="inline-flex items-center justify-center size-6 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900 transition-colors cursor-pointer shrink-0"
                  >
                    <Info className="size-4" />
                  </button>

                  {/* Floating Popover: Tidak menggeser layout modal */}
                  {showGradeInfo && (
                    <div
                      role="tooltip"
                      className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-40 w-72 sm:w-80 p-3.5 bg-white border border-neutral-200 rounded-xl shadow-lg text-[13px] text-neutral-700 leading-relaxed font-normal animate-in fade-in zoom-in-95 duration-100"
                    >
                      Kekuatan rekomendasi: seberapa yakin para ahli bahwa manfaatnya lebih besar daripada risikonya. Kepastian bukti: seberapa kuat data penelitian yang mendasarinya.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[13px] text-neutral-700 font-normal">
                  Tanpa penilaian formal
                </p>
                <p className="text-[13px] text-neutral-600 font-normal leading-relaxed">
                  Dokumen ini merupakan pedoman kebijakan kesehatan masyarakat atau studi observasional tanpa telaah formal sistem GRADE.
                </p>
              </div>
            )}
          </section>

          {/* 5. Sumber (Flat Section, Bersih dari Garis & Footer Dipindah ke Sini) */}
          <section className="space-y-3">
            <h3 className="text-[15px] font-semibold text-neutral-900">
              Sumber
            </h3>

            {/* Bagian yang dirujuk */}
            <p className="text-[13px] text-neutral-600 font-normal">
              Bagian: {evidence.clinicalSection}
            </p>

            {/* Sitasi Lengkap */}
            <p className="text-[13px] sm:text-sm text-neutral-700 font-normal leading-relaxed">
              {evidence.primaryCitation}
            </p>

            {/* Aksi Terpadu: CTA Buka Sumber & Salin Sitasi Sejajar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {evidence.externalUrl && (
                <a
                  href={evidence.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-900 hover:bg-brand-950 text-white text-[13px] font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{evidence.authorityCtaLabel}</span>
                  <ExternalLink className="size-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => handleCopyCitation(evidence.primaryCitation)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-[13px] text-neutral-700 transition-colors cursor-pointer font-normal"
              >
                {copiedCitation ? (
                  <>
                    <Check className="size-3.5 text-brand-900" />
                    <span className="text-brand-900 font-medium">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-neutral-500" />
                    <span>Salin sitasi</span>
                  </>
                )}
              </button>
            </div>

            {/* DOI jika tersedia */}
            {evidence.doi && (
              <p className="text-[13px] font-normal pt-0.5">
                <a
                  href={`https://doi.org/${evidence.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-neutral-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>DOI: {evidence.doi}</span>
                  <ExternalLink className="size-3 text-neutral-400" />
                </a>
              </p>
            )}

            {/* Publikasi terkait: Controlled State, Tertutup Default, Tanpa Garis Vertikal */}
            {evidence.relatedPublication && (
              <div className="text-[13px] text-neutral-600 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRelatedPub((prev) => !prev)}
                  aria-expanded={showRelatedPub}
                  className="cursor-pointer text-neutral-500 hover:text-neutral-800 font-normal select-none flex items-center gap-1 transition-colors"
                >
                  <span>Publikasi terkait</span>
                  <ChevronRight
                    className={`size-3.5 text-neutral-400 transition-transform duration-150 ${
                      showRelatedPub ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showRelatedPub && (
                  <div className="mt-1.5 text-neutral-600 space-y-1">
                    <p className="leading-relaxed">{evidence.relatedPublication}</p>
                    {evidence.relatedPublicationDoi && (
                      <a
                        href={`https://doi.org/${evidence.relatedPublicationDoi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 hover:text-neutral-900 hover:underline inline-flex items-center gap-1 pt-0.5"
                      >
                        <span>DOI: {evidence.relatedPublicationDoi}</span>
                        <ExternalLink className="size-2.5 text-neutral-400" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Terakhir ditinjau */}
            <p className="text-[13px] text-neutral-600 font-normal pt-2">
              Terakhir ditinjau: {formatLastReviewedDate(evidence.lastVerified)}
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page Content ──────────────────────────────────────────────────────
function EvidenceCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const docParam = searchParams.get("doc");
  const diseaseParam = searchParams.get("disease");

  const [selectedCategory, setSelectedCategory] = useState<"all" | EvidenceCategory>("all");
  const [evidenceList, setEvidenceList] = useState<ClinicalEvidence[]>(EVIDENCE_DATABASE);

  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Directly derive selectedEvidence from URL query docParam (Pure React 19 pattern)
  const selectedEvidence = useMemo(() => {
    if (!docParam) return null;
    return getEvidenceBySlugOrId(docParam) || null;
  }, [docParam]);

  // Fetch assessment to identify active user recommendations
  const { assessment } = useLatestAssessment();
  const userActiveRuleIds = useMemo(() => {
    const set = new Set<string>();
    if (assessment?.recommendations) {
      for (const rec of assessment.recommendations) {
        if (rec.rule_id) {
          set.add(rec.rule_id.toUpperCase());
        }
      }
    }
    return set;
  }, [assessment]);

  // Keep evidence catalog synced with API if available
  useEffect(() => {
    let isCancelled = false;
    async function loadApiEvidence() {
      try {
        const res = await apiClient.evidence.list();
        if (!isCancelled && res.items && res.items.length > 0) {
          setEvidenceList(EVIDENCE_DATABASE);
        }
      } catch {
        setEvidenceList(EVIDENCE_DATABASE);
      }
    }
    loadApiEvidence();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Identify targeted evidence when landing via ?ref=... or ?disease=...
  const targetEvidence = useMemo(() => {
    if (!refParam && !diseaseParam) return null;

    if (refParam) {
      const found = evidenceList.find(
        (e) =>
          e.rule_id.toLowerCase() === refParam.toLowerCase() ||
          e.id.toLowerCase() === refParam.toLowerCase() ||
          e.supportedRecommendations.some((r) => r.ruleId.toLowerCase() === refParam.toLowerCase())
      );
      if (found) return found;
    }

    if (diseaseParam) {
      const norm = diseaseParam.toLowerCase();
      const mappedId = DISEASE_TO_EVIDENCE_MAP[norm];
      if (mappedId) {
        return evidenceList.find((e) => e.id === mappedId) || null;
      }
    }

    return null;
  }, [refParam, diseaseParam, evidenceList]);

  // Smooth scroll to targeted card if landing via ref
  useEffect(() => {
    if (targetEvidence) {
      const el = document.getElementById(`evidence-row-${targetEvidence.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [targetEvidence]);

  // Modal open / close handlers declared before effects
  const handleOpenDetail = useCallback(
    (evidence: ClinicalEvidence) => {
      lastActiveElementRef.current = document.activeElement as HTMLElement | null;

      try {
        const params = new URLSearchParams(window.location.search);
        params.set("doc", evidence.slug);
        router.replace(`/dashboard/evidence?${params.toString()}`, { scroll: false });
      } catch {
        // Fallback gracefully
      }
    },
    [router]
  );

  const handleCloseDetail = useCallback(() => {
    if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }

    try {
      const params = new URLSearchParams(window.location.search);
      params.delete("doc");
      const newQuery = params.toString();
      const targetUrl = newQuery ? `/dashboard/evidence?${newQuery}` : "/dashboard/evidence";
      router.replace(targetUrl, { scroll: false });
    } catch {
      // Fallback gracefully
    }
  }, [router]);

  const handleClearContext = useCallback(() => {
    router.replace("/dashboard/evidence");
  }, [router]);

  // Calculate item counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: evidenceList.length };
    for (const item of evidenceList) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [evidenceList]);

  // Filter out empty categories so no chips render for 0 items
  const availableCategories = useMemo(() => {
    return CATEGORIES.filter((cat) => {
      if (cat.id === "all") return true;
      return (categoryCounts[cat.id] || 0) > 0;
    });
  }, [categoryCounts]);

  // Filtered evidence items by category
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      return selectedCategory === "all" || item.category === selectedCategory;
    });
  }, [selectedCategory, evidenceList]);

  const isFiltered = selectedCategory !== "all";

  return (
    <div className="space-y-6 w-full">
      {/* ── Contextual Recommendation Landing Notice ── */}
      {refParam && (
        <section
          aria-label="Konteks rekomendasi"
          className="max-w-4xl rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-neutral-900">
                {targetEvidence
                  ? `Dasar ilmiah untuk: ${targetEvidence.supportedRecommendations[0]?.title}`
                  : "Dasar ilmiah untuk rekomendasi"}
              </h2>
              <p className="text-[13px] text-neutral-600 font-normal leading-relaxed">
                Menampilkan pedoman resmi yang mendasari rekomendasi ini. Sumber terkait telah disorot di bawah.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearContext}
              className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 text-[13px] font-normal text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="size-3 text-neutral-500" />
              <span>Tampilkan semua pedoman</span>
            </button>
          </div>
        </section>
      )}

      {/* ── Page Header: Standard Dashboard Title Style ── */}
      <header className="border-b border-brand-900/10 pb-5 sm:pb-6 w-full">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B1E38] break-words">
            Dasar Ilmiah
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 font-normal leading-relaxed">
            Sumber yang menjadi dasar rekomendasi di HELIORA.
          </p>
        </div>
      </header>

      {/* ── Filter Controls (Category Chips) ── */}
      <section className="space-y-3 max-w-4xl">
        {/* Categories: Single Horizontal Scrollable Row, Brand Green when selected */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-lg text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-brand-900 text-white font-medium shadow-2xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900 font-normal"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filter Result Count (Only Shown When Filtered) */}
        {isFiltered && (
          <div className="text-[13px] text-neutral-600 font-normal pt-1">
            {filteredEvidence.length} hasil
          </div>
        )}
      </section>

      {/* ── Evidence List (Apple Health Style Plain Rows) ── */}
      <section className="space-y-4 max-w-4xl">
        {/* Empty State */}
        {filteredEvidence.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-3">
            <p className="text-sm font-normal text-neutral-700">
              Tidak ada pedoman di kategori ini
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-normal text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>Hapus filter</span>
            </button>
          </div>
        )}

        {/* List Rows */}
        {filteredEvidence.length > 0 && (
          <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
            {filteredEvidence.map((evidence) => {
              const isTargeted = targetEvidence?.id === evidence.id;
              const recCount = evidence.supportedRecommendations.length;
              const firstRecTitle = evidence.supportedRecommendations[0]?.title || "Rekomendasi";
              const extraCount = recCount > 1 ? recCount - 1 : 0;

              // Baris 2: [Org] · [Year] · [Type] · [Strength if formal] (PRD §11.21 normalized types)
              const secondaryMetadataParts = [
                evidence.shortOrg,
                String(evidence.year),
                evidence.evidenceType,
              ];
              if (evidence.hasFormalGrading) {
                secondaryMetadataParts.push(
                  evidence.recommendationStrength === "Kondisional"
                    ? "Rekomendasi kondisional"
                    : "Rekomendasi kuat"
                );
              }

              return (
                <div
                  id={`evidence-row-${evidence.id}`}
                  key={evidence.id}
                  onClick={() => handleOpenDetail(evidence)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenDetail(evidence);
                    }
                  }}
                  className={`w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors cursor-pointer select-none hover:bg-neutral-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-900 focus-visible:ring-offset-2 ${
                    isTargeted
                      ? "bg-brand-50/60 ring-1 ring-brand-700/40"
                      : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Baris 1: Judul Bahasa Indonesia (Maks 2 Baris, Semibold) */}
                    <h2 className="text-sm sm:text-base font-semibold text-neutral-900 leading-snug line-clamp-2">
                      {evidence.title}
                    </h2>

                    {/* Baris 2: Satu baris teks sekunder (13px, kontras >= 4.5:1 / 7.9:1) */}
                    <p className="text-[13px] text-neutral-600 font-normal flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      {secondaryMetadataParts.map((part, idx) => (
                        <span key={idx} className="flex items-center gap-1.5">
                          {idx > 0 && <span className="text-neutral-300">·</span>}
                          <span>{part}</span>
                        </span>
                      ))}
                    </p>

                    {/* Baris 3: Dasar untuk rekomendasi (14px, teks reguler, tanpa ikon) */}
                    <p className="text-sm text-neutral-700 font-normal truncate pt-0.5">
                      Dasar untuk: {firstRecTitle}
                      {extraCount > 0 && ` dan ${extraCount} lainnya`}
                    </p>
                  </div>

                  {/* Right Affordance: Chevron saja */}
                  <ChevronRight className="size-4 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom subtle verification note (clearly visible, BR-EVIDENCE-004) */}
        <p className="text-[13px] text-neutral-600 font-normal text-left pt-3">
          Terakhir ditinjau: {formatLastReviewedDate(getEarliestEvidenceReviewDate())}
        </p>
      </section>

      {/* ── Detail View Dialog (Clean, Flat, No Empty Header/Footer Bars) ── */}
      <AnimatePresence>
        {selectedEvidence && (
          <EvidenceDetailModal
            evidence={selectedEvidence}
            onClose={handleCloseDetail}
            userActiveRuleIds={userActiveRuleIds}
          />
        )}
      </AnimatePresence>

      {/* ── Footer Disclaimer (Kanonik PRD §20.14 & FR-005, selaras dengan Proyeksi & Skenario) ── */}
      <footer className="pt-8 pb-10 border-t border-neutral-200/80 mt-10 w-full">
        <p className="text-xs text-neutral-500 leading-relaxed text-left max-w-3xl font-normal">
          HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.
        </p>
      </footer>
    </div>
  );
}

// ── Exported Page with Auth Guard & Suspense ───────────────────────────────
export default function EvidenceCenterPage() {
  const { isAuthorized } = useRequireAuth();

  if (!isAuthorized) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-center p-6 min-h-[50vh]">
        <p className="text-sm font-normal text-neutral-500">
          Memverifikasi otentikasi...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <main className="flex-1 px-6 sm:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 pb-16 space-y-6 sm:space-y-8 w-full select-text">
        <Suspense
          fallback={
            <div className="p-8 text-xs text-neutral-400">
              Menyiapkan katalog dasar ilmiah...
            </div>
          }
        >
          <EvidenceCenterContent />
        </Suspense>
      </main>
    </div>
  );
}
