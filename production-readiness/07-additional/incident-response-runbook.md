# Incident Response / On-Call Runbook

## 1. Severity levels

| Sev | Definition (for this app) | Examples | Response | Update cadence |
|---|---|---|---|---|
| **Sev-1** | Customers can't book or the app won't open, for a large share of users | Crash on launch, "Book a Bay" broken on all platforms, web down, signing key leaked | Ack ≤ 15 min (business hours) / ≤ 1 h (off-hours). All hands. | Every 30 min |
| **Sev-2** | Major feature degraded, workaround exists | Whoosh slow or down (third party), hero media missing, crash rate > 1 % on one platform | Ack ≤ 1 h | Every 2 h |
| **Sev-3** | Minor or cosmetic, small user subset | One Android OEM layout bug, a wrong menu price | Next business day | Daily |
| **Sev-4** | Question / improvement | — | Backlog | — |

Venue context: peak usage is **evenings and weekends**, which is when bays get booked. The on-call schedule must cover Fri 4 pm – Sun 10 pm ET at minimum.

## 2. Roles and contacts

| Role | Who | Contact |
|---|---|---|
| Incident commander / primary on-call | Eng lead | _fill in_ |
| Secondary | Agency backup engineer | _fill in_ |
| Business owner (customer comms, venue staff) | The Slice GM | _fill in_ |
| Whoosh support | Vendor | _fill in support email / portal_ |
| Hosting support | Cloudflare / Vercel | Dashboard ticket |
| Apple / Google | App Review contact / Play support | Console contact forms |

## 3. Response workflow

1. **Detect:** an alert (Sentry, Better Stack, store vitals), a staff report or a customer report.
2. **Acknowledge** in `#slice-incidents`. Declare the Sev level. Open an incident doc (template in §6).
3. **Assess:** what's broken, on which channel (web / Android / iOS / third party), since when, and which release.
4. **Mitigate first:** roll back (see `release-checklist-and-rollback.md` §6), halt the rollout, or switch to a fallback. Inform venue staff so they can take phone bookings.
5. **Communicate:** owner-approved message on Instagram, the website banner, and (if push exists) a push notification.
6. **Resolve:** fix forward with a release.
7. **Post-incident review** within 5 business days for Sev-1/2 (blameless, with action items tracked as issues).

## 4. Playbooks

### P1 — "Book a Bay" doesn't work
1. Test `https://app.whoosh.io/patron/club/the-slice/agenda/simulators/today` in a desktop browser.
   - **Whoosh down:** it's a third party, so Sev-2. Contact Whoosh. Ask venue staff to take phone bookings. Post a notice. Nothing to deploy.
   - **URL changed (404 / redirect to the wrong club):** get the new URL from the owner or Whoosh. Hotfix `src/lib/links.ts` and deploy the web (minutes). **Native needs a release** (or a remote-config change once that exists). Request expedited review on iOS.
2. Whoosh works but the app doesn't open it: check Sentry for `Capacitor Browser failed` (`src/lib/platform.ts:27`). Check whether an OS update changed Custom Tabs / SFSafariViewController behaviour. Reproduce on the matrix.

### P2 — Crash spike after release
1. Sentry → Releases → compare crash-free rates by release.
2. **Play:** halt the staged rollout. **iOS:** pause the phased release.
3. Identify the fix, or rebuild the previous good commit with a higher build number. Submit (iOS: expedited review).

### P3 — Web is down or returning 5xx
1. Check the hosting status page and the latest deployment.
2. Roll back to the previous deployment (`wrangler rollback` / Vercel Instant Rollback).
3. Note: `src/server.ts` renders the branded error page for SSR failures, and logs carry the expanded stack (`src/lib/error-capture.ts`). Use them to find the cause.
4. Installed native apps are **unaffected** (bundled assets).

### P4 — Hero video or images missing
- Cause: Webflow CDN asset renamed or removed (`src/lib/links.ts:3-6`, `about.tsx:6-12`, `simulators.tsx:4-5`).
- Impact: cosmetic (the poster image covers the video). Sev-3 unless the home page looks broken.
- Fix: bundle the assets locally (E5.3) or update the URLs.

### P5 — Signing key or secret leaked
1. **Sev-1.** Revoke immediately:
   - Android upload key: Play Console → App signing → **Request upload key reset** (needs Play App Signing). Generate a new key.
   - iOS distribution certificate: revoke it in the Developer portal and reissue (`fastlane match nuke distribution` then regenerate).
   - App Store Connect API key / Play service account: revoke and recreate.
   - GitHub secrets: rotate.
2. Audit recent store uploads for unexpected builds.
3. Note: the keystore password currently in `android/app/build.gradle:22-24` must already be treated as leaked (S-01).

### P6 — Store removal or policy notice
1. Read the notice. Don't argue in anger. Note the deadline.
2. Fix the specific item (often data safety mismatch, a broken privacy URL, or target-API deadlines).
3. Reply through the console / Resolution Center. Appeal if it was a misclassification.

### P7 — Privacy or data incident
- The app holds no user data today, so an incident most likely involves a third-party SDK (analytics/Sentry) collecting more than declared.
- Disable the SDK via remote kill-switch or release. Assess notification duties (state breach laws, GDPR 72 h if EU data). Involve legal.

## 5. Useful commands and links

```bash
# Web rollback (Cloudflare)
npx wrangler deployments list
npx wrangler rollback <deployment-id>

# Rebuild a known-good commit with a higher build number
git checkout v1.1.0 && git tag v1.1.1-hotfix && git push --tags   # triggers release.yml

# Halt Android rollout (fastlane)
bundle exec fastlane supply --track production --release_status halted \
  --version_code <code> --skip_upload_aab true --skip_upload_metadata true \
  --skip_upload_images true --skip_upload_screenshots true
# (or Play Console → Production → Halt rollout)
```

Dashboards: Sentry project `the-slice` · Better Stack monitors · Play Console → Android vitals · App Store Connect → Metrics / TestFlight crashes · Cloudflare/Vercel analytics.

## 6. Incident doc template

```markdown
# INC-YYYYMMDD-N: <title>
Sev: | Commander: | Started: | Detected by: | Resolved:
## Impact (who/what/how many)
## Timeline (UTC/ET)
## Root cause
## Mitigation & fix
## What went well / poorly
## Action items (owner, due)
```
