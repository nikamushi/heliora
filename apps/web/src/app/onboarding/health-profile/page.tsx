"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Activity, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Scale, 
  Ruler, 
  Moon, 
  Cigarette, 
  Flame, 
  Brain, 
  AlertCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityOption {
  id: string;
  label: string;
  desc: string;
}

interface SmokingOption {
  id: string;
  label: string;
}

const activityOptions: ActivityOption[] = [
  { id: "sedentary", label: "Sedentari", desc: "Jarang olahraga (< 30 mnt/mgg)" },
  { id: "light", label: "Ringan", desc: "1–2 kali per minggu" },
  { id: "moderate", label: "Sedang", desc: "3–4 kali per minggu" },
  { id: "active", label: "Aktif", desc: "5+ kali per minggu / intensif" },
];

const smokingOptions: SmokingOption[] = [
  { id: "never", label: "Tidak Pernah" },
  { id: "former", label: "Mantan Perokok" },
  { id: "current", label: "Perokok Aktif" },
];

const familyHistoryOptions = [
  { id: "none", label: "Tidak Ada / Tidak Tahu" },
  { id: "diabetes", label: "Diabetes Melitus" },
  { id: "hypertension", label: "Hipertensi" },
  { id: "heart_disease", label: "Penyakit Jantung" },
];

const stressOptions = [
  { id: "low", label: "Rendah", desc: "Jarang tertekan" },
  { id: "moderate", label: "Sedang", desc: "Kadang tertekan" },
  { id: "high", label: "Tinggi", desc: "Sering tertekan / lelah" },
];

