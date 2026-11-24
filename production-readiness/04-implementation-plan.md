# 04 — Implementation Plan

> Epics → tasks with estimates (engineer hours), priorities and dependencies. IDs are referenced from other docs.
> Priority: **P0** blocks store submission · **P1** before GA · **P2** post-launch.
> Total P0+P1 ≈ **118–170 h**, consistent with `PROJECT_ESTIMATE.md` (110–160 h).

---

## 1. Epics and tasks

### E1 — Signing, secrets and repo governance (P0) · 8–12 h

| ID | Task | Est | Pri | Depends | Notes |
|---|---|---|---|---|---|
| E1.1 | Transfer the repo to an org. Branch protection on `main` (PR + status checks). CODEOWNERS. | 1–2 h | P0 | Org exists | Fixes S-18 |
| E1.2 | Generate a new Android **upload** keystore (`keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000`). Store it in the vault plus GitHub `production` environment secrets. | 1 h | P0 | E1.1 | S-01 |
| E1.3 | Replace `signingConfigs.release` with env-driven config (snippet in `03-security-checklist.md` §3). Enable `minifyEnabled`/`shrinkResources`. | 1–2 h | P0 | E1.2 | S-01, S-13 |
| E1.4 | iOS signing: App Store Connect API key, distribution certificate, App Store provisioning profile (fastlane `match` or automatic signing via API key) | 2–3 h | P0 | Apple account | |
| E1.5 | `.gitignore` hardening (`*.jks`, `*.p8`, `*.p12`, `*.mobileprovision`, `DOCS_RON/`). Add gitleaks to CI. | 0.5 h | P0 | — | |
| E1.6 | Remove `apk/` and the APK-commit workflow step. Update README download links. | 1 h | P0 | E3.4 (replacement distribution) | S-02, C-3 |
| E1.7 | Pin all GitHub Actions to SHAs. `permissions: contents: read`. | 1 h | P0 | — | S-03 |

### E2 — Native project completion (P0) · 14–22 h

| ID | Task | Est | Pri | Depends |
|---|---|---|---|---|
| E2.1 | `npx cap add ios` once and commit `ios/`. Remove the generate-in-CI step in `ios-simulator.yml:36-42`. | 1–2 h | P0 | — |
| E2.2 | iOS config: bundle ID `com.thesliceworthington.app`, display name, **iPhone-only** (`TARGETED_DEVICE_FAMILY = 1`) unless iPad is in scope, portrait lock, `ITSAppUsesNonExemptEncryption = NO`, `PrivacyInfo.xcprivacy`, launch storyboard | 3–4 h | P0 | E2.1 |
| E2.3 | Icons and splash for both platforms from `assets/` via `@capacitor/assets` (add a `cap:assets:android` script). Delete `scripts/generate-android-icons.ps1`. Ensure the iOS 1024 icon has no alpha. | 2–3 h | P0 | — |
| E2.4 | Android manifest hardening: `allowBackup=false` (or rules), remove/narrow `FileProvider`, `network_security_config`, `android:screenOrientation="portrait"` (matches the manifest). | 1–2 h | P0 | — |
| E2.5 | Android 15/16 edge-to-edge: verify safe-area insets in the WebView. Replace `StatusBar.setBackgroundColor` with inset-aware layout. Test on API 35/36. | 3–5 h | P0 | — |
| E2.6 | Versioning: derive `versionName` from the git tag and `versionCode` from CI (`github.run_number` + offset). The iOS `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` come from the same source (`agvtool` or fastlane `increment_build_number`). | 2–3 h | P0 | E3.4 |
| E2.7 | Clean up template leftovers (`com.getcapacitor.myapp` tests, unused `google-services` classpath, `buildDir` → `layout.buildDirectory`). | 1 h | P2 | — |
| E2.8 | Upgrade `@capacitor/*` 8.5.3 → 8.6.x and `@capacitor/assets` → 4.x. Run `npx cap sync`. | 1–2 h | P0 | — |

