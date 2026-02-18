import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Megaphone, Users, Video } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const sponsorshipTiers = [
  {
    name: "Bronze",
    investment: "$500 / show",
    deliverables: [
      "Logo placement on event graphics and ticketing page.",
      "1 live host shoutout during the show.",
      "Brand mention in one pre-show social post.",
    ],
  },
  {
    name: "Silver",
    investment: "$1,250 / month",
    deliverables: [
      "Everything in Bronze, plus featured placement in monthly promo reel.",
      "2 host shoutouts (opening + closing).",
      "Branded table signage at sponsored events.",
      "Monthly recap email with attendance and engagement stats.",
    ],
  },
  {
    name: "Gold",
    investment: "$2,500 / month",
    deliverables: [
      "Everything in Silver, plus title sponsorship positioning.",
      "Custom 30-second ad read in each sponsored show.",
      "Dedicated sponsored social video clip each month.",
      "On-site activation support for giveaways or sampling.",
    ],
  },
];

const audienceStats = [
  {
    label: "Monthly in-room audience",
    value: "1,200+",
    detail: "Across recurring Olympia + South Sound comedy events.",
    icon: Users,
  },
  {
    label: "Average social impressions",
    value: "85K+",
    detail: "Organic + collaborative partner reach each month.",
    icon: Megaphone,
  },
  {
    label: "Video views",
    value: "30K+",
    detail: "Short-form clips, highlights, and promo reels.",
    icon: Video,
  },
];

const sponsorshipFormSchema = z.object({
  name: z.string().min(2, "Please share your name"),
  company: z.string().min(2, "Please share your company or organization"),
  email: z.string().email("Enter a valid email"),
  tierInterest: z.string().min(2, "Tell us which tier interests you"),
  goals: z.string().min(10, "Please include a few sponsorship goals"),
});

export default function SponsorshipsPage() {
  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sponsorshipForm = useForm<z.infer<typeof sponsorshipFormSchema>>({
    resolver: zodResolver(sponsorshipFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      tierInterest: "",
      goals: "",
    },
  });

  async function onSubmit(values: z.infer<typeof sponsorshipFormSchema>) {
    setStatus(null);
    setIsSubmitting(true);

    const subject = "Sponsorship Inquiry";
    const message = [
      `Name: ${values.name}`,
      `Company: ${values.company}`,
      `Email: ${values.email}`,
      `Tier interest: ${values.tierInterest}`,
      "",
      "Goals:",
      values.goals,
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
            name: values.name,
            email: values.email,
            subject,
            message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit sponsorship inquiry. Please try again.");
      }

      setStatus({
        type: "success",
        message: "Thanks! We received your sponsorship inquiry and will follow up shortly.",
      });
      sponsorshipForm.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again shortly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Sponsorship Opportunities | Stoned Goose Productions"
        description="Support live comedy in Olympia and the South Sound with Bronze, Silver, and Gold sponsorship packages."
        path="/sponsorships"
      />
      <Navbar />
      <main className="pb-20">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <p className="text-sm uppercase tracking-[0.35em] text-secondary mb-4">
              Sponsorships
            </p>
            <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6 max-w-4xl">
              Partner with the South Sound&apos;s fastest-growing comedy platform.
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl leading-relaxed">
              Sponsor recurring live comedy experiences and get in front of engaged audiences in
              Olympia, Lacey, Tacoma, and beyond.
            </p>
            <div className="mt-8">
              <Button asChild className="bg-primary text-black hover:bg-primary/90 font-bold uppercase">
                <a href="/sponsorship-one-sheet.txt" download>
                  <Download className="w-4 h-4 mr-2" />
                  Download Sponsorship One-Sheet
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {audienceStats.map((stat) => (
              <Card key={stat.label} className="bg-card/40 border-border/60">
                <CardContent className="p-6">
                  <stat.icon className="w-6 h-6 text-primary mb-4" />
                  <p className="text-3xl font-display text-white mb-1">{stat.value}</p>
                  <p className="text-sm uppercase tracking-wide text-secondary mb-3">{stat.label}</p>
                  <p className="text-sm text-gray-300">{stat.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sponsorshipTiers.map((tier) => (
              <Card key={tier.name} className="bg-card/40 border-border/60 h-full">
                <CardHeader>
                  <p className="text-sm uppercase tracking-[0.3em] text-secondary">{tier.name}</p>
                  <CardTitle className="text-3xl text-white">{tier.investment}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-300 list-disc list-inside">
                    {tier.deliverables.map((deliverable) => (
                      <li key={deliverable}>{deliverable}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card className="bg-card/50 border-border/60">
              <CardHeader>
                <CardTitle className="text-3xl font-display uppercase text-white">
                  Sponsorship Inquiry
                </CardTitle>
                <p className="text-gray-300 text-sm">
                  Share your goals and preferred package. We&apos;ll tailor a proposal to your brand.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...sponsorshipForm}>
                  <form onSubmit={sponsorshipForm.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={sponsorshipForm.control}
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
                      control={sponsorshipForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Company</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Company or organization"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sponsorshipForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="you@company.com"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sponsorshipForm.control}
                      name="tierInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Tier of interest</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Bronze, Silver, Gold, or Custom"
                              className="bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sponsorshipForm.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Sponsorship goals</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Audience, timeline, activation ideas, or KPI targets"
                              className="min-h-[120px] bg-white/5 border-white/10 focus:border-primary text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-black font-bold uppercase"
                    >
                      {isSubmitting ? "Sending..." : "Submit Sponsorship Inquiry"}
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
