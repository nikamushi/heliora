# 03: BE XAI Factors Persistence and Historical Assessment Immutability

**What to build:** The risk engine computes feature contributions and top lifestyle factors whenever a health assessment is run. These computed factors must be persisted to the database associated with that assessment run. Historical assessment lookups must retrieve the exact persisted factors recorded at the time of the assessment rather than dynamically recalculating them from the user's latest health profile, preserving data integrity and clinical audit history.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Executing a risk assessment persists all extracted contributing factors to the database associated with the assessment session.
- [ ] Fetching the latest assessment returns the persisted contributing factors from storage without recalculating them on the fly.
- [ ] Subsequent edits to a user's health profile do not alter the contributing factors or score explanations of previously completed assessments.
- [ ] Direct assessment detail queries by ID return the immutable point-in-time factors.
