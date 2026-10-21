# Data ML HELIORA (draf, dibuat 5 Okt 2026)

Berkas di sini adalah data publik dari CDC dan Kemenkes yang diunduh langsung dari sumber resmi lalu dirapikan menjadi CSV. Pemilik AI-001 belum memutuskan tahun dan variabel yang dipakai untuk training, jadi isi folder ini adalah bahan awal, bukan dataset final.

## Isi

| Berkas | Sumber | Baris | Isi |
|---|---|---|---|
| `brfss_2021.csv` ... `brfss_2025.csv` | CDC BRFSS (LLCP) | 438.693 / 445.132 / 433.323 / 457.670 / 356.158 | satu baris per responden dewasa, 22 kolom |
| `nhanes_2021_2023.csv` | CDC NHANES, siklus Agt 2021 sampai Agt 2023 | 8.153 | satu baris per dewasa (≥18), 32 kolom |
| `ski_2023_indicators.csv` | Kemenkes, laporan "SKI 2023 Dalam Angka" | 223 | indikator nasional per kelompok umur dan jenis kelamin, bukan microdata |

`brfss_*.csv` masuk `.gitignore` (22 sampai 28 MB per berkas, 132 MB total). Buat ulang dengan skrip di `scripts/`.

## Membuat ulang

Unduh ke `ai/datasets/raw/` (sudah di-gitignore) atau ke folder lain lewat `ML_RAW_DIR`:

```text
raw/brfss/LLCP{tahun}XPT.zip   https://www.cdc.gov/brfss/annual_data/{tahun}/files/LLCP{tahun}XPT.zip   (2021 sampai 2025, total sekitar 407 MB)
raw/nhanes/{FILE}.xpt          https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/{FILE}.xpt
                               FILE = DEMO_L BMX_L BPXO_L GLU_L GHB_L TCHOL_L HDL_L SMQ_L SLQ_L PAQ_L DIQ_L BPQ_L MCQ_L
raw/ski/ski_2023_dalam_angka_id.pdf   tautan "Indonesian version" di https://www.badankebijakan.kemkes.go.id/ski-2023-dalam-angka/
```

Jalankan dari root repo. `--no-project` mencegah uv mengubah `uv.lock`.

```bash
uv run --no-project --with pandas --with numpy python ai/datasets/scripts/build_brfss.py [tahun ...]
uv run --no-project --with pandas --with numpy python ai/datasets/scripts/build_nhanes.py
uv run --no-project --with pypdf python ai/datasets/scripts/extract_ski.py
```

Uji ulang pada 5 Okt 2026: `brfss_2025.csv` dan `ski_2023_indicators.csv` identik byte demi byte dengan hasil sebelumnya.

## Ketersediaan variabel BRFSS per tahun

Semua tahun memuat usia, jenis kelamin, tinggi, berat, BMI, merokok, olahraga ya/tidak, diabetes, serangan jantung, PJK/angina, stroke, dan bobot survei. Kolom lain berbeda per tahun. Kolom yang tidak ditanyakan pada suatu tahun tetap ada dan kosong.

| Kolom | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| `sleep_duration_hours` | kosong | ada | kosong | kosong | ada |
| `physical_activity_min_per_week`, `pa150_category` | kosong | kosong | ada | kosong | kosong |
| `bphigh_code`, `hypertension`, `high_cholesterol` | ada | kosong | ada | kosong | ada |

Tidak ada satu tahun pun yang memuat tidur, menit aktivitas, dan label hipertensi sekaligus.

## Kamus kolom BRFSS

