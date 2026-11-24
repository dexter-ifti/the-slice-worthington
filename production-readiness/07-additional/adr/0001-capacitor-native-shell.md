# ADR-0001: Ship native apps as a Capacitor shell around the TanStack Start web app

- **Status:** Accepted (retroactively documented; reflects the current repo)
- **Date:** 2026-11-18
- **Deciders:** Eng lead, product owner

## Context
`REQUIREMENTS.md` asks for a PWA first and a native iOS app second, "without code rewrites". The app is content plus deep links. The team is small (1 engineer). The codebase is React 19 + TanStack Start with prerendered routes.

## Decision
Use **Capacitor 8** (`capacitor.config.ts`) to package the **prerendered static output** (`webDir: ".output/public"`) for Android and iOS. Native capabilities come from official Capacitor plugins (`@capacitor/app`, `browser`, `splash-screen`, `status-bar`, and later `network`, `push-notifications`, `haptics`). Commit both the `android/` and `ios/` projects.

## Alternatives considered
| Option | Pros | Cons |
|---|---|---|
| **Capacitor (chosen)** | One codebase. Reuses all existing UI. Bundled assets work offline. Native plugin ecosystem. | Higher Apple 4.2 "web wrapper" scrutiny. WebView performance ceiling. |
| React Native / Expo | More native feel. Stronger 4.2 posture. | Full UI rewrite (contradicts the requirement). Two codebases (web + RN). |
| PWA only | Zero store friction | No App Store presence (the stated goal). Limited iOS push and install UX. |
| Remote-URL wrapper (`server.url` → live site) | Instant updates | **Very likely 4.2 rejection.** No offline. Blank screen without network. |

## Consequences
- Native value features (hours, maps, call, offline, push, Wallet) are needed to pass 4.2 (`05-feature-roadmap.md` §1).
- `ios/` must be committed (currently generated in CI) so platform config is versioned.
- The SSR server (`src/server.ts`) only serves the web. Native never depends on it.
- Revisit if the product moves to deep native features (widgets, live booking grid) where RN or native modules become cheaper.
