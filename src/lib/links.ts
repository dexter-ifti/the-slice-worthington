export const WHOOSH_BOOKING_URL =
  "https://app.whoosh.io/patron/club/the-slice/agenda/simulators/today";
export const HERO_VIDEO_DESKTOP_URL = "/media/hero-desktop.mp4";
export const HERO_VIDEO_MOBILE_URL = "/media/hero-mobile.mp4";
export const WEBSITE_URL = "https://www.thesliceworthington.com";
export const MEMBERSHIPS_URL = "https://www.thesliceworthington.com/memberships";
export const CONTACT_US_URL = "https://www.thesliceworthington.com/contact-us";
export const INSTAGRAM_URL = "https://www.instagram.com/thesliceworthington/";
export const MAPS_URL = "https://maps.app.goo.gl/RbWzn94NjXnMYyX49";
export const ADDRESS = "121 W. Wilson Bridge Road, Suite 140, Worthington, Ohio 43085";

const externalHosts = new Set([
  "app.whoosh.io",
  "www.thesliceworthington.com",
  "instagram.com",
  "www.instagram.com",
  "maps.app.goo.gl",
  "maps.apple.com",
]);

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function getAllowedExternalUrl(value: string): URL | null {
  const url = parseUrl(value);
  if (
    !url ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !externalHosts.has(url.hostname)
  ) {
    return null;
  }

  return url;
}

const appLinkOrigin = "https://app.thesliceworthington.com";
const appLinkPaths = new Set([
  "/",
  "/about",
  "/contact",
  "/events",
  "/memberships",
  "/privacy",
  "/simulators",
]);

export function getAppLinkPath(value: string): string | null {
  const url = parseUrl(value);
  if (
    !url ||
    url.protocol !== "https:" ||
    url.origin !== appLinkOrigin ||
    url.username ||
    url.password
  ) {
    return null;
  }
  const path = url.pathname.replace(/([^/])\/$/, "$1");
  return appLinkPaths.has(path) ? path : null;
}
