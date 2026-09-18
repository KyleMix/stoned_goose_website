"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { site } from "@/content/site";
import { primaryNav as nav, secondaryNav } from "@/lib/navigation";
import { track } from "@/lib/analytics";
import { CartButton } from "@/components/cart/cart-button";
import { cartEnabled } from "@/lib/fourthwall-storefront";

// The header carries five links and one ask.
//
// Two things used to live up here and no longer do. The "now playing" ticker
// was the first of three places the same show appeared on the home page, and
// the 01-06 numbers in front of each label were a contents-list conceit that
// cost a beat of reading per link and carried no information.
//
// Nav labels run at the .t-ui role rather than .t-eyebrow. At 11px and .26em
// the links rendered but did not read, which is the practical version of the
// hidden-navigation problem: NN/g's finding is that navigation people cannot
// find is navigation people do not use, and on a wide screen a row of pale
// 11px capitals is close enough to hidden.

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  // The cart button renders only once the storefront token is set, and when it
  // does the header has to give its width back somewhere. Measured against the
  // same pages with the cart off, it costs the row 44px on a phone and 87px
  // from sm up, which is more than the spare space at either end:
  //
  //   768px  five links + wordmark + gold button leave 26px, the cart wants 87
  //   360px  wordmark + gold button + toggle leave 19px, the cart wants 44
  //
  // So the header runs in two configurations. Without a cart nothing changes:
  // the links open at md and the phone header keeps its gaps and its 16px
  // wordmark. With one, the links wait for lg and 768 takes the panel, which
  // carries the same five links at a size worth tapping, and the phone header
  // tightens its gaps, holds the 14px wordmark to 390 and, under 360, trims
  // its gutter and the button's padding and shortens the button to "Book".
  // Every one of those is a real fit problem at that width, measured, not a
  // precaution.
  //
  // The class strings are written out rather than built, because Tailwind
  // reads the source and never sees a runtime value.
  const cartInHeader = cartEnabled();
  const roomForLinks = !cartInHeader;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-surface-tuxedo">
        <div
          className={cn(
            "mx-auto flex h-16 max-w-[1400px] items-center border-b border-smoke sm:gap-3 md:h-20 md:gap-6 md:px-10",
            cartInHeader
              ? "gap-1 px-4 min-[360px]:gap-1.5 min-[360px]:px-5"
              : "gap-2 px-5",
          )}
        >
          <Link
            href="/"
            aria-label={`${site.shortName} home`}
            className="group inline-flex min-h-[44px] shrink-0 items-center"
          >
            {/* No mark here on purpose. The lockup's minimum is 281px wide and
                254px tall, which cannot sit in a 64px bar, and shrinking it past
                the minimum is the rule this system exists to prevent. A header
                this size carries the wordmark as type. The lockup runs at full
                size in the footer. */}
            <span
              className={cn(
                "t-subhead text-sm leading-none sm:text-lg lg:text-[1.4rem]",
                cartInHeader ? "min-[390px]:text-base" : "min-[360px]:text-base",
              )}
            >
              Stoned Goose
              <span
                aria-hidden
                className="transition-[text-decoration-color] group-hover:underline group-hover:decoration-accent-gold group-hover:decoration-2 group-hover:underline-offset-2 group-focus-visible:underline group-focus-visible:decoration-accent-gold group-focus-visible:decoration-2 group-focus-visible:underline-offset-2"
              >
                .
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className={cn(
              "ml-auto hidden items-center gap-5 lg:gap-9",
              roomForLinks ? "md:flex" : "lg:flex",
            )}
          >
            {nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "t-ui inline-flex min-h-[44px] items-center whitespace-nowrap transition-colors hover:text-accent-gold",
                    active && "text-accent-gold",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div
            className={cn(
              "ml-auto flex items-center",
              cartInHeader ? "gap-1 min-[360px]:gap-1.5" : "gap-2",
              roomForLinks ? "md:ml-0 md:gap-3" : "lg:ml-0 lg:gap-3",
            )}
          >
            <CartButton />

            {/* The one ask, at every width. It sits outside the mobile panel
                on purpose: a visitor who wants to hire us should never have to
                open a menu to find out how. */}
            <Link
              href="/book"
              onClick={() => track("CTA Click", { cta: "nav-book" })}
              className={cn(
                "inline-flex h-11 shrink-0 items-center whitespace-nowrap bg-accent-gold t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory sm:px-4 md:h-12 md:px-6",
                cartInHeader ? "px-2 min-[360px]:px-3" : "px-3",
              )}
            >
              {cartInHeader ? (
                <>
                  {/* Under 360px the full label is the last 35px standing
                      between this row and its own edge. The panel below still
                      says "Book us" in full. */}
                  <span className="min-[360px]:hidden">Book</span>
                  <span className="hidden min-[360px]:inline">Book us</span>
                </>
              ) : (
                "Book us"
              )}
            </Link>

            <button
              ref={toggleRef}
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 border border-smoke px-3 py-2 t-ui text-surface-ivory transition-colors hover:border-accent-gold hover:text-accent-gold",
                roomForLinks ? "md:hidden" : "lg:hidden",
              )}
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
              <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
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
          "fixed inset-0 top-16 z-40 origin-top bg-surface-tuxedo transition-[clip-path,opacity] duration-500 md:top-20",
          roomForLinks ? "md:hidden" : "lg:hidden",
          open
            ? "[clip-path:inset(0_0_0_0)] opacity-100"
            : "pointer-events-none [clip-path:inset(0_0_100%_0)] opacity-0",
        )}
      >
        <nav
          aria-label="Mobile primary"
          className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-4"
        >
          <ul className="flex flex-col">
            {[...nav, ...secondaryNav].map((item) => (
              <li key={item.href} className="border-b border-smoke">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-[56px] items-center py-3.5 t-subhead text-2xl transition-colors hover:text-accent-gold",
                    isActive(item.href) && "text-accent-gold",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-4">
            <Link
              href="/book"
              onClick={() => {
                track("CTA Click", { cta: "nav-book-mobile" });
                setOpen(false);
              }}
              className="flex h-12 w-full items-center justify-center bg-accent-gold t-ui text-surface-tuxedo"
            >
              Book us
            </Link>
            <a
              href={`mailto:${site.contact.email}`}
              className="t-body inline-flex min-h-[44px] items-center text-sm text-smoke underline underline-offset-4 hover:text-accent-gold"
            >
              {site.contact.email}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
