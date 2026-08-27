"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@/lib/analytics";
import type { Product } from "@/content/shop";

type Props = {
  product: Product;
  borderClass: string;
};

// Shop card linking to the on-site product page. Browsing stays on the site;
// only checkout hands off to Fourthwall.
export function ShopProductCard({ product, borderClass }: Props) {
  return (
    <li className={borderClass}>
      <Link
        href={`/shop/${product.slug}`}
        onClick={() => track("Shop Click", { product: product.name })}
        className="flex h-full flex-col justify-between p-6 md:p-8"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-surface-tuxedo">
          {product.image ? (
            <>
              <Image
                src={product.image}
                alt={product.imageAlt || product.name}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.35)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-25 transition-opacity duration-500 group-hover:opacity-0"
              />
            </>
          ) : (
            // No photo synced yet: a typographic card keeps the product
            // shoppable instead of hiding
            // it from the grid entirely.
            <span
              aria-hidden
              className="flex h-full w-full items-center justify-center border border-surface-ivory/10 font-display text-[5rem] text-surface-ivory/25 transition-colors duration-500 group-hover:text-accent-gold/60"
            >
              {product.name.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="mt-6 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl text-surface-ivory group-hover:text-accent-gold md:text-2xl">
            {product.name}
          </h3>
          <span className="shrink-0 font-body text-sm font-bold tabular-nums text-surface-ivory">
            {product.price}
          </span>
        </div>
        <p className="mt-2 font-body text-[10px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55 group-hover:text-accent-gold">
          View ↗
        </p>
      </Link>
    </li>
  );
}
