"use client";

import Image from "next/image";
import { track } from "@/lib/analytics";
import type { Product } from "@/content/shop";

type Props = {
  product: Product;
  borderClass: string;
};

// Shop card with Plausible "Shop Click" tracking on the outbound Fourthwall
// click-through. Visual style stays consistent with the static export.
export function ShopProductCard({ product, borderClass }: Props) {
  function handleClick() {
    track("Shop Click", { product: product.name });
    track("Outbound Click", { destination: "fourthwall" });
  }

  return (
    <li className={borderClass}>
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex h-full flex-col justify-between p-6 md:p-8"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-haze-500">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover [filter:grayscale(1)_contrast(1.05)] transition-[filter,transform] duration-500 group-hover:scale-[1.02] group-hover:[filter:grayscale(0)_contrast(1)]"
          />
          <span
            aria-hidden
            className="absolute inset-0 [background-image:radial-gradient(rgba(10,10,10,0.4)_1px,transparent_1.2px)] [background-size:3px_3px] mix-blend-multiply opacity-50 transition-opacity duration-500 group-hover:opacity-0"
          />
        </div>
        <div className="mt-6 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl text-bone group-hover:text-hazard md:text-2xl">
            {product.name}
          </h3>
          <span className="shrink-0 font-body text-sm font-semibold tabular-nums text-bone">
            {product.price}
          </span>
        </div>
        <p className="mt-2 font-body text-[10px] font-medium uppercase tracking-[0.18em] text-bone/55">
          Buy on Fourthwall ↗
        </p>
      </a>
    </li>
  );
}
