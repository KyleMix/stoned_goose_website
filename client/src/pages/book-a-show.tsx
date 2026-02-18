import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitLeadForm } from "@/lib/leadFormSubmission";
import { AREA_SERVED, SITE_URL } from "@/data/seo";

const packageTiers = [
  {
    name: "Starter Showcase",
    price: "$750+",
    includes: [
      "Curated lineup for 60-120 guests",
      "Host + 2-3 touring or regional comedians",
      "Basic run-of-show and venue coordination",
    ],
  },
  {
    name: "Featured Night",
    price: "$1,500+",
    includes: [
      "Best for ticketed nights with 120-250 attendees",
      "Headliner + featured support + emcee",
      "Promo copy + launch guidance + day-of talent management",
    ],
  },
  {
    name: "Premium Event",
    price: "$2,750+",
    includes: [
      "Corporate, festivals, and anchor programming",
      "Custom lineup strategy for brand or fundraising goals",
      "Full production planning with white-glove coordination",
    ],
  },
];

const proofPoints = [
  "South Sound promoter relationships with local and touring talent",
  "Audience-first lineup strategy based on venue and event goals",
  "Fast turnarounds with clear pricing and scope alignment",
  "Production-minded planning to reduce day-of surprises",
];

const qualificationSchema = z.object({
  name: z.string().min(2, "Add your name"),
  email: z.string().email("Add a valid email"),
  venueType: z.string().min(1, "Select your venue type"),
  eventDate: z.string().min(1, "Add a date or timeframe"),
  audienceSize: z.string().min(1, "Select your audience size"),
  budgetBand: z.string().min(1, "Select a budget band"),
  details: z.string().min(10, "Share a bit about your goals"),
});

type QualificationValues = z.infer<typeof qualificationSchema>;

export default function BookAShowPage() {
  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QualificationValues>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      name: "",
      email: "",
      venueType: "",
      eventDate: "",
      audienceSize: "",
      budgetBand: "",
      details: "",
    },
  });

  async function onSubmit(values: QualificationValues) {
    setStatus(null);
    setIsSubmitting(true);

    const subject = "Book a Show Inquiry";
    const message = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Venue type: ${values.venueType}`,
      `Event date: ${values.eventDate}`,
      `Audience size: ${values.audienceSize}`,
      `Budget band: ${values.budgetBand}`,
      `Event goals: ${values.details}`,
    ].join("\n");

    try {
      await submitLeadForm({
        name: values.name,
        email: values.email,
        subject,
        message,
      });

      setStatus({
        type: "success",
        message: "Thanks! We’ll follow up with a recommended package shortly.",
      });
      form.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again soon.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Comedy Show Booking",
    description:
      "Book curated comedy shows with tiered packages for venues, private events, and corporate programs.",
    areaServed: AREA_SERVED,
    provider: {
      "@type": "LocalBusiness",
      name: "Stoned Goose Productions",
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Book a Comedy Show | Stoned Goose Productions"
        description="Explore package tiers, proof points, and submit a short qualification form to book a comedy show in the South Sound."
        path="/book-a-show"
      />
      <JsonLd id="book-a-show-service" data={serviceSchema} />
      <Navbar />
      <main className="pb-20">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">
              Book a Show
            </p>
            <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6">
              Stand-Up Packages Built for Your Room
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Whether you&apos;re launching a first comedy night or scaling a recurring
              series, we pair the right talent mix with production support so your
              event lands with audiences and sponsors.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-6">
              Package Tiers
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {packageTiers.map((tier) => (
                <Card key={tier.name} className="bg-card/40 border-border/60">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-secondary mb-2">
                        {tier.name}
                      </p>
                      <p className="text-2xl font-display text-white">{tier.price}</p>
                    </div>
                    <ul className="space-y-2 text-gray-300 text-sm leading-relaxed">
                      {tier.includes.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-6">
              Why buyers choose us
            </h2>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <ul className="space-y-3 text-gray-300">
                {proofPoints.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="qualification-form" className="py-12">
          <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-[1fr_1.1fr] items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-display uppercase text-white">
                Short qualification form
              </h2>
              <p className="text-gray-400">
                Give us a quick snapshot of your venue, audience, and budget so we
                can route you to the right package and talent options on the first
                reply.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
                <p className="text-sm uppercase tracking-wide text-gray-400 mb-3">
                  What happens next
                </p>
                <ul className="space-y-2">
                  <li>• We review fit and availability within 1-2 business days</li>
                  <li>• You get tier recommendations matched to your goals</li>
                  <li>• We align talent options and timeline for booking</li>
                </ul>
              </div>
            </div>

            <Card className="bg-card/50 border-border/60">
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary">
                      Contact
                    </p>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your name"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="you@email.com"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <p className="pt-2 text-xs uppercase tracking-[0.3em] text-secondary">
                      Lead qualification
                    </p>
                    <FormField
                      control={form.control}
                      name="venueType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Venue type</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="" className="text-black">Select one</option>
                              <option value="Comedy club" className="text-black">Comedy club</option>
                              <option value="Brewery / bar" className="text-black">Brewery / bar</option>
                              <option value="Theater / performing arts" className="text-black">Theater / performing arts</option>
                              <option value="Corporate / private event" className="text-black">Corporate / private event</option>
                              <option value="Other" className="text-black">Other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Target date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Date or timeframe"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="audienceSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Audience size</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="" className="text-black">Select one</option>
                              <option value="Under 75" className="text-black">Under 75</option>
                              <option value="75-150" className="text-black">75-150</option>
                              <option value="150-300" className="text-black">150-300</option>
                              <option value="300+" className="text-black">300+</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budgetBand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Budget band</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="" className="text-black">Select one</option>
                              <option value="Under $1k" className="text-black">Under $1k</option>
                              <option value="$1k-$2.5k" className="text-black">$1k-$2.5k</option>
                              <option value="$2.5k-$5k" className="text-black">$2.5k-$5k</option>
                              <option value="$5k+" className="text-black">$5k+</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Goals / notes</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Anything else that helps us qualify your show"
                              className="min-h-[100px] bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-black font-bold uppercase hover:scale-[1.02] transition-transform"
                    >
                      {isSubmitting ? "Sending..." : "Get Qualified"}
                    </Button>
                    {status && (
                      <p
                        className={`text-sm ${
                          status.type === "success" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {status.message}
                      </p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
