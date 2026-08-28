# HELIORA

# Architecture Document

**Document:** Architecture.md  
**Product:** HELIORA  
**Version:** 1.0 — MVP  
**Status:** Final Technical Blueprint — MVP  
**Derived From:** `PRD_Revisi.md` + `Design.md`  
**Target:** Competition MVP  
**Architecture Style:** Modular Web Application + AI/ML Service Architecture  
**Frontend:** Next.js + TypeScript + Tailwind CSS  
**Backend:** FastAPI + Python  
**Database:** PostgreSQL

---

# 1. Document Control

## 1.1 Purpose

Dokumen ini mendefinisikan arsitektur teknis HELIORA sebagai blueprint implementasi yang diturunkan dari:

- Product Requirements Document (`PRD_Revisi.md`);
- UI/UX Design Document (`Design.md`).

Architecture.md menjelaskan bagaimana kebutuhan produk HELIORA diterjemahkan menjadi sistem teknis yang dapat dibangun, diuji, dijalankan, dan dikembangkan.

PRD berfokus pada:

- apa yang harus dilakukan sistem;
- mengapa fitur diperlukan;
- product scope;
- functional requirements;
- business rules;
- acceptance criteria.

Design.md berfokus pada:

- information architecture;
- user flow;
- page structure;
- UI/UX;
- interaction;
- visual design.

Architecture.md berfokus pada:

- bagaimana sistem dibangun;
- bagaimana komponen berkomunikasi;
- bagaimana data mengalir;
- bagaimana AI/ML diintegrasikan;
- bagaimana database disusun;
- bagaimana API dirancang;
- bagaimana security diterapkan;
- bagaimana sistem dideploy.

---

## 1.2 Architecture Objectives

Arsitektur HELIORA memiliki tujuan:

1. Menjaga implementasi tetap sederhana untuk MVP.
2. Mendukung seluruh core feature HELIORA.
3. Memisahkan presentation, application logic, AI/ML, dan data layer.
4. Memudahkan pengembangan oleh beberapa anggota tim.
5. Mendukung Explainable AI.
6. Mendukung Future Health Simulation.
7. Mendukung What-if Simulation.
8. Mendukung Recommendation Engine.
9. Mendukung RAG dan LLM.
10. Menjaga batasan bahwa HELIORA bukan sistem diagnosis medis.
11. Mendukung deployment yang stabil untuk live demo kompetisi.
12. Memungkinkan pengembangan lanjutan tanpa melakukan perubahan fundamental terhadap arsitektur.

---

# 2. Architecture Principles

## 2.1 Requirement-Driven Architecture

Architecture harus diturunkan dari requirement yang telah ditetapkan pada PRD.

Tidak boleh menambahkan infrastructure atau service yang tidak diperlukan oleh MVP hanya karena tersedia secara teknologi.

---

## 2.2 Simple Before Complex

HELIORA menggunakan arsitektur sesederhana mungkin selama seluruh kebutuhan MVP dapat dipenuhi.

Prinsip:

```text
Required Feature
      ↓
Simplest Reliable Implementation
      ↓
Test
      ↓
Optimize Only When Necessary
```

---

## 2.3 Separation of Concerns

Setiap layer memiliki tanggung jawab yang jelas.

```text
Presentation
     ↓
API
     ↓
Application / Business Logic
     ↓
AI / Simulation / Recommendation
     ↓
Data Access
     ↓
Database
```

---

## 2.4 AI Responsibility Separation

Setiap teknologi AI memiliki fungsi yang berbeda.

```text
ML
└── Risk Estimation

SHAP
└── Explainability

Simulation
└── Scenario Re-inference

Rule Engine
└── Recommendation

RAG
└── Evidence Retrieval

LLM
└── Human-Friendly Explanation
```

LLM tidak boleh mengambil alih fungsi Risk Engine.

---

## 2.5 Evidence Before Generation

LLM harus bekerja berdasarkan context yang tersedia dari sistem dan evidence yang diperoleh melalui RAG.

```text
Risk Result
     +
XAI Factors
     +
Recommendation
     +
Retrieved Evidence
     ↓
    LLM
     ↓
Explanation
```

---

## 2.6 Medical Safety Boundary

HELIORA tidak dibangun sebagai:

- medical diagnosis system;
- treatment recommendation system;
- emergency medical system;
- clinical decision support system.

Semua output harus diposisikan sebagai:

- estimated risk;
- health score;
- lifestyle score;
- simulation;
- recommendation;
- evidence-based information.

---

# 3. High-Level System Architecture

## 3.1 System Overview

Arsitektur utama HELIORA:

```text
                          ┌──────────────────────┐
                          │        USER          │
                          └──────────┬───────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │    Next.js Frontend  │
                          │      TypeScript      │
                          │     Tailwind CSS     │
                          └──────────┬───────────┘
                                     │
                                  REST API
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │    FastAPI Backend   │
                          │        Python        │
                          └──────────┬───────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             │                       │                       │
             ▼                       ▼                       ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │    PostgreSQL    │   │    AI / ML Layer │   │   RAG / LLM Layer│
   │                  │   │                  │   │                  │
   │ User             │   │ Risk Engine      │   │ Retrieval        │
   │ Health Profile   │   │ SHAP             │   │ Evidence         │
   │ Assessment       │   │ Simulation       │   │ LLM              │
   │ Results           │   │ Rule Engine      │   │ Explanation      │
   └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## 3.2 Architectural Layers

HELIORA dibagi menjadi beberapa logical layer:

```text
┌────────────────────────────────────────────┐
│ Presentation Layer                         │
│ Next.js + TypeScript + Tailwind CSS        │
└───────────────────────┬────────────────────┘
                        │
┌───────────────────────▼────────────────────┐
│ API Layer                                  │
│ FastAPI REST API                           │
└───────────────────────┬────────────────────┘
                        │
┌───────────────────────▼────────────────────┐
│ Application Layer                          │
│ Authentication / Profile / Assessment      │
│ Risk / Simulation / Recommendation         │
└───────────────┬────────────────────────────┘
                │
       ┌────────┼─────────┐
       ▼        ▼         ▼
