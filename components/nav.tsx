"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { nav, site } from "@/content/site";
import { upcomingShows } from "@/content/shows";
import { track } from "@/lib/analytics";

function formatNextShowDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 12);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "bg-ink/85 backdrop-blur-md border-b border-bone/10"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link
          href="/"
          aria-label={`${site.shortName} home`}
          className="group inline-flex items-center gap-2"
        >
          <Image
            src="/brand/stoned-goose-mark-illustration.png"
            alt=""
            width={28}
            height={24}
            priority
            className={cn(
              "h-6 w-auto -translate-x-2 opacity-0 transition-all duration-300 ease-out",
              "group-hover:translate-x-0 group-hover:opacity-90",
              "group-focus-visible:translate-x-0 group-focus-visible:opacity-90",
              "motion-reduce:translate-x-0 motion-reduce:opacity-90 motion-reduce:transition-none",
            )}
          />
          <span className="font-display text-xl leading-none tracking-[-0.02em] text-bone md:text-[1.4rem]">
            Stoned Goose
            <span
              aria-hidden
              className="text-hazard transition-[text-decoration-color] group-hover:underline group-hover:decoration-slime group-hover:decoration-2 group-hover:underline-offset-2 group-focus-visible:underline group-focus-visible:decoration-hazard group-focus-visible:decoration-2 group-focus-visible:underline-offset-2"
            >
              .
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/70 transition-colors hover:text-slime"
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            aria-label="Search the site"
            onClick={() => {
              track("Search Open", { source: "nav" });
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true }),
              );
            }}
            className="inline-flex items-center gap-2 border border-bone/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/65 transition-colors hover:border-slime hover:text-slime"
          >
            <span aria-hidden>/</span>
            <span>Search</span>
            <span aria-hidden className="opacity-60">⌘K</span>
          </button>
          <Link
            href="/shows"
            onClick={() => track("CTA Click", { cta: "nav-tickets" })}
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone underline underline-offset-4 decoration-hazard decoration-2 transition-colors hover:text-slime"
          >
            Tickets<span className="text-hazard">.</span> ↗
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 border border-bone/25 px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-bone/85 transition-colors hover:border-slime hover:text-slime md:hidden"
        >
          <span aria-hidden className="flex h-3 w-5 flex-col justify-between">
            <span
              className={cn(
                "h-px w-full bg-current transition-all duration-300",
                open && "translate-y-[5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-px w-full bg-current transition-opacity duration-300",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-px w-full bg-current transition-all duration-300",
                open && "-translate-y-[5px] -rotate-45",
              )}
            />
          </span>
          <span>{open ? "Close" : "Menu"}</span>
        </button>
      </div>
    </header>

      {/* Mobile menu panel. Kept OUTSIDE <header> on purpose: the header gets
          backdrop-blur when open, and a backdrop-filter makes that element the
          containing block for fixed descendants, which would collapse this
          full-screen panel to the header's height. As a sibling it stays
          fixed to the viewport. */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 origin-top bg-ink transition-[clip-path,opacity] duration-500 md:hidden",
          open
            ? "[clip-path:inset(0_0_0_0)] opacity-100"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)] opacity-0",
        )}
      >
        <nav
          aria-label="Mobile primary"
          className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-6"
        >
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-bone/10">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-3.5"
                >
                  <span className="font-display text-2xl uppercase tracking-[-0.02em] text-bone">
                    {item.label}
                  </span>
                  <span className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-3">
            {(() => {
              const next = upcomingShows[0];
              if (!next) return null;
              const date = formatNextShowDate(next.start);
              const venue = next.venue?.name ?? next.venue?.city ?? null;
              if (!date && !venue) return null;
              return (
                <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
                  <span className="text-hazard">Next on stage. </span>
                  {[date, venue].filter(Boolean).join(". ")}
                </p>
              );
            })()}
            <Link
              href="/shows"
              onClick={() => {
                track("CTA Click", { cta: "nav-tickets-mobile" });
                setOpen(false);
              }}
              className="flex h-12 w-full items-center justify-center bg-hazard font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink"
            >
              Tickets.
            </Link>
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/40">
              {site.contact.email}
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
