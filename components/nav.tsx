"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { nav, site } from "@/content/site";
import { track } from "@/lib/analytics";

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
            src="/brand/stoned-goose-mark-sm.webp"
            alt=""
            width={28}
            height={25}
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
              className="text-hazard transition-[text-decoration-color] group-hover:underline group-hover:decoration-hazard group-hover:decoration-2 group-hover:underline-offset-2 group-focus-visible:underline group-focus-visible:decoration-hazard group-focus-visible:decoration-2 group-focus-visible:underline-offset-2"
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
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/70 transition-colors hover:text-hazard"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/services"
            onClick={() => track("CTA Click", { cta: "nav-book-a-show" })}
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone underline underline-offset-4 decoration-hazard decoration-2 transition-colors hover:text-hazard"
          >
            Book a Show ↗
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center md:hidden"
        >
          <span
            className={cn(
              "absolute h-px w-6 bg-bone transition-transform duration-300",
              open ? "rotate-45" : "-translate-y-1.5",
            )}
          />
          <span
            className={cn(
              "absolute h-px w-6 bg-bone transition-transform duration-300",
              open ? "-rotate-45" : "translate-y-1.5",
            )}
          />
        </button>
      </div>

      <div
        // `inert` keeps Tab from landing on the hidden nav tree when the
        // overlay is collapsed. Cast through Record so the React 18 JSX
        // typings (which don't yet declare `inert`) don't reject the
        // attribute that browsers honor natively.
        {...({ inert: open ? undefined : "" } as Record<string, unknown>)}
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 top-16 z-40 origin-top bg-ink transition-[clip-path,opacity] duration-500 md:hidden",
          open
            ? "[clip-path:inset(0_0_0_0)] opacity-100"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)] opacity-0",
        )}
      >
        <nav
          aria-label="Mobile primary"
          className="flex h-full flex-col justify-between px-6 pb-12 pt-8"
        >
          <Image
            src="/brand/stoned-goose-mark-sm.webp"
            alt=""
            width={120}
            height={107}
            loading="lazy"
            className="mb-8 block h-24 w-auto opacity-90"
          />
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-bone/10">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-5"
                >
                  <span className="font-display text-4xl uppercase tracking-[-0.02em] text-bone">
                    {item.label}
                  </span>
                  <span className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="space-y-3 pt-8">
            <Link
              href="/services"
              onClick={() => {
                track("CTA Click", { cta: "nav-book-a-show-mobile" });
                setOpen(false);
              }}
              className="flex h-12 w-full items-center justify-center bg-hazard font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink"
            >
              Book a Show
            </Link>
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/40">
              {site.contact.email}
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