┌──────────┐ ┌────────┐ ┌──────────────┐
│ AI Layer │ │ RAG    │ │ Data Access  │
│ ML/SHAP  │ │ / LLM  │ │ PostgreSQL   │
│ Simulate │ │        │ │              │
│ Rules    │ │        │ │              │
└──────────┘ └────────┘ └──────────────┘
```

---

# 4. Frontend Architecture

## 4.1 Technology

Frontend menggunakan:

| Technology   | Responsibility                    |
| ------------ | --------------------------------- |
| Next.js      | Web application framework         |
| TypeScript   | Type safety                       |
| Tailwind CSS | Styling dan design implementation |

PRD menetapkan Next.js sebagai framework frontend dan TypeScript sebagai bahasa frontend. Tailwind CSS digunakan untuk implementasi UI dan design system. :contentReference[oaicite:1]{index=1}

---

## 4.2 Frontend Responsibilities

Frontend bertanggung jawab terhadap:

- Landing Page;
- Authentication;
- Consent;
- Health Profile;
- Assessment;
- Dashboard;
- Risk Detail;
- Explainable AI;
- Future Health Simulation;
- What-if Simulation;
- Recommendation;
- Evidence Center;
- Account;
- loading state;
- error state;
- responsive interface;
- theme handling.

Design document mendefinisikan flow dan halaman tersebut sebagai bagian dari pengalaman pengguna HELIORA. :contentReference[oaicite:2]{index=2}

---

## 4.3 Suggested Frontend Structure

```text
frontend/
├── app/
│   ├── page.tsx
│   │
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── register/
│   │   └── page.tsx
│   │
│   ├── forgot-password/
│   │   └── page.tsx
│   │
│   ├── onboarding/
│   │   ├── consent/
│   │   │   └── page.tsx
│   │   └── health-profile/
│   │       └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── risk/
│   │   └── page.tsx
│   │
│   ├── simulation/
│   │   └── page.tsx
│   │
│   ├── recommendations/
│   │   └── page.tsx
│   │
│   ├── evidence/
│   │   └── page.tsx
│   │
│   └── account/
│       └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── dashboard/
│   ├── risk/
│   ├── simulation/
│   ├── recommendation/
│   └── evidence/
│
├── lib/
│   ├── api/
│   ├── validation/
│   ├── utils/
│   └── constants/
│
├── types/
│   ├── user.ts
│   ├── health.ts
│   ├── risk.ts
│   ├── simulation.ts
│   ├── recommendation.ts
│   └── evidence.ts
│
└── public/
```

> Struktur di atas merupakan proposed implementation structure. PRD menetapkan bahwa project structure menjadi bagian dari Architecture, tetapi tidak mengunci struktur folder tertentu.

---

## 4.4 Frontend State Responsibility

Frontend harus membedakan:

### Server State

Data yang berasal dari backend:

- user;
- health profile;
- risk result;
- simulation result;
- recommendation;
- evidence.

### Local UI State

Data sementara:

- simulation slider;
- selected simulation horizon;
- modal;
- tabs;
- expanded explanation;
- UI theme.

What-if Simulation harus memungkinkan pengguna mengubah parameter tanpa mengubah health profile permanen sebelum pengguna menyimpan perubahan.

---

## 4.5 Frontend API Client

Frontend tidak melakukan akses langsung ke PostgreSQL atau AI service.

```text
Next.js
    │
    │ REST API
    ▼
FastAPI
    │
    ├── Database
    ├── ML
    ├── Simulation
    ├── Recommendation
    └── RAG / LLM
```

---

# 5. Backend Architecture

## 5.1 Technology

Backend menggunakan:

- FastAPI;
- Python;
- Pydantic;
- PostgreSQL.

PRD menetapkan FastAPI sebagai application backend dan Pydantic untuk request/response validation. :contentReference[oaicite:3]{index=3}

---

## 5.2 Backend Responsibilities

Backend bertanggung jawab terhadap:

- authentication;
- authorization;
- user management;
- consent recording;
- health profile;
- assessment;
- risk engine orchestration;
- score calculation;
- explainability;
- simulation;
- recommendation;
- evidence retrieval;
- LLM orchestration;
- persistence;
- validation;
- error handling.

---

## 5.3 Backend Layering

Backend menggunakan layered architecture:

```text
API / Router
     ↓
Service
     ↓
Domain / Business Logic
     ↓
AI / Simulation / Recommendation
     ↓
Repository
     ↓
PostgreSQL
```

---

## 5.4 Suggested Backend Structure

```text
backend/
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── dependencies.py
│   │   └── routes/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── consent.py
│   │       ├── health_profile.py
│   │       ├── assessment.py
│   │       ├── risk.py
│   │       ├── simulation.py
│   │       ├── recommendation.py
│   │       └── evidence.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── health.py
│   │   ├── risk.py
│   │   ├── simulation.py
│   │   ├── recommendation.py
│   │   └── evidence.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── health_service.py
│   │   ├── risk_service.py
│   │   ├── simulation_service.py
│   │   ├── recommendation_service.py
│   │   ├── evidence_service.py
│   │   └── explanation_service.py
│   │
│   ├── domain/
│   │   ├── scoring/
│   │   ├── risk/
│   │   ├── simulation/
│   │   └── recommendation/
│   │
│   ├── repositories/
│   │   ├── user_repository.py
│   │   ├── health_repository.py
│   │   ├── assessment_repository.py
│   │   └── result_repository.py
│   │
│   ├── ai/
│   │   ├── risk_engine/
│   │   ├── explainability/
│   │   ├── simulation/
│   │   ├── recommendation/
│   │   └── rag/
│   │
│   ├── db/
│   │   ├── session.py
│   │   └── models/
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   │
│   └── utils/
│
├── tests/
│
├── requirements.txt
└── Dockerfile
```

---

# 6. API Architecture

## 6.1 API Style

HELIORA menggunakan REST API antara Next.js dan FastAPI.

```text
Next.js Frontend
       │
       │ HTTPS
       │ JSON
       ▼
FastAPI REST API
```

---

## 6.2 API Design Principles

API harus:

- menggunakan resource-oriented endpoint;
- menggunakan HTTP method sesuai fungsi;
- menggunakan JSON;
- memiliki request validation;
- memiliki response schema;
- memiliki consistent error response;
- tidak mengekspos internal implementation;
- tidak mengekspos secret;
- memiliki authentication pada endpoint privat.

---

## 6.3 Authentication Endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Endpoint reset password dapat diperlakukan sebagai extension apabila requirement resminya disetujui karena PRD tidak menetapkannya sebagai core MVP requirement.

---

## 6.4 Consent Endpoints

```text
GET  /api/v1/consent
POST /api/v1/consent
DELETE /api/v1/consent
```

Consent harus tercatat sebelum assessment dapat diproses.

---

## 6.5 Health Profile Endpoints

```text
GET  /api/v1/health-profile
POST /api/v1/health-profile
PUT  /api/v1/health-profile
```

---

## 6.6 Assessment Endpoints

```text
POST /api/v1/assessment
GET  /api/v1/assessment/latest
GET  /api/v1/assessment/{assessment_id}
```

---

## 6.7 Risk Endpoints

```text
POST /api/v1/risk/estimate
GET  /api/v1/risk/{assessment_id}
```

Risk output minimal:

```text
{
  "diabetes": {
    "risk": 0.0,
    "level": "..."
  },
  "hypertension": {
    "risk": 0.0,
    "level": "..."
  },
  "cardiovascular": {
    "risk": 0.0,
    "level": "..."
  },
  "health_score": 0.0,
  "lifestyle_score": 0.0
}
```

> Struktur response di atas adalah proposed API contract dan harus disesuaikan dengan model final.

---

## 6.8 Explainability Endpoint

```text
GET /api/v1/risk/{assessment_id}/explanation
```

Response dapat mencakup:

```text
{
  "factors": [
    {
      "feature": "sleep_duration",
      "contribution": "...",
      "direction": "..."
    }
  ]
}
```

Nilai kontribusi harus berasal dari explainability engine, bukan dibuat oleh LLM.

---

## 6.9 Simulation Endpoints

```text
POST /api/v1/simulation/future
POST /api/v1/simulation/what-if
```

Future simulation menerima:

```text
30 days
90 days
180 days
```

What-if simulation menerima perubahan parameter seperti:

```text
sleep_duration
physical_activity
weight
smoking_status
```

Parameter minimal sesuai PRD adalah Sleep Duration, Physical Activity, dan Weight. :contentReference[oaicite:4]{index=4}

---

## 6.10 Recommendation Endpoint

```text
GET /api/v1/recommendations/{assessment_id}
```

Recommendation harus berasal dari Rule Engine.

---

## 6.11 Evidence Endpoint

```text
GET /api/v1/evidence/{recommendation_id}
GET /api/v1/evidence/{evidence_id}
```

---

## 6.12 Explanation Endpoint

```text
POST /api/v1/explanation
```

Backend menggabungkan:

```text
Risk Result
+
XAI Factors
+
Recommendation
+
Retrieved Evidence
```

kemudian meneruskannya ke LLM.

---

# 7. Database Architecture

## 7.1 Database

Database utama:

**PostgreSQL**

PostgreSQL digunakan sebagai persistent relational data storage. :contentReference[oaicite:5]{index=5}

---

## 7.2 Database Responsibilities

PostgreSQL menyimpan data aplikasi seperti:

- user;
- authentication-related data;
- consent;
- health profile;
- assessment;
- risk result;
- simulation result;
- recommendation;
- evidence metadata.

Database tidak digunakan sebagai storage utama untuk model training artifact.

---

## 7.3 Logical Entity Model

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Consent       HealthProfile
 │               │
 │               ▼
 │          Assessment
 │               │
 │       ┌───────┼────────┐
 │       ▼       ▼        ▼
 │      Risk    Score   XAI Result
 │       │
 │       ▼
 │   Simulation
 │       │
 │       ▼
 │ Recommendation
 │       │
 │       ▼
 │    Evidence
 │
 └── Account
```

