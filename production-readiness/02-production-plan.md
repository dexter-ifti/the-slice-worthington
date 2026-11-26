# 02 — Production Plan

> Goal: take the current Capacitor + TanStack Start MVP to a **public Google Play and Apple App Store release** and a production web/PWA at `app.thesliceworthington.com` (target domain from `REQUIREMENTS.md:16`).
>
> Estimates assume **1 full-stack engineer (Capacitor/React) + part-time QA + owner/PM for content and accounts**, which matches the 110–160 h envelope in `PROJECT_ESTIMATE.md`. See the open questions in `README.md`.

---

## 1. Phased roadmap

```text
Week:       1        2        3        4        5        6        7        8
Phase 0  ███ Accounts & ownership (long lead-time items, start immediately)
Phase 1  ████████████████ Hardening
Phase 2                    ████████ Closed beta (TestFlight + Play closed testing ≥14 days)
Phase 3                                     ██████ Store review + staged rollout
Phase 4                                                 ████ GA + hypercare
```

### Phase 0 — Accounts and ownership (week 1, runs alongside Phase 1)

| Milestone | Owner | Effort | Lead time / dependency |
|---|---|---|---|
| D-U-N-S number for the business legal entity (needed for **organisation** accounts on both stores) | Owner | 1 h | **Up to 30 days** if the entity isn't already registered with D&B |
| Apple Developer Program, Organisation ($99/yr) | Owner | 1 h | 1–7 days of verification after D-U-N-S |
| Google Play Console, **Organisation** account ($25 one-time) | Owner | 1 h | 2–7 days of identity verification. An organisation account **avoids the 12-tester / 14-day closed-testing requirement** for new personal accounts |
| Transfer the GitHub repo from `dexter-ifti/...` to a client- or agency-owned org. Enable branch protection. | Eng lead | 2 h | Before secrets are added |
| Domain/DNS: `app.thesliceworthington.com`, plus `staging.` | Owner + Eng | 1 h | DNS access |
| Privacy policy, terms and support URLs published on `thesliceworthington.com` | Owner + Legal | 4–8 h | Required before any store submission |
| Content sign-off: hours, opening status, events, membership pricing, testimonials | Owner | 4 h | Blocks Phase 3 |

### Phase 1 — Hardening (weeks 1–3, ~70–95 h)

| Milestone | Effort | Depends on |
|---|---|---|
| M1.1 Secrets and signing: rotate keystore, remove hardcoded passwords, Play App Signing, iOS certificates/profiles (fastlane match or Xcode-managed) | 6–8 h | Phase 0 accounts |
| M1.2 Commit and configure the `ios/` project (Info.plist, PrivacyInfo, iPhone-only decision, export compliance, icons) | 6–10 h | Apple account |
| M1.3 CI quality gate (lint/typecheck/test/build/audit) and the release pipeline (signed AAB/IPA via fastlane) | 12–16 h | M1.1 |
| M1.4 Code health: fix tsc errors, ESLint ignores, remove unused deps/components, one lockfile, upgrade Capacitor/TanStack/Vite | 6–10 h | — |
| M1.5 Native UX: offline/poor-network state, external-link component, edge-to-edge on Android 15+, disable SW on native, self-host fonts/images | 10–14 h | — |
| M1.6 **Minimum-functionality features** for Apple 4.2 (hours, tap-to-call, native maps, events inquiry, menu; see `05-feature-roadmap.md` "Must-have") | 16–24 h | Content sign-off |
| M1.7 Accessibility fixes (menu dialog, carousel pause, contrast audit) | 4–6 h | — |
| M1.8 Observability: Sentry (web + Capacitor), privacy-friendly analytics, uptime/link monitors | 6–8 h | Privacy policy wording |
| M1.9 Web hosting move off Vercel Hobby (Cloudflare Workers or Vercel Pro), security headers, custom domain | 8–16 h | Domain |

**Exit criteria:** all P0/P1 items in `01-repo-analysis.md` §4 and all **Critical/High** items in `03-security-checklist.md` closed. CI green. Signed builds produced by CI.

### Phase 2 — Closed beta (weeks 4–5, ~15–25 h)

| Milestone | Detail |
|---|---|
| TestFlight internal (≤100 team testers, no review) then **external** (requires Beta App Review, ~24–48 h) | Owner, staff, 10–30 regular customers |
| Google Play **internal testing** (instant) then **closed testing** | ≥14 days if a personal account is used (12+ opted-in testers). Recommended either way. |
| Device-matrix QA (see `04-implementation-plan.md` §3.5) | Booking hand-off to Whoosh and back, back button, offline, deep links |
| Beta feedback triage | Fix crash/UX blockers only |

