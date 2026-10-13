import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import lounge from "@/assets/lounge-wide.jpg";

export const Route = createFileRoute("/simulators")({
  head: () => ({
    meta: [
      { title: "Our Simulators — The Slice Worthington" },
      { name: "description", content: "Simulator golf plus multisport games like soccer, baseball and football — fun for all ages at The Slice." },
      { property: "og:title", content: "Our Simulators — The Slice" },
      { property: "og:description", content: "Simulator golf plus multisport games like soccer, baseball and football — fun for all ages at The Slice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulators,
});

const features = [
  ["Fun for Everyone", "A true golf experience without losing the fun — avid golfers, beginners, and everyone in between."],
  ["More Than Just Golf", "Our simulators feature a full lineup of multisport games like soccer, baseball, football, and interactive challenges that kids and groups love."],
  ["All Ages", "Active, engaging, and perfect for all ages, so everyone has something to play."],
];

function Simulators() {
  return (
    <PageShell>
      <h1 className="font-display text-4xl font-semibold">Our Simulators</h1>
      <p className="mt-3 text-foreground/80">
        Sharpen your game, compete with friends, or just show up for a casual night out.
      </p>
      <img src={lounge} alt="Simulator bays" width={1600} height={912} loading="lazy" className="mt-6 aspect-[4/3] w-full rounded-2xl object-cover" />
      <ul className="mt-6 space-y-5">
        {features.map(([t, d]) => (
          <li key={t}>
            <h2 className="text-lg font-semibold">{t}</h2>
            <p className="text-sm text-muted-foreground">{d}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
