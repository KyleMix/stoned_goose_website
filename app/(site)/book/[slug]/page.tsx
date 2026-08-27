import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { FAQPage, Service } from "schema-dts";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { TextField, TextAreaField } from "@/components/form-field";
import { StickyQuoteRail } from "@/components/sticky-quote-rail";
import { ShareButton } from "@/components/share-button";
import { jsonLdString } from "@/lib/jsonld";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

// Renderable list filter. Draft services may have literal "TODO: copy needed."
// placeholder strings in content/services.ts. Skip them so the page collapses
// cleanly until real copy lands.
function realItems(items: string[]): string[] {
  return items.filter((s) => !/^\s*TODO\b/i.test(s));
}

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((s) => ({ slug: s.slug }));
}

export function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  return props.params.then(({ slug }) => {
    const svc = services.find((s) => s.slug === slug);
    if (!svc)
      return { title: "Not found", robots: { index: false, follow: false } };
    return {
      title: svc.metaTitle,
      description: svc.metaDescription,
      alternates: {
        canonical: `/book/${svc.slug}`,
      },
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

  // Next-service footer nav skips drafts so it never routes to a stub.
  const live = services.filter((s) => !s.draft || s.slug === svc.slug);
  const liveIdx = live.findIndex((s) => s.slug === svc.slug);
  const next = live[(liveIdx + 1) % live.length];

  const serviceJsonLd: Service = {
    "@type": "Service",
    name: svc.title,
    description: svc.metaDescription,
    serviceType: svc.title,
    url: `${site.url}/book/${svc.slug}`,
    areaServed: [...site.serviceAreas],
    provider: {
      "@type": "LocalBusiness",
      name: site.name,
      url: site.url,
      email: site.contact.email,
      telephone: site.contact.phoneTel,
    },
  };

  const realFaqs = svc.faqs.filter((f) => !/^\s*TODO\b/i.test(f.a));
  const faqJsonLd: FAQPage | null =
    realFaqs.length > 0
      ? {
          "@type": "FAQPage",
          mainEntity: realFaqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(serviceJsonLd) }}
      />
      <JsonLd schema={buildBreadcrumbs(`/book/${svc.slug}`, svc.title)} />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd) }}
        />
      ) : null}
      <PageHeader
        eyebrow="Service / Brief"
        title={
          <>
            {svc.title.split(" & ").map((part, i, arr) => (
              <span key={i} className="block">
                {part}
                {i < arr.length - 1 && (
                  <span className="text-accent-gold"> &amp; </span>
                )}
              </span>
            ))}
          </>
        }
        body={svc.summary}
      />

      {svc.draft ? (
        <aside
          aria-label="Draft notice"
          className="border-y-2 border-accent-gold bg-surface-tuxedo"
        >
          <div className="mx-auto max-w-[1400px] px-5 py-3 md:px-10">
            <p className="t-eyebrow text-surface-ivory">
              Draft<span className="text-accent-gold">.</span> Final copy lands soon. Send a quote request and we&apos;ll fill in the details with you.
            </p>
          </div>
        </aside>
      ) : null}

      {(() => {
        const what = realItems(svc.whatYouGet);
        const ideal = realItems(svc.idealFor);
        if (what.length === 0 && ideal.length === 0) return null;
        return (
          <section className="border-b border-smoke bg-surface-tuxedo py-16 md:py-20">
            <div className="mx-auto max-w-[1400px] px-5 md:px-10">
              <div className="grid gap-px overflow-hidden border border-smoke md:grid-cols-2">
                {what.length > 0 ? <Block title="What you get" items={what} /> : null}
                {ideal.length > 0 ? <Block title="Ideal for" items={ideal} /> : null}
              </div>
            </div>
          </section>
        );
      })()}

      {(() => {
        const steps = realItems(svc.process);
        if (steps.length === 0) return null;
        return (
          <section className="border-b border-smoke bg-surface-tuxedo py-20 md:py-24">
            <div className="mx-auto max-w-[1400px] px-5 md:px-10">
              <h2 className="t-headline display-1">
                Process
              </h2>
              <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-smoke md:grid-cols-3">
                {steps.map((step, i) => (
                  <li key={i} className="bg-surface-tuxedo p-8 md:p-10">
                    <span className="t-eyebrow">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-4 t-subhead text-2xl md:text-3xl">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })()}

      <section id="quote" className="scroll-mt-24 border-b border-smoke bg-surface-tuxedo py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="t-eyebrow">
                Pricing
              </p>
              <p className="mt-4 t-subhead text-3xl leading-snug md:text-4xl">
                {svc.pricing}
              </p>
            </div>
            <div className="md:col-span-7">
              <p className="t-body mb-6 text-sm text-smoke">
                Tell us what you&apos;re planning and we&apos;ll scope it.
              </p>
              <ContactForm
                subject={`Quote. ${svc.title}`}
                source={`/book/${svc.slug}`}
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

      {(() => {
        const faqs = svc.faqs.filter((f) => !/^\s*TODO\b/i.test(f.a));
        if (faqs.length === 0) return null;
        return (
          <section className="border-b border-smoke bg-surface-tuxedo py-20 md:py-24">
            <div className="mx-auto max-w-[1400px] px-5 md:px-10">
              <h2 className="t-headline display-1">
                FAQ
              </h2>
              <ul className="mt-10 divide-y divide-smoke border-y border-smoke">
                {faqs.map((f, i) => (
                  <li key={i} className="py-7">
                    <details className="group grid grid-cols-12 gap-x-6">
                      <summary className="col-span-12 grid cursor-pointer grid-cols-12 items-baseline gap-x-6 list-none [&::-webkit-details-marker]:hidden">
                        <span className="col-span-2 t-eyebrow text-smoke md:col-span-1">
                          /0{i + 1}
                        </span>
                        <h3 className="col-span-9 t-subhead text-2xl group-hover:text-accent-gold md:col-span-10 md:text-3xl">
                          {f.q}
                        </h3>
                        <span
                          aria-hidden
                          className="col-span-1 text-right text-xl text-smoke transition-transform duration-200 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="col-span-12 mt-4 md:col-start-2 md:col-span-11">
                        <p className="t-body max-w-prose text-base">
                          {f.a}
                        </p>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })()}

      <section className="bg-surface-tuxedo py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-6 border-y border-smoke py-10">
            <div>
              <p className="t-eyebrow text-smoke">
                Next service
              </p>
              <p className="mt-2 t-subhead text-3xl md:text-4xl">
                {next.title}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ShareButton
                title={svc.title}
                text={svc.summary}
                url={`${site.url}/book/${svc.slug}`}
                surface="service"
              />
              <Link
                href={`/book/${next.slug}`}
                className="inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
              >
                Read {next.title} ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyQuoteRail label={svc.title} targetId="quote" />
    </>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-surface-tuxedo p-8 md:p-10">
      <p className="t-eyebrow">
        {title}
      </p>
      <ul className="mt-6 space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-4">
            <span className="t-eyebrow text-smoke">
              /0{i + 1}
            </span>
            <span className="text-base text-surface-ivory">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
