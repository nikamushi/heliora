"""HELIORA API — Clinical evidence service.

Provides searchable clinical evidence database and guideline citations.
Implements Architecture §8, §14, PRD FR-027, FR-028, FR-029, BR-EVIDENCE-001–005.
"""

from typing import Any

from app.schemas.evidence import ClinicalEvidenceItem, EvidenceListResponse

CLINICAL_EVIDENCE_REGISTRY: list[dict[str, Any]] = [
    # ── 1. AKTIVITAS FISIK ──────────────────────────────────────────────────
    {
        "id": "evi-01",
        "slug": "who-pa-2020",
        "rule_id": "REC-ACT-01",
        "title": "WHO Guidelines on Physical Activity and Sedentary Behaviour",
        "title_translation": "Pedoman WHO tentang Aktivitas Fisik dan Perilaku Sedenter",
        "organization": "World Health Organization (WHO)",
        "short_org": "WHO",
        "publication": "World Health Organization, 2020",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Pedoman Resmi (Official Guideline)",
        "year": 2020,
        "version": "Edisi Global 2020 (ISBN 978-92-4-001512-8)",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": True,
        "grading_badge_label": "Rekomendasi kuat",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Sedang",
        "evidence_grading_system": "WHO GRADE",
        "evidence_grading_detail": "Rekomendasi kuat, kepastian bukti sedang (WHO GRADE — strong recommendation, moderate-certainty evidence).",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "supported_recommendations": [
            {
                "ruleId": "REC-ACT-01",
                "title": "Jalan cepat 30 menit sehari",
                "actionText": "Tingkatkan aktivitas aerobik sedang minimal 150 menit per minggu.",
            },
            {
                "ruleId": "REC-GEN-01",
                "title": "Pertahankan kebiasaan sehat harian",
                "actionText": "Tetap aktif bergerak setiap hari.",
            },
        ],
        "plain_summary": (
            "Aktivitas aerobik sedang 150–300 menit per minggu (misalnya jalan cepat 30 menit, 5 hari seminggu) "
            "dikaitkan dengan risiko penyakit jantung dan diabetes yang lebih rendah."
        ),
        "summary": (
            "Bagi orang dewasa (18–64 tahun), akumulasi aktivitas fisik aerobik berintensitas sedang minimal "
            "150–300 menit per minggu memberikan manfaat kesehatan terukur terhadap penurunan morbiditas "
            "kardiometabolik, hipertensi, dan diabetes melitus tipe 2."
        ),
        "clinical_section": "Bab Rekomendasi: Dewasa Usia 18–64 Tahun (Recommendations: Adults aged 18–64 years)",
        "citation": "World Health Organization. WHO guidelines on physical activity and sedentary behaviour. Geneva: World Health Organization; 2020.",
        "primary_citation": "World Health Organization. WHO guidelines on physical activity and sedentary behaviour. Geneva: World Health Organization; 2020. Licence: CC BY-NC-SA 3.0 IGO.",
        "related_publication": "Bull FC, Al-Ansari SS, Biddle S, et al. World Health Organization 2020 guidelines on physical activity and sedentary behaviour. Br J Sports Med 2020;54(24):1451-1462.",
        "related_publication_doi": "10.1136/bjsports-2020-102955",
        "external_url": "https://www.who.int/publications/i/item/9789240015128",
        "last_verified": "15 Jan 2026",
        "doi": None,
    },
    {
        "id": "evi-08",
        "slug": "kemenkes-germas-2020",
        "rule_id": "REC-GEN-01",
        "title": "Buku Panduan Gerakan Masyarakat Hidup Sehat (GERMAS): Pembudayaan Aktivitas Fisik",
        "organization": "Kementerian Kesehatan RI",
        "short_org": "Kemenkes RI",
        "publication": "Direktorat Promosi Kesehatan dan Pemberdayaan Masyarakat, 2020",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Institusi Kesehatan Pemerintah (Government Health Institution)",
        "year": 2020,
        "version": "Inpres No. 1/2017 & Panduan Teknis 2020",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": False,
        "grading_badge_label": "Pedoman nasional",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Konsensus Klinis",
        "evidence_grading_system": "Kebijakan Kesehatan Masyarakat",
        "evidence_grading_detail": "Dokumen ini merupakan pedoman kebijakan kesehatan masyarakat nasional (Inpres No. 1/2017 & Panduan Teknis Ditjen Kesmas), bukan telaah klinis dengan sistem grading formal (seperti GRADE).",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "supported_recommendations": [
            {
                "ruleId": "REC-GEN-01",
                "title": "Pertahankan kebiasaan sehat harian",
                "actionText": "Tetap aktif bergerak setiap hari minimal 30 menit dan periksa kesehatan berkala.",
            },
        ],
        "plain_summary": (
            "Membiasakan bergerak aktif minimal 30 menit setiap hari, memperbanyak porsi sayur dan buah, "
            "serta melakukan pemeriksaan kesehatan berkala merupakan pilar penting dalam mencegah penyakit tidak menular."
        ),
        "summary": (
            "Panduan GERMAS menetapkan pembudayaan aktivitas fisik minimal 30 menit sehari pada populasi usia produktif "
            "guna menurunkan beban penyakit kardiometabolik dan mempertahankan kebugaran jasmani."
        ),
        "clinical_section": "Bagian II: Pilar Pembudayaan Aktivitas Fisik dan Pengendalian Faktor Risiko",
        "citation": "Kementerian Kesehatan RI. Buku Panduan Pembudayaan Aktivitas Fisik GERMAS. Jakarta: Ditjen Kesmas, 2020.",
        "primary_citation": "Kementerian Kesehatan RI. Buku Panduan Pembudayaan Aktivitas Fisik Gerakan Masyarakat Hidup Sehat. Jakarta: Ditjen Kesmas, 2020.",
        "external_url": "https://ayosehat.kemkes.go.id/germas",
        "last_verified": "15 Jan 2026",
    },

    # ── 2. POLA TIDUR ───────────────────────────────────────────────────────
    {
        "id": "evi-03",
        "slug": "cdc-sleep-2013",
        "rule_id": "REC-SLP-01",
        "title": (
            "Sleep duration and chronic diseases among US adults age 45 years and older: "
            "evidence from the 2010 Behavioral Risk Factor Surveillance System"
        ),
        "title_translation": "Durasi Tidur dan Penyakit Kronis pada Orang Dewasa AS Usia 45 Tahun ke Atas: Bukti dari BRFSS 2010",
        "organization": "Centers for Disease Control and Prevention (CDC)",
        "short_org": "CDC",
        "publication": "Sleep, Vol. 36, No. 10, 2013",
        "evidence_type": "Penelitian",
        "evidence_type_category": "Publikasi Ilmiah (Peer-reviewed Scientific Publication)",
        "year": 2013,
        "version": "Survei BRFSS 2010 (54.000+ responden usia ≥ 45 tahun)",
        "evidence_level": "Level B (Sedang)",
        "has_formal_grading": False,
        "grading_badge_label": "Tanpa penilaian formal",
        "recommendation_strength": "Kondisional",
        "evidence_certainty": "Sedang",
        "evidence_grading_system": "Tinjauan Epidemiologi Observasional",
        "evidence_grading_detail": (
            "Studi observasional cross-sectional berskala besar berbasis populasi dewasa usia 45 tahun ke atas (n=54.269); "
            "memetakan korelasi durasi tidur dengan penyakit kronis tanpa sistem grading rekomendasi klinis formal seperti GRADE."
        ),
        "category": "sleep",
        "category_label": "Pola Tidur",
        "supported_recommendations": [
            {
                "ruleId": "REC-SLP-01",
                "title": "Tidur 7–9 jam per malam",
                "actionText": "Jaga jadwal tidur yang teratur dan cukupi waktu istirahat 7–9 jam per malam.",
            },
        ],
        "plain_summary": (
            "Berdasarkan analisis terhadap lebih dari 54.000 orang dewasa dari survei BRFSS di 14 negara bagian AS, "
            "durasi tidur pendek (< 7 jam per malam) maupun tidur panjang (≥ 10 jam) berkaitan dengan peningkatan "
            "risiko penyakit jantung koroner, stroke, dan diabetes bila dibandingkan dengan tidur cukup 7–9 jam. "
            "Studi ini meneliti orang dewasa usia 45 tahun ke atas dan menunjukkan hubungan, bukan sebab-akibat."
        ),
        "summary": (
            "Studi observasional cross-sectional berskala besar (n=54.269 dewasa usia ≥ 45 tahun dari 14 negara bagian AS) "
            "menemukan bahwa durasi tidur pendek (< 7 jam) secara independen berkaitan dengan prevalensi penyakit jantung koroner "
            "yang lebih tinggi (OR 1,67; 95% CI 1,35–2,05), stroke (OR 1,51), dan diabetes (OR 1,31). Durasi tidur panjang (≥ 10 jam) "
            "juga menunjukkan korelasi morbiditas serupa. Peneliti CDC menyimpulkan bahwa rentang 7–9 jam merupakan durasi tidur optimal "
            "bagi kesehatan kardiometabolik pada populasi dewasa paruh baya dan lanjut usia."
        ),
        "clinical_section": "Hasil & Diskusi: Asosiasi Multivariat Durasi Tidur terhadap Morbiditas Kardiometabolik Usia ≥ 45 Tahun",
        "citation": "Wheaton AG, Perry GS, Chapman DP, Croft JB. Sleep duration and chronic diseases among US adults age 45 years and older: evidence from the 2010 Behavioral Risk Factor Surveillance System. Sleep. 2013;36(10):1423-1433.",
        "primary_citation": "Wheaton AG, Perry GS, Chapman DP, Croft JB. Sleep duration and chronic diseases among US adults age 45 years and older: evidence from the 2010 Behavioral Risk Factor Surveillance System. Sleep. 2013;36(10):1423-1433.",
        "external_url": "https://doi.org/10.5665/sleep.3032",
        "last_verified": "20 Jan 2026",
        "doi": "10.5665/sleep.3032",
    },
    {
        "id": "evi-10",
        "slug": "cdc-sleep-mmwr-2016",
        "rule_id": "REC-SLP-01",
        "title": "Prevalensi Durasi Tidur Sehat pada Orang Dewasa: Laporan MMWR CDC",
        "title_translation": "Prevalence of Healthy Sleep Duration among Adults — United States, 2013",
        "organization": "Centers for Disease Control and Prevention (CDC)",
        "short_org": "CDC",
        "publication": "Morbidity and Mortality Weekly Report (MMWR), 2016;65(6):137–141",
        "evidence_type": "Laporan",
        "evidence_type_category": "Institusi Kesehatan Pemerintah (Government Health Institution)",
        "year": 2016,
        "version": "CDC MMWR Vol. 65, No. 6",
        "evidence_level": "Level B (Sedang)",
        "has_formal_grading": False,
        "grading_badge_label": "Laporan surveilans",
        "recommendation_strength": "Kondisional",
        "evidence_certainty": "Sedang",
        "evidence_grading_system": "Laporan Surveilans Kesehatan Masyarakat CDC",
        "evidence_grading_detail": "Laporan epidemiologi surveilans kesehatan masyarakat CDC berbasis data 444.306 responden dewasa; menetapkan rekomendasi tidur sehat minimal 7 jam per malam tanpa sistem GRADE formal.",
        "category": "sleep",
        "category_label": "Pola Tidur",
        "supported_recommendations": [
            {
                "ruleId": "REC-SLP-01",
                "title": "Tidur 7–9 jam per malam",
                "actionText": "Prioritaskan kecukupan istirahat 7–9 jam per malam untuk menjaga metabolisme tubuh.",
            },
        ],
        "plain_summary": (
            "Laporan surveilans CDC menemukan bahwa lebih dari sepertiga orang dewasa tidur kurang dari 7 jam per hari. "
            "Durasi tidur 7–9 jam dikaitkan dengan risiko obesitas, diabetes, dan tekanan darah tinggi yang lebih rendah."
        ),
        "summary": (
            "Laporan MMWR CDC menganalisis data surveilans nasional terhadap 444.306 responden dewasa di 50 negara bagian AS. "
            "CDC menegaskan bahwa tidur cukup minimal 7 jam (rentang 7–9 jam) esensial untuk kesehatan kardiovaskular dan metabolisme optimal."
        ),
        "clinical_section": "Hasil Surveilans Nasional Durasi Tidur Sehat Dewasa",
        "citation": "Liu Y, Wheaton AG, Chapman DP, Cunningham TJ, Lu H, Croft JB. Prevalence of Healthy Sleep Duration among Adults — United States, 2013. MMWR Morb Mortal Wkly Rep. 2016;65(6):137-141.",
        "primary_citation": "Liu Y, Wheaton AG, Chapman DP, Cunningham TJ, Lu H, Croft JB. Prevalence of Healthy Sleep Duration among Adults — United States, 2013. MMWR Morb Mortal Wkly Rep. 2016;65(6):137-141.",
        "external_url": "https://www.cdc.gov/mmwr/volumes/65/wr/mm6506a1.htm",
        "last_verified": "20 Jan 2026",
        "doi": "10.15585/mmwr.mm6506a1",
    },

    # ── 3. BERAT BADAN & NUTRISI ─────────────────────────────────────────────
    {
        "id": "evi-02",
        "slug": "perkeni-dm-2021",
        "rule_id": "REC-NUT-01",
        "title": "Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia",
        "organization": "Perkumpulan Endokrinologi Indonesia (PERKENI)",
        "short_org": "PERKENI",
        "publication": "PB PERKENI, 2021",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Organisasi Profesi Medis (Professional Medical Organization)",
        "year": 2021,
        "version": "Konsensus Nasional 2021 (ISBN 978-623-90934-8-8)",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": True,
        "grading_badge_label": "Rekomendasi kuat",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Tinggi",
        "evidence_grading_system": "Konsensus PERKENI",
        "evidence_grading_detail": "Rekomendasi kuat berbasis telaah bukti klinis uji acak terkendali (PERKENI Rekomendasi Tingkat A).",
        "category": "weight",
        "category_label": "Berat Badan & Nutrisi",
        "supported_recommendations": [
            {
                "ruleId": "REC-NUT-01",
                "title": "Atur porsi makan dan tambah serat",
                "actionText": "Kurangi karbohidrat olahan sederhana dan tingkatkan asupan serat 20–35 gram/hari.",
            },
        ],
        "plain_summary": (
            "Mengurangi konsumsi karbohidrat olahan dan minuman manis, memperbanyak porsi sayur serta makanan berserat, "
            "dan mengupayakan penurunan berat badan 5–10% pada kelebihan berat badan terbukti membantu memperbaiki sensitivitas insulin "
            "dan mencegah risiko diabetes melitus tipe 2."
        ),
        "summary": (
            "Terapi nutrisi medis menganjurkan pembatasan karbohidrat sederhana, kecukupan serat 20–35 g/hari dari sayur dan buah, "
            "serta reduksi berat badan 5–10% secara bertahap pada individu dengan obesitas atau overweight untuk menurunkan resistensi insulin."
        ),
        "clinical_section": "Bab IV: Terapi Nutrisi Medis dan Modifikasi Gaya Hidup",
        "citation": "PB PERKENI. Pedoman Pengelolaan dan Pencegahan DM Tipe 2 Dewasa di Indonesia 2021. Jakarta: PB PERKENI; 2021.",
        "primary_citation": "Pengurus Besar Perkumpulan Endokrinologi Indonesia (PB PERKENI). Pedoman Pengelolaan dan Pencegahan Diabetes Melitus Tipe 2 Dewasa di Indonesia 2021. Jakarta: PB PERKENI; 2021.",
        "external_url": "https://pbperkeni.or.id/",
        "last_verified": "10 Feb 2026",
    },
    {
        "id": "evi-09",
        "slug": "perkeni-dislipidemia-2021",
        "rule_id": "REC-LIP-01",
        "title": "Panduan Pengelolaan Dislipidemia di Indonesia",
        "organization": "Perkumpulan Endokrinologi Indonesia (PERKENI)",
        "short_org": "PERKENI",
        "publication": "PB PERKENI, 2021",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Organisasi Profesi Medis (Professional Medical Organization)",
        "year": 2021,
        "version": "Konsensus Nasional Dislipidemia 2021",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": True,
        "grading_badge_label": "Rekomendasi kuat",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Tinggi",
        "evidence_grading_system": "Konsensus PERKENI",
        "evidence_grading_detail": "Rekomendasi kuat berbasis telaah bukti uji klinis kardiovaskular (PERKENI Tingkat A).",
        "category": "weight",
        "category_label": "Berat Badan & Nutrisi",
        "supported_recommendations": [
            {
                "ruleId": "REC-NUT-01",
                "title": "Batasi lemak jenuh dan tambah serat larut",
                "actionText": "Batasi lemak jenuh (< 7% energi) dan perbanyak serat larut untuk mengontrol kolesterol.",
            },
        ],
        "plain_summary": (
            "Membatasi asupan makanan berlemak jenuh dan lemak trans, memperbanyak konsumsi serat larut, "
            "serta menjaga berat badan ideal membantu mengendalikan kadar kolesterol dan trigliserida dalam darah."
        ),
        "summary": (
            "Modifikasi gaya hidup melalui pembatasan lemak jenuh (< 7% dari total energi), eliminasi lemak trans, "
            "serta peningkatan asupan serat larut air terbukti memperbaiki profil lipid aterogenik."
        ),
        "clinical_section": "Bab 6: Terapi Non-Farmakologis dan Terapi Nutrisi Medis",
        "citation": "PB PERKENI. Panduan Pengelolaan Dislipidemia di Indonesia 2021. Jakarta: PB PERKENI; 2021.",
        "primary_citation": "Pengurus Besar Perkumpulan Endokrinologi Indonesia (PB PERKENI). Panduan Pengelolaan Dislipidemia di Indonesia 2021. Jakarta: PB PERKENI; 2021.",
        "external_url": "https://pbperkeni.or.id/",
        "last_verified": "15 Feb 2026",
    },
    {
        "id": "evi-06",
        "slug": "perki-hipertensi-2021",
        "rule_id": "REC-NUT-02",
        "title": "Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular",
        "organization": "Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PERKI)",
        "short_org": "PERKI",
        "publication": "PP PERKI, 2021",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Organisasi Profesi Medis (Professional Medical Organization)",
        "year": 2021,
        "version": "Edisi Kedua 2021",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": True,
        "grading_badge_label": "Rekomendasi kuat",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Tinggi",
        "evidence_grading_system": "Sistem Grading PERKI",
        "evidence_grading_detail": "Rekomendasi kuat berbasis uji klinis acak berkualitas tinggi (PERKI Kelas I, Tingkat Bukti A).",
        "category": "weight",
        "category_label": "Berat Badan & Nutrisi",
        "supported_recommendations": [
            {
                "ruleId": "REC-NUT-01",
                "title": "Batasi asupan garam dapur (< 5 g/hari)",
                "actionText": "Batasi asupan garam dapur (< 5 g atau 1 sdt/hari) dan perbanyak makanan kaya kalium.",
            },
        ],
        "plain_summary": (
            "Membatasi konsumsi garam hingga kurang dari satu sendok teh (5 gram garam dapur) per hari, "
            "menjaga berat badan sehat, dan memperbanyak konsumsi sayuran dapat membantu menurunkan tekanan darah secara bermakna."
        ),
        "summary": (
            "Restriksi asupan natrium harian (< 2 g natrium atau setara < 5 g NaCl), kepatuhan diet gizi seimbang, "
            "dan pengendalian lingkar pinggang direkomendasikan untuk pencegahan primer serta penurunan tekanan darah sistolik."
        ),
        "clinical_section": "Bab 5: Intervensi Non-Farmakologis Gaya Hidup dan Pola Makan",
        "citation": "PP PERKI. Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular. Jakarta: PP PERKI; 2021.",
        "primary_citation": "Pengurus Pusat Perhimpunan Dokter Spesialis Kardiovaskular Indonesia (PP PERKI). Pedoman Tata Laksana Hipertensi pada Penyakit Kardiovaskular. Jakarta: PP PERKI; 2021.",
        "external_url": "https://www.inaheart.org/",
        "last_verified": "18 Mar 2026",
    },

    # ── 4. KEBIASAAN MEROKOK ────────────────────────────────────────────────
    {
        "id": "evi-04",
        "slug": "kemenkes-ubm-2021",
        "rule_id": "REC-SMK-01",
        "title": "Pedoman Penyelenggaraan Upaya Berhenti Merokok (UBM) di Fasilitas Pelayanan Kesehatan Primer",
        "organization": "Kementerian Kesehatan RI & PERKI",
        "short_org": "Kemenkes RI & PERKI",
        "publication": "Direktorat Pencegahan dan Pengendalian PTM Kemenkes RI, 2021",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Institusi Kesehatan Pemerintah (Government Health Institution)",
        "year": 2021,
        "version": "Panduan Teknis UBM 2021",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": False,
        "grading_badge_label": "Pedoman nasional",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Tinggi",
        "evidence_grading_system": "Pedoman Pelayanan Klinis Primer",
        "evidence_grading_detail": "Pedoman teknis operasional penatalaksanaan berhenti merokok di FKTP; disusun melalui konsensus pakar kedokteran dan program kementerian tanpa skala GRADE formal.",
        "category": "smoking",
        "category_label": "Kebiasaan Merokok",
        "supported_recommendations": [
            {
                "ruleId": "REC-SMK-01",
                "title": "Kurangi rokok hingga berhenti total",
                "actionText": "Kurangi konsumsi rokok secara bertahap menuju penghentian total.",
            },
        ],
        "plain_summary": (
            "Berhenti merokok merupakan langkah terpenting dalam melindungi kesehatan jantung dan pembuluh darah. "
            "Manfaat penurunan risiko kardiovaskular mulai terasa sejak minggu-minggu awal dan terus membaik seiring berjalannya waktu bebas rokok."
        ),
        "summary": (
            "Penghentian konsumsi tembakau secara total merupakan intervensi preventif paling efektif untuk memulihkan "
            "elastisitas vaskular, menurunkan agregasi platelet, dan memangkas risiko kejadian koroner akut hingga 50% "
            "dalam 1–2 tahun pasca berhenti."
        ),
        "clinical_section": "Bab III: Konseling Perilaku dan Tahapan Pendampingan Upaya Berhenti Merokok",
        "citation": "Kemenkes RI & PP PERKI. Pedoman Upaya Berhenti Merokok di FKTP. Jakarta: Kemenkes RI; 2021.",
        "primary_citation": "Kementerian Kesehatan RI & PP PERKI. Pedoman Penyelenggaraan Upaya Berhenti Merokok di Fasilitas Pelayanan Kesehatan Primer. Jakarta: Kemenkes RI; 2021.",
        "external_url": "https://p2ptm.kemkes.go.id/",
        "last_verified": "05 Mar 2026",
    },

    # ── 5. KONSULTASI MEDIS ─────────────────────────────────────────────────
    {
        "id": "evi-07",
        "slug": "kemenkes-ptm-fktp-2022",
        "rule_id": "REC-SAFETY-01",
        "title": "Pedoman Teknis Penemuan dan Tata Laksana Faktor Risiko Penyakit Tidak Menular di FKTP",
        "organization": "Kementerian Kesehatan RI",
        "short_org": "Kemenkes RI",
        "publication": "Direktorat Pencegahan dan Pengendalian PTM, 2022",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Institusi Kesehatan Pemerintah (Government Health Institution)",
        "year": 2022,
        "version": "Edisi Pengendalian PTM 2022",
        "evidence_level": "Level A (Kuat)",
        "has_formal_grading": False,
        "grading_badge_label": "Standar pelayanan primer",
        "recommendation_strength": "Kuat",
        "evidence_certainty": "Konsensus Klinis",
        "evidence_grading_system": "Standar Pelayanan Primer Kemenkes",
        "evidence_grading_detail": "Standar operasional prosedur klinis skrining dan rujukan faskes tingkat pertama; disusun berbasis regulasi pelayanan kesehatan nasional.",
        "category": "consultation",
        "category_label": "Konsultasi Medis",
        "supported_recommendations": [
            {
                "ruleId": "REC-SAFETY-01",
                "title": "Konsultasi dengan dokter",
                "actionText": "Lakukan pemeriksaan medis langsung dan uji laboratorium penunjang.",
            },
        ],
        "plain_summary": (
            "Ketika estimasi risiko kesehatan berada pada kategori tinggi, pemeriksaan tatap muka dengan dokter "
            "sangat disarankan untuk melakukan konfirmasi fisik dan pemeriksaan laboratorium darah secara objektif sebelum memulai perubahan intensif."
        ),
        "summary": (
            "Individu dengan klaster faktor risiko kardiometabolik tinggi memerlukan konfirmasi klinis dokter, pemeriksaan "
            "gula darah puasa, profil lipid terstandar, dan evaluasi tekanan darah berbasis faskes sebelum stratifikasi intervensi lanjutan."
        ),
        "clinical_section": "Bab 2: Kriteria Rujukan Skrining dan Tata Laksana PTM Terpadu di FKTP",
        "citation": "Kemenkes RI. Pedoman Teknis Penemuan PTM di FKTP. Jakarta: Ditjen P2P; 2022.",
        "primary_citation": "Kementerian Kesehatan RI. Pedoman Teknis Penemuan dan Tata Laksana Penyakit Tidak Menular di Fasilitas Kesehatan Tingkat Pertama. Jakarta: Ditjen P2P; 2022.",
        "external_url": "https://kemkes.go.id/",
        "last_verified": "25 Mar 2026",
    },

    # ── 6. MANAJEMEN STRES ──────────────────────────────────────────────────
    {
        "id": "evi-05",
        "slug": "kemenkes-stres-2022",
        "rule_id": "REC-STR-01",
        "title": "Pedoman Pengelolaan Stres Psikososial pada Pelayanan Kesehatan Primer",
        "organization": "Kementerian Kesehatan RI",
        "short_org": "Kemenkes RI",
        "publication": "Direktorat Kesehatan Jiwa Kemenkes RI, 2022",
        "evidence_type": "Pedoman",
        "evidence_type_category": "Institusi Kesehatan Pemerintah (Government Health Institution)",
        "year": 2022,
        "version": "Panduan Pengelolaan Stres Dewasa 2022",
        "evidence_level": "Level B (Sedang)",
        "has_formal_grading": False,
        "grading_badge_label": "Pedoman teknis",
        "recommendation_strength": "Kondisional",
        "evidence_certainty": "Sedang",
        "evidence_grading_system": "Pedoman Teknis Kesehatan Jiwa Kemenkes",
        "evidence_grading_detail": "Pedoman teknis tata laksana stres psikososial berbasis intervensi relaksasi pernapasan primer; tidak dinilai dengan skala GRADE formal.",
        "category": "stress",
        "category_label": "Manajemen Stres",
        "supported_recommendations": [
            {
                "ruleId": "REC-STR-01",
                "title": "Latihan napas 10 menit sehari",
                "actionText": "Gunakan teknik relaksasi pernapasan ritmik untuk meredakan ketegangan fisik.",
            },
        ],
        "plain_summary": (
            "Stres pikiran yang berlangsung lama dapat memicu ketegangan fisik dan detak jantung yang meningkat. "
            "Meluangkan waktu 10 menit sehari untuk latihan pernapasan perlahan membantu memberi sinyal tenang pada tubuh dan menstabilkan rasa nyaman."
        ),
        "summary": (
            "Intervensi pernapasan lambat teratur (mindful breathing / pacing breath) terbukti membantu menstimulasi "
            "aktivitas sistem saraf parasimpatis, meredakan ketegangan neuromuskular, dan menstabilkan variabilitas detak nadi."
        ),
        "clinical_section": "Modul 3: Teknik Regulasi Relaksasi Pernapasan untuk Kebugaran Fisik dan Mental",
        "citation": "Kemenkes RI. Pedoman Pengelolaan Stres Psikososial. Jakarta: Ditjen Keswa; 2022.",
        "primary_citation": "Kementerian Kesehatan RI. Pedoman Pengelolaan Stres Psikososial bagi Tenaga Kesehatan dan Masyarakat. Jakarta: Direktorat Kesehatan Jiwa; 2022.",
        "external_url": "https://ayosehat.kemkes.go.id/",
        "last_verified": "12 Mar 2026",
    },
]


class EvidenceService:
    """Service handling clinical evidence catalog operations."""

    @classmethod
    def list_evidence(
        cls,
        category: str | None = None,
        rule_id: str | None = None,
        search: str | None = None,
    ) -> EvidenceListResponse:
        """Filter and retrieve verified clinical evidence items."""
        results = CLINICAL_EVIDENCE_REGISTRY

        if category and category.lower() != "all":
            cat_lower = category.lower()
            # Normalize legacy category aliases
            if cat_lower == "nutrition":
                cat_lower = "weight"
            results = [e for e in results if e["category"].lower() == cat_lower]

        if rule_id:
            rule_lower = rule_id.lower()
            results = [e for e in results if e["rule_id"].lower() == rule_lower]

        if search:
            query = search.lower().strip()
            results = [
                e
                for e in results
                if query in e["title"].lower()
                or query in e["organization"].lower()
                or query in e["summary"].lower()
                or query in (e.get("plain_summary") or "").lower()
                or query in e["rule_id"].lower()
                or query in e["citation"].lower()
                or query in (e.get("slug") or "").lower()
            ]

        items = [ClinicalEvidenceItem(**raw) for raw in results]
        return EvidenceListResponse(items=items, total=len(items))


evidence_service = EvidenceService()
