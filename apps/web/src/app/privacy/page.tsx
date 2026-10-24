"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

interface SectionItem {
  id: string;
  title: string;
}

const SECTIONS: SectionItem[] = [
  { id: "dasar-hukum", title: "1. Dasar Hukum dan Ruang Lingkup" },
  { id: "data-yang-dikumpulkan", title: "2. Data yang Dikumpulkan" },
  { id: "tujuan-penggunaan", title: "3. Tujuan Penggunaan Data" },
  { id: "keamanan-enkripsi", title: "4. Keamanan dan Enkripsi Data" },
  { id: "masa-simpan", title: "5. Masa Simpan Data" },
  { id: "hak-subjek-data", title: "6. Hak Subjek Data Pribadi" },
  { id: "layanan-ai", title: "7. Layanan AI dan Pemrosesan Data" },
  { id: "penarikan-dan-penghapusan", title: "8. Penarikan Persetujuan & Hapus Akun" },
  { id: "batasan-usia", title: "9. Batasan Usia Pengguna" },
  { id: "perubahan-kebijakan", title: "10. Perubahan Kebijakan Privasi" },
  { id: "kontak-dpo", title: "11. Kontak Pejabat Pelindungan Data" },
];

const DATA_ROWS = [
  {
    category: "Akun",
    details: "Nama lengkap dan alamat email",
    status: "Wajib",
    purpose: "Identifikasi akun dan pengiriman tautan pemulihan kata sandi",
  },
  {
    category: "Fisik",
    details: "Usia, jenis kelamin biologis, tinggi badan, dan berat badan",
    status: "Wajib",
    purpose: "Menghitung indeks massa tubuh dan dasar estimasi risiko",
  },
  {
    category: "Gaya Hidup",
    details: "Durasi tidur harian, waktu aktivitas fisik mingguan, dan kebiasaan merokok",
    status: "Wajib",
    purpose: "Menilai pengaruh kebiasaan terhadap skor gaya hidup dan risiko kesehatan",
  },
  {
    category: "Riwayat Keluarga",
    details: "Riwayat diabetes, hipertensi, atau penyakit jantung pada keluarga inti",
    status: "Opsional",
    purpose: "Menyesuaikan faktor risiko dari riwayat kesehatan keluarga",
  },
  {
    category: "Biomarker",
    details: "Tekanan darah, gula darah puasa, dan kolesterol total",
    status: "Opsional",
    purpose: "Meningkatkan akurasi estimasi jika Anda memilih mengisinya",
  },
  {
    category: "Teknis",
    details: "Alamat IP yang disamarkan, jenis peramban, dan log waktu masuk",
    status: "Otomatis",
    purpose: "Keamanan sesi dan pencegahan akses tanpa izin",
  },
];

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState<string>("dasar-hukum");

  useEffect(() => {
    const handleScroll = () => {
      // Check if user is scrolled near the bottom of the page (helps short terminal sections)
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;

      if (isAtBottom) {
        setActiveId(SECTIONS[SECTIONS.length - 1].id);
        return;
      }

      const scrollPosition = window.scrollY + 140;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveId(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col selection:bg-brand-200">
      <PublicHeader />

      <main className="flex-1 w-full">
        {/* Header Section */}
        <div className="border-b border-neutral-200 bg-white print:border-b-0 print:pb-2">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-3 print:py-2 print:px-0">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Kebijakan Privasi
            </h1>
            <p className="max-w-[68ch] text-sm sm:text-[15px] leading-relaxed text-neutral-600 print:max-w-none">
              Kebijakan ini menjelaskan bagaimana HELIORA mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan kesehatan preventif kami, serta hak-hak yang Anda miliki berdasarkan Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022).
            </p>
            <div className="pt-1 text-xs text-neutral-500">
              Berlaku sejak 22 Oktober 2026 · Versi 1.2
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 print:py-4 print:px-0">
          {/* Mobile Table of Contents (Collapsible Disclosure) - Hidden on print */}
          <details className="lg:hidden mb-8 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs print:hidden">
            <summary className="font-semibold text-neutral-800 cursor-pointer select-none">
              Daftar Isi Kebijakan
            </summary>
            <nav className="mt-3 flex flex-col space-y-2 pl-1 border-t border-neutral-200/60 pt-2.5" aria-label="Daftar isi ringkas">
              {SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="text-neutral-600 hover:text-brand-900 hover:underline underline-offset-2 py-0.5"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </details>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start print:block">
            {/* Desktop Sticky Table of Contents - Hidden on print */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-3 print:hidden">
              <span className="text-xs font-semibold text-neutral-900 block pb-1 border-b border-neutral-200">
                Daftar Isi
              </span>
              <nav className="flex flex-col space-y-1 text-xs" aria-label="Daftar isi lengkap">
                {SECTIONS.map((sec) => {
                  const isActive = activeId === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      aria-current={isActive ? "location" : undefined}
                      className={`block py-1 pr-2 leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 ${
                        isActive
                          ? "font-semibold text-brand-900 border-l-2 border-brand-900 pl-2.5"
                          : "text-neutral-500 hover:text-neutral-900 pl-3 border-l-2 border-transparent"
                      }`}
                    >
                      {sec.title}
                    </a>
                  );
                })}
              </nav>
            </aside>

            {/* Reading Content Column: Constrained to ~68ch for optimal line-length */}
            <div className="lg:col-span-8 max-w-[68ch] space-y-12 legal-content print:col-span-12 print:max-w-none print:space-y-6">
              {/* Plain-Language Summary Box */}
              <section
                aria-label="Ringkasan Kebijakan"
                className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-5 sm:p-6 space-y-2.5 text-sm text-neutral-700 leading-relaxed print:bg-white print:border print:p-4"
              >
                <h2 className="text-sm font-semibold text-neutral-900">
                  Ringkasan
                </h2>
                <ul className="list-disc pl-4 space-y-1.5 text-xs sm:text-sm text-neutral-600">
                  <li>
                    Kami hanya mengumpulkan{" "}
                    <a
                      href="#data-yang-dikumpulkan"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      data yang diperlukan
                    </a>{" "}
                    untuk memperkirakan skor risiko kesehatan Anda.
                  </li>
                  <li>
                    Kami tidak menjual atau membagikan data Anda kepada pihak ketiga untuk{" "}
                    <a
                      href="#tujuan-penggunaan"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      tujuan iklan atau komersial
                    </a>
                    .
                  </li>
                  <li>
                    Data Anda{" "}
                    <a
                      href="#keamanan-enkripsi"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      dienkripsi saat dikirim dan saat disimpan
                    </a>
                    .
                  </li>
                  <li>
                    Anda dapat menarik persetujuan atau{" "}
                    <a
                      href="#penarikan-dan-penghapusan"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      menghapus akun beserta data Anda
                    </a>{" "}
                    kapan saja (kecuali catatan persetujuan, lihat Bagian 5).
                  </li>
                </ul>
              </section>

              {/* 1. Dasar Hukum dan Ruang Lingkup */}
              <section id="dasar-hukum" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  1. Dasar Hukum dan Ruang Lingkup
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Kebijakan Privasi ini disusun sebagai bentuk kepatuhan terhadap Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Pengendali Data Pribadi untuk platform ini adalah <strong>Team Parental Advisory Explicit Content</strong> (alamat lengkap tercantum pada Bagian 11). Kami menetapkan tujuan dan mengawasi jalannya pemrosesan data pribadi Anda. Kami memproses data kesehatan Anda berdasarkan persetujuan eksplisit yang Anda berikan saat mendaftar dan menyelesaikan proses orientasi (<em>onboarding</em>). Kebijakan ini berlaku bagi seluruh pengguna yang mengakses atau mendaftar di situs web dan aplikasi HELIORA.
                </p>
              </section>

              {/* 2. Data yang Dikumpulkan */}
              <section id="data-yang-dikumpulkan" className="scroll-mt-24 space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  2. Data yang Dikumpulkan
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Kami membatasi pengumpulan data hanya pada parameter yang memiliki kegunaan langsung untuk menghasilkan estimasi risiko atau rekomendasi gaya hidup. Data yang dikumpulkan terbagi dalam kategori berikut:
                </p>

                {/* Desktop Balanced Table */}
                <div className="hidden sm:block overflow-hidden rounded-xl border border-neutral-200">
                  <table className="w-full text-left text-xs sm:text-sm text-neutral-700 table-fixed">
                    <thead className="bg-neutral-50 text-neutral-900 font-semibold border-b border-neutral-200">
                      <tr>
                        <th scope="col" className="w-[18%] px-3.5 py-2.5">Kategori</th>
                        <th scope="col" className="w-[32%] px-3.5 py-2.5">Rincian Data</th>
                        <th scope="col" className="w-[16%] px-3.5 py-2.5">Status</th>
                        <th scope="col" className="w-[34%] px-3.5 py-2.5">Tujuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/80">
                      {DATA_ROWS.map((row) => (
                        <tr key={row.category} className="print:break-inside-avoid">
                          <td className="px-3.5 py-2.5 font-medium text-neutral-900 align-top">{row.category}</td>
                          <td className="px-3.5 py-2.5 text-neutral-700 align-top leading-relaxed">{row.details}</td>
                          <td className="px-3.5 py-2.5 text-neutral-600 align-top">{row.status}</td>
                          <td className="px-3.5 py-2.5 text-neutral-600 align-top leading-relaxed">{row.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Blocks (No Horizontal Scroll) */}
                <div className="sm:hidden space-y-3">
                  {DATA_ROWS.map((row) => (
                    <div
                      key={row.category}
                      className="rounded-lg border border-neutral-200 p-3 space-y-1.5 text-xs bg-neutral-50/40"
                    >
                      <div className="flex items-center justify-between border-b border-neutral-200/60 pb-1">
                        <span className="font-semibold text-neutral-900">{row.category}</span>
                        <span className="text-[11px] font-medium text-neutral-500 bg-white border border-neutral-200 rounded px-1.5 py-0.5">
                          {row.status}
                        </span>
                      </div>
                      <p className="text-neutral-700">
                        <span className="text-neutral-500 block text-[11px]">Rincian:</span>
                        {row.details}
                      </p>
                      <p className="text-neutral-600">
                        <span className="text-neutral-500 block text-[11px]">Tujuan:</span>
                        {row.purpose}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
                  <strong>Data yang tidak kami kumpulkan:</strong> Kami tidak meminta atau mengumpulkan nomor rekening bank, kartu kredit, lokasi GPS langsung perangkat Anda, maupun salinan rekam medis rumah sakit.
                </p>
              </section>

              {/* 3. Tujuan Penggunaan Data */}
              <section id="tujuan-penggunaan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  3. Tujuan Penggunaan Data
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Data yang Anda berikan digunakan secara terbatas untuk:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-[15px] text-neutral-700">
                  <li>Menghitung perkiraan risiko kesehatan preventif terkait diabetes tipe 2, hipertensi, dan penyakit kardiovaskular berdasarkan perbandingan statistik populasi.</li>
                  <li>Menghasilkan skor kesehatan dan skor gaya hidup sebagai panduan evaluasi kebiasaan pribadi.</li>
                  <li>Menampilkan faktor gaya hidup yang paling memengaruhi hasil estimasi kesehatan Anda.</li>
                  <li>Menjalankan simulasi interaktif yang memungkinkan Anda melihat dampak perubahan kebiasaan tidur, aktivitas fisik, atau berat badan terhadap risiko kesehatan.</li>
                  <li>Menampilkan panduan edukasi dan rekomendasi gaya hidup yang bersumber dari pedoman medis resmi.</li>
                  <li>Menjaga keamanan akun dan mencegah akses tanpa izin ke data Anda.</li>
                </ul>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700 font-medium pt-1">
                  HELIORA tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga untuk kepentingan komersial, periklanan, atau penilaian kelayakan, premi, maupun klaim asuransi.
                </p>
              </section>

              {/* 4. Keamanan dan Enkripsi Data */}
              <section id="keamanan-enkripsi" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  4. Keamanan dan Enkripsi Data
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Kami melindungi kerahasiaan data kesehatan Anda melalui langkah-langkah keamanan teknis:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-[15px] text-neutral-700">
                  <li>
                    <strong>Pengiriman Data:</strong> Seluruh komunikasi antara peramban Anda dan server dienkripsi menggunakan protokol TLS 1.3 melalui koneksi HTTPS.
                  </li>
                  <li>
                    <strong>Penyimpanan Data:</strong> Basis data operasional disimpan dalam lingkungan terenkripsi dengan standar enkripsi AES-256.
                  </li>
                  <li>
                    <strong>Kata Sandi:</strong> Kata sandi Anda dilindungi dengan metode pengacakan kriptografi satu arah sehingga tidak dapat dibaca oleh staf kami.
                  </li>
                </ul>
              </section>

              {/* 5. Masa Simpan Data */}
              <section id="masa-simpan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  5. Masa Simpan Data
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Data profil dan riwayat skor kesehatan Anda disimpan selama akun Anda berstatus aktif agar Anda dapat memantau perkembangan gaya hidup dari waktu ke waktu.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Catatan persetujuan (waktu saat Anda menyetujui atau mencabut persetujuan pemrosesan data) disimpan selama akun aktif dan dipertahankan hingga 5 (lima) tahun sejak penarikan persetujuan atau penutupan akun berdasarkan kebijakan retensi internal kami untuk keperluan dokumentasi kepatuhan dan pembuktian hukum. Salinan cadangan teknis sistem diperbarui secara berkala dan otomatis terhapus dalam siklus retensi maksimal 30 hari.
                </p>
              </section>

              {/* 6. Hak Subjek Data Pribadi */}
              <section id="hak-subjek-data" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  6. Hak Subjek Data Pribadi
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Berdasarkan Bab IV Undang-Undang Pelindungan Data Pribadi, Anda memiliki hak-hak berikut:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-[15px] text-neutral-700">
                  <li>
                    <strong>Hak atas Informasi:</strong> Mengetahui kejelasan identitas pengendali, dasar hukum pemrosesan, dan tujuan penggunaan data Anda.
                  </li>
                  <li>
                    <strong>Hak atas Akses dan Portabilitas:</strong> Melihat data kesehatan yang tersimpan di dasbor akun Anda serta meminta salinan data pribadi dalam format elektronik terstruktur.
                  </li>
                  <li>
                    <strong>Hak Memperbaiki Data:</strong> Memperbarui atau melengkapi informasi fisik dan kebiasaan gaya hidup Anda melalui menu{" "}
                    <Link
                      href="/dashboard/profile"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      Profil Kesehatan
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Hak Menarik Persetujuan:</strong> Menarik kembali persetujuan pemrosesan data kesehatan kapan saja melalui menu{" "}
                    <Link
                      href="/dashboard/settings/consent"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      Pengaturan &rarr; Privasi &amp; Persetujuan
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Hak Menghapus Data:</strong> Mengajukan penghapusan akun dan seluruh data profil kesehatan Anda melalui menu{" "}
                    <Link
                      href="/dashboard/settings/delete-account"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      Pengaturan &rarr; Hapus Akun
                    </Link>
                    .
                  </li>
                  <li>
                    <strong>Hak Menolak Keputusan Otomatis:</strong> Mengajukan keberatan atas penilaian atau pemodelan risiko yang dibuat sepenuhnya oleh sistem algoritma.
                  </li>
                  <li>
                    <strong>Hak Menunda atau Membatasi Pemrosesan:</strong> Meminta penundaan pemrosesan data apabila terdapat ketidakakuratan data yang sedang dalam proses verifikasi.
                  </li>
                </ul>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
                  Untuk hak yang belum dapat dijalankan secara langsung di aplikasi (seperti menolak keputusan otomatis, meminta portabilitas data, atau menunda pemrosesan), Anda dapat mengajukan permohonan tertulis kepada Pejabat Pelindungan Data kami melalui{" "}
                  <a
                    href="mailto:dpo@heliora.id"
                    className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                  >
                    dpo@heliora.id
                  </a>
                  .
                </p>
              </section>

              {/* 7. Layanan AI dan Pemrosesan Data */}
              <section id="layanan-ai" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  7. Layanan AI dan Pemrosesan Data
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Untuk menyajikan narasi penjelasan yang mudah dipahami, kami memanfaatkan layanan AI Google Gemini.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Data yang dikirimkan hanya berupa ringkasan parameter gaya hidup dan nilai skor risiko tanpa menyertakan nama lengkap, alamat email, atau pengenal pribadi langsung lainnya.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Infrastruktur basis data kami dihosting melalui penyedia infrastruktur komputasi awan Supabase dan Amazon Web Services di Korea Selatan. Untuk pemrosesan narasi penjelasan risiko, data dikirimkan ke layanan AI Google Gemini yang diproses di fasilitas pusat data Google secara global.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Penyimpanan data di Korea Selatan maupun pemrosesan narasi melalui layanan Google merupakan transfer data pribadi ke luar wilayah Indonesia. Seluruh transfer data lintas batas ini dilakukan sesuai mekanisme transfer data pribadi yang diatur dalam Pasal 56 UU PDP, serta dilindungi oleh perjanjian pemrosesan data perusahaan yang mengikat dan melarang penggunaan data Anda untuk melatih model kecerdasan buatan mereka.
                </p>
              </section>

              {/* 8. Penarikan Persetujuan & Hapus Akun */}
              <section id="penarikan-dan-penghapusan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  8. Penarikan Persetujuan &amp; Hapus Akun
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Anda memiliki kendali mandiri untuk mengelola persetujuan atau menutup akun Anda langsung dari dalam aplikasi:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm sm:text-[15px] text-neutral-700">
                  <li>
                    <strong>Menarik Persetujuan:</strong> Buka menu{" "}
                    <Link
                      href="/dashboard/settings/consent"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      Pengaturan &rarr; Privasi &amp; Persetujuan
                    </Link>
                    , lalu pilih opsi penarikan persetujuan. Setelah persetujuan ditarik, sistem akan menghentikan pemrosesan analisis risiko baru pada data Anda.
                  </li>
                  <li>
                    <strong>Menghapus Akun:</strong> Buka menu{" "}
                    <Link
                      href="/dashboard/settings/delete-account"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      Pengaturan &rarr; Hapus Akun
                    </Link>
                    , lalu lakukan konfirmasi penghapusan. Saat akun dihapus, profil kesehatan, riwayat skor, dan catatan simulasi Anda akan langsung terhapus dari sistem operasional kami. Salinan cadangan ikut terhapus dalam 30 hari; catatan persetujuan disimpan terpisah (lihat Bagian 5).
                  </li>
                </ul>
              </section>

              {/* 9. Batasan Usia Pengguna */}
              <section id="batasan-usia" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  9. Batasan Usia Pengguna
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Layanan HELIORA hanya ditujukan bagi pengguna yang berusia 18 tahun ke atas. Sistem kami tidak menerima pendaftaran dari individu di bawah usia 18 tahun.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Jika kami menemukan akun yang didaftarkan oleh individu di bawah usia 18 tahun, kami akan segera menghapus akun beserta seluruh data terkait dari sistem kami.
                </p>
              </section>

              {/* 10. Perubahan Kebijakan Privasi */}
              <section id="perubahan-kebijakan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  10. Perubahan Kebijakan Privasi
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk menyesuaikan dengan perkembangan layanan atau perubahan ketentuan hukum.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Jika terdapat perubahan mendasar pada cara kami mengelola data pribadi Anda, kami akan menyampaikan pemberitahuan minimal 14 hari kalender sebelum perubahan tersebut mulai berlaku melalui pengumuman di aplikasi atau email terdaftar. Apabila diwajibkan oleh ketentuan hukum yang berlaku, kami akan meminta persetujuan ulang kepada Anda.
                </p>
              </section>

              {/* 11. Kontak Pejabat Pelindungan Data */}
              <section id="kontak-dpo" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  11. Kontak Pejabat Pelindungan Data
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau bermaksud menggunakan hak-hak pelindungan data Anda, silakan hubungi Pejabat Pelindungan Data kami:
                </p>
                <div className="pt-1 space-y-1.5 text-sm text-neutral-700">
                  <p>
                    <strong>Email:&nbsp;</strong>
                    <a
                      href="mailto:dpo@heliora.id"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      dpo@heliora.id
                    </a>
                  </p>
                  <p className="text-xs text-neutral-500">
                    Waktu tanggapan resmi: maksimal 3×24 jam sejak permintaan terverifikasi diterima.
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Alamat Pengendali: Team Parental Advisory Explicit Content, Jl. Ir. H. Juanda No. 15, Sidodadi, Kec. Samarinda Ulu, Kota Samarinda, Kalimantan Timur 75124.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
