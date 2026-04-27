import type { Metadata } from "next";
import { products, shopCopy } from "@/content/shop";
import { PageHeader } from "@/components/page-header";
import { ShopProductCard } from "@/components/shop-product-card";
import { TrackedAnchor } from "@/components/tracked-anchor";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop Stoned Goose Productions merch. Hoodies, hats, stickers, and the metal goose. Checkout handled by Fourthwall.",
};

export default function ShopPage() {
  // Hide imageless products until owner pastes the Fourthwall image URLs.
  // Single-letter placeholder cards alongside photographed cards read inconsistent.
  const visibleProducts = products.filter((p) => p.image);

  return (
    <>
      <PageHeader
        eyebrow="Fourthwall Storefront"
        title={
          <>
            Fresh <span className="italic text-hazard">Merch</span>
          </>
        }
        body={shopCopy.subhead}
      />

      <section className="border-b border-bone/10 bg-ink py-12 md:py-16">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline justify-between gap-4 px-5 md:px-10">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
            {visibleProducts.length} products / external checkout via Fourthwall
          </p>
          <TrackedAnchor
            destination="fourthwall"
            href={shopCopy.collectionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
          >
            View OG Bigboy collection ↗
          </TrackedAnchor>
        </div>
      </section>

      <section className="bg-ink py-12 md:py-16">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((p, i) => {
              const borderClass = `group relative border-bone/15 ${
                i === 0 ? "border-t" : ""
              } border-b sm:border-r ${
                i % 2 === 1 ? "sm:border-r-0 lg:border-r" : ""
              } ${i % 3 === 2 ? "lg:border-r-0" : ""}`;
              return (
                <ShopProductCard
                  key={p.url}
                  product={p}
                  borderClass={borderClass}
                />
              );
            })}
          </ul>
          <div className="mt-10 flex justify-end">
            <TrackedAnchor
              destination="fourthwall"
              href={shopCopy.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/65 hover:text-hazard"
            >
              More merch on Fourthwall ↗
            </TrackedAnchor>
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 md:py-24">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <h2 className="heading-display text-[clamp(2.4rem,7vw,5rem)] text-bone">
            All <span className="italic text-hazard">products</span> live on
            Fourthwall.
          </h2>
          <p className="mt-6 max-w-2xl font-body text-base text-bone/85 md:text-lg">
            Checkout, sizing, and shipping are handled by Fourthwall. Use the
            store link if you want the full collection or supporter pricing.
          </p>
          <TrackedAnchor
            destination="fourthwall"
            href={shopCopy.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-12 items-center bg-hazard px-6 font-body text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-bone"
          >
            Open the store ↗
          </TrackedAnchor>
        </div>
      </section>
    </>
  );
}
