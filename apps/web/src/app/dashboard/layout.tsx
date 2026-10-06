"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SFHeartTextSquare,
  SFWaveformPathEcg,
  SFChevronRight,
  SFChevronLeft,
  SFShieldCheckmark,
  SFBookClosed,
  SFSlidersHorizontal,
  SFChartUptrend,
  SFCompass,
  SFPersonCropCircle,
  SFLockShield,
  SFDoorExit,
  SFLine3Horizontal,
  SFXmark,
  SFQuestionMarkCircle,
  SFDocText,
  SFBubbleLeftRight,
  SFHeadphones,
  SFInfoCircle,
  SFMagnifyingglass,
} from "@/components/icons/sf-icons";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "@/lib/api-client";
import { UserResponse } from "@/types/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPersonalMenuOpen, setIsPersonalMenuOpen] = useState(false);
  const [mobileNavLevel, setMobileNavLevel] = useState<"root" | "fitur" | "bantuan">("root");
  const [isRiskMenuExpanded, setIsRiskMenuExpanded] = useState(
    pathname?.startsWith("/dashboard/risk") ?? false
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    let isMounted = true;

    async function verifyMandatoryAccess() {
      try {
        const token = await apiClient.getAccessToken();
        if (!token) {
          if (isMounted) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
          }
          return;
        }

        // 1. Check user profile / auth
        let currentUser = apiClient.getStoredUser();
        if (!currentUser) {
          try {
            currentUser = await apiClient.auth.me();
          } catch {
            if (isMounted) {
              apiClient.clearToken();
              router.replace(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
            }
            return;
          }
        }
        if (isMounted && currentUser) {
          setUser(currentUser);
        }

        // 2. Check Mandatory Consent
        try {
          const consentStatus = await apiClient.consent.getStatus();
          if (!consentStatus?.has_active_consent) {
            if (isMounted) {
              router.replace("/onboarding/consent");
            }
            return;
          }
        } catch {
          if (isMounted) {
            router.replace("/onboarding/consent");
          }
          return;
        }

        // 3. Check Mandatory Health Profile (Step 1-3)
        try {
          const profile = await apiClient.healthProfile.get();
          if (
            !profile ||
            !profile.age ||
            !profile.gender ||
            !profile.height_cm ||
            !profile.weight_kg
          ) {
            if (isMounted) {
              router.replace("/onboarding/health-profile");
            }
            return;
          }
        } catch {
          if (isMounted) {
            router.replace("/onboarding/health-profile");
          }
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
          setIsCheckingAuth(false);
        }
      } catch {
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    verifyMandatoryAccess();

    return () => {
      isMounted = false;
    };
  }, [router, pathname]);


  const handleLogout = async () => {
    try {
      await apiClient.auth.logout();
    } finally {
      router.push("/login");
    }
  };

  const userInitials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "HL";

  const activePrimaryTab: "ringkasan" | "fitur" | "personal" | "bantuan" =
    pathname?.startsWith("/dashboard/help")
      ? "bantuan"
      : pathname === "/dashboard"
      ? "ringkasan"
      : pathname?.startsWith("/dashboard/settings") || pathname?.startsWith("/dashboard/profile")
      ? "personal"
      : "fitur";

  if (isCheckingAuth || !isAuthorized) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0D5F3F] text-white flex items-center justify-center font-bold text-xl shadow-xs animate-pulse">
            H
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-semibold text-[#111827]">Memeriksa Sesi HELIORA</h2>
            <p className="text-xs text-[#6B7280]">Menyiapkan data kesehatan Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/40 text-neutral-900 selection:bg-brand-100 flex flex-col lg:flex-row">
      {/* ── Mobile & Tablet Top Bar (< 1024px) ── */}
      <header className="lg:hidden bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 h-15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMobileNavLevel("root");
              setIsPersonalMenuOpen(false);
              setIsMobileMenuOpen(true);
            }}
            className="size-9 text-neutral-800 hover:text-neutral-950 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Buka menu navigasi"
            aria-expanded={isMobileMenuOpen}
          >
            <SFLine3Horizontal className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="font-bold text-base tracking-tight text-neutral-900">
            HELIORA
          </Link>
        </div>

        {/* Tablet breadcrumb preview */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-mono text-neutral-500">
          <span className="uppercase tracking-wider font-semibold text-neutral-700">
            {pathname === "/dashboard"
              ? "Ringkasan"
              : pathname?.startsWith("/dashboard/risk")
              ? "Risiko"
              : pathname?.startsWith("/dashboard/recommendations")
              ? "Tindakan"
              : pathname?.startsWith("/dashboard/simulation/what-if")
              ? "Skenario"
              : pathname?.startsWith("/dashboard/simulation/future")
              ? "Proyeksi"
              : pathname?.startsWith("/dashboard/evidence")
              ? "Bukti"
              : pathname?.startsWith("/dashboard/help")
              ? "Bantuan"
              : pathname?.startsWith("/dashboard/profile")
              ? "Profil"
              : "Akun"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="size-9 text-neutral-800 hover:text-neutral-950 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Buka pencarian"
          >
            <SFMagnifyingglass className="w-5.5 h-5.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsPersonalMenuOpen(true);
            }}
            className="size-9 rounded-full bg-neutral-200 text-neutral-800 font-semibold flex items-center justify-center text-xs hover:ring-2 hover:ring-brand-900/20 transition-all cursor-pointer"
            title="Personal & Profil Saya"
          >
            {userInitials}
          </button>
        </div>
      </header>

      {/* ── Mobile & Tablet Main Navigation Drawer (< 1024px) ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out / Full-Sheet Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.32,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative w-full sm:w-96 sm:max-w-md bg-white h-full pt-3 px-4 pb-4 sm:pt-4 sm:px-6 sm:pb-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto overscroll-contain"
            >
              <div className="space-y-2">
                {/* Mobile Full-Sheet Header with Fixed Stable Layout (1st & 2nd Nav) */}
                <div className="h-9 flex items-center justify-between">
                  {/* Left Slot: Back Arrow or Spacer */}
                  {mobileNavLevel !== "root" ? (
                    <button
                      type="button"
                      onClick={() => setMobileNavLevel("root")}
                      className="size-8 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Kembali ke menu utama"
                    >
                      <SFChevronLeft className="w-6 h-6" />
                    </button>
                  ) : (
                    <div className="size-8" />
                  )}

                  {/* Center Slot: Sub-level Title */}
                  {mobileNavLevel !== "root" ? (
                    <span className="text-base font-bold uppercase tracking-wider text-neutral-800">
                      {mobileNavLevel === "fitur" ? "Jelajahi" : "Bantuan"}
                    </span>
                  ) : (
                    <div />
                  )}

                  {/* Right Slot: Close Button (Always in identical pixel position) */}
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="size-8 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Tutup menu"
                  >
                    <SFXmark className="w-6 h-6" />
                  </button>
                </div>

                {/* Animated Navigation Drill-Down Levels */}
                <AnimatePresence mode="wait" initial={false}>
                  {mobileNavLevel === "root" && (
                    <motion.nav
                      key="root"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3 pt-0"
                    >
                      {/* 1. Ringkasan (Direct destination) */}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                          pathname === "/dashboard"
                            ? "bg-neutral-900/[0.08] text-neutral-950 shadow-xs"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Ringkasan</span>
                      </Link>

                      {/* 2. Jelajahi (Drill down) */}
                      <button
                        type="button"
                        onClick={() => setMobileNavLevel("fitur")}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-xl font-bold transition-colors cursor-pointer ${
                          activePrimaryTab === "fitur"
                            ? "bg-neutral-900/[0.08] text-neutral-950 shadow-xs"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Jelajahi</span>
                        <SFChevronRight className="w-6 h-6 text-neutral-400 shrink-0" />
                      </button>

                      {/* 3. Bantuan (Drill down) */}
                      <button
                        type="button"
                        onClick={() => setMobileNavLevel("bantuan")}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-xl font-bold transition-colors cursor-pointer ${
                          activePrimaryTab === "bantuan"
                            ? "bg-neutral-900/[0.08] text-neutral-950 shadow-xs"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Bantuan</span>
                        <SFChevronRight className="w-6 h-6 text-neutral-400 shrink-0" />
                      </button>
                    </motion.nav>
                  )}

                  {mobileNavLevel === "fitur" && (
                    <motion.nav
                      key="fitur"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 14 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-6 pt-0"
                    >
                      {/* Cluster 1: Risiko */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setIsRiskMenuExpanded(!isRiskMenuExpanded)}
                          className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl text-xl font-bold transition-colors cursor-pointer ${
                            pathname?.startsWith("/dashboard/risk")
                              ? "bg-neutral-900/[0.08] text-neutral-950"
                              : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                          }`}
                        >
                          <span>Risiko</span>
                          <SFChevronRight
                            className={`w-6 h-6 text-neutral-400 transition-transform duration-200 ${
                              isRiskMenuExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        {isRiskMenuExpanded && (
                          <div className="pl-4 pr-2 py-1 space-y-2 border-l-2 border-neutral-100 ml-4 my-2">
                            <Link
                              href="/dashboard/risk/diabetes"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`block py-1.5 text-lg transition-colors ${
                                pathname === "/dashboard/risk/diabetes"
                                  ? "font-bold text-brand-900"
                                  : "text-neutral-700 hover:text-neutral-950 font-semibold"
                              }`}
                            >
                              Diabetes Melitus
                            </Link>
                            <Link
                              href="/dashboard/risk/hypertension"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`block py-1.5 text-lg transition-colors ${
                                pathname === "/dashboard/risk/hypertension"
                                  ? "font-bold text-brand-900"
                                  : "text-neutral-700 hover:text-neutral-950 font-semibold"
                              }`}
                            >
                              Hipertensi
                            </Link>
                            <Link
                              href="/dashboard/risk/cardiovascular"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`block py-1.5 text-lg transition-colors ${
                                pathname === "/dashboard/risk/cardiovascular"
                                  ? "font-bold text-brand-900"
                                  : "text-neutral-700 hover:text-neutral-950 font-semibold"
                              }`}
                            >
                              Kardiovaskular
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Cluster 2: Tindakan */}
                      <div>
                        <Link
                          href="/dashboard/recommendations"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                            pathname?.startsWith("/dashboard/recommendations")
                              ? "bg-neutral-900/[0.08] text-neutral-950"
                              : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                          }`}
                        >
                          <span>Tindakan</span>
                        </Link>
                      </div>

                      {/* Cluster 3: Skenario & Proyeksi */}
                      <div className="space-y-3">
                        <Link
                          href="/dashboard/simulation/what-if"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                            pathname === "/dashboard/simulation/what-if"
                              ? "bg-neutral-900/[0.08] text-neutral-950"
                              : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                          }`}
                        >
                          <span>Skenario</span>
                        </Link>
                        <Link
                          href="/dashboard/simulation/future"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                            pathname === "/dashboard/simulation/future"
                              ? "bg-neutral-900/[0.08] text-neutral-950"
                              : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                          }`}
                        >
                          <span>Proyeksi</span>
                        </Link>
                      </div>

                      {/* Cluster 4: Bukti */}
                      <div>
                        <Link
                          href="/dashboard/evidence"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                            pathname?.startsWith("/dashboard/evidence")
                              ? "bg-neutral-900/[0.08] text-neutral-950"
                              : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                          }`}
                        >
                          <span>Bukti</span>
                        </Link>
                      </div>
                    </motion.nav>
                  )}

                  {mobileNavLevel === "bantuan" && (
                    <motion.nav
                      key="bantuan"
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 14 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-3 pt-0"
                    >
                      <Link
                        href="/dashboard/help/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                          pathname === "/dashboard/help/about" || pathname === "/dashboard/help"
                            ? "bg-neutral-900/[0.08] text-neutral-950"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Tentang</span>
                      </Link>
                      <Link
                        href="/dashboard/help/guide"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                          pathname === "/dashboard/help/guide"
                            ? "bg-neutral-900/[0.08] text-neutral-950"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Panduan Penggunaan</span>
                      </Link>
                      <Link
                        href="/dashboard/help/faq"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                          pathname === "/dashboard/help/faq"
                            ? "bg-neutral-900/[0.08] text-neutral-950"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Tanya Jawab (FAQ)</span>
                      </Link>
                      <Link
                        href="/dashboard/help/support"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                          pathname === "/dashboard/help/support"
                            ? "bg-neutral-900/[0.08] text-neutral-950"
                            : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                        }`}
                      >
                        <span>Hubungi Dukungan</span>
                      </Link>
                    </motion.nav>
                  )}
                </AnimatePresence>
              </div>

            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mobile & Tablet Personal / Account Sheet (< 1024px) ── */}
      <AnimatePresence>
        {isPersonalMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs"
              onClick={() => setIsPersonalMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out / Full-Sheet Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.32,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative w-full sm:w-96 sm:max-w-md bg-white h-full pt-3 px-4 pb-4 sm:pt-4 sm:px-6 sm:pb-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto overscroll-contain ml-auto"
            >
              <div className="space-y-2">
                {/* Header with Fixed Stable Layout */}
                <div className="h-9 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsPersonalMenuOpen(false)}
                    className="size-8 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Tutup menu"
                  >
                    <SFXmark className="w-6 h-6" />
                  </button>
                  <div className="size-8" />
                </div>

                {/* Menu Items */}
                <nav className="space-y-3 pt-0">
                  {/* 1. Profil */}
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsPersonalMenuOpen(false)}
                    className={`w-full flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                      pathname === "/dashboard/profile"
                        ? "bg-neutral-900/[0.08] text-neutral-950 shadow-xs"
                        : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                    }`}
                  >
                    <span>Profil</span>
                  </Link>

                  {/* 2. Akun */}
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsPersonalMenuOpen(false)}
                    className={`w-full flex items-center px-4 py-4 rounded-2xl text-xl font-bold transition-colors ${
                      pathname === "/dashboard/settings"
                        ? "bg-neutral-900/[0.08] text-neutral-950 shadow-xs"
                        : "text-neutral-900 hover:bg-neutral-900/[0.04]"
                    }`}
                  >
                    <span>Akun</span>
                  </Link>

                  {/* 3. Keluar */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-4 rounded-2xl text-xl text-rose-600 bg-rose-50 cursor-pointer font-bold"
                  >
                    <span>Keluar</span>
                  </button>
                </nav>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Desktop Primary Sidebar (Sidebar 1: Icon-Only Rail) ── */}
      <aside className="hidden lg:flex w-16 shrink-0 flex-col items-center bg-brand-900 h-screen sticky top-0 py-4 px-2.5 z-20 select-none">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* User Avatar Entry Point (Top) */}
          <Link
            href="/dashboard/profile"
            title={user?.full_name || "Profil Saya"}
            className={`size-9 rounded-full font-semibold flex items-center justify-center text-xs transition-all ${
              activePrimaryTab === "personal"
                ? "bg-white text-brand-900 ring-2 ring-white/40 shadow-xs"
                : "bg-white/15 text-white hover:bg-white/25 hover:ring-2 hover:ring-white/30"
            }`}
          >
            {userInitials}
          </Link>

          {/* Top-Level Icon Navigation */}
          <nav className="flex flex-col items-center gap-6 w-full">
            {/* Destination 1: Ringkasan */}
            <Link
              href="/dashboard"
              title="Ringkasan"
              className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                activePrimaryTab === "ringkasan"
                  ? "bg-white text-brand-900 shadow-xs"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <SFHeartTextSquare className="w-5.5 h-5.5" />
            </Link>

            {/* Destination 2: Jelajahi */}
            <Link
              href="/dashboard/risk/diabetes"
              title="Jelajahi"
              className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                activePrimaryTab === "fitur"
                  ? "bg-white text-brand-900 shadow-xs"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <SFCompass className="w-5.5 h-5.5" />
            </Link>

            {/* Destination 3: Bantuan */}
            <Link
              href="/dashboard/help/about"
              title="Bantuan"
              className={`size-10 rounded-xl flex items-center justify-center transition-colors ${
                activePrimaryTab === "bantuan"
                  ? "bg-white text-brand-900 shadow-xs"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <SFQuestionMarkCircle className="w-5.5 h-5.5" />
            </Link>
          </nav>
        </div>
      </aside>

      {/* ── Desktop Secondary Sidebar (Sidebar 2: Animated Pop-Out) ── */}
      <AnimatePresence>
        {activePrimaryTab !== "ringkasan" && (
          <motion.aside
            key="desktop-secondary-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{
              duration: 0.28,
              ease: [0.32, 0.72, 0, 1],
            }}
            className="hidden lg:flex shrink-0 flex-col h-screen sticky top-0 z-10 overflow-hidden bg-neutral-100"
          >
            <div className="w-60 min-w-[240px] h-full pt-4 px-4.5 pb-4.5 overflow-y-auto flex flex-col justify-between">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activePrimaryTab}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Header of Active Destination (Aligned with Avatar size-9) */}
                  <div className="h-9 px-2 flex items-center">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
                      {activePrimaryTab === "fitur"
                        ? "Jelajahi"
                        : activePrimaryTab === "bantuan"
                        ? "Bantuan"
                        : "Personal"}
                    </h2>
                  </div>

              {/* Sub-Items for Jelajahi */}
              {activePrimaryTab === "fitur" && (
                <nav className="mt-6 space-y-6">
                  {/* Cluster 1: Risiko */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsRiskMenuExpanded(!isRiskMenuExpanded)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer ${
                        pathname?.startsWith("/dashboard/risk")
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <SFWaveformPathEcg className="w-5 h-5 shrink-0 text-rose-600" />
                        <span>Risiko</span>
                      </div>
                      <SFChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isRiskMenuExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {isRiskMenuExpanded && (
                      <div className="pl-9.5 pr-2 py-1 space-y-1">
                        <Link
                          href="/dashboard/risk/diabetes"
                          className={`block py-1 text-[13px] transition-colors ${
                            pathname === "/dashboard/risk/diabetes"
                              ? "font-bold text-brand-900"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          Diabetes Melitus
                        </Link>
                        <Link
                          href="/dashboard/risk/hypertension"
                          className={`block py-1 text-[13px] transition-colors ${
                            pathname === "/dashboard/risk/hypertension"
                              ? "font-bold text-brand-900"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          Hipertensi
                        </Link>
                        <Link
                          href="/dashboard/risk/cardiovascular"
                          className={`block py-1 text-[13px] transition-colors ${
                            pathname === "/dashboard/risk/cardiovascular"
                              ? "font-bold text-brand-900"
                              : "text-neutral-500 hover:text-neutral-900"
                          }`}
                        >
                          Kardiovaskular
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Cluster 2: Tindakan */}
                  <div>
                    <Link
                      href="/dashboard/recommendations"
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname?.startsWith("/dashboard/recommendations")
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <SFShieldCheckmark className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span>Tindakan</span>
                    </Link>
                  </div>

                  {/* Cluster 3: Skenario & Proyeksi */}
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/simulation/what-if"
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname === "/dashboard/simulation/what-if"
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <SFSlidersHorizontal className="w-5 h-5 shrink-0 text-violet-600" />
                      <span>Skenario</span>
                    </Link>
                    <Link
                      href="/dashboard/simulation/future"
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname === "/dashboard/simulation/future"
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <SFChartUptrend className="w-5 h-5 shrink-0 text-teal-600" />
                      <span>Proyeksi</span>
                    </Link>
                  </div>

                  {/* Cluster 4: Bukti */}
                  <div>
                    <Link
                      href="/dashboard/evidence"
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname?.startsWith("/dashboard/evidence")
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <SFBookClosed className="w-5 h-5 shrink-0 text-amber-500" />
                      <span>Bukti</span>
                    </Link>
                  </div>
                </nav>
              )}

              {/* Sub-Items for Bantuan */}
              {activePrimaryTab === "bantuan" && (
                <nav className="mt-6 space-y-2">
                  <Link
                    href="/dashboard/help/about"
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      pathname === "/dashboard/help/about" || pathname === "/dashboard/help"
                        ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                        : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                    }`}
                  >
                    <SFInfoCircle className="w-5 h-5 shrink-0 text-amber-600" />
                    <span>Tentang</span>
                  </Link>
                  <Link
                    href="/dashboard/help/guide"
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      pathname === "/dashboard/help/guide"
                        ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                        : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                    }`}
                  >
                    <SFDocText className="w-5 h-5 shrink-0 text-blue-600" />
                    <span>Panduan Penggunaan</span>
                  </Link>
                  <Link
                    href="/dashboard/help/faq"
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      pathname === "/dashboard/help/faq"
                        ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                        : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                    }`}
                  >
                    <SFBubbleLeftRight className="w-5 h-5 shrink-0 text-violet-600" />
                    <span>Tanya Jawab (FAQ)</span>
                  </Link>
                  <Link
                    href="/dashboard/help/support"
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                      pathname === "/dashboard/help/support"
                        ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                        : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                    }`}
                  >
                    <SFHeadphones className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>Hubungi Dukungan</span>
                  </Link>
                </nav>
              )}

              {/* Sub-Items for Personal */}
              {activePrimaryTab === "personal" && (
                <nav className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Link
                      href="/dashboard/profile"
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname === "/dashboard/profile"
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <SFPersonCropCircle className="w-5 h-5 shrink-0 text-blue-600" />
                      <span>Profil</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname === "/dashboard/settings"
                          ? "bg-neutral-900/[0.08] text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-900/[0.04] hover:text-neutral-900 font-medium"
                      }`}
                    >
                      <SFLockShield className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span>Akun</span>
                    </Link>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 cursor-pointer"
                    >
                      <SFDoorExit className="w-5 h-5 shrink-0 text-rose-600" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </nav>
              )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main Content Area (Column 3) ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header with Global Search (Aligned h-12 with 2nd sidebar header) */}
        <header className="h-12 bg-white/70 backdrop-blur-md sticky top-0 z-20 px-6 hidden lg:flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full max-w-md flex items-center text-left cursor-pointer group"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-hover:text-neutral-600 transition-colors">
              <SFMagnifyingglass className="w-4 h-4" />
            </div>
            <div className="w-full pl-9 pr-10 py-1.5 text-sm bg-transparent group-hover:bg-neutral-50/50 text-neutral-400 rounded-xl border border-neutral-200/70 group-hover:border-neutral-300/80 transition-all select-none">
              Heliora
            </div>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="inline-flex items-center px-1.5 py-0.5 border border-neutral-200/70 rounded text-[10px] font-mono text-neutral-400 bg-neutral-50/60 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </header>
        {children}
      </div>

      {/* ── Search Sheet Overlay (Apple Style Top Dropdown Sheet) ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-neutral-950/25 backdrop-blur-md"
              onClick={() => setIsSearchOpen(false)}
              aria-hidden="true"
            />

            {/* Top Sheet Panel (Apple Fluid Spring - Ultra Smooth In & Out) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "calc(-100% - 100px)" }}
              transition={{
                type: "spring",
                damping: 38,
                stiffness: 280,
                mass: 0.9,
              }}
              className="relative w-full h-screen min-h-screen lg:h-auto lg:min-h-0 bg-white shadow-none lg:shadow-2xl lg:shadow-neutral-900/15 z-10 pt-5 pb-8 px-5 sm:px-8 lg:pt-7 lg:pb-10 lg:px-12 overflow-y-auto"
            >
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Search Input Row: Large, Borderless Typography with Staggered Entrance */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3"
                >
                  <SFMagnifyingglass className="w-6 h-6 text-neutral-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari"
                    className="flex-1 bg-transparent text-xl sm:text-2xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none tracking-tight"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="lg:hidden size-8 text-neutral-400 hover:text-neutral-800 active:text-neutral-950 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    aria-label="Tutup pencarian"
                  >
                    <SFXmark className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* Quick Links Section with Staggered Reveal & Micro-Interactions */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-3 pt-1"
                >
                  <span className="text-xs font-semibold text-neutral-400 tracking-wide block">
                    Quick Links
                  </span>
                  <div className="flex flex-col space-y-2.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsSearchOpen(false)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-brand-900 transition-colors w-fit group"
                    >
                      <span className="text-neutral-400 group-hover:text-brand-900 group-hover:translate-x-1 inline-block transition-transform duration-200 ease-out">
                        →
                      </span>
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-200 ease-out">
                        Ringkasan Klinis
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/risk/diabetes"
                      onClick={() => setIsSearchOpen(false)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-brand-900 transition-colors w-fit group"
                    >
                      <span className="text-neutral-400 group-hover:text-brand-900 group-hover:translate-x-1 inline-block transition-transform duration-200 ease-out">
                        →
                      </span>
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-200 ease-out">
                        Analisis Risiko Penyakit
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/simulation/what-if"
                      onClick={() => setIsSearchOpen(false)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-brand-900 transition-colors w-fit group"
                    >
                      <span className="text-neutral-400 group-hover:text-brand-900 group-hover:translate-x-1 inline-block transition-transform duration-200 ease-out">
                        →
                      </span>
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-200 ease-out">
                        Simulasi Gaya Hidup (What-If)
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/evidence"
                      onClick={() => setIsSearchOpen(false)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-brand-900 transition-colors w-fit group"
                    >
                      <span className="text-neutral-400 group-hover:text-brand-900 group-hover:translate-x-1 inline-block transition-transform duration-200 ease-out">
                        →
                      </span>
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-200 ease-out">
                        Pusat Bukti Medis
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/help"
                      onClick={() => setIsSearchOpen(false)}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-800 hover:text-brand-900 transition-colors w-fit group"
                    >
                      <span className="text-neutral-400 group-hover:text-brand-900 group-hover:translate-x-1 inline-block transition-transform duration-200 ease-out">
                        →
                      </span>
                      <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-200 ease-out">
                        Pusat Bantuan &amp; Panduan
                      </span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
