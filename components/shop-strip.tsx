import Link from "next/link";
import { products, shopCopy } from "@/content/shop";
import { ShopProductCard } from "@/components/shop-product-card";
import { Surface, type SurfaceTone } from "@/components/brand/surface";

// The merch band. It runs on the home page and is available as a CMS section
// block anywhere else.
//
// Only photographed products get in. A strip is a shop window: three initials
// in three empty squares sells nothing, and the full catalog, photos or not,
// is one click away on /shop.
export function ShopStrip({ limit = 3, tone = "tuxedo" }: { limit?: number } & SurfaceTone) {
  const visible = products.filter((p) => Boolean(p.image)).slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <Surface
      tone={tone}
      as="section"
      aria-labelledby="home-shop-strip"
      className="section-y border-b border-smoke"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow">Shop</p>
            <h2 id="home-shop-strip" className="t-headline mt-4 display-1">
              {shopCopy.heading}
              <span className="text-accent-gold">.</span>
            </h2>
            <p className="t-body mt-4 max-w-md text-base md:text-lg">
              {shopCopy.subhead}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-12 items-center border border-smoke px-6 t-ui hover:border-accent-gold hover:text-accent-gold"
          >
            Shop all merch
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-10">
          {visible.map((p) => (
            <ShopProductCard key={p.slug} product={p} />
          ))}
        </ul>
      </div>
    </Surface>
  );
}
