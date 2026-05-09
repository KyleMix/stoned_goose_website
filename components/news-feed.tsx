import { NewsCard } from "@/components/news-card";
import { buildNewsFeed } from "@/lib/news-feed";

type Props = {
  /** Optional cap on items rendered. */
  limit?: number;
};

export function NewsFeed({ limit }: Props) {
  const items = buildNewsFeed();
  const visible = limit ? items.slice(0, limit) : items;

  if (visible.length === 0) {
    return (
      <p className="font-body text-sm text-bone/65">
        No posts yet. Check back after the next show.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          <NewsCard item={item} />
        </li>
      ))}
    </ul>
  );
}
