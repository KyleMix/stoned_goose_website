"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { upcomingShows } from "@/content/shows";

type Suggestion = { href: string; label: string };

const ALL: Record<string, Suggestion> = {
  shows: { href: "/shows", label: "Upcoming shows" },
  openMics: { href: "/open-mics", label: "Open Mic Explorer" },
  book: { href: "/book", label: "Book us" },
  shop: { href: "/shop", label: "Shop" },
  sponsor: { href: "/book#sponsors", label: "Sponsor a show" },
  contact: { href: "/contact", label: "Contact" },
  watch: { href: "/watch", label: "Watch" },
  roster: { href: "/roster", label: "The roster" },
};

const DEFAULTS: Suggestion[] = [ALL.shows, ALL.book, ALL.contact];

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
  if (p.includes("open") || p.includes("mic")) add(ALL.openMics);
  if (p.includes("book") || p.includes("service") || p.includes("submit") || p.includes("collab")) add(ALL.book);
  if (p.includes("merch") || p.includes("shop") || p.includes("store")) add(ALL.shop);
  if (p.includes("sponsor")) add(ALL.sponsor);
  if (p.includes("contact") || p.includes("reach")) add(ALL.contact);
  if (p.includes("watch") || p.includes("video") || p.includes("media") || p.includes("news")) add(ALL.watch);
  if (p.includes("about") || p.includes("crew") || p.includes("member") || p.includes("team") || p.includes("roster") || p.includes("comic")) add(ALL.roster);

  if (picks.length === 0) return DEFAULTS;
  for (const fallback of DEFAULTS) {
    if (picks.length >= 3) break;
    add(fallback);
  }
  return picks.slice(0, 3);
}

function nextShowLine(): { date: string; venue: string; href: string } | null {
  const next = upcomingShows[0];
  if (!next?.start) return null;
  let date = "Date TBD";
  try {
    date = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(next.start));
  } catch {
    // fall through with TBD
  }
  const venue = next.venue?.name ?? next.venue?.city ?? "TBD";
  return { date, venue, href: `/shows#${next.id}` };
}

export default function NotFound() {
  const [picks, setPicks] = useState<Suggestion[]>(DEFAULTS);
  const nextShow = nextShowLine();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPicks(suggestionsForPath(window.location.pathname));
    }
  }, []);

  return (
    <section className="relative flex min-h-[88svh] flex-col items-start bg-ink pt-32 md:pt-40">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <div className="relative h-[180px] w-[180px] md:h-[260px] md:w-[260px]">
          <Image
            src="/brand/stoned-goose-logo-full.png"
            alt="Stoned Goose Productions"
            fill
            sizes="(min-width: 768px) 260px, 180px"
            className="object-contain"
            priority
          />
        </div>
        <p className="mt-10 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
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
          {nextShow ? (
            <li>
              <Link
                href={nextShow.href}
                className="group flex items-baseline justify-between gap-4 py-5"
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-hazard">
                    /now
                  </span>
                  <span className="font-display text-2xl text-bone group-hover:text-hazard md:text-3xl">
                    Next on stage. {nextShow.date}. {nextShow.venue}.
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
          ) : null}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3 pb-20">
          <Link
            href="/"
            className="inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-slime"
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
