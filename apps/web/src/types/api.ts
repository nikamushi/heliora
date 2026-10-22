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

// ── Supabase identity (FE-012, ADR-011) ──────────────────────────
// Supabase Auth adalah identity provider; UserResponse tetap menjadi bentuk
// user kanonis di frontend (dipetakan dari Supabase user via api-client).
export type SupabaseOAuthProvider = "google";

export interface SupabaseUserMetadata {
  full_name?: string;
  [key: string]: unknown;
}

export interface SupabaseAuthUser {
  id: string;
  email?: string | null;
  user_metadata?: SupabaseUserMetadata;
  created_at?: string;
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
  bmi_category?: string | null;
  physical_activity_min_per_week: number;
  sleep_duration_hours: number;
  smoking_status: string;
  family_history: boolean;
  family_history_details?: string | null;
  stress_level?: number | null;
  waist_circumference_cm?: number | null;
  blood_pressure?: string | null;
  blood_sugar_mg_dl?: number | null;
  cholesterol_mg_dl?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export type RiskLevel = "low" | "moderate" | "high";
export type StandardizedRiskLabel =
  | "Lower"
  | "Moderate"
  | "Higher"
  | "Lebih Rendah"
  | "Sedang"
  | "Lebih Tinggi";

export interface RiskAssessmentItem {
  condition: "diabetes" | "hypertension" | "cardiovascular";
  label: string;
  probability?: number;
  estimated_risk_score?: number;
  risk_level: RiskLevel;
  risk_label?: StandardizedRiskLabel;
  trend: "stable" | "increasing" | "decreasing";
  description: string;
}

export interface ContributingFactor {
  feature: string;
  label: string;
  impact: "increase" | "decrease";
  weight_percentage: number;
  description: string;
  value_display?: string;
}

export interface RecommendationItem {
  id: string;
  rule_id?: string;
  title: string;
  category: "sleep" | "activity" | "nutrition" | "stress" | "consultation";
  priority?: "high" | "medium" | "low" | "protective";
  action: string;
  evidence_level: "High" | "Moderate" | "Limited" | "A" | "B" | "C";
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
  /** Set to true when this is the user's initial baseline assessment (no trend history). */
  is_baseline?: boolean;
  ai_explanation?: string | null;
  ai_evidence_refs?: string[] | null;
  ai_source?: 'llm' | 'fallback' | null;
}

// ── Simulation Endpoints (Architecture §14, PRD BR-SIM-001–008, AC-SIM-01) ──
export type SimulationHorizon = 30 | 90 | 180;

export interface FutureSimulationRequest {
  horizon_days: SimulationHorizon;
}

export interface RiskTrajectoryItem {
  condition: "diabetes" | "hypertension" | "cardiovascular";
  label: string;
  baseline_probability: number;
  projected_probability: number;
  baseline_score: number;
  projected_score: number;
  delta_percentage: number;
  risk_level: RiskLevel;
  risk_label: StandardizedRiskLabel;
  trend: "stable" | "increasing" | "decreasing";
  description: string;
}

export interface DailyTrajectoryPoint {
  day: number;
  health_score: number;
  lifestyle_score: number;
}

export interface FutureSimulationResponse {
  horizon_days: SimulationHorizon;
  assumptions: string[];
  baseline_health_score: number;
  projected_health_score: number;
  baseline_lifestyle_score: number;
  projected_lifestyle_score: number;
  risk_trajectories: RiskTrajectoryItem[];
  daily_trajectories?: DailyTrajectoryPoint[];
  is_model_estimated: boolean;
  disclaimer: string;
}

export interface WhatIfSimulationRequest {
  sleep_duration_hours?: number;
  physical_activity_min_per_week?: number;
  weight_kg?: number;
  smoking_status?: "never" | "former" | "current";
}

export interface WhatIfConditionComparison {
  condition: "diabetes" | "hypertension" | "cardiovascular";
  label: string;
  baseline_probability: number;
  simulated_probability: number;
  baseline_score: number;
  simulated_score: number;
  delta_percentage: number;
  risk_level: RiskLevel;
  risk_label: StandardizedRiskLabel;
  trend: "stable" | "increasing" | "decreasing";
  impact_summary: string;
}

export interface WhatIfSimulationResponse {
  applied_parameters: Record<string, string | number>;
  derived_bmi: number;
  baseline_health_score: number;
  simulated_health_score: number;
  health_score_delta: number;
  baseline_lifestyle_score: number;
  simulated_lifestyle_score: number;
  lifestyle_score_delta: number;
  condition_comparisons: WhatIfConditionComparison[];
  is_model_estimated: boolean;
  disclaimer: string;
}

// ── Evidence Center Endpoints (Architecture §14, PRD FR-027, BR-EVIDENCE-001) ──
export interface ClinicalEvidenceItem {
  id: string;
  slug?: string;
  rule_id: string;
  title: string;
  title_translation?: string;
  organization: string;
  short_org?: string;
  publication?: string;
  evidence_type?: string;
  evidence_type_category?: string;
  year: number;
  version?: string;
  evidence_level?: "Level A (Kuat)" | "Level B (Sedang)" | "Level C (Konsensus Pakar)";
  recommendation_strength?: "Kuat" | "Kondisional";
  evidence_certainty?: "Tinggi" | "Sedang" | "Terbatas" | "Konsensus Klinis";
  evidence_grading_system?: string;
  evidence_grading_detail?: string;
  category: "activity" | "sleep" | "nutrition" | "cardiovascular" | "weight" | "smoking" | "stress" | "consultation";
  category_label: string;
  supported_recommendations?: Array<{ ruleId: string; title: string; actionText: string } | string>;
  plain_summary?: string;
  biological_mechanism?: string;
  summary: string;
  clinical_section: string;
  citation?: string;
  primary_citation?: string;
  related_publication?: string;
  external_url: string;
  last_verified?: string;
  doi?: string;
}

export interface EvidenceListResponse {
  items: ClinicalEvidenceItem[];
  total: number;
}

