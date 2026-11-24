# Release Checklist & Rollback Plan

> Channels: **Web** (`app.thesliceworthington.com`), **Android** (Google Play), **iOS** (App Store). The native apps bundle the web build (`capacitor.config.ts:6` → `.output/public`), so a web deploy **does not** change installed apps. Native fixes need a store release (or an OTA layer, if adopted per ADR).

## 1. Pre-release (T-3 days)

- [ ] All PRs for the release are merged to `main`. CI is green (lint, typecheck, test, build, audit).
- [ ] `CHANGELOG.md` is updated. Store "What's new" text is drafted (≤ 500 chars for Play, ≤ 4000 for Apple).
- [ ] Version bumped by tag only: `git tag v1.2.0 && git push --tags` (`versionCode`/`CFBundleVersion` derived in CI; see `06-store-deployment-guide.md` §3).
- [ ] Content check: hours, events, menu and membership copy match what the owner approved. No stale dates.
- [ ] Link check: `WHOOSH_BOOKING_URL`, `MEMBERSHIPS_URL`, `CONTACT_US_URL`, `MAPS_URL`, `INSTAGRAM_URL`, hero video URL all return 2xx (CI job or `npx linkinator`).
- [ ] Privacy labels / Data safety still match the SDK list (did this release add an SDK? If so, update both consoles **before** submitting).
- [ ] Sentry release created and source maps/dSYMs/mapping uploaded by CI.

## 2. Release-candidate QA (T-2 days)

Run on tier-1 devices (`04-implementation-plan.md` §3.5):

- [ ] Cold start → splash → home in < 2 s. No white flash.
- [ ] "Book a Bay" (home, sticky bar, menu) opens Whoosh in the in-app browser. Close returns to the same screen.
- [ ] Every menu item navigates correctly. The Android back button goes back, then exits at home.
- [ ] Call, directions (Apple Maps / Google Maps), Instagram (app installed and not installed), website.
- [ ] Airplane mode: offline banner, bundled content still visible, "Book a Bay" shows the offline fallback.
- [ ] Safe areas: notch/Dynamic Island, Android 15/16 edge-to-edge, landscape locked.
- [ ] VoiceOver/TalkBack: the menu is announced as a dialog and focus returns on close.
- [ ] Font scale 200 % with no clipped CTAs.
- [ ] Sentry receives a test event from the RC build (then remove the trigger).

## 3. Go / no-go (T-1 day)

| Check | Owner | Go if |
|---|---|---|
| QA sign-off | QA | All tier-1 checks pass |
| Beta health | Eng | Crash-free sessions ≥ 99.5 % in TestFlight/closed track over the last 7 days |
| Content sign-off | Product owner | Written approval |
| On-call | Eng lead | Named primary and backup for 72 h after release |
| Rollback ready | Eng | Previous web deployment ID noted. Previous store build numbers noted. |

## 4. Release steps

1. **Web:** `release.yml` deploys to staging, a smoke test runs (Playwright), then a manual approval promotes to production. Note the deployment ID.
2. **Android:** fastlane promotes internal → production at **10 %** rollout.
3. **iOS:** submit for review with *Manual release*. After approval, release with **Phased Release** on (updates only).
4. Post in `#slice-releases`: version, links, rollout %, on-call.

## 5. Post-release monitoring

| Time | Action | Proceed if |
|---|---|---|
| +1 h | Sentry new issues, web 5xx, synthetic monitors | No new Sev-1/2 issues |
| +24 h | Play 10 % → 25 % | Crash-free ≥ 99.5 %, no ANR spike, rating stable |
| +48 h | 25 % → 50 % | Same |
| +72 h | 50 % → 100 % | Same |
| +7 d | iOS phased release reaches 100 % automatically | Pause if crash-free < 99 % |

## 6. Rollback plan

| Channel | How to roll back | Time to effect | Notes |
|---|---|---|---|
| **Web** | Cloudflare: `wrangler rollback <deployment-id>` (or dashboard → Deployments → Rollback). Vercel: *Instant Rollback* to the previous production deployment. | < 5 min | Also clears CDN. Clients with the service worker get the new `/` on next navigation (network-first), so make sure `CACHE_VERSION` rotates per build (E5.1). |
| **Android (during staged rollout)** | Play Console → Production → **Halt rollout**. Users who already updated keep the bad version. | Minutes | Then ship a fix with a **higher `versionCode`** (you can't re-publish a lower code). Rebuilding the previous commit with a new `versionCode` is a valid "rollback". |
| **Android (100 %)** | Same as above: a fixed or rebuilt-previous version with a higher `versionCode`, expedited review is not available, typically hours to 1 day | Hours–days | |
| **iOS (phased)** | App Store Connect → **Pause Phased Release** (up to 30 days). New downloads still get the new version. | Minutes | |
| **iOS (any)** | Submit a fix (rebuild the previous commit with a higher build number). Request **Expedited Review** (link in App Store Connect contact form) for critical bugs. | ~1 day | You can also *Remove from Sale* in extreme cases (e.g., a legal issue). |
| **External dependency broken** (Whoosh URL changed) | Web: hotfix `links.ts` and deploy. Native: needs a release, **unless remote config exists** (roadmap: remote config for URLs). | — | This is why remote config is a post-launch priority. |

**Rule:** never delete a published version or reuse a version code. Roll *forward* with a rebuilt known-good commit.
