"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { ConsentStatusResponse, UserResponse } from "@/types/api";

function DeleteAccountInner() {
  const searchParams = useSearchParams();
  const { isAuthorized } = useRequireAuth();
  const [user, setUser] = useState<UserResponse | null>(() => apiClient.getStoredUser());
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    apiClient.consent
      .getStatus()
      .then((status) => {
        if (!isCancelled) setConsentStatus(status);
      })
      .catch(() => {});

    if (!user) {
      apiClient.auth
        .me()
        .then((u) => {
          if (!isCancelled) setUser(u);
        })
        .catch(() => {});
    }

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, user]);

  const handleCopyEmail = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText("privacy@heliora.id");
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = "privacy@heliora.id";
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch {
        // Fallback catch
      }
      document.body.removeChild(textArea);
    }
    setCopiedEmail(true);
    setTimeout(() => {
      setCopiedEmail(false);
    }, 2000);
  };

  const isDemoRevoked = searchParams.get("demo") === "revoked";
  const hasActiveConsent = isDemoRevoked ? false : consentStatus?.has_active_consent !== false;

  const deleteMailtoUrl = `mailto:privacy@heliora.id?subject=${encodeURIComponent(
    `Permohonan Penghapusan Akun HELIORA - ${user?.email || ""}`
  )}&body=${encodeURIComponent(
    `Halo Tim Privasi HELIORA,\n\nSaya ingin mengajukan permohonan penghapusan akun HELIORA saya (${
      user?.email || ""
    }).\n\nTerima kasih.`
  )}`;

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
            Hapus Akun
          </h1>
        </header>

        {/* Content Blocks */}
        <div className="space-y-4 text-sm text-neutral-700 leading-relaxed">
          {/* Blok 1: Dampak langsung */}
          <p>
            Akun Anda beserta profil, data kesehatan, hasil asesmen, dan simulasi tersimpan akan dihapus permanen.{" "}
            <strong className="text-neutral-900 font-semibold">Tindakan ini tidak dapat dibatalkan.</strong>
          </p>

          {/* Blok 2: Waktu proses transparan */}
          <p className="text-neutral-600">
            Kami memverifikasi permintaan dalam 3 hari kerja, lalu menghapus data dalam 14 hari kerja. Salinan cadangan terhapus otomatis dalam 30 hari.
          </p>

          {/* Blok 3: Alternatif kontekstual (Hanya tampil bila persetujuan belum ditarik) */}
          {hasActiveConsent && (
            <p className="text-neutral-600">
              Hanya ingin menghentikan analisis?{" "}
              <Link
                href="/dashboard/settings/consent"
                className="font-medium text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
              >
                tarik persetujuan data
              </Link>
            </p>
          )}
        </div>

        {/* Aksi Gaya Baris Kartu (Konsisten dengan "Keluar" & "Tarik Persetujuan", tanpa tombol "Batal") */}
        <div className="pt-2">
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <a
              href={deleteMailtoUrl}
              className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50/50 transition-colors cursor-pointer"
            >
              <span>Kirim Permintaan</span>
            </a>
          </div>

          {/* Fine print rata kiri sejajar dengan teks dalam baris (px-4) */}
          <p className="text-xs text-neutral-500 text-left pt-2 px-4">
            Permintaan dikirim lewat email ke privacy@heliora.id ·{" "}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="text-emerald-800 hover:text-emerald-900 underline underline-offset-4 font-medium cursor-pointer"
            >
              <span aria-live="polite">{copiedEmail ? "Tersalin" : "Salin"}</span>
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function DeleteAccountPage() {
  return (
    <Suspense fallback={<div className="flex-1 min-w-0 p-8 animate-pulse" />}>
      <DeleteAccountInner />
    </Suspense>
  );
}
