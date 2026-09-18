import Link from "next/link";
import { members } from "@/content/members";
import { comedians } from "@/content/comedians";
import { peopleCopy } from "@/content/home";
import { CrewGrid } from "@/components/crew-grid";
import { ComicsGrid } from "@/components/comics-grid";
import { Surface } from "@/components/brand/surface";

// Who we work with, as one band: the five of us, then twelve of the comics we
// have booked, then a link to the rest.
//
// Both grids read the same CMS collections the /about page reads. Nothing is
// duplicated into the home page's own content file, so a new crew member or
// comic appears in both places from one edit.
const COMICS_PREVIEW = 12;

export function PeopleStrip() {
  if (members.length === 0 && comedians.length === 0) return null;

  return (
    <Surface
      tone="ivory"
      as="section"
      aria-labelledby="home-people"
      className="section-y border-b border-smoke"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow">{peopleCopy.eyebrow}</p>
            <h2 id="home-people" className="t-headline mt-4 display-1 text-balance">
              {peopleCopy.heading}
            </h2>
          </div>
          <Link
            href="/about"
            className="inline-flex h-12 items-center border border-smoke px-6 t-ui transition-colors hover:border-accent-gold hover:text-accent-gold"
          >
            See everyone <span aria-hidden className="ml-2">&#8599;</span>
          </Link>
        </div>

        {members.length > 0 ? (
          <div className="mt-12">
            <h3 className="t-eyebrow">The crew</h3>
            <div className="mt-6">
              <CrewGrid members={members} compact />
            </div>
          </div>
        ) : null}

        {comedians.length > 0 ? (
          <div className="mt-14">
            <h3 className="t-eyebrow">Comics we have booked</h3>
            <div className="mt-6">
              <ComicsGrid comedians={comedians} limit={COMICS_PREVIEW} />
            </div>
          </div>
        ) : null}
      </div>
    </Surface>
  );
}
