import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { SectionHeading, SectionShell } from "@/components/SectionShell";

const testimonials = [
  {
    quote:
      "Stoned Goose turned our slow Tuesday nights into the most-talked-about event of the week. Ticket sales covered our bar staff within the first two shows. We've had a recurring night booked with them ever since.",
    author: "Marcus T.",
    role: "General Manager, The Anchor Taproom — Olympia",
    rating: 5,
  },
  {
    quote:
      "We hired them for our company holiday party and couldn't believe how seamlessly it came together. The comedian they sourced read the room perfectly — HR-approved and laugh-out-loud funny. Zero drama, all laughs.",
    author: "Priya S.",
    role: "HR Director, Pacific Northwest Tech Co.",
    rating: 5,
  },
  {
    quote:
      "I've worked with producers all over the state and Kyle's team is the real deal. They handled my contract, coordinated with the venue, promoted the show, and even shot promo content. I just showed up and did my set.",
    author: "Darnell W.",
    role: "Stand-Up Comedian, Featured on Stoned Goose Productions",
    rating: 5,
  },
  {
    quote:
      "We reached out on a Friday about a last-minute corporate event and they had a full lineup confirmed by Monday. Fast, professional, and the show was a massive hit with our clients. Will absolutely book again.",
    author: "Jennifer K.",
    role: "Events Coordinator, South Sound Business Group",
    rating: 5,
  },
];

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <SectionShell id="testimonials" surface="muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14"
      >
        <SectionHeading
          eyebrow="What people are saying"
          title={
            <>
              Venues. Brands.{" "}
              <span className="text-primary">Comedians.</span>
            </>
          }
          subtitle="Don't take our word for it — here's what the people who've worked with us have to say."
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-white/10 bg-card/50 p-7 flex flex-col gap-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <StarRow count={t.rating} />
              <Quote className="w-6 h-6 text-primary/40 shrink-0 mt-0.5" />
            </div>
            <p className="text-gray-200 leading-relaxed text-base flex-1">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="pt-3 border-t border-white/10">
              <p className="text-white font-semibold text-sm">{t.author}</p>
              <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-gray-400 text-sm">
          Ready to join them?{" "}
          <a
            href="/#contact"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Let&apos;s talk about your event.
          </a>
        </p>
      </motion.div>
    </SectionShell>
  );
}