---

## 7.4 Proposed Tables

### users

| Field         | Type      | Description     |
| ------------- | --------- | --------------- |
| id            | UUID      | Primary key     |
| email         | string    | User email      |
| password_hash | string    | Hashed password |
| created_at    | timestamp | Creation time   |
| updated_at    | timestamp | Update time     |

---

### consents

| Field           | Type           | Description     |
| --------------- | -------------- | --------------- |
| id              | UUID           | Primary key     |
| user_id         | UUID           | User reference  |
| consent_version | string         | Consent version |
| accepted_at     | timestamp      | Acceptance time |
| revoked_at      | timestamp/null | Revocation time |

---

### health_profiles

| Field               | Type           | Description    |
| ------------------- | -------------- | -------------- |
| id                  | UUID           | Primary key    |
| user_id             | UUID           | User reference |
| age                 | integer        | User age       |
| gender              | string         | Gender         |
| height              | decimal        | Height         |
| weight              | decimal        | Weight         |
| physical_activity   | string/decimal | Activity level |
| sleep_duration      | decimal        | Sleep duration |
| smoking_status      | string         | Smoking status |
| family_history      | boolean        | Family history |
| stress_level        | integer/null   | Optional       |
| waist_circumference | decimal/null   | Optional       |
| blood_pressure      | string/null    | Optional       |
| blood_sugar         | decimal/null   | Optional       |
| cholesterol         | decimal/null   | Optional       |
| created_at          | timestamp      | Creation time  |
| updated_at          | timestamp      | Update time    |

---

### assessments

| Field             | Type      | Description       |
| ----------------- | --------- | ----------------- |
| id                | UUID      | Primary key       |
| user_id           | UUID      | User reference    |
| health_profile_id | UUID      | Profile reference |
| status            | string    | Processing status |
| created_at        | timestamp | Creation time     |

---

### risk_results

| Field               | Type      | Description          |
| ------------------- | --------- | -------------------- |
| id                  | UUID      | Primary key          |
| assessment_id       | UUID      | Assessment reference |
| diabetes_risk       | decimal   | Estimated risk       |
| hypertension_risk   | decimal   | Estimated risk       |
| cardiovascular_risk | decimal   | Estimated risk       |
| health_score        | decimal   | Health score         |
| lifestyle_score     | decimal   | Lifestyle score      |
| model_version       | string    | Model version        |
| created_at          | timestamp | Creation time        |

---

### xai_results

| Field          | Type    | Description           |
| -------------- | ------- | --------------------- |
| id             | UUID    | Primary key           |
| risk_result_id | UUID    | Risk result reference |
| feature_name   | string  | Feature               |
| contribution   | decimal | Contribution          |
| direction      | string  | Positive/negative     |
| rank           | integer | Feature rank          |

---

### simulations

| Field           | Type         | Description          |
| --------------- | ------------ | -------------------- |
| id              | UUID         | Primary key          |
| assessment_id   | UUID         | Assessment reference |
| simulation_type | string       | Future / What-if     |
| horizon_days    | integer/null | 30/90/180            |
| input_snapshot  | JSON         | Input used           |
| output_snapshot | JSON         | Simulation result    |
| created_at      | timestamp    | Creation time        |

---

### recommendations

| Field            | Type      | Description             |
| ---------------- | --------- | ----------------------- |
| id               | UUID      | Primary key             |
| assessment_id    | UUID      | Assessment reference    |
| rule_id          | string    | Rule identifier         |
| title            | string    | Recommendation title    |
| description      | text      | Recommendation          |
| guideline_source | string    | Source                  |
| priority         | string    | Recommendation priority |
| created_at       | timestamp | Creation time           |

---

### evidence

| Field             | Type        | Description              |
| ----------------- | ----------- | ------------------------ |
| id                | UUID        | Primary key              |
| recommendation_id | UUID/null   | Recommendation reference |
| title             | string      | Document title           |
| publisher         | string      | Organization/publisher   |
| source_url        | string      | Source                   |
| evidence_level    | string/null | Evidence level           |
| summary           | text        | Relevant summary         |
| created_at        | timestamp   | Creation time            |

---

# 8. AI / ML Architecture

## 8.1 AI Architecture

HELIORA menggunakan satu Preventive Lifestyle Risk Engine sebagai core ML engine.

```text
User Input
     ↓
Validation
     ↓
Feature Processing
     ↓
Preventive Lifestyle Risk Engine
     ↓
Risk Estimation
     +
Health Score
     +
Lifestyle Score
```

PRD secara eksplisit menyederhanakan MVP menjadi:

```text
1 Preventive Lifestyle Risk Engine
+
1 Main ML Dataset
+
1 RAG Knowledge Base
+
1 Rule Engine
```

dan tidak membangun NLP sebagai modul AI terpisah. :contentReference[oaicite:6]{index=6}

---

## 8.2 ML Responsibilities

ML hanya bertanggung jawab terhadap:

- risk estimation;
- output probability/score;
- model inference.

ML tidak bertanggung jawab terhadap:

- natural-language explanation;
- recommendation narrative;
- evidence retrieval;
- medical diagnosis.

---

## 8.3 ML Input Features

Required:

```text
Age
Gender
Height
Weight
Physical Activity
Sleep Duration
Smoking
Family History
```

Optional:

```text
Stress
Waist Circumference
Blood Pressure
Blood Sugar
Cholesterol
```

Data requirement tersebut ditetapkan dalam PRD. :contentReference[oaicite:7]{index=7}

---

## 8.4 Feature Processing

Pipeline:

```text
Raw Input
    ↓
Validation
    ↓
Missing Value Handling
    ↓
Categorical Encoding
    ↓
Numerical Transformation
    ↓
Feature Alignment
    ↓
Model Input
```

Feature preprocessing harus konsisten antara:

- training;
- validation;
- production inference;
- simulation inference.

---

## 8.5 Model Artifact

Model yang telah dilatih harus disimpan sebagai versioned artifact.

Contoh:

```text
models/
├── risk_engine/
│   ├── model/
│   ├── preprocessor/
│   ├── metadata/
│   └── version.json
```

Model artifact tidak disimpan di PostgreSQL.

---

# 9. Health Score Architecture

## 9.1 Purpose

Health Score memberikan ringkasan kondisi lifestyle pengguna.

Health Score bukan diagnosis dan bukan output langsung dari LLM.

---

## 9.2 Calculation

Health Score menggunakan weighted scoring sederhana.

Secara konseptual:

```text
Health Score =
    BMI Component
    +
    Physical Activity Component
    +
    Sleep Component
    +
    Smoking Component
    +
    Other Lifestyle Components
```

Bobot final harus ditentukan dan didokumentasikan sebelum implementation.

PRD menetapkan bahwa Health Score menggunakan formula weighted scoring sederhana dan bobot final harus ditentukan sebelum implementasi. :contentReference[oaicite:8]{index=8}

---

# 10. Lifestyle Score Architecture

## 10.1 Purpose

