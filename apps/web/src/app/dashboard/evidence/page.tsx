"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { apiClient } from "@/lib/api-client";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

interface ClinicalEvidence {
  id: string;
  rule_id: string;
  title: string;
  organization: string;
  year: number;
  evidence_level: "Level A (Kuat)" | "Level B (Sedang)" | "Level C (Konsensus Pakar)";
  category: "activity" | "sleep" | "nutrition" | "cardiovascular" | "stress";
  categoryLabel: string;
  summary: string;
  clinicalSection: string;
  citation: string;
  externalUrl: string;
}

const EVIDENCE_DATABASE: ClinicalEvidence[] = [
  {
    id: "evi-01",
    rule_id: "REC-ACT-01",
    title: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
    organization: "World Health Organization (WHO)",
    year: 2020,
    evidence_level: "Level A (Kuat)",
    category: "activity",
    categoryLabel: "Aktivitas Fisik",
    summary:
      "Aktivitas aerobik berintensitas sedang minimal 150–300 menit per minggu secara konsisten menurunkan mortalitas kardiometabolik sebesar 20–30%, memfasilitasi translokasi GLUT-4 independen insulin pada otot rangka, dan menurunkan tekanan darah istirahat.",
    clinicalSection: "Chapter 3: Recommendations for Adults (Aged 18–64 Years)",
    citation: "Bull FC, Al-Ansari SS, Biddle S, et al. Br J Sports Med 2020;54:1451-1462.",
    externalUrl: "https://www.who.int/publications/i/item/9789240015128",
  },
  {
    id: "evi-02",
    rule_id: "REC-NUT-01",
    title: "Panduan Pengelolaan Dislipidemia dan Diabetes Melitus Tipe 2 di Indonesia",
    organization: "Perkumpulan Endokrinologi Indonesia (PERKENI)",
    year: 2021,
    evidence_level: "Level A (Kuat)",
    category: "nutrition",
    categoryLabel: "Nutrisi & Diet",
    summary:
      "Terapi nutrisi medis berbasis pembatasan asupan karbohidrat sederhana, peningkatan konsumsi serat larut (25–30 gram/hari), dan penurunan berat badan 5–10% pada individu overweight menurunkan resistensi insulin hepatik dan meredam risiko progresi prediabetes.",
    clinicalSection: "Bab IV: Terapi Nutrisi Medis dan Manajemen Gaya Hidup Sehat",
    citation: "Konsensus Pengelolaan dan Pencegahan DM Tipe 2 di Indonesia, PB PERKENI 2021.",
    externalUrl: "https://pbperkeni.or.id/",
  },
  {
    id: "evi-03",
    rule_id: "REC-SLP-01",
    title: "Korelasi Durasi dan Kualitas Tidur terhadap Risiko Hipertensi dan Gangguan Kardiometabolik",
    organization: "Centers for Disease Control and Prevention (CDC) & Kemenkes RI",
    year: 2022,
    evidence_level: "Level A (Kuat)",
    category: "sleep",
    categoryLabel: "Pola Istirahat & Tidur",
    summary:
      "Durasi tidur kronis di bawah 6 jam per malam diasosiasikan dengan elevasi tonus simpatis nokturnal, ketiadaan fenomena nocturnal dipping tekanan darah alami, dan disregulasi hormon homeostasis nafsu makan (penurunan leptin, kenaikan ghrelin).",
    clinicalSection: "Pedoman Higiene Tidur dan Pencegahan Hipertensi Esensial",
    citation: "CDC Morbidity and Mortality Weekly Report (MMWR) / Pedoman Kemenkes RI.",
    externalUrl: "https://www.cdc.gov/sleep/",
  },
  {
    id: "evi-04",
    rule_id: "REC-SMK-01",
    title: "2021 ESC Guidelines on Cardiovascular Disease Prevention in Clinical Practice",
    organization: "European Society of Cardiology (ESC) & PERKI",
    year: 2021,
    evidence_level: "Level A (Kuat)",
    category: "cardiovascular",
    categoryLabel: "Kardiovaskular & Merokok",
    summary:
      "Penghentian kebiasaan merokok merupakan strategi preventif paling cost-effective dalam mengurangi stres oksidatif endotel vaskular. Penurunan risiko kejadian kardiovaskular akut tercapai hingga 50% dalam 1–2 tahun pasca penghentian total.",
    clinicalSection: "Section 3.2: Smoking and Substance Cessation",
    citation: "Visseren FLJ, Mach F, Smulders YM, et al. European Heart Journal 2021;42:3227-3337.",
    externalUrl: "https://www.escardio.org/Guidelines",
  },
  {
    id: "evi-05",
    rule_id: "REC-STR-01",
    title: "Psychological Health, Well-Being, and the Mind-Heart-Body Connection",
    organization: "American Heart Association (AHA)",
    year: 2021,
    evidence_level: "Level B (Sedang)",
    category: "stress",
    categoryLabel: "Manajemen Stres",
    summary:
      "Aktivasi stres psikososial berkepanjangan memicu pelepasan katekolamin dan kortisol kronis yang mempercepat kekakuan vaskular. Latihan pernapasan lambat terstruktur menstimulasi tonus vagal dan menurunkan rerata tekanan darah sistolik 4–6 mmHg.",
    clinicalSection: "AHA Scientific Statement: Stress and Cardiovascular System",
    citation: "Levine GN, Cohen BE, Commodore-Mensah Y, et al. Circulation 2021;143:e763-e783.",
    externalUrl: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000947",
  },
];

