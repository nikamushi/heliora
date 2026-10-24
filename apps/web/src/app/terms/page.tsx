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
  { id: "disclaimer-medis", title: "1. Disclaimer Medis" },
  { id: "ruang-lingkup", title: "2. Ruang Lingkup Layanan" },
  { id: "syarat-usia", title: "3. Syarat Usia" },
  { id: "penggunaan-dilarang", title: "4. Penggunaan yang Dilarang" },
  { id: "keamanan-akun", title: "5. Keamanan Akun" },
  { id: "tentang-estimasi-ai", title: "6. Tentang Estimasi AI" },
  { id: "kekayaan-intelektual", title: "7. Hak Kekayaan Intelektual" },
  { id: "batasan-tanggung-jawab", title: "8. Batasan Tanggung Jawab" },
  { id: "penutupan-dan-penangguhan", title: "9. Penutupan dan Penangguhan Akun" },
  { id: "perubahan-ketentuan", title: "10. Perubahan Ketentuan" },
  { id: "hukum-dan-sengketa", title: "11. Hukum dan Sengketa" },
  { id: "kontak-bantuan", title: "12. Kontak dan Bantuan" },
];

export default function TermsPage() {
  const [activeId, setActiveId] = useState<string>("disclaimer-medis");

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
              Ketentuan Layanan
            </h1>
            <p className="max-w-[68ch] text-sm sm:text-[15px] leading-relaxed text-neutral-600 print:max-w-none">
              Ketentuan Layanan ini merupakan perjanjian yang mengikat antara Anda dan <strong>Team Parental Advisory Explicit Content</strong> (&ldquo;HELIORA&rdquo; atau &ldquo;kami&rdquo;). Ketentuan ini mengatur penggunaan umum platform. Persetujuan khusus atas pengumpulan dan pemrosesan data kesehatan Anda diatur dan dimintakan secara terpisah melalui persetujuan eksplisit saat pendaftaran akun.
            </p>
            <div className="pt-1 text-xs text-neutral-500">
              Berlaku sejak 22 Oktober 2026 · Versi 1.2
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 print:py-4 print:px-0">
          {/* Mobile Table of Contents - Hidden on print */}
          <details className="lg:hidden mb-8 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs print:hidden">
            <summary className="font-semibold text-neutral-800 cursor-pointer select-none">
              Daftar Isi Ketentuan
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
              {/* 1. Disclaimer Medis */}
              <section id="disclaimer-medis" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  1. Disclaimer Medis
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  HELIORA adalah alat bantu kesehatan preventif berbasis gaya hidup dan kecerdasan buatan. Hasil yang disajikan merupakan estimasi dan simulasi berdasarkan model populasi, bukan diagnosis medis dan bukan pengganti konsultasi langsung dengan dokter atau tenaga kesehatan profesional.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Layanan kami tidak melayani penanganan gawat darurat medis. Jika Anda mengalami kondisi darurat atau gejala akut seperti nyeri dada mendadak atau sesak napas berat, segera hubungi <strong>112 (darurat umum)</strong> atau <strong>119 (ambulans)</strong>, atau datangi Instalasi Gawat Darurat (IGD) rumah sakit terdekat.
                </p>
              </section>

              {/* 2. Ruang Lingkup Layanan */}
              <section id="ruang-lingkup" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  2. Ruang Lingkup Layanan
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  HELIORA menyediakan layanan evaluasi preventif mandiri yang mencakup:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-[15px] text-neutral-700">
                  <li>Estimasi risiko relatif terkait diabetes tipe 2, hipertensi, dan penyakit kardiovaskular berdasarkan perbandingan statistik kebiasaan hidup.</li>
                  <li>Informasi mengenai faktor gaya hidup yang paling memengaruhi hasil estimasi kesehatan Anda.</li>
                  <li>Simulasi interaktif untuk mengeksplorasi pengaruh perubahan kebiasaan sehari-hari terhadap perkiraan risiko kesehatan di masa depan.</li>
                  <li>Rekomendasi kebiasaan hidup sehat yang mengacu pada pedoman klinis kesehatan terpercaya.</li>
                </ul>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Penggunaan layanan ini tidak menciptakan hubungan hukum dokter-pasien antara Anda dan HELIORA.
                </p>
              </section>

              {/* 3. Syarat Usia */}
              <section id="syarat-usia" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  3. Syarat Usia
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Layanan ini hanya diperuntukkan bagi individu yang telah berusia minimal 18 tahun. Kami tidak menerima pendaftaran dari individu di bawah usia 18 tahun.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Dengan mendaftar, Anda menyatakan bahwa Anda telah berusia minimal 18 tahun dan bahwa informasi profil fisik serta kebiasaan gaya hidup yang Anda masukkan adalah data pribadi Anda yang benar dan akurat.
                </p>
              </section>

              {/* 4. Penggunaan yang Dilarang */}
              <section id="penggunaan-dilarang" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  4. Penggunaan yang Dilarang
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Dalam memanfaatkan platform HELIORA, Anda dilarang:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-[15px] text-neutral-700">
                  <li>Melakukan rekayasa balik (<em>reverse engineering</em>) atau dekompilasi terhadap perangkat lunak dan model algoritma layanan.</li>
                  <li>Memanfaatkan platform untuk penilaian kelayakan, premi, atau klaim asuransi komersial, maupun pengambilan keputusan diskriminatif dalam ketenagakerjaan.</li>
                  <li>Mengirim data palsu secara massal untuk membebani atau mengganggu kestabilan sistem.</li>
                  <li>Menyalin, menjual kembali, atau menyebarluaskan materi dan basis data platform tanpa izin tertulis dari HELIORA.</li>
                </ul>
              </section>

              {/* 5. Keamanan Akun */}
              <section id="keamanan-akun" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  5. Keamanan Akun
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Anda bertanggung jawab menjaga kerahasiaan kata sandi dan kredensial masuk akun Anda. Setiap aktivitas yang dilakukan menggunakan akun Anda berada di bawah tanggung jawab Anda, kecuali apabila timbul akibat kegagalan atau kelalaian sistem keamanan teknis kami.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Jika Anda menemukan indikasi akses tanpa izin pada akun Anda, segera hubungi{" "}
                  <a
                    href="mailto:autoruns18@gmail.com"
                    className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                  >
                    autoruns18@gmail.com
                  </a>
                  . HELIORA tidak pernah meminta kata sandi Anda melalui telepon, pesan singkat, maupun media sosial.
                </p>
              </section>

              {/* 6. Tentang Estimasi AI */}
              <section id="tentang-estimasi-ai" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  6. Tentang Estimasi AI
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Estimasi risiko dihitung berdasarkan perbandingan pola gaya hidup dengan data observasional populasi dan algoritma analitis.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Kategori skor yang ditampilkan menggambarkan posisi relatif terhadap pedoman pencegahan kesehatan, bukan ramalan mutlak bahwa Anda pasti akan atau tidak akan menderita penyakit kronis tertentu. Hasil simulasi interaktif adalah sarana visualisasi skenario hipotetis dan bukan jaminan hasil klinis di masa depan.
                </p>
              </section>

              {/* 7. Hak Kekayaan Intelektual */}
              <section id="kekayaan-intelektual" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  7. Hak Kekayaan Intelektual
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Seluruh merek dagang, desain antarmuka, arsitektur kode, basis data referensi bukti, dan algoritma pada platform HELIORA adalah hak milik eksklusif Team Parental Advisory Explicit Content yang dilindungi oleh undang-undang kekayaan intelektual Republik Indonesia.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Hak kekayaan intelektual atas platform ini tidak mencakup data pribadi Anda. Seluruh data kesehatan dan profil gaya hidup yang Anda masukkan tetap menjadi milik Anda dan dikelola sesuai dengan ketentuan pada{" "}
                  <Link
                    href="/privacy"
                    className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                  >
                    Kebijakan Privasi
                  </Link>
                  .
                </p>
              </section>

              {/* 8. Batasan Tanggung Jawab */}
              <section id="batasan-tanggung-jawab" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  8. Batasan Tanggung Jawab
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  HELIORA bertanggung jawab atas keandalan teknis sistem dan pelindungan data pribadi pengguna yang berada di bawah kendali langsung kami sesuai peraturan perundang-undangan yang berlaku.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Sejauh diizinkan oleh hukum, HELIORA tidak bertanggung jawab atas keputusan medis pribadi, kelalaian dalam mencari bantuan tenaga kesehatan berlisensi, atau kerugian yang timbul akibat kesalahan atau ketidakakuratan data profil yang dimasukkan oleh pengguna.
                </p>
              </section>

              {/* 9. Penutupan dan Penangguhan Akun */}
              <section id="penutupan-dan-penangguhan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  9. Penutupan dan Penangguhan Akun
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  <strong>Penutupan oleh Pengguna:</strong> Anda dapat menutup akun Anda kapan saja secara mandiri melalui menu{" "}
                  <Link
                    href="/dashboard/settings/delete-account"
                    className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                  >
                    Pengaturan &rarr; Hapus Akun
                  </Link>
                  . Penutupan akun akan menghapus profil kesehatan, riwayat skor, dan catatan simulasi Anda secara menyeluruh dari sistem operasional kami sesuai dengan{" "}
                  <Link
                    href="/privacy#penarikan-dan-penghapusan"
                    className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                  >
                    Kebijakan Privasi Bagian 8
                  </Link>
                  , dengan salinan cadangan teknis yang terhapus dalam waktu maksimal 30 hari.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  <strong>Penangguhan oleh HELIORA:</strong> HELIORA berhak menangguhkan atau menutup akses akun Anda apabila Anda terbukti melanggar ketentuan penggunaan pada Bagian 4 (seperti mengirimkan data palsu secara massal atau mencoba merekayasa balik sistem). Kami akan menyampaikan pemberitahuan tertulis melalui email terdaftar mengenai alasan penangguhan atau penutupan tersebut. Anda dapat mengajukan permohonan peninjauan atau keberatan tertulis melalui <a href="mailto:autoruns18@gmail.com" className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900">autoruns18@gmail.com</a> dalam waktu 14 hari kalender sejak pemberitahuan diterima. Data akun yang ditutup karena pelanggaran akan dibekukan dan dihapus dari sistem operasional dalam 30 hari kalender, kecuali apabila penyimpanan diperlukan untuk kepentingan penyelidikan hukum atau pemenuhan kewajiban regulasi yang sah.
                </p>
              </section>

              {/* 10. Perubahan Ketentuan */}
              <section id="perubahan-ketentuan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  10. Perubahan Ketentuan
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Kami dapat memperbarui Ketentuan Layanan ini dari waktu ke waktu. Jika terdapat perubahan yang bersifat material pada ketentuan penggunaan atau hak Anda, kami akan memberikan pemberitahuan minimal 14 hari kalender sebelum perubahan tersebut berlaku melalui pengumuman di aplikasi atau email terdaftar.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Jika Anda tidak menyetujui perubahan ketentuan tersebut, Anda berhak untuk menghentikan penggunaan layanan dan menutup akun Anda sebelum tanggal berlakunya ketentuan baru.
                </p>
              </section>

              {/* 11. Hukum dan Sengketa */}
              <section id="hukum-dan-sengketa" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  11. Hukum dan Sengketa
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Ketentuan Layanan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia.
                </p>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Setiap perselisihan yang berkaitan dengan pelaksanaan ketentuan ini akan diselesaikan terlebih dahulu melalui musyawarah mufakat dalam kurun waktu 30 hari kalender. Apabila penyelesaian musyawarah tidak tercapai, sengketa dapat diajukan melalui Badan Penyelesaian Sengketa Konsumen (BPSK) atau diselesaikan melalui Pengadilan Negeri Jakarta Selatan.
                </p>
              </section>

              {/* 12. Kontak dan Bantuan */}
              <section id="kontak-bantuan" className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                  12. Kontak dan Bantuan
                </h2>
                <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-700">
                  Jika Anda memiliki pertanyaan mengenai Ketentuan Layanan ini, silakan hubungi tim kami:
                </p>
                <div className="pt-1 space-y-1.5 text-sm text-neutral-700">
                  <p>
                    <strong>Dukungan Pengguna:&nbsp;</strong>
                    <a
                      href="mailto:autoruns18@gmail.com"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      autoruns18@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong>Korespondensi Hukum:&nbsp;</strong>
                    <a
                      href="mailto:autoruns18@gmail.com"
                      className="text-brand-900 underline underline-offset-4 decoration-brand-900/40 hover:decoration-brand-900"
                    >
                      autoruns18@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Alamat Kantor: Team Parental Advisory Explicit Content, Jl. Ir. H. Juanda No. 15, Sidodadi, Kec. Samarinda Ulu, Kota Samarinda, Kalimantan Timur 75124.
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
