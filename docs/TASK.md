# HELIORA

# Task Management & Development Backlog

**Project:** HELIORA  
**Document:** Task Management & Development Backlog  
**Version:** 1.0  
**Status:** Active Development  
**Project Type:** Competition MVP  
**Development Period:** 16 August – 24 October 2026

---

# 1. Document Control

## 1.1 Purpose

`TASK.md` merupakan execution blueprint HELIORA yang digunakan untuk menerjemahkan:

- `PRD.md`
- `Design.md`
- `Architecture.md`
- `Database.md`
- AI Architecture
- MVP Roadmap

menjadi pekerjaan teknis dan non-teknis yang dapat dikerjakan oleh tim.

Dokumen ini digunakan sebagai:

- development backlog;
- pembagian pekerjaan;
- tracking progress;
- sprint planning;
- dependency management;
- quality control;
- release checklist.

`TASK.md` tidak menggantikan PRD, Design, Architecture, atau Database documentation.

---



## 1.2 Source of Truth

Urutan sumber kebenaran proyek:

```text
PRD.md
   ↓
Design.md
   ↓
Architecture.md
   ↓
Database.md
   ↓
TASK.md
   ↓
Implementation
```

Apabila terdapat konflik:

1. Product requirement mengikuti `PRD.md`.
2. UI/UX mengikuti `Design.md`.
3. System architecture mengikuti `Architecture.md`.
4. Database mengikuti `Database.md`.
5. Task disesuaikan dengan keempat dokumen tersebut.

---



# 2. Team & Ownership



## 2.1 Team Structure


| Team                   | Member         | Primary Responsibility                         |
| ---------------------- | -------------- | ---------------------------------------------- |
| Product & Architecture | Angga          | Product, Research, Architecture, Documentation |
| Backend & AI           | Gilang & Aksal | Backend, Database, AI/ML, QA & Security        |
| Frontend & DevOps      | Pino & Tumir   | Frontend, DevOps, QA & Security                |


---



## 2.2 Role Ownership



### Angga

Primary:

- Product & Project Manager
- Business Analyst & Research
- Solution Architect
- Documentation & Presentation

Responsibilities:

- product vision;
- product requirements;
- research;
- problem validation;
- roadmap;
- architecture coordination;
- documentation;
- presentation;
- demo narrative.

---



### Gilang & Aksal

Primary:

- Solution Architect
- Backend Engineer
- AI/ML Engineer
- Database Engineer
- Quality Assurance & Security

Responsibilities:

- FastAPI backend;
- PostgreSQL;
- database implementation;
- AI/ML pipeline;
- risk engine;
- SHAP;
- simulation engine;
- recommendation engine;
- RAG;
- LLM integration;
- backend testing;
- security testing.

---



### Pino & Tumir

Primary:

- Frontend Engineer
- DevOps & Deployment
- Quality Assurance & Security

Responsibilities:

- Next.js frontend;
- UI implementation;
- Design System implementation;
- frontend state management;
- frontend-backend integration;
- deployment;
- CI/CD;
- environment configuration;
- frontend testing;
- integration testing.

---



# 3. Task Management



## 3.1 Task Status

```text
BACKLOG
   ↓
READY
   ↓
IN PROGRESS
   ↓
REVIEW
   ↓
TESTING
   ↓
DONE
```


| Status        | Definition                                              |
| ------------- | ------------------------------------------------------- |
| `BACKLOG`     | Task sudah teridentifikasi tetapi belum siap dikerjakan |
| `READY`       | Requirement dan dependency sudah jelas                  |
| `IN PROGRESS` | Task sedang dikerjakan                                  |
| `REVIEW`      | Implementasi selesai dan menunggu review                |
| `TESTING`     | Sedang dilakukan pengujian                              |
| `DONE`        | Acceptance criteria terpenuhi                           |


---



## 3.2 Priority


| Priority | Definition                                 |
| -------- | ------------------------------------------ |
| `P0`     | Critical, wajib untuk MVP                  |
| `P1`     | High, sangat penting untuk MVP             |
| `P2`     | Medium, dikerjakan jika waktu memungkinkan |
| `P3`     | Low, future/stretch goal                   |


---



## 3.3 Task ID Convention

```text
PROD-xxx    Product
RES-xxx     Research
ARC-xxx     Architecture
DB-xxx      Database
BE-xxx      Backend
AI-xxx      AI/ML
XAI-xxx     Explainable AI
SIM-xxx     Simulation
REC-xxx     Recommendation
RAG-xxx     RAG
LLM-xxx     LLM
FE-xxx      Frontend
MOB-xxx     Mobile
INT-xxx     Integration
QA-xxx      Quality Assurance
SEC-xxx     Security
DEV-xxx     DevOps
DOC-xxx     Documentation
PRES-xxx    Presentation
DEMO-xxx    Demo
```

---



# 4. Foundation Tasks



## 4.1 Repository & Development Environment



### SETUP-001 — Repository Setup

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Create GitHub repository.
- [x] Configure branch strategy.
- [x] Create development branch.
- [x] Configure `.gitignore`.
- [x] Configure commit convention.
- [x] Create initial README.
- [x] Define project structure.

Acceptance Criteria:

- Repository dapat diakses seluruh anggota.
- Branch strategy tersedia.
- Tidak ada secret dalam repository.
- Project dapat di-clone.

---



### SETUP-002 — Frontend Environment

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Initialize Next.js.
- [x] Configure TypeScript.
- [x] Configure styling.
- [x] Configure environment variables.
- [x] Configure development scripts.
- [x] Verify local build.

Acceptance Criteria:

- Next.js dapat dijalankan.
- Development server berjalan.
- Production build berhasil.

---



### SETUP-003 — Backend Environment

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Initialize FastAPI.
- [x] Configure Python environment.
- [x] Configure dependencies.
- [x] Configure environment variables.
- [x] Create application structure.
- [x] Create health check endpoint.

Acceptance Criteria:

- FastAPI dapat dijalankan.
- Health check endpoint tersedia.
- Environment dapat direplikasi oleh anggota tim.

---



