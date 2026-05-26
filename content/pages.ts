// Pages shim. Reads the consolidated index produced at prebuild by
// scripts/build-content-index.ts. Drafts are filtered out. Reserved-slug
// collisions are asserted at module load so a misconfigured Keystatic entry
// fails the build instead of silently shadowing a real route.

import pagesIndex from "./.generated/pages-index.json";
import { normaliseBlocks, type Block } from "@/lib/blocks";
import { isReservedSlug } from "@/lib/reserved-slugs";

export type Page = {
  slug: string;
  title: string;
  seoDescription: string;
  ogImage: string;
  sections: Block[];
};

type Raw = {
  slug?: string;
  title?: string;
  seoDescription?: string;
  ogImage?: string;
  sections?: unknown;
  draft?: boolean;
};

const raw = pagesIndex as Raw[];

export const pages: Page[] = raw
  .filter((p) => p.draft !== true)
  .filter((p) => {
    const slug = (p.slug ?? "").trim();
    if (slug.length === 0) return false;
    if (isReservedSlug(slug)) {
      // Throwing during a static export is the right call: it surfaces the
      // mistake in CI rather than letting the misconfigured page silently
      // shadow a real route at runtime.
      throw new Error(
        `Page slug "${slug}" collides with a reserved route. Rename the page in Keystatic.`,
      );
    }
    return true;
  })
  .map((p) => ({
    slug: (p.slug ?? "").trim(),
    title: p.title ?? "",
    seoDescription: p.seoDescription ?? "",
    ogImage: p.ogImage ?? "",
    sections: normaliseBlocks(p.sections),
  }));
