/**
 * HELIORA — Clinical & Scientific Evidence Knowledge Base
 *
 * Single authoritative client registry for clinical guidelines and evidence citations.
 * Implements Architecture §8, §14, PRD §6.12, §8.13, §11.20, §11.21, §20.11, §20.13,
 * FR-027, FR-028, FR-029, BR-EVIDENCE-001–005, and AC-EVIDENCE-01/02.
 *
 * Strict PRD-approved sources only:
 * - World Health Organization (WHO)
 * - Kementerian Kesehatan Republik Indonesia
 * - Perkumpulan Endokrinologi Indonesia (PERKENI)
 * - Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PERKI)
 * - Centers for Disease Control and Prevention (CDC)
 */

export type EvidenceCategory =
  | "activity"
  | "sleep"
  | "weight"
  | "smoking"
  | "consultation"
  | "stress";

/**
 * Normalized 3 document types strictly adhering to PRD §11.21:
 * Guideline / Research / Report -> Pedoman / Penelitian / Laporan
 */
export type EvidenceTypeNormalized = "Pedoman" | "Penelitian" | "Laporan";

export interface SupportedRecommendationRef {
  ruleId: string;
  title: string;
  actionText: string;
}

export interface ClinicalEvidence {
  id: string;
  slug: string;
  rule_id: string;
  /** Judul bahasa Indonesia untuk tampilan utama yang ramah pengguna */
  title: string;
  /** Judul asli publikasi dalam bahasa Inggris jika ada */
  originalTitle?: string;
  organization: string;
  shortOrg: string;
  publication: string;
  /** Normalized type: Pedoman / Penelitian / Laporan (PRD §11.21) */
  evidenceType: EvidenceTypeNormalized;
  year: number;
  version: string;
  evidence_level?: "Level A (Kuat)" | "Level B (Sedang)" | "Level C (Konsensus Pakar)";
  /** Apakah sumber ini menggunakan sistem penilaian rekomendasi formal (seperti WHO GRADE atau klasifikasi profesi medis) */
  hasFormalGrading: boolean;
  gradingBadgeLabel: string;
  recommendationStrength?: "Kuat" | "Kondisional";
  evidenceCertainty?: "Tinggi" | "Sedang" | "Terbatas" | "Konsensus Klinis";
  evidenceGradingSystem: string;
  evidenceGradingDetail: string;
  category: EvidenceCategory;
  categoryLabel: string;
  supportedRecommendations: SupportedRecommendationRef[];
  plainSummary: string;
  summary: string;
  clinicalSection: string;
  primaryCitation: string;
  relatedPublication?: string;
  relatedPublicationDoi?: string;
  externalUrl: string;
  authorityCtaLabel: string;
  lastVerified: string;
  doi?: string;
}