### E3 — CI/CD (P0) · 14–20 h

| ID | Task | Est | Pri | Depends |
|---|---|---|---|---|
| E3.1 | Fix the ESLint ignore list (`android/**`, `ios/**`, `apk/**`, `build/**`, `coverage/**`). Add `"typecheck": "tsc --noEmit"`. Fix `about.tsx:173-177`. | 1–2 h | P0 | — |
| E3.2 | `ci.yml` on PR/push: `npm ci` → `lint` → `typecheck` → `test --coverage` → `build` → `npm audit --omit=dev --audit-level=high` → gitleaks. Ubuntu only (cheap). | 2–3 h | P0 | E3.1 |
| E3.3 | Restrict the macOS workflow to `workflow_dispatch` and tags (today it runs on every push and PR, `ios-simulator.yml:3-8`). Keep Appetize previews on demand. | 0.5 h | P0 | — |
| E3.4 | **Release pipeline** (`release.yml`, on tag `v*`, `production` environment approval): web deploy → Android `bundleRelease` → fastlane `supply` to the **internal** track → iOS `gym` → `pilot` to TestFlight. Upload Sentry source maps. | 8–12 h | P0 | E1.*, E2.* |
| E3.5 | Preview deployments per PR (Cloudflare Workers preview / Vercel preview) with the URL posted to the PR | 1–2 h | P1 | E8.1 |
| E3.6 | Renovate (grouped weekly, `minimumReleaseAge`). Dependabot security alerts. CodeQL. | 1–2 h | P1 | — |

**Proposed `ci.yml` skeleton:**

```yaml
name: CI
on: { pull_request: {}, push: { branches: [main] } }
permissions: { contents: read }
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@<sha>
      - uses: actions/setup-node@<sha>
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build
      - run: npm audit --omit=dev --audit-level=high
  android-build:
    needs: verify
    runs-on: ubuntu-latest
    steps: [ "...", "npm run cap:sync", "cd android && ./gradlew lintRelease assembleRelease (unsigned on PRs)" ]
```

### E4 — Code health and dependency hygiene (P1) · 6–10 h

| ID | Task | Est | Pri |
|---|---|---|---|
| E4.1 | Delete the unused `src/components/ui/*`, `src/hooks/use-mobile.tsx` and their dependencies (list in `01-repo-analysis.md` §5.3). Re-enable `no-unused-vars` / `noUnusedLocals`. | 2–3 h | P1 |
| E4.2 | Use one package manager. Delete `bun.lock` (or `package-lock.json` plus switch CI to bun). Rename the package to `the-slice-app` and add `version`. | 0.5 h | P1 |
| E4.3 | Upgrade TanStack Start/Router/plugin, Vite 8.3, Vitest, typescript-eslint, jsdom. Retest whether the `rolldown` override is needed. Upgrade `nitro` to RC (or remove it with E8). | 2–4 h | P1 |
| E4.4 | Extract `<ExternalLink>` and a `links.ts` host allowlist. Replace the 4 inline copies. | 1–2 h | P1 |
| E4.5 | Mark `PROJECT_ESTIMATE.md` historical. Update the README (see `07-additional/README-proposed.md`). | 0.5 h | P2 |

### E5 — Native UX, offline and performance (P0/P1) · 12–18 h

