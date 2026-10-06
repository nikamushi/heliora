"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
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

const DISEASE_TO_EVIDENCE_MAP: Record<string, string> = {
  diabetes: "evi-02",
  hypertension: "evi-07",
  cardiovascular: "evi-04",
};

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
  {
    id: "evi-06",
    rule_id: "REC-ACT-02",
    title: "2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease",
    organization: "American College of Cardiology / AHA",
    year: 2019,
    evidence_level: "Level A (Kuat)",
    category: "activity",
    categoryLabel: "Aktivitas Fisik",
    summary:
      "Aktivitas fisik berintensitas sedang minimal 150 menit/minggu atau 75 menit/minggu intensitas tinggi secara substansial menurunkan risiko arteriosklerosis dan mortalitas vaskular dini pada populasi dewasa umum.",
    clinicalSection: "Section 3: Physical Activity and Exercise Recommendations",
    citation: "Arnett DK, Blumenthal RS, Albert MA, et al. J Am Coll Cardiol 2019;74:e177-e232.",
    externalUrl: "https://www.jacc.org/doi/10.1016/j.jacc.2019.03.010",
  },
  {
    id: "evi-07",
    rule_id: "REC-NUT-02",
    title: "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular",
    organization: "Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PERKI)",
    year: 2021,
    evidence_level: "Level A (Kuat)",
    category: "nutrition",
    categoryLabel: "Nutrisi & Diet",
    summary:
      "Modifikasi gaya hidup melalui restriksi garam harian (< 5 g NaCl atau < 2 g Natrium), diet kaya kalium, pemeliharaan BMI ideal (18.5–22.9 kg/m2 standar Asia Pasifik), dan pembatasan alkohol dapat menurunkan tekanan darah sistolik sebesar 5–11 mmHg.",
    clinicalSection: "Bab 5: Terapi Non-Farmakologis dan Pola Hidup Sehat",
    citation: "Panduan Tata Laksana Hipertensi, Pengurus Pusat PERKI, 2021.",
    externalUrl: "https://www.inaheart.org/",
  },
  {
    id: "evi-08",
    rule_id: "REC-NUT-03",
    title: "Standards of Care in Diabetes: Facilitating Positive Health Behaviors",
    organization: "American Diabetes Association (ADA)",
    year: 2024,
    evidence_level: "Level A (Kuat)",
    category: "nutrition",
    categoryLabel: "Nutrisi & Diet",
    summary:
      "Pendekatan terpadu pola makan berbasis Mediterranean atau DASH diet dengan fokus sayuran non-tepung, biji-bijian utuh, dan pengurangan konsumsi minuman berpemanis gula (SSBs) efektif menurunkan HbA1c dan profil inflamasi vaskular.",
    clinicalSection: "Section 5: Facilitating Positive Health Behaviors and Well-being",
    citation: "American Diabetes Association. Diabetes Care 2024;47(Suppl 1):S77-S110.",
    externalUrl: "https://diabetesjournals.org/care/issue/47/Supplement_1",
  },
  {
    id: "evi-09",
    rule_id: "REC-SLP-02",
    title: "National Sleep Foundation's Sleep Duration Recommendations & Cardiometabolic Health",
    organization: "National Sleep Foundation (NSF)",
    year: 2020,
    evidence_level: "Level A (Kuat)",
    category: "sleep",
    categoryLabel: "Pola Istirahat & Tidur",
    summary:
      "Rentang durasi tidur harian yang direkomendasikan untuk orang dewasa (18–64 tahun) adalah 7–9 jam. Deviasi kronis (< 6 jam atau > 10 jam) secara independen dikaitkan dengan peningkatan risiko sindrom metabolik dan kalsifikasi arteri koroner.",
    clinicalSection: "Consensus Statement on Healthy Sleep Duration",
    citation: "Hirshkowitz M, Whiton K, Albert SM, et al. Sleep Health 2015;1(1):40-43.",
    externalUrl: "https://www.sleephealthjournal.org/",
  },
  {
    id: "evi-10",
    rule_id: "REC-NUT-04",
    title: "WHO Guideline: Sodium Intake for Adults and Children",
    organization: "World Health Organization (WHO)",
    year: 2023,
    evidence_level: "Level A (Kuat)",
    category: "nutrition",
    categoryLabel: "Nutrisi & Diet",
    summary:
      "WHO merekomendasikan pengurangan asupan natrium hingga < 2.000 mg/hari (setara dengan < 5 g garam per hari) pada orang dewasa guna menekan prevalensi stroke, penyakit jantung koroner, dan kerusakan ginjal hipertensif.",
    clinicalSection: "Executive Summary: Recommended Global Sodium Benchmarks",
    citation: "WHO Global Report on Sodium Intake Reduction. Geneva: World Health Organization; 2023.",
    externalUrl: "https://www.who.int/publications/i/item/9789240069985",
  },
  {
    id: "evi-11",
    rule_id: "REC-NUT-05",
    title: "Dietary Guidance to Improve Cardiovascular Health: A Scientific Statement From the AHA",
    organization: "American Heart Association (AHA)",
    year: 2022,
    evidence_level: "Level A (Kuat)",
    category: "nutrition",
    categoryLabel: "Nutrisi & Diet",
    summary:
      "Pola makan ramah jantung menekankan keseimbangan energi, ragam sayur-buahan utuh, protein nabati (kacang-kacangan), minyak nabati non-tropis, serta makanan olahan minimal (ultra-processed foods minimization).",
    clinicalSection: "Core Tenets of Cardioprotective Dietary Patterns",
    citation: "Lichtenstein AH, Appel LJ, Vadiveloo M, et al. Circulation 2021;144:e472-e487.",
    externalUrl: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001031",
  },
  {
    id: "evi-12",
    rule_id: "REC-CVD-01",
    title: "2023 ESC Guidelines for the Management of Cardiovascular Disease in Patients with Diabetes",
    organization: "European Society of Cardiology (ESC)",
    year: 2023,
    evidence_level: "Level A (Kuat)",
    category: "cardiovascular",
    categoryLabel: "Kardiovaskular & Merokok",
    summary:
      "Pencegahan kardiometabolik primer memerlukan stratifikasi risiko SCORE2-Diabetes, target tekanan darah < 130/80 mmHg, optimasi gaya hidup terpadu, dan edukasi self-monitoring berkala untuk mencegah komplikasi mikrovaskular.",
    clinicalSection: "Section 4: Lifestyle and Risk Factor Management",
    citation: "Marx N, Federici M, Schütt K, et al. Eur Heart J 2023;44:4043-4140.",
    externalUrl: "https://www.escardio.org/Guidelines",
  },
  {
    id: "evi-13",
    rule_id: "REC-ACT-03",
    title: "Exercise Prescription for Cardiometabolic Health and Prevention",
    organization: "American College of Sports Medicine (ACSM)",
    year: 2021,
    evidence_level: "Level B (Sedang)",
    category: "activity",
    categoryLabel: "Aktivitas Fisik",
    summary:
      "Kombinasi latihan aerobik dan latihan resistensi beban sedang 2–3 kali per minggu memberikan adaptasi mitokondria otot maksimal, meningkatkan sensitivitas insulin perifer hingga 48 jam pasca latihan, dan memperbaiki komposisi massa tubuh.",
    clinicalSection: "ACSM Guidelines for Exercise Testing and Prescription (11th Ed)",
    citation: "American College of Sports Medicine. Wolters Kluwer, 2021.",
    externalUrl: "https://www.acsm.org/",
  },
  {
    id: "evi-14",
    rule_id: "REC-MET-01",
    title: "Petunjuk Praktis Terapi Medis Gizi dan Latihan Jasmani pada Diabetes Melitus",
    organization: "PB PERKENI",
    year: 2021,
    evidence_level: "Level A (Kuat)",
    category: "nutrition",
    categoryLabel: "Nutrisi & Diet",
    summary:
      "Prinsip 3J (Jadwal, Jumlah, dan Jenis) makanan merupakan pilar utama manajemen gizi preventif di Indonesia. Jadwal makan teratur 3 kali utama dan 2–3 kali selingan mencegah hipoglikemia nocturnal dan lonjakan gula darah postprandial.",
    clinicalSection: "Bab III: Penataan Piring Sehat Model Indonesia",
    citation: "Petunjuk Praktis Terapi Gizi Medis pada Pasien DM, PB PERKENI 2021.",
    externalUrl: "https://pbperkeni.or.id/",
  },
  {
    id: "evi-15",
    rule_id: "REC-SMK-02",
    title: "Treating Tobacco Use and Dependence: Clinical Practice Guideline",
    organization: "World Health Organization (WHO) & Kemenkes RI",
    year: 2022,
    evidence_level: "Level A (Kuat)",
    category: "cardiovascular",
    categoryLabel: "Kardiovaskular & Merokok",
    summary:
      "Konseling terstruktur dan intervensi perubahan perilaku pada perokok aktif memulihkan fungsi vasodilatasi endotel dalam hitungan minggu serta menurunkan agregasi trombosit yang memicu trombosis arteri koroner.",
    clinicalSection: "Guideline for Tobacco Cessation Interventions in Primary Care",
    citation: "WHO Tobacco Free Initiative / Pedoman Upaya Berhenti Merokok Kemenkes RI.",
    externalUrl: "https://www.who.int/health-topics/tobacco",
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
          e.id.toLowerCase() === refParam.toLowerCase() ||
          e.category.toLowerCase() === refParam.toLowerCase()
      );
      if (found) return found.id;
    }

    if (diseaseParam) {
      const norm = diseaseParam.toLowerCase();
      const mappedId = DISEASE_TO_EVIDENCE_MAP[norm];
      if (mappedId) return mappedId;
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
        <span className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
          Dasar Bukti Ilmiah (Clinical Evidence)
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-900">
              Pusat Bukti Medis Terakreditasi
            </h1>
            <p className="text-xs sm:text-sm text-brand-900/70 max-w-2xl mt-1 leading-relaxed">
              Repositori pedoman konsensus klinis resmi (WHO, PERKENI, AHA, ESC, CDC, Kemenkes RI) yang menjadi landasan formulasi model estimasi risiko dan intervensi preventif HELIORA.
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

        {/* Filter Categories — Strict No Pill Chips (Rectangular editorial buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-900/50 mr-2 uppercase">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>

          {[
            { id: "all", label: "Semua Kategori" },
            { id: "activity", label: "Aktivitas Fisik" },
            { id: "sleep", label: "Pola Istirahat" },
            { id: "nutrition", label: "Nutrisi & Diet" },
            { id: "cardiovascular", label: "Kardiovaskular" },
            { id: "stress", label: "Manajemen Stres" },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected
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

      {/* Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-brand-900/60 font-mono">
          <span>Menampilkan {filteredEvidence.length} pedoman terakreditasi</span>
          <span>Diperbarui per konsensus 2020–2024</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredEvidence.map((evidence) => {
            const isTargeted = highlightedEvidenceId === evidence.id;

            return (
              <article
                id={`evidence-${evidence.id}`}
                key={evidence.id}
                className={`bg-white rounded-2xl border p-6 sm:p-7 shadow-xs space-y-4 transition-all duration-300 ${
                  isTargeted
                    ? "border-brand-900/40 ring-2 ring-brand-900/25 bg-brand-50/20 shadow-md"
                    : "border-brand-900/10 hover:border-brand-900/25"
                }`}
              >
                {/* Header: Organization & Level */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-900/5 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-brand-900/60">
                    <span className="font-bold text-brand-900">{evidence.organization}</span>
                    <span>•</span>
                    <span>Tahun {evidence.year}</span>
                    <span>•</span>
                    <span className="text-brand-900/40 uppercase">[{evidence.categoryLabel}]</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{evidence.evidence_level}</span>
                  </div>
                </div>

                {/* Title & Section */}
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-brand-900">
                    {evidence.title}
                  </h2>
                  <p className="text-xs font-mono text-brand-900/50">
                    Rujukan Bagian: {evidence.clinicalSection}
                  </p>
                </div>

                {/* Clinical Summary */}
                <div className="p-4 rounded-xl bg-brand-50/30 border border-brand-900/5 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
                    Ringkasan Klinis &amp; Rekomendasi
                  </span>
                  <p className="text-xs sm:text-sm text-brand-900/80 leading-relaxed">
                    {evidence.summary}
                  </p>
                </div>

                {/* Footer Citation & Link */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] font-mono text-brand-900/50 truncate max-w-xl">
                    Sitasi: {evidence.citation}
                  </div>

                  <a
                    href={evidence.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:text-brand-700 underline underline-offset-4 shrink-0"
                  >
                    <span>Buka Sumber Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Medical Disclaimer Banner */}
      <footer className="pt-6 border-t border-brand-900/10">
        <DisclaimerBanner variant="banner" />
      </footer>
    </div>
  );
}

export default function EvidenceCenterPage() {
  const { isAuthorized } = useRequireAuth();

  if (!isAuthorized) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-center p-6 min-h-[50vh]">
        <p className="text-sm font-medium text-brand-900/70">Memverifikasi otentikasi...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
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
