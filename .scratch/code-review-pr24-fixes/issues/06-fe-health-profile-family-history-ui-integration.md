# 06: FE Health Profile Family History Details UI Integration

**What to build:** In the web onboarding and profile management screens, when the user indicates a positive family history of chronic illness, they must be presented with an intuitive input field to describe those details. The entered information must be sent in the health profile creation and update requests, and any previously saved family history details must be loaded and rendered correctly when returning to the profile.

**Blocked by:** 02: BE Health Profile Family History Details Persistence

**Status:** ready-for-agent

- [ ] Selecting "Yes" for family history reveals a dedicated input for granular family history details.
- [ ] The entered family history details are included in the health profile submission payload to the API.
- [ ] Existing health profiles with family history details pre-populate the input field upon loading.
- [ ] Form validation and debounce behaviors preserve the entered details without losing focus or dropping input.