### SETUP-004 — Database Environment

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Setup PostgreSQL.
- [x] Configure database connection.
- [x] Configure migration.
- [x] Configure local database.
- [x] Test connection.

Acceptance Criteria:

- PostgreSQL berjalan.
- FastAPI dapat terhubung ke database.
- Migration dapat dijalankan.

---



### SETUP-005 — SOP Alur Kerja Issue & Template GitHub

**Owner:** Pino
**Priority:** P0
**Sprint:** S1
**Status:** DONE
**Issue:** #12

Tasks:

- [x] Write SOP issue workflow document (`docs/SOP-Issue-Workflow.md`).
- [x] Add feature/bug issue templates and correct legacy template.
- [x] Add branch protection guide and setup script for `main`.
- [x] Record `/code-review` slash command guide.

Acceptance Criteria:

- Dokumen panduan alur kerja (`docs/SOP-Issue-Workflow.md`) tersedia di repositori.
- Template GitHub Issue (`feature_task.md` & `bug_report.md`) dibuat dengan kolom wajib: Type, Platform, Priority, Assignee, Acceptance Criteria.
- GitHub Ruleset / Branch Protection untuk branch `main` terdokumentasi (wajib PR, CI hijau, squash merge; `develop` tidak ada di repo ini).
- Panduan slash command `/code-review` untuk self-review developer tercatat di repositori.

---



# 5. Product & Research Tasks



## RES-001 — Problem Validation

**Owner:** Angga  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Validate preventive health problem.
- [x] Review supporting evidence.
- [x] Validate target user.
- [x] Validate lifestyle-related risk problem.
- [x] Document findings.

Acceptance Criteria:

- Problem statement memiliki supporting evidence.
- Target user jelas.
- Research terdokumentasi.

---



## RES-002 — Dataset Research

**Owner:** Angga + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S1-S2  
**Status:** DONE

Tasks:

- [x] Review candidate datasets.
- [x] Evaluate feature availability.
- [x] Evaluate target variables.
- [x] Evaluate data quality.
- [x] Evaluate licensing.
- [x] Determine primary dataset.
- [x] Document dataset decision.

Primary candidate:

```text
CDC BRFSS
```

Supporting/local validation:

```text
SKI 2023
IFLS
```

Acceptance Criteria:

- Dataset utama dipilih.
- Feature yang digunakan terdokumentasi.
- Dataset dapat digunakan untuk development model.

---



## PROD-001 — Product Scope Validation

**Owner:** Angga  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Review MVP scope.
- [x] Review killer features.
- [x] Review out-of-scope features.
- [x] Review competition strategy.
- [x] Freeze MVP scope.

Killer Features:

```text
Future Health Simulation
What-if Simulation
Explainable AI
Evidence Center
```

Acceptance Criteria:

- MVP scope disepakati.
- Tidak ada feature creep tanpa review.

---



# 6. Architecture Tasks



## ARC-001 — System Architecture Review

**Owner:** Angga + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Review system architecture.
- [x] Review frontend architecture.
- [x] Review backend architecture.
- [x] Review AI architecture.
- [x] Review database architecture.
- [x] Review deployment architecture.
- [x] Review security boundaries.

Technology baseline:

```text
Frontend
Next.js

Backend
FastAPI

Database
PostgreSQL

AI/ML
Python ecosystem

Explainable AI
SHAP

LLM
Selected LLM Provider

RAG
Curated Evidence Knowledge Base
```

Acceptance Criteria:

- Architecture dapat menjadi implementation blueprint.
- Architecture konsisten dengan PRD dan Design.

---



## ARC-002 — API Contract

**Owner:** Gilang & Aksal + Pino & Tumir  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Tasks:

- [x] Define endpoint structure.
- [x] Define request schema.
- [x] Define response schema.
- [x] Define authentication requirements.
- [x] Define error response.
- [x] Document API contract.

Acceptance Criteria:

- Frontend dan backend menggunakan contract yang sama.
- Tidak ada ambiguous response structure.

---



# 7. Database Tasks



## DB-001 — ERD

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S1  
**Status:** DONE

Tasks:

- [x] Identify entities.
- [x] Define relationships.
- [x] Define primary keys.
- [x] Define foreign keys.
- [x] Define constraints.
- [x] Create ERD.
- [x] Document schema.

Core entities:

```text
User
HealthProfile
LifestyleRecord
RiskAssessment
Simulation
SimulationResult
Recommendation
Evidence
AIExplanation
```

Acceptance Criteria:

- ERD selesai.
- Relationship jelas.
- Schema konsisten dengan Architecture.

---



## DB-002 — Database Implementation

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S1-S2  
**Status:** DONE

Tasks:

- [x] Create tables.
- [x] Create migrations.
- [x] Create indexes.
- [x] Create constraints.
- [x] Create seed data if required.
- [x] Test migrations.

Acceptance Criteria:

- Migration berhasil.
- Database dapat digunakan backend.
- Constraint berjalan.

---



# 8. Backend Tasks



# 8.1 Authentication



## BE-001 — Authentication Backend

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Tasks:

- [x] Register endpoint.
- [x] Login endpoint.
- [x] Logout/session handling.
- [x] Password hashing.
- [x] Authentication middleware.
- [x] Authorization.
- [x] Validation.
- [x] Error handling.

Acceptance Criteria:

- User dapat register.
- User dapat login.
- Password tidak disimpan plaintext.
- Unauthorized request ditolak.

---



# 8.2 Consent



## BE-002 — Consent API

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Tasks:

- [x] Consent model.
- [x] Consent endpoint.
- [x] Consent validation.
- [x] Medical disclaimer handling.

Acceptance Criteria:

- Consent tersimpan.
- Assessment tidak dapat dilakukan tanpa consent.

---



# 8.3 Health Profile



## BE-003 — Health Profile API

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Required fields:

```text
Age
Gender
Height
Weight
Physical Activity
Sleep Duration
Smoking Status
Family History
```

Tasks:

- [x] Create profile.
- [x] Read profile.
- [x] Update profile.
- [x] Validation.
- [x] BMI calculation.

Acceptance Criteria:

- Profile dapat disimpan.
- Profile dapat diperbarui.
- BMI dapat dihitung.

