import type { Show } from "@/content/shows";
import { showAnchor, showPath } from "@/content/shows";
import { ShowInfoBlock } from "@/components/brand/show-info-block";
import { formatShowDateBand } from "@/lib/dates";
import { ShowPicture, showImageSize } from "./show-picture";
import { FlyerLightbox } from "./flyer-lightbox";
import { BioToggle } from "./bio-toggle";
import { Sunburst } from "./sunburst";
import { Credits, ShowActions, cardTitle, flyerAlt, headshotAlt } from "./show-card";

// A cutout shorter than this is a cropped snapshot rather than a standing
// portrait (Matt Ross's is 479x360) and looks lost at hero size, so the arch
// headshot stands in for it.
const MIN_CUTOUT_HEIGHT = 800;

/**
 * A headliner, larger: cutout headshot over the sunburst on the left, the
 * card's contents on the right. On /shows it is the next headliner and
 * carries their anchor, so /shows#slug still lands on them. On the show's own
 * page (/shows/<slug>) it is the whole page, with the name as the h1.
 */
export function HeadlinerHero({
  show,
  eyebrow = "Next headliner",
  headingLevel = "h2",
}: {
  show: Show;
  eyebrow?: string;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  const p = show.performer;
  if (!p) return null;
  const anchor = showAnchor(show);

  const cutout = p.images.cutout;
  const cutoutSize = cutout ? showImageSize(cutout) : null;
  const portrait =
    cutout && cutoutSize && cutoutSize.height >= MIN_CUTOUT_HEIGHT
      ? { src: cutout, sizes: "(min-width: 768px) 440px, 80vw", max: "max-w-[440px]" }
      : p.images.arch
        ? { src: p.images.arch, sizes: "(min-width: 768px) 360px, 80vw", max: "max-w-[360px] mb-10 md:mb-16" }
        : null;

  return (
    <section
      id={anchor}
      aria-labelledby={`${anchor}-name`}
      className="border-b border-smoke bg-surface-tuxedo"
    >
      <div className="mx-auto grid max-w-[1400px] gap-x-12 px-5 md:grid-cols-12 md:items-end md:px-10">
        {portrait ? (
          <div className="relative overflow-hidden pt-10 md:col-span-5 md:pt-16">
            <Sunburst className="absolute inset-0 h-full w-full" />
            <ShowPicture
              src={portrait.src}
              alt={headshotAlt(show)}
              sizes={portrait.sizes}
              priority
              className={`relative mx-auto w-full ${portrait.max}`}
            />
          </div>
        ) : null}

        <div className="py-10 md:col-span-7 md:py-16">
          <p className="t-eyebrow">{eyebrow}</p>
          <Heading id={`${anchor}-name`} className="t-subhead display-1 mt-3 text-balance">
            {cardTitle(show)}
          </Heading>
          <Credits show={show} className="mt-4 max-w-2xl" />

          <ShowInfoBlock
            show={show}
            layout="marquee"
            className="mt-8 max-w-xl"
            ticketAction={<ShowActions show={show} align="start" />}
          />

          {p.images.flyer ? (
            <div className="mt-3">
              <FlyerLightbox name={p.name} href={p.images.flyer}>
                <ShowPicture
                  src={p.images.flyer}
                  alt={flyerAlt(show)}
                  sizes="(min-width: 860px) 816px, 100vw"
                />
              </FlyerLightbox>
            </div>
          ) : null}

          {p.bio ? <BioToggle bio={p.bio} className="mt-4 max-w-xl border-t border-smoke pt-5" /> : null}
        </div>
      </div>
    </section>
  );
}

/**
 * The other headliners as a row of arch thumbnails, each jumping to its card.
 * The thumbnail is decorative: the link text already names the comic.
 */
export function HeadlinerStrip({
  shows,
  linkTo = "anchor",
  label = "Also headlining",
}: {
  shows: Show[];
  /** "anchor" jumps to the card on /shows; "page" goes to /shows/<slug>. */
  linkTo?: "anchor" | "page";
  label?: string;
}) {
  const items = shows.filter((s) => s.performer?.images.arch);
  if (items.length === 0) return null;
  return (
    <nav aria-label="More headliners" className="border-b border-smoke bg-surface-tuxedo">
      <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-10">
        <p className="t-eyebrow">{label}</p>
        <ul className="mt-5 flex snap-x gap-5 overflow-x-auto pb-2">
          {items.map((show) => (
            <li key={show.id} className="w-[120px] shrink-0 snap-start">
              <a
                href={linkTo === "page" ? showPath(show) : `#${showAnchor(show)}`}
                className="group block"
              >
                <ShowPicture src={show.performer!.images.arch!} alt="" sizes="120px" className="w-full" />
                <span className="t-ui mt-3 block text-balance group-hover:text-accent-gold">
                  {cardTitle(show)}
                </span>
                <span className="t-fine mt-1 block">{formatShowDateBand(show.start)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
