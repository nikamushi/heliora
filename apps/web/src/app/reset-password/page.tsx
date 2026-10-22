"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye as IconEye,
  EyeOff as IconEyeOff,
  Check,
} from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";
import {
  AUTH_PASSWORD_RESET_EXPIRY_LABEL,
  AUTH_MIN_PASSWORD_LENGTH,
} from "@/lib/auth-config";

type ResetFlowState =
  | "checking"
  | "ready"
  | "invalid_or_expired"
  | "submitting"
  | "success";

function ResetPasswordInner() {
  const searchParams = useSearchParams();

  const [flowState, setFlowState] = useState<ResetFlowState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verifikasi token recovery dari Supabase Auth
  useEffect(() => {
    let isCancelled = false;

    async function checkRecoverySession() {
      // 0. Mode demo / preview
      if (searchParams.get("demo") === "success") {
        if (!isCancelled) setFlowState("success");
        return;
      }
      if (searchParams.get("demo") === "1" || searchParams.get("mock") === "true") {
        if (!isCancelled) setFlowState("ready");
        return;
      }

      // 1. Cek parameter error dari URL provider
      const urlError = searchParams.get("error_description") || searchParams.get("error");
      if (urlError) {
        if (!isCancelled) {
          setFlowState("invalid_or_expired");
          setErrorMessage(
            "Tautan pembaruan kata sandi telah kedaluwarsa atau tidak valid."
          );
        }
        return;
      }

      // Periksa fragment hash (#error=... atau #access_token=...) jika diteruskan lewat hash
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        if (hashParams.get("error") || hashParams.get("error_code") === "otp_expired") {
          if (!isCancelled) {
            setFlowState("invalid_or_expired");
            setErrorMessage(
              "Tautan pembaruan kata sandi telah kedaluwarsa atau sudah pernah digunakan."
            );
          }
          return;
        }
      }

      if (!isSupabaseConfigured()) {
        // Fallback untuk dev lokal tanpa Supabase
        if (!isCancelled) setFlowState("ready");
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!isCancelled) setFlowState("invalid_or_expired");
        return;
      }

      // Cek session aktif atau dengarkan event PASSWORD_RECOVERY
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          if (!isCancelled) setFlowState("ready");
          return;
        }

        // Tunggu auth state change (untuk pertukaran kode PKCE atau hash token)
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (isCancelled) return;
            if (event === "PASSWORD_RECOVERY" || session) {
              setFlowState("ready");
            }
          }
        );

        // Jika dalam 5 detik tidak ada session valid, anggap tautan tidak valid
        const timeout = setTimeout(() => {
          if (!isCancelled && flowState === "checking") {
            setFlowState("invalid_or_expired");
          }
        }, 5000);

        return () => {
          clearTimeout(timeout);
          authListener.subscription.unsubscribe();
        };
      } catch {
        if (!isCancelled) setFlowState("invalid_or_expired");
      }
    }

    checkRecoverySession();

    return () => {
      isCancelled = true;
    };
  }, [searchParams, flowState]);

  // Evaluasi kekuatan kata sandi (AC-AUTH-01)
  const hasMinLength = password.length >= AUTH_MIN_PASSWORD_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const getStrengthScore = () => {
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    return score;
  };

  const strengthScore = getStrengthScore();
  const strengthLabels = ["Sangat Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const strengthColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-700",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!hasMinLength) {
      setErrorMessage(`Kata sandi minimal harus ${AUTH_MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setFlowState("submitting");

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          throw error;
        }
      }
      setFlowState("success");
    } catch (err: unknown) {
      setFlowState("ready");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui kata sandi. Silakan coba kembali."
      );
    }
  };

  // ── State 1: Verifikasi Tautan (Checking) ──
  if (flowState === "checking") {
    return (
      <AuthLayout
        title="Verifikasi Tautan"
        subtitle="Memeriksa keamanan dan validitas tautan Anda..."
        variant="centered"
      >
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="size-7 animate-spin rounded-full border-2 border-primary-700/30 border-t-primary-700"
          />
          <p className="text-xs font-medium text-neutral-500">
            Menghubungkan ke otentikasi HELIORA...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ── State 2: Tautan Kedaluwarsa atau Tidak Valid ──
  if (flowState === "invalid_or_expired") {
    return (
      <AuthLayout
        title="Tautan Tidak Berlaku"
        subtitle="Tautan pembaruan kata sandi sudah tidak dapat digunakan."
        variant="centered"
      >
        <div className="space-y-5 py-4">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Tautan Kedaluwarsa atau Tidak Valid</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Tautan pembaruan kata sandi hanya berlaku selama{" "}
              <strong>{AUTH_PASSWORD_RESET_EXPIRY_LABEL}</strong> dan bersifat sekali
              pakai demi keamanan akun Anda.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <span>Minta Tautan Pemulihan Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-10 w-full rounded-xl border border-neutral-200 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // ── State 3: Konfirmasi Berhasil ──
  if (flowState === "success") {
    return (
      <AuthLayout
        title="Kata Sandi Berhasil Diperbarui"
        subtitle="Akun Anda kini telah diamankan dengan kata sandi baru."
        variant="centered"
      >
        <div className="space-y-6 py-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs text-emerald-950">
                Pembaruan Selesai
              </p>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Kata sandi baru Anda telah aktif. Silakan masuk kembali menggunakan kredensial
                yang baru dibuat.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <span>Masuk ke HELIORA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── State 4: Form Masukkan Kata Sandi Baru ──
  return (
    <AuthLayout
      title="Atur Kata Sandi Baru"
      subtitle="Masukkan kata sandi baru yang kuat untuk melindungi akun dan privasi data kesehatan Anda."
      variant="centered"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Kata Sandi Baru */}
        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-xs font-medium text-neutral-700">
            Kata Sandi Baru
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={flowState === "submitting"}
              className="h-11 rounded-xl border-neutral-200 bg-white pr-11 text-sm focus:border-brand-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={flowState === "submitting"}
              className="absolute top-1/2 right-1 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>

        {/* Indikator Kekuatan Kata Sandi (AC-AUTH-01) */}
        {password.length > 0 && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-500">Kekuatan Sandi:</span>
              <span className="font-semibold text-neutral-700">
                {strengthLabels[Math.max(0, strengthScore - 1)]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-full rounded-full transition-all duration-200 ${
                    index < strengthScore
                      ? strengthColors[strengthScore - 1]
                      : "bg-neutral-100"
                  }`}
                />
              ))}
            </div>

            {/* Checklist Persyaratan */}
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[11px] text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Check
                  className={`w-3 h-3 ${
                    hasMinLength ? "text-emerald-700" : "text-neutral-300"
                  }`}
                />
                <span className={hasMinLength ? "text-neutral-900" : "text-neutral-400"}>
                  Min. 8 karakter
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check
                  className={`w-3 h-3 ${
                    hasUppercase ? "text-emerald-700" : "text-neutral-300"
                  }`}
                />
                <span className={hasUppercase ? "text-neutral-900" : "text-neutral-400"}>
                  Huruf besar (A-Z)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check
                  className={`w-3 h-3 ${
                    hasNumber ? "text-emerald-700" : "text-neutral-300"
                  }`}
                />
                <span className={hasNumber ? "text-neutral-900" : "text-neutral-400"}>
                  Angka (0-9)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check
                  className={`w-3 h-3 ${
                    hasSpecial ? "text-emerald-700" : "text-neutral-300"
                  }`}
                />
                <span className={hasSpecial ? "text-neutral-900" : "text-neutral-400"}>
                  Simbol / khusus
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Input Konfirmasi Kata Sandi */}
        <div className="space-y-1.5 pt-1">
          <Label htmlFor="confirm-password" className="text-xs font-medium text-neutral-700">
            Konfirmasi Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={flowState === "submitting"}
              className="h-11 rounded-xl border-neutral-200 bg-white pr-11 text-sm focus:border-brand-900"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={flowState === "submitting"}
              className="absolute top-1/2 right-1 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              aria-label={
                showConfirmPassword ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"
              }
            >
              {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            flowState === "submitting" ||
            !hasMinLength ||
            password !== confirmPassword
          }
          className="w-full h-11 rounded-xl bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
        >
          {flowState === "submitting" ? (
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              <span>Menyimpan Kata Sandi...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Simpan Kata Sandi Baru</span>
            </div>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-50/20" />
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