---



# 8.4 Assessment



## BE-004 — Health Assessment API

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S4  
**Status:** DONE

Tasks:

- [x] Assessment endpoint.
- [x] Profile validation.
- [x] Risk engine integration.
- [x] Score integration.
- [x] Store assessment.
- [x] Return result.

Acceptance Criteria:

- Assessment dapat dijalankan.
- Risk result tersimpan.
- Response dapat digunakan frontend.

---



# 9. AI / ML Tasks



## 9.1 Dataset Preparation



### AI-001 — Dataset Preprocessing

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S3  
**Status:** BACKLOG

Tasks:

- [x] Data cleaning.
- [x] Missing value handling.
- [x] Duplicate handling.
- [x] Outlier review.
- [x] Encoding.
- [x] Feature transformation.
- [x] Train/test split.
- [x] Prevent data leakage.
- [x] Dataset versioning.

Acceptance Criteria:

- Dataset siap digunakan.
- Preprocessing reproducible.
- Tidak terjadi data leakage.

---



## 9.2 Risk Engine



### AI-002 — Preventive Lifestyle Risk Engine

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S3-S4  
**Status:** TESTING

Objective:

Membangun engine untuk menghasilkan estimasi risiko berbasis lifestyle.

Outputs:

```text
Estimated Diabetes Risk
Estimated Hypertension Risk
Estimated Cardiovascular Risk
```

Tasks:

- [x] Define features.
- [x] Define targets.
- [x] Train baseline model.
- [x] Evaluate model.
- [x] Save model artifact.
- [x] Create inference function.
- [x] Document limitations.

Acceptance Criteria:

- Model menghasilkan risk estimation.
- Model dapat digunakan melalui backend.
- Output tidak diposisikan sebagai diagnosis.

---



## 9.3 Model Evaluation



### AI-003 — Model Evaluation

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S4  
**Status:** TESTING

Tasks:

- [x] Define metrics.
- [x] Evaluate model.
- [x] Perform error analysis.
- [ ] Review class imbalance.
- [x] Document performance.
- [x] Document limitations.

Acceptance Criteria:

- Evaluation report tersedia.
- Model memiliki baseline quality yang dapat dipertanggungjawabkan.

---



# 10. Health & Lifestyle Score



## AI-004 — Health Score

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S4  
**Status:** BACKLOG

Tasks:

- [ ] Define methodology.
- [ ] Define weighting.
- [ ] Implement calculation.
- [ ] Test calculation.
- [ ] Document formula.

Acceptance Criteria:

- Health Score konsisten.
- Formula terdokumentasi.
- Tidak diklaim sebagai diagnosis.

---



## AI-005 — Lifestyle Score

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S4  
**Status:** BACKLOG

Tasks:

- [ ] Define lifestyle factors.
- [ ] Define scoring.
- [ ] Implement calculation.
- [ ] Test calculation.

Acceptance Criteria:

- Lifestyle Score dapat dihitung.
- Score dapat ditampilkan frontend.

---



# 11. Explainable AI



## XAI-001 — SHAP Integration

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S5  
**Status:** TESTING

Objective:

Menjelaskan faktor yang paling berkontribusi terhadap hasil model.

Potential factors:

```text
BMI
Physical Activity
Sleep Duration
Smoking
Family History
```

Tasks:

- [x] Integrate SHAP.
- [x] Generate feature contribution.
- [x] Rank top factors.
- [x] Define explanation schema.
- [x] Integrate with API.
- [x] Test explanation.

Acceptance Criteria:

- Top contributing factors dapat ditampilkan.
- Explanation konsisten dengan model.
- Explanation tidak menggunakan klaim diagnosis.

---



# 12. Future Health Simulation



## SIM-001 — Simulation Engine

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S5  
**Status:** TESTING

Supported horizon:

```text
30 Days
90 Days
180 Days
```

Tasks:

- [ ] Define simulation methodology.
- [ ] Define assumptions.
- [ ] Define baseline state.
- [ ] Define projected state.
- [ ] Integrate risk engine.
- [ ] Generate simulation result.
- [ ] Validate result.

Acceptance Criteria:

- Simulation menghasilkan projected result.
- Baseline dan projected state dapat dibandingkan.
- Output disebut sebagai projection/estimation.

---



## SIM-002 — Future Simulation API

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S5  
**Status:** BACKLOG

Tasks:

- [ ] Simulation endpoint.
- [ ] Input validation.
- [ ] Horizon validation.
- [ ] Risk calculation.
- [ ] Response schema.
- [ ] Error handling.

Acceptance Criteria:

- Frontend dapat memanggil simulation API.
- Response konsisten.

---



# 13. What-if Simulation



## SIM-003 — What-if Engine

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S6  
**Status:** DONE

Adjustable parameters:

```text
Sleep Duration
Physical Activity
Weight
Smoking Status
```

Tasks:

- [x] Define simulation input.
- [x] Validate input.
- [x] Recalculate derived features.
- [x] Re-run risk engine.
- [x] Recalculate score.
- [x] Compare baseline and scenario.
- [x] Return result.

Acceptance Criteria:

- User dapat mengubah parameter.
- Risk result berubah sesuai input.
- Original profile tidak berubah tanpa explicit save.

---



## SIM-004 — What-if API

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S6  
**Status:** DONE

Tasks:

- [x] Create endpoint.
- [x] Define request schema.
- [x] Define response schema.
- [x] Validate scenario.
- [x] Performance optimization.

Target:

```text
< 1 second
```

Acceptance Criteria:

- Simulation dapat dipanggil secara interaktif.
- Response memenuhi target performance sejauh environment memungkinkan.

---



# 14. Recommendation Engine



## REC-001 — Rule Engine

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S7  
**Status:** DONE

Objective:

Menghasilkan rekomendasi preventif berdasarkan rule, bukan LLM.

Example:

```text
IF sleep < threshold
THEN recommend adequate sleep

IF physical activity is low
THEN recommend increasing activity

IF BMI exceeds threshold
THEN recommend healthy weight management

IF smoking = yes
THEN recommend smoking cessation support
```

Tasks:

