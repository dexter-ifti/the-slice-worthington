import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CalendarDays,
  Flag,
  Info,
  Menu,
  Phone,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import logoLight from "@/assets/logo-light.svg";
import { WHOOSH_BOOKING_URL } from "@/lib/links";

const items = [
  { label: "Book a Bay", href: WHOOSH_BOOKING_URL, icon: Calendar, external: true, highlight: true },
  { label: "Our Simulators", to: "/simulators", icon: Flag },
  { label: "Events", to: "/events", icon: CalendarDays },
  { label: "Memberships", to: "/memberships", icon: Users },
  { label: "About Us", to: "/about", icon: Info },
  { label: "Contact", to: "/contact", icon: Phone },
] as const;

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="relative z-20 flex items-center justify-between pt-safe">
        <Link to="/" aria-label="The Slice home">
          <img src={logoLight} alt="The Slice Worthington" className="h-9 w-auto" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-full p-2 text-foreground transition-colors hover:text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {open && (
        <div className="menu-panel animate-rise fixed inset-0 z-50 flex flex-col px-6 pt-safe pb-safe" style={{ animationDuration: "0.25s" }}>
          <div className="flex items-center justify-between">
            <div>
              <img src={logo} alt="The Slice Worthington" className="h-9 w-auto" />
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {items.map((item) =>
              "href" in item ? (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-4 text-lg font-medium ${item.highlight ? "menu-item-active" : ""}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  <span aria-hidden>›</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 rounded-2xl px-4 py-4 text-lg font-medium"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  <span aria-hidden>›</span>
                </Link>
              ),
            )}
          </nav>

          <p className="text-center text-xs tracking-[0.3em] uppercase opacity-60">
            Golf. Play. Repeat.
          </p>
        </div>
      )}
    </>
  );
}
