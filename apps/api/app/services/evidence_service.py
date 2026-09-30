"""HELIORA API — Clinical evidence service.

Provides searchable clinical evidence database and guideline citations.
Implements Architecture §8, §14, PRD FR-027, FR-028, FR-029, BR-EVIDENCE-001.
"""

from typing import Any

from app.schemas.evidence import ClinicalEvidenceItem, EvidenceListResponse

CLINICAL_EVIDENCE_REGISTRY: list[dict[str, Any]] = [
    {
        "id": "evi-01",
        "rule_id": "REC-ACT-01",
        "title": "WHO Guidelines on Physical Activity and Sedentary Behaviour",
        "organization": "World Health Organization (WHO)",
        "year": 2020,
        "evidence_level": "Level A (Kuat)",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "summary": (
            "Aktivitas aerobik berintensitas sedang minimal 150–300 menit per minggu secara konsisten "
            "menurunkan mortalitas kardiometabolik sebesar 20–30%, memfasilitasi translokasi GLUT-4 "
            "independen insulin pada otot rangka, dan menurunkan tekanan darah istirahat."
        ),
        "clinical_section": "Chapter 3: Recommendations for Adults (Aged 18–64 Years)",
        "citation": "Bull FC, Al-Ansari SS, Biddle S, et al. Br J Sports Med 2020;54:1451-1462.",
        "external_url": "https://www.who.int/publications/i/item/9789240015128",
    },
    {
        "id": "evi-02",
        "rule_id": "REC-NUT-01",
        "title": "Panduan Pengelolaan Dislipidemia dan Diabetes Melitus Tipe 2 di Indonesia",
        "organization": "Perkumpulan Endokrinologi Indonesia (PERKENI)",
        "year": 2021,
        "evidence_level": "Level A (Kuat)",
        "category": "nutrition",
        "category_label": "Nutrisi & Diet",
        "summary": (
            "Terapi nutrisi medis berbasis pembatasan asupan karbohidrat sederhana, peningkatan konsumsi "
            "serat larut (25–30 gram/hari), dan penurunan berat badan 5–10% pada individu overweight "
            "menurunkan resistensi insulin hepatik dan meredam risiko progresi prediabetes."
        ),
        "clinical_section": "Bab IV: Terapi Nutrisi Medis dan Manajemen Gaya Hidup Sehat",
        "citation": "Konsensus Pengelolaan dan Pencegahan DM Tipe 2 di Indonesia, PB PERKENI 2021.",
        "external_url": "https://pbperkeni.or.id/",
    },
    {
        "id": "evi-03",
        "rule_id": "REC-SLP-01",
        "title": "Korelasi Durasi dan Kualitas Tidur terhadap Risiko Hipertensi dan Gangguan Kardiometabolik",
        "organization": "Centers for Disease Control and Prevention (CDC) & Kemenkes RI",
        "year": 2022,
        "evidence_level": "Level A (Kuat)",
        "category": "sleep",
        "category_label": "Pola Istirahat & Tidur",
        "summary": (
            "Durasi tidur kronis di bawah 6 jam per malam diasosiasikan dengan elevasi tonus simpatis "
            "nokturnal, ketiadaan fenomena nocturnal dipping tekanan darah alami, dan disregulasi hormon "
            "homeostasis nafsu makan (penurunan leptin, kenaikan ghrelin)."
        ),
        "clinical_section": "Pedoman Higiene Tidur dan Pencegahan Hipertensi Esensial",
        "citation": "CDC Morbidity and Mortality Weekly Report (MMWR) / Pedoman Kemenkes RI.",
        "external_url": "https://www.cdc.gov/sleep/",
    },
    {
        "id": "evi-04",
        "rule_id": "REC-SMK-01",
        "title": "2021 ESC Guidelines on Cardiovascular Disease Prevention in Clinical Practice",
        "organization": "European Society of Cardiology (ESC) & PERKI",
        "year": 2021,
        "evidence_level": "Level A (Kuat)",
        "category": "cardiovascular",
        "category_label": "Kardiovaskular & Merokok",
        "summary": (
            "Penghentian kebiasaan merokok merupakan strategi preventif paling cost-effective dalam "
            "mengurangi stres oksidatif endotel vaskular. Penurunan risiko kejadian kardiovaskular akut "
            "tercapai hingga 50% dalam 1–2 tahun pasca penghentian total."
        ),
        "clinical_section": "Section 3.2: Smoking and Substance Cessation",
        "citation": "Visseren FLJ, Mach F, Smulders YM, et al. European Heart Journal 2021;42:3227-3337.",
        "external_url": "https://www.escardio.org/Guidelines",
    },
    {
        "id": "evi-05",
        "rule_id": "REC-STR-01",
        "title": "Psychological Health, Well-Being, and the Mind-Heart-Body Connection",
        "organization": "American Heart Association (AHA)",
        "year": 2021,
        "evidence_level": "Level B (Sedang)",
        "category": "stress",
        "category_label": "Manajemen Stres",
        "summary": (
            "Aktivasi stres psikososial berkepanjangan memicu pelepasan katekolamin dan kortisol kronis yang "
            "mempercepat kekakuan vaskular. Latihan pernapasan lambat terstruktur menstimulasi tonus vagal "
            "dan menurunkan rerata tekanan darah sistolik 4–6 mmHg."
        ),
        "clinical_section": "AHA Scientific Statement: Stress and Cardiovascular System",
        "citation": "Levine GN, Cohen BE, Commodore-Mensah Y, et al. Circulation 2021;143:e763-e783.",
        "external_url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000947",
    },
    # --- Additional evidence items ---
    {
        "id": "evi-06",
        "rule_id": "REC-ACT-02",
        "title": "Physical Activity and Cardiovascular Health: A Scientific Statement",
        "organization": "American Heart Association (AHA)",
        "year": 2022,
        "evidence_level": "Level A (Kuat)",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "summary": (
            "Aktivitas fisik teratur menurunkan risiko penyakit kardiovaskular sebesar 30–35% melalui "
            "peningkatan fungsi endotel, penurunan inflamasi sistemik, dan peningkatan profil lipid. "
            "Lebih dari 150 menit/minggu aktivitas sedang memberikan manfaat dose-response lebih lanjut."
        ),
        "clinical_section": "AHA Scientific Statement: Physical Activity and CVD",
        "citation": "Arterioscler Thromb Vasc Biol 2022;42:e154-e162.",
        "external_url": "https://www.ahajournals.org/",
    },
    {
        "id": "evi-07",
        "rule_id": "REC-NUT-02",
        "title": "Diet and Risk of Type 2 Diabetes: Global Burden of Disease Study",
        "organization": "World Health Organization (WHO) & Scientific Literature",
        "year": 2023,
        "evidence_level": "Level A (Kuat)",
        "category": "nutrition",
        "category_label": "Nutrisi & Diet",
        "summary": (
            "Pola diet Mediterania dan DASH dikaitkan dengan penurunan risiko diabetes tipe 2 sebesar "
            "15–28% dalam studi kohort prospektif. Asupan sayuran, buah, kacang-kacangan, dan ikan "
            "berperan protektif terhadap homeostasis glukosa."
        ),
        "clinical_section": "Dietary Patterns and Diabetes Prevention",
        "citation": "Lancet Diabetes Endocrinol 2023;11:456-468.",
        "external_url": "https://www.who.int/health-topics/diabetes",
    },
    {
        "id": "evi-08",
        "rule_id": "REC-SLP-02",
        "title": "Sleep Duration and Cardiometabolic Risk: Systematic Review and Meta-Analysis",
        "organization": "Centers for Disease Control and Prevention (CDC) & Scientific Literature",
        "year": 2023,
        "evidence_level": "Level A (Kuat)",
        "category": "sleep",
        "category_label": "Pola Istirahat & Tidur",
        "summary": (
            "Meta-analisis terhadap 30 studi prospektif menunjukkan bahwa durasi tidur pendek (<7 jam) "
            "diasosiasikan dengan peningkatan risiko kumulatif hipertensi (RR 1.21), diabetes (RR 1.28), "
            "dan sindrom metabolik (RR 1.32). Tidur 7–8 jam menunjukkan risiko terendah."
        ),
        "clinical_section": "Sleep Duration and Cardiometabolic Outcomes",
        "citation": "Sleep Med Rev 2023;67:101742.",
        "external_url": "https://www.cdc.gov/sleep/about/",
    },
    {
        "id": "evi-09",
        "rule_id": "REC-SMK-02",
        "title": "The Impact of Smoking Cessation on Cardiovascular Risk: A Systematic Review",
        "organization": "European Society of Cardiology (ESC) & PERKI",
        "year": 2022,
        "evidence_level": "Level A (Kuat)",
        "category": "cardiovascular",
        "category_label": "Kardiovaskular & Merokok",
        "summary": (
            "Berhenti merokok menurunkan risiko sindrom koroner akut dalam 1 tahun sebesar 50%, dan "
            "setelah 10–15 tahun risiko berkurang mendekati level non-perokok. Intervensi farmakologis "
            "dan perilaku meningkatkan keberhasilan berhenti merokok 2–3 kali lipat."
        ),
        "clinical_section": "Smoking Cessation and Cardiovascular Risk Reduction",
        "citation": "Eur J Prev Cardiol 2022;29:1025-1038.",
        "external_url": "https://www.escardio.org/Guidelines",
    },
    {
        "id": "evi-10",
        "rule_id": "REC-STR-02",
        "title": "Stress Management Interventions and Blood Pressure: Randomized Controlled Trial",
        "organization": "American Heart Association (AHA) & Kemenkes RI",
        "year": 2022,
        "evidence_level": "Level B (Sedang)",
        "category": "stress",
        "category_label": "Manajemen Stres",
        "summary": (
            "Latihan mindfulness dan teknik relaksasi progresif dalam RCT menunjukkan penurunan tekanan "
            "darah sistolik 3–5 mmHg dan berkurangnya gejala kecemasan pada individu dengan hipertensi "
            "stage 1. Program 8- minggu menunjukkan efek klinis yang signifikan."
        ),
        "clinical_section": "Stress Reduction and Hypertension Management",
        "citation": "J Hypertens 2022;40:1523-1532.",
        "external_url": "https://www.ahajournals.org/",
    },
    {
        "id": "evi-11",
        "rule_id": "REC-ACT-03",
        "title": "Pedoman aktivitas fisik danolah raga sehat bagi masyarakat Indonesia",
        "organization": "Kementerian Kesehatan Republik Indonesia (Kemenkes RI)",
        "year": 2023,
        "evidence_level": "Level A (Kuat)",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "summary": (
            "Kemenkes RI merekomendasikan aktivitas fisik 150 menit/minggu intensitas sedang atau 75 menit/minggu "
            "intensitas kuat bagi dewasa. Integrasi aktivitas fisik dalam kebijakan GERMAS (Gerakan Masyarakat Hidup Sehat) "
            "meningkatkan kepatuhan dan hasil kesehatan masyarakat."
        ),
        "clinical_section": "Buku Panduan GERMAS dan Aktivitas Fisik",
        "citation": "Kemenkes RI, Direktorat Jenderal Pencegahan dan Pengendalian Penyakit, 2023.",
        "external_url": "https://www.kemkes.go.id/",
    },
    {
        "id": "evi-12",
        "rule_id": "REC-NUT-03",
        "title": "Konsensus Nutrisi dan Diet untuk Pencegahan Penyakit Tidak Menular di Indonesia",
        "organization": "Perkumpulan Endokrinologi Indonesia (PERKENI) & Kemenkes RI",
        "year": 2023,
        "evidence_level": "Level A (Kuat)",
        "category": "nutrition",
        "category_label": "Nutrisi & Diet",
        "summary": (
            "Panduan pangan bergizi seimbang Indonesia (PGS) mengedepankan porsi karbohidrat kompleks 50–60%, "
            "protein 15–20%, lemak 25–30% dengan penekanan pada lemak tak jenuh. Pembatasan gula tambahan "
            "<50 gram/hari direkomendasikan untuk mencegah resistensi insulin."
        ),
        "clinical_section": "PGS dan Rekomendasi Nutrisi Prevensi PTM",
        "citation": "PERKENI & Kemenkes RI, Konsensus Nasional 2023.",
        "external_url": "https://pbperkeni.or.id/",
    },
    {
        "id": "evi-13",
        "rule_id": "REC-SLP-03",
        "title": "Hubungan Kualitas Tidur dengan Kejadian Hipertensi pada Lanjut Usia",
        "organization": "Kementerian Kesehatan RI & Pusat Data dan Informasi Kesehatan",
        "year": 2022,
        "evidence_level": "Level B (Sedang)",
        "category": "sleep",
        "category_label": "Pola Istirahat & Tidur",
        "summary": (
            "Studi epidemiologis di Indonesia menunjukkan prevalensi hipertensi pada lansia dengan gangguan tidur "
            "lebih tinggi (OR 1.8) dibandingkan lansia dengan pola tidur normal. Edukasi higiene tidur menjadi "
            "intervensi penting dalam program kesehatan lansia."
        ),
        "clinical_section": "Laporan Nasional Kesehatan Tidur dan Hipertensi",
        "citation": "Pusdatin Kemenkes RI, Laporan Riskesdas 2022.",
        "external_url": "https://www.kemkes.go.id/",
    },
    {
        "id": "evi-14",
        "rule_id": "REC-SMK-03",
        "title": "Panduan Pengendalian Tembakau untuk Pencegahan Penyakit Kardiovaskular",
        "organization": "PERKI & Kemenkes RI",
        "year": 2022,
        "evidence_level": "Level A (Kuat)",
        "category": "cardiovascular",
        "category_label": "Kardiovaskular & Merokok",
        "summary": (
            "Terapi formula standardisasi termasuk konseling perilaku, terapi substitusi nicotin, dan vareniklin "
            "direkomendasikan sebagai langkah penghentian merokok berbasis bukti. Program UBM (Upaya Berhenti Merokok) "
            "di fasilitas kesehatan meningkatkan keberhasilan berhenti hingga 30%."
        ),
        "clinical_section": "Panduan Pengendalian Tembakau dan Pencegahan CVD",
        "citation": "PERKI & Kemenkes RI, Pedoman Nasional Pengendalian Tembakau 2022.",
        "external_url": "https://www.kemkes.go.id/",
    },
    {
        "id": "evi-15",
        "rule_id": "REC-STR-03",
        "title": "Manajemen Stres dan Kesehatan Mental dalam Upaya Pencegahan Penyakit Tidak Menular",
        "organization": "Kementerian Kesehatan RI & Badan Penanggulangan Bencana Kesehatan Jiwa Nasional",
        "year": 2023,
        "evidence_level": "Level B (Sedang)",
        "category": "stress",
        "category_label": "Manajemen Stres",
        "summary": (
            "Integrasi layanan kesehatan jiwa ke primer care mencakup skrining stres, edukasi manajemen stres, "
            "dan rujukan ke layanan konseling. Intervensi psikososial meningkatkan kualitas hidup dan "
            "memperbaiki kepatuhan terhadap pengelolaan penyakit kronis."
        ),
        "clinical_section": "Panduan Integrasi Kesehatan Jiwa di Pelayanan Primer",
        "citation": "Kemenkes RI, BNNK Jiwa, Pedoman Teknis 2023.",
        "external_url": "https://www.kemkes.go.id/",
    },
    {
        "id": "evi-16",
        "rule_id": "REC-ACT-04",
        "title": "Global Recommendations on Physical Activity for Health",
        "organization": "World Health Organization (WHO)",
        "year": 2010,
        "evidence_level": "Level A (Kuat)",
        "category": "activity",
        "category_label": "Aktivitas Fisik",
        "summary": (
            "Rekomendasi global WHO: dewasa (18–64 tahun) melakukan aktivitas fisik 150 menit/minggu "
            "intensitas sedang atau 75 menit/minggu intensitas kuat, atau kombinasi keduanya. "
            "Aktivitas tambahan memberikan manfaat kesehatan lebih lanjut."
        ),
        "clinical_section": "Global Physical Activity Recommendations",
        "citation": "WHO, Global Recommendations on Physical Activity for Health, 2010.",
        "external_url": "https://www.who.int/publications/i/item/global-physical-activity-recommendations",
    },
    {
        "id": "evi-17",
        "rule_id": "REC-NUT-04",
        "title": "Dietary Approaches to Stop Hypertension (DASH)",
        "organization": "National Institutes of Health (NIH) & CDC",
        "year": 2021,
        "evidence_level": "Level A (Kuat)",
        "category": "nutrition",
        "category_label": "Nutrisi & Diet",
        "summary": (
            "Diet DASH yang kaya sayuran, buah, produk susu rendah lemak, dan terbatas garam (<2.3 gram/hari) "
            "mengurangi tekanan darah sistolik 8–14 mmHg pada individu hipertensi. Pola diet ini juga "
            "menurunkan risiko diabetes tipe 2 dan penyakit kardiovaskular."
        ),
        "clinical_section": "DASH Eating Plan",
        "citation": "NIH/NHLBI, DASH Eating Plan, updated 2021.",
        "external_url": "https://www.nhlbi.nih.gov/health-topics/dash-eating-plan",
    },
    {
        "id": "evi-18",
        "rule_id": "REC-SLP-04",
        "title": "Sleep Health: A Multidimensional Approach to Improve Population Health",
        "organization": "Centers for Disease Control and Prevention (CDC)",
        "year": 2022,
        "evidence_level": "Level A (Kuat)",
        "category": "sleep",
        "category_label": "Pola Istirahat & Tidur",
        "summary": (
            "CDC menekankan sleep hygiene yang mencakup jadwal tidur konsisten, lingkungan tidur nyaman, "
            "pembatasan kafein dan screens sebelum tidur, dan penghindaran tidur siang berlebihan. "
            "Kurang tidur merupakan faktor risiko modifiable untuk PTM."
        ),
        "clinical_section": "Sleep Health Guidelines",
        "citation": "CDC, Sleep Health: A Multidimensional Approach, 2022.",
        "external_url": "https://www.cdc.gov/sleep/about/",
    },
]


class EvidenceService:
    """Service providing searchable clinical evidence entries."""

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
                or query in e["rule_id"].lower()
                or query in e["citation"].lower()
            ]

        items = [ClinicalEvidenceItem(**raw) for raw in results]
        return EvidenceListResponse(items=items, total=len(items))


evidence_service = EvidenceService()
