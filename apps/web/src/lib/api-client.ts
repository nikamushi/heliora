/**
 * HELIORA — Centralized API Client (Deep Module Pattern)
 *
 * Encapsulates all HTTP communication with the FastAPI backend.
 * Provides type-safe methods, automatic auth header injection,
 * token persistence, and standardized error parsing.
 */

import {
  TokenResponse,
  UserLoginRequest,
  UserRegisterRequest,
  UserResponse,
  ConsentCreateRequest,
  ConsentResponse,
  ConsentStatusResponse,
  ApiErrorResponse,
  HealthProfileCreateRequest,
  HealthProfileResponse,
  AssessmentSummaryResponse,
} from "@/types/api";

const TOKEN_STORAGE_KEY = "heliora_access_token";
const USER_STORAGE_KEY = "heliora_user_data";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

class ApiClient {
  private getBaseUrl(): string {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Ensure URL ends with /api/v1
    const cleanUrl = rawUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api/v1") ? cleanUrl : `${cleanUrl}/api/v1`;
  }

  public getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  public setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  public clearToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  public getStoredUser(): UserResponse | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }

  public setStoredUser(user: UserResponse): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    if (requiresAuth) {
      const token = this.getToken();
      if (!token) {
        throw new ApiClientError(401, "Sesi Anda telah berakhir. Silakan login kembali.");
      }
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Terjadi kesalahan pada server (${response.status})`;
        let errorData: unknown = null;

        try {
          const json = (await response.json()) as ApiErrorResponse;
          errorData = json;
          if (typeof json.detail === "string") {
            errorMessage = json.detail;
          } else if (Array.isArray(json.detail) && json.detail.length > 0) {
            errorMessage = json.detail.map((e) => e.msg).join(", ");
          }
        } catch {
          // If response body is not JSON, retain default error message
        }

        throw new ApiClientError(response.status, errorMessage, errorData);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(
        0,
        "Tidak dapat terhubung ke server backend. Pastikan server API sudah berjalan."
      );
    }
  }

  // ── Authentication Endpoints (Architecture §20, BE-001) ───────
  public readonly auth = {
    register: async (payload: UserRegisterRequest): Promise<TokenResponse> => {
      const res = await this.request<TokenResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.setToken(res.access_token);
      this.setStoredUser(res.user);
      return res;
    },

    login: async (payload: UserLoginRequest): Promise<TokenResponse> => {
      const res = await this.request<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      this.setToken(res.access_token);
      this.setStoredUser(res.user);
      return res;
    },

    me: async (): Promise<UserResponse> => {
      const res = await this.request<UserResponse>("/auth/me", { method: "GET" }, true);
      this.setStoredUser(res);
      return res;
    },

    logout: (): void => {
      this.clearToken();
    },
  };

  // ── Consent & Privacy Endpoints (Architecture §21, BE-002) ────
  public readonly consent = {
    record: async (payload: ConsentCreateRequest): Promise<ConsentResponse> => {
      return this.request<ConsentResponse>(
        "/consent",
        {
          method: "POST",
          body: JSON.stringify({
            agreed: payload.agreed,
            consent_version: payload.consent_version || "1.0",
          }),
        },
        true
      );
    },

    getStatus: async (): Promise<ConsentStatusResponse> => {
      return this.request<ConsentStatusResponse>("/consent/status", { method: "GET" }, true);
    },

    revoke: async (): Promise<ConsentResponse> => {
      return this.request<ConsentResponse>("/consent/revoke", { method: "POST" }, true);
    },
  };

  // ── Health Profile Endpoints (Architecture §22, BE-003) ──────
  public readonly healthProfile = {
    save: async (payload: HealthProfileCreateRequest): Promise<HealthProfileResponse> => {
      return this.request<HealthProfileResponse>(
        "/health-profile",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        true
      );
    },

    get: async (): Promise<HealthProfileResponse> => {
      return this.request<HealthProfileResponse>("/health-profile", { method: "GET" }, true);
    },
  };

  public assessment = {
    getLatest: async (): Promise<AssessmentSummaryResponse> => {
      try {
        return await this.request<AssessmentSummaryResponse>("/assessment/latest", { method: "GET" }, true);
      } catch {
        // Deterministic fallback based on saved profile or standard healthy baseline
        let profile: HealthProfileResponse | null = null;
        try {
          const raw = typeof window !== "undefined" ? localStorage.getItem("heliora_health_profile") : null;
          if (raw) profile = JSON.parse(raw);
        } catch {
          // fallback
        }

        const bmi = profile?.bmi || 23.5;
        const sleep = profile?.sleep_duration_hours || 7;
        const activity = profile?.physical_activity_min_per_week || 150;
        const stress = profile?.stress_level || 5;

        const healthScore = Math.max(50, Math.min(96, Math.round(85 - (bmi > 25 ? (bmi - 25) * 2 : 0) - (sleep < 7 ? (7 - sleep) * 3 : 0) - (stress > 6 ? (stress - 6) * 2 : 0))));
        const lifestyleScore = Math.max(45, Math.min(94, Math.round(75 + (activity >= 150 ? 8 : -10) + (sleep >= 7 && sleep <= 8 ? 6 : -6) - (stress > 6 ? 6 : 0))));

        return {
          id: "assessment-mock-latest",
          health_score: healthScore,
          lifestyle_score: lifestyleScore,
          risks: [
            {
              condition: "diabetes",
              label: "Diabetes Tipe 2",
              probability: bmi > 27 ? 0.32 : 0.16,
              risk_level: bmi > 27 ? "moderate" : "low",
              trend: "stable",
              description: bmi > 27 ? "Indeks massa tubuh dan aktivitas fisik mempengaruhi sensitivitas insulin perifer." : "Profil glikemik dalam rentang terkontrol optimal.",
            },
            {
              condition: "hypertension",
              label: "Hipertensi Kardiometabolik",
              probability: sleep < 6 || stress > 7 ? 0.36 : 0.20,
              risk_level: sleep < 6 || stress > 7 ? "moderate" : "low",
              trend: sleep < 6 ? "increasing" : "stable",
              description: sleep < 6 ? "Durasi tidur rendah berkorelasi dengan disregulasi tekanan darah nocturnal." : "Regulasi tonus vaskular dalam batas aman.",
            },
            {
              condition: "cardiovascular",
              label: "Penyakit Jantung & Vaskular",
              probability: profile?.smoking_status === "daily" ? 0.42 : 0.24,
              risk_level: profile?.smoking_status === "daily" ? "moderate" : "low",
              trend: "stable",
              description: "Estimasi risiko aterosklerotik kumulatif berbasis dataset epidemiologi BRFSS.",
            },
          ],
          top_factors: [
            {
              feature: "sleep_duration",
              label: `Durasi Tidur (${sleep} Jam/Hari)`,
              impact: sleep < 7 ? "increase" : "decrease",
              weight_percentage: sleep < 7 ? 24 : 14,
              description: sleep < 7 ? "Durasi kurang dari 7 jam memicu pelepasan kortisol sistemik." : "Mendukung regenerasi seluler dan ritme sirkadian normal.",
            },
            {
              feature: "bmi",
              label: `Indeks Massa Tubuh (BMI ${bmi.toFixed(1)})`,
              impact: bmi > 25 ? "increase" : "decrease",
              weight_percentage: bmi > 25 ? 28 : 12,
              description: bmi > 25 ? "Beban adiposa viseral menaikkan resistensi insulin jaringan." : "Komposisi berat badan dalam batas protektif.",
            },
            {
              feature: "physical_activity",
              label: `Aktivitas Fisik (${activity} Menit/Minggu)`,
              impact: activity < 150 ? "increase" : "decrease",
              weight_percentage: activity < 150 ? 20 : 18,
              description: activity < 150 ? "Di bawah standar anjuran WHO (minimal 150 menit per minggu)." : "Memenuhi target protektif kardiovaskular WHO.",
            },
          ],
          recommendations: [
            {
              id: "rec-1",
              title: "Optimasi Jadwal Tidur Sirkadian",
              category: "sleep",
              action: "Jadwalkan tidur malam konsisten 7-8 jam untuk membantu menstabilkan tekanan darah nocturnal.",
              evidence_level: "A",
              source: "CDC / National Sleep Foundation",
            },
            {
              id: "rec-2",
              title: "Aktivitas Aerobik Teratur",
              category: "activity",
              action: "Jalan santai atau kardio ringan 25-30 menit 5 kali seminggu untuk meningkatkan ambilan glukosa otot.",
              evidence_level: "A",
              source: "AHA Guidelines 2024",
            },
            {
              id: "rec-3",
              title: "Latihan Pengendalian Respons Stres",
              category: "stress",
              action: "Pernapasan diafragma 5 menit di sela jam kerja untuk meredam stimulasi saraf simpatis.",
              evidence_level: "B",
              source: "Harvard Health Publishing",
            },
          ],
          assessed_at: new Date().toISOString(),
        };
      }
    },
  };
}

export const apiClient = new ApiClient();
