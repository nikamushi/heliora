"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  SFArrowRight,
  SFShieldCheckmark,
  SFPencil,
  SFCalendar,
  SFScalemass,
  SFFlame,
  SFMoon,
  SFCigarette,
} from "@/components/icons/sf-icons";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/use-require-auth";
import { HealthProfileResponse, UserResponse } from "@/types/api";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export default function ProfilePage() {
  const { isAuthorized, redirectToLogin } = useRequireAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [profile, setProfile] = useState<HealthProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    if (!isAuthorized) return;
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const storedUser = apiClient.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        const healthProfile = await apiClient.healthProfile.get();
        if (!isCancelled) {
          setProfile(healthProfile);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          if (err instanceof ApiClientError) {
            if (err.kind === "unauthorized") {
              redirectToLogin();
              return;
            }
            if (err.kind !== "not_found") {
              setError(err);
            }
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [isAuthorized, redirectToLogin]);

  const userInitials = useMemo(() => {
    return (
      user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "HL"
    );
  }, [user]);

  const bmiCategory = useMemo(() => {
    if (!profile?.bmi) return null;
    const val = profile.bmi;
    if (val < 18.5) return { label: "Berat Badan Kurang", className: "text-amber-800" };
    if (val < 23.0) return { label: "Normal / Ideal (Asia)", className: "text-emerald-800" };
    if (val < 25.0) return { label: "Kelebihan Berat Badan", className: "text-amber-800" };
    return { label: "Risiko Obesitas", className: "text-rose-800" };
  }, [profile]);

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-center p-6 min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            HELIORA
          </p>
          <p className="text-sm font-medium text-brand-900/70">Memuat profil pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl w-full mx-auto">
        {/* Page Title Section */}
        <section className="space-y-2 border-b border-brand-900/10 pb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
            Informasi Pengguna
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
                Profil Akun &amp; Kesehatan
              </h1>
              <p className="text-sm text-brand-900/70 mt-1 max-w-2xl leading-relaxed">
                Tinjauan identitas akun dan parameter gaya hidup aktif Anda yang menjadi rujukan kalkulasi asesmen risiko klinis preventif.
              </p>
            </div>

            <Link
              href="/onboarding/health-profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <SFPencil className="w-3.5 h-3.5" />
              <span>Perbarui Profil Kesehatan</span>
            </Link>
          </div>
        </section>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error.message}
          </div>
        )}

        {/* Section 1: User Account Information Card */}
        <section className="bg-white border border-brand-900/10 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-brand-900/10">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
                Identitas Akun
              </span>
              <h2 className="text-base font-bold text-brand-900 mt-0.5">
                Data Diri Terdaftar
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-800 uppercase flex items-center gap-1">
              <SFShieldCheckmark className="w-3.5 h-3.5" />
              <span>Terverifikasi</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="size-16 rounded-2xl bg-brand-900 text-white font-mono font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
              {userInitials}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-lg font-bold text-brand-900 truncate">
                {user?.full_name || "Pengguna Heliora"}
              </h3>
              <p className="text-xs font-mono text-brand-900/60 truncate">
                {user?.email || "Email belum disetel"}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono text-brand-900/45">
                <span>ID: {user?.id?.slice(0, 13) || "USR-DEFAULT"}...</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <SFCalendar className="w-3 h-3" />
                  <span>
                    Bergabung{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("id-ID", {
                          month: "short",
                          year: "numeric",
                        })
                      : "2026"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Health Profile Metrics Bento Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase block">
                Parameter Gaya Hidup &amp; Biometrik
              </span>
              <h2 className="text-base font-bold text-brand-900 mt-0.5">
                Data Dasar Model AI
              </h2>
            </div>

            <span className="text-xs font-mono text-brand-900/50">
              {profile?.updated_at
                ? `Diperbarui ${new Date(profile.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}`
                : "Profil Aktif"}
            </span>
          </div>

          {profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Box 1: BMI & Weight */}
              <div className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-brand-900/60">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    Indeks Massa Tubuh
                  </span>
                  <SFScalemass className="w-4 h-4 text-brand-900/50" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-brand-900">
                      {profile.bmi?.toFixed(1) || "-"}
                    </span>
                    <span className="text-xs font-mono text-brand-900/50">kg/m²</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold block mt-1 ${bmiCategory?.className || "text-brand-900/70"}`}>
                    {bmiCategory?.label || "-"}
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-900/5 text-[11px] font-mono text-brand-900/50 flex justify-between">
                  <span>Berat: {profile.weight_kg} kg</span>
                  <span>Tinggi: {profile.height_cm} cm</span>
                </div>
              </div>

              {/* Box 2: Physical Activity */}
              <div className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-brand-900/60">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    Aktivitas Fisik
                  </span>
                  <SFFlame className="w-4 h-4 text-brand-900/50" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-brand-900">
                      {profile.physical_activity_min_per_week}
                    </span>
                    <span className="text-xs font-mono text-brand-900/50">mnt/mgg</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-brand-900/70 block mt-1">
                    {profile.physical_activity_min_per_week >= 150
                      ? "Mencukupi Panduan WHO"
                      : "Perlu Peningkatan"}
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-900/5 text-[11px] font-mono text-brand-900/50">
                  Target kardioprotektif: ≥ 150 mnt/mgg
                </div>
              </div>

              {/* Box 3: Sleep Duration */}
              <div className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-brand-900/60">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    Durasi Istirahat
                  </span>
                  <SFMoon className="w-4 h-4 text-brand-900/50" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold font-mono text-brand-900">
                      {profile.sleep_duration_hours?.toFixed(1) || "-"}
                    </span>
                    <span className="text-xs font-mono text-brand-900/50">jam/hari</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-brand-900/70 block mt-1">
                    {profile.sleep_duration_hours >= 7 && profile.sleep_duration_hours <= 8.5
                      ? "Rentang Fisiologis Ideal"
                      : "Perlu Stabilisasi"}
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-900/5 text-[11px] font-mono text-brand-900/50">
                  Regulasi ritme sirkadian: 7–8 jam
                </div>
              </div>

              {/* Box 4: Smoking & Stress */}
              <div className="bg-white border border-brand-900/10 rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between text-brand-900/60">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    Status Kebiasaan
                  </span>
                  <SFCigarette className="w-4 h-4 text-brand-900/50" />
                </div>
                <div>
                  <span className="text-xl font-bold text-brand-900 block leading-tight">
                    {profile.smoking_status === "never"
                      ? "Tidak Merokok"
                      : profile.smoking_status === "former"
                      ? "Mantan Perokok"
                      : "Perokok Aktif"}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-brand-900/70 block mt-1">
                    Beban Stres: Skala {profile.stress_level ?? 5}/10
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-900/5 text-[11px] font-mono text-brand-900/50">
                  Riwayat Keluarga: {profile.family_history ? "Ada Riwayat" : "Tidak Ada"}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-brand-900/10 text-center space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-brand-900">
                  Profil Kesehatan Belum Lengkap
                </h3>
                <p className="text-xs text-brand-900/60 max-w-md mx-auto">
                  Isi data biometrik dan kebiasaan gaya hidup Anda untuk mengaktifkan estimasi risiko dan personalisasi rekomendasi.
                </p>
              </div>
              <Link
                href="/onboarding/health-profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-900 text-white text-xs font-semibold shadow-xs"
              >
                <span>Mulai Isi Profil</span>
                <SFArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* Section 3: Next Actions Bridge */}
        <section className="bg-brand-50/50 border border-brand-900/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-brand-900/40 uppercase block">
              Kelola Pengaturan
            </span>
            <p className="text-xs text-brand-900/70 max-w-md">
              Ingin mengubah preferensi privasi, meninjau status persetujuan data medis, atau memperbarui kata sandi?
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-900/15 text-brand-900 bg-white hover:bg-neutral-50 text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            <span>Buka Pengaturan Akun</span>
            <SFArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* Footer Medical Disclaimer */}
        <footer className="pt-6 border-t border-brand-900/10">
          <DisclaimerBanner variant="banner" />
        </footer>
      </main>
    </div>
  );
}
