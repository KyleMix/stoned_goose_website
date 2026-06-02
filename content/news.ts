// News shim. Reads the consolidated index produced at prebuild by
// scripts/build-content-index.ts (which knows how to parse the CMS's
// markdown files with YAML frontmatter). Drafts are filtered out and featured
// posts (when present) are pinned to the top of the list.

import newsIndex from "./.generated/news-index.json";

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  featured?: boolean;
};

type Raw = NewsPost & { draft?: boolean };

const raw = newsIndex as Raw[];

export const news: NewsPost[] = raw
  .filter((n) => n.draft !== true)
  .sort((a, b) => {
    if ((a.featured ? 1 : 0) !== (b.featured ? 1 : 0)) {
      return a.featured ? -1 : 1;
    }
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
