import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitLeadForm } from "@/lib/leadFormSubmission";

const leadFormSchema = z.object({
  name: z.string().min(2, "Add your name"),
  email: z.string().email("Add a valid email"),
  eventDate: z.string().min(1, "Add a date or timeframe"),
  location: z.string().min(2, "Add a location"),
  details: z.string().min(10, "Share a few details about your event"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type ServiceLeadFormProps = {
  serviceTitle: string;
};

export default function ServiceLeadForm({ serviceTitle }: ServiceLeadFormProps) {
  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      eventDate: "",
      location: "",
      details: "",
    },
  });

  async function onSubmit(values: LeadFormValues) {
    setStatus(null);
    setIsSubmitting(true);

    const subject = `Request a Quote: ${serviceTitle}`;
    const message = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Event date: ${values.eventDate}`,
      `Location: ${values.location}`,
      `Details: ${values.details}`,
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
        message: "Thanks! We’ll follow up with tailored options shortly.",
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

  return (
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
                  <FormLabel className="text-white">Event date</FormLabel>
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Venue, city, or region"
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
                  <FormLabel className="text-white">Event details</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Audience size, goals, or production needs"
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
              className="w-full bg-gradient-to-r from-secondary to-secondary/80 text-black font-bold uppercase hover:scale-[1.02] transition-transform"
            >
              {isSubmitting ? "Sending..." : "Request a Quote"}
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
  );
}
