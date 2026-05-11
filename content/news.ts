// News shim. Reads the consolidated index produced at prebuild by
// scripts/build-content-index.ts (which knows how to parse Keystatic's
// Markdoc files with YAML frontmatter).

import newsIndex from "./.generated/news-index.json";

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  image?: string;
  tags?: string[];
};

export const news: NewsPost[] = newsIndex as NewsPost[];
