# 03 — Security Checklist

> Scope: web app (TanStack Start on Vercel), Capacitor Android app (`android/`), Capacitor iOS app (`ios/`), CI/CD (`.github/workflows/`).
> Mapped to **OWASP Top 10 (2021)** (`A0x`) and **OWASP MASVS v2** (`MASVS-STORAGE/CRYPTO/AUTH/NETWORK/PLATFORM/CODE/RESILIENCE/PRIVACY`).
> Priority: 🔴 **Critical** · 🟠 **High** · 🟡 **Medium** · 🟢 **Low**. A ticked box `[x]` marks a control supplied by the current repository or hosting platform.

### Threat-model context

The app has **no authentication, no backend API, no user data storage and no payments**. Its assets worth protecting are:
1. **App-signing identity** (Android keystore, iOS certificates). Whoever has them can ship malicious updates under The Slice's name.
2. **Integrity of the booking hand-off.** Users must reliably reach the genuine Whoosh page, not a phishing page.
3. **CI/CD and store-console accounts** (supply chain).
4. **User privacy** with respect to third-party calls (Google Fonts, Webflow CDN, analytics added later).

That's why the most severe findings below concern signing and the supply chain, not classic web vulnerabilities.

---

## Remediation status

The finding descriptions below record the original repository review. The current code removes the public debug APK and hardcoded signing configuration, builds a signed Play bundle from the GitHub production environment, and includes its checksum and SBOM in the workflow artifact. It also adds the web and native security controls, the checked-in iOS project, and the CI and dependency controls described below.

