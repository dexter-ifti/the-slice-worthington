# The Slice — Worthington

> Approachable golf, multisport games, great food, and a laid-back vibe in Worthington, Ohio.

<!-- Replace the badge targets once store listings are live -->
[Web app](https://app.thesliceworthington.com) · [Google Play](https://play.google.com/store/apps/details?id=com.thesliceworthington.app) · [App Store](https://apps.apple.com/app/idXXXXXXXXX)

The official app for The Slice: book a simulator bay (via Whoosh), check hours, browse the menu, plan a party, and join the Founders Club.

## Tech stack

| | |
|---|---|
| App | React 19, TypeScript (strict), TanStack Start + Router (file-based, prerendered) |
| Styling | Tailwind CSS v4, shadcn/ui (on demand) |
| Native | Capacitor 8 (`android/`, `ios/`) |
| Web hosting | Cloudflare Workers (see `docs/adr/0003-web-hosting.md`) |
| Quality | Vitest, Testing Library, Playwright, ESLint, Prettier |
| Ops | GitHub Actions + fastlane, Sentry, uptime monitors |

## Getting started

Requirements: Node 22 LTS, npm. Android Studio + JDK 21 for Android. Xcode 26 for iOS.

```bash
npm ci
cp .env.example .env.local   # optional
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Web dev server |
| `npm run build` | Production web build (`.output/`) |
| `npm run lint` / `npm run typecheck` / `npm test` | Quality gates (same as CI) |
| `npm run cap:sync` / `npm run cap:sync:ios` | Build web and sync into the native projects |
| `npx cap open android` / `npx cap open ios` | Open in Android Studio / Xcode |

## Project structure

```text
src/routes/        Pages (file-based routing; never edit routeTree.gen.ts)
src/components/    App components (PageShell, SiteHeader, BrandCta, ExternalLink)
src/lib/           links.ts / venue.ts (content & URLs), platform.ts (native bridge), analytics.ts
android/, ios/     Capacitor native projects
assets/            Icon & splash sources for @capacitor/assets
docs/              Runbook, releasing, ADRs, legal, observability
fastlane/          Store build, signing, upload, and listing metadata
```

## Releasing

Releases are cut by pushing a `vX.Y.Z` tag. CI builds, signs and uploads to Play internal testing and TestFlight, then promotion to production follows `docs/RELEASING.md`. **Never** commit APK/AAB/IPA files or signing material.

## Testing builds

- Android beta: join the Google Play testing program (link from the team).
- iOS beta: TestFlight invitation.
- iOS Simulator preview (on demand): GitHub → Actions → *iOS Simulator Preview* → Run workflow (uploads to Appetize).

## Contributing

See `CONTRIBUTING.md`. Questions: _team contact_.

## License

Proprietary © The Slice Worthington. Third-party notices: `THIRD_PARTY_NOTICES.md`.