- [x] Define rule structure.
- [x] Define thresholds.
- [x] Map rules to evidence.
- [x] Implement rule engine.
- [x] Define priority.
- [x] Implement safety guardrail.
- [x] Test rules.

Acceptance Criteria:

- Recommendation berasal dari deterministic rules.
- Setiap recommendation dapat ditelusuri ke source.
- LLM tidak menentukan recommendation.

---



# 15. Evidence Center



## EVD-001 — Evidence Collection

**Owner:** Angga + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S7  
**Status:** DONE

Target:

```text
15–30 curated documents
```

Sources:

```text
WHO
Kemenkes RI
PERKENI
PERKI
CDC
Scientific Literature
```

Tasks:

- [x] Collect documents.
- [x] Verify source.
- [x] Verify relevance.
- [x] Record metadata.
- [x] Categorize documents.
- [x] Map evidence to recommendation.

Acceptance Criteria:

- Evidence source dapat ditelusuri.
- Evidence relevan dengan recommendation.
- Metadata tersedia.

---



## EVD-002 — Evidence API

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S8  
**Status:** DONE

Tasks:

- [x] Evidence model.
- [x] Evidence endpoint.
- [x] Evidence retrieval.
- [x] Metadata response.
- [x] Source validation.

Acceptance Criteria:

- Frontend dapat mengambil evidence.
- Source information tersedia.

---



# 16. RAG



## RAG-001 — Knowledge Base Pipeline

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S7  
**Status:** TESTING

Tasks:

- [x] Document ingestion.
- [x] Document cleaning.
- [x] Chunking.
- [x] Embedding generation.
- [x] Vector storage.
- [x] Metadata storage.

Acceptance Criteria:

- Knowledge base tersedia.
- Dokumen dapat dicari berdasarkan relevance.

---



## RAG-002 — Retrieval Pipeline

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S7-S8  
**Status:** TESTING

Tasks:

- [x] Query construction.
- [x] Similarity search.
- [x] Relevance filtering.
- [x] Source preservation.
- [ ] Retrieval testing.

Acceptance Criteria:

- Relevant evidence dapat ditemukan.
- Source tetap tersedia.

---



# 17. LLM



## LLM-001 — Explanation Pipeline

**Owner:** Gilang & Aksal  
**Priority:** P0  
**Sprint:** S8  
**Status:** BACKLOG

LLM responsibility:

```text
Risk Result
    ↓
SHAP Factors
    ↓
Recommendation
    ↓
Retrieved Evidence
    ↓
LLM
    ↓
Human-Friendly Explanation
```

LLM must NOT:

```text
Calculate Risk
Determine Diagnosis
Override Recommendation Rules
Invent Evidence
```

Tasks:

- [ ] Prompt design.
- [ ] Context construction.
- [ ] RAG integration.
- [ ] Explanation generation.
- [ ] Output validation.
- [ ] Hallucination guardrail.
- [ ] Fallback response.

Acceptance Criteria:

- Explanation mudah dipahami.
- Explanation menggunakan context yang tersedia.
- Evidence dapat ditampilkan.
- LLM tidak menjadi risk engine.

---



# 18. Frontend Tasks



# 18.1 Design System



## FE-001 — Design System Implementation

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S1-S2  
**Status:** DONE

Tasks:

- [x] Typography.
- [x] Color system.
- [x] Spacing.
- [x] Buttons.
- [x] Inputs.
- [x] Cards.
- [x] Alerts.
- [x] Navigation.
- [x] Layout.
- [x] Loading states.
- [x] Error states.
- [x] Landing page editorial layout & visual components.

Reference:

```text
Design.md
```

Acceptance Criteria:

- Component mengikuti Design System.
- UI konsisten antar halaman.

---



# 18.2 Authentication UI



## FE-002 — Authentication Pages

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Tasks:

- [x] Login.
- [x] Register.
- [x] Validation.
- [x] Error state.
- [x] Loading state.
- [x] Logout.
- [x] Login and register UI refinement.

Acceptance Criteria:

- Authentication flow dapat digunakan end-to-end.

---



# 18.3 Consent UI



## FE-003 — Consent Page

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Tasks:

- [x] Consent information.
- [x] Medical disclaimer.
- [x] Consent action.
- [x] Validation.
- [x] Error state.

Acceptance Criteria:

- User memahami consent sebelum assessment.

---



# 18.4 Health Profile UI



## FE-004 — Health Profile Page

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

Tasks:

- [x] Profile form.
- [x] Input validation.
- [x] BMI display if required.
- [x] Save interaction.
- [x] Loading state.
- [x] Error state.

Acceptance Criteria:

- User dapat mengisi profile.
- Data dapat dikirim ke backend.
- Validation tersedia.

---



# 18.5 Dashboard



## FE-005 — Health Dashboard

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S4-S5  
**Status:** DONE

Display:

```text
Health Score
Lifestyle Score
Risk Overview
Key Risk Factors
Recommendation Summary
Simulation CTA
```

Tasks:

- [x] Dashboard layout.
- [x] Score cards.
- [x] Risk summary.
- [x] Key factors.
- [x] Recommendation summary.
- [x] Loading state.
- [x] Error state.

Acceptance Criteria:

- Dashboard menampilkan hasil assessment.
- Visual hierarchy jelas.
- UI sesuai Design.md.

---



# 18.6 Risk Detail



## FE-006 — Risk Detail Page

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S5  
**Status:** DONE

Tasks:

- [x] Risk detail.
- [x] Risk level.
- [x] Contributing factors.
- [x] Explanation CTA.
- [x] Simulation CTA.

Acceptance Criteria:

- User dapat memahami hasil risk estimation.

---



# 18.7 Explainable AI UI



## FE-007 — Explainable AI View

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S5  
**Status:** DONE

Tasks:

- [x] Display top factors.
- [x] Display contribution.
- [x] Human-readable explanation.
- [x] Link to recommendation.

Acceptance Criteria:

- User dapat mengetahui faktor yang paling berpengaruh.

---



# 18.8 Future Health Simulation UI



## FE-008 — Future Simulation Page

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S5-S6  
**Status:** DONE

Tasks:

