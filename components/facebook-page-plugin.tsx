"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { facebookFeed } from "@/lib/feeds";
import { site } from "@/content/site";

// Lazy-loaded Facebook page plugin iframe. The iframe is not rendered into
// the DOM until the wrapper scrolls into view. When the cached feed is in
// an "error" state with no posts, hide entirely so we don't surface a broken
// embed (probably an auth issue worth fixing before showing it).
export function FacebookPagePlugin() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [tracked, setTracked] = useState(false);

  const isHidden =
    facebookFeed.status === "error" && facebookFeed.posts.length === 0;

  useEffect(() => {
    if (isHidden || inView) return;
    const node = wrapperRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isHidden, inView]);

  if (isHidden) return null;

  const params = new URLSearchParams({
    href: site.social.facebook,
    tabs: "timeline",
    width: "500",
    height: "280",
    small_header: "true",
    hide_cover: "true",
    show_facepile: "false",
    adapt_container_width: "true",
  });
  const src = `https://www.facebook.com/plugins/page.php?${params.toString()}`;

  return (
    <section
      aria-label="Stoned Goose on Facebook"
      className="border-b border-bone/10 bg-ink py-16 md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="heading-display text-[clamp(2rem,5vw,3.5rem)] text-bone">
            From <span className="italic text-hazard">Facebook</span>
          </h2>
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track("Feed Click", {
                platform: "facebook",
                placement: "shows-fb-plugin",
              })
            }
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
          >
            Open page ↗
          </a>
        </div>

        <div
          ref={wrapperRef}
          className="relative mx-auto w-full max-w-[500px] overflow-hidden border border-bone/15 bg-haze-500"
          style={{ minHeight: 280 }}
          onMouseEnter={() => {
            if (tracked) return;
            track("Feed Click", {
              platform: "facebook",
              placement: "shows-fb-plugin",
            });
            setTracked(true);
          }}
        >
          {inView ? (
            <iframe
              src={src}
              title="Stoned Goose Productions on Facebook"
              width="500"
              height="280"
              style={{ border: 0, overflow: "hidden" }}
              scrolling="no"
              allow="encrypted-media"
              loading="lazy"
              className="block w-full"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.4)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50"
            />
          )}
        </div>
      </div>
    </section>
  );
}
