"use client";

import { useState } from "react";
import type { Product } from "@/content/shop";
import { useCart } from "@/components/cart/cart-context";
import { track } from "@/lib/analytics";

// Variant picker + add-to-cart for a product detail page. Falls back to an
// outbound Fourthwall link when the cart is disabled (no storefront token) or
// the product has no synced variants (manual / Open-API entries).
export function AddToCart({ product }: { product: Product }) {
  const { enabled, addItem, busy } = useCart();
  const variants = product.variants ?? [];

  const firstAvailable = variants.find((v) => v.available) ?? variants[0];
  const [selectedId, setSelectedId] = useState<string | undefined>(
    firstAvailable?.id,
  );

  if (!enabled || variants.length === 0) {
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("Outbound Click", { destination: "fourthwall" })}
        className="inline-flex h-12 items-center justify-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-slime"
      >
        Buy on Fourthwall ↗
      </a>
    );
  }

  const selected = variants.find((v) => v.id === selectedId);
  const showSizes = variants.length > 1;

  return (
    <div className="flex flex-col gap-4">
      {showSizes ? (
        <div>
          <p className="font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
            Size
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = v.id === selectedId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!v.available}
                  onClick={() => setSelectedId(v.id)}
                  className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                    active
                      ? "border-hazard bg-hazard text-ink"
                      : "border-bone/30 text-bone/85 hover:border-slime hover:text-slime"
                  } disabled:cursor-not-allowed disabled:border-bone/10 disabled:text-bone/30 disabled:no-underline disabled:line-through`}
                >
                  {v.size ?? v.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={busy || !selected || !selected.available}
        onClick={() => selected && addItem(selected.id)}
        className="inline-flex h-12 items-center justify-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-slime disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selected && !selected.available ? "Sold out" : busy ? "Adding…" : "Add to cart"}
      </button>
    </div>
  );
}
