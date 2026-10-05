"use client";

import React from "react";
import Link from "next/link";
import {
  SFDocText,
  SFHeartTextSquare,
  SFWaveformPathEcg,
  SFShieldCheckmark,
  SFSlidersHorizontal,
  SFBookClosed,
  SFSparkles,
  SFArrowRight,
  SFPersonCropCircle,
} from "@/components/icons/sf-icons";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function HelpGuidePage() {
  const workflowSteps = [
    {
      step: "01",
      title: "Lengkapi & Perbarui Profil Klinis",
      desc: "Masukkan data demografi, antropometri (tinggi, berat badan), biomarker (tekanan darah, gula darah puasa, HbA1c, profil lipid), dan kebiasaan gaya hidup pada menu Personal.",
      badge: "Fondasi Analisis",
      icon: SFPersonCropCircle,
    },
    {
      step: "02",
      title: "Tinjau Estimasi Risiko 10-Tahun",
      desc: "Buka menu Jelajahi > Risiko untuk melihat proyeksi probabilitas penyakit kronis: Diabetes Melitus, Hipertensi, dan Kardiovaskular yang dihitung oleh model Machine Learning terkalibrasi.",
      badge: "Deteksi Dini",
      icon: SFWaveformPathEcg,
    },
    {
      step: "03",
      title: "Uji Intervensi di Simulator What-If",
      desc: "Eksplorasi skenario gaya hidup pada Jelajahi > Skenario. Lihat secara real-time bagaimana penurunan berat badan 3 kg atau kenaikan aktivitas fisik menurunkan skor risiko masa depan Anda.",
      badge: "Eksplorasi Preventif",
      icon: SFSlidersHorizontal,
    },
    {
      step: "04",
      title: "Jalankan Rekomendasi & Bukti Klinis",
      desc: "Akses Jelajahi > Tindakan untuk langkah intervensi harian terpersonalisasi, dan verifikasi rasionalitasnya pada Pusat Bukti berbasis pedoman ADA, JNC-8, dan ACC/AHA.",
      badge: "Aksi Terarah",
      icon: SFShieldCheckmark,
    },
  ];

  const featureGuides = [
    {
      title: "Ringkasan Klinis (Dashboard Hub)",
      desc: "Menampilkan kartu gambaran komposit kesehatan Anda, status verifikasi persetujuan data (consent), peringatan dini biomarker kritis, dan tanggal skrining terakhir.",
      icon: SFHeartTextSquare,
      color: "text-blue-600",
      bg: "bg-blue-50/70 border-blue-100",
      tips: "Periksa kartu ringkasan setiap kali Anda selesai memperbarui biomarker di laboratorium.",
    },
    {
      title: "Analisis Risiko Multi-Penyakit (Risiko)",
      desc: "Menyediakan breakdown mendalam untuk 3 kategori penyakit kronis utama di Asia Tenggara: Diabetes Melitus Tipe 2, Hipertensi Esensial, dan Penyakit Kardiovaskular (ASCVD).",
      icon: SFWaveformPathEcg,
      color: "text-rose-600",
      bg: "bg-rose-50/70 border-rose-100",
      tips: "Grafik spider / gauge menunjukkan tingkat risiko: Rendah (<10%), Sedang (10-20%), atau Tinggi (>20%).",
    },
    {
      title: "Simulator What-If & Proyeksi Horison",
      desc: "Mesin simulasi kausal yang memproyeksikan lintasan kesehatan 5 hingga 10 tahun ke depan berdasarkan variasi parameter gaya hidup yang dapat Anda kendalikan.",
      icon: SFSlidersHorizontal,
      color: "text-violet-600",
      bg: "bg-violet-50/70 border-violet-100",
      tips: "Gunakan slider interaktif untuk menetapkan target realistis yang dapat dicapai dalam 6 bulan.",
    },
    {
      title: "Pusat Bukti & Explainable AI (SHAP)",
      desc: "Menjelaskan transparansi penuh alasan di balik setiap angka prediksi AI menggunakan atribusi nilai SHAP (SHapley Additive exPlanations) dan rujukan literatur klinis.",
      icon: SFBookClosed,
      color: "text-amber-600",
      bg: "bg-amber-50/70 border-amber-100",
      tips: "Lihat faktor kontributor teratas untuk mengetahui parameter mana yang paling memengaruhi risiko Anda.",
    },
  ];

  return (
    <div className="flex-1 min-w-0 bg-neutral-50/40 min-h-screen">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-semibold">
            <SFDocText className="w-3.5 h-3.5 text-blue-600" />
            <span>Dokumentasi &amp; Panduan Pengguna</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Panduan Penggunaan HELIORA
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
            Panduan langkah demi langkah untuk memaksimalkan fitur analitik kesehatan preventif, simulasi intervensi gaya hidup, dan interpretasi penjelasan klinis berbasis AI.
          </p>
        </div>

        {/* Section 1: 4-Step Workflow */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              Alur Kerja Utama (4 Langkah Sederhana)
            </h2>
            <span className="text-xs text-neutral-400 font-mono">SOP Klinis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowSteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="p-5.5 rounded-3xl border border-neutral-200/80 bg-white shadow-xs space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-brand-900 px-2.5 py-1 rounded-xl bg-brand-50 border border-brand-100">
                        LANGKAH {step.step}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                        {step.badge}
                      </span>
                    </div>
                    <StepIcon className="w-5 h-5 text-neutral-400" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-neutral-900">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Detailed Feature Breakdown */}
        <section className="space-y-4 pt-2">
          <h2 className="text-lg font-bold text-neutral-900">
            Panduan Fitur Aplikasi Secara Mendalam
          </h2>

          <div className="space-y-4">
            {featureGuides.map((guide) => {
              const GuideIcon = guide.icon;
              return (
                <div
                  key={guide.title}
                  className="p-6 rounded-3xl border border-neutral-200/80 bg-white shadow-xs space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`size-11 rounded-2xl border ${guide.bg} flex items-center justify-center shrink-0 ${guide.color}`}>
                      <GuideIcon className="w-5.5 h-5.5" />
                    </div>
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h3 className="text-base font-bold text-neutral-900">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {guide.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pl-4 py-2.5 px-3.5 bg-neutral-50 rounded-2xl border-l-3 border-brand-900 text-xs text-neutral-700 flex items-center gap-2">
                    <SFSparkles className="w-4 h-4 text-brand-900 shrink-0" />
                    <span><strong className="font-semibold text-neutral-900">Tips Klinis:</strong> {guide.tips}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Next Actions & FAQ bridge */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-neutral-900">
              Masih memiliki pertanyaan seputar metrik atau AI?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500">
              Pelajari rincian metodologi, keamanan data, dan jawaban atas pertanyaan umum di halaman FAQ kami.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/help/faq"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Buka Tanya Jawab (FAQ)</span>
              <SFArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <DisclaimerBanner />
      </main>
    </div>
  );
}
