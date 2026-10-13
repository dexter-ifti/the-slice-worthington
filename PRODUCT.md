# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Vite + React, with a static deployment target and no backend

## Users

Customers of The Slice, a social golf simulator venue in Worthington, Ohio, usually arriving from an iPhone home-screen icon and looking to book a simulator bay quickly.

## Product Purpose

The Slice app is a branded launch screen whose primary job is to get a customer into the existing Whoosh booking platform in one tap. Success means a customer can understand the venue, find the booking action immediately, and recover gracefully when offline.

## Positioning

Approachable Golf™: a welcoming, family-friendly social venue for simulator golf, food, and gathering rather than a formal or exclusive golf club.

## Operating Context

The app is hosted at app.thesliceworthington.com and is intended to be installed to an iPhone home screen. Booking, payments, and accounts remain in Whoosh.

## Capabilities and Constraints

- v1 has one home screen only.
- The primary action links to the Whoosh simulator agenda.
- The address opens Apple Maps; the main site remains available.
- The app must be mobile-first, accessible, fast, installable as a PWA, and able to load its shell offline.
- Whoosh must not be embedded in an iframe; the chosen navigation behavior is documented with the deployment/test notes.
- Future sections for Memberships, Events, and Promotions should have an explicit code/layout extension point but remain hidden in v1.

## Brand Commitments

The product name is The Slice. Required language includes “Swing. Smile. Stay Awhile.” and “Approachable Golf™”. Tone is fun, welcoming, approachable, and family-friendly. The supplied black horizontal logo is the source logo asset. The live site is the brand reference.

## Evidence on Hand

The live site at https://www.thesliceworthington.com/ supplies the brand language, imagery, logo, and CSS tokens. The venue address is 121 W. Wilson Bridge Road, Suite 140, Worthington, OH 43085. The app should mention five simulator bays. No backend, login, payment, or account system is in scope.

## Product Principles

- Booking should be the obvious next step.
- A first-time visitor should feel invited, not sold to.
- Keep the launch surface light enough to feel instant on a phone.
- Preserve a clear path back to The Slice after an external booking flow.

## Accessibility & Inclusion

Body text is at least 16px, tap targets are thumb-friendly, focus states are visible, imagery has alt text, and contrast must meet WCAG AA.