Lifestyle Score digunakan untuk merangkum kondisi kebiasaan pengguna.

Faktor yang dapat digunakan:

```text
Sleep
Physical Activity
Smoking
Weight / BMI
Lifestyle Indicators
```

Lifestyle Score harus dapat dijelaskan kepada pengguna.

---

# 11. Explainable AI Architecture

## 11.1 Technology

Primary:

**SHAP**

Alternative:

**LIME**

PRD memprioritaskan SHAP untuk explainability dan menyediakan LIME sebagai alternatif. :contentReference[oaicite:9]{index=9}

---

## 11.2 XAI Flow

```text
Risk Engine
     ↓
Prediction
     ↓
SHAP Explainer
     ↓
Feature Contributions
     ↓
Rank Factors
     ↓
Human-Friendly Mapping
     ↓
Frontend Explanation
```

---

## 11.3 XAI Output

Contoh:

```text
Top Factors

1. Sleep Duration
   Contribution: Negative

2. Physical Activity
   Contribution: Negative

3. BMI
   Contribution: Positive

4. Family History
   Contribution: Positive
```

Interpretasi bahasa natural harus dibatasi agar tidak menghasilkan klaim medis yang tidak didukung.

---

# 12. Simulation Architecture

## 12.1 Simulation Principle

HELIORA tidak menggunakan model simulation terpisah untuk MVP.

Simulation menggunakan **ML re-inference** dengan input yang dimodifikasi.

PRD menetapkan:

```text
Original Input
      ↓
Modify Selected Variables
      ↓
Re-run Model
      ↓
Compare Output
```

:contentReference[oaicite:10]{index=10}

---

## 12.2 Future Health Simulation

Flow:

```text
Current Health Profile
        ↓
Select Horizon
        ↓
30 / 90 / 180 Days
        ↓
Apply Simulation Assumption
        ↓
Generate Modified Input
        ↓
Risk Engine Re-inference
        ↓
Simulation Result
        ↓
Compare With Current Result
```

---

## 12.3 What-if Simulation

Flow:

```text
Current Scenario
       ↓
User Changes:
- Sleep
- Physical Activity
- Weight
- Smoking
       ↓
Validate Simulation Input
       ↓
Re-run Risk Engine
       ↓
Compare:
Current vs What-if
       ↓
Display Result
```

---

## 12.4 Simulation Safety

Simulation result harus menggunakan terminology:

```text
Estimated
Projected
Simulated
Scenario
```

Hindari:

```text
You will definitely...
You will get...
You have...
```

Simulation bukan kepastian medis.

---

# 13. Recommendation Engine Architecture

## 13.1 Principle

Recommendation Engine menggunakan **Rule Engine**, bukan LLM.

PRD menetapkan Recommendation Engine sebagai rule-based system. :contentReference[oaicite:11]{index=11}

---

## 13.2 Recommendation Flow

```text
User Profile
     +
Risk Result
     +
Lifestyle Indicators
     ↓
Rule Engine
     ↓
Matched Rules
     ↓
Recommendation
     ↓
Guideline Source
```

---

## 13.3 Example Rules

```text
IF sleep_duration < threshold
THEN recommend improving sleep duration

IF physical_activity = low
THEN recommend increasing physical activity

IF smoking_status = smoker
THEN recommend smoking cessation support

IF BMI = high
THEN recommend lifestyle-based weight management
```

Final threshold harus berasal dari guideline yang digunakan.

---

## 13.4 Rule Metadata

Setiap rule sebaiknya memiliki:

```text
rule_id
condition
recommendation
priority
guideline_source
evidence_reference
```

Contoh:

```text
rule_id:
REC-SLEEP-001

condition:
sleep_duration < configured_threshold

recommendation:
Improve sleep duration

source:
Guideline Reference

priority:
high
```

---

# 14. Safety Guardrail Architecture

## 14.1 Purpose

Safety Guardrail mencegah hasil HELIORA ditafsirkan sebagai diagnosis atau keputusan medis.

---

## 14.2 Risk Threshold Flow

```text
Risk Result
     ↓
Threshold Check
     ↓
Risk Above Configured Threshold?
     │
     ├── No
     │    ↓
     │ Normal Result
     │
     └── Yes
          ↓
      Safety Guardrail
          ↓
      Display General
      Health Advice
          ↓
      Consider Consulting
      Health Professional
```

PRD menetapkan bahwa risk threshold dapat mengaktifkan safety guardrail dan threshold tidak boleh dipresentasikan sebagai diagnosis. :contentReference[oaicite:12]{index=12}

---

## 14.3 Medical Disclaimer

Frontend harus menyediakan disclaimer:

> HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi/proyeksi berdasarkan data dan model yang digunakan, bukan diagnosis medis, bukan pengganti konsultasi dokter, dan bukan kepastian mengenai kondisi kesehatan seseorang.

Disclaimer tersebut merupakan boundary utama produk. :contentReference[oaicite:13]{index=13}

---

# 15. RAG Architecture

## 15.1 Purpose

RAG digunakan untuk menyediakan evidence yang relevan terhadap:

- recommendation;
- explanation;
- preventive health information.

RAG bukan risk prediction engine.

---

## 15.2 Knowledge Base

Target MVP:

**15–30 dokumen berkualitas dan terkurasi.**

Prioritas:

1. WHO
2. Kemenkes RI
3. PERKENI
4. PERKI
5. CDC
6. Scientific literature

PRD menetapkan knowledge base tersebut sebagai sumber evidence MVP. :contentReference[oaicite:14]{index=14}

---

## 15.3 RAG Pipeline

```text
Official Documents
       ↓
Document Collection
       ↓
Cleaning
       ↓
Chunking
       ↓
Metadata
       ↓
Embedding
       ↓
Vector Storage
       ↓
Retriever
       ↓
Relevant Evidence
```

---

## 15.4 Metadata

Setiap document/chunk minimal memiliki metadata:

```text
document_id
title
publisher
source_url
publication_date
category
evidence_level
chunk_id
```

---

## 15.5 Vector Storage

PRD **tidak mengunci vector database tertentu** pada tahap PRD.

Karena itu, pemilihan vector storage menjadi Architecture/Implementation Decision.

MVP harus memilih solusi yang:

- sederhana;
- mudah dideploy;
- sesuai volume knowledge base;
- dapat digunakan secara konsisten;
- tidak menambah infrastructure yang tidak diperlukan.

---

# 16. LLM Architecture

## 16.1 LLM Responsibility

LLM hanya digunakan sebagai explanation/presentation layer.

LLM bertanggung jawab terhadap:

- menjelaskan hasil;
- menyederhanakan bahasa;
- menyusun narasi;
- merangkum evidence.

PRD secara eksplisit melarang LLM digunakan sebagai risk prediction engine. :contentReference[oaicite:15]{index=15}

---

## 16.2 LLM Flow

```text
Risk Result
     +
XAI Factors
     +
Recommendation
     +
Retrieved Evidence
     ↓
Prompt Builder
     ↓
LLM
     ↓
Response Validation
     ↓
Human-Friendly Explanation
```

---

## 16.3 LLM Constraints

LLM tidak boleh:

- menghitung risk score;
- mengubah risk score;
- membuat diagnosis;
- memberikan prescription;
- mengganti Rule Engine;
- membuat evidence palsu;
- menghasilkan citation yang tidak berasal dari retrieved evidence.

---

## 16.4 LLM Fallback

Jika LLM tidak tersedia:

```text
LLM Failure
    ↓
Fallback Explanation
    ↓
Structured Risk Result
+
XAI Factors
+
Recommendation
+
Evidence
```

Dengan demikian core application tetap dapat digunakan.

