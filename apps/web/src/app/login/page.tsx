"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlertTooltip } from "@/components/ui/alert-tooltip";
import { AuthLayout } from "@/components/auth-layout";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Eye as IconEye, EyeOff as IconEyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await apiClient.auth.signInWithOAuth("google");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Gagal masuk dengan Google. Coba lagi.");
      }
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiClient.auth.login({
        email: email.trim(),
        password,
      });

      // Check consent status to route appropriately
      try {
        const consentStatus = await apiClient.consent.getStatus();
        if (!consentStatus?.has_active_consent) {
          router.push("/onboarding/consent");
          return;
        }

        // Check health profile completion
        try {
          const profile = await apiClient.healthProfile.get();
          if (
            profile &&
            profile.age &&
            profile.gender &&
            profile.height_cm &&
            profile.weight_kg
          ) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding/health-profile");
          }
        } catch {
          router.push("/onboarding/health-profile");
        }
      } catch {
        router.push("/onboarding/consent");
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Gagal masuk. Pastikan email dan kata sandi Anda benar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Masuk ke HELIORA">
      <form onSubmit={handleLogin} className="space-y-4">
        <FormAlertTooltip message={error} onDismiss={() => setError("")} />

        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-input bg-white px-4 text-base shadow-sm placeholder:text-muted-foreground/60 md:text-base"
          />
        </div>

        {/* Password Field */}
        <div>
          <Label htmlFor="password" className="sr-only">
            Kata sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-input bg-white pr-12 pl-4 text-base shadow-sm placeholder:text-muted-foreground/60 md:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
        </div>

        {/* Parked, not deleted — "Ingat saya" is not surfaced on the redesigned
            login screen yet. Drop the wrapper `hidden` to bring it back. */}
        <div className="hidden">
          <div className="flex items-center gap-2.5 pt-0.5">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="size-4 shrink-0 cursor-pointer rounded-[5px] border-input accent-brand-900 disabled:opacity-50"
            />
            <label
              htmlFor="remember"
              className="cursor-pointer text-sm text-muted-foreground select-none"
            >
              Ingat saya di perangkat ini
            </label>
          </div>
        </div>

        {/* Submit Button & Switch Link
            Spacing is explicit (not `space-y-*`) so the links block below can
            own its own `mt-8` — a `space-y` parent outranks a child's `mt-*`. */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-primary-700 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Memverifikasi...
              </span>
            ) : (
              "Masuk"
            )}
          </Button>

          {/* Divider */}
          <div className="mt-4 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground select-none">
              atau
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            aria-label="Lanjutkan dengan Google"
            className="mx-auto mt-4 flex h-12 w-auto gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-foreground shadow-sm hover:bg-border/40"
          >
            <svg
              className="size-4 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </Button>

          <div className="mt-8 space-y-3 text-center text-sm font-semibold text-primary">
            <Link
              href="/forgot-password"
              className="block transition-colors hover:text-primary-800 hover:underline underline-offset-4"
            >
              Lupa email atau kata sandi?
            </Link>
            <Link
              href="/register"
              className="hover:underline underline-offset-4"
            >
              Buat akun
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
