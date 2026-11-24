# ADR-0004: No certificate pinning, root detection or obfuscation for v1

- **Status:** Accepted
- **Date:** 2026-11-18

## Context
Security questionnaires and OWASP MASVS-RESILIENCE / MASVS-NETWORK ask about certificate pinning, root/jailbreak detection and code obfuscation. This app has no first-party API, no user accounts, no stored secrets and no payments in-app (`03-security-checklist.md`, threat model).

## Decision
- **No certificate pinning.** The only network peers are third parties (Whoosh, Webflow CDN, Google Fonts/Maps, Instagram) whose certificates rotate outside our control. Pinning would risk a full outage for no security gain.
- **No root/jailbreak detection or anti-tamper.** There's nothing valuable to protect on-device.
- **R8 minification enabled** for size, not as a security control.

## Consequences
- Revisit when any of these ship: a first-party API, accounts/tokens, loyalty points with monetary value, or in-app payments. At that point, pin to our own API's SPKI with a backup pin, and consider Play Integrity / App Attest.
- This ADR is the documented answer for security reviews and questionnaires.
