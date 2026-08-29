"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { 
  IconActivity, 
  IconShieldLock, 
  IconHeartbeat,
  IconDna,
  IconArrowRight,
  IconStethoscope,
  IconRipple
} from "@tabler/icons-react";

// Animation Variants for Apple HIG-like fluidity
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98], // Apple-like cubic bezier
    }
  })
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200">
      <Navbar />

      <main className="pt-28 pb-16 overflow-hidden">
        {/* HERO SECTION */}
        <section className="container mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-32 text-center relative">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-brand-400/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <motion.h1 
              custom={1} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-6xl md:text-8xl font-bold tracking-tighter text-brand-900 text-balance leading-[1.05]"
            >
              Kesehatan Anda, <br />
              <span className="text-brand-400">Dapat Diprediksi.</span>
            </motion.h1>
            
            <motion.p 
              custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="text-xl md:text-2xl text-brand-900/60 max-w-2xl mx-auto text-balance leading-relaxed font-medium"
            >
              Jutaan data medis dan biometrik diolah secara real-time. Ketahui risiko Anda sebelum menjadi vonis. Perpanjang usia Anda hari ini.
            </motion.p>
            
            <motion.div 
              custom={3} initial="hidden" animate="visible" variants={fadeUpVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <Link href="/register">
                <Button className="h-14 px-8 rounded-full bg-brand-900 hover:bg-brand-900/90 text-white text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-900/20">
                  Hitung Skor Anda
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" className="h-14 px-8 rounded-full border-brand-200 bg-white/50 backdrop-blur-sm hover:bg-brand-50 text-brand-900 text-base font-semibold">
                  Pelajari Cara Kerjanya
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ASYMMETRIC BENTO GRID */}
        <section id="features" className="container mx-auto px-6 lg:px-12 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-20 max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-brand-900 leading-tight">
              Presisi tingkat klinis. <br />Desain tanpa kompromi.
            </h2>
            <p className="text-xl text-brand-900/60 leading-relaxed font-medium">
              Kami menghilangkan kompleksitas medis. Data mentah dari perangkat Anda diubah menjadi wawasan yang langsung bisa ditindaklanjuti.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[24rem] gap-6">
            
            {/* TALL CARD (Left) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="md:col-span-5 bg-brand-900 text-white rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-brand-900/10"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-400/20 blur-3xl rounded-full" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-brand-400/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-brand-400/20">
                  <IconActivity size={28} className="text-brand-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Sinkronisasi Real-time</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  Hubungkan Apple Health, Oura, atau Garmin Anda. Algoritma kami memperbarui model risiko secara instan, tanpa entri manual.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-3 text-brand-400 font-medium">
                Berjalan otomatis di background <IconRipple size={20} className="animate-pulse" />
              </div>
            </motion.div>

            {/* WIDE CARD (Top Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="md:col-span-7 bg-white rounded-[2.5rem] p-10 border border-brand-200/50 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden relative group hover:border-brand-200 transition-colors"
            >
              <div className="max-w-xs z-10 relative">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-6">
                  <IconStethoscope size={24} className="text-brand-900" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-brand-900 tracking-tight">Diagnosis Prediktif</h3>
                <p className="text-brand-900/60 leading-relaxed font-medium">
                  Model AI kami dilatih dengan jutaan rekam medis untuk mendeteksi anomali bertahun-tahun sebelum gejala muncul.
                </p>
              </div>
              
              {/* Mockup Element */}
              <div className="w-full md:w-1/2 h-full min-h-[200px] bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-100/50 to-transparent" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-900 mb-1">98<span className="text-xl text-brand-400">%</span></p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-900/50">Akurasi Model</p>
                </div>
              </div>
            </motion.div>

            {/* SMALL WIDE CARD (Bottom Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="md:col-span-7 bg-brand-50 rounded-[2.5rem] p-10 border border-brand-200/50 shadow-sm flex flex-col justify-center relative"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <IconShieldLock size={24} className="text-brand-900" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-brand-900 tracking-tight">Privasi Tingkat Klinis</h3>
              <p className="text-brand-900/60 leading-relaxed font-medium max-w-md">
                Data Anda adalah milik Anda. Dienkripsi ujung-ke-ujung (E2E), mematuhi standar HIPAA, dan tidak akan pernah dijual kepada pihak ketiga. Titik.
              </p>
            </motion.div>

          </div>
        </section>

        {/* CTA SECTION */}
        <section className="container mx-auto px-6 lg:px-12 py-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="bg-white rounded-[3rem] p-12 md:p-24 text-center max-w-5xl mx-auto border border-brand-200/50 shadow-2xl shadow-brand-900/5 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
            
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 text-brand-900">Waktunya mengambil kendali.</h2>
            <p className="text-xl md:text-2xl text-brand-900/60 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Bergabung dengan Heliora hari ini. Ambil langkah pertama menuju hidup yang lebih panjang dan sehat.
            </p>
            <Link href="/register">
              <Button className="h-16 px-12 rounded-full bg-brand-900 hover:bg-brand-900/90 text-white text-lg font-semibold transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-brand-900/10">
                Buat Akun Gratis <IconArrowRight size={20} className="ml-3" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-brand-200/50 bg-white">
        <div className="container mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-brand-900">
            <IconHeartbeat size={20} stroke={2.5} />
            <span className="font-bold tracking-tight">HELIORA</span>
          </div>
          <p className="text-sm font-medium text-brand-900/50">
            © {new Date().getFullYear()} Heliora Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