| Kolom | Arti |
|---|---|
| `year`, `state_fips` | tahun survei; kode FIPS negara bagian (`_STATE`) |
| `age` | `_AGE80`, 18 sampai 80 (di atas 80 digabung jadi 80) |
| `sex` | 1 laki-laki, 2 perempuan (`SEXVAR`) |
| `height_cm`, `weight_kg`, `bmi` | dilaporkan sendiri (`HTM4`, `WTKG3`, `_BMI5`) |
| `smoking_status` | 0 tidak pernah, 1 mantan, 2 aktif (setiap hari atau kadang-kadang); sama dengan enum `never/former/current` dan kode di `model_training.py` |
| `sleep_duration_hours` | `SLEPTIM1`, 1 sampai 24; kode 77 dan 99 dikosongkan |
| `exercise_any_30d` | 1 ya, 0 tidak (`EXERANY2`): olahraga di luar pekerjaan dalam 30 hari terakhir |
| `physical_activity_min_per_week` | hanya 2023: `PAMIN13_` + `PAMIN23_` (dua aktivitas teratas); 0 bila responden tidak berolahraga; di atas 10.080 menit (satu minggu) dikosongkan |
| `pa150_category` | hanya 2023, `_PA150R4`: 1 ≥150 menit atau setara aktivitas berat, 2 antara 1 dan 149 menit, 3 nol menit |
| `diabetes_code` | `DIABETE4`: 1 ya, 2 ya hanya saat hamil, 3 tidak, 4 pradiabetes atau borderline |
| `diabetes` | 1 bila kode 1; 0 bila kode 2, 3, atau 4 |
| `bphigh_code` | `BPHIGH6`: 1 ya, 2 ya hanya saat hamil, 3 tidak, 4 borderline atau pre-hipertensi |
| `hypertension` | 1 bila kode 1; 0 bila kode 2, 3, atau 4 |
| `high_cholesterol` | 1 ya, 0 tidak (`TOLDHI3`) |
| `heart_attack`, `chd_angina`, `stroke` | 1 ya, 0 tidak (`CVDINFR4`, `CVDCRHD4`, `CVDSTRK3`) |
| `cardiovascular` | 1 bila salah satu dari tiga di atas 1; 0 bila ketiganya 0; kosong selain itu |
| `survey_weight` | `_LLCPWT`; wajib dipakai untuk menghitung prevalensi |

Sel kosong berarti tidak ditanyakan, tidak tahu, atau menolak menjawab.

## Kamus kolom NHANES

| Kolom | Arti |
|---|---|
| `seqn`, `age`, `sex` | ID responden; usia (80 berarti 80+); 1 laki-laki, 2 perempuan |
| `height_cm`, `weight_kg`, `bmi`, `waist_cm` | hasil pengukuran |
| `systolic_bp_mean`, `diastolic_bp_mean`, `bp_readings` | rata-rata bacaan tensimeter otomatis yang ada (1 sampai 3) dan jumlah bacaannya |
| `fasting_glucose_mg_dl` | hanya subsampel puasa (`weight_fasting` > 0), 3.063 baris. 266 peserta punya nilai glukosa tetapi bobot puasa 0, nilainya dikosongkan |
| `hba1c_pct`, `total_cholesterol_mg_dl`, `hdl_mg_dl` | hasil laboratorium |
| `smoking_status` | kode sama dengan BRFSS |
| `sleep_duration_hours` | rata-rata berbobot jam tidur hari kerja (5/7) dan akhir pekan (2/7) |
| `physical_activity_min_per_week` | aktivitas waktu luang sedang + berat: frekuensi × faktor satuan (hari 7, minggu 1, bulan 12/52, tahun 1/52) × menit per sesi. Aktivitas kerja dan transportasi tidak ada di siklus ini |
| `sedentary_min_per_day` | menit duduk pada hari biasa (`PAD680`) |
| `diabetes_code`, `diabetes` | `DIQ010`: 1 ya, 2 tidak, 3 borderline; `diabetes` = 1 hanya untuk kode 1 |
| `hypertension`, `bp_medication`, `high_cholesterol` | pernah diberi tahu dokter; obat tekanan darah |
| `heart_attack`, `stroke`, `chd_angina`, `cardiovascular` | definisi sama dengan BRFSS; `chd_angina` = PJK atau angina |
| `weight_exam`, `weight_interview`, `weight_fasting`, `psu`, `stratum` | `weight_exam` untuk hasil pemeriksaan, `weight_interview` untuk jawaban wawancara, `weight_fasting` untuk glukosa puasa |

## Kamus kolom SKI

`indicator`, `population`, `group_type` (`national`, `age_group`, `sex`), `group`, `value`, `ci_low`, `ci_high` (CI 95%), `unit` (`percent` atau `per_mille`), `source_table`, `report_page` (nomor halaman cetak laporan), `note`.

- Cakupan: diabetes (diagnosis dokter dan gula darah), pradiabetes (GDPT dan TGT), hipertensi (diagnosis dokter dan pengukuran, usia ≥15 dan ≥18), penyakit jantung, stroke, kolesterol total, merokok, aktivitas fisik.
- Total nasional diambil dari tabel provinsi bila tabel karakteristik tidak memilikinya. Kolom `note` mencatatnya.
- Judul tabel kolesterol (Tabel 7.30) tidak menyebut populasi, sehingga kolom `population` berisi `not stated in table title`.
- BMI/obesitas dan tidur tidak diekstrak.

## Validasi

