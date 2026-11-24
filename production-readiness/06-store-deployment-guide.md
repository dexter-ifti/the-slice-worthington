# 06 — Store Deployment Guide (Google Play & Apple App Store)

> App identity (from the repo): **Name** "The Slice" · **Bundle ID / applicationId** `com.thesliceworthington.app` (`capacitor.config.ts:4`, `android/app/build.gradle:7`) · **Version** 1.0.0 (code 1).
> ⚠️ Store rules change often. Items marked **[verify]** should be rechecked in the console at submission time.

---

## 1. Accounts and fees

| | Google Play | Apple App Store |
|---|---|---|
| Account type | **Organisation** (recommended) | **Organisation** (recommended) |
| Fee | **$25 one-time** | **$99 / year** |
| Requires | D-U-N-S number, legal entity name and address, website, verified phone/email, identity verification of the account owner | D-U-N-S number, legal entity, website, legal authority to bind the company, Apple ID with 2FA |
| Lead time | 2–7 days of verification | D-U-N-S up to ~30 days if new, then 1–7 days for enrolment |
| Key gotcha | **Personal** accounts created after Nov 2023 must run a **closed test with ≥ 12 opted-in testers for 14 consecutive days** before applying for production. Organisation accounts are exempt. **[verify]** | Without an organisation account, the seller name shows the individual's legal name. |
| Owner | **The Slice's legal entity must own both accounts.** Add the agency as *Admin* (Play) / *Admin* or *App Manager* (App Store Connect). Never let the agency own them. | |

Also set up:
- **Google Play:** a Google Cloud service account with the "Release manager" permission for fastlane `supply` (JSON key into the CI secret `PLAY_SERVICE_ACCOUNT_JSON`).
- **Apple:** an App Store Connect **API key** (role: App Manager) for fastlane/CI (`.p8`, key ID, issuer ID). Agreements, Tax and Banking: the Free Apps agreement is accepted automatically, but complete tax forms anyway.

---

## 2. App signing

### Android
1. Create a **new upload key** (the key referenced in `android/app/build.gradle:19-26` is compromised, because its password is in git):
   ```bash
   keytool -genkeypair -v -keystore slice-upload.jks -alias upload \
     -keyalg RSA -keysize 4096 -validity 10000
   ```
2. Store `slice-upload.jks` plus its passwords in the org vault, and in GitHub `production` environment secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).
3. Make the Gradle signing config env-driven (see `03-security-checklist.md` §3).
4. On first upload, **opt in to Play App Signing** (mandatory for AAB). Google generates and holds the app-signing key, and your keystore becomes the *upload* key, which Play support can reset if it's lost.
5. Record the **SHA-256 of the app-signing certificate** (Play Console → Setup → App signing). You'll need it for `assetlinks.json` (App Links) and Firebase.

### iOS
1. Register the App ID `com.thesliceworthington.app` (Certificates, IDs & Profiles → Identifiers). Enable capabilities only when needed (Push Notifications, Associated Domains, Wallet).
2. Create an **Apple Distribution** certificate and an **App Store** provisioning profile. Recommended: fastlane `match` (encrypted private repo or GCS bucket), or automatic signing with the App Store Connect API key in CI (`xcodebuild -allowProvisioningUpdates -authenticationKeyPath ...`).
3. Commit the `ios/` project first (it is currently generated per CI run, `.github/workflows/ios-simulator.yml:36-42`). Signing settings can't persist otherwise.

---

## 3. Build configuration, IDs and versioning

