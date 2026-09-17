"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";

type AuthStatus = "checking" | "signed-in" | "signed-out";

// Guard berjalan client-side (FE-012, ADR-011): sumber kebenaran adalah session
// Supabase bila dikonfigurasi, fallback ke token legacy. API tetap menegakkan auth.
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          const { data } = await client.auth.getSession();
          if (!cancelled) {
            setStatus(data.session ? "signed-in" : "signed-out");
          }
          return;
        }
      }
      if (!cancelled) {
        setStatus(apiClient.getToken() ? "signed-in" : "signed-out");
      }
    };

    void resolve();

    const onStorage = () => {
      void resolve();
    };
    window.addEventListener("storage", onStorage);

    const client = getSupabaseClient();
    const { data: listener } = client
      ? client.auth.onAuthStateChange((_event, session) => {
          if (!cancelled) {
            setStatus(session ? "signed-in" : "signed-out");
          }
        })
      : { data: { subscription: null } };

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const redirectToLogin = useCallback(() => {
    void apiClient.auth.logout();
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  useEffect(() => {
    if (status === "signed-out") {
      redirectToLogin();
    }
  }, [status, redirectToLogin]);

  return { isAuthorized: status === "signed-in", redirectToLogin };
}
