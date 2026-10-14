import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Globe, Share, PlusSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-bay.jpg";
import {
  HERO_VIDEO_DESKTOP_URL,
  HERO_VIDEO_MOBILE_URL,
  WEBSITE_URL,
  WHOOSH_BOOKING_URL,
} from "@/lib/links";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Slice — Book a Golf Simulator Bay in Worthington" },
      {
        name: "description",
        content:
          "Approachable golf, multisport games, great pizza, and a laid-back vibe in Worthington.",
      },
      { property: "og:title", content: "The Slice — Book a Bay" },
      {
        property: "og:description",
        content:
          "Approachable golf, multisport games, great pizza, and a laid-back vibe in Worthington.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function useInstallHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const dismissed = localStorage.getItem("slice-install-dismissed") === "1";
    setShow(isIOS && !standalone && !dismissed);
  }, []);
  const dismiss = () => {
    localStorage.setItem("slice-install-dismissed", "1");
    setShow(false);
  };
  return { show, dismiss };
}

function Home() {
  const { show, dismiss } = useInstallHint();

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      <div className="hero-media absolute inset-0">
        <video
          className="hero-video h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroImg}
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_MOBILE_URL} media="(max-width: 767px)" type="video/mp4" />
          <source src={HERO_VIDEO_DESKTOP_URL} type="video/mp4" />
        </video>
        <div className="hero-scrim absolute inset-0" />
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-safe pb-safe">
        <SiteHeader />

        <div className="flex-1" />

        <section className="animate-rise space-y-4" style={{ animationDelay: "120ms" }}>
          <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground">
            Swing.
            <br />
            Smile.
            <br />
            Stay Awhile.
          </h2>
          <p className="max-w-xs text-lg text-foreground/85">
            Approachable golf, multisport games, great food, and a laid-back vibe in Worthington.
          </p>
        </section>

        <div className="animate-rise mt-8 space-y-3" style={{ animationDelay: "240ms" }}>
          <a
            href={WHOOSH_BOOKING_URL}
            className="glow-primary flex h-16 items-center justify-between rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <span className="flex-1 text-center">Book a Bay</span>
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            <Globe className="h-4 w-4" /> Visit our website
          </a>
          <p className="pt-2 text-center text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Golf, games, food, and good times
          </p>
        </div>
      </div>

      {show && (
        <div className="fixed inset-x-3 bottom-3 z-10 mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-4 backdrop-blur pb-safe">
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="pr-6 text-sm font-semibold text-card-foreground">
            Add The Slice to your Home Screen
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            Tap <Share className="h-4 w-4 text-primary" /> Share, then
            <PlusSquare className="h-4 w-4 text-primary" /> “Add to Home Screen”.
          </p>
        </div>
      )}
    </main>
  );
}