The release owner still needs to rotate the upload key and register its certificate, configure Play App Signing and internal testing, and set up the protected GitHub environments and branch rules for the release repository. Organization ownership, console access and 2FA are account settings. The old credentials and APK may still exist in Git history. The Android release workflow requires fresh credentials, and the old key should be treated as compromised. [Release setup](../README.md#android-release-signing)

Preview and staging builds set `X-Robots-Tag: noindex`, including on custom staging domains. Vercel also sets it automatically on standard preview URLs. Confirm the production response headers after deploying, and submit the custom hostname for HSTS preload if the domain owner wants browser preload coverage. [Vercel response headers](https://vercel.com/docs/headers/response-headers)

The app validates incoming paths for the intended production hostname. Enable verified platform link associations when deep linking is launched. Review the privacy disclosures, SDK privacy report, export declaration and signing for the first iOS store release. Sentry and its data-scrubbing rules apply if telemetry is enabled.

---

## 1. Findings from the repo (fix list)

| ID | Pri | Finding | File / line | OWASP / MASVS | Suggested fix |
|---|---|---|---|---|---|
| S-01 | 🔴 | **Keystore passwords hardcoded and pushed to git:** `storePassword '[redacted]'`, `keyPassword '[redacted]'`, alias `slicekey` | `android/app/build.gradle:19-26` | A02, A05 · MASVS-CODE | ① Generate a **new** upload keystore (never reuse this one). ② Read credentials from env/`~/.gradle/gradle.properties` (snippet below). ③ Enrol in **Play App Signing** so Google holds the app-signing key. ④ Store the keystore base64 plus passwords as GitHub **Environment** secrets (prod environment with required reviewers). ⑤ Optionally purge from history with `git filter-repo`. Rotation is the real fix, because history is already pushed. |
| S-02 | 🔴 | **Debug-signed, debuggable APK publicly distributed** from `main` via the README (`README.md:6,15`). Any debug-keystore holder can sign a "compatible" update, and `android:debuggable=true` allows `run-as` data access and JDWP attach. | `.github/workflows/android-apk.yml:37-39,55-62`, `apk/The-Slice-v1.0.0.apk` | MASVS-RESILIENCE, MASVS-CODE | Stop publishing debug APKs. Distribute via Play internal testing. Remove the `apk/` dir and README links once Play internal testing exists. If sideloading is still needed, publish **release-signed** APKs as GitHub Release assets with SHA-256 checksums. |
| S-03 | 🟠 | CI workflow has `permissions: contents: write` and **pushes directly to `main`**. Actions are pinned by mutable tags (`@v6`, `@v4`, third-party `appetizeio/github-action-appetize@v1.1.0`). | `android-apk.yml:6-7,59-62`, `ios-simulator.yml:72` | A08 (software & data integrity) | Use `contents: read` by default. Never let CI commit binaries. **Pin all actions to full commit SHAs** (Renovate can keep them current). Enable branch protection (required reviews and status checks) on `main`. |
| S-04 | 🟠 | No Content-Security-Policy or security headers on the web deployment | `vercel.json` (no `headers`) | A05 | Add headers (snippet below): CSP, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`. For Capacitor, set a CSP `<meta>` in the shell (`__root.tsx` head) that allows `capacitor://localhost` / `https://localhost`. |
| S-05 | 🟠 | `android:allowBackup="true"` with no backup rules | `android/app/src/main/AndroidManifest.xml:5` | MASVS-STORAGE | The app stores almost nothing (one `localStorage` flag), but set `allowBackup="false"`, or add `dataExtractionRules` / `fullBackupContent` to exclude WebView storage, before any tokens or PII are introduced (accounts/push are on the roadmap). |
| S-06 | 🟠 | iOS project isn't committed, so ATS, the privacy manifest, URL schemes and entitlements can't be reviewed or controlled | `ios-simulator.yml:36-42` | MASVS-PLATFORM, MASVS-PRIVACY | Commit `ios/`. Verify there are no `NSAllowsArbitraryLoads` exceptions. Add `PrivacyInfo.xcprivacy`. Set `ITSAppUsesNonExemptEncryption=false`. |
| S-07 | 🟡 | `FileProvider` declared with `<external-path path=".">` (entire external storage) and `<cache-path path=".">`, although the app never shares files | `AndroidManifest.xml:27-35`, `res/xml/file_paths.xml:3-4` | MASVS-PLATFORM | Remove the provider (it's Capacitor template boilerplate) or restrict it to a specific subdirectory. |
| S-08 | 🟡 | `appUrlOpen` handler routes **any** incoming URL path into the router without validation. No scheme or App Links are configured yet, so it can't currently be triggered externally, but it will be once deep links are added. | `src/lib/platform.ts:54-63` | MASVS-PLATFORM | When adding deep links, use **verified** Android App Links (`assetlinks.json`) and iOS Universal Links (`apple-app-site-association`). Allowlist known route paths (`/`, `/about`, `/events`…) before `router.history.push`. |
| S-09 | 🟡 | `openExternalUrl` accepts any URL with no allowlist. `BrandCta` opens any `http(s)` href. All callers pass constants today. | `src/lib/platform.ts:17-34`, `src/components/brand-cta.tsx:26` | MASVS-PLATFORM, A01 | Put an allowlist of hosts (`app.whoosh.io`, `www.thesliceworthington.com`, `instagram.com`, `maps.app.goo.gl`, `maps.apple.com`) in `links.ts`. Reject everything else. This matters once URLs come from remote config or a CMS. |
| S-10 | 🟡 | Third-party runtime requests send user IP and user agent to Google (Fonts) and Webflow CDN with no disclosure | `src/routes/__root.tsx:93-98`, `src/lib/links.ts:3-6`, `about.tsx:6-12` | MASVS-PRIVACY | Self-host Montserrat (`@fontsource/montserrat`) and bundle images. Disclose any remaining third parties in the privacy policy. (Several EU courts have ruled remote Google Fonts a GDPR breach. That's relevant if EU users are in scope.) |
| S-11 | 🟡 | Service worker registered in the native WebView and caches indefinitely. Cache name never rotates, so a compromised or broken asset can persist. | `public/sw.js:1,63-76`, `pwa-register.tsx:8` | MASVS-CODE | Don't register on native. Version the cache name per build. Cap entries. Only cache same-origin `response.ok && response.type === "basic"`. |
| S-12 | 🟡 | Dependency vulnerabilities: 31 advisories (1 critical, 17 high), mostly build tooling. `seroval` (moderate) ships in SSR. `zod` (high) is unused. | `npm audit` | A06 · MASVS-CODE | See `01-repo-analysis.md` §5. Gate CI on `npm audit --omit=dev --audit-level=high`. Add Dependabot/Renovate plus GitHub dependency review. |
| S-13 | 🟡 | `minifyEnabled false` on release. No R8/ProGuard shrinking. | `android/app/build.gradle:29` | MASVS-RESILIENCE | Enable `minifyEnabled true` and `shrinkResources true`, and test (Capacitor ships consumer ProGuard rules). The gain is mostly size. Resilience gain is minor because the logic is in JS. |
| S-14 | 🟢 | `console.error` is globally monkey-patched to expand full stacks and `cause` chains (server-side only). Fine for server logs, but make sure no request data is logged once server functions exist. | `src/lib/error-capture.ts:55-63` | A09 | Keep it server-only. When Sentry is added, use its integration instead and scrub PII (`beforeSend`). |
| S-15 | 🟢 | Client `ErrorComponent` logs the raw error to the console, which on device ends up in logcat / the Xcode console | `src/routes/__root.tsx:40` | MASVS-STORAGE (logs) | Acceptable (no PII exists). Route to Sentry in production and silence console in release builds. |
| S-16 | 🟢 | CSRF middleware is configured but there are no server functions | `src/start.ts:23-28` | A01 | Keep it as is (good default for the future). |
| S-17 | 🟢 | `localStorage` stores only `slice-install-dismissed` | `src/routes/index.tsx:41,45` | MASVS-STORAGE | OK. Rule for later: **never** put tokens or PII in `localStorage`/`Preferences`. Use iOS Keychain / Android Keystore (e.g., `capacitor-secure-storage`). |
| S-18 | 🟢 | Repo is on a personal GitHub account with two remotes. Store and CI secrets would be owned by an individual. | `git remote -v` | Governance | Transfer to an org. Enforce 2FA and least-privilege access. |

---

## 2. Full checklist by domain

### 2.1 Authentication and session handling (A07, MASVS-AUTH)
- [x] 🟢 No in-app authentication. Whoosh handles patron login in the system browser (`@capacitor/browser`), so the app never sees credentials. *(Keep it this way. Don't embed Whoosh in the WebView.)*
- [ ] 🟡 If accounts are added later: use OAuth 2.0 / OIDC with PKCE via the system browser (ASWebAuthenticationSession / Custom Tabs). Store tokens in Keychain/Keystore. Use short-lived access tokens with refresh rotation. Provide **in-app account deletion** (Apple 5.1.1(v) and Google Play policy).
- [ ] 🟠 Developer consoles (Apple, Google, GitHub, hosting, Sentry): org-owned, **2FA enforced**, ≥ 2 admins, no shared logins.

### 2.2 Secrets management (A02, A05)
- [ ] 🔴 S-01 Rotate the Android upload key. Remove hardcoded passwords.
- [ ] 🔴 Enrol in Play App Signing (mandatory for new apps using AAB).
- [ ] 🟠 iOS signing: App Store Connect API key (`.p8`) for CI, distribution cert via fastlane `match` (encrypted git or Google Cloud Storage) or Xcode Cloud-managed signing.
- [ ] 🟠 All CI secrets in **GitHub Environments** (`staging`, `production`) with required reviewers on `production`.
- [x] 🟡 Add **gitleaks** (or GitHub secret scanning + push protection) to CI and pre-commit.
- [x] 🟢 `.gitignore` excludes `android/app/release-key.jks`, `.dev.vars`, `*.local` (`.gitignore:17,21,35`).
- [x] 🟢 Add `*.jks`, `*.keystore`, `*.p12`, `*.p8`, `*.mobileprovision`, `google-services.json` (if push is added), `GoogleService-Info.plist`, `DOCS_RON/` to `.gitignore`.
- [x] 🟢 Rule: anything prefixed `VITE_` is **public** (bundled into JS). Only DSNs and public keys go there.

### 2.3 API security (A01, A04, A10)
- [x] 🟢 No first-party API. No server functions.
- [ ] 🟡 Keep the CSRF middleware (`src/start.ts`) when adding server functions. Add input validation (zod/valibot) **at the server boundary**, plus rate limiting (Cloudflare WAF rules / Turnstile on forms).
- [ ] 🟡 If a Whoosh API integration is added: proxy it through a server function and keep API keys server-side only. Never ship them in the bundle.

### 2.4 Input validation and output encoding (A03)
- [x] 🟢 No user input exists in the app (no forms). Contact goes to the external site. React escapes output by default. There's no `dangerouslySetInnerHTML` in app code (`src/components/ui/chart.tsx` uses it but is unused, so delete it under C-8).
- [x] 🟡 S-08/S-09: validate deep-link paths and external URLs against allowlists.

### 2.5 Data encryption in transit (MASVS-NETWORK)
- [x] 🟢 All URLs in `src/lib/links.ts` are `https://`. Android uses `androidScheme: "https"` (`capacitor.config.ts:7-9`).
- [ ] 🟠 HSTS with `includeSubDomains; preload` on `app.thesliceworthington.com`.
- [x] 🟡 Android: add `res/xml/network_security_config.xml` with `cleartextTrafficPermitted="false"` (the default for API 28+, but make it explicit) and reference it in the manifest.
- [x] 🟡 iOS: confirm there are no ATS exceptions in `Info.plist`.
- [ ] 🟢 **Certificate pinning: not recommended for this app.** There is no first-party API to pin. Pinning third-party hosts (Whoosh, Webflow, Google) would break on their certificate rotations and risk a full outage. Revisit only if a first-party API with sensitive data is added, and then pin to the **SPKI of your own intermediate/leaf with a backup pin**.

### 2.6 Data encryption at rest / secure storage on device (MASVS-STORAGE, MASVS-CRYPTO)
- [x] 🟢 No sensitive data at rest (one UI flag in `localStorage`).
- [x] 🟠 S-05 `allowBackup` hardening.
- [ ] 🟡 Policy for the future: tokens and PII go in Keychain (`kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly`) / Android Keystore-backed EncryptedSharedPreferences. Never `localStorage` or `@capacitor/preferences`.
- [ ] 🟢 Make sure WebView caches don't hold sensitive pages. They don't today, because Whoosh opens in the system browser, not the WebView.

### 2.7 Platform interaction and permissions (MASVS-PLATFORM)
- [x] 🟢 `INTERNET` is the only Android system permission requested. AndroidX adds an app-scoped signature permission for its internal receivers.
- [x] 🟡 S-07 Remove or narrow the unused `FileProvider`.
- [x] 🟡 `MainActivity` is the only exported Android component. The AndroidX profiling receiver is removed from the merged manifest.
- [ ] 🟡 When adding push (`POST_NOTIFICATIONS`, Android 13+) or location ("near me"), request the permission **in context**, with a pre-prompt and a purpose string (`NSLocationWhenInUseUsageDescription`). Don't request at launch.
- [x] 🟢 WebView: confirm `WebView.setWebContentsDebuggingEnabled` is **off** in release (Capacitor disables it by default for release builds unless `webContentsDebuggingEnabled: true`). Verify that `capacitor.config.ts` never sets it.
- [ ] 🟢 Screenshots/backgrounding: no sensitive screens, so `FLAG_SECURE` isn't needed.

### 2.8 Logging of sensitive data (A09, MASVS-STORAGE)
- [x] 🟢 No PII exists to log.
- [ ] 🟡 S-14/S-15: production logging goes through Sentry with `sendDefaultPii: false`, IP scrubbing and a `beforeBreadcrumb` URL scrubber (Whoosh URLs may carry booking IDs if they're ever deep-linked).
- [ ] 🟢 Strip `console.*` in production builds (esbuild/rolldown `drop: ['console']` or a Vite define), keeping `console.error` for Sentry.

### 2.9 Code quality and supply chain (A06, A08, MASVS-CODE)
- [ ] 🟠 S-03 Pin Actions to SHAs. Use `contents: read`. Add branch protection.
- [x] 🟠 S-12 Audit gate plus Renovate/Dependabot (grouped weekly, `minimumReleaseAge: "3 days"`).
- [x] 🟡 One lockfile (`package-lock.json`). Use `npm ci` in CI (already done).
- [ ] 🟡 Generate an SBOM per release (`npm sbom --sbom-format cyclonedx`), attached to the GitHub Release.
- [ ] 🟡 Enable GitHub **CodeQL** (JavaScript/TypeScript, Java/Kotlin) on PRs.
- [x] 🟢 Remove unused packages (C-8). Every removed dependency is attack surface eliminated.

### 2.10 Resilience (MASVS-RESILIENCE)
- [ ] 🟡 Ship **release** builds only (`debuggable=false`).
- [ ] 🟢 Root/jailbreak detection, anti-tamper and obfuscation: **not warranted**, because the app holds no secrets or value. Document this decision in an ADR so auditors see it was deliberate.
- [ ] 🟢 Play Integrity / App Attest: not needed until a first-party API exists.

### 2.11 Web-specific (OWASP Top 10)
- [x] 🟠 S-04 Security headers and CSP.
- [x] 🟡 Vercel preview and staging builds set `X-Robots-Tag: noindex`.
- [ ] 🟡 Error pages (`src/lib/error-page.ts`) leak no stack traces to the client. ✔ Verified: the generic message only.
- [ ] 🟢 SRI isn't feasible for Google Fonts CSS. Self-hosting (S-10) removes the need.

### 2.12 Privacy (MASVS-PRIVACY)
- [x] 🟠 Privacy policy covers local storage, Vercel, external booking and navigation services, and how to make a data-rights request. Update it if telemetry is added.
- [x] 🟠 iOS `PrivacyInfo.xcprivacy` is included in the app target. Update the declarations when adding SDKs, required-reason APIs or telemetry.
- [ ] 🟡 No ATT prompt needed **as long as no cross-app tracking SDKs (ads, Meta SDK) are added**. Keep analytics first-party and non-tracking.
- [ ] 🟡 Data minimisation for analytics: no user IDs, no IP storage, opt-out toggle in a settings/about screen.

---

## 3. Reference snippets

**Gradle signing from the environment** (replaces `android/app/build.gradle:19-26`):

```groovy
signingConfigs {
    release {
        def ks = System.getenv("ANDROID_KEYSTORE_PATH") ?: project.findProperty("SLICE_UPLOAD_STORE_FILE")
        if (ks) {
            storeFile file(ks)
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD") ?: project.findProperty("SLICE_UPLOAD_STORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: project.findProperty("SLICE_UPLOAD_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: project.findProperty("SLICE_UPLOAD_KEY_PASSWORD")
        }
    }
}
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        signingConfig signingConfigs.release
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**Web security headers** (Cloudflare `_headers` / Workers response, or `vercel.json` `headers`). This is a starting CSP to tighten after self-hosting fonts:

```text
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.prod.website-files.com; media-src https://cdn.prod.website-files.com; font-src 'self'; connect-src 'self' https://*.ingest.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

*(`'unsafe-inline'` for scripts is needed because TanStack Start emits inline hydration scripts. Move to nonces when TanStack Start's nonce support is configured.)*

**Android network security config** (`android/app/src/main/res/xml/network_security_config.xml`):

```xml
<network-security-config>
  <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```
