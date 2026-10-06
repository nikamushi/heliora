"use client";

import React from "react";
import Link from "next/link";
import {
  SFInfoCircle,
  SFSparkles,
  SFShieldCheckmark,
  SFBookClosed,
  SFChevronRight,
} from "@/components/icons/sf-icons";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function HelpAboutPage() {
  const systemSpecs = [
    { label: "Versi Aplikasi", value: "HELIORA v1.4.0 (Clinical Core)" },
    { label: "Mesin Inferensi AI", value: "Multi-Disease Ensemble Model v2.1" },
    { label: "Protokol Explainability", value: "Tree & Kernel SHAP (Shapley Values)" },
    { label: "Pedoman Klinis Acuan", value: "ADA 2024, JNC-8, ACC/AHA 2019" },
    { label: "Standar Keamanan Data", value: "AES-256 Encryption & TLS 1.3" },
    { label: "Kepatuhan Privasi", value: "Mandatory Explicit Consent (PDPA Compliant)" },
  ];

  const pillars = [
    {
      title: "Pencegahan Berbasis Bukti",
      desc: "Setiap skor risiko dan rekomendasi gaya hidup berakar dari uji klinis acak dan pedoman konsensus internasional.",
      icon: SFBookClosed,
      color: "text-blue-600",
      bg: "bg-blue-50/70 border-blue-100",
    },
    {
      title: "Explainable AI (Bukan Black-Box)",
      desc: "Memberikan transparansi penuh mengenai faktor biomarker apa yang memengaruhi probabilitas kesehatan Anda.",
      icon: SFSparkles,
      color: "text-violet-600",
      bg: "bg-violet-50/70 border-violet-100",
    },
    {
      title: "Privasi & Kedaulatan Pasien",
      desc: "Data biomarker Anda hanya diproses setelah persetujuan eksplisit dan tidak pernah dikomersialkan kepada pihak ketiga.",
      icon: SFShieldCheckmark,
      color: "text-emerald-600",
      bg: "bg-emerald-50/70 border-emerald-100",
    },
  ];

  return (
    <div className="flex-1 min-w-0 bg-neutral-50/40 min-h-screen">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-brand-900 text-white flex items-center justify-center text-base font-bold shadow-xs">
              H
            </span>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-neutral-900 block leading-tight">
                HELIORA
              </span>
              <span className="text-xs text-neutral-400 font-medium block leading-tight mt-0.5">
                Preventive Health Intelligence AI
              </span>
            </div>
          </div>

          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Mewujudkan Deteksi Dini yang Cerdas, Transparan, dan Terpersonalisasi
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              HELIORA adalah platform komputasi kesehatan preventif yang mengintegrasikan pemodelan risiko multi-penyakit kronis (Diabetes Melitus, Hipertensi, dan Kardiovaskular) dengan transparansi Explainable AI guna memberdayakan individu dan tenaga medis dalam mengambil tindakan preventif yang presisi.
            </p>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-3xl border border-neutral-200/80 bg-white shadow-xs space-y-3.5"
              >
                <div className={`size-11 rounded-2xl border ${pillar.bg} flex items-center justify-center shrink-0 ${pillar.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-neutral-900">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Specifications Card */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <SFInfoCircle className="w-5 h-5 text-neutral-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Informasi &amp; Spesifikasi Sistem
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Build Stable
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
            {systemSpecs.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between py-1.5 border-b border-neutral-50 sm:border-none">
                <span className="text-xs font-medium text-neutral-500">
                  {spec.label}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-900 text-right">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links / Feedback */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-neutral-900">
              Ada masukan atau ingin berkolaborasi?
            </h3>
            <p className="text-xs text-neutral-500">
              Kami terbuka terhadap masukan dari praktisi klinis, peneliti, dan pengguna.
            </p>
          </div>
          <Link
            href="/dashboard/help/support"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold transition-colors shrink-0"
          >
            <span>Hubungi Tim HELIORA</span>
            <SFChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clinical Disclaimer */}
        <DisclaimerBanner />
      </main>
    </div>
  );
}
