// Curated news posts for /watch (the unified media + news surface). The page
// also pulls in social posts from Instagram + YouTube; entries here are the
// hand-written announcements that interleave with that auto-feed.
//
// House rules: no em dashes, no invented stats. Date is ISO so the feed sort
// can compare against social timestamps.

export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  image?: string;
  tags?: string[];
};

export const news: NewsPost[] = [];
