"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import { primaryNav as nav } from "@/lib/navigation";
import { upcomingShows } from "@/content/shows";
import { track } from "@/lib/analytics";
import { CartButton } from "@/components/cart/cart-button";
import { formatShowMonthDay } from "@/lib/dates";


/** The marquee line: next show, date and venue. Null when nothing is booked. */
function nextShowMarquee() {
  const next = upcomingShows[0];
  if (!next) return null;
  const date = formatShowMonthDay(next.start);
  const venue = next.venue?.name ?? next.venue?.city ?? null;
  const parts = [date, venue].filter(Boolean);
  if (!parts.length) return null;
  return { line: parts.join(" / "), href: next.ticketUrl ?? "/shows" };
}

export function Nav() {
  const pathname = usePathname();
  const marquee = nextShowMarquee();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // inert removes the hidden panel's links from the tab order and the
  // accessibility tree while keeping the clip-path close animation. Set as
  // a DOM property because React 18 has no boolean inert attribute.
  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open;
  }, [open]);

  // Keyboard support for the full-screen mobile panel: Escape closes and
  // returns focus to the toggle; opening moves focus to the first link.
  useEffect(() => {
    if (!open) return;
    const firstLink = panelRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 bg-surface-tuxedo">
      {/* The marquee board. The brand system is called Marquee, so the header
          opens the way a theatre marquee does: what is on, and when. It
          collapses on scroll to give the page back its height, which is the
          one thing the scroll state is for now. Hidden entirely when the
          calendar is empty rather than showing a placeholder. */}
      {marquee ? (
        <div
          aria-hidden={scrolled}
          className={cn(
            "overflow-hidden border-b border-accent-gold transition-[height,opacity] duration-300",
            scrolled || open ? "h-0 opacity-0" : "h-9 opacity-100",
          )}
        >
          <Link
            href={marquee.href}
            tabIndex={scrolled ? -1 : undefined}
            onClick={() => track("CTA Click", { cta: "nav-marquee" })}
            className="mx-auto flex h-9 max-w-[1400px] items-center gap-3 px-5 md:px-10"
          >
            <span className="t-eyebrow shrink-0">Now playing</span>
            <span className="t-eyebrow truncate text-surface-ivory">
              {marquee.line}
            </span>
            {/* The whole strip is the link, so this is a desktop affordance
                only. On a narrow screen it would wrap inside a 36px bar. */}
            <span aria-hidden className="ml-auto hidden shrink-0 t-eyebrow text-smoke sm:inline">
              Tickets ↗
            </span>
          </Link>
        </div>
      ) : null}

      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between border-b border-smoke px-5 md:h-20 md:px-10">
        <Link
          href="/"
          aria-label={`${site.shortName} home`}
          className="group inline-flex items-center gap-2"
        >
          {/* No mark here on purpose. The lockup's minimum is 281px wide and
              254px tall, which cannot sit in a 64px bar, and shrinking it past
              the minimum is the rule this system exists to prevent. A header
              this size carries the wordmark as type. The lockup runs at full
              size in the footer. */}
          <span className="t-subhead text-xl leading-none md:text-[1.4rem]">
            Stoned Goose
            {/* Punctuation, not an accent. The retired system coloured this
                period gold; Marquee has no such device, and at subhead size
                gold is neither a headline nor an eyebrow. */}
            <span
              aria-hidden
              className="transition-[text-decoration-color] group-hover:underline group-hover:decoration-accent-gold group-hover:decoration-2 group-hover:underline-offset-2 group-focus-visible:underline group-focus-visible:decoration-accent-gold group-focus-visible:decoration-2 group-focus-visible:underline-offset-2"
            >
              .
            </span>
          </span>
        </Link>

        {/* Numbered like the section indexes used elsewhere on the site, so
            the header reads as a contents list rather than a row of links.
            The number is what carries the active state: it goes gold while
            its label goes ivory, which is the same rest/respond swap the
            rest of the system uses. */}
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-7">
          {nav.map((item, i) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group inline-flex items-baseline gap-1.5"
              >
                <span
                  aria-hidden
                  className={cn(
                    "t-eyebrow transition-colors",
                    active ? "text-accent-gold" : "text-smoke",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "t-eyebrow transition-colors group-hover:text-accent-gold",
                    active ? "text-surface-ivory" : "text-smoke",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Link
            href="/shows"
            onClick={() => track("CTA Click", { cta: "nav-tickets" })}
            className="t-eyebrow text-surface-ivory underline underline-offset-4 decoration-accent-gold decoration-2 transition-colors hover:text-accent-gold"
          >
            Tickets<span className="text-accent-gold">.</span> ↗
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
        <CartButton />
        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-[44px] items-center gap-2 border border-smoke px-3 py-2 t-eyebrow text-smoke transition-colors hover:border-accent-gold hover:text-accent-gold md:hidden"
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
      </div>
    </header>

      {/* Mobile menu panel. Kept OUTSIDE <header> on purpose: a fixed
          descendant of the header would be positioned against it rather than
          the viewport. As a sibling it stays fixed to the viewport. */}
      <div
        ref={panelRef}
        className={cn(
          "fixed inset-0 top-16 z-40 origin-top bg-surface-tuxedo transition-[clip-path,opacity] duration-500 md:hidden",
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
              <li key={item.href} className="border-b border-smoke">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-3.5"
                >
                  <span className="t-subhead text-2xl">
                    {item.label}
                  </span>
                  <span className="t-eyebrow text-smoke">
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
              const date = formatShowMonthDay(next.start);
              const venue = next.venue?.name ?? next.venue?.city ?? null;
              if (!date && !venue) return null;
              return (
                <p className="t-eyebrow text-smoke">
                  <span className="text-accent-gold">Next on stage. </span>
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
              className="flex h-12 w-full items-center justify-center bg-accent-gold t-eyebrow text-surface-tuxedo"
            >
              Tickets.
            </Link>
            <p className="t-eyebrow text-smoke">
              {site.contact.email}
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
