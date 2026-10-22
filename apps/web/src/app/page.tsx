"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { PublicFooter } from "@/components/public-footer";
import { Button } from "@/components/ui/button";
import { BilateralPatternFlow } from "@/components/BilateralPatternFlow";
import { LayeredHealthPicture } from "@/components/LayeredHealthPicture";
import { UnderstandActivityIcons } from "@/components/UnderstandActivityIcons";
import { ExplainableFactorsVisual } from "@/components/ExplainableFactorsVisual";
import { LogoEmblem } from "@/components/logo";
import { SimulationDirectionVisual } from "@/components/SimulationDirectionVisual";
import { RecommendationsEvidenceVisual } from "@/components/RecommendationsEvidenceVisual";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  ShieldCheck as IconShieldLock,
  Eye as IconEye,
  Compass as IconCompass,
  SlidersHorizontal as IconAdjustmentsHorizontal,
  Sparkles as IconSparkles,
  Zap as IconBolt,
  Layers as IconStack2,
  HeartHandshake as IconUserHeart,
} from "lucide-react";

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
      className="min-h-[100dvh] w-full overflow-hidden flex flex-col justify-between pt-24 md:pt-28 pb-8 px-6 lg:px-12 relative"
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
      <div className="relative w-full h-[460px] sm:h-[520px] md:h-[600px] flex items-center justify-center pointer-events-none z-10 my-auto [transform:translateZ(0)]">
        {/* Soft Ambient Radial Glows (Hardware Accelerated Radial Gradients) */}
        <div className="absolute inset-0 pointer-events-none -z-10 [transform:translateZ(0)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(110,231,183,0.15),transparent_70%)]" />
          <div className="absolute top-1/3 left-12 w-[350px] h-[280px] bg-[radial-gradient(ellipse_at_center,rgba(217,119,87,0.10),transparent_70%)]" />
          <div className="absolute bottom-1/4 right-12 w-[380px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(100,116,139,0.10),transparent_70%)]" />
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

