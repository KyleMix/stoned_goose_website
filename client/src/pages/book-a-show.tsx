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
    description: "A curated lineup for 60-120 guests — host, 2-3 comedians, basic run-of-show and venue coordination.",
  },
  {
    name: "Featured Night",
    price: "$1,500+",
    description: "Ideal for ticketed nights with 120-250 attendees. Headliner, featured support, emcee, promo copy, and day-of talent management.",
  },
  {
    name: "Premium Event",
    price: "$2,750+",
    description: "Corporate events, festivals, and anchor programming. Custom lineup strategy, full production planning, and white-glove coordination.",
  },
];

const inquirySchema = z.object({
  name: z.string().min(2, "Add your name"),
  email: z.string().email("Add a valid email"),
  eventDate: z.string().min(1, "Add a date or timeframe"),
  details: z.string().min(10, "Tell us a bit about your event"),
});

type InquiryValues = z.infer<typeof inquirySchema>;

export default function BookAShowPage() {
  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      eventDate: "",
      details: "",
    },
  });

  async function onSubmit(values: InquiryValues) {
    setStatus(null);
    setIsSubmitting(true);

    const subject = "Book a Show Inquiry";
    const message = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Event date: ${values.eventDate}`,
      `About the event: ${values.details}`,
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
        message: "Got it — we'll be in touch soon.",
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
      "Book curated comedy shows for venues, private events, and corporate programs across the South Sound.",
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
        description="Book a comedy show with Stoned Goose Productions in the South Sound. Tell us about your event and we'll take it from there."
        path="/book-a-show"
      />
      <JsonLd id="book-a-show-service" data={serviceSchema} />
      <Navbar />
      <main className="pb-20">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">
              Book a Show
            </p>
            <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6">
              Let&apos;s put on a show together.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              We work with venues, promoters, and event teams across the South Sound to build
              comedy nights that actually land. Tell us about your event and we&apos;ll figure
              out the rest together.
            </p>
          </div>
        </section>

        {/* Inquiry Form */}
        <section id="inquiry" className="py-8">
          <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start max-w-5xl">
            <div className="space-y-5">
              <h2 className="text-2xl md:text-3xl font-display uppercase text-white">
                Tell us about your event
              </h2>
              <p className="text-gray-400 leading-relaxed">
                No need to come in with a budget in mind or a fully formed plan.
                Just give us a rough idea of what you&apos;re going for — we&apos;ll
                follow up within 1-2 business days with ideas and next steps.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
                <li>• South Sound promoter relationships with local and touring talent</li>
                <li>• Audience-first lineups matched to your room and vibe</li>
                <li>• Clear scope and fast turnarounds — no runaround</li>
              </ul>
            </div>

            <Card className="bg-card/50 border-border/60">
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">When are you thinking?</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="A date, month, or rough timeframe"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
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
                          <FormLabel className="text-white">What are you putting together?</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Venue, vibe, audience size, goals — whatever you've got"
                              className="min-h-[110px] bg-white/5 border-white/10 focus:border-primary text-white"
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
                      {isSubmitting ? "Sending..." : "Let's Talk"}
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

        {/* Package reference — soft, not a menu */}
        <section className="py-14">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-xl md:text-2xl font-display uppercase text-white mb-2">
              How we typically scope shows
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              These are starting points — we build around your room, not the other way around.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {packageTiers.map((tier) => (
                <div key={tier.name} className="rounded-xl border border-border/40 bg-card/30 p-5 space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary">{tier.name}</p>
                  <p className="text-lg font-display text-white">{tier.price}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
