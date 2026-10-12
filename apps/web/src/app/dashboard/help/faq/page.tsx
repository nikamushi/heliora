"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare as SFBubbleLeftRight,
  ChevronDown as SFChevronDown,
  Search as SFMagnifyingglass,
  Headphones as SFHeadphones,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

interface FAQItem {
  id: string;
  category: "ai" | "privacy" | "medical" | "account";
  question: string;
  answer: string;
  badge: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "medical",
    question: "Apakah hasil estimasi risiko HELIORA merupakan diagnosis medis resmi?",
    answer:
      "Bukan. HELIORA adalah platform kecerdasan buatan untuk skrining stratifikasi risiko preventif dan pendukung keputusan klinis (Clinical Decision Support). Seluruh angka probabilitas 10-tahun ditujukan untuk edukasi dan deteksi dini, bukan pengganti konsultasi, pemeriksaan fisik, atau diagnosis definitif dari dokter Anda.",
    badge: "Klinis & Medis",
  },
  {
    id: "faq-2",
    category: "ai",
    question: "Bagaimana algoritma AI HELIORA menghitung probabilitas 10-tahun penyakit kronis?",
    answer:
      "AI HELIORA memanfaatkan model machine learning terkalibrasi (ensemble gradient boosting) yang dilatih dan divalidasi terhadap dataset kohort longitudinal epidemiologis. Model mengintegrasikan parameter demografi, antropometri, profil lipid, glukosa puasa, tekanan darah, dan riwayat gaya hidup sesuai kaidah biostatistika internasional.",
    badge: "Metodologi AI",
  },
  {
    id: "faq-3",
    category: "ai",
    question: "Apa itu analisis Explainable AI (SHAP) dan mengapa itu penting bagi saya?",
    answer:
      "SHAP (SHapley Additive exPlanations) adalah metode teori permainan kooperatif untuk menjelaskan kontribusi matematis tiap biomarker terhadap skor risiko Anda. Dengan SHAP, HELIORA tidak berperilaku sebagai 'black box'—Anda dapat melihat persis biomarker mana yang paling menaikkan atau menurunkan skor risiko Anda.",
    badge: "Explainable AI",
  },
  {
    id: "faq-4",
    category: "privacy",
    question: "Bagaimana kerahasiaan dan privasi data kesehatan saya dilindungi?",
    answer:
      "Data rekam kesehatan dan biomarker Anda dilindungi dengan enkripsi end-to-end (AES-256 saat istirahat dan TLS 1.3 saat transit). HELIORA beroperasi dengan prinsip Mandatory Explicit Consent—data klinis Anda tidak pernah dibagikan atau diperjualbelikan kepada pihak ketiga tanpa izin persetujuan aktif Anda.",
    badge: "Keamanan Data",
  },
  {
    id: "faq-5",
    category: "medical",
    question: "Apakah saya harus berkonsultasi dengan dokter setelah melihat rekomendasi tindakan?",
    answer:
      "Sangat disarankan. Terutama jika estimasi risiko Anda berada di kategori Sedang (10-20%) atau Tinggi (>20%), atau jika biomarker Anda menunjukkan anomali kritis. Bawa ringkasan laporan HELIORA saat berkonsultasi untuk mempermudah dokter mendiskusikan rencana intervensi Anda.",
    badge: "Tindakan Medis",
  },
  {
    id: "faq-6",
    category: "account",
    question: "Seberapa sering saya harus memperbarui data biomarker dan profil kesehatan?",
    answer:
      "Idealnya setiap kali Anda melakukan tes laboratorium berkala (misalnya pemeriksaan HbA1c atau profil lipid setiap 3-6 bulan), atau setiap terjadi perubahan berat badan dan tekanan darah yang konsisten.",
    badge: "Profil & Akun",
  },
  {
    id: "faq-7",
    category: "ai",
    question: "Apakah simulator What-If dapat menjamin hasil penurunan risiko yang ditampilkan?",
    answer:
      "Simulator What-If memproyeksikan estimasi probabilistik berdasarkan temuan studi intervensi uji klinis acak (Randomized Controlled Trials). Meskipun akurat secara statistik kelompok, respons fisiologis individual dapat bervariasi bergantung pada faktor genetik dan kepatuhan gaya hidup.",
    badge: "Simulator",
  },
];

const CATEGORIES = [
  { id: "all", label: "Semua Topik" },
  { id: "medical", label: "Klinis & Medis" },
  { id: "ai", label: "AI & Explainability" },
  { id: "privacy", label: "Privasi & Consent" },
  { id: "account", label: "Akun & Profil" },
];

export default function HelpFAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 min-w-0 bg-neutral-50/40 min-h-screen">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-800 text-xs font-semibold">
            <SFBubbleLeftRight className="w-3.5 h-3.5 text-violet-600" />
            <span>Tanya Jawab &amp; Penjelasan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Temukan klarifikasi mendalam seputar validasi ilmiah, interpretasi model Explainable AI, keamanan rekam medis, dan penerapan rekomendasi klinis.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative">
              <SFMagnifyingglass className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pertanyaan, kata kunci biomarker, privasi, atau AI..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-neutral-200/80 bg-white space-y-2">
              <p className="text-sm font-semibold text-neutral-800">
                Tidak ada pertanyaan yang sesuai dengan pencarian Anda.
              </p>
              <p className="text-xs text-neutral-500">
                Coba gunakan kata kunci lain atau hubungi tim dukungan kami.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border transition-all duration-200 bg-white overflow-hidden ${
                    isOpen
                      ? "border-neutral-300 shadow-sm"
                      : "border-neutral-200/80 hover:border-neutral-300 shadow-2xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                        {item.question}
                      </h3>
                    </div>
                    <div className={`size-8 rounded-full border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180 bg-neutral-100 text-neutral-900" : ""}`}>
                      <SFChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-neutral-100 text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-2">
                      <p className="pt-3">{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Direct Banner */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-neutral-900">
              Pertanyaan Anda belum terjawab di sini?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              Hubungi tim dokter pendamping dan dukungan teknis HELIORA.
            </p>
          </div>
          <Link
            href="/dashboard/help/support"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            <SFHeadphones className="w-4 h-4" />
            <span>Pusat Bantuan &amp; Kontak</span>
          </Link>
        </div>

        {/* Clinical Disclaimer */}
        <DisclaimerBanner />
      </main>
    </div>
  );
}
