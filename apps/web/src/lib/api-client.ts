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
}

export const apiClient = new ApiClient();
