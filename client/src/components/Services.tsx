import { motion } from "framer-motion";
import { Mic2, CalendarRange, Users, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    title: "Live Show Production",
    description: "From intimate clubs to theaters, we handle everything from booking to stage management.",
    icon: Mic2,
    color: "text-primary",
  },
  {
    title: "Comedian Booking",
    description: "Need talent? We have a roster of the funniest people you've never heard of (yet).",
    icon: Users,
    color: "text-secondary",
  },
  {
    title: "Corporate Events",
    description: "Make your company party less awkward. We bring the laughs, you bring the open bar.",
    icon: CalendarRange,
    color: "text-blue-400",
  },
  {
    title: "Media & Podcasts",
    description: "Full service audio/video production for comedy specials and podcast series.",
    icon: Radio,
    color: "text-pink-500",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
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
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We don't just tell jokes. We build the stage for them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
