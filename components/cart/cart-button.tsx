"use client";

import { useCart } from "@/components/cart/cart-context";

// Cart trigger for the header. Renders nothing until the storefront token is
// configured, so the nav stays clean when the on-site cart is disabled.
//
// The word "Cart" drops below sm, the way the menu toggle drops "Menu": on a
// 360px phone the labelled button ran the header 61px past its own edge, and
// a bag icon next to a wordmark and a gold button does not need naming. The
// aria-label carries the name and the count either way.
//
// The count rides the button's own top corner while the button is just an
// icon, so a phone header is the same width empty or full and cannot start
// overflowing at item three. It sits inside the border rather than hung off
// it, which would cross the 4px gap onto the gold button next to it. Once the
// label is back it joins the row, where it is not sitting on the word.
export function CartButton() {
  const { count, openCart, enabled } = useCart();
  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 border border-smoke px-2.5 t-ui text-smoke transition-colors hover:border-accent-gold hover:text-accent-gold"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-accent-gold px-1 text-center text-[10px] font-bold leading-4 text-surface-tuxedo sm:static">
          {count}
        </span>
      ) : null}
    </button>
  );
}