| Setting | Android | iOS |
|---|---|---|
| ID | `applicationId "com.thesliceworthington.app"` (**immutable after first publish**) | `PRODUCT_BUNDLE_IDENTIFIER = com.thesliceworthington.app` (immutable for the App Store record) |
| Display name | `res/values/strings.xml` → `app_name` = "The Slice" | `CFBundleDisplayName` = "The Slice" |
| User-facing version | `versionName` = `1.0.0` | `MARKETING_VERSION` (`CFBundleShortVersionString`) = `1.0.0` |
| Build number | `versionCode`: integer, **strictly increasing**, max 2,100,000,000 | `CURRENT_PROJECT_VERSION` (`CFBundleVersion`): increasing per marketing version |
| SDK | `minSdk 24`, `targetSdk 36`, `compileSdk 36` (`android/variables.gradle`). Meets Play's target-API rule **[verify]**. | Build with the current required Xcode/SDK (Xcode 26 / iOS 26 SDK **[verify]**). Deployment target: Capacitor 8 default (iOS 15+) **[verify in project]**. |
| Artifact | **AAB** (`./gradlew bundleRelease`). APKs aren't accepted for new apps. | **IPA** via `xcodebuild archive` + `-exportArchive` (or fastlane `gym`) |
| Release flags | `debuggable false` (release default), `minifyEnabled true`, `shrinkResources true` | Release configuration, `ENABLE_BITCODE` n/a, strip debug symbols but upload dSYMs to Sentry |
| Device family | Phone + tablet (the layout is `max-w-md` centred, so it works on tablets) | **Recommend iPhone-only** (`TARGETED_DEVICE_FAMILY = 1`). Supporting iPad requires iPad screenshots and iPad-quality layouts (Guideline 4.0 / 2.4.1). |
| Orientation | Lock portrait (`android:screenOrientation="portrait"`), consistent with `manifest.webmanifest:10` | `UISupportedInterfaceOrientations` = Portrait |
| Encryption | — | `ITSAppUsesNonExemptEncryption = NO` (HTTPS only), so no export-compliance prompt per build |

**Versioning scheme (recommended):**
- Git tag `vMAJOR.MINOR.PATCH` is the source of truth. `versionName` / `MARKETING_VERSION` = tag.
- `versionCode` = `MAJOR*1_000_000 + MINOR*10_000 + PATCH*100 + buildAttempt` (e.g. 1.0.0 → `1000000`, a retry → `1000001`). This is readable and monotonic. Use the same value for `CFBundleVersion`.
- Keep the web and native versions in lockstep (`package.json` `version` = tag) so Sentry releases line up.

---

## 4. Store listing assets

| Asset | Google Play | Apple App Store | Source in repo |
|---|---|---|---|
| App icon | 512×512 PNG, 32-bit, ≤ 1 MB | 1024×1024 PNG, **no alpha / no rounded corners** | `assets/icon-only.png` (verify alpha is flattened for iOS) |
| Feature graphic | **1024×500** JPG/PNG (required) | — | Create from `src/assets/hero-bay.jpg` plus the logo |
| Phone screenshots | 2–8, 320–3840 px, ≤ 2:1 aspect. Use **≥ 4 at 1080×1920+** for promotion eligibility. | **6.9" iPhone required** (1320×2868 or 1290×2796 portrait), up to 10. Smaller sizes auto-scale. | Capture from a real device or simulator after the launch features ship |
| Tablet screenshots | 7" and 10" optional but recommended if tablets are supported | **13" iPad required only if iPad is supported** | — |
| Preview video | Optional YouTube URL | Optional App Preview (15–30 s) | The hero video (`HERO_VIDEO_MOBILE_URL`) could be repurposed, but it must show **the app**, not just venue footage (Apple 2.3.4) |
| Name / title | ≤ 30 chars | ≤ 30 chars | |
| Subtitle / short description | Short description ≤ 80 chars | Subtitle ≤ 30 chars | |
| Description | ≤ 4000 chars | ≤ 4000 chars (not indexed for search) | |
| Keywords | (none; indexed from the description) | ≤ 100 bytes, comma-separated, no spaces after commas | |
| Promotional text | — | ≤ 170 chars (editable without review) | |
| Category | **Sports** (alt: Entertainment) | Primary **Sports**, secondary **Food & Drink** or **Entertainment** | |
| Contact | Email (required), website, phone | Support URL (required), marketing URL | |

