import type { ReactNode } from "react";
import { BrandCta, type BrandCtaVariant } from "@/components/brand-cta";
import { SiteHeader } from "@/components/site-header";
import { WHOOSH_BOOKING_URL } from "@/lib/links";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  bookingCtaHelper?: string;
  bookingCtaVariant?: BrandCtaVariant;
  wide?: boolean;
}

export function PageShell({
  children,
  bookingCtaHelper,
  bookingCtaVariant = "primary",
  wide = false,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-[100dvh] w-full flex-col bg-background px-6 pb-[calc(10rem+env(safe-area-inset-bottom))]",
        wide ? "max-w-6xl" : "max-w-md",
      )}
    >
      <SiteHeader />
      <div className="flex-1 pt-8">{children}</div>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-6 pb-safe">
        <div className="pointer-events-auto bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
          {bookingCtaHelper && (
            <p className="mb-2 text-center text-sm text-muted-foreground">{bookingCtaHelper}</p>
          )}
          <BrandCta href={WHOOSH_BOOKING_URL} variant={bookingCtaVariant}>
            Book a Bay
          </BrandCta>
        </div>
      </div>
    </main>
  );
}
