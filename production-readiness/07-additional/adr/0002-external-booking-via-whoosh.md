# ADR-0002: Booking and payment stay in Whoosh, opened in the system in-app browser

- **Status:** Accepted
- **Date:** 2026-11-18

## Context
The venue already uses Whoosh for simulator bookings (`WHOOSH_BOOKING_URL`, `src/lib/links.ts:1-2`). The MVP scope excludes a backend, accounts and payments (`PROJECT_ESTIMATE.md:166-171`). Apple Guideline 3.1 governs payments. Bookings of physical services consumed at a venue are exempt from IAP (3.1.3(e)).

## Decision
- "Book a Bay" opens Whoosh via `@capacitor/browser` (SFSafariViewController / Chrome Custom Tabs) on native and a new tab on the web (`src/lib/platform.ts:17-34`).
- Whoosh must **not** be embedded in the app's WebView (no iframe, no in-WebView navigation): its cookies, payment pages and login stay in the system browser context. This also avoids the app being responsible for payment-page security.
- The Founders Club signup follows the same pattern (`MEMBERSHIPS_URL`).

## Alternatives considered
| Option | Pros | Cons |
|---|---|---|
| **System in-app browser (chosen)** | Secure. Policy-compliant. Zero integration cost. | A context switch. No booking analytics beyond the tap. |
| Embed in WebView/iframe | Feels "in-app" | Third-party cookie/login issues, payment-page risk, possible Whoosh ToS issues, worse 4.2 posture |
| Whoosh API integration | Native booking UX | Unknown API availability **[unverified]**. Needs a backend, auth and PCI considerations. |

## Consequences
- We can measure taps and `browserFinished`, but not completed bookings, unless Whoosh offers conversion webhooks or UTM reporting (ask Whoosh).
- A Whoosh URL change breaks booking until a release ships, which is why **remote config for URLs** is on the post-launch roadmap.
- The review notes must explain the 3.1.3(e) exemption.
