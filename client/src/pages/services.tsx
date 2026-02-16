import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/seo/SeoHead";
import { servicePages } from "@/data/servicePages";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const services = [
  {
    title: "Live Show Production",
    slug: "live-show-production",
    summary:
      "End-to-end production for comedy shows of any size, keeping the room tight and the punchlines landing.",
    benefits: [
      "Reliable, repeatable show flow that protects audience energy.",
      "Experienced producers coordinating talent, tech, and venues.",
      "Hands-on support to keep every set on schedule.",
    ],
    deliverables: [
      "Venue booking and show logistics planning.",
      "Stage management, run-of-show, and talent coordination.",
      "On-site production support and post-show recap.",
    ],
    idealClients: [
      "Comedy clubs and theaters booking recurring shows.",
      "Promoters scaling a new live comedy series.",
      "Festivals adding a comedy program or special event.",
    ],
  },
  {
    title: "Comedian Booking",
    slug: "comedian-booking",
    summary:
      "Match the right comics to the right crowd with a roster built for every room and vibe.",
    benefits: [
      "Curated talent that aligns with your audience.",
      "Fast turnaround on availability and contracts.",
      "Flexible lineups for one-off sets or long runs.",
    ],
    deliverables: [
      "Talent sourcing, vetting, and booking coordination.",
      "Contract management, scheduling, and travel details.",
      "Comedian communications and show-day briefings.",
    ],
    idealClients: [
      "Venues needing a consistent talent pipeline.",
      "Brands hosting comedy activations or launches.",
      "Event producers building polished lineups fast.",
    ],
  },
  {
    title: "Corporate Events",
    slug: "corporate-events",
    summary:
      "Custom comedy experiences that keep teams engaged without crossing lines.",
    benefits: [
      "Clean, tailored humor that fits your culture.",
      "Seasoned hosts that keep the agenda moving.",
      "Stress-free coordination with internal stakeholders.",
    ],
    deliverables: [
      "Comedian recommendations based on company goals.",
      "Show run-of-show and timing integration.",
      "Tech coordination for in-person or hybrid events.",
    ],
    idealClients: [
      "HR teams planning quarterly or annual events.",
      "Sales kickoffs or product launch celebrations.",
      "Conference organizers needing live entertainment.",
    ],
  },
  {
    title: "Media & Podcasts",
    slug: "media-and-podcasts",
    summary:
      "Audio and video production that captures comic voices with broadcast-ready quality.",
    benefits: [
      "Consistent sound and lighting across episodes.",
      "Creative direction to keep content sharp.",
      "Post-production polish for multiple platforms.",
    ],
    deliverables: [
      "Studio setup, recording, and episode engineering.",
      "Video capture, editing, and highlight clips.",
      "Distribution support for podcast and social.",
    ],
    idealClients: [
      "Comedians launching or leveling up a podcast.",
      "Brands creating comedy-forward video series.",
      "Studios producing specials or live recordings.",
    ],
  },
  {
    title: "Headshots & Promo Shoots",
    slug: "headshots-and-promo",
    summary:
      "Photography that sells the bit—clean, modern, and ready for press kits.",
    benefits: [
      "Fast, collaborative sessions with clear direction.",
      "Multiple looks to cover web, posters, and socials.",
      "Retouching that keeps performers recognizable.",
    ],
    deliverables: [
      "Styled headshot sessions in studio or on location.",
      "Retouched image gallery optimized for press use.",
      "Optional promo assets for posters and social.",
    ],
    idealClients: [
      "Comedians building or refreshing a press kit.",
      "Show runners needing cohesive talent imagery.",
      "Partners seeking branded promotional photography.",
    ],
  },
];

const venuePartnerFormSchema = z.object({
  venueName: z.string().min(2, "Add your venue name"),
  capacity: z.string().min(1, "Share the room capacity"),
  preferredNights: z.string().min(2, "Tell us which nights work best"),
  revenueSplitPreference: z.string().min(2, "Share your preferred split"),
  email: z.string().email("Add a valid contact email"),
});

