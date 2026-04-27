"use client";

import Image from "next/image";
import { track } from "@/lib/analytics";
import type { InstagramPost } from "@/content/social";

type Props = {
  posts: InstagramPost[];
};

// Click-to-load Instagram grid. Posters only on first paint, no third-party
// JS until the user clicks through. Each tile opens the IG permalink in a
// new tab. Plausible "Outbound Click" fires before navigation.
export function InstagramFeed({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <ul className="grid grid-cols-3 gap-2 md:gap-4">
      {posts.map((post) => (
        <li key={post.id} className="aspect-square">
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("Outbound Click", { destination: "instagram" })}
            aria-label={post.caption.slice(0, 80) || "Instagram post"}
            className="group relative block h-full w-full overflow-hidden bg-haze-500"
          >
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt={post.caption.slice(0, 120) || "Instagram post"}
                fill
                sizes="(min-width: 768px) 25vw, 33vw"
                className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)]"
                unoptimized
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-body text-[10px] uppercase tracking-[0.18em] text-bone/45">
                IG
              </span>
            )}
            <span
              aria-hidden
              className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
            />
            {post.mediaType === "VIDEO" ? (
              <span className="absolute right-2 top-2 inline-flex items-center bg-hazard px-2 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-ink">
                Reel
              </span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
