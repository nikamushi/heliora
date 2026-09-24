"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { BilateralPatternFlow } from "@/components/BilateralPatternFlow";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  IconHeartbeat,
  IconArrowRight,
  IconAdjustmentsHorizontal,
  IconHistory
} from "@tabler/icons-react";

// Fluid Apple HIG motion curves
const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.65,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    }
  })
};

function SectionPatterns() {
  return (
    <section 
      id="patterns" 
      className="min-h-[100dvh] w-full border-t border-brand-900/5 overflow-hidden flex flex-col justify-between pt-24 md:pt-28 pb-8 px-6 lg:px-12 relative"
    >
      {/* Top Typographic Header (Clean spacing below navbar) */}
      <div className="container mx-auto max-w-6xl w-full z-20 pointer-events-none mb-3 md:mb-5">
        <div className="max-w-4xl pointer-events-auto">
          <motion.h2 
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUpVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-brand-900 leading-[1.08]"
          >
            Setiap hari, kita melakukan <br className="hidden sm:inline" />
            <span className="italic font-light text-brand-900/80">lebih dari yang kita sadari.</span>
          </motion.h2>
        </div>
      </div>

      {/* Dedicated Viewport for Bilateral Flow Visualization */}
      <div className="relative w-full h-[460px] sm:h-[520px] md:h-[600px] flex items-center justify-center pointer-events-none z-10 my-auto">
        {/* Soft Ambient Radial Glows */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-emerald-300/15 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-12 w-[350px] h-[280px] bg-[#d97757]/10 rounded-full blur-[110px]" />
          <div className="absolute bottom-1/4 right-12 w-[380px] h-[300px] bg-[#64748b]/10 rounded-full blur-[110px]" />
        </div>

        <BilateralPatternFlow />
      </div>
    </section>
  );
}

function NarrativeItem({ content }: { content: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "center 50%", "end 10%"],
  });

  // Pure clean scroll-linked opacity fade
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="flex flex-col items-center text-center min-h-[50vh] sm:min-h-[60vh] justify-center px-4"
    >
      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-snug sm:leading-[1.35] text-balance max-w-3xl">
        {content}
      </p>
    </motion.div>
  );
}

function SectionLifestyleNarrative() {
  const narrativeItems: React.ReactNode[] = [
    (
      <span className="text-brand-900/80">
        Setiap hari, kita menjalani{" "}
        <span className="text-brand-900">pola hidup masing-masing</span>, dari
        kebiasaan kecil sampai keputusan yang sering kita ambil tanpa sadar.
      </span>
    ),
    (
      <span className="text-brand-900/80">
        Satu per satu, semuanya terlihat sederhana. Tetapi jika dilihat bersama, kebiasaan-kebiasaan itu membentuk{" "}
        <span className="text-brand-900">gambaran yang lebih utuh</span> tentang cara kita menjalani hari.
      </span>
    ),
    (
      <span className="text-brand-900/80">
        Seiring waktu,{" "}
        <span className="text-brand-900">perubahan kecil</span> bisa memperlihatkan hal baru tentang kesehatan kita:
        {" "}bagaimana kondisinya hari ini, dan apa yang mungkin terjadi ke depannya.
      </span>
    ),
    (
      <span className="text-brand-900/80">
        Dengan memahami bagaimana kebiasaan itu saling terkait, kita bisa{" "}
        <span className="text-brand-900">melihat kesehatan dengan cara yang lebih personal</span>, lalu
        mulai mempertimbangkan perubahan sebelum kita benar-benar membutuhkannya.
      </span>
    ),
  ];

  return (
    <section 
      id="narrative" 
      className="container mx-auto px-6 lg:px-12 py-16 sm:py-24 scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {narrativeItems.map((item, idx) => (
          <NarrativeItem key={idx} content={item} />
        ))}
      </div>
    </section>
  );
}

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

      <main className="pb-16">
        {/* HERO SECTION: 1 Full Viewport (Centered Editorial Experience) */}
        <section id="hero" className="min-h-[100dvh] w-full flex flex-col justify-between items-center relative px-6 lg:px-12 pt-28 pb-10">
          {/* Top spacer for optical centering */}
          <div className="w-full" />

          {/* Centered Hero Typography & Action Buttons */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 my-auto">
            <motion.span 
              custom={0} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-900/60 bg-brand-100/60 px-4 py-1.5 rounded-full border border-brand-900/10 backdrop-blur-sm"
            >
              HELIORA
            </motion.span>

            <motion.h1 
              custom={1} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-900 text-balance leading-[1.08]"
            >
              Kesehatan Anda,<br />
              <span className="italic font-light text-brand-900/80">dapat dipahami.</span>
            </motion.h1>

            <motion.div 
              custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4"
            >
              <Link href="/register">
                <Button className="h-13 px-8 rounded-full bg-[#1e3a2b] hover:bg-[#162c20] text-white text-base font-medium shadow-[0_4px_16px_rgba(30,58,43,0.18)] hover:shadow-[0_6px_20px_rgba(30,58,43,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                  <span>Mulai Assessment</span>
                  <IconArrowRight size={18} />
                </Button>
              </Link>
              <Link 
                href="#how-it-works"
                className="group flex items-center gap-2 text-base font-medium text-brand-900/70 hover:text-brand-900 transition-colors py-3 px-4"
              >
                <span>Pelajari Alur</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </div>

          {/* Bottom Scroll Cue to Section 01 */}
          <motion.div 
            custom={3} initial="hidden" animate="visible" variants={fadeUpVariants}
            className="flex flex-col items-center pt-6"
          >
            <a 
              href="#patterns" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("patterns")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center gap-1.5 text-brand-900/40 hover:text-brand-900/80 transition-colors group cursor-pointer"
            >
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Eksplorasi Pola</span>
              <span className="animate-bounce text-sm opacity-70 group-hover:opacity-100 transition-opacity">↓</span>
            </a>
          </motion.div>
        </section>

        {/* SECTION 01 (STITCH SECTION 2: BILATERAL CONVERGENCE): KESEHATAN BUKAN SEKADAR ANGKA */}
        <SectionPatterns />

        {/* SECTION 02: NARASI POLA HIDUP & EKSPLORASI RISIKO */}
        <SectionLifestyleNarrative />

        {/* SECTION 03: ALUR KERJA (#how-it-works) */}
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
