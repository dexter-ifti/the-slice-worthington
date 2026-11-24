# Production Readiness: The Slice (Web + Android + iOS)

> Prepared 2026-11-18 against `main` @ `6e4dee7`. Documentation only. No application code was modified.

## Index

| # | Document | What's in it |
|---|---|---|
| 01 | [Repository analysis](./01-repo-analysis.md) | Architecture, stack, data flow, 23 tech-debt findings, dependency audit |
| 02 | [Production plan](./02-production-plan.md) | Phased roadmap, roles, risks, environments, infra, cost, Definition of Done |
| 03 | [Security checklist](./03-security-checklist.md) | 18 repo findings with fixes, OWASP Top 10 + MASVS checklist, config snippets |
| 04 | [Implementation plan](./04-implementation-plan.md) | 8 epics / ~45 tasks with estimates, execution order, test strategy, CI/CD and monitoring setup |
| 05 | [Feature roadmap](./05-feature-roadmap.md) | Launch must-haves (incl. Apple 4.2 mitigation), post-launch, future; monetization, a11y, i18n |
| 06 | [Store deployment guide](./06-store-deployment-guide.md) | Accounts, signing, versioning, assets, privacy forms, age rating, rejection risks, timelines |
| 07 | [Additional docs](./07-additional-recommended-docs.md) | [Release & rollback](./07-additional/release-checklist-and-rollback.md) · [Incident runbook](./07-additional/incident-response-runbook.md) · [Env reference](./07-additional/env-config-reference.md) + [`env.example`](./07-additional/env.example) · [Legal](./07-additional/legal-compliance-checklist.md) · [Observability](./07-additional/observability-plan.md) · [Contributing](./07-additional/CONTRIBUTING.md) · [ADRs](./07-additional/adr/) · [Proposed README](./07-additional/README-proposed.md) |

---

## Executive summary

**What the app is.** A polished, content-only brand app for The Slice (a 5-bay golf-simulator venue in Worthington, OH). It's built with React 19 + TanStack Start, prerendered, hosted on Vercel, and wrapped with **Capacitor 8** for Android and iOS. The core action, "Book a Bay", hands off to the third-party **Whoosh** booking platform. There's **no backend, no authentication, no user data and no in-app payments.** The application-security surface is therefore small.

**Where it stands.** The web MVP is functional. Tests pass (4/4) and `eslint src` passes. But the repo is **not ready for store release**:

1. **Release engineering is MVP-grade.** Keystore passwords are hardcoded in `android/app/build.gradle:22-24`. CI builds a **debug** APK and commits it to `main`. The iOS project isn't in source control (it's regenerated on every CI run). Versioning is hardcoded. There's no signed AAB/IPA pipeline.
2. **Quality gates are missing or broken.** `tsc` fails (3 errors in `src/routes/about.tsx`). `eslint .` doesn't finish within 6 minutes because it crawls `android/` build output. No CI job runs lint, typecheck or tests.
3. **The biggest business risk is store policy, not code.** In its current form (6 static pages plus outbound links) the app is very likely to be rejected by Apple under **Guideline 4.2 (minimum functionality)**. Launch needs a small set of genuinely useful in-app features (hours/open-now, call, native maps, menu, party inquiry, offline; ideally push or a Wallet member card).
4. **Content and legal gaps.** There's no privacy policy, terms or support page. Copy still says "Opening Fall 2026". The testimonials read as pre-opening anticipation, which is an FTC fake-review risk if they aren't real.
5. **No observability.** There's no crash reporting, analytics or uptime monitoring, and the hard dependencies on Whoosh and the Webflow CDN are unmonitored.

**Effort and timeline.** About **118–170 engineer-hours over 6–8 weeks**, consistent with the existing `PROJECT_ESTIMATE.md` (110–160 h / $10–16k). The critical path is **account verification (D-U-N-S, Apple/Google org accounts) and owner content approval**, not engineering. Run-rate cost after launch is about **$10–110/month** plus $99/yr (Apple) and $25 one-time (Google).

---

## Top-10 priority actions

