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

    const fail = (text: string) => {
      setMessage(text);
      setState("error");
    };

    const route = async () => {
      // ── 0. Alihkan aliran pemulihan kata sandi (Password Recovery) ke /reset-password ──
      const type = searchParams.get("type");
      const nextParam = searchParams.get("next");
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (
        type === "recovery" ||
        nextParam === "/reset-password" ||
        nextParam === "/dashboard/settings" ||
        hash.includes("type=recovery")
      ) {
        router.replace(`/reset-password${window.location.search}${hash}`);
        return;
      }

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

      let session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] = null;

      // Cek langsung apakah session sudah ada di memory/localStorage
      const { data: directData } = await supabase.auth.getSession();
      if (directData?.session) {
        session = directData.session;
      } else {
        // Cek apakah ada code di URL untuk exchangeCodeForSession
        const code = searchParams.get("code");
        if (code) {
          try {
            const { data: codeData } = await supabase.auth.exchangeCodeForSession(code);
            if (codeData?.session) {
              session = codeData.session;
            }
          } catch (codeErr) {
            console.warn("[Auth Callback] Exchange code error:", codeErr);
          }
        }

        // Jika belum ada, tunggu event onAuthStateChange atau polling getSession
        if (!session) {
          session = await new Promise((resolve) => {
            let done = false;
            const timer = setTimeout(() => {
              if (!done) {
                done = true;
                resolve(null);
              }
            }, SESSION_TIMEOUT_MS);

            const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
              if (nextSession && !done) {
                done = true;
                clearTimeout(timer);
                sub.subscription.unsubscribe();
                resolve(nextSession);
              }
            });

            const pollInterval = setInterval(async () => {
              if (done) {
                clearInterval(pollInterval);
                return;
              }
              const { data: pollData } = await supabase.auth.getSession();
              if (pollData?.session && !done) {
                done = true;
                clearInterval(pollInterval);
                clearTimeout(timer);
                sub.subscription.unsubscribe();
                resolve(pollData.session);
              }
            }, 300);
          });
        }
      }

      if (!session) {
        fail(
          "Sesi Google tidak diterima dalam waktu tunggu. Periksa konfigurasi redirect URL di Supabase, lalu coba lagi."
        );
        return;
      }

      if (session.access_token) {
        apiClient.setToken(session.access_token);
      }

      // ── 2. Sinkronkan user ke storage & database HELIORA ──
      try {
        await apiClient.auth.me();
      } catch (err) {
        console.warn("[Auth Callback] auth.me warning:", err);
      }

      // ── 3. Routing sesuai status consent & health profile ──
      try {
        const consentStatus = await apiClient.consent.getStatus();
        if (!consentStatus?.has_active_consent) {
          router.replace("/onboarding/consent");
          return;
        }

        try {
          const profile = await apiClient.healthProfile.get();
          if (
            profile &&
            profile.age &&
            profile.gender &&
            profile.height_cm &&
            profile.weight_kg
          ) {
            router.replace("/dashboard");
          } else {
            router.replace("/onboarding/health-profile");
          }
        } catch {
          router.replace("/onboarding/health-profile");
        }
      } catch {
        router.replace("/onboarding/consent");
      }
    };

    void route();
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
