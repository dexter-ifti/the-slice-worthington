# Legal & Compliance Checklist

> ⚖️ This is an engineering-side checklist, **not legal advice**. Have counsel review the Privacy Policy and Terms before launch.
> Business context assumed: a US (Ohio) small business with a single venue, distributing the app in the **US only** for v1. This should be confirmed (see the open questions in `../README.md`).

## 1. Required documents

| Doc | Status | Priority | Notes |
|---|---|---|---|
| **Privacy Policy** (public URL) | ❌ Missing | 🔴 Critical (stores reject without it) | Host on `thesliceworthington.com/privacy`. Link from the in-app info screen (E6.4) and both store listings. |
| **Terms of Use** for the app/site | ❌ Missing | 🟠 High | Short: acceptable use, links to third-party services (Whoosh terms govern bookings), disclaimers, Ohio governing law |
| **Support page / contact** | ⚠️ Partial (website contact form) | 🟠 High | Apple requires a working Support URL. Include an email address. |
| **Cookie / tracking notice** (web) | n/a today | 🟡 Medium | Needed only if analytics sets cookies or identifiers. Prefer cookieless analytics. |
| **Accessibility statement** | ❌ Missing | 🟡 Medium | Good practice for ADA risk. Include contact for accessibility issues. |
| **Open-source licenses notice** | ❌ Missing | 🟡 Medium | See §4 |

