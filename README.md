# The Slice — Worthington

> Approachable golf, multisport games, great food, and a laid-back vibe in Worthington.

[![Web App](https://img.shields.io/badge/Web_App-Live-02C5FB?style=for-the-badge&logo=google-chrome&logoColor=black)](https://thesliceworthington.vercel.app/)
[![iOS Preview](https://img.shields.io/badge/Test-iOS_on_Appetize-111111?style=for-the-badge&logo=apple&logoColor=white)](https://appetize.io/app/pqc77gleqagn4gekgm3y4v64v4)

## Download and test

### Android

Once the release setup is complete, invited testers can install Android builds through Google Play internal testing.

### iOS

The iOS Simulator build is available through Appetize:

**[Open The Slice iOS Preview](https://appetize.io/app/pqc77gleqagn4gekgm3y4v64v4)**

This is a browser-based iOS Simulator preview, not an App Store or TestFlight build.

## Features

- Branded home experience for The Slice Worthington
- Golf simulator bay booking through Whoosh
- Simulator and multisport information
- Founders Club memberships
- Events and contact information
- External website, directions, and social links
- Responsive web experience
- Capacitor Android app shell
- Capacitor iOS Simulator build pipeline
- PWA support with installable icons

## Tech stack

- React 19
- TypeScript
- TanStack Start and TanStack Router
- Vite and Nitro
- Tailwind CSS
- Capacitor 8
- Android native project
- iOS Simulator builds through GitHub Actions
- Vitest and ESLint

## Local web development

Requirements: Node.js 22.22+ (22.x) or Node.js 24+, with npm.

```bash
git clone https://github.com/dexter-ifti/the-slice-worthington.git
cd the-slice-worthington
npm ci
npm run dev
```

Open the local development server shown by Vite.

## Android development

Requirements: Android Studio, Android SDK, and a compatible JDK.

```bash
npm ci
npm run cap:sync
npm run cap:open:android
```

The Android project is located in `android/`. Build the debug APK in Android Studio or with:

```bash
cd android
./gradlew assembleDebug
```

## Android release signing

1. Generate a new upload key on a maintainer-controlled machine. Keep the keystore and its passwords in the organization's credential store. Enroll in Play App Signing. For an existing Play app, register the new upload certificate through the upload-key reset process. [Play App Signing instructions](https://support.google.com/googleplay/android-developer/answer/9842756)
2. In the GitHub `production` environment, restrict deployments to `main` and configure required reviewers. Set `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD` as environment secrets. The base64 value contains the full keystore and needs the same protection as the original file.
3. Dispatch **Android Release** from `main`. The artifact contains the upload-key-signed AAB, its SHA-256 checksum and a CycloneDX SBOM. Attach the SBOM when you create a GitHub Release. Bump Android's `versionCode` for each new Play upload. Upload the AAB to the internal testing track, then invite testers. [Play release instructions](https://support.google.com/googleplay/android-developer/answer/9859348)
4. Remove the old debug build from test devices before installing the Play build if Android rejects the signing change.

For local signing, set `ANDROID_KEYSTORE_PATH` and the three credential variables above, or use `SLICE_UPLOAD_STORE_FILE`, `SLICE_UPLOAD_STORE_PASSWORD`, `SLICE_UPLOAD_KEY_ALIAS` and `SLICE_UPLOAD_KEY_PASSWORD` in your user Gradle properties. Release signing is required by the distribution workflow.

## iOS Simulator build

GitHub Actions builds an unsigned Simulator `.app` from the checked-in Xcode project. The staging job can update the Appetize preview from `main`.

The workflow can be started from:

```text
GitHub → Actions → iOS Simulator Preview → Run workflow
```

The Appetize upload reads both values from the GitHub `staging` environment.

```text
Secret:   APPETIZE_API_TOKEN
Variable: APPETIZE_PUBLIC_KEY
```

## Repository security

- Require pull request reviews and passing **Web checks and dependency audit** and **Scan changes for secrets** on `main`. Restrict the release environments to `main` and require approval for production deployments.
- CodeQL and dependency review run on public repositories. For a private repository, enable GitHub Code Security and set the repository variable `SLICE_CODE_SECURITY_ENABLED=true`. Enable Dependabot alerts and security updates on the repository. [Dependency review setup](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action)
- Install Gitleaks and run `git config core.hooksPath .githooks` to scan staged changes before committing.
- Treat all `VITE_` values as public. Keep service credentials in the server or CI environment.

## Useful commands

```bash
npm run build
npm test
npm run lint
npm run cap:sync
npm run cap:sync:ios
```

## Project structure

```text
src/                  Shared React application
android/              Android Capacitor project
ios/                  iOS Capacitor project
assets/               Capacitor icon and splash source assets
public/               Web/PWA assets
.github/workflows/    Android and iOS build workflows
capacitor.config.ts  Capacitor configuration
```

## Important links

- [Live web app](https://thesliceworthington.vercel.app/)
- [Privacy policy](https://thesliceworthington.vercel.app/privacy)
- [The Slice website](https://www.thesliceworthington.com/)
- [Whoosh booking](https://app.whoosh.io/patron/club/the-slice/agenda/simulators/today)
- [Instagram](https://www.instagram.com/thesliceworthington/)
- [iOS Appetize preview](https://appetize.io/app/pqc77gleqagn4gekgm3y4v64v4)

## Tests

```bash
npm test
npm run build
```
