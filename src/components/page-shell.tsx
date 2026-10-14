import type { ReactNode } from "react";
import { BrandCta } from "@/components/brand-cta";
import { SiteHeader } from "@/components/site-header";
import { WHOOSH_BOOKING_URL } from "@/lib/links";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background px-6 pb-safe">
      <SiteHeader />
      <div className="flex-1 py-8">{children}</div>
      <BrandCta href={WHOOSH_BOOKING_URL} className="mb-4">
        Book a Bay
      </BrandCta>
    </main>
  );
}