**Suggested copy (for owner editing):**
- **Title:** `The Slice – Golf Simulators` (27)
- **Apple subtitle:** `Book a bay in Worthington, OH` (29)
- **Play short description:** `Book a golf simulator bay, check hours, menu & events at The Slice Worthington.` (79)
- **Apple keywords:** `golf,simulator,bay,booking,Worthington,Columbus,Ohio,Full Swing,multisport,birthday,party,indoor` (≈ 95 bytes)
- **Description outline:** hook ("Swing. Smile. Stay Awhile.") → what you can do in the app (book a bay, hours, menu, parties, Founders Club) → about the venue (5 Full Swing bays, multisport, food and drinks) → address → support link.

**Screenshot plan (5):** ① Home with "Book a Bay" ② Visit/hours with Open now ③ Menu ④ Parties & events ⑤ Founders Club. Add brand-framed captions in Montserrat, generated with fastlane `frameit` or Figma.

---

## 5. Privacy, data safety and declarations

### 5.1 Privacy policy (both stores, mandatory)
- Host it at `https://www.thesliceworthington.com/privacy` (owner's site), link it in-app (the L6 info screen) and in both listings.
- It must describe: data the app itself collects (none today; crash/analytics data once Sentry and analytics are added); third parties contacted (Whoosh, Google Fonts if not self-hosted, Webflow CDN, Google/Apple Maps, Instagram); retention; contact for requests; children's data statement.

### 5.2 Google Play Data safety form (answers depend on SDKs present at submission)

| Scenario | Data collected? | Answers |
|---|---|---|
| **v1 as the repo is today** (no SDKs) | No | "No data collected". Encryption in transit: Yes. Note that remote fonts/images send the IP to third parties as part of normal network requests. Google treats this as not "collected" unless it's stored or processed by you **[verify wording]**. |
| **With Sentry** | Yes | App info and performance → **Crash logs**, **Diagnostics**: collected, **not shared** (a service provider isn't "sharing"), not optional (or optional with the opt-out), purpose *App functionality / Analytics*. Encrypted in transit: Yes. Deletion: by request (email). |
| **With analytics** (PostHog/Firebase) | Yes | App activity → **App interactions**; Device or other IDs (Firebase app-instance ID). Purpose *Analytics*. **Firebase Analytics adds the `AD_ID` permission. Remove it via a manifest `tools:node="remove"` if not needed, and declare the Advertising ID usage accordingly.** |
| **With push** | Yes | Device or other IDs (FCM token), purpose *App functionality*. |

Other Play declarations (Policy → App content):
- **App access:** "All functionality is available without special access" (no login).
- **Ads:** No ads.
- **Target audience & content:** pick **18+** or **13+** as the *target* audience. If you include under-13 age groups, the **Families Policy** applies (certified SDKs only, extra review). The venue is family-friendly, so answer "Does your app appeal to children?" honestly, but target adults (the people who book).
- **Content rating:** IARC questionnaire. A food/drink menu **with alcohol** means answering "references to alcohol", which may raise the rating from Everyone to Teen/PEGI 12 **[questionnaire computes it]**.
- News app: No · Government: No · Financial features: No · Health: No · COVID: No.
- **Advertising ID:** declare No unless an SDK uses it.

### 5.3 Apple App Privacy labels ("nutrition labels")

| Scenario | Label |
|---|---|
| No SDKs | **"Data Not Collected"** |
| + Sentry | Diagnostics → Crash Data, Performance Data, Other Diagnostic Data: **Not linked to the user**, **not used for tracking** |
| + Analytics | Usage Data → Product Interaction: not linked, not tracking (ensure no user IDs) |
| + Push | Identifiers → Device ID (only if your backend stores it alongside user data). Often not needed for APNs-only. |

- **App Tracking Transparency:** **not required** if there are no ads/attribution SDKs and no cross-app tracking. Don't add the Meta SDK, AppsFlyer and similar without revisiting this.
- **Privacy manifest (`PrivacyInfo.xcprivacy`)** in the app target: `NSPrivacyTracking = false`, `NSPrivacyCollectedDataTypes` matching the labels, `NSPrivacyAccessedAPITypes` (e.g., `NSPrivacyAccessedAPICategoryUserDefaults` reason `CA92.1` if used by app code). Capacitor plugin packages ship their own manifests. Check the Xcode **Privacy Report** (Organizer → archive → Generate Privacy Report) before submission.

### 5.4 Permissions justification

| Permission | Present? | Justification text |
|---|---|---|
| Android `INTERNET` | Yes (`AndroidManifest.xml:40`) | Normal permission, no justification needed |
| `POST_NOTIFICATIONS` (if push) | Future | In-app pre-prompt: "Get alerts when a bay opens up tonight and about upcoming events." |
| iOS Push | Future | Same copy in the pre-prompt. iOS has no Info.plist string for push. |
| Location (if "near me" is ever added) | Not needed | Avoid it. Directions open the Maps app, which doesn't require location permission in this app. |

### 5.5 Age rating

- **Apple** (updated 2025 age-rating questionnaire; tiers 4+/9+/13+/16+/18+): with no alcohol references, expect **4+**. If the menu lists alcoholic drinks or the copy references the bar, answer "Alcohol, Tobacco, or Drug Use or References: Infrequent/Mild". The questionnaire then computes a higher tier (likely 13+) **[verify]**. No user-generated content, no web browsing (the in-app browser opens specific URLs, but SFSafariViewController counts as *unrestricted web access* only if users can navigate anywhere. They can from Whoosh/Instagram pages. **Answer "No" to Unrestricted Web Access only if you're confident. Reviewers sometimes disagree, so consider answering Yes, which raises the rating to 16+/17+.** Get owner input.)
- **Google:** IARC as described above.

### 5.6 Other Apple declarations
- **Content rights:** confirm you own or license all imagery (Webflow CDN images are the venue's own).
- **Made for Kids:** No.
- **EU Digital Services Act trader status:** required **only if distributing in EU storefronts**. Recommended: limit availability to the **United States** for v1 (and maybe Canada). That avoids the DSA trader disclosure and EU-specific obligations.
- **Sign in with Apple / account deletion:** N/A (no accounts).

---

## 6. Step-by-step: Google Play

1. **Create the app** (Play Console → Create app): name "The Slice", default language en-US, App (not game), Free. Accept the declarations.
2. **Set up your app** dashboard: complete every *App content* item (§5.2), the store listing (§4), the category and contact details.
3. **Build:** `npm ci && npm run build && npx cap sync android && cd android && ./gradlew bundleRelease` (CI: `release.yml` with fastlane `supply`).
4. **Internal testing** (Testing → Internal testing): upload the AAB, opt in to Play App Signing, add a tester email list (≤ 100), share the opt-in link. Processing takes minutes.
5. Check **Pre-launch report** results (Firebase Test Lab robo crawl on ~10 devices): crashes, accessibility, security warnings.
6. **Closed testing** with beta customers. Mandatory ≥ 14 days with ≥ 12 testers on a personal account. Recommended 1–2 weeks either way.
7. **Production:** Production → Create release → promote the tested build → **staged rollout 10 %** → monitor Android vitals and Sentry → 25 % → 50 % → 100 % over 5–7 days. You can **halt rollout** at any point.
8. **Review timeline:** typically hours to 3 days. **New apps and new developer accounts can take 7+ days** **[verify]**. Submit ≥ 1 week before any marketing date. Use *Managed publishing* to control the exact go-live moment after approval.

## 7. Step-by-step: Apple App Store

1. **App Store Connect → Apps → +**: platform iOS, name "The Slice" (must be unique on the store; fall back to "The Slice Worthington"), primary language English (U.S.), bundle ID `com.thesliceworthington.app`, SKU `slice-ios-001`.
2. **App Information:** category, content rights, age rating (§5.5), privacy policy URL.
3. **App Privacy:** complete the labels (§5.3).
4. **Pricing and Availability:** Free. Availability **United States** (v1).
5. **Build & upload:** `npx cap sync ios` → Xcode *Product → Archive* or CI `fastlane gym` → `fastlane pilot upload` (or Transporter). Processing takes ~15–60 min.
6. **TestFlight internal** (≤ 100 App Store Connect users, no review, instant). Then **TestFlight external** (up to 10,000 testers via public link). The first build of each version needs **Beta App Review** (~24–48 h). Builds expire after **90 days**.
7. **Prepare for submission:** screenshots, description, keywords, support URL, **App Review Information** (contact, notes; see below), version release = **Manually release this version**.
8. **Submit for review.** Apple reviews most apps within **24–48 h** **[verify current stats]**. Expect one round of questions.
9. **Release:** manual release after approval. For subsequent updates, enable **Phased Release** (7-day automatic ramp: 1 %, 2 %, 5 %, 10 %, 20 %, 50 %, 100 %, pausable).

**App Review notes template:**
> The Slice is a golf-simulator and multisport venue in Worthington, Ohio. The app lets customers check live opening hours, view the menu, explore party packages, call or get directions, and book a simulator bay. Bay booking and payment are provided by our booking provider, Whoosh, and open in Safari View Controller. These are physical services consumed at our venue (Guideline 3.1.3(e)), and Founders Club memberships are in-venue memberships. No login is required. All features are available immediately.

---

## 8. Common rejection reasons and how to avoid them (specific to this app)

| Risk | Store / guideline | Why this app is exposed | Prevention |
|---|---|---|---|
| **Minimum functionality / "collection of links" / repackaged website** | Apple **4.2, 4.2.2**. Google Play *Minimum functionality* / *Webview spam* | Today's app is 6 static pages, and every action leaves the app (`src/lib/links.ts`) | Ship the launch features in `05-feature-roadmap.md` §1 (hours, call, maps, menu, parties, offline; ideally push or a Wallet pass). Explain the native value in the review notes. If rejected, reply in Resolution Center with specifics, then appeal to the App Review Board. |
| **Incomplete or placeholder content** | Apple **2.1**, **2.3.1**. Google *Metadata* | "Opening Fall 2026" copy, anticipatory testimonials, events "to be announced" (`events.tsx:53`) | Content sign-off (E6.5). No "coming soon" sections. |
| **Inaccurate screenshots** | Apple **2.3.3/2.3.4** | Marketing renders instead of the app UI | Real app screenshots, light framing only |
| **Privacy policy missing or mismatched labels** | Apple **5.1.1**, **5.1.2**. Play *User Data* / Data safety | No policy exists yet. SDKs will be added late. | Policy live before upload. Labels reviewed against the *final* SDK list (Privacy Report). |
| **Payments outside IAP** | Apple **3.1.1** | "Book a Bay" and "Join Founders Club" lead to external purchases | These are physical, in-venue services, which are exempt under **3.1.3(e)/3.1.5(a)**. State this in the review notes. Never sell digital content (e.g., swing-video downloads) externally. |
| **Broken links / crashes on the reviewer's device** | Apple **2.1**. Play *Broken functionality* | Hard dependency on Webflow CDN and Whoosh | Synthetic monitors, bundled images, offline UI, a pre-submission link check |
| **iPad layout issues** | Apple **2.4.1 / 4.0** | If iPad stays enabled, the `max-w-md` column looks like a phone app on iPad | iPhone-only build, or proper iPad layouts and screenshots |
| **Debuggable or unsigned build** | Play upload rejected | The current pipeline builds `assembleDebug` | Release AAB from CI |
| **Missing Advertising ID declaration** | Play | If Firebase Analytics is added | Declare it or remove `AD_ID` |
| **Trademark / name conflict** | Apple **5.2**, Play *Impersonation* | "Full Swing" is a third-party trademark. "The Slice" is generic. | Use "Full Swing" only descriptively. Keep the developer name = the legal entity of The Slice. |
| **Families policy triggered** | Play | Family-oriented content | Target audience 13+/18+ (§5.2) |

---

## 9. Timelines at a glance

| Step | Typical duration |
|---|---|
| D-U-N-S (new) | up to 30 days |
| Apple enrolment (org) | 1–7 days |
| Play account verification | 2–7 days |
| Play internal testing availability | minutes |
| Play closed test (personal-account requirement) | ≥ 14 days |
| Play production review (new app) | 1–7+ days |
| TestFlight Beta App Review | ~1–2 days |
| App Store review | ~1–2 days (allow a week for back-and-forth) |
| Play staged rollout to 100 % | 5–7 days (by choice) |
| Apple phased release (updates) | 7 days (automatic) |
