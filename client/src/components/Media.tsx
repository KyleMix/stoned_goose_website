import { motion } from "framer-motion";
import { PlayCircle, Youtube, Instagram } from "lucide-react";

type YouTubeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
};

const YOUTUBE_MAX_RESULTS = 6;

const youtubeVideos: YouTubeVideo[] = [];

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

        {/* Featured YouTube video */}
        {featured ? (
          <motion.a
            href={featured.url}
            target="_blank"
            rel="noopener noreferrer"
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
          {youtubeVideos.length > 0 ? (
            youtubeVideos.map((video, i) => (
              <motion.a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
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
          ) : (
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
              rel="noopener noreferrer"
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