| # | Action | Pri | Effort | Doc ref |
|---|---|---|---|---|
| 1 | **Rotate Android signing:** new upload keystore, remove the hardcoded `slice123` passwords (`android/app/build.gradle:19-26`), enrol in Play App Signing, keep secrets in GitHub Environments and an org vault | 🔴 Critical | 2–3 h | 03 S-01, 04 E1.2–E1.3 |
| 2 | **Start accounts now** (long lead time): D-U-N-S, Apple Developer **Organisation**, Google Play **Organisation** (avoids the 14-day/12-tester rule), all owned by The Slice's legal entity. Move the GitHub repo from a personal account to an org. | 🔴 Critical | 1–30 days elapsed | 02 Phase 0, 06 §1 |
| 3 | **Clear Apple 4.2:** build the launch features: Visit/hours with open-now, tap-to-call, native directions, menu, parties inquiry, offline state, app-info/legal screen (+ push or Wallet if possible) | 🔴 Critical | 16–24 h | 05 §1, 04 E6 |
| 4 | **Commit and configure `ios/`** (iPhone-only, portrait, `PrivacyInfo.xcprivacy`, `ITSAppUsesNonExemptEncryption=NO`, signing) instead of generating it in CI | 🔴 Critical | 4–6 h | 04 E2.1–E2.2 |
| 5 | **Publish a privacy policy, terms and support URL.** Fix or verify the testimonials and stale "Opening Fall 2026" copy, with written owner content sign-off. | 🔴 Critical | 6–10 h (+ owner/legal) | 07 Legal, 04 E6.5 |
| 6 | **Release pipeline:** fastlane + GitHub Actions on tags → signed **AAB** to Play internal, **IPA** to TestFlight. Tag-derived versioning. **Stop committing APKs** to `main`. Pin Actions to SHAs, `contents: read`. | 🟠 High | 10–14 h | 04 E3.4, E2.6, E1.6–E1.7 |
| 7 | **CI quality gate:** fix the ESLint ignores and the 3 `tsc` errors. Add a `ci.yml` running lint, typecheck, test, build and `npm audit --omit=dev`. Limit the macOS workflow to tags or manual runs. | 🟠 High | 3–5 h | 04 E3.1–E3.3 |
| 8 | **Observability before beta:** Sentry (web + Capacitor, source maps), privacy-friendly analytics on `book_a_bay_tap`, uptime monitors on the web, Whoosh and CDN media URLs | 🟠 High | 6–8 h | 07 Observability, 04 E8.3–E8.5 |
| 9 | **Production web hosting:** leave Vercel **Hobby** (non-commercial terms). Move to Cloudflare Workers (or Vercel Pro) on `app.thesliceworthington.com`, with CSP/HSTS security headers. | 🟠 High | 8–16 h | ADR-0003, 03 S-04 |
| 10 | **Hygiene and resilience:** remove 46 unused shadcn components and ~25 unused deps, use one lockfile, upgrade Capacitor 8.6 / TanStack / Vite (clears most of the 31 audit advisories), self-host fonts and images, disable the service worker on native, harden `AndroidManifest.xml` (`allowBackup`, `FileProvider`), fix the accessibility issues (menu dialog, carousel) | 🟡 Medium | 14–20 h | 01 §4–5, 03 S-05/S-07/S-11, 04 E4/E5/E7 |

---

## Assumptions

1. **US-only distribution** for v1 (Ohio customers). This drives the privacy-law analysis and avoids EU DSA trader requirements.
2. **Booking and payments remain in Whoosh** with no API integration for v1 (per `PROJECT_ESTIMATE.md:166-171`).
3. **Small scale:** low thousands of monthly users. A single venue means no load-scaling concerns.
4. **Team:** 1 Capacitor/React engineer + part-time QA + the venue owner for content and accounts.
5. The Slice's legal entity will own the store accounts, domain, Sentry and hosting. The agency gets delegated access.
6. **iPhone-only** on iOS for v1 (avoids iPad screenshots and layout review).
7. **Free app, no ads, no IAP.** Revenue is from bookings, memberships and events at the venue.
8. The `DOCS_RON/` brand assets (≈ 580 MB) in a local tool checkpoint ref were **never pushed** (verified: absent from `main`, `origin/main` and `teammate/main`).

## Items that could not be verified

| Item | Why | How to verify |
|---|---|---|
| iOS project settings (device family, deployment target, Info.plist, privacy manifest) | `ios/` isn't committed. It's generated on the CI runner. | Commit `ios/` (E2.1) |
| Android 15/16 edge-to-edge and safe-area rendering | Needs a device or emulator | Device matrix (`04` §3.5) |
| Whether the testimonials are from real customers | Content question | Ask the owner |
| Whether the venue is open now (copy says "Opening Fall 2026") | Business status | Ask the owner |
| Whoosh partner API availability, ToS on deep-linking, conversion reporting | Vendor-specific | Ask Whoosh |
| GitHub repo visibility (public/private) | `gh` not authenticated here. The README links a public raw APK URL, which implies public. | Check repo settings. If public, history exposes the keystore password (already treated as compromised). |
| Current store-policy specifics (target API deadlines, Xcode SDK minimum, review times, closed-testing rule) | These change frequently | Recheck in the consoles at submission time (marked **[verify]** in doc 06) |
| `npm run build` success on the current `main` | Not re-run in this analysis (prior docs state it passes). `.output/` exists locally. | CI `build` job |
| Business revenue (CCPA thresholds) and data-processing locations (DPDP relevance) | Business info | Ask the owner / counsel |

## Clarifying questions

1. **Target markets:** US only for launch? Any plans for Canada, the UK or the EU (affects GDPR, DSA, localization)?
2. **Expected scale:** rough monthly users and peak events (e.g., launch-day marketing push)? Any plans for more locations?
3. **Timeline:** is there a hard launch date (grand opening, holiday season)? Is the venue already open?
4. **Budget:** is the $10–16k build estimate approved? What's the monthly ops budget (Sentry, analytics, hosting)?
5. **Team:** who owns QA and on-call after launch? Does anyone on the team have a Mac with Xcode, or should we budget for managed CI (Codemagic/Appflow)?
6. **Accounts:** does The Slice already have a D-U-N-S number, an Apple Developer account and a Google Play account? Personal or organisation?
7. **Hosting:** stay on Vercel (upgrade to Pro) or migrate to Cloudflare Workers before launch?
8. **Launch features:** which of push notifications and the Apple/Google Wallet member card should be in v1 (both strengthen the Apple 4.2 case)?
9. **Content:** who provides and approves hours, menu (does it include alcohol?), party packages and membership pricing? Are the About-page testimonials real and consented?
10. **Analytics stance:** is the owner comfortable with anonymous product analytics (affects privacy labels), or should v1 ship with crash reporting only?
11. **Whoosh:** is there a contact for API access, URL-stability guarantees and booking-conversion reporting?
12. **Repository:** which GitHub organisation should own the code (the client's or the agency's), and is the current repo public?
