"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Activity,
  TrendingUp,
  Heart,
  Info,
  ChevronRight,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeatureDetail {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  shortDesc: string;
  sheetDesc: string;
  sections: {
    heading: string;
    text: string;
    pillOptions?: string[];
  }[];
}

const interactiveItems: FeatureDetail[] = [
  {
    id: "risk-estimation",
    icon: Shield,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Estimasi Risiko",
    shortDesc: "Gambaran risiko kesehatan Anda.",
    sheetDesc: "Melihat gambaran risiko kesehatan berdasarkan kondisi dan lifestyle Anda.",
    sections: [
      {
        heading: "Diabetes",
        text: "Estimasi risiko diabetes berdasarkan data Anda.",
      },
      {
        heading: "Hipertensi",
        text: "Estimasi risiko hipertensi berdasarkan data Anda.",
      },
      {
        heading: "Kardiovaskular",
        text: "Estimasi risiko kardiovaskular berdasarkan data Anda.",
      },
      {
        heading: "Faktor yang berpengaruh",
        text: "HELIORA membantu menjelaskan faktor yang berkontribusi terhadap hasil.",
      },
    ],
  },
  {
    id: "health-lifestyle-score",
    icon: Activity,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Skor Kesehatan dan Gaya hidup",
    shortDesc: "Ringkasan kondisi kesehatan dan gaya hidup.",
    sheetDesc: "Melihat gambaran kondisi kesehatan dan gaya hidup Anda.",
    sections: [
      {
        heading: "Health Score",
        text: "Indikator yang merangkum kondisi kesehatan berdasarkan data yang digunakan HELIORA.",
      },
      {
        heading: "Lifestyle Score",
        text: "Indikator yang menggambarkan kualitas lifestyle berdasarkan parameter yang digunakan.",
      },
      {
        heading: "Lebih dari sekadar angka",
        text: "Setiap score dirancang agar dapat dipahami dan dijelaskan berdasarkan kondisi Anda.",
      },
    ],
  },
  {
    id: "future-simulation",
    icon: TrendingUp,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    title: "Simulasi Masa Depan",
    shortDesc: "Eksplorasi dampak perubahan lifestyle.",
    sheetDesc: "Lihat kemungkinan perubahan kondisi Anda berdasarkan lifestyle saat ini.",
    sections: [
      {
        heading: "Pilih rentang waktu",
        pillOptions: ["30 hari", "90 hari", "180 hari"],
        text: "HELIORA akan membandingkan kondisi saat ini dengan hasil simulasi berdasarkan asumsi lifestyle yang digunakan.",
      },
      {
        heading: "Coba berbagai kemungkinan",
        text: "Anda nantinya dapat mengeksplorasi perubahan lifestyle dan melihat bagaimana hasil estimasi dapat berubah.",
      },
      {
        heading: "Simulation",
        text: "Hasil merupakan proyeksi berbasis model, bukan prediksi medis yang pasti.",
      },
    ],
  },
  {
    id: "preventive-recommendation",
    icon: Heart,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    title: "Rekomendasi Preventif",
    shortDesc: "Hal yang dapat Anda prioritaskan.",
    sheetDesc: "Temukan hal yang dapat Anda prioritaskan.",
    sections: [
      {
        heading: "Berdasarkan kondisi Anda",
        text: "Rekomendasi disusun berdasarkan kondisi dan faktor lifestyle yang relevan.",
      },
      {
        heading: "Prioritas, bukan daftar panjang",
        text: "HELIORA menampilkan rekomendasi yang paling relevan terlebih dahulu agar Anda dapat fokus pada hal yang penting.",
      },
      {
        heading: "Pahami alasannya",
        text: "Setiap rekomendasi dapat dijelaskan dan ditelusuri ke evidence yang mendukungnya.",
      },
    ],
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [hasConsented, setHasConsented] = useState(false);
  const [activeSheetItem, setActiveSheetItem] = useState<FeatureDetail | null>(null);
  const [selectedSimTime, setSelectedSimTime] = useState("90 hari");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verify authentication on mount
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      const token = await apiClient.getAccessToken();
      if (!token && isMounted) {
        router.replace("/login?redirect=/onboarding/consent");
      }
    }
    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Lock body scroll when detail sheet is open
  useEffect(() => {
    if (activeSheetItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeSheetItem]);

  // Keyboard accessibility for closing sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeSheetItem) {
        setActiveSheetItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSheetItem]);

  const handleContinue = async () => {
    if (!hasConsented || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await apiClient.getAccessToken();
      if (accessToken) {
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
          <div className="mb-12 sm:mb-14">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight text-[#111827] leading-[1.12] mb-4">
              Mari lihat lebih dekat.
            </h1>
            <p className="text-lg sm:text-[20px] text-[#6B7280] font-normal leading-[1.55] max-w-[620px]">
              Beberapa informasi tentang keseharian Anda dapat membantu memberikan gambaran yang lebih lengkap.
            </p>
          </div>

          {/* Integrated Grouped List Section */}
          <div className="mb-10">
            <h2 className="text-[17px] sm:text-[19px] font-semibold tracking-tight text-[#111827] mb-3">
              Yang akan Anda lihat
            </h2>

            {/* Native Apple-style grouped rows as interactive buttons */}
            <div className="divide-y divide-[#F0F2F1] border-t border-b border-[#F0F2F1]">
              {interactiveItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSheetItem(item)}
                    className="w-full text-left py-5 sm:py-5.5 flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] transition-colors hover:bg-neutral-50/40 px-1 cursor-pointer"
                    aria-label={`Lihat detail ${item.title}`}
                  >
                    <div className="flex items-center gap-4.5 sm:gap-5">
                      <Icon className="w-5.5 h-5.5 text-[#111827] shrink-0 stroke-[1.8]" />
                      <h3 className="text-[16px] sm:text-[17px] font-semibold text-[#111827] leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Informational Disclaimer */}
          <div className="flex items-start gap-2.5 text-[#6B7280] mb-8">
            <Info className="w-4 h-4 text-[#9CA3AF] shrink-0 mt-0.5" />
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#6B7280]">
              Hasil asesmen merupakan estimasi dan simulasi, bukan diagnosis medis.
            </p>
          </div>

          {/* Prominent Consent Action */}
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
            className="flex items-start gap-3.5 pt-2 pb-3 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D5F3F] rounded-lg"
          >
            <div
              className={`w-5.5 h-5.5 rounded-full border-[1.8px] flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
                hasConsented
                  ? "bg-[#0D5F3F] border-[#0D5F3F] text-white shadow-xs"
                  : "border-[#9CA3AF] bg-white group-hover:border-[#4B5563]"
              }`}
            >
              {hasConsented && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <div className="space-y-1">
              <p className="text-[16px] sm:text-[17px] font-semibold text-[#111827] leading-snug">
                Saya memahami dan menyetujui penggunaan data saya.
              </p>
              <p className="text-[13.5px] sm:text-[14px] text-[#6B7280] leading-relaxed">
                Data Anda digunakan untuk kebutuhan assessment dan simulasi kesehatan.
              </p>
            </div>
          </div>

          {error && (
            <Alert className="mt-5 bg-red-50 border border-red-200 text-red-900 rounded-2xl py-3 px-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <AlertDescription className="text-xs text-red-900 font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation Action */}
          <div className="flex items-center justify-between gap-4 pt-12 sm:pt-16 mt-4">
            <Link
              href="/"
              className="text-[15px] sm:text-[16px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              Kembali
            </Link>

            <Button
              onClick={handleContinue}
              disabled={!hasConsented || isLoading}
              className={`min-w-[144px] h-[48px] px-8 rounded-full font-semibold text-[15.5px] transition-all duration-200 flex items-center justify-center gap-2 ${
                hasConsented && !isLoading
                  ? "bg-[#0D5F3F] hover:bg-[#0B4F34] text-white shadow-md shadow-[#0D5F3F]/15 active:scale-[0.99] cursor-pointer"
                  : "bg-[#E2E8E4] hover:bg-[#E2E8E4] text-[#63756C] cursor-not-allowed shadow-none"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.main>
      </div>

      {/* Apple-style Interactive Bottom Sheet / Modal */}
      <AnimatePresence>
        {activeSheetItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Dimmed backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveSheetItem(null)}
              className="fixed inset-0 bg-black/35 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* Sheet container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-title"
              initial={{ y: "100%", opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-[28px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl z-10 flex flex-col"
            >
              {/* Drag handle for mobile */}
              <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-5 sm:hidden" />

              {/* Sheet Header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={`w-11 h-11 rounded-2xl ${activeSheetItem.iconBg} ${activeSheetItem.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <activeSheetItem.icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div>
                  <h3
                    id="sheet-title"
                    className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight"
                  >
                    {activeSheetItem.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#6B7280] mt-1 leading-relaxed">
                    {activeSheetItem.sheetDesc}
                  </p>
                </div>
              </div>

              {/* Sheet Body Sections */}
              <div className="space-y-4 my-2 divide-y divide-neutral-100 border-t border-neutral-100 pt-4">
                {activeSheetItem.sections.map((sec, idx) => (
                  <div key={idx} className={idx === 0 ? "pb-3" : "pt-4 pb-3"}>
                    <h4 className="text-[15px] font-semibold text-[#111827]">
                      {sec.heading}
                    </h4>
                    {sec.pillOptions && (
                      <div className="flex items-center gap-2 mt-2.5 mb-2.5">
                        {sec.pillOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedSimTime(opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              selectedSimTime === opt
                                ? "bg-[#0D5F3F] text-white shadow-xs"
                                : "bg-neutral-100 text-[#4B5563] hover:bg-neutral-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs sm:text-[13.5px] text-[#6B7280] mt-1 leading-relaxed">
                      {sec.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom Sheet CTA */}
              <div className="pt-6 mt-4 border-t border-neutral-100">
                <Button
                  onClick={() => setActiveSheetItem(null)}
                  className="w-full h-11 rounded-full bg-[#0D5F3F] hover:bg-[#09472E] text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Mengerti
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



