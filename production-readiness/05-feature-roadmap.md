# 05 — Feature Roadmap

> Context: The Slice is a single venue (5 Full Swing simulator bays, food and drinks, parties) in Worthington, OH. Booking and payment live in **Whoosh**. The app's job is to **get people to book, come back, and bring friends**.
> Complexity: **S** (≤ 1 day) · **M** (2–4 days) · **L** (1–2 weeks) · **XL** (> 2 weeks / needs a backend).
> Effort is engineer-hours and excludes content/design time from the owner.

---

## 1. Must-have for launch

These features exist to **(a)** give real user value beyond the website and **(b)** clear Apple **Guideline 4.2 / 4.2.2** (minimum functionality, "not just a collection of links") and Google Play's minimum-functionality policy. Without some of them, a first-submission rejection is likely (see `06-store-deployment-guide.md` §8).

| # | Feature | User value | Complexity | Effort | Notes / code touchpoints |
|---|---|---|---|---|---|
| L1 | **Visit & hours screen**: live "Open now / Closes at 10 pm", weekly hours, holiday overrides | Answers the #1 venue question without leaving the app | M | 5–7 h | New `src/lib/venue.ts` (typed hours, tz `America/New_York`). Unit tests for DST and holidays. |
| L2 | **Tap-to-call and native directions**: `tel:` link; Apple Maps (`maps.apple.com/?q=`) on iOS, `geo:` / Google Maps on Android | One-tap contact. A native-feeling action that reviewers notice. | S | 2 h | Replace the generic `MAPS_URL` with platform-aware links in `platform.ts`. |
| L3 | **Menu** (food and drinks), with dietary tags | Pre-visit decision-making, upsell | S–M | 3–4 h | Static content in v1. Remote content later (P3). |
| L4 | **Parties & events packages + inquiry** | Revenue driver (birthdays, corporate). Today `events.tsx` has no CTA. | M | 3–4 h | Structured package cards, then "Request a party" (website form in the in-app browser, or mailto/tel). |
| L5 | **Offline & poor-network experience** | Venue basements and garages have bad signal. Avoids blank screens. | S | 2–3 h | `@capacitor/network`. Cached hours and menu are bundled, so they work offline. |
| L6 | **App info / legal screen**: privacy, terms, support, version, licenses, analytics opt-out | Store requirement and trust | S | 2–3 h | Required for the review checklist. |
| L7 | **Accessible navigation** (dialog menu, carousel controls, Dynamic Type) | Inclusive UX, avoids complaints, WCAG 2.2 AA | S | 4–6 h | See E7. |
| L8 | **Accurate, approved content** (no pre-opening testimonials, current opening status) | Trust. Avoids FTC fake-review exposure and Apple 2.3 metadata issues. | S | 2–3 h | Owner dependency. |

*Strongly recommended for launch if time allows (each materially strengthens a 4.2 appeal):*

| # | Feature | User value | Complexity | Effort |
|---|---|---|---|---|
| L9 | **Push notifications, opt-in**: "Bay just opened tonight", events, member news. FCM + APNs via `@capacitor/push-notifications`, sent from the OneSignal or Firebase console (no custom backend). | Retention driver. Clear native capability. | M | 16–24 h (incl. permission UX, privacy-label updates) |
| L10 | **Founders Club digital member card** (Apple Wallet / Google Wallet pass with a QR/barcode for check-in) | Member delight. A native platform integration. | M–L | 16–30 h (pass signing service, e.g. PassKit / Wallet API) |

---

## 2. Post-launch (0–6 months)

### Retention and engagement

