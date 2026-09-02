"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ConsentPage() {
  const router = useRouter();
  const [hasConsented, setHasConsented] = useState(false);

  const handleContinue = () => {
    if (hasConsented) {
      router.push("/onboarding/health-profile");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-neutral-900">Sebelum memulai...</CardTitle>
          <p className="text-neutral-600 mt-2">
            HELIORA akan menggunakan data lifestyle-mu untuk:
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="list-disc pl-5 space-y-2 text-neutral-700">
            <li>Estimasi risiko kesehatan</li>
            <li>Health & Lifestyle Score</li>
            <li>Simulasi (Future Health & What-if)</li>
            <li>Rekomendasi preventif</li>
          </ul>

          <Alert variant="warning">
            <AlertTitle className="flex items-center gap-2">
              <span className="text-xl">⚠️</span> Disclaimer Medis
            </AlertTitle>
            <AlertDescription className="mt-2 text-sm text-amber-900">
              HELIORA adalah alat bantu analisis prediktif berbasis profil risiko gaya hidup. 
              Hasil yang diberikan bukan merupakan diagnosis medis, anjuran pengobatan, 
              atau pengganti konsultasi dengan profesional kesehatan. Selalu konsultasikan 
              kondisi medis Anda ke dokter.
            </AlertDescription>
          </Alert>

          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-700 focus:ring-primary-700"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
            />
            <span className="text-sm font-medium text-neutral-800">
              Saya memahami dan menyetujui penggunaan data sesuai penjelasan di atas
            </span>
          </label>
        </CardContent>
        <CardFooter className="flex justify-end pt-4">
          <Button 
            onClick={handleContinue} 
            disabled={!hasConsented}
            size="lg"
            className="w-full sm:w-auto"
          >
            Lanjut ke Health Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
