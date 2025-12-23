import { motion } from "framer-motion";
import { PlayCircle, Youtube, Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
};

// YouTube channel (still useful contextually)
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@stonedgooseproductions";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as
  | string
  | undefined;
const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as
  | string
  | undefined;
const YOUTUBE_CHANNEL_HANDLE =
  (import.meta.env.VITE_YOUTUBE_CHANNEL_HANDLE as string | undefined) ??
  "stonedgooseproductions";
const YOUTUBE_MAX_RESULTS = Number(import.meta.env.VITE_YOUTUBE_MAX_RESULTS ?? 6);

type YouTubeSearchResponse = {
  items?: {
    id?: { videoId?: string | null };
    snippet?: {
      title?: string | null;
      publishedAt?: string | null;
      thumbnails?: {
        high?: { url?: string | null } | null;
        medium?: { url?: string | null } | null;
        default?: { url?: string | null } | null;
      } | null;
    } | null;
  }[];
};

function mapSearchItemsToVideos(items: YouTubeSearchResponse["items"]): YouTubeVideo[] {
  if (!items?.length) return [];

  return items
    .map((item) => {
      const id = item.id?.videoId ?? undefined;
      const title = item.snippet?.title ?? "Untitled video";
      const thumbnail =
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "");

      if (!id) return null;

      return {
        id,
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        thumbnail,
        publishedAt: item.snippet?.publishedAt ?? undefined,
      } satisfies YouTubeVideo;
    })
    .filter(Boolean) as YouTubeVideo[];
}

function parseRssFeed(xml: string): YouTubeVideo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const entries = Array.from(doc.querySelectorAll("entry")).slice(0, YOUTUBE_MAX_RESULTS);

  return entries
    .map((entry) => {
      const id =
        entry.querySelector("yt\\:videoId")?.textContent ??
        entry.querySelector("videoId")?.textContent ??
        undefined;
      const title = entry.querySelector("title")?.textContent ?? "Untitled video";
      const publishedAt = entry.querySelector("published")?.textContent ?? undefined;
      const url =
        entry.querySelector("link")?.getAttribute("href") ??
        (id ? `https://www.youtube.com/watch?v=${id}` : YOUTUBE_CHANNEL_URL);

      if (!id) return null;

      return {
        id,
        title,
        url,
        publishedAt,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      } satisfies YouTubeVideo;
    })
    .filter(Boolean) as YouTubeVideo[];
}

