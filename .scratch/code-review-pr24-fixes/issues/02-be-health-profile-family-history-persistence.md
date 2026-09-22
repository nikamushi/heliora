# 02: BE Health Profile Family History Details Persistence

**What to build:** When a user records or updates detailed information about their family disease history in their health profile, that detail must be persisted in the database and reliably returned in profile query responses. The backend database schema, object-relational mapping, repositories, and response models must retain this information rather than dropping it silently.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Health profile data store includes storage for granular family history details.
- [ ] Submitting a health profile creation payload containing family history details persists the string value into the database.
- [ ] Retrieving the user's health profile returns the stored family history details alongside existing demographic and biomarker fields.
- [ ] Updating the health profile allows modifying or clearing the family history details.