- [x] Horizon selection.
- [x] Baseline result.
- [x] Projected result.
- [x] Comparison visualization.
- [x] Disclaimer.

Acceptance Criteria:

- User dapat memilih horizon.
- Baseline dan projection dapat dibandingkan.

---



# 18.9 What-if Simulation UI



## FE-009 — What-if Simulation Interface

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S6  
**Status:** DONE

Controls:

```text
Sleep Duration
Physical Activity
Weight
Smoking Status
```

Tasks:

- [x] Slider/input controls.
- [x] Scenario state.
- [x] Baseline state.
- [x] Simulated state.
- [x] Comparison result.
- [x] Reset scenario.
- [x] Loading state.
- [x] Error state.

Acceptance Criteria:

- User dapat mengubah parameter.
- Result diperbarui.
- Baseline tetap tersedia.
- Original profile tidak berubah.

---



# 18.10 Recommendation UI



## FE-010 — Recommendation View

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S7-S8  
**Status:** DONE

Tasks:

- [x] Recommendation cards.
- [x] Priority.
- [x] Explanation.
- [x] Evidence CTA.

Acceptance Criteria:

- Recommendation mudah dipahami.
- User dapat melihat alasan recommendation.

---



# 18.11 Evidence Center UI



## FE-011 — Evidence Center

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S8  
**Status:** DONE

Display:

```text
Evidence Title
Source
Publisher
Summary
Evidence Level
Reference
```

Tasks:

- [x] Evidence page layout.
- [x] Filter by category.
- [x] Search by title/organization.
- [x] API integration (`GET /api/v1/evidence`).
- [x] Evidence level display.
- [x] External link to source.
- [x] Disclaimer.
- [x] Evidence content: 15–30 entries (15 entri kurasi klinis terintegrasi via EVD-001).

Acceptance Criteria:

- User dapat melihat evidence.
- Source dapat diidentifikasi.
- Evidence dapat ditelusuri.

---



## FE-012 — Supabase Auth Integration

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Supabase client and environment.
- [x] Token source from Supabase session in API client.
- [x] Login and register via Supabase Auth.
- [x] Auth guard via Supabase session.
- [x] Google OAuth via Supabase.
- [x] Supabase user types.
- [x] Lint and build gate.
- [x] OAuth callback route with consent-aware routing.

Acceptance Criteria:

- Register/login/logout berjalan via Supabase Auth sebagai identity provider.
- Seluruh request terautentikasi mengirim Bearer JWT Supabase (verifikasi JWKS di sisi backend).
- Google OAuth berjalan via Supabase, bukan stub.

---



# 18.12 Mobile App (Usulan)

Usulan berdasarkan `docs/PRD-Mobile.md`. Seluruh task MOB menunggu persetujuan Product & Project Manager sesuai §31 dan belum termasuk MVP Gate §29.



## MOB-001 — Mobile PRD and Feature Proposal

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** IN PROGRESS

Tasks:

- [x] Write mobile PRD (`docs/PRD-Mobile.md`).
- [ ] Submit feature proposal to Product & Project Manager.
- [x] Write ADR-012 for the Flutter app in the monorepo.
- [x] Add the Flutter/pub ecosystem to `docs/Monorepo.md`.

Acceptance Criteria:

- PRD mobile sudah direview Product & Project Manager.
- Keputusan memasukkan mobile ke MVP tercatat.

---



## MOB-002 — Mobile Monorepo Foundation

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Scaffold `apps/mobile` (Flutter, Android, application ID `id.heliora.app`).
- [x] Pin the Flutter version with FVM (`.fvmrc`).
- [x] Add a script-only `package.json` for Turborepo (dev, lint, test, build, gen:api).
- [x] Update `.gitignore` for Dart, Flutter, Gradle, and signing files.
- [x] Add mobile build outputs to `turbo.json`.
- [x] Document mobile setup in README.

Acceptance Criteria:

- `pnpm lint` dan `pnpm test` dari root ikut memeriksa mobile.
- Aplikasi berjalan di emulator Android.

---



## MOB-003 — Mobile Authentication and API Client

**Owner:** Pino & Tumir + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Integrate `supabase_flutter` with the same Supabase project as web.
- [x] Email and password login (registration in Ticket 04).
- [x] Google OAuth with deep link `id.heliora.app://login-callback`.
- [x] Configure intent-filter redirect URL in AndroidManifest.xml.
- [x] Generate the API client from OpenAPI with `swagger_parser`.
- [x] Bearer token interceptor and API error mapping.
- [x] Environment configuration (API URL, Supabase URL, anon key).

Acceptance Criteria:

- Pengguna yang login bisa memanggil `GET /auth/me`.
- Login Google berhasil di perangkat Android fisik.
- Client API hasil regenerasi lolos kompilasi.

---



## MOB-004 — Mobile Theme and Base Components

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Design tokens in `lib/theme/tokens.dart` using Figma variable names (Light and Dark).
- [x] Typography with Plus Jakarta Sans and JetBrains Mono.
- [x] Base widgets (button, input, checkbox, cards, risk status, disclaimer, app bar, bottom navigation, slider).
- [x] Figma mobile design for all MVP screens in the *Mobile (MVP)* page, including Register, Consent, Assessment, and splash.
- [x] Launcher icon from the final logo concept A (adaptive icon with background, foreground, and monochrome layers) using `apps/mobile/assets/brand/`.
- [x] Android native splash: solid brand green with a transparent icon (Android 12+ and Android 8-11).
- [x] Animated splash in Flutter (about 1 second, 3 second hold then offline state, reduced-motion support) per MFR-012. Should Have and the first item cut if the schedule slips.

Acceptance Criteria:

- Komponen sesuai halaman Figma *Mobile (MVP)*.
- Tidak ada pill chip atau oval badge.
- Disclaimer statutori tampil kata per kata sesuai `Design.md` §2.6.
- Ikon aplikasi memakai logo final konsep A, termasuk lapisan monokrom untuk ikon tema Android.
- Splash tampil saat cold start, animasi selesai dalam waktu kurang dari 1,2 detik tanpa jeda buatan, dan pengaturan "kurangi animasi" dihormati.

---



