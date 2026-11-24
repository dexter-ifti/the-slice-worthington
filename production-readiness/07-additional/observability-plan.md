# Observability Plan

> Today: **no observability at all.** No crash reporting, no analytics, no uptime monitoring. Errors only reach `console.error` (`src/routes/__root.tsx:40`, `src/server.ts:31,54`, `src/start.ts:12`). This plan adds the minimum viable stack for a content app with a critical external hand-off.

## 1. What matters for this app

The user journey that earns money is: **open app → tap "Book a Bay" → Whoosh opens → (booking in Whoosh)**. We can't observe the booking inside Whoosh, so we instrument up to the hand-off, plus app health and dependency availability.

## 2. Signals

### 2.1 Metrics

| Category | Metric | Source |
|---|---|---|
| Stability | Crash-free sessions / users (per platform, per release) | Sentry release health, Play vitals, App Store Connect |
| Stability | ANR rate, user-perceived crash rate (Android) | Play Console vitals |
| Stability | JS error rate (errors per session) | Sentry |
| Performance | Cold start → first contentful paint (native) | Sentry performance (app start) |
| Performance | Web LCP, INP, CLS (p75) | Sentry browser tracing or the hosting provider's Web Analytics |
| Availability | Web uptime (`/`, `/about`), TLS expiry | Better Stack / UptimeRobot |
| Dependencies | `WHOOSH_BOOKING_URL` HTTP 200 + body contains "the-slice"; hero video URL 200; memberships URL 200 | Synthetic checks (5-min interval) |
| Product | `book_a_bay_tap` (with `source`: home \| sticky \| menu), `external_link_open{host}`, `call_tap`, `directions_tap`, `party_inquiry_tap`, `membership_tap`, `offline_shown`, `screen_view` | Analytics (PostHog / Firebase) |
| Product | `browser_finished` after Whoosh (proxy for return-to-app) | `@capacitor/browser` `browserFinished` listener |
| Store | Rating, review volume, installs/uninstalls | Consoles (weekly) |

### 2.2 Logs
- Web server: hosting logs (Workers Logs / Vercel). `src/lib/error-capture.ts` already expands error causes. Ship them to Sentry via its server SDK. Retention 7–30 days.
- Client: **no remote log shipping** beyond Sentry breadcrumbs. Release builds drop `console.log/info/debug`.
- PII rules: no IPs stored (Sentry "Prevent storing of IP addresses" on), no URL query strings in breadcrumbs, `sendDefaultPii: false`.

### 2.3 Traces
- `tracesSampleRate: 0.1` in production (1.0 in staging). Navigation spans per route. Not much else is worth tracing (no API).

## 3. SLOs

| SLO | Target | Window | Error budget |
|---|---|---|---|
| **Crash-free sessions** (each platform) | ≥ 99.5 % | 28 days rolling | 0.5 % of sessions |
| **Web availability** (`app.` home returns 2xx) | ≥ 99.9 % | 30 days | ~43 min/month |
| **Booking hand-off success**: `book_a_bay_tap` followed by a successful `Browser.open` / `window.open` with no error | ≥ 99.5 % | 28 days | |
| **Whoosh reachability** (synthetic, informational; third-party, not ours) | ≥ 99.5 % | 30 days | Used to attribute incidents, not as our SLO |
| **Web LCP p75 (mobile)** | ≤ 2.5 s | 28 days | |
| **Native cold start p75** | ≤ 2.0 s | 28 days | |

**Error-budget policy:** if crash-free sessions drop below target for a release, pause rollouts of new features and prioritise stability work until recovered.

## 4. Alerts

| Alert | Condition | Severity | Route |
|---|---|---|---|
| New crash in release | Sentry: new issue affecting ≥ 10 users in 1 h on a production release | Sev-2 | Slack `#slice-alerts` + email on-call |
| Crash-free drop | Crash-free sessions < 99 % over 6 h | Sev-1 | Slack + phone/SMS on-call |
| Web down | 2 consecutive failed checks from 2 regions | Sev-1 | Slack + phone/SMS |
| Whoosh URL failing | 3 consecutive failures (15 min) | Sev-2 | Slack + email owner/GM (so staff can take phone bookings) |
| Media URL failing | Hero video / about images 404 for 30 min | Sev-3 | Slack |
| TLS expiry | < 14 days | Sev-3 | Email |
| Play vitals | Bad-behaviour threshold warnings (crash > 1.09 %, ANR > 0.47 %) | Sev-2 | Console email → on-call |
| Error-rate spike (web) | 5xx > 1 % for 10 min | Sev-2 | Slack |

Alerts must be **actionable**: each links to the runbook playbook (`incident-response-runbook.md` §4).

## 5. Dashboards

1. **Release health:** crash-free sessions/users by release and platform, adoption %, top new issues.
2. **Funnel:** app opens → `book_a_bay_tap` → `browser_finished`, split by platform and source. Call, directions and party taps.
3. **Dependencies:** uptime for web, Whoosh, CDN media, TLS.
4. **Web vitals:** LCP/INP/CLS p75 per route.

Reviewed daily during hypercare, then weekly (15 min, eng + owner).

## 6. Implementation steps (maps to E8 in `../04-implementation-plan.md`)

1. Create a Sentry org/project owned by The Slice. Environments: `staging`, `production`.
2. Install `@sentry/capacitor` + `@sentry/react`. Initialise in `src/routes/__root.tsx` (client only) with `release = "the-slice@" + version + "+" + build`. Wrap `ErrorComponent` to `captureException`.
3. Server: wrap `src/server.ts` fetch with Sentry's server SDK (or keep `error-capture.ts` and forward).
4. CI: upload source maps (web), the ProGuard mapping (Android) and dSYMs (iOS) per release.
5. Analytics: per the ADR. Add a typed `track(event, props)` wrapper in `src/lib/analytics.ts` with a no-op when `VITE_ANALYTICS_KEY` is empty or the user opted out.
6. Better Stack/UptimeRobot monitors for the URLs above.
7. Update the privacy policy and store privacy declarations **before** shipping the build with these SDKs.
