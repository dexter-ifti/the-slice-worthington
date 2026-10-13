# The Slice PWA

Mobile-first launch screen for The Slice, a social golf simulator venue in Worthington, Ohio.

## Local development

```bash
npm install
npm run dev
```

Build for deployment with `npm run build`; the static output is written to `dist/`.

## Brand handoff

The visual system was extracted from the live site CSS at [thesliceworthington.com](https://www.thesliceworthington.com/):

- Warm beige: `#fcfbf5` — live site `--beige-background`
- Ink: `#0e0e0e` — live site text-dark token
- Primary cyan: `#02c5fb` — live site `--primary`
- Secondary blue: `#280fb5` — live site `--secondary`
- Supporting pale blue: `#eef4f8` — live site primary-light token
- Body/display type: Montserrat
- Supporting/compact type: Inter Tight
- Logo: `public/assets/the-slice-logo.svg`, supplied from the live site CDN
- Hero image: `public/assets/the-slice-hero.jpg`, the live site’s mobile hero poster
- Browser favicon: `public/icons/favicon.png`, sourced directly from `https://a.favicon.im/www.thesliceworthington.com`
- PWA/mobile icons: `public/icons/`, derived from the same mark as white-on-black so the transparent black source stays readable on installed-app surfaces

Future memberships, events, and promotions should be added where the `future-sections` marker is defined in `src/main.jsx`; the section is intentionally hidden in v1.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for DNS, HTTPS, Whoosh behavior, and the iPhone test checklist.