function getYouTubeFeedUrl() {
  if (YOUTUBE_CHANNEL_ID) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}`;
  }

  const handle = YOUTUBE_CHANNEL_HANDLE?.replace(/^@/, "");
  if (!handle) return null;

  return `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(handle)}`;
}

async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  if (YOUTUBE_API_KEY && YOUTUBE_CHANNEL_ID) {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      channelId: YOUTUBE_CHANNEL_ID,
      part: "snippet",
      order: "date",
      maxResults: String(YOUTUBE_MAX_RESULTS),
      type: "video",
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);

    if (!response.ok) {
      const message = await response.text();
      throw new Error(
        `YouTube API request failed (${response.status}): ${message || "Unknown error fetching videos."}`,
      );
    }

    const data = (await response.json()) as YouTubeSearchResponse;
    const videos = mapSearchItemsToVideos(data.items);

    if (videos.length) return videos;
  }

  const feedUrl = getYouTubeFeedUrl();
  if (feedUrl) {
    const feedResponse = await fetch(feedUrl);

    if (!feedResponse.ok) {
      throw new Error("Unable to load YouTube videos right now.");
    }

    const xml = await feedResponse.text();
    const videos = parseRssFeed(xml);
    if (videos.length) return videos;
  }

  throw new Error("YouTube channel configuration is missing or returned no videos.");
}

// Instagram reel thumbnails
import reelThumb1 from "../assets/media/Halloween.png";
import reelThumb2 from "../assets/media/matt-loes.png";

// Instagram reels
const instagramReels = [
  {
    id: "DP3Uddejt-n",
    title: "Halloween Comedy Costume Contest",
    url: "https://www.instagram.com/reel/DP3Uddejt-n/",
    thumbnail: reelThumb1,
  },
  {
    id: "DMhDTw7up7Q",
    title: "Matt Loes - Krusty The Clown Impression",
    url: "https://www.instagram.com/reel/DMhDTw7up7Q/",
    thumbnail: reelThumb2,
  },
];

export default function Media() {
  const youtubeQuery = useQuery<YouTubeVideo[]>({
    queryKey: ["api", "youtube", "latest"],
    queryFn: fetchYouTubeVideos,
    staleTime: 5 * 60_000,
  });

  const youtubeVideos = youtubeQuery.data ?? [];
  const featured = youtubeVideos[0];
  const videoDelayCount = youtubeVideos.length || YOUTUBE_MAX_RESULTS;

  return (
    <section id="media" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
            Media <span className="text-primary">&</span> Clips
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Watch clips, reels, and full sets from Stoned Goose Productions.
          </p>
        </motion.div>

        {youtubeQuery.isError && (
          <p className="text-sm text-red-400 mb-6">
            Unable to load YouTube videos right now. {(youtubeQuery.error as Error).message}
          </p>
        )}

        {/* Featured YouTube video */}
        {youtubeQuery.isLoading ? (
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-12 border border-white/10 animate-pulse" />
        ) : featured ? (
          <motion.a
            href={featured.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-12 border border-white/10 group cursor-pointer block"
          >
            {/* Real YouTube thumbnail */}
            <img
              src={featured.thumbnail || `https://img.youtube.com/vi/${featured.id}/hqdefault.jpg`}
              alt={featured.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-white font-display uppercase text-xl tracking-widest">
                  {featured.title}
                </p>
                <p className="text-gray-300 text-sm">
                  Watch the full clip on YouTube.
                </p>
              </div>
              <div className="flex items-center gap-2 text-red-500">
                <Youtube className="w-6 h-6" />
                <span className="text-sm uppercase tracking-wide text-white/80">
                  @stonedgooseproductions
                </span>
              </div>
            </div>
          </motion.a>
        ) : (
          <div className="relative aspect-video bg-black/60 rounded-xl overflow-hidden mb-12 border border-white/10 flex items-center justify-center text-gray-400">
            No videos available yet. Check out our channel for the latest uploads.
          </div>
        )}

        {/* Grid: specific YouTube vids + specific Instagram reels */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* YouTube clips */}
          {youtubeQuery.isLoading
            ? Array.from({ length: YOUTUBE_MAX_RESULTS }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg border border-white/10 bg-muted animate-pulse"
                />
              ))
            : youtubeVideos.length > 0
              ? youtubeVideos.map((video, i) => (
                  <motion.a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="aspect-square rounded-lg border border-white/10 overflow-hidden group cursor-pointer bg-black/60"
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <PlayCircle className="absolute inset-0 m-auto w-10 h-10 text-white/90 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                      <span className="absolute bottom-3 left-3 text-xs uppercase tracking-wide text-white/80 z-10 line-clamp-2">
                        {video.title}
                      </span>
                    </div>
                  </motion.a>
                ))
              : (
                <div className="col-span-2 md:col-span-4 text-center text-gray-400 py-6 border border-dashed border-white/10 rounded-lg">
                  No videos to display right now. Check back soon!
                </div>
              )}

          {/* Instagram reels (2 tiles with thumbnails) */}
          {instagramReels.map((reel, i) => (
            <motion.a
              key={reel.id}
              href={reel.url}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: (i + videoDelayCount) * 0.1,
              }}
              className="aspect-square rounded-lg border border-white/10 overflow-hidden group cursor-pointer bg-black/60"
            >
              <div className="relative w-full h-full">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <Instagram className="absolute top-3 right-3 w-6 h-6 text-white group-hover:text-primary transition-colors duration-300" />
                <span className="absolute bottom-3 left-3 text-xs uppercase tracking-wide text-white/80 z-10 line-clamp-2">
                  {reel.title}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
