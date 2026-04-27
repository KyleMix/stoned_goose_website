"use client";

import Image from "next/image";
import { track } from "@/lib/analytics";
import type { FacebookPost } from "@/content/social";

type Props = {
  posts: FacebookPost[];
};

function trim(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

// Click-to-load row of Facebook page posts. Posters + truncated message,
// click opens the post permalink. No FB JS shipped.
export function FacebookRow({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <li key={post.id}>
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("Outbound Click", { destination: "facebook" })}
            className="group block"
          >
            {post.fullPicture ? (
              <div className="relative aspect-video w-full overflow-hidden bg-haze-500">
                <Image
                  src={post.fullPicture}
                  alt={trim(post.message, 120)}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter] duration-500 group-hover:[filter:grayscale(0)]"
                  unoptimized
                />
                <span
                  aria-hidden
                  className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.5)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-haze-500" />
            )}
            <p className="mt-3 font-body text-sm text-bone/85 group-hover:text-hazard">
              {trim(post.message, 160)}
            </p>
            <p className="mt-1 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/45">
              Facebook
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}
