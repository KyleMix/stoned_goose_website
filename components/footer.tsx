"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";

const explore = [
  { label: "Home", href: "/" },
  { label: "Comedians", href: "/comedians" },
  { label: "Members", href: "/members" },
  { label: "Watch", href: "/watch" },
  { label: "Shop", href: "/shop" },
];

const services = [
  { label: "Services", href: "/services" },
  { label: "Comic Submissions", href: "/submit" },
  { label: "Sponsorships", href: "/sponsor" },
];

const connect = [
  { label: "Book a Show", href: "/services" },
  { label: "Contact", href: "/contact" },
];

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
    <footer className="relative border-t border-bone/15 bg-ink text-bone">
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-20 md:px-10 md:pt-32">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Image
              src="/brand/stoned-goose-mark-sm.webp"
              alt=""
              width={160}
              height={160}
              loading="lazy"
              className="block h-24 w-auto opacity-90 md:h-28"
            />
            <p className="mt-4 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
              Olympia, WA
            </p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.02em] md:text-7xl">
              Stoned Goose<span className="text-hazard">.</span>
            </h2>
            <p className="mt-6 max-w-md font-body text-sm text-bone/80">
              {site.description}
            </p>
            <ul className="mt-8 space-y-1 font-mono text-xs uppercase tracking-[0.18em] text-bone/70">
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="transition-colors hover:text-hazard"
                >
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.contact.phoneTel}`}
                  className="transition-colors hover:text-hazard"
                >
                  {site.contact.phone}
                </a>
              </li>
              <li>{site.contact.locality}, {site.contact.region}</li>
            </ul>
          </div>

          <FooterColumn label="Explore" items={explore} />
          <FooterColumn label="Services" items={services} />
          <FooterColumn label="Connect" items={connect} />
        </div>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 border-t border-bone/10 pt-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track("Outbound Click", { destination: s.destination })
                }
                className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/70 transition-colors hover:text-hazard"
              >
                {s.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
          <div className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
            <p>© {year} Stoned Goose Productions</p>
            <p>Website Design by Kyle Mixon.</p>
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
    <div className="md:col-span-2">
      <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
        {label}
      </p>
      <ul className="mt-4 space-y-2">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="font-body text-sm text-bone/85 transition-colors hover:text-hazard"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