| ID | Task | Est | Pri |
|---|---|---|---|
| E5.1 | Skip SW registration on native (`pwa-register.tsx`). On the web, use a build-hashed cache name, cap entries, and an offline fallback page. | 2–3 h | P1 |
| E5.2 | Offline / poor-network UX: a `@capacitor/network` listener plus a banner. "Book a Bay" shows "You're offline — call us at …" when offline. | 2–3 h | P0 |
| E5.3 | Self-host Montserrat (`@fontsource-variable/montserrat`). Bundle `about`/`simulators` images as optimised AVIF/WebP in `src/assets`. Keep the hero video remote with the bundled poster. | 2–3 h | P1 |
| E5.4 | Hero video: respect `prefers-reduced-motion` and Save-Data (show the poster only). Add the desktop `<source media>` or remove `HERO_VIDEO_DESKTOP_URL`. | 1 h | P1 |
| E5.5 | In-app browser: verify `presentationStyle: "popover"` on iPhone (renders full-screen; `popover` matters only on iPad). Listen to `Browser.addListener('browserFinished')` to show a "Booked? See you soon" toast and track it. | 1–2 h | P1 |
| E5.6 | Performance budget: LCP < 2.5 s p75 on mid-range Android, JS < 200 KB gz. Lighthouse CI in `ci.yml`. | 2–3 h | P1 |
| E5.7 | Haptics on primary CTA (`@capacitor/haptics`) and native share sheet for "Share The Slice" | 1–2 h | P2 |

### E6 — Launch features for store acceptance (P0) · 16–24 h

See `05-feature-roadmap.md` §1 for the rationale. Summary:

| ID | Task | Est | Pri |
|---|---|---|---|
| E6.1 | **Visit/Info** screen: hours (structured data in `links.ts` → `venue.ts`), open-now badge, tap-to-call (`tel:`), native maps deep link (Apple Maps on iOS, `geo:`/Google Maps on Android), parking/accessibility notes | 5–7 h | P0 |
| E6.2 | **Menu** screen (food and drinks) from owner content | 3–4 h | P0 |
| E6.3 | **Events and parties inquiry**: structured packages plus a "Request a party" action (mailto/`tel:` or the website form in the in-app browser) | 3–4 h | P0 |
| E6.4 | **Settings/About app** screen: version, privacy policy, terms, support/contact, analytics opt-out, open-source licenses | 2–3 h | P0 |
| E6.5 | Content refresh: remove the "Opening Fall 2026" copy, replace testimonials with verified reviews (or remove them), fix the pizza/food meta mismatch | 2–3 h | P0 |
| E6.6 | Add-to-calendar / reminder after booking (optional; see the roadmap) | 2–3 h | P1 |

### E7 — Accessibility (P1) · 4–6 h

| ID | Task | Est |
|---|---|---|
| E7.1 | Replace the custom menu overlay (`site-header.tsx:62-117`) with Radix Dialog / `ui/sheet` (focus trap, Esc, focus return, `aria-modal`) | 1–2 h |
| E7.2 | Testimonial carousel: pause/play control, stop on hover/focus, honour `prefers-reduced-motion`, remove `aria-live` during auto-rotation (`about.tsx:91-97,170`) | 1 h |
| E7.3 | Contrast audit of `text-muted-foreground`, `text-foreground/75` and the CTA hover states. Ensure 44×44 touch targets (the install-hint close button `index.tsx:115-121` is ~16 px). | 1–2 h |
| E7.4 | Dynamic Type / Android font scale up to 200 % with no clipping. Screen-reader pass (VoiceOver, TalkBack). | 1 h |

### E8 — Hosting, observability, analytics (P0/P1) · 12–20 h

| ID | Task | Est | Pri |
|---|---|---|---|
| E8.1 | Migrate the web to Cloudflare Workers (`@cloudflare/vite-plugin`, `wrangler.jsonc`) **or** move to Vercel Pro. Custom domain `app.thesliceworthington.com`, staging subdomain. | 6–12 h | P0 |
| E8.2 | Security headers / CSP (S-04) | 1–2 h | P0 |
| E8.3 | Sentry: `@sentry/capacitor` + `@sentry/react` (native and web), release = `versionName+versionCode`, environment tags, source maps upload in `release.yml`, PII scrubbing | 3–4 h | P0 |
| E8.4 | Analytics (privacy-friendly; ADR needed): events `book_a_bay_tap`, `external_link_open{host}`, `screen_view`, `call_tap`, `directions_tap`, `membership_tap`, `offline_shown` | 2–3 h | P1 |
| E8.5 | Synthetic monitors: web home, `WHOOSH_BOOKING_URL`, hero video URL, memberships URL (HTTP 200 checks every 5 min) | 1 h | P1 |