function EvidenceCenterContent() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");
  const diseaseParam = searchParams.get("disease");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [evidenceList, setEvidenceList] = useState<ClinicalEvidence[]>(EVIDENCE_DATABASE);

  // Fetch dynamic evidence records from backend
  useEffect(() => {
    let isCancelled = false;

    async function loadEvidence() {
      try {
        const res = await apiClient.evidence.list();
        if (!isCancelled && res.items && res.items.length > 0) {
          const mapped: ClinicalEvidence[] = res.items.map((i) => ({
            id: i.id,
            rule_id: i.rule_id,
            title: i.title,
            organization: i.organization,
            year: i.year,
            evidence_level: i.evidence_level,
            category: i.category,
            categoryLabel: i.category_label,
            summary: i.summary,
            clinicalSection: i.clinical_section,
            citation: i.citation,
            externalUrl: i.external_url,
          }));
          setEvidenceList(mapped);
        }
      } catch {
        // Silently preserve initial evidence database on network error
      }
    }

    loadEvidence();

    return () => {
      isCancelled = true;
    };
  }, []);

  const highlightedEvidenceId = useMemo(() => {
    if (!refParam && !diseaseParam) return null;

    if (refParam) {
      const found = evidenceList.find(
        (e) =>
          e.rule_id.toLowerCase() === refParam.toLowerCase() ||
          e.category.toLowerCase() === refParam.toLowerCase()
      );
      if (found) return found.id;
    }

    if (diseaseParam) {
      if (diseaseParam.includes("diabet")) {
        return "evi-02";
      }
      if (diseaseParam.includes("hyper") || diseaseParam.includes("hiper")) {
        return "evi-03";
      }
      if (diseaseParam.includes("cardio") || diseaseParam.includes("jantung")) {
        return "evi-04";
      }
    }

    return null;
  }, [refParam, diseaseParam, evidenceList]);

  // Effect performs DOM scroll without triggering re-render
  useEffect(() => {
    if (highlightedEvidenceId) {
      const el = document.getElementById(`evidence-${highlightedEvidenceId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedEvidenceId]);

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.citation.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, evidenceList]);

  return (
    <div className="space-y-8">
      {/* Title & Description */}
      <section className="space-y-2">
        <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
          Dasar Bukti Ilmiah (Clinical Evidence)
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-900">
              Pusat Bukti Medis Terakreditasi
            </h1>
            <p className="text-xs sm:text-sm text-brand-900/70 max-w-2xl mt-1 leading-relaxed">
              Repositori pedoman konsensus klinis resmi (WHO, PERKENI, AHA, CDC, Kemenkes RI) yang menjadi landasan formulasi model estimasi risiko dan rencana intervensi preventif HELIORA.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-bold text-brand-900/40 uppercase block">
              Standar Transparansi
            </span>
            <span className="text-xs font-mono font-semibold text-brand-900">
              PRD §8.13 & FR-029
            </span>
          </div>
        </div>
      </section>

      {/* Search and Category Filters */}
      <section className="space-y-4 pt-2 border-b border-brand-900/10 pb-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-brand-900/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pedoman, kata kunci, atau organisasi..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-brand-900/15 bg-white text-xs text-brand-900 placeholder:text-brand-900/40 focus:outline-none focus:ring-2 focus:ring-brand-700/30 transition-all"
          />
        </div>

        {/* Flat Category Buttons (Strict No Pill Chips) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-900/50 mr-2 uppercase">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>

          {[
            { id: "all", label: "Semua Bukti" },
            { id: "activity", label: "Aktivitas Fisik" },
            { id: "nutrition", label: "Nutrisi & Diet" },
            { id: "sleep", label: "Pola Tidur" },
            { id: "cardiovascular", label: "Kardiovaskular" },
            { id: "stress", label: "Manajemen Stres" },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                    : "bg-white text-brand-900/70 border-brand-900/15 hover:border-brand-900/30 hover:bg-neutral-50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Evidence Cards List */}
      <section className="space-y-5">
        {filteredEvidence.length > 0 ? (
          filteredEvidence.map((item) => {
            const isHighlighted = highlightedEvidenceId === item.id;

            return (
              <article
                id={`evidence-${item.id}`}
                key={item.id}
                className={`bg-white rounded-2xl border p-6 sm:p-7 shadow-xs space-y-4 transition-all duration-300 ${
                  isHighlighted
                    ? "border-brand-700/60 ring-2 ring-brand-700/30 bg-brand-50/20"
                    : "border-brand-900/10 hover:border-brand-900/25"
                }`}
              >
                {/* Meta Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-900/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                      [{item.categoryLabel.toUpperCase()}]
                    </span>
                    <span className="text-brand-900/20">•</span>
                    <span className="text-xs font-semibold text-brand-900">
                      {item.organization} ({item.year})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>TINGKAT BUKTI: {item.evidence_level.toUpperCase()}</span>
                  </div>
                </div>

                {/* Title & Clinical Section */}
                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-brand-900 leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs font-mono font-medium text-brand-900/60">
                    Bagian Terkait: {item.clinicalSection}
                  </p>
                </div>

                {/* Evidence Summary Box */}
                <div className="p-4 rounded-xl bg-brand-50/40 border border-brand-900/5 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-brand-900/50 uppercase block">
                    Ringkasan Temuan Klinis
                  </span>
                  <p className="text-xs text-brand-900/80 leading-relaxed font-normal">
                    {item.summary}
                  </p>
                </div>

                {/* Citation & Outbound Link */}
                <div className="pt-3 border-t border-brand-900/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-brand-900/60 font-mono">
                    <span className="font-semibold text-brand-900/70">Sitasi: </span>
                    <span>{item.citation}</span>
                  </div>

                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:underline shrink-0"
                  >
                    <span>Buka Sumber Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            );
          })
        ) : (
          <div className="p-10 rounded-2xl bg-white border border-brand-900/10 text-center space-y-2">
            <p className="text-sm font-semibold text-brand-900">
              Tidak ada bukti medis yang cocok dengan pencarian.
            </p>
            <p className="text-xs text-brand-900/60">
              Gunakan kata kunci yang lebih umum atau kosongkan kolom pencarian.
            </p>
          </div>
        )}
      </section>

      {/* Footer Disclaimer */}
      <footer className="pt-6 border-t border-brand-900/10">
        <DisclaimerBanner />
      </footer>
    </div>
  );
}

export default function EvidenceCenterPage() {
  const { isAuthorized } = useRequireAuth();

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <p className="text-sm font-medium text-brand-900/70">Memverifikasi otentikasi...</p>
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
              Evidence Center
            </span>
          </div>

          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:underline"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-900/60" />
            <span>Rencana Rekomendasi →</span>
          </Link>
        </div>
      </header>

      {/* Main Container wrapped in Suspense for searchParams */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-brand-900/60 font-mono">
              Memuat katalog bukti medis...
            </div>
          }
        >
          <EvidenceCenterContent />
        </Suspense>
      </main>
    </div>
  );
}
