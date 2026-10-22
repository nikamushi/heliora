"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { ConsentStatusResponse } from "@/types/api";

function ConsentInner() {
  const searchParams = useSearchParams();
  const { isAuthorized } = useRequireAuth();
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const withdrawCancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadStatus() {
      try {
        const res = await apiClient.consent.getStatus();
        if (!isCancelled) {
          setConsentStatus(res);
        }
      } catch {
        // Fallback silently if status fails
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized]);

  useEffect(() => {
    if (showWithdrawDialog) {
      withdrawCancelButtonRef.current?.focus();
      const timer = setTimeout(() => {
        withdrawCancelButtonRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [showWithdrawDialog]);

  const handleWithdrawConsent = async () => {
    setIsWithdrawing(true);
    setWithdrawError(null);
    try {
      await apiClient.consent.revoke();
      const updatedStatus = await apiClient.consent.getStatus();
      setConsentStatus(updatedStatus);
      setShowWithdrawDialog(false);
    } catch {
      setWithdrawError("Gagal menarik persetujuan. Silakan coba lagi.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      setShowWithdrawDialog(false);
    }
  };

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 max-w-2xl space-y-6 animate-pulse">
        <div className="h-5 w-24 bg-neutral-200 rounded-md" />
        <div className="h-8 w-48 bg-neutral-200 rounded-md" />
        <div className="h-40 bg-neutral-100 rounded-2xl" />
      </div>
    );
  }

  const isDemoRevoked = searchParams.get("demo") === "revoked";
  const hasActiveConsent = isDemoRevoked ? false : consentStatus?.has_active_consent === true;
  const isRevoked = isDemoRevoked || (consentStatus !== null && !hasActiveConsent);

  // Format accepted_at date: e.g. "3 Okt 2026, 23.11"
  let formattedAcceptedAt: string | null = null;
  if (consentStatus?.active_consent?.accepted_at) {
    try {
      const date = new Date(consentStatus.active_consent.accepted_at);
      const day = date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
      const time = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(":", ".");
      formattedAcceptedAt = `${day}, ${time}`;
    } catch {
      formattedAcceptedAt = null;
    }
  }

  const version = consentStatus?.terms_version || "1.0";

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-12 py-6 sm:py-8 pb-16 w-full max-w-2xl space-y-6 select-text">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Akun</span>
          </Link>
        </nav>

        {/* Header (Title Case konsisten dengan label baris Akun) */}
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Persetujuan Data
          </h1>
        </header>

        {/* Content Body */}
        <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
          <p className="font-medium text-neutral-800">
            HELIORA menggunakan data kesehatan dan gaya hidup Anda untuk:
          </p>

          <ul className="list-disc list-inside space-y-1.5 text-neutral-600 pl-1">
            <li>Estimasi risiko kardiometabolik</li>
            <li>Health Score dan Lifestyle Score</li>
            <li>Simulasi perubahan gaya hidup</li>
            <li>Rekomendasi pencegahan</li>
          </ul>

          <p className="text-neutral-600">
            Data Anda tidak diperjualbelikan.
          </p>

          <div>
            <Link
              href="/onboarding/consent"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
            >
              <span>Baca kebijakan lengkap ↗</span>
            </Link>
          </div>

          {/* Caption info */}
          <p className="text-xs text-neutral-500 pt-2">
            {hasActiveConsent && formattedAcceptedAt ? (
              <>Diberikan {formattedAcceptedAt} · Kebijakan v{version}</>
            ) : hasActiveConsent ? (
              <>Diberikan · Kebijakan v{version}</>
            ) : isRevoked ? (
              <>Ditarik · Kebijakan v{version}</>
            ) : (
              <>Belum Diberikan · Kebijakan v{version}</>
            )}
          </p>
        </div>

        {/* Aksi Gaya Baris Kartu (Konsisten dengan "Keluar" di halaman Akun, tanpa tombol "Selesai") */}
        <div className="pt-2">
          {hasActiveConsent ? (
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowWithdrawDialog(true)}
                className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50/50 transition-colors cursor-pointer"
              >
                <span>Tarik Persetujuan</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <Link
                href="/onboarding/consent"
                className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50/50 transition-colors cursor-pointer"
              >
                <span>Berikan Persetujuan</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Alert Dialog Satu Lapis: Konfirmasi Tarik Persetujuan */}
      {showWithdrawDialog && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="withdraw-title"
          aria-describedby="withdraw-desc"
          onKeyDown={handleDialogKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h2 id="withdraw-title" className="text-base font-bold text-neutral-900">
              Tarik Persetujuan?
            </h2>

            <p id="withdraw-desc" className="text-xs text-neutral-600 leading-relaxed">
              Asesmen, simulasi, dan rekomendasi akan berhenti sampai Anda memberi persetujuan lagi. Data Anda tetap tersimpan.
            </p>

            {withdrawError && (
              <p className="text-xs text-rose-700 font-medium">{withdrawError}</p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                ref={withdrawCancelButtonRef}
                type="button"
                onClick={() => setShowWithdrawDialog(false)}
                disabled={isWithdrawing}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleWithdrawConsent}
                disabled={isWithdrawing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isWithdrawing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isWithdrawing ? "Menarik..." : "Tarik Persetujuan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConsentSettingsPage() {
  return (
    <Suspense fallback={<div className="flex-1 min-w-0 p-8 animate-pulse" />}>
      <ConsentInner />
    </Suspense>
  );
}