## MOB-005 — Mobile Onboarding Screens

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Register.
- [x] Login (email and Google).
- [x] Consent with statutory disclaimer.
- [x] Health profile form with validation and BMI.
- [x] Assessment processing and failure state.
- [x] Consent-aware routing.
- [x] First-launch routing: Register on the first launch after install and Login afterwards, using a local non-sensitive flag (MFR-012).

Acceptance Criteria:

- Pengguna baru menyelesaikan Register, Consent, Asesmen, sampai Beranda di perangkat Android fisik.
- Asesmen tidak bisa dibuka sebelum consent tercatat.
- Tanpa sesi, peluncuran pertama setelah instal masuk ke Register dan peluncuran berikutnya ke Login. Register peluncuran pertama tidak punya tombol kembali dan punya tombol "Masuk" di bar atas.

---



## MOB-006 — Mobile Home and What-if Simulation

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Home: scores with interpretation, three risk estimates, empty state, and revoked-consent state.
- [x] What-if controls for sleep, activity, weight, and smoking with baseline values.
- [x] Simulation results per disease with direction text.
- [x] Reset scenario without changing the original profile.
- [x] Statutory disclaimer on Home and What-if.

Acceptance Criteria:

- Hasil simulasi tampil di bawah 1 detik sejauh environment memungkinkan.
- Profil asli tidak berubah setelah simulasi.

---



## MOB-007 — Mobile Profile and Privacy

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** DONE

Tasks:

- [x] Identity from `GET /auth/me`.
- [x] Health profile summary and update.
- [x] Consent status and revoke with confirmation.
- [x] Logout.

Acceptance Criteria:

- Setelah consent dicabut, Beranda menampilkan status "Analisis dihentikan sesuai permintaanmu".
- Logout menghapus sesi di perangkat.

---



## MOB-008 — Mobile CI and Release

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9-S10  
**Status:** DONE

Tasks:

