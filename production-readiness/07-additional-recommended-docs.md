# 07 — Additional Recommended Docs

The supporting operational, legal and engineering docs are split into separate files so each can be adopted (moved to the repo root or `docs/`) independently.

| Doc | Purpose | Suggested final location |
|---|---|---|
| [Release checklist & rollback plan](./07-additional/release-checklist-and-rollback.md) | Step-by-step release, go/no-go, rollback per channel (web, Play, App Store) | `docs/RELEASING.md` |
| [Incident response / on-call runbook](./07-additional/incident-response-runbook.md) | Severity levels, playbooks for likely incidents (Whoosh down, crash spike, CDN media missing, key loss) | `docs/RUNBOOK.md` |
| [Environment variables & config reference](./07-additional/env-config-reference.md) + [`.env.example`](./07-additional/env.example) | Every variable and secret, where it lives, public vs secret | `.env.example` at the repo root |
| [Legal & compliance checklist](./07-additional/legal-compliance-checklist.md) | Privacy Policy, ToS, CCPA/CPRA, GDPR, DPDP, COPPA, ADA, FTC reviews, third-party licenses | `docs/LEGAL.md` |
| [Observability plan](./07-additional/observability-plan.md) | Metrics, SLOs, alerts, dashboards | `docs/OBSERVABILITY.md` |
| [Contribution guide](./07-additional/CONTRIBUTING.md) | Branching, commits, PR checks, coding conventions (TanStack Start patterns from `AGENTS.md`) | `CONTRIBUTING.md` |
| [Architecture Decision Records](./07-additional/adr/) | ADR-0001 Capacitor · ADR-0002 External booking via Whoosh · ADR-0003 Hosting · ADR-0004 No cert pinning / no anti-tamper | `docs/adr/` |
| [Proposed README](./07-additional/README-proposed.md) | Replacement for `README.md` once the store release exists (removes debug-APK download links) | `README.md` |
