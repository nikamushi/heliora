# 05: BE Consent RLS Update Policy and Database Migration Synchronization

**What to build:** Users must be able to revoke their data consent without encountering Row Level Security (RLS) permission violations under Supabase auth contexts. Furthermore, standalone database migrations and SQL schema definitions must achieve full parity: all tables, foreign key constraints to authentication users, trigger functions, RLS policies, nullable fields, and new columns from preceding tickets must be codified in reproducible database migration scripts.

**Blocked by:** 01: BE User Model Nullability and Supabase Auth Clean-up, 02: BE Health Profile Family History Details Persistence, 03: BE XAI Factors Persistence and Historical Assessment Immutability

**Status:** ready-for-agent

- [ ] An explicit UPDATE policy exists on the consents table ensuring authenticated users can revoke their active consent records.
- [ ] Database migration scripts are synchronized with all database entities, triggers, foreign keys, and RLS policies defined in the schema.
- [ ] Running database migrations from a clean state successfully provisions the exact schema required for user authentication, health profiles, assessments, and consent.
- [ ] Revoking consent via authenticated API and direct database operations executes successfully without permission denial.
