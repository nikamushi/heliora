"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";

type CallbackState = "working" | "error";

/** Berapa lama menunggu Supabase menyelesaikan tukar kode OAuth di URL. */
const SESSION_TIMEOUT_MS = 10_000;

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<CallbackState>("working");
  const [message, setMessage] = useState<string | null>(null);
  // Dev StrictMode meng-run effect dua kali; jaga agar resolution hanya sekali.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    const fail = (text: string) => {
      if (cancelled) return;
      setMessage(text);
      setState("error");
    };

    const route = async () => {
      // ── 1. Tunggu session Supabase selesai dibangun dari callback Google ──
      if (!isSupabaseConfigured()) {
        fail(
          "Login Google belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        fail("Login Google belum dikonfigurasi pada sisi browser.");
        return;
      }

      const providerError = searchParams.get("error_description");
      if (providerError) {
        fail(`Autentikasi Google dibatalkan: ${providerError}`);
        return;
      }

      const session = await new Promise<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null>(
        (resolve) => {
          const timer = setTimeout(() => resolve(null), SESSION_TIMEOUT_MS);
          const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (nextSession) {
              clearTimeout(timer);
              sub.subscription.unsubscribe();
              resolve(nextSession);
            }
          });
          void supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
              clearTimeout(timer);
              sub.subscription.unsubscribe();
              resolve(data.session);
            }
          });
        }
      );

      if (cancelled) return;
      if (!session) {
        fail(
          "Sesi Google tidak diterima dalam waktu tunggu. Periksa konfigurasi redirect URL di Supabase, lalu coba lagi."
        );
        return;
      }

      // ── 2. Sinkronkan user ke storage ──
      // `auth.me()` memanggil /auth/me dengan Bearer Supabase, yang me-resolve
      // `sub` ke baris public.users. 401 di sini hampir selalu berarti trigger
      // handle_new_user() belum terpasang di Postgres Supabase.
      try {
        await apiClient.auth.me();
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) {
          fail(
            "Akun Google berhasil masuk, tetapi profilnya belum ditemukan di database. Trigger handle_new_user() di Postgres Supabase perlu dipastikan terpasang."
          );
          return;
        }
        fail(
          err instanceof Error
            ? err.message
            : "Gagal memuat profil dari server backend."
        );
        return;
      }

      // ── 3. Routing sesuai status consent, sama seperti login email/password ──
      try {
        const consentStatus = await apiClient.consent.getStatus();
        if (cancelled) return;
        router.replace(
          consentStatus.has_active_consent ? "/dashboard" : "/onboarding/consent"
        );
      } catch {
        if (cancelled) return;
        router.replace("/onboarding/consent");
      }
    };

    void route();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (state === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted px-6 py-12 text-center text-foreground">
        <h1 className="text-2xl font-semibold tracking-tight">Gagal masuk dengan Google</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-800 hover:underline underline-offset-4"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted px-6 text-foreground">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-primary-700/30 border-t-primary-700"
      />
      <p className="text-sm font-medium text-muted-foreground">
        Menyelesaikan login dengan Google...
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted" />
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
