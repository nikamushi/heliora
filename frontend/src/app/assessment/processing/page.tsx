"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentProcessingPage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-700 mb-6"></div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Menganalisis profil-mu</h2>
      <p className="text-neutral-600 text-center max-w-sm">
        Menghitung estimasi risiko kesehatan berbasis profil gaya hidup kamu...
      </p>
    </div>
  );
}
