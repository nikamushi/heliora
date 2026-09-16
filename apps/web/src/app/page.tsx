"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { 
  IconHeartbeat,
  IconArrowRight,
  IconAdjustmentsHorizontal,
  IconHistory,
  IconShieldCheck,
  IconActivity,
  IconClipboardList,
  IconFileText,
  IconMoon
} from "@tabler/icons-react";

// Fluid Apple HIG motion curves
const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    }
  })
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200 relative overflow-hidden">
      {/* Ambient Liquid Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] bg-brand-400/12 rounded-full blur-[140px]" />
        <div className="absolute top-48 right-10 w-[450px] h-[450px] bg-emerald-300/12 rounded-full blur-[130px]" />
        <div className="absolute top-[950px] left-10 w-[600px] h-[450px] bg-teal-400/10 rounded-full blur-[150px]" />
        <div className="absolute top-[1900px] right-1/4 w-[520px] h-[520px] bg-brand-400/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <main className="pt-28 pb-16">
        {/* HERO SECTION: Split 2-Column with 3D Glass Assessment Mockup Card */}
        <section className="container mx-auto px-6 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (7 cols): Direct Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.h1 
                custom={1} initial="hidden" animate="visible" variants={fadeUpVariants}
                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-brand-900 text-balance leading-[1.06]"
              >
                Kesehatan Anda, <br />
                <span className="bg-gradient-to-r from-brand-900 via-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                  Dapat Diprediksi.
                </span>
              </motion.h1>
              
              <motion.p 
                custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
                className="text-lg sm:text-xl text-brand-900/70 max-w-xl text-balance leading-relaxed font-normal"
              >
                Masukkan parameter kesehatan dan kebiasaan harian Anda. Heliora memetakan pola risiko kardiometabolik secara privat, objektif, dan terarah.
              </motion.p>
              
              <motion.div 
                custom={3} initial="hidden" animate="visible" variants={fadeUpVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3"
              >
                <Link href="/register">
                  <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-brand-900 hover:bg-brand-900/90 text-white text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-900/15 flex items-center justify-center gap-2.5">
                    <span>Mulai Assessment</span>
                    <IconArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-brand-900/15 bg-white/80 backdrop-blur-xl hover:bg-brand-50/80 text-brand-900 text-base font-semibold transition-all shadow-xs">
                    Pelajari Alur
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Column (5 cols): 3D Perspective Glass Mockup Card */}
            <motion.div 
              custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="lg:col-span-5 relative [perspective:1200px] flex items-center justify-center pt-6 lg:pt-0"
            >
              {/* Floating Badge 1: Standard Method (Top Left) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-3 -left-3 sm:-top-5 sm:-left-6 z-20 bg-white/90 backdrop-blur-xl border border-brand-900/10 rounded-2xl px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900">
                  <IconClipboardList size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-brand-900/50 font-bold">Metode Terstandar</p>
                  <p className="text-sm font-bold text-brand-900 leading-tight">Asesmen Mandiri</p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Local Encryption (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -right-2 sm:-bottom-5 sm:-right-4 z-20 bg-white/90 backdrop-blur-xl border border-brand-900/10 rounded-2xl px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-900/10 flex items-center justify-center text-brand-900">
                  <IconShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-wider text-brand-900/50 font-bold">Keamanan Data</p>
                  <p className="text-sm font-bold text-brand-900 leading-tight">Enkripsi Lokal E2E</p>
                </div>
              </motion.div>

              {/* Main 3D Perspective Card */}
              <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(13,95,63,0.12)] space-y-6 [transform:rotateY(-6deg)_rotateX(4deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)] transition-all duration-700 ease-out relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-brand-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Card Header (Clean Title Only) */}
                <div className="flex items-center justify-between border-b border-brand-900/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-brand-900 text-white flex items-center justify-center shadow-xs">
                      <IconHeartbeat size={16} />
                    </div>
                    <span className="text-xs font-bold tracking-tight text-brand-900">HELIORA ASSESSMENT</span>
                  </div>
                  <span className="text-[11px] font-medium text-brand-900/50">Formulir Mandiri</span>
                </div>

                {/* Status Panel - Factual Health Profile Categories */}
                <div className="bg-brand-50/50 rounded-2xl p-5 border border-brand-900/5 space-y-1">
                  <div className="text-2xl font-bold text-brand-900 tracking-tight">
                    Profil Kardiometabolik
                  </div>
                  <p className="text-xs text-brand-900/60">
                    Fisik • Tekanan Darah • Pola Kebiasaan
                  </p>
                </div>

                {/* 3 Real Health Profile Input Categories */}
                <div className="space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-brand-900/40 font-bold">
                    Komponen Pengisian
                  </p>
                  
                  {/* Category 1: Physical Profile */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-brand-900/5 hover:border-brand-900/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                        <IconClipboardList size={17} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900">Profil Fisik & Antropometri</p>
                        <p className="text-[11px] text-brand-900/60">Usia, Tinggi, & Berat Badan</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-brand-900/60">Siap Diisi</span>
                  </div>

                  {/* Category 2: Blood Pressure & History */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-brand-900/5 hover:border-brand-900/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                        <IconHeartbeat size={17} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900">Tekanan Darah & Riwayat</p>
                        <p className="text-[11px] text-brand-900/60">Tensi Darah & Riwayat Keluarga</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-brand-900/60">Siap Diisi</span>
                  </div>

                  {/* Category 3: Lifestyle Habits */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-brand-900/5 hover:border-brand-900/15 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <IconMoon size={17} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-brand-900">Pola Gaya Hidup</p>
                        <p className="text-[11px] text-brand-900/60">Aktivitas, Durasi Tidur, & Rokok</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-brand-900/60">Siap Diisi</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 01: TANTANGAN */}
        <section className="container mx-auto px-6 lg:px-12 py-16">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 leading-tight">
              Mengapa Deteksi Dini Sering Terlambat?
            </h2>
            <p className="text-base text-brand-900/60 mt-2 font-normal">
              Banyak masalah kardiometabolik berkembang tanpa rasa sakit fisik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-900/10 flex items-center justify-center text-brand-900">
                <IconFileText size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                  Data Tercecer
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Riwayat tensi darah, hasil lab lama, dan catatan pola hidup harian kerap tersimpan terpisah tanpa evaluasi menyeluruh.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-900/10 flex items-center justify-center text-brand-900">
                <IconActivity size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                  Perkembangan Senyap
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Pergeseran metabolisme dapat berjalan bertahun-tahun tanpa gejala sebelum memicu masalah serius.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-900/10 flex items-center justify-center text-brand-900">
                <IconHeartbeat size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                  Kecemasan Diagnostik
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Pemeriksaan klinis sering dihindari karena takut vonis. Pendekatan mandiri memberi ruang yang lebih tenang.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 02: ALUR KERJA (#how-it-works) */}
        <section id="how-it-works" className="container mx-auto px-6 lg:px-12 py-16 scroll-mt-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 leading-tight">
              Alur Kerja
            </h2>
            <p className="text-base text-brand-900/60 mt-2 font-normal">
              Tiga tahap mengolah data kesehatan Anda secara terarah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Pengisian Mandiri */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 border border-brand-900/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-brand-900/40 uppercase">
                  Tahap 01
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  Pengisian Data Mandiri
                </h3>
                <p className="text-brand-900/65 text-sm leading-relaxed">
                  Masukkan data kesehatan dasar seperti tekanan darah, durasi tidur, dan riwayat keluarga melalui formulir terpandu.
                </p>
              </div>
              <p className="text-xs text-brand-900/50 pt-6 border-t border-brand-900/5 mt-6 font-medium">
                Formulir Singkat & Terpandu
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 border border-brand-900/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-brand-900/40 uppercase">
                  Tahap 02
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  Analisis Pola
                </h3>
                <p className="text-brand-900/65 text-sm leading-relaxed">
                  Sistem membaca tren parameter tubuh Anda berdasarkan standar acuan klinis untuk mendeteksi pergeseran lebih awal.
                </p>
              </div>
              <p className="text-xs text-brand-900/50 pt-6 border-t border-brand-900/5 mt-6 font-medium">
                Standar Acuan Epidemiologi
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-7 border border-brand-900/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-brand-900/40 uppercase">
                  Tahap 03
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  Privasi Mutlak
                </h3>
                <p className="text-brand-900/65 text-sm leading-relaxed">
                  Data Anda tersimpan dengan enkripsi lokal. Tidak ada informasi pribadi yang dijual atau dibagikan ke pihak ketiga.
                </p>
              </div>
              <p className="text-xs text-brand-900/50 pt-6 border-t border-brand-900/5 mt-6 font-medium">
                Enkripsi AES-256 GCM
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 03: SIMULASI & FITUR (#simulation & #features) */}
        <section id="simulation" className="container mx-auto px-6 lg:px-12 py-16 scroll-mt-24">
          <div id="features" className="scroll-mt-24" />
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 leading-tight">
              Simulasi Interaktif
            </h2>
            <p className="text-base text-brand-900/60 mt-2 font-normal">
              Lihat bagaimana penyesuaian gaya hidup memengaruhi kestabilan tubuh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Feature 1: Pemetaan Tren */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.25rem] p-8 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-lg transition-all">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900 border border-brand-900/10">
                  <IconHistory size={22} />
                </div>
                <h3 className="text-2xl font-bold text-brand-900 tracking-tight">
                  Pemetaan Tren Kebiasaan
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Pantau bagaimana konsistensi pola tidur dan aktivitas fisik menjaga kestabilan ritme tubuh dalam rentang 30, 90, hingga 180 hari.
                </p>
              </div>

              <div className="bg-brand-50/50 rounded-2xl p-5 border border-brand-900/5 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-brand-900">
                  <span>30 Hari</span>
                  <span>90 Hari</span>
                  <span className="text-brand-900/50">180 Hari</span>
                </div>
                <div className="h-2 w-full bg-neutral-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-3/4" />
                </div>
                <p className="text-xs text-brand-900/60">
                  Konsistensi istirahat tercatat stabil dengan deviasi terkontrol.
                </p>
              </div>
            </div>

            {/* Feature 2: Simulasi Penyesuaian */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2.25rem] p-8 border border-brand-900/10 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-lg transition-all">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900 border border-brand-900/10">
                  <IconAdjustmentsHorizontal size={22} />
                </div>
                <h3 className="text-2xl font-bold text-brand-900 tracking-tight">
                  Simulasi Penyesuaian
                </h3>
                <p className="text-sm text-brand-900/65 leading-relaxed">
                  Uji skenario sebelum memulai: lihat pengaruh penambahan 45 menit waktu istirahat atau aktivitas harian terhadap ritme tubuh Anda.
                </p>
              </div>

              <div className="bg-brand-50/50 rounded-2xl p-5 border border-brand-900/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-brand-900">Skenario: +45 Menit Istirahat</div>
                  <div className="text-xs text-brand-900/60 mt-0.5">Pengaruh terhadap pemulihan tubuh</div>
                </div>
                <span className="text-xs font-medium text-emerald-800">
                  Pemulihan Optimal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: DASAR ILMIAH & VALIDASI (#science) */}
        <section id="science" className="container mx-auto px-6 lg:px-12 py-16 scroll-mt-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-900 leading-tight">
              Dasar Ilmiah & Validasi
            </h2>
            <p className="text-base text-brand-900/60 mt-2 font-normal">
              Model kalkulasi preventif Heliora mengacu pada konsensus epidemiologi dan panduan kesehatan terverifikasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CDC BRFSS */}
            <div className="bg-white border border-brand-900/10 rounded-[2rem] p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-brand-900/40 uppercase">
                  Epidemiologi Gaya Hidup
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  CDC BRFSS
                </h3>
                <p className="text-brand-900/65 text-sm leading-relaxed">
                  Memetakan korelasi terukur antara aktivitas fisik, durasi istirahat, dan indeks massa tubuh dengan risiko penyakit metabolik kronis.
                </p>
              </div>
              <p className="text-xs text-brand-900/50 pt-4 border-t border-brand-900/5 font-medium">
                Sistem Surveilans Perilaku CDC
              </p>
            </div>

            {/* WHO Guidelines */}
            <div className="bg-white border border-brand-900/10 rounded-[2rem] p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-brand-900/40 uppercase">
                  Pencegahan Primer
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  WHO NCD Guidelines
                </h3>
                <p className="text-brand-900/65 text-sm leading-relaxed">
                  Standar ambang batas risiko penyakit tidak menular global untuk mendeteksi pergeseran kondisi tubuh sebelum timbul keluhan klinis.
                </p>
              </div>
              <p className="text-xs text-brand-900/50 pt-4 border-t border-brand-900/5 font-medium">
                World Health Organization
              </p>
            </div>

            {/* PERKENI & PERKI */}
            <div className="bg-white border border-brand-900/10 rounded-[2rem] p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-brand-900/40 uppercase">
                  Konteks Klinis Indonesia
                </span>
                <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                  PERKENI & PERKI
                </h3>
                <p className="text-brand-900/65 text-sm leading-relaxed">
                  Penyesuaian parameter pencegahan diabetes melitus dan hipertensi dengan karakteristik demografi serta pola hidup masyarakat Indonesia.
                </p>
              </div>
              <p className="text-xs text-brand-900/50 pt-4 border-t border-brand-900/5 font-medium">
                Konsensus Nasional Dokter Spesialis
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 05: CTA FINAL */}
        <section className="container mx-auto px-6 lg:px-12 py-12 text-center">
          <div className="bg-gradient-to-br from-brand-900 via-[#0B4F35] to-[#083826] text-white rounded-[2.5rem] p-10 sm:p-14 md:p-16 max-w-4xl mx-auto border border-brand-900/20 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-brand-400/15 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-300/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-3 max-w-xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Mulai Pantau Kesehatan Anda Hari Ini.
              </h2>
              <p className="text-base text-emerald-100/80 font-normal leading-relaxed">
                Pahami tubuh Anda lebih baik setiap hari tanpa komplikasi.
              </p>
            </div>
            
            <div className="pt-2 relative z-10">
              <Link href="/register">
                <Button className="h-13 px-8 rounded-2xl bg-white hover:bg-neutral-100 text-brand-900 text-base font-bold shadow-lg shadow-black/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Buat Akun Gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-brand-900/10 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-900/60 font-medium">
          <div className="flex items-center gap-2 text-brand-900">
            <div className="w-6 h-6 rounded-lg bg-brand-900 text-white flex items-center justify-center">
              <IconHeartbeat size={14} stroke={2.5} />
            </div>
            <span className="font-bold tracking-tight text-xs">HELIORA</span>
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