| Feature | User value | Complexity | Effort |
|---|---|---|---|
| **Remote content / CMS** for hours, events, menu, promos (headless CMS such as Sanity/Contentful, or a JSON file on the CDN + TanStack Query, which is already installed) | Staff can update without an app release | M | 16–24 h |
| **Remote config** for critical URLs (Whoosh, memberships) with an allowlist | Survive Whoosh URL changes without a release | S | 4–6 h |
| **Events calendar** with add-to-calendar (`.ics`) and reminders | Drives attendance at leagues and family nights | M | 12–16 h |
| **Leagues & tournaments**: schedule, standings (manual CSV/CMS first) | Weekly habit loop | M–L | 24–40 h |
| **Post-visit review prompt** (`@capacitor-community/in-app-review`) after the 2nd visit or a booking return | Store rating lifts acquisition | S | 3–4 h |
| **Home-screen widget** (iOS WidgetKit / Android Glance): "Open until 11 · Book a Bay" | Persistent presence | L (native code) | 30–50 h |
| **Smart deep links / QR codes at the venue** ("Scan to book your next session"), Universal Links + App Links | Re-booking at peak intent | M | 8–12 h |
| **Referral / share**: native share sheet with an attribution link | Organic growth | S–M | 6–10 h |

### Monetization (no Apple/Google commission applies: these are **physical services consumed at the venue**, Apple 3.1.3(e) / Google Play payments policy exemption)

| Feature | User value | Complexity | Effort |
|---|---|---|---|
| **Gift cards** (link to the venue POS/Whoosh gift-card flow, or Square/Toast gift cards) | Holiday revenue | S (link) – M (embedded) | 4–16 h |
| **Founders Club upsell** in-app (benefits comparison, waitlist) | Recurring revenue | S | 4–6 h |
| **Off-peak promos** via push + promo codes redeemed in Whoosh | Fill quiet bays | S (if L9 exists) | 4 h |
| **Corporate / private-event packages** with a deposit link | High-ticket bookings | M | 8–12 h |

### Accessibility and localization

| Feature | User value | Complexity | Effort |
|---|---|---|---|
| Full **WCAG 2.2 AA audit** by a third party + fixes | Compliance (ADA web-accessibility litigation risk for US businesses) | M | 8–16 h + audit fee |
| **i18n scaffolding** (`@lingui/react` or `react-i18next`); externalise strings now while the app has ~6 screens | Cheap now, expensive later | M | 8–12 h |
| **Spanish (es-US)** localization | Central Ohio's largest non-English language community | S per language once scaffolded | 4–6 h + translation |
| Reduced-motion and high-contrast themes | Comfort for motion-sensitive users | S | 3–4 h |

---

## 3. Future ideas (6+ months, backend required)

| Feature | User value | Complexity | Notes |
|---|---|---|---|
| **Native in-app booking** via the Whoosh API (availability grid, rebook favourite bay) | Fastest path to booking. Removes the browser hop. | XL | **Depends on Whoosh offering a partner API [unverified].** Requires server functions, auth and payment handling (still a physical service, so no IAP). |
| **Customer accounts** (visit history, favourite bay, saved party details) | Personalisation | XL | Triggers account-deletion requirements, a full privacy review, and the auth items in `03-security-checklist.md` §2.1. |
| **Loyalty / rewards** (stamp card → free hour) | Frequency | L–XL | Could integrate with the POS (Toast/Square loyalty) rather than custom. |
| **Swing stats & session recap** (from Full Swing software exports, if available) | Golfers love data. Shareable. | XL | Depends on Full Swing data access **[unverified]**. |
| **Order food to your bay** (link-out to Toast/Square online ordering) | Higher check size | M (link) – XL (native) | |
| **Live bay availability widget / "bays free now"** | Last-minute walk-ins | L | Needs a Whoosh API or a POS feed. |
| **Multi-location support** | Only if The Slice expands | L | Keep `venue.ts` shaped as an array from day one (cheap insurance). |

---

## 4. Suggested sequencing

```text
Launch (v1.0):   L1–L8  (+ L9 push if the timeline allows)
v1.1 (+4 wks):   Remote content/config · review prompt · events calendar · i18n scaffolding
v1.2 (+8 wks):   Wallet member card · gift cards · smart QR deep links · Spanish
v2.x:            Whoosh API booking (if available) · accounts · loyalty
```

**Metrics to judge features by** (tracked via E8.4 analytics):
- **North star:** "Book a Bay" taps → Whoosh opens per weekly active user.
- Retention: D7/D30 app opens. Push opt-in rate (target ≥ 45 % iOS).
- Conversion proxies: call taps, directions taps, party inquiries, membership taps.
- Quality: crash-free sessions ≥ 99.5 %, store rating ≥ 4.6.
