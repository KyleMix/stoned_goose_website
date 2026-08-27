import type { Metadata } from "next";
import { products, productsByCategory, shopCopy } from "@/content/shop";
import { PageHeader } from "@/components/page-header";
import { ShopProductCard } from "@/components/shop-product-card";
import { TrackedAnchor } from "@/components/tracked-anchor";
import { JsonLd } from "@/components/json-ld";
import { buildBreadcrumbs } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop Stoned Goose Productions merch. Hoodies, hats, stickers, and the metal goose. Checkout handled by Fourthwall.",
  alternates: {
    canonical: "/shop",
  },
};

export default function ShopPage() {
  // Photographed products lead each category; imageless ones render a
  // typographic card so every SKU stays shoppable while the owner pastes
  // Fourthwall image URLs in over time.
  const visibleProducts = [...products].sort(
    (a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0),
  );

  return (
    <>
      <JsonLd schema={buildBreadcrumbs("/shop")} />
      <PageHeader
        eyebrow="Fourthwall Storefront"
        title={
          <>
            Fresh <span className="italic text-accent-gold">Merch</span>
          </>
        }
        body={shopCopy.subhead}
      />

      <section className="border-b border-surface-ivory/10 bg-surface-tuxedo py-12 md:py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline justify-between gap-4 px-5 md:px-10">
          <p className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
            {visibleProducts.length} products / external checkout via Fourthwall
          </p>
          <TrackedAnchor
            destination="fourthwall"
            href={shopCopy.collectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
          >
            View OG Bigboy collection ↗
          </TrackedAnchor>
        </div>
      </section>

      {productsByCategory(visibleProducts).map(({ category, products: items }) => (
        <section key={category} className="bg-surface-tuxedo pb-12 pt-8 md:pb-16 md:pt-10">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="flex items-baseline justify-between gap-4 border-b border-surface-ivory/10 pb-4">
              <h2 className="font-display text-2xl text-surface-ivory md:text-3xl">
                {category}
                <span className="text-accent-gold">.</span>
              </h2>
              <span className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/55">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => {
                const borderClass = `group relative border-surface-ivory/15 ${
                  i === 0 ? "border-t" : ""
                } border-b sm:border-r ${
                  i % 2 === 1 ? "sm:border-r-0 lg:border-r" : ""
                } ${i % 3 === 2 ? "lg:border-r-0" : ""}`;
                return (
                  <ShopProductCard
                    key={p.slug}
                    product={p}
                    borderClass={borderClass}
                  />
                );
              })}
            </ul>
          </div>
        </section>
      ))}

      <section className="bg-surface-tuxedo pb-12">
        <div className="mx-auto flex max-w-[1400px] justify-end px-5 md:px-10">
          <TrackedAnchor
            destination="fourthwall"
            href={shopCopy.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] font-normal uppercase tracking-[0.18em] text-surface-ivory/65 hover:text-accent-gold"
          >
            More merch on Fourthwall ↗
          </TrackedAnchor>
        </div>
      </section>

      <section className="bg-surface-tuxedo py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-surface-ivory">
            All <span className="italic text-accent-gold">products</span> live on
            Fourthwall.
          </h2>
          <p className="mt-6 max-w-2xl font-body text-base text-surface-ivory/85 md:text-lg">
            Checkout, sizing, and shipping are handled by Fourthwall. Use the
            store link if you want the full collection or supporter pricing.
          </p>
          <TrackedAnchor
            destination="fourthwall"
            href={shopCopy.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center bg-accent-gold px-6 font-body text-xs font-bold uppercase tracking-[0.18em] text-surface-tuxedo hover:bg-surface-ivory"
          >
            Open the store ↗
          </TrackedAnchor>
        </div>
      </section>
    </>
  );
}
