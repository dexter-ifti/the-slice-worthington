# The Slice PWA deployment

The app is a static Vite build. Deploy the `dist/` directory to Vercel, Netlify, or Cloudflare Pages.

## Recommended: Vercel

1. Import this repository into Vercel and keep the framework preset as **Vite**.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add the custom domain `app.thesliceworthington.com` in the Vercel project settings.
5. The club’s DNS provider should add this exact record:

   ```text
   Type:  CNAME
   Name:  app
   Value: cname.vercel-dns.com
   TTL:   Auto (or 3600)
   ```

   If the provider automatically appends the parent domain, enter only `app` as the name. Remove any older `A`, `AAAA`, or `CNAME` record that already owns `app.thesliceworthington.com`.
6. Vercel provisions and renews HTTPS automatically after DNS validation. Confirm the domain shows as **Valid** before sharing the home-screen install instructions.

The same `dist/` output can be used with Netlify or Cloudflare Pages. Their custom-domain dashboards provide the provider-specific CNAME target; the Vercel record above is the stable recommended path for this handoff.

## Whoosh navigation decision

The Book a Bay action uses a normal external link with `target="_blank"`; it does not iframe Whoosh. On iPhone Safari this keeps the installed PWA in its own standalone context while opening Whoosh in Safari, so a customer can return by switching back to The Slice from the app switcher/home-screen icon. The small “Opens booking in a new tab” note makes the behavior explicit. This is the most dependable web-only option because an installed PWA cannot add a persistent native back button to a third-party page it no longer controls.

## Cache and offline behavior

`public/sw.js` precaches the app shell and local imagery on first load. The home screen continues to render offline. The Book a Bay action detects `navigator.onLine` and shows “You’re offline. Reconnect to book a bay.” instead of attempting to open Whoosh. Bump `CACHE_NAME` when changing shell assets so installed clients receive a fresh cache.

## iPhone Safari checklist

- Open `https://app.thesliceworthington.com` in Safari, confirm the install tip appears once, and use Share → Add to Home Screen.
- Launch The Slice from the new home-screen icon; confirm it opens standalone with no Safari chrome and respects the notch/home-bar safe areas.
- Tap **Book a Bay**; confirm Whoosh opens in a new Safari tab and The Slice remains available from the app switcher/home-screen icon.
- Return to The Slice and tap the address; confirm Apple Maps opens with the Worthington address.
- With the app shell loaded, enable Airplane Mode, relaunch the app, and confirm the page and imagery still render.
- While offline, tap **Book a Bay** and confirm the friendly offline message appears and no dead navigation occurs.
- Dismiss the install tip, reload, and confirm it stays hidden; confirm it is hidden automatically when launched standalone.
