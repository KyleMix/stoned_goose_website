"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { nav, site } from "@/content/site";

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
          className="group flex items-center gap-3"
        >
          <span className="font-display text-xl tracking-display text-bone md:text-2xl">
            Stoned Goose
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-eyebrow text-bone/50 md:inline">
            Productions
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone/70 transition-colors hover:text-hazard"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/services"
            className="inline-flex h-10 items-center justify-center border border-bone/30 px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-bone transition-colors hover:border-hazard hover:bg-hazard hover:text-ink"
          >
            Book a Show
          </Link>
        </div>

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
        className={cn(
          "fixed inset-0 top-16 z-40 origin-top bg-ink transition-[clip-path,opacity] duration-500 md:hidden",
          open
            ? "[clip-path:inset(0_0_0_0)] opacity-100"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)] opacity-0",
        )}
      >
        <nav
          aria-label="Mobile primary"
          className="flex h-full flex-col justify-between px-6 pb-12 pt-10"
        >
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="border-b border-bone/10">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline justify-between py-5"
                >
                  <span className="font-display text-4xl uppercase tracking-display text-bone">
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-eyebrow text-bone/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="space-y-3 pt-8">
            <Link
              href="/services"
              onClick={() => setOpen(false)}
              className="flex h-12 w-full items-center justify-center bg-hazard font-mono text-xs uppercase tracking-[0.22em] text-ink"
            >
              Book a Show
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-bone/40">
              {site.contact.email}
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
