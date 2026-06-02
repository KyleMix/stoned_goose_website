"use client";

// Floating "Edit this page" dock. Owner-only affordance that connects what
// you're looking at on the live site to the matching admin surfaces in the
// Sveltia CMS at /admin. Hidden by default. Opt in once with ?edit=1 (or
// ?edit=0 to turn it off); the preference sticks in localStorage so deep
// links survive refreshes. The CMS enforces GitHub auth, so no harm if the
// overlay leaks to a stranger.

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type AdminTarget = {
  label: string;
  href: string;
  hint?: string;
};

// Map a site pathname to the CMS destinations that cover the content rendered
// there. Pages with multiple sources list each one in reading order so the
// first link is the most "obvious" thing to edit. Hrefs use the Sveltia /
// Decap hash-router scheme: a file entry is
// /admin/#/collections/<collection>/entries/<file>, a folder collection is
// /admin/#/collections/<collection>.
function targetsForPath(pathname: string): AdminTarget[] {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") {
    return [
      { label: "Home page", href: "/admin/#/collections/site_content/entries/home", hint: "Hero, marquee, bumpers, mission" },
      { label: "Site config", href: "/admin/#/collections/site_content/entries/site", hint: "Brand, contact, social, nav, footer" },
    ];
  }
  if (path === "/shows") {
    return [
      { label: "Shows copy", href: "/admin/#/collections/site_content/entries/shows_copy", hint: "Heading, featured special, presale" },
      { label: "Shows", href: "/admin/#/collections/shows", hint: "Manual show entries" },
    ];
  }
  if (path === "/watch") {
    return [
      { label: "Watch copy", href: "/admin/#/collections/site_content/entries/watch_copy", hint: "Heading + top YouTube videos" },
      { label: "TikTok videos", href: "/admin/#/collections/tiktok" },
    ];
  }
  if (path === "/roster") {
    return [
      { label: "Roster copy", href: "/admin/#/collections/site_content/entries/roster_copy", hint: "Comedians intro + About section + pillars" },
      { label: "Comedians", href: "/admin/#/collections/comedians" },
      { label: "Crew members", href: "/admin/#/collections/members" },
    ];
  }
  if (path === "/open-mics") {
    return [
      { label: "Open mics copy", href: "/admin/#/collections/site_content/entries/open_mics_copy" },
      { label: "Open mics", href: "/admin/#/collections/open_mics" },
    ];
  }
  if (path === "/shop") {
    return [
      { label: "Shop copy", href: "/admin/#/collections/site_content/entries/shop_copy" },
      { label: "Shop products", href: "/admin/#/collections/shop_products" },
    ];
  }
  if (path === "/contact") {
    return [
      { label: "Contact page", href: "/admin/#/collections/site_content/entries/contact_copy" },
      { label: "Site contact info", href: "/admin/#/collections/site_content/entries/site", hint: "Email, phone, address" },
    ];
  }
  if (path === "/book") {
    return [
      { label: "Services", href: "/admin/#/collections/services" },
      { label: "Pricing tiers", href: "/admin/#/collections/pricing_tiers" },
      { label: "Sponsorships", href: "/admin/#/collections/site_content/entries/sponsorships" },
    ];
  }
  if (path.startsWith("/book/")) {
    const slug = path.slice("/book/".length);
    return [
      {
        label: "This service",
        href: `/admin/#/collections/services/entries/${encodeURIComponent(slug)}`,
        hint: slug,
      },
      { label: "All services", href: "/admin/#/collections/services" },
    ];
  }

  return [
    { label: "Open editor", href: "/admin/", hint: "No direct match for this route" },
  ];
}

const STORAGE_KEY = "sg.editOverlay";

function EditOverlayInner() {
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const param = search?.get("edit");
    if (param === "1") {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setEnabled(true);
      return;
    }
    if (param === "0") {
      window.localStorage.removeItem(STORAGE_KEY);
      setEnabled(false);
      return;
    }
    setEnabled(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, [search]);

  if (!enabled) return null;
  if (pathname.startsWith("/admin")) return null;

  const targets = targetsForPath(pathname);

  return (
    <div className="fixed bottom-4 right-4 z-[80] font-mono text-xs">
      {open ? (
        <div className="w-72 rounded border border-ink/15 bg-bone text-ink shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-3 py-2">
            <span className="uppercase tracking-[0.18em]">
              Edit<span className="text-hazard">.</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Collapse edit overlay"
                className="text-ink/60 hover:text-ink"
              >
                <span aria-hidden="true">_</span>
              </button>
              <Link
                href={`${pathname}?edit=0`}
                aria-label="Turn off edit overlay"
                className="text-ink/60 hover:text-ink"
              >
                <span aria-hidden="true">x</span>
              </Link>
            </div>
          </div>
          <ul className="divide-y divide-ink/10">
            {targets.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-0.5 px-3 py-2 hover:bg-hazard/40 focus:bg-hazard/40 focus:outline-none"
                >
                  <span className="text-[0.7rem] uppercase tracking-[0.16em]">
                    {t.label}
                  </span>
                  {t.hint ? (
                    <span className="text-[0.65rem] normal-case text-ink/60">
                      {t.hint}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-ink/10 px-3 py-2 text-[0.6rem] uppercase tracking-[0.18em] text-ink/50">
            ?edit=0 to hide
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded border border-ink/20 bg-hazard px-3 py-2 uppercase tracking-[0.18em] text-ink shadow-md hover:bg-bone"
        >
          Edit<span className="text-ink">.</span>
        </button>
      )}
    </div>
  );
}

export function EditOverlay() {
  // useSearchParams must run inside a Suspense boundary so the static export
  // does not error during prerender.
  return (
    <Suspense fallback={null}>
      <EditOverlayInner />
    </Suspense>
  );
}
