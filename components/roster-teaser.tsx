import Link from "next/link";
import { comedians } from "@/content/comedians";
import { ComicsGrid } from "@/components/comics-grid";
import { Surface } from "@/components/brand/surface";

// The CMS "Comedian portrait grid" section block. Any page can drop this in
// from /admin. It renders the same ComicsGrid the /about page and the home
// page use, so all three stay visually identical and fix once.
export function RosterTeaser({ limit = 8 }: { limit?: number }) {
  if (comedians.length === 0) return null;

  return (
    <Surface
      tone="ivory"
      as="section"
      aria-labelledby="roster-teaser"
      className="section-y border-b border-smoke"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow">The roster</p>
            <h2 id="roster-teaser" className="t-headline mt-4 display-1">
              Comics in the rotation<span className="text-accent-gold">.</span>
            </h2>
          </div>
          <Link
            href="/about"
            className="inline-flex h-12 items-center border border-smoke px-6 t-ui transition-colors hover:border-accent-gold hover:text-accent-gold"
          >
            Meet the roster <span aria-hidden className="ml-2">&#8599;</span>
          </Link>
        </div>
        <div className="mt-12">
          <ComicsGrid comedians={comedians} limit={limit} />
        </div>
      </div>
    </Surface>
  );
}
