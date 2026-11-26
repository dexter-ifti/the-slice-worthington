import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CONTACT_US_URL,
  getAllowedExternalUrl,
  getAppLinkPath,
  HERO_VIDEO_DESKTOP_URL,
  HERO_VIDEO_MOBILE_URL,
  INSTAGRAM_URL,
  MAPS_URL,
  MEMBERSHIPS_URL,
  WHOOSH_BOOKING_URL,
} from "@/lib/links";

describe("The Slice external destinations", () => {
  it("keeps booking connected directly to Whoosh", () => {
    expect(WHOOSH_BOOKING_URL).toBe(
      "https://app.whoosh.io/patron/club/the-slice/agenda/simulators/today",
    );
  });

  it("uses the official Instagram destination for updates", () => {
    expect(INSTAGRAM_URL).toBe("https://www.instagram.com/thesliceworthington/");
  });

  it("provides both homepage video variants", () => {
    expect(HERO_VIDEO_DESKTOP_URL).toBe("/media/hero-desktop.mp4");
    expect(HERO_VIDEO_MOBILE_URL).toBe("/media/hero-mobile.mp4");
    expect(existsSync(`public${HERO_VIDEO_DESKTOP_URL}`)).toBe(true);
    expect(existsSync(`public${HERO_VIDEO_MOBILE_URL}`)).toBe(true);
  });
});

describe("Navigation URL validation", () => {
  it.each([
    "http://app.whoosh.io/",
    "//app.whoosh.io/",
    "https://app.whoosh.io.example.test/",
    "https://user@app.whoosh.io/",
    "https://app.whoosh.io:8443/",
    "javascript:alert(1)",
  ])("rejects an unapproved external URL (%s)", (url) => {
    expect(getAllowedExternalUrl(url)).toBeNull();
  });

  it("allows the current external destinations", () => {
    for (const url of [
      WHOOSH_BOOKING_URL,
      CONTACT_US_URL,
      INSTAGRAM_URL,
      MAPS_URL,
      MEMBERSHIPS_URL,
    ]) {
      expect(getAllowedExternalUrl(url)?.href).toBe(url);
    }
  });

  it("opens only a known app path and drops the query and fragment", () => {
    expect(getAppLinkPath("https://app.thesliceworthington.com/events/?id=1#heading")).toBe(
      "/events",
    );
    expect(getAppLinkPath("https://app.thesliceworthington.com/")).toBe("/");
    expect(getAppLinkPath("https://app.thesliceworthington.com//")).toBeNull();
    expect(getAppLinkPath("https://app.thesliceworthington.com/other")).toBeNull();
    expect(getAppLinkPath("https://example.test/events")).toBeNull();
    expect(getAppLinkPath("capacitor://localhost/events")).toBeNull();
  });
});
