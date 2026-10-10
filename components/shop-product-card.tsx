"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";
import { isSoldOut, type Product } from "@/content/shop";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  className?: string;
};

// One tile in the merch grid: photo, name, price. Browsing stays on the site,
// only checkout hands off to Fourthwall.
//
// The card renders on either surface, so nothing inside it may assume one.
// The name and price run on type roles, which flip on their own. The two
// pieces that sit on top of the photo are the exception: the tile under a
// photo is a tuxedo panel, and the ivory-text guards fire off the section
// above it, not off the panel. The sold-out chip is therefore an ivory fill
// with tuxedo ink, which reads the same either way, and the no-photo tile
// drops the panel entirely so its Smoke letter can flip with the section.
export function ShopProductCard({ product, className }: Props) {
  const soldOut = isSoldOut(product);
  // A Fourthwall image URL can die (the photo gets replaced, the proxy link
  // expires). Fall back to the letter tile instead of a broken image icon.
  // The page is static, so the error can fire before React hydrates and
  // onError never sees it: the ref catches an image that already failed.
  const [failed, setFailed] = useState(false);
  const checkFailed = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);
  const image = failed ? "" : product.image;

  return (
    <li className={cn("group", className)}>
      <Link
        href={`/shop/${product.slug}`}
        onClick={() => track("Shop Click", { product: product.name })}
        className="flex h-full flex-col"
      >
        <div
          className={cn(
            "relative aspect-square w-full overflow-hidden border border-smoke",
            image && "bg-surface-tuxedo",
          )}
        >
          {image ? (
            <Image
              ref={checkFailed}
              onError={() => setFailed(true)}
              src={image}
              alt={product.imageAlt || product.name}
              fill
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 32vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            // No photo synced yet, or it failed to load. A typographic tile keeps the product
            // shoppable instead of dropping it out of the grid.
            <span
              aria-hidden
              className="flex h-full w-full items-center justify-center t-subhead text-[4rem] text-smoke transition-colors duration-500 group-hover:text-accent-gold md:text-[5rem]"
            >
              {product.name.trim().charAt(0).toUpperCase()}
            </span>
          )}
          {soldOut ? (
            <span className="absolute left-0 top-0 bg-surface-ivory px-3 py-1 t-ui text-surface-tuxedo">
              Sold out
            </span>
          ) : null}
        </div>

        {/* Name over price on a phone, where a two-line name and a price on
            the same row leave the price stranded mid-card. */}
        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h3 className="t-subhead text-sm group-hover:text-accent-gold md:text-base">
            {product.name}
          </h3>
          {product.price ? (
            <span className="t-ui shrink-0 tabular-nums group-hover:text-accent-gold">
              {product.price}
            </span>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
