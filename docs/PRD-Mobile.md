# HELIORA Mobile

# Product Requirements Document (PRD): Aplikasi Mobile Android

---

# 1. Document Control

## 1.1 Informasi Dokumen

| Atribut        | Nilai                                                        |
| -------------- | ------------------------------------------------------------ |
| Judul          | HELIORA Mobile: Product Requirements Document                |
| Produk         | HELIORA Mobile (bagian dari keluarga produk HELIORA)         |
| Platform       | Android (Flutter)                                            |
| Versi          | 0.2 (Draf)                                                   |
| Status         | Draf, menunggu review Product & Project Manager              |
| Tanggal        | 7 Oktober 2026                                               |
| Disusun oleh   | Tim Frontend & DevOps                                        |
| Penanggung jawab persetujuan | Angga (Product & Project Manager)              |
| Task terkait   | MOB-001 (`docs/TASK.md`)                                     |

## 1.2 Kedudukan Dokumen

Dokumen ini turunan dari `docs/PRD.md` v1.1 dan hanya mengatur aplikasi mobile. Semua requirement, business rule, dan batas keselamatan medis di `PRD.md` tetap berlaku untuk mobile kecuali dokumen ini menyatakan lain.

`PRD.md` §20.24 mencantumkan *mobile application* sebagai Future Reference yang tidak menjadi dependency MVP. Dokumen ini mengusulkan memasukkan sebagian aplikasi mobile ke MVP kompetisi. Sesuai `docs/TASK.md` §31 (Scope Protection), usulan ini baru berlaku setelah disetujui Product & Project Manager. Sebelum persetujuan itu, pekerjaan mobile boleh dikerjakan di branch tetapi tidak di-merge ke `main`.

Urutan sumber kebenaran mengikuti `TASK.md` §1.2. Jika dokumen ini bertentangan dengan `PRD.md`, `Design.md`, atau `Architecture.md`, dokumen-dokumen itu yang berlaku sampai konflik diselesaikan lewat revisi resmi.

## 1.3 Dokumen Terkait