---

## 2. Order of execution

```text
Week 1:  E1.1 → E1.2 → E1.3 ║ E3.1 → E3.2 ║ E2.1 → E2.2 ║ E2.8 ║ E1.5, E1.7, E3.3
Week 2:  E2.3, E2.4, E2.5 ║ E4.1–E4.4 ║ E8.1 → E8.2 ║ E6.5 (content arrives)
Week 3:  E6.1–E6.4 ║ E5.1–E5.5 ║ E7.* ║ E8.3, E8.4 ║ E1.4 → E2.6 → E3.4 (first TestFlight/internal build)
Week 4–5: Beta (Phase 2). Fixes only. E8.5, E3.5, E3.6, E5.6.
Week 6+:  Store submission (E1.6 after Play internal testing replaces APK downloads).
```

**Critical path:** Apple/Google accounts → E1.2/E1.4 signing → E2.1/E2.2 iOS project → E6.* launch features (blocked by **owner content**) → E3.4 release pipeline → beta (≥ 14 days if a personal Play account) → review.

Dependency graph (simplified):

```text
Accounts ─┬─► E1.4 iOS signing ─┐
          └─► E1.2 keystore ─► E1.3 ─┤
E2.1 iOS project ─► E2.2 ─────────────┼─► E2.6 versioning ─► E3.4 release pipeline ─► Beta ─► Store
E3.1 ─► E3.2 CI ──────────────────────┘
Owner content ─► E6.5 ─► E6.1–E6.3 ───────────────────────────────────────────────────┘
Privacy policy ─► E6.4, E8.3/E8.4 (labels must match SDKs) ───────────────────────────┘
```

---

## 3. Testing strategy

### 3.1 Unit (Vitest, existing)
- Today: 4 tests (`src/test/brand-links.test.ts`, `app-routing.test.tsx`). They assert constants and route matching only.
- Add:
  - `platform.ts`: `openExternalUrl` uses `Browser.open` on native and `window.open` with `noopener` on the web, falls back on error, and rejects non-allowlisted hosts (mock `@capacitor/core`).
  - `ExternalLink` / `BrandCta`: `preventDefault` on native only.
  - Back-button handler: exits at root, goes back otherwise.
  - `appUrlOpen` path allowlisting.
  - Venue hours logic (open-now, holiday overrides) once E6.1 lands. **This is the most logic-heavy code in the app, so test it thoroughly** (time zones: America/New_York, DST boundaries).
- Coverage target: **80 % lines on `src/lib/**`**. Components are covered by component tests.

### 3.2 Component / integration (Vitest + Testing Library)
- Render every route through `createRouter` + `RouterProvider` with a memory history. Assert that the H1 renders, the "Book a Bay" CTA has the Whoosh href, and the menu opens and closes, with focus trapped and Esc closing it.
- `axe-core` (`vitest-axe`) on each route: zero serious/critical violations.
- Upgrade jsdom (20 → current) first.

### 3.3 E2E (web): Playwright
- Smoke on every PR against the preview URL: all 6 routes return 200 with no console errors; "Book a Bay" opens `app.whoosh.io` in a new tab; 404 page; offline mode (`context.setOffline(true)`) shows the offline UI.
- Projects: Chromium and WebKit mobile viewports (Pixel 7, iPhone 15).
- Visual regression (Playwright screenshots) on home and the menu. Threshold 0.2 %.

### 3.4 E2E (native)
- **Maestro** flows (simple YAML, works on both platforms with Capacitor WebViews): launch → splash → home → tap "Book a Bay" → assert in-app browser shows the `whoosh.io` URL → dismiss → back on home; Android hardware back from `/about` → home → exit.
- Run on CI emulators (Android, Ubuntu with KVM) per release. iOS Simulator on the macOS release workflow.