PRD menetapkan fallback ketika LLM/RAG tidak tersedia. :contentReference[oaicite:16]{index=16}

---

# 17. End-to-End Data Flow

## 17.1 Main Flow

```text
                         USER
                           │
                           ▼
                  Next.js Frontend
                           │
                           ▼
                    Consent Check
                           │
                           ▼
                   Health Profile
                           │
                           ▼
                    FastAPI API
                           │
                           ▼
                     Validation
                           │
                           ▼
                  Feature Processing
                           │
                           ▼
               Preventive Risk Engine
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Diabetes      Hypertension   Cardiovascular
          Risk            Risk           Risk
              │            │            │
              └────────────┼────────────┘
                           ▼
                    Health Score
                           +
                   Lifestyle Score
                           │
                           ▼
                       SHAP
                           │
                           ▼
                   Risk Explanation
                           │
                           ▼
                      Simulation
                           │
                           ▼
                    Rule Engine
                           │
                           ▼
                   Recommendation
                           │
                           ▼
                       RAG
                           │
                           ▼
                        LLM
                           │
                           ▼
                Explanation + Evidence
                           │
                           ▼
                    Next.js UI
                           │
                           ▼
                         USER
```

---

# 18. What-if Data Flow

```text
Current Profile
      │
      ▼
Current Risk
      │
      ├─────────────────────┐
      │                     │
      ▼                     ▼
Current Scenario       User Changes
                           │
                           ▼
                     Simulation Input
                           │
                           ▼
                      Validation
                           │
                           ▼
                     Re-run ML Model
                           │
                           ▼
                   Simulated Risk
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
       Current Result              Simulation Result
             │                           │
             └─────────────┬─────────────┘
                           ▼
                       Comparison
                           │
                           ▼
                   User-Friendly Result
```

---

# 19. Future Health Simulation Data Flow

Future Health Simulation menggunakan pendekatan yang sama dengan simulation MVP.

```text
Current Lifestyle
       ↓
Select:
30 / 90 / 180 Days
       ↓
Simulation Parameters
       ↓
Modified Input
       ↓
Risk Engine Re-inference
       ↓
Projected Result
       ↓
Comparison
       ↓
Explanation
```

Simulation harus tetap diposisikan sebagai projection/scenario dan bukan kepastian medis.

---

# 20. Authentication & Authorization Architecture

## 20.1 Authentication Flow

```text
User
 ↓
Register
 ↓
Password Hashing
 ↓
Database
 ↓
Login
 ↓
Credential Validation
 ↓
Authenticated Session
 ↓
Protected API
```

PRD menetapkan register, login, logout, password hashing, dan session management sebagai bagian MVP. :contentReference[oaicite:17]{index=17}

---

## 20.2 Password Security

Password:

```text
Plain Password
      ↓
Password Hashing
      ↓
Stored Hash
```

Password plaintext tidak boleh disimpan.

---

## 20.3 Authorization

Protected resource harus memastikan:

```text
Authenticated User
        +
Resource Ownership
        ↓
Access Allowed
```

User tidak boleh mengakses:

- health profile user lain;
- assessment user lain;
- risk result user lain;
- simulation result user lain;
- private account data user lain.

---

# 21. Consent & Privacy Architecture

## 21.1 Consent Flow

```text
User
 ↓
Consent Screen
 ↓
Medical Disclaimer
 ↓
Data Usage Explanation
 ↓
User Agreement
 ↓
Consent Recorded
 ↓
Assessment Allowed
```

Design.md juga menetapkan bahwa user tidak dapat melanjutkan assessment sebelum memberikan consent. :contentReference[oaicite:18]{index=18}

---

## 21.2 Privacy Principles

MVP menerapkan:

- data minimization;
- consent;
- protected access;
- secret protection;
- no unnecessary sensitive data;
- controlled third-party integration.

---

# 22. Security Architecture

## 22.1 Security Layers

```text
Browser
   ↓
HTTPS
   ↓
Next.js
   ↓
FastAPI
   ↓
Authentication
   ↓
Authorization
   ↓
Input Validation
   ↓
Business Logic
   ↓
Database
```

---

## 22.2 API Security

API harus menerapkan:

- authentication;
- authorization;
- request validation;
- response validation;
- rate limiting jika diperlukan;
- secure error handling;
- secret protection.

---

## 22.3 Secret Management

Secret tidak boleh disimpan dalam source code.

Contoh:

```text
DATABASE_URL
SECRET_KEY
LLM_API_KEY
EMBEDDING_API_KEY
```

disimpan melalui environment configuration.

---

## 22.4 Frontend Secret Rule

API key LLM atau credential backend tidak boleh diekspos ke browser.

```text
Browser
  ✕
LLM API Key

FastAPI
  ✓
LLM Provider
```

---

# 23. Data Validation Architecture

Validation terjadi pada beberapa level.

```text
Frontend Validation
        ↓
FastAPI / Pydantic Validation
        ↓
Business Rule Validation
        ↓
AI Input Validation
        ↓
Database Constraints
```

Frontend validation meningkatkan UX.

Backend validation tetap menjadi authority utama.

---

# 24. Error Handling Architecture

## 24.1 Error Flow

```text
Error
 ↓
Detect
 ↓
Log Internally
 ↓
Map to Safe Error
 ↓
Return API Response
 ↓
Frontend Error State
```

---

## 24.2 API Error Format

Proposed format:

```text
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid.",
    "details": []
  }
}
```

Internal error detail tidak boleh dibocorkan ke user.

---

## 24.3 AI Failure

Jika Risk Engine gagal:

```text
Risk Engine Failure
      ↓
Error State
      ↓
No fabricated result
      ↓
Retry / Graceful Failure
```

Jika LLM gagal:

```text
LLM Failure
      ↓
Fallback Explanation
```

---

# 25. Performance Architecture

PRD menetapkan target:

| Area                |           Target |
| ------------------- | ---------------: |
| Page response       |        < 3 detik |
| What-if Simulation  | < 1 detik target |
| LLM/RAG explanation | < 5 detik target |

:contentReference[oaicite:19]{index=19}

---

## 25.1 Performance Strategy

### Frontend

- minimize unnecessary rendering;
- optimize API requests;
- loading states;
- lazy loading untuk komponen yang diperlukan;
- responsive interaction.

### Backend

- lightweight synchronous request untuk operasi cepat;
- reusable service;
- efficient database queries;
- avoid unnecessary external calls.

### Simulation

What-if Simulation harus menghindari:

- retraining model;
- rebuilding pipeline;
- external LLM call.

Flow:

```text
Stored Model
     ↓
Modified Input
     ↓
Inference
     ↓
Result
```

---

## 25.2 LLM Performance

LLM tidak dipanggil untuk:

- risk calculation;
- simulation;
- scoring;
- rule matching.

LLM hanya dipanggil ketika explanation diperlukan.

---

# 26. Reliability Architecture

## 26.1 Core Principle

Core functionality harus tetap dapat berjalan tanpa LLM.

```text
Core
 ├── Authentication
 ├── Profile
 ├── Risk
 ├── XAI
 ├── Simulation
 └── Recommendation

Optional AI Presentation
 └── LLM
```

---

## 26.2 Graceful Degradation

```text
RAG/LLM Available
       ↓
Rich Explanation
+
Evidence
```

Jika tidak tersedia:

```text
RAG/LLM Unavailable
       ↓
Structured Explanation
+
Evidence Metadata
+
Recommendation
```

---

# 27. Deployment Architecture

## 27.1 Containerized Architecture

Docker digunakan untuk menjaga konsistensi environment development dan deployment.

Proposed architecture:

```text
                   Internet
                      │
                      ▼
              ┌──────────────┐
              │   Frontend   │
              │   Next.js    │
              └──────┬───────┘
                     │
                     │ HTTPS / REST
                     ▼
              ┌──────────────┐
              │   Backend    │
              │   FastAPI    │
              └──────┬───────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
    PostgreSQL     ML/Risk    RAG/LLM
```

---

## 27.2 Docker Services

Logical services:

```text
frontend
backend
postgres
```

AI components dapat berada di dalam backend pada MVP apabila kebutuhan infrastructure belum memerlukan service terpisah.

---

## 27.3 Environment

Minimal:

```text
Development
Staging / Demo
Production
```

Untuk kompetisi, environment staging/demo harus diprioritaskan agar live demo dapat diuji sebelum presentation.

---

# 28. Configuration Management

## 28.1 Environment Variables

Contoh:

```text
APP_ENV
DATABASE_URL
SECRET_KEY

LLM_PROVIDER
LLM_API_KEY

RAG_CONFIGURATION
MODEL_PATH
```

Provider LLM dan vector database tidak dikunci pada PRD dan menjadi implementation decision. :contentReference[oaicite:20]{index=20}

---

# 29. AI Model Lifecycle

## 29.1 Development Flow

```text
Dataset
   ↓
Data Cleaning
   ↓
Feature Engineering
   ↓
Train / Test Split
   ↓
Model Training
   ↓
Evaluation
   ↓
Explainability Test
   ↓
Model Selection
   ↓
Model Artifact
   ↓
Backend Integration
```

---

## 29.2 Model Versioning

Setiap model harus memiliki:

```text
model_name
model_version
training_dataset
feature_version
training_date
evaluation_metrics
```

Contoh:

```text
risk-engine-v1.0
```

---

## 29.3 Model Evaluation

MVP menggunakan evaluasi dasar:

- train/test split;
- accuracy jika relevan;
- AUC jika relevan;
- confusion matrix jika relevan.

Fairness analysis mendalam merupakan future work sesuai scope PRD. :contentReference[oaicite:21]{index=21}

---

# 30. Dataset Architecture

## 30.1 Primary ML Dataset

MVP menggunakan:

```text
1 Primary Lifestyle / Health Dataset
```

Kandidat prioritas:

1. CDC BRFSS
2. NHANES
3. Dataset kesehatan publik lain yang kompatibel

Pemilihan final harus berdasarkan:

- accessibility;
- documentation;
- legal usability;
- relevant lifestyle features;
- appropriate health target;
- data quality.

:contentReference[oaicite:22]{index=22}

---

## 30.2 Indonesia Context Data

Data Indonesia digunakan untuk:

- problem validation;
- contextual analysis;
- supporting statistics;
- limitation analysis.

Candidate:

- SKI 2023;
- IFLS;
- Riskesdas;
- BPS.

Data tersebut tidak harus digunakan untuk training model MVP. :contentReference[oaicite:23]{index=23}

---

# 31. Evidence Architecture

## 31.1 Evidence Source Hierarchy

Prioritas:

```text
WHO
 ↓
Kemenkes RI
 ↓
PERKENI
 ↓
PERKI
 ↓
CDC
 ↓
Scientific Literature
```

---

## 31.2 Evidence Center

Evidence Center menampilkan:

- source;
- document title;
- organization/publisher;
- relevance summary;
- evidence level jika tersedia.

PRD menetapkan elemen tersebut sebagai bagian dari Evidence Center. :contentReference[oaicite:24]{index=24}

---

# 32. Observability & Logging

## 32.1 Application Logging

Backend harus mencatat event teknis seperti:

```text
Request
Authentication Event
Assessment Request
Risk Engine Execution
Simulation Execution
Recommendation Generation
RAG Retrieval
LLM Request
Error
```

---

## 32.2 Sensitive Data

Log tidak boleh menyimpan:

- plaintext password;
- API key;
- authentication secret;
- unnecessary sensitive health data.

---

# 33. Testing Architecture

## 33.1 Testing Layers

```text
Unit Test
    ↓
Integration Test
    ↓
API Test
    ↓
AI Test
    ↓
End-to-End Test
    ↓
Security Test
    ↓
Performance Test
```

---

## 33.2 Backend Tests

Test:

- authentication;
- validation;
- health profile;
- business rules;
- risk service;
- simulation;
- recommendation;
- evidence;
- error handling.

---

## 33.3 AI Tests

Test:

- model loading;
- inference;
- output range;
- preprocessing consistency;
- SHAP generation;
- simulation re-inference;
- rule execution.

---

## 33.4 RAG Tests

Test:

- document ingestion;
- retrieval;
- metadata;
- relevance;
- evidence mapping;
- fallback.

---

## 33.5 LLM Tests

Test:

- explanation generation;
- context adherence;
- no risk score modification;
- no diagnosis claims;
- evidence-grounded response;
- fallback.

---

# 34. Core Feature Architecture Mapping

| Product Feature    | Frontend | Backend | AI/Data         |
| ------------------ | -------- | ------- | --------------- |
| Authentication     | Next.js  | FastAPI | PostgreSQL      |
| Consent            | Next.js  | FastAPI | PostgreSQL      |
| Health Profile     | Next.js  | FastAPI | PostgreSQL      |
| Risk Estimation    | Next.js  | FastAPI | Scikit-learn    |
| Health Score       | Next.js  | FastAPI | Business Logic  |
| Lifestyle Score    | Next.js  | FastAPI | Business Logic  |
| Explainable AI     | Next.js  | FastAPI | SHAP            |
| Future Simulation  | Next.js  | FastAPI | ML Re-inference |
| What-if Simulation | Next.js  | FastAPI | ML Re-inference |
| Recommendation     | Next.js  | FastAPI | Rule Engine     |
| Evidence Center    | Next.js  | FastAPI | RAG             |
| AI Explanation     | Next.js  | FastAPI | RAG + LLM       |
| Safety Guardrail   | Next.js  | FastAPI | Rule Engine     |

---

# 35. Design-to-Architecture Mapping

Design.md menjadi referensi UI/UX, sementara Architecture.md menyediakan implementation boundary.

| Design Area       | Architecture Responsibility |
| ----------------- | --------------------------- |
| Landing Page      | Next.js                     |
| Authentication UI | Next.js + FastAPI           |
| Consent           | Next.js + FastAPI           |
| Health Profile    | Next.js + FastAPI           |
| Dashboard         | Next.js + REST API          |
| Risk Detail       | Next.js + Risk API          |
| XAI               | Next.js + SHAP API          |
| Future Simulation | Next.js + Simulation API    |
| What-if           | Next.js + Simulation API    |
| Recommendation    | Next.js + Rule Engine       |
| Evidence Center   | Next.js + RAG API           |
| LLM Explanation   | Next.js + FastAPI + LLM     |

Design document juga menghubungkan halaman dengan FR/BR/AC dari PRD, sehingga Architecture tidak boleh mengubah behavior yang telah ditentukan. :contentReference[oaicite:25]{index=25}

---

# 36. Core Sequence — Assessment

```text
User
 │
 │ Submit Assessment
 ▼
Next.js
 │
 │ POST /assessment
 ▼
FastAPI
 │
 ├── Validate Request
 │
 ├── Verify Consent
 │
 ├── Save Assessment
 │
 └── Invoke Risk Service
          │
          ▼
    Feature Processing
          │
          ▼
      Risk Engine
          │
          ├── Diabetes
          ├── Hypertension
          └── Cardiovascular
          │
          ├── Health Score
          └── Lifestyle Score
          │
          ▼
       SHAP
          │
          ▼
    Save Results
          │
          ▼
      API Response
          │
          ▼
      Next.js
          │
          ▼
       Dashboard
```

---

# 37. Core Sequence — Recommendation & Evidence

