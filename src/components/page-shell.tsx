import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { WHOOSH_BOOKING_URL } from "@/lib/links";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background px-6 pb-safe">
      <SiteHeader />
      <div className="flex-1 py-8">{children}</div>
      <a
        href={WHOOSH_BOOKING_URL}
        className="glow-primary mb-4 flex h-16 items-center justify-between rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        <span className="flex-1 text-center">Book a Bay</span>
        <ArrowRight className="h-5 w-5" />
      </a>
    </main>
  );
}
