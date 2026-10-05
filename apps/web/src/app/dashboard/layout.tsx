"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SFSquareGrid2x2,
  SFWaveformPathEcg,
  SFChevronRight,
  SFShieldCheckmark,
  SFBookClosed,
  SFSlidersHorizontal,
  SFChartUptrend,
  SFPersonCropCircle,
  SFGearshape,
  SFDoorExit,
  SFLine3Horizontal,
  SFXmark,
} from "@/components/icons/sf-icons";
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
  const [isRiskMenuExpanded, setIsRiskMenuExpanded] = useState(
    pathname?.startsWith("/dashboard/risk") ?? false
  );

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

  const isRouteActive = (route: string) => {
    if (route === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(route);
  };

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
    <div className="min-h-screen bg-brand-50/25 text-brand-900 selection:bg-brand-200 flex flex-col lg:flex-row">
      {/* ── Mobile Topbar ── */}
      <header className="lg:hidden border-b border-brand-900/10 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-brand-900/10 hover:bg-neutral-100 transition-colors"
            aria-label="Buka menu navigasi"
          >
            <SFLine3Horizontal className="w-5 h-5 text-brand-900" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sm tracking-tight text-brand-900">
            <span className="w-6 h-6 rounded-lg bg-brand-900 text-white flex items-center justify-center text-xs font-semibold">
              H
            </span>
            <span>HELIORA</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/profile"
            className="size-7 rounded-lg bg-brand-900/10 border border-brand-900/15 text-brand-900 font-mono font-bold flex items-center justify-center text-[10px] hover:bg-brand-900/20 transition-colors"
            title="Profil Saya"
          >
            {userInitials}
          </Link>
        </div>
      </header>

      {/* ── Mobile Drawer Backdrop & Menu ── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-brand-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-brand-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    H
                  </span>
                  <span className="font-bold text-base tracking-tight text-brand-900">
                    HELIORA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg border border-brand-900/10 hover:bg-neutral-100 transition-colors"
                  aria-label="Tutup menu"
                >
                  <SFXmark className="w-4 h-4 text-brand-900" />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <nav className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-1">
                    Menu Utama
                  </p>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFSquareGrid2x2 className="w-4 h-4 shrink-0" />
                    <span>Ringkasan Klinis</span>
                  </Link>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRiskMenuExpanded(!isRiskMenuExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-brand-900/70 hover:bg-neutral-100/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <SFWaveformPathEcg className="w-4 h-4 shrink-0 text-brand-900" />
                        <span>Analisis Risiko</span>
                      </div>
                      <SFChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isRiskMenuExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {isRiskMenuExpanded && (
                      <div className="pl-9 pr-2 py-1 space-y-1">
                        <Link
                          href="/dashboard/risk/diabetes"
                          className="block py-1 text-xs text-brand-900/60 hover:text-brand-900"
                        >
                          Diabetes Melitus
                        </Link>
                        <Link
                          href="/dashboard/risk/hypertension"
                          className="block py-1 text-xs text-brand-900/60 hover:text-brand-900"
                        >
                          Hipertensi
                        </Link>
                        <Link
                          href="/dashboard/risk/cardiovascular"
                          className="block py-1 text-xs text-brand-900/60 hover:text-brand-900"
                        >
                          Kardiovaskular
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-1">
                    Intervensi &amp; Bukti
                  </p>
                  <Link
                    href="/dashboard/recommendations"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard/recommendations")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFShieldCheckmark className="w-4 h-4 shrink-0" />
                    <span>Rencana Tindakan</span>
                  </Link>
                  <Link
                    href="/dashboard/evidence"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard/evidence")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFBookClosed className="w-4 h-4 shrink-0" />
                    <span>Pusat Bukti Medis</span>
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-1">
                    Simulasi
                  </p>
                  <Link
                    href="/dashboard/simulation/what-if"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard/simulation/what-if")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFSlidersHorizontal className="w-4 h-4 shrink-0" />
                    <span>What-If Simulator</span>
                  </Link>
                  <Link
                    href="/dashboard/simulation/future"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard/simulation/future")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFChartUptrend className="w-4 h-4 shrink-0" />
                    <span>Proyeksi Horison</span>
                  </Link>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-1">
                    Profil &amp; Akun
                  </p>
                  <Link
                    href="/dashboard/profile"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard/profile")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFPersonCropCircle className="w-4 h-4 shrink-0" />
                    <span>Profil Saya</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isRouteActive("/dashboard/settings")
                        ? "bg-brand-900 text-white shadow-xs"
                        : "text-brand-900/70 hover:bg-neutral-100/60"
                    }`}
                  >
                    <SFGearshape className="w-4 h-4 shrink-0" />
                    <span>Pengaturan Akun</span>
                  </Link>
                </div>
              </nav>
            </div>

            <div className="pt-4 border-t border-brand-900/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <SFDoorExit className="w-4 h-4 shrink-0" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Persistent Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-brand-900/10 bg-white/85 backdrop-blur-xl h-screen sticky top-0 p-5 z-20">
        <div className="space-y-6">
          {/* Brand Mark & Title */}
          <Link href="/dashboard" className="flex items-center gap-3 px-1 group">
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
          </Link>

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {/* Group 1: Menu Utama */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Menu Utama
              </p>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname === "/dashboard"
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFSquareGrid2x2 className="w-4 h-4 shrink-0" />
                <span>Ringkasan Klinis</span>
              </Link>

              {/* Disease Risk Sub-menu */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsRiskMenuExpanded(!isRiskMenuExpanded)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    pathname?.startsWith("/dashboard/risk")
                      ? "text-brand-900 font-bold bg-neutral-100/50"
                      : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SFWaveformPathEcg className="w-4 h-4 shrink-0 text-brand-900" />
                    <span>Analisis Risiko</span>
                  </div>
                  <SFChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isRiskMenuExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {isRiskMenuExpanded && (
                  <div className="pl-9 pr-2 py-1 space-y-1">
                    <Link
                      href="/dashboard/risk/diabetes"
                      className={`block py-1 text-xs transition-colors ${
                        pathname === "/dashboard/risk/diabetes"
                          ? "font-bold text-brand-900"
                          : "text-brand-900/60 hover:text-brand-900"
                      }`}
                    >
                      Diabetes Melitus
                    </Link>
                    <Link
                      href="/dashboard/risk/hypertension"
                      className={`block py-1 text-xs transition-colors ${
                        pathname === "/dashboard/risk/hypertension"
                          ? "font-bold text-brand-900"
                          : "text-brand-900/60 hover:text-brand-900"
                      }`}
                    >
                      Hipertensi
                    </Link>
                    <Link
                      href="/dashboard/risk/cardiovascular"
                      className={`block py-1 text-xs transition-colors ${
                        pathname === "/dashboard/risk/cardiovascular"
                          ? "font-bold text-brand-900"
                          : "text-brand-900/60 hover:text-brand-900"
                      }`}
                    >
                      Kardiovaskular
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Group 2: Intervensi & Bukti */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Intervensi &amp; Bukti
              </p>
              <Link
                href="/dashboard/recommendations"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname?.startsWith("/dashboard/recommendations")
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFShieldCheckmark className="w-4 h-4 shrink-0" />
                <span>Rencana Tindakan</span>
              </Link>
              <Link
                href="/dashboard/evidence"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname?.startsWith("/dashboard/evidence")
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFBookClosed className="w-4 h-4 shrink-0" />
                <span>Pusat Bukti Medis</span>
              </Link>
            </div>

            {/* Group 3: Simulasi */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Simulasi
              </p>
              <Link
                href="/dashboard/simulation/what-if"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname?.startsWith("/dashboard/simulation/what-if")
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFSlidersHorizontal className="w-4 h-4 shrink-0" />
                <span>What-If Simulator</span>
              </Link>
              <Link
                href="/dashboard/simulation/future"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  pathname?.startsWith("/dashboard/simulation/future")
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFChartUptrend className="w-4 h-4 shrink-0" />
                <span>Proyeksi Horison</span>
              </Link>
            </div>

            {/* Group 4: Profil & Akun */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase px-3 mb-2">
                Profil &amp; Akun
              </p>
              <Link
                href="/dashboard/profile"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isRouteActive("/dashboard/profile")
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFPersonCropCircle className="w-4 h-4 shrink-0" />
                <span>Profil Saya</span>
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isRouteActive("/dashboard/settings")
                    ? "bg-brand-900 text-white shadow-xs"
                    : "text-brand-900/70 hover:bg-neutral-100/60 hover:text-brand-900"
                }`}
              >
                <SFGearshape className="w-4 h-4 shrink-0" />
                <span>Pengaturan Akun</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Clean Logout Button */}
        <div className="pt-4 border-t border-brand-900/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <SFDoorExit className="w-4 h-4 shrink-0" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
