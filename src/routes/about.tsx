import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, MapPin, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";

const IMG =
  "https://cdn.prod.website-files.com/69ce6ac1f2e984905187f960/69df15a14b3d271b460b1166_TS%20VibeImages-01-1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Slice Worthington" },
      {
        name: "description",
        content:
          "Approachable Golf in Worthington, Ohio: simulator golf, great pizza and a laid-back vibe. Opening Fall 2026.",
      },
      { property: "og:title", content: "About The Slice" },
      {
        property: "og:description",
        content:
          "Approachable Golf in Worthington, Ohio: simulator golf, great pizza and a laid-back vibe. Opening Fall 2026.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: IMG },
      { name: "twitter:image", content: IMG },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const rows = [
  {
    icon: Users,
    t: "Fun for Everyone",
    d: "A true golf experience without losing the fun — avid golfers, beginners, and everyone in between.",
  },
  {
    icon: Gamepad2,
    t: "More Than Just Golf",
    d: "Multisport games like soccer, baseball, and football, plus interactive challenges kids and groups love.",
  },
  {
    icon: MapPin,
    t: "A Place to Gather",
    d: "Birthday parties, family nights, casual meetups, and group hangs — with great food, drinks, and a relaxed vibe.",
  },
];

const testimonials = [
  {
    q: "We’ve been waiting for something like this in Worthington. A place where we can bring the kids and still actually enjoy ourselves? We’ll be there week one.",
    by: "Sarah M., Worthington",
  },
  {
    q: "Already planning our girls’ night here as soon as it opens. Golf without the pressure plus good food and drinks… I’m in.",
    by: "Emily R., Columbus",
  },
  {
    q: "The multisport setup is what sold me. My kids aren’t all into golf, but this gives everyone something to do. Can’t wait to check it out.",
    by: "Jason K., Dublin",
  },
  {
    q: "Finally something different in the area. This feels like the kind of spot you go once and then keep coming back to. Counting down to opening day.",
    by: "Lauren T., Powell",
  },
];

function About() {
  return (
    <PageShell>
      <h1 className="font-display text-4xl font-semibold leading-tight">More Than Just Golf</h1>
      <p className="mt-3 text-foreground/80">
        Approachable Golf™, right here in Worthington, Ohio. Your go-to spot for simulator golf,
        multisport games, great pizza, and a laid-back vibe. Swing, smile, and stay awhile.
        <strong className="mt-2 block text-primary">Opening Fall of 2026!</strong>
      </p>
      <div className="group mt-6 overflow-hidden rounded-2xl">
        <img
          src={IMG}
          alt="The Slice lounge"
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <ul className="mt-4">
        {rows.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex gap-4 py-5">
            <Icon className="mt-1 h-6 w-6 text-primary" />
            <div>
              <h2 className="font-semibold">{t}</h2>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-2xl font-semibold">What People Are Saying</h2>
      <div className="mt-4 space-y-3">
        {testimonials.map(({ q, by }) => (
          <blockquote key={by} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-foreground/90">“{q}”</p>
            <footer className="mt-3 text-xs font-semibold text-primary">— {by}</footer>
          </blockquote>
        ))}
      </div>
    </PageShell>
  );
}
