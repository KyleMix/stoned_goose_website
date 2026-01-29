import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/seo/SeoHead";
import { servicePages } from "@/data/servicePages";

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

export default function ServicesPage() {
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
      </main>
      <Footer />
    </div>
  );
}
