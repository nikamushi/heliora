"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/auth-layout";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  IconArrowRight,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        if (consentStatus.has_active_consent) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding/consent");
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
    <AuthLayout title="Masuk ke Akun Anda" showDisclaimer>
      {/* Solid High-Contrast Form Card (Apple HIG) */}
      <div className="bg-white border border-brand-900/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <form onSubmit={handleLogin} className="space-y-3">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50 text-red-900 text-xs py-2 px-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-[11px] font-semibold text-brand-900/80 uppercase tracking-wider">
              Alamat Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-9 rounded-xl bg-white border-neutral-300 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all text-xs shadow-2xs"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[11px] font-semibold text-brand-900/80 uppercase tracking-wider">
                Kata Sandi
              </Label>
              <Link 
                href="/forgot-password" 
                className="text-[11px] font-medium text-brand-900/60 hover:text-brand-900 transition-colors"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-9 rounded-xl bg-white border-neutral-300 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all pr-8 text-xs shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-900 transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2 pt-0.5">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-900 focus:ring-brand-900 focus:ring-offset-0 cursor-pointer accent-brand-900 disabled:opacity-50"
            />
            <label htmlFor="remember" className="text-[11px] font-medium text-brand-900/70 cursor-pointer select-none">
              Ingat saya di perangkat ini
            </label>
          </div>

          {/* Submit Button & Switch Link */}
          <div className="pt-1.5 space-y-2">
            <Button 
              type="submit" 
              className="w-full h-9.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </span>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <IconArrowRight size={15} />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-2.5">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-200/80" />
              </div>
              <div className="relative flex justify-center text-[11px] font-medium">
                <span className="bg-white px-2.5 text-neutral-400">Atau lanjutkan dengan</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setError("Integrasi Google Login sedang disiapkan.")}
              className="w-full h-9 rounded-xl border-neutral-200 bg-white hover:bg-neutral-50 text-brand-900 text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </Button>

            <div className="text-center text-[11px] text-brand-900/60 pt-1">
              Belum memiliki akun?{" "}
              <Link href="/register" className="font-semibold text-brand-900 hover:underline underline-offset-2">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
