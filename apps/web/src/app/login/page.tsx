"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { 
  IconHeartbeat, 
  IconArrowRight, 
  IconEye, 
  IconEyeOff, 
  IconShieldCheck,
  IconSparkles,
  IconLock
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
    <div className="flex h-screen max-h-screen overflow-hidden bg-brand-50/20 text-brand-900 selection:bg-brand-200">
      {/* LEFT COLUMN: FORM SECTION (45%) */}
      <div className="flex flex-1 flex-col justify-between px-6 py-4 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto lg:overflow-hidden">
        {/* Center Content Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-2">
          {/* Logo & Header */}
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-900 text-white shadow-xs transition-transform group-hover:scale-105">
                <IconHeartbeat size={18} stroke={2.2} />
              </div>
              <span className="text-lg font-bold tracking-tight text-brand-900">HELIORA</span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-900 leading-tight">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs text-brand-900/60 leading-normal font-medium mt-0.5">
              Akses panel analisis risiko preventif dan data kesehatan terpadu Anda.
            </p>
          </div>

          {/* Frosted Glass Form Card (Apple HIG Material) */}
          <div className="bg-white/80 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-3.5">
            <form onSubmit={handleLogin} className="space-y-3">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50/80 text-red-900 text-xs py-2 px-3">
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
                  className="h-9 rounded-xl bg-neutral-50/70 border-neutral-200/80 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all text-xs"
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
                    className="h-9 rounded-xl bg-neutral-50/70 border-neutral-200/80 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all pr-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-900 transition-colors"
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
                  className="h-3.5 w-3.5 rounded border-neutral-300 text-brand-900 focus:ring-brand-900 focus:ring-offset-0 cursor-pointer accent-brand-900"
                />
                <label htmlFor="remember" className="text-[11px] font-medium text-brand-900/70 cursor-pointer select-none">
                  Ingat saya di perangkat ini
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 space-y-2">
                <Button 
                  type="submit" 
                  className="w-full h-9.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
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

                <Link href="/register" className="block w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9 rounded-xl border-brand-900/15 bg-white/50 hover:bg-brand-50/60 text-brand-900 text-xs font-semibold transition-all"
                  >
                    Daftar Akun Baru
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-brand-900/40 py-1">
          © {new Date().getFullYear()} Heliora Inc. Privasi data terenkripsi end-to-end.
        </div>
      </div>

      {/* RIGHT COLUMN: BRAND WELLNESS BENTO PANEL (55%) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0F381E] via-[#0A2614] to-[#06180C] overflow-hidden items-center justify-center p-8 xl:p-12 text-white border-l border-brand-900/20">
        {/* Soft Ambient Glows */}
        <div className="absolute top-1/4 right-1/4 w-[380px] h-[380px] bg-brand-400/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle Geometric Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px"
          }}
        />

        {/* Bento Showcase Card (Frosted Glassmorphism Apple HIG) */}
        <div className="relative z-10 w-full max-w-md space-y-4">
          
          {/* Main Statement Glass Card */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <p className="text-[11px] font-mono font-bold tracking-widest text-emerald-400/90 uppercase">
              Sistem Preventif Personal
            </p>

            <blockquote className="space-y-2.5">
              <p className="text-xl xl:text-2xl font-semibold tracking-tight text-white leading-snug">
                &ldquo;Predict Today.<br />Prevent Tomorrow.&rdquo;
              </p>
              <p className="text-xs xl:text-sm text-white/70 leading-relaxed font-normal">
                Ketahui tren risiko kardiometabolik Anda bertahun-tahun sebelum vonis dokter. Hidup lebih tenang dengan intervensi harian yang terukur.
              </p>
            </blockquote>

            {/* Micro Metric Preview Strip */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium">
                  <IconSparkles size={13} className="text-emerald-400" />
                  <span>Akurasi Model</span>
                </div>
                <div className="text-lg font-bold tracking-tight text-white">98.2%</div>
                <div className="text-[10px] text-white/50">Validasi CDC BRFSS</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium">
                  <IconLock size={13} className="text-emerald-400" />
                  <span>Enkripsi Data</span>
                </div>
                <div className="text-lg font-bold tracking-tight text-white">AES-256</div>
                <div className="text-[10px] text-white/50">Zero-Knowledge Storage</div>
              </div>
            </div>
          </div>

          {/* Secondary Reassuring Badge */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
              <IconShieldCheck size={18} />
            </div>
            <div className="text-xs text-white/80 leading-relaxed">
              Data Anda aman dan tidak pernah dijual atau digunakan untuk tujuan komersial pihak ketiga.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