export const EVIDENCE_DATABASE: ClinicalEvidence[] = [
  // ── 1. AKTIVITAS FISIK ──────────────────────────────────────────────────
  {
    id: "evi-01",
    slug: "who-pa-2020",
    rule_id: "REC-ACT-01",
    title: "Pedoman WHO tentang Aktivitas Fisik dan Perilaku Sedenter",
    originalTitle: "WHO Guidelines on Physical Activity and Sedentary Behaviour",
    organization: "World Health Organization (WHO)",
    shortOrg: "WHO",
    publication: "World Health Organization, 2020",
    evidenceType: "Pedoman",
    year: 2020,
    version: "Edisi Global 2020 (ISBN 978-92-4-001512-8)",
    hasFormalGrading: true,
    gradingBadgeLabel: "Rekomendasi kuat",
    recommendationStrength: "Kuat",
    evidenceCertainty: "Sedang",
    evidenceGradingSystem: "WHO GRADE",
    evidenceGradingDetail:
      "Rekomendasi kuat, kepastian bukti sedang (WHO GRADE — strong recommendation, moderate-certainty evidence).",
    category: "activity",
    categoryLabel: "Aktivitas Fisik",
    supportedRecommendations: [
      {
        ruleId: "REC-ACT-01",
        title: "Jalan cepat 30 menit sehari",
        actionText: "Tingkatkan aktivitas aerobik sedang minimal 150 menit per minggu.",
      },
      {
        ruleId: "REC-GEN-01",
        title: "Pertahankan kebiasaan sehat harian",
        actionText: "Tetap aktif bergerak setiap hari.",
      },
    ],
    plainSummary:
      "Aktivitas aerobik sedang 150–300 menit per minggu (misalnya jalan cepat 30 menit, 5 hari seminggu) dikaitkan dengan risiko penyakit jantung dan diabetes yang lebih rendah.",
    summary:
      "Bagi orang dewasa (18–64 tahun), akumulasi aktivitas fisik aerobik berintensitas sedang minimal 150–300 menit per minggu memberikan manfaat kesehatan terukur terhadap penurunan risiko kardiovaskular, hipertensi, dan diabetes melitus tipe 2.",
    clinicalSection: "Rekomendasi untuk dewasa usia 18–64 tahun",
    primaryCitation:
      "World Health Organization. WHO guidelines on physical activity and sedentary behaviour. Geneva: World Health Organization; 2020. Licence: CC BY-NC-SA 3.0 IGO.",
    relatedPublication:
      "Bull FC, Al-Ansari SS, Biddle S, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med 2020;54(24):1451-1462.",
    relatedPublicationDoi: "10.1136/bjsports-2020-102955",
    externalUrl: "https://www.who.int/publications/i/item/9789240015128",
    authorityCtaLabel: "Buka di situs WHO",
    lastVerified: "15 Jan 2026",
  },
  {
    id: "evi-08",
    slug: "kemenkes-germas-2020",
    rule_id: "REC-GEN-01",
    title: "Buku Panduan GERMAS: Pembudayaan Aktivitas Fisik",
    organization: "Kementerian Kesehatan RI",
    shortOrg: "Kemenkes RI",
    publication: "Direktorat Promosi Kesehatan dan Pemberdayaan Masyarakat, 2020",
    evidenceType: "Pedoman",
    year: 2020,
    version: "Inpres No. 1/2017 & Panduan Teknis 2020",
    hasFormalGrading: false,
    gradingBadgeLabel: "Laporan nasional",
    evidenceGradingSystem: "Kebijakan Kesehatan Masyarakat",
    evidenceGradingDetail:
      "Dokumen ini merupakan pedoman kebijakan kesehatan masyarakat nasional (Inpres No. 1/2017 & Panduan Teknis Ditjen Kesmas), bukan telaah klinis dengan sistem grading formal (seperti GRADE).",
    category: "activity",
    categoryLabel: "Aktivitas Fisik",
    supportedRecommendations: [
      {
        ruleId: "REC-GEN-01",
        title: "Pertahankan kebiasaan sehat harian",
        actionText: "Tetap aktif bergerak setiap hari minimal 30 menit dan periksa kesehatan berkala.",
      },
    ],
    plainSummary:
      "Membiasakan bergerak aktif minimal 30 menit setiap hari, memperbanyak porsi sayur dan buah, serta melakukan pemeriksaan kesehatan berkala merupakan pilar penting dalam mencegah penyakit tidak menular.",
    summary:
      "Panduan GERMAS menetapkan pembudayaan aktivitas fisik minimal 30 menit sehari pada populasi usia produktif guna menurunkan beban penyakit kardiometabolik dan mempertahankan kebugaran jasmani.",
    clinicalSection: "Pilar Pembudayaan Aktivitas Fisik dan Pengendalian Faktor Risiko",
    primaryCitation:
      "Kementerian Kesehatan RI. Buku Panduan Pembudayaan Aktivitas Fisik Gerakan Masyarakat Hidup Sehat. Jakarta: Ditjen Kesmas, 2020.",
    externalUrl: "https://ayosehat.kemkes.go.id/germas",
    authorityCtaLabel: "Buka di situs Kemenkes RI",
    lastVerified: "15 Jan 2026",
  },

  // ── 2. POLA TIDUR ───────────────────────────────────────────────────────
  {
    id: "evi-03",
    slug: "cdc-sleep-2013",
    rule_id: "REC-SLP-01",
    title: "Durasi Tidur dan Penyakit Kronis pada Orang Dewasa Usia 45 Tahun ke Atas",
    originalTitle:
      "Sleep duration and chronic diseases among US adults age 45 years and older: evidence from the 2010 Behavioral Risk Factor Surveillance System",
    organization: "Centers for Disease Control and Prevention (CDC)",
    shortOrg: "CDC",
    publication: "Sleep, Vol. 36, No. 10, 2013",
    evidenceType: "Penelitian",
    year: 2013,
    version: "Survei BRFSS 2010 (54.000+ responden usia ≥ 45 tahun)",
    hasFormalGrading: false,
    gradingBadgeLabel: "Tanpa penilaian formal",
    evidenceGradingSystem: "Tinjauan Epidemiologi Observasional",
    evidenceGradingDetail:
      "Studi observasional cross-sectional berskala besar berbasis populasi dewasa usia 45 tahun ke atas (n=54.269); memetakan korelasi durasi tidur dengan penyakit kronis tanpa sistem grading rekomendasi klinis formal seperti GRADE.",
    category: "sleep",
    categoryLabel: "Pola Tidur",
    supportedRecommendations: [
      {
        ruleId: "REC-SLP-01",
        title: "Tidur 7–9 jam per malam",
        actionText: "Jaga jadwal tidur yang teratur dan cukupi waktu istirahat 7–9 jam per malam.",
      },
    ],
    plainSummary:
      "Berdasarkan analisis terhadap lebih dari 54.000 orang dewasa dari survei BRFSS di 14 negara bagian AS, durasi tidur pendek (< 7 jam per malam) maupun tidur panjang (≥ 10 jam) berkaitan dengan peningkatan risiko penyakit jantung, stroke, dan diabetes bila dibandingkan dengan tidur cukup 7–9 jam. Studi ini meneliti orang dewasa usia 45 tahun ke atas dan menunjukkan hubungan, bukan sebab-akibat.",
    summary:
      "Studi observasional cross-sectional berskala besar (n=54.269 dewasa usia ≥ 45 tahun dari 14 negara bagian AS) menemukan bahwa durasi tidur pendek (< 7 jam) secara independen berkaitan dengan prevalensi penyakit jantung koroner yang lebih tinggi (OR 1,67; 95% CI 1,35–2,05), stroke (OR 1,51), dan diabetes (OR 1,31). Peneliti CDC menyimpulkan bahwa rentang 7–9 jam merupakan durasi tidur optimal bagi kesehatan kardiometabolik pada populasi dewasa paruh baya dan lanjut usia.",
    clinicalSection: "Asosiasi Multivariat Durasi Tidur terhadap Morbiditas Kardiometabolik Usia ≥ 45 Tahun",
    primaryCitation:
      "Wheaton AG, Perry GS, Chapman DP, Croft JB. Sleep duration and chronic diseases among US adults age 45 years and older: evidence from the 2010 Behavioral Risk Factor Surveillance System. Sleep. 2013;36(10):1423-1433.",
    externalUrl: "https://doi.org/10.5665/sleep.3032",
    authorityCtaLabel: "Buka publikasi di jurnal Sleep",
    lastVerified: "20 Jan 2026",
    doi: "10.5665/sleep.3032",
  },
  {
    id: "evi-10",
    slug: "cdc-sleep-mmwr-2016",
    rule_id: "REC-SLP-02",
    title: "Prevalensi Durasi Tidur Sehat pada Orang Dewasa: Laporan MMWR CDC",
    originalTitle: "Prevalence of Healthy Sleep Duration among Adults — United States, 2013",
    organization: "Centers for Disease Control and Prevention (CDC)",
    shortOrg: "CDC",
    publication: "Morbidity and Mortality Weekly Report (MMWR), 2016;65(6):137–141",
    evidenceType: "Laporan",
    year: 2016,
    version: "CDC MMWR Vol. 65, No. 6",
    hasFormalGrading: false,
    gradingBadgeLabel: "Laporan surveilans",
    evidenceGradingSystem: "Laporan Surveilans Kesehatan Masyarakat CDC",
    evidenceGradingDetail:
      "Laporan epidemiologi surveilans kesehatan masyarakat CDC berbasis data 444.306 responden dewasa; menetapkan rekomendasi tidur sehat minimal 7 jam per malam tanpa sistem GRADE formal.",
    category: "sleep",
    categoryLabel: "Pola Tidur",
    supportedRecommendations: [
      {
        ruleId: "REC-SLP-01",
        title: "Tidur 7–9 jam per malam",
        actionText: "Prioritaskan kecukupan istirahat 7–9 jam per malam untuk menjaga metabolisme tubuh.",
      },
    ],
    plainSummary:
      "Laporan surveilans CDC menemukan bahwa lebih dari sepertiga orang dewasa tidur kurang dari 7 jam per hari. Durasi tidur 7–9 jam dikaitkan dengan risiko obesitas, diabetes, dan tekanan darah tinggi yang lebih rendah.",
    summary:
      "Laporan MMWR CDC menganalisis data surveilans nasional terhadap 444.306 responden dewasa di 50 negara bagian AS. CDC menegaskan bahwa tidur cukup minimal 7 jam (rentang 7–9 jam) esensial untuk kesehatan kardiovaskular dan metabolisme optimal.",
    clinicalSection: "Hasil Surveilans Nasional Durasi Tidur Sehat Dewasa",
    primaryCitation:
      "Liu Y, Wheaton AG, Chapman DP, Cunningham TJ, Lu H, Croft JB. Prevalence of Healthy Sleep Duration among Adults — United States, 2013. MMWR Morb Mortal Wkly Rep. 2016;65(6):137-141.",
    externalUrl: "https://www.cdc.gov/mmwr/volumes/65/wr/mm6506a1.htm",
    authorityCtaLabel: "Buka di situs CDC",
    lastVerified: "20 Jan 2026",
    doi: "10.15585/mmwr.mm6506a1",
  },

  // ── 3. BERAT BADAN & NUTRISI ─────────────────────────────────────────────
  {
    id: "evi-02",
    slug: "perkeni-dm-2021",
    rule_id: "REC-NUT-01",
    title: "Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia",
    organization: "Perkumpulan Endokrinologi Indonesia (PERKENI)",
    shortOrg: "PERKENI",
    publication: "PB PERKENI, 2021",
    evidenceType: "Pedoman",
    year: 2021,
    version: "Konsensus Nasional 2021 (ISBN 978-623-90934-8-8)",
    hasFormalGrading: true,
    gradingBadgeLabel: "Rekomendasi kuat",
    recommendationStrength: "Kuat",
    evidenceCertainty: "Tinggi",
    evidenceGradingSystem: "Konsensus PERKENI",
    evidenceGradingDetail:
      "Rekomendasi kuat berbasis telaah bukti klinis uji acak terkendali (PERKENI Rekomendasi Tingkat A).",
    category: "weight",
    categoryLabel: "Berat Badan & Nutrisi",
    supportedRecommendations: [
      {
        ruleId: "REC-NUT-01",
        title: "Atur porsi makan dan tambah serat",
        actionText: "Kurangi karbohidrat olahan sederhana dan tingkatkan asupan serat 20–35 gram/hari.",
      },
    ],
    plainSummary:
      "Mengurangi konsumsi karbohidrat olahan dan minuman manis, memperbanyak porsi sayur serta makanan berserat, dan mengupayakan penurunan berat badan 5–10% pada kelebihan berat badan terbukti membantu memperbaiki sensitivitas insulin dan mencegah risiko diabetes melitus tipe 2.",
    summary:
      "Terapi nutrisi medis menganjurkan pembatasan karbohidrat sederhana, kecukupan serat 20–35 g/hari dari sayur dan buah, serta reduksi berat badan 5–10% secara bertahap pada individu dengan obesitas atau overweight untuk menurunkan resistensi insulin.",
    clinicalSection: "Terapi Nutrisi Medis dan Modifikasi Gaya Hidup",
    primaryCitation:
      "Pengurus Besar Perkumpulan Endokrinologi Indonesia (PB PERKENI). Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia 2021. Jakarta: PB PERKENI; 2021.",
    externalUrl: "https://pbperkeni.or.id/",
    authorityCtaLabel: "Buka di situs PERKENI",
    lastVerified: "10 Feb 2026",
  },
  {
    id: "evi-09",
    slug: "perkeni-dislipidemia-2021",
    rule_id: "REC-LIP-01",
    title: "Panduan Pengelolaan Dislipidemia di Indonesia",
    organization: "Perkumpulan Endokrinologi Indonesia (PERKENI)",
    shortOrg: "PERKENI",
    publication: "PB PERKENI, 2021",
    evidenceType: "Pedoman",
    year: 2021,
    version: "Konsensus Nasional Dislipidemia 2021",
    hasFormalGrading: true,
    gradingBadgeLabel: "Rekomendasi kuat",
    recommendationStrength: "Kuat",
    evidenceCertainty: "Tinggi",
    evidenceGradingSystem: "Konsensus PERKENI",
    evidenceGradingDetail:
      "Rekomendasi kuat berbasis telaah bukti uji klinis kardiovaskular (PERKENI Tingkat A).",
    category: "weight",
    categoryLabel: "Berat Badan & Nutrisi",
    supportedRecommendations: [
      {
        ruleId: "REC-NUT-01",
        title: "Batasi lemak jenuh dan tambah serat larut",
        actionText: "Batasi lemak jenuh (< 7% energi) dan perbanyak serat larut untuk mengontrol kolesterol.",
      },
    ],
    plainSummary:
      "Membatasi asupan makanan berlemak jenuh dan lemak trans, memperbanyak konsumsi serat larut, serta menjaga berat badan ideal membantu mengendalikan kadar kolesterol dan trigliserida dalam darah.",
    summary:
      "Modifikasi gaya hidup melalui pembatasan lemak jenuh (< 7% dari total energi), eliminasi lemak trans, serta peningkatan asupan serat larut air terbukti memperbaiki profil lipid aterogenik.",
    clinicalSection: "Terapi Non-Farmakologis dan Terapi Nutrisi Medis",
    primaryCitation:
      "Pengurus Besar Perkumpulan Endokrinologi Indonesia (PB PERKENI). Panduan Pengelolaan Dislipidemia di Indonesia 2021. Jakarta: PB PERKENI; 2021.",
    externalUrl: "https://pbperkeni.or.id/",
    authorityCtaLabel: "Buka di situs PERKENI",
    lastVerified: "15 Feb 2026",
  },
  {
    id: "evi-06",
    slug: "perki-hipertensi-2021",
    rule_id: "REC-NUT-02",
    title: "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular",
    organization: "Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PERKI)",
    shortOrg: "PERKI",
    publication: "PP PERKI, 2021",
    evidenceType: "Pedoman",
    year: 2021,
    version: "Edisi Kedua 2021",
    hasFormalGrading: true,
    gradingBadgeLabel: "Rekomendasi kuat",
    recommendationStrength: "Kuat",
    evidenceCertainty: "Tinggi",
    evidenceGradingSystem: "Sistem Grading PERKI",
    evidenceGradingDetail:
      "Rekomendasi kuat berbasis uji klinis acak berkualitas tinggi (PERKI Kelas I, Tingkat Bukti A).",
    category: "weight",
    categoryLabel: "Berat Badan & Nutrisi",
    supportedRecommendations: [
      {
        ruleId: "REC-NUT-01",
        title: "Batasi asupan garam dapur (< 5 g/hari)",
        actionText: "Batasi asupan garam dapur (< 5 g atau 1 sdt/hari) dan perbanyak makanan kaya kalium.",
      },
    ],
    plainSummary:
      "Membatasi konsumsi garam hingga kurang dari satu sendok teh (5 gram garam dapur) per hari, menjaga berat badan sehat, dan memperbanyak konsumsi sayuran dapat membantu menurunkan tekanan darah secara bermakna.",
    summary:
      "Restriksi asupan natrium harian (< 2 g natrium atau setara < 5 g NaCl), kepatuhan diet gizi seimbang, dan pengendalian lingkar pinggang direkomendasikan untuk pencegahan primer serta penurunan tekanan darah sistolik.",
    clinicalSection: "Intervensi Non-Farmakologis Gaya Hidup dan Pola Makan",
    primaryCitation:
      "Pengurus Pusat Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PP PERKI). Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular. Jakarta: PP PERKI; 2021.",
    externalUrl: "https://www.inaheart.org/",
    authorityCtaLabel: "Buka di situs PERKI",
    lastVerified: "18 Mar 2026",
  },

  // ── 4. KEBIASAAN MEROKOK ────────────────────────────────────────────────
  {
    id: "evi-04",
    slug: "kemenkes-ubm-2021",
    rule_id: "REC-SMK-01",
    title: "Pedoman Penyelenggaraan Upaya Berhenti Merokok di Fasilitas Pelayanan Kesehatan Primer",
    organization: "Kementerian Kesehatan RI & PERKI",
    shortOrg: "Kemenkes RI & PERKI",
    publication: "Direktorat Pencegahan dan Pengendalian PTM Kemenkes RI, 2021",
    evidenceType: "Pedoman",
    year: 2021,
    version: "Panduan Teknis UBM 2021",
    hasFormalGrading: false,
    gradingBadgeLabel: "Pedoman nasional",
    evidenceGradingSystem: "Pedoman Pelayanan Klinis Primer",
    evidenceGradingDetail:
      "Pedoman teknis operasional penatalaksanaan berhenti merokok di FKTP; disusun melalui konsensus pakar kedokteran dan program kementerian tanpa skala GRADE formal.",
    category: "smoking",
    categoryLabel: "Kebiasaan Merokok",
    supportedRecommendations: [
      {
        ruleId: "REC-SMK-01",
        title: "Kurangi rokok hingga berhenti total",
        actionText: "Kurangi konsumsi rokok secara bertahap menuju penghentian total.",
      },
    ],
    plainSummary:
      "Berhenti merokok merupakan langkah terpenting dalam melindungi kesehatan jantung dan pembuluh darah. Manfaat penurunan risiko kardiovaskular mulai terasa sejak minggu-minggu awal dan terus membaik seiring berjalannya waktu bebas rokok.",
    summary:
      "Penghentian konsumsi tembakau secara total merupakan intervensi preventif paling efektif untuk memulihkan elastisitas vaskular, menurunkan agregasi platelet, dan memangkas risiko kejadian koroner akut hingga 50% dalam 1–2 tahun pasca berhenti.",
    clinicalSection: "Konseling Perilaku dan Tahapan Pendampingan Upaya Berhenti Merokok",
    primaryCitation:
      "Kementerian Kesehatan RI & PP PERKI. Pedoman Penyelenggaraan Upaya Berhenti Merokok di Fasilitas Pelayanan Kesehatan Primer. Jakarta: Kemenkes RI; 2021.",
    externalUrl: "https://p2ptm.kemkes.go.id/",
    authorityCtaLabel: "Buka di situs Kemenkes RI",
    lastVerified: "05 Mar 2026",
  },

  // ── 5. KONSULTASI MEDIS ─────────────────────────────────────────────────
  {
    id: "evi-07",
    slug: "kemenkes-ptm-fktp-2022",
    rule_id: "REC-SAFETY-01",
    title: "Pedoman Teknis Penemuan dan Tata Laksana Faktor Risiko Penyakit Tidak Menular di FKTP",
    organization: "Kementerian Kesehatan RI",
    shortOrg: "Kemenkes RI",
    publication: "Direktorat Pencegahan dan Pengendalian PTM, 2022",
    evidenceType: "Pedoman",
    year: 2022,
    version: "Edisi Pengendalian PTM 2022",
    hasFormalGrading: false,
    gradingBadgeLabel: "Standar pelayanan primer",
    evidenceGradingSystem: "Standar Pelayanan Primer Kemenkes",
    evidenceGradingDetail:
      "Standar operasional prosedur klinis skrining dan rujukan faskes tingkat pertama; disusun berbasis regulasi pelayanan kesehatan nasional.",
    category: "consultation",
    categoryLabel: "Konsultasi Medis",
    supportedRecommendations: [
      {
        ruleId: "REC-SAFETY-01",
        title: "Konsultasi dengan dokter",
        actionText: "Lakukan pemeriksaan medis langsung dan uji laboratorium penunjang.",
      },
    ],
    plainSummary:
      "Ketika estimasi risiko kesehatan berada pada kategori tinggi, pemeriksaan tatap muka dengan dokter sangat disarankan untuk melakukan konfirmasi fisik dan pemeriksaan laboratorium darah secara objektif sebelum memulai perubahan intensif.",
    summary:
      "Individu dengan klaster faktor risiko kardiometabolik tinggi memerlukan konfirmasi klinis dokter, pemeriksaan gula darah puasa, profil lipid terstandar, dan evaluasi tekanan darah berbasis faskes sebelum stratifikasi intervensi lanjutan.",
    clinicalSection: "Kriteria Rujukan Skrining dan Tata Laksana PTM Terpadu di FKTP",
    primaryCitation:
      "Kementerian Kesehatan RI. Pedoman Teknis Penemuan dan Tata Laksana Penyakit Tidak Menular di Fasilitas Kesehatan Tingkat Pertama. Jakarta: Ditjen P2P; 2022.",
    externalUrl: "https://kemkes.go.id/",
    authorityCtaLabel: "Buka di situs Kemenkes RI",
    lastVerified: "25 Mar 2026",
  },

  // ── 6. MANAJEMEN STRES ──────────────────────────────────────────────────
  {
    id: "evi-05",
    slug: "kemenkes-stres-2022",
    rule_id: "REC-STR-01",
    title: "Pedoman Pengelolaan Stres Psikososial pada Pelayanan Kesehatan Primer",
    organization: "Kementerian Kesehatan RI",
    shortOrg: "Kemenkes RI",
    publication: "Direktorat Kesehatan Jiwa Kemenkes RI, 2022",
    evidenceType: "Pedoman",
    year: 2022,
    version: "Panduan Pengelolaan Stres Dewasa 2022",
    hasFormalGrading: false,
    gradingBadgeLabel: "Pedoman teknis",
    evidenceGradingSystem: "Pedoman Teknis Kesehatan Jiwa Kemenkes",
    evidenceGradingDetail:
      "Pedoman teknis tata laksana stres psikososial berbasis intervensi relaksasi pernapasan primer; tidak dinilai dengan skala GRADE formal.",
    category: "stress",
    categoryLabel: "Manajemen Stres",
    supportedRecommendations: [
      {
        ruleId: "REC-STR-01",
        title: "Latihan napas 10 menit sehari",
        actionText: "Gunakan teknik relaksasi pernapasan ritmik untuk meredakan ketegangan fisik.",
      },
    ],
    plainSummary:
      "Meluangkan waktu 10 menit sehari untuk latihan pernapasan perlahan membantu memberi sinyal tenang pada tubuh dan menstabilkan rasa nyaman saat menghadapi beban stres harian.",
    summary:
      "Intervensi pernapasan lambat teratur (mindful breathing / pacing breath) terbukti membantu menstimulasi aktivitas sistem saraf parasimpatis, meredakan ketegangan neuromuskular, dan menstabilkan variabilitas detak nadi saat mengalami beban psikososial.",
    clinicalSection: "Teknik Regulasi Relaksasi Pernapasan untuk Kebugaran Fisik dan Mental",
    primaryCitation:
      "Kementerian Kesehatan RI. Pedoman Pengelolaan Stres Psikososial bagi Tenaga Kesehatan dan Masyarakat. Jakarta: Direktorat Kesehatan Jiwa; 2022.",
    externalUrl: "https://ayosehat.kemkes.go.id/",
    authorityCtaLabel: "Buka di situs Kemenkes RI",
    lastVerified: "12 Mar 2026",
  },
];

