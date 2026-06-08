"use client";

import { useCart } from "@/components/cart/cart-context";

// Cart trigger for the header. Renders nothing until the storefront token is
// configured, so the nav stays clean when the on-site cart is disabled.
export function CartButton() {
  const { count, openCart, enabled } = useCart();
  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className="relative inline-flex items-center gap-2 border border-bone/15 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/65 transition-colors hover:border-slime hover:text-slime"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      <span>Cart</span>
      {count > 0 ? (
        <span className="min-w-4 rounded-full bg-hazard px-1 text-center font-body text-[10px] font-semibold leading-4 text-ink">
          {count}
        </span>
      ) : null}
    </button>
  );
}
