"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  isValidEmail,
  AUTH_PASSWORD_RESET_COOLDOWN_SECONDS,
} from "@/lib/auth-config";

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(
    () => searchParams.get("demo") === "success"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown for resending reset email
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      setErrorMessage("Masukkan alamat email yang valid.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleBlur = () => {
    // Validate on blur only if user has entered something
    if (email.trim().length > 0) {
      validateEmail(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmed = email.trim();

    if (!validateEmail(trimmed)) {
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await apiClient.auth.resetPasswordForEmail(trimmed);
      setSubmittedEmail(trimmed);
      setIsSubmitted(true);
      setCooldown(AUTH_PASSWORD_RESET_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.status === 429) {
        setErrorMessage("Terlalu banyak permintaan. Coba lagi dalam 1 menit.");
        inputRef.current?.focus();
      } else {
        // Anti-enumeration: proceed to success state on non-rate-limit errors
        // to prevent bad actors from guessing account existence.
        setSubmittedEmail(trimmed);
        setIsSubmitted(true);
        setCooldown(AUTH_PASSWORD_RESET_COOLDOWN_SECONDS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !submittedEmail || isLoading) return;
    setIsLoading(true);

    try {
      await apiClient.auth.resetPasswordForEmail(submittedEmail);
      setCooldown(AUTH_PASSWORD_RESET_COOLDOWN_SECONDS);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.status === 429) {
        setErrorMessage("Terlalu banyak permintaan. Coba lagi dalam 1 menit.");
      } else {
        setCooldown(AUTH_PASSWORD_RESET_COOLDOWN_SECONDS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDifferentEmail = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // State 2: Success State (replacing form in place, anti-enumeration)
  if (isSubmitted) {
    return (
      <AuthLayout
        title="Periksa email Anda"
        subtitle={`Jika ${submittedEmail || email || "email Anda"} terdaftar, tautan akan dikirim dalam beberapa menit.`}
      >
        <div
          aria-live="polite"
          className="w-full space-y-6 pt-2 transition-opacity duration-200 ease-out motion-reduce:transition-none"
        >
          {errorMessage && (
            <p
              role="alert"
              className="text-center text-xs font-medium text-rose-600 animate-in fade-in"
            >
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col items-center gap-3 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isLoading}
              className="font-semibold text-primary transition-colors hover:text-primary-800 hover:underline underline-offset-4 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 rounded-xs"
            >
              {cooldown > 0
                ? `Kirim ulang dalam ${cooldown} detik`
                : isLoading
                ? "Mengirim…"
                : "Kirim ulang"}
            </button>
            <button
              type="button"
              onClick={handleUseDifferentEmail}
              className="text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 rounded-xs"
            >
              Gunakan email lain
            </button>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-800 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 rounded-xs"
            >
              Kembali ke Masuk
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // State 1: Form State (9 essential elements total)
  return (
    <AuthLayout
      title="Lupa kata sandi"
      subtitle="Kami akan mengirim tautan untuk membuat kata sandi baru."
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full space-y-5 transition-opacity duration-200 ease-out motion-reduce:transition-none"
      >
        <div className="text-left">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            ref={inputRef}
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onBlur={handleBlur}
            aria-describedby={errorMessage ? "email-error" : undefined}
            aria-invalid={Boolean(errorMessage)}
            className={`h-12 w-full rounded-xl bg-white px-4 text-base shadow-sm placeholder:text-muted-foreground/60 transition-colors ${
              errorMessage
                ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                : "border-input"
            }`}
          />
          {errorMessage && (
            <p
              id="email-error"
              role="alert"
              className="text-xs font-medium text-destructive mt-1.5 animate-in fade-in"
            >
              {errorMessage}
            </p>
          )}
        </div>

        <div className="pt-2 space-y-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-primary-700 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Mengirim…
              </span>
            ) : (
              "Kirim tautan"
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-primary transition-colors hover:text-primary-800 hover:underline underline-offset-4"
            >
              Kembali ke Masuk
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted flex items-center justify-center p-6">
          <div className="h-48 w-full max-w-[440px] animate-pulse rounded-2xl bg-neutral-100" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