export function getEvidenceByRuleId(ruleId: string): ClinicalEvidence | undefined {
  const normRule = ruleId.toUpperCase().trim();
  return EVIDENCE_DATABASE.find((e) => e.rule_id.toUpperCase().trim() === normRule);
}

export function getEvidenceBySlugOrId(idOrSlug: string): ClinicalEvidence | undefined {
  const norm = idOrSlug.toLowerCase().trim();
  return EVIDENCE_DATABASE.find(
    (e) => e.slug.toLowerCase() === norm || e.id.toLowerCase() === norm
  );
}

export function getEvidenceStrengthBadgeText(
  strength?: ClinicalEvidence["recommendationStrength"]
): "Rekomendasi kuat" | "Rekomendasi kondisional" {
  return strength === "Kondisional" ? "Rekomendasi kondisional" : "Rekomendasi kuat";
}

export function getEvidenceStrengthLabel(
  level?: string
): "Kuat" | "Sedang" | "Terbatas" {
  if (!level) return "Sedang";
  if (level.includes("Level A") || level.includes("Kuat")) return "Kuat";
  if (level.includes("Level B") || level.includes("Sedang")) return "Sedang";
  return "Terbatas";
}

const INDONESIAN_MONTHS: Record<string, number> = {
  jan: 0,
  januari: 0,
  feb: 1,
  februari: 1,
  mar: 2,
  maret: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  jul: 6,
  juli: 6,
  agu: 7,
  agt: 7,
  agustus: 7,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
  december: 11,
};