- Jumlah baris BRFSS sama dengan jumlah responden di codebook CDC tiap tahun.
- 18 persentase berbobot (tidak pernah merokok, olahraga ya, serangan jantung, hipertensi) dihitung ulang dari file mentah dan cocok dengan codebook resmi CDC untuk tiap tahun 2021 sampai 2025, sampai 2 desimal, tanpa selisih. Contoh 2025: 60,27 / 77,29 / 4,27 / 34,99.
- Lima zip BRFSS lolos uji CRC. Unduh ulang dari cdc.gov pada 5 Okt 2026 (BRFSS 2025, NHANES `DEMO_L` dan `BMX_L`) menghasilkan SHA-256 yang identik.
- Prevalensi angina/PJK BRFSS 2024 per negara bagian dibandingkan dengan `ai/datasets/dump/kardiovaskular2.csv`: 52 negara bagian, selisih maksimum 0,1 poin persentase (pembulatan).
- Menit aktivitas BRFSS 2023 konsisten dengan `pa150_category`: kategori 3 selalu 0 menit, kategori 2 antara 2 dan 149, kategori 1 minimal 150.
- NHANES: `DEMO_L` berisi 11.933 responden, sama dengan dokumentasi CDC. Jumlah dewasa (8.153) dan jumlah data per variabel sama dengan file sumber.
- SKI: 13 nilai diperiksa manual terhadap teks laporan tanpa selisih. Angka nasional hipertensi terukur 29,2% (≥15) dan 30,8% (≥18), diabetes menurut gula darah 11,7%, semuanya sama dengan halaman resmi "Hasil Utama SKI 2023".

## Keterbatasan

- Label BRFSS dan sebagian label NHANES adalah "pernah diberi tahu dokter". Data ini menunjukkan prevalensi, bukan risiko di masa depan.
- `diabetes` dan `hypertension` memasukkan kategori hamil dan borderline sebagai 0. Pakai kolom `*_code` untuk definisi lain.
- BRFSS 2025 tidak memuat California, Mississippi, Nevada, dan Kepulauan Virgin AS (menurut halaman CDC).
- Riwayat keluarga dan tingkat stres tidak ada di BRFSS maupun NHANES 2021 sampai 2023, jadi tidak ada di CSV.
- Tinggi dan berat BRFSS dilaporkan sendiri. Semua data kecuali SKI berasal dari populasi AS.
- SKI di sini hanya tabel terbitan. Microdata SKI 2023 hanya bisa diminta lewat portal layanan data Kemenkes dengan proposal dan NDA, dan tidak boleh masuk repo.
- Halaman unduhan CDC tidak mencantumkan pernyataan lisensi. Checklist PRD §11.31 meminta lisensi diverifikasi, dan itu belum dilakukan.

## Sumber asli dan cara memverifikasi

Semua data diunduh langsung dari server resmi pada 5 Okt 2026, tanpa perantara seperti Kaggle atau mirror. Semua tautan di bawah memberi HTTP 200 pada tanggal itu. Unduh dengan `curl` atau `wget` biasa, karena CDC menolak (403) klien yang memalsukan User-Agent browser.

### BRFSS (CDC, Behavioral Risk Factor Surveillance System)