function SectionUnderstandingPurpose() {
  const showcaseItems = [
    {
      title: "Personal",
      icon: IconUserHeart,
      bg: "bg-gradient-to-br from-[#f0f7fc] to-[#e1effa]",
      border: "border-[#cee3f5]",
      text: "text-[#1d6fad]",
      shadow: "shadow-[0_8px_24px_rgba(29,111,173,0.08)]",
    },
    {
      title: "Teruji",
      icon: IconStack2,
      bg: "bg-gradient-to-br from-[#f5f2fb] to-[#e8e0f7]",
      border: "border-[#d8ccf2]",
      text: "text-[#6941b0]",
      shadow: "shadow-[0_8px_24px_rgba(105,65,176,0.08)]",
    },
    {
      title: "Pribadi",
      icon: IconShieldLock,
      bg: "bg-gradient-to-br from-[#f3f5f8] to-[#e4e8ee]",
      border: "border-[#ccd3de]",
      text: "text-[#334155]",
      shadow: "shadow-[0_8px_24px_rgba(51,65,85,0.08)]",
    },
  ];

  return (
    <section 
      id="purpose" 
      className="container mx-auto px-6 lg:px-12 py-20 sm:py-28 md:py-36 scroll-mt-24"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Top Header Block */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.h2 
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpVariants}
            className="w-full text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-brand-900 leading-tight"
          >
            Untuk memahami, bukan mendiagnosis.
          </motion.h2>

          <motion.p 
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpVariants}
            className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-brand-900/70 font-normal leading-relaxed max-w-2xl mx-auto text-balance text-center"
          >
            HELIORA membaca gaya hidup Anda untuk memberi gambaran kesehatan yang lebih personal, agar Anda bisa mengambil langkah pencegahan lebih awal.
          </motion.p>
        </div>

        {/* Showcase Group (Unified Same Background) */}
        <div className="w-full mt-24 sm:mt-32 md:mt-40 flex flex-col items-center">
          <motion.h3
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUpVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-brand-900 text-center mb-10 sm:mb-14"
          >
            Dibangun untuk Anda percaya.
          </motion.h3>

          {/* 3 Squircles Showcase Row (Static - No animation, No hover) */}
          <div className="flex flex-row items-center justify-center gap-8 sm:gap-14 md:gap-20 w-full select-none">
            {showcaseItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col items-center gap-3.5"
                >
                  {/* Static Organic Ceramic-Glass Squircle */}
                  <div 
                    className={`w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-[24px] sm:rounded-[28px] md:rounded-[32px] ${item.bg} ${item.border} ${item.shadow} border flex items-center justify-center relative overflow-hidden`}
                  >
                    {/* Soft ambient surface light */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-black/[0.02] pointer-events-none rounded-[inherit]" />
                    <Icon 
                      className={`w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 ${item.text} relative z-10`} 
                      strokeWidth={1.6} 
                    />
                  </div>
                  {/* Clean Label Underneath */}
                  <span className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-brand-900 text-center">
                    {item.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200 relative overflow-hidden">
      {/* Ambient Liquid Orbs (Hardware Accelerated Radial Gradients) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden [transform:translateZ(0)]">
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(45,90,67,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-48 right-10 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.15)_0%,transparent_70%)]" />
        <div className="absolute top-[950px] left-10 w-[600px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-[1900px] right-1/4 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(45,90,67,0.10)_0%,transparent_70%)]" />
      </div>

      <Navbar />

      <main>
        {/* HERO SECTION: 1 Full Viewport (Centered Editorial Experience) */}
        <section id="hero" className="min-h-[calc(100dvh-84px)] w-full flex flex-col justify-between items-center relative px-6 lg:px-12 pt-8 sm:pt-12 pb-12">
          {/* Top spacer for optical centering */}
          <div className="w-full" />

          {/* Centered Hero Typography & Action Buttons */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8 my-auto">
            <motion.span 
              custom={0} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-brand-900"
            >
              HELIORA
            </motion.span>

            <motion.h1 
              custom={1} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-900 text-balance leading-[1.08]"
            >
              Kesehatan Anda,<br />
              <span className="font-light text-brand-900/80">dapat dipahami.</span>
            </motion.h1>

            <motion.div 
              custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="flex items-center justify-center pt-4"
            >
              <Link href="/register">
                <Button className="h-13 px-8 rounded-full bg-[#1e3a2b] hover:bg-[#162c20] text-white text-base font-medium shadow-[0_4px_16px_rgba(30,58,43,0.18)] hover:shadow-[0_6px_20px_rgba(30,58,43,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Mulai Assessment
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SECTION 01 (STITCH SECTION 2: BILATERAL CONVERGENCE): KESEHATAN BUKAN SEKADAR ANGKA */}
        <SectionPatterns />

        {/* SECTION 02: NARASI POLA HIDUP & EKSPLORASI RISIKO */}
        <SectionLifestyleNarrative />

        {/* SECTION 04: AI UNTUK KESEHATAN - HELIORA (#how-it-works) */}
        <section id="how-it-works" className="w-full bg-[#13281c] text-white py-20 sm:py-24 md:py-32 mt-12 sm:mt-16 mb-0 relative overflow-hidden border-y border-emerald-950 scroll-mt-24">
          <div id="simulation" className="scroll-mt-24" />
          {/* Subtle Ambient Glows (Hardware Accelerated Radial Gradients) */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none [transform:translateZ(0)]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,transparent_70%)] pointer-events-none [transform:translateZ(0)]" />

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h2 
                custom={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance"
              >
                Melihat kesehatan secara lebih utuh.
              </motion.h2>
            </div>

            {/* Generative Abstract Layered Health Visual */}
            <motion.div 
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUpVariants}
              className="mt-8 sm:mt-10 md:mt-12"
            >
              <LayeredHealthPicture />
            </motion.div>

            {/* Editorial Description Text */}
            <div className="mt-6 sm:mt-8 max-w-3xl mx-auto text-center">
              <motion.p 
                custom={2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpVariants}
                className="text-base sm:text-lg md:text-xl text-emerald-100/65 font-normal leading-relaxed text-balance"
              >
                Kesehatan bukan sekadar angka. HELIORA membantu Anda{" "}
                <span className="text-white">memahami</span> apa yang membentuk kesehatan,{" "}
                <span className="text-white">mengeksplorasi</span> apa yang mungkin, dan melihat bagaimana{" "}
                <span className="text-white">perubahan kecil</span> dapat membawa arah yang berbeda. Dengan insight yang dipersonalisasi dan didukung evidence ilmiah, Anda dapat menemukan{" "}
                <span className="text-white">langkah yang lebih tepat</span> untuk diri Anda.
              </motion.p>
            </div>

            {/* Pipeline Alur Preventif inside Dark Section */}
            <motion.div 
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUpVariants}
              className="mt-12 sm:mt-16 max-w-5xl mx-auto w-full"
            >
              <div className="flex items-center justify-between sm:justify-center whitespace-nowrap flex-nowrap gap-x-3 sm:gap-x-8 md:gap-x-12 lg:gap-x-16 w-full">
                {/* 1. Understand / Pahami */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 group cursor-default">
                  <IconEye className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110" strokeWidth={1.6} />
                  <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight text-white/60 group-hover:text-white transition-colors">
                    Pahami
                  </span>
                </div>

                {/* 2. Explore / Jelajahi */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 group cursor-default">
                  <IconCompass className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110" strokeWidth={1.6} />
                  <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight text-white/60 group-hover:text-white transition-colors">
                    Jelajahi
                  </span>
                </div>

                {/* 3. Simulate / Simulasikan */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 group cursor-default">
                  <IconAdjustmentsHorizontal className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110" strokeWidth={1.6} />
                  <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight text-white/60 group-hover:text-white transition-colors">
                    Simulasikan
                  </span>
                </div>

                {/* 4. Recommend / Rekomendasi */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 group cursor-default">
                  <IconSparkles className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110" strokeWidth={1.6} />
                  <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight text-white/60 group-hover:text-white transition-colors">
                    Rekomendasi
                  </span>
                </div>

                {/* 5. Act / Bertindak */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 group cursor-default">
                  <IconBolt className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 text-white/60 group-hover:text-white transition-all duration-200 group-hover:scale-110" strokeWidth={1.6} />
                  <span className="text-xs sm:text-sm md:text-base font-medium tracking-tight text-white/60 group-hover:text-white transition-colors">
                    Bertindak
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 03: KENAPA HARUS HELIORA (#why-heliora) */}
        <section id="why-heliora" className="w-full bg-white/80 backdrop-blur-md border-y border-brand-900/5 pt-28 sm:pt-36 md:pt-44 pb-20 sm:pb-28 md:pb-32 mt-0 mb-8 sm:mb-12 scroll-mt-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mx-auto text-center mb-28 sm:mb-36 md:mb-48 lg:mb-56">
              <motion.h2 
                custom={0}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUpVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-brand-900 leading-tight"
              >
                Kenapa harus HELIORA?
              </motion.h2>
            </div>

            {/* Sub-section 01: UNDERSTAND - Open Layout (No Card) */}
            <div className="w-full max-w-6xl mx-auto">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-14 sm:gap-18 lg:gap-24 xl:gap-32 items-center">
                {/* Left Content Column */}
                <motion.div 
                  custom={0}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="flex flex-col justify-center space-y-5 sm:space-y-6 text-left"
                >
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-900 leading-[1.12] text-balance">
                    Tidak semua dampak datang dengan segera.
                  </h3>

                  <p className="text-base sm:text-lg text-brand-900/70 font-normal leading-relaxed text-balance">
                    Kebiasaan membentuk pola. Pola membentuk kemungkinan. HELIORA membantu Anda memahami apa yang mungkin terjadi selanjutnya.
                  </p>
                </motion.div>

                {/* Right Large Visual Column: Activity Icons Collection */}
                <motion.div 
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="w-full flex items-center justify-center"
                >
                  <UnderstandActivityIcons />
                </motion.div>
              </div>
            </div>

            {/* Sub-section 02: EXPLAINABLE REASONS / ALASAN DI BALIK SETIAP HASIL */}
            <div className="w-full max-w-6xl mx-auto mt-28 sm:mt-36 md:mt-48 lg:mt-56">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-14 sm:gap-18 lg:gap-24 xl:gap-32 items-center">
                {/* Left Visual Column: Analytics / Metric Icons */}
                <motion.div 
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="w-full flex items-center justify-center order-2 lg:order-1"
                >
                  <ExplainableFactorsVisual />
                </motion.div>

                {/* Right Content Column */}
                <motion.div 
                  custom={0}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="flex flex-col justify-center space-y-5 sm:space-y-6 order-1 lg:order-2 text-left lg:text-right"
                >
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-900 leading-[1.12] text-balance">
                    Ada alasan di balik setiap hasil.
                  </h3>

                  <p className="text-base sm:text-lg text-brand-900/70 font-normal leading-relaxed text-balance">
                    HELIORA menunjukkan bagaimana pola dari keseharian Anda memengaruhi estimasi risiko Anda, lengkap dengan alasan di balik setiap hasilnya.
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Sub-section 03: SIMULATION / BAGAIMANA JIKA ARAHNYA BERBEDA */}
            <div className="w-full max-w-6xl mx-auto mt-28 sm:mt-36 md:mt-48 lg:mt-56">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-14 sm:gap-18 lg:gap-24 xl:gap-32 items-center">
                {/* Left Content Column */}
                <motion.div 
                  custom={0}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="flex flex-col justify-center space-y-5 sm:space-y-6 text-left"
                >
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-900 leading-[1.12] text-balance">
                    Bagaimana jika arahnya berbeda?
                  </h3>

                  <p className="text-base sm:text-lg text-brand-900/70 font-normal leading-relaxed text-balance">
                    Coba berbagai kemungkinan dan lihat bagaimana perubahan gaya hidup dapat mengubah estimasi risiko Anda.
                  </p>
                </motion.div>

                {/* Right Visual Column: Simulation / Direction Icons */}
                <motion.div 
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="w-full flex items-center justify-center"
                >
                  <SimulationDirectionVisual />
                </motion.div>
              </div>
            </div>

            {/* Sub-section 04: RECOMMENDATIONS & EVIDENCE */}
            <div className="w-full max-w-6xl mx-auto mt-28 sm:mt-36 md:mt-48 lg:mt-56">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-14 sm:gap-18 lg:gap-24 xl:gap-32 items-center">
                {/* Left Visual Column: Recommendation / Evidence Icons */}
                <motion.div 
                  custom={1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="w-full flex items-center justify-center order-2 lg:order-1"
                >
                  <RecommendationsEvidenceVisual />
                </motion.div>

                {/* Right Content Column */}
                <motion.div 
                  custom={0}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                  className="flex flex-col justify-center space-y-5 sm:space-y-6 order-1 lg:order-2 text-left lg:text-right"
                >
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-900 leading-[1.12] text-balance">
                    Saatnya mengambil langkah yang berarti.
                  </h3>

                  <p className="text-base sm:text-lg text-brand-900/70 font-normal leading-relaxed text-balance">
                    Temukan langkah preventif yang relevan untuk Anda, dengan rekomendasi yang didukung evidence.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FILOSOFI PREVENTIF (UNTUK MEMAHAMI, BUKAN MENDIAGNOSIS) */}
        <SectionUnderstandingPurpose />

        {/* SECTION 05: CTA FINAL (Full-Width Rich Gradient) */}
        <section className="w-full bg-gradient-to-b from-[#1b5e3f] via-[#0d3422] to-[#05140d] text-white py-24 sm:py-32 md:py-36 relative overflow-hidden border-t border-emerald-500/20 text-center mt-12 sm:mt-16">
          {/* Enhanced Ambient Radial Glows (Hardware Accelerated Radial Gradients) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.22)_0%,transparent_70%)] pointer-events-none [transform:translateZ(0)]" />
          <div className="absolute bottom-0 right-1/4 w-[450px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.15)_0%,transparent_70%)] pointer-events-none [transform:translateZ(0)]" />

          <div className="container mx-auto px-6 lg:px-12 max-w-4xl flex flex-col items-center justify-center space-y-6 sm:space-y-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Ambil langkah lebih awal.
            </h2>
            
            <div>
              <Link href="/register">
                <Button className="h-13 px-8 rounded-full bg-white hover:bg-neutral-100 text-brand-900 text-base font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Mulai dengan HELIORA
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
<PublicFooter />
    </div>
  );
}
