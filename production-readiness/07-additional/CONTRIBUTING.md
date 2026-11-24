# Contributing to The Slice app

## Prerequisites

- Node.js 22 LTS and **npm** (the single supported package manager; `package-lock.json` is authoritative)
- Android: Android Studio (latest stable), JDK 21
- iOS: macOS with Xcode 26+, CocoaPods not required (SPM)

```bash
npm ci
npm run dev            # web at the URL Vite prints
npm run cap:sync       # build + sync Android
npm run cap:sync:ios   # build + sync iOS
```

## Branching and commits

- `main` is protected and always releasable. Releases are **tags** (`vX.Y.Z`) cut from `main`.
- Branch names: `feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`, `docs/<short-desc>`.
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/) (the history already mostly follows this: `feat:`, `fix:`, `docs:`, `copy:`). Use `copy:` for content-only changes.
- One logical change per PR. Squash-merge.

## Pull requests

Every PR must:
- [ ] Pass CI: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, audit.
- [ ] Include tests for logic in `src/lib/**` (hours, link handling, platform bridge).
- [ ] Include screenshots (mobile viewport) for UI changes. Add a native screenshot if the change touches safe areas, the status bar or external links.
- [ ] Note any **new SDK, permission or network domain**. These require updates to the privacy policy, Data safety and App Privacy labels (tag the PR `privacy-impact`).
- [ ] Never include secrets, keystores, `.p8`/`.p12` files, APK/AAB/IPA binaries or brand source files (`DOCS_RON/`).

## Code conventions

From `AGENTS.md` and the existing code:

- **TypeScript strict.** The project uses `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Handle `undefined` from index access instead of using `!`.
- **Routing:** TanStack Start file-based routes in `src/routes/` (see `src/routes/README.md`). Never edit `src/routeTree.gen.ts`. Each route defines `head()` meta (title, description, og:*).
- **Layout:** interior pages use `<PageShell>` (`src/components/page-shell.tsx`), which provides the header and the sticky "Book a Bay".
- **External links:** never use a raw `<a target="_blank">` for external URLs. Use `<BrandCta>` or `<ExternalLink>` (or `openExternalUrl` from `src/lib/platform.ts`) so native builds open the in-app browser. Add new hosts to the allowlist in `src/lib/links.ts`.
- **URLs and venue data:** only in `src/lib/links.ts` / `src/lib/venue.ts`, never inline in components.
- **Native APIs:** go through `src/lib/platform.ts`. Guard with `isNativePlatform()` and keep SSR-safe (`typeof window` checks).
- **Styling:** Tailwind v4 utilities plus the tokens in `src/styles.css`. Use `cn()` from `src/lib/utils.ts`. Add shadcn components on demand (`npx shadcn add <component>`). Don't keep unused ones.
- **Accessibility:** interactive elements need accessible names. Touch targets ≥ 44×44 px. Respect `prefers-reduced-motion` (`motion-reduce:` variants).
- **Formatting:** Prettier (`.prettierrc`). Run `npm run format`.

## Architecture decisions

Significant changes (new SDK, hosting change, auth, offline strategy) need an ADR in `docs/adr/` (template: `adr/0000-template.md`) before implementation.

## Releasing

See `docs/RELEASING.md` (from `07-additional/release-checklist-and-rollback.md`). Only CI builds release artifacts. Never build store binaries locally for upload.
