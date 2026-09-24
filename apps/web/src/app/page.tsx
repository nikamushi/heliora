"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { BilateralPatternFlow } from "@/components/BilateralPatternFlow";
import { LayeredHealthPicture } from "@/components/LayeredHealthPicture";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  IconHeartbeat,
  IconArrowRight,
  IconBrain,
  IconCertificate,
  IconShieldLock,
  IconEye,
  IconCompass,
  IconAdjustmentsHorizontal,
  IconSparkles,
  IconBolt,
  IconCpu,
  IconArrowsShuffle,
  IconDeviceAnalytics,
  IconFileCheck,
  IconShieldCheck,
  IconLayersSubtract,
  IconActivity,
  IconTrendingUp
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
      className="flex flex-col items-center text-center min-h-[30vh] sm:min-h-[36vh] justify-center px-4 w-full"
    >
      <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-snug sm:leading-[1.35] text-balance max-w-4xl sm:max-w-5xl">
        {content}
      </p>
    </motion.div>
  );
}

function SectionLifestyleNarrative() {
  const narrativeContent = (
    <span className="text-brand-900/80">
      Kebiasaan yang kita jalani setiap hari perlahan membentuk{" "}
      <span className="text-brand-900">pola</span> hidup, memberi kita gambaran tentang{" "}
      <span className="text-brand-900">kondisi kesehatan</span>, dan membuka kemungkinan untuk melihat{" "}
      <span className="text-brand-900">perubahan ke depan</span>.
    </span>
  );

  return (
    <section 
      id="narrative" 
      className="container mx-auto px-6 lg:px-12 pt-8 sm:pt-12 md:pt-16 pb-14 sm:pb-18 md:pb-24 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <NarrativeItem content={narrativeContent} />
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

        {/* SECTION 03: KENAPA HARUS HELIORA (#why-heliora) */}
        <section id="why-heliora" className="w-full bg-white/80 backdrop-blur-md border-y border-brand-900/5 py-20 sm:py-28 md:py-32 my-8 sm:my-12 scroll-mt-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20 md:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-900 leading-tight">
                Kenapa harus HELIORA?
              </h2>
            </div>

            {/* Full-Width Side-by-Side Open Columns (No Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto divide-y md:divide-y-0 md:divide-x divide-brand-900/10">
              {/* Column 1: Berbasis AI */}
              <div className="flex flex-col space-y-6 md:pr-10 lg:pr-16 pt-8 md:pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-brand-900">
                    <IconBrain size={22} stroke={1.8} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900/50 font-mono">
                    Pilar 01
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-900 tracking-tight">
                  Berbasis AI
                </h3>

                <p className="text-base sm:text-lg text-brand-900/75 leading-relaxed font-normal">
                  Mengolah keterkaitan kompleks antara pola tidur, ritme sirkadian, aktivitas harian, dan biomarker tubuh untuk memetakan dinamika kesehatan secara menyeluruh serta memproyeksikan arah perubahan ke depan.
                </p>

                <div className="pt-2 flex flex-col space-y-3 text-sm text-brand-900/80">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>Analisis multimodal mendeteksi pola yang tidak terlihat dalam angka statis.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>Simulasi skenario memproyeksikan efek perubahan kebiasaan sebelum dimulai.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span>Insight adaptif yang dipersonalisasi sesuai profil biologis individual Anda.</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Bukti ilmiah */}
              <div className="flex flex-col space-y-6 md:pl-10 lg:pl-16 pt-12 md:pt-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-brand-900">
                    <IconCertificate size={22} stroke={1.8} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900/50 font-mono">
                    Pilar 02
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-900 tracking-tight">
                  Bukti ilmiah
                </h3>

                <p className="text-base sm:text-lg text-brand-900/75 leading-relaxed font-normal">
                  Setiap kalkulasi risiko preventif dan rekomendasi dibangun di atas konsensus klinis terpercaya serta riset epidemiologi global yang terverifikasi dan transparan.
                </p>

                <div className="pt-2 flex flex-col space-y-3 text-sm text-brand-900/80">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <span>Standar epidemiologi bersumber dari surveilans data CDC BRFSS dan WHO.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <span>Disesuaikan dengan pedoman klinis nasional PERKENI & PERKI Indonesia.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0" />
                    <span>Explainable AI yang transparan tanpa black-box tanpa keraguan medis.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width Pillar 3: Privasi Data */}
            <div className="mt-14 sm:mt-18 pt-12 sm:pt-16 border-t border-brand-900/10 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-brand-900">
                      <IconShieldLock size={22} stroke={1.8} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-900/50 font-mono">
                      Pilar 03
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-900 tracking-tight">
                    Privasi Data
                  </h3>
                  <p className="text-base sm:text-lg text-brand-900/75 leading-relaxed font-normal">
                    Kesehatan adalah informasi paling personal Anda. HELIORA dirancang dengan prinsip *privacy-by-design*, memastikan data Anda terlindungi seutuhnya tanpa kompromi.
                  </p>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 lg:pt-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-brand-900">
                      Kedaulatan Penuh
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                      Anda memiliki kendali mutlak atas data Anda, termasuk hak ekspor dan penghapusan riwayat kapan saja.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-brand-900">
                      Enkripsi Berlapis
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                      Protokol keamanan tingkat tinggi mengamankan seluruh rekaman parameter vital saat disimpan maupun dikirim.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-brand-900">
                      Tanpa Komersialisasi
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                      HELIORA tidak pernah menjual atau membagikan data profil kesehatan Anda kepada pihak ketiga atau pengiklan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: ALUR PREVENTIF (Understand Explore Simulate Recommend Act.) */}
        <section className="w-full bg-brand-100/60 border-y border-brand-900/10 py-12 sm:py-16 md:py-20 text-center my-4 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="max-w-5xl mx-auto flex items-center justify-center">
              <div className="flex items-center justify-between sm:justify-center whitespace-nowrap flex-nowrap gap-x-2 sm:gap-x-6 md:gap-x-10 lg:gap-x-14 w-full">
                {/* 1. Understand */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 group cursor-default">
                  <IconEye className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand-900/60 group-hover:text-emerald-800 transition-colors" stroke={1.75} />
                  <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-medium tracking-tight text-brand-900 group-hover:text-emerald-800 transition-colors">
                    Understand
                  </span>
                </div>

                {/* 2. Explore */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 group cursor-default">
                  <IconCompass className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand-900/60 group-hover:text-emerald-800 transition-colors" stroke={1.75} />
                  <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-medium tracking-tight text-brand-900 group-hover:text-emerald-800 transition-colors">
                    Explore
                  </span>
                </div>

                {/* 3. Simulate */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 group cursor-default">
                  <IconAdjustmentsHorizontal className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand-900/60 group-hover:text-emerald-800 transition-colors" stroke={1.75} />
                  <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-medium tracking-tight text-brand-900 group-hover:text-emerald-800 transition-colors">
                    Simulate
                  </span>
                </div>

                {/* 4. Recommend */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 group cursor-default">
                  <IconSparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-brand-900/60 group-hover:text-emerald-800 transition-colors" stroke={1.75} />
                  <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-medium tracking-tight text-brand-900 group-hover:text-emerald-800 transition-colors">
                    Recommend
                  </span>
                </div>

                {/* 5. Act. */}
                <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 group cursor-default">
                  <IconBolt className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-800 group-hover:text-emerald-950 transition-colors" stroke={1.75} />
                  <span className="text-xs sm:text-base md:text-xl lg:text-2xl font-semibold tracking-tight text-emerald-800">
                    Act.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FEATURES */}
        <section id="features" className="container mx-auto px-6 lg:px-12 py-16 sm:py-24 scroll-mt-24">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-900/5 text-emerald-800 mb-3 border border-brand-900/10">
              Fitur Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-900 leading-[1.15]">
              Features
            </h2>
            <p className="text-base sm:text-lg text-brand-900/65 mt-4 font-normal leading-relaxed">
              Solusi preventif cerdas untuk memetakan kesehatan, mensimulasikan masa depan, dan mengambil keputusan gaya hidup berbasis bukti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Personal Health Profile */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconHeartbeat className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                    Personal Health Profile
                  </h3>
                  <p className="text-sm font-semibold text-emerald-800">
                    Know yourself.
                  </p>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed pt-1">
                    Pemetaan menyeluruh data biometrik, riwayat klinis, dan ritme sirkadian harian untuk membentuk fondasi profil kesehatan personal Anda.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-6 border-t border-brand-900/5 text-xs text-brand-900/45 font-mono">
                Biometrik & Riwayat Gaya Hidup
              </div>
            </div>

            {/* Feature 2: Health & Risk Insights */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconActivity className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                    Health & Risk Insights
                  </h3>
                  <p className="text-sm font-semibold text-emerald-800">
                    Understand what&apos;s shaping your health.
                  </p>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed pt-1">
                    Pemahaman mendalam mengenai pola risiko kardiometabolik dan faktor kebiasaan yang memengaruhi dinamika kesehatan Anda secara berkelanjutan.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-6 border-t border-brand-900/5 text-xs text-brand-900/45 font-mono">
                4 Risiko Kardiometabolik Utama
              </div>
            </div>

            {/* Feature 3: Explainable Intelligence */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconBrain className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                    Explainable Intelligence
                  </h3>
                  <p className="text-sm font-semibold text-emerald-800">
                    Know why.
                  </p>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed pt-1">
                    Transparansi penuh tanpa kotak hitam AI. Dekonstruksi faktor protektif dan pemberat risiko agar Anda mengerti alasan di balik tiap analisis.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-6 border-t border-brand-900/5 text-xs text-brand-900/45 font-mono">
                Transparansi & SHAP Attribution
              </div>
            </div>

            {/* Feature 4: Future Health Simulation */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconTrendingUp className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                    Future Health Simulation
                  </h3>
                  <p className="text-sm font-semibold text-emerald-800">
                    See what&apos;s possible.
                  </p>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed pt-1">
                    Proyeksi kesehatan jangka panjang untuk melihat lintasan risiko di masa depan berdasarkan tren kebiasaan dan profil biologis Anda hari ini.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-6 border-t border-brand-900/5 text-xs text-brand-900/45 font-mono">
                Proyeksi Lintasan Risiko Masa Depan
              </div>
            </div>

            {/* Feature 5: What-if Simulation */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-6 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconAdjustmentsHorizontal className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-900 tracking-tight">
                    What-if Simulation
                  </h3>
                  <p className="text-sm font-semibold text-emerald-800">
                    Explore what could change.
                  </p>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed pt-1">
                    Eksplorasi interaktif bagaimana modifikasi gaya hidup nyata—seperti durasi tidur, target BMI, atau aktivitas fisik—dapat mengubah skor risiko seketika.
                  </p>
                </div>
              </div>
              <div className="pt-5 mt-6 border-t border-brand-900/5 text-xs text-brand-900/45 font-mono">
                Simulasi Kontrafaktual Real-Time
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: TECHNOLOGY */}
        <section id="technology" className="container mx-auto px-6 lg:px-12 py-16 sm:py-24 border-t border-brand-900/5 scroll-mt-24">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-900/5 text-emerald-800 mb-3 border border-brand-900/10">
              Arsitektur & AI
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-900 leading-[1.15]">
              Technology
            </h2>
            <p className="text-base sm:text-lg text-brand-900/65 mt-4 font-normal leading-relaxed">
              Kombinasi model machine learning terkalibrasi, interpretabilitas tanpa kotak hitam, dan standar enkripsi tingkat tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tech 1: Calibrated ML Ensembles */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-5 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconCpu className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-brand-900/40 uppercase tracking-wide">
                    Machine Learning
                  </span>
                  <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                    Calibrated ML Ensembles
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                    Model gradient boosting (CatBoost & LightGBM) terkalibrasi untuk menghasilkan probabilitas risiko yang objektif dan akurat.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-5 border-t border-brand-900/5 flex items-center justify-between text-xs text-brand-900/50 font-mono">
                <span>CatBoost & LightGBM</span>
                <span className="text-emerald-800 font-semibold">Calibrated</span>
              </div>
            </div>

            {/* Tech 2: Explainable AI & SHAP */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-5 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconDeviceAnalytics className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-brand-900/40 uppercase tracking-wide">
                    Explainability
                  </span>
                  <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                    SHAP Factor Attribution
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                    Dekonstruksi nilai Shapley (SHAP) untuk transparansi penuh mengenai faktor protektif dan pemicu risiko tanpa kotak hitam AI.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-5 border-t border-brand-900/5 flex items-center justify-between text-xs text-brand-900/50 font-mono">
                <span>SHAP Values</span>
                <span className="text-emerald-800 font-semibold">Zero Black-Box</span>
              </div>
            </div>

            {/* Tech 3: Clinical Protocol Integration */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-5 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconCertificate className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-brand-900/40 uppercase tracking-wide">
                    Evidence Engine
                  </span>
                  <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                    Clinical Protocol Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                    Pemetaan otomatis ke panduan klinis global & nasional (CDC BRFSS, WHO, PERKENI, PERKI) untuk validitas rekomendasi medis.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-5 border-t border-brand-900/5 flex items-center justify-between text-xs text-brand-900/50 font-mono">
                <span>CDC, WHO & PERKENI</span>
                <span className="text-emerald-800 font-semibold">Verified</span>
              </div>
            </div>

            {/* Tech 4: Zero-Knowledge Privacy */}
            <div className="group bg-white border border-brand-900/10 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-800/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100/70 border border-brand-900/10 flex items-center justify-center text-emerald-800 mb-5 group-hover:scale-105 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <IconShieldCheck className="w-6 h-6" stroke={1.75} />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-brand-900/40 uppercase tracking-wide">
                    Data Sovereignty
                  </span>
                  <h3 className="text-lg font-bold text-brand-900 tracking-tight">
                    Zero-Knowledge Privacy
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-900/65 leading-relaxed">
                    Enkripsi data berlapis saat disimpan dan dikirim, kontrol penuh atas penghapusan riwayat, dan zero tracking komersial.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-5 border-t border-brand-900/5 flex items-center justify-between text-xs text-brand-900/50 font-mono">
                <span>AES-256 Encryption</span>
                <span className="text-emerald-800 font-semibold">100% Private</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04: AI UNTUK KESEHATAN - HELIORA (#how-it-works) */}
        <section id="how-it-works" className="w-full bg-[#13281c] text-white py-20 sm:py-24 md:py-32 my-12 sm:my-16 relative overflow-hidden border-y border-emerald-950 scroll-mt-24">
          <div id="simulation" className="scroll-mt-24" />
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
                Melihat kesehatan secara lebih utuh.
              </h2>
            </div>

            {/* Generative Abstract Layered Health Visual */}
            <div className="mt-8 sm:mt-10 md:mt-12">
              <LayeredHealthPicture />
            </div>

            {/* Editorial Description Text */}
            <div className="mt-6 sm:mt-8 max-w-3xl mx-auto text-center">
              <p className="text-base sm:text-lg md:text-xl text-emerald-100/65 font-normal leading-relaxed text-balance">
                Kesehatan bukan sekadar angka. HELIORA membantu Anda{" "}
                <span className="text-white">memahami</span> apa yang membentuk kesehatan,{" "}
                <span className="text-white">mengeksplorasi</span> apa yang mungkin, dan melihat bagaimana{" "}
                <span className="text-white">perubahan kecil</span> dapat membawa arah yang berbeda. Dengan insight yang dipersonalisasi dan didukung evidence ilmiah, Anda dapat menemukan{" "}
                <span className="text-white">langkah yang lebih tepat</span> untuk diri Anda.
              </p>
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
