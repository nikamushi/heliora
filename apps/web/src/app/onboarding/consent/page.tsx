"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  HeartPulse, 
  ArrowRight, 
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const features = [
  {
    icon: ShieldCheck,
    title: "Estimasi Risiko Presisi",
    desc: "Kalkulasi probabilitas risiko kardiovaskular dan metabolik berbasis data biometrik.",
  },
  {
    icon: Activity,
    title: "Health & Lifestyle Score",
    desc: "Skor kesehatan komprehensif yang memetakan kualitas gaya hidup harian Anda.",
  },
  {
    icon: Sparkles,
    title: "Simulasi Masa Depan",
    desc: "Proyeksi dinamis interaktif untuk melihat dampak perubahan kebiasaan.",
  },
  {
    icon: HeartPulse,
    title: "Rekomendasi Preventif",
    desc: "Panduan tindakan pencegahan yang dipersonalisasi dan tervalidasi bukti medis.",
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!hasConsented || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      if (apiClient.getToken()) {
        await apiClient.consent.record({
          agreed: true,
          consent_version: "1.0",
        });
      }
      router.push("/onboarding/health-profile");
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          router.push("/login?redirect=/onboarding/consent");
          return;
        }
        setError(err.message);
      } else {
        setError("Gagal mencatat persetujuan privasi. Pastikan koneksi backend aktif.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-brand-50/30 via-white to-brand-50/20 text-brand-900 selection:bg-brand-200 overflow-hidden">
      {/* Ambient background glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-brand-400/10 blur-[120px] rounded-full pointer-events-none -z-10" 
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-2xl"
      >
        {/* Top Header */}
        <div className="text-center mb-8 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-brand-900 hover:opacity-80 transition-opacity">
            <span className="w-8 h-8 rounded-xl bg-brand-900 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              H
            </span>
            <span>HELIORA</span>
          </Link>
          <p className="text-xs font-mono font-bold tracking-widest text-brand-900/50 uppercase">
            Langkah 01 / 02 · Persetujuan Privasi & Etika Data
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-900">
            Sebelum Memulai Asesmen
          </h1>
          <p className="text-sm md:text-base text-brand-900/70 max-w-lg mx-auto leading-relaxed">
            HELIORA memproses data gaya hidup dan biometrik Anda secara terenkripsi untuk tujuan analisis kesehatan preventif berikut:
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-brand-900/10 rounded-3xl p-6 sm:p-8 shadow-xl shadow-brand-900/5 space-y-6">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-brand-50/40 border border-brand-900/5 transition-all hover:bg-brand-50/70"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-xs border border-brand-900/10 text-brand-900">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-semibold text-brand-900">
                      {item.title}
                    </h2>
                    <p className="text-xs text-brand-900/65 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Medical Disclaimer Alert (Clean Apple-Style) */}
          <div className="flex gap-3.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 text-amber-900">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                Disclaimer Medis Penting
              </h3>
              <p className="text-xs text-amber-950/80 leading-relaxed">
                HELIORA adalah alat bantu analisis prediktif risiko gaya hidup, <strong>bukan pengganti diagnosis, pemeriksaan klinis, atau resep dokter</strong>. Hasil kalkulasi bersifat indikatif preventif. Selalu konsultasikan kondisi kesehatan Anda ke tenaga medis profesional.
              </p>
            </div>
          </div>

          {/* Interactive Consent Checkbox Box */}
          <div
            onClick={() => setHasConsented(!hasConsented)}
            role="checkbox"
            aria-checked={hasConsented}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setHasConsented(!hasConsented);
              }
            }}
            className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none ${
              hasConsented 
                ? "bg-brand-50/60 border-brand-900 shadow-xs ring-2 ring-brand-900/10" 
                : "bg-white border-brand-900/15 hover:border-brand-900/30 hover:bg-neutral-50/50"
            }`}
          >
            <div 
              className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-150 ${
                hasConsented 
                  ? "bg-brand-900 border-brand-900 text-white shadow-xs" 
                  : "border-brand-900/30 bg-white"
              }`}
            >
              {hasConsented && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-brand-900">
                Saya telah membaca, memahami, dan menyetujui ketentuan ini
              </p>
              <p className="text-xs text-brand-900/60">
                Data Anda dienkripsi dan hanya digunakan untuk perhitungan skor risiko kesehatan pribadi Anda.
              </p>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border border-red-500/20 text-red-900 rounded-2xl py-3 px-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <AlertDescription className="text-xs text-red-900 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-brand-900/10">
            <Link
              href="/"
              className="text-xs font-semibold text-brand-900/60 hover:text-brand-900 transition-colors"
            >
              Kembali ke Beranda
            </Link>

            <Button
              onClick={handleContinue}
              disabled={!hasConsented || isLoading}
              size="lg"
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                hasConsented && !isLoading
                  ? "bg-brand-900 hover:bg-brand-900/90 text-white shadow-md shadow-brand-900/20 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-brand-900/20 text-brand-900/40 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Persetujuan...</span>
                </>
              ) : (
                <>
                  <span>Lanjut ke Health Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
