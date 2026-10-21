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
