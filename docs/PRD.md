# HELIORA

# Product Requirements Document (PRD)

---

# 1. Document Control

## 1.1 Document Information

| Item             | Information                                        |
| ---------------- | -------------------------------------------------- |
| Document Title   | HELIORA Product Requirements Document (PRD)        |
| Product Name     | HELIORA                                            |
| Product Category | AI-Powered Preventive Health Intelligence Platform |
| Document Version | 1.1                                                |
| Document Status  | Draft — Revised                                    |
| Created Date     | August 2026                                        |
| Last Updated     | 19 August 2026                                     |
| Language         | English & Indonesian                               |
| Confidentiality  | Internal Team Document                             |

---

## 1.2 Document Purpose

Dokumen ini merupakan **Product Requirements Document (PRD)** resmi untuk proyek **HELIORA**.

PRD berfungsi sebagai _single source of truth_ selama proses pengembangan produk dan menjadi acuan utama bagi seluruh anggota tim dalam memahami tujuan produk, kebutuhan pengguna, ruang lingkup, spesifikasi fungsional, arsitektur AI, kebutuhan data, serta target implementasi Minimum Viable Product (MVP).

Dokumen ini disusun untuk memastikan seluruh keputusan produk bersifat konsisten, terdokumentasi, dan dapat ditelusuri selama siklus pengembangan.

---

## 1.3 Intended Audience

Dokumen ini ditujukan untuk seluruh pemangku kepentingan yang terlibat dalam pengembangan HELIORA.

| Stakeholder        | Responsibility                                    |
| ------------------ | ------------------------------------------------- |
| Product Manager    | Product planning, roadmap, feature prioritization |
| Business Analyst   | Problem validation, business analysis             |
| Solution Architect | System architecture and technical decisions       |
| Frontend Engineer  | User Interface implementation                     |
| Backend Engineer   | Business logic, API, database                     |
| DevOps Engineer    | Deployment, infrastructure, monitoring            |
| QA Engineer        | Testing and quality assurance                     |
| Presentation Team  | Documentation and competition presentation        |

---

## 1.4 Project Information

| Item                 | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| Project Name         | HELIORA                                                     |
| SDG Category         | SDG 3 – Good Health and Well-being                          |
| Competition          | INSEVENT 2026 Fullstack Web Development Competition         |
| Development Type     | Minimum Viable Product (MVP)                                |
| Platform             | Web Application                                             |
| Development Approach | Agile Development                                           |
| Repository           | GitHub (Private during development, Public upon submission) |

---

## 1.5 Product Definition

HELIORA adalah **AI-Powered Preventive Health Intelligence Platform** yang membantu masyarakat memahami kondisi kesehatan mereka berdasarkan pola hidup, mengestimasi risiko penyakit tidak menular, mensimulasikan berbagai perubahan gaya hidup, serta memberikan rekomendasi preventif berbasis Artificial Intelligence dan evidence ilmiah.

HELIORA **bukan aplikasi diagnosis medis**, **bukan aplikasi telemedicine**, dan **bukan pengganti tenaga kesehatan profesional**. Seluruh hasil analisis bersifat estimasi berbasis data gaya hidup dan ditujukan sebagai sarana edukasi serta pengambilan keputusan preventif.

---

## 1.6 Document Scope

PRD ini mencakup seluruh kebutuhan produk yang diperlukan untuk pengembangan MVP HELIORA, meliputi:

- Product overview
- Problem statement
- Product vision
- Scope
- User persona
- User journey
- Functional requirements
- AI features
- Data requirements
- Technology stack
- Non-functional requirements
- Business rules
- Acceptance criteria
- MVP roadmap
- Risks and assumptions
- Out of scope
- Definition of Done
- Appendix

Dokumen ini tidak membahas implementasi teknis secara mendalam seperti struktur database, spesifikasi API, diagram arsitektur, maupun deployment. Detail tersebut dijelaskan pada dokumen pendukung yang terpisah.

---

## 1.7 Related Documents

Dokumen berikut menjadi referensi utama dalam penyusunan PRD ini.

| Document              | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| Product Discovery     | Analisis masalah, validasi, pengguna, kompetitor, dan value proposition |
| AI Architecture       | Desain arsitektur Artificial Intelligence HELIORA                       |
| Dataset Strategy      | Strategi pemilihan dataset Machine Learning dan Knowledge Base          |
| Technology Stack      | Blueprint teknologi yang digunakan selama pengembangan                  |
| Success Strategy      | Strategi pengembangan berdasarkan rubrik kompetisi                      |
| UI/UX Guideline       | Panduan desain antarmuka pengguna                                       |
| API Specification     | Dokumentasi API                                                         |
| ERD & Database Design | Struktur basis data                                                     |
| Deployment Guide      | Panduan deployment aplikasi                                             |

---

## 1.8 Version History

| Version | Date | Author | Description |
| ------- | ---- | ------ | ----------- |
| 1.0 | August 2026 | HELIORA Development Team | Initial draft |
| 1.1 | 19 August 2026 | HELIORA Development Team | Product, AI, MVP scope, safety, acceptance, and consistency revision |

---

## 1.9 Approval

Dokumen ini akan digunakan sebagai acuan utama selama pengembangan produk. Setiap perubahan signifikan terhadap ruang lingkup, fitur, maupun arsitektur harus didiskusikan oleh tim dan diperbarui pada riwayat versi dokumen.

| Role                      | Status  |
| ------------------------- | ------- |
| Product & Project Manager | Pending |
| Solution Architect        | Pending |
| Development Team          | Pending |

### 1.9.1 Revision Notes

Version 1.1 mempertahankan konsep utama HELIORA, tetapi memperketat definisi requirement agar lebih siap digunakan sebagai source of truth untuk development.

Revisi utama:

- Future Health Simulation ditegaskan sebagai scenario-based/model-based simulation, bukan clinical forecasting.
- Risk Engine diperjelas sebagai module/service yang dapat memiliki satu atau beberapa model di belakangnya.
- Risk output dibedakan dari clinical risk threshold dan hanya diposisikan sebagai model-estimated score/probability apabila terkalibrasi.
- Health Score ditegaskan sebagai product-defined preventive index dengan bobot provisional yang harus divalidasi.
- P0, P1, P2 diselaraskan dengan Definition of Done agar RAG/LLM tidak menjadi single point of failure pada MVP.
- Evidence Center diperjelas dengan metadata dan traceability requirement.
- LLM diberi deterministic fallback dan tidak menjadi dependency untuk risk estimation atau recommendation.
- Privacy diperluas dengan data retention, consent withdrawal, account deletion, dan third-party AI data handling.
- Requirement Traceability Matrix ditambahkan untuk menghubungkan problem, objective, feature, requirement, acceptance criteria, dan test.

---

# 2. Executive Summary

## 2.1 Product Summary

HELIORA adalah platform preventive health berbasis Artificial Intelligence (AI) yang membantu pengguna memahami kondisi kesehatan mereka berdasarkan pola gaya hidup serta melihat bagaimana perubahan gaya hidup dapat memengaruhi risiko kesehatan di masa depan.

HELIORA tidak dirancang sebagai aplikasi diagnosis atau pengganti tenaga medis. Sistem memberikan estimasi risiko berbasis data dan simulasi sebagai alat edukasi serta pengambilan keputusan preventif.

Konsep utama HELIORA berfokus pada:

- **Risk Estimation** — memberikan estimasi risiko kesehatan berdasarkan data pengguna.
- **Explainable AI** — menjelaskan faktor yang paling berpengaruh terhadap hasil estimasi.
- **Future Health Simulation** — mensimulasikan kemungkinan perubahan kondisi berdasarkan pola gaya hidup.
- **What-if Simulation** — memungkinkan pengguna mencoba perubahan gaya hidup dan melihat dampaknya terhadap estimasi risiko.
- **Recommendation Engine** — memberikan rekomendasi preventif berdasarkan rule yang berasal dari evidence kesehatan.
- **Evidence Center** — menyediakan sumber evidence yang mendukung rekomendasi dan penjelasan AI.
- **LLM + RAG** — mengubah hasil analisis menjadi penjelasan yang mudah dipahami dengan tetap mengacu pada sumber terpercaya.

---

## 2.2 Core Product Concept

HELIORA menggunakan pendekatan:

> **Predict → Explain → Simulate → Recommend → Educate**

Alur utama sistem:

```text
User Health & Lifestyle Input
            │
            ▼
Preventive Lifestyle Risk Engine
            │
            ▼
      Risk Estimation
            │
            ▼
      Explainable AI
            │
            ▼
   Future Health Simulation
            │
            ▼
      What-if Simulation
            │
            ▼
     Recommendation Engine
            │
            ▼
         LLM + RAG
            │
            ▼
Human-Friendly Explanation
       + Evidence
```

Pendekatan ini memungkinkan HELIORA tidak hanya memberikan sebuah skor, tetapi juga menjelaskan mengapa skor tersebut muncul, apa yang dapat dilakukan pengguna, dan bagaimana perubahan gaya hidup dapat memengaruhi hasil simulasi.

## 2.3 Problem yang Diselesaikan

Banyak masyarakat memiliki informasi kesehatan yang tersedia secara luas, tetapi mengalami kesulitan dalam:

1. memahami hubungan antara gaya hidup dan risiko kesehatan;
2. mengetahui faktor gaya hidup yang paling berpengaruh terhadap kondisi mereka;
3. memahami konsekuensi jangka panjang dari kebiasaan saat ini;
4. mengetahui perubahan sederhana yang dapat dilakukan;
5. membedakan rekomendasi kesehatan yang berbasis evidence dengan informasi umum di internet.

HELIORA menjawab masalah tersebut dengan menggabungkan risk estimation, explainable AI, simulasi, recommendation engine, dan evidence-based explanation dalam satu platform.

## 2.4 Target Pengguna

Target utama HELIORA adalah masyarakat yang ingin meningkatkan kesadaran dan melakukan tindakan preventif terhadap kesehatan mereka.

### Primary User

Individu yang:

- ingin mengetahui kondisi kesehatan preventif berdasarkan gaya hidup;
- ingin memahami faktor risiko kesehatan;
- ingin mengetahui dampak perubahan kebiasaan;
- tertarik melakukan perubahan gaya hidup;
- membutuhkan informasi kesehatan yang mudah dipahami.

###Secondary User

Pihak yang dapat memperoleh manfaat dari platform, seperti:

- komunitas kesehatan;
- institusi pendidikan;
- organisasi atau perusahaan yang memiliki program wellness;
- pihak lain yang membutuhkan platform edukasi kesehatan preventif.

## 2.5 Nilai Utama Produk

HELIORA memiliki beberapa nilai utama:

1. **Personalized**
   Hasil analisis disesuaikan dengan data kesehatan dan gaya hidup pengguna.
2. **Explainable**
   Pengguna tidak hanya mendapatkan hasil, tetapi juga mengetahui faktor yang berkontribusi terhadap hasil tersebut.
3. **Interactive**
   Pengguna dapat mengubah parameter melalui What-if Simulation dan melihat perubahan estimasi secara langsung.
4. **Future-Oriented**
   HELIORA membantu pengguna memahami kemungkinan dampak perubahan gaya hidup dalam periode simulasi tertentu.
5. **Evidence-Based**
   Rekomendasi dan penjelasan didukung oleh sumber kesehatan terpercaya melalui Evidence Center.
6. **Preventive**
   HELIORA berfokus pada pencegahan dan edukasi, bukan diagnosis atau pengobatan penyakit.

## 2.6 MVP Focus

MVP HELIORA difokuskan pada fitur yang memberikan nilai paling besar terhadap konsep produk sekaligus realistis untuk dikembangkan dalam waktu kompetisi.

Komponen utama MVP:
| Komponen | Status |
| -------------------------------- | ------------ |
| Preventive Lifestyle Risk Engine | In Scope |
| Risk Estimation | In Scope |
| Health Score | In Scope |
| Lifestyle Score | In Scope |
| Explainable AI | In Scope |
| Future Health Simulation | In Scope |
| What-if Simulation | In Scope |
| Recommendation Engine | In Scope |
| Rule Engine | In Scope |
| LLM | In Scope |
| RAG | In Scope |
| Evidence Center | In Scope |
| NLP sebagai modul terpisah | Out of Scope |

MVP menggunakan satu Preventive Lifestyle Risk Engine untuk menjaga kompleksitas model tetap terkendali.

## 2.7 AI Strategy

Strategi AI HELIORA memisahkan fungsi prediksi, penjelasan, rekomendasi, dan generasi bahasa.

### Machine Learning

Digunakan untuk melakukan estimasi risiko berdasarkan data lifestyle dan health-related features.

### Explainable AI

Digunakan untuk mengidentifikasi faktor yang berkontribusi terhadap hasil model.

Pendekatan yang digunakan:

- SHAP sebagai pendekatan utama;
- LIME sebagai alternatif apabila diperlukan.

### Rule Engine

Digunakan untuk menghasilkan rekomendasi preventif yang konsisten dan dapat dikontrol.

### LLM

LLM tidak digunakan untuk menentukan risiko kesehatan.
LLM hanya digunakan untuk:

- menjelaskan hasil;
- membuat narasi yang mudah dipahami;
- merangkum evidence;
- membantu menyajikan hasil analisis kepada pengguna.

### RAG

RAG digunakan agar penjelasan LLM tetap mengacu pada knowledge base yang berasal dari sumber terpercaya.

## 2.8 Dataset Strategy

MVP menggunakan pendekatan dataset yang sederhana dan terkontrol.

### Dataset Utama

Satu dataset lifestyle/health sebagai sumber utama pengembangan model Machine Learning.

Fitur utama yang diprioritaskan:

- Age
- Gender
- Height
- Weight
- Physical Activity
- Sleep Duration
- Smoking
- Family History
  Fitur tambahan hanya digunakan apabila benar-benar tersedia dan memberikan manfaat terhadap model.

### Validasi Konteks Indonesia

Data Indonesia digunakan terutama untuk mendukung:

- validasi problem;
- validasi relevansi fitur;
- konteks pengguna Indonesia;
- narasi kompetisi dan penelitian.
  Data validasi tidak wajib digunakan sebagai dataset training utama MVP.

### Knowledge Base

Knowledge Base RAG menggunakan dokumen evidence dari sumber terpercaya, seperti:

- WHO;
- Kementerian Kesehatan RI;
- PERKENI;
- PERKI;
- CDC;
- jurnal ilmiah yang relevan.

## 2.9 Killer Features

Dua fitur utama yang menjadi pembeda HELIORA adalah:

### Future Health Simulation

Pengguna dapat melihat proyeksi output model berdasarkan scenario lifestyle yang ditentukan untuk horizon simulasi tertentu:

- 30 hari;
- 90 hari;
- 180 hari.

Simulation merupakan **model-based scenario projection**, bukan clinical forecast dan bukan kepastian mengenai kondisi kesehatan aktual pengguna.



### What-if Simulation

Pengguna dapat mengubah parameter lifestyle seperti:

- durasi tidur;
- aktivitas fisik;
- berat badan;
  kemudian sistem melakukan kalkulasi ulang untuk menunjukkan perubahan estimasi risiko.

Kedua fitur ini menjadi pusat pengalaman produk dan menjadi bagian penting dalam demonstrasi kompetisi.

## 2.10 Safety & Medical Positioning

HELIORA harus selalu diposisikan sebagai preventive health intelligence platform, bukan sistem diagnosis medis.
Sistem wajib menampilkan disclaimer bahwa:

> HELIORA adalah alat edukasi dan estimasi risiko berbasis gaya hidup, bukan alat diagnosis medis dan tidak menggantikan konsultasi dengan tenaga kesehatan.

Apabila hasil estimasi melewati threshold tertentu, Rule Engine dapat menampilkan safety message yang menganjurkan pengguna untuk berkonsultasi dengan tenaga kesehatan.

## 2.11 Expected MVP Outcome

Pada akhir pengembangan MVP, HELIORA diharapkan mampu:

1. menerima data kesehatan dan gaya hidup pengguna;
2. menghasilkan Health Score dan Lifestyle Score;
3. menghasilkan estimasi risiko kesehatan;
4. menjelaskan faktor yang berkontribusi terhadap hasil;
5. melakukan Future Health Simulation;
6. melakukan What-if Simulation;
7. menghasilkan rekomendasi preventif berbasis rule;
8. memberikan penjelasan menggunakan LLM;
9. menyediakan evidence melalui RAG;
10. memberikan pengalaman demonstrasi yang stabil dan mudah dipahami.

## 2.12 Success Definition

MVP HELIORA dianggap berhasil apabila pengguna dapat menyelesaikan alur utama:

Input Data
↓
Melihat Health & Lifestyle Score
↓
Melihat Risk Estimation
↓
Memahami Faktor Risiko
↓
Mencoba What-if Simulation
↓
Melihat Perubahan Risiko
↓
Mendapatkan Recommendation
↓
Memahami Evidence

Dengan demikian, keberhasilan HELIORA tidak hanya diukur dari kemampuan model menghasilkan prediksi, tetapi dari kemampuan sistem mengubah hasil analisis menjadi insight yang dapat dipahami dan digunakan pengguna untuk mengambil tindakan preventif.

---

# 3. Product Overview

## 3.1 Product Description

HELIORA adalah platform **preventive health berbasis AI** yang membantu pengguna memahami hubungan antara gaya hidup saat ini dengan kondisi kesehatan dan estimasi risiko kesehatan di masa mendatang.

HELIORA dirancang bukan sebagai aplikasi diagnosis atau pengganti tenaga medis, melainkan sebagai **decision-support dan health-awareness platform** yang membantu pengguna:

- memahami kondisi lifestyle saat ini;
- mengetahui estimasi risiko kesehatan berdasarkan faktor gaya hidup;
- memahami faktor yang paling berpengaruh terhadap hasil;
- melihat kemungkinan perubahan risiko berdasarkan perubahan lifestyle;
- memperoleh rekomendasi preventif berbasis evidence;
- memahami alasan di balik rekomendasi yang diberikan sistem.

Konsep utama HELIORA adalah mengubah pendekatan kesehatan dari sekadar **reactive healthcare** menjadi **preventive healthcare**.

Pengguna tidak hanya melihat kondisi saat ini, tetapi dapat mengeksplorasi pertanyaan:

> "Jika saya mengubah kebiasaan saya hari ini, bagaimana kemungkinan kondisi kesehatan saya berubah di masa depan?"

Pertanyaan tersebut menjadi dasar dari fitur utama HELIORA, yaitu **Future Health Simulation** dan **What-if Simulation**.

---

## 3.2 Product Positioning

HELIORA diposisikan sebagai:

> **AI-powered preventive health intelligence platform** yang membantu masyarakat memahami dampak perubahan gaya hidup terhadap risiko kesehatan melalui simulasi, explainable AI, dan evidence-based recommendations.

HELIORA tidak diposisikan sebagai:

- aplikasi diagnosis penyakit;
- aplikasi konsultasi dokter;
- sistem rekam medis;
- pengganti tenaga kesehatan;
- alat medical diagnosis;
- alat untuk menentukan keputusan medis secara mandiri.

Output yang diberikan HELIORA merupakan **estimasi berbasis data dan model**, bukan diagnosis medis.

---

## 3.3 Core Product Concept

Konsep produk HELIORA terdiri dari lima lapisan utama:

```text
                    HELIORA
                       │
                       ▼
              User Health Input
                       │
                       ▼
       Preventive Lifestyle Risk Engine
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Risk Estimation      Health Score
             │                   │
             └─────────┬─────────┘
                       ▼
                Explainable AI
                       │
                       ▼
             Future Health Model
                       │
                       ▼
               What-if Simulation
                       │
                       ▼
              Recommendation
                 Rule Engine
                       │
                       ▼
                  LLM + RAG
                       │
                       ▼
       Human-Friendly Explanation
              + Evidence Center
```

Setiap lapisan memiliki tanggung jawab yang berbeda sehingga proses prediksi, simulasi, rekomendasi, dan penjelasan dapat dipisahkan dengan jelas.

## 3.4 Core Value Proposition

HELIORA memberikan nilai utama melalui beberapa kemampuan berikut.

### 3.4.1 Personalized Health Insight

HELIORA menggunakan data lifestyle pengguna untuk menghasilkan gambaran kondisi kesehatan yang lebih personal.

Data yang dapat digunakan antara lain:

- usia;
- jenis kelamin;
- tinggi badan;
- berat badan;
- aktivitas fisik;
- durasi tidur;
- status merokok;
- riwayat keluarga.
  Data tersebut digunakan sebagai input untuk menghasilkan estimasi dan insight yang relevan dengan kondisi pengguna.

### 3.4.2 Risk Estimation

HELIORA menghasilkan estimasi risiko kesehatan berdasarkan pola lifestyle pengguna.

MVP berfokus pada tiga kategori risiko:

1. Diabetes
2. Hypertension
3. Cardiovascular
   Hasil ditampilkan sebagai estimated risk, bukan diagnosis.

Contoh:
Diabetes Risk
████████░░ 72%

Hypertension Risk
██████░░░░ 54%

Cardiovascular Risk
█████░░░░░ 43%

Angka tersebut digunakan untuk membantu pengguna memahami tingkat risiko relatif berdasarkan model yang digunakan.

### 3.4.3 Explainable AI

HELIORA tidak hanya memberikan hasil estimasi, tetapi juga memberikan informasi mengenai faktor yang paling berpengaruh terhadap hasil tersebut.

Contoh:
Factors influencing your result:

1. Low physical activity
2. High BMI
3. Insufficient sleep
4. Family history
   Explainable AI menggunakan pendekatan seperti SHAP untuk memberikan interpretasi terhadap kontribusi feature pada hasil model.

Tujuannya adalah meningkatkan:

- transparency;
- user trust;
- interpretability;
- educational value.

## 3.5 Future Health Simulation

**Future Health Simulation** merupakan salah satu fitur utama HELIORA.

Fitur ini memungkinkan pengguna melihat bagaimana **output model** dapat berubah ketika suatu lifestyle scenario dipertahankan atau dimodifikasi pada horizon tertentu.

Contoh periode simulasi:

- 30 hari;
- 90 hari;
- 180 hari.

Konsep:

```text
Current Lifestyle
  │
  ▼
Baseline Model Output
  │
  ▼
Lifestyle Scenario
  │
  ▼
Projected Input
  │
  ▼
Risk Engine
  │
  ▼
Simulated Model Output
```

Simulasi tidak boleh dipresentasikan sebagai clinical forecast. Hasil adalah **model-based scenario estimate** yang bergantung pada asumsi scenario dan keterbatasan dataset/model.

Untuk MVP, simulation menggunakan Risk Engine yang sama dengan risk estimation agar hasil konsisten dan dapat direproduksi.

---


## 3.6 What-if Simulation

**What-if Simulation** merupakan fitur interaktif yang memungkinkan pengguna mengubah parameter lifestyle dan melihat perubahan estimasi secara langsung.

Contoh Parameter:
Sleep Duration
5 hours ─────────●──── 9 hours

Physical Activity
60 min ──────────●──── 300 min/week

Weight
85 kg ───────────●──── 65 kg

Setelah pengguna mengubah parameter, sistem menjalankan kembali model menggunakan input yang telah dimodifikasi.

Contoh:
Current Scenario

Sleep : 5 hours
Exercise : 60 min/week
Weight : 85 kg

Estimated Risk
Diabetes : 72%

Kemudian pengguna mengubah:
Sleep : 7 hours
Exercise : 150 min/week
Weight : 78 kg

Sistem menghasilkan:
Simulated Scenario

Estimated Risk
Diabetes : 61%

Change
Risk : -11%

Tujuan utama fitur ini bukan memberikan janji bahwa risiko pengguna pasti turun sebesar angka tersebut, tetapi menunjukkan arah perubahan estimasi model ketika input lifestyle berubah.

## 3.7 Recommendation Engine

HELIORA menggunakan **Rule Engine** untuk menghasilkan rekomendasi preventif.

Recommendation Engine tidak bergantung pada LLM untuk menentukan aturan kesehatan.

Contoh rule:
IF sleep_duration < 6
THEN recommendation =
"Prioritize getting sufficient sleep."

Contoh lainnya:
IF physical_activity < recommended_level
THEN recommendation =
"Increase physical activity gradually."

IF smoking_status = smoker
THEN recommendation =
"Consider a smoking cessation program."

Rule Engine dipilih karena:

- deterministic;
- mudah diuji;
- mudah diaudit;
- konsisten;
- cepat;
- tidak bergantung pada probabilistic generation LLM.

## 3.8 LLM and RAG

LLM digunakan sebagai explanation layer, bukan sebagai prediction engine.

Peran LLM dalam HELIORA:

- menjelaskan hasil model;
- mengubah hasil teknis menjadi bahasa yang mudah dipahami;
- merangkum rekomendasi;
- membantu menyusun penjelasan berdasarkan evidence.

LLM tidak bertanggung jawab untuk:

- menghitung risk score;
- menentukan diagnosis;
- menentukan medical treatment;
- menggantikan model machine learning.

### RAG

RAG digunakan sebagai Evidence Layer.

Knowledge base dapat berisi sumber terpercaya seperti:

- WHO;
- Kementerian Kesehatan Republik Indonesia;
- PERKENI;
- PERKI;
- CDC;
- jurnal ilmiah yang relevan.

Alur:
ML Result
│
▼
Rule Engine
│
▼
Relevant Evidence
│
▼
RAG Retrieval
│
▼
LLM
│
▼
Human-Friendly Explanation

Dengan pendekatan tersebut, penjelasan AI tidak hanya bersifat generatif, tetapi dapat dikaitkan dengan sumber evidence yang digunakan.

## 3.9 Evidence Center

Evidence Center merupakan bagian dari sistem yang memungkinkan pengguna memahami mengapa suatu rekomendasi diberikan.

Contoh:
Recommendation

"Increase your weekly physical activity."

[ Why am I getting this recommendation? ]

Ketika pengguna memilih tombol tersebut, sistem dapat menampilkan:
Evidence

Recommendation:
Increase physical activity.

Source:
WHO

Evidence:
Physical activity is associated with
multiple health benefits.

Evidence Level:
Strong

Source Type:
Official Health Guideline

Evidence Center bertujuan meningkatkan:
transparency;
credibility;
explainability;
user trust.

## 3.10 Health Score

HELIORA menggunakan Health Score sebagai **product-defined preventive index** untuk membantu pengguna memahami kondisi lifestyle secara keseluruhan.

Health Score bukan indikator medis resmi, bukan clinical score, dan bukan ukuran probabilitas penyakit.

Score dapat dibentuk menggunakan weighted scoring berdasarkan faktor lifestyle. Bobot awal bersifat provisional dan harus divalidasi sebelum release MVP. Formula, normalisasi setiap faktor, dan bobot final wajib terdokumentasi secara eksplisit.

---


## 3.11 Lifestyle Score

Lifestyle Score berfokus pada perilaku yang dapat dimodifikasi oleh pengguna.

Faktor yang dapat digunakan:

- aktivitas fisik;
- durasi tidur;
- smoking status;
- BMI/weight management;
- pola lifestyle lainnya yang tersedia pada dataset:
  Konsep:
  Lifestyle Input
  │
  ▼
  Lifestyle Scoring
  │
  ▼
  Lifestyle Score
  │
  ▼
  Personalized Insight
  Lifestyle Score digunakan terutama untuk membantu pengguna memahami area lifestyle mana yang paling membutuhkan perhatian.

## 3.12 Target Users

Target utama HELIORA adalah masyarakat yang ingin memahami dan meningkatkan kondisi kesehatan preventif mereka.

### Primary User

Individu yang:

- ingin memahami risiko kesehatan;
- ingin memperbaiki gaya hidup;
- memiliki awareness terhadap kesehatan;
- ingin mengetahui dampak perubahan lifestyle;
- membutuhkan informasi kesehatan yang mudah dipahami.

### Secondary User

Kelompok yang dapat menggunakan HELIORA sebagai media edukasi preventif, seperti:

- mahasiswa;
- pekerja;
- komunitas kesehatan;
- organisasi;
- institusi edukasi.
  Namun, MVP difokuskan pada individual end user.

## 3.13 User Experience Principle

Pengalaman pengguna HELIORA dibangun berdasarkan prinsip:

1. Understand Before Acting
   Pengguna harus memahami hasil sebelum menerima rekomendasi.
2. Explainable by Default
   Hasil AI harus dapat dijelaskan.
3. Evidence-Based
   Rekomendasi penting harus memiliki dasar evidence.
4. Preventive, Not Diagnostic
   Sistem harus selalu diposisikan sebagai platform preventive health.
5. Actionable
   Insight harus dapat diterjemahkan menjadi tindakan lifestyle yang realistis.
6. Simple
   Pengguna tidak perlu memahami machine learning untuk menggunakan HELIORA.

## 3.14 High-Level User Flow

Alur utama pengguna dalam MVP:
Landing Page
│
▼
Registration / Login
│
▼
Consent
│
▼
Health Profile
│
▼
Lifestyle Questionnaire
│
▼
Health Dashboard
│
├───────────────┐
▼ ▼
Risk Detail Lifestyle Score
│
▼
Explainable AI
│
▼
Future Health Simulation
│
▼
What-if Simulation
│
▼
Recommendation
│
▼
Evidence Center
│
▼
LLM Explanation

## 3.15 Product Architecture Boundary

Untuk menjaga scope MVP, HELIORA membatasi tanggung jawab setiap komponen.
| Component | Responsibility |
| ----------------- | ---------------------------------- |
| Frontend | User interaction dan visualization |
| Backend | Business logic dan API |
| ML Engine | Risk estimation |
| Explainable AI | Model interpretation |
| Simulation Engine | Scenario calculation |
| Rule Engine | Recommendation logic |
| LLM | Human-friendly explanation |
| RAG | Evidence retrieval |
| Database | Application data |
| Authentication | Identity and access |
| Monitoring | Application health |

Tidak ada komponen yang diperbolehkan mengambil alih tanggung jawab komponen lain tanpa alasan teknis yang jelas.

## 3.16 MVP Product Boundary

HELIORA MVP berfokus pada:

### Core

- Authentication
- User consent
- Health profile
- Lifestyle questionnaire
- Health Score
- Lifestyle Score
- Risk estimation
- Explainable AI
- Future Health Simulation
- What-if Simulation
- Recommendation Engine
- Evidence Center
- LLM explanation

### AI

1 ML Risk Engine +
Explainable AI +
Simulation +
Rule Engine +
LLM +
RAG

Pendekatan ini mempertahankan nilai inovasi utama HELIORA tanpa membangun terlalu banyak model AI terpisah.

## 3.17 Product Differentiation

Keunggulan HELIORA bukan sekadar memberikan health score atau risk score.

Perbedaan utama terletak pada kemampuan pengguna untuk melakukan exploration terhadap perubahan lifestyle.

Perbandingan konsep:
Traditional Health App

Input
↓
Health Data
↓
Health Result

HELIORA

Input
↓
Risk Estimation
↓
Why?
↓
What If?
↓
Future Simulation
↓
What Should I Do?
↓
Why This Recommendation?
↓
Evidence

Dengan demikian, HELIORA membentuk pengalaman:
Understand → Simulate → Decide → Act

## 3.18 Product Success Concept

Keberhasilan produk MVP tidak hanya diukur dari kemampuan model menghasilkan prediksi.

HELIORA dianggap berhasil apabila pengguna dapat:

- memasukkan data lifestyle;
- memperoleh estimasi risiko;
- memahami faktor yang memengaruhi hasil;
- mengubah lifestyle melalui What-if Simulation;
- melihat perubahan estimasi;
- memperoleh rekomendasi;
- memahami alasan rekomendasi;
- melihat evidence yang mendukung rekomendasi.

Dengan demikian, keberhasilan HELIORA terletak pada end-to-end preventive health experience, bukan hanya akurasi model machine learning.

## 3.19 Medical Safety Boundary

HELIORA harus selalu menampilkan batasan penggunaan sistem.

Contoh disclaimer:
HELIORA adalah platform edukasi dan estimasi risiko kesehatan berbasis lifestyle, bukan alat diagnosis medis. Hasil yang diberikan tidak menggantikan konsultasi, pemeriksaan, atau keputusan tenaga kesehatan profesional.

Apabila sistem mendeteksi kondisi yang memenuhi safety threshold yang telah ditentukan, Rule Engine dapat memberikan pesan seperti:
Hasil ini menunjukkan tingkat risiko yang perlu diperhatikan. Pertimbangkan untuk berkonsultasi dengan tenaga kesehatan profesional.

Sistem tidak boleh memberikan diagnosis atau instruksi pengobatan.

## 3.20 Product Overview Summary

Secara keseluruhan, HELIORA merupakan platform preventive health yang menggabungkan:
Lifestyle Data
│
▼
Machine Learning
│
▼
Risk Estimation
│
▼
Explainable AI
│
▼
Future Simulation
│
▼
What-if Simulation
│
▼
Rule-based Recommendation
│
▼
RAG Evidence
│
▼
LLM Explanation
│
▼
Actionable Preventive Insight

Fokus utama MVP adalah membuktikan bahwa AI dapat digunakan bukan hanya untuk memberikan risk estimation, tetapi juga membantu pengguna memahami:

"Apa yang terjadi jika saya mengubah kebiasaan saya hari ini?"

Hal tersebut menjadi dasar utama diferensiasi dan innovation value HELIORA.

# 4. Problem Statement

## 4.1 Latar Belakang Masalah

Penyakit Tidak Menular (PTM) merupakan salah satu tantangan kesehatan utama di Indonesia. Banyak PTM yang berkaitan dengan faktor gaya hidup seperti kurangnya aktivitas fisik, pola tidur yang tidak optimal, kebiasaan merokok, berat badan berlebih, dan faktor riwayat keluarga.

Salah satu permasalahan utama dalam preventive health adalah kecenderungan masyarakat untuk melakukan tindakan kesehatan setelah munculnya gejala atau gangguan kesehatan, bukan sejak faktor risikonya mulai terlihat.

Padahal, beberapa kondisi seperti hipertensi dan diabetes dapat berkembang tanpa gejala yang jelas pada tahap awal. Kondisi tersebut membuat pendekatan kesehatan yang hanya berorientasi pada penanganan setelah munculnya masalah menjadi kurang optimal untuk kebutuhan pencegahan.

HELIORA hadir untuk mengisi kesenjangan tersebut melalui pendekatan preventive health berbasis data dan AI.

HELIORA tidak bertujuan mendiagnosis penyakit atau menggantikan tenaga kesehatan. HELIORA bertujuan membantu pengguna memahami hubungan antara kebiasaan hidup saat ini dengan estimasi risiko kesehatan, kemudian mengeksplorasi kemungkinan perubahan melalui simulasi dan memperoleh rekomendasi preventif yang didukung evidence.

---

## 4.2 Deskripsi Masalah Utama

Masalah utama yang ingin diselesaikan HELIORA adalah:

> **Masyarakat masih mengalami kesulitan dalam memahami bagaimana pola hidup mereka saat ini berhubungan dengan risiko kesehatan di masa depan dan tindakan preventif apa yang dapat dilakukan untuk mengurangi risiko tersebut.**

Permasalahan tersebut tidak hanya berkaitan dengan kurangnya informasi kesehatan, tetapi juga dengan bagaimana informasi tersebut disampaikan dan digunakan oleh individu.

Informasi kesehatan yang tersedia saat ini sering kali bersifat umum. Pengguna dapat mengetahui bahwa olahraga, tidur yang cukup, menjaga berat badan, dan tidak merokok merupakan kebiasaan yang baik, tetapi belum tentu dapat menjawab pertanyaan:

- Seberapa besar faktor tersebut berpengaruh terhadap kondisi saya?
- Faktor lifestyle mana yang paling perlu saya perbaiki?
- Apa yang terjadi jika saya mengubah kebiasaan tertentu?
- Bagaimana perubahan tersebut memengaruhi estimasi risiko saya?
- Mengapa sistem memberikan rekomendasi tersebut?
- Apa evidence yang mendukung rekomendasi tersebut?

HELIORA dirancang untuk menjawab pertanyaan tersebut melalui pendekatan yang personal, explainable, interactive, dan evidence-based.

---

## 4.3 Siapa yang Terdampak

### 4.3.1 Primary Target

Primary target HELIORA adalah individu usia produktif yang:

- memiliki faktor risiko gaya hidup;
- ingin meningkatkan kesadaran terhadap kondisi kesehatan;
- memiliki akses terhadap perangkat digital;
- tertarik memahami dampak kebiasaan hidup;
- membutuhkan informasi kesehatan yang lebih sederhana dan personal;
- belum membutuhkan sistem diagnosis atau konsultasi medis.

Contoh faktor risiko yang relevan:

- aktivitas fisik rendah;
- durasi tidur tidak optimal;
- berat badan berlebih;
- kebiasaan merokok;
- riwayat keluarga terhadap penyakit tertentu;
- pola hidup kurang sehat.

### 4.3.2 Secondary Target

Secondary target adalah pengguna yang secara umum ingin melakukan preventive health monitoring dan meningkatkan health awareness tanpa menggunakan HELIORA sebagai alat diagnosis.

---

## 4.4 Dampak Masalah

Masalah preventive health dapat menghasilkan beberapa dampak.

### 4.4.1 Rendahnya Awareness terhadap Risiko Personal

Informasi kesehatan umum belum tentu membuat pengguna memahami kondisi dan risiko yang relevan dengan dirinya.

Akibatnya, pengguna dapat mengetahui suatu kebiasaan sebagai "tidak sehat", tetapi tidak memahami prioritas perubahan yang perlu dilakukan.

### 4.4.2 Tindakan Preventif yang Terlambat

Ketika seseorang baru memperhatikan kondisi kesehatan setelah munculnya gejala, kesempatan untuk melakukan perubahan lifestyle sejak awal dapat menjadi lebih kecil.

HELIORA berusaha mendorong perubahan perspektif:

```text
Reactive Health
    ↓
Menunggu gejala
    ↓
Mencari pertolongan
```

menjadi:

```text
Preventive Health
    ↓
Memahami faktor risiko
    ↓
Melakukan perubahan lifestyle
    ↓
Memantau kemungkinan dampak
```

## 4.4.3 Informasi Kesehatan Sulit Dipersonalisasi

Informasi kesehatan yang tersedia bagi masyarakat umumnya disampaikan dalam bentuk rekomendasi umum. Meskipun informasi tersebut dapat menjadi dasar edukasi, pengguna masih membutuhkan konteks personal untuk memahami relevansinya terhadap kondisi dan kebiasaan mereka.

Sebagai contoh, rekomendasi seperti menjaga berat badan, meningkatkan aktivitas fisik, tidur yang cukup, dan menghindari rokok bersifat umum. Pengguna belum tentu mengetahui faktor mana yang menjadi prioritas berdasarkan profil lifestyle mereka.

Kondisi tersebut menyebabkan adanya kesenjangan antara:

```text
Informasi Kesehatan Umum
        ↓
"Olahraga lebih banyak"
        ↓
Pertanyaan Pengguna
        ↓
"Seberapa penting bagi saya?"
"Berapa banyak yang perlu saya lakukan?"
"Apa dampaknya terhadap risiko saya?"
```

HELIORA berusaha memperkecil kesenjangan tersebut dengan mengolah data lifestyle pengguna menjadi insight yang lebih personal.

## 4.4.4 Sulit Memahami Dampak Perubahan Lifestyle

Salah satu permasalahan penting dalam preventive health adalah pengguna dapat mengetahui bahwa perubahan lifestyle merupakan hal yang baik, tetapi sulit memahami konsekuensi potensial dari perubahan tersebut.

Contohnya, pengguna mungkin mengetahui bahwa meningkatkan aktivitas fisik atau memperbaiki durasi tidur merupakan kebiasaan yang disarankan. Namun, pengguna tidak memiliki media yang memungkinkan mereka mengeksplorasi skenario perubahan secara interaktif.

Pertanyaan seperti:

- "Bagaimana jika saya tidur lebih cukup?"
- "Bagaimana jika aktivitas fisik saya meningkat?"
- "Bagaimana jika berat badan saya berubah?"
- "Bagaimana perubahan tersebut memengaruhi estimasi risiko saya?"

menjadi sulit dijawab melalui informasi kesehatan statis.

HELIORA menjadikan kemampuan simulasi sebagai bagian penting dari pengalaman pengguna melalui:

- **Future Health Simulation**
- **What-if Simulation**

Kedua fitur tersebut memungkinkan pengguna mengeksplorasi perubahan input lifestyle dan melihat bagaimana perubahan tersebut memengaruhi output estimasi model.

---

## 4.4.5 Kurangnya Transparansi dalam Rekomendasi

Rekomendasi kesehatan yang diberikan oleh suatu sistem dapat sulit dipercaya apabila pengguna tidak mengetahui alasan di balik rekomendasi tersebut.

Dalam konteks sistem berbasis AI, pengguna perlu memahami:

1. faktor apa yang berpengaruh terhadap hasil;
2. mengapa suatu rekomendasi diberikan;
3. bagaimana rekomendasi tersebut berkaitan dengan kondisi pengguna;
4. evidence apa yang mendukung rekomendasi tersebut.

Tanpa transparansi, output AI berisiko dianggap sebagai hasil yang tidak dapat dipahami atau diverifikasi.

HELIORA mengatasi masalah tersebut melalui kombinasi:

```text
Risk Estimation
      ↓
Explainable AI
      ↓
Risk Factors
      ↓
Recommendation Engine
      ↓
Evidence Retrieval
      ↓
Human-Friendly Explanation
```

Dengan demikian, sistem tidak hanya memberikan hasil, tetapi juga memberikan konteks mengenai alasan dan evidence yang mendasarinya.

## 4.5 Root Cause Analysis

Berdasarkan product discovery, masalah HELIORA dapat dikelompokkan ke dalam beberapa akar penyebab utama.

### Root Cause 1 — Rendahnya Preventive Health Awareness

Masyarakat cenderung lebih familiar dengan pendekatan kesehatan ketika masalah telah muncul dibandingkan dengan memahami risiko dan melakukan tindakan preventif sejak awal.

### Root Cause 2 — Tidak Adanya Risk Insight yang Personal

Informasi kesehatan umum tidak secara langsung menunjukkan bagaimana faktor lifestyle seseorang berhubungan dengan estimasi risikonya.

### Root Cause 3 — Edukasi Kesehatan Masih Bersifat General

Informasi seperti:

- "olahraga secara rutin";
- "tidur yang cukup";
- "jaga berat badan";
- "berhenti merokok";

merupakan rekomendasi yang benar secara umum, tetapi belum menjawab prioritas personal pengguna.

### Root Cause 4 — Tidak Ada Media Simulasi Perubahan

Pengguna belum memiliki cara yang sederhana untuk mengeksplorasi kemungkinan dampak dari perubahan lifestyle melalui skenario yang mudah dipahami.

### Root Cause 5 — Evidence Tersebar

Evidence kesehatan berasal dari berbagai organisasi dan literatur, seperti WHO, Kementerian Kesehatan RI, organisasi profesi, CDC, dan publikasi ilmiah.

Pengguna umum tidak selalu memiliki kemampuan atau waktu untuk mencari, membaca, dan menginterpretasikan berbagai sumber tersebut.

### Root Cause 6 — Kompleksitas Informasi Kesehatan

Data kesehatan dan hasil model AI dapat sulit dipahami oleh pengguna non-medis jika tidak disajikan melalui bahasa dan visualisasi yang sederhana.

---

## 4.6 Problem Tree

Problem utama HELIORA dapat digambarkan melalui hubungan antara akar masalah, core problem, dan dampaknya:

```text
                    CORE PROBLEM
                         │
                         ▼
     Pengguna sulit memahami hubungan antara
      lifestyle saat ini dengan risiko kesehatan
                    di masa depan
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Informasi          Tidak ada       Tidak ada
   terlalu umum       personalisasi   simulasi
        │                │                │
        ▼                ▼                ▼
 Sulit memahami     Sulit menentukan  Sulit melihat
 kondisi diri       prioritas        dampak perubahan
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
                Tindakan preventif
                   kurang optimal
                         │
                         ▼
              Risiko diketahui terlambat
```

---

## 4.7 Current State vs Desired State

### Current State

Kondisi pengguna sebelum menggunakan HELIORA:

```text
Informasi kesehatan umum
        ↓
Pengguna membaca informasi
        ↓
Sulit mengetahui relevansi personal
        ↓
Tidak mengetahui prioritas perubahan
        ↓
Tidak dapat melihat simulasi perubahan
        ↓
Tindakan preventif kurang terarah
```

### Desired State with HELIORA

Kondisi yang ingin dicapai melalui HELIORA:

```text
Personal Health & Lifestyle Input
        ↓
Risk Estimation
        ↓
Health / Lifestyle Score
        ↓
Explainable AI
        ↓
"Faktor apa yang paling berpengaruh?"
        ↓
Future Health Simulation
        ↓
"What-if Simulation"
        ↓
Recommendation Engine
        ↓
Evidence Center
        ↓
Preventive Action
```

---

## 4.8 Existing Solution Gap

Berbagai platform kesehatan telah menyediakan informasi kesehatan, monitoring aktivitas, atau layanan konsultasi. Namun, masih terdapat ruang untuk pendekatan yang secara khusus menggabungkan:

- personal lifestyle risk estimation;
- explainable AI;
- future health simulation;
- interactive what-if simulation;
- rule-based preventive recommendation;
- evidence-backed explanation.

HELIORA tidak berusaha menggantikan platform kesehatan yang sudah ada.

Sebaliknya, HELIORA berfokus pada satu pengalaman yang lebih spesifik:

> **Membantu pengguna memahami kondisi lifestyle mereka saat ini dan mengeksplorasi bagaimana perubahan lifestyle dapat memengaruhi estimasi risiko kesehatan di masa depan.**

---

## 4.9 Problem-to-Solution Mapping

| Problem                                         | HELIORA Solution                      |
| ----------------------------------------------- | ------------------------------------- |
| Informasi kesehatan terlalu umum                | Personalized Health Profile           |
| Sulit memahami risiko personal                  | Preventive Lifestyle Risk Engine      |
| Tidak mengetahui faktor yang paling berpengaruh | Explainable AI                        |
| Sulit melihat dampak perubahan lifestyle        | What-if Simulation                    |
| Tidak dapat mengeksplorasi kondisi masa depan   | Future Health Simulation              |
| Tidak tahu tindakan yang perlu diprioritaskan   | Recommendation Engine                 |
| Rekomendasi sulit diverifikasi                  | Evidence Center                       |
| Informasi AI sulit dipahami                     | LLM-assisted Explanation              |
| Risiko salah interpretasi sebagai diagnosis     | Medical Disclaimer & Safety Guardrail |

---

## 4.10 Problem Statement Final

Berdasarkan permasalahan, target pengguna, dan root cause analysis, problem statement HELIORA ditetapkan sebagai berikut:

> **Masyarakat Indonesia, khususnya individu usia produktif dengan faktor risiko gaya hidup, membutuhkan cara yang lebih personal, mudah dipahami, dan transparan untuk memahami hubungan antara kebiasaan hidup mereka dengan estimasi risiko kesehatan di masa depan. Saat ini, informasi kesehatan cenderung bersifat umum, sulit dipersonalisasi, tidak menyediakan simulasi perubahan lifestyle secara interaktif, dan tidak selalu memberikan konteks evidence yang mudah dipahami pengguna.**

Oleh karena itu:

> **Bagaimana HELIORA dapat membantu pengguna memahami faktor lifestyle yang berkontribusi terhadap estimasi risiko kesehatan, mengeksplorasi dampak perubahan lifestyle melalui Future Health Simulation dan What-if Simulation, serta memperoleh rekomendasi preventif yang explainable dan didukung evidence ilmiah?**

---

## 4.11 Product Opportunity

Problem tersebut memberikan peluang untuk membangun platform preventive health yang tidak hanya memberikan informasi, tetapi mengubah informasi menjadi pengalaman yang dapat dieksplorasi pengguna.

Peluang utama HELIORA berada pada kombinasi:

```text
Personal Data
     +
Machine Learning
     +
Explainable AI
     +
Simulation
     +
Recommendation
     +
Evidence
     ↓
Preventive Health Intelligence
```

Dengan pendekatan tersebut, HELIORA tidak hanya menjawab:

> **"Bagaimana kondisi saya sekarang?"**

tetapi juga membantu pengguna mengeksplorasi:

> **"Apa yang mungkin terjadi jika saya mengubah kebiasaan saya?"**

Pertanyaan kedua tersebut menjadi dasar utama **Future Health Simulation** dan **What-if Simulation** sebagai killer feature HELIORA.

---

## 4.12 Problem Boundary

Untuk menjaga scope MVP tetap realistis, HELIORA membatasi permasalahan yang diselesaikan pada area berikut.

### 4.12.1 In Scope

HELIORA mencakup:

- pemahaman risiko berbasis lifestyle;
- estimasi risiko berbasis model;
- penjelasan faktor risiko;
- simulasi perubahan lifestyle;
- rekomendasi preventif berbasis rule;
- evidence-based explanation;
- peningkatan health awareness.

### 4.12.2 Out of Scope

HELIORA tidak menyelesaikan:

- diagnosis medis;
- pemberian resep;
- treatment planning;
- emergency response;
- clinical decision making;
- penggantian konsultasi dokter;
- rekam medis elektronik;
- diagnosis berbasis medical imaging.

Batasan ini menjadi prinsip utama dalam seluruh pengembangan MVP.

---

## 4.13 Medical & AI Disclaimer

Seluruh output HELIORA harus diposisikan sebagai **estimasi dan simulasi**, bukan kepastian medis.

> **HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi/proyeksi berdasarkan data dan model yang digunakan, bukan diagnosis medis, bukan pengganti konsultasi dokter, dan bukan kepastian mengenai kondisi kesehatan seseorang.**

Apabila hasil estimasi melewati threshold safety yang telah ditentukan, sistem dapat memberikan arahan umum untuk mempertimbangkan konsultasi dengan tenaga kesehatan.

---

## 4.14 Problem Statement Success Criteria

Problem discovery dianggap cukup terdefinisi untuk memasuki tahap pengembangan apabila:

- [ ] Masalah utama telah didefinisikan dengan jelas.
- [ ] Target pengguna telah ditentukan.
- [ ] Root cause telah diidentifikasi.
- [ ] Dampak masalah telah dijelaskan.
- [ ] Product opportunity telah diidentifikasi.
- [ ] Problem-to-solution mapping telah dibuat.
- [ ] Batasan masalah telah ditentukan.
- [ ] Medical boundary telah ditentukan.
- [ ] Problem statement dapat diturunkan menjadi functional requirements.
- [ ] Problem statement selaras dengan vision dan scope MVP HELIORA.

---

# BAB 5 — PRODUCT VISION & OBJECTIVES

## 5.1 Product Vision

HELIORA adalah platform **preventive health intelligence berbasis Artificial Intelligence (AI)** yang membantu masyarakat memahami hubungan antara gaya hidup saat ini dengan estimasi risiko kesehatan di masa depan.

HELIORA tidak berfungsi sebagai alat diagnosis medis. Produk berfokus pada membantu pengguna:

- memahami kondisi lifestyle mereka;
- mengetahui faktor yang berkontribusi terhadap estimasi risiko kesehatan;
- mengeksplorasi dampak perubahan lifestyle;
- memperoleh rekomendasi preventif yang personal;
- memahami alasan di balik rekomendasi;
- mengakses evidence kesehatan yang mendukung informasi yang diberikan sistem.

Visi utama HELIORA adalah:

> **Membantu setiap individu memahami risiko kesehatan lebih awal dan mengambil keputusan preventif yang lebih baik berdasarkan data, simulasi, dan evidence.**

---

## 5.2 Product Mission

Misi HELIORA adalah menyediakan pengalaman preventive health yang:

1. **Personalized** — memberikan insight berdasarkan data lifestyle pengguna.
2. **Explainable** — menjelaskan faktor yang memengaruhi hasil estimasi.
3. **Interactive** — memungkinkan pengguna mengeksplorasi berbagai skenario perubahan lifestyle.
4. **Evidence-based** — memberikan informasi yang didukung oleh sumber kesehatan terpercaya.
5. **Actionable** — mengubah insight menjadi rekomendasi preventif yang dapat dilakukan.
6. **Responsible** — menjaga batas antara preventive health intelligence dan diagnosis medis.

---

## 5.3 Product Positioning

HELIORA diposisikan sebagai:

> **AI-powered preventive health intelligence platform yang membantu pengguna memahami risiko kesehatan berbasis lifestyle dan mengeksplorasi dampak perubahan kebiasaan melalui simulasi yang explainable dan evidence-based.**

HELIORA bukan:

- aplikasi diagnosis penyakit;
- pengganti dokter;
- aplikasi konsultasi medis;
- sistem clinical decision support;
- sistem rekam medis;
- platform emergency response.

Fokus HELIORA adalah **health awareness, risk understanding, lifestyle simulation, dan preventive action**.

---

## 5.4 Core Product Value

Nilai utama HELIORA dibangun melalui lima kemampuan utama:

### 5.4.1 Understand

Membantu pengguna memahami kondisi lifestyle dan estimasi risiko kesehatan mereka.

### 5.4.2 Explain

Menjelaskan faktor lifestyle yang paling berkontribusi terhadap hasil estimasi menggunakan Explainable AI.

### 5.4.3 Simulate

Memungkinkan pengguna melihat kemungkinan perubahan hasil apabila parameter lifestyle diubah.

### 5.4.4 Recommend

Memberikan rekomendasi preventif berdasarkan kondisi pengguna menggunakan Rule Engine.

### 5.4.5 Verify

Memberikan evidence dan sumber terpercaya untuk membantu pengguna memahami dasar dari rekomendasi yang diberikan.

Secara konseptual:

```text
Understand
     │
     ▼
Explain
     │
     ▼
Simulate
     │
     ▼
Recommend
     │
     ▼
Verify
     │
     ▼
Preventive Action
```

---

## 5.5 Product Principles

Pengembangan HELIORA harus mengikuti prinsip-prinsip berikut.

### 5.5.1 Prevention First

Produk harus berorientasi pada peningkatan kesadaran dan tindakan preventif, bukan diagnosis atau treatment.

### 5.5.2 Explainability First

Setiap hasil AI yang ditampilkan kepada pengguna harus dapat dijelaskan secara sederhana.

Pengguna tidak hanya mendapatkan hasil:

> "Risk: 27%"

tetapi juga memahami:

> "Faktor yang paling berkontribusi terhadap estimasi risiko adalah BMI, aktivitas fisik, dan durasi tidur."

### 5.5.3 Evidence First

Rekomendasi dan informasi kesehatan harus memiliki dasar evidence yang dapat ditelusuri.

### 5.5.4 User-Centered

Informasi kesehatan harus disajikan dalam bahasa yang mudah dipahami pengguna non-medis.

### 5.5.5 Simulation, Not Prediction Certainty

Future Health Simulation harus diposisikan sebagai simulasi/proyeksi berbasis model, bukan prediksi medis yang pasti.

### 5.5.6 Safety by Design

Sistem harus memiliki disclaimer dan safety guardrail untuk mencegah pengguna menginterpretasikan hasil sebagai diagnosis medis.

### 5.5.7 Simplicity

MVP harus mempertahankan arsitektur yang sederhana dan dapat diselesaikan secara realistis dalam timeline kompetisi.

---

## 5.6 Product Objectives

### 5.6.1 Objective 1 — Meningkatkan Preventive Health Awareness

Membantu pengguna memahami bahwa lifestyle memiliki hubungan dengan kondisi dan risiko kesehatan.

**Indikator keberhasilan:**

- pengguna dapat melihat Health Score dan Lifestyle Score;
- pengguna dapat melihat estimasi risiko;
- pengguna memahami faktor utama yang memengaruhi hasil.

---

### 5.6.2 Objective 2 — Memberikan Personalized Risk Insight

Mengubah data lifestyle pengguna menjadi insight kesehatan yang lebih personal.

**Indikator keberhasilan:**

- sistem menerima health profile pengguna;
- sistem menghasilkan estimasi risiko;
- hasil dapat ditampilkan secara individual;
- pengguna dapat melihat faktor yang berkontribusi terhadap hasil.

---

### 5.6.3 Objective 3 — Menjadikan Risiko Dapat Dieksplorasi

Memberikan pengalaman interaktif melalui Future Health Simulation dan What-if Simulation.

**Indikator keberhasilan:**

- pengguna dapat mengubah parameter lifestyle;
- sistem menghitung ulang estimasi berdasarkan input baru;
- perubahan hasil dapat dibandingkan dengan kondisi awal;
- simulasi dapat dilakukan secara cepat untuk kebutuhan interaksi pengguna.

---

### 5.6.4 Objective 4 — Menghasilkan Preventive Recommendation

Membantu pengguna menentukan tindakan lifestyle yang perlu diprioritaskan.

**Indikator keberhasilan:**

- sistem menghasilkan rekomendasi berdasarkan kondisi pengguna;
- rekomendasi berasal dari Rule Engine;
- rekomendasi memiliki dasar guideline;
- rekomendasi tidak diklaim sebagai treatment medis.

---

### 5.6.5 Objective 5 — Meningkatkan Trust terhadap AI

Membuat hasil AI lebih transparan dan dapat diverifikasi.

**Indikator keberhasilan:**

- faktor kontribusi dapat ditampilkan melalui Explainable AI;
- rekomendasi memiliki evidence;
- pengguna dapat membuka Evidence Center;
- sumber evidence berasal dari organisasi atau literatur yang kredibel.

---

## 5.7 SMART Objectives for MVP

Untuk memastikan objective dapat dievaluasi selama kompetisi, HELIORA menetapkan target MVP sebagai berikut:

| Objective                    | Target MVP                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Personalized Risk Estimation | Sistem mampu menghasilkan estimasi risiko berbasis health & lifestyle profile         |
| Health Score                 | Sistem menghasilkan skor kesehatan yang konsisten berdasarkan formula yang ditentukan |
| Lifestyle Score              | Sistem menghasilkan skor lifestyle berdasarkan parameter lifestyle                    |
| Explainable AI               | Faktor utama yang memengaruhi hasil dapat ditampilkan                                 |
| Future Health Simulation     | Pengguna dapat melihat simulasi pada beberapa horizon waktu                           |
| What-if Simulation           | Pengguna dapat mengubah parameter lifestyle dan melihat perubahan estimasi            |
| Recommendation               | Sistem menghasilkan rekomendasi berdasarkan Rule Engine                               |
| Evidence Center              | Rekomendasi/informasi dapat ditelusuri ke evidence                                    |
| AI Explanation               | LLM dapat mengubah hasil teknis menjadi penjelasan yang mudah dipahami                |
| Safety                       | Sistem selalu menampilkan batasan penggunaan dan medical disclaimer                   |

---

## 5.8 Killer Feature Objectives

Dua fitur utama HELIORA yang menjadi pembeda produk adalah **Future Health Simulation** dan **What-if Simulation**.

### 5.8.1 Future Health Simulation

Tujuan:

> Membantu pengguna memahami bagaimana kondisi lifestyle saat ini dapat diproyeksikan dalam beberapa horizon waktu.

Contoh:

```text
Current Lifestyle
       │
       ▼
Risk Estimation
       │
       ├── 30 Days
       ├── 90 Days
       └── 180 Days
```

Hasil simulasi harus diposisikan sebagai **model-based projection**, bukan kepastian mengenai kondisi kesehatan pengguna.

---

### 5.8.2 What-if Simulation

Tujuan:

> Memberikan pengalaman eksploratif yang memungkinkan pengguna melihat perubahan estimasi apabila mereka mengubah parameter lifestyle.

Contoh:

```text
Current Scenario
Sleep      = 5 hours
Exercise   = Low
Weight     = 82 kg

            ↓

WHAT IF?

Sleep      = 7 hours
Exercise   = Moderate
Weight     = 78 kg

            ↓

Recalculate

            ↓

Compare Risk & Health Score
```

Fitur ini menjadi mekanisme utama HELIORA untuk mengubah informasi kesehatan menjadi pengalaman yang **actionable dan interactive**.

---

## 5.9 AI Objectives

Arsitektur AI MVP HELIORA memiliki tujuan untuk memisahkan fungsi prediksi, penjelasan, simulasi, rekomendasi, dan generasi bahasa.

```text
User Input
    │
    ▼
Preventive Lifestyle Risk Engine
    │
    ▼
Risk Estimation
    │
    ▼
Explainable AI
    │
    ▼
Future / What-if Simulation
    │
    ▼
Rule-based Recommendation
    │
    ▼
LLM + RAG
    │
    ▼
Human-friendly Explanation
    │
    ▼
Evidence
```

Pembagian tanggung jawab:

| Komponen          | Tujuan                                       |
| ----------------- | -------------------------------------------- |
| ML Risk Engine    | Mengestimasi risiko                          |
| Health Score      | Merangkum kondisi kesehatan berbasis formula |
| Lifestyle Score   | Mengukur kualitas lifestyle                  |
| SHAP/LIME         | Menjelaskan faktor yang berkontribusi        |
| Simulation Engine | Menghitung skenario perubahan                |
| Rule Engine       | Menentukan rekomendasi                       |
| LLM               | Menghasilkan penjelasan natural              |
| RAG               | Menghubungkan penjelasan dengan evidence     |

---

## 5.10 Success Metrics

Keberhasilan MVP HELIORA tidak hanya diukur dari apakah sistem dapat berjalan, tetapi juga dari kualitas pengalaman dan stabilitas sistem.

### 5.10.1 Product Metrics

- pengguna berhasil menyelesaikan health assessment;
- pengguna memperoleh Health Score dan Lifestyle Score;
- pengguna memperoleh risk estimation;
- pengguna dapat melihat faktor risiko;
- pengguna dapat menjalankan What-if Simulation;
- pengguna dapat melihat rekomendasi;
- pengguna dapat membuka Evidence Center.

### 5.10.2 Technical Metrics

- risk estimation berjalan tanpa error;
- simulasi dapat dijalankan secara interaktif;
- LLM response berada dalam batas waktu yang ditentukan;
- sistem tidak mengalami crash pada alur utama;
- API dan database berjalan stabil;
- authentication dan authorization berjalan sesuai requirement.

### 5.10.3 AI Metrics

Evaluasi minimum model:

- Accuracy;
- Precision;
- Recall;
- F1-Score;
- ROC-AUC apabila sesuai dengan model dan target.

Untuk MVP, evaluasi dilakukan menggunakan train-test split atau metode validasi yang sesuai dengan dataset.

Analisis fairness dan recalibration lintas populasi secara mendalam ditetapkan sebagai **future work**.

---

## 5.11 Competitive Objective

HELIORA tidak bertujuan memenangkan kompetisi dengan jumlah fitur terbanyak.

Strategi produk adalah membangun **satu pengalaman utama yang kuat dan dapat didemonstrasikan dengan jelas**.

Fokus diferensiasi:

```text
Personalized Risk
       +
Explainable AI
       +
Future Simulation
       +
What-if Simulation
       +
Evidence Center
       =
Preventive Health Intelligence
```

Dengan pendekatan tersebut, HELIORA diharapkan memiliki keunggulan pada:

- innovation;
- user experience;
- technical implementation;
- clarity of AI utilization;
- evidence transparency;
- demoability.

---

## 5.12 Product Vision Statement

Berdasarkan seluruh objective di atas, product vision final HELIORA adalah:

> **HELIORA aims to transform preventive health from generic health information into a personalized, explainable, interactive, and evidence-based experience—helping people understand their health risks today, explore how lifestyle changes may affect their future, and take more informed preventive actions.**

Versi Bahasa Indonesia:

> **HELIORA bertujuan mengubah preventive health dari sekadar informasi kesehatan umum menjadi pengalaman yang personal, explainable, interaktif, dan berbasis evidence, sehingga masyarakat dapat memahami risiko kesehatan mereka saat ini, mengeksplorasi dampak perubahan lifestyle di masa depan, dan mengambil tindakan preventif yang lebih terinformasi.**

---

## 5.13 Alignment dengan Problem Statement

BAB 5 harus memiliki hubungan langsung dengan BAB 4.

| Problem pada BAB 4                       | Objective pada BAB 5                  |
| ---------------------------------------- | ------------------------------------- |
| Informasi kesehatan terlalu umum         | Personalized Risk Insight             |
| Sulit memahami risiko personal           | Preventive Lifestyle Risk Engine      |
| Tidak mengetahui faktor yang berpengaruh | Explainable AI                        |
| Tidak ada media simulasi                 | Future Health Simulation              |
| Sulit mengeksplorasi perubahan lifestyle | What-if Simulation                    |
| Tidak tahu tindakan yang diprioritaskan  | Recommendation Engine                 |
| Evidence tersebar                        | Evidence Center                       |
| Informasi AI sulit dipahami              | LLM-assisted Explanation              |
| Risiko disalahartikan sebagai diagnosis  | Safety Guardrail & Medical Disclaimer |

Dengan demikian, **setiap objective pada BAB 5 memiliki akar permasalahan yang jelas pada BAB 4** dan dapat diturunkan lebih lanjut menjadi scope, functional requirements, AI requirements, serta acceptance criteria pada bab-bab berikutnya.

---

## 5.14 Objective Boundary

Untuk menjaga fokus MVP, objective HELIORA tidak mencakup:

- diagnosis penyakit;
- prediksi medis definitif;
- rekomendasi obat;
- treatment planning;
- clinical decision support;
- emergency medical response;
- penggantian konsultasi tenaga kesehatan;
- pengembangan perangkat medis;
- pembangunan model AI terpisah untuk setiap penyakit.

HELIORA hanya berfokus pada **preventive lifestyle intelligence** dan simulasi berbasis model dalam batas MVP.

---

# 6. Scope

## 6.1 Scope Overview

Scope HELIORA ditetapkan untuk memastikan pengembangan MVP tetap fokus pada tujuan utama produk, yaitu membantu pengguna memahami hubungan antara lifestyle saat ini dengan estimasi risiko kesehatan di masa depan melalui pendekatan preventive health berbasis AI.

Scope MVP dirancang berdasarkan prinsip:

- fokus pada masalah utama pengguna;
- mempertahankan killer feature;
- menggunakan AI secara terukur dan explainable;
- mengutamakan evidence-based recommendation;
- menjaga batas antara preventive health dan diagnosis medis;
- realistis untuk dikembangkan oleh tim dalam periode kompetisi.

Secara konseptual, scope HELIORA mencakup:

```text
User Input
    ↓
Health & Lifestyle Profile
    ↓
Preventive Lifestyle Risk Engine
    ↓
Risk Estimation
    ↓
Explainable AI
    ↓
Future Health Simulation
    ↓
What-if Simulation
    ↓
Recommendation Engine
    ↓
Evidence Center
    ↓
Human-Friendly Explanation
```

---

## 6.2 Scope Boundary

Scope HELIORA dibagi menjadi tiga kategori utama:

1. **MVP Scope** — fitur yang wajib tersedia dalam versi kompetisi.
2. **Future Scope** — fitur yang memiliki potensi dikembangkan setelah MVP.
3. **Out of Scope** — fitur yang secara eksplisit tidak menjadi bagian dari HELIORA.

Pembagian tersebut digunakan untuk mencegah scope creep selama proses pengembangan.

---

## 6.3 MVP Scope

### 6.3.1 Authentication & User Access

HELIORA menyediakan mekanisme autentikasi dasar agar data pengguna dapat dikelola secara terpisah.

Fitur yang termasuk:

- registrasi akun;
- login;
- logout;
- password hashing;
- session management;
- validasi input autentikasi;
- perlindungan akses berdasarkan status autentikasi.

Authentication digunakan sebagai fondasi pengelolaan health profile pengguna.

---

### 6.3.2 Consent & Privacy

Sebelum menggunakan fitur health assessment, pengguna harus memberikan persetujuan terhadap penggunaan data yang diberikan kepada sistem.

Fitur yang termasuk:

- consent screen;
- penjelasan tujuan penggunaan data;
- pemberitahuan bahwa HELIORA bukan alat diagnosis;
- pemberitahuan mengenai penggunaan data untuk estimasi dan simulasi;
- komitmen bahwa data tidak digunakan di luar tujuan produk tanpa persetujuan;
- anonymization atau minimalisasi data yang tidak diperlukan.

Consent menjadi bagian dari onboarding dan bukan fitur tambahan yang terpisah dari user flow utama.

---

### 6.3.3 Health & Lifestyle Profile

Pengguna dapat memasukkan data dasar yang digunakan oleh Preventive Lifestyle Risk Engine.

Data utama MVP:

| Data                | Keterangan                        | Status   |
| ------------------- | --------------------------------- | -------- |
| Age                 | Usia pengguna                     | Required |
| Gender              | Jenis kelamin                     | Required |
| Height              | Tinggi badan                      | Required |
| Weight              | Berat badan                       | Required |
| Physical Activity   | Aktivitas fisik                   | Required |
| Sleep Duration      | Durasi tidur                      | Required |
| Smoking Status      | Status merokok                    | Required |
| Family History      | Riwayat keluarga terkait penyakit | Required |
| Stress Level        | Tingkat stres                     | Optional |
| Waist Circumference | Lingkar pinggang                  | Optional |

Data tersebut dipilih berdasarkan relevansinya terhadap preventive lifestyle assessment dan kemampuan dataset yang tersedia.

---

## 6.4 Preventive Lifestyle Risk Assessment

HELIORA menyediakan assessment berbasis lifestyle untuk menghasilkan gambaran kondisi preventif pengguna.

Assessment menghasilkan:

- Health Score;
- Lifestyle Score;
- estimated risk;
- risk category;
- contributing factors.

Hasil assessment harus selalu menggunakan istilah **estimated risk** atau **risk estimation**, bukan diagnosis.

Contoh:

```text
Estimated Diabetes Risk
Estimated Hypertension Risk
Estimated Cardiovascular Risk
```

---

## 6.5 Health Score

Health Score merupakan **product-defined preventive index** yang membantu pengguna memahami kualitas faktor lifestyle secara ringkas.

Health Score tidak dianggap sebagai standar klinis, bukan clinical score, dan bukan indikator diagnosis.

Konsep perhitungan menggunakan weighted scoring sederhana. Formula MVP minimal mengikuti bentuk:

```text
Score = Σ(normalized_factor × weight)
```

Setiap faktor harus memiliki aturan normalisasi, bobot, dan rentang output yang terdokumentasi. Bobot awal bersifat provisional dan harus divalidasi sebelum release MVP.

Contoh struktur:

```text
Preventive Health Score
    ├── BMI
    ├── Physical Activity
    ├── Sleep
    ├── Smoking
    ├── Family History
    └── Other Lifestyle Factors (if validated)
```

Tujuan Health Score adalah memberikan feedback preventif yang mudah dipahami, bukan menggantikan medical assessment.

---


## 6.6 Lifestyle Score

Lifestyle Score digunakan untuk menggambarkan kualitas kebiasaan lifestyle pengguna.

Faktor yang dapat digunakan meliputi:

- aktivitas fisik;
- durasi tidur;
- status merokok;
- BMI;
- stress level;
- faktor lifestyle lainnya yang tersedia.

Lifestyle Score digunakan sebagai salah satu komponen dashboard dan simulasi perubahan lifestyle.

---

## 6.7 Risk Estimation

Preventive Lifestyle Risk Engine merupakan module/service utama untuk menghasilkan **model-estimated risk output**. Istilah “single risk engine” merujuk pada satu service boundary, bukan kewajiban bahwa seluruh kategori risiko harus menggunakan satu model ML yang sama.

MVP memiliki target output:

```text
Diabetes Risk
Hypertension Risk
Cardiovascular Risk
```

Detail model internal, target variable, dan pendekatan multi-output atau multi-model ditetapkan pada `ai-architecture.md` dan `dataset-strategy.md`.

Output hanya boleh ditampilkan sebagai model-estimated score/probability apabila semantics output dan calibration telah divalidasi.

Output dapat disajikan dalam bentuk:

- estimated risk score;
- calibrated probability apabila valid;
- product-defined score band;
- indikator visual;
- faktor yang berkontribusi terhadap hasil.

Output tidak boleh disajikan sebagai diagnosis, kepastian penyakit, clinical probability tanpa calibration, medical treatment recommendation, atau pengganti pemeriksaan medis.

---


## 6.8 Explainable AI

HELIORA menyediakan penjelasan mengenai faktor yang paling berkontribusi terhadap hasil risk estimation.

Pendekatan yang digunakan:

- SHAP sebagai pendekatan utama;
- LIME sebagai alternatif apabila diperlukan.

Contoh output:

```text
Faktor yang paling berkontribusi terhadap estimasi Anda:

1. Physical Activity — rendah
2. Sleep Duration — di bawah rekomendasi
3. BMI — berada di atas rentang ideal
4. Smoking Status — memiliki kontribusi risiko
```

Tujuan Explainable AI adalah meningkatkan:

- transparansi;
- kepercayaan pengguna;
- pemahaman terhadap hasil;
- interpretasi model.

---

## 6.9 Future Health Simulation

Future Health Simulation merupakan salah satu **killer feature** utama HELIORA.

Fitur ini memungkinkan pengguna melihat perubahan **output model** berdasarkan lifestyle scenario pada horizon simulasi tertentu.

MVP menyediakan horizon simulasi:

- 30 hari;
- 90 hari;
- 180 hari.

Simulation merupakan **model-based scenario projection**, bukan clinical forecasting dan bukan prediksi pasti terhadap kondisi kesehatan aktual pengguna.

Pendekatan MVP:

```text
Current User Profile
        ↓
Baseline Model Output
        ↓
Lifestyle Scenario
        ↓
Projected Input
        ↓
Risk Engine
        ↓
Simulated Model Output
```

Scenario assumptions wajib dapat ditelusuri dan ditampilkan kepada pengguna. Sistem tidak boleh menyatakan bahwa hasil simulasi pasti terjadi pada akhir horizon.

---


## 6.10 What-if Simulation

What-if Simulation memungkinkan pengguna mengeksplorasi skenario perubahan lifestyle secara interaktif.

Parameter utama yang dapat diubah:

- sleep duration;
- physical activity;
- weight;
- smoking status apabila relevan.

Contoh:

```text
Current Condition
Sleep       : 5 hours
Exercise    : Low
Weight      : 80 kg

        ↓ What-if

Scenario
Sleep       : 7 hours
Exercise    : Moderate
Weight      : 75 kg

        ↓

Recalculate Risk

        ↓

Compare Result
```

Hasil simulasi dapat menampilkan:

- baseline score;
- simulated score;
- baseline risk;
- simulated risk;
- perubahan risiko;
- faktor yang berubah;
- rekomendasi terkait.

---

## 6.11 Recommendation Engine

HELIORA menggunakan Rule Engine untuk menghasilkan rekomendasi preventif.

Recommendation Engine tidak menggunakan LLM sebagai sumber utama keputusan rekomendasi.

Contoh rule:

| Kondisi                | Rekomendasi                                |
| ---------------------- | ------------------------------------------ |
| Sleep < 6 jam          | Tingkatkan durasi tidur secara bertahap    |
| Aktivitas fisik rendah | Tingkatkan aktivitas fisik secara bertahap |
| BMI tinggi             | Fokus pada pengelolaan berat badan         |
| Smoking = Yes          | Pertimbangkan program berhenti merokok     |
| Risiko tinggi          | Pertimbangkan konsultasi tenaga kesehatan  |

Rule berasal dari evidence dan guideline yang telah ditentukan dalam Knowledge Base.

---

## 6.12 Evidence Center

Evidence Center merupakan fitur yang menghubungkan hasil rekomendasi dengan sumber evidence.

Sumber evidence dapat berasal dari:

- WHO;
- Kementerian Kesehatan RI;
- PERKENI;
- PERKI;
- CDC;
- jurnal ilmiah yang relevan.

Informasi yang ditampilkan dapat mencakup:

- evidence ID;
- judul sumber;
- organisasi/penerbit;
- tahun/tanggal publikasi;
- jenis evidence;
- source URL atau DOI/reference;
- topik terkait;
- ringkasan evidence;
- hubungan evidence dengan recommendation;
- tingkat atau strength of evidence apabila tersedia;
- last verified date.

Evidence yang ditampilkan harus berasal dari knowledge base yang telah diverifikasi dan tidak boleh dibuat oleh LLM.

Tujuan Evidence Center adalah meningkatkan transparency dan trust terhadap rekomendasi HELIORA.

---


## 6.13 LLM-Assisted Explanation

LLM tetap digunakan dalam MVP sebagai **enhancement layer**, bukan dependency utama.

LLM bertugas:

- menjelaskan hasil model;
- mengubah output teknis menjadi bahasa yang mudah dipahami;
- merangkum evidence yang telah ditemukan;
- membantu menyusun personalized health insight.

Core risk estimation, XAI, recommendation, dan safety flow harus tetap berfungsi apabila LLM tidak tersedia.

Arsitektur utama:

```text
Risk Engine
     ↓
Structured Result
     ↓
Rule Engine + Evidence
     ↓
Template / Deterministic Explanation
     ↓
Optional LLM Enhancement
```

Jika LLM tersedia dan digunakan:

```text
Structured Result
     ↓
RAG Retrieval
     ↓
Verified Evidence
     ↓
LLM
     ↓
Human-Friendly Explanation
```

LLM tidak diperbolehkan menentukan diagnosis, membuat risk score sendiri, mengubah hasil model, menghasilkan rekomendasi medis tanpa evidence, menggantikan Rule Engine, atau memberikan resep/treatment plan.

---


## 6.14 RAG Knowledge Base

RAG digunakan sebagai evidence retrieval layer.

MVP tidak membutuhkan knowledge base dalam jumlah sangat besar.

Target awal:

```text
15–30 high-quality documents
```

Prioritas sumber:

### Tier 1 — Official Health Organizations

- WHO;
- Kementerian Kesehatan RI;
- CDC.

### Tier 2 — Professional Organizations

- PERKENI;
- PERKI.

### Tier 3 — Scientific Literature

- jurnal ilmiah yang relevan;
- systematic review;
- meta-analysis apabila tersedia dan relevan.

Prioritas diberikan kepada sumber authoritative dan evidence yang relevan dengan recommendation rule.

---

## 6.15 Dashboard

Dashboard menjadi halaman utama setelah pengguna menyelesaikan assessment.

Informasi utama:

```text
Health Score
Lifestyle Score

Risk Overview
├── Diabetes
├── Hypertension
└── Cardiovascular

Top Risk Factors

Recommended Actions

Future Health Simulation

What-if Simulation
```

Dashboard harus mengutamakan readability dan tidak menampilkan terlalu banyak informasi teknis.

---

## 6.16 Risk Detail

Pengguna dapat membuka detail setiap estimasi risiko.

Halaman atau modal detail dapat menampilkan:

- estimated risk;
- risk category;
- contributing factors;
- Explainable AI visualization;
- recommendation;
- evidence;
- disclaimer.

Tujuan halaman ini adalah membantu pengguna memahami **mengapa** sistem menghasilkan estimasi tertentu.

---

## 6.17 Data & AI Pipeline

MVP menggunakan pipeline AI sederhana:

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
    ↓
Explainable AI
    ↓
Simulation
    ↓
Recommendation Engine
    ↓
RAG
    ↓
LLM Explanation
```

Pipeline dirancang modular sehingga masing-masing komponen dapat diuji secara independen.

---

## 6.18 Scope Data

Dataset machine learning MVP difokuskan pada satu dataset utama yang memiliki variabel lifestyle yang relevan.

Prioritas dataset:

```text
Primary Dataset
└── CDC BRFSS

Supporting / Validation Data
├── SKI 2023
└── IFLS
```

Dataset pendukung tidak wajib digunakan untuk training model.

Fungsinya antara lain:

- memahami konteks Indonesia;
- validasi relevansi feature;
- mendukung problem discovery;
- mendukung argumentasi kompetisi.

---

## 6.19 Scope AI

AI yang termasuk dalam MVP:

| Komponen                         | Status       |
| -------------------------------- | ------------ |
| Preventive Lifestyle Risk Engine | In Scope     |
| Machine Learning                 | In Scope     |
| Explainable AI                   | In Scope     |
| SHAP                             | In Scope     |
| Future Health Simulation         | In Scope     |
| What-if Simulation               | In Scope     |
| Rule Engine                      | In Scope     |
| RAG                              | In Scope     |
| LLM Explanation                  | In Scope     |
| NLP sebagai modul terpisah       | Out of Scope |

NLP tidak dikembangkan sebagai pipeline atau model terpisah karena kebutuhan natural-language understanding MVP telah ditangani oleh LLM.

---

## 6.20 Safety Guardrail

Safety guardrail menjadi bagian dari MVP untuk mencegah interpretasi hasil sebagai diagnosis.

Guardrail mencakup:

- medical disclaimer;
- penggunaan istilah "estimated risk";
- larangan memberikan diagnosis;
- larangan memberikan resep;
- warning ketika risiko melewati threshold tertentu;
- arahan untuk mempertimbangkan konsultasi tenaga kesehatan.

Contoh:

```text
Hasil estimasi menunjukkan tingkat risiko yang relatif tinggi.

Hasil ini bukan diagnosis medis.
Pertimbangkan untuk berkonsultasi dengan tenaga kesehatan
untuk mendapatkan pemeriksaan dan penilaian lebih lanjut.
```

---

## 6.21 Privacy & Consent Scope

MVP menerapkan prinsip minimal data collection.

HELIORA hanya mengumpulkan data yang diperlukan untuk:

- risk estimation;
- health scoring;
- simulation;
- recommendation.

Data yang tidak diperlukan tidak menjadi bagian dari MVP.

Prinsip dasar:

- consent sebelum assessment;
- password disimpan dalam bentuk hashed;
- akses data dibatasi berdasarkan autentikasi;
- data tidak digunakan di luar tujuan produk;
- data sensitif tidak ditampilkan secara tidak perlu.

---

## 6.22 Scope Berdasarkan Prioritas

Prioritas MVP dibagi menjadi tiga tingkat untuk memastikan core product tetap dapat dirilis tanpa menjadikan external AI service sebagai single point of failure.

### P0 — Core MVP

- Authentication
- Consent
- Health Profile
- Lifestyle Input
- Preventive Lifestyle Risk Engine
- Health Score
- Lifestyle Score
- Risk Estimation
- Explainable AI
- What-if Simulation
- Recommendation Engine
- Safety Guardrail

### P1 — Enhanced MVP

- Future Health Simulation
- Evidence Center
- RAG
- LLM-assisted Explanation
- Recommendation evidence
- Simulation comparison
- UI/UX refinement

P1 dapat ditunda apabila implementasinya mengganggu stabilitas P0 atau timeline kompetisi.

### P2 — Enhancement

- Advanced analytics
- Additional simulation parameters
- Advanced personalization
- Additional evidence sources
- Advanced model evaluation
- Advanced visualization
- Additional disease-specific models

---


## 6.23 Future Scope

Fitur berikut dapat dikembangkan setelah MVP:

### Health Data Integration

Integrasi dengan:

- wearable devices;
- Google Fit;
- Apple Health;
- Samsung Health;
- health tracking platforms.

### Advanced Risk Models

Pengembangan model khusus untuk:

- diabetes;
- hypertension;
- cardiovascular disease;
- obesity;
- metabolic syndrome.

### Personalized Long-Term Simulation

Simulasi yang lebih kompleks berdasarkan:

- historical lifestyle;
- longitudinal data;
- behavioral patterns;
- repeated assessments.

### Advanced AI

Pengembangan:

- personalized AI health coach;
- conversational health assistant;
- advanced NLP;
- multimodal health data analysis.

### Indonesia-Specific Model

Model dapat dikembangkan menggunakan dataset Indonesia secara lebih mendalam setelah data yang sesuai tersedia.

---

## 6.24 MVP Scope Decision

Scope final MVP HELIORA ditetapkan sebagai berikut:

```text
                    HELIORA MVP
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
     PROFILE          AI ENGINE        EVIDENCE
        │                │                │
        │                ├── Risk        ├── RAG
        │                ├── XAI         └── Sources
        │                └── Simulation
        │
        ▼
    Dashboard
        │
        ▼
 Recommendations
```

Fokus utama bukan jumlah fitur, melainkan kualitas pengalaman:

```text
Understand
    ↓
Explain
    ↓
Simulate
    ↓
Compare
    ↓
Recommend
    ↓
Act
```

Dengan demikian, HELIORA MVP berfokus pada satu core experience:

> **Membantu pengguna memahami kondisi lifestyle mereka, mengetahui faktor yang berkontribusi terhadap estimasi risiko, mengeksplorasi perubahan melalui simulasi, dan memperoleh tindakan preventif yang didukung evidence.**

---

## 6.25 Scope Success Criteria

Scope MVP dianggap berhasil apabila seluruh komponen utama berikut dapat berjalan secara terintegrasi:

- pengguna dapat membuat akun dan melakukan login;
- pengguna memberikan consent sebelum assessment;
- pengguna dapat mengisi health & lifestyle profile;
- sistem dapat menghasilkan Health Score;
- sistem dapat menghasilkan Lifestyle Score;
- sistem dapat menghasilkan estimated risk;
- sistem dapat menjelaskan faktor yang berkontribusi menggunakan Explainable AI;
- pengguna dapat menjalankan Future Health Simulation;
- pengguna dapat menjalankan What-if Simulation;
- sistem dapat menghasilkan rekomendasi berbasis Rule Engine;
- rekomendasi dapat ditelusuri ke evidence;
- LLM dapat menyajikan hasil dalam bahasa yang mudah dipahami;
- safety disclaimer selalu tersedia;
- sistem tidak memosisikan output sebagai diagnosis medis.

---

## 6.26 Scope Statement Final

Berdasarkan keseluruhan product discovery dan product vision, scope MVP HELIORA difokuskan pada pembangunan **preventive health intelligence platform berbasis lifestyle** dengan pengalaman utama:

```text
Personal Health Input
        ↓
Risk Estimation
        ↓
Explainable Insight
        ↓
Future Simulation
        ↓
What-if Exploration
        ↓
Preventive Recommendation
        ↓
Evidence-backed Explanation
```

HELIORA tidak berusaha membangun sistem kesehatan klinis yang kompleks.

Sebaliknya, MVP diarahkan untuk membuktikan satu proposisi utama:

> **Jika pengguna dapat memahami risiko mereka, mengetahui faktor yang paling berpengaruh, dan melihat bagaimana perubahan lifestyle dapat memengaruhi estimasi tersebut, maka pengguna akan memiliki dasar yang lebih baik untuk mengambil tindakan preventif.**

Scope ini menjadi dasar untuk penyusunan **User Persona, User Journey, Functional Requirements, AI Features, Data Requirements, dan Acceptance Criteria** pada bab-bab berikutnya.

---

# 7. User Persona

## 7.1 Overview

User Persona digunakan untuk merepresentasikan karakteristik, kebutuhan, tujuan, motivasi, perilaku, serta permasalahan utama pengguna yang menjadi target HELIORA.

Persona HELIORA disusun berdasarkan positioning produk sebagai **preventive health intelligence platform** yang membantu pengguna memahami hubungan antara lifestyle saat ini dengan estimasi risiko kesehatan di masa depan.

HELIORA tidak ditujukan untuk menggantikan tenaga medis, melainkan membantu pengguna meningkatkan awareness dan mengambil keputusan preventif berbasis informasi dan evidence.

Target pengguna dibagi menjadi:

1. **Primary Persona** — pengguna utama yang menggunakan HELIORA untuk memahami kondisi lifestyle dan mengeksplorasi risiko kesehatan.
2. **Secondary Persona** — pihak yang dapat memperoleh manfaat dari insight HELIORA atau mendukung penggunaan platform.
3. **Excluded Persona** — kelompok pengguna yang berada di luar scope MVP.

---

## 7.2 Target User Definition

### Primary Target

Target utama HELIORA adalah:

> **Individu usia produktif yang ingin memahami kondisi lifestyle, mengetahui faktor risiko kesehatan yang dapat dipengaruhi oleh kebiasaan hidup, dan mengeksplorasi dampak perubahan lifestyle melalui simulasi.**

Karakteristik umum:

- usia produktif;
- memiliki akses terhadap perangkat digital;
- memiliki kesadaran terhadap kesehatan tetapi belum konsisten dalam tindakan preventif;
- memiliki kebiasaan lifestyle yang dapat memengaruhi kesehatan;
- membutuhkan informasi kesehatan yang mudah dipahami;
- tertarik mengetahui dampak perubahan kebiasaan;
- tidak selalu memiliki latar belakang medis;
- membutuhkan rekomendasi yang praktis dan personal.

---

## 7.3 Primary Persona

### Persona 1 — Preventive Health Seeker

| Attribute          | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| Persona Name       | Raka                                                        |
| Age                | 25–35 tahun                                                 |
| Occupation         | Mahasiswa akhir / profesional muda                          |
| Digital Literacy   | Tinggi                                                      |
| Health Awareness   | Sedang                                                      |
| Lifestyle          | Aktivitas tidak selalu konsisten                            |
| Health Concern     | Berat badan, tidur, aktivitas fisik, pola hidup             |
| Primary Motivation | Mengetahui kondisi kesehatan dan mencegah risiko sejak dini |
| Technology Usage   | Smartphone, laptop, aplikasi kesehatan                      |
| Primary Need       | Insight kesehatan yang personal dan mudah dipahami          |

### Background

Raka merupakan individu usia produktif yang aktif menggunakan teknologi dalam kehidupan sehari-hari.

Ia memahami bahwa pola tidur, aktivitas fisik, berat badan, pola makan, dan kebiasaan tertentu dapat memengaruhi kesehatan. Namun, pemahaman tersebut belum selalu diikuti oleh tindakan preventif yang konsisten.

Raka tidak selalu mengalami masalah kesehatan yang serius sehingga pemeriksaan kesehatan bukan merupakan prioritas utama.

Namun, ia mulai memiliki pertanyaan seperti:

> "Apakah lifestyle saya sekarang sebenarnya sudah sehat?"

> "Kalau saya terus menjalani kebiasaan seperti ini, apa dampaknya?"

> "Kalau saya mulai olahraga dan memperbaiki tidur, apakah kondisi saya bisa menjadi lebih baik?"

### Goals

Raka ingin:

- mengetahui kondisi lifestyle saat ini;
- memahami faktor yang paling berpengaruh terhadap risiko kesehatan;
- mengetahui estimasi risiko kesehatan secara personal;
- memahami alasan di balik hasil yang diberikan sistem;
- melihat dampak perubahan lifestyle;
- mencoba berbagai skenario melalui What-if Simulation;
- memperoleh rekomendasi yang dapat dilakukan;
- mendapatkan evidence yang mendukung rekomendasi.

### Pain Points

Raka mengalami beberapa permasalahan:

- informasi kesehatan di internet terlalu umum;
- sulit mengetahui apakah informasi tersebut relevan dengan dirinya;
- tidak mengetahui faktor lifestyle mana yang harus diprioritaskan;
- sulit memahami hubungan antara lifestyle dan risiko penyakit;
- tidak memiliki media untuk melakukan simulasi perubahan lifestyle;
- informasi kesehatan tersebar di banyak sumber;
- istilah kesehatan dan statistik dapat sulit dipahami;
- khawatir terhadap hasil AI yang tidak memiliki sumber yang jelas.

### Needs

Raka membutuhkan:

- personalized health insight;
- risk estimation yang mudah dipahami;
- penjelasan faktor risiko;
- simulasi perubahan lifestyle;
- rekomendasi yang actionable;
- evidence yang dapat diverifikasi;
- visualisasi sederhana;
- disclaimer yang jelas mengenai batasan sistem.

### Expected Experience

Raka mengharapkan pengalaman:

```text
Input Lifestyle
      ↓
Understand Current Condition
      ↓
See Risk Estimation
      ↓
Understand Why
      ↓
Try "What If?"
      ↓
See Possible Change
      ↓
Get Recommendation
      ↓
Read Evidence
      ↓
Take Preventive Action
```

---

## 7.4 Primary Persona 2 — Health-Conscious Planner

| Attribute          | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| Persona Name       | Dinda                                                                     |
| Age                | 30–45 tahun                                                               |
| Occupation         | Profesional / pekerja                                                     |
| Digital Literacy   | Sedang–Tinggi                                                             |
| Health Awareness   | Tinggi                                                                    |
| Lifestyle          | Relatif teratur tetapi masih memiliki beberapa area yang perlu diperbaiki |
| Health Concern     | Risiko penyakit kronis dan kondisi lifestyle                              |
| Primary Motivation | Mempertahankan kesehatan dan mencegah risiko                              |
| Technology Usage   | Smartphone, wearable/app kesehatan, web                                   |
| Primary Need       | Insight preventif dan evidence-based recommendation                       |

### Background

Dinda sudah memiliki awareness kesehatan yang lebih tinggi dibandingkan primary persona pertama.

Ia telah berusaha menjaga pola hidup, tetapi masih ingin mengetahui apakah kebiasaan yang dilakukan sudah memberikan dampak positif.

Dinda lebih tertarik pada:

- faktor risiko;
- perubahan skor;
- rekomendasi;
- evidence;
- perbandingan kondisi;
- simulasi jangka waktu.

### Goals

Dinda ingin:

- mengetahui faktor lifestyle yang masih perlu diperbaiki;
- membandingkan kondisi saat ini dengan skenario tertentu;
- memahami kemungkinan perubahan risiko;
- memperoleh rekomendasi berbasis evidence;
- mempertahankan kebiasaan sehat;
- menggunakan data sebagai motivasi untuk konsisten.

### Pain Points

- aplikasi kesehatan sering hanya menampilkan data;
- sulit memahami arti data tersebut;
- rekomendasi sering terlalu general;
- tidak selalu terdapat penjelasan mengapa rekomendasi diberikan;
- informasi evidence membutuhkan pencarian manual;
- sulit melihat hubungan antara perubahan lifestyle dan risiko.

### Needs

Dinda membutuhkan:

- comparative insight;
- What-if Simulation;
- Future Health Simulation;
- explainable risk factors;
- evidence-backed recommendation;
- progress-oriented information.

---

## 7.5 Secondary Persona

### Persona 3 — Health Education Supporter

Secondary persona merupakan pengguna atau pihak yang tidak menjadi target utama penggunaan HELIORA, tetapi dapat memperoleh manfaat dari insight atau output platform.

Contohnya:

- keluarga;
- komunitas kesehatan;
- organisasi pendidikan;
- organisasi non-profit;
- program wellness;
- komunitas preventive health.

### Needs

Secondary persona membutuhkan:

- informasi preventive health yang mudah dipahami;
- insight lifestyle;
- materi edukasi;
- evidence yang dapat diverifikasi;
- informasi yang tidak mengklaim diagnosis.

### Expected Value

HELIORA dapat membantu secondary persona dalam:

- meningkatkan health awareness;
- mendorong diskusi mengenai preventive health;
- menyediakan materi edukasi berbasis evidence;
- membantu pengguna memahami pentingnya perubahan lifestyle.

---

## 7.6 Excluded Persona

Untuk menjaga scope MVP, HELIORA tidak secara khusus ditujukan untuk:

### 1. Tenaga Medis sebagai Clinical Decision Maker

Dokter, perawat, atau tenaga kesehatan dapat melihat HELIORA sebagai alat edukasi, tetapi HELIORA tidak dirancang untuk menggantikan clinical decision support system.

### 2. Pasien dengan Kondisi Medis Kompleks

HELIORA tidak dirancang untuk:

- diagnosis penyakit;
- treatment planning;
- pemilihan obat;
- clinical monitoring;
- emergency response.

### 3. Pengguna yang Membutuhkan Diagnosis Medis

Apabila pengguna membutuhkan diagnosis atau evaluasi klinis, HELIORA harus mengarahkan pengguna untuk berkonsultasi dengan tenaga kesehatan.

---

## 7.7 Persona Needs Matrix

| User Need                | Preventive Health Seeker | Health-Conscious Planner | Secondary Persona |
| ------------------------ | :----------------------: | :----------------------: | :---------------: |
| Personal Health Insight  |           High           |           High           |      Medium       |
| Risk Estimation          |           High           |           High           |        Low        |
| Explainable AI           |           High           |           High           |      Medium       |
| What-if Simulation       |           High           |           High           |        Low        |
| Future Health Simulation |           High           |           High           |      Medium       |
| Recommendation           |           High           |           High           |      Medium       |
| Evidence Center          |           High           |           High           |       High        |
| Health Education         |           High           |           High           |       High        |
| Clinical Diagnosis       |       Out of Scope       |       Out of Scope       |   Out of Scope    |

---

## 7.8 User Goals

Berdasarkan persona yang telah ditentukan, tujuan pengguna HELIORA dapat dikelompokkan menjadi beberapa kategori.

### 7.8.1 Understand

Pengguna ingin memahami:

- kondisi lifestyle;
- health score;
- lifestyle score;
- estimasi risiko;
- faktor yang memengaruhi hasil.

### 7.8.2 Explore

Pengguna ingin mengeksplorasi:

- perubahan berat badan;
- perubahan aktivitas fisik;
- perubahan durasi tidur;
- perubahan kebiasaan merokok;
- kemungkinan perubahan estimasi risiko.

### 7.8.3 Improve

Pengguna ingin:

- mengetahui prioritas perubahan;
- memperoleh rekomendasi;
- memahami tindakan preventif;
- meningkatkan lifestyle.

### 7.8.4 Verify

Pengguna ingin:

- mengetahui alasan di balik rekomendasi;
- melihat evidence;
- mengetahui sumber informasi;
- membedakan hasil model dengan fakta medis.

---

## 7.9 User Motivation

Motivasi pengguna HELIORA terutama berasal dari beberapa faktor.

### Awareness

Pengguna ingin mengetahui apakah lifestyle mereka saat ini berpotensi meningkatkan risiko kesehatan.

### Prevention

Pengguna ingin melakukan tindakan sebelum masalah kesehatan menjadi lebih serius.

### Curiosity

Pengguna ingin mengetahui:

> "Apa yang terjadi jika saya mengubah kebiasaan tertentu?"

### Personalization

Pengguna menginginkan informasi yang relevan dengan kondisi dirinya, bukan hanya informasi kesehatan umum.

### Evidence

Pengguna ingin mengetahui apakah rekomendasi yang diberikan memiliki dasar ilmiah.

### Control

Pengguna ingin merasa memiliki kendali terhadap perubahan lifestyle melalui pilihan dan simulasi yang dapat dieksplorasi sendiri.

---

## 7.10 User Pain Point Mapping

| Pain Point                           | Impact                              | HELIORA Response              |
| ------------------------------------ | ----------------------------------- | ----------------------------- |
| Informasi terlalu umum               | Pengguna sulit menentukan relevansi | Personalized Health Profile   |
| Tidak mengetahui risiko personal     | Awareness rendah                    | Risk Estimation               |
| Tidak mengetahui faktor penyebab     | Sulit menentukan prioritas          | Explainable AI                |
| Tidak dapat melihat dampak perubahan | Motivasi perubahan rendah           | What-if Simulation            |
| Sulit memahami kondisi masa depan    | Preventive action kurang terarah    | Future Health Simulation      |
| Rekomendasi terlalu umum             | Tindakan kurang spesifik            | Recommendation Engine         |
| Evidence tersebar                    | Sulit melakukan verifikasi          | Evidence Center               |
| Bahasa medis sulit dipahami          | Cognitive burden tinggi             | LLM-assisted Explanation      |
| Hasil AI berpotensi disalahartikan   | Safety risk                         | Disclaimer & Safety Guardrail |

---

## 7.11 User Persona to Product Feature Mapping

| Persona Need                   | Product Feature          | Priority     |
| ------------------------------ | ------------------------ | ------------ |
| Mengetahui kondisi lifestyle   | Health Profile           | Must Have    |
| Mengetahui health score        | Health Score             | Must Have    |
| Mengetahui lifestyle score     | Lifestyle Score          | Must Have    |
| Mengetahui estimasi risiko     | Risk Estimation          | Must Have    |
| Mengetahui faktor penyebab     | Explainable AI           | Must Have    |
| Mencoba perubahan lifestyle    | What-if Simulation       | Must Have    |
| Melihat proyeksi perubahan     | Future Health Simulation | Must Have    |
| Mendapatkan tindakan preventif | Recommendation Engine    | Must Have    |
| Memahami hasil AI              | LLM-assisted Explanation | Should Have  |
| Memeriksa sumber evidence      | Evidence Center / RAG    | Should Have  |
| Diagnosis penyakit             | Clinical Diagnosis       | Out of Scope |
| Resep obat                     | Medication Prescription  | Out of Scope |
| Emergency response             | Emergency System         | Out of Scope |

---

## 7.12 Key User Scenario

### Scenario 1 — Initial Health Assessment

**Actor:** Preventive Health Seeker

**Goal:** Mengetahui kondisi lifestyle dan estimasi risiko kesehatan.

Flow:

```text
User membuka HELIORA
      ↓
Membaca disclaimer
      ↓
Memberikan consent
      ↓
Mengisi health profile
      ↓
Sistem melakukan risk estimation
      ↓
Dashboard menampilkan:
- Health Score
- Lifestyle Score
- Risk Estimation
      ↓
User melihat faktor yang paling berpengaruh
```

Expected Outcome:

Pengguna mendapatkan pemahaman awal mengenai kondisi lifestyle dan estimasi risiko.

---

### Scenario 2 — What-if Simulation

**Actor:** Preventive Health Seeker

**Goal:** Mengetahui dampak perubahan lifestyle.

Flow:

```text
User melihat kondisi saat ini
      ↓
Membuka What-if Simulation
      ↓
Mengubah parameter
      ↓
Sleep:
6 jam → 7 jam
      ↓
Physical Activity:
60 menit → 150 menit/minggu
      ↓
Weight:
+/- perubahan tertentu
      ↓
Model melakukan re-run
      ↓
Risk Estimation berubah
      ↓
User membandingkan:
Current vs Simulated
```

Expected Outcome:

Pengguna memahami bahwa perubahan lifestyle dapat memengaruhi estimasi risiko berdasarkan model yang digunakan.

---

### Scenario 3 — Evidence Exploration

**Actor:** Health-Conscious Planner

**Goal:** Memahami dasar rekomendasi.

Flow:

```text
User menerima recommendation
      ↓
User memilih "Why?"
      ↓
HELIORA mengambil evidence
      ↓
RAG mencari sumber relevan
      ↓
LLM menyusun explanation
      ↓
User melihat:
- Explanation
- Source
- Evidence
- Context
```

Expected Outcome:

Pengguna dapat memahami alasan rekomendasi dan melakukan verifikasi terhadap sumber yang digunakan.

---

## 7.13 Persona Success Indicators

Persona dianggap berhasil dilayani apabila pengguna dapat:

- memahami kondisi lifestyle;
- memahami estimasi risiko;
- mengetahui faktor yang paling berpengaruh;
- mencoba perubahan lifestyle;
- memahami hasil simulasi;
- memperoleh rekomendasi preventif;
- memahami alasan rekomendasi;
- mengakses evidence;
- membedakan estimasi AI dengan diagnosis medis.

---

## 7.14 Persona Design Principles

Seluruh fitur HELIORA harus mempertimbangkan prinsip berikut.

### 1. Personal but Not Diagnostic

Informasi harus personal berdasarkan input pengguna, tetapi tidak boleh dikomunikasikan sebagai diagnosis.

### 2. Explainable by Default

Hasil AI harus dapat dijelaskan dengan bahasa yang dapat dipahami pengguna non-medis.

### 3. Actionable

Insight harus dapat diterjemahkan menjadi tindakan preventif yang realistis.

### 4. Evidence-Based

Rekomendasi dan penjelasan kesehatan harus memiliki dasar evidence yang dapat diverifikasi.

### 5. Non-Alarming

Sistem harus menghindari penyampaian hasil yang dapat menimbulkan kepanikan atau false certainty.

### 6. User-Controlled Exploration

Pengguna harus dapat mengeksplorasi skenario perubahan lifestyle tanpa merasa bahwa sistem menentukan keputusan medis untuk mereka.

### 7. Transparent

HELIORA harus menjelaskan:

- dari mana hasil berasal;
- faktor apa yang memengaruhi hasil;
- keterbatasan model;
- batasan simulasi;
- sumber evidence.

---

## 7.15 Persona Assumptions

Persona HELIORA dibangun berdasarkan beberapa asumsi produk:

1. Pengguna memiliki akses terhadap perangkat digital.
2. Pengguna mampu mengisi data lifestyle dasar.
3. Pengguna tertarik terhadap preventive health.
4. Pengguna tidak membutuhkan diagnosis klinis melalui HELIORA.
5. Pengguna lebih mudah memahami informasi melalui visualisasi dan bahasa sederhana.
6. Pengguna memiliki kebutuhan untuk memahami dampak perubahan lifestyle.
7. Evidence yang transparan dapat meningkatkan trust terhadap rekomendasi.
8. Simulasi interaktif dapat meningkatkan engagement terhadap preventive health.
9. Pengguna memahami bahwa hasil HELIORA merupakan estimasi, bukan diagnosis.
10. Pengguna bersedia memberikan data lifestyle setelah memperoleh informasi consent yang jelas.

---

## 7.16 Persona Limitations

Persona bukan representasi seluruh populasi Indonesia.

Perbedaan berikut dapat memengaruhi kebutuhan pengguna:

- usia;
- jenis kelamin;
- tingkat pendidikan;
- literasi kesehatan;
- literasi digital;
- kondisi sosial ekonomi;
- kebiasaan lifestyle;
- akses terhadap layanan kesehatan;
- kondisi kesehatan aktual.

Oleh karena itu, persona digunakan sebagai alat untuk memandu product design dan bukan sebagai representasi klinis atau statistik seluruh pengguna Indonesia.

---

## 7.17 Final Primary Persona Statement

Primary persona HELIORA ditetapkan sebagai:

> **Individu usia produktif yang memiliki akses terhadap teknologi digital, memiliki awareness terhadap kesehatan tetapi membutuhkan insight yang lebih personal untuk memahami hubungan antara lifestyle saat ini dengan estimasi risiko kesehatan di masa depan.**

Pengguna tersebut membutuhkan pengalaman yang memungkinkan mereka:

```text
Understand
    ↓
Explain
    ↓
Simulate
    ↓
Compare
    ↓
Act
    ↓
Verify
```

Alur tersebut menjadi dasar bagi desain pengalaman pengguna HELIORA dan akan digunakan sebagai acuan dalam penyusunan **User Journey, Functional Requirements, AI Features, dan Acceptance Criteria** pada bab berikutnya.

---

## 7.18 User Persona Success Criteria

BAB User Persona dianggap selesai apabila:

- [ ] Primary persona telah ditentukan.
- [ ] Secondary persona telah ditentukan.
- [ ] Excluded persona telah ditentukan.
- [ ] User goals telah didefinisikan.
- [ ] User needs telah didefinisikan.
- [ ] User pain points telah didefinisikan.
- [ ] User motivation telah didefinisikan.
- [ ] Persona telah dipetakan dengan product features.
- [ ] User scenario utama telah ditentukan.
- [ ] Persona assumptions telah didokumentasikan.
- [ ] Persona limitations telah didokumentasikan.
- [ ] Persona selaras dengan Product Vision.
- [ ] Persona selaras dengan Problem Statement.
- [ ] Persona selaras dengan MVP Scope.

---

# 8. User Journey

## 8.1 Overview

User Journey HELIORA menggambarkan perjalanan pengguna sejak pertama kali mengenal dan menggunakan platform hingga memperoleh insight kesehatan, mengeksplorasi perubahan lifestyle, dan mendapatkan rekomendasi preventif berbasis evidence.

Perjalanan utama pengguna dirancang untuk menjawab tiga kebutuhan utama:

1. memahami kondisi lifestyle saat ini;
2. memahami faktor yang berkontribusi terhadap estimasi risiko kesehatan;
3. mengeksplorasi bagaimana perubahan lifestyle dapat memengaruhi estimasi risiko di masa depan.

Secara umum, user journey HELIORA adalah:

```text
Landing Page
     ↓
Onboarding & Consent
     ↓
Health Profile Input
     ↓
Health Assessment
     ↓
Personalized Health Dashboard
     ↓
Risk Estimation
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
Preventive Action
```

---

## 8.2 User Journey Goal

User journey HELIORA memiliki tujuan untuk mengubah pengalaman pengguna dari sekadar menerima informasi kesehatan menjadi proses eksplorasi kesehatan yang lebih personal.

### Current Experience

```text
Mencari informasi kesehatan
        ↓
Membaca informasi umum
        ↓
Tidak mengetahui relevansi terhadap diri sendiri
        ↓
Sulit menentukan prioritas
        ↓
Tidak dapat melihat dampak perubahan
```

### Desired Experience

```text
Mengisi kondisi lifestyle
        ↓
Memahami estimasi risiko
        ↓
Mengetahui faktor yang berpengaruh
        ↓
Mencoba perubahan lifestyle
        ↓
Melihat perubahan estimasi risiko
        ↓
Mendapatkan rekomendasi
        ↓
Memeriksa evidence
        ↓
Mengambil tindakan preventif
```

---

## 8.3 Main User Journey

### Stage 1 — Discovery

Pengguna pertama kali mengetahui HELIORA melalui landing page atau media komunikasi produk.

Tujuan tahap ini adalah memberikan pemahaman mengenai:

- apa itu HELIORA;
- masalah yang diselesaikan;
- manfaat utama produk;
- konsep preventive health;
- Future Health Simulation;
- What-if Simulation;
- batasan bahwa HELIORA bukan alat diagnosis medis.

### User Goal

Pengguna ingin mengetahui apakah HELIORA dapat membantu memahami kondisi kesehatan berbasis lifestyle.

### System Response

Sistem menampilkan informasi singkat mengenai:

- value proposition;
- fitur utama;
- manfaat preventive health;
- disclaimer medis.

### Expected Outcome

Pengguna memahami tujuan HELIORA dan melanjutkan ke proses assessment.

---

## 8.4 Stage 2 — Onboarding & Consent

Sebelum memasukkan data kesehatan, pengguna melewati onboarding dan memberikan consent.

### User Action

Pengguna:

1. membaca informasi penggunaan data;
2. memahami bahwa hasil merupakan estimasi;
3. memahami disclaimer medis;
4. memberikan persetujuan;
5. melanjutkan ke health assessment.

### Data Privacy Principle

Data pengguna harus diperlakukan sebagai data sensitif.

Pada MVP, pendekatan yang digunakan adalah:

- meminta consent sebelum assessment;
- meminimalkan data yang dikumpulkan;
- tidak meminta data yang tidak diperlukan untuk fitur MVP;
- menggunakan data secara terbatas untuk kebutuhan assessment;
- memberikan informasi mengenai penggunaan data kepada pengguna.

### Medical Disclaimer

HELIORA harus memberikan informasi bahwa:

> HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi dokter.

### Expected Outcome

Pengguna memahami batasan produk dan memberikan consent untuk melanjutkan.

---

## 8.5 Stage 3 — Health Profile Input

Setelah onboarding, pengguna mengisi health profile.

Tujuan tahap ini adalah mengumpulkan informasi lifestyle yang diperlukan oleh Preventive Lifestyle Risk Engine.

### Required Input

Data utama yang digunakan:

| Data              | Description              |
| ----------------- | ------------------------ |
| Age               | Usia pengguna            |
| Gender            | Jenis kelamin            |
| Height            | Tinggi badan             |
| Weight            | Berat badan              |
| Physical Activity | Tingkat aktivitas fisik  |
| Sleep Duration    | Durasi tidur             |
| Smoking           | Status kebiasaan merokok |
| Family History    | Riwayat keluarga         |

### Optional Input

Apabila tersedia dan diperlukan dalam implementasi:

- stress level;
- waist circumference;
- blood pressure;
- blood sugar;
- cholesterol.

Namun, optional input tidak boleh menjadi dependency utama MVP apabila dapat meningkatkan kompleksitas dataset atau onboarding secara signifikan.

### UX Principle

Input harus:

- sederhana;
- mudah dipahami pengguna non-medis;
- menggunakan bahasa yang familiar;
- memiliki validasi input;
- menghindari form yang terlalu panjang.

### Expected Outcome

Sistem memiliki profile lifestyle yang cukup untuk menjalankan assessment.

---

## 8.6 Stage 4 — Health Assessment

Setelah health profile selesai, pengguna menjalankan assessment.

### System Process

```text
Health Profile
      ↓
Data Validation
      ↓
Feature Engineering
      ↓
Preventive Lifestyle Risk Engine
      ↓
Risk Estimation
      ↓
Health / Lifestyle Score
```

Sistem melakukan validasi terhadap input sebelum data diproses oleh model.

### Expected Outcome

Sistem menghasilkan:

- Health Score;
- Lifestyle Score;
- estimasi risiko kesehatan;
- faktor yang berkontribusi terhadap hasil.

---

## 8.7 Stage 5 — Personalized Health Dashboard

Setelah assessment selesai, pengguna diarahkan ke Personalized Health Dashboard.

Dashboard menjadi pusat informasi kesehatan pengguna.

### Dashboard Information

Dashboard dapat menampilkan:

1. Health Score;
2. Lifestyle Score;
3. estimated risk;
4. risk category;
5. faktor lifestyle utama;
6. rekomendasi prioritas;
7. akses ke simulation;
8. akses ke evidence.

### Conceptual Layout

```text
┌─────────────────────────────────────┐
│       PERSONAL HEALTH OVERVIEW      │
├─────────────────────────────────────┤
│ Health Score       Lifestyle Score  │
│      78                  72         │
├─────────────────────────────────────┤
│ Estimated Health Risk               │
│                                     │
│ Diabetes        Moderate            │
│ Hypertension    Low                 │
│ Cardiovascular  Moderate            │
├─────────────────────────────────────┤
│ Top Contributing Factors            │
│ • Physical Activity                 │
│ • Sleep Duration                    │
│ • BMI                               │
├─────────────────────────────────────┤
│ [Explore Simulation]                │
└─────────────────────────────────────┘
```

### Expected Outcome

Pengguna mendapatkan gambaran awal mengenai kondisi lifestyle dan estimasi risikonya.

---

## 8.8 Stage 6 — Risk Estimation

Pengguna dapat melihat hasil estimasi risiko dari Preventive Lifestyle Risk Engine.

### Output

MVP menargetkan tiga kategori estimasi risiko:

- Diabetes;
- Hypertension;
- Cardiovascular.

Hasil harus menggunakan istilah:

- estimated risk;
- risk level;
- risk score;

dan tidak menggunakan istilah yang dapat memberikan kesan diagnosis pasti.

### Example

```text
Estimated Diabetes Risk
Moderate

Estimated Hypertension Risk
Low

Estimated Cardiovascular Risk
Moderate
```

### Expected Outcome

Pengguna memahami kondisi estimasi risiko berdasarkan data lifestyle yang diberikan.

---

## 8.9 Stage 7 — Explainable AI

Setelah melihat hasil risiko, pengguna dapat mengetahui alasan yang memengaruhi hasil tersebut.

Explainable AI digunakan untuk menjawab pertanyaan:

> "Mengapa hasil saya seperti ini?"

### Example

```text
Factors influencing your estimated risk:

1. Physical Activity
   Low activity contributes to higher estimated risk.

2. Sleep Duration
   Sleep duration below the recommended range
   contributes to the current lifestyle score.

3. BMI
   Current BMI contributes to the estimated risk.
```

### Technical Approach

SHAP menjadi pendekatan utama yang direkomendasikan untuk menjelaskan kontribusi feature terhadap output model.

### Expected Outcome

Pengguna tidak hanya menerima skor, tetapi memahami faktor yang berkontribusi terhadap hasil.

---

## 8.10 Stage 8 — Future Health Simulation

Future Health Simulation merupakan salah satu killer feature utama HELIORA.

Fitur ini memungkinkan pengguna mengeksplorasi kondisi estimasi kesehatan berdasarkan lifestyle saat ini dalam horizon waktu tertentu.

### Simulation Horizon

MVP menggunakan beberapa horizon:

- 30 hari;
- 90 hari;
- 180 hari.

### Concept

```text
Current Lifestyle
       ↓
Current Risk
       ↓
Projection
       ↓
30 Days
       ↓
90 Days
       ↓
180 Days
```

### Important Boundary

Simulation tidak boleh dipresentasikan sebagai prediksi medis yang pasti.

Simulation merupakan proyeksi berbasis model dan perubahan input lifestyle.

### Example

```text
Current
Lifestyle Score: 68

Projected Scenario

30 Days  → 70
90 Days  → 73
180 Days → 76
```

### Expected Outcome

Pengguna memahami bahwa kebiasaan saat ini dapat memiliki konsekuensi terhadap estimasi kondisi kesehatan di masa depan.

---

## 8.11 Stage 9 — What-if Simulation

What-if Simulation merupakan killer feature kedua HELIORA.

Fitur ini memungkinkan pengguna mengubah parameter lifestyle dan melihat bagaimana perubahan tersebut memengaruhi hasil estimasi.

### Adjustable Parameters

MVP memprioritaskan:

- sleep duration;
- physical activity;
- weight.

Parameter lain dapat ditambahkan apabila tidak meningkatkan kompleksitas MVP secara signifikan.

### Example

```text
Current Scenario

Sleep:
5.5 hours

Physical Activity:
60 minutes/week

Weight:
82 kg
```

Pengguna kemudian mengubah:

```text
Sleep:
7.5 hours

Physical Activity:
150 minutes/week

Weight:
78 kg
```

Sistem melakukan:

```text
Modified Input
      ↓
Re-run Risk Engine
      ↓
New Risk Estimation
      ↓
Compare with Current State
```

### Expected Output

```text
Current Estimated Risk
Moderate

Simulated Estimated Risk
Low

Change
↓ 12%
```

Angka perubahan harus diperlakukan sebagai hasil simulasi model, bukan jaminan perubahan kondisi medis.

---

## 8.12 Stage 10 — Recommendation

Setelah pengguna memahami hasil dan simulation, sistem memberikan rekomendasi preventif.

Recommendation Engine menggunakan Rule Engine, bukan LLM sebagai sumber keputusan utama.

### Example Rules

```text
IF Sleep < 6 hours
THEN
Recommend sleep improvement toward 7–9 hours
```

```text
IF Physical Activity is low
THEN
Recommend increasing activity toward
the guideline-supported target
```

```text
IF Smoking = Active
THEN
Recommend smoking cessation support
```

### Recommendation Priority

Rekomendasi harus diprioritaskan berdasarkan faktor yang paling relevan terhadap profile pengguna.

### Expected Outcome

Pengguna memperoleh tindakan preventif yang lebih spesifik dibandingkan sekadar informasi kesehatan umum.

---

## 8.13 Stage 11 — Evidence Center

Setiap rekomendasi atau penjelasan penting dapat dikaitkan dengan evidence.

Evidence Center bertujuan menjawab:

> "Dari mana rekomendasi ini berasal?"

### Evidence Source

Knowledge Base RAG menggunakan sumber terpercaya seperti:

- WHO;
- Kementerian Kesehatan RI;
- PERKENI;
- PERKI;
- CDC;
- jurnal ilmiah yang relevan.

### Evidence Flow

```text
Recommendation
      ↓
Evidence Retrieval
      ↓
Relevant Source
      ↓
Human-Friendly Explanation
      ↓
Evidence Reference
```

### Example

```text
Recommendation:
Increase physical activity.

Why?
Regular physical activity is associated with
better health outcomes and reduced risk of
several non-communicable diseases.

Evidence:
WHO Physical Activity Guidelines

Evidence Strength:
High
```

### Expected Outcome

Pengguna dapat memahami dasar rekomendasi dan meningkatkan trust terhadap sistem.

---

## 8.14 Stage 12 — LLM-assisted Explanation

LLM digunakan setelah hasil risk estimation, explanation, simulation, dan recommendation tersedia.

LLM tidak digunakan untuk menghitung risiko.

### LLM Responsibilities

LLM digunakan untuk:

- menyusun penjelasan natural language;
- menyederhanakan istilah teknis;
- merangkum evidence;
- membuat hasil lebih mudah dipahami.

### AI Boundary

```text
ML
↓
Risk Estimation

SHAP
↓
Feature Explanation

Rule Engine
↓
Recommendation

RAG
↓
Evidence Retrieval

LLM
↓
Natural Language Explanation
```

Dengan demikian, LLM berperan sebagai explanation layer, bukan decision layer.

---

## 8.15 Stage 13 — Safety Guardrail

HELIORA harus memiliki safety guardrail untuk mencegah hasil sistem ditafsirkan sebagai diagnosis atau pengganti tenaga medis.

### Safety Rule

Apabila estimated risk melewati threshold yang telah ditentukan, sistem dapat menampilkan pesan:

```text
Your estimated risk is elevated.

This result is not a medical diagnosis.
Consider discussing your health condition
with a qualified healthcare professional.
```

### Safety Principles

Sistem tidak boleh:

- memberikan diagnosis;
- memberikan resep;
- menentukan treatment;
- menyarankan penghentian obat;
- menggantikan konsultasi dokter.

### Expected Outcome

Pengguna memahami bahwa HELIORA merupakan preventive health intelligence tool.

---

## 8.16 Complete User Journey

Keseluruhan perjalanan pengguna dapat dirangkum sebagai berikut:

```text
                    DISCOVERY
                        │
                        ▼
              Landing / Introduction
                        │
                        ▼
               Onboarding & Consent
                        │
                        ▼
               Health Profile Input
                        │
                        ▼
                 Health Assessment
                        │
                        ▼
           Personalized Health Dashboard
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       Risk Estimation       Health / Lifestyle
             │                    Score
             └──────────┬──────────┘
                        ▼
                 Explainable AI
                        │
                        ▼
             "Why is my risk like this?"
                        │
                        ▼
            Future Health Simulation
                        │
                        ▼
               What-if Simulation
                        │
                        ▼
             Recommendation Engine
                        │
                        ▼
                 Evidence Center
                        │
                        ▼
             LLM-assisted Explanation
                        │
                        ▼
                Safety Guardrail
                        │
                        ▼
               Preventive Action
```

---

## 8.17 Key User Journey Moments

Beberapa titik dalam perjalanan pengguna menjadi bagian penting dari product experience HELIORA.

### Moment 1 — Personal Insight

Pengguna pertama kali melihat bahwa informasi kesehatan dapat dikaitkan dengan kondisi lifestyle mereka sendiri.

### Moment 2 — Explainability

Pengguna mengetahui faktor apa yang paling berkontribusi terhadap hasil estimasi.

### Moment 3 — Future Visualization

Pengguna dapat melihat bagaimana kondisi lifestyle saat ini dapat diproyeksikan dalam beberapa horizon waktu.

### Moment 4 — What-if Exploration

Pengguna dapat bereksperimen dengan perubahan lifestyle dan melihat perubahan estimasi risiko.

### Moment 5 — Evidence Verification

Pengguna dapat memeriksa sumber evidence yang mendukung rekomendasi.

### Moment 6 — Preventive Action

Pengguna memperoleh rekomendasi yang dapat dijadikan titik awal untuk perubahan lifestyle.

---

## 8.18 User Journey Success Criteria

User Journey dianggap berhasil apabila pengguna dapat:

- menyelesaikan onboarding dan consent;
- mengisi health profile;
- memperoleh Health Score dan Lifestyle Score;
- melihat estimated health risk;
- memahami faktor yang berkontribusi melalui Explainable AI;
- menjalankan Future Health Simulation;
- menjalankan What-if Simulation;
- memperoleh rekomendasi preventif;
- melihat evidence yang mendukung rekomendasi;
- memahami bahwa hasil bukan diagnosis medis;
- menggunakan hasil sebagai dasar untuk mempertimbangkan tindakan preventif.

---

## 8.19 UX Principles

User Journey HELIORA harus mengikuti prinsip berikut:

### 1. Personal

Informasi harus relevan dengan kondisi lifestyle pengguna.

### 2. Explainable

Setiap hasil penting harus dapat dijelaskan secara sederhana.

### 3. Actionable

Insight harus dapat diterjemahkan menjadi tindakan preventif.

### 4. Evidence-Based

Rekomendasi penting harus dapat ditelusuri ke evidence.

### 5. Safe

Sistem harus membatasi interpretasi hasil agar tidak dianggap sebagai diagnosis.

### 6. Simple

Pengguna non-medis harus dapat memahami alur tanpa pengetahuan teknis atau medis khusus.

### 7. Interactive

Pengguna harus dapat mengeksplorasi perubahan lifestyle melalui What-if Simulation.

---

## 8.20 User Journey Boundary

User Journey HELIORA berakhir pada pemberian insight dan rekomendasi preventif.

HELIORA tidak mengontrol tindakan medis pengguna setelah rekomendasi diberikan.

```text
HELIORA
   ↓
Understand
   ↓
Explore
   ↓
Simulate
   ↓
Recommend
   ↓
Evidence
   ↓
Preventive Action
```

Tindakan kesehatan selanjutnya tetap menjadi keputusan pengguna dan, apabila diperlukan, tenaga kesehatan.

---

## 8.21 Chapter Summary

User Journey HELIORA dirancang untuk mengubah pengalaman preventive health dari pendekatan informasi umum menjadi pengalaman yang personal, explainable, interactive, dan evidence-based.

Alur utama pengguna adalah:

```text
Input
  ↓
Understand
  ↓
Estimate
  ↓
Explain
  ↓
Simulate
  ↓
Explore
  ↓
Recommend
  ↓
Verify
  ↓
Act
```

Alur tersebut menjadi dasar untuk penyusunan **Functional Requirements pada BAB 9**, khususnya requirement untuk:

- onboarding;
- health profile;
- dashboard;
- risk estimation;
- Explainable AI;
- Future Health Simulation;
- What-if Simulation;
- Recommendation Engine;
- Evidence Center;
- LLM-assisted Explanation;
- safety guardrail.

---

# BAB 9 — Functional Requirements

## 9.1 Overview

Functional Requirements mendefinisikan kapabilitas yang wajib tersedia pada MVP HELIORA untuk memenuhi kebutuhan pengguna dan mencapai Product Vision.

Functional Requirements diturunkan dari:

- Problem Statement;
- Product Vision & Objectives;
- Scope MVP;
- User Persona;
- User Journey;
- AI Architecture;
- Business Rules;
- Medical & AI Safety Boundary.

Secara umum, alur fungsional utama HELIORA adalah:

```text
Onboarding & Consent
        ↓
Health Profile
        ↓
Personal Health Assessment
        ↓
Risk Estimation
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
Preventive Action
```

HELIORA harus memastikan bahwa setiap tahap menghasilkan informasi yang dapat dipahami dan dapat digunakan sebagai dasar untuk tahap berikutnya.

---

## 9.2 Functional Requirement Priority

Prioritas Functional Requirements menggunakan kategori berikut:

| Priority    | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| Must Have   | Wajib tersedia pada MVP                                         |
| Should Have | Penting dan diimplementasikan apabila kapasitas memungkinkan    |
| Could Have  | Fitur tambahan yang tidak menghambat MVP apabila tidak tersedia |
| Won't Have  | Tidak termasuk dalam MVP                                        |

Untuk MVP kompetisi, fokus utama diberikan kepada fitur **Must Have** yang secara langsung mendukung killer feature HELIORA.

---

## 9.3 Authentication & Account Management

### FR-001 — User Registration

**Priority:** Must Have

Sistem harus menyediakan mekanisme registrasi akun bagi pengguna.

#### Input

- Nama;
- Email;
- Password;
- Konfirmasi password.

#### Process

1. Pengguna mengisi data registrasi.
2. Sistem melakukan validasi input.
3. Sistem memeriksa apakah email telah digunakan.
4. Password disimpan menggunakan hashing.
5. Sistem membuat akun pengguna.

#### Output

Pengguna berhasil memiliki akun dan dapat melakukan login.

---

### FR-002 — User Login

**Priority:** Must Have

Sistem harus memungkinkan pengguna melakukan autentikasi menggunakan akun yang telah terdaftar.

#### Input

- Email;
- Password.

#### Process

1. Sistem menerima kredensial.
2. Sistem melakukan validasi.
3. Sistem memverifikasi password.
4. Sistem membuat session autentikasi.

#### Output

Pengguna diarahkan ke dashboard HELIORA.

---

### FR-003 — User Logout

**Priority:** Must Have

Sistem harus menyediakan fungsi logout untuk mengakhiri session pengguna.

---

## 9.4 Onboarding & Consent

### FR-004 — Health Data Consent

**Priority:** Must Have

Sistem harus menampilkan consent sebelum pengguna memasukkan data kesehatan dan lifestyle.

Consent harus menjelaskan bahwa:

- data digunakan untuk menghasilkan estimasi dan simulasi;
- hasil bukan diagnosis medis;
- hasil bukan pengganti konsultasi dokter;
- data digunakan sesuai tujuan aplikasi;
- pengguna dapat melanjutkan setelah memberikan persetujuan.

#### Acceptance Condition

Pengguna tidak dapat melanjutkan ke health assessment sebelum memberikan consent.

---

### FR-005 — Medical Disclaimer

**Priority:** Must Have

Sistem harus menampilkan disclaimer bahwa HELIORA bukan alat diagnosis medis.

Pesan utama:

> HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan.

Disclaimer harus dapat ditemukan pada:

- onboarding;
- halaman hasil assessment;
- halaman simulation;
- halaman recommendation.

---

## 9.5 Health Profile

### FR-006 — Health Profile Input

**Priority:** Must Have

Sistem harus menyediakan formulir untuk memasukkan data dasar kesehatan dan lifestyle pengguna.

### Required Data

| Field             | Description               |
| ----------------- | ------------------------- |
| Age               | Usia pengguna             |
| Gender            | Jenis kelamin             |
| Height            | Tinggi badan              |
| Weight            | Berat badan               |
| Physical Activity | Tingkat aktivitas fisik   |
| Sleep Duration    | Durasi tidur              |
| Smoking Status    | Status merokok            |
| Family History    | Riwayat penyakit keluarga |

### Optional Data

| Field               | Description      |
| ------------------- | ---------------- |
| Stress Level        | Tingkat stres    |
| Waist Circumference | Lingkar pinggang |
| Blood Pressure      | Tekanan darah    |
| Blood Sugar         | Gula darah       |
| Cholesterol         | Kolesterol       |

Untuk MVP, optional data tidak boleh menjadi dependency utama model apabila data tersebut tidak tersedia secara konsisten pada dataset training.

---

### FR-007 — Input Validation

**Priority:** Must Have

Sistem harus melakukan validasi terhadap data yang dimasukkan pengguna.

Contoh validasi:

- Age harus berada pada rentang yang valid;
- Height harus lebih besar dari 0;
- Weight harus lebih besar dari 0;
- Sleep Duration harus berada pada rentang yang logis;
- Physical Activity harus memiliki nilai yang valid;
- Smoking Status harus berasal dari pilihan yang tersedia.

Sistem harus menampilkan pesan error apabila input tidak valid.

---

### FR-008 — BMI Calculation

**Priority:** Must Have

Sistem harus menghitung Body Mass Index berdasarkan tinggi dan berat badan pengguna.

BMI digunakan sebagai salah satu indikator lifestyle dan risk assessment.

BMI tidak boleh ditampilkan sebagai diagnosis penyakit.

---

## 9.6 Health Score

### FR-009 — Health Score Calculation

**Priority:** Must Have

Sistem harus menghitung Health Score berdasarkan kombinasi indikator lifestyle yang telah ditentukan.

Health Score digunakan sebagai indikator ringkas untuk membantu pengguna memahami kondisi lifestyle mereka.

Perhitungan menggunakan weighted scoring yang telah ditentukan dalam AI/Product Specification.

Contoh struktur:

```text
Health Score
    ├── BMI
    ├── Physical Activity
    ├── Sleep
    ├── Smoking
    └── Other Lifestyle Factors
```

Bobot final harus ditetapkan sebelum implementasi dan dicatat sebagai bagian dari konfigurasi sistem.

---

### FR-010 — Lifestyle Score Calculation

**Priority:** Must Have

Sistem harus menghasilkan Lifestyle Score yang menggambarkan kualitas faktor lifestyle pengguna.

Lifestyle Score tidak boleh diposisikan sebagai diagnosis medis.

Output harus menggunakan bahasa yang mudah dipahami pengguna.

Contoh:

```text
Lifestyle Score: 72/100

Status:
Good

Area to Improve:
Sleep Duration
Physical Activity
```

---

## 9.7 Preventive Lifestyle Risk Engine

### FR-011 — Risk Estimation

**Priority:** Must Have

Sistem harus menggunakan Preventive Lifestyle Risk Engine untuk menghasilkan estimasi risiko berdasarkan data lifestyle pengguna.

Output MVP:

- Estimated Diabetes Risk;
- Estimated Hypertension Risk;
- Estimated Cardiovascular Risk.

Output harus berupa **risk estimation**, bukan diagnosis.

---

### FR-012 — Risk Score Output

**Priority:** Must Have

Sistem harus menampilkan hasil estimasi risiko dalam format yang mudah dipahami.

Contoh:

```text
Diabetes Risk
Estimated Risk: 18%

Hypertension Risk
Estimated Risk: 24%

Cardiovascular Risk
Estimated Risk: 15%
```

Sistem harus menggunakan label yang tidak menimbulkan kesan diagnosis.

Contoh label:

- Lower Estimated Risk;
- Moderate Estimated Risk;
- Higher Estimated Risk.

---

### FR-013 — Model Prediction Response

**Priority:** Must Have

Preventive Lifestyle Risk Engine harus menerima input health profile dan mengembalikan hasil estimasi dalam struktur yang konsisten.

Contoh:

```json
{
  "diabetes_risk": 0.18,
  "hypertension_risk": 0.24,
  "cardiovascular_risk": 0.15
}
```

Struktur aktual dapat disesuaikan dengan implementasi backend.

---

## 9.8 Explainable AI

### FR-014 — Risk Explanation

**Priority:** Must Have

Sistem harus menyediakan penjelasan mengenai faktor yang paling berkontribusi terhadap hasil estimasi risiko.

Explainable AI menggunakan SHAP sebagai pendekatan utama.

Contoh faktor:

```text
Main Risk Contributors

1. BMI
2. Physical Activity
3. Sleep Duration
4. Smoking Status
5. Family History
```

---

### FR-015 — Feature Contribution

**Priority:** Must Have

Sistem harus menunjukkan apakah suatu faktor memberikan kontribusi relatif lebih tinggi atau lebih rendah terhadap estimasi model.

Contoh:

```text
BMI
Higher contribution to estimated risk

Physical Activity
Lower contribution to estimated risk

Sleep Duration
Moderate contribution to estimated risk
```

Penjelasan harus menghindari klaim sebab-akibat medis yang tidak didukung model atau evidence.

---

### FR-016 — Explainability Visualization

**Priority:** Should Have

Sistem dapat menampilkan visualisasi sederhana mengenai faktor yang paling berpengaruh.

Visualisasi harus diprioritaskan pada:

- top contributing factors;
- positive contribution;
- negative contribution.

Tujuannya bukan untuk menampilkan kompleksitas model, tetapi membantu pengguna memahami hasil.

---

## 9.9 Future Health Simulation

### FR-017 — Future Health Simulation

**Priority:** Must Have

Sistem harus menyediakan simulasi kondisi estimasi kesehatan berdasarkan lifestyle pengguna saat ini.

Simulation horizon MVP:

- 30 hari;
- 90 hari;
- 180 hari.

Simulation tidak boleh diklaim sebagai prediksi medis pasti.

---

### FR-018 — Baseline Scenario

**Priority:** Must Have

Sistem harus menghasilkan baseline scenario berdasarkan kondisi lifestyle pengguna saat ini.

Contoh:

```text
Current Lifestyle
        ↓
Current Risk
        ↓
30 Days
        ↓
90 Days
        ↓
180 Days
```

Baseline digunakan sebagai pembanding terhadap What-if Simulation.

---

### FR-019 — Simulation Projection

**Priority:** Must Have

Sistem harus menghasilkan perubahan indikator atau estimasi risiko berdasarkan skenario lifestyle yang digunakan.

Pendekatan MVP:

```text
Current User Input
        ↓
Modify Lifestyle Parameters
        ↓
Re-run Risk Model
        ↓
Compare Result
```

Simulation merupakan proyeksi berbasis model dan bukan prediksi medis definitif.

---

## 9.10 What-if Simulation

### FR-020 — Lifestyle Parameter Adjustment

**Priority:** Must Have

Pengguna harus dapat mengubah parameter lifestyle untuk mengeksplorasi skenario alternatif.

Parameter utama:

- Sleep Duration;
- Physical Activity;
- Weight.

Parameter tambahan dapat ditambahkan apabila model mendukungnya.

---

### FR-021 — Real-time Risk Recalculation

**Priority:** Must Have

Setelah pengguna mengubah parameter What-if, sistem harus menghitung kembali estimasi risiko.

Contoh:

```text
Current Scenario

Sleep: 5 hours
Activity: Low
Weight: 80 kg

        ↓

What-if Scenario

Sleep: 7 hours
Activity: Moderate
Weight: 75 kg

        ↓

Recalculate

        ↓

Compare Risk
```

---

### FR-022 — Scenario Comparison

**Priority:** Must Have

Sistem harus membandingkan kondisi saat ini dengan kondisi What-if.

Contoh:

| Indicator      | Current |  What-if |
| -------------- | ------: | -------: |
| Sleep          |   5 hrs |    7 hrs |
| Weight         |   80 kg |    75 kg |
| Activity       |     Low | Moderate |
| Estimated Risk |     24% |      18% |

---

### FR-023 — Simulation Feedback

**Priority:** Must Have

Sistem harus memberikan feedback terhadap perubahan skenario.

Contoh:

```text
Your simulated lifestyle change
shows a lower estimated risk
compared with your current profile.
```

Feedback harus menggunakan istilah **estimated** atau **simulated** untuk mencegah interpretasi sebagai kepastian medis.

---

## 9.11 Recommendation Engine

### FR-024 — Personalized Recommendation

**Priority:** Must Have

Sistem harus menghasilkan rekomendasi preventif berdasarkan kondisi lifestyle pengguna.

Recommendation Engine menggunakan Rule Engine, bukan LLM sebagai sumber utama keputusan.

---

### FR-025 — Lifestyle Rule Evaluation

**Priority:** Must Have

Sistem harus mengevaluasi kondisi pengguna terhadap rule yang telah ditentukan.

Contoh:

```text
IF sleep_duration < threshold
THEN recommend improved sleep habit
```

Contoh rule:

| Condition                | Recommendation                         |
| ------------------------ | -------------------------------------- |
| Sleep rendah             | Tingkatkan durasi tidur                |
| Physical Activity rendah | Tingkatkan aktivitas fisik             |
| BMI tinggi               | Fokus pada pengelolaan berat badan     |
| Smoking aktif            | Pertimbangkan program berhenti merokok |

Threshold final harus berasal dari guideline yang digunakan sebagai evidence.

---

### FR-026 — Recommendation Priority

**Priority:** Must Have

Sistem harus memprioritaskan rekomendasi berdasarkan faktor yang paling relevan terhadap kondisi pengguna.

Contoh:

```text
Your Top Priorities

1. Improve Sleep
2. Increase Physical Activity
3. Manage Body Weight
```

Tujuannya agar pengguna tidak menerima terlalu banyak rekomendasi sekaligus.

---

## 9.12 Evidence Center

### FR-027 — Evidence Retrieval

**Priority:** Must Have

Sistem harus dapat mengambil evidence yang relevan dari Knowledge Base.

Sumber utama:

- WHO;
- Kementerian Kesehatan RI;
- PERKENI;
- PERKI;
- CDC;
- jurnal ilmiah yang relevan.

---

### FR-028 — Evidence-backed Recommendation

**Priority:** Must Have

Rekomendasi yang membutuhkan dukungan evidence harus dapat dikaitkan dengan sumber yang relevan.

Contoh:

```text
Recommendation:
Increase physical activity.

Evidence:
WHO Physical Activity Guidelines

Evidence Strength:
Strong
```

---

### FR-029 — Evidence Detail

**Priority:** Should Have

Pengguna dapat membuka detail evidence untuk memahami:

- sumber;
- judul dokumen;
- organisasi;
- tahun publikasi;
- bagian yang relevan;
- ringkasan evidence.

---

## 9.13 LLM-assisted Explanation

### FR-030 — Natural Language Explanation

**Priority:** Must Have

LLM digunakan untuk mengubah hasil teknis menjadi penjelasan yang lebih mudah dipahami.

LLM dapat menerima:

```text
Risk Result
+
Explainable AI Factors
+
Recommendation
+
Retrieved Evidence
```

Kemudian menghasilkan:

```text
Human-Friendly Explanation
```

---

### FR-031 — LLM Safety Boundary

**Priority:** Must Have

LLM tidak boleh digunakan sebagai komponen utama untuk:

- menentukan diagnosis;
- menghasilkan risk score;
- menentukan clinical treatment;
- memberikan resep;
- menggantikan dokter.

LLM hanya berfungsi sebagai **explanation layer** setelah hasil model, rule engine, dan evidence tersedia.

---

### FR-032 — Evidence-aware Explanation

**Priority:** Must Have

LLM harus menggunakan evidence yang telah diambil oleh RAG sebagai konteks penjelasan.

Sistem harus menghindari pembuatan klaim kesehatan yang tidak memiliki dasar evidence.

---

## 9.14 Dashboard

### FR-033 — Personalized Health Dashboard

**Priority:** Must Have

Sistem harus menyediakan dashboard yang merangkum kondisi pengguna.

Dashboard minimal menampilkan:

- Health Score;
- Lifestyle Score;
- estimated diabetes risk;
- estimated hypertension risk;
- estimated cardiovascular risk;
- top risk contributors;
- top recommendations.

---

### FR-034 — Risk Overview

**Priority:** Must Have

Dashboard harus menyediakan ringkasan risiko yang dapat dipahami dalam waktu singkat.

Contoh:

```text
Your Health Overview

Health Score       72
Lifestyle Score    68

Diabetes Risk      Moderate
Hypertension Risk  Higher
Cardiovascular     Lower
```

---

## 9.15 Health Assessment History

### FR-035 — Assessment History

**Priority:** Should Have

Sistem dapat menyimpan hasil assessment pengguna untuk memungkinkan pengguna melihat perkembangan dari waktu ke waktu.

Data yang dapat disimpan:

- tanggal assessment;
- health score;
- lifestyle score;
- estimated risk;
- lifestyle profile.

---

### FR-036 — Simulation History

**Priority:** Could Have

Sistem dapat menyimpan skenario What-if yang pernah dibuat pengguna.

Contoh:

```text
Scenario:
Sleep 7 hours
Activity Moderate
Weight 75 kg

Estimated Result:
Lower risk than baseline
```

Fitur ini tidak boleh menghambat core MVP apabila waktu pengembangan terbatas.

---

## 9.16 Safety Guardrail

### FR-037 — Risk Threshold Warning

**Priority:** Must Have

Sistem harus memiliki safety rule apabila hasil estimasi melewati threshold yang telah ditentukan.

Contoh:

```text
Your estimated risk is relatively high
based on the information provided.

Consider discussing your health
with a qualified healthcare professional.
```

Pesan tidak boleh menyatakan bahwa pengguna memiliki penyakit tertentu.

---

### FR-038 — Medical Escalation Message

**Priority:** Must Have

Apabila kondisi memenuhi safety threshold, sistem harus memberikan arahan untuk berkonsultasi dengan tenaga kesehatan.

Sistem tidak boleh:

- mendiagnosis;
- memberikan resep;
- memberikan emergency treatment;
- menyatakan bahwa pengguna pasti memiliki penyakit.

---

## 9.17 Data Privacy & Consent

### FR-039 — Consent Recording

**Priority:** Must Have

Sistem harus mencatat bahwa pengguna telah memberikan consent sebelum health data diproses.

---

### FR-040 — User Data Protection

**Priority:** Must Have

Data pengguna harus diproses dan disimpan dengan mekanisme keamanan yang sesuai dengan kebutuhan MVP.

Minimal:

- password hashing;
- authentication;
- authorization;
- protected API;
- validasi input;
- session security.

---

## 9.18 Error Handling

### FR-041 — Invalid Input Handling

**Priority:** Must Have

Sistem harus memberikan feedback yang jelas apabila pengguna memasukkan data yang tidak valid.

---

### FR-042 — AI Service Failure Handling

**Priority:** Must Have

Apabila AI service gagal menghasilkan hasil, sistem tidak boleh menampilkan hasil yang tidak valid.

Sistem harus memberikan pesan seperti:

```text
We couldn't complete your assessment.
Please try again later.
```

---

### FR-043 — RAG/LLM Failure Handling

**Priority:** Must Have

Apabila LLM atau RAG tidak tersedia:

- hasil risk estimation tetap dapat ditampilkan;
- recommendation rule tetap dapat ditampilkan;
- sistem tidak boleh membuat evidence atau explanation palsu;
- pengguna diberi informasi bahwa explanation service sedang tidak tersedia.

---

## 9.19 Functional Flow

Alur fungsional utama MVP:

```text
User
 │
 ▼
Register / Login
 │
 ▼
Consent
 │
 ▼
Health Profile
 │
 ▼
Input Validation
 │
 ▼
BMI Calculation
 │
 ▼
Health Score + Lifestyle Score
 │
 ▼
Preventive Lifestyle Risk Engine
 │
 ▼
Risk Estimation
 │
 ├───────────────┐
 ▼               ▼
Explainable AI   Future Simulation
 │               │
 └───────┬───────┘
         ▼
    What-if Simulation
         │
         ▼
 Recommendation Engine
         │
         ▼
    Evidence Retrieval
         │
         ▼
    LLM Explanation
         │
         ▼
    Health Dashboard
         │
         ▼
 Preventive Action
```

---

## 9.20 Functional Requirement Summary

| Module         | Requirement                    | Priority    |
| -------------- | ------------------------------ | ----------- |
| Authentication | Registration                   | Must Have   |
| Authentication | Login                          | Must Have   |
| Authentication | Logout                         | Must Have   |
| Consent        | Health Data Consent            | Must Have   |
| Consent        | Medical Disclaimer             | Must Have   |
| Health Profile | Health Input                   | Must Have   |
| Health Profile | Input Validation               | Must Have   |
| Health Profile | BMI Calculation                | Must Have   |
| Health Score   | Health Score                   | Must Have   |
| Health Score   | Lifestyle Score                | Must Have   |
| Risk Engine    | Risk Estimation                | Must Have   |
| Risk Engine    | Risk Output                    | Must Have   |
| Explainable AI | Risk Explanation               | Must Have   |
| Explainable AI | Feature Contribution           | Must Have   |
| Simulation     | Future Health Simulation       | Must Have   |
| Simulation     | Baseline Scenario              | Must Have   |
| Simulation     | Projection                     | Must Have   |
| What-if        | Parameter Adjustment           | Must Have   |
| What-if        | Risk Recalculation             | Must Have   |
| What-if        | Scenario Comparison            | Must Have   |
| Recommendation | Rule Evaluation                | Must Have   |
| Recommendation | Personalized Recommendation    | Must Have   |
| Evidence       | Evidence Retrieval             | Must Have   |
| Evidence       | Evidence-backed Recommendation | Must Have   |
| LLM            | Natural Language Explanation   | Must Have   |
| LLM            | Evidence-aware Explanation     | Must Have   |
| Dashboard      | Health Overview                | Must Have   |
| Safety         | Risk Threshold Warning         | Must Have   |
| Privacy        | Consent Recording              | Must Have   |
| Privacy        | Data Protection                | Must Have   |
| Error Handling | AI Failure Handling            | Must Have   |
| History        | Assessment History             | Should Have |
| History        | Simulation History             | Could Have  |

---

## 9.21 MVP Functional Boundary

Untuk menjaga implementasi tetap realistis, MVP HELIORA memprioritaskan functional requirements berikut:

```text
CORE MVP
│
├── Authentication
├── Consent
├── Health Profile
├── Health Score
├── Lifestyle Score
├── Risk Estimation
├── Explainable AI
├── Future Health Simulation
├── What-if Simulation
├── Rule-based Recommendation
├── Evidence Center
├── LLM Explanation
├── Safety Guardrail
└── Personalized Dashboard
```

Fitur seperti advanced history, advanced analytics, social features, wearable integration, dan fitur kesehatan klinis tidak menjadi dependency MVP.

---

## 9.22 Functional Requirement Principle

Seluruh functional requirements HELIORA harus mengikuti prinsip berikut:

1. **Personalized**  
   Output harus relevan terhadap data pengguna.

2. **Explainable**  
   Pengguna harus dapat memahami alasan di balik hasil yang diberikan.

3. **Evidence-based**  
   Rekomendasi dan penjelasan kesehatan harus memiliki dasar evidence yang dapat ditelusuri.

4. **Preventive**  
   Fokus utama adalah membantu pengguna memahami dan mengubah lifestyle sebelum masalah kesehatan berkembang.

5. **Interactive**  
   Pengguna dapat mengeksplorasi perubahan lifestyle melalui What-if Simulation.

6. **Safe**  
   Sistem tidak boleh memosisikan estimasi sebagai diagnosis medis.

7. **Consistent**  
   Keputusan recommendation utama berasal dari Rule Engine yang dapat diuji dan diaudit.

8. **Demo-ready**  
   Core flow harus dapat berjalan secara stabil dari input pengguna hingga hasil, simulasi, rekomendasi, dan evidence.

---

## 9.23 Traceability to Product Vision

Functional Requirements harus mendukung tujuan utama HELIORA:

```text
Understand
    ↓
Estimate
    ↓
Explain
    ↓
Simulate
    ↓
Compare
    ↓
Recommend
    ↓
Verify Evidence
    ↓
Take Preventive Action
```

Dengan demikian, HELIORA tidak hanya menjadi aplikasi yang menampilkan **Health Score**, tetapi menjadi sebuah **Preventive Health Intelligence Platform** yang membantu pengguna memahami kondisi lifestyle, mengeksplorasi skenario perubahan, dan mengambil tindakan preventif berdasarkan estimasi serta evidence yang dapat dipahami.

---

# BAB 10 — AI Features

## 10.1 Overview

HELIORA menggunakan Artificial Intelligence (AI) sebagai **preventive health intelligence layer**, bukan sebagai sistem diagnosis medis.

AI digunakan untuk membantu pengguna:

1. memahami estimasi risiko kesehatan berbasis lifestyle;
2. mengetahui faktor lifestyle yang paling berpengaruh;
3. mengeksplorasi dampak perubahan lifestyle;
4. memperoleh rekomendasi preventif yang relevan;
5. memahami hasil AI melalui bahasa yang sederhana;
6. memperoleh evidence yang mendukung rekomendasi.

Arsitektur AI HELIORA dirancang dengan prinsip:

> **Prediction → Explanation → Simulation → Recommendation → Evidence → Human Understanding**

AI tidak mengambil keputusan medis untuk pengguna. Seluruh output harus diposisikan sebagai estimasi, simulasi, dan informasi preventif.

---

## 10.2 AI Architecture

Arsitektur AI MVP HELIORA terdiri dari beberapa komponen utama:

```text
User Health & Lifestyle Input
            │
            ▼
┌─────────────────────────────┐
│ Preventive Lifestyle        │
│ Risk Engine                 │
│             (ML)            │
└──────────────┬──────────────┘
               │
               ▼
        Risk Estimation
               │
               ▼
┌─────────────────────────────┐
│ Explainable AI              │
│ SHAP                        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Future Health Simulation    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ What-if Simulation           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Recommendation Engine       │
│ Rule-Based                  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ LLM + RAG                   │
│ Explanation & Evidence      │
└──────────────┬──────────────┘
               │
               ▼
     Human-Friendly Output
```

Setiap komponen memiliki tanggung jawab yang berbeda untuk menghindari penggunaan AI yang berlebihan dan menjaga interpretabilitas sistem.

---

## 10.3 Preventive Lifestyle Risk Engine

### 10.3.1 Purpose

Preventive Lifestyle Risk Engine merupakan komponen Machine Learning utama HELIORA.

Engine bertugas mengolah data lifestyle pengguna untuk menghasilkan estimasi risiko kesehatan.

Engine tidak menghasilkan diagnosis medis.

### 10.3.2 Input

Input utama berasal dari Health Profile pengguna.

Variabel MVP:

| Variable          | Description             | Type                  |
| ----------------- | ----------------------- | --------------------- |
| Age               | Usia pengguna           | Numeric               |
| Gender            | Jenis kelamin           | Categorical           |
| Height            | Tinggi badan            | Numeric               |
| Weight            | Berat badan             | Numeric               |
| Physical Activity | Tingkat aktivitas fisik | Numeric / Categorical |
| Sleep Duration    | Durasi tidur            | Numeric               |
| Smoking Status    | Status merokok          | Categorical           |
| Family History    | Riwayat keluarga        | Categorical           |

Variabel turunan:

| Variable               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| BMI                    | Body Mass Index berdasarkan berat dan tinggi badan |
| Activity Level         | Kategori aktivitas fisik                           |
| Sleep Category         | Kategori durasi tidur                              |
| Lifestyle Risk Factors | Kumpulan faktor lifestyle yang relevan             |

Variabel seperti stress, waist circumference, blood pressure, blood sugar, dan cholesterol tidak menjadi dependency utama MVP.

Variabel tersebut dapat dipertimbangkan sebagai pengembangan lanjutan apabila dataset dan waktu implementasi memungkinkan.

---

## 10.4 Risk Estimation

Risk Engine menghasilkan **model-estimated risk output** berdasarkan pola yang dipelajari dari dataset training.

Output utama:

```text
Estimated Health Risk
        │
        ├── Diabetes Risk
        ├── Hypertension Risk
        └── Cardiovascular Risk
```

### 10.4.1 Output Semantics

Output hanya dapat ditampilkan sebagai probability apabila model telah melalui calibration/evaluation yang sesuai. Jika belum, sistem harus menggunakan istilah **estimated risk score**.

Contoh UI yang disarankan:

```text
Estimated Diabetes Risk Score
42 / 100

Model Score Band
Moderate
```

Nilai tersebut merupakan output estimasi model berdasarkan data dan features yang digunakan. Nilai ini bukan diagnosis medis dan bukan clinical risk probability kecuali semantics probability telah divalidasi.

### 10.4.2 Risk Score Band

| Score | Band |
|------:|------|
| 0–29 | Lower |
| 30–59 | Moderate |
| 60–100 | Higher |

Band tersebut adalah **product-defined interpretation range**, bukan clinical threshold. Threshold final harus ditentukan setelah model evaluation dan didokumentasikan sebelum release MVP.

### 10.4.3 Model Evaluation

Apabila output dipakai sebagai probability, calibration harus dievaluasi dan metode calibration harus didokumentasikan. Evaluasi minimum mengikuti target/model yang digunakan, termasuk Accuracy, Precision, Recall, F1-Score, dan ROC-AUC apabila relevan.

---


## 10.5 Health Score

Health Score merupakan **product-defined preventive index** yang membantu pengguna memahami kondisi lifestyle secara ringkas.

Health Score bukan diagnosis, bukan clinical score, dan bukan pengganti pemeriksaan medis.

Score menggunakan weighted scoring sederhana:

```text
Score = Σ(normalized_factor × weight)
```

Contoh bobot awal hanya bersifat provisional:

| Factor | Weight |
|---|---:|
| BMI | 30% |
| Physical Activity | 25% |
| Sleep | 20% |
| Smoking | 15% |
| Family History | 10% |
| **Total** | **100%** |

Bobot dan formula final harus divalidasi serta didokumentasikan sebelum release MVP. Setiap faktor wajib memiliki aturan normalisasi yang eksplisit.

---


## 10.6 Lifestyle Score

Lifestyle Score berfokus pada kualitas kebiasaan pengguna.

Berbeda dengan risk score, Lifestyle Score tidak secara langsung merepresentasikan kemungkinan seseorang mengalami penyakit.

Contoh faktor:

```text
Lifestyle Score
│
├── Physical Activity
├── Sleep
├── Smoking
├── Weight / BMI
└── Other Lifestyle Factors
```

Contoh output:

```text
Lifestyle Score

72 / 100

Good
```

Tujuan utama score ini adalah memberikan feedback yang lebih mudah dipahami dan menjadi dasar bagi recommendation engine.

---

## 10.7 Explainable AI

### 10.7.1 Purpose

Explainable AI digunakan untuk menjawab pertanyaan:

> "Mengapa sistem memberikan estimasi seperti ini?"

HELIORA menggunakan pendekatan Explainable AI agar hasil model tidak menjadi black box bagi pengguna.

### 10.7.2 Technology

Pendekatan yang direkomendasikan untuk MVP:

> **SHAP (SHapley Additive exPlanations)**

LIME dapat digunakan sebagai alternatif apabila implementasi SHAP menghadapi kendala kompatibilitas atau performa.

### 10.7.3 Explanation Output

Contoh:

```text
Why is your risk moderate?

Main contributing factors:

1. BMI
   Higher than the recommended range.

2. Physical Activity
   Activity level is relatively low.

3. Sleep
   Average sleep duration is below the recommended range.

4. Smoking
   Smoking status contributes to the overall risk.
```

Explanation harus menjelaskan **kontribusi model**, bukan menyatakan hubungan sebab-akibat medis secara absolut.

---

## 10.8 Explainability Requirements

Sistem harus:

- menampilkan faktor yang paling berkontribusi;
- mengurutkan faktor berdasarkan kontribusi;
- memberikan penjelasan yang dapat dipahami pengguna;
- membedakan faktor positif dan faktor risiko;
- tidak menggunakan istilah medis yang tidak perlu;
- tidak menyatakan bahwa satu faktor secara pasti menyebabkan penyakit.

Contoh yang diperbolehkan:

> "BMI yang lebih tinggi berkontribusi terhadap estimasi risiko yang lebih tinggi pada model."

Contoh yang harus dihindari:

> "BMI Anda menyebabkan diabetes."

---

## 10.9 Future Health Simulation

Future Health Simulation merupakan salah satu **killer feature** utama HELIORA.

Fitur ini memungkinkan pengguna melihat perubahan output model berdasarkan lifestyle scenario pada horizon tertentu.

MVP menyediakan beberapa horizon simulasi:

- 30 hari;
- 90 hari;
- 180 hari.

Simulation tidak menggunakan model clinical forecasting baru. Untuk MVP, sistem menggunakan Risk Engine yang sama dengan baseline estimation dan melakukan scenario-based re-inference.

Pendekatan MVP:

```text
Current User Profile
        ↓
Baseline Model Output
        ↓
Apply Lifestyle Scenario
        ↓
Projected Input
        ↓
Re-run Risk Engine
        ↓
Simulated Model Output
```

Hasil harus diberi label sebagai **simulated / estimated change**. Sistem tidak boleh menyatakan bahwa kondisi medis pengguna pasti berubah dengan nilai tertentu pada akhir horizon.

Scenario assumptions harus dapat ditelusuri agar hasil dapat direproduksi.

---


## 10.10 Simulation Example

Contoh kondisi awal:

```text
Sleep:
5 hours/day

Physical Activity:
Low

BMI:
28
```

Skenario:

```text
Sleep:
7 hours/day

Physical Activity:
Moderate

BMI:
26
```

Sistem kemudian menjalankan kembali Risk Engine dan membandingkan:

```text
Current Condition
        ↓
Current Risk

        VS

Simulated Condition
        ↓
Simulated Risk
```

Output:

```text
Current Risk
58%

Simulated Risk
47%

Potential Improvement
-11 points
```

Nilai tersebut harus diberi label sebagai **simulated / estimated change**, bukan jaminan bahwa kondisi kesehatan pengguna akan benar-benar berubah dengan nilai tersebut.

---

## 10.11 What-if Simulation

What-if Simulation merupakan pengembangan interaktif dari Future Health Simulation.

Pengguna dapat mengubah parameter lifestyle dan melihat perubahan estimasi secara langsung.

Parameter utama MVP:

- sleep duration;
- physical activity;
- weight.

Contoh:

```text
What if I sleep 2 hours more?

Sleep
5h ─────────●────── 8h
            7h

Estimated Risk

Before
58%

After
51%

Change
-7 points
```

Tujuan utama fitur:

> Membantu pengguna memahami konsekuensi potensial dari perubahan lifestyle secara intuitif.

---

## 10.12 What-if Simulation Flow

```text
User opens What-if Simulation
            │
            ▼
Load Current Health Profile
            │
            ▼
User changes lifestyle parameter
            │
            ▼
Validate Input
            │
            ▼
Create Simulation Scenario
            │
            ▼
Re-run Risk Engine
            │
            ▼
Compare Before vs After
            │
            ▼
Display Result
            │
            ▼
Show Relevant Recommendation
```

### 10.12.1 Performance Requirement

What-if Simulation harus dirancang agar perubahan parameter dapat diproses dengan cepat.

Target MVP:

> Response time simulation < 1 second untuk skenario normal setelah model telah tersedia di memory.

---

## 10.13 Recommendation Engine

Recommendation Engine menggunakan **Rule-Based System**, bukan LLM.

Alasan penggunaan Rule Engine:

- deterministic;
- mudah diuji;
- mudah dijelaskan;
- cepat;
- konsisten;
- tidak bergantung pada generative AI;
- lebih mudah dikontrol untuk domain kesehatan.

---

## 10.14 Recommendation Rule

Contoh struktur:

| Condition                  | Recommendation                                      |
| -------------------------- | --------------------------------------------------- |
| Sleep < 6 hours            | Prioritize adequate sleep                           |
| Physical Activity low      | Increase regular physical activity                  |
| BMI above target range     | Consider gradual weight management                  |
| Smoking = Yes              | Recommend smoking cessation support                 |
| Multiple high-risk factors | Encourage consultation with healthcare professional |

Rule harus berasal dari evidence dan guideline yang dapat dipertanggungjawabkan.

Rule Engine tidak boleh membuat aturan medis baru secara bebas.

---

## 10.15 Safety Guardrail

Safety Guardrail merupakan bagian dari Rule Engine.

Jika risk score atau kombinasi faktor tertentu melewati threshold yang telah ditentukan, sistem harus menampilkan pesan keselamatan.

Contoh:

```text
Your estimated risk is relatively high.

This result is not a medical diagnosis.
Consider discussing your health condition
with a qualified healthcare professional.
```

Safety guardrail bertujuan mencegah pengguna menganggap output HELIORA sebagai diagnosis atau pengganti konsultasi medis.

---

## 10.16 LLM

LLM digunakan sebagai **communication layer**, bukan prediction engine.

### LLM Responsibilities

LLM bertugas:

- mengubah output teknis menjadi bahasa natural;
- merangkum hasil analisis;
- membantu menjelaskan faktor risiko;
- menyusun penjelasan rekomendasi;
- merangkum evidence yang telah diperoleh RAG.

### LLM Non-Responsibilities

LLM tidak digunakan untuk:

- menghitung risk score;
- menentukan diagnosis;
- membuat risk model;
- menentukan threshold medis;
- membuat rekomendasi medis tanpa rule;
- menghasilkan evidence tanpa sumber.

Arsitektur:

```text
ML / Rule Engine
       │
       ▼
Structured Result
       │
       ▼
LLM
       │
       ▼
Human-Friendly Explanation
```

---

## 10.17 Retrieval-Augmented Generation (RAG)

RAG digunakan untuk memastikan penjelasan berbasis evidence.

Knowledge Base dapat terdiri dari sumber terpercaya seperti:

- WHO;
- Kementerian Kesehatan Republik Indonesia;
- PERKENI;
- PERKI;
- CDC;
- jurnal ilmiah yang relevan.

MVP tidak membutuhkan knowledge base dalam jumlah besar.

Target awal:

> sekitar 15–30 dokumen berkualitas tinggi.

Prioritas diberikan pada kualitas, authority, relevansi, dan keterlacakan sumber.

---

## 10.18 RAG Pipeline

```text
User Result
    │
    ▼
Relevant Topic Detection
    │
    ▼
Retrieve Evidence
    │
    ▼
Relevant Documents / Chunks
    │
    ▼
LLM
    │
    ▼
Evidence-backed Explanation
    │
    ▼
User
```

Contoh:

```text
Risk Factor:
Low Physical Activity

        ↓

Retrieve:
WHO Physical Activity Guideline

        ↓

LLM

        ↓

Explanation:
Regular physical activity is associated
with better health outcomes.

        ↓

Evidence:
WHO Physical Activity Guidelines
```

---

## 10.19 Evidence Center

Evidence Center merupakan interface untuk menunjukkan sumber yang mendukung rekomendasi dan penjelasan AI.

Setiap rekomendasi penting dapat memiliki opsi:

```text
Why does HELIORA recommend this?
```

Ketika pengguna membuka bagian tersebut, sistem menampilkan:

- sumber;
- judul dokumen;
- organisasi penerbit;
- tahun publikasi;
- bagian evidence yang relevan;
- ringkasan evidence;
- tingkat evidence apabila tersedia.

Tujuan Evidence Center adalah meningkatkan:

- transparency;
- trust;
- explainability;
- accountability.

---

## 10.20 Evidence Strength

Apabila memungkinkan, evidence dapat dikelompokkan secara sederhana:

| Evidence Level | Description                             |
| -------------- | --------------------------------------- |
| High           | Didukung guideline atau evidence kuat   |
| Moderate       | Didukung beberapa sumber relevan        |
| Limited        | Evidence tersedia tetapi masih terbatas |

Klasifikasi harus digunakan secara hati-hati.

HELIORA tidak boleh mengarang tingkat evidence apabila sumber tidak menyediakan metodologi penilaian yang jelas.

---

## 10.21 AI Output Structure

Output AI HELIORA sebaiknya menggunakan struktur yang konsisten:

```text
1. Current Status
   ↓
2. Risk Estimation
   ↓
3. Main Contributing Factors
   ↓
4. Future Simulation
   ↓
5. What-if Scenario
   ↓
6. Recommendation
   ↓
7. Evidence
   ↓
8. Safety Disclaimer
```

Struktur ini membantu pengguna memahami hasil dari kondisi saat ini menuju tindakan preventif.

---

## 10.22 AI Data Flow

```text
Health Profile
      │
      ▼
Data Validation
      │
      ▼
Feature Engineering
      │
      ▼
Risk Engine
      │
      ├──────────────► Risk Score
      │
      ▼
SHAP
      │
      ├──────────────► Risk Factors
      │
      ▼
Simulation Engine
      │
      ├──────────────► Future Scenario
      │
      ▼
Rule Engine
      │
      ├──────────────► Recommendation
      │
      ▼
RAG
      │
      ├──────────────► Evidence
      │
      ▼
LLM
      │
      ▼
Human-Friendly Explanation
```

---

## 10.23 AI Model Boundary

Untuk menjaga scope MVP, HELIORA hanya menggunakan satu **Preventive Lifestyle Risk Engine**.

Tidak diperlukan:

- tiga model ML terpisah;
- model NLP terpisah;
- model generative AI untuk prediction;
- medical diagnosis model;
- clinical decision support system;
- deep learning yang tidak memberikan manfaat langsung terhadap MVP.

Pendekatan ini memungkinkan tim fokus pada integrasi pengalaman pengguna daripada kompleksitas model.

---

## 10.24 AI Dataset Strategy

Dataset AI MVP dibagi menjadi tiga kategori:

### A. Machine Learning Dataset

Digunakan untuk:

- training;
- validation;
- testing;
- feature engineering.

Dataset utama harus memiliki sebanyak mungkin variabel lifestyle yang relevan dengan input HELIORA.

### B. Indonesian Context Data

Digunakan untuk:

- memahami konteks kesehatan Indonesia;
- validasi problem;
- membandingkan relevansi variabel;
- mendukung narasi produk.

Dataset Indonesia tidak wajib digunakan sebagai dataset training utama apabila terdapat kendala akses, lisensi, atau kompatibilitas variabel.

### C. RAG Knowledge Base

Digunakan sebagai sumber evidence untuk:

- recommendation;
- explanation;
- lifestyle guidance;
- health education.

---

## 10.25 AI Evaluation

Model AI harus dievaluasi sebelum digunakan dalam MVP.

Metrik minimum:

- Accuracy;
- Precision;
- Recall;
- F1-Score;
- ROC-AUC apabila sesuai dengan jenis model.

Untuk model probabilistik, evaluasi tidak boleh hanya bergantung pada accuracy.

Hasil evaluasi harus dicatat dalam dokumentasi teknis.

---

## 10.26 Explainability Evaluation

Explainability dievaluasi berdasarkan:

- apakah faktor utama dapat ditampilkan;
- apakah kontribusi faktor konsisten dengan output model;
- apakah explanation dapat dipahami pengguna;
- apakah tidak terdapat klaim causal yang berlebihan;
- apakah output tidak menyesatkan pengguna.

---

## 10.27 Simulation Evaluation

Simulation dievaluasi berdasarkan:

- input dapat diubah;
- model dapat dijalankan kembali;
- hasil sebelum dan sesudah dapat dibandingkan;
- perubahan output konsisten dengan perubahan input;
- response time memenuhi target;
- tidak menghasilkan nilai yang tidak valid.

Simulation tidak dievaluasi sebagai prediksi klinis.

Simulation harus selalu diberi label:

> **Estimated / Simulated Outcome**

---

## 10.28 AI Safety Principles

HELIORA harus mengikuti prinsip berikut:

### 1. No Diagnosis

Sistem tidak boleh menyatakan pengguna menderita suatu penyakit berdasarkan output model.

### 2. No False Certainty

Sistem tidak boleh menggunakan bahasa yang memberikan kepastian medis.

### 3. Evidence-backed Recommendation

Rekomendasi utama harus dapat ditelusuri ke rule dan evidence yang sesuai.

### 4. Human Oversight

Untuk kondisi risiko tinggi, sistem mengarahkan pengguna kepada tenaga kesehatan.

### 5. Explainability

Output model harus dapat dijelaskan.

### 6. Transparency

Pengguna harus mengetahui bahwa hasil merupakan estimasi berbasis model.

### 7. Privacy

Data kesehatan pengguna harus diperlakukan sebagai data sensitif dan hanya digunakan sesuai tujuan sistem.

---

## 10.29 AI Limitations

MVP HELIORA memiliki beberapa keterbatasan yang harus dinyatakan secara eksplisit.

### Dataset Domain Shift

Apabila dataset training berasal dari populasi internasional, hasil model dapat memiliki perbedaan karakteristik dengan populasi Indonesia.

MVP akan menggunakan data Indonesia sebagai konteks validasi, sementara recalibration kuantitatif dapat menjadi future work.

### Limited Input Variables

Model MVP tidak menggunakan seluruh informasi klinis yang mungkin relevan.

### Simulation Uncertainty

Future Health Simulation merupakan proyeksi berbasis perubahan input dan model, bukan prediksi pasti terhadap kondisi seseorang.

### Model Bias

Model dapat mewarisi bias dari dataset training.

### Not Clinical Validation

MVP tidak dimaksudkan sebagai medical device atau clinical decision support system.

---

## 10.30 AI Technology Scope

Technology scope AI MVP:

| Component                 | Technology / Approach                  | Status       |
| ------------------------- | -------------------------------------- | ------------ |
| Risk Engine               | Machine Learning                       | Core         |
| Feature Engineering       | Statistical / preprocessing techniques | Core         |
| Explainability            | SHAP                                   | Core         |
| Simulation                | Model re-run with modified input       | Core         |
| What-if                   | Interactive parameter modification     | Core         |
| Recommendation            | Rule Engine                            | Core         |
| Explanation               | LLM                                    | Core         |
| Evidence Retrieval        | RAG                                    | Core         |
| NLP                       | Separate NLP model                     | Removed      |
| Diagnosis                 | Medical AI                             | Out of Scope |
| Clinical Decision Support | Clinical AI                            | Out of Scope |

---

## 10.31 AI Architecture Decision

Arsitektur AI MVP HELIORA ditetapkan sebagai berikut:

```text
                ┌──────────────────────┐
                │   User Health Data   │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Preventive Lifestyle │
                │     Risk Engine      │
                │         (ML)         │
                └──────────┬───────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Risk Estimation              SHAP Explanation
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Future Health        │
                │ Simulation            │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ What-if Simulation   │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Recommendation       │
                │ Rule Engine           │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │      RAG             │
                │ Evidence Retrieval   │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │       LLM            │
                │ Explanation Layer    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Human-Friendly       │
                │ Preventive Insight   │
                └──────────────────────┘
```

Arsitektur tersebut menjadi blueprint AI untuk implementasi MVP.

---

## 10.32 AI Feature Priority

| Feature                          | Priority | Reason                     |
| -------------------------------- | -------- | -------------------------- |
| Preventive Lifestyle Risk Engine | P0       | Core AI                    |
| Risk Estimation                  | P0       | Core product output        |
| Explainable AI                   | P0       | Trust & transparency       |
| What-if Simulation               | P0       | Killer feature             |
| Future Health Simulation         | P0       | Killer feature             |
| Recommendation Engine            | P0       | Actionable output          |
| RAG                              | P0       | Evidence Center            |
| LLM Explanation                  | P1       | Human-friendly explanation |
| Advanced model ensemble          | P2       | Future improvement         |
| Advanced fairness analysis       | P2       | Future improvement         |
| Domain recalibration             | P2       | Future improvement         |
| Additional ML models             | P2       | Future improvement         |

---

## 10.33 AI Acceptance Criteria

AI Features dianggap memenuhi requirement MVP apabila:

- [ ] Risk Engine dapat menerima input Health Profile.
- [ ] Risk Engine menghasilkan risk estimation.
- [ ] Risk output dapat ditampilkan secara understandable.
- [ ] SHAP dapat menampilkan faktor kontribusi utama.
- [ ] Health Score dapat dihitung.
- [ ] Lifestyle Score dapat dihitung.
- [ ] Future Health Simulation dapat dijalankan.
- [ ] What-if Simulation dapat mengubah parameter lifestyle.
- [ ] Sistem dapat membandingkan kondisi sebelum dan sesudah simulasi.
- [ ] Recommendation Engine menghasilkan rekomendasi berdasarkan rule.
- [ ] Recommendation dapat ditelusuri ke rule yang digunakan.
- [ ] RAG dapat mengambil evidence yang relevan.
- [ ] LLM dapat menjelaskan structured result.
- [ ] Output LLM tidak digunakan sebagai sumber utama prediction.
- [ ] Safety disclaimer selalu tersedia pada output AI.
- [ ] High-risk condition dapat memicu safety guardrail.
- [ ] Tidak ada output yang secara eksplisit mengklaim diagnosis medis.
- [ ] Simulation memenuhi target response time MVP.
- [ ] AI pipeline dapat berjalan stabil pada demo end-to-end.

---

## 10.34 Final AI Principle

Prinsip utama AI HELIORA adalah:

> **AI tidak digunakan untuk menggantikan dokter, tetapi untuk membantu pengguna memahami risiko, mengeksplorasi perubahan lifestyle, dan mengambil langkah preventif yang lebih terinformasi.**

Dengan demikian, AI HELIORA berfungsi sebagai **Preventive Health Intelligence Layer** yang menggabungkan:

```text
Machine Learning
      +
Explainable AI
      +
Simulation
      +
Rule Engine
      +
RAG
      +
LLM
      ↓
Preventive Health Intelligence
```

Fokus MVP bukan pada sebanyak mungkin teknologi AI, tetapi pada bagaimana setiap teknologi menghasilkan pengalaman preventif yang **personal, explainable, evidence-based, aman, dan dapat didemonstrasikan secara nyata**.

---

# 11. Data Requirements

## 11.1 Data Requirements Overview

HELIORA membutuhkan data sebagai dasar untuk menjalankan fungsi **Preventive Lifestyle Risk Engine**, **Explainable AI**, **Future Health Simulation**, **What-if Simulation**, **Recommendation Engine**, dan **Evidence Center**.

Data HELIORA dibagi menjadi empat kelompok utama:

1. **User Health & Lifestyle Data**
2. **Machine Learning Dataset**
3. **Knowledge Base untuk RAG**
4. **Rule Engine Knowledge**

Pendekatan data dirancang secara sederhana agar sesuai dengan scope MVP dan kemampuan tim, namun tetap mampu mendukung killer feature HELIORA.

Prinsip utama pengelolaan data:

- Data yang dikumpulkan harus relevan dengan preventive health.
- Data pengguna harus seminimal mungkin namun cukup untuk menghasilkan insight.
- Data sensitif harus diperlakukan secara aman.
- Dataset ML harus memiliki target variable yang jelas.
- Evidence untuk rekomendasi harus berasal dari sumber terpercaya.
- Data tidak boleh digunakan untuk mengklaim diagnosis medis.
- Data simulasi harus diposisikan sebagai estimasi, bukan kepastian medis.

---

## 11.2 Data Architecture

Secara konseptual, aliran data HELIORA adalah sebagai berikut:

```text
                    User
                     │
                     ▼
          Health & Lifestyle Input
                     │
                     ▼
          Data Validation & Processing
                     │
                     ▼
      Preventive Lifestyle Risk Engine
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Health     Lifestyle    Risk
       Score       Score      Estimation
          │          │          │
          └──────────┼──────────┘
                     ▼
              Explainable AI
                     │
                     ▼
           Future Health Model
                     │
                     ▼
             What-if Simulation
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Recommendation Engine     LLM + RAG
          │                     │
          └──────────┬──────────┘
                     ▼
              User Dashboard
```

Data dari pengguna menjadi input utama untuk perhitungan dan simulasi.

Sementara itu, dataset machine learning digunakan pada tahap pengembangan model dan bukan sebagai database pengguna secara langsung.

---

## 11.3 User Health & Lifestyle Data

HELIORA menggunakan pendekatan **minimal necessary data**.

Pengguna tidak perlu memasukkan seluruh informasi medis. Sistem hanya meminta data yang relevan dengan analisis lifestyle dan risk estimation yang digunakan pada MVP.

### 11.3.1 Required User Data

| Data              | Tipe           | Required | Keterangan                                 |
| ----------------- | -------------- | -------: | ------------------------------------------ |
| Age               | Integer        |      Yes | Usia pengguna                              |
| Gender            | Enum           |      Yes | Jenis kelamin                              |
| Height            | Decimal        |      Yes | Tinggi badan dalam cm                      |
| Weight            | Decimal        |      Yes | Berat badan dalam kg                       |
| Physical Activity | Integer / Enum |      Yes | Tingkat aktivitas fisik                    |
| Sleep Duration    | Decimal        |      Yes | Durasi tidur rata-rata per hari            |
| Smoking Status    | Enum           |      Yes | Status merokok                             |
| Family History    | Boolean / Enum |      Yes | Riwayat keluarga terkait penyakit tertentu |

Data tersebut menjadi **minimum input set** untuk MVP.

---

## 11.3.2 Optional User Data

Data berikut dapat digunakan apabila diperlukan dan tersedia dalam dataset/model:

| Data                | Tipe    | Required | Keterangan                |
| ------------------- | ------- | -------: | ------------------------- |
| Stress Level        | Integer |       No | Tingkat stres pengguna    |
| Waist Circumference | Decimal |       No | Lingkar pinggang dalam cm |
| Blood Pressure      | Numeric |       No | Tekanan darah             |
| Blood Sugar         | Numeric |       No | Kadar gula darah          |
| Cholesterol         | Numeric |       No | Kadar kolesterol          |

Data optional tidak menjadi persyaratan utama MVP.

Jika penggunaan data tersebut meningkatkan kompleksitas model secara signifikan, data dapat ditunda ke tahap pengembangan berikutnya.

---

## 11.4 Data Dictionary

### 11.4.1 Demographic Data

| Field  | Type    | Unit  | Example | Description   |
| ------ | ------- | ----- | ------- | ------------- |
| age    | Integer | years | 25      | Usia pengguna |
| gender | Enum    | -     | male    | Jenis kelamin |
| height | Decimal | cm    | 170     | Tinggi badan  |
| weight | Decimal | kg    | 68      | Berat badan   |

---

### 11.4.2 Lifestyle Data

| Field             | Type           | Unit         | Example    | Description               |
| ----------------- | -------------- | ------------ | ---------- | ------------------------- |
| physical_activity | Integer / Enum | minutes/week | 120        | Aktivitas fisik           |
| sleep_duration    | Decimal        | hours/day    | 6.5        | Durasi tidur              |
| smoking_status    | Enum           | -            | non_smoker | Status merokok            |
| family_history    | Boolean / Enum | -            | true       | Riwayat penyakit keluarga |

---

### 11.4.3 Optional Health Data

| Field               | Type             | Unit  | Example | Description      |
| ------------------- | ---------------- | ----- | ------- | ---------------- |
| stress_level        | Integer          | 1–5   | 3       | Tingkat stres    |
| waist_circumference | Decimal          | cm    | 85      | Lingkar pinggang |
| blood_pressure      | String / Numeric | mmHg  | 120/80  | Tekanan darah    |
| blood_sugar         | Decimal          | mg/dL | 95      | Kadar gula darah |
| cholesterol         | Decimal          | mg/dL | 180     | Kadar kolesterol |

---

## 11.5 Derived Data

Tidak seluruh informasi yang ditampilkan kepada pengguna harus berasal langsung dari input.

HELIORA dapat menghasilkan beberapa data turunan.

### 11.5.1 BMI

BMI dihitung berdasarkan berat dan tinggi badan.

```text
BMI = Weight / Height²
```

Dengan:

- Weight dalam kilogram.
- Height dalam meter.

Contoh:

```text
Weight = 68 kg
Height = 1.70 m

BMI = 68 / (1.70 × 1.70)
BMI ≈ 23.53
```

BMI digunakan sebagai salah satu indikator dalam lifestyle analysis dan bukan sebagai diagnosis.

---

### 11.5.2 Lifestyle Score

Lifestyle Score merupakan skor ringkasan yang menggambarkan kualitas beberapa faktor lifestyle pengguna.

Komponen dapat mencakup:

- BMI;
- Physical Activity;
- Sleep Duration;
- Smoking Status;
- Stress Level apabila tersedia.

Untuk MVP, Lifestyle Score dapat menggunakan pendekatan **weighted scoring** yang sederhana dan transparan.

Contoh:

```text
Lifestyle Score =
    BMI Score × 30%
    +
    Physical Activity Score × 25%
    +
    Sleep Score × 20%
    +
    Smoking Score × 15%
    +
    Other Lifestyle Score × 10%
```

Bobot final harus ditetapkan sebelum implementasi model dan didokumentasikan sebagai bagian dari metodologi HELIORA.

Lifestyle Score tidak boleh diposisikan sebagai skor medis resmi.

---

## 11.5.3 Health Score

Health Score merupakan skor ringkasan yang digunakan untuk membantu pengguna memahami kondisi lifestyle dan health-related indicators secara sederhana.

Health Score dapat dihitung menggunakan kombinasi:

- Lifestyle Score;
- Risk indicators;
- lifestyle improvement factors.

Contoh pendekatan MVP:

```text
Health Score =
    Lifestyle Component
    +
    Risk Component
    +
    Improvement Component
```

Formula final harus dibuat deterministic dan dapat dijelaskan kepada pengguna.

Tujuan Health Score adalah memberikan **high-level insight**, bukan menentukan status kesehatan klinis.

---

## 11.6 Machine Learning Dataset

### 11.6.1 Dataset Objective

Dataset machine learning digunakan untuk membangun **Preventive Lifestyle Risk Engine**.

Model tidak ditujukan untuk menghasilkan diagnosis medis.

Model digunakan untuk menghasilkan estimasi risiko berdasarkan pola data lifestyle dan health-related indicators yang tersedia.

Output utama:

- Estimated Diabetes Risk;
- Estimated Hypertension Risk;
- Estimated Cardiovascular Risk.

---

## 11.6.2 Primary Dataset Strategy

Untuk MVP, HELIORA menggunakan pendekatan:

> **One Primary Dataset + Supporting Validation Data**

Pendekatan ini dipilih untuk mengurangi kompleksitas engineering dan data preprocessing.

Dataset utama harus:

- memiliki jumlah data yang memadai;
- memiliki variabel lifestyle;
- memiliki target variable yang jelas;
- dapat diakses secara legal;
- memiliki dokumentasi;
- dapat diproses secara reproducible;
- sesuai dengan kebutuhan model.

---

## 11.6.3 Recommended Primary Dataset

**CDC BRFSS** direkomendasikan sebagai kandidat utama dataset machine learning karena memiliki data survei kesehatan dan lifestyle dalam skala besar.

Variabel yang relevan dapat mencakup:

- age;
- gender;
- BMI;
- physical activity;
- smoking;
- sleep;
- diabetes;
- hypertension;
- health-related indicators lainnya yang tersedia.

Namun, pemilihan tahun dan subset variabel final harus dilakukan setelah eksplorasi dataset.

HELIORA tidak perlu menggunakan seluruh variabel BRFSS.

Hanya variabel yang relevan dengan model yang dipertahankan.

---

## 11.7 Dataset Selection Criteria

Dataset yang digunakan untuk model HELIORA harus memenuhi kriteria berikut.

### 11.7.1 Relevance

Dataset harus memiliki hubungan yang relevan dengan:

- lifestyle;
- preventive health;
- disease risk;
- demographic factors.

### 11.7.2 Data Quality

Dataset harus memiliki:

- dokumentasi yang jelas;
- data yang dapat diproses;
- missing value yang dapat ditangani;
- target variable yang jelas.

### 11.7.3 Accessibility

Dataset harus dapat digunakan secara legal untuk kebutuhan pengembangan dan kompetisi.

### 11.7.4 Reproducibility

Pipeline preprocessing dan training harus dapat dijalankan kembali oleh tim.

### 11.7.5 Compatibility

Variabel dataset harus dapat dipetakan ke input yang digunakan oleh HELIORA.

---

## 11.8 Supporting Dataset

Dataset tambahan tidak wajib digunakan untuk training model utama.

Fungsinya dapat berupa:

- validation;
- feature comparison;
- exploratory analysis;
- contextual analysis;
- research support.

Kandidat supporting dataset:

- NHANES;
- IFLS;
- SKI;
- Riskesdas;
- dataset akademik yang relevan.

Untuk MVP, dataset tambahan tidak boleh menyebabkan pipeline menjadi terlalu kompleks.

---

## 11.9 Indonesian Context Data

HELIORA ditujukan untuk masyarakat Indonesia.

Karena itu, konteks Indonesia perlu dipertimbangkan walaupun dataset machine learning utama berasal dari sumber internasional.

Data Indonesia digunakan terutama untuk:

- memahami kondisi kesehatan masyarakat;
- memvalidasi problem statement;
- mendukung product discovery;
- memahami relevansi lifestyle;
- mendukung storytelling dan presentation;
- menjadi dasar future improvement.

Sumber yang dapat digunakan:

- Survei Kesehatan Indonesia (SKI);
- Riskesdas;
- Indonesia Family Life Survey (IFLS);
- BPS;
- publikasi resmi Kementerian Kesehatan RI.

Dataset Indonesia tidak wajib digunakan sebagai training dataset pada MVP.

---

## 11.10 Data Preprocessing

Sebelum digunakan untuk training model, dataset harus melalui proses preprocessing.

Tahapan minimal:

```text
Raw Dataset
    │
    ▼
Data Inspection
    │
    ▼
Remove Irrelevant Features
    │
    ▼
Handle Missing Values
    │
    ▼
Handle Invalid Values
    │
    ▼
Feature Transformation
    │
    ▼
Categorical Encoding
    │
    ▼
Feature Scaling (if required)
    │
    ▼
Train / Validation / Test Split
    │
    ▼
Model Training
```

---

## 11.11 Missing Data Handling

Missing value harus ditangani secara konsisten.

Pendekatan yang dapat digunakan:

- removal apabila jumlah missing sangat kecil;
- median untuk numerical variable;
- mode untuk categorical variable;
- kategori `unknown` apabila relevan.

Metode final dipilih berdasarkan karakteristik dataset.

Tidak diperbolehkan melakukan preprocessing yang menyebabkan data leakage.

---

## 11.12 Feature Engineering

Feature engineering dilakukan hanya apabila memberikan manfaat nyata terhadap model.

Contoh feature turunan:

- BMI dari height dan weight;
- age group;
- physical activity category;
- sleep category;
- lifestyle risk indicators.

Feature engineering harus:

- dapat dijelaskan;
- reproducible;
- relevan dengan domain;
- tidak menggunakan informasi yang hanya tersedia setelah outcome terjadi.

---

## 11.13 Target Variables

Preventive Lifestyle Risk Engine memiliki tiga target utama:

### Target 1 — Diabetes Risk

Model menghasilkan estimasi probabilitas atau risk score terkait diabetes.

### Target 2 — Hypertension Risk

Model menghasilkan estimasi probabilitas atau risk score terkait hypertension.

### Target 3 — Cardiovascular Risk

Model menghasilkan estimasi probabilitas atau risk score terkait cardiovascular risk.

Output harus menggunakan terminology seperti:

```text
Estimated Risk
Risk Score
Risk Level
```

dan tidak menggunakan terminology:

```text
Diagnosis
Confirmed Disease
Medical Diagnosis
```

---

## 11.14 Model Output

Output model minimal terdiri dari:

| Output              | Type      | Description                    |
| ------------------- | --------- | ------------------------------ |
| diabetes_risk       | Float     | Estimasi risiko diabetes       |
| hypertension_risk   | Float     | Estimasi risiko hipertensi     |
| cardiovascular_risk | Float     | Estimasi risiko kardiovaskular |
| risk_level          | Enum      | Low / Moderate / High          |
| model_version       | String    | Versi model                    |
| generated_at        | Timestamp | Waktu prediksi                 |

Model version diperlukan agar hasil prediksi dapat ditelusuri.

---

## 11.15 Explainable AI Data

Explainable AI membutuhkan informasi kontribusi setiap feature terhadap hasil model.

HELIORA menggunakan:

- SHAP sebagai pilihan utama;
- LIME sebagai alternatif apabila diperlukan.

Output minimal:

```text
Feature
    ↓
Contribution
    ↓
Direction
    ↓
Explanation
```

Contoh:

| Factor            | Contribution | Direction      |
| ----------------- | -----------: | -------------- |
| BMI               |         High | Increased Risk |
| Physical Activity |       Medium | Reduced Risk   |
| Sleep Duration    |       Medium | Increased Risk |
| Smoking           |         High | Increased Risk |

Penjelasan harus disampaikan sebagai faktor yang berkontribusi terhadap **estimasi model**, bukan sebagai penyebab medis yang pasti.

---

## 11.16 Future Health Simulation Data

Future Health Simulation menggunakan data kondisi pengguna saat ini sebagai baseline.

Input:

- current health profile;
- current lifestyle;
- current risk estimation;
- simulation horizon.

Simulation horizon MVP:

- 30 days;
- 90 days;
- 180 days.

Pendekatan MVP:

```text
Current User Data
        │
        ▼
Current Risk
        │
        ▼
Modify Lifestyle Parameters
        │
        ▼
Re-run Risk Engine
        │
        ▼
Compare Result
        │
        ▼
Future / Scenario Projection
```

Simulasi bukan model prediksi medis longitudinal.

Simulasi merupakan **scenario-based statistical projection** berdasarkan perubahan input dan output model.

---

## 11.17 What-if Simulation Data

What-if Simulation menggunakan salinan data pengguna sebagai baseline yang dapat dimodifikasi tanpa mengubah data profil asli.

Parameter utama:

- Sleep Duration;
- Physical Activity;
- Weight;
- Smoking Status apabila relevan.

Contoh:

```text
Current Scenario
Sleep = 5 hours
Activity = 60 min/week
Weight = 80 kg

        ↓

What-if Scenario
Sleep = 7 hours
Activity = 150 min/week
Weight = 75 kg

        ↓

Risk Engine

        ↓

Compare Risk
```

Output:

- Current Risk;
- Simulated Risk;
- Risk Difference;
- Health Score Difference;
- Lifestyle Score Difference.

---

## 11.18 Scenario Data Model

Setiap simulasi harus memiliki:

| Field             | Description            |
| ----------------- | ---------------------- |
| scenario_id       | Identitas simulasi     |
| user_id           | User terkait           |
| baseline_data     | Data awal              |
| modified_data     | Data setelah perubahan |
| baseline_score    | Score sebelum simulasi |
| simulated_score   | Score hasil simulasi   |
| baseline_risk     | Risk sebelum simulasi  |
| simulated_risk    | Risk hasil simulasi    |
| simulation_period | 30 / 90 / 180 hari     |
| created_at        | Waktu simulasi         |

Scenario data dapat bersifat temporary apabila tidak diperlukan untuk penyimpanan permanen.

---

## 11.19 Recommendation Data

Recommendation Engine menggunakan **Rule Engine**, bukan model generative AI.

Rule terdiri dari:

- condition;
- threshold;
- recommendation;
- priority;
- evidence reference.

Contoh:

| Condition                  | Recommendation                         | Priority |
| -------------------------- | -------------------------------------- | -------- |
| Sleep < 6 hours            | Tingkatkan durasi tidur                | High     |
| Physical Activity < target | Tingkatkan aktivitas fisik             | High     |
| BMI above threshold        | Pertimbangkan pengelolaan berat badan  | Medium   |
| Smoking = Yes              | Pertimbangkan program berhenti merokok | High     |

Threshold final harus mengacu pada guideline yang dipilih.

---

## 11.20 Evidence / RAG Data

Evidence Center menggunakan knowledge base yang berasal dari sumber terpercaya.

Kategori sumber:

### Nasional

- Kementerian Kesehatan RI;
- PERKENI;
- PERKI.

### Internasional

- WHO;
- CDC;
- guideline organisasi kesehatan;
- jurnal ilmiah.

Dokumen RAG tidak diperlakukan sebagai dataset ML.

RAG digunakan untuk:

- menjelaskan hasil;
- memberikan konteks;
- mendukung rekomendasi;
- menampilkan evidence;
- membantu LLM menghasilkan penjelasan yang grounded.

---

## 11.21 RAG Document Metadata

Setiap dokumen yang masuk ke knowledge base harus memiliki metadata.

| Field            | Description                   |
| ---------------- | ----------------------------- |
| document_id      | ID dokumen                    |
| title            | Judul dokumen                 |
| source           | Organisasi penerbit           |
| publication_date | Tanggal publikasi             |
| document_type    | Guideline / Research / Report |
| topic            | Topik kesehatan               |
| url              | Referensi sumber              |
| evidence_level   | Tingkat evidence              |
| version          | Versi dokumen                 |

Metadata diperlukan agar evidence dapat ditampilkan secara transparan kepada pengguna.

---

## 11.22 RAG Processing Pipeline

```text
Official Document
       │
       ▼
Document Collection
       │
       ▼
Document Validation
       │
       ▼
Text Extraction
       │
       ▼
Chunking
       │
       ▼
Embedding
       │
       ▼
Vector Database
       │
       ▼
Retriever
       │
       ▼
Relevant Evidence
       │
       ▼
LLM
       │
       ▼
Human-Friendly Explanation
```

Dokumen yang digunakan harus diprioritaskan dari sumber resmi dan dapat diverifikasi.

---

## 11.23 Data Privacy

Data kesehatan dan lifestyle pengguna merupakan data yang harus diperlakukan secara sensitif.

Prinsip privacy-by-design:

- hanya mengumpulkan data yang diperlukan;
- memberikan consent sebelum data digunakan;
- membatasi akses data;
- tidak membagikan data kepada pihak ketiga tanpa dasar yang sesuai;
- menghindari penyimpanan data yang tidak diperlukan;
- menggunakan anonymization atau pseudonymization apabila memungkinkan.

MVP tidak ditujukan untuk menjadi sistem rekam medis elektronik.

---

## 11.24 User Consent

Sebelum pengguna memasukkan data kesehatan, sistem harus memberikan informasi mengenai:

- tujuan pengumpulan data;
- jenis data yang dikumpulkan;
- penggunaan data;
- penyimpanan data;
- penggunaan data untuk risk estimation;
- batasan hasil AI.

Pengguna harus memberikan persetujuan sebelum melanjutkan.

Contoh:

> "Data yang Anda masukkan digunakan untuk menghasilkan estimasi dan simulasi kesehatan berbasis lifestyle. HELIORA tidak memberikan diagnosis medis dan tidak menggantikan konsultasi tenaga kesehatan."

---

## 11.25 Data Security Requirements

Data harus dilindungi melalui:

- authentication;
- authorization;
- secure password hashing;
- encrypted connection;
- server-side validation;
- input sanitization;
- access control;
- secure API communication.

Data pengguna tidak boleh dapat diakses oleh pengguna lain.

---

## 11.26 Data Retention

MVP menggunakan prinsip **data minimization**.

Data yang tidak diperlukan untuk:

- menjalankan fitur;
- menyimpan profile;
- menghasilkan histori;
- melakukan simulasi;

tidak perlu disimpan secara permanen.

Untuk simulation scenario, sistem dapat menggunakan temporary state apabila histori simulasi bukan bagian dari MVP.

---

## 11.27 Data Quality Requirements

Data harus memenuhi:

- valid format;
- valid range;
- consistent units;
- consistent categorical values;
- no impossible values.

Contoh validasi:

```text
Age > 0
Height > 0
Weight > 0
Sleep Duration >= 0
Physical Activity >= 0
Stress Level between 1 and 5
```

Nilai yang tidak valid harus ditolak sebelum masuk ke risk engine.

---

## 11.28 Data Validation

Validasi dilakukan pada dua level:

### Client-side Validation

Digunakan untuk memberikan feedback cepat kepada pengguna.

### Server-side Validation

Digunakan sebagai validasi utama untuk menjaga integritas data.

Server-side validation tetap wajib dilakukan meskipun client-side validation telah tersedia.

---

## 11.29 Data Versioning

Dataset dan model harus memiliki versioning.

Contoh:

```text
Dataset Version
BRFSS-2026-v1

Model Version
PLRE-v1.0

RAG Knowledge Base
RAG-KB-v1.0

Rule Engine
RULE-v1.0
```

Versioning membantu:

- debugging;
- reproducibility;
- audit internal;
- evaluasi model;
- rollback.

---

## 11.30 Data Leakage Prevention

Data leakage harus dicegah pada proses machine learning.

Prinsip:

- preprocessing train dan test dipisahkan;
- scaler hanya di-fit menggunakan training data;
- feature selection dilakukan tanpa melihat test label;
- test set hanya digunakan untuk evaluasi akhir;
- informasi outcome tidak boleh masuk sebagai feature prediksi.

Data leakage dapat menghasilkan performa model yang terlihat tinggi tetapi tidak representatif.

---

## 11.31 Dataset Evaluation

Dataset harus dievaluasi sebelum digunakan.

Minimal evaluasi:

- jumlah record;
- jumlah feature;
- missing value;
- duplicate;
- class distribution;
- outlier;
- data type;
- target distribution;
- feature relevance.

Contoh checklist:

```text
[ ] Dataset source verified
[ ] Dataset license verified
[ ] Variables mapped
[ ] Missing values analyzed
[ ] Duplicate records analyzed
[ ] Target variable verified
[ ] Class imbalance checked
[ ] Data leakage checked
[ ] Preprocessing documented
[ ] Dataset version recorded
```

---

## 11.32 Dataset License & Provenance

Setiap dataset harus memiliki informasi:

- sumber;
- pemilik;
- lisensi;
- tanggal akses;
- versi;
- penggunaan yang diperbolehkan.

Dataset tidak boleh dimasukkan ke repository publik apabila lisensinya melarang redistribusi.

Repository hanya menyimpan:

- preprocessing script;
- configuration;
- documentation;
- dataset schema;

apabila raw dataset tidak boleh dipublikasikan.

---

## 11.33 Data Limitations

HELIORA memiliki beberapa keterbatasan data pada MVP.

### 11.33.1 International Dataset

Dataset training utama dapat berasal dari populasi internasional.

Hal ini dapat menyebabkan perbedaan karakteristik dengan populasi Indonesia.

### 11.33.2 Limited Variables

MVP tidak menggunakan seluruh faktor kesehatan manusia.

Beberapa faktor seperti:

- genetic information;
- clinical history lengkap;
- medication;
- laboratory examination;
- medical imaging;

tidak digunakan.

### 11.33.3 Self-Reported Data

Sebagian data lifestyle dapat berasal dari self-report sehingga memiliki kemungkinan bias.

### 11.33.4 Simulation Limitation

Simulation tidak dapat dianggap sebagai prediksi pasti terhadap kondisi kesehatan seseorang.

---

## 11.34 Data Strategy for MVP

Untuk menjaga scope tetap realistis, strategi data final MVP adalah:

```text
                    HELIORA DATA

                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    User Input       ML Dataset      Knowledge Base
          │              │              │
          │              ▼              ▼
          │       Risk Model          RAG
          │              │              │
          └───────┬──────┴──────┬───────┘
                  ▼             ▼
             Risk Engine   Recommendation
                  │             │
                  └──────┬──────┘
                         ▼
                  Simulation Engine
                         │
                         ▼
                    User Insight
```

### MVP Dataset Commitment

**Machine Learning**

- 1 primary dataset;
- supporting dataset hanya jika diperlukan.

**Indonesia Context**

- SKI / IFLS / sumber resmi sebagai supporting evidence;
- tidak wajib digunakan untuk training model.

**RAG**

- sekitar 15–30 dokumen berkualitas;
- prioritas sumber resmi.

**Rule Engine**

- guideline-based rules;
- tidak membutuhkan dataset tambahan.

---

## 11.35 Final Data Requirements

Data Requirements HELIORA ditetapkan sebagai berikut:

| Category              | MVP Requirement                          | Status      |
| --------------------- | ---------------------------------------- | ----------- |
| User Demographic Data | Age, Gender                              | Required    |
| Anthropometric Data   | Height, Weight                           | Required    |
| Lifestyle Data        | Activity, Sleep, Smoking                 | Required    |
| Family History        | Family History                           | Required    |
| Stress                | Stress Level                             | Optional    |
| Clinical Data         | Blood Pressure, Blood Sugar, Cholesterol | Optional    |
| ML Dataset            | 1 Primary Dataset                        | Required    |
| Indonesia Dataset     | Supporting Validation                    | Recommended |
| RAG Knowledge Base    | Official Evidence Documents              | Required    |
| Rule Engine           | Guideline-based Rules                    | Required    |
| Data Versioning       | Dataset & Model Version                  | Required    |
| Consent               | User Consent                             | Required    |
| Data Validation       | Client + Server                          | Required    |
| Privacy               | Data Minimization & Access Control       | Required    |

---

## 11.36 Data Requirements Success Criteria

Data Requirements dianggap terpenuhi apabila:

- [ ] Required user data telah ditentukan.
- [ ] Optional user data telah ditentukan.
- [ ] Data dictionary telah tersedia.
- [ ] Dataset utama telah dipilih.
- [ ] Dataset memiliki source dan license yang jelas.
- [ ] Target variable telah ditentukan.
- [ ] Preprocessing pipeline telah didefinisikan.
- [ ] Data leakage prevention telah diterapkan.
- [ ] Model output telah didefinisikan.
- [ ] Simulation input dan output telah didefinisikan.
- [ ] Rule Engine data structure telah ditentukan.
- [ ] RAG knowledge base structure telah ditentukan.
- [ ] Metadata evidence telah ditentukan.
- [ ] Consent requirement telah ditentukan.
- [ ] Data security requirement telah ditentukan.
- [ ] Data limitation telah didokumentasikan.
- [ ] Dataset strategy tetap sesuai dengan scope MVP.

---

# 12. Technology Stack

## 12.1 Overview

Technology stack HELIORA dirancang untuk mendukung kebutuhan utama platform preventive health berbasis AI, khususnya:

- personalized health assessment;
- preventive lifestyle risk estimation;
- Explainable AI;
- Future Health Simulation;
- What-if Simulation;
- recommendation engine;
- evidence-based explanation;
- LLM-assisted explanation;
- RAG-based evidence retrieval;
- secure user data management.

Pemilihan teknologi mempertimbangkan:

1. kesesuaian dengan arsitektur AI HELIORA;
2. kemudahan pengembangan oleh tim;
3. kemampuan integrasi antara frontend, backend, database, dan AI;
4. maintainability;
5. performa MVP;
6. kemudahan deployment;
7. stabilitas untuk kebutuhan demonstrasi kompetisi.

Technology stack pada bab ini berfungsi sebagai **technical blueprint tingkat produk**.

Detail implementasi seperti struktur folder, API contract, authentication mechanism, ORM, migration strategy, deployment configuration, model serving, vector storage, dan konfigurasi environment akan ditentukan lebih lanjut pada dokumen `architecture.md`.

---

## 12.2 Technology Stack Summary

| Layer               | Technology               | Purpose                                |
| ------------------- | ------------------------ | -------------------------------------- |
| Frontend            | Next.js                  | User interface dan presentation layer  |
| Frontend Language   | TypeScript               | Type-safe frontend development         |
| UI Styling          | Tailwind CSS             | Design system dan responsive UI        |
| Backend             | FastAPI                  | REST API dan application backend       |
| Backend Language    | Python                   | Backend dan AI/ML ecosystem            |
| Validation          | Pydantic                 | Request dan response validation        |
| Database            | PostgreSQL               | Persistent relational data storage     |
| Machine Learning    | Scikit-learn             | Preventive Lifestyle Risk Engine       |
| Data Processing     | Pandas                   | Dataset processing dan preprocessing   |
| Numerical Computing | NumPy                    | Numerical computation                  |
| Explainable AI      | SHAP                     | Model explainability                   |
| Simulation          | Python + ML Re-inference | Future Health dan What-if Simulation   |
| Recommendation      | Rule Engine              | Evidence-based recommendation          |
| Generative AI       | LLM                      | Human-friendly explanation             |
| Retrieval           | RAG                      | Evidence retrieval                     |
| Containerization    | Docker                   | Development dan deployment consistency |
| Version Control     | Git + GitHub             | Source code management                 |

---

## 12.3 Frontend Technology

### 12.3.1 Next.js

Next.js digunakan sebagai framework utama frontend HELIORA.

Frontend bertanggung jawab terhadap:

- onboarding;
- consent;
- health profile;
- personalized health dashboard;
- risk estimation interface;
- Explainable AI visualization;
- Future Health Simulation;
- What-if Simulation;
- recommendation interface;
- Evidence Center;
- user account interface.

Next.js dipilih karena berbasis React dan mendukung pembangunan antarmuka web modern yang interaktif.

Khusus untuk HELIORA, kemampuan React dalam mengelola state dan interaksi pengguna penting untuk fitur:

- interactive slider;
- real-time simulation;
- risk comparison;
- scenario comparison;
- dynamic dashboard.

### 12.3.2 TypeScript

TypeScript digunakan sebagai bahasa pemrograman frontend.

Penggunaan TypeScript bertujuan untuk:

- meningkatkan type safety;
- mengurangi kesalahan data;
- meningkatkan maintainability;
- memperjelas struktur data dari API;
- mempermudah pengembangan oleh beberapa frontend developer.

TypeScript akan digunakan untuk mendefinisikan tipe data seperti:

- User;
- HealthProfile;
- LifestyleProfile;
- RiskAssessment;
- RiskFactor;
- SimulationScenario;
- SimulationResult;
- Recommendation;
- EvidenceReference.

### 12.3.3 Tailwind CSS

Tailwind CSS digunakan sebagai framework styling frontend.

Penggunaannya bertujuan untuk menjaga:

- konsistensi UI;
- responsive design;
- reusable styling;
- implementation speed;
- consistency dengan design system HELIORA.

Tailwind CSS mengikuti design direction HELIORA yang telah ditentukan pada dokumen desain.

---

## 12.4 Backend Technology

### 12.4.1 FastAPI

FastAPI digunakan sebagai framework backend utama HELIORA.

FastAPI bertanggung jawab terhadap:

- REST API;
- authentication flow;
- user management;
- health profile management;
- risk assessment request;
- simulation request;
- recommendation retrieval;
- evidence retrieval;
- AI orchestration;
- database interaction.

Arsitektur backend dirancang sebagai application layer yang menjadi penghubung antara frontend, database, AI engine, recommendation engine, dan RAG/LLM.

Secara konseptual:

```text
Next.js
    │
    │ REST API
    ▼
FastAPI
    │
    ├── Business Logic
    ├── Risk Assessment
    ├── Simulation
    ├── Recommendation
    ├── Evidence Retrieval
    └── AI Orchestration
```

### 12.4.2 Python

Python digunakan sebagai bahasa utama backend dan AI/ML.

Pemilihan Python memungkinkan backend dan AI engine berada dalam ecosystem yang sama.

Komponen seperti:

- Scikit-learn;
- Pandas;
- NumPy;
- SHAP;
- simulation logic;
- RAG processing;

dapat diintegrasikan secara langsung dengan backend FastAPI.

Pendekatan ini mengurangi kebutuhan untuk membuat service tambahan hanya untuk menjalankan model AI.

### 12.4.3 Pydantic

Pydantic digunakan untuk validasi struktur data pada FastAPI.

Pydantic digunakan untuk memastikan:

- request memiliki format yang valid;
- response memiliki struktur yang konsisten;
- tipe data tervalidasi;
- komunikasi frontend-backend lebih aman.

Contoh data yang divalidasi:

- health profile;
- lifestyle profile;
- simulation parameters;
- risk assessment request;
- API response.

---

## 12.5 Database Technology

### 12.5.1 PostgreSQL

PostgreSQL digunakan sebagai database utama HELIORA.

PostgreSQL bertanggung jawab untuk menyimpan data aplikasi yang bersifat persistent.

Data yang berpotensi disimpan meliputi:

- user account;
- consent;
- health profile;
- lifestyle profile;
- risk assessment;
- simulation history;
- recommendation;
- evidence metadata;
- system metadata.

Secara konseptual:

```text
Next.js
    │
    ▼
FastAPI
    │
    ▼
PostgreSQL
```

PostgreSQL dipilih sebagai relational database utama untuk menjaga:

- data integrity;
- relational consistency;
- structured data management;
- scalability untuk kebutuhan MVP dan pengembangan berikutnya.

Detail database schema, ERD, indexing, migration, dan relationship antar tabel akan didefinisikan pada `architecture.md`.

---

## 12.6 Machine Learning Technology

### 12.6.1 Scikit-learn

Scikit-learn digunakan untuk membangun **Preventive Lifestyle Risk Engine**.

Model digunakan untuk menghasilkan estimasi risiko berbasis data lifestyle.

Output model secara konseptual meliputi:

- Estimated Diabetes Risk;
- Estimated Hypertension Risk;
- Estimated Cardiovascular Risk.

Output tersebut merupakan **estimasi berbasis model**, bukan diagnosis medis.

Model ML akan digunakan sebagai komponen risk estimation dan menjadi dasar untuk:

- Explainable AI;
- Future Health Simulation;
- What-if Simulation.

### 12.6.2 Pandas

Pandas digunakan untuk:

- data loading;
- data cleaning;
- data transformation;
- preprocessing;
- exploratory data analysis;
- feature preparation.

Pandas terutama digunakan pada tahap pengolahan dataset dan pengembangan model.

### 12.6.3 NumPy

NumPy digunakan untuk:

- numerical computation;
- array processing;
- mathematical operations;
- preprocessing;
- simulation calculation.

NumPy mendukung komponen machine learning dan simulation yang membutuhkan perhitungan numerik.

---

## 12.7 Explainable AI Technology

### 12.7.1 SHAP

SHAP digunakan sebagai teknologi utama Explainable AI HELIORA.

Tujuan utama SHAP adalah membantu menjelaskan faktor yang berkontribusi terhadap output model.

Contoh faktor yang dapat ditampilkan:

- BMI;
- physical activity;
- sleep duration;
- smoking status;
- family history.

Output Explainable AI dapat digunakan untuk menjawab pertanyaan:

> "Mengapa estimasi risiko saya berada pada tingkat tersebut?"

Secara konseptual:

```text
User Input
    │
    ▼
Risk Engine
    │
    ▼
Risk Score
    │
    ▼
SHAP
    │
    ▼
Top Contributing Factors
```

SHAP dipilih sebagai pendekatan utama karena dapat memberikan interpretasi terhadap kontribusi feature terhadap output model.

---

## 12.8 Simulation Technology

Simulation merupakan salah satu komponen utama HELIORA dan menjadi bagian dari killer feature produk.

### 12.8.1 Future Health Simulation

Future Health Simulation digunakan untuk memberikan proyeksi berbasis perubahan lifestyle dalam horizon waktu tertentu.

Contoh horizon:

- 30 hari;
- 90 hari;
- 180 hari.

Pendekatan MVP menggunakan model dan input yang dimodifikasi untuk menghasilkan estimasi scenario.

Secara konseptual:

```text
Current Lifestyle
       │
       ▼
Risk Engine
       │
       ▼
Current Risk
       │
       ▼
Scenario Projection
       │
       ▼
Future Estimated Risk
```

Output simulation harus selalu diposisikan sebagai **proyeksi atau estimasi**, bukan prediksi medis yang pasti.

### 12.8.2 What-if Simulation

What-if Simulation memungkinkan pengguna mengubah parameter lifestyle dan melihat perubahan estimasi risiko.

Contoh parameter:

- sleep duration;
- physical activity;
- weight;
- smoking status.

Contoh:

```text
Current Scenario

Sleep = 5 hours
Exercise = Low
Weight = 80 kg

        ↓

What-if Scenario

Sleep = 7 hours
Exercise = Moderate
Weight = 75 kg

        ↓

Re-run Risk Engine

        ↓

Compare Result
```

Pendekatan utama MVP adalah **ML re-inference menggunakan input yang dimodifikasi**.

Dengan demikian, sistem tidak membutuhkan model simulasi terpisah.

---

## 12.9 Recommendation Technology

### 12.9.1 Rule Engine

Recommendation Engine HELIORA menggunakan Rule Engine, bukan LLM.

Rule Engine bertanggung jawab menghasilkan rekomendasi preventif berdasarkan:

- lifestyle condition;
- risk condition;
- threshold;
- guideline;
- safety rule.

Contoh:

```text
IF sleep_duration < 6 hours
THEN recommend improving sleep duration
```

```text
IF physical_activity < recommended level
THEN recommend increasing physical activity
```

```text
IF smoking_status = smoker
THEN recommend smoking cessation support
```

Rule Engine dipilih karena:

- deterministic;
- mudah diuji;
- mudah dijelaskan;
- konsisten;
- cepat;
- tidak bergantung pada probabilistic generation LLM.

LLM tidak digunakan untuk menentukan risk score atau menentukan keputusan medis.

---

## 12.10 Generative AI Technology

### 12.10.1 Large Language Model

LLM digunakan sebagai komponen pendukung komunikasi hasil AI kepada pengguna.

LLM tidak digunakan untuk:

- menghitung risk score;
- menggantikan ML model;
- menentukan diagnosis;
- membuat keputusan medis;
- menentukan threshold risiko.

LLM digunakan untuk:

- menyusun penjelasan;
- menyederhanakan istilah teknis;
- menghasilkan narasi hasil;
- membantu menjelaskan rekomendasi;
- merangkum evidence yang telah ditemukan.

Arsitektur:

```text
Risk Result
     │
     ▼
Recommendation
     │
     ▼
Retrieved Evidence
     │
     ▼
LLM
     │
     ▼
Human-Friendly Explanation
```

---

## 12.11 Retrieval-Augmented Generation

### 12.11.1 RAG

RAG digunakan untuk menyediakan evidence yang mendukung penjelasan dan rekomendasi HELIORA.

Knowledge Base dapat berasal dari:

- WHO;
- Kementerian Kesehatan Republik Indonesia;
- PERKENI;
- PERKI;
- CDC;
- scientific literature yang relevan.

RAG bertanggung jawab untuk:

1. menerima context dari hasil risk assessment;
2. mencari evidence yang relevan;
3. menyediakan sumber kepada LLM;
4. membantu menghasilkan explanation yang grounded pada evidence.

Secara konseptual:

```text
Risk / Recommendation
        │
        ▼
Evidence Retrieval
        │
        ▼
Relevant Documents
        │
        ▼
LLM
        │
        ▼
Evidence-backed Explanation
```

RAG tidak digunakan sebagai pengganti machine learning risk engine.

---

## 12.12 AI Architecture Integration

Seluruh technology stack AI HELIORA terintegrasi dalam pipeline berikut:

```text
User
 │
 ▼
Next.js
 │
 ▼
FastAPI
 │
 ▼
Health & Lifestyle Input
 │
 ▼
Preventive Lifestyle Risk Engine
 │
 ▼
Risk Estimation
 │
 ├──────────────► SHAP
 │                    │
 │                    ▼
 │              Explainable Factors
 │
 ▼
Simulation Engine
 │
 ├── Future Health Simulation
 │
 └── What-if Simulation
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
Human-Friendly Explanation
 │
 ▼
Next.js
 │
 ▼
User
```

---

## 12.13 Infrastructure Technology

### 12.13.1 Docker

Docker digunakan untuk menjaga konsistensi environment antara development dan deployment.

Containerization dapat digunakan untuk memisahkan komponen utama:

```text
HELIORA
│
├── Frontend Container
│   └── Next.js
│
├── Backend Container
│   └── FastAPI
│
└── Database
    └── PostgreSQL
```

AI processing dapat berada pada backend atau dipisahkan sesuai kebutuhan implementasi pada tahap architecture.

Detail deployment topology akan ditentukan pada `architecture.md`.

### 12.13.2 Git dan GitHub

Git digunakan sebagai version control system.

GitHub digunakan sebagai repository dan kolaborasi source code.

Penggunaannya mencakup:

- source code management;
- branch management;
- pull request;
- code review;
- issue tracking;
- version history;
- collaboration antar anggota tim.

---

## 12.14 Technology Stack Architecture

Secara keseluruhan, technology stack HELIORA dapat digambarkan sebagai berikut:

```text
┌──────────────────────────────────────────────┐
│                 HELIORA USER                 │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                  FRONTEND                    │
│                                              │
│ Next.js + React + TypeScript + Tailwind CSS │
└──────────────────────┬───────────────────────┘
                       │
                    REST API
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                  BACKEND                     │
│                                              │
│             FastAPI + Python                 │
│                 + Pydantic                   │
└───────────────┬───────────────┬──────────────┘
                │               │
                │               ▼
                │      ┌────────────────────┐
                │      │    PostgreSQL      │
                │      │      Database      │
                │      └────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│                 AI ENGINE                    │
│                                              │
│ Scikit-learn + Pandas + NumPy               │
└──────────────────────┬───────────────────────┘
                       │
          ┌────────────┼─────────────┐
          │            │             │
          ▼            ▼             ▼
       Risk          SHAP       Simulation
       Engine     Explainability    Engine
          │                          │
          └────────────┬─────────────┘
                       ▼
                Recommendation
                  Rule Engine
                       │
                       ▼
                     RAG
                       │
                       ▼
                     LLM
                       │
                       ▼
            Evidence-backed Explanation
                       │
                       ▼
                   Next.js
```

---

## 12.15 Technology Selection Principles

Pemilihan teknologi HELIORA mengikuti prinsip berikut:

### 12.15.1 AI Compatibility

Technology harus mendukung integrasi langsung dengan ecosystem Python dan machine learning.

### 12.15.2 Simplicity

Stack harus cukup sederhana untuk dikembangkan dan dipelihara oleh tim selama periode kompetisi.

### 12.15.3 Maintainability

Technology harus memungkinkan pembagian tanggung jawab antar anggota tim secara jelas.

### 12.15.4 Performance

Technology harus mampu memenuhi kebutuhan performa MVP, terutama pada:

- risk assessment;
- What-if Simulation;
- API response;
- dashboard loading.

### 12.15.5 Scalability

Stack harus memungkinkan HELIORA dikembangkan lebih lanjut setelah MVP tanpa harus melakukan perubahan arsitektur secara fundamental.

### 12.15.6 Demo Stability

Technology harus mendukung demonstrasi yang stabil selama presentasi dan live demo kompetisi.

---

## 12.16 Technology Responsibility Mapping

| Technology        | Primary Responsibility        |
| ----------------- | ----------------------------- |
| Next.js           | User interface                |
| TypeScript        | Frontend type safety          |
| Tailwind CSS      | UI styling                    |
| FastAPI           | Backend API                   |
| Python            | Backend dan AI ecosystem      |
| Pydantic          | API validation                |
| PostgreSQL        | Persistent data               |
| Pandas            | Data processing               |
| NumPy             | Numerical computation         |
| Scikit-learn      | Risk Engine                   |
| SHAP              | Explainable AI                |
| Rule Engine       | Recommendation                |
| Simulation Engine | Future dan What-if Simulation |
| RAG               | Evidence retrieval            |
| LLM               | Human-friendly explanation    |
| Docker            | Containerization              |
| Git               | Version control               |
| GitHub            | Collaboration dan repository  |

---

## 12.17 Technology Constraints

Untuk menjaga scope MVP, beberapa keputusan teknologi dibatasi sebagai berikut:

1. Tidak menggunakan Laravel.
2. Tidak menggunakan backend framework kedua selain FastAPI untuk application backend.
3. Tidak membuat model ML terpisah untuk setiap fitur simulation.
4. Tidak menggunakan LLM sebagai risk prediction engine.
5. Tidak menggunakan LLM sebagai medical decision engine.
6. Tidak membuat NLP pipeline terpisah pada MVP.
7. Tidak membangun infrastructure AI yang kompleks jika belum dibutuhkan.
8. Tidak mengunci provider LLM pada tahap PRD.
9. Tidak mengunci vector database tertentu pada tahap PRD.
10. Detail implementation technology akan ditentukan pada `architecture.md`.

---

## 12.18 Technology Stack Decision

Technology stack MVP HELIORA ditetapkan sebagai berikut:

> **Frontend:** Next.js + TypeScript + Tailwind CSS  
> **Backend:** FastAPI + Python  
> **Database:** PostgreSQL  
> **Machine Learning:** Scikit-learn  
> **Data Processing:** Pandas + NumPy  
> **Explainable AI:** SHAP  
> **Simulation:** Python-based ML Re-inference  
> **Recommendation:** Rule Engine  
> **Generative AI:** LLM  
> **Knowledge Retrieval:** RAG  
> **Infrastructure:** Docker  
> **Version Control:** Git + GitHub

Technology stack ini menjadi **blueprint teknis tingkat tinggi** untuk pengembangan MVP HELIORA.

Detail seperti:

- API architecture;
- database schema;
- ERD;
- authentication;
- authorization;
- project structure;
- model serving;
- RAG implementation;
- vector storage;
- LLM provider;
- deployment architecture;
- CI/CD;
- environment management;

akan dijelaskan secara terpisah dalam dokumen **`architecture.md`**.

---

## 12.19 Technology Stack Success Criteria

Technology stack dianggap siap digunakan apabila:

- [ ] Frontend dapat berkomunikasi dengan FastAPI melalui REST API.
- [ ] FastAPI dapat berkomunikasi dengan PostgreSQL.
- [ ] Risk Engine dapat dipanggil melalui backend.
- [ ] SHAP dapat menghasilkan feature explanation.
- [ ] What-if Simulation dapat melakukan ML re-inference.
- [ ] Future Health Simulation dapat menghasilkan scenario projection.
- [ ] Rule Engine dapat menghasilkan recommendation.
- [ ] RAG dapat mengambil evidence yang relevan.
- [ ] LLM dapat menghasilkan human-friendly explanation berdasarkan context dan evidence.
- [ ] Seluruh komponen utama dapat dijalankan secara konsisten menggunakan environment yang terdokumentasi.
- [ ] Stack siap digunakan untuk kebutuhan MVP dan live demo kompetisi.

---

## 12.20 Final Technology Stack Status

**Status: FINAL BLUEPRINT — MVP**

Technology stack HELIORA menggunakan arsitektur:

```text
Next.js
    +
FastAPI
    +
PostgreSQL
    +
Python AI/ML
    +
Scikit-learn
    +
SHAP
    +
Rule Engine
    +
RAG
    +
LLM
    +
Docker
```

Stack ini dipilih untuk menjaga keseimbangan antara **AI capability, development simplicity, maintainability, performance, dan competition readiness**.

Detail teknis implementasi selanjutnya akan menjadi tanggung jawab dokumen **`architecture.md`** dan tidak perlu diperluas di dalam PRD.

---

## BAB 13 — Non-Functional Requirements

### 13.1 Overview

Non-Functional Requirements (NFR) mendefinisikan karakteristik kualitas yang harus dipenuhi oleh HELIORA selain fungsi utama sistem.

NFR digunakan sebagai dasar untuk memastikan HELIORA tidak hanya dapat menjalankan fitur yang telah ditentukan, tetapi juga memiliki:

- performa yang baik;
- keamanan yang memadai;
- reliabilitas;
- usability yang baik;
- maintainability;
- scalability;
- explainability;
- privacy;
- dan kesiapan untuk digunakan dalam demonstrasi maupun pengembangan lebih lanjut.

NFR pada MVP disusun berdasarkan kebutuhan HELIORA sebagai platform preventive health berbasis AI dengan arsitektur:

```text
Next.js Frontend
        │
        ▼
     FastAPI
        │
        ├──────────────► PostgreSQL
        │
        ├──────────────► ML Risk Engine
        │
        ├──────────────► Rule Engine
        │
        └──────────────► LLM + RAG
```

---

## 13.2 Performance Requirements

### 13.2.1 General Application Performance

HELIORA harus memberikan respons yang cukup cepat agar pengguna dapat menggunakan sistem tanpa mengalami hambatan yang signifikan.

Target utama:

| Proses                   | Target Response Time |
| ------------------------ | -------------------: |
| Membuka halaman utama    |            < 3 detik |
| Membuka dashboard        |            < 3 detik |
| Menyimpan health profile |            < 2 detik |
| Risk estimation          |            < 3 detik |
| What-if simulation       |            < 1 detik |
| Recommendation Engine    |            < 1 detik |
| Explainable AI result    |            < 3 detik |
| LLM + RAG explanation    |            < 5 detik |

Target tersebut merupakan target MVP dan dapat dievaluasi kembali berdasarkan hasil pengujian aktual.

---

### 13.2.2 What-if Simulation Performance

What-if Simulation merupakan salah satu killer feature HELIORA.

Perubahan parameter utama seperti:

- berat badan;
- aktivitas fisik;
- durasi tidur;
- status merokok;

harus dapat menghasilkan estimasi perubahan risiko dengan respons yang cepat.

Target:

```text
User changes parameter
        ↓
Input validation
        ↓
Modified health profile
        ↓
Risk Engine
        ↓
Updated risk estimation
        ↓
UI update

Target: < 1 second
```

Perhitungan simulasi tidak boleh bergantung pada proses LLM karena LLM digunakan untuk penjelasan, bukan untuk perhitungan risiko.

---

### 13.2.3 LLM + RAG Performance

LLM + RAG digunakan untuk menghasilkan penjelasan yang lebih mudah dipahami berdasarkan hasil Risk Engine dan evidence yang relevan.

Target response:

```text
User requests explanation
        ↓
Retrieve evidence
        ↓
Build context
        ↓
LLM generation
        ↓
Human-friendly explanation
```

Target maksimal response time:

**< 5 detik** untuk kondisi normal.

Apabila proses LLM mengalami keterlambatan atau kegagalan, sistem harus tetap dapat menampilkan hasil Risk Estimation tanpa bergantung sepenuhnya pada LLM.

---

## 13.3 Availability & Reliability

### 13.3.1 Application Availability

HELIORA harus tersedia selama proses development, testing, dan demonstrasi.

Sistem harus meminimalkan kondisi:

- application crash;
- API tidak merespons;
- database connection failure;
- frontend rendering failure;
- ML inference failure.

Untuk MVP, target availability formal belum ditetapkan sebagai SLA production.

Prioritas reliability adalah:

```text
No Critical Crash
        ↓
Stable Core Features
        ↓
Predictable API Response
        ↓
Graceful Error Handling
```

---

### 13.3.2 Graceful Degradation

Kegagalan salah satu komponen tidak boleh menyebabkan seluruh aplikasi gagal.

Contoh:

```text
LLM unavailable
      ↓
Risk Engine tetap berjalan
      ↓
Risk result tetap ditampilkan
      ↓
Recommendation Engine tetap berjalan
      ↓
Evidence dapat ditampilkan secara langsung
```

Dengan demikian, fitur AI generatif bukan single point of failure terhadap core functionality HELIORA.

---

### 13.3.3 Error Handling

Setiap error harus ditangani secara terstruktur.

Kategori error minimal:

- validation error;
- authentication error;
- authorization error;
- database error;
- ML inference error;
- RAG retrieval error;
- LLM service error;
- unexpected server error.

User harus menerima pesan error yang mudah dipahami tanpa menampilkan informasi teknis sensitif.

---

## 13.4 Security Requirements

Security merupakan requirement penting karena HELIORA memproses data kesehatan dan lifestyle pengguna.

### 13.4.1 Authentication

Sistem harus menyediakan mekanisme authentication yang aman.

Requirement:

- password tidak boleh disimpan dalam plaintext;
- password harus menggunakan hashing;
- session/token harus dikelola secara aman;
- endpoint yang membutuhkan authentication harus terlindungi;
- user tidak boleh mengakses data milik user lain.

---

### 13.4.2 Authorization

HELIORA harus menerapkan authorization berdasarkan role dan permission yang telah ditentukan.

Minimal terdapat pemisahan:

```text
Authenticated User
        │
        ├── User Data
        │
        └── Personal Health Profile
```

Akses terhadap data harus dibatasi berdasarkan kepemilikan dan hak akses.

---

### 13.4.3 API Security

Backend FastAPI harus menerapkan validasi terhadap seluruh request yang masuk.

Requirement:

- input validation;
- schema validation;
- authentication check;
- authorization check;
- rate limiting apabila diperlukan;
- protection terhadap malformed request;
- sanitization terhadap input yang digunakan pada proses tertentu.

API tidak boleh mempercayai data yang dikirim langsung oleh client.

---

### 13.4.4 Sensitive Data Protection

Data yang berkaitan dengan kesehatan dan lifestyle harus diperlakukan sebagai data sensitif.

Contoh data:

- age;
- gender;
- height;
- weight;
- BMI;
- physical activity;
- sleep duration;
- smoking status;
- family history;
- health risk estimation.

Sistem harus membatasi akses terhadap data tersebut dan tidak menampilkan data pribadi secara tidak diperlukan.

---

## 13.5 Privacy Requirements

### 13.5.1 User Consent

Sebelum memasukkan data kesehatan atau lifestyle, pengguna harus mendapatkan informasi mengenai penggunaan data.

MVP menyediakan consent sederhana yang menjelaskan bahwa:

- data digunakan untuk menghasilkan health insight;
- data digunakan oleh sistem untuk melakukan estimasi dan simulasi;
- data tidak dimaksudkan sebagai diagnosis medis;
- pengguna dapat menggunakan sistem berdasarkan persetujuan yang diberikan.

---

### 13.5.2 Data Minimization

HELIORA hanya mengumpulkan data yang diperlukan untuk menjalankan fitur MVP.

Data yang tidak diperlukan tidak boleh dikumpulkan hanya untuk memperbanyak informasi pengguna.

Prinsip:

```text
Required Data
      ↓
Risk Estimation
      ↓
Simulation
      ↓
Recommendation
```

---

### 13.5.3 Privacy by Design

Privacy harus dipertimbangkan sejak tahap desain sistem.

Requirement:

- meminimalkan pengumpulan data;
- membatasi akses data;
- menghindari penggunaan data pribadi pada output publik;
- tidak menampilkan informasi sensitif pada log aplikasi;
- menggunakan data anonim atau pseudonim untuk kebutuhan analitik apabila memungkinkan.

---

## 13.6 Usability Requirements

HELIORA ditujukan untuk pengguna umum, bukan hanya pengguna dengan latar belakang medis.

Karena itu, sistem harus mengutamakan:

- bahasa sederhana;
- informasi bertahap;
- visualisasi yang mudah dipahami;
- navigasi konsisten;
- feedback yang jelas;
- dan minimnya istilah teknis tanpa penjelasan.

---

### 13.6.1 Health Information Readability

Hasil AI tidak boleh hanya ditampilkan dalam bentuk:

```text
Risk Score: 0.67342
```

Tetapi harus diterjemahkan menjadi informasi yang lebih mudah dipahami.

Contoh:

```text
Estimated Risk
Moderate

Faktor utama yang berkontribusi:
1. Aktivitas fisik rendah
2. Durasi tidur kurang
3. BMI berada di atas rentang target
```

Nilai numerik tetap dapat ditampilkan sebagai informasi pendukung.

---

### 13.6.2 Explainability

Setiap hasil risk estimation harus memiliki penjelasan mengenai faktor yang berkontribusi terhadap hasil tersebut.

Explainable AI menggunakan pendekatan seperti:

- SHAP;
- atau LIME.

Untuk MVP, SHAP menjadi pendekatan yang direkomendasikan.

---

## 13.7 Accessibility Requirements

HELIORA harus dirancang agar dapat digunakan oleh pengguna dengan kemampuan dan kondisi penggunaan yang beragam.

Requirement minimal:

- kontras teks dan background memadai;
- ukuran teks dapat dibaca dengan nyaman;
- elemen interaktif memiliki label yang jelas;
- form memiliki validation feedback;
- navigasi tidak bergantung hanya pada warna;
- status penting memiliki indikator visual dan teks.

---

## 13.8 Maintainability Requirements

Kode HELIORA harus disusun agar mudah dipahami, diperbaiki, dan dikembangkan oleh anggota tim.

### Backend

Backend menggunakan:

```text
FastAPI
```

Struktur backend harus memisahkan setidaknya:

- API routes;
- schemas;
- services;
- business logic;
- ML services;
- rule engine;
- database layer;
- configuration.

Contoh konseptual:

```text
backend/
├── api/
├── schemas/
├── services/
├── models/
├── ml/
├── rules/
├── database/
└── core/
```

---

### Frontend

Frontend menggunakan:

```text
Next.js
```

Struktur harus memisahkan:

- pages/routes;
- components;
- UI elements;
- API clients;
- state management;
- feature-specific logic.

---

### Database

Database menggunakan:

```text
PostgreSQL
```

Database schema harus terdokumentasi dan memiliki relasi yang jelas.

---

## 13.9 Scalability Requirements

MVP HELIORA tidak membutuhkan horizontal scaling kompleks.

Namun, arsitektur harus memungkinkan pengembangan menuju skala yang lebih besar.

Target desain:

```text
Next.js
   │
   ▼
FastAPI
   │
   ├── PostgreSQL
   ├── ML Engine
   ├── Rule Engine
   └── AI Services
```

Komponen harus dibuat cukup modular sehingga dapat dipisahkan atau di-scale secara independen apabila kebutuhan meningkat.

Future scaling dapat mencakup:

- asynchronous processing;
- caching;
- background workers;
- model serving;
- vector database;
- load balancing;
- container orchestration.

Fitur tersebut bukan requirement MVP.

---

## 13.10 AI Reliability Requirements

### 13.10.1 Risk Engine

Risk Engine harus menghasilkan output yang deterministik untuk input yang sama dalam konfigurasi model yang sama.

Contoh:

```text
Input A
   ↓
Risk Engine
   ↓
Risk Result A
```

Input yang sama tidak boleh menghasilkan perubahan risiko yang tidak dapat dijelaskan tanpa perubahan pada model atau parameter sistem.

---

### 13.10.2 What-if Consistency

Jika pengguna memperbaiki parameter lifestyle yang secara logis seharusnya memberikan dampak positif, perubahan hasil harus mengikuti hubungan yang telah ditentukan oleh model dan Rule Engine.

Contoh:

```text
Sleep:
5 hours
   ↓
7 hours
   ↓
Risk estimation recalculated
```

Sistem harus menghindari perubahan hasil yang tidak konsisten akibat proses generatif LLM.

---

### 13.10.3 LLM Boundary

LLM tidak boleh digunakan sebagai sumber utama perhitungan risiko.

LLM hanya bertugas untuk:

- menjelaskan hasil;
- membuat narasi;
- merangkum evidence;
- membantu pengguna memahami output.

Risk calculation tetap berasal dari:

```text
ML Risk Engine
+
Rule Engine
```

---

## 13.11 RAG Requirements

Knowledge Base HELIORA harus menggunakan sumber evidence yang relevan dan dapat dipercaya.

Prioritas sumber:

1. WHO;
2. Kementerian Kesehatan Republik Indonesia;
3. PERKENI;
4. PERKI;
5. CDC;
6. jurnal ilmiah yang relevan.

Untuk MVP, knowledge base ditargetkan sekitar:

**15–30 dokumen berkualitas.**

---

### 13.11.1 Evidence Traceability

Setiap penjelasan berbasis evidence harus dapat ditelusuri kembali ke sumber yang digunakan.

Output ideal:

```text
Recommendation
      ↓
Explanation
      ↓
Evidence
      ↓
Source
```

Informasi evidence minimal:

- judul sumber;
- organisasi/penerbit;
- tahun apabila tersedia;
- bagian atau konteks yang relevan;
- reference/link apabila tersedia.

---

## 13.12 Simulation Requirements

### 13.12.1 Simulation Method

Future Health Simulation dan What-if Simulation menggunakan pendekatan sederhana untuk MVP.

Pendekatan utama:

```text
Current User Input
        ↓
Modify Lifestyle Parameters
        ↓
Re-run Risk Model
        ↓
Compare Results
```

Simulation bukan prediksi medis pasti.

Hasil simulation harus selalu diberi konteks bahwa output merupakan proyeksi statistik berdasarkan model dan input yang tersedia.

---

### 13.12.2 Simulation Period

MVP menyediakan beberapa horizon simulasi:

- 30 hari;
- 90 hari;
- 180 hari.

Horizon tersebut digunakan sebagai media eksplorasi, bukan sebagai jaminan bahwa kondisi medis pengguna akan berubah sesuai hasil simulasi.

---

## 13.13 Data Quality Requirements

Data yang digunakan oleh sistem harus melalui proses validasi.

Validasi minimal:

- required field validation;
- type validation;
- range validation;
- missing value handling;
- outlier handling;
- duplicate handling pada dataset training;
- consistency check.

Contoh:

```text
Age < 0
    ↓
Invalid

Weight <= 0
    ↓
Invalid

Sleep < 0
    ↓
Invalid
```

---

## 13.14 Machine Learning Quality Requirements

Model ML harus dievaluasi sebelum digunakan pada MVP.

Minimal evaluasi:

- train-test split;
- accuracy untuk klasifikasi apabila sesuai;
- precision;
- recall;
- F1-score;
- ROC-AUC apabila applicable.

Model juga harus memiliki baseline yang dapat dibandingkan.

Untuk MVP, evaluasi fairness dan recalibration lintas populasi tidak menjadi requirement utama dan dapat ditempatkan sebagai future work.

---

## 13.15 Observability & Logging

Sistem harus memiliki logging untuk membantu debugging dan monitoring.

Log minimal:

- API request status;
- error;
- authentication failure;
- ML inference failure;
- database error;
- RAG retrieval failure;
- LLM service failure.

Namun, log tidak boleh menyimpan data kesehatan pengguna secara tidak diperlukan.

Contoh yang harus dihindari:

```text
User health profile:
Age=...
Weight=...
Smoking=...
FamilyHistory=...
```

Sebagai gantinya:

```text
Risk calculation failed
request_id=...
timestamp=...
```

---

## 13.16 Compatibility Requirements

### Frontend

HELIORA harus dapat berjalan pada browser modern yang umum digunakan.

Target:

- Google Chrome;
- Mozilla Firefox;
- Microsoft Edge;
- Safari.

Prioritas utama adalah desktop browser karena HELIORA menggunakan pendekatan desktop-first.

---

### Backend

FastAPI harus dapat dijalankan pada environment deployment yang mendukung:

```text
Python
```

Konfigurasi environment harus dipisahkan dari source code.

---

## 13.17 Deployment Requirements

Deployment harus dapat dilakukan secara reproducible.

Requirement:

- environment variable digunakan untuk configuration;
- secret tidak disimpan dalam repository;
- dependency harus terdokumentasi;
- deployment process harus terdokumentasi;
- database migration harus dapat dijalankan secara konsisten;
- production configuration dipisahkan dari development configuration.

---

## 13.18 Backup & Recovery

Untuk MVP, mekanisme disaster recovery tingkat enterprise bukan requirement.

Namun, database harus memiliki mekanisme backup dasar pada environment deployment yang digunakan.

Minimal:

```text
PostgreSQL
    ↓
Periodic Backup
    ↓
Recovery Capability
```

Strategi backup dapat ditingkatkan pada fase production.

---

## 13.19 Medical Safety Requirements

Karena HELIORA berada pada domain preventive health, sistem harus memiliki safety boundary.

### Requirement

Sistem harus:

- menampilkan medical disclaimer;
- tidak menyatakan bahwa pengguna pasti memiliki penyakit;
- tidak memberikan diagnosis;
- tidak memberikan resep;
- tidak memberikan treatment plan;
- tidak menggantikan konsultasi dokter.

Jika hasil risk estimation melewati threshold tertentu:

```text
High Estimated Risk
        ↓
Safety Guardrail
        ↓
Inform user
        ↓
Recommend consultation with healthcare professional
```

Safety guardrail merupakan bagian dari Rule Engine.

---

## 13.20 Security & Privacy Quality Gate

Sebelum MVP dinyatakan siap untuk demo, minimal harus dipastikan:

- authentication berjalan;
- authorization berjalan;
- password tidak disimpan plaintext;
- API melakukan validation;
- sensitive data tidak muncul pada log;
- secret tidak berada di repository;
- database dapat diakses sesuai permission;
- medical disclaimer ditampilkan;
- consent tersedia.

---

## 13.21 NFR Priority

Prioritas NFR untuk MVP:

| Priority | Requirement                |
| -------- | -------------------------- |
| P0       | Security                   |
| P0       | Privacy                    |
| P0       | Medical Safety             |
| P0       | Core Performance           |
| P0       | Reliability                |
| P1       | Usability                  |
| P1       | Explainability             |
| P1       | Data Quality               |
| P1       | Maintainability            |
| P1       | AI Reliability             |
| P2       | Scalability                |
| P2       | Advanced Observability     |
| P2       | Advanced Backup & Recovery |

P0 berarti requirement wajib dipenuhi sebelum MVP dianggap siap.

P1 berarti requirement penting dan harus dipenuhi dalam MVP apabila tidak mengganggu core functionality.

P2 berarti requirement dapat diimplementasikan secara bertahap setelah core MVP stabil.

---

## 13.22 NFR Acceptance Summary

MVP HELIORA dianggap memenuhi Non-Functional Requirements apabila:

- [ ] halaman utama dapat dimuat dalam target performa;
- [ ] dashboard dapat digunakan tanpa critical error;
- [ ] What-if Simulation memiliki response time target < 1 detik;
- [ ] LLM + RAG memiliki response time target < 5 detik dalam kondisi normal;
- [ ] authentication berjalan dengan aman;
- [ ] authorization diterapkan;
- [ ] password menggunakan hashing;
- [ ] input API tervalidasi;
- [ ] sensitive data tidak disimpan pada log secara tidak perlu;
- [ ] user consent tersedia;
- [ ] medical disclaimer tersedia;
- [ ] safety guardrail tersedia;
- [ ] Risk Engine tidak bergantung pada LLM;
- [ ] What-if Simulation menghasilkan output secara konsisten;
- [ ] evidence dapat ditelusuri ke sumber;
- [ ] dataset telah melalui validasi dasar;
- [ ] model telah melalui evaluasi dasar;
- [ ] frontend dan backend memiliki struktur yang maintainable;
- [ ] deployment configuration terdokumentasi;
- [ ] critical application failure dapat ditangani secara graceful.

---

## 13.23 Definition of NFR Success

Secara keseluruhan, NFR HELIORA dinyatakan berhasil apabila sistem mampu memberikan pengalaman preventive health yang:

```text
Fast
  +
Reliable
  +
Secure
  +
Private
  +
Explainable
  +
Usable
  +
Medically Responsible
        ↓
   HELIORA MVP
```

NFR ini menjadi quality baseline yang harus dipenuhi sebelum HELIORA memasuki tahap final testing, demonstration, dan presentation.

---

# 14. Business Rules

## 14.1 Overview

Business Rules mendefinisikan aturan, batasan, kondisi, dan perilaku bisnis yang harus dipatuhi oleh HELIORA dalam menghasilkan output kepada pengguna.

Business Rules digunakan sebagai acuan untuk:

- implementasi backend;
- implementasi Preventive Lifestyle Risk Engine;
- Recommendation Engine;
- What-if Simulation;
- Future Health Simulation;
- Explainable AI;
- Evidence Center;
- safety guardrail;
- validasi data;
- pengelolaan akun dan consent;
- pengujian dan acceptance criteria.

Business Rules HELIORA dirancang dengan prinsip:

1. **Preventive, bukan diagnostic**
2. **Evidence-based**
3. **Explainable**
4. **Personalized**
5. **Consistent**
6. **Safe**
7. **Non-clinical decision making**

HELIORA tidak boleh memberikan output yang dapat ditafsirkan sebagai diagnosis medis, resep, atau keputusan klinis.

---

## 14.2 Business Rule Classification

Business Rules HELIORA dikelompokkan menjadi:

| Kategori    | Fokus                            |
| ----------- | -------------------------------- |
| BR-AUTH     | Authentication dan authorization |
| BR-CONSENT  | Privacy dan user consent         |
| BR-PROFILE  | Health profile                   |
| BR-SCORE    | Health Score dan Lifestyle Score |
| BR-RISK     | Risk estimation                  |
| BR-XAI      | Explainable AI                   |
| BR-SIM      | Future Health Simulation         |
| BR-WHATIF   | What-if Simulation               |
| BR-REC      | Recommendation Engine            |
| BR-EVIDENCE | Evidence Center                  |
| BR-LLM      | LLM-generated explanation        |
| BR-SAFETY   | Safety guardrail                 |
| BR-DATA     | Data validation                  |
| BR-PRIVACY  | Data privacy                     |
| BR-AUDIT    | System traceability              |

---

# 14.3 Authentication & Authorization Rules

### BR-AUTH-001 — User Authentication

Pengguna harus melakukan authentication sebelum dapat mengakses fitur personal health analysis.

Unauthenticated user hanya dapat mengakses halaman publik yang diperbolehkan.

### BR-AUTH-002 — Password Security

Password pengguna harus:

- disimpan dalam bentuk hashed password;
- tidak pernah disimpan sebagai plaintext;
- tidak dikembalikan melalui API;
- tidak ditampilkan dalam log aplikasi.

### BR-AUTH-003 — Authorization

Setiap endpoint yang membutuhkan data personal harus melakukan authorization.

User hanya dapat mengakses data miliknya sendiri.

### BR-AUTH-004 — Session Security

Session atau authentication token harus memiliki mekanisme expiration dan tidak boleh digunakan setelah masa berlaku berakhir.

### BR-AUTH-005 — Unauthorized Access

Jika pengguna mencoba mengakses resource milik pengguna lain, sistem harus menolak request.

Expected response:

```text
403 Forbidden
```

---

# 14.4 Consent & Privacy Rules

## BR-CONSENT-001 — Mandatory Consent

Pengguna harus memberikan consent sebelum data health profile digunakan untuk proses analisis HELIORA.

Flow:

```text
User Registration
        ↓
Privacy & Consent
        ↓
User Agreement
        ↓
Health Profile
```

Tanpa consent:

```text
Health Analysis = Not Available
```

---

## BR-CONSENT-002 — Consent Purpose

Consent harus menjelaskan bahwa data digunakan untuk:

- personal health analysis;
- risk estimation;
- health/lifestyle scoring;
- simulation;
- recommendation;
- penyajian hasil kepada pengguna.

---

## BR-CONSENT-003 — Consent Withdrawal

Pengguna dapat menarik consent.

Jika consent dicabut, sistem harus menghentikan penggunaan data pengguna untuk proses analisis personal.

---

## BR-PRIVACY-001 — Data Minimization

HELIORA hanya mengumpulkan data yang diperlukan untuk MVP.

Data yang tidak diperlukan untuk fitur MVP tidak boleh menjadi mandatory input.

---

## BR-PRIVACY-002 — Personal Data Protection

Data personal dan health-related data harus diperlakukan sebagai data sensitif dan tidak boleh ditampilkan kepada pengguna lain.

---

## BR-PRIVACY-003 — No Third-Party Sharing

Data pengguna tidak boleh dibagikan kepada pihak ketiga tanpa dasar penggunaan dan consent yang sesuai.

---

# 14.5 Health Profile Rules

## BR-PROFILE-001 — Required Health Data

Untuk menghasilkan analisis dasar, pengguna minimal harus menyediakan:

- age;
- gender;
- height;
- weight;
- physical activity;
- sleep duration;
- smoking status;
- family history.

---

## BR-PROFILE-002 — Optional Data

Data berikut dapat digunakan apabila tersedia:

- stress level;
- waist circumference;
- blood pressure;
- blood sugar;
- cholesterol.

Data optional tidak boleh menyebabkan sistem gagal apabila tidak tersedia.

---

## BR-PROFILE-003 — Age Validation

Age harus berada dalam rentang yang ditentukan oleh sistem.

Nilai:

```text
age <= 0
```

harus ditolak.

---

## BR-PROFILE-004 — Height Validation

Height harus berupa nilai positif dan menggunakan satuan centimeter pada user interface.

---

## BR-PROFILE-005 — Weight Validation

Weight harus berupa nilai positif dan menggunakan satuan kilogram.

---

## BR-PROFILE-006 — BMI Calculation

BMI dihitung berdasarkan:

```text
BMI = Weight / Height²
```

dengan height dikonversi dari centimeter menjadi meter sebelum perhitungan.

Contoh:

```text
Height = 170 cm
Weight = 70 kg

BMI = 70 / (1.70²)
BMI ≈ 24.22
```

BMI merupakan indikator lifestyle/anthropometric yang digunakan oleh sistem dan bukan diagnosis medis.

---

# 14.6 Health Score Rules

## BR-SCORE-001 — Health Score

Health Score merupakan skor ringkas yang digunakan untuk memberikan gambaran kondisi lifestyle pengguna berdasarkan faktor yang digunakan oleh HELIORA.

Health Score tidak boleh diposisikan sebagai medical score atau clinical score.

---

## BR-SCORE-002 — Health Score Range

Health Score menggunakan rentang:

```text
0 – 100
```

Semakin tinggi skor, semakin baik kondisi lifestyle berdasarkan indikator yang digunakan sistem.

---

## BR-SCORE-003 — Health Score Calculation

Health Score menggunakan weighted scoring sederhana.

Contoh struktur:

| Faktor            |    Bobot |
| ----------------- | -------: |
| BMI               |      30% |
| Physical Activity |      25% |
| Sleep             |      20% |
| Smoking           |      15% |
| Family History    |      10% |
| **Total**         | **100%** |

Formula konseptual:

```text
Health Score =
    BMI Score × 30%
  + Activity Score × 25%
  + Sleep Score × 20%
  + Smoking Score × 15%
  + Family History Score × 10%
```

Bobot dapat disesuaikan selama proses pengembangan berdasarkan hasil eksperimen dan evaluasi.

---

# 14.7 Lifestyle Score Rules

## BR-SCORE-004 — Lifestyle Score

Lifestyle Score digunakan untuk memberikan gambaran kualitas kebiasaan hidup pengguna.

Lifestyle Score berbeda dari risk estimation.

```text
Lifestyle Score
        ↓
Menggambarkan kualitas lifestyle

Risk Estimation
        ↓
Mengestimasi risiko berdasarkan model
```

---

## BR-SCORE-005 — Lifestyle Score Range

Lifestyle Score menggunakan rentang:

```text
0 – 100
```

---

## BR-SCORE-006 — Score Interpretation

Contoh interpretasi:

|  Score | Status            |
| -----: | ----------------- |
| 80–100 | Excellent         |
|  60–79 | Good              |
|  40–59 | Needs Improvement |
|   0–39 | High Attention    |

Label akhir harus konsisten di seluruh aplikasi.

---

# 14.8 Risk Estimation Rules

## BR-RISK-001 — Risk Estimation Purpose

Risk Estimation digunakan untuk menghasilkan **estimated risk**, bukan diagnosis.

Output harus selalu menggunakan istilah:

```text
Estimated Risk
```

dan bukan:

```text
Diagnosis
Confirmed Disease
Medical Result
```

---

## BR-RISK-002 — Risk Output

MVP dapat menyediakan tiga estimasi utama:

```text
Estimated Diabetes Risk
Estimated Hypertension Risk
Estimated Cardiovascular Risk
```

---

## BR-RISK-003 — Risk Range

Risk score ditampilkan dalam rentang:

```text
0% – 100%
```

---

## BR-RISK-004 — Risk Interpretation

Contoh kategori:

| Risk Score | Interpretation          |
| ---------: | ----------------------- |
|      0–29% | Lower Estimated Risk    |
|     30–59% | Moderate Estimated Risk |
|    60–100% | Higher Estimated Risk   |

Kategori ini merupakan kategori interpretasi produk dan tidak boleh diklaim sebagai klasifikasi klinis.

---

## BR-RISK-005 — No Diagnosis

HELIORA tidak boleh menghasilkan pernyataan seperti:

```text
"You have diabetes."
```

atau:

```text
"You are diagnosed with hypertension."
```

Sebagai gantinya:

```text
"Your estimated diabetes risk is elevated based on the information provided."
```

---

# 14.9 Preventive Lifestyle Risk Engine Rules

## BR-RISK-006 — Single Preventive Risk Engine

MVP menggunakan satu **Preventive Lifestyle Risk Engine** sebagai komponen utama machine learning.

Engine menerima health/lifestyle profile sebagai input.

```text
User Profile
     ↓
Feature Processing
     ↓
Preventive Lifestyle Risk Engine
     ↓
Risk Estimation
```

---

## BR-RISK-007 — Model Output

Risk Engine dapat menghasilkan:

```text
risk_diabetes
risk_hypertension
risk_cardiovascular
```

Model tidak boleh digunakan untuk clinical diagnosis.

---

## BR-RISK-008 — Input Consistency

Input yang digunakan pada training dan inference harus memiliki definisi feature yang konsisten.

Feature engineering harus menghasilkan struktur data yang sama antara:

```text
Training
```

dan

```text
Production Inference
```

---

# 14.10 Explainable AI Rules

## BR-XAI-001 — Explainability Requirement

Setiap hasil risk estimation harus dapat dijelaskan berdasarkan faktor input yang berkontribusi terhadap hasil model.

---

## BR-XAI-002 — Explanation Method

MVP menggunakan:

```text
SHAP
```

sebagai metode explainability utama.

LIME dapat digunakan sebagai alternatif apabila SHAP tidak sesuai dengan model yang digunakan.

---

## BR-XAI-003 — Top Contributing Factors

Sistem harus dapat menampilkan beberapa faktor utama yang paling berkontribusi terhadap hasil.

Contoh:

```text
Top Factors

1. Low physical activity
2. High BMI
3. Short sleep duration
4. Smoking status
```

---

## BR-XAI-004 — Explanation Language

Explanation harus menggunakan bahasa yang dapat dipahami pengguna umum.

Contoh:

```text
Low physical activity is one of the factors
contributing to your estimated risk.
```

bukan:

```text
Feature x_17 has SHAP value = -0.382.
```

Nilai teknis SHAP dapat digunakan pada technical/debugging layer, tetapi tidak menjadi output utama pengguna.

---

# 14.11 Future Health Simulation Rules

## BR-SIM-001 — Simulation Purpose

Future Health Simulation digunakan untuk membantu pengguna mengeksplorasi **perubahan output model berdasarkan lifestyle scenario**. Simulation merupakan model-based scenario projection, bukan clinical forecast dan bukan prediksi medis pasti.

---

## BR-SIM-002 — Simulation Period

MVP menggunakan tiga horizon produk:

```text
30 Days
90 Days
180 Days
```

Horizon adalah parameter tampilan/skenario dan tidak boleh ditafsirkan sebagai jaminan bahwa outcome medis akan terjadi pada hari tersebut.

---

## BR-SIM-003 — Simulation Method

```text
Current Input
      ↓
Define Scenario Assumptions
      ↓
Modify Lifestyle Parameters
      ↓
Re-run Risk Engine
      ↓
Compare Baseline vs Simulated Result
```

---

## BR-SIM-004 — Simulation Interpretation

Output wajib diberi label sebagai simulated/model-estimated change. Sistem dilarang menyajikan hasil sebagai future clinical outcome atau certainty statement.

---


# 14.12 What-if Simulation Rules

## BR-WHATIF-001 — What-if Purpose

What-if Simulation memungkinkan pengguna mengubah parameter lifestyle dan melihat perubahan hasil secara interaktif.

---

## BR-WHATIF-002 — Supported Parameters

MVP minimal mendukung:

- sleep duration;
- physical activity;
- weight.

Parameter tambahan dapat ditambahkan apabila tersedia pada model.

---

## BR-WHATIF-003 — Independent Simulation

Perubahan parameter What-if tidak boleh langsung mengubah data profile pengguna.

Contoh:

```text
Current Weight = 80 kg

What-if Weight = 75 kg
```

Perubahan tersebut hanya berlaku pada simulation.

---

## BR-WHATIF-004 — Recalculation

Setelah parameter berubah:

```text
What-if Input
     ↓
Feature Processing
     ↓
Risk Engine
     ↓
New Risk
     ↓
Compare with Baseline
```

---

## BR-WHATIF-005 — Baseline

Baseline harus selalu berasal dari kondisi aktual pengguna pada saat simulation dimulai.

---

## BR-WHATIF-006 — Comparison

Sistem harus dapat menunjukkan perubahan:

```text
Baseline Risk
       ↓
What-if Risk
       ↓
Risk Difference
```

Contoh:

```text
Diabetes Risk

Baseline: 42%
What-if: 35%

Change: -7 percentage points
```

Perubahan tersebut harus disebut sebagai **perubahan estimasi model**, bukan penurunan risiko medis yang telah terbukti.

---

# 14.13 Recommendation Engine Rules

## BR-REC-001 — Rule-Based Recommendation

Recommendation Engine menggunakan Rule Engine, bukan LLM.

Tujuannya:

- konsisten;
- deterministic;
- mudah diuji;
- mudah diaudit;
- mudah dijelaskan.

---

## BR-REC-002 — Recommendation Priority

Recommendation diprioritaskan berdasarkan faktor lifestyle yang membutuhkan perhatian terbesar.

Contoh:

```text
High Priority
↓
Low physical activity

Medium Priority
↓
Short sleep duration

Low Priority
↓
Weight management
```

---

## BR-REC-003 — Physical Activity Rule

Jika aktivitas fisik pengguna berada di bawah target preventive yang digunakan oleh guideline:

```text
IF physical_activity < target
THEN recommend increasing physical activity
```

Recommendation harus menggunakan bahasa non-clinical.

Contoh:

> Pertimbangkan meningkatkan aktivitas fisik secara bertahap sesuai kemampuan Anda.

---

## BR-REC-004 — Sleep Rule

Jika sleep duration berada di bawah target:

```text
IF sleep_duration < recommended_range
THEN recommend improving sleep duration
```

---

## BR-REC-005 — Smoking Rule

Jika pengguna merupakan smoker:

```text
IF smoking_status = smoker
THEN recommend smoking cessation support
```

---

## BR-REC-006 — BMI Rule

Jika BMI berada pada kategori yang memerlukan perhatian:

```text
IF BMI > configured_threshold
THEN recommend healthy weight management
```

Recommendation tidak boleh memberikan diagnosis obesitas tanpa konteks yang sesuai.

---

## BR-REC-007 — Recommendation Source

Recommendation rule harus memiliki sumber evidence atau guideline yang dapat ditelusuri.

Contoh:

```text
Rule
  ↓
Guideline Reference
  ↓
Recommendation
```

---

# 14.14 Evidence Center Rules

## BR-EVIDENCE-001 — Evidence Requirement

Recommendation yang berkaitan dengan health guidance harus memiliki evidence yang dapat ditelusuri apabila evidence tersedia.

---

## BR-EVIDENCE-002 — Evidence Sources

MVP menggunakan sumber berkualitas tinggi seperti:

- WHO;
- Kementerian Kesehatan Republik Indonesia;
- PERKENI;
- PERKI;
- CDC;
- scientific publications.

---

## BR-EVIDENCE-003 — Evidence Hierarchy

Prioritas sumber:

```text
Official Guideline
       ↓
Professional Medical Organization
       ↓
Government Health Institution
       ↓
Peer-reviewed Scientific Publication
```

---

## BR-EVIDENCE-004 — Evidence Metadata

Setiap evidence minimal memiliki:

- evidence ID;
- title;
- organization/author;
- publication date/year;
- evidence type;
- source URL/DOI/reference;
- category/topic;
- evidence summary;
- last verified date.

Metadata evidence harus berasal dari knowledge base yang diverifikasi. LLM tidak boleh membuat atau mengubah citation metadata.

---


## BR-EVIDENCE-005 — Evidence Transparency

Pengguna harus dapat mengetahui alasan rekomendasi melalui fitur seperti:

```text
Why this recommendation?
```

yang mengarah ke evidence terkait.

---

# 14.15 LLM Rules

## BR-LLM-000 — Non-Blocking Dependency

LLM merupakan enhancement layer. Core risk estimation, XAI, recommendation, dan safety flow harus tetap berfungsi apabila layanan LLM tidak tersedia.

Jika LLM gagal:

- deterministic/template explanation digunakan;
- risk result tetap ditampilkan;
- recommendation tetap ditampilkan;
- sistem tidak membuat klaim kesehatan baru;
- error tidak mengekspos data sensitif.

---


## BR-LLM-001 — LLM Is Not Risk Engine

LLM tidak boleh digunakan untuk menentukan risk score.

Arsitektur:

```text
User Input
    ↓
ML Risk Engine
    ↓
Risk Result
    ↓
LLM
    ↓
Human-Friendly Explanation
```

Bukan:

```text
User Input
    ↓
LLM
    ↓
Medical Risk
```

---

## BR-LLM-002 — LLM Purpose

LLM hanya digunakan untuk:

- menjelaskan hasil;
- menyusun narasi;
- menyederhanakan bahasa teknis;
- merangkum evidence;
- membantu pengguna memahami recommendation.

---

## BR-LLM-003 — Grounded Explanation

LLM harus menerima data hasil model dan evidence yang relevan sebagai context.

LLM tidak boleh mengarang evidence.

---

## BR-LLM-004 — No Medical Diagnosis

LLM tidak boleh memberikan:

- diagnosis;
- prescription;
- treatment plan;
- definitive medical conclusion.

---

## BR-LLM-005 — Evidence Citation

Jika LLM menghasilkan penjelasan berbasis evidence, source harus dapat ditelusuri melalui Evidence Center.

---

# 14.16 RAG Rules

## BR-EVIDENCE-006 — RAG Knowledge Base

RAG menggunakan knowledge base terkurasi yang berisi dokumen kesehatan terpercaya.

MVP tidak membutuhkan knowledge base dalam jumlah besar.

Target:

```text
±15–30 high-quality documents
```

---

## BR-EVIDENCE-007 — Document Quality

Dokumen RAG harus:

- relevan dengan preventive health;
- berasal dari sumber terpercaya;
- memiliki metadata;
- dapat ditelusuri;
- tidak berasal dari sumber yang tidak jelas.

---

## BR-EVIDENCE-008 — Retrieval

RAG hanya mengambil evidence yang relevan dengan konteks recommendation atau explanation.

---

## BR-EVIDENCE-009 — No Unsupported Claim

Jika evidence tidak ditemukan, sistem tidak boleh membuat klaim seolah-olah terdapat evidence.

---

# 14.17 Safety Guardrail Rules

## BR-SAFETY-001 — Safety Threshold

Jika estimated risk melewati threshold safety yang dikonfigurasi, sistem harus memberikan safety message.

Contoh:

```text
Estimated risk above configured threshold
        ↓
Safety Guardrail
        ↓
Recommend consulting a healthcare professional
```

---

## BR-SAFETY-002 — Safety Message

Contoh:

> Hasil estimasi Anda menunjukkan tingkat risiko yang perlu diperhatikan. Pertimbangkan untuk berkonsultasi dengan tenaga kesehatan untuk mendapatkan penilaian yang sesuai.

---

## BR-SAFETY-003 — No Emergency Diagnosis

HELIORA tidak boleh menyatakan bahwa pengguna sedang mengalami kondisi medis darurat berdasarkan hasil model.

---

## BR-SAFETY-004 — Medical Disclaimer

Medical disclaimer harus tersedia pada:

- onboarding;
- health analysis;
- risk result;
- simulation;
- recommendation;
- LLM explanation.

---

# 14.18 Data Validation Rules

## BR-DATA-001 — Required Field Validation

Field mandatory harus divalidasi sebelum analysis dijalankan.

---

## BR-DATA-002 — Invalid Input

Jika input tidak valid, sistem harus:

1. menolak input;
2. memberikan error message;
3. menjelaskan field yang bermasalah;
4. tidak menjalankan risk engine.

---

## BR-DATA-003 — Missing Data

Missing optional data tidak boleh menghentikan proses analysis.

Missing required data harus menghentikan analysis sampai data dilengkapi.

---

## BR-DATA-004 — Unit Consistency

Sistem harus menggunakan satuan standar:

| Data              | Unit                          |
| ----------------- | ----------------------------- |
| Height            | cm                            |
| Weight            | kg                            |
| Sleep             | hours/day                     |
| Physical Activity | minutes/week                  |
| Blood Pressure    | mmHg                          |
| Blood Sugar       | sesuai definisi dataset/model |

---

# 14.19 Simulation Data Integrity

## BR-SIM-007 — No Permanent Mutation

Data simulation tidak boleh mengubah health profile asli.

```text
Actual Profile
     │
     ├──────────────→ Current Analysis
     │
     └──────────────→ Simulation Copy
                              │
                              ↓
                         What-if Input
```

---

## BR-SIM-008 — Simulation Reset

Pengguna dapat mengembalikan simulation ke baseline.

```text
Reset
  ↓
Original User Input
```

---

# 14.20 Score & Risk Consistency Rules

## BR-SCORE-007 — Same Input, Same Result

Dengan model, preprocessing, dan configuration yang sama, input yang sama harus menghasilkan hasil yang konsisten.

---

## BR-SCORE-008 — Model Version

Setiap risk estimation harus dapat dikaitkan dengan model version.

Contoh:

```text
model_version = v1.0.0
```

Hal ini diperlukan untuk traceability.

---

## BR-SCORE-009 — Simulation Model Version

Simulation harus menggunakan model version yang konsisten dengan baseline analysis.

---

# 14.21 Recommendation Consistency

Recommendation Engine harus bersifat deterministic.

Input yang sama harus menghasilkan recommendation yang sama selama rule configuration tidak berubah.

```text
Same Input
    +
Same Rules
    ↓
Same Recommendation
```

LLM hanya bertugas mengubah recommendation menjadi penjelasan yang lebih natural.

---

# 14.22 Business Rules Priority

Apabila terjadi konflik antara rules, urutan prioritas adalah:

```text
1. Safety Rules
       ↓
2. Data Validation Rules
       ↓
3. Risk Rules
       ↓
4. Recommendation Rules
       ↓
5. Explanation Rules
       ↓
6. Presentation Rules
```

Safety selalu memiliki prioritas tertinggi.

---

# 14.23 Rule Engine Processing Flow

Alur business rule secara keseluruhan:

```text
User Input
    │
    ▼
Data Validation
    │
    ├── Invalid ──→ Validation Error
    │
    ▼
Health Profile
    │
    ▼
Feature Processing
    │
    ▼
Preventive Lifestyle Risk Engine
    │
    ├──────────────┐
    ▼              ▼
Risk Estimation   Score Calculation
    │              │
    └──────┬───────┘
           ▼
      Explainable AI
           │
           ▼
    Safety Evaluation
           │
           ▼
    Recommendation
           │
           ▼
      Evidence RAG
           │
           ▼
      LLM Explanation
           │
           ▼
       User Output
```

---

# 14.24 What-if Business Rule Flow

```text
Current User Profile
        │
        ▼
      Baseline
        │
        ▼
User Changes Parameter
        │
        ▼
Validate Simulation Input
        │
        ▼
Create Simulation State
        │
        ▼
Re-run Risk Engine
        │
        ▼
Calculate New Score/Risk
        │
        ▼
Compare With Baseline
        │
        ▼
Generate Recommendation
        │
        ▼
Display Result
```

---

# 14.25 Future Health Simulation Rule Flow

```text
Current Lifestyle
        │
        ▼
Select Time Horizon
        │
 ┌──────┼──────┐
 ▼      ▼      ▼
30d    90d    180d
 │      │      │
 └──────┼──────┘
        ▼
Apply Simulation Assumptions
        │
        ▼
Re-run Risk Engine
        │
        ▼
Compare With Current State
        │
        ▼
Display Projected Result
```

Future Health Simulation harus selalu diberi label sebagai:

```text
Simulation
```

atau:

```text
Projected Estimate
```

dan bukan:

```text
Predicted Medical Condition
```

---

# 14.26 Data Source Rules

## BR-DATA-005 — Machine Learning Dataset

MVP menggunakan satu dataset utama untuk training Preventive Lifestyle Risk Engine.

Dataset utama harus memiliki feature lifestyle yang relevan dengan model.

---

## BR-DATA-006 — Dataset International

Dataset internasional dapat digunakan untuk training apabila memenuhi kebutuhan feature dan target model.

---

## BR-DATA-007 — Indonesia Context

Data Indonesia digunakan sebagai konteks validasi dan pendukung problem statement.

Contoh sumber:

- Survei Kesehatan Indonesia;
- IFLS;
- BPS;
- publikasi kesehatan pemerintah.

Data tersebut tidak wajib digunakan sebagai training dataset MVP apabila akses atau struktur datanya tidak mendukung timeline kompetisi.

---

## BR-DATA-008 — Dataset License

Setiap dataset yang digunakan harus memiliki status penggunaan yang jelas.

Dataset dengan proses akses khusus tidak boleh menjadi dependency utama yang dapat menghambat development MVP.

---

# 14.27 RAG Content Rules

Dokumen RAG harus melalui proses:

```text
Collect
   ↓
Verify Source
   ↓
Clean
   ↓
Extract Metadata
   ↓
Chunk
   ↓
Embed
   ↓
Store
   ↓
Retrieve
```

Dokumen yang tidak dapat diverifikasi sumbernya tidak boleh digunakan sebagai evidence utama.

---

# 14.28 Auditability Rules

## BR-AUDIT-001 — Model Traceability

Sistem harus dapat mengetahui:

- model version;
- input feature;
- analysis timestamp;
- result;
- recommendation rule;
- evidence reference.

---

## BR-AUDIT-002 — Recommendation Traceability

Setiap recommendation harus dapat ditelusuri ke rule yang menghasilkan recommendation tersebut.

Contoh:

```text
Recommendation
      ↓
Rule ID
      ↓
Evidence ID
      ↓
Source Document
```

---

## BR-AUDIT-003 — LLM Traceability

Output LLM harus dapat dikaitkan dengan:

- risk result;
- recommendation;
- retrieved evidence.

---

# 14.29 Error Handling Rules

## BR-DATA-010 — Model Failure

Jika Risk Engine gagal memproses input:

```text
Risk Engine Error
       ↓
Do not generate risk result
       ↓
Show safe error message
```

Sistem tidak boleh mengarang hasil sebagai fallback.

---

## BR-LLM-006 — LLM Failure

Jika LLM gagal:

```text
LLM Failure
    ↓
Show structured recommendation
    +
Evidence
```

Fitur utama HELIORA tetap harus dapat digunakan tanpa LLM.

---

## BR-EVIDENCE-010 — RAG Failure

Jika RAG gagal mengambil evidence:

```text
RAG Failure
    ↓
Do not fabricate citation
    ↓
Show recommendation without unsupported claim
```

---

# 14.30 Business Rules for MVP Priority

Tidak semua business rules memiliki prioritas implementasi yang sama.

### P0 — Mandatory

- Authentication;
- consent;
- health profile validation;
- BMI calculation;
- Health Score;
- Lifestyle Score;
- risk estimation;
- SHAP/XAI;
- What-if Simulation;
- Recommendation Engine;
- safety guardrail;
- medical disclaimer.

### P1 — Important

- Future Health Simulation;
- Evidence Center;
- RAG;
- LLM explanation;
- model versioning;
- recommendation traceability.

### P2 — Future Enhancement

- advanced personalization;
- automatic model recalibration;
- advanced fairness analysis;
- advanced longitudinal prediction;
- additional disease risk models;
- advanced clinical integration.

---

# 14.31 Core Business Rule Summary

| Rule ID         | Rule                                          | Priority |
| --------------- | --------------------------------------------- | -------- |
| BR-AUTH-001     | Authentication required for personal analysis | P0       |
| BR-CONSENT-001  | Consent required before health analysis       | P0       |
| BR-PROFILE-001  | Required health profile fields                | P0       |
| BR-SCORE-001    | Health Score calculation                      | P0       |
| BR-SCORE-004    | Lifestyle Score calculation                   | P0       |
| BR-RISK-001     | Risk is estimation, not diagnosis             | P0       |
| BR-XAI-001      | Risk result must be explainable               | P0       |
| BR-WHATIF-001   | What-if simulation                            | P0       |
| BR-REC-001      | Rule-based recommendation                     | P0       |
| BR-SAFETY-001   | Safety threshold                              | P0       |
| BR-SIM-001      | Future simulation                             | P1       |
| BR-EVIDENCE-001 | Evidence-backed recommendation                | P1       |
| BR-LLM-001      | LLM does not calculate risk                   | P1       |
| BR-EVIDENCE-006 | RAG knowledge base                            | P1       |
| BR-AUDIT-001    | Model traceability                            | P1       |

---

# 14.32 Business Rules Design Principles

Business Rules HELIORA harus mengikuti prinsip berikut:

### 1. Safety First

Keselamatan pengguna lebih penting daripada kelengkapan output.

### 2. Model Is Not Diagnosis

Machine Learning digunakan untuk estimation, bukan diagnosis.

### 3. Rule Engine Is Deterministic

Recommendation utama harus dapat diprediksi dan diuji.

### 4. LLM Is an Explanation Layer

LLM tidak boleh menjadi sumber utama medical decision.

### 5. Evidence Must Be Traceable

Recommendation harus dapat ditelusuri ke sumber yang relevan.

### 6. Simulation Is Exploratory

Simulation digunakan untuk mengeksplorasi skenario, bukan menjanjikan kondisi masa depan.

### 7. User Data Is Private

Data health profile harus dilindungi dan hanya digunakan sesuai tujuan yang telah disetujui.

### 8. MVP Must Remain Simple

Business rules harus mendukung scope MVP dan tidak menambahkan kompleksitas yang tidak diperlukan.

---

# 14.33 Final Business Rule Statement

Business Rules HELIORA dirancang untuk memastikan bahwa seluruh proses dari input pengguna hingga output AI berjalan secara **konsisten, explainable, evidence-based, dan aman**.

Secara konseptual:

```text
Personal Health Data
        ↓
Validation
        ↓
Risk Estimation
        ↓
Explainability
        ↓
Safety Check
        ↓
Simulation
        ↓
Rule-Based Recommendation
        ↓
Evidence Retrieval
        ↓
LLM Explanation
        ↓
Preventive Action
```

HELIORA tidak bertujuan menggantikan tenaga kesehatan.

Tujuan utama Business Rules adalah memastikan bahwa HELIORA memberikan **preventive health intelligence** yang membantu pengguna memahami kondisi lifestyle mereka, mengeksplorasi perubahan yang mungkin dilakukan, dan memperoleh rekomendasi yang dapat ditelusuri berdasarkan evidence.

> **HELIORA provides preventive health insights and simulations, not medical diagnosis or clinical decision-making.**

---

# 15. Acceptance Criteria

## 15.1 Overview

Acceptance Criteria merupakan kriteria yang digunakan untuk menentukan apakah setiap fitur dan kebutuhan utama HELIORA telah diimplementasikan sesuai dengan Product Requirements Document (PRD).

Acceptance Criteria digunakan sebagai dasar untuk:

- validasi hasil implementasi fitur;
- functional testing;
- user acceptance testing;
- quality gate sebelum release;
- evaluasi kesiapan MVP;
- validasi terhadap kebutuhan kompetisi;
- memastikan batasan medical dan AI safety tetap terpenuhi.

Sebuah fitur dianggap **Accepted** apabila seluruh acceptance criteria yang telah ditentukan terpenuhi dan tidak terdapat defect kritis yang menghambat penggunaan fitur tersebut.

---

## 15.2 Acceptance Status

Setiap requirement dapat memiliki salah satu status berikut:

| Status        | Deskripsi                                                      |
| ------------- | -------------------------------------------------------------- |
| `Not Started` | Fitur belum mulai dikembangkan                                 |
| `In Progress` | Fitur sedang dalam proses pengembangan                         |
| `Testing`     | Fitur telah dikembangkan dan sedang diuji                      |
| `Accepted`    | Seluruh acceptance criteria telah terpenuhi                    |
| `Blocked`     | Pengembangan atau pengujian terhambat oleh dependency tertentu |
| `Rejected`    | Implementasi tidak memenuhi acceptance criteria                |

---

## 15.3 General Acceptance Criteria

MVP HELIORA dinyatakan memenuhi acceptance criteria umum apabila:

- seluruh fitur MVP utama telah dapat digunakan;
- user dapat menyelesaikan primary user journey tanpa bantuan teknis;
- tidak terdapat critical bug pada primary user journey;
- seluruh output AI memiliki konteks yang jelas;
- sistem tidak menyatakan hasil sebagai diagnosis medis;
- safety disclaimer ditampilkan pada area yang relevan;
- data pengguna diproses sesuai dengan consent;
- sistem dapat menangani input yang tidak valid;
- sistem dapat memberikan feedback ketika terjadi error;
- fitur utama dapat digunakan pada environment deployment;
- seluruh requirement prioritas MVP telah diverifikasi melalui testing.

---

# 15.4 Authentication Acceptance Criteria

## AC-AUTH-01 — User Registration

**Given** user berada pada halaman registration  
**When** user mengisi data yang valid dan melakukan registrasi  
**Then** sistem harus membuat akun baru.

Acceptance criteria:

- email atau identifier yang digunakan harus memiliki format valid;
- password harus memenuhi minimum security requirement;
- password tidak boleh disimpan dalam bentuk plaintext;
- sistem menolak identifier yang sudah digunakan;
- sistem memberikan feedback ketika registrasi berhasil;
- user dapat melanjutkan ke proses login.

---

## AC-AUTH-02 — User Login

**Given** user telah memiliki akun  
**When** user memasukkan credential yang valid  
**Then** sistem harus mengautentikasi user dan memberikan akses ke aplikasi.

Acceptance criteria:

- credential yang valid dapat digunakan untuk login;
- credential yang salah ditolak;
- error message tidak membocorkan informasi sensitif;
- session atau authentication token dibuat secara aman;
- user diarahkan ke dashboard setelah login berhasil.

---

## AC-AUTH-03 — Logout

**Given** user sedang login  
**When** user melakukan logout  
**Then** session authentication harus dihentikan.

Acceptance criteria:

- user tidak dapat mengakses halaman protected setelah logout;
- token/session yang relevan dinonaktifkan atau tidak lagi dapat digunakan;
- user diarahkan ke halaman login atau landing page.

---

# 15.5 Consent Acceptance Criteria

## AC-CONSENT-01 — Privacy Consent

**Given** user belum memberikan consent  
**When** user pertama kali memulai penggunaan fitur health assessment  
**Then** sistem harus menampilkan consent.

Acceptance criteria:

- consent ditampilkan sebelum health data diproses;
- tujuan penggunaan data dijelaskan secara sederhana;
- user dapat menyetujui atau menolak;
- user tidak dapat melanjutkan assessment apabila consent wajib belum diberikan;
- status consent disimpan bersama akun atau session yang relevan.

---

## AC-CONSENT-02 — Medical Disclaimer

Sistem harus menampilkan disclaimer bahwa HELIORA bukan alat diagnosis medis.

Minimal informasi yang harus disampaikan:

> HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi berdasarkan data dan model yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi dokter.

---

# 15.6 Health Profile Acceptance Criteria

## AC-PROFILE-01 — Health Data Input

User harus dapat memasukkan data health profile yang diperlukan oleh Preventive Lifestyle Risk Engine.

Minimum input MVP:

- Age;
- Gender;
- Height;
- Weight;
- Physical Activity;
- Sleep Duration;
- Smoking Status;
- Family History.

Acceptance criteria:

- seluruh required field dapat diisi;
- sistem melakukan validasi terhadap input;
- sistem menolak nilai yang tidak masuk akal;
- sistem memberikan pesan error yang mudah dipahami;
- data yang valid dapat disimpan;
- data profile dapat digunakan oleh risk engine.

---

## AC-PROFILE-02 — Data Validation

Sistem harus melakukan validation terhadap health input.

Contoh:

| Input             | Validation                                             |
| ----------------- | ------------------------------------------------------ |
| Age               | Tidak boleh negatif atau di luar range yang ditentukan |
| Height            | Harus berupa nilai positif                             |
| Weight            | Harus berupa nilai positif                             |
| Sleep Duration    | Harus berada pada range yang valid                     |
| Physical Activity | Harus menggunakan unit yang konsisten                  |
| Smoking           | Harus menggunakan pilihan yang telah ditentukan        |
| Family History    | Harus menggunakan pilihan yang telah ditentukan        |

---

# 15.7 Health Score Acceptance Criteria

## AC-SCORE-01 — Health Score

Sistem harus dapat menghasilkan Health Score berdasarkan data lifestyle user.

Acceptance criteria:

- score selalu berada dalam range yang telah ditentukan;
- score dihitung secara konsisten untuk input yang sama;
- perubahan input yang relevan dapat memengaruhi score;
- score tidak boleh menghasilkan nilai `NaN`, `null`, atau error;
- hasil score harus dapat dijelaskan kepada user.

---

## AC-SCORE-02 — Lifestyle Score

Sistem harus menghasilkan Lifestyle Score berdasarkan faktor lifestyle.

Faktor yang dapat digunakan meliputi:

- BMI;
- physical activity;
- sleep duration;
- smoking status;
- faktor lifestyle lainnya yang telah ditentukan dalam model.

Acceptance criteria:

- score dihitung berdasarkan formula yang terdokumentasi;
- bobot setiap faktor terdokumentasi;
- score dapat direproduksi menggunakan input yang sama;
- score tidak diposisikan sebagai diagnosis medis.

---

## 15.8 Risk Estimation Acceptance Criteria

### AC-RISK-01 — Preventive Lifestyle Risk Engine

Sistem harus dapat memproses health profile user dan menghasilkan model-estimated risk output.

Output minimum:

- Estimated Diabetes Risk;
- Estimated Hypertension Risk;
- Estimated Cardiovascular Risk.

Acceptance criteria:

- model/service dapat menerima input dari health profile;
- model menghasilkan output untuk seluruh risk category yang diwajibkan;
- semantics setiap output terdokumentasi;
- output memiliki nilai dan format yang valid;
- output menggunakan terminology `estimated risk`, `risk score`, atau terminology sejenis;
- probability hanya digunakan jika calibration/evaluation memvalidasi semantics tersebut;
- sistem tidak menyatakan output sebagai diagnosis.

---

### AC-RISK-02 — Risk Score Band

Risk output dapat dipetakan ke product-defined score band untuk membantu pemahaman user.

| Score Band | Deskripsi |
| ---------- | --------- |
| Lower | Model-estimated score relatif lebih rendah |
| Moderate | Model-estimated score berada di tingkat menengah |
| Higher | Model-estimated score berada di tingkat lebih tinggi |

Acceptance criteria:

- threshold didokumentasikan;
- threshold disebut sebagai product-defined interpretation range;
- threshold tidak dipresentasikan sebagai clinical threshold;
- threshold ditinjau setelah model evaluation.

---


# 15.9 Explainable AI Acceptance Criteria

## AC-XAI-01 — Risk Explanation

Sistem harus dapat menjelaskan faktor yang berkontribusi terhadap hasil risk estimation.

Acceptance criteria:

- sistem menampilkan faktor utama yang berkontribusi;
- faktor ditampilkan dalam bahasa yang mudah dipahami;
- sistem dapat menunjukkan faktor yang meningkatkan atau menurunkan estimasi risiko;
- explanation berasal dari model atau mekanisme explainability yang digunakan;
- explanation tidak boleh mengklaim hubungan kausal yang tidak didukung.

---

## AC-XAI-02 — SHAP Explanation

Apabila SHAP digunakan sebagai metode Explainable AI:

- SHAP dapat menghasilkan feature contribution;
- feature contribution dapat dipetakan ke input user;
- hasil dapat ditampilkan secara konsisten;
- visualisasi tidak boleh misleading;
- explanation tetap diberi konteks bahwa hasil merupakan interpretasi model.

---

# 15.10 Future Health Simulation Acceptance Criteria

### AC-SIM-01 — Future Health Simulation

User harus dapat melihat model-based scenario projection berdasarkan lifestyle input dan scenario assumptions.

Minimum simulation horizon:

- 30 hari;
- 90 hari;
- 180 hari.

Acceptance criteria:

- user dapat memilih simulation horizon;
- user dapat melihat scenario assumptions yang digunakan;
- sistem menghasilkan simulation result;
- simulation result dapat dibandingkan dengan baseline;
- hasil simulation dapat ditampilkan secara visual;
- label `simulated` atau `model-estimated` ditampilkan;
- simulation tidak boleh dipresentasikan sebagai clinical forecast atau kepastian medis.

---

### AC-SIM-02 — Simulation Methodology

```text
Current User Input
        ↓
Define Scenario Assumptions
        ↓
Modify Input Based on Scenario
        ↓
Re-run Risk Engine
        ↓
Compare Baseline vs Simulated Result
```

Acceptance criteria:

- simulation menggunakan model/service risk engine yang sama dengan baseline risk estimation;
- scenario assumptions dapat ditelusuri;
- input simulation dapat ditelusuri;
- hasil simulation dapat direproduksi;
- perubahan hasil dijelaskan sebagai model contribution, bukan causal certainty;
- disclaimer simulation ditampilkan.

---


# 15.11 What-if Simulation Acceptance Criteria

## AC-WHATIF-01 — Lifestyle Parameter Modification

User harus dapat mengubah parameter lifestyle tertentu.

Minimum parameter:

- Sleep Duration;
- Physical Activity;
- Weight.

Acceptance criteria:

- user dapat mengubah parameter;
- sistem memperbarui simulation result;
- perubahan parameter tidak mengubah data profile utama sebelum user menyimpan perubahan;
- hasil dapat dibandingkan dengan baseline;
- sistem tidak membutuhkan proses manual untuk setiap perubahan.

---

## AC-WHATIF-02 — Real-time Risk Update

Ketika user mengubah parameter What-if Simulation:

```text
User Changes Parameter
        ↓
Input Validation
        ↓
Risk Engine
        ↓
Updated Risk
        ↓
Updated Score
```

Acceptance criteria:

- perubahan dapat diproses secara interaktif;
- hasil diperbarui tanpa reload penuh apabila memungkinkan;
- response time memenuhi target NFR;
- sistem tetap stabil ketika parameter diubah berulang kali.

---

# 15.12 Recommendation Engine Acceptance Criteria

## AC-REC-01 — Rule-Based Recommendation

Sistem harus menghasilkan rekomendasi berdasarkan rule yang telah ditentukan.

Contoh:

| Condition                | Recommendation                                              |
| ------------------------ | ----------------------------------------------------------- |
| Sleep < 6 hours          | Tingkatkan durasi tidur menuju target yang direkomendasikan |
| Physical Activity rendah | Tingkatkan aktivitas fisik secara bertahap                  |
| BMI tinggi               | Pertimbangkan target pengelolaan berat badan                |
| Smoking aktif            | Pertimbangkan program berhenti merokok                      |

Acceptance criteria:

- rule dapat dieksekusi secara konsisten;
- rekomendasi sesuai dengan kondisi user;
- rule dapat ditelusuri ke sumber evidence;
- rekomendasi tidak dibuat sebagai diagnosis;
- recommendation engine tidak bergantung pada LLM untuk menentukan rule.

---

## AC-REC-02 — Recommendation Priority

Apabila terdapat lebih dari satu rekomendasi:

- sistem harus menentukan prioritas;
- rekomendasi paling relevan ditampilkan terlebih dahulu;
- jumlah rekomendasi tidak boleh berlebihan;
- user dapat memahami tindakan utama yang disarankan.

---

# 15.13 Evidence Center Acceptance Criteria

## AC-EVIDENCE-01 — Evidence Retrieval

Sistem harus menyediakan evidence yang relevan terhadap recommendation atau explanation.

Evidence dapat berasal dari:

- WHO;
- Kementerian Kesehatan RI;
- PERKENI;
- PERKI;
- CDC;
- scientific publications.

Acceptance criteria:

- setiap evidence memiliki source;
- source dapat diidentifikasi;
- evidence relevan dengan recommendation;
- metadata sumber disimpan;
- sistem tidak mengarang sumber atau referensi.

---

## AC-EVIDENCE-02 — Evidence Explanation

User harus dapat memahami mengapa recommendation diberikan.

Contoh flow:

```text
Recommendation
      ↓
Why this recommendation?
      ↓
Evidence
      ↓
Source
      ↓
Evidence Strength / Context
```

---

# 15.14 LLM + RAG Acceptance Criteria

### AC-LLM-01 — Human-Friendly Explanation

LLM hanya digunakan untuk membantu menjelaskan output sistem dan bukan sebagai primary risk prediction engine.

Acceptance criteria:

- LLM menerima structured result dari sistem;
- LLM tidak menghitung risk score secara bebas;
- LLM tidak mengubah hasil model;
- LLM menghasilkan explanation berdasarkan data yang diberikan;
- output menggunakan bahasa yang mudah dipahami;
- LLM bukan dependency untuk core risk estimation;
- deterministic fallback tersedia ketika LLM gagal;
- fallback tidak mengarang evidence atau recommendation baru.

---

### AC-LLM-02 — RAG Grounding

LLM harus menggunakan evidence yang tersedia melalui knowledge base ketika menghasilkan explanation berbasis evidence.

Acceptance criteria:

- retrieval dilakukan sebelum generation;
- response memiliki referensi evidence;
- LLM tidak boleh mengklaim sumber yang tidak tersedia;
- jika evidence tidak ditemukan, sistem memberikan response yang aman;
- hallucinated citation diminimalkan dan diuji.

---


# 15.15 Safety Guardrail Acceptance Criteria

## AC-SAFETY-01 — High Risk Warning

Apabila estimated risk melewati threshold safety yang telah ditentukan:

```text
Risk Threshold Exceeded
        ↓
Safety Rule
        ↓
Health Advisory
        ↓
Consider Professional Consultation
```

Acceptance criteria:

- warning ditampilkan secara jelas;
- warning tidak menyatakan user pasti memiliki penyakit;
- sistem menyarankan konsultasi tenaga kesehatan apabila diperlukan;
- warning tidak memberikan diagnosis;
- warning tidak memberikan resep atau treatment plan.

---

## AC-SAFETY-02 — Medical Boundary

HELIORA tidak boleh:

- memberikan diagnosis;
- memberikan resep obat;
- menentukan dosis obat;
- menggantikan dokter;
- memberikan emergency treatment;
- mengklaim hasil simulation sebagai kondisi medis pasti.

---

# 15.16 Dashboard Acceptance Criteria

## AC-DASH-01 — Personalized Dashboard

Setelah assessment selesai, user harus dapat melihat:

- Health Score;
- Lifestyle Score;
- estimated risk;
- risk category;
- faktor utama yang memengaruhi hasil;
- rekomendasi utama;
- akses menuju simulation;
- akses menuju evidence.

---

## AC-DASH-02 — Dashboard Consistency

Dashboard harus menampilkan data yang konsisten dengan hasil risk engine.

Acceptance criteria:

- score sama dengan hasil backend;
- risk level sama dengan hasil backend;
- recommendation sesuai dengan rule engine;
- tidak terdapat nilai yang berbeda antara dashboard dan detail result.

---

# 15.17 Error Handling Acceptance Criteria

## AC-ERROR-01 — Invalid Input

Jika user memasukkan data tidak valid:

- sistem menolak input;
- field yang bermasalah ditandai;
- pesan error diberikan;
- user dapat memperbaiki input;
- sistem tidak crash.

---

## AC-ERROR-02 — AI Service Failure

Jika AI service mengalami kegagalan:

- sistem tidak menampilkan hasil palsu;
- user mendapatkan error message yang jelas;
- sistem dapat melakukan retry jika sesuai;
- aplikasi tetap berada dalam kondisi stabil;
- fallback message tersedia apabila diperlukan.

---

## AC-ERROR-03 — RAG/LLM Failure

Jika LLM atau RAG gagal:

- risk estimation tetap dapat digunakan;
- hasil model tidak berubah;
- recommendation rule tetap dapat digunakan;
- sistem memberikan fallback explanation;
- user diberi informasi bahwa explanation AI sedang tidak tersedia.

---

# 15.18 Performance Acceptance Criteria

MVP harus memenuhi target performa yang ditetapkan pada Non-Functional Requirements.

Target utama:

| Process                   |      Target |
| ------------------------- | ----------: |
| Standard page interaction | < 3 seconds |
| Risk estimation           | < 3 seconds |
| What-if simulation        |  < 1 second |
| LLM + RAG explanation     | < 5 seconds |

Acceptance criteria:

- target diuji pada environment MVP;
- tidak terdapat performance issue yang menghambat primary user journey;
- repeated What-if interaction tetap responsif.

---

# 15.19 Security Acceptance Criteria

Sistem harus memenuhi minimum security requirement.

Acceptance criteria:

- password di-hash;
- authentication menggunakan mekanisme yang aman;
- protected endpoint tidak dapat diakses tanpa authentication;
- authorization diterapkan sesuai kebutuhan;
- input user divalidasi;
- sensitive data tidak ditampilkan pada error message;
- API tidak mengekspos credential;
- secret disimpan melalui environment configuration;
- database access menggunakan credential yang aman.

---

# 15.20 Data Privacy Acceptance Criteria

Acceptance criteria:

- user diberi informasi mengenai penggunaan data;
- consent diperoleh sebelum data health digunakan;
- user dapat menarik consent sesuai kemampuan MVP;
- user memiliki mekanisme penghapusan akun/data sesuai scope MVP;
- hanya data yang diperlukan yang dikumpulkan;
- data tidak dibagikan kepada pihak ketiga tanpa dasar yang sesuai;
- health data yang dikirim ke external AI provider mengikuti privacy policy dan architecture decision yang terdokumentasi;
- data sensitif tidak ditampilkan secara tidak perlu;
- logging tidak menyimpan sensitive health data secara berlebihan;
- retention policy terdokumentasi.

---


# 15.21 Accessibility & Usability Acceptance Criteria

Interface harus dapat digunakan oleh pengguna non-teknis.

Acceptance criteria:

- terminology medis dijelaskan dengan bahasa sederhana;
- primary action mudah ditemukan;
- form memiliki label yang jelas;
- error message mudah dipahami;
- visualisasi tidak menjadi satu-satunya cara menyampaikan informasi penting;
- responsive layout berjalan pada target device MVP;
- user dapat menyelesaikan primary journey tanpa training khusus.

---

# 15.22 Primary User Journey Acceptance Criteria

Primary user journey HELIORA harus dapat diselesaikan secara end-to-end.

```text
Registration / Login
        ↓
Consent
        ↓
Health Profile
        ↓
Health Assessment
        ↓
Risk Estimation
        ↓
Health & Lifestyle Score
        ↓
Explainable AI
        ↓
Recommendation
        ↓
Future Health Simulation
        ↓
What-if Simulation
        ↓
Evidence Center
```

Acceptance criteria:

- setiap tahap dapat dilalui;
- data dari tahap sebelumnya diteruskan dengan benar;
- tidak terdapat dead-end pada flow;
- user dapat kembali ke tahap sebelumnya apabila diperbolehkan;
- hasil akhir dapat dipahami user.

---

# 15.23 AI Pipeline Acceptance Criteria

AI pipeline harus berjalan sesuai architecture yang telah ditetapkan.

```text
User Input
    ↓
Preventive Lifestyle Risk Engine
    ↓
Risk Estimation
    ↓
Explainable AI
    ↓
Future Health Simulation
    ↓
What-if Simulation
    ↓
Recommendation Engine
    ↓
LLM + RAG
    ↓
Human-Friendly Explanation
    ↓
Evidence
```

Acceptance criteria:

- setiap component memiliki responsibility yang jelas;
- LLM tidak menggantikan risk engine;
- Rule Engine tidak digantikan oleh LLM;
- RAG digunakan sebagai evidence layer;
- Explainable AI berasal dari risk model;
- simulation menggunakan output/model yang telah ditentukan;
- seluruh pipeline dapat diuji secara terpisah.

---

# 15.24 MVP Feature Acceptance Matrix

| Feature                  | Acceptance Status |
| ------------------------ | ----------------- |
| Authentication           | Required          |
| Consent                  | Required          |
| Health Profile           | Required          |
| Health Score             | Required          |
| Lifestyle Score          | Required          |
| Risk Estimation          | Required          |
| Explainable AI           | Required          |
| Future Health Simulation | Required          |
| What-if Simulation       | Required          |
| Recommendation Engine    | Required          |
| Evidence Center          | Required          |
| LLM Explanation          | Required          |
| RAG                      | Required          |
| Safety Guardrail         | Required          |
| Dashboard                | Required          |

Seluruh feature dengan status **Required** harus memenuhi acceptance criteria sebelum MVP dinyatakan selesai.

---

# 15.25 Critical Acceptance Criteria

Selain feature-level acceptance criteria, terdapat beberapa kriteria yang bersifat **critical**.

MVP tidak dapat dinyatakan Accepted apabila salah satu kondisi berikut terjadi:

1. Risk engine tidak dapat menghasilkan risk estimation.
2. What-if simulation tidak dapat digunakan.
3. Future Health Simulation tidak dapat digunakan.
4. Explainable AI memberikan explanation yang tidak berkaitan dengan model.
5. Sistem menyatakan hasil sebagai diagnosis medis.
6. Sistem memberikan rekomendasi medis yang tidak sesuai dengan scope.
7. LLM menghasilkan informasi yang bertentangan dengan structured result tanpa guardrail.
8. Evidence Center menampilkan sumber yang tidak valid atau tidak tersedia.
9. Primary user journey mengalami critical error.
10. Terdapat critical security vulnerability.
11. Data health user dapat diakses oleh user yang tidak berwenang.
12. Sistem mengalami crash pada primary user journey.

---

# 15.26 User Acceptance Testing

User Acceptance Testing (UAT) dilakukan untuk memastikan HELIORA dapat digunakan sesuai tujuan produk.

UAT minimum mencakup:

### Scenario 1 — Healthy Lifestyle

User memiliki lifestyle relatif baik.

Expected result:

- system menghasilkan estimated risk;
- score ditampilkan;
- explanation tersedia;
- recommendation tetap relevan;
- tidak terdapat warning yang tidak diperlukan.

### Scenario 2 — Poor Sleep

User memasukkan sleep duration yang rendah.

Expected result:

- lifestyle score terpengaruh;
- relevant risk estimation dapat berubah;
- explanation menunjukkan sleep sebagai salah satu faktor;
- recommendation terkait sleep muncul;
- evidence tersedia.

### Scenario 3 — Low Physical Activity

User memasukkan aktivitas fisik rendah.

Expected result:

- sistem mendeteksi kondisi lifestyle;
- recommendation aktivitas fisik muncul;
- evidence terkait tersedia;
- What-if Simulation dapat menunjukkan perubahan ketika aktivitas ditingkatkan.

### Scenario 4 — Smoking

User memasukkan smoking status aktif.

Expected result:

- smoking menjadi salah satu faktor yang diperhitungkan;
- recommendation preventif dapat ditampilkan;
- evidence tersedia;
- sistem tidak memberikan treatment medis.

### Scenario 5 — What-if Improvement

User mengubah:

```text
Sleep: 5 hours
        ↓
Sleep: 7 hours
```

Expected result:

- simulation result diperbarui;
- perubahan dapat dibandingkan;
- sistem menjelaskan bahwa perubahan merupakan simulation;
- hasil tidak dinyatakan sebagai kepastian medis.

### Scenario 6 — Invalid Input

User memasukkan data invalid.

Expected result:

- input ditolak;
- error ditampilkan;
- sistem tidak crash;
- user dapat memperbaiki data.

---

# 15.27 Acceptance Sign-Off

MVP dapat dinyatakan **Accepted** apabila:

- seluruh critical acceptance criteria terpenuhi;
- seluruh required MVP features telah diuji;
- tidak terdapat critical defect;
- primary user journey berjalan end-to-end;
- AI pipeline berjalan sesuai architecture;
- medical safety boundary telah diverifikasi;
- security requirement minimum telah terpenuhi;
- performance requirement minimum telah terpenuhi;
- dokumentasi utama telah tersedia;
- hasil testing telah direview oleh QA;
- Product & Project Manager menyetujui release MVP.

Final status:

```text
MVP READY FOR RELEASE
```

apabila seluruh kriteria di atas telah terpenuhi.

---

# 15.28 Acceptance Criteria Final Principle

Acceptance Criteria HELIORA berorientasi pada tiga prinsip utama:

### 1. Functional Correctness

Fitur harus bekerja sesuai requirement.

### 2. AI Reliability & Explainability

Output AI harus dapat ditelusuri, dijelaskan, dan tidak memberikan klaim di luar kemampuan model.

### 3. Medical Safety

HELIORA harus selalu memosisikan output sebagai **preventive health estimation dan simulation**, bukan diagnosis medis.

Dengan demikian, keberhasilan MVP tidak hanya diukur dari apakah fitur dapat berjalan, tetapi juga apakah sistem memberikan pengalaman preventive health yang:

- personal;
- explainable;
- interactive;
- evidence-based;
- aman;
- konsisten;
- dan dapat dipertanggungjawabkan.

---

# 16. MVP Roadmap

## 16.1 Overview

MVP HELIORA dikembangkan secara bertahap dengan pendekatan sprint untuk memastikan seluruh fitur utama dapat selesai, terintegrasi, diuji, dan siap digunakan dalam demonstrasi kompetisi.

Roadmap MVP berfokus pada pembangunan **core preventive health experience**, bukan pada pengembangan seluruh kemungkinan fitur kesehatan digital.

Prioritas utama MVP adalah:

1. Personalized Health Profile
2. Preventive Lifestyle Risk Engine
3. Health Score & Lifestyle Score
4. Explainable AI
5. Future Health Simulation
6. What-if Simulation
7. Recommendation Engine
8. Evidence Center berbasis RAG
9. LLM-assisted Explanation
10. Safety Guardrail

---

## 16.2 MVP Development Principles

Pengembangan MVP mengikuti prinsip berikut:

- **Core-first** — fitur inti dikembangkan terlebih dahulu sebelum fitur pendukung.
- **Killer-feature driven** — Future Health Simulation dan What-if Simulation menjadi prioritas utama.
- **Incremental integration** — setiap komponen diintegrasikan setelah fungsi dasarnya stabil.
- **Evidence-based** — recommendation dan explanation harus memiliki dasar evidence yang dapat ditelusuri.
- **Demo-ready** — setiap fase harus menghasilkan increment yang dapat diuji.
- **Quality-first** — stabilitas dan reliability diprioritaskan sebelum penambahan fitur baru.
- **Scope-controlled** — fitur yang tidak berkontribusi langsung terhadap tujuan MVP tidak menjadi prioritas.

---

## 16.3 MVP Roadmap

| Phase    | Fokus                     | Aktivitas Utama                                                   | Output                           |
| -------- | ------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| Phase 1  | Foundation                | Project setup, architecture, database, authentication, repository | Development foundation           |
| Phase 2  | Product & Data Foundation | Health profile, dataset preparation, preprocessing                | User input & prepared dataset    |
| Phase 3  | Risk Engine               | Model training, evaluation, Health Score, Lifestyle Score         | Preventive Lifestyle Risk Engine |
| Phase 4  | Explainable AI            | SHAP/LIME integration dan risk explanation                        | Explainable Risk                 |
| Phase 5  | Killer Feature            | Future Health Simulation & What-if Simulation                     | Simulation Engine                |
| Phase 6  | Recommendation            | Rule Engine dan safety guardrail                                  | Personalized Recommendation      |
| Phase 7  | Evidence & AI Explanation | RAG knowledge base dan LLM integration                            | Evidence Center                  |
| Phase 8  | Integration & UI Polish   | Full pipeline integration dan UI/UX refinement                    | Integrated HELIORA               |
| Phase 9  | QA & Security             | Functional testing, edge cases, security testing                  | Stable MVP                       |
| Phase 10 | Finalization              | Bug fixing, deployment, presentation, demo preparation            | Competition-ready MVP            |

---

## 16.4 Phase 1 — Foundation

### Objectives

Membangun fondasi teknis dan struktur proyek yang akan digunakan selama pengembangan MVP.

### Activities

- Menyiapkan repository.
- Menentukan project structure.
- Menyiapkan backend FastAPI.
- Menyiapkan frontend Next.js.
- Menyiapkan PostgreSQL.
- Menyiapkan environment configuration.
- Menyiapkan authentication dasar.
- Menyiapkan database migration.
- Menentukan API contract awal.
- Menyiapkan development workflow.

### Output

- Repository aktif.
- Backend berjalan.
- Frontend berjalan.
- Database terhubung.
- Authentication dasar tersedia.
- Struktur project terdokumentasi.

### Exit Criteria

- Backend dapat dijalankan.
- Frontend dapat dijalankan.
- PostgreSQL dapat diakses.
- User dapat melakukan authentication.
- Struktur repository telah disepakati oleh tim.

---

## 16.5 Phase 2 — Product & Data Foundation

### Objectives

Membangun health profile dan menyiapkan dataset yang diperlukan untuk Preventive Lifestyle Risk Engine.

### Activities

#### Product

- Implementasi onboarding.
- Implementasi consent.
- Implementasi health profile.
- Implementasi lifestyle questionnaire.
- Validasi input pengguna.

#### Data

- Menentukan feature final.
- Menyiapkan dataset utama.
- Data cleaning.
- Data preprocessing.
- Handling missing values.
- Feature encoding.
- Feature engineering.
- Menentukan target variable.
- Menyiapkan train-test split.

### Core Input

Dataset dan health profile difokuskan pada variabel yang relevan dengan preventive lifestyle, seperti:

- Age
- Gender
- Height
- Weight
- Physical Activity
- Sleep Duration
- Smoking
- Family History

Variabel tambahan hanya digunakan apabila tersedia dan relevan terhadap model MVP.

### Output

- Health Profile.
- Lifestyle Profile.
- Prepared ML Dataset.
- Data preprocessing pipeline.

### Exit Criteria

- Input health profile dapat disimpan.
- Dataset dapat diproses secara konsisten.
- Feature final telah ditentukan.
- Data pipeline dapat dijalankan kembali.

---

## 16.6 Phase 3 — Preventive Lifestyle Risk Engine

### Objectives

Membangun model utama yang digunakan untuk menghasilkan estimasi risiko preventif.

### Activities

- Training model.
- Model comparison.
- Feature selection.
- Model evaluation.
- Train-test validation.
- Menentukan model final.
- Implementasi inference pipeline.
- Implementasi Health Score.
- Implementasi Lifestyle Score.
- Implementasi risk estimation.

### Output

Preventive Lifestyle Risk Engine menghasilkan:

- Health Score.
- Lifestyle Score.
- Estimated Diabetes Risk.
- Estimated Hypertension Risk.
- Estimated Cardiovascular Risk.

Seluruh output diposisikan sebagai **estimasi**, bukan diagnosis medis.

### Evaluation

Evaluasi dasar dilakukan menggunakan metrik yang sesuai dengan model, seperti:

- Accuracy.
- Precision.
- Recall.
- F1-score.
- AUC apabila relevan.

Evaluasi fairness dan recalibration lintas populasi tidak menjadi fokus MVP dan dapat menjadi future work.

### Exit Criteria

- Model dapat menghasilkan output secara konsisten.
- Model telah melalui train-test evaluation.
- Inference dapat dipanggil oleh backend.
- Health Score dan Lifestyle Score dapat dihitung.
- Output model dapat digunakan oleh fitur berikutnya.

---

## 16.7 Phase 4 — Explainable AI

### Objectives

Membuat hasil model dapat dipahami pengguna dengan menunjukkan faktor yang paling berkontribusi terhadap estimasi risiko.

### Activities

- Integrasi SHAP.
- Menentukan feature importance.
- Menentukan top contributing factors.
- Membuat explanation payload.
- Menghubungkan explanation dengan UI.

### Example

Input:

- BMI tinggi.
- Aktivitas fisik rendah.
- Sleep duration rendah.

Output:

> Faktor yang paling berkontribusi terhadap estimasi risiko Anda adalah BMI yang tinggi dan aktivitas fisik yang rendah.

### Output

- Risk explanation.
- Top risk factors.
- Contribution information.
- Human-readable explanation.

### Exit Criteria

- Setiap risk estimation dapat memiliki explanation.
- Faktor utama dapat ditampilkan.
- Explanation tidak menyatakan diagnosis.
- Explanation dapat ditampilkan pada frontend.

---

## 16.8 Phase 5 — Future Health Simulation & What-if Simulation

### Objectives

Mengembangkan killer feature utama HELIORA.

### Future Health Simulation

Sistem mensimulasikan perubahan estimasi berdasarkan kondisi lifestyle pengguna.

Scenario MVP:

- 30 hari.
- 90 hari.
- 180 hari.

### What-if Simulation

Pengguna dapat mengubah parameter lifestyle dan melihat perubahan estimasi secara langsung.

Parameter utama:

- Sleep Duration.
- Physical Activity.
- Weight.

Parameter lain dapat ditambahkan apabila telah tersedia dan stabil dalam model.

### Simulation Method

MVP menggunakan pendekatan sederhana:

1. Ambil baseline user profile.
2. Ubah parameter berdasarkan scenario.
3. Jalankan kembali risk engine.
4. Bandingkan baseline dengan simulated result.
5. Tampilkan perubahan estimasi.

### Output

Contoh:

```text
Current Risk
     ↓
Modify Lifestyle
     ↓
Simulated Risk
     ↓
Risk Difference
```

### Important Disclaimer

Simulation merupakan **proyeksi berbasis model**, bukan prediksi medis yang pasti.

### Exit Criteria

- User dapat menjalankan simulation.
- User dapat mengubah parameter utama.
- Sistem dapat menghasilkan simulated result.
- Baseline dan simulated result dapat dibandingkan.
- Simulation dapat dilakukan tanpa mengubah data profil asli pengguna.

---

## 16.9 Phase 6 — Recommendation Engine

### Objectives

Menghasilkan rekomendasi preventif yang konsisten berdasarkan kondisi pengguna.

Recommendation Engine menggunakan **Rule Engine**, bukan LLM.

### Activities

- Menentukan rule.
- Menghubungkan rule dengan health/lifestyle profile.
- Menghubungkan rule dengan evidence.
- Menentukan recommendation priority.
- Implementasi safety guardrail.

### Example Rules

| Condition                | Recommendation                                   |
| ------------------------ | ------------------------------------------------ |
| Sleep rendah             | Tingkatkan durasi tidur                          |
| Physical activity rendah | Tingkatkan aktivitas fisik                       |
| BMI tinggi               | Fokus pada pengelolaan berat badan               |
| Smoking aktif            | Pertimbangkan program berhenti merokok           |
| Risk threshold tinggi    | Pertimbangkan konsultasi dengan tenaga kesehatan |

Rule harus mengacu pada guideline yang digunakan sebagai knowledge source HELIORA.

### Output

- Personalized recommendation.
- Recommendation priority.
- Supporting evidence reference.
- Safety message apabila threshold tercapai.

### Exit Criteria

- Rule Engine dapat menghasilkan rekomendasi.
- Rule dapat diuji secara deterministic.
- Recommendation dapat dikaitkan dengan evidence.
- Safety guardrail berfungsi.

---

## 16.10 Phase 7 — Evidence Center & LLM Explanation

### Objectives

Menyediakan penjelasan yang mudah dipahami sekaligus menjaga transparansi sumber informasi.

### RAG Knowledge Base

Knowledge base difokuskan pada sumber berkualitas seperti:

- WHO.
- Kementerian Kesehatan RI.
- PERKENI.
- PERKI.
- CDC.
- Jurnal ilmiah yang relevan.

MVP menggunakan koleksi dokumen yang terbatas dan terkurasi.

### Activities

- Collecting documents.
- Document cleaning.
- Chunking.
- Embedding.
- Vector storage.
- Retrieval.
- Evidence ranking.
- Citation/reference mapping.

### LLM

LLM digunakan untuk:

- Menjelaskan hasil model.
- Menyederhanakan bahasa teknis.
- Menyusun narrative explanation.
- Merangkum evidence.

LLM **tidak digunakan sebagai predictive model**.

### Output

- Human-friendly explanation.
- Evidence references.
- Supporting sources.
- Evidence context.

### Exit Criteria

- User dapat melihat alasan rekomendasi.
- Evidence dapat ditelusuri.
- LLM tidak menghasilkan risk score.
- LLM hanya bekerja setelah hasil model/rule tersedia.
- Fallback tersedia apabila LLM atau retrieval gagal.

---

## 16.11 Phase 8 — Full Integration & UI/UX Polish

### Objectives

Mengintegrasikan seluruh komponen menjadi satu user experience.

### End-to-End Flow

```text
Onboarding
    ↓
Consent
    ↓
Health Profile
    ↓
Lifestyle Input
    ↓
Risk Estimation
    ↓
Health & Lifestyle Score
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

### Activities

- Integrasi frontend dan backend.
- API integration.
- Loading state.
- Error state.
- Empty state.
- Validation.
- Responsive layout.
- UI consistency.
- Accessibility dasar.
- Medical disclaimer.
- Safety messaging.

### Exit Criteria

- End-to-end user flow berjalan.
- Tidak ada fitur utama yang hanya berupa mockup.
- Semua output utama dapat ditampilkan.
- Error handling tersedia.
- UI siap digunakan untuk demo.

---

## 16.12 Phase 9 — Quality Assurance & Security

### Objectives

Memastikan MVP stabil, aman, dan layak digunakan dalam demonstrasi.

### Functional Testing

Pengujian:

- Authentication.
- Health profile.
- Risk estimation.
- Explainable AI.
- Future simulation.
- What-if simulation.
- Recommendation.
- Evidence retrieval.
- LLM explanation.

### Edge Case Testing

Contoh:

- Input kosong.
- Input di luar range.
- Missing data.
- Nilai ekstrem.
- Duplicate request.
- Simulation tanpa profile.
- RAG tidak menemukan evidence.
- LLM timeout.
- Model inference failure.

### Security Testing

Fokus pada:

- Authentication.
- Authorization.
- Input validation.
- Password security.
- API security.
- Sensitive data handling.
- Environment secrets.
- Database access.

### Output

- QA report.
- Bug list.
- Security findings.
- Release candidate.

### Exit Criteria

- Critical bug = 0.
- High-priority bug telah diselesaikan.
- Core flow berhasil diuji.
- Security baseline terpenuhi.

---

## 16.13 Phase 10 — Finalization & Competition Readiness

### Objectives

Menyiapkan HELIORA untuk deployment dan demonstrasi kompetisi.

### Activities

- Final bug fixing.
- Production deployment.
- Environment configuration.
- Database production setup.
- Final performance check.
- Final smoke test.
- README finalization.
- Technical documentation.
- Presentation preparation.
- Demo scenario preparation.
- Backup demo scenario.
- Final rehearsal.

### Demo Scenario

Demo utama harus memperlihatkan:

```text
User Profile
    ↓
Risk Result
    ↓
"Why?"
    ↓
Explainable AI
    ↓
"What if I change my lifestyle?"
    ↓
What-if Simulation
    ↓
Future Health Simulation
    ↓
Recommendation
    ↓
Evidence
    ↓
Human-Friendly Explanation
```

### Exit Criteria

- Production environment tersedia.
- MVP dapat digunakan tanpa developer intervention.
- Demo scenario berjalan end-to-end.
- Dokumentasi tersedia.
- Tim memahami alur demo.
- Backup scenario tersedia.

---

## 16.14 Prioritas Pengembangan

Prioritas fitur MVP dibagi menjadi tiga tingkat untuk menjaga agar core experience tetap dapat dirilis tanpa dependency wajib pada external LLM/RAG service.

### P0 — Core MVP

- Authentication.
- Consent.
- Health Profile.
- Lifestyle Input.
- Preventive Lifestyle Risk Engine.
- Health Score.
- Lifestyle Score.
- Risk Estimation.
- Explainable AI.
- What-if Simulation.
- Recommendation Engine.
- Safety Guardrail.

### P1 — Enhanced MVP

- Future Health Simulation.
- Evidence Center.
- RAG.
- LLM Explanation.
- Recommendation evidence.
- Simulation comparison.
- UI/UX refinement.
- Error handling.

P1 dapat ditunda apabila implementasinya berisiko mengganggu P0 atau timeline kompetisi.

### P2 — Enhancement

- Advanced analytics.
- Additional simulation parameters.
- Advanced personalization.
- Additional evidence sources.
- Advanced model evaluation.
- Advanced visualization.
- Additional disease-specific models.

---


## 16.15 MVP Scope Control

Untuk mencegah scope creep, fitur baru hanya dapat ditambahkan apabila:

1. Tidak mengganggu P0.
2. Tidak mengurangi stabilitas core system.
3. Tidak mengganggu timeline MVP.
4. Memiliki kontribusi yang jelas terhadap product value.
5. Memiliki owner yang jelas.
6. Dapat diuji sebelum release.

Apabila suatu fitur berpotensi mengganggu killer feature atau core flow, fitur tersebut dipindahkan ke **Future Work**.

---

## 16.16 Roadmap Completion Criteria

### Core MVP Completion

MVP HELIORA dinyatakan siap memasuki tahap final apabila seluruh P0 terpenuhi:

- Preventive Lifestyle Risk Engine dapat menghasilkan output secara konsisten;
- Explainable AI dapat menjelaskan hasil;
- What-if Simulation dapat digunakan;
- Recommendation Engine menghasilkan rekomendasi;
- safety guardrail berjalan;
- end-to-end P0 flow telah diuji;
- critical bug telah diselesaikan;
- deployment berhasil;
- dokumentasi teknis minimum tersedia.

### Enhanced MVP Completion

P1 dinyatakan selesai apabila:

- Future Health Simulation dapat dijalankan;
- Evidence Center dapat menyediakan evidence terverifikasi;
- RAG dapat mengambil evidence yang relevan;
- LLM dapat menghasilkan explanation apabila service tersedia;
- deterministic fallback tetap berjalan apabila LLM gagal;
- demo scenario berhasil dijalankan end-to-end.

---


## 16.17 Roadmap Success Definition

Roadmap MVP tidak diukur berdasarkan jumlah fitur yang berhasil dibuat, tetapi berdasarkan keberhasilan HELIORA dalam menyelesaikan core user problem.

MVP dinyatakan berhasil apabila pengguna dapat melakukan:

> **Understand → Explain → Simulate → Explore → Act**

yaitu:

1. **Understand** — memahami estimasi kondisi dan risiko lifestyle.
2. **Explain** — memahami faktor yang berkontribusi terhadap hasil.
3. **Simulate** — melihat kemungkinan perubahan berdasarkan scenario.
4. **Explore** — mencoba perubahan lifestyle melalui What-if Simulation.
5. **Act** — memperoleh rekomendasi preventif yang didukung evidence.

Dengan demikian, seluruh roadmap tetap diarahkan pada tujuan utama HELIORA:

> **Membantu pengguna memahami bagaimana perubahan lifestyle hari ini dapat memengaruhi estimasi risiko kesehatan di masa depan.**

---

# 17. Risks & Assumptions

## 17.1 Overview

Pengembangan HELIORA memiliki sejumlah risiko yang berasal dari aspek teknis, data, AI, medis, keamanan, timeline, dan sumber daya tim.

Karena HELIORA merupakan platform preventive health berbasis AI, risiko terbesar bukan hanya kegagalan sistem secara teknis, tetapi juga kemungkinan pengguna salah memahami hasil estimasi sebagai diagnosis medis.

Oleh karena itu, pengelolaan risiko HELIORA berfokus pada:

- menjaga validitas dan konsistensi hasil AI;
- membatasi interpretasi output agar tidak dianggap sebagai diagnosis;
- menjaga keamanan dan privasi data pengguna;
- memastikan sistem tetap stabil untuk kebutuhan MVP;
- menjaga scope agar sesuai dengan timeline kompetisi;
- memastikan seluruh rekomendasi memiliki dasar evidence yang dapat ditelusuri.

---

## 17.2 Risk Management Principles

HELIORA menggunakan prinsip berikut dalam pengelolaan risiko:

1. **Safety First**  
   Risiko yang dapat berdampak terhadap keselamatan atau kesalahpahaman medis memiliki prioritas tertinggi.

2. **Scope Control**  
   Fitur yang tidak memberikan kontribusi langsung terhadap MVP dapat ditunda ke tahap berikutnya.

3. **Evidence-Based Development**  
   Keputusan terkait kesehatan dan rekomendasi preventif harus memiliki dasar guideline atau evidence yang dapat ditelusuri.

4. **Explainability**  
   Output model harus dapat dijelaskan melalui faktor yang berkontribusi terhadap hasil.

5. **Fail Safely**  
   Jika model, layanan LLM, atau knowledge base mengalami kegagalan, sistem tidak boleh menghasilkan klaim kesehatan yang tidak terverifikasi.

6. **Human Oversight**  
   HELIORA tidak menggantikan tenaga kesehatan dan harus memberikan batasan yang jelas terhadap penggunaan hasil sistem.

---

## 17.3 Risk Classification

Risiko HELIORA dikategorikan menjadi:

| Kategori                | Deskripsi                                                              |
| ----------------------- | ---------------------------------------------------------------------- |
| Product Risk            | Risiko bahwa produk tidak menyelesaikan masalah pengguna               |
| Data Risk               | Risiko terkait kualitas, kelengkapan, representasi, dan akses dataset  |
| AI/ML Risk              | Risiko terkait performa, interpretasi, dan keterbatasan model          |
| Medical Risk            | Risiko hasil dianggap sebagai diagnosis atau keputusan medis           |
| Technical Risk          | Risiko kegagalan sistem, API, database, atau integrasi                 |
| Security & Privacy Risk | Risiko kebocoran atau penyalahgunaan data                              |
| LLM/RAG Risk            | Risiko hallucination, evidence mismatch, atau output yang tidak sesuai |
| Project Risk            | Risiko keterlambatan dan keterbatasan sumber daya                      |
| Competition Risk        | Risiko produk gagal menunjukkan nilai inovasi atau impact saat demo    |

---

## 17.4 Risk Register

### 17.4.1 Data Availability Risk

**Risk:**  
Dataset yang dibutuhkan tidak tersedia, sulit diakses, memiliki batasan lisensi, atau tidak memiliki variabel yang sesuai dengan kebutuhan HELIORA.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Menggunakan dataset publik yang dapat diakses untuk pengembangan MVP.
- Menentukan dataset utama sebelum tahap implementasi model.
- Menggunakan dataset Indonesia sebagai referensi konteks dan validasi masalah apabila memungkinkan.
- Tidak menjadikan dataset dengan akses terbatas sebagai dependency utama MVP.
- Menyediakan fallback dataset apabila dataset utama mengalami kendala akses.

**Contingency:**

Jika dataset Indonesia seperti IFLS atau dataset tertentu tidak dapat digunakan tepat waktu, model tetap dikembangkan menggunakan dataset publik yang tersedia dan keterbatasan domain dicatat sebagai limitation.

---

### 17.4.2 Dataset Mismatch Risk

**Risk:**  
Dataset training memiliki karakteristik populasi yang berbeda dengan target pengguna HELIORA di Indonesia.

**Impact:** High

**Probability:** High

**Mitigation:**

- Memilih feature lifestyle yang relevan secara umum.
- Menggunakan data Indonesia untuk memahami konteks masalah.
- Membandingkan distribusi feature utama apabila data memungkinkan.
- Mendokumentasikan bahwa model MVP belum merupakan model yang dikalibrasi khusus untuk populasi Indonesia.

**Contingency:**

Model diposisikan sebagai **preventive lifestyle risk estimation**, bukan clinical risk prediction.

Kalibrasi khusus populasi Indonesia menjadi future work.

---

## 17.5 AI/ML Model Risk

### 17.5.1 Model Performance Risk

**Risk:**  
Model tidak memberikan performa yang cukup baik untuk digunakan sebagai risk estimation engine.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Menggunakan train-test split yang jelas.
- Menggunakan evaluation metrics yang sesuai.
- Melakukan preprocessing dan feature engineering secara konsisten.
- Membandingkan beberapa algoritma sederhana sebelum menentukan model final.
- Memilih model berdasarkan keseimbangan performa dan explainability.

**MVP Evaluation:**

Minimal melaporkan:

- Accuracy;
- Precision;
- Recall;
- F1-Score;
- ROC-AUC apabila sesuai dengan jenis model.

---

### 17.5.2 Overfitting Risk

**Risk:**  
Model memiliki performa tinggi pada training data tetapi performanya menurun pada data yang belum pernah dilihat.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Menggunakan train-test split.
- Menghindari feature yang menyebabkan data leakage.
- Menggunakan cross-validation apabila waktu memungkinkan.
- Menggunakan model dengan kompleksitas yang sesuai dengan ukuran dataset.
- Tidak hanya menggunakan training accuracy sebagai indikator keberhasilan.

---

### 17.5.3 Data Leakage Risk

**Risk:**  
Feature yang digunakan model secara tidak sengaja mengandung informasi yang seharusnya hanya tersedia setelah outcome terjadi.

**Impact:** High

**Probability:** Low-Medium

**Mitigation:**

- Melakukan feature audit sebelum training.
- Memisahkan feature input dan target dengan jelas.
- Mendokumentasikan sumber setiap feature.
- Memastikan preprocessing dilakukan tanpa menggunakan informasi dari test set.

---

## 17.6 Explainable AI Risk

**Risk:**  
SHAP atau metode explainability dapat disalahinterpretasikan sebagai hubungan sebab-akibat medis.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Menampilkan faktor sebagai **contributing factors**, bukan penyebab medis pasti.
- Menghindari wording seperti "Anda terkena penyakit karena X".
- Menggunakan wording seperti:
  - "Faktor yang berkontribusi terhadap estimasi";
  - "Faktor yang paling memengaruhi skor model";
  - "Model memberikan kontribusi terbesar pada feature berikut."
- Menampilkan disclaimer pada halaman hasil.

**Example:**

> "Aktivitas fisik rendah merupakan salah satu faktor yang berkontribusi terhadap estimasi risiko model."

Bukan:

> "Aktivitas fisik rendah menyebabkan Anda terkena penyakit."

---

## 17.7 Future Health Simulation Risk

**Risk:**  
Pengguna menganggap Future Health Simulation sebagai prediksi pasti mengenai kondisi kesehatan di masa depan.

**Impact:** Critical

**Probability:** Medium

**Mitigation:**

- Menyebut hasil sebagai **simulation** atau **projection**.
- Tidak menggunakan istilah "pasti akan".
- Menampilkan disclaimer.
- Menjelaskan bahwa simulasi merupakan hasil perubahan input terhadap model.
- Menggunakan skenario berbasis perubahan lifestyle, bukan klaim clinical prognosis.

**Contoh wording yang diperbolehkan:**

> "Jika pola lifestyle ini dipertahankan, model memperkirakan perubahan skor risiko sebesar X."

**Wording yang harus dihindari:**

> "Dalam 180 hari Anda pasti terkena penyakit X."

---

## 17.8 What-if Simulation Risk

**Risk:**  
Perubahan parameter pada What-if Simulation menghasilkan perubahan risiko yang terlalu besar atau tidak realistis.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Membatasi range input.
- Menggunakan validasi input.
- Tidak mengizinkan perubahan parameter di luar batas yang masuk akal.
- Menampilkan bahwa hasil merupakan simulasi model.
- Menggunakan re-run model dengan input yang dimodifikasi secara konsisten.

**Contoh:**

Jika pengguna mengubah:

```text
Sleep Duration: 5 jam → 7 jam
```

sistem menjalankan kembali risk engine dengan input baru dan membandingkan hasil:

```text
Baseline Risk
      ↓
What-if Input
      ↓
Model Recalculation
      ↓
Simulated Risk
```

---

## 17.9 Health Score & Lifestyle Score Risk

**Risk:**  
Pengguna menganggap Health Score atau Lifestyle Score sebagai standar medis resmi.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Menjelaskan bahwa score merupakan indikator internal HELIORA.
- Mendokumentasikan formula score.
- Tidak menyebut score sebagai diagnosis atau clinical score.
- Menjelaskan faktor yang digunakan untuk menghitung score.

Score digunakan sebagai:

> **indikator edukatif untuk membantu pengguna memahami kondisi lifestyle mereka.**

---

## 17.10 Medical Misinterpretation Risk

**Risk:**  
Pengguna menganggap HELIORA sebagai alat diagnosis atau pengganti dokter.

**Impact:** Critical

**Probability:** Medium

**Mitigation:**

HELIORA harus menyediakan:

- medical disclaimer;
- safety guardrail;
- batasan penggunaan;
- rekomendasi konsultasi tenaga kesehatan ketika diperlukan;
- wording yang tidak bersifat diagnostik.

**Mandatory Disclaimer:**

> **HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi/proyeksi berdasarkan data dan model yang digunakan, bukan diagnosis medis, bukan pengganti konsultasi dokter, dan bukan kepastian mengenai kondisi kesehatan seseorang.**

---

## 17.11 Safety Threshold Risk

**Risk:**  
Threshold risiko yang digunakan untuk memberikan safety warning tidak tepat atau terlalu mudah memicu warning.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Threshold harus terdokumentasi.
- Threshold tidak boleh dipresentasikan sebagai diagnosis.
- Warning menggunakan bahasa yang konservatif.
- Threshold digunakan sebagai safety guardrail, bukan clinical decision system.

**Example:**

Jika estimasi risiko berada pada kategori tinggi:

> "Hasil estimasi menunjukkan tingkat risiko yang perlu diperhatikan. Pertimbangkan untuk berkonsultasi dengan tenaga kesehatan untuk mendapatkan evaluasi lebih lanjut."

Bukan:

> "Anda menderita penyakit X."

---

## 17.12 LLM Hallucination Risk

**Risk:**  
LLM menghasilkan informasi kesehatan yang tidak terdapat dalam evidence atau bertentangan dengan sumber resmi.

**Impact:** Critical

**Probability:** Medium

**Mitigation:**

- LLM tidak digunakan sebagai predictive engine.
- LLM hanya digunakan untuk explanation dan narrative generation.
- Informasi kesehatan harus berasal dari RAG context.
- Prompt harus membatasi model agar tidak membuat evidence baru.
- Response harus menyertakan sumber evidence.
- Jika evidence tidak ditemukan, sistem harus menyatakan keterbatasan.

**Fallback:**

Jika LLM gagal:

```text
Risk Result
    ↓
Structured Explanation
    ↓
Evidence References
```

Sistem tetap dapat memberikan hasil tanpa narrative LLM.

---

## 17.13 RAG Evidence Risk

**Risk:**  
LLM mengambil dokumen yang tidak relevan atau memberikan penjelasan yang tidak sesuai dengan evidence.

**Impact:** High

**Probability:** Medium

**Mitigation:**

Knowledge Base MVP dibatasi pada sumber berkualitas tinggi, seperti:

- WHO;
- Kementerian Kesehatan RI;
- PERKENI;
- PERKI;
- CDC;
- publikasi ilmiah yang relevan.

Setiap dokumen harus memiliki metadata:

- source;
- title;
- publication date;
- category;
- URL atau reference;
- evidence level apabila tersedia.

---

## 17.14 Evidence Quality Risk

**Risk:**  
Evidence yang digunakan terlalu lemah, outdated, atau tidak relevan dengan rekomendasi.

**Impact:** High

**Probability:** Medium

**Mitigation:**

Prioritas sumber:

```text
Official Guidelines
       ↓
Professional Medical Organization
       ↓
Government Health Agency
       ↓
Peer-Reviewed Scientific Literature
       ↓
Other Supporting Sources
```

Sumber yang tidak dapat diverifikasi tidak digunakan sebagai primary evidence.

---

## 17.15 Recommendation Engine Risk

**Risk:**  
Rule Engine menghasilkan rekomendasi yang terlalu umum, tidak relevan, atau bertentangan dengan evidence.

**Impact:** High

**Probability:** Low-Medium

**Mitigation:**

- Rule berasal dari guideline.
- Setiap rule memiliki source.
- Rule memiliki kondisi yang jelas.
- Rule diuji dengan unit test.
- Rule tidak boleh menghasilkan diagnosis.
- Rule digunakan untuk preventive recommendation.

**Contoh struktur rule:**

```text
IF sleep_duration < threshold
THEN recommend improving sleep duration
SOURCE = official guideline
```

---

## 17.16 Security Risk

**Risk:**  
Data kesehatan pengguna dapat terekspos akibat kesalahan implementasi keamanan.

**Impact:** Critical

**Probability:** Medium

**Mitigation:**

- Password hashing.
- Authentication dan authorization.
- Role-based access control apabila diperlukan.
- HTTPS pada deployment.
- Validasi input.
- Secure API design.
- Environment variable untuk secret.
- Tidak menyimpan API key pada frontend.
- Database access dibatasi.
- Logging tidak boleh menyimpan data sensitif secara tidak perlu.

---

## 17.17 Privacy Risk

**Risk:**  
Data pengguna digunakan atau disimpan tanpa pemahaman dan consent yang memadai.

**Impact:** Critical

**Probability:** Medium

**Mitigation:**

HELIORA menyediakan:

- consent sebelum penggunaan data;
- penjelasan tujuan penggunaan data;
- prinsip data minimization;
- tidak mengumpulkan data yang tidak diperlukan MVP;
- tidak membagikan data pengguna kepada pihak ketiga tanpa dasar yang sesuai;
- anonimisasi atau pseudonimisasi apabila memungkinkan.

---

## 17.18 Database Risk

**Risk:**  
Kegagalan database menyebabkan data pengguna atau hasil assessment tidak dapat diakses.

**Impact:** High

**Probability:** Low-Medium

**Mitigation:**

- Menggunakan PostgreSQL sebagai database utama.
- Database schema terdokumentasi.
- Migration versioning.
- Foreign key constraint.
- Validation pada application layer.
- Backup sesuai kebutuhan deployment.

---

## 17.19 Backend Availability Risk

**Risk:**  
Backend API mengalami downtime atau error saat digunakan.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Backend menggunakan FastAPI.
- API endpoint memiliki validation.
- Error handling terstruktur.
- Logging.
- Health check endpoint.
- Separation antara prediction service dan API layer apabila diperlukan.

---

## 17.20 Frontend Risk

**Risk:**  
Frontend tidak dapat menampilkan hasil simulasi atau dashboard secara responsif.

**Impact:** Medium

**Probability:** Medium

**Mitigation:**

- Menggunakan Next.js.
- Komponen UI modular.
- Loading state.
- Error state.
- Empty state.
- Input validation.
- Optimistic interaction hanya jika aman.
- Pengujian What-if Simulation pada berbagai kondisi input.

---

## 17.21 LLM/API Dependency Risk

**Risk:**  
Provider LLM mengalami downtime, rate limit, perubahan API, atau biaya tidak terduga.

**Impact:** Medium-High

**Probability:** Medium

**Mitigation:**

- LLM bukan dependency utama risk calculation.
- Risk Engine harus dapat berjalan tanpa LLM.
- RAG dan explanation dibuat sebagai layer tambahan.
- API key disimpan pada backend.
- Timeout dan error handling diterapkan.
- Menyediakan fallback structured explanation.

---

## 17.22 Scope Creep Risk

**Risk:**  
Tim menambahkan terlalu banyak fitur sehingga MVP tidak selesai tepat waktu.

**Impact:** Critical

**Probability:** High

**Mitigation:**

MVP diprioritaskan pada:

1. Authentication & Consent.
2. Health Profile.
3. Preventive Risk Estimation.
4. Health/Lifestyle Score.
5. Explainable AI.
6. Future Health Simulation.
7. What-if Simulation.
8. Recommendation Engine.
9. Evidence Center.
10. LLM-assisted Explanation.

Fitur di luar daftar tersebut harus melalui evaluasi prioritas.

---

## 17.23 Timeline Risk

**Risk:**  
Implementasi AI, backend, frontend, RAG, dan testing membutuhkan waktu lebih lama dari estimasi.

**Impact:** Critical

**Probability:** High

**Mitigation:**

- Development dilakukan secara incremental.
- Core risk engine diprioritaskan.
- UI dapat menggunakan mock data terlebih dahulu.
- LLM/RAG diintegrasikan setelah core system stabil.
- QA dilakukan sejak awal, bukan hanya pada akhir proyek.
- Setiap sprint memiliki deliverable yang dapat didemokan.

---

## 17.24 Team Resource Risk

**Risk:**  
Jumlah anggota tim terbatas dan beberapa anggota memiliki lebih dari satu role.

**Impact:** High

**Probability:** Medium

**Mitigation:**

- Pembagian role dan ownership ditentukan sejak awal.
- Setiap modul memiliki primary owner.
- Dokumentasi menjadi source of truth.
- Git workflow digunakan untuk menghindari konflik.
- Technical decisions dicatat.
- Knowledge sharing dilakukan antar anggota.

---

## 17.25 Integration Risk

**Risk:**  
Komponen frontend, backend, ML, RAG, dan database tidak terintegrasi sesuai kontrak.

**Impact:** High

**Probability:** Medium

**Mitigation:**

Menentukan API contract sebelum implementasi:

```text
Next.js
   ↓
FastAPI
   ↓
Risk Engine
   ↓
Database / ML Model
   ↓
Recommendation Engine
   ↓
RAG / LLM
```

Contract mencakup:

- request schema;
- response schema;
- validation;
- error response;
- authentication;
- status code.

---

## 17.26 Demo Reliability Risk

**Risk:**  
Sistem mengalami error saat live demo kompetisi.

**Impact:** Critical

**Probability:** Medium

**Mitigation:**

- Menyiapkan demo account.
- Menyiapkan seeded data.
- Mengurangi dependency eksternal yang tidak diperlukan.
- Menyediakan fallback apabila LLM gagal.
- Melakukan end-to-end testing.
- Menyiapkan environment demo yang stabil.
- Melakukan rehearsal sebelum presentasi.

---

## 17.27 Competition Presentation Risk

**Risk:**  
Nilai teknis HELIORA tinggi tetapi inovasi dan impact tidak tersampaikan dengan baik saat presentasi.

**Impact:** High

**Probability:** Medium

**Mitigation:**

Storytelling demo difokuskan pada:

```text
Problem
   ↓
Personal Risk
   ↓
Why?
   ↓
What if I change?
   ↓
Future Simulation
   ↓
Recommendation
   ↓
Evidence
   ↓
Preventive Action
```

Killer feature harus menjadi bagian utama demo, bukan sekadar fitur tambahan.

---

# 17.28 Key Risk Priority Matrix

| Risk                         | Impact      | Probability | Priority |
| ---------------------------- | ----------- | ----------- | -------- |
| Medical Misinterpretation    | Critical    | Medium      | Critical |
| LLM Hallucination            | Critical    | Medium      | Critical |
| Privacy & Security           | Critical    | Medium      | Critical |
| Scope Creep                  | Critical    | High        | Critical |
| Timeline Delay               | Critical    | High        | Critical |
| Dataset Mismatch             | High        | High        | High     |
| Model Performance            | High        | Medium      | High     |
| Simulation Misinterpretation | High        | Medium      | High     |
| RAG Evidence Quality         | High        | Medium      | High     |
| API/LLM Dependency           | Medium-High | Medium      | Medium   |
| Frontend Failure             | Medium      | Medium      | Medium   |
| Database Failure             | High        | Low-Medium  | Medium   |
| Demo Reliability             | Critical    | Medium      | Critical |

---

# 17.29 Assumptions

Pengembangan MVP HELIORA menggunakan beberapa asumsi berikut.

### A1 — Dataset Publik Dapat Digunakan

Diasumsikan tersedia dataset publik yang cukup untuk membangun Preventive Lifestyle Risk Engine MVP.

Dataset utama dipilih berdasarkan:

- accessibility;
- relevansi feature;
- kualitas data;
- dokumentasi;
- izin penggunaan.

---

### A2 — Lifestyle Features Memiliki Nilai Prediktif

Diasumsikan bahwa kombinasi faktor seperti:

- usia;
- gender;
- BMI;
- aktivitas fisik;
- durasi tidur;
- smoking status;
- family history;

dapat digunakan untuk membangun model estimasi risiko berbasis lifestyle.

Model tidak dianggap sebagai clinical diagnostic model.

---

### A3 — Model Tidak Digunakan untuk Diagnosis

Seluruh hasil model diasumsikan digunakan untuk:

- education;
- awareness;
- preventive insight;
- simulation.

Model tidak digunakan untuk:

- diagnosis;
- prescription;
- treatment decision;
- emergency decision.

---

### A4 — Rule Engine Menjadi Sumber Recommendation Logic

Diasumsikan recommendation engine MVP menggunakan rule yang eksplisit dan dapat ditelusuri.

LLM tidak bertanggung jawab menentukan rekomendasi kesehatan secara bebas.

---

### A5 — LLM Hanya Sebagai Explanation Layer

LLM diasumsikan berfungsi sebagai:

- explanation generator;
- narrative generator;
- evidence summarizer.

LLM tidak digunakan sebagai:

- risk predictor;
- medical diagnosis engine;
- autonomous medical decision maker.

---

### A6 — RAG Knowledge Base Terbatas

MVP tidak membutuhkan knowledge base yang sangat besar.

Target awal:

**±15–30 dokumen berkualitas tinggi**

dengan prioritas:

- WHO;
- Kemenkes RI;
- PERKENI;
- PERKI;
- CDC;
- scientific literature yang relevan.

---

### A7 — Simulation Menggunakan Model Recalculation

Future Health Simulation dan What-if Simulation diasumsikan menggunakan pendekatan sederhana:

```text
Baseline Input
      ↓
Model Prediction
      ↓
Lifestyle Modification
      ↓
Model Recalculation
      ↓
Comparison
```

Pendekatan ini digunakan sebagai simulasi berbasis model, bukan clinical forecasting.

---

### A8 — Health Score dan Lifestyle Score Merupakan Internal Indicator

Score yang digunakan HELIORA diasumsikan sebagai indikator internal produk.

Score tersebut bukan:

- standardized medical score;
- diagnosis;
- clinical assessment;
- pengganti pemeriksaan medis.

---

### A9 — Pengguna Memasukkan Data Secara Mandiri

Diasumsikan pengguna dapat memberikan informasi lifestyle dasar melalui onboarding atau health questionnaire.

Data yang digunakan harus memiliki instruksi yang jelas agar pengguna dapat mengisinya dengan benar.

---

### A10 — Sistem Berbasis Web

MVP diasumsikan dikembangkan sebagai web application.

Technology stack utama:

- **Frontend:** Next.js
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **ML:** Python ecosystem
- **Explainability:** SHAP
- **RAG:** Vector-based retrieval
- **LLM:** External/API-based LLM
- **Deployment:** Containerized environment

---

### A11 — Integrasi Smartwatch Bukan Dependency MVP

Integrasi smartwatch dapat dikembangkan pada tahap berikutnya.

MVP tidak bergantung pada:

- Apple Watch;
- Wear OS;
- Fitbit;
- Samsung Galaxy Watch;
- wearable device lainnya.

Input lifestyle MVP berasal dari user input atau dataset yang tersedia.

---

### A12 — Sistem Memiliki Internet Connection

Diasumsikan aplikasi memiliki koneksi internet untuk:

- akses backend;
- database;
- LLM API;
- RAG service apabila menggunakan external service;
- deployment environment.

---

# 17.30 Technical Assumptions

| Area            | Assumption                                         |
| --------------- | -------------------------------------------------- |
| Frontend        | Next.js digunakan sebagai frontend utama           |
| Backend         | FastAPI digunakan sebagai backend API              |
| Database        | PostgreSQL digunakan sebagai database utama        |
| ML              | Model dibangun menggunakan Python                  |
| Explainability  | SHAP menjadi pilihan utama                         |
| Recommendation  | Rule Engine                                        |
| RAG             | Knowledge base berbasis dokumen                    |
| LLM             | Digunakan hanya untuk explanation                  |
| Authentication  | Backend menangani authentication dan authorization |
| API             | REST API                                           |
| Deployment      | Containerized deployment                           |
| Version Control | Git                                                |
| Documentation   | Markdown-based project documentation               |

---

# 17.31 Product Assumptions

HELIORA diasumsikan memberikan value utama melalui:

1. Personalized Risk Insight.
2. Explainable AI.
3. Future Health Simulation.
4. What-if Simulation.
5. Preventive Recommendation.
6. Evidence Center.
7. Human-friendly explanation.

Kombinasi tersebut menjadi diferensiasi utama HELIORA dibandingkan sekadar aplikasi informasi kesehatan.

---

# 17.32 Risk Mitigation Ownership

Risk management menjadi tanggung jawab seluruh tim.

| Area               | Primary Responsibility                |
| ------------------ | ------------------------------------- |
| Product Risk       | Product & Project Manager             |
| Research Risk      | Business Analyst & Research           |
| Architecture Risk  | Solution Architect                    |
| Backend Risk       | Backend Engineer                      |
| Frontend Risk      | Frontend Engineer                     |
| Deployment Risk    | DevOps & Deployment                   |
| Security Risk      | QA & Security                         |
| AI/ML Risk         | Solution Architect + Backend Engineer |
| Documentation Risk | Documentation & Presentation          |
| Demo Risk          | Seluruh Tim                           |

---

# 17.33 Risk Review Process

Risk register harus ditinjau secara berkala pada setiap fase pengembangan.

### Review Cycle

```text
Identify Risk
     ↓
Assess Impact
     ↓
Assess Probability
     ↓
Define Mitigation
     ↓
Assign Owner
     ↓
Monitor
     ↓
Resolve / Escalate
```

Risk baru harus ditambahkan apabila ditemukan selama development, testing, atau deployment.

---

# 17.34 Assumption Validation

Asumsi yang memiliki dampak besar terhadap MVP harus divalidasi sebelum implementasi final.

Prioritas validasi:

1. Ketersediaan dataset.
2. Kesesuaian feature dataset.
3. Performa baseline model.
4. Kelayakan SHAP.
5. Kelayakan What-if Simulation.
6. Kualitas knowledge base.
7. Kualitas output RAG + LLM.
8. Stabilitas integrasi frontend-backend.
9. Performa aplikasi.
10. Stabilitas live demo.

---

# 17.35 Risk Acceptance Criteria

Risiko dapat dianggap terkendali apabila:

- tidak terdapat critical blocker pada MVP;
- model dapat menghasilkan output secara konsisten;
- simulation dapat dijalankan tanpa error;
- recommendation engine menghasilkan output yang dapat ditelusuri;
- evidence dapat ditampilkan;
- LLM tidak menjadi single point of failure;
- medical disclaimer selalu tersedia pada konteks yang relevan;
- data pengguna tidak terekspos;
- sistem dapat digunakan selama demo;
- seluruh known limitations telah didokumentasikan.

---

# 17.36 Known Limitations

MVP HELIORA memiliki keterbatasan yang harus dinyatakan secara transparan.

### 1. Population Limitation

Model dapat menggunakan dataset internasional sehingga belum tentu sepenuhnya merepresentasikan populasi Indonesia.

### 2. Prediction Limitation

Output merupakan estimasi berbasis model, bukan clinical prediction yang tervalidasi untuk diagnosis.

### 3. Simulation Limitation

Future Health Simulation merupakan proyeksi berbasis perubahan input model, bukan prediksi pasti kondisi kesehatan seseorang.

### 4. Data Limitation

Akurasi output dipengaruhi oleh kualitas dan kelengkapan data yang diberikan pengguna.

### 5. Evidence Limitation

RAG hanya dapat memberikan evidence yang tersedia di knowledge base.

### 6. LLM Limitation

LLM dapat menghasilkan output yang kurang tepat sehingga output harus dibatasi oleh retrieval context dan structured prompt.

### 7. Calibration Limitation

Kalibrasi kuantitatif khusus populasi Indonesia belum menjadi target utama MVP dan dapat dikembangkan pada tahap berikutnya.

### 8. Fairness Limitation

Evaluasi fairness mendalam antar kelompok demografis belum menjadi target MVP.

---

# 17.37 Future Risk Mitigation

Risiko yang belum ditangani secara penuh pada MVP dapat menjadi agenda pengembangan berikutnya:

- model recalibration untuk populasi Indonesia;
- external validation;
- fairness evaluation;
- clinical expert review;
- longitudinal dataset;
- wearable integration;
- advanced simulation;
- personalized intervention planning;
- expanded medical evidence knowledge base.

---

# 17.38 Final Risk & Assumption Statement

HELIORA akan dikembangkan dengan pendekatan **risk-aware, evidence-based, explainable, dan scope-controlled**.

Risiko terbesar yang berkaitan dengan medical interpretation, data quality, AI reliability, privacy, dan timeline harus ditangani sejak tahap awal pengembangan.

Sementara itu, asumsi yang digunakan dalam MVP harus dianggap sebagai **working assumptions**, bukan fakta permanen. Asumsi tersebut perlu divalidasi melalui:

- dataset analysis;
- model evaluation;
- user testing;
- integration testing;
- evidence review;
- technical testing.

Dengan pendekatan tersebut, HELIORA dapat mempertahankan fokus pada tujuan utama MVP:

> **Membantu pengguna memahami hubungan antara lifestyle dan estimasi risiko kesehatan serta mengeksplorasi dampak perubahan lifestyle melalui Future Health Simulation dan What-if Simulation secara explainable dan evidence-based.**

---

# 18. Definition of Done

## 18.1 Overview

Definition of Done (DoD) merupakan standar minimum yang harus dipenuhi agar suatu fitur, modul, atau keseluruhan MVP HELIORA dinyatakan selesai dan siap digunakan.

Definition of Done digunakan sebagai **quality gate** untuk memastikan bahwa implementasi tidak hanya selesai secara teknis, tetapi juga memenuhi kebutuhan produk, keamanan, usability, dokumentasi, dan tujuan MVP.

Sebuah pekerjaan tidak dapat dinyatakan **Done** hanya karena kode telah selesai dibuat.

Pekerjaan harus memenuhi seluruh kriteria yang relevan pada:

- Functional Requirements;
- AI Requirements;
- UI/UX Requirements;
- Business Rules;
- Non-Functional Requirements;
- Security;
- Testing;
- Documentation;
- Acceptance Criteria.

---

## 18.2 General Definition of Done

Sebuah fitur dinyatakan **Done** apabila:

1. seluruh functional requirement terkait telah diimplementasikan;
2. seluruh acceptance criteria telah terpenuhi;
3. business rules telah diterapkan sesuai PRD;
4. UI telah sesuai dengan design yang telah disepakati;
5. API dan backend telah terintegrasi dengan frontend apabila diperlukan;
6. database migration dan schema telah tersedia apabila diperlukan;
7. validasi input telah diterapkan;
8. error handling telah diterapkan;
9. fitur telah diuji secara fungsional;
10. tidak terdapat bug critical atau blocker;
11. security requirement yang relevan telah diterapkan;
12. performa masih berada dalam batas NFR;
13. dokumentasi terkait telah diperbarui;
14. kode telah melalui code review;
15. perubahan telah diintegrasikan ke branch yang ditentukan;
16. fitur dapat dijalankan pada environment development/staging;
17. fitur telah disetujui oleh Product & Project Manager.

---

## 18.3 Product-Level Definition of Done

MVP HELIORA dinyatakan selesai apabila seluruh komponen utama produk telah berfungsi sebagai satu kesatuan.

Komponen tersebut meliputi:

- Authentication;
- Consent & Privacy;
- Health Profile;
- Health Score;
- Lifestyle Score;
- Preventive Lifestyle Risk Engine;
- Risk Estimation;
- Explainable AI;
- Future Health Simulation;
- What-if Simulation;
- Recommendation Engine;
- Evidence Center;
- LLM-assisted Explanation;
- Dashboard;
- Safety Guardrail;
- Medical Disclaimer.

Seluruh komponen harus dapat digunakan melalui end-to-end user journey tanpa membutuhkan intervensi manual dari developer.

---

## 18.4 Frontend Definition of Done

Frontend feature dinyatakan Done apabila:

### UI Implementation

- [ ] UI telah diimplementasikan berdasarkan design system HELIORA.
- [ ] Layout sesuai dengan desain yang disepakati.
- [ ] Typography dan spacing konsisten.
- [ ] Component menggunakan pola yang konsisten.
- [ ] Responsive behavior telah diterapkan.
- [ ] Loading state tersedia.
- [ ] Empty state tersedia apabila diperlukan.
- [ ] Error state tersedia.
- [ ] Success state tersedia apabila diperlukan.
- [ ] Confirmation state tersedia untuk tindakan penting.

### User Experience

- [ ] User dapat memahami tujuan setiap halaman.
- [ ] Form memiliki label yang jelas.
- [ ] Input memiliki validasi yang sesuai.
- [ ] Error message mudah dipahami.
- [ ] User tidak mengalami dead-end pada workflow utama.
- [ ] Navigasi antar halaman berjalan dengan benar.

### Integration

- [ ] API telah terhubung dengan backend.
- [ ] Response API diproses dengan benar.
- [ ] Loading state selama request tersedia.
- [ ] API error ditangani dengan baik.
- [ ] Authentication state ditangani dengan benar.
- [ ] Authorization terhadap halaman sesuai role dan permission.

---

## 18.5 Backend Definition of Done

Backend feature dinyatakan Done apabila:

- [ ] Endpoint API telah diimplementasikan.
- [ ] Request validation telah diterapkan.
- [ ] Response schema telah didefinisikan.
- [ ] Authentication telah diterapkan apabila diperlukan.
- [ ] Authorization telah diterapkan apabila diperlukan.
- [ ] Business logic telah dipisahkan dari routing layer.
- [ ] Error handling telah diterapkan.
- [ ] HTTP status code sesuai dengan kondisi response.
- [ ] Database operation telah diuji.
- [ ] Transaction digunakan apabila diperlukan.
- [ ] Tidak terdapat hardcoded secret.
- [ ] Logging tersedia untuk error penting.
- [ ] API dapat digunakan oleh frontend.
- [ ] Dokumentasi API telah diperbarui.

---

## 18.6 Database Definition of Done

Perubahan database dinyatakan Done apabila:

- [ ] Schema telah didefinisikan.
- [ ] Migration tersedia.
- [ ] Relationship antar entity telah ditentukan.
- [ ] Constraint yang diperlukan telah diterapkan.
- [ ] Primary key telah ditentukan.
- [ ] Foreign key telah diterapkan apabila diperlukan.
- [ ] Index telah ditambahkan untuk query yang membutuhkan optimasi.
- [ ] Data type sesuai dengan kebutuhan.
- [ ] Sensitive data tidak disimpan secara plaintext.
- [ ] Migration dapat dijalankan pada environment baru.
- [ ] Database schema konsisten dengan ERD.

Database utama MVP menggunakan **PostgreSQL** sesuai dengan keputusan Technology Stack.

---

## 18.7 AI Definition of Done

AI feature dinyatakan Done apabila:

- [ ] Input feature telah ditentukan.
- [ ] Dataset yang digunakan telah terdokumentasi.
- [ ] Data preprocessing telah dilakukan.
- [ ] Data quality telah diperiksa.
- [ ] Train-test split telah dilakukan secara benar.
- [ ] Model telah berhasil dilatih.
- [ ] Model dapat melakukan inference.
- [ ] Model evaluation telah dilakukan.
- [ ] Metric evaluation telah dicatat.
- [ ] Model artifact dapat digunakan oleh backend.
- [ ] Output model memiliki format yang konsisten.
- [ ] Output model tidak diposisikan sebagai diagnosis medis.
- [ ] Model dapat digunakan oleh Future Health Simulation.
- [ ] Model dapat digunakan oleh What-if Simulation.

---

## 18.8 Preventive Lifestyle Risk Engine Definition of Done

Preventive Lifestyle Risk Engine dinyatakan Done apabila:

- [ ] Dataset utama telah ditentukan.
- [ ] Feature yang digunakan telah ditentukan.
- [ ] Preprocessing pipeline tersedia.
- [ ] Model berhasil dilatih.
- [ ] Model dapat menerima input user.
- [ ] Model menghasilkan estimated risk.
- [ ] Output risk memiliki range yang jelas.
- [ ] Model dapat menghasilkan hasil secara konsisten.
- [ ] Model dapat dipanggil oleh backend API.
- [ ] Model dapat digunakan kembali untuk simulation.
- [ ] Dokumentasi model tersedia.

Output utama minimal:

- Estimated Diabetes Risk;
- Estimated Hypertension Risk;
- Estimated Cardiovascular Risk.

Seluruh output harus menggunakan terminology **estimated risk** atau istilah setara dan tidak boleh dipresentasikan sebagai diagnosis.

---

## 18.9 Explainable AI Definition of Done

Explainable AI dinyatakan Done apabila:

- [ ] Model prediction dapat dijelaskan.
- [ ] Feature contribution dapat ditampilkan.
- [ ] Faktor risiko utama dapat diidentifikasi.
- [ ] Penjelasan tidak mengubah output prediction.
- [ ] Penjelasan dapat dipahami oleh pengguna non-medis.
- [ ] SHAP digunakan sebagai pendekatan utama atau metode explainability yang telah disepakati.
- [ ] Explanation dapat ditampilkan pada UI.
- [ ] Explanation memiliki hubungan yang jelas dengan input user.

Contoh faktor yang dapat dijelaskan:

- BMI;
- physical activity;
- sleep duration;
- smoking status;
- family history.

---

## 18.10 Health Score & Lifestyle Score Definition of Done

Health Score dan Lifestyle Score dinyatakan Done apabila:

- [ ] Formula telah ditentukan.
- [ ] Weight setiap faktor telah ditentukan.
- [ ] Normalization telah ditentukan apabila diperlukan.
- [ ] Score memiliki range yang konsisten.
- [ ] Score dapat dihitung dari input user.
- [ ] Score ditampilkan pada dashboard.
- [ ] Score dapat berubah ketika input berubah.
- [ ] Formula terdokumentasi.
- [ ] Score tidak diposisikan sebagai diagnosis medis.

Health Score dan Lifestyle Score merupakan **indikator produk**, bukan clinical score resmi.

---

## 18.11 Future Health Simulation Definition of Done

Future Health Simulation dinyatakan Done apabila:

- [ ] User dapat melihat baseline condition.
- [ ] Sistem dapat melakukan simulasi terhadap kondisi masa depan.
- [ ] Simulation menggunakan model yang telah tersedia.
- [ ] Input simulation dapat diproses tanpa mengubah data profil utama.
- [ ] Simulation menghasilkan output yang konsisten.
- [ ] Minimal terdapat horizon simulation yang telah ditentukan untuk MVP.
- [ ] Hasil simulation dapat dibandingkan dengan baseline.
- [ ] Hasil simulation ditampilkan secara mudah dipahami.
- [ ] Disclaimer simulation ditampilkan.

Simulation harus diposisikan sebagai:

> Proyeksi berbasis model berdasarkan perubahan lifestyle, bukan prediksi medis yang pasti.

---

## 18.12 What-if Simulation Definition of Done

What-if Simulation dinyatakan Done apabila:

- [ ] User dapat mengubah parameter lifestyle.
- [ ] Parameter yang dapat diubah telah ditentukan.
- [ ] Perubahan parameter tidak langsung mengubah data profil asli.
- [ ] Sistem melakukan recalculation.
- [ ] Risk estimation diperbarui.
- [ ] Health/Lifestyle Score diperbarui apabila relevan.
- [ ] Perubahan baseline dan scenario dapat dibandingkan.
- [ ] Response time memenuhi NFR MVP.
- [ ] User dapat melakukan reset scenario.
- [ ] User memahami bahwa hasil merupakan simulation.

Parameter utama MVP dapat meliputi:

- sleep duration;
- physical activity;
- weight/BMI;
- smoking status apabila sesuai dengan model.

---

## 18.13 Recommendation Engine Definition of Done

Recommendation Engine dinyatakan Done apabila:

- [ ] Rule telah didefinisikan.
- [ ] Rule memiliki source/reference.
- [ ] Rule dapat dieksekusi berdasarkan kondisi user.
- [ ] Recommendation memiliki kondisi yang jelas.
- [ ] Recommendation dapat diprioritaskan.
- [ ] Recommendation tidak dibuat langsung oleh model LLM.
- [ ] Recommendation dapat ditampilkan pada dashboard.
- [ ] Recommendation dapat dikaitkan dengan evidence.
- [ ] Recommendation tidak memberikan prescription atau treatment medis.

Contoh:

```text
IF sleep_duration < 6 hours
THEN recommend improving sleep duration
```

---

## 18.14 LLM Definition of Done

LLM integration dinyatakan Done apabila:

- [ ] LLM tidak digunakan sebagai risk prediction engine.
- [ ] LLM hanya digunakan untuk explanation/narrative.
- [ ] Input ke LLM berasal dari hasil sistem yang telah ditentukan.
- [ ] LLM tidak boleh mengubah numerical prediction.
- [ ] Output dapat dipahami oleh pengguna.
- [ ] Prompt telah didefinisikan.
- [ ] Output memiliki guardrail.
- [ ] Hallucination risk diminimalkan.
- [ ] Medical diagnosis claim dicegah.
- [ ] LLM failure memiliki fallback mechanism.
- [ ] API key/credential tidak terekspos pada frontend.

---

## 18.15 RAG & Evidence Center Definition of Done

RAG dinyatakan Done apabila:

- [ ] Knowledge source telah ditentukan.
- [ ] Dokumen telah dikurasi.
- [ ] Dokumen memiliki source metadata.
- [ ] Dokumen memiliki judul dan organisasi penerbit.
- [ ] Dokumen memiliki URL atau reference apabila tersedia.
- [ ] Dokumen diproses ke knowledge base.
- [ ] Retrieval dapat menemukan evidence yang relevan.
- [ ] Evidence dapat ditampilkan kepada user.
- [ ] LLM menggunakan retrieved evidence sebagai context.
- [ ] Evidence dapat ditelusuri kembali ke sumber.
- [ ] Sumber tidak berasal dari konten yang tidak terpercaya tanpa validasi.

Prioritas sumber:

1. WHO;
2. Kementerian Kesehatan RI;
3. PERKENI;
4. PERKI;
5. CDC;
6. publikasi ilmiah yang relevan.

---

## 18.16 Safety Guardrail Definition of Done

Safety Guardrail dinyatakan Done apabila:

- [ ] Threshold safety telah ditentukan.
- [ ] Kondisi trigger telah ditentukan.
- [ ] Sistem dapat mendeteksi kondisi tersebut.
- [ ] Pesan safety ditampilkan kepada user.
- [ ] Pesan tidak memberikan diagnosis.
- [ ] Pesan tidak memberikan treatment atau prescription.
- [ ] Sistem menyarankan konsultasi tenaga kesehatan apabila diperlukan.
- [ ] Safety message tidak dapat dilewati secara diam-diam pada kondisi critical.

Contoh:

```text
IF estimated_risk >= safety_threshold
THEN display healthcare consultation guidance
```

---

## 18.17 Security Definition of Done

Fitur dinyatakan Done dari sisi security apabila:

- [ ] Password disimpan menggunakan hashing yang aman.
- [ ] Authentication diterapkan dengan benar.
- [ ] Authorization diterapkan.
- [ ] Sensitive endpoint dilindungi.
- [ ] Input validation tersedia.
- [ ] SQL injection dicegah melalui mekanisme ORM/query parameterization.
- [ ] XSS protection diterapkan.
- [ ] Secrets tidak disimpan di source code.
- [ ] Environment variables digunakan untuk credential.
- [ ] API authentication diterapkan sesuai kebutuhan.
- [ ] Error response tidak membocorkan informasi sensitif.
- [ ] Sensitive user data tidak ditampilkan secara tidak perlu.

---

## 18.18 Privacy & Consent Definition of Done

Privacy dan consent dinyatakan Done apabila:

- [ ] Consent screen tersedia.
- [ ] Tujuan penggunaan data dijelaskan.
- [ ] User mengetahui bahwa HELIORA bukan alat diagnosis.
- [ ] User memberikan consent sebelum menggunakan fitur yang membutuhkan data personal.
- [ ] Mekanisme consent withdrawal tersedia sesuai scope MVP.
- [ ] Mekanisme account/data deletion tersedia atau limitation-nya terdokumentasi.
- [ ] Data hanya digunakan sesuai tujuan MVP.
- [ ] Data tidak dibagikan kepada pihak ketiga tanpa dasar yang jelas.
- [ ] Penggunaan external AI provider terhadap health data terdokumentasi.
- [ ] Sensitive data tidak ditampilkan secara publik.
- [ ] Retention policy terdokumentasi.
- [ ] Mekanisme pengelolaan data terdokumentasi.

---


## 18.19 Testing Definition of Done

Sebuah fitur dinyatakan Done apabila telah melewati pengujian yang relevan.

### Functional Testing

- [ ] Happy path berhasil.
- [ ] Invalid input telah diuji.
- [ ] Empty input telah diuji.
- [ ] Boundary value telah diuji.
- [ ] Error scenario telah diuji.
- [ ] Unauthorized access telah diuji.

### Integration Testing

- [ ] Frontend ↔ Backend berhasil.
- [ ] Backend ↔ Database berhasil.
- [ ] Backend ↔ ML Engine berhasil.
- [ ] Backend ↔ LLM/RAG berhasil apabila relevan.

### AI Testing

- [ ] Model dapat melakukan inference.
- [ ] Output model memiliki format yang benar.
- [ ] Simulation menghasilkan output.
- [ ] What-if menghasilkan perubahan yang konsisten.
- [ ] Model failure dapat ditangani.

### Security Testing

- [ ] Authentication test.
- [ ] Authorization test.
- [ ] Input validation test.
- [ ] API security test.
- [ ] Sensitive data exposure test.

---

## 18.20 Performance Definition of Done

Performance dinyatakan Done apabila memenuhi target MVP yang telah ditentukan dalam Non-Functional Requirements.

Target utama:

| Area                   |                       Target MVP |
| ---------------------- | -------------------------------: |
| Standard page response |                        < 3 detik |
| What-if simulation     |   < 1 detik apabila memungkinkan |
| Risk estimation        |              cepat dan responsif |
| LLM + RAG explanation  |                        < 5 detik |
| API response           |        sesuai kebutuhan endpoint |
| Application crash      | tidak terjadi pada critical flow |

Apabila external LLM/API mengalami latency, sistem harus memiliki loading state dan fallback yang sesuai.

---

## 18.21 Documentation Definition of Done

Dokumentasi dinyatakan Done apabila:

- [ ] PRD telah diperbarui.
- [ ] Architecture documentation telah diperbarui.
- [ ] API documentation telah diperbarui.
- [ ] Database/ERD telah diperbarui.
- [ ] README telah diperbarui.
- [ ] Setup instruction tersedia.
- [ ] Environment variable terdokumentasi tanpa membocorkan secret.
- [ ] AI model documentation tersedia.
- [ ] Dataset source tercatat.
- [ ] Dataset license/source tercatat.
- [ ] RAG knowledge source tercatat.
- [ ] Known limitation terdokumentasi.

---

## 18.22 Code Quality Definition of Done

Kode dinyatakan Done apabila:

- [ ] Mengikuti coding convention proyek.
- [ ] Struktur folder sesuai architecture.
- [ ] Tidak terdapat dead code yang tidak diperlukan.
- [ ] Tidak terdapat hardcoded credentials.
- [ ] Tidak terdapat debugging code.
- [ ] Error handling tersedia.
- [ ] Function/class memiliki tanggung jawab yang jelas.
- [ ] Tidak terdapat duplicate logic yang tidak diperlukan.
- [ ] Code review telah dilakukan.
- [ ] Critical lint/type/test error telah diselesaikan.

---

## 18.23 Git & Collaboration Definition of Done

Perubahan dinyatakan Done apabila:

- [ ] Branch memiliki tujuan yang jelas.
- [ ] Commit memiliki message yang informatif.
- [ ] Pull request telah dibuat apabila workflow menggunakan PR.
- [ ] Code review telah dilakukan.
- [ ] Conflict telah diselesaikan.
- [ ] Automated checks berhasil.
- [ ] Tidak terdapat perubahan tidak terkait dalam commit.
- [ ] Branch telah diintegrasikan ke branch target.

---

## 18.24 Deployment Definition of Done

Fitur dinyatakan Done untuk deployment apabila:

- [ ] Application dapat dijalankan pada environment deployment.
- [ ] Environment variable telah dikonfigurasi.
- [ ] Database dapat terhubung.
- [ ] Migration dapat dijalankan.
- [ ] Backend dapat diakses.
- [ ] Frontend dapat diakses.
- [ ] API integration berjalan.
- [ ] Critical user flow dapat digunakan.
- [ ] Error logging tersedia.
- [ ] Deployment dapat diulang secara konsisten.

---

## 18.25 Live Demo Definition of Done

Karena HELIORA dikembangkan untuk kompetisi, MVP juga harus memenuhi kebutuhan live demonstration.

Demo dinyatakan siap apabila:

- [ ] User dapat melakukan onboarding.
- [ ] User dapat mengisi health profile.
- [ ] Dashboard dapat menampilkan hasil.
- [ ] Risk estimation dapat ditampilkan.
- [ ] Explainable AI dapat ditampilkan.
- [ ] Future Health Simulation dapat dijalankan.
- [ ] What-if Simulation dapat digunakan.
- [ ] Recommendation dapat ditampilkan.
- [ ] Evidence Center dapat dibuka.
- [ ] LLM explanation dapat ditampilkan apabila tersedia.
- [ ] Safety disclaimer terlihat.
- [ ] Tidak terdapat critical error selama demo.
- [ ] Demo flow dapat dilakukan tanpa intervensi developer.

---

## 18.26 MVP Definition of Done

HELIORA MVP dinyatakan **DONE** apabila seluruh kriteria **Core MVP/P0** terpenuhi. P1/Enhanced MVP dicatat sebagai enhancement dan tidak boleh menjadi single point of failure terhadap core flow.

### Product — P0

- [ ] Problem statement telah tervalidasi.
- [ ] Target user telah ditentukan.
- [ ] Core user journey P0 berjalan.
- [ ] MVP scope P0 telah terpenuhi.

### Core AI — P0

- [ ] Preventive Lifestyle Risk Engine berjalan.
- [ ] Risk estimation berjalan dengan semantics output yang terdokumentasi.
- [ ] Explainable AI berjalan.
- [ ] What-if Simulation berjalan.
- [ ] Recommendation Engine berjalan.
- [ ] Deterministic fallback tersedia untuk explanation.

### Enhanced AI — P1

- [ ] Future Health Simulation berjalan apabila termasuk release scope.
- [ ] Evidence Center berjalan apabila termasuk release scope.
- [ ] RAG berjalan apabila termasuk release scope.
- [ ] LLM-assisted explanation berjalan apabila service tersedia.

### Safety

- [ ] Medical disclaimer tersedia.
- [ ] Safety guardrail tersedia.
- [ ] Output tidak diposisikan sebagai diagnosis atau clinical probability tanpa validasi yang sesuai.

### Technical

- [ ] Frontend Next.js berjalan.
- [ ] Backend FastAPI berjalan.
- [ ] PostgreSQL berjalan.
- [ ] API integration berjalan.
- [ ] AI model/service dapat digunakan oleh backend.
- [ ] Deployment berhasil.

### Quality

- [ ] Functional testing selesai.
- [ ] Integration testing selesai.
- [ ] Security testing dasar selesai.
- [ ] Critical bug = 0.
- [ ] Acceptance Criteria P0 terpenuhi.

### Documentation

- [ ] PRD selesai.
- [ ] Architecture documentation selesai.
- [ ] ERD selesai.
- [ ] API documentation selesai.
- [ ] README selesai.
- [ ] Dataset documentation selesai.
- [ ] AI methodology terdokumentasi.
- [ ] Known limitations terdokumentasi.

---


## 18.27 Critical Flow Definition of Done

Critical flow **P0** HELIORA harus dapat berjalan tanpa blocker:

```text
Landing Page
      ↓
Onboarding
      ↓
Consent
      ↓
Health Profile
      ↓
Health & Lifestyle Score
      ↓
Risk Estimation
      ↓
Explainable AI
      ↓
What-if Simulation
      ↓
Recommendation
      ↓
Preventive Action
```

Enhanced flow **P1** dapat menambahkan:

```text
Future Health Simulation
      ↓
Evidence Center / RAG
      ↓
Optional LLM Explanation
```

Apabila salah satu komponen P0 mengalami **blocking error**, MVP belum dapat dinyatakan Done. Kegagalan LLM tidak boleh memblokir core MVP.

---


## 18.28 Definition of Done Checklist

| Area                     | Done |
| ------------------------ | :--: |
| Product Requirements     |  ☐   |
| Functional Requirements  |  ☐   |
| UI/UX                    |  ☐   |
| Frontend                 |  ☐   |
| Backend                  |  ☐   |
| PostgreSQL               |  ☐   |
| Authentication           |  ☐   |
| Consent & Privacy        |  ☐   |
| Risk Engine              |  ☐   |
| Explainable AI           |  ☐   |
| Health Score             |  ☐   |
| Lifestyle Score          |  ☐   |
| Future Health Simulation |  ☐   |
| What-if Simulation       |  ☐   |
| Recommendation Engine    |  ☐   |
| RAG                      |  ☐   |
| Evidence Center          |  ☐   |
| LLM Explanation          |  ☐   |
| Safety Guardrail         |  ☐   |
| Security                 |  ☐   |
| Functional Testing       |  ☐   |
| Integration Testing      |  ☐   |
| Performance Testing      |  ☐   |
| Deployment               |  ☐   |
| Documentation            |  ☐   |
| Live Demo                |  ☐   |
| Acceptance Criteria      |  ☐   |

---

## 18.29 Final Definition

HELIORA MVP hanya dapat dinyatakan **Done** apabila produk telah memenuhi kebutuhan pengguna, seluruh critical feature telah berjalan end-to-end, AI pipeline dapat menghasilkan output yang konsisten, safety boundary telah diterapkan, sistem telah diuji, dan seluruh dokumentasi utama telah tersedia.

Definition of Done HELIORA berorientasi pada prinsip:

> **Build → Test → Validate → Secure → Document → Demonstrate**

Dengan demikian, **"kode selesai" tidak sama dengan "fitur selesai"**.

Sebuah fitur baru dianggap selesai apabila fitur tersebut:

**berfungsi → teruji → aman → sesuai requirement → terdokumentasi → siap didemonstrasikan.**

---

# 19. Team & Responsibility

## 19.1 Team Structure

Pengembangan HELIORA dilakukan oleh tim yang terdiri dari **5 anggota** dengan pembagian tanggung jawab berdasarkan kompetensi dan kebutuhan pengembangan produk.

Struktur tim dirancang untuk memastikan seluruh area utama pengembangan produk tercakup, meliputi:

- Product Management
- Business Analysis & Research
- Solution Architecture
- Frontend Engineering
- Backend Engineering
- DevOps & Deployment
- Quality Assurance & Security
- Documentation & Presentation

Pembagian tanggung jawab menggunakan model **primary responsibility** dan **shared responsibility**, sehingga setiap anggota memiliki area utama yang jelas sekaligus dapat berkolaborasi pada area yang saling berkaitan.

---

## 19.2 Team Roles

| No. | Role                         | Tanggung Jawab Utama                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Product & Project Manager    | Menentukan visi, prioritas, scope, roadmap, dan koordinasi proyek                     |
| 2   | Business Analyst & Research  | Melakukan riset masalah, pengguna, kompetitor, dan validasi solusi                    |
| 3   | Solution Architect           | Menentukan arsitektur sistem, struktur database, API, dan technical decision          |
| 4   | Frontend Engineer            | Mengembangkan interface dan user experience HELIORA                                   |
| 5   | Backend Engineer             | Mengembangkan business logic, API, AI integration, database, dan security             |
| 6   | DevOps & Deployment          | Mengelola repository, CI/CD, environment, deployment, dan release                     |
| 7   | Quality Assurance & Security | Melakukan testing, quality control, edge-case testing, dan security validation        |
| 8   | Documentation & Presentation | Mengelola dokumentasi proyek, README, technical documentation, presentation, dan demo |

---

## 19.3 Responsibility Assignment

### Angga

**Primary Roles:**

1. Product & Project Manager
2. Business Analyst & Research
3. Solution Architect
4. Documentation & Presentation

**Responsibilities:**

- Menentukan product vision dan product direction.
- Menjaga kesesuaian implementasi dengan PRD.
- Menentukan prioritas fitur dan MVP scope.
- Mengelola roadmap dan milestone pengembangan.
- Mengkoordinasikan pekerjaan antaranggota.
- Melakukan product discovery dan problem validation.
- Melakukan research terhadap:
  - target users;
  - health problems;
  - preventive health;
  - kompetitor;
  - evidence pendukung.
- Menentukan kebutuhan bisnis dan product requirements.
- Membantu menentukan system architecture.
- Menjaga konsistensi keputusan teknis dengan product requirements.
- Menjadi salah satu pengambil keputusan dalam technical architecture.
- Menjaga PRD sebagai product source of truth.
- Menyusun dokumentasi produk.
- Menyiapkan materi presentasi dan demo.
- Menjaga keselarasan antara produk, dokumentasi, dan narasi kompetisi.

---

### Gilang & Aksal

**Primary Roles:**

1. Solution Architect
2. Backend Engineer
3. Quality Assurance & Security

**Responsibilities:**

- Merancang dan menjaga arsitektur backend.
- Menentukan struktur service dan module backend.
- Mendesain database PostgreSQL.
- Menentukan struktur API.
- Menentukan API contract antara frontend dan backend.
- Mengembangkan backend menggunakan FastAPI.
- Mengimplementasikan:
  - authentication;
  - authorization;
  - user management;
  - health profile;
  - risk estimation;
  - simulation;
  - recommendation engine;
  - AI integration;
  - evidence retrieval;
  - data persistence.
- Mengembangkan dan mengintegrasikan Preventive Lifestyle Risk Engine.
- Mengintegrasikan Explainable AI.
- Mengembangkan What-if Simulation.
- Mengembangkan Future Health Simulation.
- Mengembangkan Rule Engine.
- Mengintegrasikan LLM dan RAG.
- Mengimplementasikan validasi input dan business rules.
- Menjaga keamanan API dan database.
- Melakukan unit testing dan integration testing.
- Melakukan API testing.
- Menguji edge cases.
- Melakukan security validation.
- Memastikan backend memenuhi requirement performa dan reliability.
- Membantu deployment dan troubleshooting apabila diperlukan.

**Pembagian internal:**

Gilang dan Aksal bekerja sebagai **shared backend team**, bukan sebagai dua backend yang sepenuhnya terpisah.

Pembagian task dapat dilakukan berdasarkan module, misalnya:

- satu anggota lebih fokus pada core backend dan database;
- satu anggota lebih fokus pada AI engine, simulation, integration, dan testing.

Pembagian detail dapat disesuaikan berdasarkan progress sprint.

---

### Pino & Tumir

**Primary Roles:**

1. Frontend Engineer
2. DevOps & Deployment
3. Quality Assurance & Security

**Responsibilities:**

- Mengimplementasikan UI/UX HELIORA menggunakan Next.js.
- Mengembangkan halaman:
  - onboarding;
  - health profile;
  - dashboard;
  - risk estimation;
  - Explainable AI;
  - Future Health Simulation;
  - What-if Simulation;
  - recommendation;
  - Evidence Center.
- Mengimplementasikan responsive interface.
- Mengintegrasikan frontend dengan FastAPI.
- Mengelola state dan user interaction.
- Memastikan pengalaman pengguna konsisten dengan design system.
- Mengimplementasikan interactive simulation interface.
- Mengoptimalkan frontend performance.
- Mengelola Git workflow.
- Membantu konfigurasi development dan production environment.
- Mengelola deployment frontend.
- Membantu konfigurasi CI/CD.
- Melakukan release management.
- Membantu monitoring aplikasi.
- Melakukan frontend testing.
- Melakukan cross-browser testing.
- Menguji responsive layout.
- Melakukan usability testing.
- Membantu security testing pada sisi frontend.
- Melakukan regression testing sebelum release.

**Pembagian internal:**

Pino dan Tumir bekerja sebagai **shared frontend & DevOps team**.

Pembagian task dapat dilakukan berdasarkan module, misalnya:

- satu anggota lebih fokus pada frontend implementation;
- satu anggota lebih fokus pada frontend integration, DevOps, deployment, dan testing.

Pembagian detail dapat disesuaikan berdasarkan kebutuhan sprint.

---

## 19.4 Responsibility Matrix

| Area                     |  Angga   | Gilang & Aksal | Pino & Tumir |
| ------------------------ | :------: | :------------: | :----------: |
| Product Vision           | **Lead** |    Support     |   Support    |
| Product Requirements     | **Lead** |    Support     |   Support    |
| Product Roadmap          | **Lead** |    Support     |   Support    |
| Business Analysis        | **Lead** |    Support     |   Support    |
| User Research            | **Lead** |    Support     |   Support    |
| Competitor Research      | **Lead** |    Support     |   Support    |
| System Architecture      | **Lead** |    **Lead**    |   Support    |
| Database Architecture    | Support  |    **Lead**    |      -       |
| API Design               | Support  |    **Lead**    |   Support    |
| Backend Development      | Support  |    **Lead**    |      -       |
| AI Engine                | Support  |    **Lead**    |      -       |
| ML Integration           | Support  |    **Lead**    |   Support    |
| Explainable AI           | Support  |    **Lead**    |   Support    |
| Simulation Engine        | Support  |    **Lead**    |   Support    |
| Rule Engine              | Support  |    **Lead**    |      -       |
| LLM Integration          | Support  |    **Lead**    |   Support    |
| RAG Integration          | Support  |    **Lead**    |   Support    |
| Frontend Development     | Support  |    Support     |   **Lead**   |
| UI/UX Implementation     | Support  |       -        |   **Lead**   |
| Frontend API Integration | Support  |    Support     |   **Lead**   |
| DevOps                   | Support  |    Support     |   **Lead**   |
| CI/CD                    | Support  |    Support     |   **Lead**   |
| Deployment               | Support  |    Support     |   **Lead**   |
| QA Testing               | Support  |    **Lead**    |   **Lead**   |
| Security Testing         | Support  |    **Lead**    |   **Lead**   |
| Documentation            | **Lead** |    Support     |   Support    |
| Technical Documentation  | **Lead** |    **Lead**    |   Support    |
| Presentation             | **Lead** |    Support     |   Support    |
| Demo Preparation         | **Lead** |    **Lead**    |   **Lead**   |

---

## 19.5 Decision Ownership

Untuk menghindari konflik keputusan, setiap area memiliki owner utama.

| Decision Area            | Owner                         |
| ------------------------ | ----------------------------- |
| Product Vision           | Angga                         |
| Product Scope            | Angga                         |
| Feature Priority         | Angga                         |
| Business Requirement     | Angga                         |
| Research Direction       | Angga                         |
| System Architecture      | Angga + Gilang & Aksal        |
| Backend Architecture     | Gilang & Aksal                |
| Database Design          | Gilang & Aksal                |
| API Contract             | Gilang & Aksal                |
| AI Architecture          | Gilang & Aksal + Angga        |
| Frontend Architecture    | Pino & Tumir                  |
| UI Implementation        | Pino & Tumir                  |
| Deployment Architecture  | Pino & Tumir                  |
| QA Gate                  | Gilang & Aksal + Pino & Tumir |
| Documentation            | Angga                         |
| Presentation             | Angga                         |
| Final Product Decision   | Angga                         |
| Final Technical Decision | Angga + Solution Architect    |

Keputusan yang berdampak terhadap **product scope, MVP, timeline, atau competition strategy** harus dikonsultasikan kepada Product & Project Manager.

Keputusan teknis yang bersifat implementatif dapat diputuskan oleh Solution Architect selama tidak bertentangan dengan PRD dan architecture decision yang telah disepakati.

---

## 19.6 Collaboration Model

Pengembangan HELIORA menggunakan pola kolaborasi lintas fungsi.

### Product → Architecture

```text
Product Requirement
        ↓
Business Requirement
        ↓
Technical Requirement
        ↓
System Architecture
        ↓
Implementation
```

Angga memastikan kebutuhan produk jelas sebelum implementasi teknis dilakukan.

Gilang dan Aksal menerjemahkan kebutuhan tersebut menjadi technical architecture dan backend implementation.

---

### Backend ↔ Frontend

```text
FastAPI Backend
       ↕
    API Contract
       ↕
Next.js Frontend
```

Backend dan frontend harus menggunakan API contract yang telah disepakati.

Perubahan pada API harus dikomunikasikan kepada tim frontend sebelum implementation atau integration dilakukan.

---

### AI ↔ Backend

```text
User Input
    ↓
Backend Validation
    ↓
AI / Risk Engine
    ↓
Risk Result
    ↓
Explainability
    ↓
Simulation
    ↓
Recommendation
    ↓
LLM + RAG
```

AI component harus diperlakukan sebagai bagian dari system architecture, bukan sebagai komponen terpisah dari backend.

---

### QA sebagai Quality Gate

```text
Implementation
      ↓
Developer Testing
      ↓
Integration Testing
      ↓
QA Testing
      ↓
Bug Fix
      ↓
Regression Testing
      ↓
Release
```

Feature tidak dianggap selesai hanya karena code telah dibuat.

Feature harus memenuhi acceptance criteria dan melewati quality gate sebelum dianggap selesai.

---

## 19.7 Communication & Workflow

Tim menggunakan workflow kolaboratif berbasis task dan milestone.

Setiap pekerjaan harus memiliki:

- tujuan yang jelas;
- scope yang jelas;
- owner;
- acceptance criteria;
- status;
- dependency jika ada.

Status task:

```text
Backlog
   ↓
Ready
   ↓
In Progress
   ↓
Review
   ↓
Testing
   ↓
Done
```

Task tidak boleh langsung dianggap `Done` setelah implementasi selesai.

---

## 19.8 Git & Code Collaboration

Seluruh source code harus dikelola menggunakan Git repository.

Prinsip utama:

- setiap anggota bekerja menggunakan branch;
- perubahan tidak langsung dilakukan pada production/main branch;
- pull request digunakan untuk perubahan yang signifikan;
- commit harus memiliki pesan yang jelas;
- perubahan harus direview sebelum merge;
- konflik harus diselesaikan sebelum merge;
- branch yang telah selesai harus dibersihkan secara berkala.

Contoh workflow:

```text
main
 │
 ├── feature/frontend-dashboard
 │
 ├── feature/risk-engine
 │
 ├── feature/simulation
 │
 └── feature/evidence-center
```

---

## 19.9 Documentation Ownership

Dokumentasi proyek menjadi tanggung jawab bersama dengan Angga sebagai documentation owner.

Dokumentasi utama meliputi:

- PRD;
- system architecture;
- API documentation;
- database documentation;
- AI architecture;
- dataset documentation;
- setup guide;
- deployment guide;
- README;
- testing documentation;
- presentation material;
- demo scenario.

Setiap anggota bertanggung jawab memberikan informasi teknis pada area yang dikerjakannya.

---

## 19.10 Knowledge Sharing

Karena beberapa role dikerjakan secara bersama, setiap anggota wajib menghindari ketergantungan pada satu individu.

Prinsip yang digunakan:

> **No Single Point of Knowledge**

Minimal terdapat knowledge sharing untuk:

- backend;
- frontend;
- AI pipeline;
- database;
- deployment;
- testing.

Tujuannya agar apabila salah satu anggota mengalami kendala, anggota lain tetap dapat melanjutkan pekerjaan.

---

## 19.11 Team Responsibility Principle

Seluruh anggota tim memiliki tanggung jawab bersama terhadap kualitas akhir HELIORA.

Pembagian role tidak berarti anggota hanya bertanggung jawab terhadap role masing-masing.

Setiap anggota tetap diharapkan:

- memahami product vision;
- memahami core user journey;
- memahami killer feature;
- memahami batasan medical AI;
- menjaga kualitas produk;
- membantu debugging;
- membantu testing;
- menjaga dokumentasi;
- membantu persiapan presentasi dan demo.

Prinsip utama:

> **Role ownership, team responsibility.**

---

## 19.12 Final Team Structure

Struktur final tim HELIORA adalah:

```text
                    HELIORA TEAM
                         │
                    Product Lead
                       Angga
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Product &      Backend &      Frontend &
       Research       AI Team        DevOps Team
          │              │              │
        Angga       Gilang & Aksal   Pino & Tumir
          │              │              │
          ▼              ▼              ▼
       Product        FastAPI        Next.js
       Research       PostgreSQL     Deployment
       PRD            AI Engine      CI/CD
       Roadmap        RAG/LLM        QA
       Documentation  Simulation     Security
```

Struktur ini memberikan pemisahan yang jelas antara:

1. **Product & Research**
2. **Backend & AI**
3. **Frontend & DevOps**

dengan **QA & Security** sebagai tanggung jawab lintas tim.

---

## 19.13 Responsibility Success Criteria

Pembagian tanggung jawab dianggap efektif apabila:

- setiap area pengembangan memiliki owner;
- tidak terdapat critical module tanpa owner;
- setiap anggota memahami tanggung jawabnya;
- dependency antaranggota terdokumentasi;
- komunikasi antar role berjalan secara aktif;
- task memiliki owner dan acceptance criteria;
- perubahan teknis dikomunikasikan;
- tidak terdapat single point of knowledge pada critical component;
- seluruh anggota memahami product vision;
- seluruh anggota dapat mendukung proses testing dan demo;
- tanggung jawab tetap dapat disesuaikan berdasarkan kebutuhan sprint.

Dengan struktur tersebut, tim HELIORA memiliki pembagian tanggung jawab yang cukup jelas untuk mendukung pengembangan MVP secara terkoordinasi tanpa membuat struktur organisasi menjadi terlalu kompleks.

---

# 20. Appendix

## 20.1 Appendix Overview

Appendix berisi informasi pendukung yang digunakan untuk melengkapi Product Requirements Document (PRD) HELIORA.

Bagian ini tidak menjadi bagian utama dari requirement produk, tetapi berfungsi sebagai **reference material** untuk membantu tim memahami konteks produk, keputusan desain, arsitektur, data, AI, kompetisi, dan implementasi.

Appendix dapat diperbarui selama proses pengembangan apabila terdapat perubahan requirement, technical decision, dataset, atau strategi kompetisi.

---

## 20.2 Product Identity Reference

### Product Name

**HELIORA**

### Product Category

**AI-Powered Preventive Health Intelligence Platform**

### Tagline

**Predict Today. Prevent Tomorrow.**

### SDG Alignment

**SDG 3 — Good Health and Well-being**

### Product Positioning

HELIORA adalah platform preventive health berbasis AI yang membantu masyarakat Indonesia memahami kondisi lifestyle mereka, memperoleh estimasi risiko kesehatan, mengeksplorasi kemungkinan perubahan kondisi melalui simulasi, dan memperoleh rekomendasi preventif yang didukung oleh evidence ilmiah.

### Core Product Statement

> HELIORA membantu pengguna memahami hubungan antara lifestyle saat ini dengan kemungkinan kondisi kesehatan di masa depan melalui risk estimation, explainable AI, Future Health Simulation, What-if Simulation, dan evidence-based recommendation.

---

## 20.3 Product Principles

Pengembangan HELIORA mengikuti prinsip berikut:

### 1. Preventive First

HELIORA berfokus pada pencegahan dan peningkatan health awareness, bukan diagnosis atau treatment.

### 2. Evidence Based

Rekomendasi dan penjelasan kesehatan harus memiliki dasar evidence yang dapat ditelusuri.

### 3. Explainable AI

Pengguna harus dapat memahami alasan di balik hasil estimasi yang diberikan sistem.

### 4. User-Centered

Informasi kesehatan harus disajikan dengan bahasa dan visualisasi yang mudah dipahami pengguna non-medis.

### 5. Simulation Driven

HELIORA tidak hanya menunjukkan kondisi saat ini, tetapi memberikan kesempatan kepada pengguna untuk mengeksplorasi skenario perubahan lifestyle.

### 6. Safety First

Seluruh output AI harus memiliki batasan yang jelas dan tidak boleh diposisikan sebagai diagnosis medis.

---

## 20.4 Core Feature Reference

Fitur utama HELIORA terdiri dari:

| Feature                  | Fungsi                                                               |
| ------------------------ | -------------------------------------------------------------------- |
| Health Profile           | Mengumpulkan data lifestyle dan health profile pengguna              |
| Health Score             | Memberikan indikator kondisi lifestyle secara agregat                |
| Lifestyle Score          | Menggambarkan kualitas lifestyle berdasarkan parameter yang tersedia |
| Risk Estimation          | Mengestimasi risiko kesehatan berdasarkan model                      |
| Explainable AI           | Menjelaskan faktor yang berkontribusi terhadap hasil                 |
| Future Health Simulation | Memproyeksikan perubahan berdasarkan kondisi lifestyle               |
| What-if Simulation       | Mengeksplorasi dampak perubahan parameter lifestyle                  |
| Recommendation Engine    | Menghasilkan rekomendasi preventif berbasis rule                     |
| Evidence Center          | Menampilkan evidence yang mendukung rekomendasi                      |
| LLM Explanation          | Mengubah hasil teknis menjadi penjelasan yang mudah dipahami         |

---

## 20.5 AI Architecture Reference

Arsitektur AI MVP HELIORA:

```text
User Health & Lifestyle Input
            │
            ▼
Input Validation
            │
            ▼
Preventive Lifestyle Risk Engine
            │
            ▼
Risk Estimation
            │
            ▼
Explainable AI
            │
            ▼
Future Health Simulation
            │
            ▼
What-if Simulation
            │
            ▼
Recommendation Engine
            │
            ▼
LLM + RAG
            │
            ▼
Human-Friendly Explanation
            │
            ▼
Evidence Center
```

### AI Components

| Component         | Role                                 |
| ----------------- | ------------------------------------ |
| Machine Learning  | Risk estimation                      |
| Explainable AI    | Menjelaskan kontribusi feature       |
| Simulation Engine | Memproyeksikan skenario              |
| Rule Engine       | Menentukan rekomendasi               |
| LLM               | Menyusun penjelasan natural language |
| RAG               | Mengambil evidence yang relevan      |

---

## 20.6 AI Boundary

AI HELIORA memiliki batasan berikut:

```text
HELIORA
   │
   ├── Risk Estimation
   ├── Lifestyle Analysis
   ├── Simulation
   ├── Recommendation
   └── Evidence Explanation
          │
          ▼
     Preventive Support
```

HELIORA **tidak** digunakan untuk:

- diagnosis penyakit;
- pemberian resep;
- menentukan treatment;
- menggantikan dokter;
- clinical decision making;
- emergency medical response.

Seluruh hasil harus menggunakan terminologi seperti:

- estimated risk;
- risk level;
- projection;
- simulation;
- lifestyle insight;
- preventive recommendation.

Bukan:

- diagnosis;
- confirmed disease;
- medical certainty.

---

## 20.7 Dataset Reference

Dataset digunakan berdasarkan fungsi masing-masing dan tidak seluruhnya harus digunakan sebagai training dataset.

### Primary ML Dataset

Dataset utama digunakan untuk membangun Preventive Lifestyle Risk Engine.

Kandidat utama:

- CDC BRFSS;
- NHANES;
- dataset akademik yang relevan.

### Indonesia Context Dataset

Digunakan untuk memahami konteks populasi Indonesia dan melakukan validasi konseptual.

Sumber yang dapat digunakan:

- Survei Kesehatan Indonesia (SKI);
- IFLS;
- Riskesdas apabila data yang diperlukan tersedia dan dapat digunakan secara legal;
- BPS untuk statistik pendukung.

### Dataset Principle

```text
Global Dataset
      │
      ▼
Model Development
      │
      ▼
Risk Engine
      │
      ├── Indonesia Context Validation
      │
      └── Limitation Assessment
```

Model yang menggunakan data internasional harus dinyatakan memiliki keterbatasan terhadap **domain shift** ketika diterapkan pada populasi Indonesia.

---

## 20.8 Core ML Input Reference

Variabel utama yang diprioritaskan untuk MVP:

| Variable          | Description              |
| ----------------- | ------------------------ |
| Age               | Usia pengguna            |
| Gender            | Jenis kelamin            |
| Height            | Tinggi badan             |
| Weight            | Berat badan              |
| Physical Activity | Aktivitas fisik          |
| Sleep Duration    | Durasi tidur             |
| Smoking           | Status/kebiasaan merokok |
| Family History    | Riwayat keluarga         |

Variabel tambahan dapat digunakan apabila dataset dan waktu pengembangan memungkinkan:

- stress level;
- waist circumference;
- blood pressure;
- blood sugar;
- cholesterol.

Penambahan feature tidak boleh dilakukan hanya untuk meningkatkan kompleksitas. Setiap feature harus memiliki:

1. relevansi terhadap problem;
2. ketersediaan data;
3. kualitas data;
4. interpretabilitas;
5. manfaat terhadap model atau user experience.

---

## 20.9 Health Score & Lifestyle Score Reference

Health Score dan Lifestyle Score tidak harus menjadi model Machine Learning terpisah.

MVP menggunakan pendekatan **weighted scoring** yang dapat dijelaskan dan direproduksi.

Contoh struktur:

```text
Lifestyle Score
      │
      ├── BMI
      ├── Physical Activity
      ├── Sleep
      ├── Smoking
      └── Other Lifestyle Factors
```

Bobot final harus ditentukan berdasarkan:

- evidence;
- relevansi feature;
- availability data;
- hasil eksperimen;
- kebutuhan interpretasi pengguna.

Formula final harus didokumentasikan sebelum implementation dianggap final.

---

## 20.10 Simulation Methodology Reference

Future Health Simulation dan What-if Simulation menggunakan pendekatan yang sederhana dan dapat dijelaskan untuk MVP.

Pendekatan dasar:

```text
Current User Profile
        │
        ▼
Current Risk
        │
        ▼
Modify Lifestyle Parameter
        │
        ▼
Re-run Risk Engine
        │
        ▼
New Estimated Risk
        │
        ▼
Compare Result
```

Contoh:

```text
Current:
Sleep = 5 hours

What-if:
Sleep = 7 hours

        ↓

Risk Engine Recalculation

        ↓

Risk Comparison
```

Simulation merupakan **model-based projection**, bukan prediksi medis pasti.

---

## 20.11 Recommendation Rule Reference

Recommendation Engine menggunakan rule-based approach.

Contoh:

| Condition                         | Recommendation                              |
| --------------------------------- | ------------------------------------------- |
| Sleep < 6 hours                   | Tingkatkan durasi tidur secara bertahap     |
| Physical activity rendah          | Tingkatkan aktivitas fisik                  |
| BMI berada pada kategori berisiko | Pertimbangkan pengelolaan berat badan       |
| Smoking = active                  | Berikan rekomendasi berhenti merokok        |
| Risk threshold tinggi             | Sarankan konsultasi dengan tenaga kesehatan |

Rule harus memiliki source/reference yang jelas apabila berkaitan dengan rekomendasi kesehatan.

---

## 20.12 RAG Knowledge Base Reference

Knowledge Base digunakan oleh RAG untuk memberikan evidence yang mendukung penjelasan dan rekomendasi.

### Priority Sources

#### Nasional

- Kementerian Kesehatan Republik Indonesia
- PERKENI
- PERKI

#### Internasional

- WHO
- CDC

#### Scientific Literature

- publikasi ilmiah;
- systematic review;
- meta-analysis;
- guideline yang relevan.

Prioritas sumber:

```text
Official Guideline
       ↓
Professional Medical Organization
       ↓
Government Health Institution
       ↓
Peer-Reviewed Scientific Literature
```

Dokumen yang masuk ke Knowledge Base harus:

- relevan;
- dapat diverifikasi;
- memiliki sumber yang jelas;
- tidak bertentangan dengan batasan medical safety HELIORA.

---

## 20.13 Evidence Center Reference

Evidence Center memungkinkan pengguna memahami dasar dari rekomendasi atau insight yang diberikan.

Contoh user flow:

```text
Recommendation
      │
      ▼
"Why am I seeing this?"
      │
      ▼
Evidence Center
      │
      ├── Source
      ├── Guideline
      ├── Summary
      └── Evidence Strength
```

Tujuan Evidence Center:

- meningkatkan transparency;
- meningkatkan trust;
- mengurangi black-box perception;
- membantu user memahami alasan rekomendasi;
- menunjukkan bahwa recommendation tidak dibuat secara arbitrary oleh AI.

---

## 20.14 Medical Safety Reference

HELIORA harus menampilkan disclaimer yang jelas.

### Primary Disclaimer

> **HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. Hasil yang diberikan merupakan estimasi/proyeksi berdasarkan data dan model yang digunakan, bukan diagnosis medis, bukan pengganti konsultasi dokter, dan bukan kepastian mengenai kondisi kesehatan seseorang.**

### Safety Escalation

Jika hasil estimasi melewati threshold tertentu:

```text
High Risk
   │
   ▼
Safety Guardrail
   │
   ▼
Informational Warning
   │
   ▼
Consider Consultation
with Healthcare Professional
```

HELIORA tidak boleh memberikan diagnosis atau treatment recommendation berdasarkan threshold tersebut.

---

## 20.15 Technology Stack Reference

Technology stack MVP:

| Layer             | Technology                         |
| ----------------- | ---------------------------------- |
| Frontend          | Next.js                            |
| Frontend Language | TypeScript                         |
| UI                | React + Tailwind CSS               |
| Backend           | FastAPI                            |
| Backend Language  | Python                             |
| Database          | PostgreSQL                         |
| Machine Learning  | Python ML ecosystem                |
| Explainable AI    | SHAP                               |
| LLM               | LLM API                            |
| RAG               | Vector Search / Embedding Pipeline |
| API Communication | REST API                           |
| Version Control   | Git + GitHub                       |
| Deployment        | Cloud deployment                   |
| CI/CD             | GitHub-based workflow              |

Technology stack dapat mengalami perubahan selama implementation apabila terdapat alasan teknis yang kuat.

Perubahan tersebut harus didokumentasikan sebagai technical decision.

---

## 20.16 System Architecture Reference

Arsitektur high-level:

```text
                    HELIORA
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
        Next.js Frontend    FastAPI Backend
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
        PostgreSQL        AI / ML Engine     RAG / LLM
                                │                 │
                                ▼                 ▼
                         Simulation Engine   Evidence Base
                                │
                                ▼
                        Recommendation Engine
```

---

## 20.17 Competition Strategy Reference

HELIORA dikembangkan dalam konteks kompetisi yang menilai:

- Innovation;
- UI/UX;
- Technical Implementation;
- Presentation & Impact.

Strategi produk harus memastikan fitur utama berkontribusi terhadap beberapa kategori penilaian sekaligus.

### Competition Score Mapping

| Component                | Innovation | UI/UX | Technical | Impact |
| ------------------------ | :--------: | :---: | :-------: | :----: |
| Future Health Simulation |     ✓      |   ✓   |     ✓     |   ✓    |
| What-if Simulation       |     ✓      |   ✓   |     ✓     |   ✓    |
| Risk Estimation          |     ✓      |   -   |     ✓     |   ✓    |
| Explainable AI           |     ✓      |   ✓   |     ✓     |   ✓    |
| Evidence Center          |     ✓      |   ✓   |     ✓     |   ✓    |
| Recommendation Engine    |     ✓      |   ✓   |     ✓     |   ✓    |
| Personalized Dashboard   |     -      |   ✓   |     ✓     |   ✓    |

Killer feature HELIORA harus menjadi pusat storytelling saat presentasi dan live demo.

---

## 20.18 Competition Success Strategy

Strategi kompetisi HELIORA berfokus pada lima kekuatan:

### 1. Innovation

Fokus pada:

- Future Health Simulation;
- What-if Simulation;
- Explainable AI;
- Evidence Center;
- Personalized Preventive Insight.

### 2. UI/UX

Fokus pada:

- dashboard yang intuitif;
- visualisasi risiko;
- interactive simulation;
- explainability;
- accessibility;
- consistency.

### 3. Technical Excellence

Fokus pada:

- Machine Learning;
- Explainable AI;
- Recommendation Engine;
- LLM;
- RAG;
- FastAPI architecture;
- Next.js architecture;
- PostgreSQL;
- security;
- testing.

### 4. Impact

Fokus pada:

- preventive healthcare;
- health literacy;
- evidence-based decision support;
- konteks Indonesia;
- SDG 3.

### 5. Presentation

Demo harus menunjukkan alur:

```text
Problem
  ↓
User
  ↓
Health Input
  ↓
Risk Insight
  ↓
Why?
  ↓
Future Simulation
  ↓
What-if
  ↓
Recommendation
  ↓
Evidence
  ↓
Preventive Action
```

---

## 20.19 Key Demo Scenario

Skenario demo utama:

### Step 1 — User Input

Pengguna memasukkan data lifestyle.

### Step 2 — Current Health Insight

HELIORA menampilkan:

- Health Score;
- Lifestyle Score;
- estimated risk;
- key contributing factors.

### Step 3 — Explainability

Pengguna memilih:

> "Mengapa risiko saya seperti ini?"

Sistem menampilkan faktor utama yang memengaruhi hasil.

### Step 4 — Future Health Simulation

Pengguna melihat proyeksi berdasarkan kondisi lifestyle saat ini.

Contoh:

```text
30 Days
90 Days
180 Days
```

### Step 5 — What-if Simulation

Pengguna mengubah:

```text
Sleep
Physical Activity
Weight
```

### Step 6 — Real-time Comparison

Sistem menunjukkan perubahan:

```text
Current
   vs
What-if
```

### Step 7 — Recommendation

Rule Engine memberikan rekomendasi prioritas.

### Step 8 — Evidence

Pengguna membuka Evidence Center untuk melihat dasar rekomendasi.

### Step 9 — Action

Pengguna memperoleh insight preventif yang dapat dipahami dan ditindaklanjuti.

---

## 20.20 Key Terminology

| Term                     | Definition                                                                |
| ------------------------ | ------------------------------------------------------------------------- |
| Preventive Health        | Pendekatan kesehatan yang berfokus pada pencegahan dan pengurangan risiko |
| Risk Estimation          | Estimasi probabilitas/tingkat risiko berdasarkan model                    |
| Health Score             | Indikator agregat yang merepresentasikan kondisi health/lifestyle         |
| Lifestyle Score          | Indikator kualitas lifestyle berdasarkan parameter yang digunakan         |
| Explainable AI           | Pendekatan untuk menjelaskan kontribusi model terhadap hasil              |
| Future Health Simulation | Simulasi kondisi berdasarkan skenario lifestyle                           |
| What-if Simulation       | Simulasi interaktif dengan perubahan parameter tertentu                   |
| Recommendation Engine    | Sistem rule-based untuk menghasilkan rekomendasi                          |
| RAG                      | Retrieval-Augmented Generation untuk mengambil evidence relevan           |
| LLM                      | Model bahasa yang digunakan untuk menghasilkan penjelasan                 |
| Evidence Center          | Modul yang menyediakan dasar evidence untuk insight/rekomendasi           |
| Safety Guardrail         | Mekanisme untuk membatasi output dan memberikan peringatan keselamatan    |

---

## 20.21 Important Product Boundaries

HELIORA harus selalu diposisikan sebagai:

```text
Preventive Health Intelligence
```

Bukan:

```text
Medical Diagnosis System
```

Batasan ini berlaku pada:

- product copy;
- UI;
- AI response;
- recommendation;
- presentation;
- documentation;
- demo;
- marketing statement.

Semua anggota tim harus menjaga konsistensi positioning tersebut.

---

## 20.22 Reference Documents

Dokumen pendukung yang menjadi referensi pengembangan HELIORA meliputi:

- Product Discovery;
- Problem Analysis;
- AI Architecture;
- Dataset Analysis;
- Technology Stack Blueprint;
- Design Documentation;
- Success Strategy;
- Competition Guidebook;
- API Documentation;
- Architecture Documentation;
- Database / ERD Documentation;
- Testing Documentation.

Dokumen-dokumen tersebut berfungsi sebagai **supporting documents** dan harus tetap konsisten dengan PRD sebagai product source of truth.

---

## 20.23 Source of Truth Hierarchy

Apabila terjadi perbedaan antara dokumen, prioritas referensi adalah:

```text
PRD
 │
 ├── Product Requirements
 │
 ├── Scope
 │
 ├── Business Rules
 │
 └── Acceptance Criteria
        │
        ▼
Architecture
        │
        ▼
Implementation
        │
        ▼
Testing
        │
        ▼
Deployment
```

Dokumen pendukung tidak boleh mengubah product requirement secara langsung.

Perubahan requirement harus dilakukan melalui proses revisi PRD. Detail implementasi boleh berkembang di supporting document selama tidak mengubah product scope, business rule, safety boundary, atau acceptance criteria yang telah disetujui.

---

## 20.24 Future Reference

Informasi berikut dapat dikembangkan setelah MVP:

- mobile application;
- wearable integration;
- additional health datasets;
- model recalibration untuk populasi Indonesia;
- fairness analysis;
- longitudinal health tracking;
- advanced simulation;
- personalized health plan;
- additional disease-risk models;
- advanced analytics;
- expanded Evidence Center;
- healthcare ecosystem integration.

Fitur tersebut tidak menjadi dependency terhadap keberhasilan MVP.

---

## 20.25 Requirement Traceability Matrix

Matrix ini menjadi penghubung minimum antara problem, product objective, feature, requirement, acceptance criteria, dan test untuk MVP. ID aktual dapat disesuaikan ketika seluruh FR dan test case final telah ditetapkan.

| Problem | Objective | Feature | Requirement | Acceptance Criteria | Test |
|---|---|---|---|---|---|
| Informasi kesehatan terlalu umum | Personalized Risk Insight | Risk Engine | FR-RISK | AC-RISK-01 | TEST-RISK-01 |
| Sulit memahami faktor yang berpengaruh | Explainability | Explainable AI | FR-XAI | AC-XAI-01 | TEST-XAI-01 |
| Tidak dapat mengeksplorasi perubahan lifestyle | Risk Exploration | What-if Simulation | FR-WHATIF | AC-WHATIF-01 | TEST-WHATIF-01 |
| Dampak perubahan sulit dipahami | Scenario Exploration | Future Health Simulation | FR-SIM | AC-SIM-01/02 | TEST-SIM-01 |
| Tidak tahu tindakan prioritas | Preventive Action | Recommendation Engine | FR-REC | AC-REC-01/02 | TEST-REC-01 |
| Recommendation sulit diverifikasi | Trust & Evidence | Evidence Center | FR-EVIDENCE | AC-EVIDENCE-01/02 | TEST-EVIDENCE-01 |
| Output AI sulit dipahami | Human-Friendly Explanation | LLM/Fallback | FR-LLM | AC-LLM-01/02 | TEST-LLM-01 |
| Risiko disalahartikan sebagai diagnosis | Medical Safety | Safety Guardrail | FR-SAFETY | AC-SAFETY | TEST-SAFETY-01 |

Requirement Traceability Matrix wajib diperbarui apabila feature, requirement ID, acceptance criteria, atau test case berubah.

---

# 20.26 Final Appendix Statement



HELIORA dibangun sebagai platform preventive health yang menggabungkan **Machine Learning, Explainable AI, Simulation, Recommendation Engine, LLM, dan RAG** dalam satu pengalaman pengguna yang berorientasi pada pemahaman dan tindakan preventif.

Fokus utama MVP bukan memperbanyak jumlah model atau fitur, tetapi menghasilkan pengalaman yang kuat:

```text
Understand
    ↓
Predict
    ↓
Explain
    ↓
Simulate
    ↓
Compare
    ↓
Recommend
    ↓
Verify with Evidence
    ↓
Prevent
```

Dengan pendekatan tersebut, HELIORA mempertahankan diferensiasi utamanya melalui **Future Health Simulation** dan **What-if Simulation**, sekaligus menjaga implementasi tetap realistis, aman, explainable, dan dapat dipertanggungjawabkan untuk kebutuhan MVP kompetisi.## 17.37A Model Calibration Risk

**Risk:** Output model dapat ditampilkan sebagai probability padahal belum terkalibrasi secara memadai.

**Impact:** High

**Mitigation:**

- evaluasi calibration apabila probability ditampilkan;
- gunakan istilah `estimated risk score` apabila calibration belum tervalidasi;
- dokumentasikan semantics output pada AI methodology.

---

## 17.37B External AI Data Handling Risk

**Risk:** Health/lifestyle data dapat dikirim ke external LLM provider tanpa batasan privasi yang jelas.

**Impact:** High

**Mitigation:**

- minimalkan data yang dikirim ke provider;
- gunakan structured/derived context apabila memungkinkan;
- dokumentasikan provider, retention, dan data handling policy;
- jangan mengirim data sensitif yang tidak diperlukan untuk explanation.

---


