"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { 
  IconHeartbeat,
  IconArrowRight,
  IconSparkles,
  IconShieldCheck,
  IconChartDots,
  IconAdjustmentsHorizontal,
  IconHistory,
  IconLock,
  IconAlertCircle,
  IconCheck
} from "@tabler/icons-react";

// Fluid animation variants adhering to Apple HIG motion curves
const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.7,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    }
  })
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200">
      <Navbar />

      <main className="pt-28 pb-16 overflow-hidden">
        {/* HERO SECTION */}
        <section className="container mx-auto px-6 lg:px-12 pt-14 lg:pt-20 pb-20 text-center relative">
          {/* Ambient Glow */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[420px] bg-brand-400/10 blur-[130px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <motion.h1 
              custom={1} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-brand-900 text-balance leading-[1.05]"
            >
              Kesehatan Anda, <br />
              <span className="text-brand-400">Dapat Diprediksi.</span>
            </motion.h1>
            
            <motion.p 
              custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-lg sm:text-xl md:text-2xl text-brand-900/65 max-w-2xl mx-auto text-balance leading-relaxed font-medium"
            >
              Jutaan data medis dan pola gaya hidup diolah secara real-time. Pahami risiko kardiometabolik Anda bertahun-tahun sebelum menjadi keluhan klinis.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              custom={3} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
            >
              <Link href="/register">
                <Button className="h-14 px-8 rounded-2xl bg-brand-900 hover:bg-brand-900/90 text-white text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-900/15 flex items-center gap-2">
                  <span>Mulai Assessment Gratis</span>
                  <IconArrowRight size={18} />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-brand-900/15 bg-white/70 backdrop-blur-md hover:bg-brand-50/80 text-brand-900 text-base font-semibold transition-all">
                  Pelajari Cara Kerjanya
                </Button>
              </Link>
            </motion.div>

            {/* Apple HIG Glassmorphic Interactive Preview Card */}
            <motion.div 
              custom={4} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="pt-10 max-w-2xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-2xl border border-brand-900/10 rounded-3xl p-6 md:p-8 shadow-[0_16px_40px_rgb(0,0,0,0.04)] text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-brand-900/50 font-bold">
                      Simulasi Skor Prediktif
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-700">
                      • Status Risiko Rendah
                    </span>
                  </div>
                  <div className="text-xl font-bold text-brand-900">
                    Indeks Stabilitas Metabolik: 88/100
                  </div>
                  <p className="text-xs text-brand-900/60 leading-relaxed max-w-sm">
                    Kombinasi 7.5 jam tidur konsisten dan aktivitas fisik harian memangkas risiko dislipidemia hingga 31%.
                  </p>
                </div>

                <div className="shrink-0 w-full md:w-auto flex md:flex-col items-center justify-between md:justify-center p-4 rounded-2xl bg-brand-50/60 border border-brand-900/5 text-center">
                  <span className="text-2xl font-black tracking-tight text-brand-900">+5.8 Thn</span>
                  <span className="text-[10px] font-medium text-brand-900/50">Proyeksi Longevity</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROBLEM SECTION (Bento 3-Card Grid) */}
        <section className="container mx-auto px-6 lg:px-12 py-20">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase mb-3">
              01 / TANTANGAN GAYA HIDUP
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-900 leading-tight">
              Mengapa Deteksi Dini Sering Kali Terlambat?
            </h2>
            <p className="text-base sm:text-lg text-brand-900/60 mt-3 font-medium">
              Sistem medis konvensional bertindak setelah gejala muncul. Heliora menutup celah tersebut.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pain Point 1 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-6 group hover:border-brand-900/20 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                  PROBLEM 01
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  Data Terfragmentasi
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Data tidur di smartwatch, rekam lab lama di laci, dan pola makan harian terpisah tanpa korelasi terpadu. Tanpa integrasi, risiko tak teridentifikasi.
                </p>
              </div>
              <div className="text-xs text-brand-900/50 pt-4 border-t border-brand-900/5 font-medium">
                Solusi: Agregasi biomarker otomatis
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-6 group hover:border-brand-900/20 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                  PROBLEM 02
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  Perkembangan Senyap
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Gangguan metabolik dan kardiovaskular berkembang selama 5-10 tahun tanpa rasa sakit fisik hingga tiba-tiba memasuki stadium kritis.
                </p>
              </div>
              <div className="text-xs text-brand-900/50 pt-4 border-t border-brand-900/5 font-medium">
                Solusi: Deteksi anomali probabilitas AI
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-6 group hover:border-brand-900/20 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                  PROBLEM 03
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  Kecemasan Diagnostik
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Ketakutan akan vonis klinis membuat orang enggan memeriksakan diri. HELIORA menawarkan ruang aman berorientasi aksi preventif yang menenangkan.
                </p>
              </div>
              <div className="text-xs text-brand-900/50 pt-4 border-t border-brand-900/5 font-medium">
                Solusi: Edukasi non-alarmist terukur
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP NARRATIVE CLINICAL JOURNEY */}
        <section id="features" className="container mx-auto px-6 lg:px-12 py-20">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase mb-3">
              02 / ALUR KERJA KLINIS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-900 leading-tight">
              Tiga Tahap Perlindungan Preventif
            </h2>
            <p className="text-base sm:text-lg text-brand-900/60 mt-3 font-medium">
              Bagaimana data biometrik Anda diolah menjadi wawasan kesehatan presisi tanpa mengorbankan privasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* STEP 1: SINKRONISASI */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-brand-900/10 shadow-sm hover:shadow-md hover:border-brand-900/20 transition-all flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                    01 / SINKRONISASI
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-700">• Live</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-900 mb-2 tracking-tight">
                    Integrasi Wearables
                  </h3>
                  <p className="text-brand-900/65 text-sm leading-relaxed">
                    Hubungkan Apple Health, Garmin, atau Oura. Metrik detak jantung istirahat, durasi tidur pulas, dan langkah disinkronkan tanpa input manual.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-900/10">
                <p className="text-xs font-medium text-brand-900/50 mb-2">Platform Didukung</p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-medium text-brand-900/80">
                  <span>Apple Health</span>
                  <span className="text-brand-900/30">/</span>
                  <span>Oura Ring</span>
                  <span className="text-brand-900/30">/</span>
                  <span>Garmin</span>
                </div>
              </div>
            </div>

            {/* STEP 2: ANALISIS PREDIKTIF */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-brand-900/10 shadow-sm hover:shadow-md hover:border-brand-900/20 transition-all flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                    02 / ANALISIS AI
                  </span>
                  <span className="text-xs font-mono font-semibold text-brand-900/70">
                    AUC-ROC 0.982
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-900 mb-2 tracking-tight">
                    Deteksi Risiko Dini
                  </h3>
                  <p className="text-brand-900/65 text-sm leading-relaxed">
                    Model terlatih jutaan catatan epidemiologi mendeteksi pergeseran biomarker metabolik sebelum memicu hipertensi maupun resistensi insulin.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-900/10 flex items-baseline justify-between">
                <div>
                  <p className="text-xs font-medium text-brand-900/50">Akurasi Validasi</p>
                  <p className="text-2xl font-extrabold text-brand-900 tracking-tight mt-0.5">98.2%</p>
                </div>
                <span className="text-xs font-semibold text-brand-900/60">Data CDC BRFSS</span>
              </div>
            </div>

            {/* STEP 3: PRIVASI MUTLAK */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-brand-900/10 shadow-sm hover:shadow-md hover:border-brand-900/20 transition-all flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase">
                    03 / PRIVASI DATA
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-700">
                    Terenkripsi E2E
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-900 mb-2 tracking-tight">
                    Standar Privasi HIPAA
                  </h3>
                  <p className="text-brand-900/65 text-sm leading-relaxed">
                    Data Anda dienkripsi AES-256 GCM secara lokal. Kami menerapkan arsitektur zero-knowledge: data Anda tidak pernah dijual atau dibagikan.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-900/10">
                <p className="text-xs font-medium text-brand-900/50 mb-2">Protokol Keamanan</p>
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-brand-900/80">
                  <span>AES-256 GCM</span>
                  <span className="text-brand-900/30">/</span>
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KILLER FEATURES BENTO SPOTLIGHT */}
        <section className="container mx-auto px-6 lg:px-12 py-20">
          <div className="mb-14 max-w-3xl">
            <p className="text-xs font-mono font-bold tracking-widest text-brand-900/40 uppercase mb-3">
              03 / FITUR UTAMA
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-900 leading-tight">
              Eksplorasi Masa Depan Kesehatan Anda
            </h2>
            <p className="text-base sm:text-lg text-brand-900/60 mt-3 font-medium">
              Dua modul simulasi interaktif yang menjadikan kesehatan terprediksi dan dapat dikendalikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Future Health Simulation */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-brand-900/20 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-900 border border-brand-900/10">
                  <IconHistory size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-900 tracking-tight">
                  Future Health Simulation
                </h3>
                <p className="text-sm sm:text-base text-brand-900/65 leading-relaxed">
                  Lihat proyeksi kurva risiko kardiometabolik Anda dalam rentang 30, 90, hingga 180 hari ke depan apabila pola kebiasaan saat ini tidak disesuaikan.
                </p>
              </div>

              {/* Bento Mockup Preview */}
              <div className="bg-brand-50/40 rounded-2xl p-5 border border-brand-900/5 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-brand-900">
                  <span>Hari ke-30</span>
                  <span>Hari ke-90</span>
                  <span className="text-brand-900/40">Hari ke-180</span>
                </div>
                <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-2/3" />
                </div>
                <p className="text-[11px] text-brand-900/60">
                  Simulasi menunjukkan stabilisasi risiko pada deviasi tidur &lt; 30 menit per minggu.
                </p>
              </div>
            </div>

            {/* Feature 2: What-if Simulation Engine */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-8 relative overflow-hidden group hover:border-brand-900/20 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-900 border border-brand-900/10">
                  <IconAdjustmentsHorizontal size={24} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-900 tracking-tight">
                  What-if Simulation Engine
                </h3>
                <p className="text-sm sm:text-base text-brand-900/65 leading-relaxed">
                  Coba skenario nyata: apa yang terjadi jika Anda menambah tidur 45 menit atau berjalan 3.000 langkah lebih banyak? Lihat dampaknya sebelum Anda berkomitmen.
                </p>
              </div>

              {/* Bento Mockup Preview */}
              <div className="bg-brand-50/40 rounded-2xl p-5 border border-brand-900/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-brand-900">Intervensi: +45 Menit Tidur</div>
                  <div className="text-[11px] text-brand-900/60">Estimasi reduksi beban glikemik</div>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  -24.8% Risiko
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & EVIDENCE STRIP */}
        <section className="container mx-auto px-6 lg:px-12 py-12">
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-brand-900/10 text-center max-w-4xl mx-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-900/40">
              Parameter Klinis & Validasi Berdasarkan Standar Epidemiologi
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm sm:text-base font-bold text-brand-900/70">
              <span>World Health Organization (WHO)</span>
              <span>Kemenkes RI</span>
              <span>PERKENI</span>
              <span>PERKI</span>
              <span>CDC BRFSS</span>
            </div>
          </div>
        </section>

        {/* PERSISTENT MEDICAL DISCLAIMER BANNER (FR-005) */}
        <section className="container mx-auto px-6 lg:px-12 pt-8 pb-16">
          <div className="bg-brand-900 text-white rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto shadow-xl flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-300">
              <IconAlertCircle size={22} />
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-white/85 leading-relaxed">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
                Batasan Medis & Pernyataan Keselamatan
              </span>
              HELIORA adalah platform kecerdasan preventif gaya hidup untuk tujuan edukasi dan kesadaran kesehatan personal. Platform ini bukan alat diagnostik medis klinis, tidak memberikan resep obat, dan tidak menggantikan nasihat profesional dari dokter berlisensi.
            </div>
          </div>
        </section>

        {/* CTA FINAL SECTION */}
        <section className="container mx-auto px-6 lg:px-12 py-16 text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 sm:p-16 max-w-4xl mx-auto border border-brand-900/10 shadow-xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-900">
              Waktunya Mengambil Kendali.
            </h2>
            <p className="text-base sm:text-lg text-brand-900/65 max-w-xl mx-auto font-medium leading-relaxed">
              Bergabung bersama Heliora hari ini. Ambil langkah pertama menuju hidup yang lebih panjang, terencana, dan bertenaga.
            </p>
            <div className="pt-2">
              <Link href="/register">
                <Button className="h-14 px-10 rounded-2xl bg-brand-900 hover:bg-brand-900/90 text-white text-base font-semibold shadow-lg shadow-brand-900/15 transition-all hover:scale-105 active:scale-95">
                  Buat Akun Gratis Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-brand-900/10 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-brand-900/60 font-medium">
          <div className="flex items-center gap-2.5 text-brand-900">
            <div className="w-7 h-7 rounded-lg bg-brand-900 text-white flex items-center justify-center">
              <IconHeartbeat size={16} stroke={2.5} />
            </div>
            <span className="font-bold tracking-tight text-sm">HELIORA</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-brand-900 transition-colors">Ketentuan Layanan</Link>
            <Link href="/privacy" className="hover:text-brand-900 transition-colors">Privasi Data</Link>
            <Link href="/disclaimer" className="hover:text-brand-900 transition-colors">Disclaimer Medis</Link>
          </div>
          <p>© {new Date().getFullYear()} Heliora Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
