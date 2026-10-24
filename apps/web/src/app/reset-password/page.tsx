"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye as IconEye, EyeOff as IconEyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlertTooltip } from "@/components/ui/alert-tooltip";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";
import { apiClient } from "@/lib/api-client";
import {
  AUTH_PASSWORD_RESET_EXPIRY_LABEL,
  AUTH_MIN_PASSWORD_LENGTH,
  clearPasswordRecoveryFlow,
  hasPasswordRecoveryFlow,
  mapPasswordUpdateError,
  markPasswordRecoveryFlow,
} from "@/lib/auth-config";

type ResetFlowState =
  | "checking"
  | "ready"
  | "invalid_or_expired"
  | "submitting"
  | "success";

const TEXT_LINK =
  "font-semibold text-primary transition-colors hover:text-primary-800 hover:underline underline-offset-4";

const SESSION_WAIT_MS = 8_000;

function getPasswordStrength(pass: string) {
  let score = 0;
  if (pass.length >= AUTH_MIN_PASSWORD_LENGTH) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return score;
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const started = useRef(false);

  const [flowState, setFlowState] = useState<ResetFlowState>("checking");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submittingLock = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const enterReady = () => {
      if (cancelled) return;
      markPasswordRecoveryFlow();
      setFlowState("ready");
    };

    async function establishRecoverySession() {
      if (searchParams.get("demo") === "success") {
        if (!cancelled) setFlowState("success");
        return;
      }
      if (searchParams.get("demo") === "1" || searchParams.get("mock") === "true") {
        if (!cancelled) setFlowState("ready");
        return;
      }

      const urlError =
        searchParams.get("error_description") || searchParams.get("error");
      if (urlError) {
        clearPasswordRecoveryFlow();
        if (!cancelled) setFlowState("invalid_or_expired");
        return;
      }

      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, "")
        );
        if (
          hashParams.get("error") ||
          hashParams.get("error_code") === "otp_expired"
        ) {
          clearPasswordRecoveryFlow();
          if (!cancelled) setFlowState("invalid_or_expired");
          return;
        }
      }

      if (!isSupabaseConfigured()) {
        // Dev lokal tanpa Supabase: izinkan preview form
        if (!cancelled) setFlowState("ready");
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) setFlowState("invalid_or_expired");
        return;
      }

      try {
        // Hanya terima session jika marker recovery aktif (dari /auth/callback)
        // atau code recovery baru saja ditukar di halaman ini.
        // Session login biasa TIDAK boleh membuka form — itu memicu error
        // "New password should be different from the old password" saat user
        // tanpa sadar mengisi sandi yang sama dengan sandi aktif.
        const { data: existing } = await supabase.auth.getSession();
        if (existing.session && hasPasswordRecoveryFlow()) {
          enterReady();
          return;
        }

        const code = searchParams.get("code");
        if (code) {
          const { data: exchanged, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn("[Reset Password] Exchange code error:", exchangeError);
          } else if (exchanged.session) {
            enterReady();
            return;
          }
        }

        const { data: listener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (cancelled || !session) return;
            // Hanya event recovery yang sah; jangan terima SIGNED_IN generik
            // dari sesi login biasa.
            if (event === "PASSWORD_RECOVERY") {
              enterReady();
            }
          }
        );
        unsubscribe = () => listener.subscription.unsubscribe();

        timeoutId = setTimeout(() => {
          if (cancelled) return;
          void supabase.auth.getSession().then(({ data }) => {
            if (cancelled) return;
            if (data.session && hasPasswordRecoveryFlow()) {
              enterReady();
            } else {
              clearPasswordRecoveryFlow();
              setFlowState("invalid_or_expired");
            }
          });
        }, SESSION_WAIT_MS);
      } catch {
        clearPasswordRecoveryFlow();
        if (!cancelled) setFlowState("invalid_or_expired");
      }
    }

    void establishRecoverySession();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe?.();
    };
  }, [searchParams]);

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ["Sangat Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const strengthColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ];
  const hasMinLength = password.length >= AUTH_MIN_PASSWORD_LENGTH;
  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (submittingLock.current || flowState === "submitting") return;

    if (!hasMinLength) {
      setErrorMessage(
        `Kata sandi minimal harus ${AUTH_MIN_PASSWORD_LENGTH} karakter.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Kunci sync mencegah double-submit: request kedua setelah sandi sudah
    // berubah akan gagal dengan "different from the old password".
    submittingLock.current = true;
    setFlowState("submitting");

    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        // Akhiri sesi recovery agar user masuk ulang dengan sandi baru
        await supabase.auth.signOut();
        apiClient.clearToken();
      }
      clearPasswordRecoveryFlow();
      setFlowState("success");
    } catch (err: unknown) {
      submittingLock.current = false;
      setFlowState("ready");
      const raw =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui kata sandi. Silakan coba kembali.";
      setErrorMessage(mapPasswordUpdateError(raw));
    }
  };

  if (flowState === "checking") {
    return (
      <AuthLayout
        title="Verifikasi tautan"
        subtitle="Memeriksa keamanan dan validitas tautan pemulihan Anda…"
      >
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <span
            aria-hidden="true"
            className="size-6 animate-spin rounded-full border-2 border-primary-700/30 border-t-primary-700"
          />
          <p className="text-sm font-medium text-muted-foreground">
            Menghubungkan ke otentikasi HELIORA…
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (flowState === "invalid_or_expired") {
    return (
      <AuthLayout
        title="Tautan tidak berlaku"
        subtitle={`Tautan pembaruan kata sandi hanya berlaku ${AUTH_PASSWORD_RESET_EXPIRY_LABEL} dan bersifat sekali pakai.`}
      >
        <div className="w-full space-y-6 pt-2">
          <p className="text-center text-sm text-muted-foreground">
            Minta tautan baru, lalu buka email terbaru dari HELIORA.
          </p>
          <div className="space-y-4">
            <Link
              href="/forgot-password"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99]"
            >
              Minta tautan baru
            </Link>
            <div className="text-center">
              <Link href="/login" className={TEXT_LINK}>
                Kembali ke Masuk
              </Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (flowState === "success") {
    return (
      <AuthLayout
        title="Kata sandi diperbarui"
        subtitle="Akun Anda sudah diamankan dengan kata sandi baru. Silakan masuk kembali."
      >
        <div className="w-full space-y-6 pt-2">
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99]"
          >
            Masuk ke HELIORA
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Atur kata sandi baru"
      subtitle="Masukkan kata sandi baru yang kuat untuk melindungi akun Anda."
    >
      <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
        <FormAlertTooltip
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />

        <div>
          <Label htmlFor="new-password" className="sr-only">
            Kata sandi baru
          </Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Kata sandi baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={flowState === "submitting"}
              className="h-12 rounded-xl border-input bg-white pr-12 pl-4 text-base shadow-sm placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={flowState === "submitting"}
              className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      strengthScore > step
                        ? strengthColors[strengthScore - 1]
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Kekuatan sandi</span>
                <span className="font-semibold text-foreground">
                  {strengthScore > 0
                    ? strengthLabels[strengthScore - 1]
                    : "Terlalu pendek"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="confirm-password" className="sr-only">
            Konfirmasi kata sandi
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Konfirmasi kata sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={flowState === "submitting"}
              className="h-12 rounded-xl border-input bg-white pr-12 pl-4 text-base shadow-sm placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={flowState === "submitting"}
              className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan konfirmasi"
                  : "Tampilkan konfirmasi"
              }
            >
              {showConfirmPassword ? (
                <IconEyeOff size={18} />
              ) : (
                <IconEye size={18} />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1.5 text-xs font-medium text-destructive">
              Konfirmasi kata sandi tidak cocok.
            </p>
          )}
        </div>

        <div className="pt-2 space-y-4">
          <Button
            type="submit"
            disabled={
              flowState === "submitting" || !hasMinLength || !passwordsMatch
            }
            className="h-12 w-full rounded-xl bg-primary-700 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            {flowState === "submitting" ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Menyimpan…
              </span>
            ) : (
              "Simpan kata sandi baru"
            )}
          </Button>

          <div className="text-center">
            <Link href="/login" className={TEXT_LINK}>
              Kembali ke Masuk
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted p-6">
          <div className="h-48 w-full max-w-[440px] animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
