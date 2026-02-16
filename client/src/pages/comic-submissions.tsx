import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHead from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const comicSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid contact phone number"),
  city: z.string().min(2, "Tell us where you're based"),
  yearsPerforming: z.string().min(1, "Share your experience level"),
  socialLinks: z.string().min(5, "Add at least one social or website link"),
  tapeLink: z.string().url("Provide a valid set video URL"),
  additionalNotes: z
    .string()
    .min(20, "Share at least a few lines about your set and style"),
});

export default function ComicSubmissionsPage() {
  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof comicSubmissionSchema>>({
    resolver: zodResolver(comicSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      yearsPerforming: "",
      socialLinks: "",
      tapeLink: "",
      additionalNotes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof comicSubmissionSchema>) {
    setStatus(null);
    setIsSubmitting(true);

    const subject = `Comic Submission: ${values.name}`;
    const message = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Phone: ${values.phone}`,
      `City/Region: ${values.city}`,
      `Years performing: ${values.yearsPerforming}`,
      `Social links: ${values.socialLinks}`,
      `Set tape: ${values.tapeLink}`,
      "",
      "Additional notes:",
      values.additionalNotes,
    ].join("\n");

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/comicsubmissions@stonedgooseproductions.com",
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
        throw new Error("Failed to send submission. Please try again.");
      }

      setStatus({
        type: "success",
        message:
          "Submission received. We review every tape and will reach out if there's a roster fit.",
      });
      form.reset();
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
        title="Comic Submissions | Stoned Goose Productions"
        description="Submit your tape for Stoned Goose Productions roster consideration. Review requirements, response timelines, and send your submission through our dedicated form."
        path="/comic-submissions"
      />
      <Navbar />
      <main className="pt-28 pb-20">
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-5xl space-y-8">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">
                Roster Pipeline
              </p>
              <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6">
                Comic submissions
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Want to be considered for future Stoned Goose showcases, feature
                slots, and production projects? Send us a clean submission using
                the requirements below so we can review your material quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/40 border-border/60">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-display uppercase text-white">
                    Submission requirements
                  </h2>
                  <ul className="space-y-2 text-gray-300 list-disc pl-5">
                    <li>5-10 minute unlisted video link with clear audio.</li>
                    <li>
                      Include current city, years performing, and social handles.
                    </li>
                    <li>
                      Material should represent your current set and stage tone.
                    </li>
                    <li>
                      One submission per comic every 90 days unless requested
                      otherwise.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border/60">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-display uppercase text-white">
                    Expected response time
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    We review submissions on a rolling basis and typically
                    respond within 2-3 weeks. High-volume periods can take up to
                    30 days. If it's a fit for current programming, we'll contact
                    you directly for next steps.
                  </p>
                  <p className="text-sm text-secondary uppercase tracking-[0.2em]">
                    Dedicated endpoint: comicsubmissions@stonedgooseproductions.com
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/40 border-primary/30">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-6">
                  Submit your set
                </h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your full name"
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
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
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Best callback number"
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            City / Region
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Olympia, Tacoma, Seattle, etc."
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearsPerforming"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Years Performing
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 3 years"
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialLinks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Social / Website Links
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Instagram, YouTube, website, etc."
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tapeLink"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-white">Set Tape URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://..."
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="additionalNotes"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-white">
                            Additional Notes
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Anything we should know about your set, credits, or scheduling."
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 space-y-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-black hover:bg-primary/90 font-bold uppercase"
                      >
                        {isSubmitting ? "Submitting..." : "Submit for review"}
                      </Button>

                      {status && (
                        <p
                          className={`text-sm ${
                            status.type === "success"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {status.message}
                        </p>
                      )}
                    </div>
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
