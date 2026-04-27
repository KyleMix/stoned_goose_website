import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { BreadcrumbList, FAQPage, Service } from "schema-dts";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";
import { StickyQuoteRail } from "@/components/sticky-quote-rail";
import { jsonLdString } from "@/lib/jsonld";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return props.params.then(({ slug }) => {
    const svc = services.find((s) => s.slug === slug);
    if (!svc) return { title: "Service" };
    return {
      title: svc.title,
      description: svc.metaDescription,
      openGraph: {
        title: svc.metaTitle,
        description: svc.metaDescription,
      },
    };
  });
}

export default async function ServiceDetailPage(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const svc = services.find((s) => s.slug === slug);
  if (!svc) notFound();

  const idx = services.findIndex((s) => s.slug === slug);
  const next = services[(idx + 1) % services.length];

  const serviceJsonLd: Service = {
    "@type": "Service",
    name: svc.title,
    description: svc.metaDescription,
    serviceType: svc.title,
    url: `${site.url}/services/${svc.slug}`,
    areaServed: [...site.serviceAreas],
    provider: {
      "@type": "LocalBusiness",
      name: site.name,
      url: site.url,
      email: site.contact.email,
      telephone: site.contact.phoneTel,
    },
  };

  const breadcrumbJsonLd: BreadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Services",
        item: `${site.url}/services`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: svc.title,
        item: `${site.url}/services/${svc.slug}`,
      },
    ],
  };

  const faqJsonLd: FAQPage = {
    "@type": "FAQPage",
    mainEntity: svc.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
      />
      <PageHeader
        eyebrow="Service / Brief"
        title={
          <>
            {svc.title.split(" & ").map((part, i, arr) => (
              <span key={i} className="block">
                {part}
                {i < arr.length - 1 && (
                  <span className="italic text-hazard"> &amp; </span>
                )}
              </span>
            ))}
          </>
        }
        body={svc.summary}
      />

      <section className="border-b border-bone/10 bg-ink py-16 md:py-20">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-px overflow-hidden border border-bone/15 md:grid-cols-2">
            <Block title="What you get" items={svc.whatYouGet} />
            <Block title="Ideal for" items={svc.idealFor} />
          </div>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            Process
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-bone/15 md:grid-cols-3">
            {svc.process.map((step, i) => (
              <li key={i} className="bg-ink p-8 md:p-10">
                <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-hazard">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 font-display text-2xl text-bone md:text-3xl">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quote" className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
                Pricing
              </p>
              <p className="mt-4 font-display text-3xl leading-snug text-bone md:text-4xl">
                {svc.pricing}
              </p>
            </div>
            <div className="md:col-span-7">
              <p className="mb-6 font-body text-sm text-bone/65">
                {svc.whatYouGet[0]}
              </p>
              <ContactForm
                subject={`Quote. ${svc.title}`}
                source={`/services/${svc.slug}`}
                submitLabel="Request Quote"
                formName="quote"
                schema="quote"
                staticPayload={{ service: svc.slug }}
                successEvents={[
                  {
                    name: "Quote Submitted",
                    props: { service: svc.slug, tier: "unspecified" },
                  },
                ]}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    id={`${svc.slug}-name`}
                    name="name"
                    label="Name"
                    required
                    autoComplete="name"
                  />
                  <TextField
                    id={`${svc.slug}-email`}
                    name="email"
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                  <TextField
                    id={`${svc.slug}-date`}
                    name="eventDate"
                    label="Event date"
                    type="date"
                  />
                  <TextField
                    id={`${svc.slug}-budget`}
                    name="budget"
                    label="Budget"
                    placeholder="$2k-$5k"
                  />
                </div>
                <TextAreaField
                  id={`${svc.slug}-notes`}
                  name="notes"
                  label="Project notes"
                  rows={4}
                  placeholder={`What are you putting together? Anything specific to ${svc.title.toLowerCase()}?`}
                />
              </ContactForm>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-bone/10 bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            FAQ
          </h2>
          <ul className="mt-10 divide-y divide-bone/15 border-y border-bone/15">
            {svc.faqs.map((f, i) => (
              <li key={i} className="py-7">
                <details className="group grid grid-cols-12 gap-x-6">
                  <summary className="col-span-12 grid cursor-pointer grid-cols-12 items-baseline gap-x-6 list-none [&::-webkit-details-marker]:hidden">
                    <span className="col-span-2 font-body text-xs font-medium uppercase tracking-[0.18em] text-bone/40 md:col-span-1">
                      /0{i + 1}
                    </span>
                    <h3 className="col-span-9 font-display text-2xl text-bone group-hover:text-hazard md:col-span-10 md:text-3xl">
                      {f.q}
                    </h3>
                    <span
                      aria-hidden
                      className="col-span-1 text-right font-body text-xl text-bone/55 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="col-span-12 mt-4 md:col-start-2 md:col-span-11">
                    <p className="max-w-prose font-body text-base text-bone/85">
                      {f.a}
                    </p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 border-y border-bone/15 py-10">
            <div>
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
                Next service
              </p>
              <p className="mt-2 font-display text-3xl text-bone md:text-4xl">
                {next.title}
              </p>
            </div>
            <Link
              href={`/services/${next.slug}`}
              className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
            >
              Read {next.title} ↗
            </Link>
          </div>
        </div>
      </section>

      <StickyQuoteRail label={svc.title} targetId="quote" />
    </>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-ink p-8 md:p-10">
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-hazard">
        {title}
      </p>
      <ul className="mt-6 space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-4">
            <span className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone/40">
              /0{i + 1}
            </span>
            <span className="font-body text-base text-bone/85">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
