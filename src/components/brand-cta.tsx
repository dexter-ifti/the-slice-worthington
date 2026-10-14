import { ArrowRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BrandCtaProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export function BrandCta({ children, className, ...props }: BrandCtaProps) {
  return (
    <a
      className={cn(
        "group flex h-16 items-center justify-between rounded-full bg-black pl-8 pr-2 text-lg font-semibold text-white transition-colors hover:bg-primary hover:text-primary-foreground active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      <span className="flex-1 text-center">{children}</span>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors group-hover:bg-black group-hover:text-white">
        <ArrowRight className="h-5 w-5" />
      </span>
    </a>
  );
}
