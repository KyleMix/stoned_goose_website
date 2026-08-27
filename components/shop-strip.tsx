import Link from "next/link";
import { products, shopCopy } from "@/content/shop";
import { ShopProductCard } from "@/components/shop-product-card";

export function ShopStrip({ limit = 3 }: { limit?: number }) {
  const visible = products.filter((p) => Boolean(p.image)).slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <section
      aria-labelledby="home-shop-strip"
      className="border-b border-surface-ivory/10 bg-surface-tuxedo py-20 md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-accent-gold">
              Shop
            </p>
            <h2
              id="home-shop-strip"
              className="heading-display mt-4 text-[clamp(2.4rem,7vw,5rem)] text-surface-ivory"
            >
              {shopCopy.heading}<span className="text-accent-gold">.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center border border-surface-ivory/30 px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
          >
            See the shop ↗
          </Link>
        </div>
        <ul className="group mt-12 grid grid-cols-1 gap-px overflow-hidden border border-surface-ivory/15 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ShopProductCard
              key={p.url}
              product={p}
              borderClass="bg-surface-tuxedo"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
