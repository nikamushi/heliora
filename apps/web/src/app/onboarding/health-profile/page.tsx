"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HealthProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 Data
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Step 2 Data
  const [activity, setActivity] = useState("");
  const [sleep, setSleep] = useState("");
  const [smoking, setSmoking] = useState("");

  // Step 3 Data (Optional)
  const [familyHistory, setFamilyHistory] = useState("");
  const [stress, setStress] = useState("");

  const bmi = useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return null;
  }, [height, weight]);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!age || !gender || !height || !weight) {
        setError("Harap isi semua data dasar.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!activity || !sleep || !smoking) {
        setError("Harap isi semua data gaya hidup.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    // TODO: Send data to backend
    setTimeout(() => {
      setIsLoading(false);
      router.push("/assessment/processing");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold text-neutral-900">Health Profile</CardTitle>
            <div className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
              Langkah {step} dari 3
            </div>
          </div>
          <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary-500 h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="mt-4">
          {error && (
            <Alert variant="danger" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b pb-2">Data Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Usia (Tahun)"
                  type="number"
                  placeholder="Contoh: 30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                />
                <div className="w-full flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-neutral-900">Jenis Kelamin</label>
                  <select
                    className="flex h-11 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <Input
                  label="Tinggi Badan (cm)"
                  type="number"
                  placeholder="Contoh: 170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="1"
                />
                <Input
                  label="Berat Badan (kg)"
                  type="number"
                  placeholder="Contoh: 65"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="1"
                />
              </div>
              {bmi && (
                <div className="mt-4 p-4 bg-primary-50 border border-primary-100 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-800">Indeks Massa Tubuh (BMI) Anda:</span>
                  <span className="text-lg font-bold text-primary-700">{bmi}</span>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 border-b pb-2">Gaya Hidup</h3>
              
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-900">Aktivitas Fisik</label>
                <select
                  className="flex h-11 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                >
                  <option value="">Pilih frekuensi</option>
                  <option value="sedentary">Jarang olahraga</option>
                  <option value="light">Ringan (1-2 kali/minggu)</option>
                  <option value="moderate">Sedang (3-4 kali/minggu)</option>
                  <option value="active">Aktif (5+ kali/minggu)</option>
                </select>
              </div>

              <Input
                label="Durasi Tidur Rata-rata (Jam/Hari)"
                type="number"
                placeholder="Contoh: 7"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                min="1"
                max="24"
              />

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-900">Status Merokok</label>
                <select
                  className="flex h-11 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  value={smoking}
                  onChange={(e) => setSmoking(e.target.value)}
                >
                  <option value="">Pilih status</option>
                  <option value="never">Tidak pernah</option>
                  <option value="former">Mantan perokok</option>
                  <option value="current">Perokok aktif</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b pb-2">
                <h3 className="text-lg font-semibold text-neutral-900">Riwayat Medis (Opsional)</h3>
                <span className="text-xs text-neutral-500 mb-1">Dapat dilewati</span>
              </div>
              
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-900">Riwayat Penyakit Keluarga</label>
                <select
                  className="flex h-11 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                >
                  <option value="">Tidak ada / Tidak tahu</option>
                  <option value="diabetes">Diabetes</option>
                  <option value="hypertension">Hipertensi</option>
                  <option value="heart_disease">Penyakit Jantung</option>
                </select>
              </div>

              <div className="w-full flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-900">Tingkat Stres</label>
                <select
                  className="flex h-11 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                  value={stress}
                  onChange={(e) => setStress(e.target.value)}
                >
                  <option value="">Pilih tingkat stres</option>
                  <option value="low">Rendah</option>
                  <option value="moderate">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>

              {/* Other optional fields can be added here */}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4 border-t">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack} disabled={isLoading}>
              Kembali
            </Button>
          ) : (
            <div></div> // empty div for flex spacing
          )}
          
          <div className="flex gap-2">
            {step === 3 && (
              <Button variant="secondary" onClick={() => handleSubmit()} disabled={isLoading}>
                Lewati
              </Button>
            )}
            
            {step < 3 ? (
              <Button onClick={handleNext}>Lanjut</Button>
            ) : (
              <Button onClick={() => handleSubmit()} disabled={isLoading}>
                {isLoading ? "Memproses..." : "Selesai & Analisis"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
