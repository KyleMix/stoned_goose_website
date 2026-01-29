import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const [status, setStatus] = useState<
    | { type: "success"; message: string }
    | { type: "error"; message: string }
    | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const serviceParam = searchParams.get("service");
    if (!serviceParam) return;

    const serviceTitle = serviceParam
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (!form.getValues("subject")) {
      form.setValue("subject", `Service Inquiry: ${serviceTitle}`, {
        shouldDirty: true,
      });
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setStatus(null);
    setIsSubmitting(true);

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
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message. Please try again.");
      }

      setStatus({
        type: "success",
        message: "Message sent! We'll get back to you soon.",
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
    <section
      id="contact"
      className="py-20 bg-gradient-to-b from-background to-black"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
            Get in <span className="text-secondary">Touch</span>
          </h2>
          <p className="text-gray-400">
            Booking, collaborations, or just want to honk at us?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Email Us
                    </h3>
                    <a
                      href="mailto:contact@stonedgooseproductions.com"
                      className="text-gray-400"
                      aria-label="Email contact@stonedgooseproductions.com"
                    >
                      contact@stonedgooseproductions.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Call Us
                    </h3>
                    <a
                      href="tel:+13603230667"
                      className="text-gray-400"
                      aria-label="Call (360) 323-0667"
                    >
                      (360) 323-0667
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Find Us
                    </h3>
                    <p className="text-gray-400">Stoned Goose Productions</p>
                    <p className="text-gray-400">Comedy-friendly location</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          {...field}
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
                          placeholder="your@email.com"
                          {...field}
                          className="bg-white/5 border-white/10 focus:border-primary text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Booking Inquiry"
                          {...field}
                          className="bg-white/5 border-white/10 focus:border-primary text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How can we help?"
                          {...field}
                          className="bg-white/5 border-white/10 focus:border-primary text-white min-h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-black font-bold uppercase hover:scale-[1.02] transition-transform"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