| Dokumen | Kegunaan untuk mobile |
| --- | --- |
| `docs/PRD.md` | Requirement fungsional (FR), business rule (BR), batas keselamatan medis |
| `docs/Design.md` | Token visual, larangan pill chip, teks disclaimer statutori, aturan glass |
| `docs/Architecture.md` | Arsitektur sistem dan kontrak backend |
| `docs/Monorepo.md` | Aturan workspace; akan ditambah ekosistem Flutter/pub |
| `docs/TASK.md` | Task ID (prefix baru `MOB-xxx`), status, dan acceptance criteria |
| `docs/ADR/ADR-011-authentication-strategy.md` | Supabase Auth sebagai identity provider dan verifikasi JWKS |
| Figma: [HELIORA-DESIGN-SYSTEM](https://www.figma.com/design/R408dzWNX8wDmyUwxMtE95/HELIORA-DESIGN-SYSTEM?node-id=70-2), halaman *Mobile (MVP)* | Desain layar dan komponen mobile MVP (halaman *Mobile (Draf)* disimpan sebagai riwayat) |

## 1.4 Riwayat Versi

| Versi | Tanggal | Penyusun | Perubahan |
| --- | --- | --- | --- |
| 0.1 | 5 Oktober 2026 | Tim Frontend & DevOps | Draf awal untuk review PM |
| 0.2 | 7 Oktober 2026 | Tim Frontend & DevOps | Tambah MFR-012 (splash dan peluncuran pertama); logo final konsep A; desain Figma *Mobile (MVP)* menggantikan draf; pemotongan splash masuk batas potong; pertanyaan terbuka diperbarui |

## 1.5 Persetujuan

| Peran | Nama | Status | Tanggal |
| --- | --- | --- | --- |
| Product & Project Manager | Angga | Menunggu | |
| Backend & AI | Gilang & Aksal | Menunggu | |
| Frontend & DevOps | Pino & Tumir | Menunggu | |

---

# 2. Ringkasan

HELIORA Mobile adalah aplikasi Android yang membawa alur inti HELIORA ke ponsel: mendaftar, memberi persetujuan, mengisi asesmen gaya hidup, melihat estimasi risiko, mencoba simulasi what-if, dan mengelola akun serta privasi.

Aplikasi ini memakai backend FastAPI, proyek Supabase Auth, dan design system yang sama dengan web. Satu akun berlaku di kedua platform. Mobile tidak menambah atau mengubah endpoint API.

Prinsip produk tidak berubah: HELIORA memberi estimasi berbasis gaya hidup untuk pencegahan, bukan diagnosis medis.

> Know Your Health. Shape Your Future.

---

# 3. Latar Belakang dan Alasan

1. `Design.md` §9 menetapkan desain *mobile-first* karena persona utama adalah masyarakat umum, bukan hanya pengguna desktop. Web responsif sudah ada, tetapi aplikasi Android memberi akses langsung dari layar utama ponsel.
2. Identitas merek HELIORA dirancang sebagai keluarga produk (Heliora Web, Heliora Mobile, Heliora API, dan seterusnya). Aplikasi mobile menunjukkan rencana itu dalam demo kompetisi.
3. Backend HELIORA sudah memakai kontrak terbuka: OpenAPI di `/api/v1/openapi.json` dan verifikasi JWT Supabase lewat JWKS. Aplikasi mobile menguji bahwa kontrak itu bisa melayani lebih dari satu klien tanpa perubahan backend.

**Kendala yang diterima dengan sadar:**

- Periode pengembangan berakhir 24 Oktober 2026. Saat dokumen ini ditulis, sisa waktunya sekitar 19 hari.
- Tim Frontend & DevOps juga memegang QA, deployment, dan perbaikan web di Sprint 9 dan 10.
- Karena itu cakupan MVP mobile dibatasi pada layar di §6, dan §14 memuat batas potong (*cut line*) jika jadwal tergelincir.

---

# 4. Tujuan dan Non-Tujuan

## 4.1 Tujuan MVP

| ID | Tujuan | Ukuran keberhasilan |
| --- | --- | --- |
| G1 | Pengguna baru menyelesaikan Register, Consent, Asesmen, sampai Beranda dari ponsel tanpa membuka web | Alur berjalan di perangkat Android fisik tanpa blocker |
| G2 | Pengguna mencoba simulasi what-if dan melihat estimasi berubah | Respons simulasi di bawah 1 detik sejauh environment memungkinkan (target `TASK.md` SIM-004) |
| G3 | Satu akun dipakai di web dan mobile | Data asesmen yang dibuat di mobile tampil di web, dan sebaliknya |
| G4 | Mobile mengikuti batas keselamatan medis yang sama dengan web | Disclaimer statutori tampil kata per kata di Consent, Beranda, dan What-if |
| G5 | Mobile masuk monorepo dengan pemeriksaan otomatis | `pnpm lint` dan `pnpm test` dari root ikut memeriksa mobile; APK rilis dibangun oleh CI |

## 4.2 Non-Tujuan MVP

Hal berikut sengaja tidak dikerjakan di MVP mobile:

- build dan rilis iOS;
- Rekomendasi dan Evidence Center (draf Figma Rekomendasi sudah ada, implementasi ditunda);
- Future Health Simulation (proyeksi horison 30/90/180 hari);
- riwayat asesmen dan simulasi;
- penjelasan LLM;
- notifikasi push dan pengingat;
- mode offline;
- tata letak tablet dan orientasi landscape;
- bahasa selain Indonesia;
- perubahan endpoint atau skema API backend;
- distribusi lewat Google Play Store.

---

# 5. Pengguna dan Skenario

Target pengguna mengikuti `PRD.md` §3.12. Skenario utama mobile:

| Kode | Skenario |
| --- | --- |
| S1 | Pengguna baru mengunduh APK, mendaftar, memberi persetujuan, mengisi profil gaya hidup, lalu melihat estimasi risiko pertamanya. |
| S2 | Pengguna yang sudah mendaftar di web masuk di ponsel dan langsung melihat hasil asesmen terakhirnya. |
| S3 | Pengguna menggeser jam tidur dan menit olahraga di What-if untuk melihat arah estimasi risiko, tanpa mengubah profil aslinya. |
| S4 | Pengguna memperbarui profil kesehatan atau mencabut persetujuan dari halaman Profil. |

---

# 6. Cakupan MVP

| Layar | Fungsi | Endpoint / layanan | Desain Figma mobile | Prioritas |
| --- | --- | --- | --- | --- |
| Splash | Layar pembuka berisi animasi logo, sambil memulihkan sesi dan memeriksa status persetujuan | Supabase (pemulihan sesi), `GET /consent/status`, `GET /assessment/latest` | Ada (*Mobile (MVP)*, baris splash) | Should Have |
| Register | Membuat akun dengan email dan kata sandi | Supabase Auth `signUp`, lalu `GET /auth/me` | Ada (*Mobile (MVP)*) | Must Have |
| Login | Masuk dengan email atau Google | Supabase Auth (email, OAuth Google) | Ada | Must Have |
| Consent | Persetujuan pemrosesan data dan disclaimer medis | `GET /consent/status`, `POST /consent` | Ada (*Mobile (MVP)*) | Must Have |
| Asesmen | Form profil kesehatan dan proses analisis | `POST/PUT /health-profile`, `POST /assessment` | Ada (*Mobile (MVP)*, tiga tahap, proses, dan gagal) | Must Have |
| Beranda | Skor dan estimasi risiko terakhir | `GET /assessment/latest` | Ada | Must Have |
| What-if | Simulasi perubahan kebiasaan | `POST /simulation/what-if` | Ada | Must Have |
| Profil | Identitas, profil kesehatan, cabut persetujuan, keluar | `GET /auth/me`, `GET /health-profile`, `POST /consent/revoke` | Ada | Must Have |

Navigasi bawah MVP berisi tiga tab: **Beranda, Simulasi, Profil**. Tab Rekomendasi (ada di draf lama) tidak ada di desain MVP sampai fiturnya masuk.

Metode HTTP pada tabel mengikuti kontrak di `/api/v1/openapi.json`. Jika kontrak berbeda, kontrak OpenAPI yang berlaku.

---

# 7. Alur Pengguna

```text
Buka aplikasi (cold start)
   │
   ▼
Splash (animasi sekitar 1 detik, sambil memulihkan sesi)
   │
   ├─ Belum ada sesi, instal pertama ──► Register ◄──► Login
   ├─ Belum ada sesi, sudah pernah ────► Login ◄──► Register
   │                                          │  Register atau Login berhasil
   │                                          ▼
   └─ Sesi aktif ────────────► Cek GET /consent/status
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
       has_active_consent = false                  has_active_consent = true
                 │                                           │
                 ▼                                           ▼
              Consent ──────────────► Cek GET /assessment/latest
                                                 │
                         ┌───────────────────────┴───────────────┐
                         ▼                                       ▼
                 Belum ada asesmen                        Asesmen tersedia
                         │                                       │
                         ▼                                       ▼
                     Asesmen ─────────────────────────────► Beranda
                                                                 │
                                         ┌───────────────────────┼───────────────┐
                                         ▼                       ▼               ▼
                                      Beranda                 Simulasi         Profil
                                    (tab bawah)             (What-if)
```

Aturan perutean mengikuti logika *consent-aware routing* di web (`Design.md` §5.3). Pengguna yang mencabut persetujuan melihat status netral "Analisis dihentikan sesuai permintaanmu" dan tombol untuk memberi persetujuan ulang (`Design.md` §8).

Untuk pengguna tanpa sesi, tujuan awal bergantung pada penanda lokal peluncuran pertama (MFR-012): Register pada peluncuran pertama setelah instal, Login pada peluncuran berikutnya. Aturan perutean lainnya tidak berubah.

---

# 8. Kebutuhan Fungsional

ID memakai prefix `MFR` (Mobile Functional Requirement). Kolom "Ref web" menunjuk requirement di `PRD.md` yang menjadi dasarnya.

### MFR-001 — Registrasi Akun

**Priority:** Must Have · **Ref web:** FR-001

#### Input

- Nama lengkap (wajib, minimal 2 karakter);
- Email (wajib, format valid);
- Kata sandi (wajib, minimal 8 karakter) dengan indikator kekuatan 4 tingkat;
- Konfirmasi kata sandi (harus sama);
- Centang persetujuan Ketentuan Layanan dan Kebijakan Privasi (wajib).

#### Process

1. Aplikasi memvalidasi input dan menampilkan pesan error di field terkait.
2. Aplikasi mendaftarkan akun lewat Supabase Auth.
3. Aplikasi memanggil `GET /auth/me` untuk memastikan akun tercatat di backend.

#### Output

Pengguna masuk dengan sesi aktif dan diarahkan ke Consent.

---

### MFR-002 — Login dengan Email

**Priority:** Must Have · **Ref web:** FR-002

#### Input

- Email;
- Kata sandi, dengan tombol tampilkan/sembunyikan.

#### Process

1. Aplikasi mengautentikasi kredensial lewat Supabase Auth.
2. Jika gagal, aplikasi menampilkan pesan generik "Gagal masuk. Pastikan email dan kata sandi Anda benar." (`Design.md` §5.3) supaya keberadaan email tidak bocor.

#### Output

Pengguna diarahkan sesuai aturan perutean §7.

---

### MFR-003 — Login dengan Google

**Priority:** Must Have · **Ref web:** FR-002, FE-012

#### Process

1. Aplikasi membuka alur OAuth Google milik Supabase di browser sistem.
2. Supabase mengembalikan pengguna ke aplikasi lewat deep link `id.heliora.app://login-callback`.
3. Akun baru dibuat otomatis jika pengguna belum terdaftar.

#### Acceptance Condition

Login Google berhasil di perangkat Android fisik, dan pengguna baru diarahkan ke Consent.

---

### MFR-004 — Sesi dan Logout

**Priority:** Must Have · **Ref web:** FR-003

- Sesi bertahan setelah aplikasi ditutup dan diperbarui otomatis sebelum kedaluwarsa.
- Setiap permintaan API membawa header `Authorization: Bearer <access_token>` dari sesi Supabase.
- Respons `401` mengakhiri sesi lokal dan mengarahkan pengguna ke Login.
- Logout tersedia di Profil dan menghapus sesi lokal.

---

### MFR-005 — Consent dan Disclaimer Medis

**Priority:** Must Have · **Ref web:** FR-004, FR-005, BR-CONSENT-001, BR-CONSENT-002

- Layar menampilkan ringkasan pemakaian data (estimasi risiko, Health & Lifestyle Score, simulasi, rekomendasi preventif).
- Layar menampilkan disclaimer statutori kata per kata dari `Design.md` §2.6 di atas permukaan solid.
- Tombol lanjut nonaktif sampai kotak persetujuan dicentang.
- Persetujuan dikirim ke `POST /consent` dengan versi persetujuan yang sama dengan web (`consent_version: "1.0"`, `Design.md` §6.1).

#### Acceptance Condition

Pengguna tidak bisa membuka Asesmen, Beranda, atau Simulasi sebelum persetujuan tercatat. Backend juga menolak permintaan tersebut dengan `403` jika persetujuan belum ada.

---

### MFR-006 — Input Profil Kesehatan

**Priority:** Must Have · **Ref web:** FR-006, FR-007, FR-008, BE-003

#### Input

Usia, jenis kelamin, tinggi badan, berat badan, aktivitas fisik, durasi tidur, status merokok, dan riwayat keluarga (field wajib sesuai `TASK.md` BE-003).

#### Process

1. Aplikasi memvalidasi setiap field dan menampilkan error di field terkait (FR-041).
2. Aplikasi menampilkan IMT yang dihitung dari tinggi dan berat badan.
3. Aplikasi menyimpan profil lewat endpoint `/health-profile`.

#### Output

Profil tersimpan dan aplikasi lanjut ke proses asesmen (MFR-007).

---

### MFR-007 — Proses Asesmen

**Priority:** Must Have · **Ref web:** BE-004, FR-042

- Aplikasi memanggil `POST /assessment` dan menampilkan status proses.
- Jika analisis gagal, aplikasi menampilkan "Analisis sedang tidak tersedia, coba lagi" dengan tombol ulangi (`Design.md` §8) dan tidak pernah menampilkan skor palsu.
- Jika berhasil, aplikasi membuka Beranda.

---

### MFR-008 — Beranda

**Priority:** Must Have · **Ref web:** FR-033, FR-034

- Menampilkan Health Score dan Lifestyle Score dengan interpretasi bahasa awam; angka tidak pernah tampil sendirian (`Design.md` §2.5).
- Menampilkan estimasi risiko diabetes, hipertensi, dan kardiovaskular. Setiap kartu memuat persentase estimasi, status teks dengan ikon (Lower, Moderate, Higher), bar proporsional, dan tren.
- Menampilkan tautan ke Simulasi.
- Menampilkan disclaimer statutori.
- Jika belum ada asesmen, menampilkan ajakan "Mulai asesmen", bukan kartu kosong.
- Jika persetujuan dicabut, menampilkan status "Analisis dihentikan sesuai permintaanmu" dan tombol persetujuan ulang.

---

### MFR-009 — Simulasi What-if

**Priority:** Must Have · **Ref web:** FR-020 sampai FR-023, BR-WHATIF-001 sampai 006, BR-SIM-007

#### Input

Parameter yang bisa diubah mengikuti `TASK.md` SIM-003: durasi tidur, aktivitas fisik, berat badan, dan status merokok.

#### Process

1. Setiap slider menampilkan nilai pasti, nilai saat ini dari profil, dan batas minimum serta maksimum.
2. Aplikasi mengirim skenario ke `POST /simulation/what-if`.
3. Aplikasi menampilkan estimasi awal dan hasil simulasi per penyakit, beserta arah perubahan dalam teks (turun, naik, tetap).

#### Acceptance Condition

- Profil asli tidak berubah setelah simulasi (BR-SIM-007).
- Tombol "Atur ulang" mengembalikan semua parameter ke nilai profil.
- Disclaimer statutori tampil di layar ini.
- Hasil disebut proyeksi atau estimasi, bukan kepastian.

---

### MFR-010 — Profil dan Privasi

**Priority:** Must Have · **Ref web:** FR-039, FR-040, BR-CONSENT-003

- Menampilkan nama dan email dari `GET /auth/me`.
- Menampilkan ringkasan profil kesehatan dan tombol untuk memperbaruinya (membuka form MFR-006 dengan data terisi).
- Menampilkan status persetujuan aktif beserta tanggalnya.
- Menyediakan "Cabut persetujuan" dengan dialog konfirmasi sebelum memanggil `POST /consent/revoke`.
- Menyediakan "Keluar" (MFR-004).

"Unduh data saya" dan "Hapus akun" tidak masuk MVP karena `Design.md` §7.10 masih menandainya sebagai usulan tanpa FR.

---

### MFR-011 — Error dan Status Kosong

**Priority:** Must Have · **Ref web:** FR-041, FR-042, FR-043

| Kondisi | Perilaku |
| --- | --- |
| Input tidak valid | Pesan di field terkait, tanpa dialog generik |
| Tidak ada koneksi atau timeout | Pesan yang menjelaskan masalah koneksi dan tombol ulangi |
| `401` | Sesi diakhiri, pengguna kembali ke Login |
| `403` karena persetujuan belum ada | Pengguna diarahkan ke Consent |
| `5xx` atau analisis gagal | Pesan "Analisis sedang tidak tersedia, coba lagi" dan tombol ulangi |

---

### MFR-012 — Splash dan Peluncuran Pertama

**Priority:** Should Have · **Ref web:** tidak ada padanan (`Design.md` tidak mengatur layar pembuka)

#### Splash

- Tampil hanya saat cold start. Tidak tampil saat aplikasi kembali dari latar atau setelah logout.
- Latar hijau merek dengan tanda HELIORA putih (logo konsep A) dan wordmark HELIORA. Tanpa tagline.
- Splash sistem Android hanya berupa latar hijau (ikon splash transparan). Tanda digambar oleh animasi di Flutter supaya tidak tampil dua kali.
- Animasi sekitar 1 detik: kaki belakang tergambar dari bawah, kaki depan menimpa dengan celah, lalu wordmark memudar masuk.
- Selama animasi, aplikasi memulihkan sesi Supabase dan memeriksa `GET /consent/status` serta `GET /assessment/latest` sesuai §7. Animasi selalu tuntas dan tidak ada jeda buatan, lalu cross-fade 200 ms ke layar tujuan.
- Bila data belum siap setelah animasi, tanda berdenyut halus (opasitas 100% ke 70%, 900 ms) sampai maksimal 3 detik. Lewat 3 detik, tampil pesan koneksi dan tombol "Coba lagi" di atas latar yang sama (MFR-011).
- Pengaturan Android "kurangi animasi" dihormati: tanda dan wordmark tampil langsung tanpa denyut, dengan fade 150 ms ke layar tujuan.
- Pembaca layar mengumumkan "HELIORA" satu kali. Tidak ada suara, getar, atau teks "memuat".

#### Tujuan pengguna tanpa sesi

- Peluncuran pertama setelah instal (penanda lokal belum ada): Register. Peluncuran berikutnya: Login.
- Penanda disimpan lokal dan tidak berisi data pribadi atau kesehatan. Penanda diset saat pengguna membuka Login, atau menyelesaikan Register atau Login. Penanda hilang saat aplikasi dihapus.
- Register pada peluncuran pertama tidak punya tombol kembali. Tombol "Masuk" ada di bar atas supaya pengguna yang sudah mendaftar di web tidak terjebak di form daftar.

#### Acceptance Condition

- Animasi selesai dalam waktu kurang dari 1,2 detik, dan tidak ada jeda tambahan bila data sudah siap.
- Pengguna dengan sesi aktif tidak melihat Login atau Register.
- Bagian "Tujuan pengguna tanpa sesi" tetap berlaku bila animasi dipotong sesuai §14.

---

# 9. Aturan Bisnis dan Keselamatan

Aturan dari `PRD.md` dan `Design.md` berikut berlaku penuh di mobile:

- **Persetujuan wajib** sebelum data kesehatan diproses (BR-CONSENT-001) dan bisa dicabut kapan saja (BR-CONSENT-003).
- **Simulasi tidak mengubah data permanen** (BR-SIM-007).
- **Tidak ada pernyataan diagnosis.** Copy tidak boleh menyatakan pengguna "memiliki penyakit X" (FR-037).
- **Disclaimer statutori** tampil kata per kata dari `Design.md` §2.6, selalu di permukaan solid, di Consent, Beranda, dan What-if. Lokasi keempat di web (Rekomendasi) belum ada di MVP mobile.
- **Terminologi** memakai "estimasi risiko", bukan "probabilitas" atau "peluang mutlak" (`Design.md` §2.4).
- **Status tidak hanya bergantung warna.** Setiap status memakai teks dan ikon (`Design.md` §9).
- **Tanpa pill chip, oval badge, atau dot dekoratif** (`AGENTS.md`, `Design.md` §2.4).
- **Tanpa citra alat medis** seperti stetoskop, jarum suntik, atau palang merah (`Design.md` §5.1).

---

# 10. Kebutuhan Non-Fungsional

| Area | Requirement |
| --- | --- |
| Platform | Android ponsel, orientasi portrait, lebar acuan 360 dp. Versi Android minimum diusulkan Android 8.0 (API 26) dan dikonfirmasi di MOB-002 sesuai versi Flutter yang dikunci. |
| Performa | Respons What-if di bawah 1 detik (`TASK.md` SIM-004). Respons layar lain di bawah 3 detik (`TASK.md` QA-003). Keduanya sejauh environment memungkinkan. |
| Keamanan | Komunikasi ke API produksi lewat HTTPS. Token sesi disimpan di penyimpanan terenkripsi perangkat. Data kesehatan tidak disimpan permanen di perangkat. Keystore rilis dan kunci rahasia tidak masuk repository. |
| Aksesibilitas | Area sentuh minimal 48 dp. Kontras teks memenuhi WCAG AA (`Design.md` §9). Elemen interaktif punya label untuk TalkBack. Teks tidak terpotong saat ukuran huruf sistem diperbesar. |
| Tampilan | Mode terang wajib. Mode gelap yang mengikuti pengaturan sistem bersifat Should Have; token Light dan Dark sudah tersedia di design system. |
| Animasi | Animasi mengikuti pengaturan "kurangi animasi" Android. Tidak ada animasi yang wajib untuk menyelesaikan alur. Splash menahan layar maksimal 3 detik sebelum pesan koneksi muncul. |
| Bahasa | Bahasa Indonesia. |
| Konsistensi visual | Warna, tipografi (Plus Jakarta Sans, JetBrains Mono), spacing, dan radius mengikuti variabel design system di Figma dengan nama yang sama. |

---

# 11. Keputusan Teknis

Ringkasan keputusan yang sudah disepakati. Detail arsitektur akan dicatat di ADR-012 dan spesifikasi desain teknis.

| Topik | Keputusan |
| --- | --- |
| Lokasi kode | `apps/mobile/` di monorepo yang sama |
| Orkestrasi | `apps/mobile/package.json` berisi script saja (tanpa dependency npm) sehingga Turborepo menjalankan `lint`, `test`, dan `build` mobile bersama web dan API. Dependency Dart diurus pub. |
| Versi Flutter | Dikunci dengan FVM (`apps/mobile/.fvmrc`) |
| Arsitektur aplikasi | Riverpod untuk state dan dependency, go_router untuk navigasi dan redirect berbasis sesi serta persetujuan |
| Client API | Di-generate dari `/api/v1/openapi.json` dengan `swagger_parser`. Hasilnya di-commit dan diregenerasi dengan satu script saat API berubah. |
| Autentikasi | `supabase_flutter` ke proyek Supabase yang sama dengan web. Backend tetap memverifikasi JWT lewat JWKS (ADR-011). |
| Token desain | `apps/mobile/lib/theme/tokens.dart` disalin manual dari variabel Figma dengan nama yang sama. Sumber token tunggal untuk web dan mobile dibahas setelah MVP. |
| Identitas aplikasi | Application ID dan skema deep link `id.heliora.app` |
| Splash | Splash sistem Android berupa latar hijau dengan ikon transparan (Android 12 ke atas) dan `windowBackground` hijau (Android 8 sampai 11). Animasi digambar di Flutter dengan `CustomPainter` dan `AnimationController`, tanpa paket Lottie atau Rive. |
| Aset logo | Logo final konsep A (Helix-H). SVG datar di `apps/mobile/assets/brand/` (`heliora-mark.svg`, `heliora-mark-white.svg`, `heliora-mark-mono.svg`). Ikon aplikasi memakai ikon adaptif: latar hijau merek, tanda putih, dan lapisan monokrom. |
| Penanda peluncuran pertama | Satu nilai boolean di penyimpanan lokal biasa. Bukan penyimpanan terenkripsi karena tidak memuat data pribadi. |
| CI | GitHub Actions: `flutter analyze` dan `flutter test` di setiap pull request, build APK rilis sebagai artifact di `main`. Kunci signing disimpan di GitHub Secrets. |
| Task ID | Prefix baru `MOB-xxx` di `TASK.md` §3.3 |

**Batas antar aplikasi:** `apps/mobile` tidak meng-import kode dari `apps/web` atau `apps/api`. Satu-satunya sambungan adalah kontrak HTTP (OpenAPI) dan Supabase Auth.

---

# 12. Desain dan Aset

- Desain mobile MVP ada di halaman *Mobile (MVP)* file Figma (dibuat 7 Oktober 2026): 31 layar penuh, storyboard animasi splash, dan tiga kartu dokumentasi (aturan perutean, aturan waktu splash, catatan keputusan). Isinya lima baris: splash dan peluncuran pertama, masuk dan daftar, persetujuan dan asesmen, beranda, simulasi, dan profil, serta status sistem. Mode gelap tersedia untuk lima layar utama. Halaman *Mobile (Draf)* tetap ada sebagai riwayat.
- Komponen mobile baru, semuanya terikat ke variabel design system: navigasi bawah 3 tab, InlineAlert, ChoiceOption, StepBar, StateBlock, BmiIndicator, Dialog, FormField, Checkbox mobile, dan AppBar Auth.
- Frame Register, Consent, dan Asesmen yang semula direncanakan di MOB-004 sudah ada. MOB-004 tinggal menerapkannya ke Flutter.
- Navigasi bawah MVP memakai tiga tab. Tab Rekomendasi tidak ada di desain.
- Logo final adalah konsep A (Helix-H), diputuskan 7 Oktober 2026. Konsep B dan C sudah dihapus dari halaman *Logo Exploration*. Aset datar, ikon adaptif Android, dan spesifikasi splash sistem ada di bagian "Aset final" halaman itu. Berkas SVG-nya ada di `apps/mobile/assets/brand/`.
- Komponen Logo di design system sudah diganti ke konsep A, sehingga layar web di Figma ikut berubah. Kode web masih memakai ikon `IconHeartbeat` dan perlu diganti terpisah.

---

# 13. Ketergantungan dan Prasyarat

| Ketergantungan | Pemilik | Catatan |
| --- | --- | --- |
| Persetujuan memasukkan mobile ke MVP | Angga | Wajib sebelum merge ke `main` (`TASK.md` §31) |
| URL redirect `id.heliora.app://login-callback` di Supabase | Pemegang akses admin proyek Supabase | Dibutuhkan MFR-003 |
| Backend yang bisa dijangkau dari ponsel | Gilang & Aksal, Pino & Tumir | APK demo tidak bisa memakai `localhost`. Pilihannya backend yang di-deploy (DEV-002) atau backend di jaringan lokal yang sama saat demo. |
| Instalasi backend dari nol | Gilang & Aksal | `uv sync` di `main` saat ini gagal karena `uv.lock` menarik `llvmlite 0.36.0` yang tidak mendukung Python 3.12. Perlu diperbaiki agar pengembang mobile bisa menjalankan backend lokal. |
| Toolchain pengembang mobile | Masing-masing pengembang | Android Studio (SDK dan emulator), JDK 17 bawaan Android Studio, dan FVM |
| Desain Figma Register, Consent, Asesmen, dan splash | Pino & Tumir | Selesai 7 Oktober 2026, menunggu review PM |
| Persetujuan tambahan untuk MFR-012 dan opsi "Daftar dengan Google" di Register | Angga | Lihat §17 no. 9 dan 10 |

---

# 14. Rencana Rilis

Jadwal di bawah mengasumsikan persetujuan PM paling lambat 7 Oktober 2026.

| Tanggal (Oktober 2026) | Task | Hasil |
| --- | --- | --- |
| 5–7 | MOB-001 | PRD ini, Feature Proposal ke PM, ADR-012, entri `TASK.md` |
| 6–8 | MOB-002 | `apps/mobile` berjalan, `pnpm lint` dan `pnpm test` mencakup mobile |
| 6–9 | MOB-008 (awal) | Workflow CI analyze dan test aktif |
| 7–10 | MOB-003 | Login email dan Google, client API hasil generate, konfigurasi environment |
| 8–10 | MOB-004 | Tema dari token, komponen dasar, ikon aplikasi dari logo final, splash sistem dan animasi (desain Figma sudah selesai) |
| 10–14 | MOB-005 | Register, Login, Consent, Asesmen |
| 13–16 | MOB-006 | Beranda dan What-if |
| 15–17 | MOB-007 | Profil, perbarui profil, cabut persetujuan, logout |
| 17–21 | QA | Pengujian alur penuh di perangkat fisik, perbaikan bug, APK rilis dari CI |
| 22–24 | Demo | Gladi demo dan pembekuan rilis |

**Batas potong (*cut line*) 15 Oktober 2026.** Jika MOB-005 belum selesai pada tanggal ini, cakupan dikurangi berurutan:

1. Animasi splash (MFR-012) dilepas; aplikasi tetap memakai splash sistem hijau tanpa animasi tanda. Aturan "Register pada peluncuran pertama" tetap berlaku.
2. Login Google ditunda; MVP memakai email dan kata sandi.
3. Register dipindah ke web; mobile hanya Login, sehingga peluncuran pertama langsung ke Login.
4. Asesmen dan Consent dipindah ke web; mobile menampilkan Beranda dan What-if untuk akun yang sudah selesai onboarding.

---

# 15. Kriteria Penerimaan MVP Mobile

MVP mobile dianggap siap demo jika semua poin berikut terpenuhi:

- Alur S1 sampai S4 (§5) berjalan di perangkat Android fisik tanpa blocker.
- Semua requirement Must Have di §8 lolos pengujian fungsional.
- Tidak ada crash selama tiga kali gladi demo berturut-turut.
- Jika MFR-012 dikerjakan: splash tampil saat cold start, animasi selesai dalam waktu kurang dari 1,2 detik, dan pengaturan "kurangi animasi" dihormati.
- Disclaimer statutori tampil kata per kata di Consent, Beranda, dan What-if.
- Asesmen yang dibuat di mobile tampil di web dengan akun yang sama.
- `pnpm lint` dan `pnpm test` dari root lolos, termasuk mobile.
- APK rilis dibangun oleh CI dari `main`.

---

# 16. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Sisa waktu sekitar 19 hari | Fitur tidak selesai sebelum demo | Batas potong 15 Oktober (§14); layar dikerjakan sesuai urutan alur |
| Tim yang sama memegang QA dan deployment web | QA web tertunda | Prioritas QA web tetap di atas mobile; disepakati bersama PM |
| PM tidak menyetujui masuk MVP | Mobile tidak ikut demo | Pekerjaan tetap di branch dan menjadi pekerjaan resmi pasca-kompetisi |
| Konfigurasi deep link OAuth gagal | Login Google tidak jalan | Login email tetap tersedia; Google masuk batas potong kedua |
| Backend tidak terjangkau dari ponsel saat demo | Aplikasi tidak bisa memuat data | Putuskan backend demo (deploy atau jaringan lokal) paling lambat 17 Oktober dan uji di perangkat |
| Instalasi backend lokal gagal (`uv.lock`) | Pengembang mobile tidak bisa menguji lokal | Perbaikan `uv.lock` oleh tim backend; sementara memakai workaround `.venv` |
| Draf Consent dan Asesmen mobile belum ada | Implementasi menunggu desain | Pola web dipakai langsung; draf dibuat paralel di MOB-004 |
| Logo di kode web belum diganti ke konsep A | Web dan mobile tampil berbeda saat demo | Ganti `IconHeartbeat` di web dengan SVG konsep A sebagai tugas FE terpisah |
| Pengguna yang sudah mendaftar di web memasang aplikasi dan masuk ke Register | Pengguna bingung atau membuat akun ganda | Tombol "Masuk" di bar atas Register peluncuran pertama; email yang sudah terdaftar menawarkan masuk |
| Splash sistem Android 12 ke atas menampilkan ikon, lalu animasi mengulang tanda | Tanda tampil dua kali | Ikon splash sistem dibuat transparan; hanya animasi Flutter yang menggambar tanda |
| Animasi menambah sekitar 1 detik di setiap cold start | Terasa lambat bagi pengguna lama | Batas 3 detik, tanpa jeda buatan, dan menjadi item pertama yang dipotong di §14 |

---

# 17. Pertanyaan Terbuka

1. Apakah PM menyetujui mobile masuk MVP, dan bagaimana prioritasnya terhadap QA web?
2. Apakah Rekomendasi memang ditunda dari MVP mobile?
3. Tombol "Jadikan target" di draf What-if belum punya FR. Apakah tombol ini dibuang dari MVP? Desain *Mobile (MVP)* sudah membuangnya dan menunggu persetujuan PM.
4. Draf What-if belum memuat status merokok, padahal `TASK.md` SIM-003 memasukkannya. Bentuk kontrolnya toggle atau pilihan? Desain *Mobile (MVP)* memakai pilihan tunggal vertikal dengan tiga opsi dan menunggu persetujuan PM.
5. Siapa yang memegang akses admin Supabase untuk menambah URL redirect?
6. Backend mana yang dipakai APK demo: hasil deploy DEV-002 atau backend di jaringan lokal?
7. Berapa versi Android minimum yang disepakati?
8. Konsep logo mana yang menjadi ikon aplikasi? Terjawab 7 Oktober 2026: konsep A (Helix-H).
9. Apakah Register mobile menyediakan "Daftar dengan Google" seperti `Design.md` §5.2? MFR-001 hanya menyebut email dan kata sandi, sedangkan desain *Mobile (MVP)* sudah memuat tombolnya.
10. Apakah MFR-012 (splash dan peluncuran pertama) disetujui sebagai Should Have, termasuk aturan Register pada peluncuran pertama setelah instal?
11. Aktivitas fisik di Asesmen memakai slider menit per minggu, bukan empat tingkat seperti `Design.md` §6.2. Apakah slider disetujui?
12. Kapan logo di kode web diganti ke konsep A: sprint ini atau setelah kompetisi?

---

# 18. Usulan Task

Usulan ini dicatat di `TASK.md` §18.12 dengan status menunggu persetujuan PM.

| ID | Judul | Owner | Priority |
| --- | --- | --- | --- |
| MOB-001 | Mobile PRD and Feature Proposal | Pino & Tumir | P0 |
| MOB-002 | Mobile Monorepo Foundation | Pino & Tumir | P0 |
| MOB-003 | Mobile Authentication and API Client | Pino & Tumir + Gilang & Aksal | P0 |
| MOB-004 | Mobile Theme and Base Components | Pino & Tumir | P0 |
| MOB-005 | Mobile Onboarding Screens | Pino & Tumir | P0 |
| MOB-006 | Mobile Home and What-if Simulation | Pino & Tumir | P0 |
| MOB-007 | Mobile Profile and Privacy | Pino & Tumir | P0 |
| MOB-008 | Mobile CI and Release | Pino & Tumir | P0 |

MOB-004 mencakup MFR-012 (splash) dan ikon aplikasi dari logo final. MOB-005 mencakup aturan Register pada peluncuran pertama.

---

# 19. Ketertelusuran

| MFR | Layar | Ref `PRD.md` / `TASK.md` | Endpoint |
| --- | --- | --- | --- |
| MFR-001 | Register | FR-001 | Supabase `signUp`, `GET /auth/me` |
| MFR-002 | Login | FR-002 | Supabase Auth |
| MFR-003 | Login | FR-002, FE-012 | Supabase OAuth |
| MFR-004 | Semua | FR-003 | Supabase Auth |
| MFR-005 | Consent | FR-004, FR-005, BR-CONSENT-001/002 | `/consent/status`, `/consent` |
| MFR-006 | Asesmen, Profil | FR-006, FR-007, FR-008, BE-003 | `/health-profile` |
| MFR-007 | Asesmen | BE-004, FR-042 | `/assessment` |
| MFR-008 | Beranda | FR-033, FR-034 | `/assessment/latest` |
| MFR-009 | What-if | FR-020 sampai FR-023, SIM-003, SIM-004, BR-SIM-007 | `/simulation/what-if` |
| MFR-010 | Profil | FR-039, FR-040, BR-CONSENT-003 | `/auth/me`, `/consent/revoke` |
| MFR-011 | Semua | FR-041, FR-042, FR-043 | Semua |
| MFR-012 | Splash, Register, Login | Tidak ada padanan di `PRD.md`; `Design.md` §5.3 untuk perutean | Supabase (pemulihan sesi), `/consent/status`, `/assessment/latest` |
