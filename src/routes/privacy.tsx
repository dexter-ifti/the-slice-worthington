import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Slice Worthington" },
      {
        name: "description",
        content: "How The Slice Worthington web and mobile apps handle data.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <PageShell>
      <h1 className="font-display text-4xl font-semibold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-foreground/80">
        <p>
          The Slice Worthington web and mobile apps do not require an account or collect booking or
          payment information directly. The web app stores your choice to dismiss its install prompt
          and may cache public app pages and assets for offline use. The apps do not use analytics
          or advertising trackers.
        </p>
        <p>
          When you visit the web app, Vercel processes network information such as your IP address
          to deliver the site.
        </p>
        <p>
          When you follow a link to book a bay, get directions, visit Instagram, or use our main
          website, you are using Whoosh, Google Maps, Instagram, or thesliceworthington.com. Those
          services receive information from your browser and handle any information you provide
          under their own privacy policies.
        </p>
        <p>
          For privacy questions or to make a request about your data, use our{" "}
          <Link to="/contact" className="font-semibold underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