export default function HealthProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Data Dasar
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 2: Gaya Hidup
  const [activity, setActivity] = useState("");
  const [sleep, setSleep] = useState("");
  const [smoking, setSmoking] = useState("");

  // Step 3: Riwayat Medis (Opsional)
  const [familyHistory, setFamilyHistory] = useState<string>("none");
  const [stress, setStress] = useState("");

  // Live BMI Calculation & Classification
  const bmiInfo = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const val = parseFloat((w / (h * h)).toFixed(1));
      let category = "Normal";
      let color = "text-emerald-700 bg-emerald-50 border-emerald-200";
      let percentage = 50;

      if (val < 18.5) {
        category = "Berat Kurang";
        color = "text-blue-700 bg-blue-50 border-blue-200";
        percentage = 20;
      } else if (val >= 18.5 && val <= 24.9) {
        category = "Normal / Sehat";
        color = "text-emerald-700 bg-emerald-50 border-emerald-200";
        percentage = 50;
      } else if (val >= 25.0 && val <= 29.9) {
        category = "Kelebihan Berat";
        color = "text-amber-700 bg-amber-50 border-amber-200";
        percentage = 75;
      } else {
        category = "Obesitas";
        color = "text-rose-700 bg-rose-50 border-rose-200";
        percentage = 95;
      }

      return { value: val, category, color, percentage };
    }
    return null;
  }, [height, weight]);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!age || !gender || !height || !weight) {
        setError("Harap lengkapi seluruh data dasar di bawah ini.");
        return;
      }
      if (Number(age) < 10 || Number(age) > 120) {
        setError("Usia harus berada dalam rentang wajar (10 - 120 tahun).");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!activity || !sleep || !smoking) {
        setError("Harap lengkapi seluruh data gaya hidup.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulasi penyimpanan data profil & navigasi ke asesmen
    setTimeout(() => {
      setIsLoading(false);
      router.push("/assessment/processing");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-brand-50/30 via-white to-brand-50/20 text-brand-900 selection:bg-brand-200 overflow-hidden">
      {/* Ambient background glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-brand-400/10 blur-[130px] rounded-full pointer-events-none -z-10" 
      />

      <div className="w-full max-w-2xl">
        {/* Header Badge & Brand */}
        <div className="text-center mb-6 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-brand-900 hover:opacity-80 transition-opacity">
            <span className="w-8 h-8 rounded-xl bg-brand-900 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              H
            </span>
            <span>HELIORA</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-900">
            Profil Kesehatan & Gaya Hidup
          </h1>
          <p className="text-xs sm:text-sm text-brand-900/65 max-w-md mx-auto">
            Informasi ini digunakan model AI untuk mengukur faktor risiko dan rekomendasi preventif yang akurat.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/80 backdrop-blur-xl border border-brand-900/10 rounded-3xl p-6 sm:p-8 shadow-xl shadow-brand-900/5 space-y-6">
          {/* Stepper Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-900/70">
              <span className="flex items-center gap-1.5">
                {step === 1 && <User className="w-3.5 h-3.5 text-brand-900" />}
                {step === 2 && <Activity className="w-3.5 h-3.5 text-brand-900" />}
                {step === 3 && <Heart className="w-3.5 h-3.5 text-brand-900" />}
                <span>
                  {step === 1 && "Bagian 1: Data Dasar Biometrik"}
                  {step === 2 && "Bagian 2: Kebiasaan Gaya Hidup"}
                  {step === 3 && "Bagian 3: Riwayat Medis & Stres"}
                </span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-brand-900/60">
                0{step} / 03
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-brand-900/10 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-brand-900 h-full rounded-full"
                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form Step Content with AnimatePresence */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Usia & Gender Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      Usia (Tahun)
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-brand-900/15 bg-white text-brand-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider">
                      Jenis Kelamin
                    </label>
                    <div className="grid grid-cols-2 gap-2 h-11">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                          gender === "male"
                            ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                            : "bg-white text-brand-900 border-brand-900/15 hover:bg-neutral-50"
                        }`}
                      >
                        <span>Laki-laki</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-center gap-1.5 ${
                          gender === "female"
                            ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                            : "bg-white text-brand-900 border-brand-900/15 hover:bg-neutral-50"
                        }`}
                      >
                        <span>Perempuan</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tinggi & Berat Badan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-brand-900/70" />
                      <span>Tinggi Badan (cm)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 172"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-brand-900/15 bg-white text-brand-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-brand-900/70" />
                      <span>Berat Badan (kg)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Contoh: 68"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-brand-900/15 bg-white text-brand-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                    />
                  </div>
                </div>

                {/* Dynamic Real-time BMI Gauge Card */}
                {bmiInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border ${bmiInfo.color} transition-all space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Kalkulasi BMI Otomatis
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold">{bmiInfo.value}</span>
                        <span className="text-xs font-bold">kg/m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">Kategori: {bmiInfo.category}</span>
                      <span className="opacity-80">Ideal: 18.5 – 24.9</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Aktivitas Fisik Card Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-brand-900" />
                    <span>Aktivitas Fisik Mingguan</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activityOptions.map((opt) => {
                      const isSelected = activity === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setActivity(opt.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "bg-brand-50/70 border-brand-900 shadow-xs ring-2 ring-brand-900/10"
                              : "bg-white border-brand-900/10 hover:border-brand-900/30 hover:bg-neutral-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-brand-900">{opt.label}</span>
                            {isSelected && <Check className="w-4 h-4 text-brand-900" />}
                          </div>
                          <p className="text-xs text-brand-900/60 mt-0.5">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Durasi Tidur */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-brand-900" />
                    <span>Rata-Rata Durasi Tidur (Jam/Hari)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Contoh: 7"
                      min="1"
                      max="24"
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      className="w-32 h-11 px-3.5 rounded-xl border border-brand-900/15 bg-white text-brand-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 transition-all"
                    />
                    {sleep && (
                      <span className="text-xs font-medium text-brand-900/70">
                        {Number(sleep) < 6 
                          ? "⚠️ Kurang dari anjuran (rentan risiko)" 
                          : Number(sleep) <= 8 
                          ? "✨ Durasi ideal untuk pemulihan optimal" 
                          : "💤 Cukup (di atas rata-rata)"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Merokok */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Cigarette className="w-3.5 h-3.5 text-brand-900" />
                    <span>Kebiasaan Merokok</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {smokingOptions.map((opt) => {
                      const isSelected = smoking === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setSmoking(opt.id)}
                          className={`h-11 px-2 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-center text-center ${
                            isSelected
                              ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                              : "bg-white text-brand-900 border-brand-900/15 hover:bg-neutral-50"
                          }`}
                        >
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-900/10 text-xs text-brand-900/70">
                  Bagian ini bersifat <strong>opsional</strong> untuk mempertajam estimasi AI. Anda dapat melewatinya bila tidak mengetahui riwayat pasti.
                </div>

                {/* Riwayat Penyakit Keluarga */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-brand-900" />
                    <span>Riwayat Penyakit Keluarga</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {familyHistoryOptions.map((opt) => {
                      const isSelected = familyHistory === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setFamilyHistory(opt.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                            isSelected
                              ? "bg-brand-50/70 border-brand-900 shadow-xs ring-2 ring-brand-900/10"
                              : "bg-white border-brand-900/10 hover:border-brand-900/30 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="text-xs font-semibold text-brand-900">{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-brand-900" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tingkat Stres */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-brand-900" />
                    <span>Tingkat Stres Sehari-Hari</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {stressOptions.map((opt) => {
                      const isSelected = stress === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setStress(opt.id)}
                          className={`h-14 p-2 rounded-2xl text-xs font-semibold border transition-all duration-150 flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? "bg-brand-900 text-white border-brand-900 shadow-xs"
                              : "bg-white text-brand-900 border-brand-900/15 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="font-bold">{opt.label}</span>
                          <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-brand-900/50"}`}>
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-brand-900/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-semibold text-brand-900/70 hover:text-brand-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : (
              <Link
                href="/onboarding/consent"
                className="px-4 py-2 text-xs font-semibold text-brand-900/70 hover:text-brand-900 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Consent</span>
              </Link>
            )}

            <div className="flex items-center gap-2">
              {step === 3 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-brand-900/60 hover:text-brand-900 transition-colors"
                >
                  Lewati
                </button>
              )}

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="px-5 py-2.5 rounded-full bg-brand-900 hover:bg-brand-900/90 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-brand-900/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  size="sm"
                  className="px-6 py-2.5 rounded-full bg-brand-900 hover:bg-brand-900/90 text-white font-semibold flex items-center gap-2 shadow-md shadow-brand-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Analisis AI</span>
                      <Sparkles className="w-4 h-4 text-brand-200" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
