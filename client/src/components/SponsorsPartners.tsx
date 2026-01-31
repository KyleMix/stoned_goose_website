import { motion } from "framer-motion";
import { HeartHandshake, Megaphone, PartyPopper, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    title: "Logo Placement",
    description: "Showcase your brand on event posters, digital promos, and venue signage.",
    icon: Sparkles,
  },
  {
    title: "On-Stage Shoutouts",
    description: "Host callouts and thank-yous during live sets and special showcases.",
    icon: Megaphone,
  },
  {
    title: "Co-Branded Events",
    description: "Collaborate on themed nights, activations, and VIP experiences.",
    icon: PartyPopper,
  },
  {
    title: "Social Mentions",
    description: "Get featured in our social recaps and audience engagement posts.",
    icon: HeartHandshake,
  },
];

export default function SponsorsPartners() {
  return (
    <section
      id="sponsors"
      className="py-20 bg-gradient-to-b from-background via-muted/30 to-background"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-primary/80 uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-3">
            Sponsors & Partners
          </p>
          <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
            Build the <span className="text-secondary">Laughs</span> Together
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We team up with local businesses and bold brands to amplify comedy across the South Sound.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/10 bg-muted/40 p-6 shadow-lg shadow-black/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-300">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild className="rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide">
            <Link href="/#contact?service=sponsorship">Start a Sponsorship</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
