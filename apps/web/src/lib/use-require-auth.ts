"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

type AuthStatus = "checking" | "signed-in" | "signed-out";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// The token lives in localStorage, which proxy.ts cannot read, so this guard runs client-side; the API still enforces auth.
export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSyncExternalStore<AuthStatus>(
    subscribeToStorage,
    () => (apiClient.getToken() ? "signed-in" : "signed-out"),
    () => "checking"
  );

  const redirectToLogin = useCallback(() => {
    apiClient.auth.logout();
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  useEffect(() => {
    if (status === "signed-out") {
      redirectToLogin();
    }
  }, [status, redirectToLogin]);

  return { isAuthorized: status === "signed-in", redirectToLogin };
}
