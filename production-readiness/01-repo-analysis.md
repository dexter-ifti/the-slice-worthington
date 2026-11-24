# 01 — Repository Analysis

> Snapshot: `main` @ `6e4dee7` ("copy: update homepage strapline"), analysed 2026-11-18.
> Everything below was verified by reading the source and running `tsc`, `eslint`, `vitest`, `npm audit` and `npm outdated` locally unless marked **[UNVERIFIED]**.

---

## 1. What the product is

**The Slice — Worthington** is a branded mobile and web front door for a golf-simulator and multisport venue (5 bays) at 121 W. Wilson Bridge Rd, Worthington, OH. It is a **content plus deep-link app**:

- The main action is **"Book a Bay"**, which opens the third-party **Whoosh** booking agenda (`WHOOSH_BOOKING_URL`, `src/lib/links.ts:1-2`).
- Memberships, the contact form, maps, Instagram and the main website are all **external links** (`src/lib/links.ts:7-12`).
- There is **no backend, no database, no user accounts, no authentication, no payments and no server functions**. This was a deliberate scope decision (`REQUIREMENTS.md`, `PROJECT_ESTIMATE.md:171`).

This shapes the whole production plan. The security surface is small. **The main launch risks are app-store policy, release engineering, content accuracy and operations, not application security.**

---

## 2. Tech stack

| Layer | Technology | Version (installed) | Where |
|---|---|---|---|
| UI | React | 19.3.0 | `package.json` |
| Meta-framework | TanStack Start (SSR + prerender) | 1.168.60 (pinned) | `vite.config.ts:14-20` |
| Routing | TanStack Router, file-based | 1.170.41 (pinned) | `src/routes/*`, `src/routeTree.gen.ts` |
| Server runtime | Nitro (beta) on Vercel | `3.0.260603-beta` | `vite.config.ts:21`, `vercel.json` |
| Bundler | Vite 8 + rolldown override | 8.1.5 / rolldown 1.2.1 | `package.json` `overrides` |
| Styling | Tailwind CSS v4, shadcn/ui ("new-york"), tw-animate-css | 4.3.3 | `src/styles.css`, `components.json` |
| Data fetching | TanStack Query (**provisioned, unused**) | 5.104.2 | `src/router.tsx:6`, `src/routes/__root.tsx:132` |
| Native shell | Capacitor (app, browser, splash-screen, status-bar) | 8.5.3 | `capacitor.config.ts`, `src/lib/platform.ts` |
| Android | AGP 8.13.0, Gradle 8.13, Java 21, minSdk 24, target/compile 36 | — | `android/` |
| iOS | Generated in CI with SPM (`npx cap add ios`), **not committed** | — | `.github/workflows/ios-simulator.yml:36-42` |
| PWA | Hand-written service worker + manifest | — | `public/sw.js`, `public/manifest.webmanifest` |
| Tests | Vitest 4 + jsdom 20 + Testing Library | 4.1.11 | `vitest.config.ts`, `src/test/*` |
| Lint/format | ESLint 9 flat config, typescript-eslint, Prettier | 9.39.5 | `eslint.config.js`, `.prettierrc` |
| CI | GitHub Actions (Android debug APK, iOS Simulator → Appetize) | — | `.github/workflows/*` |
| Hosting (web) | Vercel (currently `thesliceworthington.vercel.app`) | — | `vercel.json`, `README.md:5` |

---

## 3. Architecture

### 3.1 Folder structure

```text
src/
  routes/            File-based routes: index, about, contact, events, memberships, simulators, __root
  components/        brand-cta.tsx, page-shell.tsx, site-header.tsx, pwa-register.tsx
  components/ui/     46 shadcn/ui primitives. NONE are imported by app code (verified by grep)
  lib/               links.ts (all "data"), platform.ts (Capacitor bridge), error-capture.ts, error-page.ts, utils.ts
  hooks/             use-mobile.tsx (unused)
  server.ts          Custom SSR entry that wraps the TanStack handler and normalises h3 500s
  start.ts           Request middleware: error → HTML page; CSRF for server functions
  router.tsx         Router factory (creates an unused QueryClient)
  test/              2 test files, 4 tests
public/              sw.js, manifest, icons, robots.txt
android/             Capacitor Android project (committed)
assets/              Capacitor icon/splash sources (used by `cap:assets:ios`)
apk/                 The-Slice-v1.0.0.apk: debug-signed APK committed to git by CI
scripts/             generate-android-icons.ps1 (Windows-only, hardcoded absolute paths)
```

### 3.2 Runtime topology

