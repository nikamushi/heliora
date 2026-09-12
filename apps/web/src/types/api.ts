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
