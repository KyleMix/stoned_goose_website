import Link from "next/link";
import { workingOnCopy } from "@/content/home";
import { upcomingShows } from "@/content/shows";
import { youtubeVideos } from "@/content/watch";
import { normalizeCuratedVideos } from "@/lib/videos";
import { ShowInfoBlock } from "@/components/brand/show-info-block";
import { TrackedAnchor } from "@/components/tracked-anchor";

// One compact row for the "what are you actually doing right now" question.
//
// This band replaces four: the shows list, the open mic teaser, the video grid
// and the social feed strip. Each was a full-height section, and together they
// pushed the only booking ask on the page below five screens of scrolling. The
// next show appears here and nowhere else on the page.
//
// Cards render only when they have real content behind them, so an empty
// calendar produces a two-card row rather than an empty-state apology.

function CardShell({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col bg-surface-tuxedo p-8 md:p-10">
      <p className="t-eyebrow">{eyebrow}</p>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </li>
  );
}

export function WorkingOn() {
  const next = upcomingShows[0] ?? null;
  const latestVideo = normalizeCuratedVideos(youtubeVideos)[0] ?? null;

  const cards: React.ReactNode[] = [];

  if (next) {
    cards.push(
      <CardShell key="show" eyebrow="Next show">
        <h3 className="t-subhead text-xl md:text-2xl">{next.name}</h3>
        <ShowInfoBlock
          show={next}
          layout="stack"
          className="mt-4"
          ticketAction={
            <TrackedAnchor
              destination="tickets"
              href={next.ticketUrl ?? "/shows"}
              {...(next.ticketUrl
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="mt-5 inline-flex h-11 items-center bg-accent-gold px-5 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory"
            >
              Get tickets <span aria-hidden className="ml-2">&#8599;</span>
            </TrackedAnchor>
          }
        />
      </CardShell>,
    );
  }

  if (latestVideo) {
    cards.push(
      <CardShell key="video" eyebrow="Latest on the channel">
        <h3 className="t-subhead text-xl md:text-2xl">{latestVideo.title}</h3>
        <div className="mt-auto pt-5">
          <Link
            href="/watch"
            className="inline-flex min-h-[44px] items-center t-ui text-smoke transition-colors hover:text-accent-gold"
          >
            Watch it <span aria-hidden className="ml-2">&#8599;</span>
          </Link>
        </div>
      </CardShell>,
    );
  }

  cards.push(
    <CardShell key="mics" eyebrow="Open Mic Explorer">
      <h3 className="t-subhead text-xl md:text-2xl">
        Every open mic in the Pacific Northwest, mapped.
      </h3>
      <p className="t-body mt-3 text-sm">
        New rooms, weekly signups, real addresses. Ours to build and keep
        current.
      </p>
      <div className="mt-auto pt-5">
        <Link
          href="/open-mics/map"
          className="inline-flex min-h-[44px] items-center t-ui text-smoke transition-colors hover:text-accent-gold"
        >
          Open the map <span aria-hidden className="ml-2">&#8599;</span>
        </Link>
      </div>
    </CardShell>,
  );

  return (
    <section
      aria-labelledby="home-working-on"
      className="section-y border-b border-smoke bg-surface-tuxedo"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow">{workingOnCopy.eyebrow}</p>
            <h2 id="home-working-on" className="t-headline mt-4 display-1">
              {workingOnCopy.heading}
            </h2>
          </div>
          <Link
            href="/shows"
            className="inline-flex min-h-[44px] items-center t-ui text-smoke transition-colors hover:text-accent-gold"
          >
            All shows <span aria-hidden className="ml-2">&#8599;</span>
          </Link>
        </div>

        <ul
          className={`mt-10 grid grid-cols-1 gap-px overflow-hidden border border-smoke ${
            cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
        >
          {cards}
        </ul>
      </div>
    </section>
  );
}