```text
                ┌──────────────────────── Web (browser / PWA) ────────────────────────┐
 User ──HTTPS──►│ Vercel → Nitro → src/server.ts → TanStack Start SSR (prerendered)   │
                │   └─ public/sw.js (network-first for pages, cache-first for assets) │
                └─────────────────────────────────────────────────────────────────────┘
                ┌──────────────────── Native (Android / iOS) ─────────────────────────┐
 User ─────────►│ Capacitor WebView loads the bundled `.output/public` (static,       │
                │ prerendered HTML+JS). No server involved.                           │
                │   └─ src/lib/platform.ts → @capacitor/browser for external links    │
                └─────────────────────────────────────────────────────────────────────┘
 Third parties loaded at runtime (both targets):
   • fonts.googleapis.com / fonts.gstatic.com   (Montserrat, src/routes/__root.tsx:93-98)
   • cdn.prod.website-files.com (Webflow CDN)   (hero video, about/simulator images)
   • app.whoosh.io                               (booking, opened in in-app browser / new tab)
   • thesliceworthington.com, instagram.com, maps.app.goo.gl
```

Key point: **the native app does not use SSR at all.** `capacitor.config.ts:6` sets `webDir: ".output/public"`, which is the prerendered static output (`vite.config.ts:16-19`, `crawlLinks: true`). `src/server.ts` and `src/start.ts` only run on Vercel.

### 3.3 Key modules

| Module | Responsibility | Notes |
|---|---|---|
| `src/lib/links.ts` | Single source of truth for every external URL and the address | Hardcoded. Content changes need an app release (no CMS or remote config). |
| `src/lib/platform.ts` | Capacitor bridge: platform detection, `openExternalUrl` (in-app browser), Android back button, `appUrlOpen` deep-link handler, status bar/splash | Deep-link listener exists but **no URL scheme or App Links are configured**. |
| `src/components/brand-cta.tsx` | Primary CTA. Intercepts `http(s)` hrefs on native and routes them to `Browser.open` | Good pattern. Other pages duplicate this logic inline (see §5). |
| `src/components/page-shell.tsx` | Interior-page layout plus sticky "Book a Bay" bar | |
| `src/components/site-header.tsx` | Logo and full-screen menu overlay | Accessibility gaps (§5). |
| `src/server.ts`, `src/lib/error-capture.ts` | SSR crash safety net. Patches `console.error` globally to keep stack traces. | Server-only (imported by `server.ts`). |
| `src/start.ts` | Error middleware and `createCsrfMiddleware` for server functions | There are **no server functions**, so CSRF is currently inert. |
| `public/sw.js` | Offline shell and runtime caching | Static `CACHE_VERSION`, unbounded cache, also registers inside the native WebView. |

### 3.4 Data flow, auth, state

- **Auth flow:** none. No sessions, cookies, tokens or user identity. Whoosh handles patron accounts and payment in its own domain.
- **API/data layer:** none. All content is JSX string literals and constants. `@tanstack/react-query` is wired in (`src/router.tsx:6`, `__root.tsx:132`) but no `useQuery` exists.
- **State management:** local `useState` only (menu open, testimonial index, install hint). The only persisted state is `localStorage["slice-install-dismissed"]` (`src/routes/index.tsx:41,45`).
- **Config/secrets:** no `.env`, no `import.meta.env` use and no runtime config. The only secrets are CI-side (`APPETIZE_API_TOKEN`) and the **hardcoded Android keystore passwords** (§4, C-1).

---

## 4. Technical debt, code smells and MVP shortcuts

Priority key: **P0** = blocks store submission or a safe release · **P1** = fix before GA · **P2** = post-launch cleanup.

