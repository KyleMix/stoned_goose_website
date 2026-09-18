"use client";

import { Lockup } from "@/components/brand/lockup";
import Link from "next/link";
import { footer as footerCopy, site } from "@/content/site";
import { footerColumns } from "@/lib/navigation";
import { track } from "@/lib/analytics";

const socials: Array<{ label: string; href: string; destination: string }> = [
  { label: "Instagram", href: site.social.instagram, destination: "instagram" },
  { label: "Facebook", href: site.social.facebook, destination: "facebook" },
  { label: "TikTok", href: site.social.tiktok, destination: "tiktok" },
  { label: "YouTube", href: site.social.youtube, destination: "youtube" },
  { label: "Patreon", href: site.social.patreon, destination: "patreon" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-smoke bg-surface-tuxedo text-surface-ivory">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-20 md:px-10 md:pt-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* The lockup carries the wordmark, so the display-size
                "Stoned Goose." that used to sit under it is gone: the name
                would have read twice in one block. */}
            <Lockup colorway="gold" width={320} />
            {site.tagline ? (
              <p className="mt-4 t-ui text-smoke">{site.tagline}</p>
            ) : null}
            <p className="t-body mt-6 max-w-md text-sm">{site.description}</p>

            {/* Contact details are content, not labels. They used to render at
                the eyebrow role: 11px capitals at .26em tracking, which is a
                hard way to read a phone number and was not a link at all.
                They are body-size now, and both are tappable. */}
            <address className="mt-8 not-italic">
              <ul className="t-body space-y-1 text-sm">
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="inline-flex min-h-[44px] items-center underline decoration-smoke underline-offset-4 transition-colors hover:text-accent-gold hover:decoration-accent-gold"
                  >
                    {site.contact.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${site.contact.phoneTel}`}
                    className="inline-flex min-h-[44px] items-center underline decoration-smoke underline-offset-4 transition-colors hover:text-accent-gold hover:decoration-accent-gold"
                  >
                    {site.contact.phone}
                  </a>
                </li>
                <li className="pt-1 text-smoke">
                  {site.contact.locality}, {site.contact.region}
                </li>
              </ul>
            </address>
          </div>

          {footerColumns.map((col) => (
            <FooterColumn key={col.heading} label={col.heading} items={col.items} />
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-smoke pt-8">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("Outbound Click", { destination: s.destination })
                }
                className="inline-flex min-h-[44px] items-center t-ui text-smoke transition-colors hover:text-accent-gold"
              >
                {s.label} <span aria-hidden className="ml-1">&#8599;</span>
              </a>
            ))}
          </div>
          <div className="t-fine">
            <p>&copy; {year} Stoned Goose Productions</p>
            {footerCopy.creditLine ? (
              footerCopy.creditHref ? (
                <a
                  href={footerCopy.creditHref}
                  className="transition-colors hover:text-accent-gold"
                  target={/^https?:/.test(footerCopy.creditHref) ? "_blank" : undefined}
                  rel={/^https?:/.test(footerCopy.creditHref) ? "noopener noreferrer" : undefined}
                >
                  {footerCopy.creditLine}
                </a>
              ) : (
                <p>{footerCopy.creditLine}</p>
              )
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  label,
  items,
}: {
  label: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="md:col-span-3">
      <p className="t-eyebrow">{label}</p>
      <ul className="mt-4">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="inline-flex min-h-[44px] items-center text-sm text-surface-ivory transition-colors hover:text-accent-gold"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
