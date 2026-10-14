import type { ReactNode } from "react";
import { BrandCta, type BrandCtaVariant } from "@/components/brand-cta";
import { SiteHeader } from "@/components/site-header";
import { WHOOSH_BOOKING_URL } from "@/lib/links";

interface PageShellProps {
  children: ReactNode;
  bookingCtaHelper?: string;
  bookingCtaVariant?: BrandCtaVariant;
}

export function PageShell({
  children,
  bookingCtaHelper,
  bookingCtaVariant = "primary",
}: PageShellProps) {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-background px-6 pb-safe">
      <SiteHeader />
      <div className="flex-1 pt-8">{children}</div>
      <div className="mt-6 mb-4">
        {bookingCtaHelper && (
          <p className="mb-2 text-center text-sm text-muted-foreground">{bookingCtaHelper}</p>
        )}
        <BrandCta href={WHOOSH_BOOKING_URL} variant={bookingCtaVariant}>
          Book a Bay
        </BrandCta>
      </div>
    </main>
  );
}