**Exit criteria:** crash-free sessions ≥ 99.5 % over ≥ 7 days, no open Sev-1/Sev-2 bugs, "Book a Bay" success ≥ 99 % in testing, owner sign-off on screenshots and listing.

### Phase 3 — Store review and staged rollout (week 6–7)

| Store | Mechanism | Plan |
|---|---|---|
| Google Play | Production track **staged rollout** | 10 % → 25 % → 50 % → 100 % over ~5–7 days. Halt if crash-free < 99 % or there is an ANR spike. |
| Apple | **Phased release for automatic updates** (7-day ramp, 1→2→5→10→20→50→100 %) | First release goes to all new downloads (phased release only applies to updates). Use "Manually release" so launch timing matches marketing. |
| Web | Deploy to `app.` with a previous-deployment rollback ready | Run in parallel with the existing Vercel URL, then redirect. |

### Phase 4 — GA and hypercare (week 7–8)

- 2 weeks of hypercare: daily dashboard review, on-call per `07-additional/incident-response-runbook.md`.
- Retrospective, then hand off to a maintenance cadence (monthly dependency updates, quarterly OS-version checks before each iOS/Android major release).

---

## 2. Owners and roles (RACI-lite)

| Role | Responsibilities | Suggested person |
|---|---|---|
| **Product owner (venue)** | Accounts, legal entity, content approval, store listing approval, final go/no-go | The Slice owner/GM |
| **Eng lead / mobile engineer** | All code, CI/CD, signing, store builds, technical store answers | Agency engineer |
| **QA** | Device matrix, regression, beta coordination | Part-time QA or engineer + owner staff |
| **Designer** | Store screenshots, feature graphic, icon review, maskable icons | Brand designer (Montserrat / brand guide holder) |
| **Legal/privacy reviewer** | Privacy policy, ToS, data-safety answers | Counsel or a vetted template + owner |
| **On-call** | Post-launch incidents | Eng lead (primary), agency backup |

---

## 3. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Apple rejects under Guideline 4.2 / 4.2.2** ("primarily marketing materials… or a collection of links"). Today the app is 6 static pages plus outbound links. | **High** | High (weeks of delay) | Ship the "must-have" native value set before first submission (hours, call, maps, menu, events inquiry, offline, ideally push or a Wallet pass). Write strong review notes. Be ready to appeal. See `06-store-deployment-guide.md` §8. |
| R2 | Google Play "Minimum functionality" / webview-wrapper policy | Medium | Medium | Same mitigations as R1. |
| R3 | Account verification delays (D-U-N-S, Play identity) | Medium | High | Start Phase 0 on day 1. |
| R4 | Compromised keystore credentials (`[redacted]` in git history) | Already happened | Medium (no production key exists yet) | New upload key **before** the first Play upload. Never reuse this one. |
| R5 | Whoosh changes URLs, has outages, or blocks in-app browsers | Low–Med | High (core flow) | Synthetic monitor on `WHOOSH_BOOKING_URL`. Remote-config the URL (feature roadmap). Fallback copy with phone number. |
| R6 | Webflow CDN asset URLs change (marketing site redesign) | Medium | Medium | Bundle images. Monitor the video URL. |
| R7 | Inaccurate or illustrative testimonials, stale "Opening Fall 2026" copy | High (present) | Medium (FTC / store metadata accuracy) | Owner content sign-off is a launch gate. |
| R8 | Vercel Hobby terms prohibit commercial use (`PROJECT_ESTIMATE.md:123-125`) | Present | Medium | Migrate (M1.9). |
| R9 | Single engineer (bus factor 1) | High | High | Documented runbooks, ADRs, signing keys in an org-owned vault, a second admin on every console. |
| R10 | Android 15/16 edge-to-edge layout bugs (status bar overlap) | Medium | Low–Med | Device matrix includes Android 15 and 16. |

---

## 4. Environments

| Env | Web | Native | Data/config | Who deploys |
|---|---|---|---|---|
| **dev** | `npm run dev` (localhost) | `npx cap run android/ios` with live reload (optional `server.url`, **never committed**) | Local `.env.local` | Engineer |
| **preview** | Per-PR preview deployment (Cloudflare Workers preview URL or Vercel preview) | — | `VITE_APP_ENV=preview` | CI on PR |
| **staging** | `staging.thesliceworthington.com` (password-protected / `noindex`) | Play **internal testing** track, **TestFlight internal** | `VITE_APP_ENV=staging`, separate Sentry environment | CI on merge to `main` |
| **prod** | `app.thesliceworthington.com` | Play production (staged), App Store | `VITE_APP_ENV=production` | CI on tag `vX.Y.Z` + manual approval (GitHub Environment protection rule) |

