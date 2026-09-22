# 01: BE User Model Nullability and Supabase Auth Clean-up

**What to build:** The backend user data model and authentication dependencies must support external authentication where passwords are not managed or stored by the API. Users signing up or authenticating via Supabase (including OAuth providers such as Google) must be represented cleanly in the application database without schema constraint violations. The authentication layer must validate tokens via Supabase JWKS and discontinue legacy local token issuance and artificial fallback user creation.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] User entity allows null password credentials to accommodate identity provider managed accounts.
- [x] Authentication dependency securely resolves user identity strictly from verified token claims without creating synthetic placeholder records.
- [x] Legacy local token issuance endpoints and obsolete password verification routines are cleanly removed or marked deprecated.
- [x] Authenticated requests from Supabase OAuth and email users successfully resolve the current user context.
