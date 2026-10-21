import { ArrowRight } from "lucide-react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isNativePlatform, openExternalUrl } from "@/lib/platform";

const ease = "ease-[cubic-bezier(0.65,0,0.35,1)]";
const roll = `transition-transform duration-300 ${ease} motion-reduce:transition-none`;

export type BrandCtaVariant = "primary" | "outline";

interface BrandCtaProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: BrandCtaVariant;
}

export function BrandCta({
  children,
  className,
  variant = "primary",
  onClick,
  href,
  ...props
}: BrandCtaProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && href && isNativePlatform() && /^https?:\/\//.test(href)) {
      event.preventDefault();
      void openExternalUrl(href);
    }
  };

  return (
    <a
      {...props}
      href={href}
      onClick={handleClick}
      className={cn(
        "group relative flex h-16 w-full touch-manipulation items-center justify-center rounded-full py-4 pl-6 pr-16 text-lg font-semibold",
        `transition-[transform,background-color,color] duration-300 ${ease} motion-reduce:transition-none`,
        variant === "primary"
          ? "border-2 border-transparent bg-black text-white hover:bg-primary hover:text-black focus-visible:bg-primary focus-visible:text-black active:bg-primary active:text-black"
          : "border-2 border-foreground bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-black focus-visible:border-primary focus-visible:bg-primary focus-visible:text-black active:border-primary active:bg-primary active:text-black",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.96]",
        className,
      )}
    >
      <span className="relative block h-[1.3em] overflow-hidden leading-[1.3em]">
        <span
          className={cn(
            "block group-hover:-translate-y-full group-focus-visible:-translate-y-full group-active:-translate-y-full",
            roll,
          )}
        >
          {children}
        </span>
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 block translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0 group-active:translate-y-0",
            roll,
          )}
        >
          {children}
        </span>
      </span>

      <span
        className={cn(
          "absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center overflow-hidden rounded-full bg-primary text-black",
          "group-hover:bg-black group-hover:text-white group-focus-visible:bg-black group-focus-visible:text-white group-active:bg-black group-active:text-white",
          `transition-colors duration-300 ${ease} motion-reduce:transition-none`,
        )}
      >
        <span className="relative block size-5 overflow-hidden">
          <ArrowRight
            className={cn(
              "absolute inset-0 size-5 group-hover:-translate-y-full group-focus-visible:-translate-y-full",
              "group-active:-translate-y-full",
              roll,
            )}
          />
          <ArrowRight
            aria-hidden
            className={cn(
              "absolute inset-0 size-5 translate-y-full group-hover:translate-y-0 group-focus-visible:translate-y-0",
              "group-active:translate-y-0",
              roll,
            )}
          />
        </span>
      </span>
    </a>
  );
}
