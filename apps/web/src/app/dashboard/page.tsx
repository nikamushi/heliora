"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Activity,
  Sliders,
  TrendingUp,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Heart,
  Brain
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AssessmentSummaryResponse, UserResponse } from "@/types/api";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [assessment, setAssessment] = useState<AssessmentSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRiskMenuExpanded, setIsRiskMenuExpanded] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const storedUser = apiClient.getStoredUser();
        setUser(storedUser);

        const data = await apiClient.assessment.getLatest();
        setAssessment(data);
      } catch {
        // Fallback handled gracefully in apiClient
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    apiClient.auth.logout();
    router.push("/login");
  };

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-brand-50/20 text-brand-900 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            HELIORA
          </p>
          <p className="text-sm font-medium text-brand-900/70">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }


  const userInitials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "HL";

  return (
    <div className="min-h-screen bg-brand-50/25 text-brand-900 selection:bg-brand-200 flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-brand-900/10 bg-white/85 backdrop-blur-xl h-screen sticky top-0 p-5 z-20">
        <div className="space-y-6">
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-3 px-1">
            <div className="size-9 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-emerald-300"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-brand-900 block leading-none">
                HELIORA
              </span>
              <span className="text-[10px] font-mono tracking-wider text-brand-900/50 uppercase mt-1 block">
                Preventive Health AI
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {/* Group 1: Menu Utama */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Menu Utama
              </p>
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-900 text-white shadow-xs transition-all"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Ringkasan Klinis</span>
              </Link>

              {/* Disease Risk Sub-menu */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsRiskMenuExpanded(!isRiskMenuExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 shrink-0 text-brand-900" />
                    <span>Analisis Risiko</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isRiskMenuExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isRiskMenuExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    <Link
                      href="/dashboard/risk/diabetes"
                      className="block py-1 text-xs text-brand-900/60 hover:text-brand-900 transition-colors"
                    >
                      Diabetes Melitus
                    </Link>
                    <Link
                      href="/dashboard/risk/hypertension"
                      className="block py-1 text-xs text-brand-900/60 hover:text-brand-900 transition-colors"
                    >
                      Hipertensi
                    </Link>
                    <Link
                      href="/dashboard/risk/cardiovascular"
                      className="block py-1 text-xs text-brand-900/60 hover:text-brand-900 transition-colors"
                    >
                      Kardiovaskular
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Group 2: Simulasi & Prediksi */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Simulasi
              </p>
              <Link
                href="/simulation/what-if"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <Sliders className="w-4 h-4 shrink-0 text-brand-900" />
                <span>What-If Simulator</span>
              </Link>
              <Link
                href="/simulation/future"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <TrendingUp className="w-4 h-4 shrink-0 text-brand-900" />
                <span>Proyeksi 180 Hari</span>
              </Link>
            </div>

            {/* Group 3: Profil & Pengaturan (Menu Sendiri) */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Profil &amp; Akun
              </p>
              <Link
                href="/onboarding/health-profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <User className="w-4 h-4 shrink-0 text-brand-900" />
                <span>Profil Saya</span>
              </Link>
              <Link
                href="/onboarding/health-profile"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900 transition-colors"
              >
                <Settings className="w-4 h-4 shrink-0 text-brand-900" />
                <span>Pengaturan Akun</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: User Card + Logout */}
        <div className="space-y-3 pt-4 border-t border-brand-900/10">
          <Link
            href="/onboarding/health-profile"
            className="p-2.5 rounded-xl bg-neutral-50/80 border border-brand-900/10 flex items-center gap-3 hover:bg-neutral-100/60 transition-colors"
          >
            <div className="size-8 rounded-xl bg-brand-900/10 border border-brand-900/15 text-brand-900 font-mono font-bold flex items-center justify-center text-xs shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-brand-900 truncate">
                {user?.full_name || "Pengguna Heliora"}
              </p>
              <p className="text-[10px] font-mono text-brand-900/50 truncate">
                {user?.email || "Profil Terverifikasi"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />

            {/* Mobile Sheet */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[80vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-brand-900 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    </div>
                    <span className="text-base font-bold text-brand-900">HELIORA</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-brand-900/60 hover:bg-neutral-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-4 pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-900 text-white"
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Ringkasan Klinis</span>
                  </Link>
                  <Link
                    href="/dashboard/risk/diabetes"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <Activity className="w-4 h-4 shrink-0" />
                    <span>Risiko Diabetes</span>
                  </Link>
                  <Link
                    href="/dashboard/risk/hypertension"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <Heart className="w-4 h-4 shrink-0" />
                    <span>Risiko Hipertensi</span>
                  </Link>
                  <Link
                    href="/dashboard/risk/cardiovascular"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <Brain className="w-4 h-4 shrink-0" />
                    <span>Risiko Kardiovaskular</span>
                  </Link>
                  <Link
                    href="/simulation/what-if"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <Sliders className="w-4 h-4 shrink-0" />
                    <span>What-If Simulator</span>
                  </Link>
                  <Link
                    href="/simulation/future"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>Proyeksi 180 Hari</span>
                  </Link>
                  <Link
                    href="/onboarding/health-profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <span>Profil Saya</span>
                  </Link>
                  <Link
                    href="/onboarding/health-profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100"
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Pengaturan Akun</span>
                  </Link>
                </nav>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Workspace Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-brand-900/10 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-xl border border-brand-900/15 text-brand-900 hover:bg-neutral-50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-brand-900/50 uppercase">Dashboard</span>
              <span className="text-brand-900/30">/</span>
              <span className="text-brand-900 font-bold uppercase">Ringkasan Klinis</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-6xl w-full mx-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-brand-900/10 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
                Halo, {user?.full_name?.split(" ")[0] || "Pengguna"}
              </h1>
              <p className="text-xs text-brand-900/60 mt-1 font-mono">
                Ringkasan komposit profil kesehatan preventif Anda berbasis model CDC BRFSS.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">
              STATUS ASSESSMENT: AKTIF & TERVERIFIKASI
            </span>
          </div>

          {/* Row 1: Primary Score Visual Gauges (Bento Grid) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Health Score Card */}
            <div className="bg-white/85 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                    Metrik 01 • Health Score
                  </p>
                  <h2 className="text-base font-bold text-brand-900 mt-1">
                    Indeks Kesehatan Fisiologis
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  KATEGORI BAIK
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Visual Circular Gauge */}
                <div className="relative size-24 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-brand-900/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-700"
                      strokeDasharray={`${assessment.health_score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono text-brand-900">
                      {assessment.health_score}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-brand-900">
                      {assessment.health_score}
                    </span>
                    <span className="text-xs font-mono text-brand-900/40">/ 100 poin</span>
                  </div>
                  <p className="text-xs text-brand-900/70 leading-relaxed">
                    Parameter kardiometabolik dasar Anda stabil. Menunjukkan perlindungan memadai dari akumulasi stres oksidatif.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-900/5 text-[11px] font-mono text-brand-900/60 flex justify-between">
                <span>Benchmark Populasi: Rata-rata 68</span>
                <span className="text-emerald-800 font-semibold">↑ Lebih tinggi dari 74% kohort</span>
              </div>
            </div>

            {/* Lifestyle Score Card */}
            <div className="bg-white/85 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                    Metrik 02 • Lifestyle Score
                  </p>
                  <h2 className="text-base font-bold text-brand-900 mt-1">
                    Kepatuhan Kebiasaan Harian
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  OPTIMAL TERKONTROL
                </span>
              </div>

              <div className="flex items-center gap-6">
                {/* Visual Circular Gauge */}
                <div className="relative size-24 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-brand-900/10"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-700"
                      strokeDasharray={`${assessment.lifestyle_score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold font-mono text-brand-900">
                      {assessment.lifestyle_score}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-brand-900">
                      {assessment.lifestyle_score}
                    </span>
                    <span className="text-xs font-mono text-brand-900/40">/ 100 poin</span>
                  </div>
                  <p className="text-xs text-brand-900/70 leading-relaxed">
                    Kombinasi durasi istirahat dan pola aktivitas fisik harian Anda membentuk daya tahan metabolik yang baik.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-900/5 text-[11px] font-mono text-brand-900/60 flex justify-between">
                <span>Target Ideal: &gt; 80 poin</span>
                <span className="text-amber-800 font-semibold">Tidur &amp; aktivitas perlu dijaga</span>
              </div>
            </div>
          </section>

          {/* Row 2: Disease Risk Profile (CDC BRFSS Validation) */}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                  Estimasi Risiko Kardiometabolik (Validasi Model BRFSS)
                </p>
                <h2 className="text-base font-bold text-brand-900 mt-0.5">
                  Profil Risiko Penyakit Utama
                </h2>
              </div>
              <span className="text-xs font-mono text-brand-900/50">
                Klik kartu untuk analisis klinis mendalam
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessment.risks.map((risk) => {
                const pct = Math.round(risk.probability * 100);
                let levelColor = "text-emerald-800";
                let barColor = "bg-emerald-600";
                let levelLabel = "Risiko Rendah";

                if (risk.risk_level === "moderate") {
                  levelColor = "text-amber-800";
                  barColor = "bg-amber-600";
                  levelLabel = "Risiko Sedang";
                } else if (risk.risk_level === "high") {
                  levelColor = "text-rose-800";
                  barColor = "bg-rose-600";
                  levelLabel = "Risiko Tinggi";
                }

                return (
                  <Link
                    key={risk.condition}
                    href={`/dashboard/risk/${risk.condition}`}
                    className="bg-white/85 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:border-brand-900/30 hover:-translate-y-0.5 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-sm font-bold text-brand-900 group-hover:text-brand-800 transition-colors">
                          {risk.label}
                        </h3>
                        <span className={`text-xs font-mono font-bold ${levelColor}`}>
                          {levelLabel}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-mono text-brand-900">
                          {pct}%
                        </span>
                        <span className="text-xs font-mono text-brand-900/40">probabilitas</span>
                      </div>

                      {/* Mini Linear Progress Bar */}
                      <div className="h-1.5 w-full bg-brand-900/10 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>

                      <p className="text-xs text-brand-900/70 leading-relaxed pt-1">
                        {risk.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-900/5 flex justify-between items-center text-[11px] text-brand-900/50 font-mono">
                      <span>Tren: {risk.trend === "stable" ? "Stabil" : "Meningkat"}</span>
                      <span className="font-semibold text-brand-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Rincian Klinis</span>
                        <span>→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Row 3: Interactive Simulation Hub (Killer Features) */}
          <section className="rounded-2xl bg-brand-900 text-white p-6 sm:p-7 shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-brand-200 uppercase">
                Fitur Unggulan Simulasi
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Eksplorasi Proyeksi Interaktif Gaya Hidup
              </h2>
              <p className="text-xs text-brand-200/80 leading-relaxed max-w-2xl">
                Gunakan simulator preventif berbasis machine learning untuk melihat bagaimana perubahan kebiasaan tidur, olahraga, dan nutrisi memengaruhi profil risiko Anda sebelum terlambat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card A: What-If Simulator */}
              <div className="p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-300" />
                    <h3 className="text-sm font-bold text-white">What-If Simulator</h3>
                  </div>
                  <p className="text-xs text-brand-200/80 leading-relaxed">
                    Geser slider durasi tidur, frekuensi aktivitas fisik, dan target berat badan untuk melihat proyeksi penurunan risiko secara real-time.
                  </p>
                </div>

                <Link href="/simulation/what-if">
                  <Button className="w-full h-9 rounded-xl bg-white text-brand-900 hover:bg-neutral-100 text-xs font-semibold shadow-xs">
                    <span>Buka What-If Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>

              {/* Card B: Future Health Trajectory */}
              <div className="p-5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                    <h3 className="text-sm font-bold text-white">Proyeksi 180 Hari</h3>
                  </div>
                  <p className="text-xs text-brand-200/80 leading-relaxed">
                    Evaluasi lintasan tren kesehatan Anda pada horizon 30, 90, dan 180 hari ke depan dengan perbandingan intervensi aktif.
                  </p>
                </div>

                <Link href="/simulation/future">
                  <Button
                    variant="outline"
                    className="w-full h-9 rounded-xl border-white/20 bg-brand-900/50 text-white hover:bg-brand-900/80 hover:text-white text-xs font-semibold"
                  >
                    <span>Lihat Garis Proyeksi</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Row 4: Two-Column Analysis (SHAP Factors & Recommendations) */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Top Contributing Factors (Explainable AI / SHAP) */}
            <div className="bg-white/85 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <div>
                <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                  Explainable AI (Kontribusi Faktor SHAP)
                </p>
                <h2 className="text-base font-bold text-brand-900 mt-1">
                  Faktor Penentu Profil Risiko Anda
                </h2>
              </div>

              <div className="space-y-3">
                {assessment.top_factors.map((factor) => {
                  const isProtective = factor.impact === "decrease";

                  return (
                    <div
                      key={factor.feature}
                      className="p-3.5 rounded-xl bg-neutral-50/70 border border-brand-900/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-900">
                          {factor.label}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            isProtective ? "text-emerald-800" : "text-amber-800"
                          }`}
                        >
                          {isProtective ? "Protektif" : `Beban +${factor.weight_percentage}%`}
                        </span>
                      </div>
                      <p className="text-xs text-brand-900/60 leading-relaxed">
                        {factor.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Recommended Action Plan */}
            <div className="bg-white/85 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <div>
                <p className="text-[11px] font-mono font-bold tracking-widest text-brand-900/50 uppercase">
                  Intervensi Terarah
                </p>
                <h2 className="text-base font-bold text-brand-900 mt-1">
                  Rencana Tindakan Berbasis Bukti
                </h2>
              </div>

              <div className="space-y-3">
                {assessment.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-neutral-50/70 border border-brand-900/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-brand-900">{rec.title}</h3>
                      <span className="text-[11px] font-mono font-bold text-brand-900/50">
                        Bukti Grade {rec.evidence_level}
                      </span>
                    </div>
                    <p className="text-xs text-brand-900/70 leading-relaxed">{rec.action}</p>
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-brand-900/50 font-mono">
                      <BookOpen className="w-3 h-3 text-brand-900/40" />
                      <span>{rec.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Persistent Medical Disclaimer */}
          <footer className="pt-6 border-t border-brand-900/10 space-y-2 text-center sm:text-left">
            <p className="text-xs font-mono font-bold text-brand-900/50 uppercase tracking-widest">
              Pemberitahuan Medis Penting
            </p>
            <p className="text-xs text-brand-900/60 leading-relaxed">
              HELIORA adalah platform edukasi kesehatan dan sarana estimasi risiko preventif berbasis model probabilistik machine learning (CDC BRFSS), bukan alat diagnosis medis klinis. Konsultasikan kondisi Anda kepada dokter atau tenaga medis berlisensi sebelum mengambil keputusan medis.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
