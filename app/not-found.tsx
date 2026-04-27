"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Suggestion = { href: string; label: string };

const ALL: Record<string, Suggestion> = {
  shows: { href: "/shows", label: "Upcoming shows" },
  submit: { href: "/submit", label: "Comic submissions" },
  services: { href: "/services", label: "Services" },
  shop: { href: "/shop", label: "Shop" },
  sponsor: { href: "/sponsor", label: "Sponsor a show" },
  contact: { href: "/contact", label: "Contact" },
  watch: { href: "/watch", label: "Watch" },
  members: { href: "/members", label: "The crew" },
};

const DEFAULTS: Suggestion[] = [ALL.shows, ALL.services, ALL.contact];

// Static heuristic. Maps the misfired path to a small set of likely intents
// without server logic, so it keeps working in static export.
function suggestionsForPath(path: string): Suggestion[] {
  const p = path.toLowerCase();
  const picks: Suggestion[] = [];
  const seen = new Set<string>();
  function add(s: Suggestion) {
    if (!seen.has(s.href)) {
      picks.push(s);
      seen.add(s.href);
    }
  }
  if (p.includes("show") || p.includes("ticket")) add(ALL.shows);
  if (p.includes("submit") || p.includes("comic")) add(ALL.submit);
  if (p.includes("book") || p.includes("service")) add(ALL.services);
  if (p.includes("merch") || p.includes("shop") || p.includes("store")) add(ALL.shop);
  if (p.includes("sponsor")) add(ALL.sponsor);
  if (p.includes("contact") || p.includes("reach")) add(ALL.contact);
  if (p.includes("watch") || p.includes("video") || p.includes("media")) add(ALL.watch);
  if (p.includes("about") || p.includes("crew") || p.includes("member") || p.includes("team")) add(ALL.members);

  if (picks.length === 0) return DEFAULTS;
  for (const fallback of DEFAULTS) {
    if (picks.length >= 3) break;
    add(fallback);
  }
  return picks.slice(0, 3);
}

export default function NotFound() {
  const [picks, setPicks] = useState<Suggestion[]>(DEFAULTS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPicks(suggestionsForPath(window.location.pathname));
    }
  }, []);

  return (
    <section className="relative flex min-h-[80svh] items-center bg-ink">
      <div className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10">
        <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
          [ Static / 404 / Misfire ]
        </p>
        <h1 className="heading-display mt-6 text-[clamp(4rem,18vw,16rem)] text-bone">
          Lost.
        </h1>
        <p className="mt-6 max-w-xl font-body text-base text-bone/85 md:text-lg">
          That page either never existed or got cut from the special. Try one of
          these instead.
        </p>

        <ul className="mt-10 divide-y divide-bone/15 border-y border-bone/15">
          {picks.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-baseline justify-between gap-4 py-5"
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/40">
                    /0{i + 1}
                  </span>
                  <span className="font-display text-2xl text-bone group-hover:text-hazard md:text-3xl">
                    {s.label}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="font-body text-base text-bone/55 group-hover:text-hazard"
                >
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            Back to home ↗
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-bone/30 px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-bone hover:border-hazard hover:text-hazard"
          >
            Talk to us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