```text
Risk Result
     │
     ▼
Rule Engine
     │
     ▼
Recommendation
     │
     ▼
Evidence Retrieval
     │
     ▼
Relevant Evidence
     │
     ▼
Prompt Builder
     │
     ▼
LLM
     │
     ▼
Explanation
     │
     ▼
Frontend
```

---

# 38. Core Sequence — What-if Simulation

```text
User
 │
 ▼
What-if UI
 │
 │ Change Sleep / Activity / Weight
 ▼
Simulation API
 │
 ▼
Validate Input
 │
 ▼
Build Simulation Input
 │
 ▼
Risk Engine
 │
 ▼
Simulated Risk
 │
 ▼
Compare Current vs Simulated
 │
 ▼
Return Result
 │
 ▼
Frontend
```

Target response time:

**< 1 second** where technically achievable under normal MVP conditions.

---

# 39. Architecture Boundaries

## 39.1 Frontend Must Not

Frontend tidak boleh:

- mengakses PostgreSQL secara langsung;
- menjalankan model ML production;
- menyimpan LLM API key;
- menentukan risk score;
- menentukan recommendation rule;
- mengubah evidence.

---

## 39.2 Backend Must Not

Backend tidak boleh:

- memperlakukan LLM sebagai risk engine;
- membuat diagnosis;
- mengizinkan user mengakses data user lain;
- menerima input tanpa validation.

---

## 39.3 LLM Must Not

LLM tidak boleh:

- menghitung risk score;
- mengubah risk score;
- membuat diagnosis;
- menentukan safety threshold;
- menggantikan Rule Engine;
- mengarang evidence.

---

## 39.4 Database Must Not

Database tidak boleh menjadi tempat untuk:

- business logic utama;
- model inference;
- LLM generation.

Database hanya menyimpan persistent application data dan metadata yang diperlukan.

---

# 40. Technology Stack

## 40.1 Final MVP Stack

| Layer               | Technology               |
| ------------------- | ------------------------ |
| Frontend            | Next.js                  |
| Frontend Language   | TypeScript               |
| Styling             | Tailwind CSS             |
| Backend             | FastAPI                  |
| Backend Language    | Python                   |
| Validation          | Pydantic                 |
| Database            | PostgreSQL               |
| Data Processing     | Pandas                   |
| Numerical Computing | NumPy                    |
| Machine Learning    | Scikit-learn             |
| Explainability      | SHAP                     |
| Simulation          | Python + ML Re-inference |
| Recommendation      | Rule Engine              |
| Retrieval           | RAG                      |
| Generative AI       | LLM                      |
| Containerization    | Docker                   |
| Version Control     | Git + GitHub             |

Technology stack tersebut ditetapkan sebagai final blueprint MVP pada PRD. :contentReference[oaicite:26]{index=26}

---

# 41. Technology Decisions Not Locked by PRD

Beberapa detail belum dikunci oleh PRD dan karena itu menjadi implementation decision:

### LLM Provider

Belum dikunci.

### Vector Database

Belum dikunci.

### Authentication Mechanism Detail

Framework/library dan session/token strategy perlu dipilih pada implementation phase.

### ORM

Belum dikunci oleh PRD.

### Reverse Proxy

Belum dikunci.

### Cloud Provider

Belum dikunci.

### CI/CD Provider

Belum dikunci.

Prinsip:

> Jangan menambahkan technology hanya karena tersedia. Pilih technology yang paling sederhana untuk memenuhi requirement MVP.

PRD secara eksplisit menyatakan provider LLM dan vector database belum dikunci pada tahap PRD. :contentReference[oaicite:27]{index=27}

---

# 42. Architecture Decision Records

Keputusan teknis penting harus dicatat menggunakan ADR.

Format:

```text
ADR-001 — Frontend Framework
ADR-002 — Backend Framework
ADR-003 — Database
ADR-004 — ML Architecture
ADR-005 — Explainability
ADR-006 — Simulation Strategy
ADR-007 — Recommendation Engine
ADR-008 — RAG Strategy
ADR-009 — LLM Provider
ADR-010 — Vector Storage
ADR-011 — Authentication Strategy
ADR-012 — Deployment Strategy
```

---

# 43. Architecture Decision Summary

## ADR-001 — Next.js

**Decision:** Use Next.js.

**Reason:**

- sesuai technology blueprint;
- mendukung React-based interactive UI;
- cocok untuk dashboard;
- mendukung What-if interaction.

---

## ADR-002 — FastAPI

**Decision:** Use FastAPI.

**Reason:**

- Python ecosystem;
- AI/ML compatibility;
- REST API;
- validation dengan Pydantic.

---

## ADR-003 — PostgreSQL

**Decision:** Use PostgreSQL.

**Reason:**

- relational data;
- reliable persistence;
- cocok untuk user, profile, assessment, result;
- mudah diintegrasikan dengan FastAPI.

---

## ADR-004 — One Main Risk Engine

**Decision:** One Preventive Lifestyle Risk Engine.

**Reason:**

- mengurangi complexity;
- mempermudah maintenance;
- sesuai MVP scope;
- mempertahankan killer feature.

---

## ADR-005 — SHAP

**Decision:** SHAP sebagai primary explainability technology.

**Reason:**

- feature contribution;
- transparency;
- cocok dengan kebutuhan XAI.

---

## ADR-006 — ML Re-inference

**Decision:** Simulation menggunakan ML re-inference.

**Reason:**

- tidak membutuhkan simulation model terpisah;
- lebih sederhana;
- mudah digunakan untuk What-if.

---

## ADR-007 — Rule Engine

**Decision:** Recommendation menggunakan Rule Engine.

**Reason:**

- deterministic;
- cepat;
- mudah diuji;
- guideline dapat dilacak.

---

## ADR-008 — RAG + LLM Separation

**Decision:**

```text
RAG = Evidence Retrieval
LLM = Explanation
```

**Reason:**

- mengurangi hallucination;
- evidence dapat ditampilkan;
- responsibility jelas.

---

# 44. MVP Architecture Simplification

Arsitektur final MVP dapat diringkas:

```text
                    HELIORA
                       │
                       ▼
                Next.js Frontend
                       │
                       ▼
                 FastAPI Backend
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     PostgreSQL     Risk Engine   RAG / LLM
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
             SHAP   Simulation  Rule Engine
```

Tidak diperlukan:

```text
✕ Multiple ML services
✕ Multiple independent AI models
✕ Separate NLP pipeline
✕ Complex simulation engine
✕ Complex microservice infrastructure
✕ LLM-based risk prediction
```

---

# 45. Scalability Strategy

MVP menggunakan modular architecture tanpa memaksakan microservices.

```text
MVP
│
└── Modular Monolith
      │
      ├── Auth
      ├── Profile
      ├── Risk
      ├── Simulation
      ├── Recommendation
      ├── RAG
      └── Explanation
```

Jika kebutuhan meningkat:

```text
Modular Monolith
       ↓
Identify Bottleneck
       ↓
Extract Service Only When Needed
```

Microservices bukan requirement MVP.

---

# 46. Maintainability Strategy

Code harus:

- memiliki separation of concerns;
- menggunakan typed schemas;
- memiliki service layer;
- memiliki repository layer;
- memiliki AI modules terpisah;
- memiliki configuration terpusat;
- memiliki tests;
- memiliki documentation;
- menggunakan Git.

---

# 47. Repository Architecture

Proposed monorepo:

```text
heliora/
│
├── frontend/
│
├── backend/
│
├── ml/
│   ├── notebooks/
│   ├── datasets/
│   ├── training/
│   ├── evaluation/
│   └── models/
│
├── rag/
│   ├── documents/
│   ├── ingestion/
│   └── metadata/
│
├── docs/
│   ├── PRD.md
│   ├── Design.md
│   ├── Architecture.md
│   └── ADR/
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

Struktur repository ini merupakan proposed implementation structure.

---

# 48. Development Workflow

```text
Requirement
    ↓
