import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/seo/SeoHead";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const services = [
  {
    title: "Live Show Production",
    slug: "live-show-production",
    summary:
      "End-to-end production for comedy shows of any size. We handle the stage, the schedule, and the surprises so you can focus on the room.",
  },
  {
    title: "Comedian Booking",
    slug: "comedian-booking",
    summary:
      "The right comics for your crowd — sourced, vetted, and ready to go. One-off sets or a long run, we keep your lineup fresh.",
  },
  {
    title: "Corporate Events",
    slug: "corporate-events",
    summary:
      "Comedy that fits your culture and keeps the room engaged without crossing lines. We work with your team so the night runs smooth.",
  },
  {
    title: "Media & Podcasts",
    slug: "media-and-podcasts",
    summary:
      "Audio and video production that captures comic voices with broadcast-ready quality — from studio sessions to highlight clips.",
  },
  {
    title: "Headshots & Promo Shoots",
    slug: "headshots-and-promo",
    summary:
      "Photography that sells the bit. Clean, modern shots ready for press kits, posters, and socials.",
  },
];

const venuePartnerFormSchema = z.object({
  venueName: z.string().min(2, "Add your venue name"),
  capacity: z.string().min(1, "Share the room capacity"),
  preferredNights: z.string().min(2, "Tell us which nights work best"),
  email: z.string().email("Add a valid contact email"),
  notes: z.string().optional(),
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
      email: "",
      notes: "",
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
      `Contact email: ${values.email}`,
      values.notes ? `Notes: ${values.notes}` : "",
    ].filter(Boolean).join("\n");

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
        message: "Got it — we'll be in touch soon.",
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
      <main className="pb-20">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">
              Services
            </p>
            <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6">
              Whatever your show needs, we&apos;ve got it covered.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              From Olympia to Tacoma, we help venues, promoters, and brands put
              on comedy that actually works. Browse what we do below — or just{" "}
              <a href="/#contact" className="text-secondary underline underline-offset-4 hover:text-secondary/80 transition-colors">
                reach out and tell us what you&apos;re building
              </a>.
            </p>
          </div>
        </section>

        {/* Service cards */}
        <section className="py-10">
          <div className="container mx-auto px-4 space-y-6 max-w-5xl">
            {services.map((service) => (
              <article
                key={service.slug}
                className="rounded-2xl border border-border/60 bg-card/40 p-8 flex flex-col sm:flex-row sm:items-center gap-6"
              >
                <div className="flex-1">
                  <a
                    href={`/${service.slug}`}
                    className="text-2xl font-display uppercase text-white hover:text-primary transition-colors"
                  >
                    {service.title}
                  </a>
                  <p className="mt-3 text-gray-300 leading-relaxed max-w-xl">
                    {service.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <Button asChild className="uppercase">
                    <a href={`/${service.slug}`}>Learn More</a>
                  </Button>
                  <Button asChild variant="outline" className="uppercase">
                    <a href="/#contact">Get in Touch</a>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Venue Partner Program */}
        <section id="venue-partner-program" className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.4em] text-secondary">
                  Venue Partner Program
                </p>
                <h2 className="text-4xl md:text-5xl font-display uppercase text-white">
                  Want to run a comedy night at your spot?
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  We collaborate with venue teams to build recurring shows that work for your
                  room and your crowd. Drop us your details and we&apos;ll take it from there.
                </p>
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
                            <FormLabel className="text-white">Room capacity</FormLabel>
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
                            <FormLabel className="text-white">Best nights for your venue</FormLabel>
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Your email</FormLabel>
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
                      <FormField
                        control={venuePartnerForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Anything else? <span className="text-gray-500 font-normal">(optional)</span></FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Revenue split ideas, questions, whatever's on your mind"
                                {...field}
                                className="bg-white/5 border-white/10 focus:border-primary text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={isPartnerSubmitting}
                        className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-black font-bold uppercase hover:scale-[1.02] transition-transform"
                      >
                        {isPartnerSubmitting ? "Sending..." : "Let's Talk"}
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
        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-display uppercase text-white mb-10">
              Common Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-far-ahead">
                <AccordionTrigger>How far in advance should I book?</AccordionTrigger>
                <AccordionContent>
                  We recommend reaching out at least 3–4 weeks ahead for most shows. For larger
                  events, festivals, or corporate engagements, 6–8 weeks gives us room to source the
                  best talent and build a production plan that fits your vision. That said, we've
                  pulled off last-minute shows too — just ask.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="corporate-clean">
                <AccordionTrigger>Can you keep it clean for a corporate audience?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We work closely with every client to understand the audience and set
                  clear content guidelines for our comedians. Clean, crowd-appropriate comedy is
                  something we do well — your HR department will thank you.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="what-included">
                <AccordionTrigger>What's included in the production fee?</AccordionTrigger>
                <AccordionContent>
                  It depends on the package, but most shows include talent sourcing and booking,
                  contract management, run-of-show planning, and day-of coordination. Pro and Premium
                  packages add photo/video coverage, staffing, and post-event content. Request a
                  quote and we'll walk you through exactly what's covered.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="venue-provide">
                <AccordionTrigger>Do you provide the venue, or do I?</AccordionTrigger>
                <AccordionContent>
                  Either works. If you have a venue, great — we'll show up and make it happen. If
                  you need a space, we have established venue partners across Olympia, Lacey, and
                  Tacoma and can help you find the right fit for your audience size and vibe.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ticket-sales">
                <AccordionTrigger>How do ticket sales and revenue splits work?</AccordionTrigger>
                <AccordionContent>
                  We handle ticketing through Eventbrite for most public shows. For venue partner
                  programs, we work out a revenue split that makes sense for both sides based on
                  room capacity, night of week, and production costs. We're flexible — reach out and
                  let's talk numbers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="what-makes-different">
                <AccordionTrigger>What makes Stoned Goose different from just hiring a comedian directly?</AccordionTrigger>
                <AccordionContent>
                  When you book through us, you get full production support — not just a phone number
                  and a handshake. We handle logistics, contracts, stage management, promotion, and
                  content. We've built relationships with comedians across the Pacific Northwest, so
                  you get talent that's right for your specific crowd, not just whoever's available.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-gray-300 mb-4">
                Don&apos;t see your question here?
              </p>
              <Button asChild className="uppercase font-bold">
                <a href="/#contact">Ask Us Directly</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
