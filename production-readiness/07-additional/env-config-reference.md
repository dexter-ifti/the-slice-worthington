# Environment Variables & Config Reference

## Current state (verified)

- The app reads **no environment variables at runtime**. There is no `import.meta.env.*` or `process.env.*` in `src/`. All configuration is hardcoded:
  - URLs and the address: `src/lib/links.ts`
  - Native app config: `capacitor.config.ts`
  - Android signing: **hardcoded** in `android/app/build.gradle:19-26` (must change; see S-01)
- CI uses one secret and one variable: `APPETIZE_API_TOKEN` (secret), `APPETIZE_PUBLIC_KEY` (repo variable) (`.github/workflows/ios-simulator.yml:18,74-75`).
- `.gitignore` already ignores `*.local` and `.dev.vars` (Wrangler).

## Rules

1. **`VITE_*` variables are public.** Vite inlines them into the client bundle, and therefore into the APK/IPA. Only put values there that are safe to publish (Sentry DSN, analytics public key, site URL).
2. Server-only secrets (future server functions) go in hosting secrets (`wrangler secret put` / Vercel env), never with a `VITE_` prefix.
3. Build and signing secrets live **only** in GitHub Environments (`staging`, `production`) and the org password manager.
4. Native builds bake the web env in at `npm run build` time. Build per environment (staging → TestFlight internal / Play internal, production → stores).

## Variable reference

| Variable | Scope | Secret? | Used by | Example / notes |
|---|---|---|---|---|
| `VITE_APP_ENV` | Client | No | Sentry environment, analytics, banner on staging | `development` \| `preview` \| `staging` \| `production` |
| `VITE_SITE_URL` | Client/SSR | No | Canonical URLs, `og:url`, deep-link domain | `https://app.thesliceworthington.com` |
| `VITE_SENTRY_DSN` | Client | No (public by design) | `@sentry/react`, `@sentry/capacitor` | `https://xxx@o0.ingest.sentry.io/0` |
| `VITE_ANALYTICS_KEY` | Client | No | PostHog/Plausible | Public project key |
| `VITE_ANALYTICS_HOST` | Client | No | PostHog host | `https://us.i.posthog.com` |
| `VITE_REMOTE_CONFIG_URL` | Client | No | Remote content/config (roadmap) | `https://app.thesliceworthington.com/config.json` |
| `SENTRY_AUTH_TOKEN` | CI | **Yes** | Source map / dSYM / mapping upload | Org token, `project:releases` scope |
| `SENTRY_ORG`, `SENTRY_PROJECT` | CI | No | Sentry CLI | |
| `CLOUDFLARE_API_TOKEN` | CI | **Yes** | `wrangler deploy` | Scoped to Workers for this account |
| `CLOUDFLARE_ACCOUNT_ID` | CI | No | `wrangler deploy` | |
| `ANDROID_KEYSTORE_BASE64` | CI | **Yes** | Decoded to a temp file for `bundleRelease` | `base64 -w0 slice-upload.jks` |
| `ANDROID_KEYSTORE_PATH` | CI/local | No | Gradle signing config | Temp path in CI. Local path for release builders. |
| `ANDROID_KEYSTORE_PASSWORD` | CI | **Yes** | Gradle signing config | |
| `ANDROID_KEY_ALIAS` | CI | No* | Gradle signing config | `upload` |
| `ANDROID_KEY_PASSWORD` | CI | **Yes** | Gradle signing config | |
| `PLAY_SERVICE_ACCOUNT_JSON` | CI | **Yes** | fastlane `supply` | Google Cloud service account key JSON |
| `ASC_KEY_ID` | CI | No* | fastlane / `xcodebuild` auth | App Store Connect API key ID |
| `ASC_ISSUER_ID` | CI | No* | same | |
| `ASC_KEY_P8_BASE64` | CI | **Yes** | same | Base64 of `AuthKey_XXXX.p8` |
| `MATCH_PASSWORD` | CI | **Yes** | fastlane `match` decryption | |
| `MATCH_GIT_URL` / `MATCH_GIT_BASIC_AUTHORIZATION` | CI | **Yes** | fastlane `match` storage | Private certs repo |
| `APPETIZE_API_TOKEN` | CI | **Yes** | iOS Simulator preview upload (existing) | |
| `APPETIZE_PUBLIC_KEY` | CI (variable) | No | existing | |

\* Not secret on its own, but keep it with its secret counterpart.

Local developers use `.env.local` (git-ignored). Release signing configs can also live in `~/.gradle/gradle.properties` as `SLICE_UPLOAD_*` (see `03-security-checklist.md` §3).

## Non-env configuration worth centralising

| Config | Today | Recommended |
|---|---|---|
| External URLs | `src/lib/links.ts` constants | Keep the constants as defaults plus an allowlist. Optionally override from remote config (post-launch). |
| Venue info (hours, phone, address) | Address string only (`links.ts:12`). No hours or phone. | `src/lib/venue.ts` typed object (feeds the Visit screen, JSON-LD `LocalBusiness`, store listing) |
| Theme colours | `src/styles.css` tokens, `capacitor.config.ts` (`#000000`), `manifest.webmanifest`/`__root.tsx` (`#ffffff`) | One source of truth. Align `theme-color` with the status bar. |
| App version | `android/app/build.gradle:10-11` hardcoded. iOS not committed. | Derived from the git tag in CI |

See [`env.example`](./env.example) for a copy-ready template.
