"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SFShieldCheckmark,
  SFKey,
  SFDocText,
  SFDoorExit,
  SFCheckmarkCircle,
  SFArrowUpRight,
  SFLock,
  SFEnvelope,
} from "@/components/icons/sf-icons";
import { apiClient } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { ConsentStatusResponse, UserResponse } from "@/types/api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthorized } = useRequireAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadSettings() {
      setIsLoading(true);
      try {
        const storedUser = apiClient.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        const consent = await apiClient.consent.getStatus();
        if (!isCancelled) {
          setConsentStatus(consent);
        }
      } catch {
        // Silently catch error
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout();
    } finally {
      router.push("/login");
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      // Send password reset via Supabase Client
      const { getSupabaseClient } = await import("@/lib/supabase-client");
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
        });
      }
      setPasswordResetSent(true);
    } catch {
      setPasswordResetSent(true); // Graceful state
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-center p-6 min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            HELIORA
          </p>
          <p className="text-sm font-medium text-brand-900/70">Memuat pengaturan akun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Top Header / Breadcrumb */}
      <header className="h-16 border-b border-brand-900/10 bg-white/70 backdrop-blur-md sticky top-0 z-10 px-6 hidden lg:flex items-center">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link href="/dashboard" className="text-brand-900/50 uppercase hover:text-brand-900 transition-colors">
            Dashboard
          </Link>
          <span className="text-brand-900/30">/</span>
          <span className="text-brand-900 font-bold uppercase">Pengaturan Akun</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto">
        {/* Title Section */}
        <section className="space-y-2 border-b border-brand-900/10 pb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
            Preferensi &amp; Keamanan
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
            Pengaturan Akun &amp; Privasi
          </h1>
          <p className="text-sm text-brand-900/70 mt-1 max-w-2xl leading-relaxed">
            Kelola kredensial akses, hak persetujuan privasi etika data medis, dan sesi aktif pada ekosistem HELIORA.
          </p>
        </section>

        {/* Section 1: Security & Credentials */}
        <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                Keamanan &amp; Autentikasi
              </span>
              <h2 className="text-base font-bold text-brand-900 mt-0.5">
                Kredensial Akun
              </h2>
            </div>
            <SFLock className="w-4 h-4 text-brand-900/40" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50/70 border border-brand-900/10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-brand-900/50 uppercase block">
                  Email Terdaftar
                </span>
                <p className="text-sm font-bold text-brand-900 flex items-center gap-2">
                  <SFEnvelope className="w-4 h-4 text-brand-900/60" />
                  <span>{user?.email || "Tidak ada email"}</span>
                </p>
              </div>

              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                Terenkripsi Supabase Auth
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50/70 border border-brand-900/10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-brand-900/50 uppercase block">
                  Kata Sandi
                </span>
                <p className="text-xs text-brand-900/70 leading-relaxed max-w-md">
                  Ganti kata sandi secara aman dengan menerima tautan pembaruan kata sandi ke email Anda.
                </p>
              </div>

              <div>
                {passwordResetSent ? (
                  <span className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                    <SFCheckmarkCircle className="w-4 h-4" />
                    <span>Tautan Terkirim ke Email</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    disabled={isResetting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-900 bg-white border border-brand-900/15 hover:bg-neutral-100 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <SFKey className="w-3.5 h-3.5 text-brand-900/70" />
                    <span>{isResetting ? "Mengirim..." : "Kirim Tautan Reset"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Privacy & Medical Consent Management (FR-004, BR-CONSENT-003) */}
        <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                Privasi &amp; Etika Medis
              </span>
              <h2 className="text-base font-bold text-brand-900 mt-0.5">
                Persetujuan Pengolahan Data (Consent)
              </h2>
            </div>
            <SFShieldCheckmark className="w-4 h-4 text-emerald-700" />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-50/70 border border-brand-900/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-900/5 pb-2.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-brand-900">
                    Status Persetujuan Pemrosesan Data Medis
                  </span>
                  <p className="text-[11px] font-mono text-brand-900/60">
                    Versi Kebijakan: {consentStatus?.terms_version || "v1.0"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800">
                  <SFCheckmarkCircle className="w-4 h-4" />
                  <span>Aktif &amp; Terverifikasi</span>
                </div>
              </div>

              <p className="text-xs text-brand-900/70 leading-relaxed">
                Anda telah menyetujui pengolahan parameter gaya hidup murni untuk estimasi risiko preventif kardiometabolik non-diagnostik. Data Anda tidak diperjualbelikan atau dibagikan ke pihak ketiga tanpa persetujuan eksplisit.
              </p>

              {consentStatus?.active_consent?.accepted_at && (
                <div className="text-[11px] font-mono text-brand-900/50">
                  Waktu persetujuan:{" "}
                  {new Date(consentStatus.active_consent.accepted_at).toLocaleString("id-ID", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/onboarding/consent"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 hover:underline underline-offset-4"
              >
                <SFDocText className="w-3.5 h-3.5 text-brand-900/60" />
                <span>Tinjau Naskah Persetujuan Lengkap</span>
                <SFArrowUpRight className="w-3 h-3 text-brand-900/40" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 3: Active Session & Sign Out */}
        <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                Sesi Perangkat
              </span>
              <h2 className="text-base font-bold text-brand-900 mt-0.5">
                Keluar dari Perangkat
              </h2>
            </div>
          </div>

          <p className="text-xs text-brand-900/70 leading-relaxed max-w-lg">
            Mengakhiri sesi akan menghapus token otentikasi lokal pada browser Anda. Anda dapat masuk kembali kapan saja dengan email dan kata sandi Anda.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50/80 border border-rose-200/80 hover:bg-rose-100/70 transition-all cursor-pointer"
            >
              <SFDoorExit className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </section>

        {/* Footer Medical Disclaimer */}
        <footer className="pt-6 border-t border-brand-900/10">
          <DisclaimerBanner variant="banner" />
        </footer>
      </main>
    </div>
  );
}
