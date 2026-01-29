import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import SeoHead from "@/components/seo/SeoHead";
import JsonLd from "@/components/seo/JsonLd";
import ServiceLeadForm from "@/components/ServiceLeadForm";
import { servicePages } from "@/data/servicePages";
import { AREA_SERVED, SITE_URL } from "@/data/seo";
import NotFound from "@/pages/not-found";

type ServiceDetailPageProps = {
  slug: string;
};

export default function ServiceDetailPage({ slug }: ServiceDetailPageProps) {
  const service = servicePages.find((item) => item.slug === slug);

  if (!service) {
    return <NotFound />;
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.metaDescription,
    areaServed: AREA_SERVED,
    provider: {
      "@type": "LocalBusiness",
      name: "Stoned Goose Productions",
      url: SITE_URL,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title={service.metaTitle}
        description={service.metaDescription}
        path={`/${service.slug}`}
      />
      <JsonLd id={`service-${service.slug}`} data={serviceSchema} />
      <JsonLd id={`faq-${service.slug}`} data={faqSchema} />
      <Navbar />
      <main className="pt-28 pb-20">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.4em] text-secondary mb-4">
                Services
              </p>
              <h1 className="text-4xl md:text-6xl font-display uppercase text-white mb-6">
                {service.title}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                {service.summary}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="uppercase">
                  <a href="#request-quote">Request a Quote</a>
                </Button>
                <Button asChild variant="outline" className="uppercase">
                  <a href="/services">View Services</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-4">
                  What you get
                </h2>
                <ul className="space-y-2 text-gray-300">
                  {service.whatYouGet.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-4">
                  Ideal for
                </h2>
                <ul className="space-y-2 text-gray-300">
                  {service.idealFor.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-4">
                  Process / How booking works
                </h2>
                <ol className="space-y-2 text-gray-300">
                  {service.process.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-4">
                  Pricing / Packages
                </h2>
                <p className="text-gray-300">{service.pricing}</p>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
                <h3 className="text-sm uppercase tracking-[0.3em] text-secondary mb-3">
                  Explore other services
                </h3>
                <ul className="space-y-3 text-gray-300">
                  {servicePages
                    .filter((item) => item.slug !== service.slug)
                    .map((item) => (
                      <li key={item.slug}>
                        <a
                          href={`/${item.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-gray-300">
                <p className="text-sm uppercase tracking-[0.3em] text-secondary mb-3">
                  Serving South Sound
                </p>
                <p>
                  Olympia, Lacey, Tacoma, and Thurston + Pierce County venues.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-display uppercase text-white mb-6">
              FAQs
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {service.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-border/60 bg-card/40 p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="request-quote" className="py-16">
          <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-display uppercase text-white">
                Request a Quote
              </h2>
              <p className="text-gray-400">
                Tell us about your {service.title.toLowerCase()} needs and we’ll
                send a tailored package for Olympia, Lacey, Tacoma, or wherever
                you’re hosting in the South Sound.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">
                <p className="text-sm uppercase tracking-wide text-gray-400 mb-3">
                  What to expect
                </p>
                <ul className="space-y-2">
                  <li>• Response within 1-2 business days</li>
                  <li>• Clear pricing options tailored to your event</li>
                  <li>• Production + talent guidance from day one</li>
                </ul>
              </div>
            </div>
            <ServiceLeadForm serviceTitle={service.title} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
