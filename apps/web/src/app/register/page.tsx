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
  IconArrowLeft, 
  IconArrowRight, 
  IconEye, 
  IconEyeOff, 
  IconDna,
  IconCheck
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
      setError("Silakan setujui Ketentuan Layanan & Kebijakan Privasi.");
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
    <div className="flex min-h-screen bg-brand-50/20 text-brand-900 selection:bg-brand-200">
      {/* LEFT COLUMN: FORM SECTION (45%) */}
      <div className="flex flex-1 flex-col justify-between px-6 py-8 sm:px-12 md:px-16 lg:px-20 xl:px-24">
        {/* Top Back Navigation */}
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-medium text-brand-900/60 hover:text-brand-900 transition-colors group"
          >
            <IconArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Center Content Container */}
        <div className="w-full max-w-[440px] mx-auto my-auto py-6">
          {/* Logo & Header */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white shadow-sm transition-transform group-hover:scale-105">
                <IconHeartbeat size={22} stroke={2.2} />
              </div>
              <span className="text-xl font-bold tracking-tight text-brand-900">HELIORA</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900 mb-1.5">
              Mulai Perjalanan Preventif
            </h1>
            <p className="text-sm text-brand-900/60 leading-relaxed font-medium">
              Buat akun Anda untuk memetakan biomarker dan memprediksi risiko metabolik.
            </p>
          </div>

          {/* Frosted Glass Form Card (Apple HIG Material) */}
          <div className="bg-white/80 backdrop-blur-xl border border-brand-900/10 rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
            <form onSubmit={handleRegister} className="space-y-3.5">
              {error && (
                <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50/80 text-red-900 text-xs">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-brand-900/80 uppercase tracking-wider">
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama sesuai identitas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 rounded-xl bg-neutral-50/70 border-neutral-200/80 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all text-sm"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-brand-900/80 uppercase tracking-wider">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 rounded-xl bg-neutral-50/70 border-neutral-200/80 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all text-sm"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-brand-900/80 uppercase tracking-wider">
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
                    className="h-10 rounded-xl bg-neutral-50/70 border-neutral-200/80 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-900 transition-colors"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                  </button>
                </div>

                {/* Segmented Password Strength Meter (Apple HIG) */}
                {password.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
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
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-brand-900/80 uppercase tracking-wider">
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
                    className="h-10 rounded-xl bg-neutral-50/70 border-neutral-200/80 text-brand-900 placeholder:text-neutral-400 focus-visible:ring-brand-900 focus-visible:border-brand-900 transition-all pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-900 transition-colors"
                    aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showConfirmPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                  </button>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start space-x-2.5 pt-1.5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  className="h-4 w-4 mt-0.5 rounded border-neutral-300 text-brand-900 focus:ring-brand-900 cursor-pointer accent-brand-900"
                />
                <label htmlFor="terms" className="text-xs text-brand-900/70 leading-relaxed cursor-pointer select-none">
                  Saya menyetujui{" "}
                  <Link href="/terms" className="font-semibold text-brand-900 hover:underline">
                    Ketentuan Layanan
                  </Link>{" "}
                  dan memahami batasan privasi data kesehatan HELIORA.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2.5">
                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-white font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mendaftarkan akun...
                    </span>
                  ) : (
                    <>
                      <span>Daftar Akun Baru</span>
                      <IconArrowRight size={16} />
                    </>
                  )}
                </Button>

                <div className="text-center text-xs text-brand-900/60 pt-1">
                  Sudah memiliki akun?{" "}
                  <Link href="/login" className="font-semibold text-brand-900 hover:underline underline-offset-4">
                    Masuk sekarang
                  </Link>
                </div>
              </div>
            </form>
          </div>

          {/* Persistent Medical Disclaimer Note */}
          <p className="text-[11px] text-brand-900/50 text-center mt-5 leading-relaxed">
            HELIORA adalah sarana preventif berbasis gaya hidup. Kami tidak memberikan resep obat maupun diagnosis darurat medis.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-brand-900/40">
          © {new Date().getFullYear()} Heliora Inc. Standar Keamanan Data Terenkripsi.
        </div>
      </div>

      {/* RIGHT COLUMN: BRAND WELLNESS BENTO PANEL (55%) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0F381E] via-[#0A2614] to-[#06180C] overflow-hidden items-center justify-center p-12 text-white border-l border-brand-900/20">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-brand-400/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Subtle Geometric Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px"
          }}
        />

        {/* Bento Showcase Container */}
        <div className="relative z-10 w-full max-w-lg space-y-6">
          
          {/* Main Statement Bento Glass Card */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <p className="text-xs font-mono font-bold tracking-widest text-emerald-400/90 uppercase">
              Privasi Tanpa Kompromi
            </p>

            <div className="space-y-3">
              <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight text-white leading-snug">
                Data kesehatan Anda adalah milik Anda sepenuhnya.
              </h2>
              <p className="text-sm xl:text-base text-white/70 leading-relaxed font-normal">
                Setiap metrik tidur, langkah, dan profil metabolisme diisolasi dalam brankas kriptografis yang hanya dapat didekripsi oleh Anda.
              </p>
            </div>

            {/* Checklist of Core Safeguards */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-white/80">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <IconCheck size={12} stroke={3} />
                </div>
                <span>Sinkronisasi otomatis dengan Apple Health & Google Health Connect</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/80">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <IconCheck size={12} stroke={3} />
                </div>
                <span>Model AI tervalidasi dataset epidemiologi CDC BRFSS</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/80">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <IconCheck size={12} stroke={3} />
                </div>
                <span>Hak mutlak penghapusan dan ekspor data sewaktu-waktu</span>
              </div>
            </div>
          </div>

          {/* Secondary Bento Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-emerald-400">
                <IconDna size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Biomarker Intelligence</div>
                <div className="text-[11px] text-white/60">Prediksi risiko berbasis probabilitas klinis</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-300">
              AUC 0.982
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
