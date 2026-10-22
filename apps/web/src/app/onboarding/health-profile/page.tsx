"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { HealthProfileCreateRequest } from "@/types/api";

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
  { id: "sedentary", label: "Jarang berolahraga", desc: "" },
  { id: "light", label: "Ringan", desc: "1–2 kali per minggu" },
  { id: "moderate", label: "Sedang", desc: "3–4 kali per minggu" },
  { id: "active", label: "Aktif", desc: "5+ kali per minggu" },
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
  const [sleep, setSleep] = useState("7");
  const [smoking, setSmoking] = useState("");

  // Step 3: Riwayat Medis (Opsional)
  const [familyHistory, setFamilyHistory] = useState<string[]>(["none"]);
  const [familyHistoryDetails, setFamilyHistoryDetails] = useState("");
  const [stress, setStress] = useState("3");

  useEffect(() => {
    let isMounted = true;
    async function initAndCheckAccess() {
      try {
        const token = await apiClient.getAccessToken();
        if (!token) {
          if (isMounted) {
            router.replace("/login?redirect=/onboarding/health-profile");
          }
          return;
        }

        // Must have active consent before filling health profile
        try {
          const consentStatus = await apiClient.consent.getStatus();
          if (!consentStatus?.has_active_consent) {
            if (isMounted) {
              router.replace("/onboarding/consent");
            }
            return;
          }
        } catch {
          if (isMounted) {
            router.replace("/onboarding/consent");
          }
          return;
        }

        // Load existing profile if any
        try {
          const profile = await apiClient.healthProfile.get();
          if (!isMounted || !profile) return;

          if (profile.age) setAge(String(profile.age));
          if (profile.gender) setGender(profile.gender);
          if (profile.height_cm) setHeight(String(profile.height_cm));
          if (profile.weight_kg) setWeight(String(profile.weight_kg));

          if (profile.physical_activity_min_per_week !== undefined) {
            const actVal = profile.physical_activity_min_per_week;
            if (actVal <= 0) setActivity("sedentary");
            else if (actVal <= 60) setActivity("light");
            else if (actVal <= 150) setActivity("moderate");
            else setActivity("active");
          }

          if (profile.sleep_duration_hours) {
            setSleep(String(Math.round(profile.sleep_duration_hours)));
          }
          if (profile.smoking_status) {
            setSmoking(profile.smoking_status);
          }

          if (profile.family_history) {
            const details = profile.family_history_details || "";
            setFamilyHistoryDetails(details);
            const found: string[] = [];
            if (details.toLowerCase().includes("diabet")) found.push("diabetes");
            if (
              details.toLowerCase().includes("hipertensi") ||
              details.toLowerCase().includes("hypertension")
            ) {
              found.push("hypertension");
            }
            if (
              details.toLowerCase().includes("jantung") ||
              details.toLowerCase().includes("heart")
            ) {
              found.push("heart_disease");
            }
            setFamilyHistory(found.length > 0 ? found : ["diabetes"]);
          } else {
            setFamilyHistory(["none"]);
            setFamilyHistoryDetails("");
          }

          if (profile.stress_level != null) {
            const raw = Number(profile.stress_level);
            const norm = raw > 5 ? Math.min(5, Math.max(1, Math.round(raw / 2))) : Math.min(5, Math.max(1, Math.round(raw)));
            setStress(String(norm));
          }
        } catch {
          // No profile yet, start fresh
        }
      } catch {
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    initAndCheckAccess();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const toggleFamilyHistory = (id: string) => {
    if (id === "none") {
      setFamilyHistory(["none"]);
      setFamilyHistoryDetails("");
      return;
    }
    setFamilyHistory((prev) => {
      const withoutNone = prev.filter((item) => item !== "none");
      if (withoutNone.includes(id)) {
        const next = withoutNone.filter((item) => item !== id);
        return next.length === 0 ? ["none"] : next;
      }
      return [...withoutNone, id];
    });
  };

  const bmiValue = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return parseFloat((w / (h * h)).toFixed(1));
    }
    return null;
  }, [height, weight]);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!age || !gender || !height || !weight) {
        setError("Lengkapi seluruh data dasar sebelum melanjutkan.");
        return;
      }
      const numAge = Number(age);
      if (numAge < 10 || numAge > 120) {
        setError("Usia harus berada dalam rentang wajar (10 - 120 tahun).");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!activity || !sleep || !smoking) {
        setError("Lengkapi data aktivitas fisik dan kebiasaan merokok.");
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
    setError("");

    try {
      if (!apiClient.getToken()) {
        router.push("/login?redirect=/onboarding/health-profile");
        return;
      }

      const activityMap: Record<string, number> = {
        sedentary: 0,
        light: 60,
        moderate: 150,
        active: 300,
      };

      const hasFamilyHistory = !familyHistory.includes("none") && familyHistory.length > 0;
      const selectedLabels = familyHistoryOptions
        .filter((opt) => familyHistory.includes(opt.id) && opt.id !== "none")
        .map((opt) => opt.label)
        .join(", ");
      const resolvedDetails = hasFamilyHistory
        ? familyHistoryDetails.trim() || selectedLabels || "Riwayat keluarga dilaporkan"
        : null;

      const payload: HealthProfileCreateRequest = {
        age: parseInt(age, 10),
        gender: gender || "other",
        height_cm: parseFloat(height),
        weight_kg: parseFloat(weight),
        physical_activity_min_per_week: activityMap[activity] ?? 150,
        sleep_duration_hours: parseFloat(sleep) || 7,
        smoking_status: smoking || "never",
        family_history: hasFamilyHistory,
        family_history_details: resolvedDetails,
        stress_level: stress ? parseInt(stress, 10) : 3,
        bmi: bmiValue,
      };

      await apiClient.healthProfile.save(payload);

      let assessmentSuccess = true;
      try {
        await apiClient.assessment.run();
      } catch (assessmentErr) {
        assessmentSuccess = false;
        console.warn("Auto-assessment warning (FR-042 fallback):", assessmentErr);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("heliora_health_profile", JSON.stringify(payload));
      }

      if (typeof window !== "undefined" && (window.location.search.includes("edit") || (typeof document !== "undefined" && document.referrer.includes("/dashboard/profile")))) {
        router.push(assessmentSuccess ? "/dashboard/profile?updated=true" : "/dashboard/profile?partial=true");
      } else {
        router.push(assessmentSuccess ? "/dashboard" : "/dashboard?notice=partial_assessment");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof ApiClientError) {
        if (err.status === 401) {
          router.push("/login?redirect=/onboarding/health-profile");
          return;
        }
        setError(err.message || "Gagal menyimpan profil kesehatan ke server.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal menyimpan profil kesehatan ke server. Periksa koneksi Anda dan coba lagi.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] selection:bg-[#DCFCE9]">
      <div className="w-full max-w-[700px] mx-auto px-6 py-14 sm:py-20 flex flex-col justify-between min-h-screen">
        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col justify-center"
        >
          {/* Editorial Title & Subtitle */}
          <div className="mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#111827] leading-[1.12] mb-4">
              {step === 1 && (
                <>
                  Mari mulai dari
                  <br />
                  kondisi Anda.
                </>
              )}
              {step === 2 && (
                <>
                  Sekarang, ceritakan
                  <br />
                  keseharian Anda.
                </>
              )}
              {step === 3 && (
                <>
                  Beberapa hal
                  <br />
                  terakhir.
                </>
              )}
            </h1>
            <p className="text-lg sm:text-[20px] text-[#6B7280] font-normal leading-[1.55] max-w-[620px]">
              {step === 1 &&
                "Beberapa informasi dasar akan membantu membentuk gambaran kesehatan yang lebih personal."}
              {step === 2 &&
                "Beberapa kebiasaan sehari-hari membantu membentuk gambaran kesehatan yang lebih lengkap."}
              {step === 3 &&
                "Informasi tambahan ini membantu melengkapi gambaran kesehatan Anda."}
            </p>
          </div>

          {/* Form Step Section Header */}
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] pb-3 border-b border-[#E5E7EB]/80 mb-8">
            <span>
              {step === 1 && "DATA DASAR"}
              {step === 2 && "GAYA HIDUP"}
              {step === 3 && "INFORMASI TAMBAHAN (OPSIONAL)"}
            </span>
            <span className="font-mono text-xs text-[#6B7280]">0{step} / 03</span>
          </div>

          {error && (
            <Alert className="mb-8 bg-red-50 border border-red-200 text-red-900 rounded-2xl py-3 px-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <AlertDescription className="text-xs text-red-900 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Step Content with AnimatePresence */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-7"
              >
                {/* Usia */}
                <div className="space-y-2">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Usia
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full h-13 px-4.5 pr-18 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] text-base font-normal placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D5F3F] focus:border-transparent transition-all"
                    />
                    <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] pointer-events-none">
                      tahun
                    </span>
                  </div>
                </div>

                {/* Jenis Kelamin */}
                <div className="space-y-2">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Jenis kelamin
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`h-13 rounded-2xl border text-[15px] font-medium transition-all flex items-center justify-center cursor-pointer ${
                        gender === "male"
                          ? "bg-[#0D5F3F] text-white border-[#0D5F3F] shadow-xs"
                          : "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`h-13 rounded-2xl border text-[15px] font-medium transition-all flex items-center justify-center cursor-pointer ${
                        gender === "female"
                          ? "bg-[#0D5F3F] text-white border-[#0D5F3F] shadow-xs"
                          : "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>

                {/* Tinggi Badan */}
                <div className="space-y-2">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Tinggi badan
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="172"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full h-13 px-4.5 pr-14 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] text-base font-normal placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D5F3F] focus:border-transparent transition-all"
                    />
                    <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] pointer-events-none">
                      cm
                    </span>
                  </div>
                </div>

                {/* Berat Badan */}
                <div className="space-y-2">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Berat badan
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="68"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full h-13 px-4.5 pr-14 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] text-base font-normal placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0D5F3F] focus:border-transparent transition-all"
                    />
                    <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                {/* Aktivitas Fisik */}
                <div className="space-y-3">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Seberapa sering Anda berolahraga?
                  </label>
                  <div className="divide-y divide-[#F0F2F1] border-t border-b border-[#F0F2F1]">
                    {activityOptions.map((opt) => {
                      const isSelected = activity === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setActivity(opt.id)}
                          className="w-full text-left py-4.5 sm:py-5 flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] transition-colors hover:bg-neutral-50/40 px-1 cursor-pointer"
                        >
                          <div>
                            <h4 className="text-[16px] sm:text-[17px] font-semibold text-[#111827] leading-snug">
                              {opt.label}
                            </h4>
                            {opt.desc && (
                              <p className="text-xs sm:text-[13.5px] text-[#6B7280] mt-0.5 leading-normal">
                                {opt.desc}
                              </p>
                            )}
                          </div>
                          <div
                            className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                              isSelected
                                ? "bg-[#0D5F3F] text-white shadow-xs"
                                : "border-[1.8px] border-[#D1D5DB] bg-white group-hover:border-[#9CA3AF]"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Durasi Tidur */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[15px] font-medium text-[#111827]">
                      Durasi tidur
                    </label>
                    <span className="text-[15px] tabular-nums font-medium text-[#111827]">
                      <span className="font-semibold">{sleep}</span>{" "}
                      <span className="text-[#6B7280]">jam / hari</span>
                    </span>
                  </div>
                  <div className="pt-2 pb-1">
                    <Slider
                      value={[Number(sleep) || 7]}
                      min={4}
                      max={12}
                      step={1}
                      onValueChange={(val) => {
                        const v = typeof val === "number" ? val : val[0];
                        setSleep(String(v));
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Status Merokok */}
                <div className="space-y-3">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Bagaimana kebiasaan merokok Anda?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {smokingOptions.map((opt) => {
                      const isSelected = smoking === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setSmoking(opt.id)}
                          className={`h-13 px-2 rounded-2xl text-xs sm:text-[13.5px] font-medium border transition-all flex items-center justify-center text-center cursor-pointer ${
                            isSelected
                              ? "bg-[#0D5F3F] text-white border-[#0D5F3F] shadow-xs"
                              : "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB] hover:bg-[#F3F4F6]"
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
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                {/* Riwayat Penyakit Keluarga */}
                <div className="space-y-3">
                  <label className="text-[15px] font-medium text-[#111827] block">
                    Riwayat Penyakit Keluarga
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {familyHistoryOptions.map((opt) => {
                      const isSelected = familyHistory.includes(opt.id);
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => toggleFamilyHistory(opt.id)}
                          className={`h-13 px-4 rounded-2xl border text-sm sm:text-[14.5px] font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#0D5F3F] text-white border-[#0D5F3F] shadow-xs"
                              : "bg-[#F9FAFB] text-[#111827] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-white stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input Rincian Riwayat Keluarga */}
                  {!familyHistory.includes("none") && familyHistory.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
                        Rincian Riwayat Keluarga (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ayah menderita diabetes tipe 2 sejak usia 45"
                        value={familyHistoryDetails}
                        onChange={(e) => setFamilyHistoryDetails(e.target.value)}
                        className="w-full h-13 px-4.5 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5F3F] transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Tingkat Stres */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[15px] font-medium text-[#111827]">
                        Tingkat Stres Harian
                      </label>
                      <span className="text-xs text-[#6B7280] block">Opsional · Skala 1–5</span>
                    </div>
                    <div className="flex items-baseline gap-1 tabular-nums">
                      <span className="text-[15px] font-semibold text-[#111827]">
                        {stress || "3"}
                      </span>
                      <span className="text-[15px] text-[#6B7280]">/ 5</span>
                    </div>
                  </div>
                  <div className="pt-2 pb-1">
                    <Slider
                      value={[Number(stress) || 3]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(val) => {
                        const v = typeof val === "number" ? val : val[0];
                        setStress(String(v));
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                  <div className="text-xs sm:text-[13px] text-[#6B7280]">
                    <span>
                      {Number(stress) <= 1
                        ? "1: Sangat Rendah (Rileks dan terkendali)"
                        : Number(stress) === 2
                        ? "2: Rendah (Beban kerja ringan)"
                        : Number(stress) === 3
                        ? "3: Sedang (Beban kerja harian normal)"
                        : Number(stress) === 4
                        ? "4: Tinggi (Sering merasa tertekan)"
                        : "5: Sangat Tinggi (Rentan burnout / beban berat)"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Bottom Divider */}
          <div className="border-b border-[#E5E7EB]/80 pt-8 mb-8" />

          {/* Navigation Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isLoading}
                className="text-[15px] sm:text-[16px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            ) : (
              <Link
                href="/onboarding/consent"
                className={`text-[15px] sm:text-[16px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors flex items-center gap-1.5 ${
                  isLoading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Consent</span>
              </Link>
            )}

            {step === 3 && (
              <p className="text-xs text-[#6B7280] text-center sm:text-left max-w-xs leading-relaxed">
                Menyimpan data akan secara otomatis memperbarui estimasi risiko dan rekomendasi Anda.
              </p>
            )}

            <div className="flex items-center gap-3">
              {step === 3 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="text-[15px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Lewati
                </button>
              )}

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="min-w-[130px] h-[46px] px-7 rounded-full font-semibold text-[15px] bg-[#0D5F3F] hover:bg-[#0B4F34] text-white shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="min-w-[160px] h-[46px] px-7 rounded-full font-semibold text-[15px] bg-[#0D5F3F] hover:bg-[#0B4F34] text-white shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Analisis</span>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

