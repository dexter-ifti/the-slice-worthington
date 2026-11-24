# ADR-0003: Move web hosting from Vercel Hobby to Cloudflare Workers

- **Status:** Proposed
- **Date:** 2026-11-18

## Context
The web app currently deploys to Vercel (`vercel.json`, `thesliceworthington.vercel.app`) using Nitro (`vite.config.ts:21`, `nitro@3.0.260603-beta`). The Vercel **Hobby** plan restricts use to non-commercial projects (`PROJECT_ESTIMATE.md:123-125`). All routes are prerendered, so the server does very little.

## Decision (proposed)
Deploy to **Cloudflare Workers** using `@cloudflare/vite-plugin` and Wrangler, replacing the Nitro adapter, with:
- Production: `app.thesliceworthington.com`. Staging: `staging.thesliceworthington.com` (Cloudflare Access-protected, `noindex`).
- Security headers set in the Worker response (`03-security-checklist.md` §3).
- Rollback via `wrangler rollback`.

## Alternatives considered
| Option | Cost | Pros | Cons |
|---|---|---|---|
| **Cloudflare Workers (proposed)** | $0–5/mo | Cheap. Global edge. Official TanStack Start guide. Removes the beta Nitro dependency. | Migration effort (8–16 h). New platform for the team. |
| Vercel Pro | $20+/member/mo | Zero migration. Preview deploys already familiar. | Cost scales per seat. Keeps the beta Nitro. |
| Static-only hosting (Cloudflare Pages / S3+CloudFront), no SSR | ~$0 | Simplest, since everything is prerendered | Loses SSR error handling and future server functions |

## Consequences
- Remove `nitro`, `vercel.json` and possibly the `rolldown` override after migration. Re-verify `src/server.ts` against the Workers runtime.
- Preview deployments per PR via `wrangler versions upload`.
- If the team prefers zero migration risk before launch, choose Vercel Pro now and revisit after GA.