export default function ServicesPage() {
  const [partnerStatus, setPartnerStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isPartnerSubmitting, setIsPartnerSubmitting] = useState(false);

  const venuePartnerForm = useForm<z.infer<typeof venuePartnerFormSchema>>({
    resolver: zodResolver(venuePartnerFormSchema),
    defaultValues: {
      venueName: "",
      capacity: "",
      preferredNights: "",
      revenueSplitPreference: "",
      email: "",
    },
  });

  async function onVenuePartnerSubmit(values: z.infer<typeof venuePartnerFormSchema>) {
    setPartnerStatus(null);
    setIsPartnerSubmitting(true);

    const subject = "Venue Partnership Inquiry";
    const message = [
      `Venue name: ${values.venueName}`,
      `Capacity: ${values.capacity}`,
      `Preferred nights: ${values.preferredNights}`,
      `Revenue split preference: ${values.revenueSplitPreference}`,
      `Contact email: ${values.email}`,
    ].join("\n");

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/kyle@stonedgooseproductions.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: "Venue Partner Program",
            email: values.email,
            subject,
            message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send partnership inquiry. Please try again.");
      }

      setPartnerStatus({
        type: "success",
        message: "Thanks! We'll be in touch about a venue partnership.",
      });
      venuePartnerForm.reset();
    } catch (error) {
      setPartnerStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again shortly.",
      });
    } finally {
      setIsPartnerSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Comedy Production Services | Olympia & South Sound | Stoned Goose Productions"
        description="Book live show production, comedian booking, corporate comedy, media, and headshot services across Olympia, Lacey, Tacoma, and the South Sound."
        path="/services"
      />
      <Navbar />
      <main className="pt-28 pb-20">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">
                Services
              </p>
              <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6">
                A full stack of comedy production support.
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                From Olympia to Tacoma and across the South Sound, we make it
                easy to book, produce, and promote comedy. Explore each service
                below and request a quote for your next show, corporate event,
                or media project.
              </p>
              <div className="mt-6 rounded-2xl border border-border/60 bg-card/40 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-secondary mb-4">
                  Quick links
                </p>
                <div className="flex flex-wrap gap-3">
                  {servicePages.map((service) => (
                    <a
                      key={service.slug}
                      href={`/${service.slug}`}
                      className="rounded-full border border-border/60 px-4 py-2 text-sm uppercase tracking-wide text-gray-200 hover:border-primary hover:text-primary transition-colors"
                    >
                      {service.title}
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                {services.map((service) => (
                  <a
                    key={service.slug}
                    href={`/${service.slug}`}
                    className="rounded-full border border-border/60 px-4 py-2 text-sm uppercase tracking-wide text-gray-200 hover:border-primary hover:text-primary transition-colors"
                  >
                    {service.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 space-y-10">
            {services.map((service) => (
              <article
                key={service.slug}
                className="scroll-mt-28 rounded-2xl border border-border/60 bg-card/40 p-8 md:p-10"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                  <div className="lg:w-1/3">
                    <a
                      href={`/${service.slug}`}
                      className="text-3xl font-display uppercase text-white hover:text-primary transition-colors"
                    >
                      {service.title}
                    </a>
                    <p className="mt-4 text-gray-300 leading-relaxed">
                      {service.summary}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button asChild className="uppercase">
                        <a href={`/${service.slug}`}>View Service Page</a>
                      </Button>
                      <Button asChild variant="outline" className="uppercase">
                        <a href="/#contact">Request a Quote</a>
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3 lg:w-2/3">
                    <div>
                      <h3 className="text-sm uppercase tracking-[0.3em] text-secondary mb-3">
                        Benefits
                      </h3>
                      <ul className="space-y-2 text-gray-300 text-sm leading-relaxed">
                        {service.benefits.map((benefit) => (
                          <li key={benefit}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-[0.3em] text-secondary mb-3">
                        Deliverables
                      </h3>
                      <ul className="space-y-2 text-gray-300 text-sm leading-relaxed">
                        {service.deliverables.map((deliverable) => (
                          <li key={deliverable}>• {deliverable}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-[0.3em] text-secondary mb-3">
                        Ideal Clients
                      </h3>
                      <ul className="space-y-2 text-gray-300 text-sm leading-relaxed">
                        {service.idealClients.map((client) => (
                          <li key={client}>• {client}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="venue-partner-program" className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.4em] text-secondary">
                  Venue Partner Program
                </p>
                <h2 className="text-4xl md:text-5xl font-display uppercase text-white">
                  Let&apos;s build a recurring comedy night together.
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We collaborate with venue teams to program consistent shows, co-market the run,
                  and structure revenue splits that make the night a win for everyone.
                </p>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-gray-300">
                  <p className="text-sm uppercase tracking-[0.3em] text-secondary mb-3">
                    What we align on
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Expected audience capacity and room flow.</li>
                    <li>• Ideal weeknights or weekend slots.</li>
                    <li>• Revenue split expectations for ticketing or bar sales.</li>
                  </ul>
                </div>
              </div>

              <Card className="bg-card/50 border-border/60">
                <CardContent className="p-6">
                  <Form {...venuePartnerForm}>
                    <form
                      onSubmit={venuePartnerForm.handleSubmit(onVenuePartnerSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={venuePartnerForm.control}
                        name="venueName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Venue name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Stone & Sparrow Taproom"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={venuePartnerForm.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Capacity</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="120 seated / 180 standing"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={venuePartnerForm.control}
                        name="preferredNights"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Preferred nights</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Thursdays, monthly Saturdays"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={venuePartnerForm.control}
                        name="revenueSplitPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Revenue split preference</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="70/30 door split or bar minimum"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={venuePartnerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Contact email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="venue@email.com"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Subject: Venue Partnership Inquiry
                      </p>
                      <Button
                        type="submit"
                        disabled={isPartnerSubmitting}
                        className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-black font-bold uppercase hover:scale-[1.02] transition-transform"
                      >
                        {isPartnerSubmitting ? "Sending..." : "Submit Inquiry"}
                      </Button>
                      {partnerStatus && (
                        <p
                          className={`text-sm ${
                            partnerStatus.type === "success"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {partnerStatus.message}
                        </p>
                      )}
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