| Tahun | Halaman resmi | Berkas data (XPT, zip) | Codebook | Ukuran data (byte) |
|---|---|---|---|---|
| 2021 | [annual_2021](https://www.cdc.gov/brfss/annual_data/annual_2021.html) | [LLCP2021XPT.zip](https://www.cdc.gov/brfss/annual_data/2021/files/LLCP2021XPT.zip) | [PDF](https://www.cdc.gov/brfss/annual_data/2021/pdf/codebook21_llcp-v2-508.pdf) | 81.597.005 |
| 2022 | [annual_2022](https://www.cdc.gov/brfss/annual_data/annual_2022.html) | [LLCP2022XPT.zip](https://www.cdc.gov/brfss/annual_data/2022/files/LLCP2022XPT.zip) | [zip](https://www.cdc.gov/brfss/annual_data/2022/zip/codebook22_llcp-v2-508.zip) | 84.614.105 |
| 2023 | [annual_2023](https://www.cdc.gov/brfss/annual_data/annual_2023.html) | [LLCP2023XPT.zip](https://www.cdc.gov/brfss/annual_data/2023/files/LLCP2023XPT.zip) | [zip](https://www.cdc.gov/brfss/annual_data/2023/zip/codebook23_llcp-v2-508.zip) | 93.237.818 |
| 2024 | [annual_2024](https://www.cdc.gov/brfss/annual_data/annual_2024.html) | [LLCP2024XPT.zip](https://www.cdc.gov/brfss/annual_data/2024/files/LLCP2024XPT.zip) | [zip](https://www.cdc.gov/brfss/annual_data/2024/zip/codebook24_llcp-v2-508.zip) | 83.007.956 |
| 2025 | [annual_2025](https://www.cdc.gov/brfss/annual_data/annual_2025.html) | [LLCP2025XPT.zip](https://www.cdc.gov/brfss/annual_data/2025/files/LLCP2025XPT.zip) | [zip](https://www.cdc.gov/brfss/annual_data/2025/zip/codebook25_llcp-v2-508.zip) | 64.642.184 |

Ukuran berkas data di server CDC pada 5 Okt 2026 sama persis dengan file yang diolah.

### NHANES, siklus Agustus 2021 sampai Agustus 2023 (CDC/NCHS)

Halaman siklus: [NHANES 2021-2023](https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/default.aspx?Cycle=2021-2023). Siklus 2025-2027 terdaftar tetapi datanya belum dirilis, dan siklus 2017-Maret 2020 di luar jendela lima tahun.

Berkas data: `https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/{FILE}.xpt`

| FILE | Isi | Dokumentasi variabel |
|---|---|---|
| `DEMO_L` | demografi, bobot sampel | [DEMO_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/DEMO_L.htm) |
| `BMX_L` | tinggi, berat, BMI, lingkar pinggang | [BMX_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/BMX_L.htm) |
| `BPXO_L` | tekanan darah (tensimeter otomatis) | [BPXO_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/BPXO_L.htm) |
| `GLU_L` | glukosa puasa | [GLU_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/GLU_L.htm) |
| `GHB_L` | HbA1c | [GHB_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/GHB_L.htm) |
| `TCHOL_L` | kolesterol total | [TCHOL_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/TCHOL_L.htm) |
| `HDL_L` | kolesterol HDL | [HDL_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/HDL_L.htm) |
| `SMQ_L` | merokok | [SMQ_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/SMQ_L.htm) |
| `SLQ_L` | tidur | [SLQ_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/SLQ_L.htm) |
| `PAQ_L` | aktivitas fisik | [PAQ_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/PAQ_L.htm) |
| `DIQ_L` | diabetes (kuesioner) | [DIQ_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/DIQ_L.htm) |
| `BPQ_L` | tekanan darah dan kolesterol (kuesioner) | [BPQ_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/BPQ_L.htm) |
| `MCQ_L` | kondisi medis (jantung, stroke) | [MCQ_L.htm](https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/MCQ_L.htm) |

### SKI 2023 (Kementerian Kesehatan RI, Badan Kebijakan Pembangunan Kesehatan)

- Berkas yang diolah: [SKI 2023 Dalam Angka, versi Indonesia (PDF, 965 halaman, Google Drive)](https://drive.google.com/file/d/1rjNDG_f8xG6-Y9wmhJUnXhJ-vUFevVJC/view?usp=sharing). Tautan ini dipasang di halaman resmi [SKI 2023 Dalam Angka](https://www.badankebijakan.kemkes.go.id/ski-2023-dalam-angka/). Versi Inggris: [PDF](https://drive.google.com/file/d/1NMZwTtFMamkmMe-H8OpZwan105kiSQtq/view?usp=sharing).
- Sampul PDF memuat "Survei Kesehatan Indonesia 2023 Dalam Angka, Badan Kebijakan Pembangunan Kesehatan, Kementerian Kesehatan RI". Metadata PDF: Microsoft Word 2019, dibuat 24 Mei 2024.
- Pembanding angka nasional: [Hasil Utama SKI 2023](https://www.badankebijakan.kemkes.go.id/daftar-frequently-asked-question-seputar-hasil-utama-ski-2023/hasil-utama-ski-2023/).
- Katalog data: [layanandata.kemkes.go.id](https://layanandata.kemkes.go.id/katalog-data/ski/ketersediaan-data/ski-2023). Prosedur microdata: [permintaan data SKI 2023](https://www.badankebijakan.kemkes.go.id/daftar-frequently-asked-question-seputar-hasil-utama-ski-2023/permintaan-data-ski2023/).
- Tautan Drive bukan domain pemerintah, jadi bisa berubah. Bila hash di bawah tidak cocok, cocokkan angkanya dengan halaman Hasil Utama.

### Checksum berkas mentah (SHA-256, dihitung 5 Okt 2026)

Simpan blok ini sebagai `SHA256SUMS.txt`, letakkan berkas mentah sesuai jalur di kiri, lalu jalankan `sha256sum -c SHA256SUMS.txt`. Baris `codebook/` hanya perlu diperiksa bila Anda mengunduh codebook.

```text
e8a6e290cdcb6bff82d8f37dff6c3f3e435d428191eb529a716cf9f5316aa621  brfss/LLCP2021XPT.zip
b6319c949b7289f8020fc903c3c2d38fe7e0b28ad703dcd81547f5cd0c0dcfeb  brfss/LLCP2022XPT.zip
d1ab80e4806a1d07bd3e40ec78c971ad9ff920f3ea5f6049780aeaa41ff31f43  brfss/LLCP2023XPT.zip
d33de91a584e866f657d29b1d5b51b5672467286ed22d021e36ee3c7b4d712a4  brfss/LLCP2024XPT.zip
d26a8b391aa2966b58dc2a3ffddf8da050e9f38eb143d0f5ca7b3d21ece08f98  brfss/LLCP2025XPT.zip
ca4374a158b493b8b0163e1388da21d57a18d1b9cecff2aa4e2fa2bec494fe23  nhanes/DEMO_L.xpt
44440c416d9ad709e8b1708a5975378ab4d5b18edc39eb5015c2ae7186500170  nhanes/BMX_L.xpt
189aa9bed689d2c69cf8d780b01de85073276fea5694dd52cdf696229f9054a6  nhanes/BPXO_L.xpt
70f773ab37e3d8485341f32137e280e05b9279e5fe9b6f0362e4052d8fe9a201  nhanes/GLU_L.xpt
67aee0353160e2392dc0a33bece99b90764a630c76d82415ac4639105ad9dd03  nhanes/GHB_L.xpt
5c3312e555bb0706fd97cbd63fcbc9e78f00bda8d2d149732d9dd368169b25d3  nhanes/TCHOL_L.xpt
c1bb43df5ca366f470b411c043f4aee7ae6552a7f4bca1178bc87b24fb9a7300  nhanes/HDL_L.xpt
abbefebfa5585b1e19c079fa14be20c113a4649318070197214b258d05b93c50  nhanes/SMQ_L.xpt
918c3258b2f466ac1cae55ea45330c736dbdc573ee4dc72306e3d2b222764741  nhanes/SLQ_L.xpt
de34acfed4523f10f52bea06e64ed33c8db973cb38d3539eeceb2b68039248c8  nhanes/PAQ_L.xpt
9535a023673ae869afae19d842d8679e06f6a464606ac15900686b41ef05090f  nhanes/DIQ_L.xpt
0acde3af0526c375942fe0735e3bf69a0422bcbc606f98a478209d2f47baa4b5  nhanes/BPQ_L.xpt
0889bb3eaa5adedf1a11c4af2d4776fc4c4c3cfdeea24fcedb77c4636b478f61  nhanes/MCQ_L.xpt
7d141682783769bd9fd94e3c5a5433e4f46316e7674f1bd4fb3721dd620ab95c  ski/ski_2023_dalam_angka_id.pdf
e32494346442ed357072947a8cc75ec77d48262a0e3932ed3baca90e6499c8bc  codebook/codebook21_llcp-v2-508.pdf
a2b6852972131929e9dc6d1a161a48a24429b61917e7e678e6d1239477796250  codebook/codebook22_llcp-v2-508.zip
948cb7cd58bddde96eab61ab11a93e69ef4440ff3b62f9382895a7403407df4a  codebook/codebook23_llcp-v2-508.zip
06c1c0e9c384d70c5b204e7869b1b1ad3f402a37a730c1d9a1f5aeee94fd1918  codebook/codebook24_llcp-v2-508.zip
70d920a440fd651a12f9dc62c100626a15ca2503774128ba2cbe62b056f861f3  codebook/codebook25_llcp-v2-508.zip
```

CDC dapat memperbarui berkas lama. Halaman BRFSS 2021, misalnya, mencatat koreksi variabel `TRNSGNDR` untuk Kentucky pada pembaruan Juli 2023 (variabel itu tidak dipakai di CSV ini). Bila hash berbeda, bandingkan jumlah baris dan persentase berbobot dengan codebook sesuai bagian Validasi sebelum memakai berkas itu.

Jangan memakai ukuran berkas dan jumlah variabel yang tertulis di halaman CDC sebagai acuan: semua halaman BRFSS 2021 sampai 2025 menulis "64,3 MB" untuk berkas XPT, padahal ukuran sebenarnya berbeda tiap tahun (tabel di atas). Acuan yang dipakai di sini adalah hash, jumlah rekaman, dan codebook.