| # | Priority | Finding | Evidence | Fix |
|---|---|---|---|---|
| C-1 | **P0** | Release keystore passwords committed in plaintext (`slice123`) and pushed to `origin` | `android/app/build.gradle:19-26` | Treat as compromised. Generate a new upload key, load credentials from env/Gradle properties, and enrol in Play App Signing. See `03-security-checklist.md` S-01. |
| C-2 | **P0** | iOS project is not in source control. It is regenerated on every CI run with `npx cap add ios`, so Info.plist, PrivacyInfo, signing, capabilities and the device family can't be configured durably | `.github/workflows/ios-simulator.yml:36-42` | Run `npx cap add ios` once, commit `ios/`, and configure it. |
| C-3 | **P0** | The distributed Android build is a **debug** APK (debuggable, debug-signed), and CI commits the binary to `main` | `android-apk.yml:37-39, 55-62`, `apk/The-Slice-v1.0.0.apk` (6 MB), `.gitignore:36-37` | Release pipeline builds a signed **AAB** and uploads to Play. Remove `apk/` from the repo and use GitHub Releases or Play internal testing. |
| C-4 | **P0** | `versionCode 1` / `versionName "1.0.0"` are hardcoded, and CI always names output `v1.0.0` | `android/app/build.gradle:10-11`, `android-apk.yml:46` | Derive from tag and CI run number (see `06-store-deployment-guide.md` §3). |
| C-5 | **P1** | TypeScript **does not compile**: 3 × TS18048 `'testimonial' is possibly 'undefined'` | `src/routes/about.tsx:173,176,177` (caused by `noUncheckedIndexedAccess`, `tsconfig.json:29`). Vite does not type-check, so the build still "passes". | Add a `typecheck` script plus a CI gate, and narrow the array access. |
| C-6 | **P1** | `npm run lint` (`eslint .`) **didn't finish within 6 minutes** locally. `eslint src` takes ~6 s (0 errors, 6 warnings). The ignore list only has `dist`, `.output`, `.vinxi`, so ESLint also crawls `android/**` (bundled JS in `android/app/src/main/assets/public`, Gradle build output), `apk/` and `.idea/`. | `eslint.config.js:9` | Add `android/**`, `ios/**`, `apk/**`, `build/**`, `coverage/**` to the ignores. |
| C-7 | **P1** | No CI quality gate: no workflow runs lint, typecheck, tests or a web build on PRs | `.github/workflows/` | Add a `ci.yml` (see `04-implementation-plan.md` E3). |
| C-8 | **P1** | 46 unused shadcn/ui components plus their dependencies (all `@radix-ui/*` except slot, `recharts`, `cmdk`, `date-fns`, `react-day-picker`, `embla-carousel-react`, `vaul`, `input-otp`, `react-resizable-panels`, `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner`) plus `src/hooks/use-mobile.tsx` | `grep` finds no imports of `@/components/ui/*` outside `src/components/ui/` | Delete them and re-add per component with `shadcn add` when a feature needs one. This shrinks the audit surface (removes the `zod` high advisory). |
| C-9 | **P1** | Two lockfiles: `bun.lock` and `package-lock.json`. CI uses npm, so the `bunfig.toml` 24 h release-age supply-chain guard never applies. | repo root | Choose one package manager (npm is what CI uses). If npm, enforce `min-release-age` via Renovate `minimumReleaseAge`. |
| C-10 | **P1** | External links are handled with copy-pasted `isNativePlatform() → preventDefault → openExternalUrl` blocks | `site-header.tsx:84-90`, `index.tsx:95-100`, `contact.tsx:30-35`, `events.tsx:57-62` | Extract an `<ExternalLink>` component (mirroring `BrandCta`'s logic). Centralise the URL allowlist. |
| C-11 | **P1** | Runtime dependency on third-party hosts for brand-critical assets: Google Fonts, Webflow CDN video and images. These fail offline and in China/blocked networks, and the app breaks if the marketing site's Webflow assets are renamed. | `__root.tsx:93-98`, `links.ts:3-6`, `about.tsx:6-12`, `simulators.tsx:4-5` | Self-host Montserrat (`@fontsource/montserrat`). Bundle optimised images and poster. Keep the video remote but with a poster fallback. |
| C-12 | **P1** | The service worker registers inside the native WebView as well. It has a static `CACHE_VERSION = "the-slice-v1"` (never bumped), an unbounded runtime cache and cache-first scripts. On the web, `/` can stay stale after deploys. | `public/sw.js:1,63-76`, `src/components/pwa-register.tsx:8` | Skip registration when `isNativePlatform()`. Inject a build hash into the cache name. Cap the runtime cache. Consider `vite-plugin-pwa`/Workbox. |
| C-13 | **P1** | Content is stale or risky: "Opening Fall 2026" (`about.tsx:21`, `events.tsx:53`, `memberships.tsx:28`) is now in the past. **Testimonials are written as pre-opening anticipation** ("We'll be there week one") with named people, which suggests they are illustrative rather than real (`about.tsx:65-86`). | | Owner content sign-off. Remove or replace with verified reviews (FTC fake-review rule, Apple 2.3/5.6). |
| C-14 | **P1** | Accessibility: the menu overlay isn't a dialog (no `role="dialog"`/`aria-modal`, no focus trap, no Esc, no focus return). The testimonial carousel auto-advances every 5 s with no pause, and `aria-live="polite"` announces every rotation (WCAG 2.2.2). | `site-header.tsx:62-117`, `about.tsx:91-97,170` | Use the existing `ui/sheet.tsx` (Radix Dialog) for the menu. Add a pause control and `prefers-reduced-motion` handling, and drop `aria-live` while auto-rotating. |
| C-15 | **P2** | `PROJECT_ESTIMATE.md` is outdated: it says "No `ios/`, `android/`, or Capacitor configuration is currently present" (`:46-57,157`) | | Update it or mark it historical. |
| C-16 | **P2** | `scripts/generate-android-icons.ps1:3-4` hardcodes `d:\the-slice-worthington-main\...` (Windows-only, one developer's machine). This duplicates `@capacitor/assets`. | | Delete it and use `npx capacitor-assets generate --android` (an `npm` script already exists for iOS). |
| C-17 | **P2** | Template leftovers: `com.getcapacitor.myapp.ExampleUnitTest` / `ExampleInstrumentedTest`, `package.json` `"name": "tanstack_start_ts"` with no `version`, unused `google-services` classpath (`android/build.gradle:11`), deprecated `rootProject.buildDir` (`android/build.gradle:28`) | | Rename and clean up. |
| C-18 | **P2** | `HERO_VIDEO_DESKTOP_URL` is defined and tested but never rendered. The home page only uses the mobile source (`index.tsx:70`). | `links.ts:3-4` | Add `<source media>` for desktop or delete the constant. |
| C-19 | **P2** | Meta copy mismatch: `index.tsx:17` says "great **pizza**" while the visible copy (`:87`) says "great **food**". `"™️"` emoji at `index.tsx:108`. | | Content pass. |
| C-20 | **P2** | Lint is relaxed: `@typescript-eslint/no-unused-vars: "off"` (`eslint.config.js:36`), `noUnusedLocals: false` (`tsconfig.json:23`) | | Re-enable after deleting dead code (C-8). |
| C-21 | **P2** | `theme-color` `#ffffff` (`__root.tsx:79`, manifest) conflicts with the black status bar and splash (`capacitor.config.ts:14,21`). The maskable icon reuses `icon-512.png` without safe-zone padding (`manifest.webmanifest:16`). | | Use a dedicated maskable asset and consistent theme colours. |
| C-22 | **P2** | Local-only: `.git` is 586 MB because a local `refs/codex/turn-diffs/...` checkpoint ref holds `DOCS_RON/` brand files (506 MB LogoDeck zip, 187 MB style guide PDF, PSDs). **Not on `main` or any remote** (verified). | `git for-each-ref` | Delete the stale tool refs locally (`git update-ref -d <ref>` then `git gc --prune=now`). Never commit `DOCS_RON/`. Add it to `.gitignore`. |
| C-23 | **P2** | Repo lives on a personal account (`github.com/dexter-ifti/...`) with a second remote `rajeetcodeN/...` | `git remote -v` | Transfer to a client- or agency-owned GitHub organisation before launch (ownership, secrets, branch protection). |

### What is already done well

- `strict` TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` (`tsconfig.json:22-30`). This is a strong baseline once C-5 is fixed.
- Native external-link handling uses `@capacitor/browser` (SFSafariViewController / Custom Tabs). Booking happens in a real browser context, which is right for Apple 3.1 and keeps Whoosh cookies out of the app.
- `window.open(..., "noopener,noreferrer")` and `rel="noreferrer"` are used on the web (`platform.ts:32`).
- Thoughtful SSR error normalisation (`src/server.ts`) and a branded error/404 UI.
- Android back-button handling and safe-area classes (`pt-safe`, `pb-safe`, `env(safe-area-inset-bottom)`).
- Lean actual bundle: only `react`, the TanStack router/start stack, `lucide-react`, `clsx`, `tailwind-merge` and Capacitor plugins are imported by app code.

---

## 5. Dependency audit

### 5.1 `npm audit` (2026-11-18): 31 advisories (1 critical, 17 high, 13 moderate)

| Package (direct) | Severity | Ships to users? | Root cause | Action |
|---|---|---|---|---|
| `@capacitor/cli` → `tar` | **Critical** | No (build tool) | node-tar hardlink/symlink path traversal | Upgrade `@capacitor/cli` to 8.6.x and re-audit |
| `@capacitor/assets` → `sharp`/`@capacitor/cli` | High | No | libvips/libheif CVEs | Upgrade to `@capacitor/assets@4`, or run it only in CI |
| `@tanstack/react-start`, `router-plugin` → `router-utils` → `tinyglobby`/`picomatch` | High | No (build-time) | picomatch ReDoS | Upgrade to TanStack Start ≥1.169 / router-plugin ≥1.169 |
| `vite` → `launch-editor` | High | No (dev server) | Windows command injection | Upgrade to vite ≥8.3 |
| `vitest` → `@vitest/mocker` | High | No | Code injection via mock registration | Upgrade to 4.1.12+ or 5.x |
| `zod` | High | **No** (unused) | Memory exhaustion | **Remove** (C-8) |
| `seroval` (transitive via TanStack Router SSR serialisation) | Moderate | **Yes (SSR payload)** | Script injection through RegExp/typed-array serialisation | Upgrade TanStack. Low exploitability here because no user-controlled data is serialised. |
| `typescript-eslint` → `minimatch` | Moderate | No | ReDoS | Upgrade to 8.73 |
| `uuid` via `xcode`/`@trapezedev/project` | Moderate | No | Buffer bounds | Upgrade with `@capacitor/assets` |

**Assessment:** the production attack surface from dependencies is small, because nearly every advisory is in build or dev tooling. Still, **a clean `npm audit --omit=dev` should be a release gate** (supply-chain hygiene, and store reviewers and security questionnaires increasingly ask for it).

### 5.2 Outdated packages (selected)

| Package | Current | Latest | Notes |
|---|---|---|---|
| `@capacitor/*` (core/android/ios/cli) | 8.5.3 | 8.6.2 | Patch/minor. Upgrade before store builds. |
| `@capacitor/assets` | 3.0.5 | 4.0.0 | Major. Fixes the `sharp` advisories. |
| `@tanstack/react-start` / `router-plugin` / `react-router` | 1.168.60 / 1.168.42 / 1.170.41 (exact pins) | 1.169.5 / 1.169.0 / 1.170.46 | Exact pins are good for reproducibility, but use Renovate to keep them moving. |
| `nitro` | `3.0.260603-beta` | `3.0.261103-rc` | **A beta server runtime in production.** Move to RC/stable, or drop Nitro if migrating to Cloudflare. |
| `vite` | 8.1.5 (+ `rolldown` override 1.2.1) | 8.3.8 | Re-test whether the `rolldown` override is still needed and remove it if not. |
| `jsdom` | 20.0.3 | 31.0.1 | Very old. Vitest 4 recommends newer. |
| `eslint` / `@eslint/js` | 9.39 | 10.x | Major. Plan it. |
| `eslint-plugin-react-hooks` | 5.2 | 7.1 | v7 adds React Compiler rules. |
| `typescript` | 5.9.3 | 7.0.2 | TS 7 (native Go compiler). Evaluate after GA. |
| `lucide-react` | 0.575 | 1.75 | Major (icon renames). Low priority. |
| `zod`, `recharts`, `react-day-picker`, `@hookform/resolvers` | — | majors available | **Remove instead** (unused). |

### 5.3 Deprecated, unused or misplaced packages

| Package | Status | Recommendation |
|---|---|---|
| All `@radix-ui/react-*` except `react-slot`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`, `cmdk`, `date-fns`, `react-day-picker`, `embla-carousel-react`, `vaul`, `input-otp`, `react-resizable-panels`, `sonner` | **Unused** (only referenced from unused `src/components/ui/*`) | Remove. `react-slot` is used by `ui/button` (also unused), so remove it too unless a feature adopts `Button`. |
| `@tanstack/react-query` | Wired but unused | Keep only if remote content or Whoosh availability is planned (see `05-feature-roadmap.md`). Otherwise remove. |
| `vite-tsconfig-paths`, `@tailwindcss/vite`, `tailwindcss`, `tw-animate-css` | Build-time but listed in `dependencies` | Move to `devDependencies` (cosmetic for an app, but clarifies the SBOM). |
| `nitro` | Beta | See above. |
| `com.google.gms:google-services` (Gradle) | Unused (no `google-services.json`) | Remove until push notifications are added. |

### 5.4 Native dependency notes

- **Android:** AGP 8.13.0 / Gradle 8.13 / compileSdk 36 / targetSdk 36 / minSdk 24 (`android/variables.gradle`). These are current. Google Play's target-API rule is satisfied **[verify the current requirement at submission time]**.
- **Android 15+ edge-to-edge:** with `targetSdk 36`, edge-to-edge is enforced. `StatusBar.setBackgroundColor` (`platform.ts:40`, `capacitor.config.ts:19-22`) has no effect on Android 15+, and `env(safe-area-inset-*)` support in Android WebView depends on Capacitor's inset handling. **[UNVERIFIED on device. Must test on Android 15 and 16.]**
- **iOS:** generated with SPM in CI on `macos-26`. No `PrivacyInfo.xcprivacy` for the app target. Default device family probably includes iPad **[UNVERIFIED, because the project isn't committed]**.
