# 04: BE Medical Disclaimer and Risk Metric Standardization

**What to build:** The backend consent and assessment contract schemas must strictly follow regulatory and product requirements. The default medical disclaimer string served by the consent status API must match the official regulatory wording verbatim. In assessment result schemas, the risk score metric must adhere to product guidelines specifying "estimated risk score" instead of clinical probability claims, and risk level classifications must provide standardized categorical labels aligned with clinical design guidelines.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Default medical disclaimer text in consent contracts matches the exact mandated wording: "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi dokter."
- [ ] Risk assessment response schemas expose the risk metric as an estimated risk score without presenting uncalibrated model outputs as verified probabilities.
- [ ] Categorical risk level identifiers and labels conform to standardized design classification tokens ("Lower", "Moderate", "Higher").
- [ ] Automated schema serialization and contract validation tests pass cleanly.