export function parseFlexibleDate(dateInput: string | Date | undefined | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  const trimmed = String(dateInput).trim();
  if (!trimmed) return null;

  // DD Month YYYY (e.g. "15 Jan 2026", "12 Maret 2026")
  const matchMonthName = trimmed.match(/^(\d{1,2})[\s\-\/]+([a-zA-Z]+)[\s\-\/]+(\d{4})$/);
  if (matchMonthName) {
    const day = parseInt(matchMonthName[1], 10);
    const monthKey = matchMonthName[2].toLowerCase();
    const year = parseInt(matchMonthName[3], 10);
    if (monthKey in INDONESIAN_MONTHS) {
      return new Date(year, INDONESIAN_MONTHS[monthKey], day);
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const matchDMY = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (matchDMY) {
    const day = parseInt(matchDMY[1], 10);
    const month = parseInt(matchDMY[2], 10) - 1;
    const year = parseInt(matchDMY[3], 10);
    return new Date(year, month, day);
  }

  // YYYY-MM-DD
  const matchYMD = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (matchYMD) {
    const year = parseInt(matchYMD[1], 10);
    const month = parseInt(matchYMD[2], 10) - 1;
    const day = parseInt(matchYMD[3], 10);
    return new Date(year, month, day);
  }

  const parsedDirect = new Date(trimmed);
  if (!isNaN(parsedDirect.getTime())) {
    return parsedDirect;
  }

  return null;
}

/**
 * Format review date to Indonesian relative/localized date string:
 * - "Hari ini" if today
 * - "Kemarin" if yesterday
 * - "DD/MM/YYYY" otherwise (e.g. "15/01/2026")
 */
export function formatLastReviewedDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "Hari ini";
  try {
    const d = parseFlexibleDate(dateInput);
    if (!d || isNaN(d.getTime())) return "Hari ini";

    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isToday) return "Hari ini";

    const yesterday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1
    );
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();

    if (isYesterday) return "Kemarin";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return "Hari ini";
  }
}

/**
 * Returns the earliest lastVerified date across the entire evidence catalog.
 */
export function getEarliestEvidenceReviewDate(): string {
  let earliestDate: Date | null = null;
  let earliestRaw = "15 Jan 2026";
  for (const item of EVIDENCE_DATABASE) {
    const parsed = parseFlexibleDate(item.lastVerified);
    if (parsed) {
      if (!earliestDate || parsed.getTime() < earliestDate.getTime()) {
        earliestDate = parsed;
        earliestRaw = item.lastVerified;
      }
    }
  }
  return earliestRaw;
}
