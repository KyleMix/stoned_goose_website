import { motion } from "framer-motion";
import { Film, Handshake, Mic2, Sparkles } from "lucide-react";

import brendanPhoto from "@assets/generated_images/brendan.png";
import josephPhoto from "@assets/generated_images/joseph.jpg";
import kylePhoto from "@assets/generated_images/kyle.png";
import samPhoto from "@assets/generated_images/sam.png";
import garrettphoto from "@assets/generated_images/garrett-iverson.jpg";
import { SectionHeading, SectionShell } from "@/components/SectionShell";

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

const teamMembers = [
  { name: "Kyle Mixon", role: "Founder & Producer", photo: kylePhoto },
  { name: "Joseph Humphrey", role: "Media & Production", photo: josephPhoto },
  { name: "Brendan Meeks", role: "Creative Director", photo: brendanPhoto },
  { name: "Samuel Tweed", role: "Stage Manager", photo: samPhoto },
  { name: "Garrett Iverson", role: "Photographer", photo: garrettphoto },
];

export default function About() {
  return (
    <SectionShell id="about" surface="muted" className="overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <SectionHeading
            title={<>About the <span className="text-primary">Team</span></>}
            subtitle="Stoned Goose Productions is a crew of producers, performers, and media pros building cinematic comedy experiences across the Pacific Northwest."
          />
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

        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <SectionHeading
              title={<>Meet the <span className="text-primary">Crew</span></>}
              subtitle="Faces behind the productions."
            />
          </motion.div>

          <div className="flex flex-nowrap justify-center gap-6 overflow-x-auto pb-2">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group min-w-[200px] max-w-[200px]"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-4 border-2 border-transparent group-hover:border-primary transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/60 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover transition duration-300 ease-out filter grayscale group-hover:grayscale-0 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>

                <div className="text-center">
                  <h4 className="text-xl font-display uppercase text-white">{member.name}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
