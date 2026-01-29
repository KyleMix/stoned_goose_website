import { motion } from "framer-motion";
import { Mic2, CalendarRange, Users, Radio, Camera } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    title: "Live Show Production",
    slug: "live-show-production",
    description: "From intimate clubs to theaters, we handle everything from booking to stage management.",
    icon: Mic2,
    color: "text-primary",
  },
  {
    title: "Comedian Booking",
    slug: "comedian-booking",
    description: "Need talent? We have a roster of the funniest people you've never heard of (yet).",
    icon: Users,
    color: "text-secondary",
  },
  {
    title: "Corporate Events",
    slug: "corporate-events",
    description: "Make your company party less awkward. We bring the laughs, you bring the open bar.",
    icon: CalendarRange,
    color: "text-blue-400",
  },
  {
    title: "Media & Podcasts",
    slug: "media-podcasts",
    description: "Full service audio/video production for comedy specials and podcast series.",
    icon: Radio,
    color: "text-pink-500",
  },
  {
    title: "Headshots & Promo Shoots",
    slug: "headshots-promo-shoots",
    description:
      "Professional headshots and press kits to spotlight comedians, staff, and partners in the best light.",
    icon: Camera,
    color: "text-amber-400",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="py-20 relative overflow-hidden bg-gradient-to-b from-muted/40 via-background/20 to-muted/40"
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-56 w-[80%] -translate-x-1/2 rounded-full bg-secondary/10 blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
            What We <span className="text-secondary">Do</span>
          </h2>
          <p className="text-primary/80 uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-3">
            We book revenue-generating services.
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We don't just tell jokes. We build the stage for them—and capture the headshots to match.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Request a Quote
            </Link>
            <Link
              href="/#services"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View Services
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/?service=${service.slug}#contact`}
                className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="bg-card/50 border-border hover:border-white/20 transition-all duration-300 h-full hover:-translate-y-2">
                  <CardHeader>
                    <service.icon className={`w-12 h-12 mb-4 ${service.color}`} />
                    <CardTitle className="text-xl font-display uppercase text-white">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
