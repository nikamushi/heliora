"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText as SFDocText,
  MessageSquare as SFBubbleLeftRight,
  Headphones as SFHeadphones,
  ChevronRight as SFChevronRight,
  Search as SFMagnifyingglass,
  Sparkles as SFSparkles,
  BookOpen as SFBookClosed,
  Info as SFInfoCircle,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function HelpCenterHubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const quickLinks = [
    {
      title: "Tentang HELIORA",
      description: "Visi pencegahan kesehatan, arsitektur Explainable AI, versi sistem, dan kepatuhan privasi.",
      href: "/dashboard/help/about",
      icon: SFInfoCircle,
      color: "text-amber-600",
      bg: "bg-amber-50/80 border-amber-100",
      badge: "Info Sistem",
    },
    {
      title: "Panduan Penggunaan",
      description: "Pelajari cara kerja sistem, input biomarker, simulasi What-If, dan interpretasi risiko.",
      href: "/dashboard/help/guide",
      icon: SFDocText,
      color: "text-blue-600",
      bg: "bg-blue-50/80 border-blue-100",
      badge: "Langkah demi Langkah",
    },
    {
      title: "Tanya Jawab (FAQ)",
      description: "Jawaban atas pertanyaan umum seputar akurasi AI klinis, validasi medis, dan privasi data.",
      href: "/dashboard/help/faq",
      icon: SFBubbleLeftRight,
      color: "text-violet-600",
      bg: "bg-violet-50/80 border-violet-100",
      badge: "Klinis & Teknis",
    },
    {
      title: "Hubungi Dukungan",
      description: "Konsultasi teknis dengan tim HELIORA, pelaporan kendala sistem, atau umpan balik pengguna.",
      href: "/dashboard/help/support",
      icon: SFHeadphones,
      color: "text-emerald-600",
      bg: "bg-emerald-50/80 border-emerald-100",
      badge: "Respon Cepat",
    },
  ];

  const popularTopics = [
    {
      label: "Bagaimana cara membaca estimasi risiko 10-tahun?",
      href: "/dashboard/help/faq#interpretasi-risiko",
    },
    {
      label: "Apakah rekomendasi tindakan langsung menggantikan resep dokter?",
      href: "/dashboard/help/faq#rekomendasi-dokter",
    },
    {
      label: "Cara melakukan eksperimen intervensi gaya hidup di Simulator What-If",
      href: "/dashboard/help/guide#simulator-what-if",
    },
    {
      label: "Standar pedoman klinis yang digunakan HELIORA (ADA, JNC-8, ACC/AHA)",
      href: "/dashboard/evidence",
    },
  ];

  const filteredLinks = quickLinks.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-w-0 bg-neutral-50/40 min-h-screen">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/60 uppercase">
              Pusat Bantuan &amp; Panduan
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Bagaimana kami dapat membantu Anda hari ini?
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Temukan petunjuk navigasi aplikasi, pemahaman skor risiko kesehatan preventif, transparansi Explainable AI, atau hubungi tim kami.
            </p>

            {/* Quick Search */}
            <div className="pt-2">
              <div className="relative max-w-lg">
                <SFMagnifyingglass className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari topik panduan, FAQ, atau bantuan..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-50/50 to-transparent pointer-events-none hidden md:block" />
        </div>

        {/* 4 Main Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group p-6 rounded-3xl border border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`size-12 rounded-2xl border ${item.bg} flex items-center justify-center ${item.color} shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-neutral-500 uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 group-hover:text-brand-900 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-neutral-100 flex items-center gap-1.5 text-xs font-semibold text-brand-900 group-hover:translate-x-0.5 transition-transform">
                  <span>Buka Halaman</span>
                  <SFChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Popular Topics & Direct Links */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <SFBookClosed className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-neutral-900">
              Topik Populer &amp; Pertanyaan Kerap Diajukan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {popularTopics.map((topic, idx) => (
              <Link
                key={idx}
                href={topic.href}
                className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-100/80 hover:border-neutral-200 transition-colors flex items-center justify-between gap-3 group"
              >
                <span className="text-sm text-neutral-700 font-medium group-hover:text-neutral-900">
                  {topic.label}
                </span>
                <SFChevronRight className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-700 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <DisclaimerBanner />
      </main>
    </div>
  );
}
