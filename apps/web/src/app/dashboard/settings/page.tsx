"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { ConsentStatusResponse, UserResponse } from "@/types/api";
import { AUTH_PASSWORD_RESET_COOLDOWN_SECONDS } from "@/lib/auth-config";

function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthorized } = useRequireAuth();

  const [user, setUser] = useState<UserResponse | null>(() => apiClient.getStoredUser());
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consentError, setConsentError] = useState(false);

  // Trigger ref for focus restoration
  const passwordTriggerRef = useRef<HTMLButtonElement>(null);
  const passwordCancelRef = useRef<HTMLButtonElement>(null);

  // State Alert Ubah Kata Sandi
  const demoParam = searchParams.get("demo");
  const isDemoSent = demoParam === "reset-sent" || demoParam === "alert-sent";
  const isDemoLoading = demoParam === "alert-loading";
  const isDemoError = demoParam === "alert-error";
  const isDemoDefault = demoParam === "alert-default";

  const [showPasswordAlert, setShowPasswordAlert] = useState(
    isDemoSent || isDemoLoading || isDemoError || isDemoDefault
  );
  const [isResetting, setIsResetting] = useState(isDemoLoading);
  const [resetSent, setResetSent] = useState(isDemoSent);
  const [resetCountdown, setResetCountdown] = useState(isDemoSent ? 58 : 0);
  const [resetError, setResetError] = useState<string | null>(
    isDemoError ? "Tidak dapat mengirim tautan. Silakan coba beberapa saat lagi." : null
  );

  // State Logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadSettings() {
      try {
        const stored = apiClient.getStoredUser();
        if (stored && !isCancelled) setUser(stored);

        const [meRes, consentRes] = await Promise.allSettled([
          apiClient.auth.me(),
          apiClient.consent.getStatus(),
        ]);

        if (isCancelled) return;

        if (meRes.status === "fulfilled") {
          setUser(meRes.value);
        }
        if (consentRes.status === "fulfilled") {
          setConsentStatus(consentRes.value);
        } else {
          setConsentError(true);
        }
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

  useEffect(() => {
    if (resetCountdown <= 0) return;
    const timer = setInterval(() => {
      setResetCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCountdown]);

  useEffect(() => {
    if (showPasswordAlert && !resetSent) {
      passwordCancelRef.current?.focus();
    }
  }, [showPasswordAlert, resetSent]);

  const handlePasswordAlertKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      closePasswordAlert();
    }
  };

  const closePasswordAlert = () => {
    setShowPasswordAlert(false);
    setResetSent(false);
    setResetError(null);
    passwordTriggerRef.current?.focus();
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email || resetCountdown > 0) return;
    setIsResetting(true);
    setResetError(null);
    try {
      const { getSupabaseClient } = await import("@/lib/supabase-client");
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          if (
            error.message?.toLowerCase().includes("rate limit") ||
            error.status === 429
          ) {
            setResetError(
              "Terlalu banyak permintaan. Silakan tunggu beberapa saat sebelum mencoba lagi."
            );
            return;
          }
          throw error;
        }
      }
      setResetSent(true);
      setResetCountdown(AUTH_PASSWORD_RESET_COOLDOWN_SECONDS);
    } catch {
      setResetError("Tidak dapat mengirim tautan. Silakan coba beberapa saat lagi.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.auth.logout();
    } finally {
      router.push("/login");
    }
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 max-w-2xl space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-neutral-200 rounded-md" />
        <div className="space-y-4">
          <div className="h-32 bg-neutral-100 rounded-2xl" />
          <div className="h-24 bg-neutral-100 rounded-2xl" />
          <div className="h-12 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isDemoRevoked = demoParam === "consent-revoked";
  const hasActiveConsent = isDemoRevoked ? false : consentStatus?.has_active_consent === true;
  const isRevoked = isDemoRevoked || (consentStatus !== null && !hasActiveConsent);

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 pb-16 w-full max-w-2xl space-y-8 select-text">
        {/* Header */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Akun
          </h1>
        </header>

        {/* Grup 1: Informasi Akun */}
        <section aria-label="Informasi Akun">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            {/* Baris Nama: Label primer (neutral-900), Value sekunder (neutral-500) */}
            <div className="flex items-center justify-between px-4 py-3.5 text-sm">
              <span className="font-medium text-neutral-900">Nama</span>
              <span className="text-neutral-500 font-normal">{user?.full_name || "—"}</span>
            </div>

            {/* Baris Email: Label primer (neutral-900), Value sekunder (neutral-500) */}
            <div className="flex items-center justify-between px-4 py-3.5 text-sm">
              <span className="font-medium text-neutral-900">Email</span>
              <span className="text-neutral-500 font-normal">{user?.email || "—"}</span>
            </div>

            {/* Baris Ubah Kata Sandi: Tanpa chevron (karena membuka alert dialog, bukan navigasi halaman) */}
            <button
              ref={passwordTriggerRef}
              type="button"
              onClick={() => {
                setShowPasswordAlert(true);
                setResetSent(false);
                setResetError(null);
              }}
              className="w-full flex items-center px-4 py-3.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50/70 transition-colors text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <span>Ubah Kata Sandi</span>
            </button>
          </div>
        </section>

        {/* Grup 2: Privasi */}
        <section aria-labelledby="section-privacy" className="space-y-2">
          <h2 id="section-privacy" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 px-4">
            Privasi
          </h2>

          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            {/* Baris Persetujuan Data: Label primer, Value sekunder + chevron navigasi */}
            <Link
              href="/dashboard/settings/consent"
              className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-neutral-50/70 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <span className="font-medium text-neutral-900">Persetujuan Data</span>
              <div className="flex items-center gap-1.5">
                {consentError ? (
                  <span className="text-xs text-rose-700 font-medium">Gagal memuat status</span>
                ) : hasActiveConsent ? (
                  <span className="text-sm text-neutral-500 font-normal">Diberikan</span>
                ) : isRevoked ? (
                  <span className="text-sm text-amber-800 font-medium">Ditarik</span>
                ) : (
                  <span className="text-sm text-neutral-500 font-normal">Belum Diberikan</span>
                )}
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </Link>

            {/* Baris Hapus Akun: Label primer + chevron navigasi */}
            <Link
              href="/dashboard/settings/delete-account"
              className="flex items-center justify-between px-4 py-3.5 text-sm hover:bg-neutral-50/70 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <span className="font-medium text-neutral-900">Hapus Akun</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>
        </section>

        {/* Grup 3: Keluar (Grup Terakhir) */}
        <section aria-label="Keluar">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50/50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
            >
              <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Alert Ubah Kata Sandi */}
      {showPasswordAlert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-alert-title"
          onKeyDown={handlePasswordAlertKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 id="password-alert-title" className="text-base font-bold text-neutral-900">
              Ubah Kata Sandi
            </h2>

            {resetSent ? (
              <p className="text-sm text-neutral-700 leading-relaxed">
                Tautan terkirim ke <strong className="text-neutral-900 font-semibold">{user?.email || "email Anda"}</strong>.
              </p>
            ) : (
              <p className="text-sm text-neutral-600 leading-relaxed">
                Kami akan mengirim tautan ke{" "}
                <strong className="text-neutral-900 font-semibold">{user?.email || "email Anda"}</strong> untuk membuat kata sandi baru. Tautan berlaku 1{"\u00A0"}jam.
              </p>
            )}

            {resetError && (
              <p className="text-xs text-rose-700 font-medium">
                {resetError}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              {resetSent ? (
                <button
                  type="button"
                  onClick={closePasswordAlert}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              ) : (
                <>
                  <button
                    ref={passwordCancelRef}
                    type="button"
                    onClick={closePasswordAlert}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    disabled={isResetting || resetCountdown > 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {isResetting
                        ? "Mengirim..."
                        : resetCountdown > 0
                        ? `Kirim ulang (${resetCountdown}s)`
                        : resetError
                        ? "Coba Lagi"
                        : "Kirim Tautan"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex-1 min-w-0 p-8 animate-pulse" />}>
      <SettingsInner />
    </Suspense>
  );
}
