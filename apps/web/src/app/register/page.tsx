"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormAlertTooltip } from "@/components/ui/alert-tooltip";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { TriangleAlert, Eye as IconEye, EyeOff as IconEyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { apiClient, ApiClientError } from "@/lib/api-client";

const PRIVACY_NOTE =
  "Privasi adalah bagian dari pengalaman HELIORA. Kami hanya menggunakan data yang diperlukan untuk memberikan pengalaman yang lebih personal.";

const TEXT_LINK =
  "font-semibold text-primary transition-colors hover:text-primary-800 hover:underline underline-offset-4";

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

  return (
    <AuthLayout title="Buat akun Heliora" showDisclaimer disclaimerText={PRIVACY_NOTE}>
      <form onSubmit={handleRegister} className="space-y-4">
        <FormAlertTooltip message={error} onDismiss={() => setError("")} />

        <div className="-mt-6 mb-6 text-center text-sm text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className={TEXT_LINK}
          >
            Masuk
          </Link>
        </div>

        <div>
          <Label htmlFor="name" className="sr-only">
            Nama lengkap
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-input bg-white px-4 text-base shadow-sm placeholder:text-muted-foreground/60"
          />
        </div>

        <div>
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 rounded-xl border-input bg-white px-4 text-base shadow-sm placeholder:text-muted-foreground/60"
          />
        </div>

        <div>
          <Label htmlFor="password" className="sr-only">
            Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-input bg-white pr-12 pl-4 text-base shadow-sm placeholder:text-muted-foreground/60"
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

          {/* Password Strength Meter */}
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
          <Label htmlFor="confirmPassword" className="sr-only">
            Konfirmasi Kata Sandi
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 rounded-xl border-input bg-white pr-12 pl-4 text-base shadow-sm placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
            >
              {showConfirmPassword ? (
                <IconEyeOff size={18} />
              ) : (
                <IconEye size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <Tooltip open={showTermsTooltip} onOpenChange={setShowTermsTooltip}>
          <TooltipTrigger asChild>
            <div className="mt-6! flex items-start gap-2.5 border-t border-border pt-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setShowTermsTooltip(false);
                }}
                disabled={isLoading}
                className="mt-0.5 size-4 shrink-0 cursor-pointer rounded-[5px] border-input accent-brand-900 disabled:opacity-50"
              />
              <label
                htmlFor="terms"
                className="cursor-pointer text-xs leading-relaxed text-muted-foreground select-none"
              >
                Saya menyetujui{" "}
                <Link
                  href="/terms"
                  className={TEXT_LINK}
                >
                  Ketentuan Layanan
                </Link>{" "}
                dan{" "}
                <Link
                  href="/privacy"
                  className={TEXT_LINK}
                >
                  Kebijakan Privasi
                </Link>
                .
              </label>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            className="max-w-xs border-amber-200/90 bg-amber-50 font-medium text-amber-900 shadow-md"
          >
            <div className="flex items-center gap-1.5">
              <TriangleAlert className="size-3.5 shrink-0 text-amber-600" />
              <span className="text-xs">
                Wajib menyetujui ketentuan layanan &amp; kebijakan privasi sebelum
                mendaftar.
              </span>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Submit, OAuth & Switch Link
            Explicit margins (not `space-y-*`) so the switch-link block can own
            its own `mt-8` — a `space-y` parent outranks a child's `mt-*`. */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-primary-700 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-800 active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Mendaftarkan...
              </span>
            ) : (
              "Buat akun"
            )}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