### 3.5 Device matrix (manual + cloud: BrowserStack App Live / Firebase Test Lab)

| Tier | iOS | Android |
|---|---|---|
| 1 (must pass) | iPhone 16/17 (iOS 26), iPhone SE 3rd gen (small screen, iOS 18) | Pixel 8/9 (Android 15/16), Samsung Galaxy A-series mid-range (Android 14, One UI) |
| 2 (should pass) | iPhone 13 (iOS 17), iPhone 15 Pro Max (large) | Samsung S-series (Android 15), Xiaomi/Redmi (MIUI WebView quirks), Android 10 low-RAM device |
| 3 (smoke) | iPad (only if iPad is supported) | Android 7.0 (minSdk 24) emulator |

Checks per device: safe areas and notch/Dynamic Island, edge-to-edge, splash → first paint, font scale 200 %, dark-mode system setting, offline/airplane, the Whoosh round-trip, the back button, app switching (state restore), external links (Instagram app installed vs not; Maps).

### 3.6 Load / performance
- Load testing is **barely relevant**: the web is prerendered static output on a CDN and native has no backend. Do a single **k6** smoke (50 VUs × 2 min against `app.` home) to validate CDN caching and that the Workers/Vercel free-tier limits aren't hit during a marketing push.
- More important are **Lighthouse CI** (performance ≥ 90 mobile, accessibility ≥ 95) and native startup time (cold start to interactive < 2 s on a Pixel 6a-class device).

### 3.7 Release regression checklist
Lives in `07-additional/release-checklist-and-rollback.md`.

---

## 4. CI/CD, monitoring, crash reporting, analytics and logging setup

| Concern | Tool (recommended) | Setup notes |
|---|---|---|
| CI | GitHub Actions (`ci.yml`, `release.yml`) | Ubuntu for verify and Android. macOS only on release tags and manual runs. |
| Build/signing/upload | **fastlane** (`supply`, `gym`, `pilot`, `match`) | Lanes: `android internal`, `android promote track:production rollout:0.1`, `ios beta`, `ios release`. Metadata in `fastlane/metadata` (versioned store listings). |
| Alternative | Codemagic or Ionic Appflow | Managed macOS and signing. Consider it if the team has no Mac. |
| Web deploy | Wrangler (`wrangler deploy --env production`) or the Vercel CLI | Previous deployments are kept for instant rollback. |
| OTA web-layer updates (optional) | Capgo / Appflow Live Updates | Lets JS/CSS fixes ship without store review. Allowed if the app's purpose doesn't change (Apple 3.3.1(b)/2.5.2). **Decide via ADR. Not needed for v1.** |
| Crash reporting | **Sentry** (`@sentry/capacitor`, `@sentry/react`) | Native crash (Java/ObjC), JS errors, release health (crash-free sessions/users). `tracesSampleRate: 0.1`. |
| Store vitals | Play Console Android vitals, App Store Connect Metrics / Xcode Organizer | Check daily during rollout (ANR, crash rate thresholds: Play "bad behavior" at 1.09 % crash / 0.47 % ANR). |
| Analytics | **PostHog** (EU/US cloud, cookieless mode) or **Plausible** (web) + Firebase Analytics (native), per ADR | Needs privacy-label updates. No IDFA, no ATT. |
| Uptime / synthetic | Better Stack or UptimeRobot | Monitors listed in E8.5. Status page optional. |
| Logging (web server) | Cloudflare Workers Logs / Vercel logs → Sentry | Keep `src/lib/error-capture.ts` expansion, or replace it with Sentry's h3 integration. |
| Alert routing | Sentry + Better Stack → Slack `#slice-alerts` + email or on-call phone | Thresholds in `07-additional/observability-plan.md`. |
