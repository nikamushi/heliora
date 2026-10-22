"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RefreshCw as SFArrowClockwise } from "lucide-react";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { HealthProfileResponse, ConsentStatusResponse } from "@/types/api";

export default function ProfilePage() {
  const { isAuthorized, redirectToLogin } = useRequireAuth();
  const searchParams = useSearchParams();
  const updatedParam = searchParams.get("updated");
  const partialParam = searchParams.get("partial");

  const [profile, setProfile] = useState<HealthProfileResponse | null>(null);
  const [consentStatus, setConsentStatus] = useState<ConsentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading((prev) => (prev ? prev : true));
    }
    setError(null);

    try {
      // Check consent status (BR-CONSENT-003)
      try {
        const consent = await apiClient.consent.getStatus();
        setConsentStatus(consent);
      } catch {
        // Fallback silently if consent route fails
      }

      const healthProfile = await apiClient.healthProfile.get();
      setProfile(healthProfile);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.kind === "unauthorized") {
          redirectToLogin();
          return;
        }
        if (err.kind !== "not_found") {
          setError(err);
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;
    (async () => {
      if (!isCancelled) {
        await loadData();
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, loadData]);

  const handleRetry = () => {
    setIsRefreshing(true);
    loadData(false);
  };

  const formattedDate = useMemo(() => {
    if (!profile?.updated_at) return null;
    try {
      return new Date(profile.updated_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [profile]);

  const genderLabel = useMemo(() => {
    if (!profile?.gender) return "—";
    const g = profile.gender.toLowerCase();
    if (g === "male") return "Laki-laki";
    if (g === "female") return "Perempuan";
    return "Lainnya";
  }, [profile]);

  const smokingLabel = useMemo(() => {
    if (!profile?.smoking_status) return "—";
    const s = profile.smoking_status.toLowerCase();
    if (s === "never") return "Tidak pernah merokok";
    if (s === "former") return "Mantan perokok";
    if (s === "current") return "Perokok aktif";
    return profile.smoking_status;
  }, [profile]);

  // Standardize stress scale 1-5 (PRD 11.4.3 Data Dictionary)
  const normalizedStress = useMemo(() => {
    if (profile?.stress_level == null) return null;
    const raw = Number(profile.stress_level);
    if (raw > 5) {
      return Math.min(5, Math.max(1, Math.round(raw / 2)));
    }
    return Math.min(5, Math.max(1, Math.round(raw)));
  }, [profile]);

  const isConsentRevoked = consentStatus && !consentStatus.has_active_consent;

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full select-text animate-pulse">
          <div className="w-full max-w-[680px] mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="h-7 w-48 bg-neutral-200 rounded-lg" />
                <div className="h-4 w-72 bg-neutral-100 rounded-md" />
              </div>
              <div className="h-8 w-16 bg-neutral-200 rounded-xl" />
            </div>

            {/* Skeleton Groups */}
            <div className="space-y-6 pt-2">
              {[1, 2, 3, 4].map((g) => (
                <div key={g} className="space-y-2">
                  <div className="h-3.5 w-24 bg-neutral-200 rounded ml-4 sm:ml-5" />
                  <div className="bg-white rounded-2xl border border-neutral-200/70 p-4 space-y-3">
                    <div className="h-4 w-full bg-neutral-100 rounded" />
                    <div className="h-4 w-3/4 bg-neutral-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16 w-full select-text">
        {/* Centered on the same axis as the topbar search (680px max-width) */}
        <div className="w-full max-w-[680px] mx-auto space-y-6">
          {/* ── Header: Two Lines ── */}
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                Profil Kesehatan
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600">
                Dipakai untuk estimasi risiko
                {formattedDate ? ` · Diperbarui ${formattedDate}` : ""}
              </p>
            </div>

            {/* Single Accent Action on Page */}
            <Link
              href="/onboarding/health-profile"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors shrink-0"
            >
              Edit
            </Link>
          </header>

          {/* ── Feedback after save ── */}
          {updatedParam === "true" && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 font-medium">
              Profil disimpan. Estimasi di Dashboard sudah diperbarui.
            </div>
          )}

          {partialParam === "true" && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 font-medium">
              Profil disimpan, tapi estimasi belum bisa diperbarui. Coba lagi.
            </div>
          )}

          {/* ── Consent Revoked State (BR-CONSENT-003) ── */}
          {isConsentRevoked && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-950">Analisis personal nonaktif</p>
                <p className="text-amber-800 leading-relaxed">
                  Persetujuan pemrosesan data ditarik. Data Anda tidak digunakan untuk estimasi risiko.
                </p>
              </div>
              <Link
                href="/dashboard/settings"
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 font-medium text-amber-950 hover:bg-amber-100/50 self-start sm:self-auto shrink-0 transition-colors"
              >
                Buka Akun
              </Link>
            </div>
          )}

          {/* ── Error State Banner ── */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-900">
              <p>Gagal memuat profil terbaru. Menampilkan data lokal jika tersedia.</p>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 font-medium cursor-pointer text-rose-950 shrink-0 transition-colors"
              >
                <SFArrowClockwise className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          {/* ── Empty State: Profile Not Yet Filled ── */}
          {!profile ? (
            <section className="bg-white border border-neutral-200/70 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-neutral-900">
                  Profil Belum Lengkap
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  Lengkapi 8 data biometrik dan gaya hidup Anda untuk mengaktifkan estimasi risiko.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/onboarding/health-profile"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-medium shadow-xs transition-colors"
                >
                  Lengkapi Profil
                </Link>
              </div>
            </section>
          ) : (
            <div className="space-y-6">
              {/* ── Group 1: Tentang Anda ── */}
              <section>
                {/* Section header inset aligns with row label (px-4 sm:px-5) */}
                <h2 className="text-[13px] font-medium text-neutral-600 mb-2 px-4 sm:px-5">
                  Tentang Anda
                </h2>

                <div className="bg-white rounded-2xl border border-neutral-200/70 divide-y divide-neutral-100 overflow-hidden shadow-xs text-sm">
                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Usia</span>
                    <span className="text-neutral-900 tabular-nums font-normal">
                      {profile.age}{" "}
                      <span className="text-xs text-neutral-600 font-normal">tahun</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Jenis kelamin</span>
                    <span className="text-neutral-900 font-normal">{genderLabel}</span>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Tinggi badan</span>
                    <span className="text-neutral-900 tabular-nums font-normal">
                      {profile.height_cm.toLocaleString("id-ID")}{" "}
                      <span className="text-xs text-neutral-600 font-normal">cm</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Berat badan</span>
                    <span className="text-neutral-900 tabular-nums font-normal">
                      {profile.weight_kg.toLocaleString("id-ID")}{" "}
                      <span className="text-xs text-neutral-600 font-normal">kg</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-neutral-700 block">Indeks Massa Tubuh</span>
                      <span className="text-xs text-neutral-600 block mt-0.5">
                        Dari tinggi dan berat badan
                      </span>
                    </div>
                    <div className="text-neutral-900 tabular-nums font-normal">
                      {profile.bmi
                        ? profile.bmi.toLocaleString("id-ID", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })
                        : "—"}{" "}
                      <span className="text-xs text-neutral-600 font-normal">kg/m²</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Group 2: Gaya Hidup ── */}
              <section>
                {/* Section header inset aligns with row label (px-4 sm:px-5) */}
                <h2 className="text-[13px] font-medium text-neutral-600 mb-2 px-4 sm:px-5">
                  Gaya Hidup
                </h2>

                <div className="bg-white rounded-2xl border border-neutral-200/70 divide-y divide-neutral-100 overflow-hidden shadow-xs text-sm">
                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Aktivitas fisik</span>
                    <span className="text-neutral-900 tabular-nums font-normal">
                      {profile.physical_activity_min_per_week.toLocaleString("id-ID")}{" "}
                      <span className="text-xs text-neutral-600 font-normal">menit/minggu</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Durasi tidur</span>
                    <span className="text-neutral-900 tabular-nums font-normal">
                      {profile.sleep_duration_hours.toLocaleString("id-ID", {
                        maximumFractionDigits: 1,
                      })}{" "}
                      <span className="text-xs text-neutral-600 font-normal">jam/hari</span>
                    </span>
                  </div>

                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Status merokok</span>
                    <span className="text-neutral-900 font-normal">{smokingLabel}</span>
                  </div>
                </div>
              </section>

              {/* ── Group 3: Riwayat Keluarga ── */}
              <section>
                {/* Section header inset aligns with row label (px-4 sm:px-5) */}
                <h2 className="text-[13px] font-medium text-neutral-600 mb-2 px-4 sm:px-5">
                  Riwayat Keluarga
                </h2>

                <div className="bg-white rounded-2xl border border-neutral-200/70 overflow-hidden shadow-xs text-sm">
                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <span className="text-neutral-700">
                      Diabetes, kardiovaskular, atau hipertensi
                    </span>
                    <span className="text-neutral-900 font-normal text-left sm:text-right">
                      {profile.family_history
                        ? profile.family_history_details || "Ada riwayat"
                        : "Tidak ada"}
                    </span>
                  </div>
                </div>
              </section>

              {/* ── Group 4: Opsional ── */}
              <section>
                {/* Section header inset aligns with row label (px-4 sm:px-5) */}
                <h2 className="text-[13px] font-medium text-neutral-600 mb-2 px-4 sm:px-5">
                  Opsional
                </h2>

                <div className="bg-white rounded-2xl border border-neutral-200/70 divide-y divide-neutral-100 overflow-hidden shadow-xs text-sm">
                  <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                    <span className="text-neutral-700">Tingkat stres</span>
                    <span className="text-neutral-900 tabular-nums font-normal">
                      {normalizedStress != null ? (
                        `${normalizedStress} dari 5`
                      ) : (
                        <span className="text-neutral-600 font-normal">Belum diisi</span>
                      )}
                    </span>
                  </div>

                  {/* Progressive disclosure: only display if filled */}
                  {profile.waist_circumference_cm != null && (
                    <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4">
                      <span className="text-neutral-700">Lingkar pinggang</span>
                      <span className="text-neutral-900 tabular-nums font-normal">
                        {profile.waist_circumference_cm.toLocaleString("id-ID")}{" "}
                        <span className="text-xs text-neutral-600 font-normal">cm</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Section footer inset aligns with row label (px-4 sm:px-5) */}
                <p className="text-xs text-neutral-600 mt-2 px-4 sm:px-5">
                  Hanya untuk menyesuaikan rekomendasi. Tidak memengaruhi estimasi risiko.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
