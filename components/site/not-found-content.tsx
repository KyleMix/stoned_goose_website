"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lockup } from "@/components/brand/lockup";
import { useEffect, useState } from "react";
import { upcomingShows } from "@/content/shows";
import { formatShowMonthDay } from "@/lib/dates";

type Suggestion = { href: string; label: string };

const ALL: Record<string, Suggestion> = {
  shows: { href: "/shows", label: "Upcoming shows" },
  openMics: { href: "/open-mics/map", label: "Open mic map" },
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
  const date = formatShowMonthDay(next.start) ?? "Date TBD";
  const venue = next.venue?.name ?? next.venue?.city ?? "TBD";
  return { date, venue, href: `/shows#${next.id}` };
}

export function NotFoundContent() {
  const router = useRouter();
  const [picks, setPicks] = useState<Suggestion[]>(DEFAULTS);
  const [canGoBack, setCanGoBack] = useState(false);
  const nextShow = nextShowLine();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPicks(suggestionsForPath(window.location.pathname));
      // history.length is 1 when this is the first page of the session, which
      // is the common case for a bad link from search or social. Showing a
      // back button then would be a control that does nothing.
      setCanGoBack(window.history.length > 1);
    }
  }, []);

  return (
    <section className="relative flex min-h-[88svh] flex-col items-start bg-surface-tuxedo pt-32 md:pt-40">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <Lockup colorway="gold" width={300} priority />
        <p className="mt-10 t-eyebrow">
          [ Static / 404 / Misfire ]
        </p>
        <h1 className="t-headline mt-6 display-hero">
          This bit bombed.
        </h1>
        <p className="t-body mt-6 max-w-xl text-base md:text-lg">
          The page you wanted got cut for time. Somebody in the back is still
          heckling. Here is where everyone else went.
        </p>

        <ul className="mt-10 divide-y divide-smoke border-y border-smoke">
          {picks.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-baseline justify-between gap-4 py-5"
              >
                <span className="flex items-baseline gap-4">
                  <span className="t-eyebrow text-smoke">
                    /0{i + 1}
                  </span>
                  <span className="t-subhead text-2xl group-hover:text-accent-gold md:text-3xl">
                    {s.label}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-base text-smoke group-hover:text-accent-gold"
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
                  <span className="t-eyebrow">
                    /now
                  </span>
                  <span className="t-subhead text-2xl group-hover:text-accent-gold md:text-3xl">
                    Next on stage. {nextShow.date}. {nextShow.venue}.
                  </span>
                </span>
                <span
                  aria-hidden
                  className="text-base text-smoke group-hover:text-accent-gold"
                >
                  ↗
                </span>
              </Link>
            </li>
          ) : null}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3 pb-20">
          {canGoBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
            >
              ← Go back
            </button>
          ) : null}
          <Link
            href="/"
            className={
              canGoBack
                ? "inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
                : "inline-flex h-12 items-center bg-accent-gold px-6 t-eyebrow text-surface-tuxedo hover:bg-surface-ivory"
            }
          >
            Back to home ↗
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
          >
            Talk to us ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
