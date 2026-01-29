import { motion } from "framer-motion";
import { useState } from "react";
import { Mic2, CalendarRange, Users, Radio, Camera } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const pricingTiers = [
  {
    name: "Starter",
    description: "Perfect for intimate shows and first-time bookers.",
    priceNote: "Best for clubs & pop-ups",
    services: [
      "Talent sourcing + booking",
      "Basic run-of-show planning",
      "Day-of production coordination",
    ],
  },
  {
    name: "Pro",
    description: "Level up with pro production and content coverage.",
    priceNote: "Best for theaters & corporate events",
    services: [
      "Full booking + contracts management",
      "Production staffing & tech specs",
      "Photo + short-form recap assets",
    ],
  },
  {
    name: "Premium",
    description: "White-glove, end-to-end show production.",
    priceNote: "Best for festivals & branded activations",
    services: [
      "Executive producing & creative direction",
      "On-site video/audio capture",
      "Post-event marketing kit + highlights",
    ],
  },
];

const quoteFormSchema = z.object({
  serviceType: z.string().min(2, "Tell us what type of service you need"),
  eventDate: z.string().min(1, "Select a date or timeframe"),
  budgetRange: z.string().min(2, "Share a budget range"),
  venueSize: z.string().min(1, "Add an estimated audience size"),
  email: z.string().email("Add a valid email for follow-up"),
});

export default function Services() {
  const [quoteStatus, setQuoteStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false);

  const quoteForm = useForm<z.infer<typeof quoteFormSchema>>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      serviceType: "",
      eventDate: "",
      budgetRange: "",
      venueSize: "",
      email: "",
    },
  });

  async function onQuoteSubmit(values: z.infer<typeof quoteFormSchema>) {
    setQuoteStatus(null);
    setIsQuoteSubmitting(true);

    const subject = `Quick Quote: ${values.serviceType}`;
    const message = [
      `Service type: ${values.serviceType}`,
      `Event date: ${values.eventDate}`,
      `Budget range: ${values.budgetRange}`,
      `Venue size: ${values.venueSize}`,
      `Contact email: ${values.email}`,
    ].join("\n");

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/contact@stonedgooseproductions.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: "Quick Quote Request",
            email: values.email,
            subject,
            message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send quote request. Please try again.");
      }

      setQuoteStatus({
        type: "success",
        message: "Quote request sent! We'll follow up shortly.",
      });
      quoteForm.reset();
    } catch (error) {
      setQuoteStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again shortly.",
      });
    } finally {
      setIsQuoteSubmitting(false);
    }
  }

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-3xl md:text-4xl font-display uppercase text-white mb-4">
            Packages & <span className="text-secondary">Pricing</span>
          </h3>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Flexible tiers designed to match your venue size, audience, and production goals.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className="bg-card/40 border-border/60 hover:border-secondary/50 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-2xl font-display uppercase text-white">
                  {tier.name}
                </CardTitle>
                <p className="text-sm uppercase tracking-widest text-secondary">
                  {tier.priceNote}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">{tier.description}</p>
                <ul className="space-y-2 text-gray-300">
                  {tier.services.map((service) => (
                    <li key={service} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-3xl md:text-4xl font-display uppercase text-white">
              Get a <span className="text-secondary">Quote</span>
            </h3>
            <p className="text-gray-400">
              Tell us what you&apos;re planning and we&apos;ll map the perfect package.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
              <p className="text-sm uppercase tracking-wide text-gray-400 mb-3">
                What to expect
              </p>
              <ul className="space-y-2">
                <li>• Fast turnaround within 1-2 business days</li>
                <li>• Clear options tailored to your audience size</li>
                <li>• Bundled pricing for production + talent</li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-card/50 border-border/60">
              <CardContent className="p-6">
                <Form {...quoteForm}>
                  <form
                    onSubmit={quoteForm.handleSubmit(onQuoteSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={quoteForm.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Service type</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Corporate night, comedy showcase, podcast taping"
                              {...field}
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={quoteForm.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Event date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={quoteForm.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Budget range</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="$2k-$5k"
                              {...field}
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={quoteForm.control}
                      name="venueSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Venue size</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Estimated audience or seat count"
                              {...field}
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={quoteForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Contact email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@email.com"
                              {...field}
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Subject: Quick Quote — {quoteForm.watch("serviceType") || "General"}
                    </p>
                    <Button
                      type="submit"
                      disabled={isQuoteSubmitting}
                      className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-black font-bold uppercase hover:scale-[1.02] transition-transform"
                    >
                      {isQuoteSubmitting ? "Sending..." : "Request Quote"}
                    </Button>
                    {quoteStatus && (
                      <p
                        className={`text-sm ${
                          quoteStatus.type === "success"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {quoteStatus.message}
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