### Privacy Policy must cover (tailored to this app)
- [ ] Who we are (legal entity, address `121 W. Wilson Bridge Road, Suite 140, Worthington, OH 43085`, contact email).
- [ ] What the app collects **directly**: today nothing. After launch: crash diagnostics (Sentry), anonymous usage analytics, push token (if push).
- [ ] What third parties receive when you use the app: **Whoosh** (bookings and payments, under its own policy), **Google** (Fonts, unless self-hosted; Maps), **Apple Maps**, **Webflow CDN** (images/video), **Instagram/Meta** (when opened), the hosting provider (Cloudflare/Vercel server logs).
- [ ] Purpose and legal basis, retention periods, security measures.
- [ ] User rights and how to exercise them (email), plus the response timeline.
- [ ] Children: the app isn't directed to children under 13, and no personal data is knowingly collected from them.
- [ ] No sale or sharing of personal information (CCPA wording, even if thresholds aren't met; it costs nothing and builds trust).
- [ ] Changes-to-policy clause and effective date.

## 2. Privacy regulations: applicability matrix

| Law | Applies? | Reasoning | Actions |
|---|---|---|---|
| **CCPA/CPRA** (California) | **Probably not** (thresholds: ~$26.6M+ revenue, or buying/selling/sharing PI of 100k+ consumers, or 50 %+ revenue from selling PI) **[verify revenue]** | A single venue is unlikely to meet the thresholds | Adopt CCPA-style disclosures anyway ("we do not sell or share"). Revisit if accounts or ad SDKs are added. |
| **Other US state privacy laws** (Virginia, Colorado, Texas, etc.) | Probably not (consumer-count thresholds) | Ohio had no comprehensive consumer privacy law in force at last check **[verify]** | Monitor. Revisit when accounts or loyalty launch. |
| **GDPR / UK GDPR** | **Only if offered in the EU/UK** | The app targets Ohio residents. The web is reachable globally, but it isn't *targeted* at the EU. | Limit store availability to the US. Self-host fonts. If the EU is ever added: lawful basis, a consent banner for analytics, DPA with Sentry/PostHog, EU representative. |
| **India DPDP Act 2023 (+ DPDP Rules 2025)** | **Low / conditional** | Applies to processing of digital personal data *within India*, or outside India in connection with offering goods/services to people in India. The app doesn't target India. **However, if an India-based development team accesses personal data (e.g., Sentry events with IPs), that processing may happen in India.** **[verify with counsel]** | Keep Sentry/analytics free of personal data (IP scrubbing, no user IDs). Sign a data-processing agreement between The Slice and the agency defining the agency as processor. Limit console access. |
| **COPPA** (US, under-13) | Not directed to children, so no, provided **no data is collected from known children** | Family-oriented venue | Don't target under-13 in Play's Target Audience. No child-directed features. No analytics identifiers. |
| **CAN-SPAM / TCPA** | Only if email or SMS marketing is added | — | Push notifications are not TCPA-regulated, but use opt-in and an easy opt-out anyway. |
| **State data-breach notification laws** (Ohio R.C. 1349.19, etc.) | Applies to personal information if ever stored | Not applicable today | Incident runbook P7 |

## 3. Consumer-protection and content

| Item | Status | Priority | Action |
|---|---|---|---|
| **FTC Rule on Consumer Reviews and Testimonials** (16 CFR Part 465, in force since Oct 2024) prohibits fake or misrepresented testimonials | ⚠️ **Risk**: `src/routes/about.tsx:65-86` shows named, anticipatory pre-opening quotes ("We'll be there week one") | 🔴 Critical | Confirm each testimonial is a **real, consented** statement. Otherwise remove it or replace it with real reviews (with permission). Keep written consent records. |
| Accurate opening status and dates | ⚠️ "Opening Fall 2026" (`about.tsx:21`, `events.tsx:53`) | 🟠 High | Update the copy. Stale claims also risk store rejection (2.3.1). |
| Membership claims ("Exclusive Founders pricing", "Limited memberships") | `memberships.tsx:27-31,39` | 🟡 Medium | Make sure the claims are true and the terms are linked (the membership page on the website). |
| Alcohol promotion | If menu or promo content features alcohol | 🟡 Medium | Follow Ohio liquor-control advertising rules for drink specials (e.g., limits on drink-special timing) **[verify OAC 4301:1-1-50]**. Answer the store age-rating questions accordingly. Don't push-notify alcohol promos to users who may be under 21. |
| **ADA / accessibility** | Gaps (menu dialog, carousel; see E7) | 🟠 High | US businesses with public websites and apps face a steady volume of ADA Title III lawsuits. Target **WCAG 2.2 AA**. Publish an accessibility statement. |
| Trademarks | "Full Swing" (third party), "Approachable Golf ™" (`index.tsx:108`), Whoosh, Instagram | 🟡 Medium | Use "Full Swing" only descriptively. Confirm The Slice owns or has filed "Approachable Golf" (otherwise drop the ™). Follow Instagram brand guidelines if its glyph is used. |
| Imagery rights | Webflow-hosted photos and video | 🟡 Medium | Confirm photographer licences cover app-store use. Confirm model releases for identifiable guests in `TS VibeImages`. |

## 4. Third-party and open-source licenses

All direct runtime dependencies are permissive. A notice is still required for distribution.

| Component | License | Obligation |
|---|---|---|
| React, React DOM | MIT | Include the notice |
| TanStack Router / Start / Query | MIT | Include the notice |
| Capacitor core and plugins | MIT | Include the notice |
| lucide-react | ISC | Include the notice |
| clsx, tailwind-merge, Tailwind CSS | MIT | Include the notice (CSS output) |
| **Montserrat** font (if self-hosted) | **SIL OFL 1.1** | Include the OFL text. Don't sell the font by itself. |
| AndroidX libraries | Apache-2.0 | Include the notice (the Play OSS licenses plugin automates this) |
| Radix UI, recharts, etc. | MIT | **Remove** (unused) rather than attribute |

**How:**
- [ ] `npx license-checker-rseidelsohn --production --summary` in CI. Fail on GPL/AGPL/unknown.
- [ ] Generate `THIRD_PARTY_NOTICES.md` per release. Expose it on the in-app info screen (E6.4).
- [ ] Android: `com.google.android.gms:oss-licenses-plugin` or include the generated notices in the web screen.
- [ ] Attach the CycloneDX SBOM to GitHub Releases.

## 5. Contracts and ownership

- [ ] **IP assignment and source handover** between the agency and The Slice (code, design, store accounts, signing keys). `PROJECT_ESTIMATE.md:75` lists "signing-key handoff documentation" as in scope.
- [ ] **Data Processing Agreements** with Sentry, the analytics provider and the hosting provider (standard online DPAs).
- [ ] Review the **Whoosh terms** for linking and branding (deep-linking to a club agenda URL) and any API terms if integration is pursued.
- [ ] Apple Developer Program License Agreement and Google Play Developer Distribution Agreement are accepted **by The Slice's legal entity**.
- [ ] Domain ownership (`thesliceworthington.com`) is held by The Slice. DNS access is documented.
