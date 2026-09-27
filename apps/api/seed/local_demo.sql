-- ═══════════════════════════════════════════════════════════════════
-- HELIORA — Seed akun demo lokal
--
-- Isi satu akun demo yang siap pakai untuk melihat UI dashboard tanpa
-- Sign-In Google dan tanpa kredensial Supabase.
--
-- KENAPA INI ADA
--   Sign-In Google butuh Supabase project yang sudah dikonfigurasi
--   (lihat issue #26). Melihat UI dashboard tidak perlu menunggu itu: akun
--   demo ini masuk lewat endpoint legacy HS256 yang memang masih berfungsi,
--   lalu dashboard di-render dari data di bawah.
--
--   PENTING: jalur ini TIDAK memverifikasi Sign-In Google. Yang terverifikasi
--   di sini hanya tampilan dashboard. Jangan pakai seed ini sebagai bukti
--   bahwa alur Google sudah jalan.
--
-- CARA PAKAI
--   1. Jalankan migration lebih dulu:
--        cd apps/api && DATABASE_URL=... alembic upgrade head
--   2. Jalankan file ini:
--        psql "$DATABASE_URL" -f seed/local_demo.sql
--   3. Masuk di /login dengan kredensial di bawah.
--
-- KREDENSIAL DEMO (bersifat publik, disengaja)
--   Email    : demo@heliora.health
--   Password : DemoHeliora2026!
--
--   Email memakai domain .health yang tidak dapat didaftarkan, dan file ini
--   hanya boleh dipakai di database lokal/dev. Jangan pernah menjalankannya
--   terhadap database staging atau produksi.
--
-- CATATAN TENTANG ANGKA-ANGKA DI BAGIAN 4
--   Assessment di-seed supaya dashboard langsung tampil penuh tanpa perlu
--   mengeklik apa pun. Nilainya BUKAN angka tebakan: seluruhnya adalah
--   output asli risk engine (app/core/risk_engine.py) untuk health profile
--   pada bagian 3, jadi angka yang tampil sama dengan yang akan dihitung
--   ulang oleh engine. Verifikasi ulang bisa dilakukan dengan:
--       cd apps/api && python -c "from app.core.risk_engine import risk_engine as r; ..."
--
--   xai_results menyimpan feature/direction/contribution, dan label plus
--   deskripsi diturunkan ulang oleh format_factor_from_xai saat dibaca.
--   recommendations memakai rule_id yang sama dengan katalog /evidence.
--
-- IDEMPOTEN
--   Aman dijalankan berulang kali. Setiap baris memakai UUID tetap dan
--   ON CONFLICT, jadi tidak menggandakan data. Tabel users dikunci lewat
--   email (satu baris per email); tabel lain dikunci lewat UUID tetap.
-- ═══════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. User demo ──────────────────────────────────────────────────
-- password_hash adalah bcrypt cost 12 dari "DemoHeliora2026!", dibuat dengan
-- app.core.security.hash_password. Panjang 60, muat di VARCHAR(128).
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
    '11111111-1111-4111-8111-111111111111',
    'demo@heliora.health',
    '$2b$12$yJJN7/lg6TpI.u8uUUzodORjuJkI7I93E/ZvyIC7QxAHxOyqlScFS',
    'Demo Heliora'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    full_name     = EXCLUDED.full_name;

-- user_id di bawah diambil dari email, bukan UUID tetap, supaya tetap benar
-- bila baris user sebelumnya sudah ada dengan id yang berbeda.

-- ── 2. Consent aktif ──────────────────────────────────────────────
-- Tanpa baris ini, require_active_consent menolak dengan 403 dan dashboard
-- tidak bisa dibuka sama sekali.
INSERT INTO consents (id, user_id, consent_version, accepted_at)
VALUES (
    '22222222-2222-4222-8222-222222222222',
    (SELECT id FROM users WHERE email = 'demo@heliora.health'),
    '1.0',
    now()
)
ON CONFLICT (id) DO UPDATE
SET accepted_at = EXCLUDED.accepted_at,
    revoked_at  = NULL;

-- ── 3. Health profile ─────────────────────────────────────────────
-- Nilai dipilih supaya profilnya tidak trivial: BMI 28.7 (overweight),
-- tidur 6 jam, stres 7, riwayat keluarga diabetes dan hipertensi,
-- tekanan darah 140/90. BMI = 88 / 1.75^2.
-- Semua nilai memenuhi check constraint di 001_initial_schema.
INSERT INTO health_profiles (
    id, user_id, age, gender, height_cm, weight_kg,
    physical_activity_min_per_week, sleep_duration_hours,
    smoking_status, family_history, family_history_details,
    stress_level, waist_circumference_cm, blood_pressure,
    blood_sugar_mg_dl, cholesterol_mg_dl, bmi
)
VALUES (
    '33333333-3333-4333-8333-333333333333',
    (SELECT id FROM users WHERE email = 'demo@heliora.health'),
    42, 'male', 175.0, 88.0,
    90, 6.0,
    'former', true, 'Ayah: diabetes tipe 2. Ibu: hipertensi.',
    7, 95.0, '140/90',
    110.0, 210.0, 28.7
)
ON CONFLICT (id) DO UPDATE
SET age                             = EXCLUDED.age,
    gender                          = EXCLUDED.gender,
    height_cm                       = EXCLUDED.height_cm,
    weight_kg                       = EXCLUDED.weight_kg,
    physical_activity_min_per_week  = EXCLUDED.physical_activity_min_per_week,
    sleep_duration_hours            = EXCLUDED.sleep_duration_hours,
    smoking_status                  = EXCLUDED.smoking_status,
    family_history                  = EXCLUDED.family_history,
    family_history_details          = EXCLUDED.family_history_details,
    stress_level                    = EXCLUDED.stress_level,
    waist_circumference_cm          = EXCLUDED.waist_circumference_cm,
    blood_pressure                  = EXCLUDED.blood_pressure,
    blood_sugar_mg_dl               = EXCLUDED.blood_sugar_mg_dl,
    cholesterol_mg_dl               = EXCLUDED.cholesterol_mg_dl,
    bmi                             = EXCLUDED.bmi,
    updated_at                      = now();

-- ── 4. Assessment + hasil risk engine ─────────────────────────────
-- Hanya perlu satu sesi 'completed'. Tabel simulations sengaja tidak
-- di-seed: /simulation/future dan /simulation/what-if menghitung proyeksi
-- on-demand dari assessment ini, jadi tidak ada data awal yang perlu dibuat.

INSERT INTO assessments (id, user_id, health_profile_id, status)
VALUES (
    '44444444-4444-4444-8444-444444444444',
    (SELECT id FROM users WHERE email = 'demo@heliora.health'),
    '33333333-3333-4333-8333-333333333333',
    'completed'
)
ON CONFLICT (id) DO UPDATE
SET status             = 'completed',
    health_profile_id  = EXCLUDED.health_profile_id;

INSERT INTO risk_results (
    id, assessment_id, diabetes_risk, hypertension_risk, cardiovascular_risk,
    health_score, lifestyle_score, model_version
)
VALUES (
    '55555555-5555-4555-8555-555555555555',
    '44444444-4444-4444-8444-444444444444',
    0.3813, 0.5632, 0.1956,
    61.1, 59.0, '1.0.0'
)
ON CONFLICT (id) DO UPDATE
SET diabetes_risk       = EXCLUDED.diabetes_risk,
    hypertension_risk   = EXCLUDED.hypertension_risk,
    cardiovascular_risk = EXCLUDED.cardiovascular_risk,
    health_score        = EXCLUDED.health_score,
    lifestyle_score     = EXCLUDED.lifestyle_score;

-- rank mengikuti urutan top_factors dari engine; 'positive' karena
-- impact = 'increase' untuk keempat faktor.
INSERT INTO xai_results (id, risk_result_id, feature_name, contribution, direction, "rank")
VALUES
    ('66666666-0000-4000-8000-000000000001', '55555555-5555-4555-8555-555555555555', 'bmi',                28.0, 'positive', 1),
    ('66666666-0000-4000-8000-000000000002', '55555555-5555-4555-8555-555555555555', 'physical_activity',  25.0, 'positive', 2),
    ('66666666-0000-4000-8000-000000000003', '55555555-5555-4555-8555-555555555555', 'sleep_duration',     15.0, 'positive', 3),
    ('66666666-0000-4000-8000-000000000004', '55555555-5555-4555-8555-555555555555', 'family_history',     18.0, 'positive', 4)
ON CONFLICT (id) DO UPDATE
SET feature_name  = EXCLUDED.feature_name,
    contribution  = EXCLUDED.contribution,
    direction     = EXCLUDED.direction,
    "rank"        = EXCLUDED."rank";

INSERT INTO recommendations (
    id, assessment_id, rule_id, title, description, guideline_source, priority
)
VALUES
    ('77777777-0000-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444', 'REC-ACT-01', 'Tingkatkan Aktivitas Fisik Aerobik',
     'Lakukan jalan cepat atau aktivitas aerobik sedang minimal 150 menit per minggu (30 menit, 5 hari).',
     'WHO Guidelines on Physical Activity and Sedentary Behaviour (2020)', 'high'),
    ('77777777-0000-4000-8000-000000000002', '44444444-4444-4444-8444-444444444444', 'REC-NUT-01', 'Manajemen Berat Badan & Pola Makan Seimbang',
     'Kurangi asupan gula sederhana dan tingkatkan konsumsi serat harian minimal 25 gram.',
     'Panduan Diet & Obesitas PERKENI (2021)', 'high'),
    ('77777777-0000-4000-8000-000000000003', '44444444-4444-4444-8444-444444444444', 'REC-SLP-01', 'Optimalkan Durasi & Kualitas Tidur',
     'Jaga jadwal tidur konsisten 7–8 jam setiap malam dan batasi paparan layar 1 jam sebelum tidur.',
     'Kemenkes RI / CDC Sleep Recommendations', 'medium'),
    ('77777777-0000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'REC-STR-01', 'Latihan Relaksasi & Regulasi Stres',
     'Terapkan teknik pernapasan dalam (4-7-8) atau meditasi 10 menit setiap hari untuk menstabilkan tekanan darah.',
     'AHA / PERKI Guidelines on Stress & Cardiovascular Health', 'medium')
ON CONFLICT (id) DO UPDATE
SET rule_id          = EXCLUDED.rule_id,
    title            = EXCLUDED.title,
    description      = EXCLUDED.description,
    guideline_source = EXCLUDED.guideline_source,
    priority         = EXCLUDED.priority;

COMMIT;

-- ── Verifikasi ────────────────────────────────────────────────────
-- Harus menghasilkan counts=1 semua kolom. POST /assessment
-- (tombol "Jalankan asesmen") saat ini 500 karena MissingGreenlet di
-- assessment_service.py; itu bug terpisah, bukan masalah seed ini.
SELECT
    (SELECT count(*) FROM users)                                AS users,
    (SELECT count(*) FROM consents)                            AS consents,
    (SELECT count(*) FROM health_profiles)                     AS health_profiles,
    (SELECT count(*) FROM assessments)                         AS assessments,
    (SELECT count(*) FROM risk_results)                        AS risk_results,
    (SELECT count(*) FROM xai_results)                         AS xai_results,
    (SELECT count(*) FROM recommendations)                     AS recommendations;
