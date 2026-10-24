-- ==============================================================================
-- HELIORA — Supabase PostgreSQL Schema Specification
-- Berdasarkan docs/Database.md (DB-001) & docs/ADR/ADR-011-authentication-strategy.md
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABEL: users
-- Sinkronisasi langsung dengan auth.users Supabase via trigger
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(128),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_email ON public.users (email);

-- Trigger: Sinkronisasi otomatis saat ada user registrasi via Supabase Auth (Email / Google OAuth).
-- INSERT only — UPDATE on auth.users during OAuth identity linking must not re-fire this
-- (otherwise GoTrue surfaces "Error creating identity").
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name text;
    v_email text;
BEGIN
    v_email := NULLIF(TRIM(NEW.email), '');
    IF v_email IS NULL THEN
        v_email := NEW.id::text || '@users.noreply.heliora.software';
    END IF;

    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(v_email, '@', 1),
        'User'
    );

    INSERT INTO public.users (id, email, full_name, created_at, updated_at)
    VALUES (NEW.id, v_email, v_full_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN unique_violation THEN
    -- Email already exists on another public.users row: do not block OAuth.
    UPDATE public.users
       SET full_name = COALESCE(v_full_name, full_name),
           updated_at = NOW()
     WHERE lower(email) = lower(v_email);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. TABEL: consents
-- Audit persetujuan disclaimer medis & syarat privasi
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    consent_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    accepted_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_consents_user_id ON public.consents (user_id);

-- ==============================================================================
-- 3. TABEL: health_profiles
-- Data biometrik & gaya hidup pengguna
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    age INTEGER NOT NULL CHECK (age >= 1 AND age <= 150),
    gender VARCHAR(20) NOT NULL,
    height_cm NUMERIC(5,1) NOT NULL CHECK (height_cm > 0),
    weight_kg NUMERIC(5,1) NOT NULL CHECK (weight_kg > 0),
    physical_activity_min_per_week NUMERIC(6,1) NOT NULL CHECK (physical_activity_min_per_week >= 0),
    sleep_duration_hours NUMERIC(3,1) NOT NULL CHECK (sleep_duration_hours >= 0 AND sleep_duration_hours <= 24),
    smoking_status VARCHAR(30) NOT NULL,
    family_history BOOLEAN NOT NULL DEFAULT false,
    family_history_details TEXT,
    stress_level INTEGER CHECK (stress_level IS NULL OR (stress_level >= 1 AND stress_level <= 10)),
    waist_circumference_cm NUMERIC(5,1) CHECK (waist_circumference_cm IS NULL OR waist_circumference_cm > 0),
    blood_pressure VARCHAR(20),
    blood_sugar_mg_dl NUMERIC(6,1) CHECK (blood_sugar_mg_dl IS NULL OR blood_sugar_mg_dl > 0),
    cholesterol_mg_dl NUMERIC(6,1) CHECK (cholesterol_mg_dl IS NULL OR cholesterol_mg_dl > 0),
    bmi NUMERIC(4,1) CHECK (bmi IS NULL OR bmi > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_health_profiles_user_id ON public.health_profiles (user_id);

-- ==============================================================================
-- 4. TABEL: assessments
-- Sesi asesmen risiko preventif
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    health_profile_id UUID NOT NULL REFERENCES public.health_profiles(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_assessments_user_id ON public.assessments (user_id);
CREATE INDEX IF NOT EXISTS ix_assessments_user_created ON public.assessments (user_id, created_at DESC);

-- ==============================================================================
-- 5. TABEL: risk_results
-- Luaran prediksi model ML (Risk Engine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.risk_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID UNIQUE NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    diabetes_risk NUMERIC(5,4) NOT NULL CHECK (diabetes_risk >= 0.0 AND diabetes_risk <= 1.0),
    hypertension_risk NUMERIC(5,4) NOT NULL CHECK (hypertension_risk >= 0.0 AND hypertension_risk <= 1.0),
    cardiovascular_risk NUMERIC(5,4) NOT NULL CHECK (cardiovascular_risk >= 0.0 AND cardiovascular_risk <= 1.0),
    health_score NUMERIC(5,2) NOT NULL CHECK (health_score >= 0.0 AND health_score <= 100.0),
    lifestyle_score NUMERIC(5,2) NOT NULL CHECK (lifestyle_score >= 0.0 AND lifestyle_score <= 100.0),
    model_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_risk_results_assessment_id ON public.risk_results (assessment_id);

-- ==============================================================================
-- 6. TABEL: xai_results
-- Penjelasan faktor risiko berbasis atribusi fitur SHAP
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.xai_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_result_id UUID NOT NULL REFERENCES public.risk_results(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    contribution NUMERIC(8,4) NOT NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('positive', 'negative')),
    rank INTEGER NOT NULL CHECK (rank >= 1)
);

CREATE INDEX IF NOT EXISTS ix_xai_results_risk_result_id ON public.xai_results (risk_result_id);
CREATE INDEX IF NOT EXISTS ix_xai_results_risk_rank ON public.xai_results (risk_result_id, rank);

-- ==============================================================================
-- 7. TABEL: simulations
-- Skenario simulasi masa depan & What-if
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    simulation_type VARCHAR(30) NOT NULL CHECK (simulation_type IN ('future', 'what_if')),
    horizon_days INTEGER CHECK (horizon_days IS NULL OR horizon_days > 0),
    input_snapshot JSONB NOT NULL,
    output_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_simulations_assessment_id ON public.simulations (assessment_id);

-- ==============================================================================
-- 8. TABEL: recommendations
-- Rekomendasi tindakan preventif berbasis aturan klinis
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    rule_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    guideline_source VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low', 'protective')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_recommendations_assessment_id ON public.recommendations (assessment_id);

-- ==============================================================================
-- 9. TABEL: evidence
-- Bukti literatur medis / jurnal ilmiah pendukung
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    publisher VARCHAR(255) NOT NULL,
    source_url VARCHAR(1024) NOT NULL,
    evidence_level VARCHAR(50),
    summary TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_evidence_recommendation_id ON public.evidence (recommendation_id);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- Menjamin keamanan akses data per-user di lingkungan Supabase
-- ==============================================================================

-- 1. users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 2. consents
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own consents" ON public.consents;
CREATE POLICY "Users can view own consents" ON public.consents
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consents" ON public.consents;
CREATE POLICY "Users can insert own consents" ON public.consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own consents" ON public.consents;
CREATE POLICY "Users can update own consents" ON public.consents
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. health_profiles
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own health profiles" ON public.health_profiles;
CREATE POLICY "Users can manage own health profiles" ON public.health_profiles
    FOR ALL USING (auth.uid() = user_id);

-- 4. assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own assessments" ON public.assessments;
CREATE POLICY "Users can view own assessments" ON public.assessments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessments" ON public.assessments;
CREATE POLICY "Users can insert own assessments" ON public.assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. risk_results
ALTER TABLE public.risk_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own risk results" ON public.risk_results;
CREATE POLICY "Users can view own risk results" ON public.risk_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessments
            WHERE assessments.id = risk_results.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- 6. xai_results
ALTER TABLE public.xai_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own xai results" ON public.xai_results;
CREATE POLICY "Users can view own xai results" ON public.xai_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.risk_results
            JOIN public.assessments ON assessments.id = risk_results.assessment_id
            WHERE risk_results.id = xai_results.risk_result_id
            AND assessments.user_id = auth.uid()
        )
    );

-- 7. simulations
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own simulations" ON public.simulations;
CREATE POLICY "Users can manage own simulations" ON public.simulations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.assessments
            WHERE assessments.id = simulations.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- 8. recommendations
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
CREATE POLICY "Users can view own recommendations" ON public.recommendations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessments
            WHERE assessments.id = recommendations.assessment_id
            AND assessments.user_id = auth.uid()
        )
    );

-- 9. evidence
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Evidence is readable by all authenticated users" ON public.evidence;
CREATE POLICY "Evidence is readable by all authenticated users" ON public.evidence
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Evidence is readable by anon" ON public.evidence;
CREATE POLICY "Evidence is readable by anon" ON public.evidence
    FOR SELECT TO anon USING (true);
