/**
 * HELIORA — Auth Configuration Constants (PRD §15.4, AC-AUTH-01).
 *
 * Single source of truth for auth token lifespans, cooldown intervals,
 * and user-facing copy to prevent configuration divergence.
 */

/** Expiry duration for password reset links issued by Supabase Auth. */
export const AUTH_PASSWORD_RESET_EXPIRY_LABEL = "1 jam";

/** Cooldown period in seconds before user can request another reset email. */
export const AUTH_PASSWORD_RESET_COOLDOWN_SECONDS = 60;

/** Minimum password length requirement (AC-AUTH-01). */
export const AUTH_MIN_PASSWORD_LENGTH = 8;

/**
 * Session marker: only /reset-password with an active recovery flow may
 * call updateUser. Prevents a normal logged-in session from being treated
 * as password recovery (which yields confusing "same as old password" errors).
 */
export const AUTH_PASSWORD_RECOVERY_MARKER_KEY = "heliora:password-recovery";

export function markPasswordRecoveryFlow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_PASSWORD_RECOVERY_MARKER_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function hasPasswordRecoveryFlow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(AUTH_PASSWORD_RECOVERY_MARKER_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearPasswordRecoveryFlow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_PASSWORD_RECOVERY_MARKER_KEY);
  } catch {
    // ignore
  }
}

/** Map Supabase Auth password-update errors to Indonesian copy. */
export function mapPasswordUpdateError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("different from the old password") ||
    lower.includes("same as the old") ||
    lower.includes("should be different")
  ) {
    return "Kata sandi baru harus berbeda dari kata sandi lama. Masukkan kombinasi yang belum pernah dipakai.";
  }
  if (lower.includes("weak") || lower.includes("at least")) {
    return `Kata sandi terlalu lemah. Gunakan minimal ${AUTH_MIN_PASSWORD_LENGTH} karakter dengan huruf dan angka.`;
  }
  return message;
}

/**
 * RFC 5322 Section 3.4.1 compliant email regex (practical standard subset).
 * Matches standard valid emails and rejects whitespace, invalid characters,
 * malformed local parts, and invalid domain structures.
 */
export const RFC_5322_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return RFC_5322_EMAIL_REGEX.test(email.trim());
}
