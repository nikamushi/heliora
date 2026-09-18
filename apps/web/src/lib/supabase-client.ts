/**
 * HELIORA — Supabase browser client (FE-012, ADR-011).
 *
 * Supabase Auth adalah identity provider. FastAPI memvalidasi Bearer JWT
 * Supabase via JWKS; modul ini hanya menyediakan session/token di browser.
 * Jika env belum dikonfigurasi, client bernilai null dan api-client
 * fallback ke token legacy sampai backend JWKS live (mode kompatibilitas).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!isSupabaseConfigured()) return null;
  if (cachedClient) return cachedClient;

  cachedClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  return cachedClient;
}

/** Ambil Bearer JWT Supabase aktif, atau null bila belum login / belum dikonfigurasi. */
export async function getSupabaseAccessToken(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}
