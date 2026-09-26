"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlertTooltip } from "@/components/ui/alert-tooltip";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TriangleAlert } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { apiClient, ApiClientError } from "@/lib/api-client";
import {
  IconArrowRight,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsTooltip, setShowTermsTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate password strength (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ["Sangat Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const strengthColors = [
    "bg-red-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-600"
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setShowTermsTooltip(true);
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.auth.register({
        email: email.trim(),
        password,
        full_name: name.trim(),
      });
      router.push("/onboarding/consent");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Gagal mendaftar. Pastikan koneksi ke server backend aktif.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await apiClient.auth.signInWithOAuth("google");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Gagal mendaftar dengan Google. Coba lagi.");
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Mulai Perjalanan Preventif" showDisclaimer>
      {/* Solid High-Contrast Form Card (Apple HIG) */}
      <div className="bg-white border border-brand-900/10 rounded-2xl p-3.5 sm:p-4.5 shadow-xs space-y-2">
        <form onSubmit={handleRegister} className="space-y-2">
          <FormAlertTooltip
            message={error}
            onDismiss={() => setError("")}
            className="mb-0.5"
          />

          {/* Stacked Form Fields with Distinct Gap between Email & Password */}
          <div>
            {/* Identity Fields (Nama & Email - rapat) */}
            <div className="space-y-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[11px] font-semibold text-brand-900/80 uppercase tracking-wider">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama sesuai identitas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-9 rounded-xl bg-white border-neutral-300 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all text-xs shadow-2xs"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
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
            </div>

            {/* Credential Fields (Kata Sandi & Konfirmasi) */}
            <div className="space-y-1.5 pt-2">
              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[11px] font-semibold text-brand-900/80 uppercase tracking-wider">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
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

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            strengthScore > step 
                              ? strengthColors[strengthScore - 1] 
                              : "bg-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-brand-900/60 font-medium">
                      <span>Kekuatan sandi:</span>
                      <span className="font-semibold text-brand-900">
                        {strengthScore > 0 ? strengthLabels[strengthScore - 1] : "Terlalu pendek"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[11px] font-semibold text-brand-900/80 uppercase tracking-wider">
                  Konfirmasi Kata Sandi
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi kata sandi Anda"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-9 rounded-xl bg-white border-neutral-300 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all pr-8 text-xs shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-900 transition-colors disabled:opacity-50"
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showConfirmPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="pt-0.5">
            <Tooltip open={showTermsTooltip} onOpenChange={setShowTermsTooltip}>
              <TooltipTrigger asChild>
                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked) setShowTermsTooltip(false);
                    }}
                    disabled={isLoading}
                    className="h-3.5 w-3.5 mt-0.5 rounded border-neutral-300 text-brand-900 focus:ring-brand-900 cursor-pointer accent-brand-900 disabled:opacity-50"
                  />
                  <label htmlFor="terms" className="text-[11px] text-brand-900/70 leading-tight cursor-pointer select-none">
                    Saya menyetujui{" "}
                    <Link href="/terms" className="font-semibold text-brand-900 hover:underline">
                      Ketentuan Layanan
                    </Link>{" "}
                    & kebijakan privasi data HELIORA.
                  </label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="border-amber-200/90 bg-amber-50 text-amber-900 font-medium max-w-xs shadow-md">
                <div className="flex items-center gap-1.5">
                  <TriangleAlert className="size-3.5 text-amber-600 shrink-0" />
                  <span className="text-xs">Wajib menyetujui ketentuan layanan &amp; privasi data sebelum mendaftar.</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Submit Button & Switch Link */}
          <div className="pt-1 space-y-1.5">
            <Button 
              type="submit" 
              className="w-full h-9.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftarkan akun...
                </span>
              ) : (
                <>
                  <span>Daftar Akun Baru</span>
                  <IconArrowRight size={15} />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-1.5">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-neutral-200/80" />
              </div>
              <div className="relative flex justify-center text-[11px] font-medium">
                <span className="bg-white px-2.5 text-neutral-400">Atau lanjutkan dengan</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignUp}
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
              Sudah memiliki akun?{" "}
              <Link href="/login" className="font-semibold text-brand-900 hover:underline underline-offset-2">
                Masuk sekarang
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
