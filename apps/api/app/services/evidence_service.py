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
