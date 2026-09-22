# 07: FE Assessment Risk Metrics and Disclaimer UI Standardization

**What to build:** The web frontend application must present risk assessment outputs and safety disclaimers adhering to regulatory compliance and clinical design standards. The user interface must display the standardized medical safety disclaimer verbatim in all required touchpoints (onboarding consent, assessment results, and dashboards) using an opaque, highly readable surface. Risk cards and badges must represent values as "estimated risk scores" paired with tri-modal semantic indicators (icon, color, and text labels: "Lower", "Moderate", "Higher"). Navigation headers and global layout chrome must remain unmodified.

**Blocked by:** 04: BE Medical Disclaimer and Risk Metric Standardization

**Status:** ready-for-agent

- [ ] All instances of the medical disclaimer in the user interface display the exact verbatim copy specified in design and safety guidelines.
- [ ] Risk cards, summary panels, and detailed condition views display metric values with the "estimated risk score" terminology.
- [ ] Risk status badges incorporate multi-modal accessibility tokens (distinct icon + color + textual classification "Lower" / "Moderate" / "Higher").
- [ ] TypeScript API client interfaces and type definitions match the standardized backend assessment and consent models.
- [ ] Global navigation bar and unrelated chrome components remain intact and unmodified.