Native builds must **never** point at a remote `server.url` in production. The app should load bundled assets (`capacitor.config.ts:6`).

## 5. Infrastructure and scaling

- **Web:** the site is fully prerendered (`vite.config.ts:16-19`), so it can be served almost entirely from the CDN edge. SSR load is effectively nil. Scaling isn't a concern at any realistic venue scale (a single 5-bay venue means low thousands of MAU).
- **Recommended host:** Cloudflare Workers with `@cloudflare/vite-plugin` + Wrangler (`PROJECT_ESTIMATE.md:102-121`, ADR-0003). Alternative: **Vercel Pro** (keeps Nitro and costs more per seat).
- **Native:** all assets are bundled, so there's no backend to scale. The external dependencies (Whoosh, Webflow CDN, Google Fonts) are monitored, not scaled.
- **Backups:** there's no user data. "Backups" means:
  - Source: GitHub org plus a periodic mirror (e.g., a second git remote or GitHub's own backups).
  - **Signing material (critical):** Android upload keystore, iOS distribution certificate `.p12`, App Store Connect API key `.p8`, and Play service-account JSON, kept in an org password manager (1Password/Bitwarden) **and** an offline encrypted copy. Losing the iOS cert is recoverable. Losing the Android upload key is recoverable only through Play support with Play App Signing.
  - Store listing copy and screenshots: committed under `store/` (or `fastlane/metadata`).

## 6. Cost estimate (monthly unless noted, USD)

| Item | Low | Expected | Notes |
|---|---:|---:|---|
| Apple Developer Program | $8.25 | $8.25 | $99/yr |
| Google Play Console | — | — | $25 one-time |
| Web hosting: Cloudflare Workers | $0 | $5 | Free tier (100k req/day) is likely enough. Paid adds headroom. |
| *(alt)* Vercel Pro | $20 | $20+ | Per member |
| Domain | ~$1 | ~$1 | Probably already owned |
| Crash reporting: Sentry | $0 | $26 | Developer free tier (5k errors) is likely enough |
| Analytics: Plausible / PostHog / Firebase | $0 | $9 | PostHog/Firebase free tiers; Plausible ~$9 |
| Uptime monitoring: Better Stack / UptimeRobot | $0 | $0–$20 | |
| CI: GitHub Actions macOS minutes | $0 | $10–$40 | macOS runners bill at **10×**. Today `ios-simulator.yml` runs on **every push and PR** (`:3-8`), so restrict it to tags or manual runs. |
| Push notifications (post-launch, optional): FCM + APNs | $0 | $0 | OneSignal free tier if a dashboard is wanted |
| **Run-rate total** | **≈ $10/mo** | **≈ $60–$110/mo** | Plus $25 one-time |
| One-time build effort | 110 h | 160 h | Per `PROJECT_ESTIMATE.md` at $75–$100/h, about **$10k–$16k** |

---

## 7. Definition of Done / go-live criteria

### Engineering
- [ ] All **P0** and **P1** items in `01-repo-analysis.md` §4 closed or explicitly risk-accepted by the owner.
- [ ] All **Critical** and **High** items in `03-security-checklist.md` closed.
- [ ] CI green on `main`: lint, typecheck, unit/component tests, web build, `npm audit --omit=dev --audit-level=high` = 0.
- [ ] Release builds are produced **only by CI** from a signed tag. Release AAB/IPA are reproducible. No binaries are committed to git.
- [ ] Version numbers come from the tag. `versionCode` / `CFBundleVersion` are monotonically increasing.
- [ ] The E2E smoke suite (web) passes. The manual device matrix passes on all tier-1 devices.
- [ ] Crash reporting is live, release-tagged and has source maps uploaded. Alerts route to on-call.

### Product, content and legal
- [ ] The owner has approved every screen's copy, imagery, hours, events and membership content. No placeholder or illustrative testimonials remain.
- [ ] Privacy policy, terms and support URLs are live and linked in-app and in both store listings.
- [ ] Data Safety form (Play) and App Privacy labels (Apple) match the actual SDKs in the build.
- [ ] Accessibility: WCAG 2.2 AA on the core flow (home, menu, Book a Bay), VoiceOver and TalkBack pass.
- [ ] Store listings (icons, screenshots, descriptions) approved.

### Operations
- [ ] Release checklist and rollback plan rehearsed once (`07-additional/release-checklist-and-rollback.md`).
- [ ] On-call rota and incident runbook agreed.
- [ ] Signing keys and console access held by **at least two** people in an org-owned vault.
- [ ] Beta exit criteria met (Phase 2).