- [x] Setup Supabase dan backend API ke mobile via environment injection (`API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).
- [x] GitHub Actions workflow: analyze and test on pull requests.
- [x] Release APK build as an artifact on `main`.
- [x] Release signing key stored in GitHub Secrets.
- [x] Publikasikan GitHub Release perdana aplikasi mobile dengan lampiran binary APK rilis.
- [x] Test the release APK on a physical device.

Acceptance Criteria:

- CI hijau di `main`.
- APK rilis yang ditandatangani bisa dipasang di perangkat Android.
- GitHub Release perdana diterbitkan otomatis beserta file APK yang dapat diunduh.

---



# 19. Integration Tasks



## INT-001 — Authentication Integration

**Owner:** Pino & Tumir + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

- [x] Connect login.
- [x] Connect register.
- [x] Handle authentication state.
- [x] Handle errors.

---



## INT-002 — Profile Integration

**Owner:** Pino & Tumir + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S2  
**Status:** DONE

- [x] Connect profile form.
- [x] Connect API.
- [x] Handle validation.
- [x] Handle errors.
- [x] End-to-end live database verification.

---



## INT-003 — Assessment Integration

**Owner:** Pino & Tumir + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S4  
**Status:** TESTING

- [x] Connect assessment.
- [x] Display result.
- [x] Handle loading.
- [x] Handle error.
- [x] End-to-end live assessment verification.

---



## INT-004 — Simulation Integration

**Owner:** Pino & Tumir + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S6  
**Status:** DONE

- [x] Connect simulation API.
- [x] Send scenario.
- [x] Receive result.
- [x] Update UI.

Acceptance Criteria:

- What-if interaction berjalan end-to-end.

---



## INT-005 — Recommendation & Evidence Integration

**Owner:** Pino & Tumir + Gilang & Aksal  
**Priority:** P0  
**Sprint:** S8  
**Status:** IN PROGRESS

- [x] Connect recommendation API.
- [x] Connect evidence API.
- [ ] Connect explanation API (pending LLM-001).
- [x] Handle fallback.

---



# 20. QA & Security Tasks



## QA-001 — Functional Testing

**Owner:** Gilang & Aksal + Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** BACKLOG

Test:

- [ ] Authentication.
- [ ] Consent.
- [ ] Health Profile.
- [ ] Assessment.
- [ ] Dashboard.
- [ ] Risk Detail.
- [ ] XAI.
- [ ] Future Simulation.
- [ ] What-if Simulation.
- [ ] Recommendation.
- [ ] Evidence.
- [ ] LLM Explanation.

---



## QA-002 — Edge Case Testing

**Owner:** Gilang & Aksal + Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** BACKLOG

Test:

- [ ] Missing input.
- [ ] Invalid input.
- [ ] Boundary values.
- [ ] Extreme values.
- [ ] Empty response.
- [ ] API timeout.
- [ ] LLM failure.
- [ ] RAG failure.
- [ ] Simulation failure.

---



## SEC-001 — Security Testing

**Owner:** Gilang & Aksal + Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** BACKLOG

Tasks:

- [ ] Authentication testing.
- [ ] Authorization testing.
- [ ] Input validation.
- [ ] API security.
- [ ] Secret exposure check.
- [ ] Environment variable check.
- [ ] Injection testing.
- [ ] Error leakage testing.

Acceptance Criteria:

- Tidak ada critical security issue.
- Secret tidak berada di repository.
- Unauthorized access ditolak.

---



# 21. Performance Tasks



## QA-003 — Performance Testing

**Owner:** Gilang & Aksal + Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** BACKLOG

Targets:

```text
Normal application response
< 3 seconds

What-if Simulation
< 1 second target

LLM + RAG Explanation
< 5 seconds target
```

Tasks:

- [ ] API measurement.
- [ ] Database query review.
- [ ] Simulation benchmark.
- [ ] LLM response measurement.
- [ ] Frontend performance review.

Acceptance Criteria:

- Target tercapai sejauh environment memungkinkan.
- Bottleneck terdokumentasi.

---



# 22. DevOps Tasks



## DEV-001 — CI/CD

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S8-S9  
**Status:** BACKLOG

Tasks:

- [ ] Configure CI.
- [ ] Automated build.
- [ ] Automated test.
- [ ] Deployment pipeline.
- [ ] Environment configuration.

Acceptance Criteria:

- Build dapat berjalan otomatis.
- Deployment workflow terdokumentasi.

---



## DEV-002 — Production Deployment

**Owner:** Pino & Tumir  
**Priority:** P0  
**Sprint:** S9  
**Status:** BACKLOG

Tasks:

- [ ] Production frontend.
- [ ] Production backend.
- [ ] PostgreSQL production.
- [ ] Environment variables.
- [ ] HTTPS.
- [ ] Health check.
- [ ] Domain configuration.
- [ ] Deployment verification.

Acceptance Criteria:

- Application online.
- Frontend dapat berkomunikasi dengan backend.
- Database production berjalan.
- HTTPS aktif.

---



# 23. Documentation Tasks



## DOC-001 — Documentation Review

**Owner:** Angga  
**Priority:** P0  
**Sprint:** S9-S10  
**Status:** IN PROGRESS

Tasks:

- [ ] Review PRD.
- [ ] Review Design.
- [ ] Review Architecture.
- [ ] Review Database.
- [x] Review TASK.
- [ ] Document final implementation.
- [ ] Document AI methodology.
- [ ] Document dataset.
- [ ] Document limitations.

Acceptance Criteria:

- Dokumentasi sesuai implementasi aktual.

---



## DOC-002 — README

**Owner:** Angga + Pino & Tumir  
**Priority:** P0  
**Sprint:** S10  
**Status:** BACKLOG

Contents:

```text
Project Overview
Features
Technology Stack
Architecture
Installation
Environment Variables
Database Setup
Development
Testing
Deployment
AI Disclaimer
```

---



# 24. Presentation Tasks



## PRES-001 — Competition Presentation

**Owner:** Angga  
**Priority:** P0  
**Sprint:** S10  
**Status:** BACKLOG

Structure:

```text
Problem
   ↓
Why It Matters
   ↓
HELIORA
   ↓
Innovation
   ↓
How It Works
   ↓
AI Architecture
   ↓
Future Health Simulation
   ↓
What-if Simulation
   ↓
Explainable AI
   ↓
Evidence Center
   ↓
Impact
   ↓
Demo
```

Acceptance Criteria:

- Narrative jelas.
- Innovation terlihat.
- Technical implementation dapat dijelaskan.
- Impact dapat dipertanggungjawabkan.

---



# 25. Demo Tasks



## DEMO-001 — Demo Scenario

**Owner:** Angga + All  
**Priority:** P0  
**Sprint:** S10  
**Status:** BACKLOG

Primary flow:

```text
Landing
   ↓
Register
   ↓
Login
   ↓
Consent
   ↓
Health Profile
   ↓
Assessment
   ↓
Dashboard
   ↓
Risk Detail
   ↓
Explainable AI
   ↓
Future Health Simulation
   ↓
What-if Simulation
   ↓
Recommendation
   ↓
Evidence Center
   ↓
LLM Explanation
```

Acceptance Criteria:

- Full flow dapat dilakukan.
- Killer features dapat ditampilkan.
- Tidak terdapat blocker.

---



## DEMO-002 — Demo Rehearsal

**Owner:** All  
**Priority:** P0  
**Sprint:** S10  
**Status:** BACKLOG

Tasks:

- [ ] Full rehearsal.
- [ ] Timing rehearsal.
- [ ] Technical rehearsal.
- [ ] Backup scenario.
- [ ] Troubleshooting checklist.
- [ ] Q&A preparation.

---



# 26. Sprint Plan



## Sprint 1 — Foundation

Focus:

```text
Repository
Environment
Architecture
Database
Research
Dataset Research
Design System
```

---



## Sprint 2 — Authentication & Profile

Focus:

```text
Authentication
Consent
Health Profile
API Contract
Frontend Foundation
```

---



## Sprint 3 — AI Foundation

Focus:

```text
Dataset Preparation
Preprocessing
Risk Engine
Baseline Model
```

---



## Sprint 4 — Risk & Dashboard

Focus:

```text
Model Evaluation
Risk API
Health Score
Lifestyle Score
Assessment
Dashboard
```

---



## Sprint 5 — Explainability & Future Simulation

Focus:

```text
SHAP
Risk Detail
Explainable AI UI
Future Health Simulation
```

---



## Sprint 6 — What-if Simulation

Focus:

```text
What-if Engine
What-if API
Simulation UI
Baseline vs Scenario
```

---



## Sprint 7 — Recommendation & RAG

Focus:

```text
Rule Engine
Evidence Collection
Knowledge Base
RAG Pipeline
```

---



## Sprint 8 — LLM & Integration

Focus:

```text
LLM Explanation
Evidence Center
Full Integration
CI/CD
```

---



## Sprint 9 — QA & Deployment

Focus:

```text
Functional Testing
Security Testing
Performance Testing
Bug Fixing
Production Deployment
```

---



## Sprint 10 — Documentation & Competition

Focus:

```text
Documentation
Presentation
Demo
Rehearsal
Final Polish
```

---



# 27. Critical Path

Critical path utama:

```text
Architecture
    ↓
Database
    ↓
Health Profile
    ↓
Dataset
    ↓
Risk Engine
    ↓
Risk API
    ↓
Dashboard
    ↓
SHAP
    ↓
Future Simulation
    ↓
What-if Simulation
    ↓
Recommendation
    ↓
RAG
    ↓
LLM
    ↓
Integration
    ↓
QA
    ↓
Deployment
    ↓
Demo
```

Task pada critical path harus mendapatkan prioritas tertinggi.

---



# 28. Feature Dependency



## Authentication

```text
Database
    ↓
Backend Authentication
    ↓
Frontend Authentication
    ↓
Integration
```



## Health Assessment

```text
Health Profile
    ↓
Risk Engine
    ↓
Risk API
    ↓
Dashboard
```



## Explainable AI

```text
Risk Engine
    ↓
SHAP
    ↓
XAI API
    ↓
XAI UI
```



## Future Simulation

```text
Risk Engine
    ↓
Simulation Engine
    ↓
Simulation API
    ↓
Simulation UI
```



## What-if Simulation

```text
Risk Engine
    ↓
What-if Engine
    ↓
What-if API
    ↓
Simulation UI
```



## Recommendation

```text
Health Profile
    +
Risk Result
    ↓
Rule Engine
    ↓
Recommendation
```



## Evidence

```text
Evidence Collection
    ↓
Knowledge Base
    ↓
RAG
    ↓
Recommendation / Explanation
```



## LLM

```text
Risk Result
    +
SHAP
    +
Recommendation
    +
RAG Evidence
    ↓
LLM
    ↓
Human-Friendly Explanation
```

---



# 29. MVP Gate

HELIORA MVP hanya dianggap siap apabila seluruh P0 berikut selesai.

## Product

- [x] Authentication
- [x] Consent
- [x] Health Profile
- [x] Health Assessment
- [x] Dashboard
- [x] Risk Detail
- [x] Recommendation
- [x] Evidence Center



## AI

- [ ] Preventive Lifestyle Risk Engine
- [ ] Health Score
- [ ] Lifestyle Score
- [ ] Explainable AI
- [ ] Future Health Simulation
- [x] What-if Simulation
- [x] Recommendation Engine
- [ ] RAG
- [ ] LLM Explanation



## Technical

- [x] Next.js
- [x] FastAPI
- [x] PostgreSQL
- [x] API Integration
- [x] Authentication
- [x] Security baseline
- [ ] Production deployment



## Quality

- [ ] Functional testing
- [ ] Edge case testing
- [ ] Security testing
- [ ] Performance testing
- [ ] Regression testing
- [ ] Critical bugs resolved

---



# 30. Competition Priority

Prioritas utama HELIORA:

```text
1. Future Health Simulation
2. What-if Simulation
3. Explainable AI
4. Evidence Center
5. Personalized Health Dashboard
6. Recommendation Engine
7. Technical Reliability
8. Presentation & Demo
```

Killer features tidak boleh dikorbankan untuk feature tambahan yang tidak termasuk MVP.

---



# 31. Scope Protection

Feature baru harus melalui proses:

```text
Feature Proposal
      ↓
Product Review
      ↓
Impact Analysis
      ↓
Priority Decision
      ↓
MVP / Future
```

Perubahan yang memengaruhi:

- MVP;
- timeline;
- architecture;
- database;
- AI pipeline;
- competition strategy;

harus direview sebelum masuk backlog.

---



# 32. Stretch Goals

Stretch goal hanya boleh dikerjakan setelah seluruh P0 selesai.

## P2

- [ ] Additional health indicators.
- [ ] Longitudinal health tracking.
- [ ] Additional simulation scenarios.
- [ ] Improved visualization.



## P3

- [ ] Wearable integration.
- [ ] Advanced personalization.
- [ ] Advanced analytics.
- [ ] Additional health integrations.

Stretch goals tidak boleh mengganggu critical path MVP.

---



# 33. Final Release Checklist



## Product

- [ ] MVP features complete.
- [ ] Core user journey complete.
- [ ] Medical disclaimer visible.
- [ ] No unsupported medical claims.



## AI

- [ ] Risk Engine working.
- [ ] Model evaluated.
- [ ] SHAP working.
- [ ] Future Simulation working.
- [ ] What-if Simulation working.
- [ ] Recommendation Engine working.
- [ ] RAG working.
- [ ] LLM explanation working.
- [ ] Fallback available.



## Frontend

- [ ] All MVP pages complete.
- [ ] Design System implemented.
- [ ] Loading states.
- [ ] Error states.
- [ ] Validation.
- [ ] Responsive behavior.
- [ ] No critical UI bugs.



## Backend

- [ ] API stable.
- [ ] Validation.
- [ ] Authentication.
- [ ] Authorization.
- [ ] Error handling.
- [ ] Database stable.



## Database

- [ ] ERD finalized.
- [ ] Migration finalized.
- [ ] Constraints verified.
- [ ] Indexes reviewed.



## Security

- [ ] Password hashing.
- [ ] Authentication.
- [ ] Authorization.
- [ ] Secret management.
- [ ] HTTPS.
- [ ] No secrets in repository.
- [ ] No sensitive data in logs.



## DevOps

- [ ] CI/CD working.
- [ ] Production environment ready.
- [ ] Frontend deployed.
- [ ] Backend deployed.
- [ ] PostgreSQL deployed.
- [ ] Health check working.



## Documentation

- [ ] PRD updated.
- [ ] Design updated.
- [ ] Architecture updated.
- [ ] Database documented.
- [ ] API documented.
- [ ] AI methodology documented.
- [ ] Dataset documented.
- [ ] README completed.



## Competition

- [ ] Presentation complete.
- [ ] Demo complete.
- [ ] Demo rehearsal complete.
- [ ] Backup scenario ready.
- [ ] Q&A prepared.

---



# 34. Definition of Task Completion

Sebuah task dapat ditandai `DONE` apabila:

```text
Implementation
     ↓
Code Review
     ↓
Testing
     ↓
Acceptance Criteria Met
     ↓
Documentation Updated
     ↓
DONE
```

Task tidak boleh dianggap selesai hanya karena kode telah dibuat.

---



# 35. Final MVP Execution Flow

```text
PRODUCT
   ↓
RESEARCH
   ↓
ARCHITECTURE
   ↓
DATABASE
   ↓
BACKEND
   ↓
AI / ML
   ↓
FRONTEND
   ↓
INTEGRATION
   ↓
QA & SECURITY
   ↓
DEVOPS
   ↓
DOCUMENTATION
   ↓
PRESENTATION
   ↓
DEMO
   ↓
COMPETITION READY
```

---



# 36. Document Status

**Document:** `TASK.md`  
**Version:** 1.0  
**Status:** Active Development  
**Scope:** HELIORA MVP

`TASK.md` harus diperbarui selama proses development.

Task yang selesai:

```text
[ ] → [x]
```

Status task diperbarui mengikuti:

```text
BACKLOG
→ READY
→ IN PROGRESS
→ REVIEW
→ TESTING
→ DONE
```

Perubahan terhadap product scope, MVP, architecture, timeline, atau competition strategy harus direview oleh Product & Project Manager sebelum diterapkan.