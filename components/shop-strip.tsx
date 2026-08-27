import Link from "next/link";
import { products, shopCopy } from "@/content/shop";
import { ShopProductCard } from "@/components/shop-product-card";

export function ShopStrip({ limit = 3 }: { limit?: number }) {
  const visible = products.filter((p) => Boolean(p.image)).slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <section
      aria-labelledby="home-shop-strip"
      className="border-b border-smoke bg-surface-tuxedo py-20 md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow">
              Shop
            </p>
            <h2
              id="home-shop-strip"
              className="t-headline mt-4 display-1"
            >
              {shopCopy.heading}<span className="text-accent-gold">.</span>
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center border border-smoke px-6 t-eyebrow text-surface-ivory hover:border-accent-gold hover:text-accent-gold"
          >
            See the shop ↗
          </Link>
        </div>
        <ul className="group mt-12 grid grid-cols-1 gap-px overflow-hidden border border-smoke sm:grid-cols-2 lg:grid-cols-3">
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