Design
    ↓
Architecture
    ↓
Implementation
    ↓
Unit Test
    ↓
Integration Test
    ↓
QA
    ↓
Deployment
    ↓
Demo
```

---

# 49. Git Workflow

Recommended:

```text
main
  │
  ├── develop
  │
  ├── feature/frontend-*
  ├── feature/backend-*
  ├── feature/ai-*
  ├── feature/rag-*
  └── fix/*
```

Pull Request harus:

- memiliki description;
- memiliki related issue/task;
- diuji sebelum merge;
- tidak mengandung secret;
- tidak merusak core flow.

---

# 50. Architecture-to-Team Responsibility

| Architecture Area       | Primary Team               |
| ----------------------- | -------------------------- |
| Product Architecture    | Angga                      |
| Solution Architecture   | Angga, Gilang, Aksal       |
| Frontend Architecture   | Pino, Tumir                |
| Backend Architecture    | Gilang, Aksal              |
| AI/ML Architecture      | Gilang, Aksal              |
| Database Architecture   | Gilang, Aksal              |
| RAG/LLM                 | Gilang, Aksal              |
| QA Architecture         | Gilang, Aksal, Pino, Tumir |
| Deployment Architecture | Pino, Tumir                |
| Documentation           | Angga                      |

Pembagian ini mengikuti pembagian role tim yang ditetapkan dalam PRD. :contentReference[oaicite:28]{index=28}

---

# 51. Architecture Quality Gates

Architecture dianggap siap untuk implementation apabila:

- [ ] Frontend stack sudah ditetapkan.
- [ ] Backend stack sudah ditetapkan.
- [ ] Database sudah ditetapkan.
- [ ] API boundary sudah ditentukan.
- [ ] Database entities sudah ditentukan.
- [ ] AI flow sudah ditentukan.
- [ ] Simulation strategy sudah ditentukan.
- [ ] Recommendation strategy sudah ditentukan.
- [ ] RAG boundary sudah ditentukan.
- [ ] LLM responsibility sudah ditentukan.
- [ ] Security boundary sudah ditentukan.
- [ ] Privacy boundary sudah ditentukan.
- [ ] Deployment strategy sudah ditentukan.
- [ ] Error handling sudah ditentukan.
- [ ] Testing strategy sudah ditentukan.
- [ ] Architecture tidak melanggar MVP scope.

---

# 52. Architecture Constraints

Architecture MVP wajib mengikuti constraint berikut:

1. Tidak menggunakan Laravel.
2. FastAPI menjadi application backend utama.
3. Next.js menjadi frontend utama.
4. PostgreSQL menjadi persistent relational database.
5. Tidak membuat model ML terpisah untuk setiap simulation.
6. LLM tidak digunakan sebagai risk prediction engine.
7. LLM tidak digunakan sebagai medical decision engine.
8. Tidak membuat NLP pipeline terpisah.
9. Tidak membuat infrastructure AI kompleks tanpa kebutuhan.
10. Provider LLM tidak dianggap locked sampai diputuskan pada implementation.
11. Vector database tidak dianggap locked sampai diputuskan pada implementation.
12. Semua data user harus melalui access control.
13. Semua health result harus menggunakan medical safety boundary.

Constraint tersebut mengikuti technology constraints pada PRD_Revisi. :contentReference[oaicite:29]{index=29}

---

# 53. Future Architecture Considerations

Fitur berikut tidak menjadi dependency MVP:

- smartwatch/wearable;
- domain-specific recalibration;
- fairness evaluation;
- advanced personalization;
- longitudinal health tracking;
- additional health indicators;
- broader Indonesian datasets;
- improved simulation methodology;
- expanded Evidence Center;
- medical professional collaboration.

Future architecture tidak boleh mengganggu kestabilan MVP.

---

# 54. Final Architecture Summary

Arsitektur HELIORA MVP:

```text
                         USER
                           │
                           ▼
                 ┌──────────────────┐
                 │ Next.js Frontend │
                 │ TypeScript       │
                 │ Tailwind CSS     │
                 └────────┬─────────┘
                          │
                       REST API
                          │
                          ▼
                 ┌──────────────────┐
                 │ FastAPI Backend  │
                 │ Python           │
                 └────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
   ┌────────────┐  ┌──────────────┐  ┌─────────────┐
   │ PostgreSQL │  │ AI / ML Layer│  │ RAG / LLM   │
   │            │  │              │  │             │
   │ User       │  │ Risk Engine  │  │ Retrieval   │
   │ Profile    │  │ SHAP         │  │ Evidence    │
   │ Assessment │  │ Simulation   │  │ Explanation │
   │ Results    │  │ Rule Engine  │  │ LLM         │
   └────────────┘  └──────────────┘  └─────────────┘
```

Core AI flow:

```text
User Input
    ↓
Data Validation
    ↓
Feature Processing
    ↓
Preventive Lifestyle Risk Engine
    ↓
Risk Estimation
    +
Health Score
    +
Lifestyle Score
    ↓
SHAP
    ↓
Explainable AI
    ↓
Future Health Simulation
    ↓
What-if Simulation
    ↓
Recommendation Rule Engine
    ↓
RAG
    ↓
LLM
    ↓
Human-Friendly Explanation
    +
Evidence
```

---

# 55. Final Architecture Principles

HELIORA MVP dibangun dengan prinsip:

```text
Simple
   +
Modular
   +
Explainable
   +
Evidence-Based
   +
Secure
   +
Testable
   +
Competition-Ready
```

Architecture tidak mengejar kompleksitas teknologi.

Architecture mengejar:

> **kemampuan sistem untuk memberikan personalized preventive health insight, explainability, simulation, recommendation, dan evidence secara stabil dalam scope MVP.**

---

# 56. Definition of Architecture Done

Architecture.md dianggap selesai apabila:

- [ ] System architecture terdokumentasi.
- [ ] Frontend architecture terdokumentasi.
- [ ] Backend architecture terdokumentasi.
- [ ] API architecture terdokumentasi.
- [ ] Database architecture terdokumentasi.
- [ ] AI/ML architecture terdokumentasi.
- [ ] XAI architecture terdokumentasi.
- [ ] Simulation architecture terdokumentasi.
- [ ] Recommendation architecture terdokumentasi.
- [ ] RAG architecture terdokumentasi.
- [ ] LLM architecture terdokumentasi.
- [ ] Security architecture terdokumentasi.
- [ ] Privacy architecture terdokumentasi.
- [ ] Deployment architecture terdokumentasi.
- [ ] Testing architecture terdokumentasi.
- [ ] Technology constraints terdokumentasi.
- [ ] Architecture tidak bertentangan dengan PRD.
- [ ] Architecture tidak bertentangan dengan Design.md.
- [ ] Architecture dapat digunakan sebagai blueprint implementasi.

---

# Document Status

**HELIORA Architecture Document**

**Status:** Final Technical Blueprint — MVP

**Source of Truth Hierarchy:**

```text
PRD_Revisi.md
     │
     │ Requirements / Scope / Rules / Acceptance Criteria
     ▼
Design.md
     │
     │ UI / UX / Flow / Interaction
     ▼
Architecture.md
     │
     │ System / API / Database / AI / Security / Deployment
     ▼
Implementation
```

Architecture.md tidak mengubah product requirement maupun design behavior. Jika terdapat konflik antara dokumen, requirement pada PRD menjadi acuan utama, sedangkan Design.md menjadi acuan untuk UI/UX.
