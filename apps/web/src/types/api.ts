/**
 * HELIORA — API Contract & Shared Type Definitions
 *
 * Implements Architecture §20 (Auth) and §21 (Consent).
 * Mirrors Pydantic models in apps/api/app/schemas/
 */

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface ConsentCreateRequest {
  agreed: boolean;
  consent_version?: string;
}

export interface ConsentResponse {
  id: string;
  user_id: string;
  consent_version: string;
  accepted_at: string;
  revoked_at?: string | null;
  is_active: boolean;
}

export interface ConsentStatusResponse {
  has_active_consent: boolean;
  active_consent?: ConsentResponse | null;
  terms_version: string;
  medical_disclaimer: string;
}

export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail[];
}

// ── Health Profile Endpoints (Architecture §8.3, BE-003) ────────
export interface HealthProfileCreateRequest {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  physical_activity_min_per_week: number;
  sleep_duration_hours: number;
  smoking_status: string;
  family_history: boolean;
  family_history_details?: string | null;
  stress_level?: number | null;
  bmi?: number | null;
  waist_circumference_cm?: number | null;
  blood_pressure?: string | null;
  blood_sugar_mg_dl?: number | null;
  cholesterol_mg_dl?: number | null;
}

export interface HealthProfileResponse {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  physical_activity_min_per_week: number;
  sleep_duration_hours: number;
  smoking_status: string;
  family_history: boolean;
  family_history_details?: string | null;
  stress_level?: number | null;
  created_at: string;
  updated_at?: string | null;
}

// ── Assessment & Dashboard Endpoints (Architecture §8.7, FE-005) ──
export type RiskLevel = "low" | "moderate" | "high";

export interface RiskAssessmentItem {
  condition: "diabetes" | "hypertension" | "cardiovascular";
  label: string;
  probability: number;
  risk_level: RiskLevel;
  trend: "stable" | "increasing" | "decreasing";
  description: string;
}

export interface ContributingFactor {
  feature: string;
  label: string;
  impact: "increase" | "decrease";
  weight_percentage: number;
  description: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: "sleep" | "activity" | "nutrition" | "stress";
  action: string;
  evidence_level: "A" | "B" | "C";
  source: string;
}

export interface AssessmentSummaryResponse {
  id: string;
  user_id?: string;
  health_score: number;
  lifestyle_score: number;
  risks: RiskAssessmentItem[];
  top_factors: ContributingFactor[];
  recommendations: RecommendationItem[];
  assessed_at: string;
  /** Set by the frontend when it shows example data because no real assessment could be loaded. */
  is_mock?: boolean;
}
