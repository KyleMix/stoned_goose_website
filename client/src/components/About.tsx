import { motion } from "framer-motion";
import { Film, Handshake, Mic2, Sparkles } from "lucide-react";

const pillars = [
  {
    title: "Production & Ops",
    description:
      "Producers, bookers, and stage managers who keep tours, residencies, and monthly showcases running smoothly.",
    icon: Mic2,
  },
  {
    title: "Media Team",
    description:
      "Cinematographers, editors, and photographers crafting specials, podcast visuals, and crisp headshots for every comic.",
    icon: Film,
  },
  {
    title: "Community & Partners",
    description:
      "Venue partners, sponsors, and collaborators who help us elevate Pacific Northwest comedy together.",
    icon: Handshake,
  },
  {
    title: "Creative Lab",
    description:
      "Writers and creative directors shaping new formats, themed shows, and social content that keeps audiences engaged.",
    icon: Sparkles,
  },
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-muted/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
            About the <span className="text-primary">Team</span>
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Stoned Goose Productions is a crew of producers, performers, and media pros
            building cinematic comedy experiences across the Pacific Northwest.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="h-full"
            >
              <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 flex flex-col gap-4 hover:border-primary/60 transition-colors">
                <pillar.icon className="w-10 h-10 text-primary" />
                <h3 className="text-2xl font-display uppercase text-white">{pillar.title}</h3>
                <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
